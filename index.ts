import express, { Request, Response } from 'express'
const app = express()
import cors from 'cors'
app.use(cors())
app.use(express.json({limit: '10mb'}))

import profilesRouter from './routes/profiles'
import defaultRouter from './routes/default'
import postsRouter from './routes/posts'
import likeRouter from './routes/like'

const corsOptions = {
  //origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.get('/test', cors(corsOptions), (_req: Request, res: Response) => {
  res.send('asdf')
})

app.use('/profiles', profilesRouter)
app.use('/default', defaultRouter)
app.use('/posts', postsRouter)
app.use('/like', likeRouter)

const port = process.env.PORT || 3001
app.listen(port, async () => {
  console.log( `Server started at http://localhost:${ port }` );
})

