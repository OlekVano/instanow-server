import express, { Request, Response } from 'express'
import { requiredPostKeys } from '../consts'
import { createPost, updatePost } from '../firebase-access'
import { Post, PostWithoutId } from '../types'
import { addAuthorsToComments, addAuthorToPost, addComment, addLike, getPostById, getPosts, removeIdFromDict, removeLike, requireAuthorization, uploadDataURL } from '../utils'
const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
  const userId = await requireAuthorization(req, res)

  try {
    const keys = Object.keys(req.body)
  
    if (!keys.every(key => (requiredPostKeys as string[]).includes(key))) {
      res.status(400).send()
      return
    }

    if (req.body.picture) req.body.picture = await uploadDataURL(req.body.picture)
    
    const postId = await createPost(Object.assign({
      authorId: userId,
      likes: [],
      comments: []
    }, req.body))

    res.json({id: postId})
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.get('/:postId', async (req: Request<{postId: string}>, res: Response) => {
  const { postId } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const post: Post | undefined = await getPostById(postId)

    if (!post) res.status(404).send()
    else {
      const postWithAuthor = await addAuthorToPost(post)
      postWithAuthor.comments = await addAuthorsToComments(postWithAuthor.comments)
      res.json(postWithAuthor)
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.post('/:postId/like', async (req: Request<{postId: string}>, res: Response) => {
  const { postId } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    let post: Post | undefined = await getPostById(postId)
    if (!post) res.status(404).send()
    else {
      post = await addLike(post, userId, req.body.query) as Post
      const postWithoutId: PostWithoutId = removeIdFromDict(post)
      await updatePost(postId, postWithoutId)
      res.status(200).send()
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.post('/:postId/dislike', async (req: Request<{postId: string}>, res: Response) => {
  const { postId } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    let post: Post | undefined = await getPostById(postId)
    if (!post) res.status(404).send()
    else {
      post = await removeLike(post, userId, req.body.query) as Post
      const postWithoutId: PostWithoutId = removeIdFromDict(post)
      await updatePost(postId, postWithoutId)
      res.status(200).send()
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.post('/:postId/comment', async (req: Request<{postId: string}>, res: Response) => {
  const { postId } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    if (!req.body.text) {
      res.status(400).send()
      return
    }

    if (!req.body.query) {
      res.status(400).send()
      return
    }

    let post: Post | undefined = await getPostById(postId)
    if (!post) res.status(404).send()
    else {
      post = await addComment(post, userId, req.body.text, req.body.query) as Post
      const postWithoutId: PostWithoutId = removeIdFromDict(post)
      await updatePost(postId, postWithoutId)
      res.status(200).send()
    }

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})  

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const posts = await getPosts()
    res.json(posts)
    
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router