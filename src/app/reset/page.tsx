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

    return (
        <main className="max-w-sm mx-auto p-6 space-y-3">
            <h1 className="text-xl font-bold">パスワード再設定</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className="w-full border p-2 rounded" type="password" placeholder="新しいパスワード" value={password} onChange={e=>setPassword(e.target.value)} required />
                <input className="w-full border p-2 rounded" type="password" placeholder="新しいパスワード（確認用）" value={passwordConf} onChange={e=>setPasswordConf(e.target.value)} required />
                <button className="w-full border p-2 rounded">変更する</button>
            </form>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </main>
    )
}