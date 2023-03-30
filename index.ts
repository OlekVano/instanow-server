import express from 'express'
import cors from 'cors'
import http from 'http'
import WebSocket from 'ws'

const app = express()
app.use(cors())
app.use(express.json({limit: '10mb'}))

import { config } from 'dotenv'
config()

import profilesRouter from './routes/profiles'
import postsRouter from './routes/posts'
import messagesRouter from './routes/messages'
import { manageWebsocketServer } from './websocket-manager'

app.use('/profiles', profilesRouter)
app.use('/posts', postsRouter)
app.use('/messages', messagesRouter)

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
manageWebsocketServer(wss)

const port = process.env.PORT || 3001
server.listen(port, async function afterServerLaunched() {
  console.log( `Server started at http://localhost:${ port }` );
})