"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung } from "@/lib/types"
import { formatShortDate } from "@/lib/utils"

interface EditUserDialogProps {
  user: NguoiDung | null
  onClose: () => void
  onUpdated: () => void
}

export function EditUserDialog({ user, onClose, onUpdated }: EditUserDialogProps) {
  const [form, setForm] = useState<Partial<NguoiDung>>({})
  const [saving, setSaving] = useState(false)

  // ✅ Khi mở dialog thì gán dữ liệu hiện tại
  useEffect(() => {
    if (user) {
      setForm({
        ho: user.ho,
        ten: user.ten,
        email: user.email,
        so_dien_thoai: user.so_dien_thoai,
        vai_tro: user.vai_tro,
        trang_thai: user.trang_thai,
        ngay_tao: user.ngay_tao,
      })
    }
  }, [user])

  if (!user) return null

  const handleChange = (field: keyof NguoiDung, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.ho || !form.ten || !form.email) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.")
      return
    }

    try {
      setSaving(true)
      await apiClient.updateNguoiDung(user.id, form)
      onUpdated()
      onClose()
    } catch (err) {
      console.error("❌ Lỗi cập nhật người dùng:", err)
      alert("Cập nhật thất bại, vui lòng thử lại.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="bg-blue-950 border border-blue-700 text-blue-100 max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Họ</Label>
            <Input
              value={form.ho ?? ""}
              onChange={(e) => handleChange("ho", e.target.value)}
              className="bg-blue-900 border-blue-700 text-blue-100"
            />
          </div>

          <div>
            <Label>Tên</Label>
            <Input
              value={form.ten ?? ""}
              onChange={(e) => handleChange("ten", e.target.value)}
              className="bg-blue-900 border-blue-700 text-blue-100"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={form.email ?? ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="bg-blue-900 border-blue-700 text-blue-100"
            />
          </div>

          <div>
            <Label>Số điện thoại</Label>
            <Input
              value={form.so_dien_thoai ?? ""}
              onChange={(e) => handleChange("so_dien_thoai", e.target.value)}
              className="bg-blue-900 border-blue-700 text-blue-100"
            />
          </div>

          {/* Vai trò (Dropdown) */}
          <div>
            <Label>Vai trò</Label>
            <select
              value={form.vai_tro ?? ""}
              onChange={(e) => handleChange("vai_tro", e.target.value)}
              className="w-full bg-blue-900 border border-blue-700 rounded-md p-2 text-blue-100"
            >
              <option value="">-- Chọn vai trò --</option>
              <option value="quan_tri_vien">Quản trị viên</option>
              <option value="dieu_hanh_vien">Điều hành viên</option>
              <option value="bien_tap_vien">Biên tập viên</option>
              <option value="tinh_nguyen_vien">Tình nguyện viên</option>
              <option value="nguoi_dung">Người dùng</option>
            </select>
          </div>

          {/* Trạng thái (Dropdown) */}
          <div>
            <Label>Trạng thái</Label>
            <select
              value={form.trang_thai ?? ""}
              onChange={(e) => handleChange("trang_thai", e.target.value)}
              className="w-full bg-blue-900 border border-blue-700 rounded-md p-2 text-blue-100"
            >
              <option value="hoat_dong">Hoạt động</option>
              <option value="bi_khoa">Bị khóa</option>
            </select>
          </div>

          {/* Ngày tạo (không cho sửa) */}
          <div>
            <Label>Ngày tạo</Label>
            <Input
              value={form.ngay_tao ? formatShortDate(form.ngay_tao) : "-"}
              disabled
              className="bg-blue-800 border-blue-700 text-blue-200 cursor-not-allowed"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-blue-700 text-blue-300">
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
