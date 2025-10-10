"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung } from "@/lib/types"
import { AddUserDialog } from "@/components/add-user-dialog"

export default function AdminNguoiDungPage() {
  const [nguoiDung, setNguoiDung] = useState<NguoiDung[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchNguoiDung()
  }, [])

  const fetchNguoiDung = async () => {
    try {
      const data = await apiClient.getNguoiDung()
      setNguoiDung(data)
    } catch (error) {
      console.error("Lỗi tải người dùng:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return

    try {
      await apiClient.deleteNguoiDung(id)
      setNguoiDung(nguoiDung.filter((n) => n.id !== id))
    } catch (error) {
      console.error("Lỗi xóa người dùng:", error)
      alert("Không thể xóa người dùng")
    }
  }

  const filteredNguoiDung = nguoiDung.filter(
    (n) =>
      `${n.ho} ${n.ten}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadge = (vaiTro: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      quan_tri_vien: "destructive",
      bien_tap_vien: "default",
      tinh_nguyen_vien: "secondary",
      nguoi_dung: "outline",
    }
    const labels: Record<string, string> = {
      quan_tri_vien: "Quản trị viên",
      bien_tap_vien: "Biên tập viên",
      tinh_nguyen_vien: "Tình nguyện viên",
      nguoi_dung: "Người dùng",
    }
    return <Badge variant={variants[vaiTro] || "outline"}>{labels[vaiTro] || vaiTro}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
        <AddUserDialog onUserAdded={fetchNguoiDung} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nguoiDung.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quản trị viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nguoiDung.filter((n) => n.vai_tro === "quan_tri_vien").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Biên tập viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nguoiDung.filter((n) => n.vai_tro === "bien_tap_vien").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tình nguyện viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nguoiDung.filter((n) => n.vai_tro === "tinh_nguyen_vien").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Họ tên</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Số điện thoại</th>
                  <th className="p-4 font-medium">Vai trò</th>
                  <th className="p-4 font-medium">Ngày tạo</th>
                  <th className="p-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNguoiDung.map((n) => (
                  <tr key={n.id} className="border-b">
                    <td className="p-4 font-medium">{`${n.ho} ${n.ten}`}</td>
                    <td className="p-4">{n.email}</td>
                    <td className="p-4">{n.so_dien_thoai}</td>
                    <td className="p-4">{getRoleBadge(n.vai_tro)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {n.ngay_tao ? new Date(n.ngay_tao).toLocaleDateString("vi-VN") : ""}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(n.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredNguoiDung.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
