import express from 'express'
import { users } from '../firebase-setup.js'
const router = express.Router()

router.get('/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const snapshot = await users.where('id', '==', userId).get();
    if (snapshot.empty) {
      res.status(404).send('Not found')
      return;
    }
    const result = []
    snapshot.forEach(doc => {
      result.push(doc.data())
    });
    
    res.json(result[0])

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

export default router