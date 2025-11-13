import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPostDate = (dateString: string) => {
  const date = new Date(dateString);
  
  return date.toLocaleString('ja-JP', {
    year: 'numeric',  // 年 (numeric: 2025)
    month: '2-digit', // 月 (2-digit: 01, 02, ..., 12)
    day: '2-digit',   // 日
    hour: '2-digit',  // 時
    minute: '2-digit', // 分
    timeZone: 'Asia/Tokyo' // タイムゾーンを日本に指定
  });
};