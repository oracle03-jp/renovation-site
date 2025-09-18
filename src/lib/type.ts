export type Profile = {
    id: string
    username: string
    avatar_url: string | null
}

export type Post = {
    id: string
    title: string
    image_url: string
    author_comment: string | null
    created_at: string
    user: Profile
}

export type Comment = {
    id: string
    body: string
    created_at: string
    user: Profile
}