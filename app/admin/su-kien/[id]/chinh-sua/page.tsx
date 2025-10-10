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
import type { SuKien } from "@/lib/types"
import Link from "next/link"

export default function ChinhSuaSuKienPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<SuKien>>({
    ten_su_kien: "",
    mo_ta: "",
    dia_diem: "",
    thoi_gian_bat_dau: "",
    thoi_gian_ket_thuc: "",
    trang_thai: "sap_dien_ra",
    hinh_anh_url: "",
  })

  useEffect(() => {
    fetchSuKien()
  }, [id])

  const fetchSuKien = async () => {
    try {
      const data = await apiClient.getSuKien({ id: `eq.${id}` })
      if (data && data.length > 0) {
        setFormData(data[0])
      }
    } catch (error) {
      console.error("Lỗi tải sự kiện:", error)
      alert("Không thể tải thông tin sự kiện")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await apiClient.updateSuKien(id, formData)
      alert("Cập nhật sự kiện thành công!")
      router.push("/admin/su-kien")
    } catch (error) {
      console.error("Lỗi cập nhật sự kiện:", error)
      alert("Không thể cập nhật sự kiện")
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
        <Link href="/admin/su-kien">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa Sự kiện</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin sự kiện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ten_su_kien">Tên sự kiện *</Label>
              <Input
                id="ten_su_kien"
                value={formData.ten_su_kien}
                onChange={(e) => setFormData({ ...formData, ten_su_kien: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mo_ta">Mô tả *</Label>
              <Textarea
                id="mo_ta"
                value={formData.mo_ta}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dia_diem">Địa điểm *</Label>
              <Input
                id="dia_diem"
                value={formData.dia_diem}
                onChange={(e) => setFormData({ ...formData, dia_diem: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thoi_gian_bat_dau">Thời gian bắt đầu *</Label>
                <Input
                  id="thoi_gian_bat_dau"
                  type="datetime-local"
                  value={formData.thoi_gian_bat_dau?.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, thoi_gian_bat_dau: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thoi_gian_ket_thuc">Thời gian kết thúc</Label>
                <Input
                  id="thoi_gian_ket_thuc"
                  type="datetime-local"
                  value={formData.thoi_gian_ket_thuc?.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, thoi_gian_ket_thuc: e.target.value })}
                />
              </div>
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
                  <SelectItem value="sap_dien_ra">Sắp diễn ra</SelectItem>
                  <SelectItem value="dang_dien_ra">Đang diễn ra</SelectItem>
                  <SelectItem value="da_ket_thuc">Đã kết thúc</SelectItem>
                  <SelectItem value="huy">Hủy</SelectItem>
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
