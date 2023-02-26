// import express, { Request, Response } from 'express' 
// import { requiredPostKeys } from '../consts'
// import { createLikes, createPost } from '../firebase-access'
// import { Post } from '../types'
// import { addAuthorToPost, addLikesToDict, getPostById, getPosts, requireAuthorization, uploadDataURL } from '../utils'
// const router = express.Router()

// router.post('/', async (req: Request, res: Response) => {
//   const userId = await requireAuthorization(req, res)

//   try {
//     const keys = Object.keys(req.body)
  
//     if (!keys.every(key => (requiredPostKeys as string[]).includes(key))) {
//       res.status(400).send()
//       return
//     }

//     if (req.body.image) req.body.image = await uploadDataURL(req.body.image)
    
//     const postId = await createPost(Object.assign({
//       authorId: userId,
//     }, req.body))

//     await createLikes(postId)

//     res.json({id: postId})
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err})
//   }
// })

// router.get('/:postId', async (req: Request<{postId: string}>, res: Response) => {
//   const { postId } = req.params

//   try {
//     const userId = await requireAuthorization(req, res)
//     if (!userId) return

//     const post: Post | undefined = await getPostById(postId)
//     if (!post) res.status(404).send()
//     else {
//       await addLikesToDict(post, userId)
//       await addAuthorToPost(post)
//       res.json(post)
//     }

//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err})
//   }
// })

// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const userId = await requireAuthorization(req, res)
//     if (!userId) return

//     const posts = await getPosts()
//     const postsWithLikesAndAuthor = await Promise.all(posts.map(addLikesAndAuthor))
//     res.json(postsWithLikesAndAuthor)

//     // ***************************

//     async function addLikesAndAuthor(post: Post) {
//       await addLikesToDict(post, userId as string)
//       await addAuthorToPost(post)
//       return post
//     }
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err})
//   }
// })

// export default router