import PostGrid from '@/components/post/PostGrid'
import PostCreateForm from '@/components/post/PostCreateForm'

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">投稿一覧</h1>
      <PostCreateForm />
      <PostGrid />
    </main>
  )
}
