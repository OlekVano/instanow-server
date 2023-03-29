import express, { Request, Response } from 'express'
import { requiredMessageKeys } from '../consts'
import { addMessage } from '../firebase-access'
import { requireAuthorization, getChats, getChatByIds } from '../utils'
const router = express.Router()

router.post('/:chatId', async (req: Request, res: Response) => {
  console.log('body1', req.body)
  const { chatId } = req.params

  const currUserId = await requireAuthorization(req, res)

  try {
    const keys = Object.keys(req.body)
  
    if (!keys.every(key => (requiredMessageKeys as string[]).includes(key))) {
      res.status(400).send()
      return
    }
    
    await addMessage(
      Object.assign({
        authorId: currUserId,
        read: false
      }, req.body),
      chatId
    )

    res.status(200).send()
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

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