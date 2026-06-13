import { Router, Request, Response } from 'express'
import crypto from 'crypto'
import https from 'https'
import querystring from 'querystring'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { queryOne, run, db, save } from '../db/index.js'
import { authMiddleware, AuthRequest, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

const DISCORD_API = 'https://discord.com/api'
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || ''
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || ''
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/api/discord/callback'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
const SCOPES = ['identify', 'email', 'guilds', 'guilds.members.read']

// Helper: make HTTPS request
function httpsRequest(options: any, body?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) })
        } catch {
          resolve({ status: res.statusCode, data })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

// Helper: fetch Discord user profile
async function fetchDiscordUser(accessToken: string) {
  return httpsRequest({
    hostname: 'discord.com',
    path: '/api/users/@me',
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// Helper: fetch user guilds
async function fetchUserGuilds(accessToken: string) {
  return httpsRequest({
    hostname: 'discord.com',
    path: '/api/users/@me/guilds',
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// Helper: fetch guild info
async function fetchGuildInfo(accessToken: string, guildId: string) {
  return httpsRequest({
    hostname: 'discord.com',
    path: `/api/guilds/${guildId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// Helper: fetch guild members (requires bot token or member token)
async function fetchGuildMembers(accessToken: string, guildId: string) {
  return httpsRequest({
    hostname: 'discord.com',
    path: `/api/guilds/${guildId}/members?limit=100`,
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// Helper: fetch guild roles
async function fetchGuildRoles(accessToken: string, guildId: string) {
  return httpsRequest({
    hostname: 'discord.com',
    path: `/api/guilds/${guildId}/roles`,
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// Helper: fetch guild channels
async function fetchGuildChannels(accessToken: string, guildId: string) {
  return httpsRequest({
    hostname: 'discord.com',
    path: `/api/guilds/${guildId}/channels`,
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

// Build Discord avatar URL
function getDiscordAvatarUrl(discordId: string, avatarHash: string | null, discriminator?: string): string {
  if (avatarHash) {
    const ext = avatarHash.startsWith('a_') ? 'gif' : 'png'
    return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=128`
  }
  // Default avatar based on discriminator or user id
  const index = discriminator && discriminator !== '0'
    ? parseInt(discriminator) % 5
    : (BigInt(discordId) >> 22n) % 6n
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}

// Build Discord avatar decoration URL
function getDiscordDecorationUrl(decorationData: any): string {
  if (decorationData?.asset) {
    return `https://cdn.discordapp.com/avatar-decoration-presets/${decorationData.asset}.png?size=128`
  }
  return ''
}

// Simple encrypt/decrypt for tokens (using AES-256-GCM)
const ENCRYPTION_KEY = crypto.scryptSync(JWT_SECRET, 'snakes-salt', 32)

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return ''
  }
}

// Step 1: Redirect to Discord OAuth2 (works for both login and linking)
router.get('/login', (req: AuthRequest, res: Response) => {
  if (!DISCORD_CLIENT_ID || DISCORD_CLIENT_ID === 'YOUR_DISCORD_CLIENT_ID') {
    return res.status(500).json({ message: 'Discord OAuth2 not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env' })
  }

  // Check if user is already logged in (for account linking)
  let userId: number | null = null
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { id: number }
      userId = decoded.id
    } catch {}
  }

  const state = crypto.randomBytes(32).toString('hex')
  run('INSERT INTO oauth_states (state, user_id, redirect_after) VALUES (?, ?, ?)', [state, userId, '/admin'])

  const params = querystring.stringify({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
  })

  res.json({ url: `${DISCORD_API}/oauth2/authorize?${params}` })
})

// Step 2: Handle Discord callback (exchange code for token)
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query

  if (error) {
    console.log('[Discord] User denied authorization')
    return res.redirect(`${FRONTEND_URL}/discord/callback?error=discord_denied`)
  }

  if (!code || !state) {
    console.log('[Discord] Missing code or state')
    return res.redirect(`${FRONTEND_URL}/discord/callback?error=missing_params`)
  }

  // Validate state (CSRF protection)
  const stateRecord = queryOne('SELECT * FROM oauth_states WHERE state = ?', [state as string])
  if (!stateRecord) {
    console.log('[Discord] Invalid state token:', state)
    return res.redirect(`${FRONTEND_URL}/discord/callback?error=invalid_state`)
  }

  // Clean up used state + old expired states
  run('DELETE FROM oauth_states WHERE state = ?', [state as string])
  run("DELETE FROM oauth_states WHERE created_at < datetime('now', '-10 minutes')")

  try {
    // 1. Exchange code for access token
    const tokenBody = querystring.stringify({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: DISCORD_REDIRECT_URI,
    })

    const tokenRes = await httpsRequest({
      hostname: 'discord.com',
      path: '/api/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(tokenBody),
      },
    }, tokenBody)

    if (tokenRes.status !== 200 || !tokenRes.data.access_token) {
      console.error('[Discord] Token exchange failed:', tokenRes.data)
      return res.redirect(`${FRONTEND_URL}/discord/callback?error=token_exchange_failed`)
    }

    const { access_token, refresh_token, expires_in } = tokenRes.data
    console.log('[Discord] Token exchange successful')

    // 2. Fetch Discord user profile
    const userRes = await fetchDiscordUser(access_token)
    if (userRes.status !== 200) {
      console.error('[Discord] Failed to fetch user profile:', userRes.data)
      return res.redirect(`${FRONTEND_URL}/discord/callback?error=profile_fetch_failed`)
    }

    const discordUser = userRes.data
    const tokenExpires = new Date(Date.now() + (expires_in * 1000)).toISOString()

    // Build avatar and decoration URLs
    const avatarUrl = getDiscordAvatarUrl(discordUser.id, discordUser.avatar, discordUser.discriminator)
    const decorationUrl = getDiscordDecorationUrl(discordUser.avatar_decoration_data)
    console.log('[Discord] User profile:', discordUser.username, 'ID:', discordUser.id, 'Email:', discordUser.email)
    console.log('[Discord] Avatar URL:', avatarUrl)
    console.log('[Discord] Decoration URL:', decorationUrl || 'none')

    // 3. Fetch guilds
    const guildsRes = await fetchUserGuilds(access_token)
    const guilds = guildsRes.status === 200 ? guildsRes.data : []

    // 4. Check if user is admin of the configured Discord server
    const serverId = process.env.DISCORD_SERVER_ID || ''
    const isServerAdmin = guilds.some((g: any) =>
      g.id === serverId && (g.permissions & 0x8) !== 0
    )
    console.log('[Discord] Is server admin:', isServerAdmin)

    // 5. Find or create the website user account
    //    Priority: existing discord_accounts link → state userId → create new
    let webUser: any = null

    // Step A: Check if this Discord account is already linked
    const existingLink = queryOne(
      'SELECT * FROM discord_accounts WHERE discord_id = ?',
      [String(discordUser.id)]
    ) as any

    if (existingLink) {
      console.log('[Discord] Found existing link for user_id:', existingLink.user_id)
      // Verify the linked user actually exists
      webUser = queryOne('SELECT * FROM users WHERE id = ?', [existingLink.user_id])
      if (!webUser) {
        console.log('[Discord] Linked user not found, cleaning orphaned discord_account')
        run('DELETE FROM discord_accounts WHERE discord_id = ?', [String(discordUser.id)])
      }
    }

    // Step B: If no valid link, check if logged-in user wants to link
    if (!webUser) {
      const stateUserId = stateRecord.user_id ? Number(stateRecord.user_id) : null
      if (stateUserId && stateUserId > 0) {
        console.log('[Discord] Trying state userId:', stateUserId)
        webUser = queryOne('SELECT * FROM users WHERE id = ?', [stateUserId])
      }
    }

    // Step C: If still no user, create a brand new account
    if (!webUser) {
      console.log('[Discord] Creating new website account')
      const safeUsername = discordUser.username.replace(/[^a-zA-Z0-9_]/g, '') || 'discord_user'
      let username = safeUsername

      // Ensure unique username
      let counter = 1
      while (queryOne('SELECT id FROM users WHERE username = ?', [username])) {
        username = `${safeUsername}_${counter}`
        counter++
      }

      const defaultRole = isServerAdmin ? 'admin' : 'member'
      const dummyPassword = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10)

      db.run(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, dummyPassword, discordUser.email || '', defaultRole]
      )

      // Immediately fetch the created user
      webUser = queryOne('SELECT * FROM users WHERE username = ?', [username])
      console.log('[Discord] Created user:', webUser ? `${webUser.username} (id=${webUser.id})` : 'FAILED')

      if (!webUser) {
        console.error('[Discord] CRITICAL: User INSERT succeeded but SELECT returned null')
        return res.redirect(`${FRONTEND_URL}/discord/callback?error=user_creation_failed`)
      }
    }

    // 6. Upsert discord_accounts link
    const discordId = String(discordUser.id)
    const existingForUser = queryOne('SELECT id FROM discord_accounts WHERE user_id = ?', [webUser.id])

    if (existingForUser) {
      db.run(
        `UPDATE discord_accounts SET
          discord_id = ?, access_token = ?, refresh_token = ?, token_expires = ?,
          username = ?, discriminator = ?, avatar = ?, email = ?, verified = ?,
          guilds = ?, last_login = datetime('now')
        WHERE user_id = ?`,
        [
          discordId, encrypt(access_token), encrypt(refresh_token), tokenExpires,
          discordUser.username, discordUser.discriminator || '0',
          discordUser.avatar || '', discordUser.email || '', discordUser.verified ? 1 : 0,
          JSON.stringify(guilds), webUser.id,
        ]
      )
    } else {
      // Check if discord_id already taken (orphaned from deleted user)
      run('DELETE FROM discord_accounts WHERE discord_id = ?', [discordId])
      db.run(
        `INSERT INTO discord_accounts (user_id, discord_id, username, discriminator, avatar, email, verified, access_token, refresh_token, token_expires, guilds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          webUser.id, discordId, discordUser.username, discordUser.discriminator || '0',
          discordUser.avatar || '', discordUser.email || '', discordUser.verified ? 1 : 0,
          encrypt(access_token), encrypt(refresh_token), tokenExpires, JSON.stringify(guilds),
        ]
      )
    }

    // Update user's avatar and decoration in users table
    db.run(
      'UPDATE users SET avatar = ?, avatar_decoration = ? WHERE id = ?',
      [avatarUrl, decorationUrl, webUser.id]
    )
    webUser.avatar = avatarUrl
    webUser.avatar_decoration = decorationUrl
    console.log('[Discord] Discord account linked to user_id:', webUser.id)

    // 7. Upgrade role if Discord server admin
    if (isServerAdmin && webUser.role === 'member') {
      db.run('UPDATE users SET role = ? WHERE id = ?', ['admin', webUser.id])
      webUser.role = 'admin'
    }

    // 8. Generate JWT
    const token = jwt.sign(
      { id: webUser.id, username: webUser.username, role: webUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 9. Store session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    db.run('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)', [webUser.id, token, expiresAt])

    // 10. Log activity
    db.run(
      'INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)',
      [webUser.username, 'Discord OAuth2 login', `Discord: ${discordUser.username}#${discordUser.discriminator || '0'}`]
    )

    // Save DB to disk
    save()

    console.log('[Discord] Login successful for:', webUser.username, '(role:', webUser.role + ')')

    // 11. Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/discord/callback?discord_token=${token}`)
  } catch (err) {
    console.error('[Discord] Callback error:', err)
    res.redirect(`${FRONTEND_URL}/discord/callback?error=callback_error`)
  }
})

