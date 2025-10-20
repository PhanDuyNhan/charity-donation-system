"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

export default function SuaDuAnPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [danhMucs, setDanhMucs] = useState<any[]>([])
  const [provinces, setProvinces] = useState<any[]>([])

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    try {
      setLoading(true)
      const [duAnArr, dm, prov] = await Promise.all([
        apiClient.getDuAn({ id: `eq.${id}` }),
        apiClient.getDanhMucDuAn(),
        fetch("https://provinces.open-api.vn/api/?depth=1").then(r => r.json()),
      ])
      setDanhMucs(dm)
      setProvinces(prov)
      const duAn = duAnArr?.[0]
      if (!duAn) {
        alert("Không tìm thấy dự án.")
        router.push("/admin/du-an")
        return
      }
      setFormData(duAn)
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.updateDuAn(Number(id), formData)
      alert("Cập nhật dự án thành công!")
      router.push("/admin/du-an")
    } catch (err) {
      console.error("Lỗi khi cập nhật dự án:", err)
      alert("Không thể cập nhật. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  if (!formData) return <div className="p-6">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/du-an">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa dự án</h1>
          <p className="text-muted-foreground mt-1">Cập nhật thông tin dự án</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin dự án</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                value={formData.tieu_de || ""}
                onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select
                  value={String(formData.ma_danh_muc || "")}
                  onValueChange={(v) => setFormData({ ...formData, ma_danh_muc: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {danhMucs.map((dm: any) => (
                      <SelectItem key={dm.id} value={String(dm.id)}>
                        {dm.ten ?? dm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Địa điểm</Label>
                <Select
                  value={formData.dia_diem || ""}
                  onValueChange={(v) => setFormData({ ...formData, dia_diem: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn địa điểm" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p: any) => (
                      <SelectItem key={p.code} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={formData.ngay_bat_dau || ""}
                  onChange={(e) => setFormData({ ...formData, ngay_bat_dau: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={formData.ngay_ket_thuc || ""}
                  onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Số tiền mục tiêu</Label>
                <Input
                  type="number"
                  value={formData.so_tien_muc_tieu || ""}
                  onChange={(e) => setFormData({ ...formData, so_tien_muc_tieu: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={5}
                value={formData.mo_ta || ""}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ảnh đại diện (URL)</Label>
              <Input
                value={formData.anh_dai_dien || ""}
                onChange={(e) => setFormData({ ...formData, anh_dai_dien: e.target.value })}
              />
              {formData.anh_dai_dien && (
                <img
                  src={formData.anh_dai_dien}
                  alt="Ảnh đại diện"
                  className="w-40 h-40 object-cover mt-2 rounded-md border"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.trang_thai || "hoat_dong"}
                onValueChange={(v) => setFormData({ ...formData, trang_thai: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoat_dong">Hoạt động</SelectItem>
                  <SelectItem value="tam_dung">Tạm dừng</SelectItem>
                  <SelectItem value="hoan_thanh">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
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
