export type Profile = {
  id: string,
  profilePicture: string,
  username: string,
  tag: string,
  bio: string,
  followersIds: string[],
  followingIds: string[],
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

export type WithLikes = {likes: string[]} & {[key: string] : any}

type ForcefullyOmit<T, K extends keyof T> = Omit<T, K> & Partial<Record<K, never>>

export type Chat = {
  id: string,
  userIds: string[],
  messages: Message[]
}

export type ChatWithUser = Chat & {user: Profile}

export type Message = {
  authorId: string,
  read: boolean,
  text: string,
  image: string,
  sentAt: number
}

export type ChatWithoutId = ForcefullyOmit<Chat, 'id'>