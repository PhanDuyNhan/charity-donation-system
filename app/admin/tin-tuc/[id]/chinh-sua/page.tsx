"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"
import Link from "next/link"

export default function ChinhSuaTinTucPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<TinTuc>>({
    tieu_de: "",
    tom_tat: "",
    noi_dung: "",
    trang_thai: "nhap",
    hinh_anh_url: "",
  })

  useEffect(() => {
    fetchTinTuc()
  }, [id])

  const fetchTinTuc = async () => {
    try {
      const data = await apiClient.getTinTuc({ id: `eq.${id}` })
      if (data && data.length > 0) {
        setFormData(data[0])
      }
    } catch (error) {
      console.error("Lỗi tải tin tức:", error)
      alert("Không thể tải thông tin tin tức")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await apiClient.updateTinTuc(id, formData)
      alert("Cập nhật tin tức thành công!")
      router.push("/admin/tin-tuc")
    } catch (error) {
      console.error("Lỗi cập nhật tin tức:", error)
      alert("Không thể cập nhật tin tức")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/tin-tuc">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa Tin tức</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tin tức</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tieu_de">Tiêu đề *</Label>
              <Input
                id="tieu_de"
                value={formData.tieu_de}
                onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tom_tat">Tóm tắt *</Label>
              <Textarea
                id="tom_tat"
                value={formData.tom_tat}
                onChange={(e) => setFormData({ ...formData, tom_tat: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noi_dung">Nội dung *</Label>
              <Textarea
                id="noi_dung"
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                rows={10}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trang_thai">Trạng thái *</Label>
              <Select
                value={formData.trang_thai}
                onValueChange={(value) => setFormData({ ...formData, trang_thai: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nhap">Nháp</SelectItem>
                  <SelectItem value="xuat_ban">Xuất bản</SelectItem>
                  <SelectItem value="an">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hinh_anh_url">URL hình ảnh</Label>
              <Input
                id="hinh_anh_url"
                type="url"
                value={formData.hinh_anh_url || ""}
                onChange={(e) => setFormData({ ...formData, hinh_anh_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
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
