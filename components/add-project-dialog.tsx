"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { TrangThaiDuAn, MucDoUuTien } from "@/lib/types"

export function AddProjectDialog({ onProjectAdded }: { onProjectAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tieu_de: "",
    mo_ta: "",
    mo_ta_ngan: "",
    dia_diem: "",
    so_tien_muc_tieu: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    muc_do_uu_tien: "trung_binh" as MucDoUuTien,
    trang_thai: "ban_nhap" as TrangThaiDuAn,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.tieu_de.trim()) return alert("Vui lòng nhập tiêu đề dự án!")
    setLoading(true)
    try {
      await apiClient.createDuAn({
        ...formData,
        so_tien_muc_tieu: Number(formData.so_tien_muc_tieu),
        muc_do_uu_tien: formData.muc_do_uu_tien as MucDoUuTien,
        trang_thai: formData.trang_thai as TrangThaiDuAn,
      })
      setOpen(false)
      onProjectAdded()
    } catch (error) {
      console.error("❌ Lỗi thêm dự án:", error)
      alert("Thêm dự án thất bại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ Thêm dự án mới</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-blue-950 border-blue-800 text-blue-100">
        <DialogHeader>
          <DialogTitle>Thêm Dự án Mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Tiêu đề</Label>
            <Input name="tieu_de" value={formData.tieu_de} onChange={handleChange} />
          </div>
          <div>
            <Label>Mô tả ngắn</Label>
            <Input name="mo_ta_ngan" value={formData.mo_ta_ngan} onChange={handleChange} />
          </div>
          <div>
            <Label>Mô tả chi tiết</Label>
            <Textarea name="mo_ta" value={formData.mo_ta} onChange={handleChange} />
          </div>
          <div>
            <Label>Địa điểm</Label>
            <Input name="dia_diem" value={formData.dia_diem} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ngày bắt đầu</Label>
              <Input type="date" name="ngay_bat_dau" value={formData.ngay_bat_dau} onChange={handleChange} />
            </div>
            <div>
              <Label>Ngày kết thúc</Label>
              <Input type="date" name="ngay_ket_thuc" value={formData.ngay_ket_thuc} onChange={handleChange} />
            </div>
          </div>

          <div>
            <Label>Số tiền mục tiêu (VNĐ)</Label>
            <Input
              type="number"
              name="so_tien_muc_tieu"
              value={formData.so_tien_muc_tieu}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ưu tiên</Label>
              <Select
                value={formData.muc_do_uu_tien}
                onValueChange={(value: MucDoUuTien) => setFormData((prev) => ({ ...prev, muc_do_uu_tien: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức ưu tiên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khan_cap">Khẩn cấp</SelectItem>
                  <SelectItem value="cao">Cao</SelectItem>
                  <SelectItem value="trung_binh">Trung bình</SelectItem>
                  <SelectItem value="thap">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Select
                value={formData.trang_thai}
                onValueChange={(value: TrangThaiDuAn) => setFormData((prev) => ({ ...prev, trang_thai: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ban_nhap">Bản nháp</SelectItem>
                  <SelectItem value="hoat_dong">Hoạt động</SelectItem>
                  <SelectItem value="tam_dung">Tạm dừng</SelectItem>
                  <SelectItem value="hoan_thanh">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Đang lưu..." : "Lưu dự án"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
