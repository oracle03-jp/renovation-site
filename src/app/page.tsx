import PostGrid from '@/components/post/PostGrid'
import PostCreateForm from '@/components/post/PostCreateForm'
import NavigationBar from '@/components/ui/navigationbar'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  // サーバーサイドでSupabaseクライアントを作成
  const supabase = await createClient()
  // ユーザー情報を取得 (ログインしていない場合は user は null になる)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <NavigationBar user={user} />
      <main className="md:pl-20 pt-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold">投稿一覧</h1>
          <PostCreateForm />
          <PostGrid />
        </div>
      </main>
    </>
  )
}
