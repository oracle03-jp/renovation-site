'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavigationBar from '@/components/ui/navigationbar'
import { ArrowLeft } from 'lucide-react'
import type { Post } from '@/lib/types'
import PostCard from '@/components/post/PostCard'
import PostModal from '@/components/post/PostModal'
import type { User } from '@supabase/supabase-js'

export default function MyPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const supabase = createClient()

  //ユーザー取得
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
    }
    fetchUser()
  }, [supabase])

  //投稿取得
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id, title, image_url, image_urls, author_comment, created_at,
            user:profiles!user_id ( id, username, avatar_url )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        setPosts(data as any)
      } catch (err: any) {
        console.error('投稿取得エラー:', err.message)
        setError('投稿の取得中にエラーが発生しました。')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [user, supabase])

  const handleDeleted = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  const selected = posts.find((p) => p.id === selectedId) ?? null

  return (
    <>
      <NavigationBar user={user} />

      <main className="md:pl-20 pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              あなたの投稿一覧
            </h1>
            <a
              href="/dashboard"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </a>
          </div>

          {/* 状態ごとの表示 */}
          {loading && (
            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                読み込み中...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-lg text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-lg text-gray-500 dark:text-gray-400">
                まだ投稿がありません。
              </p>
            </div>
          )}

          {!loading && posts.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onOpen={() => setSelectedId(p.id)}
                    currentUserId={user?.id ?? null}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
              <PostModal
                post={selected}
                open={!!selected}
                onOpenChange={(o) => !o && setSelectedId(null)}
                currentUserId={user?.id ?? null}
                onDeleted={handleDeleted}
              />
            </>
          )}
        </div>
      </main>
    </>
  )
}
