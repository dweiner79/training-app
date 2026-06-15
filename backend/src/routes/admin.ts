import { Router, Request, Response } from 'express'
import { requireAuth, requireAdmin } from '../middleware/authMiddleware'
import { getOboToken } from '../services/oboService'
import { getListItems } from '../services/graphService'
import type { AuthenticatedUser, NewHireProgress, ProgressRecord } from '../types'

export const adminRouter = Router()

interface SpProgressFields {
  UserId: string
  UserName: string
  UserEmail: string
  TrainingId: string
  Status: string
  CompletedDate?: string
}

interface SpTrainingFields {
  Title: string
}

adminRouter.get('/progress', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    void (req as Request & { user: AuthenticatedUser }).user
    const userToken = req.headers.authorization!.slice(7)
    const graphToken = await getOboToken(userToken)

    const [progressItems, trainingItems] = await Promise.all([
      getListItems<SpProgressFields>('progress', graphToken),
      getListItems<SpTrainingFields>('trainingCatalog', graphToken),
    ])

    const totalTrainings = trainingItems.length

    // Group progress by user
    const byUser = new Map<string, { records: ProgressRecord[]; displayName: string; email: string }>()

    for (const item of progressItems) {
      const { UserId, UserName, UserEmail, TrainingId, Status, CompletedDate } = item.fields
      if (!byUser.has(UserId)) {
        byUser.set(UserId, { records: [], displayName: UserName ?? UserId, email: UserEmail ?? '' })
      }
      byUser.get(UserId)!.records.push({
        id: item.id,
        userId: UserId,
        trainingId: TrainingId,
        status: Status as ProgressRecord['status'],
        completedDate: CompletedDate,
      })
    }

    const result: NewHireProgress[] = Array.from(byUser.entries()).map(([userId, data]) => ({
      userId,
      displayName: data.displayName,
      email: data.email,
      totalTrainings,
      completedTrainings: data.records.filter((r) => r.status === 'Completed').length,
      progressRecords: data.records,
    }))

    res.json(result)
  } catch (err) {
    console.error('GET /admin/progress error:', err)
    res.status(500).json({ error: 'Failed to fetch admin progress data' })
  }
})
