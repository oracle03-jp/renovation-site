import PostCreateForm from '@/components/post/PostCreateForm'
import NavigationBar from '@/components/ui/navigationbar'
import { createClient } from '@/lib/supabase/server'

export default async function PostCreatePage() {
  // サーバーサイドでSupabaseクライアントを作成
  const supabase = await createClient()
  // ユーザー情報を取得 (ナビゲーションバーに渡すため)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <NavigationBar user={user} />
      <main className="md:pl-20 pt-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">新規投稿</h1>
          <PostCreateForm />
        </div>
      </main>
    </>
  )
}