import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NavigationBar from "@/components/ui/navigationbar"
import ProfileForm from "./ProfileForm"
import { unstable_noStore as noStore } from "next/cache"

// 常に最新データを取得する設定
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProfilePage() {
  noStore()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationBar user={user} />
      <main className="max-w-3xl mx-auto p-10 pt-20 md:pl-20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          プロフィール編集
        </h1>
        
        {/* keyプロパティを削除し、純粋にpropsの変更だけで検知させてみる */}
        <ProfileForm 
          profile={profile || { id: user.id, username: "", bio: "", avatar_url: "" }} 
        />
      </main>
    </div>
  )
}