// lib/supabase/server.ts (例)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component からの呼び出し時は無視する
          }
        },
      },
      // ▼▼▼ ここを追加してください ▼▼▼
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            cache: 'no-store', // キャッシュを絶対に利用しない設定
          })
        },
      },
      // ▲▲▲ ここまで ▲▲▲
    }
  )
}