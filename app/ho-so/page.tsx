"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function HoSoPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    ho: "",
    ten: "",
    email: "",
    so_dien_thoai: "",
    dia_chi: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/dang-nhap")
      return
    }

    if (user) {
      setFormData({
        ho: user.ho || "",
        ten: user.ten || "",
        email: user.email || "",
        so_dien_thoai: user.so_dien_thoai || "",
        dia_chi: user.dia_chi || "",
      })
    }
  }, [user, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement update profile API call
    alert("Cập nhật thông tin thành công!")
    setIsEditing(false)
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Hồ sơ của tôi</h1>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Thông tin cá nhân</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </Button>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ho">Họ</Label>
                        <Input
                          id="ho"
                          value={formData.ho}
                          onChange={(e) => setFormData({ ...formData, ho: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ten">Tên</Label>
                        <Input
                          id="ten"
                          value={formData.ten}
                          onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
                      <Input
                        id="so_dien_thoai"
                        value={formData.so_dien_thoai}
                        onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dia_chi">Địa chỉ</Label>
                      <Input
                        id="dia_chi"
                        value={formData.dia_chi}
                        onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })}
                      />
                    </div>
                    <Button type="submit">Lưu thay đổi</Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Họ và tên</p>
                        <p className="font-medium">
                          {user.ho} {user.ten}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    {user.so_dien_thoai && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Số điện thoại</p>
                          <p className="font-medium">{user.so_dien_thoai}</p>
                        </div>
                      </div>
                    )}
                    {user.dia_chi && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Địa chỉ</p>
                          <p className="font-medium">{user.dia_chi}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ngày tham gia</p>
                        <p className="font-medium">
                          {user.ngay_tao ? new Date(user.ngay_tao).toLocaleDateString("vi-VN") : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thống kê hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">0</div>
                    <p className="text-sm text-muted-foreground">Lần quyên góp</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-teal-600 mb-1">0 đ</div>
                    <p className="text-sm text-muted-foreground">Tổng đóng góp</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600 mb-1">0</div>
                    <p className="text-sm text-muted-foreground">Dự án hỗ trợ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
