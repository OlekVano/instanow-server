import express, { Request, Response } from 'express'
import { postKeys } from '../consts'
import { app, getToken, posts } from '../firebase-setup'
import { Post } from '../types'
import { getPostById, likePost, uploadFile } from '../utils'
const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const keys = Object.keys(req.body)
  
    if (!keys.every(key => (postKeys as string[]).includes(key))) {
      res.status(400).send()
      return
    }

    const token = getToken(req)
  
    if (!token) {
      res.status(400).send()
      return
    }

    if (req.body.image) req.body.image = await uploadFile(req.body.image)
    
    const payload = await app.auth().verifyIdToken(token)
    const post = await posts.add(Object.assign({
      authorId: payload.uid,
      likedByIds: [],
      nLikes: 0
    }, req.body))

    res.json({id: post.id})
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.get('/:postId', async (req: Request<{postId: string}>, res: Response) => {
  const { postId } = req.params
  try {
    
    const post: Post | undefined = await getPostById(postId)
    if (!post) res.status(404).send()
    else {
      const { likedByIds, ...postWithoutLikedIds } = post as Post
      res.json(postWithoutLikedIds)
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.post('/:postId/like', async (req: Request<{postId: string}>, res: Response) => {
  const { postId } = req.params
  
  try {
    const token = getToken(req)
    if (!token) {
      res.status(400).send()
      return
    }
    const payload = await app.auth().verifyIdToken(token)
    const userId = payload.uid

    if (await likePost(postId, userId)) res.status(200).send()
    else res.status(400).send()
  } catch (err) {
    res.status(500).json({message: err})
  }
})

export default router