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

export default function ThemSuKienMoiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ten_su_kien: "",
    mo_ta: "",
    noi_dung: "",
    ngay_bat_dau: "",
    ngay_ket_thuc: "",
    dia_diem: "",
    trang_thai: "sap_dien_ra",
    hinh_anh: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        so_luong_tham_gia: 0,
        ngay_tao: new Date().toISOString(),
      }

      await apiClient.post("su_kien", data)
      alert("Thêm sự kiện mới thành công!")
      router.push("/admin/su-kien")
    } catch (error) {
      console.error("Lỗi khi thêm sự kiện:", error)
      alert("Không thể thêm sự kiện. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/su-kien">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Thêm sự kiện mới</h1>
          <p className="text-muted-foreground mt-1">Tạo sự kiện từ thiện mới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sự kiện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ten_su_kien">
                Tên sự kiện <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ten_su_kien"
                required
                value={formData.ten_su_kien}
                onChange={(e) => setFormData({ ...formData, ten_su_kien: e.target.value })}
                placeholder="Nhập tên sự kiện"
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
                placeholder="Mô tả ngắn gọn về sự kiện"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noi_dung">Nội dung chi tiết</Label>
              <Textarea
                id="noi_dung"
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                placeholder="Nội dung chi tiết về sự kiện"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dia_diem">
                Địa điểm <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dia_diem"
                required
                value={formData.dia_diem}
                onChange={(e) => setFormData({ ...formData, dia_diem: e.target.value })}
                placeholder="Nhập địa điểm tổ chức"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ngay_bat_dau">
                  Ngày bắt đầu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ngay_bat_dau"
                  type="datetime-local"
                  required
                  value={formData.ngay_bat_dau}
                  onChange={(e) => setFormData({ ...formData, ngay_bat_dau: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ngay_ket_thuc">Ngày kết thúc</Label>
                <Input
                  id="ngay_ket_thuc"
                  type="datetime-local"
                  value={formData.ngay_ket_thuc}
                  onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                />
              </div>
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
                  <SelectItem value="sap_dien_ra">Sắp diễn ra</SelectItem>
                  <SelectItem value="dang_dien_ra">Đang diễn ra</SelectItem>
                  <SelectItem value="da_ket_thuc">Đã kết thúc</SelectItem>
                  <SelectItem value="da_huy">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
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
                {loading ? "Đang lưu..." : "Tạo sự kiện"}
              </Button>
              <Link href="/admin/su-kien">
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
