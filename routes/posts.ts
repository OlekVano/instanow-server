import express, { Request, Response } from 'express'
import { postKeys } from '../consts'
import { app, getToken, likes, posts } from '../firebase-setup'
import { Post } from '../types'
import { getLikes, getPostById, getPosts, uploadFile } from '../utils'
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
    }, req.body))

    await likes.doc(post.id).set({likedByIds: []})

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
      const likedByIds = await getLikes(postId) as string[]
      res.json(Object.assign({
        liked: likedByIds.includes(await (await app.auth().verifyIdToken(getToken(req) as string)).uid),
        likes: likedByIds.length
      }, post))
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.get('/', async (_req: Request, res: Response) => {
  try {
    res.json(await getPosts())
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router