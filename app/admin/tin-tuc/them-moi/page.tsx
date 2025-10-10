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

export default function ThemTinTucMoiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tieu_de: "",
    noi_dung: "",
    tom_tat: "",
    trang_thai: "nhap",
    hinh_anh: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        luot_xem: 0,
        ngay_tao: new Date().toISOString(),
      }

      await apiClient.post("tin_tuc", data)
      alert("Thêm tin tức mới thành công!")
      router.push("/admin/tin-tuc")
    } catch (error) {
      console.error("Lỗi khi thêm tin tức:", error)
      alert("Không thể thêm tin tức. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tin-tuc">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Thêm tin tức mới</h1>
          <p className="text-muted-foreground mt-1">Tạo bài viết tin tức mới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tin tức</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="tieu_de">
                Tiêu đề <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tieu_de"
                required
                value={formData.tieu_de}
                onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tom_tat">
                Tóm tắt <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="tom_tat"
                required
                value={formData.tom_tat}
                onChange={(e) => setFormData({ ...formData, tom_tat: e.target.value })}
                placeholder="Tóm tắt ngắn gọn nội dung bài viết"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noi_dung">
                Nội dung <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="noi_dung"
                required
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                placeholder="Nội dung chi tiết bài viết"
                rows={10}
              />
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
                  <SelectItem value="nhap">Nháp</SelectItem>
                  <SelectItem value="cho_duyet">Chờ duyệt</SelectItem>
                  <SelectItem value="da_xuat_ban">Đã xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Tạo tin tức"}
              </Button>
              <Link href="/admin/tin-tuc">
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
