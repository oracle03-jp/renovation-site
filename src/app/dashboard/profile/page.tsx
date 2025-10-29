import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NavigationBar from "@/components/ui/navigationbar" 

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/*  ② ナビゲーションバーを表示 */}
      <NavigationBar user={user} />

      {/* main に余白を追加してナビバーと重ならないようにする */}
      <main className="max-w-3xl mx-auto p-10 space-y-10 pt-20 md:pl-20">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          プロフィール編集
        </h1>

        <form className="space-y-10">
          {/* --- ユーザーアイコン --- */}
          <div className="flex flex-col items-center">
            <img
              src={user.user_metadata.avatar_url || "/default-avatar.png"}
              alt=""
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 dark:border-gray-600 shadow-md"
            />
            <label
              htmlFor="avatar"
              className="mt-4 cursor-pointer px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white text-sm rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              画像を変更
            </label>
            <input id="avatar" name="avatar" type="file" accept="image/*" className="hidden" />
          </div>

          {/* --- ユーザー名 --- */}
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
              ユーザー名
            </label>
            <input
              type="text"
              name="username"
              defaultValue={user.user_metadata.username}
              className="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* --- 自己紹介 --- */}
          <div>
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
              自己紹介
            </label>
            <textarea
              name="bio"
              rows={6}
              placeholder="自己紹介を入力してください"
              defaultValue={user.user_metadata.bio || ""}
              className="mt-2 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* --- 保存ボタン --- */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition"
          >
            保存
          </button>
        </form>
      </main>
    </div>
  )
}
