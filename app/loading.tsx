export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent mb-4"></div>
        <p className="text-gray-600 font-medium">Đang tải...</p>
      </div>
    </div>
  )
}
