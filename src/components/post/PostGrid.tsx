'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/lib/types'
import PostCard from './PostCard'
import PostModal from './PostModal'

export default function PostGrid() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          id, title, image_url, image_urls, author_comment, created_at,
          user:profiles!user_id ( id, username, avatar_url )
        `)
        .order('created_at', { ascending: false })
      if (mounted && data) setPosts(data as any)
    }
    fetchInitial()

    // リアルタイム投稿
    const channel = supabase
      .channel('realtime:posts')

      // 追加
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async (payload) => {
          const row: any = payload.new

          // profilesを取りに行く
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', row.user_id)
            .single()
          setPosts(prev => {
            const next = [{ ...row, user: profile }, ...prev]
            next.sort((a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            return next as any
          })
        })

      // 更新
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          const row: any = payload.new
          setPosts(prev => prev.map(p => (p.id === row.id ? { ...p, ...row } as any : p)))
        })

      // 削除
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        (payload) => {
          const row: any = payload.old
          setPosts(prev => prev.filter(p => p.id !== row.id))
          setSelectedId(prev => (prev === row.id ? null : prev))
        })
      .subscribe()

    // ログイン中のユーザーID
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    setSelectedId(prev => (prev === id ? null : prev))
  }, [])

  const selected = posts.find(p => p.id === selectedId) ?? null

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map(p => (
          <PostCard
            key={p.id}
            post={p}
            onOpen={() => setSelectedId(p.id)}
            currentUserId={currentUserId}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      <PostModal
        post={selected}
        open={!!selected}
        onOpenChange={o => !o && setSelectedId(null)}
        currentUserId={currentUserId}
        onDeleted={handleDeleted}
      />
    </>
  )
}
