'use client'

import type { Post } from '@/lib/types'
import { MessageCircle, Trash2, Images } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { extractImagePath } from '@/lib/storage'
import { useState } from 'react'

type Props = { 
  post: Post
  onOpen: () => void 
  currentUserId: string | null 
  onDeleted: (id: string) => void 
}

export default function PostCard({ post, onOpen, currentUserId, onDeleted }: Props) {
  const supabase = createClient()
  const isOwner = !!currentUserId && post.user?.id === currentUserId

  // --- 画像まわり（配列対応 + フォールバック） ---
  const imageUrls = Array.isArray((post as any).image_urls)
    ? ((post as any).image_urls as string[])
    : []
  const imagesCount = imageUrls.length || (post.image_url ? 1 : 0)
  const cover = imageUrls[0] ?? post.image_url ?? '/placeholder.png'

  const [imgErr, setImgErr] = useState(false)

  const handleDelete = async () => {
    if (!isOwner) return
    if (!confirm('この投稿を削除しますか？\n（画像とコメントも削除されます）')) return

    // すべての画像を storage から削除（配列/単体どちらでも）
    const candidates = imageUrls.length > 0 ? imageUrls : (post.image_url ? [post.image_url] : [])
    for (const url of candidates) {
      const path = extractImagePath(url)
      if (path) {
        try { await supabase.storage.from('images').remove([path]) } catch {}
      }
    }

    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) return alert(error.message)
    onDeleted(post.id)
  }

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
      <header className="flex items-center gap-3 border-b p-3">
        <div className="size-9 overflow-hidden rounded-full bg-gray-200">
          {post.user?.avatar_url && (
            <img src={post.user.avatar_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1 font-medium truncate">
          {post.user?.username ?? 'ユーザー'}
        </div>
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
      </header>

      <button onClick={onOpen} className="block w-full cursor-pointer focus:outline-none">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {!imgErr ? (
            <img
              src={cover}
              alt={post.title ?? ''}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Images className="h-8 w-8" />
            </div>
          )}

          {/* 複数枚ならバッジ */}
          {imagesCount > 1 && (
            <span className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
              {imagesCount}枚
            </span>
          )}
        </div>
      </button>

      <footer className="flex items-center justify-between border-t p-3">
        <button
          className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
          onClick={onOpen}
        >
          <MessageCircle className="size-4" />
          コメントを見る
        </button>
        <div className="ml-2 truncate text-sm text-gray-700">{post.title}</div>
      </footer>
    </article>
  )
}
