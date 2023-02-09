import express, { Request, Response } from 'express'
import { getDefaultSkins, getDefaultBackgrounds } from '../firebase-access'
const router = express.Router()

router.get('/backgrounds', async (_req: Request, res: Response) => {
  try {
    const skins = await getDefaultBackgrounds()
    res.json(skins)
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err})
  }
})

router.get('/skins', async (_req: Request, res: Response) => {
    try {
      const skins = await getDefaultSkins()
      res.json(skins)
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err})
    }
  })

export default router