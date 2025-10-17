"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, Filter, MapPin, Calendar } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

export default function DuAnPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log("🔹 Đang fetch danh sách dự án...")
        const response = await apiClient.getDuAn({})
        console.log("✅ Kết quả API:", response)
        setProjects(response)
      } catch (err: any) {
        console.error("❌ Lỗi khi fetch dự án:", err)
        setError("Không thể tải danh sách dự án. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const paginatedProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 400, behavior: "smooth" }) // Cuộn nhẹ lên đầu
  }

  if (loading)
    return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Các Dự Án Từ Thiện</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Khám phá và đóng góp cho các dự án đang cần sự hỗ trợ của bạn 💗
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Tìm kiếm dự án..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="giao-duc">Giáo dục</SelectItem>
                  <SelectItem value="y-te">Y tế</SelectItem>
                  <SelectItem value="moi-truong">Môi trường</SelectItem>
                  <SelectItem value="tre-em">Trẻ em</SelectItem>
                  <SelectItem value="nguoi-cao-tuoi">Người cao tuổi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {paginatedProjects.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có dự án nào được đăng.</p>
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
                      className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={
                            project.anh_dai_dien?.startsWith("http")
                              ? project.anh_dai_dien
                              : `http://j2ee.oshi.id.vn:5555${project.anh_dai_dien}`
                          }
                          alt={project.tieu_de}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-4 right-4 bg-secondary text-white">
                          {project.trang_thai === "hoat_dong"
                            ? "Đang hoạt động"
                            : "Sắp diễn ra"}
                        </Badge>
                      </div>

                      <CardHeader>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline">
                            {project.muc_do_uu_tien?.replace("_", " ")}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.dia_diem}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{project.tieu_de}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.mo_ta_ngan}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-2">
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
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                            {new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        <Link href={`/du-an/${project.id}`}>
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

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-white/70">
          <p>&copy; 2025 Từ Thiện Việt. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  )
}
