import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import NavigationBar from "@/components/ui/navigationbar"
import { ArrowLeft } from "lucide-react"

export default async function MyPostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("投稿の取得中にエラーが発生しました:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationBar user={user} />
      <main className="md:pl-20 pt-20">
        <div className="container mx-auto p-4 md:p-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              あなたの投稿一覧
            </h1>
            <a href="/dashboard" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              戻る
            </a>
          </div>

          {/* 投稿リスト */}
          {posts && posts.length > 0 ? (
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                  <a href={`/post/${post.id}`} className="block">
                    <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      {post.title || "タイトルなし"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mt-8">
              まだ投稿がありません。
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
