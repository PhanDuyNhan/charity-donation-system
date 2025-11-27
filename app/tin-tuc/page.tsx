"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, Search, Clock, User, Eye, ArrowRight, Tag } from "lucide-react"
import type { TinTuc } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { getImageUrl, truncateText } from "@/lib/utils"

// Map chuyên mục
const CHUYEN_MUC_MAP: Record<string, string> = {
  tin_tuc: "Tin tức",
  su_kien: "Sự kiện",
  cau_chuyen_thanh_cong: "Câu chuyện thành công",
  thong_bao: "Thông báo",
}

// Format ngày
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Tính thời gian đã đăng
function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return formatDate(dateStr)
}

export default function TinTucPage() {
  const [tinTuc, setTinTuc] = useState<TinTuc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await apiClient.getTinTuc({ order: "ngay_tao.desc" })
      setTinTuc(res)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Filtering + Sorting
  const filtered = useMemo(() => {
    let arr = [...tinTuc]

    // Filter theo chuyên mục
    if (selectedCategory !== "all") {
      arr = arr.filter((t) => (t as any).chuyen_muc === selectedCategory)
    }

    // Filter theo search
    if (search.trim()) {
      arr = arr.filter((t) =>
        t.tieu_de.toLowerCase().includes(search.toLowerCase()) ||
        t.noi_dung?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort
    if (sort === "newest") {
      arr.sort(
        (a, b) =>
          new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime()
      )
    } else {
      arr.sort(
        (a, b) =>
          new Date(a.ngay_tao).getTime() - new Date(b.ngay_tao).getTime()
      )
    }

    return arr
  }, [tinTuc, search, sort, selectedCategory])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  // Tin nổi bật - lấy từ danh sách đã filter
  const featured = filtered[0]
  const subFeatured = filtered.slice(1, 3)

  // Danh sách hiển thị (bỏ qua 3 tin nổi bật nếu ở trang 1)
  const displayList = page === 1 ? filtered.slice(3) : paginated

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero skeleton */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Tin Tức & Hoạt Động</h1>
            <p className="opacity-80">Cập nhật những tin tức và hoạt động mới nhất</p>
          </div>
        </section>
        {/* Loading spinner */}
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Đang tải tin tức...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Tin Tức & Hoạt Động</h1>
          <p className="opacity-80 text-lg">Cập nhật những tin tức và hoạt động mới nhất từ cộng đồng</p>

          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              className="pl-12 bg-white text-black h-12 rounded-full shadow-lg"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Button
              variant={selectedCategory === "all" ? "secondary" : "outline"}
              size="sm"
              className={selectedCategory === "all" ? "bg-white text-primary" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}
              onClick={() => { setSelectedCategory("all"); setPage(1) }}
            >
              Tất cả
            </Button>
            {Object.entries(CHUYEN_MUC_MAP).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "secondary" : "outline"}
                size="sm"
                className={selectedCategory === key ? "bg-white text-primary" : "bg-white/20 text-white border-white/30 hover:bg-white/30"}
                onClick={() => { setSelectedCategory(key); setPage(1) }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED NEWS - chỉ hiển thị ở trang 1 và khi không search */}
      {page === 1 && !search && featured && (
        <section className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Featured Large */}
            <div className="md:col-span-2 relative group">
              <Link href={`/tin-tuc/${featured.id}`} className="block">
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={getImageUrl(featured.anh_dai_dien)}
                    alt={featured.tieu_de}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge */}
                  {(featured as any).chuyen_muc && (
                    <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {CHUYEN_MUC_MAP[(featured as any).chuyen_muc] || (featured as any).chuyen_muc}
                    </span>
                  )}

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2 group-hover:text-primary-foreground transition">
                      {featured.tieu_de}
                    </h2>
                    <p className="text-white/80 line-clamp-2 mb-3">
                      {truncateText(featured.noi_dung?.replace(/<[^>]+>/g, "") || "", 160)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {timeAgo(featured.ngay_tao)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Featured Small */}
            <div className="flex flex-col gap-4">
              {subFeatured.map((item) => (
                <Link
                  href={`/tin-tuc/${item.id}`}
                  key={item.id}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-lg shadow-md">
                    <img
                      src={getImageUrl(item.anh_dai_dien)}
                      alt={item.tieu_de}
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white line-clamp-2 group-hover:text-primary-foreground">
                        {item.tieu_de}
                      </h3>
                      <span className="text-xs text-white/70 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(item.ngay_tao)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWS LIST */}
      <section className="container mx-auto px-4 py-10">
        {/* Header & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold">
              {search ? `Kết quả tìm kiếm: "${search}"` : "Tất cả bài viết"}
            </h3>
            <p className="text-muted-foreground">
              {filtered.length} bài viết {selectedCategory !== "all" && `trong "${CHUYEN_MUC_MAP[selectedCategory]}"`}
            </p>
          </div>

          <select
            className="border p-2 px-4 rounded-lg bg-background"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy bài viết</h3>
            <p className="text-muted-foreground mb-4">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            <Button onClick={() => { setSearch(""); setSelectedCategory("all") }}>
              Xem tất cả bài viết
            </Button>
          </div>
        )}

        {/* NEWS GRID */}
        {displayList.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayList.slice(0, pageSize).map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-md"
              >
                <Link href={`/tin-tuc/${item.id}`} className="block">
                  <div className="relative overflow-hidden">
                    <img
                      src={getImageUrl(item.anh_dai_dien)}
                      alt={item.tieu_de}
                      className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category badge */}
                    {(item as any).chuyen_muc && (
                      <span className="absolute top-3 left-3 bg-primary/90 text-white px-2 py-1 rounded text-xs font-medium">
                        {CHUYEN_MUC_MAP[(item as any).chuyen_muc] || (item as any).chuyen_muc}
                      </span>
                    )}
                  </div>
                </Link>

                <CardHeader className="pb-2">
                  <Link href={`/tin-tuc/${item.id}`}>
                    <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                      {item.tieu_de}
                    </CardTitle>
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(item.ngay_tao)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {truncateText(item.noi_dung?.replace(/<[^>]+>/g, "") || "", 120)}
                  </p>
                  <Link
                    href={`/tin-tuc/${item.id}`}
                    className="text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Đọc tiếp
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(page - 1)
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={page === i + 1}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(i + 1)
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage(page + 1)
                    }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>
    </div>
  )
}
