"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AdminTinTucPage() {
  const [tinTuc, setTinTuc] = useState<TinTuc[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTinTuc()
  }, [])

  const fetchTinTuc = async () => {
    try {
      const data = await apiClient.getTinTuc()
      setTinTuc(data)
    } catch (error) {
      console.error("Lỗi khi tải tin tức:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tin tức này?")) return

    try {
      await apiClient.deleteTinTuc(id)
      setTinTuc(tinTuc.filter((tt) => tt.id !== id))
    } catch (error) {
      console.error("Lỗi khi xóa tin tức:", error)
      alert("Không thể xóa tin tức")
    }
  }

  const filteredTinTuc = tinTuc.filter(
    (tt) =>
      tt.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tt.noi_dung?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (trangThai: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      nhap: "outline",
      cho_duyet: "secondary",
      da_xuat_ban: "default",
    }
    const labels: Record<string, string> = {
      nhap: "Nháp",
      cho_duyet: "Chờ duyệt",
      da_xuat_ban: "Đã xuất bản",
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
          <h1 className="text-3xl font-bold">Quản lý Tin tức</h1>
          <p className="text-muted-foreground mt-1">Quản lý các bài viết và tin tức</p>
        </div>
        <Button asChild>
          <Link href="/admin/tin-tuc/them-moi">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tin tức mới
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTinTuc.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Không tìm thấy tin tức nào</p>
              </div>
            ) : (
              filteredTinTuc.map((tt) => (
                <Card key={tt.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {tt.hinh_anh && (
                        <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={tt.hinh_anh || "/placeholder.svg"}
                            alt={tt.tieu_de}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{tt.tieu_de}</h3>
                              {getStatusBadge(tt.trang_thai)}
                            </div>

                            {tt.noi_dung && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tt.noi_dung}</p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(tt.ngay_tao).toLocaleDateString("vi-VN")}</span>
                              </div>
                              {tt.luot_xem !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{tt.luot_xem} lượt xem</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/tin-tuc/${tt.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(tt.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
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
