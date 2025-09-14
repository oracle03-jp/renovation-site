'use client'
import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const sp = useSearchParams()
    const registered = sp.get('registered') === '1'
    const supabase = createClient()

    const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null);
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)
        if (error) return setError(error.message)
        router.replace('/dashboard')
    }

    return (
  <div className="min-h-screen bg-[#f6eee1]">
    {/* ヘッダー */}
    <header className="bg-[#0a714e] text-white py-4 px-6">
      <h1 className="text-lg font-bold">
        空き家リノベーションサイト
      </h1>
    </header>

    {/* メインコンテンツ */}
    <main className="flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6 mt-6">
        <h1 className="text-2xl font-bold text-black text-center">
          ログイン
        </h1>

        {registered && (
          <p className="text-sm text-center text-[#0a714e]">
            メール認証後にログインできます。
          </p>
        )}

        <form onSubmit={onLogin} className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a714e]"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a714e]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7a4900] hover:bg-[#5c3600] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="flex flex-col space-y-2 text-center">
          <Link className="underline text-[#0a714e]" href="/register">
            新規登録
          </Link>
          <Link className="underline text-[#0a714e]" href="/reset/request">
            パスワードをお忘れの方
          </Link>
        </div>
      </div>
    </main>
  </div>
)

}