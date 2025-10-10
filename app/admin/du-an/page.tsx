"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { DuAn } from "@/lib/types"
import Link from "next/link"

export default function AdminDuAnPage() {
  const [duAn, setDuAn] = useState<DuAn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchDuAn()
  }, [])

  const fetchDuAn = async () => {
    try {
      const data = await apiClient.getDuAn()
      setDuAn(data)
    } catch (error) {
      console.error("Lỗi tải dự án:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return

    try {
      await apiClient.deleteDuAn(id)
      setDuAn(duAn.filter((d) => d.id !== id))
    } catch (error) {
      console.error("Lỗi xóa dự án:", error)
      alert("Không thể xóa dự án")
    }
  }

  const filteredDuAn = duAn.filter((d) => d.ten_du_an.toLowerCase().includes(searchTerm.toLowerCase()))

  const getStatusBadge = (trangThai: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      dang_mo: "default",
      dang_thuc_hien: "secondary",
      hoan_thanh: "outline",
      tam_dung: "destructive",
    }
    const labels: Record<string, string> = {
      dang_mo: "Đang mở",
      dang_thuc_hien: "Đang thực hiện",
      hoan_thanh: "Hoàn thành",
      tam_dung: "Tạm dừng",
    }
    return <Badge variant={variants[trangThai]}>{labels[trangThai]}</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Dự án</h1>
        <Link href="/admin/du-an/them-moi">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm dự án mới
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredDuAn.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{d.ten_du_an}</h3>
                    {getStatusBadge(d.trang_thai)}
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{d.mo_ta}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mục tiêu:</span>
                      <p className="font-semibold">{d.so_tien_muc_tieu?.toLocaleString("vi-VN")} đ</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Đã quyên góp:</span>
                      <p className="font-semibold">{d.so_tien_hien_tai?.toLocaleString("vi-VN")} đ</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tiến độ:</span>
                      <p className="font-semibold">
                        {d.so_tien_muc_tieu ? Math.round((d.so_tien_hien_tai / d.so_tien_muc_tieu) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/du-an/${d.id}`}>
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/du-an/${d.id}/chinh-sua`}>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDuAn.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy dự án nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
