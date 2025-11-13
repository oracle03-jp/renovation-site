'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post, Like } from '@/lib/types'
import PostCard from './PostCard'
import PostModal from './PostModal'

export default function PostGrid() {
  const [supabase] = useState(() => createClient())
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'createdAt' | 'likes'>('createdAt')

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const fetchInitial = async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          id, title, image_url, image_urls, author_comment, created_at,
          user:profiles!user_id ( id, username, avatar_url ),
          likes(*)
        `)
        .order('created_at', { ascending: false })
      if (mounted && data) setPosts(data as any)
    }
    fetchInitial()

    // リアルタイム投稿
    const postChannel = supabase
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
            const next = [{ ...row, user: profile ,likes:[]}, ...prev]
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

    const likesChannel = supabase
      .channel('realtime:likes')
      // いいね追加
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'likes' },
        (payload) => {
          const newLike = payload.new as Like
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === newLike.post_id
                // 該当の投稿のlikes配列に新しいいいねを追加
                ? { ...post, likes: [...post.likes, newLike] }
                : post
            )
          )
        }
      )
      // いいね削除
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'likes' },
        (payload) => {
          const oldLike = payload.old as Like
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === oldLike.post_id
                // 該当の投稿のlikes配列から削除されたいいねを除外
                ? { ...post, likes: post.likes.filter(like => like.user_id !== oldLike.user_id) }
                : post
            )
          )
        }
      )
      .subscribe()
    
      // ログイン中のユーザーID
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))

    return () => {
      mounted = false
      supabase.removeChannel(postChannel)
      supabase.removeChannel(likesChannel)
    }
  }, [supabase])

  const handleDeleted = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    setSelectedId(prev => (prev === id ? null : prev))
  }, [])

  const handleToggleLike = useCallback(async (postId: string, isLiked: boolean) => {
    if (!currentUserId) return // ログインしていない場合は何もしない

    if (isLiked) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes.filter(l => l.user_id !== currentUserId) }
            : post
        )
      )
      // DB操作
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId)

    } else {
      // --- まだいいねしていない → いいねを追加 (LIKE) ---
      const newLike: Like = {
        post_id: postId,
        user_id: currentUserId,
        created_at: new Date().toISOString(),
      }
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: [...post.likes, newLike] }
            : post
        )
      )
      // DB操作
      await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: currentUserId })
    }
  }, [currentUserId, supabase])

  const selected = posts.find(p => p.id === selectedId) ?? null
  const selectedLikeCount = selected ? selected.likes.length : 0
  const selectedIsLiked = selected ? selected.likes.some(l => l.user_id === currentUserId) : false
  const sortedPosts = useMemo(() => {
    const sortable = posts.slice();
    
    if (sortBy === 'createdAt') {
      // 新着順 (日付の降順)
      sortable.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'likes') {
      // いいね順 (likes.length の降順)
      sortable.sort((a, b) => b.likes.length - a.likes.length);
    }
    return sortable;
  }, [posts, sortBy]);

  return (
    <>
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => setSortBy('createdAt')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            sortBy === 'createdAt' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          新着順
        </button>
        <button
          onClick={() => setSortBy('likes')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            sortBy === 'likes' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
          }`}
        >
          いいね順
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedPosts.map(p => {
          const likeCount = p.likes.length
          const isLiked = p.likes.some(l => l.user_id === currentUserId)
          return(
          <PostCard
            key={p.id}
            post={p}
            onOpen={() => setSelectedId(p.id)}
            currentUserId={currentUserId}
            onDeleted={handleDeleted}
            likeCount={likeCount}
            isLiked={isLiked}
            onToggleLike={() => handleToggleLike(p.id, isLiked)}
          />
         )
        })}
      </div>

      <PostModal
        post={selected}
        open={!!selected}
        onOpenChange={o => !o && setSelectedId(null)}
        currentUserId={currentUserId}
        onDeleted={handleDeleted}
        likeCount={selectedLikeCount}
        isLiked={selectedIsLiked}
        onToggleLike={() => selected && handleToggleLike(selected.id, selectedIsLiked)}
      />
    </>
  )
}
