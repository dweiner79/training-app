import { useEffect, useState } from 'react'
import { getAllNewHireProgress } from '../services/trainingApi'
import type { NewHireProgress } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'

export default function AdminDashboardPage() {
  const [data, setData] = useState<NewHireProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllNewHireProgress()
      .then(setData)
      .catch(() => setError('You do not have permission to view this page, or an error occurred.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    )
  }

  const filtered = data.filter(
    (row) =>
      search.trim() === '' ||
      row.displayName.toLowerCase().includes(search.toLowerCase()) ||
      row.email.toLowerCase().includes(search.toLowerCase())
  )

  const avgCompletion =
    data.length > 0
      ? Math.round(data.reduce((sum, r) => sum + (r.completedTrainings / Math.max(r.totalTrainings, 1)) * 100, 0) / data.length)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">New hire training completion overview</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{data.length}</div>
          <div className="text-xs text-gray-500 mt-1">New Hires</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">
            {data.filter((r) => r.completedTrainings === r.totalTrainings && r.totalTrainings > 0).length}
          </div>
          <div className="text-xs text-gray-500 mt-1">All Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600">{avgCompletion}%</div>
          <div className="text-xs text-gray-500 mt-1">Avg Completion</div>
        </div>
      </div>

      {/* Search + table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((row) => {
                const pct = row.totalTrainings > 0
                  ? Math.round((row.completedTrainings / row.totalTrainings) * 100)
                  : 0
                return (
                  <tr key={row.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.displayName}</td>
                    <td className="px-4 py-3 text-gray-500">{row.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {row.completedTrainings}/{row.totalTrainings}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          pct === 100
                            ? 'bg-green-100 text-green-700'
                            : pct > 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {pct}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No results found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
