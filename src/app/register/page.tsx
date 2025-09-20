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
        <main className='max-w-sm mx-auto p-6 space-y-3'>
            <h1 className="text-xl font-bold">新規登録</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input className='w-full border p-2 rounded' placeholder='ユーザー名' value={username} onChange={e=>setUsername(e.target.value)} required />
                <input className="w-full border p-2 rounded" type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)} required />
                <input className="w-full border p-2 rounded" type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)} required />
                <input className="w-full border p-2 rounded" type="password" placeholder="パスワード(確認用)" value={passwordConf} onChange={e=>setPasswordConf(e.target.value)} required />
                <button className="w-full border p-2 rounded" disabled={loading}>{loading?'登録中…':'サインアップ'}</button>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
        </main>
    )
}