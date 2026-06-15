import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import type { AuthenticatedUser } from '../types'

const tenantId = process.env.AZURE_TENANT_ID!
const clientId = process.env.AZURE_CLIENT_ID!

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
})

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err || !key) return reject(err ?? new Error('Signing key not found'))
      resolve(key.getPublicKey())
    })
  })
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const decoded = jwt.decode(token, { complete: true })
    if (!decoded || typeof decoded === 'string') throw new Error('Invalid token')

    const signingKey = await getSigningKey(decoded.header)

    const payload = jwt.verify(token, signingKey, {
      audience: clientId,
      issuer: [
        `https://login.microsoftonline.com/${tenantId}/v2.0`,
        `https://sts.windows.net/${tenantId}/`,
      ],
    }) as AuthenticatedUser

    // Attach the decoded user to the request
    ;(req as Request & { user: AuthenticatedUser }).user = payload
    next()
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized — invalid token' })
  }
}

/** Require membership in the admin role (app role "Admin" assigned in Entra) */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as Request & { user?: AuthenticatedUser }).user
  if (!user?.roles?.includes('Admin')) {
    res.status(403).json({ error: 'Forbidden — admin role required' })
    return
  }
  next()
}
