'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CommentList from './comments/CommentList'
import CommentInput from './comments/CommentInput'
import type { Post } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { extractImagePath } from '@/lib/storage'
import { Trash2, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string | null
  onDeleted: (id: string) => void
}

// Post に image_urls?: string[] を追加した想定。
// 後方互換として image_url があればそれを配列化して使う。
function usePostImages(post: Post | null) {
  return useMemo(() => {
    if (!post) return [] as string[]
    const urls = Array.isArray((post as any).image_urls) ? (post as any).image_urls as string[] : []
    if (urls.length > 0) return urls
    return post.image_url ? [post.image_url] : []
  }, [post])
}

// シンプルなプリロード
function usePreloadNeighbors(images: string[], index: number) {
  useEffect(() => {
    if (images.length <= 1) return
    const next = new Image()
    next.src = images[(index + 1) % images.length]
    const prev = new Image()
    prev.src = images[(index - 1 + images.length) % images.length]
  }, [images, index])
}

export default function PostModal({ post, open, onOpenChange, currentUserId, onDeleted }: Props) {
  const supabase = createClient()
  const isOwner = !!post && !!currentUserId && post.user?.id === currentUserId

  const images = usePostImages(post)
  const [index, setIndex] = useState(0)

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0})

  // Postが変わったらインデックス初期化
  useEffect(() => setIndex(0), [post?.id])

  // index の安全化（画像枚数変更時）
  useEffect(() => {
    if (images.length === 0) setIndex(0)
    else if (index > images.length - 1) setIndex(0)
  }, [images, index])

  const goPrev = useCallback(() => {
    if (images.length === 0) return
    setIndex((i) => (i - 1 + images.length) % images.length)
  }, [images])

  const goNext = useCallback(() => {
    if (images.length === 0) return
    setIndex((i) => (i + 1) % images.length)
  }, [images])

  // キーボード矢印で前後移動
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, goPrev, goNext])

  // スワイプ対応（モバイル）
  const startX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    const threshold = 40
    if (dx > threshold) goPrev()
    if (dx < -threshold) goNext()
    startX.current = null
  }

  // 現在画像のロード状態
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  useEffect(() => {
    setImgLoaded(false)
    setImgError(false)
    setNatural(null)
  }, [images, index])

  // お隣先読み
  usePreloadNeighbors(images, index)

  useEffect(() => {
    if (!open) return
    const set = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
    set()
    window.addEventListener('resize', set)
    return () => window.removeEventListener('resize', set)
  }, [open])

  const fit = useMemo(() => {
    if (!natural || viewport.w === 0 || viewport.h === 0) return null
    const isMd = viewport.w >= 768
    const sidebarW = isMd ? 420 : 0

    const maxModalW = Math.min(viewport.w * 0.96, 1440)
    const maxModalH = Math.min(viewport.h * 0.92, 1000)

    const maxImageW = Math.max(320, maxModalW - sidebarW)
    const MOBILE_COMMENTS_RESERVED = 320
    const maxImageH = isMd ? maxModalH : Math.max(160,maxModalH - MOBILE_COMMENTS_RESERVED)

    const scale = Math.min(maxImageW / natural.w, maxImageH / natural.h)
    const imgW = Math.floor(natural.w * scale)
    const imgH = Math.floor(natural.h * scale)

    const modalW = imgW + sidebarW
    const modalH = isMd ? imgH : Math.min(maxModalH, maxModalH + MOBILE_COMMENTS_RESERVED)

    return { imgW, imgH, modalW, modalH }
  }, [natural, viewport])

  const handleDelete = async () => {
    if (!post || !isOwner) return
    if (!confirm('この投稿を削除しますか？\n（画像とコメントも削除されます）')) return

    // 画像ファイルの削除（存在すれば）
    const candidates = images.length > 0 ? images : (post.image_url ? [post.image_url] : [])
    for (const url of candidates) {
      const path = extractImagePath(url)
      if (path) {
        try { await supabase.storage.from('images').remove([path]) } catch {}
      }
    }
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (error) return alert(error.message)
    onOpenChange(false)
    onDeleted(post.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 shadow-none bg-transparent rounded-none sm:rounded-none max-w-none sm:max-w-none w-auto h-auto" style={fit ? { width: fit.modalW, height: fit.modalH} : undefined}>
        <DialogHeader className="sr-only">
          <DialogTitle>投稿詳細</DialogTitle>
        </DialogHeader>

        {post && (
          <div className="grid h-full max-h-full overflow-hidden grid-cols-1 md:grid-cols-[1fr_minmax(360px,420px)] grid-rows-[minmax(0,1fr)_minmax(280px,auto)] md:grid-rows-none">
            {/* 左：画像ギャラリー */}
            <div className="relative flex h-full min-w-0 flex-col bg-gray-100">
              {/* メインビュー */}
              <div
                className="relative flex-1 min-h-0 select-none overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                {images.length > 0 ? (
                  <>
                    {/* スケルトン（ロード中） */}
                    {!imgLoaded && !imgError && (
                      <div className="absolute inset-0 animate-pulse bg-gray-200" />
                    )}

                    {/* 画像 or エラー表示 */}
                    <div className='flex h-full w-full items-center justify-center'>
                    {!imgError ? (
                      <img
                        key={images[index]}
                        src={images[index]}
                        alt={`${post.title ?? 'image'} (${index + 1}/${images.length})`}
                        className={`block h-full w-full object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        draggable={false}
                        onLoad={(e) => {
                          const el = e.currentTarget
                          setNatural({ w : el.naturalWidth, h: el.naturalHeight})
                          setImgLoaded(true)
                        }}
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <div className="flex items-center gap-2 rounded bg-white/80 px-3 py-2">
                          <ImageOff className="size-5" />
                          <span>画像を読み込めませんでした</span>
                        </div>
                      </div>
                    )}
                    </div>
                    {/* 左右ナビ */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goPrev}
                          className="group absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 focus:outline-none"
                          aria-label="前の画像"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={goNext}
                          className="group absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 focus:outline-none"
                          aria-label="次の画像"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}

                    {/* インジケータ（ドット） */}
                    {images.length > 1 && (
                      <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                        {images.map((_, i) => (
                          <span
                            key={i}
                            className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-500">
                    画像がありません
                  </div>
                )}
              </div>

              {/* サムネイル行 */}
              {images.length > 1 && (
                <div className="grid grid-flow-col auto-cols-[minmax(64px,1fr)] gap-2 overflow-x-auto border-t bg-white p-2">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      onClick={() => setIndex(i)}
                      className={`relative h-16 overflow-hidden rounded border ${i === index ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
                      aria-label={`画像 ${i + 1}`}
                      title={`画像 ${i + 1}`}
                    >
                      {/* サムネは cover でOK */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 右：コメント */}
            <div className="flex h-full min-h-0 flex-col md:border-l bg-white">
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
