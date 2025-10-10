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
import type { DuAn } from "@/lib/types"
import Link from "next/link"

export default function ChinhSuaDuAnPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<DuAn>>({
    ten_du_an: "",
    mo_ta: "",
    mo_ta_chi_tiet: "",
    so_tien_muc_tieu: 0,
    trang_thai: "dang_mo",
    hinh_anh_url: "",
  })

  useEffect(() => {
    fetchDuAn()
  }, [id])

  const fetchDuAn = async () => {
    try {
      const data = await apiClient.getDuAn({ id: `eq.${id}` })
      if (data && data.length > 0) {
        setFormData(data[0])
      }
    } catch (error) {
      console.error("Lỗi tải dự án:", error)
      alert("Không thể tải thông tin dự án")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await apiClient.updateDuAn(id, formData)
      alert("Cập nhật dự án thành công!")
      router.push("/admin/du-an")
    } catch (error) {
      console.error("Lỗi cập nhật dự án:", error)
      alert("Không thể cập nhật dự án")
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
        <Link href="/admin/du-an">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa Dự án</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin dự án</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ten_du_an">Tên dự án *</Label>
              <Input
                id="ten_du_an"
                value={formData.ten_du_an}
                onChange={(e) => setFormData({ ...formData, ten_du_an: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mo_ta">Mô tả ngắn *</Label>
              <Textarea
                id="mo_ta"
                value={formData.mo_ta}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mo_ta_chi_tiet">Mô tả chi tiết</Label>
              <Textarea
                id="mo_ta_chi_tiet"
                value={formData.mo_ta_chi_tiet || ""}
                onChange={(e) => setFormData({ ...formData, mo_ta_chi_tiet: e.target.value })}
                rows={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="so_tien_muc_tieu">Mục tiêu quyên góp (VNĐ) *</Label>
                <Input
                  id="so_tien_muc_tieu"
                  type="number"
                  value={formData.so_tien_muc_tieu}
                  onChange={(e) => setFormData({ ...formData, so_tien_muc_tieu: Number(e.target.value) })}
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
                    <SelectItem value="dang_mo">Đang mở</SelectItem>
                    <SelectItem value="dang_thuc_hien">Đang thực hiện</SelectItem>
                    <SelectItem value="hoan_thanh">Hoàn thành</SelectItem>
                    <SelectItem value="tam_dung">Tạm dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
