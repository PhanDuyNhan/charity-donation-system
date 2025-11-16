"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, isAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FolderKanban,
  DollarSign,
  Users,
  Calendar,
  Newspaper,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/dang-nhap")
      } else if (!isAdmin(user)) {
        router.push("/")
      } else {
        setIsChecking(false)
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [user, router])

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-600 text-sm">
        Đang tải dữ liệu người dùng...
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "Tổng Quan", href: "/admin" },
    { icon: FolderKanban, label: "Quản Lý Dự Án", href: "/admin/du-an" },
    { icon: FolderKanban, label: "Quản Lý Danh Mục", href: "/admin/danh-muc-du-an" },
    { icon: DollarSign, label: "Quản Lý Quyên Góp", href: "/admin/quyen-gop" },
    { icon: Users, label: "Quản Lý Người Dùng", href: "/admin/nguoi-dung" },
    { icon: Users, label: "Tình Nguyện Viên", href: "/admin/tinh-nguyen-vien" },
    { icon: Calendar, label: "Quản Lý Sự Kiện", href: "/admin/su-kien" },
    { icon: Newspaper, label: "Quản Lý Tin Tức", href: "/admin/tin-tuc" },
    { icon: FileText, label: "Báo Cáo Tài Chính", href: "/admin/bao-cao" },
    { icon: Settings, label: "Cài Đặt", href: "/admin/cai-dat" },
  ]

  return (
    <div className="admin-layout min-h-screen bg-(--color-admin-bg)">
      {/* Sidebar */}
      <aside
        className={`admin-sidebar fixed left-0 top-0 z-40 h-screen w-64 border-r transition-transform bg-(--color-admin-sidebar) ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-(--color-admin-border) px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-(--color-primary) fill-(--color-primary)" />
              <span className="font-bold text-(--color-admin-text)">Quản trị viên</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-(--color-admin-text)"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-(--color-admin-text-secondary) hover:bg-(--color-admin-bg-hover) hover:text-(--color-admin-text) transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          <div className="border-t border-(--color-admin-border) p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary) text-white font-semibold">
                {user?.ho?.charAt(0)}
                {user?.ten?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--color-admin-text) truncate">
                  {user?.ho} {user?.ten}
                </p>
                <p className="text-xs text-(--color-admin-text-secondary) truncate">
                  {user?.vai_tro === "quan_tri_vien" ? "Quản trị viên" : "Điều hành viên"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-(--color-admin-border) text-(--color-admin-text-secondary) hover:bg-(--color-admin-bg-hover) bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Đăng Xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-(--color-admin-border) bg-(--color-admin-sidebar) px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-(--color-admin-text)"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-(--color-admin-text)">Hệ Thống Quản Trị</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-0">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
