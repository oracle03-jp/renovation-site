'use client'

import { useState, useEffect, type DragEvent, type FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

const UploadIcon = () => (
  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg aria-hidden="true" className="inline w-5 h-5 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
  </svg>
);

export default function PostCreateForm() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [authorComment, setAuthorComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // fileステートが変更されたら、プレビュー用のURLを生成する
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // コンポーネントがアンマウントされた時にURLを解放してメモリリークを防ぐ
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // ( onSubmit 関数の内容は変更なし )
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('ログインしてください');
    if (!file) return alert('画像ファイルを選択してください');
    if (!title.trim()) return alert('タイトルを入力してください');
    setLoading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${crypto.randomUUID()}`;
    const filePath = `${user.id}/${filename}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadErr) {
      setLoading(false);
      return alert(`アップロード失敗: ${uploadErr.message}`);
    }
    const { data: pub } = supabase.storage.from('images').getPublicUrl(filePath);
    const imageUrl = pub.publicUrl;
    const { error: insertErr } = await supabase.from('posts').insert({
      user_id: user.id,
      title,
      image_url: imageUrl,
      author_comment: authorComment,
    });
    setLoading(false);
    if (insertErr) return alert(`投稿失敗: ${insertErr.message}`);
    setTitle('');
    setFile(null);
    setAuthorComment('');
    alert('投稿しました！');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            タイトル
          </label>
          <input type="text" id="title" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition" placeholder="タイトルを入力" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            物件の画像
          </label>
          <label
            htmlFor="dropzone-file"
            className={`relative flex items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'bg-blue-100 dark:bg-gray-600' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="プレビュー" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <UploadIcon />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">クリックしてアップロード</span> または ドラッグ＆ドロップ
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (推奨)</p>
              </div>
            )}
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        
        <div>
          <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            コメント <span className="text-gray-500 text-xs">(任意)</span>
          </label>
          <textarea id="comment" rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition" placeholder="こだわったポイントや感想などを自由にお書きください..." value={authorComment} onChange={(e) => setAuthorComment(e.target.value)}></textarea>
        </div>

        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-all duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={loading}>
          {loading ? ( <><SpinnerIcon />投稿中...</> ) : ( '投稿する' )}
        </button>
      </form>
    </div>
  );
}