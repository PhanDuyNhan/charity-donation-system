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
import { Calendar, Search } from "lucide-react"
import type { TinTuc } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { getImageUrl, truncateText } from "@/lib/utils"

export default function TinTucPage() {
  const [tinTuc, setTinTuc] = useState<TinTuc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")
  const [page, setPage] = useState(1)
  const pageSize = 9

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await apiClient.getTinTuc()
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

    if (search.trim()) {
      arr = arr.filter((t) =>
        t.tieu_de.toLowerCase().includes(search.toLowerCase())
      )
    }

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
  }, [tinTuc, search, sort])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const featured = filtered[0]
  const subFeatured = filtered.slice(1, 3)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Tin Tức</h1>
          <p className="opacity-80">Cập nhật hoạt động mới nhất</p>

          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-12 bg-white text-black h-12"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>
      </section>

      {/* FEATURED NEWS */}
      <section className="container mx-auto px-4 py-10">
        {featured && (
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Featured Large */}
            <div className="md:col-span-2 relative group">
              <Link href={`/tin-tuc/${featured.id}`}>
                <img
                  src={getImageUrl(featured.anh_dai_dien)}
                  className="w-full h-80 object-cover rounded-xl shadow-lg group-hover:scale-[1.02] transition-transform"
                />
                <h2 className="text-3xl font-bold mt-4 group-hover:text-primary transition">
                  {featured.tieu_de}
                </h2>
                <p className="text-muted-foreground mt-2 line-clamp-3">
                  {truncateText(
                    featured.noi_dung.replace(/<[^>]+>/g, ""),
                    160
                  )}
                </p>
              </Link>
            </div>

            {/* Featured Small */}
            <div className="flex flex-col gap-6">
              {subFeatured.map((item) => (
                <Link
                  href={`/tin-tuc/${item.id}`}
                  key={item.id}
                  className="group"
                >
                  <img
                    src={getImageUrl(item.anh_dai_dien)}
                    className="w-full h-36 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <h3 className="font-semibold mt-3 line-clamp-2 group-hover:text-primary">
                    {item.tieu_de}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SORT OPTIONS */}
        <div className="flex justify-between items-center mt-4 mb-6">
          <h3 className="text-xl font-bold">Danh sách tin tức</h3>

          <select
            className="border p-2 rounded-md"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>

        {/* NEWS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginated.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden hover:shadow-lg transition"
            >
              <Link href={`/tin-tuc/${item.id}`}>
                <img
                  src={getImageUrl(item.anh_dai_dien)}
                  className="h-48 w-full object-cover hover:scale-105 transition-transform"
                />
              </Link>

              <CardHeader>
                <CardTitle className="line-clamp-2 hover:text-primary transition">
                  {item.tieu_de}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(item.ngay_tao).toLocaleDateString("vi-VN")}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                  {truncateText(
                    item.noi_dung.replace(/<[^>]+>/g, ""),
                    120
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="mt-10 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => page > 1 && setPage(page - 1)}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => page < totalPages && setPage(page + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </section>
    </div>
  )
}
