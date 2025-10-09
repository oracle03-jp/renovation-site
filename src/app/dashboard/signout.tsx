'use client'
import { createClient } from "@/lib/supabase/client"
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
    const supabase = createClient()

    return (
    <button 
        onClick={async () => { await supabase.auth.signOut(); location.href='/'}}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors"
    >
        <LogOut className="w-4 h-4" />
        ログアウト
    </button>
    )
}