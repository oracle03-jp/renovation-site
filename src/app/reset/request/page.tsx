'use client'
import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"


export default function ResetRequestPage() {
    const [email, setEmail] = useState('')
    const [msg, setMsg] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setMsg(null);
        setError(null)
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/reset`,
        })
        if (error) setError(error.message)
            else setMsg("パスワード設定メールを送信しました。メールより再設定を行ってください。")
    }

    // return (
    //     <main className="max-w-sm mx-auto p-6 space-y-3">
    //         <h1 className="text-xl font-bold">パスワード再設定メール</h1>
    //         <form onSubmit={onSubmit} className="space-y-3">
    //             <input className="w-full border p-2 rounded" type="email" placeholder="登録メールアドレス" value={email} onChange={e=>setEmail(e.target.value)} required />
    //             <button className="w-full border p-2 rounded">メールを送信</button>
    //         </form>
    //         {msg && <p className="text-sm text-green-600">{msg}</p>}
    //         {error && <p className="text-sm text-red-600">{error}</p>}
    //     </main>
    // )
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
          パスワード再設定メール
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="登録メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded border border-[#0a714e] focus:outline-none focus:ring-2 focus:ring-[#0a714e]"
          />
          <button
            type="submit"
            className="w-full bg-[#7a4900] hover:bg-[#5c3600] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            メールを送信
          </button>
        </form>
        {msg && <p className="text-sm text-[#0a714e] text-center">{msg}</p>}
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    </main>
  </div>
)


}