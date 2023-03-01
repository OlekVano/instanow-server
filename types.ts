import { Timestamp } from "firebase-admin/firestore"

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
  comments: [],
  createdAt: Timestamp
}