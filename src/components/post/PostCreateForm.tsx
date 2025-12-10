'use client'

import { useState, useEffect, type DragEvent, type FormEvent, KeyboardEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

const UploadIcon = () => (
  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg aria-hidden="true" className="inline w-5 h-5 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
  </svg>
)

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
)

type PreviewItem = { file: File; url: string }

export default function PostCreateForm() {
  const [title, setTitle] = useState('')
  const [files, setFiles] = useState<File[]>([])               // 配列にすることで複数化
  const [previews, setPreviews] = useState<PreviewItem[]>([])  // 複数プレビュー
  const [authorComment, setAuthorComment] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const MAX_FILES = 6
  const MAX_SIZE_MB = 10
  const ACCEPTED_TYPES = ['image/png', 'image/jpeg']

  useEffect(() => {
    previews.forEach(p => URL.revokeObjectURL(p.url))
    const next = files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    setPreviews(next)
    return () => next.forEach(p => URL.revokeObjectURL(p.url))
  }, [files])

  const addFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list)

    // 型・サイズフィルタ
    const filtered = incoming.filter(f => {
      const okType = ACCEPTED_TYPES.includes(f.type)
      const okSize = f.size <= MAX_SIZE_MB * 1024 * 1024
      return okType && okSize
    })

    if (filtered.length !== incoming.length) {
      alert(`PNG/JPG かつ ${MAX_SIZE_MB}MB 以下のファイルのみアップロード可能です。`)
    }

    // 既存と重複しないように（name+size+lastModifiedで一応判定）
    const merged = [...files]
    for (const f of filtered) {
      const dup = merged.some(
        m => m.name === f.name && m.size === f.size && m.lastModified === f.lastModified
      )
      if (!dup) merged.push(f)
    }

    if (merged.length > MAX_FILES) {
      alert(`一度に最大 ${MAX_FILES} 枚までです。`)
      merged.splice(MAX_FILES) // 超過分カット
    }
    setFiles(merged)
  }

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const removeAt = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
  }

  // ✅ 追加: 矢印ボタンで順序変更
  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return
  const newFiles = [...files]
  const [movedFile] = newFiles.splice(fromIndex, 1)
  newFiles.splice(toIndex, 0, movedFile)
  setFiles(newFiles)
  }
  
  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() 
      const trimmed = tagInput.trim().replace(/^#/, '') 
      
      if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed])
        setTagInput('')
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('ログインしてください')
    if (!title.trim()) return alert('タイトルを入力してください')
    if (files.length === 0) return alert('画像ファイルを選択してください')
    let submitTags = [...tags] // すでに確定したタグ（青いチップ）
    if (tagInput.trim()) {
      const pendingTag = tagInput.trim().replace(/^#/, '') // 入力中の文字
      if (!submitTags.includes(pendingTag)) {
        submitTags.push(pendingTag)
      }
    }
    setLoading(true)
    try {
      // まとめてアップロード
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
          const filename = crypto.randomUUID()
          const filePath = `${user.id}/${filename}.${ext}`

          const { error: uploadErr } = await supabase
          .storage
          .from('images')
          .upload(filePath, file, { upsert: false })

        if (uploadErr) throw uploadErr

          const { data: pub } = supabase.storage.from('images').getPublicUrl(filePath)
          
          // push ではなく return する
          return pub.publicUrl
        })
      )

      // posts テーブル：text[] の image_urls 列を想定
      const { error: insertErr } = await supabase.from('posts').insert({
        user_id: user.id,
        title,
        image_urls: uploadedUrls, // ← text[]（配列）を想定
        author_comment: authorComment,
        tags: submitTags,
      })

      if (insertErr) throw insertErr

      setTitle('')
      setFiles([])
      setAuthorComment('')
      setTags([])
      setTagInput('')
      alert('投稿しました！')
    } catch (err: any) {
      console.error(err)
      alert(`投稿失敗: ${err?.message ?? '不明なエラー'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            タイトル
          </label>
          <input
            id="title"
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition"
            placeholder="タイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            ハッシュタグ <span className="text-gray-500 text-xs">(Enterで追加)</span>
          </label>
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-gray-50 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 mr-1 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="inline-flex items-center p-0.5 ml-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                  aria-label="Remove"
                >
                  <XMarkIcon />
                </button>
              </span>
            ))}
            <input
              id="tags"
              type="text"
              className="flex-grow bg-transparent border-none focus:ring-0 text-gray-900 text-sm dark:text-white placeholder-gray-400 min-w-[120px]"
              placeholder={tags.length === 0 ? "例: リノベーション おしゃれ (Enter)" : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            物件の画像（複数可：PNG/JPG・最大{MAX_FILES}枚）
          </label>

          <label
            htmlFor="dropzone-file"
            className={`relative flex items-center justify-center w-full min-h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'bg-blue-100 dark:bg-gray-600' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previews.length > 0 ? (
              <div className="w-full p-3">
                {/* プレビュー：レスポンシブグリッド */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previews.map((p, i) => (
                    // ✅ 変更: ドラッグ可能なプレビューグリッド 
                    <div key={i} className="relative group aspect-square">                    
                      <img
                        src={p.url}
                        alt={`プレビュー ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      
                      {/* ✅ 追加: 順番表示バッジ */}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {i + 1}
                      </div>
                       {/* ✅ 追加: 矢印ボタン */}
                      <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); moveImage(i, i - 1) }}
                          disabled={i === 0}
                          className="px-2 py-1 rounded bg-black/60 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/80"
                          aria-label="左に移動"
                          title="左に移動"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); moveImage(i, i + 1) }}
                          disabled={i === files.length - 1}
                          className="px-2 py-1 rounded bg-black/60 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/80"
                          aria-label="右に移動"
                          title="右に移動"
                        >
                          →
                        </button>
                      </div>

                       {/* 既存 */}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); removeAt(i) }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded bg-black/60 text-white"
                        aria-label="この画像を削除"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
                {/* ✅ 追加: 並び替えのヒント */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  矢印ボタン（←→）で順番を変更できます
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <UploadIcon />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">クリックしてアップロード</span> または ドラッグ＆ドロップ
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG（最大 {MAX_FILES} 枚・各 {MAX_SIZE_MB}MB まで）</p>
              </div>
            )}
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept={ACCEPTED_TYPES.join(',')}
              multiple                                          // ← 複数選択
              onChange={onFileInput}
            />
          </label>
        </div>

        <div>
          <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            コメント <span className="text-gray-500 text-xs">(任意)</span>
          </label>
          <textarea
            id="comment"
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition"
            placeholder="こだわったポイントや感想などを自由にお書きください..."
            value={authorComment}
            onChange={(e) => setAuthorComment(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-all duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (<><SpinnerIcon />投稿中...</>) : ('投稿する')}
        </button>
      </form>
    </div>
  )
}
