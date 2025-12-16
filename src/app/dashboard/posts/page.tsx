'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavigationBar from '@/components/ui/navigationbar'
import { ArrowLeft } from 'lucide-react'
import type { Post } from '@/lib/types'
import PostCard from '@/components/post/PostCard'
import PostModal from '@/components/post/PostModal'
import type { User } from '@supabase/supabase-js'

// Post型を拡張して、いいね情報を管理できるようにする
type PostWithLike = Post & {
  like_count: number
  is_liked: boolean
}

export default function MyPostsPage() {
  // 状態の型を PostWithLike[] に変更
  const [posts, setPosts] = useState<PostWithLike[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const supabase = createClient()

  // ユーザー取得
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        // 未ログイン時のリダイレクトなどが必要であれば記述
        // window.location.href = '/login'
        return
      }
      setUser(user)
    }
    fetchUser()
  }, [])

  // 投稿といいね情報の取得
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return
      setLoading(true)
      try {
        // 1. 投稿データと、いいねの総数(count)を取得
        // 注: likes(count) を使うには likes テーブルへの外部キー設定が必要です
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            user:profiles!user_id ( id, username, avatar_url ),
            likes:likes(count) 
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (postsError) throw postsError

        // 2. 自分が「いいね」した投稿のID一覧を取得
        const { data: myLikes, error: likesError } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
        
        if (likesError) throw likesError

        // 自分がいいねしているPostIDのSetを作成（検索を高速化）
        const myLikedPostIds = new Set(myLikes?.map((l: any) => l.post_id))

        // 3. データをマージして整形
        const formattedPosts: PostWithLike[] = (postsData as any[]).map((p) => ({
          ...p,
          // likes: [{ count: 3 }] のような形式で返ってくるため取り出す
          like_count: p.likes ? p.likes[0]?.count ?? 0 : 0,
          // 自分のIDがセットに含まれているか確認
          is_liked: myLikedPostIds.has(p.id),
        }))

        setPosts(formattedPosts)
      } catch (err: any) {
        console.error('投稿取得エラー:', err.message)
        setError('投稿の取得中にエラーが発生しました。')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [user]) // supabaseは依存配列から外してもOK、または含める

  const handleDeleted = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  // いいね切り替え処理（引数に postId を受け取るように変更）
  const handleToggleLike = useCallback(async (postId: string) => {
    if (!user) return

    // 1. UIを先に更新（楽観的更新）
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextIsLiked = !p.is_liked
          return {
            ...p,
            is_liked: nextIsLiked,
            like_count: nextIsLiked ? p.like_count + 1 : p.like_count - 1,
          }
        }
        return p
      })
    )

    // 現在の状態を取得（反転前の状態を知るため、stateではなく現在のロジック内で判定）
    // 直前の setPosts は非同期反映なので、ここでは prevPosts を探すか、
    // あるいは単純に DB 操作を行う。
    // ここでは、現在の is_liked が true なら delete, false なら insert を行うため
    // state の最新値を参照する必要がありますが、関数内ではクロージャの問題があるため
    // Supabase操作は「操作前の状態」を基準にするか、
    // あるいはUI更新と同時にAPIを叩く形にします。

    // より安全な実装: 現在の posts を探して判定
    const targetPost = posts.find(p => p.id === postId)
    if (!targetPost) return

    const isCurrentlyLiked = targetPost.is_liked

    try {
      if (isCurrentlyLiked) {
        // 既にいいね済み -> 解除 (DELETE)
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, post_id: postId })
        if (error) throw error
      } else {
        // いいねしていない -> 追加 (INSERT)
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId })
        if (error) throw error
      }
    } catch (err) {
      console.error('いいね更新エラー', err)
      // エラーが発生したらUIを元に戻す処理を入れるのがベストプラクティス
      // ここでは簡易的にアラートのみ
      alert('いいねの更新に失敗しました')
      // ロールバック（再取得またはstateを戻す）
      setPosts((prev) =>
        prev.map((p) => {
            if (p.id === postId) {
                return { 
                    ...p, 
                    is_liked: isCurrentlyLiked, // 元に戻す
                    like_count: isCurrentlyLiked ? p.like_count : p.like_count // 数も戻すべきですが簡易記述
                } 
            }
            return p
        })
      )
    }
  }, [user, posts, supabase]) // postsを依存配列に入れる

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
                    // ここで修正したデータを渡す
                    likeCount={p.like_count}
                    isLiked={p.is_liked}
                    onToggleLike={() => handleToggleLike(p.id)}
                  />
                ))}
              </div>
              <PostModal
                post={selected}
                open={!!selected}
                onOpenChange={(o) => !o && setSelectedId(null)}
                currentUserId={user?.id ?? null}
                onDeleted={handleDeleted}
                // ここで修正したデータを渡す（selectedが存在する場合）
                likeCount={selected?.like_count ?? 0}
                isLiked={selected?.is_liked ?? false}
                onToggleLike={() => selected && handleToggleLike(selected.id)}
              />
            </>
          )}
        </div>
      </main>
    </>
  )
}