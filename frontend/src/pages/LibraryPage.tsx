import { useEffect, useState } from 'react'
import { getEvents } from '../services/trainingApi'
import type { TrainingEvent } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

type FilterType = 'All' | 'TechTalk' | 'Huddle'

export default function LibraryPage() {
  const [events, setEvents] = useState<TrainingEvent[]>([])
  const [filter, setFilter] = useState<FilterType>('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEvents()
      .then((all) => {
        // Only show past events that have a recording
        const past = all.filter(
          (e) => new Date(e.eventDate) < new Date() && e.recordingLink
        )
        setEvents(past)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter((e) => {
    const matchType = filter === 'All' || e.trainingType === filter
    const matchSearch =
      search.trim() === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description ?? '').toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Recording Library</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Past Tech Talks and Friday Huddle recordings
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Search recordings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        {(['All', 'TechTalk', 'Huddle'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'All' ? 'All' : f === 'TechTalk' ? 'Tech Talks' : 'Friday Huddles'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No recordings found</p>
          <p className="text-sm mt-1">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <div key={event.id} className="card hover:shadow-md transition-shadow flex flex-col">
              {/* Thumbnail placeholder */}
              <div className="bg-gray-100 rounded h-32 mb-3 flex items-center justify-center overflow-hidden">
                <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                  <span
                    className={`badge flex-shrink-0 ${
                      event.trainingType === 'TechTalk' ? 'badge-techtalk' : 'badge-huddle'
                    }`}
                  >
                    {event.trainingType}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{event.description}</p>
                )}
                <p className="text-xs text-gray-400">
                  {new Date(event.eventDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <a
                href={event.recordingLink!}
                target="_blank"
                rel="noreferrer"
                className="mt-3 btn-primary text-sm text-center"
              >
                Watch Recording
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
