import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SignOutButton from './signout'
import NavigationBar from '@/components/ui/navigationbar'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // return (
    //     <main className="max-w-lg mx-auto p-6 space-y-3">
    //         <h1 className="text-2xl font-bold">トップ</h1>
    //         <p>ログイン中: {user.email}</p>
    //         <SignOutButton />
    //     </main>
    // )
return (
  <div className="min-h-screen bg-[#f6eee1]">
    {/* ヘッダー */}
    <NavigationBar user={user} />
    

    {/* メインコンテンツ */}
    <main className="md:pl-20 pt-20 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6 mt-6">
        <h1 className="text-2xl font-bold text-black text-center">
              {/* user.user_metadata.username で名前を表示 */}
              ようこそ、{user.user_metadata.username}さん
        </h1>
        <p className="text-2xl font-bold text-black text-center">
          ログイン中: {user.email}
        </p>
        <SignOutButton />
      </div>
    </main>
  </div>
)


    
}