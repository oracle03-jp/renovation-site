import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SignOutButton from './signout'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <main className="max-w-lg mx-auto p-6 space-y-3">
            <h1 className="text-2xl font-bold">トップ</h1>
            <p>ログイン中: {user.email}</p>
            <SignOutButton />
        </main>
    )
}