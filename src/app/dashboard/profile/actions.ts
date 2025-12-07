"use server"

import { revalidatePath } from "next/cache"

export async function purgeProfileCache() {
  // layoutを指定することで、サイト全体のデータの整合性を合わせる（強力なリフレッシュ）
  revalidatePath("/", "layout")
}