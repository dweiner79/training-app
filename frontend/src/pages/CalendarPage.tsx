import { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import { getEvents } from '../services/trainingApi'
import type { TrainingEvent } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

const TYPE_COLOR: Record<TrainingEvent['trainingType'], string> = {
  TechTalk: '#2563eb',
  Huddle: '#16a34a',
}

export default function CalendarPage() {
  const [events, setEvents] = useState<TrainingEvent[]>([])
  const [selected, setSelected] = useState<TrainingEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const calendarRef = useRef(null)

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.eventDate,
    backgroundColor: TYPE_COLOR[e.trainingType],
    borderColor: TYPE_COLOR[e.trainingType],
    extendedProps: e,
  }))

  const handleEventClick = (info: EventClickArg) => {
    setSelected(info.event.extendedProps as TrainingEvent)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Training Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upcoming Tech Talks and Friday Huddles</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            Tech Talk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
            Friday Huddle
          </span>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          eventClassNames="cursor-pointer text-xs"
        />
      </div>

      {/* Event detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className={`badge ${selected.trainingType === 'TechTalk' ? 'badge-techtalk' : 'badge-huddle'} mb-2`}
                >
                  {selected.trainingType}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{selected.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(selected.eventDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 ml-2"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {selected.description && (
              <p className="text-sm text-gray-600 mb-4">{selected.description}</p>
            )}
            <div className="flex gap-3">
              {selected.meetingLink && (
                <a href={selected.meetingLink} target="_blank" rel="noreferrer" className="btn-primary text-sm flex-1 text-center">
                  Join Meeting
                </a>
              )}
              {selected.recordingLink && (
                <a href={selected.recordingLink} target="_blank" rel="noreferrer" className="btn-secondary text-sm flex-1 text-center">
                  Watch Recording
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
