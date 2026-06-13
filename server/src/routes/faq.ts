import { Router } from 'express'
import { queryAll, run } from '../db/index.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = Router()

// Get all FAQs
router.get('/', (req, res) => {
  const category = req.query.category as string
  let faqs: any[]

  if (category) {
    faqs = queryAll('SELECT * FROM faq WHERE category = ? ORDER BY display_order ASC', [category])
  } else {
    faqs = queryAll('SELECT * FROM faq ORDER BY display_order ASC')
  }

  res.json(faqs)
})

// Create FAQ (protected)
router.post('/', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { question, answer, category, display_order } = req.body
  if (!question || !answer) return res.status(400).json({ message: 'Question and answer are required' })

  const result = run(
    'INSERT INTO faq (question, answer, category, display_order) VALUES (?, ?, ?, ?)',
    [question, answer, category || 'general', display_order || 0]
  )

  run('INSERT INTO activity_logs (user, action, details) VALUES (?, ?, ?)', [req.user.username, 'Added FAQ', question.slice(0, 50)])
  res.status(201).json({ id: result.lastInsertRowid, message: 'FAQ added' })
})

// Update FAQ (protected)
router.put('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  const { question, answer, category, display_order } = req.body
  const { id } = req.params

  run(
    'UPDATE faq SET question = COALESCE(?, question), answer = COALESCE(?, answer), category = COALESCE(?, category), display_order = COALESCE(?, display_order) WHERE id = ?',
    [question || null, answer || null, category || null, display_order ?? null, id]
  )

  res.json({ message: 'FAQ updated' })
})

// Delete FAQ (protected)
router.delete('/:id', authMiddleware, requireRole('owner', 'developer', 'admin'), (req: any, res) => {
  run('DELETE FROM faq WHERE id = ?', [req.params.id])
  res.json({ message: 'FAQ deleted' })
})

export default router
