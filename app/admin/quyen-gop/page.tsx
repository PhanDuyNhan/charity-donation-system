"use client"

import { useState, useEffect } from "react"
import { Search, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { QuyenGop } from "@/lib/types"

export default function AdminQuyenGopPage() {
  const [quyenGop, setQuyenGop] = useState<QuyenGop[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchQuyenGop()
  }, [])

  const fetchQuyenGop = async () => {
    try {
      const data = await apiClient.getQuyenGop()
      setQuyenGop(data)
    } catch (error) {
      console.error("Lỗi tải quyên góp:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, trangThai: string) => {
    try {
      await apiClient.updateQuyenGop(id, { trang_thai: trangThai })
      setQuyenGop(quyenGop.map((q) => (q.id === id ? { ...q, trang_thai: trangThai } : q)))
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error)
      alert("Không thể cập nhật trạng thái")
    }
  }

  const filteredQuyenGop = quyenGop.filter(
    (q) =>
      q.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (trangThai: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      thanh_cong: "default",
      cho_xu_ly: "secondary",
      that_bai: "destructive",
    }
    const labels: Record<string, string> = {
      thanh_cong: "Thành công",
      cho_xu_ly: "Chờ xử lý",
      that_bai: "Thất bại",
    }
    return <Badge variant={variants[trangThai]}>{labels[trangThai]}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Quyên góp</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tổng quyên góp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quyenGop.reduce((sum, q) => sum + (q.so_tien || 0), 0).toLocaleString("vi-VN")} đ
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Thành công</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {quyenGop.filter((q) => q.trang_thai === "thanh_cong").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {quyenGop.filter((q) => q.trang_thai === "cho_xu_ly").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm quyên góp</CardTitle>
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
                  <th className="p-4 font-medium">Người quyên góp</th>
                  <th className="p-4 font-medium">Số tiền</th>
                  <th className="p-4 font-medium">Phương thức</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                  <th className="p-4 font-medium">Ngày tạo</th>
                  <th className="p-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuyenGop.map((q) => (
                  <tr key={q.id} className="border-b">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{q.ho_ten || "Ẩn danh"}</p>
                        <p className="text-sm text-muted-foreground">{q.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold">{q.so_tien?.toLocaleString("vi-VN")} đ</td>
                    <td className="p-4">{q.phuong_thuc_thanh_toan}</td>
                    <td className="p-4">{getStatusBadge(q.trang_thai)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {q.ngay_tao ? new Date(q.ngay_tao).toLocaleDateString("vi-VN") : ""}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {q.trang_thai === "cho_xu_ly" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(q.id, "thanh_cong")}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(q.id, "that_bai")}>
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

      {filteredQuyenGop.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy quyên góp nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
