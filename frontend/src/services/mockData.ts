import type { Training, TrainingEvent, NewHireProgress, VivaLearningAssignment } from '../types'

export const mockTrainings: Training[] = [
  {
    id: 't1',
    title: 'New Hire Orientation',
    type: 'VivaLearning',
    url: 'https://www.microsoft.com',
    description: 'Welcome to the team! Get started with company culture, values, and your first steps.',
    durationMinutes: 60,
    tags: ['Orientation', 'Culture'],
    week: 'Week1',
  },
  {
    id: 't2',
    title: 'Security & Compliance Basics',
    type: 'VivaLearning',
    url: 'https://www.microsoft.com',
    description: 'Learn about data handling, security policies, and compliance requirements.',
    durationMinutes: 45,
    tags: ['Security', 'Compliance'],
    week: 'Week1',
  },
  {
    id: 't3',
    title: 'Team Tools & Processes',
    type: 'VivaLearning',
    url: 'https://www.microsoft.com',
    description: 'An overview of the tools, workflows, and communication practices used by the HLS team.',
    durationMinutes: 30,
    tags: ['Tools', 'Process'],
    week: 'Week1',
  },
  {
    id: 't4',
    title: 'HLS Architecture Overview',
    type: 'TechTalk',
    url: 'https://www.microsoft.com',
    description: 'Deep dive into the HLS platform architecture and key technical components.',
    durationMinutes: 60,
    tags: ['Architecture', 'Technical'],
    week: 'Week2',
  },
  {
    id: 't5',
    title: 'Azure Fundamentals',
    type: 'VivaLearning',
    url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/',
    description: 'Core concepts of Microsoft Azure cloud services.',
    durationMinutes: 120,
    tags: ['Azure', 'Cloud'],
    week: 'Week2',
  },
  {
    id: 't6',
    title: 'Friday Huddle — Team Intro',
    type: 'Huddle',
    url: 'https://www.microsoft.com',
    description: 'Weekly team sync and knowledge sharing session.',
    durationMinutes: 30,
    tags: ['Team', 'Sync'],
    week: 'Week2',
  },
  {
    id: 't7',
    title: 'Customer Engagement Best Practices',
    type: 'VivaLearning',
    url: 'https://www.microsoft.com',
    description: 'How to effectively engage with customers and deliver value.',
    durationMinutes: 45,
    tags: ['Customer', 'Sales'],
    week: 'Month1',
  },
  {
    id: 't8',
    title: 'Advanced Technical Deep Dive',
    type: 'TechTalk',
    url: 'https://www.microsoft.com',
    description: 'Advanced topics on the HLS technical stack and product roadmap.',
    durationMinutes: 90,
    tags: ['Technical', 'Advanced'],
    week: 'Month1',
  },
  {
    id: 't9',
    title: 'Weekly Friday Huddle',
    type: 'Huddle',
    url: 'https://www.microsoft.com',
    description: 'Recurring weekly team sync, Q&A, and updates.',
    durationMinutes: 30,
    tags: ['Team', 'Recurring'],
    week: 'Ongoing',
  },
]

const today = new Date()
const nextMonday = new Date(today)
nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7))
const nextFriday = new Date(today)
nextFriday.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7 || 7))
const lastFriday = new Date(today)
lastFriday.setDate(today.getDate() - ((today.getDay() + 2) % 7))
const twoWeeksAgo = new Date(today)
twoWeeksAgo.setDate(today.getDate() - 14)

export const mockEvents: TrainingEvent[] = [
  {
    id: 'e1',
    title: 'Tech Talk: Azure AI Services',
    eventDate: nextMonday.toISOString(),
    meetingLink: 'https://teams.microsoft.com',
    trainingType: 'TechTalk',
    description: 'Overview of Azure AI services and how we use them in HLS products.',
  },
  {
    id: 'e2',
    title: 'Friday Huddle',
    eventDate: nextFriday.toISOString(),
    meetingLink: 'https://teams.microsoft.com',
    trainingType: 'Huddle',
    description: 'Weekly team sync, updates, and open Q&A.',
  },
  {
    id: 'e3',
    title: 'Tech Talk: Copilot Integration Patterns',
    eventDate: lastFriday.toISOString(),
    recordingLink: 'https://www.microsoft.com',
    trainingType: 'TechTalk',
    description: 'Best practices for integrating Microsoft Copilot into enterprise workflows.',
  },
  {
    id: 'e4',
    title: 'Friday Huddle — Recorded',
    eventDate: twoWeeksAgo.toISOString(),
    recordingLink: 'https://www.microsoft.com',
    trainingType: 'Huddle',
    description: 'Team updates, project status, and knowledge sharing from two weeks ago.',
  },
]

export const mockProgress: NewHireProgress = {
  userId: 'mock-user',
  displayName: 'New Hire',
  email: 'newhire@hlsw365.com',
  totalTrainings: mockTrainings.length,
  completedTrainings: 2,
  progressRecords: [
    { id: 'p1', userId: 'mock-user', trainingId: 't1', status: 'Completed', completedDate: new Date().toISOString() },
    { id: 'p2', userId: 'mock-user', trainingId: 't2', status: 'Completed', completedDate: new Date().toISOString() },
    { id: 'p3', userId: 'mock-user', trainingId: 't3', status: 'InProgress' },
  ],
}

export const mockVivaAssignments: VivaLearningAssignment[] = [
  {
    id: 'v1',
    courseTitle: 'Microsoft Security Fundamentals',
    courseUrl: 'https://learn.microsoft.com',
    assignedDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'InProgress',
    percentComplete: 40,
  },
  {
    id: 'v2',
    courseTitle: 'Azure Well-Architected Framework',
    courseUrl: 'https://learn.microsoft.com',
    assignedDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'NotStarted',
    percentComplete: 0,
  },
  {
    id: 'v3',
    courseTitle: 'Inclusive Hiring Practices',
    courseUrl: 'https://learn.microsoft.com',
    assignedDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed',
    percentComplete: 100,
  },
]
