'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PostCreateForm() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [authorComment, setAuthorComment] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('ログインしてください')
    if (!file) return alert('画像ファイルを選択してください')

    setLoading(true)

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${crypto?.randomUUID?.() ?? Date.now()}`
    const filePath = `${user.id}/${filename}.${ext}`

    const { error: uploadErr } = await supabase
      .storage.from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadErr) {
      setLoading(false)
      return alert(`アップロード失敗: ${uploadErr.message}`)
    }

    const { data: pub } = supabase.storage.from('images').getPublicUrl(filePath)
    const imageUrl = pub.publicUrl

    const { error: insertErr } = await supabase.from('posts').insert({
      user_id: user.id,
      title,
      image_url: imageUrl,
      author_comment: authorComment
    })

    setLoading(false)
    if (insertErr) return alert(insertErr.message)

    setTitle('')
    setFile(null)
    setAuthorComment('')
    alert('投稿しました！')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input
        className="w-full border p-2 rounded"
        placeholder="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full border p-2 rounded"
        required
      />
      <textarea
        className="w-full border p-2 rounded"
        placeholder="投稿者コメント（任意）"
        value={authorComment}
        onChange={(e) => setAuthorComment(e.target.value)}
      />
      <button className="w-full border p-2 rounded" disabled={loading}>
        {loading ? '投稿中…' : '投稿する'}
      </button>
    </form>
  )
}
