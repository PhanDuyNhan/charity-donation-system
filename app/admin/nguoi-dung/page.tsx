"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung } from "@/lib/types"
import { formatShortDate } from "@/lib/utils"
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
      console.error("❌ Lỗi tải người dùng:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return

    try {
      await apiClient.deleteNguoiDung(id)
      setNguoiDung((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("❌ Lỗi xóa người dùng:", error)
      alert("Không thể xóa người dùng này!")
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
      dieu_hanh_vien: "default",
      bien_tap_vien: "secondary",
      tinh_nguyen_vien: "outline",
      nguoi_dung: "outline",
    }
    const labels: Record<string, string> = {
      quan_tri_vien: "Quản trị viên",
      dieu_hanh_vien: "Điều hành viên",
      bien_tap_vien: "Biên tập viên",
      tinh_nguyen_vien: "Tình nguyện viên",
      nguoi_dung: "Người dùng",
    }
    return <Badge variant={variants[vaiTro] || "outline"}>{labels[vaiTro] || vaiTro}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Đang tải dữ liệu...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Người dùng</h1>
        <AddUserDialog onUserAdded={fetchNguoiDung}>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Thêm người dùng
          </Button>
        </AddUserDialog>
      </div>

      {/* Cards thống kê */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Tổng người dùng", value: nguoiDung.length },
          { title: "Quản trị viên", value: nguoiDung.filter((n) => n.vai_tro === "quan_tri_vien").length },
          { title: "Biên tập viên", value: nguoiDung.filter((n) => n.vai_tro === "bien_tap_vien").length },
          { title: "Tình nguyện viên", value: nguoiDung.filter((n) => n.vai_tro === "tinh_nguyen_vien").length },
        ].map((card, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tìm kiếm */}
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

      {/* Bảng dữ liệu */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-sm font-semibold">
                  <th className="p-4">Họ tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">SĐT</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNguoiDung.map((n) => (
                  <tr key={n.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{`${n.ho} ${n.ten}`}</td>
                    <td className="p-4">{n.email || "-"}</td>
                    <td className="p-4">{n.so_dien_thoai || "-"}</td>
                    <td className="p-4">{getRoleBadge(n.vai_tro)}</td>
                    <td className="p-4">
                      {n.trang_thai === "hoat_dong" ? (
                        <Badge variant="secondary">Hoạt động</Badge>
                      ) : (
                        <Badge variant="destructive">Bị khóa</Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {n.ngay_tao ? formatShortDate(n.ngay_tao) : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
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
