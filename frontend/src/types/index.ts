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
  eventDate: string        // ISO 8601
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

export interface VivaLearningAssignment {
  id: string
  courseTitle: string
  courseUrl: string
  assignedDate: string
  dueDate?: string
  status: 'NotStarted' | 'InProgress' | 'Completed'
  percentComplete?: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface UserProfile {
  id: string
  displayName: string
  email: string
  jobTitle?: string
  isAdmin: boolean
}
