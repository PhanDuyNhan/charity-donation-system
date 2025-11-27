"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Search, Plus, Edit, Trash2, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AdminTinTucPage() {
  const [tinTuc, setTinTuc] = useState<TinTuc[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await apiClient.getTinTuc()
      setTinTuc(data)
    } catch (error) {
      console.error("Lỗi load tin tức:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa tin tức này?")) return

    try {
      await apiClient.deleteTinTuc(id)
      setTinTuc((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      alert("Không thể xóa tin tức!")
    }
  }

  const filtered = tinTuc.filter(
    (t) =>
      t.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.noi_dung.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tin tức</h1>
          <p className="text-muted-foreground">Danh sách bài viết</p>
        </div>

        <Button asChild>
          <Link href="/admin/tin-tuc/them-moi">
            <Plus className="w-4 h-4 mr-1" />
            Thêm mới
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, nội dung..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              Không tìm thấy kết quả nào
            </p>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="flex gap-4 p-4">
                    {/* Ảnh */}
                    <div className="w-32 h-32 relative rounded-lg overflow-hidden border">
                      <Image
                        src={item.anh_dai_dien || "/placeholder.svg"}
                        alt={item.tieu_de}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold">{item.tieu_de}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 my-2">
                        {item.noi_dung}
                      </p>

                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.ngay_tao).toLocaleDateString("vi-VN")}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/tin-tuc/${item.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
