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

    return (
        <main className="max-w-sm mx-auto p-6 space-y-3">
            <h1 className="text-xl font-bold">パスワード再設定メール</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="w-full border p-2 rounded" type="email" placeholder="登録メールアドレス" value={email} onChange={e=>setEmail(e.target.value)} required />
                <button className="w-full border p-2 rounded">メールを送信</button>
            </form>
            {msg && <p className="text-sm text-green-600">{msg}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
        </main>
    )
}