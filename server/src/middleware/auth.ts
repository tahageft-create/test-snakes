import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'snakes-community-secret-key-2024'

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string }
}

const ROLE_LEVELS: Record<string, number> = {
  owner: 100,
  developer: 90,
  admin: 80,
  staff: 60,
  member: 40,
  guest: 10,
}

export function getRoleLevel(role: string): number {
  return ROLE_LEVELS[role] ?? 0
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string }
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    next()
  }
}

export function ownerOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'owner' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Insufficient permissions' })
  }
  next()
}

export { JWT_SECRET }
