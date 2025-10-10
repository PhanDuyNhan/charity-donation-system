"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50">
      <div className="text-center px-4 max-w-md">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Đã có lỗi xảy ra</h2>
        <p className="text-gray-600 mb-8">Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.</p>
        <Button onClick={reset} size="lg" className="bg-orange-500 hover:bg-orange-600">
          Thử lại
        </Button>
      </div>
    </div>
  )
}
