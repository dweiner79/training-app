/**
 * SharePoint List Provisioning Script
 *
 * Run once to create the required SharePoint lists in your target site.
 * Requires: Node.js, and a .env file in the backend/ directory.
 *
 * Usage (from backend/ directory):
 *   npx ts-node scripts/provisionSharePoint.ts
 *
 * Prerequisites:
 *   - SHAREPOINT_SITE_ID in .env
 *   - An app-only token with Sites.Manage.All (or run as a user with site admin rights)
 */
import 'dotenv/config'
import axios from 'axios'

const TENANT_ID = process.env.AZURE_TENANT_ID!
const CLIENT_ID = process.env.AZURE_CLIENT_ID!
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!
const SITE_ID = process.env.SHAREPOINT_SITE_ID!

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

async function getAppToken(): Promise<string> {
  const res = await axios.post<{ access_token: string }>(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  )
  return res.data.access_token
}

interface ColumnDef {
  name: string
  text?: Record<string, unknown>
  number?: Record<string, unknown>
  dateTime?: Record<string, unknown>
  choice?: { choices: string[] }
}

async function createList(token: string, displayName: string, columns: ColumnDef[]) {
  const client = axios.create({
    baseURL: GRAPH_BASE,
    headers: { Authorization: `Bearer ${token}` },
  })

  // Create the list
  const listRes = await client.post<{ id: string }>(`/sites/${SITE_ID}/lists`, {
    displayName,
    columns,
    list: { template: 'genericList' },
  })

  console.log(`✓ Created list "${displayName}" (id: ${listRes.data.id})`)
  console.log(`  → Add this to backend/.env: ${displayName.replace(/\s/g, '_').toUpperCase()}_LIST_ID=${listRes.data.id}`)
}

async function main() {
  console.log('Provisioning SharePoint lists…\n')
  const token = await getAppToken()

  await createList(token, 'TrainingCatalog', [
    { name: 'TrainingType', choice: { choices: ['VivaLearning', 'TechTalk', 'Huddle'] } },
    { name: 'URL', text: {} },
    { name: 'Description', text: {} },
    { name: 'DurationMinutes', number: {} },
    { name: 'Tags', text: {} },
    { name: 'WeekGroup', choice: { choices: ['Week1', 'Week2', 'Month1', 'Ongoing'] } },
    { name: 'VivaLearningCourseId', text: {} },
  ])

  await createList(token, 'TrainingEvents', [
    { name: 'EventDate', dateTime: {} },
    { name: 'MeetingLink', text: {} },
    { name: 'RecordingLink', text: {} },
    { name: 'TrainingType', choice: { choices: ['TechTalk', 'Huddle'] } },
    { name: 'Description', text: {} },
  ])

  await createList(token, 'NewHireProgress', [
    { name: 'UserId', text: {} },
    { name: 'UserName', text: {} },
    { name: 'UserEmail', text: {} },
    { name: 'TrainingId', text: {} },
    { name: 'Status', choice: { choices: ['NotStarted', 'InProgress', 'Completed'] } },
    { name: 'CompletedDate', dateTime: {} },
  ])

  console.log('\nDone! Copy the list IDs above into your backend/.env file.')
}

main().catch((err) => {
  console.error('Provisioning failed:', err?.response?.data ?? err)
  process.exit(1)
})
