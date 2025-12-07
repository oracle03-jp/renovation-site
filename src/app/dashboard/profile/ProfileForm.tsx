"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { purgeProfileCache } from "./actions"

type Profile = {
  id: string
  username: string | null
  bio: string | null
  avatar_url: string | null
  updated_at?: string
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient()
  const router = useRouter()

  // 初期値はサーバーから受け取ったものをセット
  const [username, setUsername] = useState(profile.username || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // 【追加・修正】画面が開かれたら、念のためブラウザから直接最新データを問い合わせる
  // これにより、Next.jsのサーバーキャッシュが古くても、確実に最新データで上書きされます
  useEffect(() => {
    const fetchLatestProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profile.id)
        .single()

      if (!error && data) {
        setUsername(data.username || "")
        setBio(data.bio || "")
        setAvatarUrl(data.avatar_url)
      }
    }

    fetchLatestProfile()
  }, [profile.id, supabase]) // profile.idが変わった時やマウント時に実行

  // 画像アップロード
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // キャッシュ回避のためにクエリパラメータ(?v=...)を付与
      const { data: publicData } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath)
      
      const publicUrlWithCacheBuster = `${publicData.publicUrl}?v=${Date.now()}`
      setAvatarUrl(publicUrlWithCacheBuster)

    } catch (error) {
      console.error("UPLOAD ERROR:", error)
      alert("画像のアップロードに失敗しました")
    } finally {
      setIsUploading(false)
    }
  }

  // プロフィール更新
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 【追加手順】まずAuth（認証ユーザー情報）のメタデータを更新する
      // これにより、DBトリガーによる上書きを防ぎ、セッション情報も最新にします
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: username,
          avatar_url: avatarUrl
        }
      })

      if (authError) throw authError

      // 【既存手順】次にProfilesテーブルを更新する
      const updates = {
        username,
        bio,
        avatar_url: avatarUrl, // ここは保存時はクエリパラメータ(?v=...)なしが良いですが、そのままでも動作はします
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)

      if (error) throw error

      await purgeProfileCache()
      alert("プロフィールを更新しました")
      router.refresh()
      
    } catch (error) {
      console.error("UPDATE ERROR:", error)
      alert("プロフィールの更新に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 mt-10">
      {/* ユーザーアイコン */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <img
            src={avatarUrl || "/default-avatar.png"}
            className="w-full h-full rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 shadow-md bg-gray-100"
            alt=""
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        <label
          htmlFor="avatar"
          className={`mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white text-sm rounded-md transition ${
            isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          {isUploading ? "アップロード中..." : "画像を変更"}
        </label>
        <input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={isUploading || isLoading}
        />
      </div>

      {/* ユーザー名 */}
      <div>
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
          ユーザー名
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          className="mt-2 block w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      {/* 自己紹介 */}
      <div>
        <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
          自己紹介
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          disabled={isLoading}
          className="mt-2 block w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || isUploading}
        className="w-full py-3 px-6 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "保存中..." : "保存"}
      </button>
    </form>
  )
}