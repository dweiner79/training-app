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

// ── Trainings ──────────────────────────────────────────────────────────────

export const getTrainings = (): Promise<Training[]> =>
  apiClient.get<Training[]>('/trainings').then((r) => r.data)

// ── Events ─────────────────────────────────────────────────────────────────

export const getEvents = (): Promise<TrainingEvent[]> =>
  apiClient.get<TrainingEvent[]>('/events').then((r) => r.data)

// ── Progress ───────────────────────────────────────────────────────────────

export const getMyProgress = (): Promise<NewHireProgress> =>
  apiClient.get<NewHireProgress>('/progress/me').then((r) => r.data)

export const updateProgress = (
  trainingId: string,
  status: ProgressRecord['status']
): Promise<ProgressRecord> =>
  apiClient
    .patch<ProgressRecord>(`/progress/me/${trainingId}`, { status })
    .then((r) => r.data)

// ── Viva Learning ──────────────────────────────────────────────────────────

export const getVivaLearningAssignments = (): Promise<VivaLearningAssignment[]> =>
  apiClient.get<VivaLearningAssignment[]>('/viva-learning').then((r) => r.data)

// ── Chat ───────────────────────────────────────────────────────────────────

export const sendChatMessage = (
  messages: Pick<ChatMessage, 'role' | 'content'>[]
): Promise<ChatMessage> =>
  apiClient.post<ChatMessage>('/chat', { messages }).then((r) => r.data)

// ── User profile ───────────────────────────────────────────────────────────

export const getMyProfile = (): Promise<UserProfile> =>
  apiClient.get<UserProfile>('/profile/me').then((r) => r.data)

// ── Admin ──────────────────────────────────────────────────────────────────

export const getAllNewHireProgress = (): Promise<NewHireProgress[]> =>
  apiClient.get<NewHireProgress[]>('/admin/progress').then((r) => r.data)
