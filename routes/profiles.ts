import express, { Request, Response } from 'express'
import { requiredProfileKeys } from '../consts'
import { getFollowedProfiles, updateProfile } from '../firebase-access'
import { Profile } from '../types'
import { addAuthorsToComments, addPostsToProfile, follow, getProfileById, getProfiles, requireAuthorization, unfollow, uploadDataURL } from '../utils'

const router = express.Router()

router.post('/:profileId', async (req: Request<{profileId: string}>, res: Response) => {
  const { profileId } = req.params

  try {
    const userId: string | undefined = await requireAuthorization(req, res)
    if (userId !== profileId) {
      res.status(403).send()
      return
    }

    const keys = Object.keys(req.body)
  
    if (!keys.every(key => (requiredProfileKeys as string[]).includes(key))) {
      res.status(400).send()
      return
    }

    // If new profile picture
    if (req.body.profilePicture.startsWith('data')) req.body.profilePicture = await uploadDataURL(req.body.profilePicture)
    
    // If new profile
    if (!await getProfileById(profileId)) {
      req.body.followersIds = []
      req.body.followingIds = []
    }

    await updateProfile(userId, req.body)

    res.status(200).send()
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.post('/:profileId/follow', async (req: Request<{profileId: string}>, res: Response) => {
  const { profileId } = req.params

  try {
    const userId: string | undefined = await requireAuthorization(req, res)
    if (!userId) return

    if (await follow(userId, profileId)) res.status(200).send()
    else res.status(404).send()

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.post('/:profileId/unfollow', async (req: Request<{profileId: string}>, res: Response) => {
  const { profileId } = req.params

  try {
    const userId: string | undefined = await requireAuthorization(req, res)
    if (!userId) return

    if (await unfollow(userId, profileId)) res.status(200).send()
    else res.status(404).send()

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.get('/following', async (req: Request, res: Response) => {
  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const followedProfiles = await getFollowedProfiles(userId)
    res.json(followedProfiles)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.get('/:profileId', async (req: Request<{profileId: string}>, res: Response) => {
  const { profileId } = req.params

  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const profile: Profile | undefined = await getProfileById(profileId)
    if (!profile) res.status(404).send()
    else {
      let profileWithPosts = await addPostsToProfile(profile)
      profileWithPosts.posts = await Promise.all(
        profileWithPosts.posts.map(
          async function mapPost(post) {
            post.comments = await addAuthorsToComments(post.comments)
            return post
          }
        )
      )
      res.json(profileWithPosts)
    } 

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = await requireAuthorization(req, res)
    if (!userId) return

    const profiles = await getProfiles()
    res.json(profiles)
    
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

export default router