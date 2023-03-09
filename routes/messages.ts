import express, { Request, Response } from 'express'
import { requireAuthorization, getChats, getChatByIds } from '../utils'
const router = express.Router()

// router.post('/', async (req: Request, res: Response) => {
//   const userId = await requireAuthorization(req, res)

//   try {
//     const keys = Object.keys(req.body)
  
//     if (!keys.every(key => (requiredPostKeys as string[]).includes(key))) {
//       res.status(400).send()
//       return
//     }

//     if (req.body.picture) req.body.picture = await uploadDataURL(req.body.picture)
    
//     const postId = await createPost(Object.assign({
//       authorId: userId,
//       likes: [],
//       comments: []
//     }, req.body))

//     res.json({id: postId})
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err})
//   }
// })

router.get('/:userId', async (req: Request<{userId: string}>, res: Response) => {
  const { userId } = req.params

  try {
    const currUserId = await requireAuthorization(req, res)
    if (!currUserId) return

    const chat = await getChatByIds(userId, currUserId)

    res.json(chat)

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

// router.post('/:postId/like', async (req: Request<{postId: string}>, res: Response) => {
//   const { postId } = req.params

//   try {
//     const userId = await requireAuthorization(req, res)
//     if (!userId) return

//     let post: Post | undefined = await getPostById(postId)
//     if (!post) res.status(404).send()
//     else {
//       post = await addLike(post, userId, req.body.query) as Post
//       const postWithoutId: PostWithoutId = removeIdFromDict(post)
//       await updatePost(postId, postWithoutId)
//       res.status(200).send()
//     }

//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err})
//   }
// })

// router.post('/:postId/dislike', async (req: Request<{postId: string}>, res: Response) => {
//   const { postId } = req.params

//   try {
//     const userId = await requireAuthorization(req, res)
//     if (!userId) return

//     let post: Post | undefined = await getPostById(postId)
//     if (!post) res.status(404).send()
//     else {
//       post = await removeLike(post, userId, req.body.query) as Post
//       const postWithoutId: PostWithoutId = removeIdFromDict(post)
//       await updatePost(postId, postWithoutId)
//       res.status(200).send()
//     }

//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err})
//   }
// })

// router.post('/:postId/comment', async (req: Request<{postId: string}>, res: Response) => {
//   const { postId } = req.params

//   try {
//     const userId = await requireAuthorization(req, res)
//     if (!userId) return

//     if (!req.body.text) {
//       res.status(400).send()
//       return
//     }

//     if (!req.body.query) {
//       res.status(400).send()
//       return
//     }

//     let post: Post | undefined = await getPostById(postId)
//     if (!post) res.status(404).send()
//     else {
//       post = await addComment(post, userId, req.body.text, req.body.query) as Post
//       const postWithoutId: PostWithoutId = removeIdFromDict(post)
//       await updatePost(postId, postWithoutId)
//       res.status(200).send()
//     }

//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err})
//   }
// })  

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const chats = await getChats(userId)
    res.json(chats)
    
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router