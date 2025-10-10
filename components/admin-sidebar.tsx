"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  Heart,
  Users,
  UserCheck,
  Calendar,
  Newspaper,
  BarChart3,
  Home,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/admin/du-an", icon: FolderKanban, label: "Quản lý dự án" },
  { href: "/admin/quyen-gop", icon: Heart, label: "Quản lý quyên góp" },
  { href: "/admin/nguoi-dung", icon: Users, label: "Quản lý người dùng" },
  { href: "/admin/tinh-nguyen-vien", icon: UserCheck, label: "Tình nguyện viên" },
  { href: "/admin/su-kien", icon: Calendar, label: "Quản lý sự kiện" },
  { href: "/admin/tin-tuc", icon: Newspaper, label: "Quản lý tin tức" },
  { href: "/admin/bao-cao", icon: BarChart3, label: "Báo cáo & Thống kê" },
  { href: "/admin/cai-dat", icon: Settings, label: "Cài đặt" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-8">
          <Home className="h-5 w-5 text-primary" />
          <span>Về trang chủ</span>
        </Link>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
