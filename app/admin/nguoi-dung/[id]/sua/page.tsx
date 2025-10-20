"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung, VaiTroNguoiDung, TrangThaiNguoiDung } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"

export default function SuaNguoiDungPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Partial<NguoiDung> | null>(null)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    try {
      setLoading(true)
      const users = await apiClient.getNguoiDung({ id: `eq.${id}` })
      const u = users?.[0]
      if (!u) {
        alert("Không tìm thấy người dùng.")
        router.push("/admin/nguoi-dung")
        return
      }
      setForm(u)
    } catch (err) {
      console.error("Lỗi tải người dùng:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    if (!form.ho || !form.ten || !form.email) {
      alert("Vui lòng nhập đủ Họ, Tên và Email.")
      return
    }
    setLoading(true)
    try {
      await apiClient.updateNguoiDung(Number(id), {
        ho: form.ho,
        ten: form.ten,
        email: form.email,
        so_dien_thoai: form.so_dien_thoai ?? "",
        dia_chi: form.dia_chi ?? "",
        ngay_sinh: form.ngay_sinh ?? "",
        vai_tro: (form.vai_tro || "nguoi_dung") as VaiTroNguoiDung,
        trang_thai: (form.trang_thai || "hoat_dong") as TrangThaiNguoiDung,
      })
      alert("Cập nhật thành công.")
      router.push("/admin/nguoi-dung")
    } catch (err) {
      console.error(err)
      alert("Không thể cập nhật.")
    } finally {
      setLoading(false)
    }
  }

  if (!form) return <div className="p-6">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/nguoi-dung">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Chỉnh sửa người dùng</h1>
          <p className="text-muted-foreground mt-1">Cập nhật thông tin người dùng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Thông tin người dùng</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ</Label>
                <Input value={form.ho || ""} onChange={(e) => setForm({ ...form, ho: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tên</Label>
                <Input value={form.ten || ""} onChange={(e) => setForm({ ...form, ten: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={form.so_dien_thoai || ""} onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ngày sinh</Label>
                <Input type="date" value={form.ngay_sinh || ""} onChange={(e) => setForm({ ...form, ngay_sinh: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select value={form.vai_tro || "nguoi_dung"} onValueChange={(v) => setForm({ ...form, vai_tro: v as VaiTroNguoiDung })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quan_tri_vien">Quản trị viên</SelectItem>
                    <SelectItem value="dieu_hanh_vien">Điều hành viên</SelectItem>
                    <SelectItem value="bien_tap_vien">Biên tập viên</SelectItem>
                    <SelectItem value="nguoi_dung">Người dùng</SelectItem>
                    <SelectItem value="tinh_nguyen_vien">Tình nguyện viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input value={form.dia_chi || ""} onChange={(e) => setForm({ ...form, dia_chi: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={form.trang_thai || "hoat_dong"} onValueChange={(v) => setForm({ ...form, trang_thai: v as TrangThaiNguoiDung })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoat_dong">Hoạt động</SelectItem>
                  <SelectItem value="khong_hoat_dong">Không hoạt động</SelectItem>
                  <SelectItem value="bi_khoa">Bị khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</Button>
              <Link href="/admin/nguoi-dung"><Button type="button" variant="outline">Hủy</Button></Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
