import apiClient from './apiClient'
import type {
  Training,
  TrainingEvent,
  ProgressRecord,
  NewHireProgress,
  VivaLearningAssignment,
  ChatMessage,
  UserProfile,
} from '../types'
import { mockTrainings, mockEvents, mockProgress, mockVivaAssignments } from './mockData'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

// ── Trainings ──────────────────────────────────────────────────────────────

export const getTrainings = (): Promise<Training[]> =>
  USE_MOCK
    ? Promise.resolve(mockTrainings)
    : apiClient.get<Training[]>('/trainings').then((r) => r.data)

// ── Events ─────────────────────────────────────────────────────────────────

export const getEvents = (): Promise<TrainingEvent[]> =>
  USE_MOCK
    ? Promise.resolve(mockEvents)
    : apiClient.get<TrainingEvent[]>('/events').then((r) => r.data)

// ── Progress ───────────────────────────────────────────────────────────────

let _mockProgress = { ...mockProgress, progressRecords: [...mockProgress.progressRecords] }

export const getMyProgress = (): Promise<NewHireProgress> =>
  USE_MOCK
    ? Promise.resolve(_mockProgress)
    : apiClient.get<NewHireProgress>('/progress/me').then((r) => r.data)

export const updateProgress = (
  trainingId: string,
  status: ProgressRecord['status']
): Promise<ProgressRecord> => {
  if (USE_MOCK) {
    const existing = _mockProgress.progressRecords.find((r) => r.trainingId === trainingId)
    const record: ProgressRecord = existing
      ? { ...existing, status }
      : { id: `p-${trainingId}`, userId: 'mock-user', trainingId, status }
    _mockProgress.progressRecords = _mockProgress.progressRecords.some((r) => r.trainingId === trainingId)
      ? _mockProgress.progressRecords.map((r) => (r.trainingId === trainingId ? record : r))
      : [..._mockProgress.progressRecords, record]
    return Promise.resolve(record)
  }
  return apiClient.patch<ProgressRecord>(`/progress/me/${trainingId}`, { status }).then((r) => r.data)
}

// ── Viva Learning ──────────────────────────────────────────────────────────

export const getVivaLearningAssignments = (): Promise<VivaLearningAssignment[]> =>
  USE_MOCK
    ? Promise.resolve(mockVivaAssignments)
    : apiClient.get<VivaLearningAssignment[]>('/viva-learning').then((r) => r.data)

// ── Chat ───────────────────────────────────────────────────────────────────

export const sendChatMessage = (
  messages: Pick<ChatMessage, 'role' | 'content'>[]
): Promise<ChatMessage> =>
  USE_MOCK
    ? Promise.resolve({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'This is a demo response. Connect the backend to enable AI chat.',
        timestamp: new Date().toISOString(),
      })
    : apiClient.post<ChatMessage>('/chat', { messages }).then((r) => r.data)

// ── User profile ───────────────────────────────────────────────────────────

export const getMyProfile = (): Promise<UserProfile> =>
  USE_MOCK
    ? Promise.resolve({ id: 'mock-user', displayName: 'New Hire', email: 'newhire@hlsw365.com', isAdmin: false })
    : apiClient.get<UserProfile>('/profile/me').then((r) => r.data)

// ── Admin ──────────────────────────────────────────────────────────────────

export const getAllNewHireProgress = (): Promise<NewHireProgress[]> =>
  USE_MOCK
    ? Promise.resolve([_mockProgress])
    : apiClient.get<NewHireProgress[]>('/admin/progress').then((r) => r.data)
