import { RawData, Server, WebSocket} from 'ws'
import { getUserIdFromToken } from './firebase-access'
import { Message } from './types'

let webSocketServer = undefined
let clients: {[key: string]: WebSocket} = {}

export function manageWebsocketServer(wss: Server<WebSocket>) {
    webSocketServer = wss
    webSocketServer.on('connection', onConnect)
}

export function sendMessage(userId: string, message: Message) {
  if (!clients[userId]) return
  clients[userId].send(JSON.stringify(message))
}

function onConnect(client: WebSocket) {
  console.log('A new client Connected!')
  client.on('message', async function callOnMessage(msg: RawData) {
      await onMessage(msg, client)
  })
  client.on('close', async function callOnDisconnect() {
    await onDisconnect(client)
  })
}

async function onMessage(msg: RawData, client: WebSocket) {
  const userId = await getUserIdFromToken(msg.toString())
  if (!userId) return

  clients[userId] = client
}

async function onDisconnect(client: WebSocket) {
  for (let key in clients) {
    // comparing 2 objects, since we need to know if the location in memory is the same
    if (clients[key] === client) {
      delete clients[key]
    }
  }
}