export type Profile = {
  id: string,
  nickname: string,
  description: string,
  skin: string,
  background: string
}

export type Post = {
  id: string,
  title: string,
  image: string,
  content: string,
  authorId: string,
}

export type DictWithId = {
  id: string,
  [key: string]: any
}

export type DictWithIdAndLikes = {
  id: string,
  likes: number,
  liked: boolean,
  [key: string]: any
}