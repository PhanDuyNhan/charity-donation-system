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
        fetch("https://provinces.open-api.vn/api/?depth=1").then((r) => r.json()),
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
    <div className="min-h-[calc(100vh-48px)] bg-[#111827] text-white px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/du-an">
          <Button variant="outline" size="icon" className="border-neutral-700 text-neutral-200">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa dự án</h1>
          <p className="text-neutral-400 mt-1">Cập nhật thông tin dự án</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="admin-card bg-[#0f1724] border border-neutral-700 p-0 rounded-md overflow-hidden">
          <CardHeader className="px-6 pt-6">
            <CardTitle>Thông tin dự án</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>Tiêu đề</Label>
              <Input
                value={formData.tieu_de || ""}
                onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                className="bg-[#111827] border border-neutral-700 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục</Label>
                <Select
                  value={String(formData.ma_danh_muc || "")}
                  onValueChange={(v) => setFormData({ ...formData, ma_danh_muc: Number(v) })}
                >
                  <SelectTrigger className="bg-[#111827] border border-neutral-700 text-white min-w-[160px]">
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
                  <SelectTrigger className="bg-[#111827] border border-neutral-700 text-white min-w-[160px]">
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
                  className="bg-[#111827] border border-neutral-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={formData.ngay_ket_thuc || ""}
                  onChange={(e) => setFormData({ ...formData, ngay_ket_thuc: e.target.value })}
                  className="bg-[#111827] border border-neutral-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Số tiền mục tiêu</Label>
                <Input
                  type="number"
                  value={formData.so_tien_muc_tieu || ""}
                  onChange={(e) => setFormData({ ...formData, so_tien_muc_tieu: e.target.value })}
                  className="bg-[#111827] border border-neutral-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả</Label>
              <Textarea
                rows={5}
                value={formData.mo_ta || ""}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                className="bg-[#111827] border border-neutral-700 text-white"
              />
            </div>

            {/* Ảnh đại diện */}
            <div className="space-y-2">
              <Label>Ảnh đại diện (URL)</Label>
              <div className="flex gap-2">
                <Input
                  className="flex-1 bg-[#111827] border border-neutral-700 text-white"
                  value={formData.anh_dai_dien || ""}
                  onChange={(e) => setFormData({ ...formData, anh_dai_dien: e.target.value })}
                  placeholder="Dán URL hoặc tải ảnh"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("avatarUploadInput")?.click()}
                  className="border-neutral-700 text-neutral-200"
                >
                  Tải ảnh
                </Button>
                <input
                  id="avatarUploadInput"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        const res = await apiClient.uploadFile(file)
                        const url = res.url || res.path
                        if (url) {
                          setFormData({ ...formData, anh_dai_dien: url })
                        } else {
                          alert("Không nhận được URL ảnh sau khi tải lên.")
                        }
                      } catch (err) {
                        console.error("Lỗi tải ảnh đại diện:", err)
                        alert("Tải ảnh thất bại.")
                      }
                    }
                  }}
                />
              </div>

              {formData.anh_dai_dien && (
                <img
                  src={formData.anh_dai_dien}
                  alt="Ảnh đại diện"
                  className="w-40 h-40 object-cover mt-2 rounded-md border border-neutral-700"
                />
              )}
            </div>

            {/* Thư viện ảnh */}
            <div className="space-y-2">
              <Label>Thư viện ảnh</Label>
              <div className="flex flex-wrap gap-3">
                {formData.thu_vien_anh?.length > 0 ? (
                  formData.thu_vien_anh.map((url: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-32 h-32 object-cover rounded-md border border-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            thu_vien_anh: formData.thu_vien_anh.filter((_: any, i: number) => i !== idx),
                          })
                        }
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-400">Chưa có ảnh nào</p>
                )}
              </div>

              {/* Thêm ảnh bằng URL */}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Dán URL ảnh và nhấn Enter..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      e.preventDefault()
                      setFormData({
                        ...formData,
                        thu_vien_anh: [...(formData.thu_vien_anh || []), e.currentTarget.value.trim()],
                      })
                      e.currentTarget.value = ""
                    }
                  }}
                  className="bg-[#111827] border border-neutral-700 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("uploadInput")?.click()}
                  className="border-neutral-700 text-neutral-200"
                >
                  Tải ảnh
                </Button>
                <input
                  id="uploadInput"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        const res = await apiClient.uploadFile(file)
                        const url = res.url || res.path
                        if (url) {
                          setFormData({
                            ...formData,
                            thu_vien_anh: [...(formData.thu_vien_anh || []), url],
                          })
                        }
                      } catch (err) {
                        console.error("Lỗi upload ảnh:", err)
                        alert("Tải ảnh thất bại.")
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.trang_thai || "hoat_dong"}
                onValueChange={(v) => setFormData({ ...formData, trang_thai: v })}
              >
                <SelectTrigger className="bg-[#111827] border border-neutral-700 text-white min-w-[160px]">
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
                <Button type="button" variant="outline" className="border-neutral-700 text-neutral-200">
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
