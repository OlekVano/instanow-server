import express, { Request, Response } from 'express'
import { requiredMessageKeys } from '../consts'
import { addMessage, updateChat } from '../firebase-access'
import { Message } from '../types'
import { requireAuthorization, getChats, getChatByIds, getChatById, removeIdFromDict } from '../utils'
import { sendMessage } from '../websocket-manager'
const router = express.Router()

router.post('/:chatId/read', async (req: Request, res: Response) => {
  const { chatId } = req.params

  const currUserId = await requireAuthorization(req, res)

  try {
    let chat = await getChatById(chatId)
    if (!chat) {
      res.status(400).send()
      return
    }

    if (!chat.messages[0]) return

    if (chat.messages[chat.messages.length - 1].authorId !== currUserId) {
      chat.messages[chat.messages.length - 1].read = true
      await updateChat(chat.id, removeIdFromDict(chat))
    }

    res.status(200).send()
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.post('/:chatId', async (req: Request, res: Response) => {
  const { chatId } = req.params

  const currUserId = await requireAuthorization(req, res)

  try {
    const keys = Object.keys(req.body)
  
    if (!keys.every(key => (requiredMessageKeys as string[]).includes(key))) {
      res.status(400).send()
      return
    }
    
    const message: Message = Object.assign({
      authorId: currUserId,
      read: false
    }, req.body)

    await addMessage(
      message,
      chatId
    )

    sendMessage((await getChatById(chatId))?.userIds.find(function findUserId(id) {return id !== currUserId}) as string, message)

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