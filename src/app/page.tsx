import PostGrid from '@/components/post/PostGrid'
import NavigationBar from '@/components/ui/navigationbar'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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
          <div className="flex justify-between items-center mb-4 p-4">
          <h1 className="text-2xl font-bold p-4">投稿一覧</h1>

          {!user && (
              <div className="flex items-center gap-3">
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  ログイン
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  新規登録
                </Link>
              </div>
            )}
          </div>
          <PostGrid />
        </div>
      </main>
    </>
  )
}
