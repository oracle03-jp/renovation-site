'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CommentList from './comments/CommentList'
import CommentInput from './comments/CommentInput'
import type { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { extractImagePath } from '@/lib/storage'
import { Trash2 } from 'lucide-react'

type Props = {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string | null
  onDeleted: (id: string) => void
}

export default function PostModal({ post, open, onOpenChange, currentUserId, onDeleted }: Props) {
  const supabase = createClient()
  const isOwner = !!post && !!currentUserId && post.user?.id === currentUserId

  const handleDelete = async () => {
    if (!post || !isOwner) return
    if (!confirm('この投稿を削除しますか？\n（画像とコメントも削除されます）')) return

    const path = extractImagePath(post.image_url)
    if (path) {
      try { await supabase.storage.from('images').remove([path]) } catch {}
    }
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) return alert(error.message)
    onOpenChange(false)
    onDeleted(post.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl p-0 sm:rounded-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>投稿詳細</DialogTitle>
        </DialogHeader>

        {post && (
          <div className="grid h-[85vh] grid-cols-1 md:grid-cols-2">
            {/* 左：画像 */}
            <div className="flex h-full items-center justify-center bg-gray-100 overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* 右：コメント */}
            <div className="flex h-full min-h-0 flex-col border-l">
              <section className="flex items-start justify-between border-b p-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">
                    {post.user?.username ?? 'ユーザー'} のコメント
                  </div>
                  <p className="whitespace-pre-wrap text-gray-800">
                    {post.author_comment ?? '—'}
                  </p>
                </div>

                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="rounded p-2 text-red-600 hover:bg-red-50"
                    aria-label="投稿を削除"
                    title="削除"
                  >
                    <Trash2 className="size-5" />
                  </button>
                )}
              </section>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <CommentList postId={post.id} />
              </div>

              <div className="border-t p-3">
                <CommentInput postId={post.id} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
