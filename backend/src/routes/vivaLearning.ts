import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/authMiddleware'
import { getOboToken } from '../services/oboService'
import { getVivaLearningActivities } from '../services/graphService'
import type { AuthenticatedUser } from '../types'

export const vivaLearningRouter = Router()

vivaLearningRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    void (req as Request & { user: AuthenticatedUser }).user
    const userToken = req.headers.authorization!.slice(7)
    const graphToken = await getOboToken(userToken)

    const activities = await getVivaLearningActivities(graphToken)

    const result = activities.map((a) => ({
      id: a.id,
      courseTitle: a.displayName ?? 'Untitled Course',
      courseUrl: a.courseUrl ?? '',
      assignedDate: a.assignedDateTime ?? '',
      dueDate: a.dueDateTime,
      status: mapStatus(a.status),
      percentComplete: a.percentComplete,
    }))

    res.json(result)
  } catch (err) {
    console.error('GET /viva-learning error:', err)
    res.status(500).json({ error: 'Failed to fetch Viva Learning assignments' })
  }
})

function mapStatus(s?: string): 'NotStarted' | 'InProgress' | 'Completed' {
  if (!s) return 'NotStarted'
  const lower = s.toLowerCase()
  if (lower.includes('complete')) return 'Completed'
  if (lower.includes('progress') || lower.includes('start')) return 'InProgress'
  return 'NotStarted'
}
