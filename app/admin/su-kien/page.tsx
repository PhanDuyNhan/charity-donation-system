"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import type { SuKien } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default function AdminSuKienPage() {
  const [suKien, setSuKien] = useState<SuKien[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchSuKien()
  }, [])

  const fetchSuKien = async () => {
    try {
      const data = await apiClient.getSuKien()
      setSuKien(data)
    } catch (error) {
      console.error("Lỗi khi tải sự kiện:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return

    try {
      await apiClient.deleteSuKien(id)
      setSuKien(suKien.filter((sk) => sk.id !== id))
    } catch (error) {
      console.error("Lỗi khi xóa sự kiện:", error)
      alert("Không thể xóa sự kiện")
    }
  }

  const filteredSuKien = suKien.filter(
    (sk) =>
      sk.ten_su_kien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sk.dia_diem?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (trangThai: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      sap_dien_ra: "default",
      dang_dien_ra: "secondary",
      da_ket_thuc: "outline",
      da_huy: "destructive",
    }
    const labels: Record<string, string> = {
      sap_dien_ra: "Sắp diễn ra",
      dang_dien_ra: "Đang diễn ra",
      da_ket_thuc: "Đã kết thúc",
      da_huy: "Đã hủy",
    }
    return <Badge variant={variants[trangThai]}>{labels[trangThai]}</Badge>
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
          <h1 className="text-3xl font-bold">Quản lý Sự kiện</h1>
          <p className="text-muted-foreground mt-1">Quản lý các sự kiện từ thiện</p>
        </div>
        <Button asChild>
          <Link href="/admin/su-kien/them-moi">
            <Plus className="mr-2 h-4 w-4" />
            Thêm sự kiện mới
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuKien.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Không tìm thấy sự kiện nào</p>
              </div>
            ) : (
              filteredSuKien.map((sk) => (
                <Card key={sk.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{sk.ten_su_kien}</h3>
                          {getStatusBadge(sk.trang_thai)}
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(sk.ngay_bat_dau).toLocaleDateString("vi-VN")}
                              {sk.ngay_ket_thuc && ` - ${new Date(sk.ngay_ket_thuc).toLocaleDateString("vi-VN")}`}
                            </span>
                          </div>
                          {sk.dia_diem && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{sk.dia_diem}</span>
                            </div>
                          )}
                          {sk.so_luong_tham_gia !== undefined && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>{sk.so_luong_tham_gia} người tham gia</span>
                            </div>
                          )}
                        </div>

                        {sk.mo_ta && <p className="mt-3 text-sm line-clamp-2">{sk.mo_ta}</p>}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/su-kien/${sk.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(sk.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
