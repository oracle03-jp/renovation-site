'use client'
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConf, setPasswordConf] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (password !== passwordConf) return setError('確認用パスワードが一致しません')
        setError(null);
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username: username.trim() }
            }
        })
        setLoading(false)
        if (error) return setError(error.message)
        router.push('/login?registered=1')
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
          新規登録
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a714e]"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a714e]"
          />
          <input
            type="password"
            placeholder="パスワード(確認用)"
            value={passwordConf}
            onChange={e => setPasswordConf(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0a714e]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7a4900] hover:bg-[#5c3600] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? '登録中…' : 'サインアップ'}
          </button>
        </form>
        
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    </main>
  </div>
)

}