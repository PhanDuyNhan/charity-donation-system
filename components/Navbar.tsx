"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { usePathname } from "next/navigation" // 👈 thêm dòng này

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname() // 👈 lấy đường dẫn hiện tại

  // 👇 Nếu đang ở trang admin thì không hiển thị navbar
  if (pathname.startsWith("/admin")) {
    return null
  }

  const handleLogout = () => {
    logout()
    window.location.href = "/" // reload lại để cập nhật header
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-8 w-8 text-(--color-primary) fill-(--color-primary)" />
          <span className="text-xl font-bold text-(--color-foreground)">Từ Thiện Việt</span>
        </Link>

        {/* Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/du-an" className="text-sm font-medium hover:text-(--color-primary) transition-colors">
            Dự Án
          </Link>
          <Link href="/su-kien" className="text-sm font-medium hover:text-(--color-primary) transition-colors">
            Sự Kiện
          </Link>
          <Link href="/tin-tuc" className="text-sm font-medium hover:text-(--color-primary) transition-colors">
            Tin Tức
          </Link>
          <Link href="/lien-he" className="text-sm font-medium hover:text-(--color-primary) transition-colors">
            Liên Hệ
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-gray-700">Xin chào, {user.ten}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Đăng Xuất
              </Button>
            </>
          ) : (
            <>
              <Link href="/dang-nhap">
                <Button variant="ghost" size="sm">
                  Đăng Nhập
                </Button>
              </Link>
              <Link href="/dang-ky">
                <Button size="sm" className="bg-(--color-primary) hover:bg-(--color-primary-hover)">
                  Đăng Ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
