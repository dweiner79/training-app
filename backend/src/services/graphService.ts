import axios from 'axios'

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

/** Create an axios instance pre-configured with a bearer token for Graph calls */
function graphClient(token: string) {
  return axios.create({
    baseURL: GRAPH_BASE,
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ── SharePoint List helpers ────────────────────────────────────────────────

interface SpListItem<T = Record<string, unknown>> {
  id: string
  fields: T
}

interface SpListResponse<T> {
  value: SpListItem<T>[]
}

const siteId = process.env.SHAREPOINT_SITE_ID!
const LISTS = {
  trainingCatalog: process.env.SHAREPOINT_TRAINING_CATALOG_LIST_ID!,
  trainingEvents: process.env.SHAREPOINT_TRAINING_EVENTS_LIST_ID!,
  progress: process.env.SHAREPOINT_PROGRESS_LIST_ID!,
}

function listItemsUrl(listId: string) {
  return `/sites/${siteId}/lists/${listId}/items?expand=fields`
}

function listItemUrl(listId: string, itemId: string) {
  return `/sites/${siteId}/lists/${listId}/items/${itemId}`
}

export async function getListItems<T>(
  listKey: keyof typeof LISTS,
  token: string,
  filter?: string
): Promise<SpListItem<T>[]> {
  const client = graphClient(token)
  let url = listItemsUrl(LISTS[listKey])
  if (filter) url += `&$filter=${encodeURIComponent(filter)}`
  const res = await client.get<SpListResponse<T>>(url)
  return res.data.value
}

export async function createListItem<T>(
  listKey: keyof typeof LISTS,
  token: string,
  fields: Partial<T>
): Promise<SpListItem<T>> {
  const client = graphClient(token)
  const res = await client.post<SpListItem<T>>(
    `/sites/${siteId}/lists/${LISTS[listKey]}/items`,
    { fields }
  )
  return res.data
}

export async function updateListItem<T>(
  listKey: keyof typeof LISTS,
  token: string,
  itemId: string,
  fields: Partial<T>
): Promise<void> {
  const client = graphClient(token)
  await client.patch(listItemUrl(LISTS[listKey], itemId), { fields })
}

// ── User profile helpers ───────────────────────────────────────────────────

export interface GraphUser {
  id: string
  displayName: string
  mail: string
  userPrincipalName: string
  jobTitle?: string
}

export async function getMe(token: string): Promise<GraphUser> {
  const res = await graphClient(token).get<GraphUser>('/me?$select=id,displayName,mail,userPrincipalName,jobTitle')
  return res.data
}

export interface GraphGroupMembership {
  value: Array<{ id: string; displayName: string }>
}

export async function getMemberOf(token: string): Promise<GraphGroupMembership> {
  const res = await graphClient(token).get<GraphGroupMembership>('/me/memberOf?$select=id,displayName')
  return res.data
}

// ── Viva Learning helpers ──────────────────────────────────────────────────

export interface VivaAssignment {
  id: string
  learningCourseActivityId?: string
  learningContentId?: string
  displayName?: string
  courseUrl?: string
  assignedDateTime?: string
  dueDateTime?: string
  status?: string
  percentComplete?: number
}

export async function getVivaLearningActivities(token: string): Promise<VivaAssignment[]> {
  const client = graphClient(token)
  const res = await client.get<{ value: VivaAssignment[] }>(
    '/me/employeeExperience/learningCourseActivities'
  )
  return res.data.value
}

// ── Users list (admin use) ─────────────────────────────────────────────────

export async function listGroupMembers(token: string, groupId: string): Promise<GraphUser[]> {
  const res = await graphClient(token).get<{ value: GraphUser[] }>(
    `/groups/${groupId}/members?$select=id,displayName,mail,userPrincipalName,jobTitle`
  )
  return res.data.value
}
