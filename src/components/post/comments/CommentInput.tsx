'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

export default function CommentInput({ postId }: { postId: string }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    const supabase = createClient()
    if (!text.trim() || loading) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      alert('ログインしてください')
      return
    }

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      body: text.trim()
    })

    if (!error) setText('')
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      <Textarea
        value={text}
        onChange={(e: any) => setText(e.target.value)}
        placeholder="コメントを入力…"
        className="min-h-12"
      />
      <Button onClick={onSubmit} disabled={loading}>
        送信
      </Button>
    </div>
  )
}
