import { Router } from 'express'
import { queryOne, queryAll, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

const DISCORD_SERVER_ID = '1400333179126157342'

// Get server stats
router.get('/stats', (_req, res) => {
  const result = queryOne('SELECT COUNT(*) as count FROM members') as any
  const memberCount = result?.count ?? 0

  // Read editable overrides
  const settings = queryOne('SELECT * FROM server_settings WHERE id = 1') as any

  const onlineCount = settings?.online_count ?? Math.floor(memberCount * 0.35)
  const voiceActive = settings?.voice_active ?? Math.floor(memberCount * 0.08)
  const totalChannels = settings?.total_channels ?? 28
  const serverName = settings?.server_name ?? 'SNAKES'
  const serverDescription = settings?.server_description ?? ''

  res.json({
    memberCount: settings?.member_count_override ?? memberCount,
    onlineCount,
    voiceActive,
    totalChannels,
    serverName,
    serverDescription,
    serverId: DISCORD_SERVER_ID,
  })
})

// Get server settings (admin)
router.get('/settings', authMiddleware, requireRole('owner', 'developer', 'admin'), (_req, res) => {
  const settings = queryOne('SELECT * FROM server_settings WHERE id = 1') as any
  const result = queryOne('SELECT COUNT(*) as count FROM members') as any
  res.json({
    ...settings,
    actualMemberCount: result?.count ?? 0,
  })
})

// Update server settings (admin)
router.put('/settings', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { member_count_override, online_count, voice_active, total_channels, server_name, server_description } = req.body

  run(
    `UPDATE server_settings SET 
      member_count_override = COALESCE(?, member_count_override),
      online_count = COALESCE(?, online_count),
      voice_active = COALESCE(?, voice_active),
      total_channels = COALESCE(?, total_channels),
      server_name = COALESCE(?, server_name),
      server_description = COALESCE(?, server_description),
      updated_at = datetime('now')
    WHERE id = 1`,
    [
      member_count_override ?? null,
      online_count ?? null,
      voice_active ?? null,
      total_channels ?? null,
      server_name || null,
      server_description || null,
    ]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Updated server settings', ''])
  res.json({ message: 'Server settings updated' })
})

// Reset server settings to defaults
router.delete('/settings', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  run('UPDATE server_settings SET member_count_override = NULL, online_count = NULL, voice_active = NULL, total_channels = NULL, server_name = ?, server_description = ? WHERE id = 1', ['SNAKES', ''])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Reset server settings', ''])
  res.json({ message: 'Server settings reset to defaults' })
})

export default router
