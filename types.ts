export type Profile = {
  id: string,
  profilePicture: string,
  username: string,
  tag: string,
  bio: string,
  followers: string[],
  following: string[],
}

export type Post = {
  id: string,
  picture: string,
  text: string,
  authorId: string,
  likes: string[],
  comments: Comment[],
  createdAt: number
}

export type PostWithoutId = ForcefullyOmit<Post, 'id'>

export type Comment = {
  text: string,
  authorId: string,
  comments: Comment[],
  likes: string[]
  createdAt: number
}

export type CommentWithAuthor = Comment & {author: Profile}

export type WithComments = {comments: Comment[]} & {[key: string]: any}

type ForcefullyOmit<T, K extends keyof T> = Omit<T, K> & Partial<Record<K, never>>;