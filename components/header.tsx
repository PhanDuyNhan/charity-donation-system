"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { authService } from "@/lib/auth"

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    window.location.href = "/"
  }

  const navItems = [
    { href: "/", label: "Trang chủ" },
    { href: "/du-an", label: "Dự án" },
    { href: "/su-kien", label: "Sự kiện" },
    { href: "/tin-tuc", label: "Tin tức" },
    { href: "/tinh-nguyen-vien", label: "Tình nguyện viên" },
    { href: "/lien-he", label: "Liên hệ" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Heart className="h-6 w-6 text-primary fill-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Quyên Góp Từ Thiện
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.vai_tro === "admin" && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin">Quản trị</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                {user.ho_ten}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/dang-nhap">Đăng nhập</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/dang-ky">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary py-2 ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t">
              {user ? (
                <>
                  {user.vai_tro === "admin" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/admin">Quản trị</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="justify-start gap-2">
                    <User className="h-4 w-4" />
                    {user.ho_ten}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start gap-2">
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dang-nhap">Đăng nhập</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/dang-ky">Đăng ký</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
