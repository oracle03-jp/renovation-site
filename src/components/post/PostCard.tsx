'use client'

import type { Post } from '@/lib/types'
import { MessageCircle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { extractImagePath } from '@/lib/storage'

type Props = { 
  post: Post
  onOpen: () => void 
  currentUserId: string | null 
  onDeleted: (id: string) => void 
}

export default function PostCard({ post, onOpen, currentUserId, onDeleted }: Props) {
  const supabase = createClient()
  const isOwner = !!currentUserId && post.user?.id === currentUserId

  const handleDelete = async () => {
    if (!isOwner) return
    if (!confirm('この投稿を削除しますか？\n（画像とコメントも削除されます）')) return

    const path = extractImagePath(post.image_url)
    if (path) {
      try { await supabase.storage.from('images').remove([path]) } catch {}
    }

    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) return alert(error.message)
    onDeleted(post.id)
  }

  return (
    <article className="rounded-2xl border bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b p-3">
        <div className="size-9 overflow-hidden rounded-full bg-gray-200">
          {post.user.avatar_url && (
            <img
              src={post.user.avatar_url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="font-medium">{post.user.username}</div>
      </header>

      <button
        onClick={onOpen}
        className="block w-full cursor-pointer focus:outline-none"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={post.image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      </button>

      <footer className="flex items-center justify-between border-t p-3">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
            onClick={onOpen}
          >
            <MessageCircle className="size-4" />
            コメントを見る
          </button>

          {isOwner && (
              <button
                onClick={handleDelete}
                className="rounded p-1 text-red-600 hover:bg-red-50"
                aria-label="投稿を削除"
                title="削除"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        <div className="truncate text-sm text-gray-700">{post.title}</div>
      </footer>
    </article>
  )
}
