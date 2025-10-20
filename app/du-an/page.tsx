"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MapPin, Calendar, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

// Hàm loại bỏ dấu để lọc chữ tiếng Việt
function normalizeString(str: string) {
  return str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

export default function DuAnPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [provinces, setProvinces] = useState<any[]>([])

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("__all")
  const [province, setProvince] = useState("__all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const itemsPerPage = 6

  useEffect(() => {
    const loadData = async () => {
      try {
        const [duAnRes, danhMucRes, provRes] = await Promise.all([
          apiClient.getDuAn({}),
          apiClient.getDanhMucDuAn(),
          fetch("https://provinces.open-api.vn/api/?depth=1").then((r) => r.json()),
        ])
        setProjects(duAnRes)
        setFilteredProjects(duAnRes)
        setCategories(danhMucRes)
        setProvinces(provRes)
      } catch (err) {
        console.error("❌ Lỗi khi fetch dữ liệu:", err)
        setError("Không thể tải danh sách dự án.")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Lọc dữ liệu
  useEffect(() => {
    let filtered = [...projects]

    if (search.trim()) {
      const keyword = normalizeString(search)
      filtered = filtered.filter(
        (p) =>
          normalizeString(p.tieu_de || "").includes(keyword) ||
          normalizeString(p.mo_ta_ngan || "").includes(keyword)
      )
    }

    if (category !== "__all") {
      filtered = filtered.filter((p) => String(p.ma_danh_muc) === category)
    }

    if (province !== "__all") {
      const normalizedProvince = normalizeString(province)
      filtered = filtered.filter((p) =>
        normalizeString(p.dia_diem || "").includes(normalizedProvince)
      )
    }

    if (startDate) {
      filtered = filtered.filter((p) => new Date(p.ngay_bat_dau) >= new Date(startDate))
    }

    if (endDate) {
      filtered = filtered.filter((p) => new Date(p.ngay_ket_thuc) <= new Date(endDate))
    }

    setFilteredProjects(filtered)
    setCurrentPage(1)
  }, [search, category, province, startDate, endDate, projects])

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 400, behavior: "smooth" })
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4 text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Các Dự Án Từ Thiện</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá và đóng góp cho các dự án đang cần sự hỗ trợ của bạn 💗
          </p>
        </div>

        {/* Bộ lọc */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-muted/20 rounded-lg p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm dự án..."
                  className="pl-9 h-9 text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setCategory("__all")
                  setProvince("__all")
                  setStartDate("")
                  setEndDate("")
                }}
                className="text-sm flex items-center gap-2 h-9 px-3"
              >
                <XCircle className="w-4 h-4" /> Xóa bộ lọc
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              {/* Danh mục */}
              <div>
                <label className="text-[13px] font-semibold mb-1 flex items-center gap-1">
                  <Filter className="w-4 h-4 text-primary" /> Danh mục
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">Tất cả</SelectItem>
                    {categories.map((dm) => (
                      <SelectItem key={dm.id} value={String(dm.id)}>
                        {dm.ten}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Địa điểm */}
              <div>
                <label className="text-[13px] font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" /> Địa điểm
                </label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Chọn tỉnh/thành" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">Tất cả</SelectItem>
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label className="text-[13px] font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" /> Từ ngày
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Ngày kết thúc */}
              <div>
                <label className="text-[13px] font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" /> Đến ngày
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Số dự án */}
              <div className="flex items-end justify-end">
                <div className="bg-primary/10 text-primary font-medium text-sm px-3 py-1.5 rounded-full inline-flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  {filteredProjects.length} dự án
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách dự án */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {filteredProjects.length === 0 ? (
            <p className="text-center text-gray-500">Không tìm thấy dự án phù hợp.</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {paginatedProjects.map((project) => {
                  const progress =
                    project.so_tien_muc_tieu > 0
                      ? (project.so_tien_hien_tai / project.so_tien_muc_tieu) * 100
                      : 0

                  return (
                    <Card
                      key={project.id}
                      className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
                    >
                      {/* Ảnh & trạng thái */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            project.anh_dai_dien?.startsWith("https")
                              ? project.anh_dai_dien
                              : `https://j2ee.oshi.id.vn${project.anh_dai_dien}`
                          }
                          alt={project.tieu_de}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 right-4 bg-secondary text-white shadow-md">
                          {project.trang_thai === "hoat_dong" ? "Đang hoạt động" : "Sắp diễn ra"}
                        </Badge>
                      </div>

                      {/* Nội dung */}
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline">
                            {project.muc_do_uu_tien?.replace("_", " ")}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.dia_diem}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{project.tieu_de}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.mo_ta_ngan}
                        </CardDescription>
                      </CardHeader>

                      {/* Tiến độ + nút quyên góp */}
                      <CardContent className="flex flex-col justify-between flex-1 space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Đã quyên góp</span>
                            <span className="font-semibold text-primary">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary/20 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">
                              {project.so_tien_hien_tai.toLocaleString("vi-VN")} đ
                            </span>
                            <span className="text-muted-foreground">
                              / {project.so_tien_muc_tieu.toLocaleString("vi-VN")} đ
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                              {new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>

                        <Link href={`/du-an/${project.id}`} className="mt-auto">
                          <Button className="w-full">Quyên Góp Ngay</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="justify-center py-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) handlePageChange(currentPage - 1)
                        }}
                        className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        className={
                          currentPage === totalPages ? "opacity-50 pointer-events-none" : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="bg-foreground text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-white/70">
          © 2025 Từ Thiện Việt. Tất cả quyền được bảo lưu.
        </div>
      </footer>
    </div>
  )
}
