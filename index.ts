import express, { Request, Response } from 'express'
const app = express()
import cors from 'cors'
app.use(cors())
app.use(express.json({limit: '10mb'}))

import usersRouter from './routes/users'
import skinsRouter from './routes/skins'
import backgroundsRouter from './routes/backgrounds'
import postsRouter from './routes/posts'
import likeRouter from './routes/like'
import { isAuthenticated } from './utils'

const corsOptions = {
  //origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.get('/test', cors(corsOptions), (_req: Request, res: Response) => {
  res.send('asdf')
})

app.use('/users', isAuthenticated, usersRouter)
app.use('/skins', skinsRouter)
app.use('/backgrounds', backgroundsRouter)
app.use('/posts', isAuthenticated, postsRouter)
app.use('/like', isAuthenticated, likeRouter)

const port = process.env.PORT || 3001
app.listen(port, async () => {
  console.log( `Server started at http://localhost:${ port }` );
})