// Get linked Discord account info
router.get('/account', authMiddleware, (req: AuthRequest, res: Response) => {
  const discord = queryOne('SELECT * FROM discord_accounts WHERE user_id = ?', [req.user!.id]) as any
  if (!discord) {
    return res.json({ linked: false })
  }

  let guilds: any[] = []
  try { guilds = JSON.parse(discord.guilds || '[]') } catch {}

  res.json({
    linked: true,
    discord_id: discord.discord_id,
    username: discord.username,
    discriminator: discord.discriminator,
    avatar: discord.avatar ? `https://cdn.discordapp.com/avatars/${discord.discord_id}/${discord.avatar}.png` : `https://ui-avatars.com/api/?name=${discord.username}&background=5865F2&color=fff&size=80`,
    email: discord.email,
    verified: !!discord.verified,
    guilds,
    last_login: discord.last_login,
  })
})

// Disconnect Discord account
router.delete('/account', authMiddleware, (req: AuthRequest, res: Response) => {
  run('DELETE FROM discord_accounts WHERE user_id = ?', [req.user!.id])
  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user!.username, 'Disconnected Discord', ''])
  res.json({ message: 'Discord account disconnected' })
})

// Refresh Discord access token
router.post('/refresh', authMiddleware, async (req: AuthRequest, res: Response) => {
  const discord = queryOne('SELECT * FROM discord_accounts WHERE user_id = ?', [req.user!.id]) as any
  if (!discord) {
    return res.status(404).json({ message: 'No linked Discord account' })
  }

  try {
    const refreshToken = decrypt(discord.refresh_token)
    const body = querystring.stringify({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const tokenRes = await httpsRequest({
      hostname: 'discord.com',
      path: '/api/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, body)

    if (tokenRes.status !== 200) {
      return res.status(400).json({ message: 'Token refresh failed' })
    }

    const { access_token, refresh_token, expires_in } = tokenRes.data
    const tokenExpires = new Date(Date.now() + (expires_in * 1000)).toISOString()

    run('UPDATE discord_accounts SET access_token = ?, refresh_token = ?, token_expires = ? WHERE user_id = ?', [encrypt(access_token), encrypt(refresh_token), tokenExpires, req.user!.id])

    res.json({ message: 'Token refreshed' })
  } catch (err) {
    console.error('Token refresh error:', err)
    res.status(500).json({ message: 'Token refresh error' })
  }
})

// Get Discord server data (for admin dashboard)
router.get('/server', authMiddleware, async (req: AuthRequest, res: Response) => {
  const discord = queryOne('SELECT * FROM discord_accounts WHERE user_id = ?', [req.user!.id]) as any
  if (!discord) {
    return res.status(404).json({ message: 'No linked Discord account' })
  }

  const accessToken = decrypt(discord.access_token)
  const serverId = process.env.DISCORD_SERVER_ID || ''

  try {
    const [guildRes, rolesRes, channelsRes] = await Promise.all([
      fetchGuildInfo(accessToken, serverId),
      fetchGuildRoles(accessToken, serverId),
      fetchGuildChannels(accessToken, serverId),
    ])

    res.json({
      guild: guildRes.status === 200 ? guildRes.data : null,
      roles: rolesRes.status === 200 ? rolesRes.data : [],
      channels: channelsRes.status === 200 ? channelsRes.data : [],
    })
  } catch (err) {
    console.error('Discord server data error:', err)
    res.status(500).json({ message: 'Failed to fetch server data' })
  }
})

// Get Discord server members (for admin dashboard)
router.get('/server/members', authMiddleware, async (req: AuthRequest, res: Response) => {
  const discord = queryOne('SELECT * FROM discord_accounts WHERE user_id = ?', [req.user!.id]) as any
  if (!discord) {
    return res.status(404).json({ message: 'No linked Discord account' })
  }

  const accessToken = decrypt(discord.access_token)
  const serverId = process.env.DISCORD_SERVER_ID || ''

  try {
    const membersRes = await fetchGuildMembers(accessToken, serverId)
    res.json(membersRes.status === 200 ? membersRes.data : [])
  } catch (err) {
    console.error('Discord members fetch error:', err)
    res.status(500).json({ message: 'Failed to fetch server members' })
  }
})

// Check if Discord OAuth2 is configured
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    configured: !!DISCORD_CLIENT_ID && DISCORD_CLIENT_ID !== 'YOUR_DISCORD_CLIENT_ID',
    clientId: DISCORD_CLIENT_ID !== 'YOUR_DISCORD_CLIENT_ID' ? DISCORD_CLIENT_ID : null,
  })
})

export default router
