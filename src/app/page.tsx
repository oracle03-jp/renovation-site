import PostGrid from '@/components/post/PostGrid'
import NavigationBar from '@/components/ui/navigationbar'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      {/* サイドバー */}
      <NavigationBar user={user} />

      {/* コンテンツをサイドバー幅分オフセット */}
      <div className="md:ml-20">

        {/* ヒーローセクション（下部ラインを削除） */}
        <section
          className="
            relative
            bg-gradient-to-br from-[#004AAD] via-blue-500 to-cyan-400
            text-white
            pt-32 pb-20
            md:pt-24 md:pb-12 
            px-6    /* pb-16→pb-12 に少し余白を詰めました */
          "
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
              空き家に、新しい物語を。
            </h2>
            <p className="text-base md:text-lg opacity-90 leading-relaxed">
              Akilier（アキリエ）は、全国の空き家を<br className="hidden md:inline" />
              リノベアイデアでつなぐSNSプラットフォーム。<br />
              写真とプランを投稿して、地域に新たな価値を生み出そう。
            </p>
          </div>

          {/*
            ────────────────────────────────
            ここまでで下部の波型 SVG を削除
            ────────────────────────────────
          */}
        </section>

        {/* 投稿一覧以降 */}
        <main className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">投稿一覧</h1>
            {!user && (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="
                    px-4 py-2 text-sm font-medium text-gray-700
                    bg-white border border-gray-200 rounded-lg shadow-sm
                    hover:bg-gray-50 transition
                  "
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="
                    px-4 py-2 text-sm font-medium text-white
                    bg-gradient-to-r from-[#004AAD] to-blue-600
                    rounded-lg shadow-md
                    hover:from-blue-700 hover:to-blue-500 transition
                  "
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
          <PostGrid />
        </main>
      </div>
    </>
  )
}