'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Comment } from '@/lib/types'

export default function CommentList({ postId }: { postId: string }) {
  const [items, setItems] = useState<Comment[]>([])

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('comments')
        .select(`
          id, body, created_at,
          user:profiles!user_id ( id, username, avatar_url )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
      if (mounted && data) setItems(data as any)
    }
    fetchInitial()

    // リアルタイムコメント
    const channel = supabase
      .channel(`realtime:comments:${postId}`)

      // 追加
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        async (payload) => {
          const row: any = payload.new
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', row.user_id)
            .single()
          setItems(prev => [...prev, { ...row, user: profile } as any])
        })

      // 更新
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          const row: any = payload.new
          setItems(prev => prev.map(c => (c.id === row.id ? { ...c, ...row } as any : c)))
        })

      // 削除
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        (payload) => {
          const row: any = payload.old
          setItems(prev => prev.filter(c => c.id !== row.id))
        })
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [postId])

  if (!items.length) {
    return <div className="p-4 text-sm text-gray-500">最初のコメントを書きましょう！</div>
  }

  return (
    <ul className="space-y-3 p-4">
      {items.map((c) => (
        <li key={c.id} className="flex items-start gap-3">
          <div className="mt-1 size-9 shrink-0 overflow-hidden rounded-full bg-gray-200">
            {c.user?.avatar_url && <img src={c.user.avatar_url} alt="" />}
          </div>
          <div className="rounded-2xl bg-emerald-100 px-3 py-2">
            <div className="text-xs text-gray-600">{c.user?.username ?? 'ユーザー'}</div>
            <p className="whitespace-pre-wrap">{c.body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
