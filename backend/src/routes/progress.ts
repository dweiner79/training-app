import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/authMiddleware'
import { getOboToken } from '../services/oboService'
import {
  getListItems,
  createListItem,
  updateListItem,
} from '../services/graphService'
import type { AuthenticatedUser, ProgressRecord, NewHireProgress, Training } from '../types'

export const progressRouter = Router()

interface SpProgressFields {
  UserId: string
  TrainingId: string
  Status: string
  CompletedDate?: string
}

interface SpTrainingFields {
  Title: string
}

progressRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user: AuthenticatedUser }).user
    const userToken = req.headers.authorization!.slice(7)
    const graphToken = await getOboToken(userToken)

    const [progressItems, trainingItems] = await Promise.all([
      getListItems<SpProgressFields>('progress', graphToken, `fields/UserId eq '${user.oid}'`),
      getListItems<SpTrainingFields>('trainingCatalog', graphToken),
    ])

    const progressRecords: ProgressRecord[] = progressItems.map((item) => ({
      id: item.id,
      userId: item.fields.UserId,
      trainingId: item.fields.TrainingId,
      status: item.fields.Status as ProgressRecord['status'],
      completedDate: item.fields.CompletedDate,
    }))

    const totalTrainings = trainingItems.length
    const completedTrainings = progressRecords.filter((r) => r.status === 'Completed').length

    const result: NewHireProgress = {
      userId: user.oid,
      displayName: user.name,
      email: user.preferred_username,
      totalTrainings,
      completedTrainings,
      progressRecords,
    }

    res.json(result)
  } catch (err) {
    console.error('GET /progress/me error:', err)
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})

progressRouter.patch('/me/:trainingId', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user: AuthenticatedUser }).user
    const { trainingId } = req.params
    const { status } = req.body as { status: ProgressRecord['status'] }

    if (!['NotStarted', 'InProgress', 'Completed'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value' })
      return
    }

    const userToken = req.headers.authorization!.slice(7)
    const graphToken = await getOboToken(userToken)

    // Find existing record
    const existing = await getListItems<SpProgressFields>(
      'progress',
      graphToken,
      `fields/UserId eq '${user.oid}' and fields/TrainingId eq '${trainingId}'`
    )

    const fields: SpProgressFields = {
      UserId: user.oid,
      TrainingId: trainingId,
      Status: status,
      CompletedDate: status === 'Completed' ? new Date().toISOString() : undefined,
    }

    let recordId: string

    if (existing.length > 0) {
      recordId = existing[0].id
      await updateListItem('progress', graphToken, recordId, fields)
    } else {
      const created = await createListItem<SpProgressFields>('progress', graphToken, fields)
      recordId = created.id
    }

    const result: ProgressRecord = {
      id: recordId,
      userId: user.oid,
      trainingId,
      status,
      completedDate: fields.CompletedDate,
    }

    res.json(result)
  } catch (err) {
    console.error('PATCH /progress/me/:trainingId error:', err)
    res.status(500).json({ error: 'Failed to update progress' })
  }
})
