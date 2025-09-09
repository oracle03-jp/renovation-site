import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const createClient = async () => {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    const all = cookieStore.getAll()
                    return all.map((c) => ({ name: c.name, value: c.value }))
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set({ name, value, ...options })
                    })
                },
            },
        }
    )
}