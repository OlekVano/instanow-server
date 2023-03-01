import express, { Request, Response } from 'express'
const app = express()
import cors from 'cors'
app.use(cors())
app.use(express.json({limit: '10mb'}))

import { config } from 'dotenv'
config()

import profilesRouter from './routes/profiles'
import postsRouter from './routes/posts'

const corsOptions = {
  //origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.get('/test', cors(corsOptions), (_req: Request, res: Response) => {
  res.send('asdf')
})

app.use('/profiles', profilesRouter)
app.use('/posts', postsRouter)

const port = process.env.PORT || 3001
app.listen(port, async () => {
  console.log( `Server started at http://localhost:${ port }` );
})

