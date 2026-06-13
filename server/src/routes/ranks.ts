import { Router } from 'express'

const router = Router()

const voiceRanks = [
  { id: 1, name: 'Novice', type: 'voice', level: 10, color: '#94a3b8', icon: '🌱', permissions: ['Access to general voice channels', 'Basic emotes'] },
  { id: 2, name: 'Adept', type: 'voice', level: 20, color: '#22c55e', icon: '⚔️', permissions: ['Custom nickname', 'Voice channel priority'] },
  { id: 3, name: 'Sentinel', type: 'voice', level: 30, color: '#3b82f6', icon: '🛡️', permissions: ['Private voice channel creation', 'Embed links'] },
  { id: 4, name: 'Elite', type: 'voice', level: 40, color: '#8b5cf6', icon: '💎', permissions: ['Exclusive voice lounge access', 'Custom role color'] },
  { id: 5, name: 'Expert', type: 'voice', level: 60, color: '#f59e0b', icon: '👑', permissions: ['Event hosting rights', 'VIP voice channel'] },
  { id: 6, name: 'Archon', type: 'voice', level: 100, color: '#ef4444', icon: '🔥', permissions: ['All Elite perks', 'Server influence voting', 'Exclusive Archon lounge'] },
]

const chatRanks = [
  { id: 7, name: 'Explorer', type: 'chat', level: 10, color: '#94a3b8', icon: '🗺️', permissions: ['Image uploads', 'Reaction access'] },
  { id: 8, name: 'Socialite', type: 'chat', level: 30, color: '#22c55e', icon: '💬', permissions: ['Custom nickname', 'Sticker access'] },
  { id: 9, name: 'Enthusiast', type: 'chat', level: 60, color: '#8b5cf6', icon: '⚡', permissions: ['Embed links', 'Thread creation'] },
  { id: 10, name: 'Analyste', type: 'chat', level: 80, color: '#f59e0b', icon: '🧠', permissions: ['All Enthusiast perks', 'Exclusive chat channels', 'Poll creation'] },
]

router.get('/', (_req, res) => {
  res.json({ voice: voiceRanks, chat: chatRanks })
})

export default router
