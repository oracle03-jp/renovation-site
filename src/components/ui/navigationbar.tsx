'use client'

import React from 'react';
import type { User } from '@supabase/supabase-js';

// アイコン (変更なし)
const HomeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955M3 11.25V21h6V12h4.5v9h6v-9.75M12 2.25v2.25" /></svg> );
const SearchIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg> );

type NavigationBarProps = {
  user: User | null;
}

export default function NavigationBar({ user }: NavigationBarProps) {
  return (
    <nav className="bg-[#004aad] text-white p-2 flex justify-between items-center fixed top-0 w-full z-10 
                   md:flex-col md:h-screen md:w-20 md:left-0 md:top-0 md:justify-start md:items-center md:p-6 md:space-y-6">
      
     <a href="/" className="relative group md:mb-10">
        {/* h1タグをHomeIconに変更 */}
        <HomeIcon />
        {/* ポップアップ用のspanを追加 */}
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4
                 w-auto min-w-max p-2 rounded-md shadow-md
                 text-white bg-gray-900 text-sm font-bold
                 transition-all duration-150 scale-0 group-hover:scale-100 origin-left">
          空き家リノベーションサイト
        </span>
      </a>
      {/* PC表示ではアイコンを中央に配置するためulタグを調整 */}
      <ul className="flex space-x-4 md:flex-col md:space-x-0 md:space-y-6 md:w-full md:items-center">
        
        <li>
          {/* 1. 親要素(a)に`group`と`relative`を追加 */}
          <a href="/search" className="relative group flex items-center p-2 rounded-full hover:bg-blue-700 transition-colors">
            <SearchIcon />
            {/* 2. `span`をツールチップのスタイルに変更 */}
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2
                         w-auto min-w-max p-2 rounded-md shadow-md
                         text-white bg-gray-900 text-sm font-bold
                         transition-all duration-150 scale-0 origin-top group-hover:scale-100
                         md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:mt-0 md:ml-4 md:origin-left">
              検索
            </span>
          </a>
        </li>

        <li>
          <a href="/post/new" className="relative group flex items-center p-2 rounded-full hover:bg-blue-700 transition-colors">
            <PlusIcon />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2
                         w-auto min-w-max p-2 rounded-md shadow-md
                         text-white bg-gray-900 text-sm font-bold
                         transition-all duration-150 scale-0 origin-top group-hover:scale-100
                         md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:mt-0 md:ml-4 md:origin-left">
              投稿
            </span>
          </a>
        </li>

        {user && (
          <li>
            <a href="/account" className="relative group flex items-center p-2 rounded-full hover:bg-blue-700 transition-colors">
              <UserIcon />
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2
                               w-auto min-w-max p-2 rounded-md shadow-md text-white bg-gray-900 text-sm font-bold
                               transition-all duration-150 scale-0 origin-top group-hover:scale-100
                               md:left-full md:top-1/2 md:-translate-y-1/2 md:-translate-x-0 md:mt-0 md:ml-4 md:origin-left">
                {user.user_metadata.username}
              </span>
            </a>
          </li>
        )}
      </ul>
    </nav>
  )
}