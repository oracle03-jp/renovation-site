'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/lib/types'
import type { User } from '@supabase/supabase-js' // ★ User 型をインポート
import NavigationBar from '@/components/ui/navigationbar' // ★ ナビゲーションバーをインポート
import PostCard from '@/components/post/PostCard'
import PostModal from '@/components/post/PostModal'

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
)

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null) 

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user) 
      setCurrentUserId(user?.id ?? null) 
    })
  }, [])
  // --- ★ ここまで修正 ---

  const handleDeleted = useCallback((id: string) => {
    setResults((prev) => prev.filter((p) => p.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  const selected = results.find((p) => p.id === selectedId) ?? null

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setError(null)
    setHasSearched(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id, title, image_url, image_urls, author_comment, created_at,
          user:profiles!user_id ( id, username, avatar_url )
        `
        )
        .ilike('title', `%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setResults(data as any)
    } catch (error: any) {
      console.error('検索エラー:', error.message)
      setError('検索中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
   
    <>
      
      <NavigationBar user={user} />

      <main className="md:pl-20 pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              記事を検索
            </h1>
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="タイトルを入力..."
                className="flex-grow p-3 border border-gray-300 rounded-lg text-black
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold
                           hover:bg-blue-700 transition-colors shadow-sm
                           disabled:bg-gray-400 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                <SearchIcon />
                {loading ? '検索中...' : '検索'}
              </button>
            </form>
          </section>

          <section>
            {error && (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-lg text-red-500">{error}</p>
              </div>
            )}
            {loading && (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  検索中...
                </p>
              </div>
            )}
            {!loading && !hasSearched && !error && (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  検索バーにキーワードを入力して、記事を探してみましょう。
                </p>
              </div>
            )}
            {!loading && hasSearched && results.length === 0 && (
              <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  「
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {searchTerm}
                  </span>
                  」に一致する記事はありませんでした。
                </p>
              </div>
            )}
            {!loading && results.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  検索結果: {results.length}件
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      onOpen={() => setSelectedId(p.id)}
                      currentUserId={currentUserId}
                      onDeleted={handleDeleted}
                    />
                  ))}
                </div>
                <PostModal
                  post={selected}
                  open={!!selected}
                  onOpenChange={(o) => !o && setSelectedId(null)}
                  currentUserId={currentUserId}
                  onDeleted={handleDeleted}
                />
              </>
            )}
          </section>
        </div>
      </main>
    </>
  )
}