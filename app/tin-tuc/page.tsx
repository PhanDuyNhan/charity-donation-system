"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, User, Search, ArrowRight } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"
export default function TinTucPage() {
  const [tinTuc, setTinTuc] = useState<TinTuc[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchTinTuc()
  }, [])

  const fetchTinTuc = async () => {
    try {
      const data = await apiClient.get<TinTuc[]>("/tin_tuc", {
        trang_thai: "eq.Đã xuất bản",
        order: "ngay_xuat_ban.desc",
      })
      setTinTuc(data)
    } catch (error) {
      console.error("Lỗi khi tải tin tức:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTinTuc = tinTuc.filter(
    (item) =>
      item.tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mo_ta_ngan?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Tin Tức & Hoạt Động</h1>
            <p className="text-xl text-white/90 mb-8">Cập nhật những hoạt động từ thiện và câu chuyện ý nghĩa</p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white text-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredTinTuc.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Không tìm thấy tin tức nào</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTinTuc.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  {item.hinh_anh && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.hinh_anh || "/placeholder.svg"}
                        alt={item.tieu_de}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-accent text-accent-foreground">{item.loai_tin}</Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {item.tieu_de}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.ngay_xuat_ban).toLocaleDateString("vi-VN")}</span>
                      </div>
                      {item.tac_gia && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{item.tac_gia}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{item.mo_ta_ngan}</p>
                    <Link href={`/tin-tuc/${item.id}`}>
                      <Button variant="ghost" className="group/btn p-0 h-auto">
                        Đọc thêm
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
