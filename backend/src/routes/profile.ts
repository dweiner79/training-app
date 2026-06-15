import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/authMiddleware'
import { getOboToken } from '../services/oboService'
import { getMe, getMemberOf } from '../services/graphService'
import type { AuthenticatedUser, UserProfile } from '../types'

export const profileRouter = Router()

// Admin group ID — configure this in your Entra tenant and add to env if needed
const ADMIN_GROUP_ID = process.env.ADMIN_GROUP_ID ?? ''

profileRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user: AuthenticatedUser }).user
    const userToken = req.headers.authorization!.slice(7)
    const graphToken = await getOboToken(userToken)

    const [me, groups] = await Promise.all([
      getMe(graphToken),
      getMemberOf(graphToken),
    ])

    // Check admin via app role or Entra group membership
    const isAdminByRole = user.roles?.includes('Admin') ?? false
    const isAdminByGroup =
      ADMIN_GROUP_ID !== '' &&
      groups.value.some((g) => g.id === ADMIN_GROUP_ID)

    const profile: UserProfile = {
      id: me.id,
      displayName: me.displayName,
      email: me.mail ?? me.userPrincipalName,
      jobTitle: me.jobTitle,
      isAdmin: isAdminByRole || isAdminByGroup,
    }

    res.json(profile)
  } catch (err) {
    console.error('GET /profile/me error:', err)
    res.status(500).json({ error: 'Failed to fetch user profile' })
  }
})
