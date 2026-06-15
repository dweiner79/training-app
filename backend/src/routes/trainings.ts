import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/authMiddleware'
import { getOboToken } from '../services/oboService'
import { getListItems } from '../services/graphService'
import type { AuthenticatedUser, Training } from '../types'

export const trainingsRouter = Router()

interface SpTrainingFields {
  Title: string
  TrainingType: string
  URL: string
  Description: string
  DurationMinutes: number
  Tags: string
  WeekGroup: string
  VivaLearningCourseId?: string
}

trainingsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user: AuthenticatedUser }).user
    const authHeader = req.headers.authorization!
    const userToken = authHeader.slice(7)
    const graphToken = await getOboToken(userToken)

    const items = await getListItems<SpTrainingFields>('trainingCatalog', graphToken)

    const trainings: Training[] = items.map((item) => ({
      id: item.id,
      title: item.fields.Title,
      type: item.fields.TrainingType as Training['type'],
      url: item.fields.URL,
      description: item.fields.Description ?? '',
      durationMinutes: item.fields.DurationMinutes ?? 0,
      tags: item.fields.Tags ? item.fields.Tags.split(',').map((t) => t.trim()) : [],
      week: item.fields.WeekGroup as Training['week'],
      vivaLearningCourseId: item.fields.VivaLearningCourseId,
    }))

    // Suppress unused variable warning — user is verified by requireAuth
    void user
    res.json(trainings)
  } catch (err) {
    console.error('GET /trainings error:', err)
    res.status(500).json({ error: 'Failed to fetch trainings' })
  }
})
