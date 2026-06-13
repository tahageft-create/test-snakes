import { Server as HTTPServer } from 'http'
import { Server, Socket } from 'socket.io'

let io: Server

export function initSocketIO(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3001'],
      credentials: true,
    },
  })

  io.on('connection', async (socket: Socket) => {
    const token = socket.handshake.auth?.token
    if (token) {
      try {
        const { default: jwt } = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'snakes-community-secret-key-2024'
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string }
        socket.data.user = decoded
        socket.join(`user:${decoded.id}`)
        if (['owner', 'developer', 'admin'].includes(decoded.role)) {
          socket.join('admins')
        }
      } catch {}
    }
  })

  return io
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

export function notifyUser(userId: number, notification: { type: string; title: string; message: string; link?: string }) {
  io.to(`user:${userId}`).emit('notification', { ...notification, timestamp: new Date().toISOString() })
}

export function notifyAdmins(notification: { type: string; title: string; message: string; link?: string }) {
  io.to('admins').emit('notification', { ...notification, timestamp: new Date().toISOString() })
}

export function notifyAll(notification: { type: string; title: string; message: string; link?: string }) {
  io.emit('notification', { ...notification, timestamp: new Date().toISOString() })
}
