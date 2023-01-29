export type User = {
  nickname: string,
  description: string,
  skin: string,
  background: string
}

export type Post = {
  title: string,
  image: string,
  content: string,
  authorId: string,
  likedByIds: string[],
  nLikes: number
}