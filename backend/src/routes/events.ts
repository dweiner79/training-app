import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/authMiddleware'
import { getOboToken } from '../services/oboService'
import { getListItems } from '../services/graphService'
import type { AuthenticatedUser, TrainingEvent } from '../types'

export const eventsRouter = Router()

interface SpEventFields {
  Title: string
  EventDate: string
  MeetingLink?: string
  RecordingLink?: string
  TrainingType: string
  Description?: string
}

eventsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user: AuthenticatedUser }).user
    const userToken = req.headers.authorization!.slice(7)
    const graphToken = await getOboToken(userToken)

    const items = await getListItems<SpEventFields>('trainingEvents', graphToken)

    const events: TrainingEvent[] = items.map((item) => ({
      id: item.id,
      title: item.fields.Title,
      eventDate: item.fields.EventDate,
      meetingLink: item.fields.MeetingLink,
      recordingLink: item.fields.RecordingLink,
      trainingType: item.fields.TrainingType as TrainingEvent['trainingType'],
      description: item.fields.Description,
    }))

    void user
    res.json(events)
  } catch (err) {
    console.error('GET /events error:', err)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})
