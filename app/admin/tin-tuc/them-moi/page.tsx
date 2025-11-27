"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ThemTinTucMoiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    tieu_de: "",
    noi_dung: "",
    anh_dai_dien: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        ma_tac_gia: 1, // TODO: có thể lấy từ auth nếu muốn
        ngay_tao: new Date().toISOString(),
      }

      await apiClient.createTinTuc(payload)
      alert("Thêm tin tức thành công!")
      router.push("/admin/tin-tuc")
    } catch (error) {
      console.error("Lỗi khi thêm tin tức:", error)
      alert("Không thể thêm tin tức!")
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
          <h1 className="text-3xl font-bold">Thêm Tin tức</h1>
          <p className="text-muted-foreground">Tạo tin tức mới</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tin tức</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                required
                value={formData.tieu_de}
                onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                placeholder="Nhập tiêu đề bài viết"
              />
            </div>

            <div className="space-y-2">
              <Label>Nội dung *</Label>
              <Textarea
                required
                rows={8}
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                placeholder="Nhập nội dung chi tiết bài viết"
              />
            </div>

            <div className="space-y-2">
              <Label>Ảnh đại diện (URL)</Label>
              <Input
                type="url"
                value={formData.anh_dai_dien}
                onChange={(e) => setFormData({ ...formData, anh_dai_dien: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4 pt-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Tạo tin tức"}
              </Button>

              <Link href="/admin/tin-tuc">
                <Button variant="outline">Hủy</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
