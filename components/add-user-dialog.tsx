"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { UserPlus } from "lucide-react"

export function AddUserDialog({
  children,
  onUserAdded,
}: {
  children?: React.ReactNode
  onUserAdded?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ho: "",
    ten: "",
    email: "",
    mat_khau: "",
    so_dien_thoai: "",
    vai_tro: "nguoi_dung",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Hash password (in production, this should be done server-side)
      const hashedPassword = btoa(formData.mat_khau)

      const data = {
        ho: formData.ho,
        ten: formData.ten,
        email: formData.email,
        mat_khau_hash: hashedPassword,
        so_dien_thoai: formData.so_dien_thoai,
        vai_tro: formData.vai_tro,
        trang_thai: "hoat_dong",
        email_da_xac_thuc: false,
        ngay_tao: new Date().toISOString(),
      }

      await apiClient.post("nguoi_dung", data)
      alert("Thêm người dùng mới thành công!")
      setOpen(false)
      setFormData({
        ho: "",
        ten: "",
        email: "",
        mat_khau: "",
        so_dien_thoai: "",
        vai_tro: "nguoi_dung",
      })
      onUserAdded?.()
    } catch (error) {
      console.error("Lỗi khi thêm người dùng:", error)
      alert("Không thể thêm người dùng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>Tạo tài khoản người dùng mới trong hệ thống</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ho">
                Họ <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ho"
                required
                value={formData.ho}
                onChange={(e) => setFormData({ ...formData, ho: e.target.value })}
                placeholder="Nguyễn"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ten">
                Tên <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ten"
                required
                value={formData.ten}
                onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                placeholder="Văn A"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mat_khau">
              Mật khẩu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mat_khau"
              type="password"
              required
              value={formData.mat_khau}
              onChange={(e) => setFormData({ ...formData, mat_khau: e.target.value })}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
            <Input
              id="so_dien_thoai"
              type="tel"
              value={formData.so_dien_thoai}
              onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
              placeholder="0123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vai_tro">
              Vai trò <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.vai_tro} onValueChange={(value) => setFormData({ ...formData, vai_tro: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nguoi_dung">Người dùng</SelectItem>
                <SelectItem value="tinh_nguyen_vien">Tình nguyện viên</SelectItem>
                <SelectItem value="bien_tap_vien">Biên tập viên</SelectItem>
                <SelectItem value="quan_tri_vien">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Đang lưu..." : "Tạo người dùng"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
