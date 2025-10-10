import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-teal-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy trang</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Về trang chủ
          </Link>
        </Button>
      </div>
    </div>
  )
}
