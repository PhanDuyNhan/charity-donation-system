"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Heart, Calendar, DollarSign, Target, Download, BarChart3 } from "lucide-react"

interface ThongKe {
  tongQuyenGop: number
  tongDuAn: number
  tongNguoiDung: number
  tongTinhNguyenVien: number
  quyenGopTheoThang: Array<{ thang: string; so_tien: number }>
  duAnTheoTrangThai: Array<{ trang_thai: string; so_luong: number }>
}

export default function AdminBaoCaoPage() {
  const [thongKe, setThongKe] = useState<ThongKe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThongKe()
  }, [])

  const fetchThongKe = async () => {
    try {
      // Gọi API để lấy thống kê
      const [quyenGop, duAn, nguoiDung, tinhNguyenVien] = await Promise.all([
        apiClient.getQuyenGop(),
        apiClient.getDuAn(),
        apiClient.getNguoiDung(),
        apiClient.getTinhNguyenVien(),
      ])

      const tongQuyenGop = quyenGop.reduce((sum, qg) => sum + (qg.so_tien || 0), 0)

      setThongKe({
        tongQuyenGop,
        tongDuAn: duAn.length,
        tongNguoiDung: nguoiDung.length,
        tongTinhNguyenVien: tinhNguyenVien.length,
        quyenGopTheoThang: [],
        duAnTheoTrangThai: [],
      })
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo & Thống kê</h1>
          <p className="text-muted-foreground mt-1">Tổng quan hoạt động từ thiện</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Xuất báo cáo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng quyên góp</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(thongKe?.tongQuyenGop || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng số tiền đã quyên góp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dự án</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{thongKe?.tongDuAn || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng số dự án từ thiện</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{thongKe?.tongNguoiDung || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng số người dùng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tình nguyện viên</CardTitle>
            <Heart className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{thongKe?.tongTinhNguyenVien || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng số tình nguyện viên</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quyên góp theo tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Biểu đồ quyên góp theo tháng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Dự án theo trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Biểu đồ dự án theo trạng thái</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Chưa có dữ liệu hoạt động</p>
                <p className="text-sm text-muted-foreground">Các hoạt động gần đây sẽ hiển thị tại đây</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
