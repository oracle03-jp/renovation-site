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
        <main className="max-w-sm mx-auto p-6 space-y-3">
            <h1 className="text-xl font-bold">ログイン</h1>
            {registered && <p className="text-sm">メール認証後にログインできます。</p>}
            <form onSubmit={onLogin} className="space-y-3">
                <input className="w-full border p-2 rounded" type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input className="w-full border p-2 rounded" type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button className="w-full border p-2 rounded" disabled={loading}>{loading?'ログイン中…':'ログイン'}</button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
            <p className="text-sm"><Link className="underLine" href="/register">新規登録</Link></p>
            <p className="text-sm"><Link className="underline" href="/reset/request">パスワードをお忘れの方</Link></p>
        </main>
    )
}