"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ThemDuAnMoiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ten_du_an: "",
    mo_ta: "",
    noi_dung_chi_tiet: "",
    so_tien_muc_tieu: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    trang_thai: "dang_mo",
    hinh_anh: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        so_tien_muc_tieu: Number.parseFloat(formData.so_tien_muc_tieu),
        so_tien_hien_tai: 0,
        ngay_tao: new Date().toISOString(),
      }

      await apiClient.post("du_an", data)
      alert("Thêm dự án mới thành công!")
      router.push("/admin/du-an")
    } catch (error) {
      console.error("Lỗi khi thêm dự án:", error)
      alert("Không thể thêm dự án. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/du-an">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Thêm dự án mới</h1>
          <p className="text-muted-foreground mt-1">Tạo dự án quyên góp mới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin dự án</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ten_du_an">
                Tên dự án <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ten_du_an"
                required
                value={formData.ten_du_an}
                onChange={(e) => setFormData({ ...formData, ten_du_an: e.target.value })}
                placeholder="Nhập tên dự án"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mo_ta">
                Mô tả ngắn <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="mo_ta"
                required
                value={formData.mo_ta}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                placeholder="Mô tả ngắn gọn về dự án"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noi_dung_chi_tiet">Nội dung chi tiết</Label>
              <Textarea
                id="noi_dung_chi_tiet"
                value={formData.noi_dung_chi_tiet}
                onChange={(e) => setFormData({ ...formData, noi_dung_chi_tiet: e.target.value })}
                placeholder="Nội dung chi tiết về dự án"
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="so_tien_muc_tieu">
                  Số tiền mục tiêu (VNĐ) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="so_tien_muc_tieu"
                  type="number"
                  required
                  value={formData.so_tien_muc_tieu}
                  onChange={(e) => setFormData({ ...formData, so_tien_muc_tieu: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trang_thai">
                  Trạng thái <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.trang_thai}
                  onValueChange={(value) => setFormData({ ...formData, trang_thai: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dang_mo">Đang mở</SelectItem>
                    <SelectItem value="dang_thuc_hien">Đang thực hiện</SelectItem>
                    <SelectItem value="hoan_thanh">Hoàn thành</SelectItem>
                    <SelectItem value="tam_dung">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngay_bat_dau">Ngày bắt đầu</Label>
                <Input
                  id="ngay_bat_dau"
                  type="date"
                  value={formData.ngay_bat_dau}
                  onChange={(e) => setFormData({ ...formData, ngay_bat_dau: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ngay_ket_thuc">Ngày kết thúc</Label>
                <Input
                  id="ngay_ket_thuc"
                  type="date"
                  value={formData.ngay_ket_thuc}
                  onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hinh_anh">URL hình ảnh</Label>
              <Input
                id="hinh_anh"
                type="url"
                value={formData.hinh_anh}
                onChange={(e) => setFormData({ ...formData, hinh_anh: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Tạo dự án"}
              </Button>
              <Link href="/admin/du-an">
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
