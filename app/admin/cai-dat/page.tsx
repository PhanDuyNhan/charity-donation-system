"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/auth"

export default function CaiDatPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    ho: user?.ho || "",
    ten: user?.ten || "",
    email: user?.email || "",
    so_dien_thoai: user?.so_dien_thoai || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      alert("Cập nhật thông tin thành công!")
      setLoading(false)
    }, 1000)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!")
      return
    }
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      alert("Đổi mật khẩu thành công!")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân và cài đặt hệ thống</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ho">Họ</Label>
                <Input
                  id="ho"
                  value={profileData.ho}
                  onChange={(e) => setProfileData({ ...profileData, ho: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ten">Tên</Label>
                <Input
                  id="ten"
                  value={profileData.ten}
                  onChange={(e) => setProfileData({ ...profileData, ten: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
              <Input
                id="so_dien_thoai"
                type="tel"
                value={profileData.so_dien_thoai}
                onChange={(e) => setProfileData({ ...profileData, so_dien_thoai: e.target.value })}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Cập nhật thông tin"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Thay đổi mật khẩu đăng nhập của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Đổi mật khẩu"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
          <CardDescription>Thông tin về tài khoản và quyền hạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Vai trò:</span>
            <span className="font-medium">{user?.vai_tro}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Ngày tạo tài khoản:</span>
            <span className="font-medium">
              {user?.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString("vi-VN") : "N/A"}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Trạng thái:</span>
            <span className="font-medium">{user?.trang_thai}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
