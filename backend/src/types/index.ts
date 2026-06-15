export interface Training {
  id: string
  title: string
  type: 'VivaLearning' | 'TechTalk' | 'Huddle'
  url: string
  description: string
  durationMinutes: number
  tags: string[]
  week: 'Week1' | 'Week2' | 'Month1' | 'Ongoing'
  vivaLearningCourseId?: string
}

export interface TrainingEvent {
  id: string
  title: string
  eventDate: string
  meetingLink?: string
  recordingLink?: string
  trainingType: 'TechTalk' | 'Huddle'
  description?: string
}

export interface ProgressRecord {
  id: string
  userId: string
  trainingId: string
  status: 'NotStarted' | 'InProgress' | 'Completed'
  completedDate?: string
}

export interface NewHireProgress {
  userId: string
  displayName: string
  email: string
  totalTrainings: number
  completedTrainings: number
  progressRecords: ProgressRecord[]
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  jobTitle?: string
  isAdmin: boolean
}

/** Decoded JWT payload after validation */
export interface AuthenticatedUser {
  oid: string          // object ID = userId
  name: string
  preferred_username: string
  roles?: string[]
}
