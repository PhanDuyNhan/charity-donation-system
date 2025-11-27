"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { authService } from "@/lib/auth"
import type { VaiTroNguoiDung, TrangThaiNguoiDung } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function ThemNguoiDungPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    ho: "",
    ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi: "",
    password: "",
    confirm_password: "",
    vai_tro: "nguoi_dung" as VaiTroNguoiDung,
    trang_thai: "hoat_dong" as TrangThaiNguoiDung,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.password.trim()) {
      alert("Vui lòng nhập mật khẩu.")
      return
    }

    if (form.password !== form.confirm_password) {
      alert("Mật khẩu xác nhận không khớp.")
      return
    }

    setLoading(true)
    try {
      // 🔥 Admin sử dụng chung API Đăng ký người dùng
      const dataToSend = {
        ho: form.ho,
        ten: form.ten,
        email: form.email,
        so_dien_thoai: form.so_dien_thoai,
        dia_chi: form.dia_chi,
        password: form.password,

        // 🔥 Thêm các trường riêng của admin
        vai_tro: form.vai_tro,
        trang_thai: form.trang_thai,
      }

      console.log("Admin Register Payload:", dataToSend)

      await authService.register(dataToSend)

      alert("Tạo người dùng thành công!")
      router.push("/admin/nguoi-dung")
    } catch (err) {
      console.error(err)
      alert("Không thể tạo người dùng.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/nguoi-dung">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div>
          <h1 className="text-3xl font-bold">Thêm người dùng</h1>
          <p className="text-muted-foreground">Tạo mới người dùng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-1">
                <Label>Họ</Label>
                <Input
                  value={form.ho}
                  onChange={(e) => setForm({ ...form, ho: e.target.value })}
                  placeholder="Nhập họ..."
                />
              </div>

              <div className="space-y-1">
                <Label>Tên</Label>
                <Input
                  value={form.ten}
                  onChange={(e) => setForm({ ...form, ten: e.target.value })}
                  placeholder="Nhập tên..."
                />
              </div>

            </div>

            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@gmail.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="space-y-1">
                <Label>Số điện thoại</Label>
                <Input
                  value={form.so_dien_thoai}
                  onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })}
                  placeholder="0123 456 789"
                />
              </div>

              <div className="space-y-1">
                <Label>Vai trò</Label>
                <Select
                  value={form.vai_tro}
                  onValueChange={(v) => setForm({ ...form, vai_tro: v as VaiTroNguoiDung })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quan_tri_vien">Quản trị viên</SelectItem>
                    <SelectItem value="dieu_hanh_vien">Điều hành viên</SelectItem>
                    <SelectItem value="bien_tap_vien">Biên tập viên</SelectItem>
                    <SelectItem value="nguoi_dung">Người dùng</SelectItem>
                    <SelectItem value="tinh_nguyen_vien">Tình nguyện viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Trạng thái</Label>
                <Select
                  value={form.trang_thai}
                  onValueChange={(v) => setForm({ ...form, trang_thai: v as TrangThaiNguoiDung })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoat_dong">Hoạt động</SelectItem>
                    <SelectItem value="khong_hoat_dong">Không hoạt động</SelectItem>
                    <SelectItem value="bi_khoa">Bị khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-1">
              <Label>Địa chỉ</Label>
              <Input
                value={form.dia_chi}
                onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}
                placeholder="Nhập địa chỉ..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-1">
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Nhập mật khẩu..."
                />
              </div>

              <div className="space-y-1">
                <Label>Xác nhận mật khẩu</Label>
                <Input
                  type="password"
                  value={form.confirm_password}
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                  placeholder="Nhập lại mật khẩu..."
                />
              </div>

            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="w-40">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Đang tạo..." : "Tạo người dùng"}
              </Button>

              <Link href="/admin/nguoi-dung">
                <Button variant="outline">Hủy</Button>
              </Link>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  )
}
