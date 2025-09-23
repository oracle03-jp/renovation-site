'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EnsureProfile() {
  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const username =
        (user.user_metadata?.username as string | undefined)
        ?? (user.email ? user.email.split('@')[0] : 'ユーザー')
      await supabase.from('profiles').upsert(
        { id: user.id, username, avatar_url: user.user_metadata?.avatar_url ?? null },
        { onConflict: 'id' }
      )
    })()
  }, [])
  return null
}
