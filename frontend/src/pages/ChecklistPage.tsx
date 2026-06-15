import { useEffect, useState } from 'react'
import { getTrainings, getMyProgress, getVivaLearningAssignments, updateProgress } from '../services/trainingApi'
import type { Training, NewHireProgress, VivaLearningAssignment } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

type WeekGroup = 'Week1' | 'Week2' | 'Month1' | 'Ongoing'

const WEEK_LABELS: Record<WeekGroup, string> = {
  Week1: 'Week 1 — Getting Started',
  Week2: 'Week 2 — Building Knowledge',
  Month1: 'First Month',
  Ongoing: 'Ongoing',
}

const TYPE_BADGE: Record<Training['type'], string> = {
  VivaLearning: 'badge-viva',
  TechTalk: 'badge-techtalk',
  Huddle: 'badge-huddle',
}

const STATUS_COLOR: Record<string, string> = {
  Completed: 'text-green-600',
  InProgress: 'text-yellow-600',
  NotStarted: 'text-gray-400',
}

export default function ChecklistPage() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [progress, setProgress] = useState<NewHireProgress | null>(null)
  const [vivaAssignments, setVivaAssignments] = useState<VivaLearningAssignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTrainings(), getMyProgress(), getVivaLearningAssignments()])
      .then(([t, p, v]) => {
        setTrainings(t)
        setProgress(p)
        setVivaAssignments(v)
      })
      .finally(() => setLoading(false))
  }, [])

  const getStatus = (trainingId: string) => {
    const record = progress?.progressRecords.find((r) => r.trainingId === trainingId)
    return record?.status ?? 'NotStarted'
  }

  const handleStatusToggle = async (training: Training) => {
    const current = getStatus(training.id)
    const next = current === 'Completed' ? 'NotStarted' : 'Completed'
    const updated = await updateProgress(training.id, next)
    setProgress((prev) =>
      prev
        ? {
            ...prev,
            completedTrainings: prev.completedTrainings + (next === 'Completed' ? 1 : -1),
            progressRecords: prev.progressRecords.some((r) => r.trainingId === training.id)
              ? prev.progressRecords.map((r) => (r.trainingId === training.id ? updated : r))
              : [...prev.progressRecords, updated],
          }
        : prev
    )
  }

  const vivaStatusFor = (training: Training) =>
    vivaAssignments.find((a) => a.id === training.vivaLearningCourseId)

  if (loading) return <LoadingSpinner />

  const weeks: WeekGroup[] = ['Week1', 'Week2', 'Month1', 'Ongoing']
  const completed = progress?.completedTrainings ?? 0
  const total = progress?.totalTrainings ?? trainings.length

  return (
    <div className="space-y-8">
      {/* Progress summary */}
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Your Onboarding Roadmap</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track your required trainings and mark them complete as you go.
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{completed}<span className="text-gray-400 text-xl font-normal">/{total}</span></div>
          <div className="text-xs text-gray-500">Completed</div>
          <div className="mt-2 w-36 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Training groups */}
      {weeks.map((week) => {
        const items = trainings.filter((t) => t.week === week)
        if (items.length === 0) return null
        return (
          <section key={week}>
            <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>{WEEK_LABELS[week]}</span>
              <span className="text-xs font-normal text-gray-400">
                {items.filter((t) => getStatus(t.id) === 'Completed').length}/{items.length} done
              </span>
            </h2>
            <div className="space-y-2">
              {items.map((training) => {
                const status = getStatus(training.id)
                const viva = vivaStatusFor(training)
                return (
                  <div
                    key={training.id}
                    className={`card flex items-start gap-4 ${status === 'Completed' ? 'opacity-70' : ''}`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => handleStatusToggle(training)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        status === 'Completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                      aria-label={status === 'Completed' ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {status === 'Completed' && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium text-sm ${status === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {training.title}
                        </span>
                        <span className={TYPE_BADGE[training.type]}>{training.type}</span>
                        {viva && (
                          <span className="badge bg-orange-100 text-orange-700">
                            {viva.percentComplete ?? 0}% in Viva
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{training.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400">{training.durationMinutes} min</span>
                        {training.tags.map((tag) => (
                          <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                        ))}
                        <span className={`text-xs font-medium ${STATUS_COLOR[status]}`}>{status}</span>
                      </div>
                    </div>

                    {/* Open link */}
                    <a
                      href={training.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-shrink-0 text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap"
                    >
                      Open →
                    </a>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
