"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart } from "lucide-react"
import { authService } from "@/lib/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ho: "", // Changed from ho_ten to separate ho and ten
    ten: "",
    email: "",
    so_dien_thoai: "",
    mat_khau: "",
    xac_nhan_mat_khau: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.mat_khau !== formData.xac_nhan_mat_khau) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    setLoading(true)

    try {
      await authService.register({
        ho: formData.ho,
        ten: formData.ten,
        email: formData.email,
        so_dien_thoai: formData.so_dien_thoai,
        mat_khau: formData.mat_khau,
      })
      router.push("/dang-nhap?registered=true")
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary fill-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
          <CardDescription>Tạo tài khoản để tham gia quyên góp từ thiện</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ho">Họ</Label>
                <Input
                  id="ho"
                  type="text"
                  placeholder="Nguyễn"
                  value={formData.ho}
                  onChange={(e) => setFormData({ ...formData, ho: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ten">Tên</Label>
                <Input
                  id="ten"
                  type="text"
                  placeholder="Văn A"
                  value={formData.ten}
                  onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
              <Input
                id="so_dien_thoai"
                type="tel"
                placeholder="0123456789"
                value={formData.so_dien_thoai}
                onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mat_khau">Mật khẩu</Label>
              <Input
                id="mat_khau"
                type="password"
                placeholder="••••••••"
                value={formData.mat_khau}
                onChange={(e) => setFormData({ ...formData, mat_khau: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="xac_nhan_mat_khau">Xác nhận mật khẩu</Label>
              <Input
                id="xac_nhan_mat_khau"
                type="password"
                placeholder="••••••••"
                value={formData.xac_nhan_mat_khau}
                onChange={(e) => setFormData({ ...formData, xac_nhan_mat_khau: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/dang-nhap" className="text-primary hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
