"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import type { DuAn, MucDoUuTien, TrangThaiDuAn } from "@/lib/types"

export function EditProjectDialog({
  project,
  onClose,
  onUpdated,
}: {
  project: DuAn | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [formData, setFormData] = useState<Partial<DuAn>>(project || {})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (project) setFormData(project)
  }, [project])

  if (!project) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await apiClient.updateDuAn(project.id, {
        ...formData,
        so_tien_muc_tieu: Number(formData.so_tien_muc_tieu),
        so_tien_hien_tai: Number(formData.so_tien_hien_tai ?? 0),
        muc_do_uu_tien: formData.muc_do_uu_tien as MucDoUuTien,
        trang_thai: formData.trang_thai as TrangThaiDuAn,
      })
      onUpdated()
      onClose()
    } catch (error) {
      console.error("❌ Lỗi cập nhật dự án:", error)
      alert("Cập nhật dự án thất bại!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!project} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-blue-950 border-blue-800 text-blue-100">
        <DialogHeader>
          <DialogTitle>Cập nhật Dự án</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Tiêu đề</Label>
            <Input name="tieu_de" value={formData.tieu_de ?? ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Mô tả ngắn</Label>
            <Input name="mo_ta_ngan" value={formData.mo_ta_ngan ?? ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Mô tả chi tiết</Label>
            <Textarea name="mo_ta" value={formData.mo_ta ?? ""} onChange={handleChange} />
          </div>
          <div>
            <Label>Địa điểm</Label>
            <Input name="dia_diem" value={formData.dia_diem ?? ""} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ngày bắt đầu</Label>
              <Input
                type="date"
                name="ngay_bat_dau"
                value={formData.ngay_bat_dau ? formData.ngay_bat_dau.slice(0, 10) : ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Ngày kết thúc</Label>
              <Input
                type="date"
                name="ngay_ket_thuc"
                value={formData.ngay_ket_thuc ? formData.ngay_ket_thuc.slice(0, 10) : ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ưu tiên</Label>
              <Select
                value={formData.muc_do_uu_tien ?? "trung_binh"}
                onValueChange={(value: MucDoUuTien) =>
                  setFormData((prev) => ({ ...prev, muc_do_uu_tien: value }))
                }
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
                value={formData.trang_thai ?? "ban_nhap"}
                onValueChange={(value: TrangThaiDuAn) =>
                  setFormData((prev) => ({ ...prev, trang_thai: value }))
                }
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
            <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
