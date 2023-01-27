import express, { Request, Response } from 'express'
import { postKeys } from '../consts'
import { app, getToken, posts } from '../firebase-setup'
import { Post } from '../types'
import { getPostById } from '../utils'
const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
  console.log(await req.body)
  try {
    const keys = Object.keys(req.body)
  
    if (!keys.every(key => (postKeys as string[]).includes(key))) {
      console.log(1)
      res.status(400).send()
      return
    }

    const token = getToken(req)
  
    if (!token) {
      console.log(2)
      res.status(400).send()
      return
    }

    const payload = await app.auth().verifyIdToken(token)
    const post = await posts.add(Object.assign({authorId: payload.uid}, req.body))

    console.log(post)

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
    else res.json(post)

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router