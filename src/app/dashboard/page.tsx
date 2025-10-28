import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SignOutButton from './signout'
import NavigationBar from '@/components/ui/navigationbar'
import { UserCircle, Edit, BookOpen } from 'lucide-react'

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationBar user={user} />

      <main className="md:pl-20 pt-20">
        <div className="container mx-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                ようこそ、{user.user_metadata.username}さん
              </h1>
            </header>

            <div className="space-y-8">
              {/* プロフィールカード */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                  <UserCircle className="w-16 h-16 text-gray-400 flex-shrink-0" />
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {user.user_metadata.username}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <a href="/dashboard/profile" className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-md transition-colors">
                    <Edit className="w-4 h-4" />
                    プロフィールを編集
                  </a>
                  <SignOutButton />
                </div>
              </div>

              {/* クイックアクションカード */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  クイックアクション
                </h3>
                <div className="space-y-3">
                  <a href="/post/create" className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    <PlusIcon />
                    新しい投稿を作成
                  </a>
                  <a href="/dashboard/posts" className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    <BookOpen className="w-5 h-5" />
                    自分の投稿一覧
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
