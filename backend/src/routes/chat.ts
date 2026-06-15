import { Router, Request, Response } from 'express'
import { AzureOpenAI } from '@azure/openai'
import { requireAuth } from '../middleware/authMiddleware'
import type { AuthenticatedUser } from '../types'

export const chatRouter = Router()

const openaiClient = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? '2024-10-21',
})

const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT ?? 'gpt-4o'
const SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT!
const SEARCH_KEY = process.env.AZURE_SEARCH_KEY!
const SEARCH_INDEX = process.env.AZURE_SEARCH_INDEX ?? 'hls-trainings'

const SYSTEM_PROMPT = `You are a helpful training assistant for HLS new hires.
Your role is to help employees navigate their required onboarding trainings, including:
- Viva Learning courses assigned by the organization
- Tech Talk sessions (bi-weekly technical deep dives)
- Friday Huddle sessions (weekly team updates and knowledge sharing)

When a user asks about their trainings, provide clear and specific guidance.
If you reference a course or session, mention where they can find it (Viva Learning, the Calendar page, or the Library page).
Always be encouraging and supportive of the new hire's learning journey.`

interface ChatMessageInput {
  role: 'user' | 'assistant'
  content: string
}

chatRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user: AuthenticatedUser }).user
    const { messages } = req.body as { messages: ChatMessageInput[] }

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' })
      return
    }

    // Validate message roles to prevent injection
    const allowedRoles = new Set(['user', 'assistant'])
    for (const msg of messages) {
      if (!allowedRoles.has(msg.role) || typeof msg.content !== 'string') {
        res.status(400).json({ error: 'Invalid message format' })
        return
      }
    }

    const hasSearchConfig =
      SEARCH_ENDPOINT && SEARCH_KEY && SEARCH_INDEX

    // Build request — include RAG data source when Azure AI Search is configured
    const requestBody = {
      model: DEPLOYMENT,
      messages: [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
      max_tokens: 800,
      temperature: 0.4,
      ...(hasSearchConfig && {
        data_sources: [
          {
            type: 'azure_search',
            parameters: {
              endpoint: SEARCH_ENDPOINT,
              index_name: SEARCH_INDEX,
              authentication: {
                type: 'api_key',
                key: SEARCH_KEY,
              },
              query_type: 'vector_semantic_hybrid',
              semantic_configuration: 'default',
            },
          },
        ],
      }),
    }

    // @ts-expect-error — data_sources is an Azure OpenAI extension not in the base types
    const completion = await openaiClient.chat.completions.create(requestBody)

    const replyContent =
      completion.choices[0]?.message?.content ?? 'Sorry, I could not generate a response.'

    res.json({
      id: `${Date.now()}-${user.oid.slice(0, 6)}`,
      role: 'assistant',
      content: replyContent,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('POST /chat error:', err)
    res.status(500).json({ error: 'Failed to process chat request' })
  }
})
