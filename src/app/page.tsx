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
          {/* 空き家キャッチコピーを追加 */}
          <p className="max-w-3xl mx-auto text-left text-lg leading-relaxed font-medium text-white bg-[#004aad] p-8 rounded-2xl shadow-xl border border-blue-300/30">
          --Akilier（アキリエ） アプリ概要--<br></br>
          Akilier（アキリエ）は、全国的に拡大している空き家問題の認知と解決を目指すSNSアプリです。<br></br>
          空き家の写真まどを投稿し、その空き家の活用・リノベーションアイデアをシェアすることができます。<br></br>
          また、他のユーザーから多様な意見やリノベーション案、アドバイスを募ることも可能です。<br></br>
          Akilierは空き家に新しい価値を創造し、ユーザー同士の交流や問題意識の向上を促進します。<br></br>
          幅広いユーザーが参加できるプラットフォームです。
          </p>
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
