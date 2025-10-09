'use client'
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function PasswordResetpage() {
    const [password, setPassword] = useState('')
    const [passwordConf, setPasswordConf] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (password !== passwordConf) return setError("確認用パスワードが一致しません。")
        setError(null)
        const { error } = await supabase.auth.updateUser({ password })
        if (error) return setError(error.message)
        alert('パスワード変更が完了しました')
        router.replace('/login')
    }

    // return (
    //     <main className="max-w-sm mx-auto p-6 space-y-3">
    //         <h1 className="text-xl font-bold">パスワード再設定</h1>
    //         <form onSubmit={onSubmit} className="space-y-3">
    //             <input className="w-full border p-2 rounded" type="password" placeholder="新しいパスワード" value={password} onChange={e=>setPassword(e.target.value)} required />
    //             <input className="w-full border p-2 rounded" type="password" placeholder="新しいパスワード（確認用）" value={passwordConf} onChange={e=>setPasswordConf(e.target.value)} required />
    //             <button className="w-full border p-2 rounded">変更する</button>
    //         </form>
    //         {error && <p className="text-sm text-red-600">{error}</p>}
    //     </main>
    // )

return (
  <div className="min-h-screen bg-[#eeeded]">
    {/* ヘッダー */}
    <header className="bg-[#004aad] text-white py-4 px-6">
      <h1 className="text-lg font-bold">
        空き家リノベーションサイト
      </h1>
    </header>

    {/* メインコンテンツ */}
    <main className="flex items-start justify-center min-h-screen p-10 pt-30">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-16 space-y-12">
        <h1 className="text-4xl font-bold text-black text-center">
          パスワード再設定
        </h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="新しいパスワード"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded border border--gray-30 bg-[#eeeded] focus:outline-none focus:ring-2 focus:ring-[#004aad]"
          />
          <input
            type="password"
            placeholder="新しいパスワード（確認用）"
            value={passwordConf}
            onChange={e => setPasswordConf(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 bg-[#eeeded] focus:outline-none focus:ring-2 focus:ring-[#004aad]"
          />
          <button
            type="submit"
            className="w-full bg-[#004aad] hover:bg-[#004aad] text-white font-semibold py-3 rounded-lg transition-colors"
          >
            変更する
          </button>
        </form>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    </main>
  </div>
)

}