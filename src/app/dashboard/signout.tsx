'use client'
import { createClient } from "@/lib/supabase/client"

export default function SignOutButton() {
    const supabase = createClient()

    return (
        <button className="border p-2 rounded" onClick={async () => { await supabase.auth.signOut(); location.href='/'}}>
            ログアウト
        </button>
    )
}