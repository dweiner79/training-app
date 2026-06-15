interface Props {
  fullScreen?: boolean
}

export default function LoadingSpinner({ fullScreen }: Props) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">{content}</div>
    )
  }

  return <div className="flex items-center justify-center py-12">{content}</div>
}
