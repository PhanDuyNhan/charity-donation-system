"use client"

import { useState, useEffect } from "react"
import { Search, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { TinhNguyenVien } from "@/lib/types"

export default function AdminTinhNguyenVienPage() {
  const [tinhNguyenVien, setTinhNguyenVien] = useState<TinhNguyenVien[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTinhNguyenVien()
  }, [])

  const fetchTinhNguyenVien = async () => {
    try {
      const data = await apiClient.getTinhNguyenVien()
      setTinhNguyenVien(data)
    } catch (error) {
      console.error("Lỗi tải tình nguyện viên:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, trangThai: string) => {
    try {
      await apiClient.updateTinhNguyenVien(id, { trang_thai: trangThai })
      setTinhNguyenVien(tinhNguyenVien.map((t) => (t.id === id ? { ...t, trang_thai: trangThai } : t)))
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error)
      alert("Không thể cập nhật trạng thái")
    }
  }

  const filteredTinhNguyenVien = tinhNguyenVien.filter(
    (t) =>
      t.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (trangThai: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      duyet: "default",
      cho_duyet: "secondary",
      tu_choi: "destructive",
    }
    const labels: Record<string, string> = {
      duyet: "Đã duyệt",
      cho_duyet: "Chờ duyệt",
      tu_choi: "Từ chối",
    }
    return <Badge variant={variants[trangThai]}>{labels[trangThai]}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Tình nguyện viên</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng đăng ký</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tinhNguyenVien.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tinhNguyenVien.filter((t) => t.trang_thai === "duyet").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tinhNguyenVien.filter((t) => t.trang_thai === "cho_duyet").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm tình nguyện viên</CardTitle>
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
                  <th className="p-4 font-medium">Kỹ năng</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ngày đăng ký</th>
                  <th className="p-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTinhNguyenVien.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-4 font-medium">{t.ho_ten}</td>
                    <td className="p-4">{t.email}</td>
                    <td className="p-4">{t.so_dien_thoai}</td>
                    <td className="p-4 text-sm">{t.ky_nang}</td>
                    <td className="p-4">{getStatusBadge(t.trang_thai)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {t.ngay_dang_ky ? new Date(t.ngay_dang_ky).toLocaleDateString("vi-VN") : ""}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {t.trang_thai === "cho_duyet" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(t.id, "duyet")}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(t.id, "tu_choi")}>
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredTinhNguyenVien.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy tình nguyện viên nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
