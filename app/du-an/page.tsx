"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, MapPin, Calendar, XCircle, Clock, Heart } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

// Map donation totals per project
type ProjectDonationMap = Record<number, number>

// Format tiền VNĐ - đảm bảo số dương và format nhất quán (giống trang chủ)
function formatMoney(n: number | undefined | null): string {
  const amount = Math.abs(n || 0)

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)} triệu`
  }
  if (amount >= 1_000) {
    return `${new Intl.NumberFormat("vi-VN").format(amount)} đ`
  }
  return `${amount} đ`
}

// Tính số ngày còn lại
function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Kiểm tra dự án hết hạn
function isProjectExpired(endDate: string): boolean {
  return getDaysRemaining(endDate) < 0
}

// Hàm loại bỏ dấu tiếng Việt và chuẩn hoá
function normalizeString(str: string | undefined) {
  return (
    (str ?? "")
      .normalize?.("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim() ?? ""
  )
}

// Lấy ảnh chính (hỗ trợ string hoặc array)
function getFirstImage(thuvien: string | string[] | undefined): string {
  if (!thuvien) return "/placeholder.svg"
  if (Array.isArray(thuvien)) {
    const first = thuvien.length > 0 ? thuvien[0] : ""
    if (!first) return "/placeholder.svg"
    return first.startsWith("http") ? first : `https://j2ee.oshi.id.vn${first}`
  }
  return thuvien.startsWith("http") ? thuvien : `https://j2ee.oshi.id.vn${thuvien}`
}

// Hàm detect tỉnh/thành từ chuỗi dia_diem dựa vào danh sách provinces
function detectProvinceFromDiaDiem(diaDiem: string | undefined, provinces: any[]): string | null {
  if (!diaDiem) return null
  const text = normalizeString(diaDiem)

  // 1) thử tìm bằng các trường phổ biến từ provinces
  for (const p of provinces) {
    const candidates: string[] = []
    if (p.name) candidates.push(String(p.name))
    if (p.name_with_type) candidates.push(String(p.name_with_type))
    if (p.code) candidates.push(String(p.code))
    // sometimes provinces API has "slug" or other fields
    if (p.slug) candidates.push(String(p.slug))
    for (const c of candidates) {
      const n = normalizeString(c)
      if (!n) continue
      if (text.includes(n)) {
        return p.name // trả về tên chính thức từ API (p.name)
      }
    }
  }

  // 2) thử các viết tắt / alias thường gặp
  const aliases: Record<string, string> = {
    "tp.hcm": "Thành phố Hồ Chí Minh",
    "tphcm": "Thành phố Hồ Chí Minh",
    "hcm": "Thành phố Hồ Chí Minh",
    "tp.hanoi": "Hà Nội",
    "tp.hn": "Hà Nội",
    "hn": "Hà Nội",
    "tp.hue": "Thừa Thiên Huế",
    "tp.hcm.": "Thành phố Hồ Chí Minh",
    // thêm alias nếu cần
  }

  for (const [k, v] of Object.entries(aliases)) {
    if (text.includes(normalizeString(k))) return v
  }

  // 3) fallback: thử match phần cuối chuỗi (ví dụ "..., Lao Cai")
  const parts = diaDiem.split(",").map((s) => normalizeString(s))
  if (parts.length > 0) {
    const last = parts[parts.length - 1]
    if (last) {
      // thử tìm province có phần normalized trùng last
      for (const p of provinces) {
        if (normalizeString(p.name) === last || normalizeString(p.name_with_type || "") === last) {
          return p.name
        }
      }
    }
  }

  return null
}

export default function DuAnPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [provinces, setProvinces] = useState<any[]>([])
  const [projectDonations, setProjectDonations] = useState<ProjectDonationMap>({})

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

        // detect province cho từng project
        const enrichedProjects = (duAnRes || []).map((p: any) => {
          const detected = detectProvinceFromDiaDiem(p.dia_diem, provRes || [])
          return {
            ...p,
            // thêm trường tiêu chuẩn để filter: detectedProvince là tên tỉnh đầy đủ từ API provinces nếu tìm được
            detectedProvince: detected, // có thể null
            // normalize copy để filter nhanh
            _normalized_dia_diem: normalizeString(p.dia_diem),
            _normalized_detectedProvince: detected ? normalizeString(detected) : null,
          }
        })

        setProjects(enrichedProjects)
        setFilteredProjects(enrichedProjects)
        setCategories(danhMucRes)
        setProvinces(provRes)

        // Fetch donations for each project from quyen_gop API
        const donationMap: ProjectDonationMap = {}
        await Promise.all(
          (duAnRes || []).map(async (project: any) => {
            try {
              const donations = await apiClient.getQuyenGop({
                ma_du_an: `eq.${project.id}`,
                trang_thai_: `eq.thanh_cong`,
                select: "so_tien,so_tien_thuc",
              })
              // Tính tổng: ưu tiên so_tien_thuc nếu có, không thì dùng so_tien
              const total = Array.isArray(donations)
                ? donations.reduce((sum, d: any) => sum + (d.so_tien_thuc || d.so_tien || 0), 0)
                : 0
              donationMap[project.id] = total
            } catch (err) {
              console.error(`Error fetching donations for project ${project.id}:`, err)
              donationMap[project.id] = 0
            }
          })
        )
        setProjectDonations(donationMap)
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

    // Tìm kiếm (tiêu đề + mo_ta)
    if (search.trim()) {
      const keyword = normalizeString(search)
      filtered = filtered.filter(
        (p) =>
          normalizeString(p.tieu_de || "").includes(keyword) ||
          normalizeString(p.mo_ta || "").includes(keyword)
      )
    }

    // Danh mục
    if (category !== "__all") {
      filtered = filtered.filter((p) => String(p.ma_danh_muc) === category)
    }

    // Địa điểm: so sánh bằng detectedProvince nếu có, nếu không thì fallback includes trên dia_diem
    if (province !== "__all") {
      const normalizedProvince = normalizeString(province)
      filtered = filtered.filter((p) => {
        const detectedNorm = p._normalized_detectedProvince
        if (detectedNorm) {
          return detectedNorm === normalizedProvince
        }
        // fallback: nếu detected không có -> check raw dia_diem
        return (p._normalized_dia_diem || "").includes(normalizedProvince)
      })
    }

    // Thời gian
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
      {/* Hero & Filter UI (giữ nguyên như trước) */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4 text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Các Dự Án Từ Thiện</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Khám phá và đóng góp cho các dự án đang cần sự hỗ trợ của bạn 💗
          </p>
        </div>

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

      {/* Danh sách */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {filteredProjects.length === 0 ? (
            <p className="text-center text-gray-500">Không tìm thấy dự án phù hợp.</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {paginatedProjects.map((project) => {
                  // Lấy số tiền đã quyên góp từ API
                  const donatedAmount = projectDonations[project.id] || 0
                  const targetAmount = project.so_tien_muc_tieu || 0
                  const progress = targetAmount > 0 ? Math.min(Math.round((donatedAmount / targetAmount) * 100), 100) : 0

                  const mainImage = getFirstImage(project.thu_vien_anh)

                  // Tìm tên danh mục
                  const categoryObj = categories.find(
                    (c) => c.id === project.ma_danh_muc || c.ma_danh_muc === project.ma_danh_muc
                  )
                  const categoryName = categoryObj?.ten || "Dự án"

                  // Kiểm tra hết hạn và số ngày còn lại
                  const daysRemaining = getDaysRemaining(project.ngay_ket_thuc)
                  const isExpired = isProjectExpired(project.ngay_ket_thuc)
                  const isUrgent = project.muc_do_uu_tien === "khan_cap"

                  // Tách địa điểm - lấy phần cuối
                  const locationParts = project.dia_diem?.split(",").map((s: string) => s.trim()) || []
                  const mainLocation = locationParts[locationParts.length - 1] || project.dia_diem || "Việt Nam"

                  return (
                    <Card
                      key={project.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={mainImage}
                          alt={project.tieu_de}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Badge danh mục */}
                        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                          {categoryName}
                        </div>

                        {/* Badge khẩn cấp */}
                        {isUrgent && !isExpired && (
                          <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                            🔥 Khẩn Cấp
                          </div>
                        )}

                        {/* Badge hết hạn - overlay toàn bộ ảnh */}
                        {isExpired && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                              Đã kết thúc
                            </span>
                          </div>
                        )}
                      </div>

                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                          {project.tieu_de}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {mainLocation}
                          </span>
                          {!isExpired && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Còn {daysRemaining} ngày
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-col justify-between flex-1 space-y-4 pt-0">
                        <div className="space-y-2">
                          {/* Thanh tiến độ */}
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary to-green-500 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          {/* Thông tin số tiền */}
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-muted-foreground">Đã đạt</p>
                              <p className="font-bold text-primary text-lg">{formatMoney(donatedAmount)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Mục tiêu</p>
                              <p className="font-semibold">{formatMoney(targetAmount)}</p>
                            </div>
                          </div>

                          {/* Phần trăm */}
                          <div className="text-center">
                            <span className="inline-block bg-gray-100 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                              {progress}% hoàn thành
                            </span>
                          </div>
                        </div>

                        {/* Nút quyên góp */}
                        <Link href={`/du-an/${project.id}`} className="mt-auto">
                          {isExpired ? (
                            <Button
                              className="w-full bg-gray-400 cursor-not-allowed"
                              disabled
                            >
                              Chiến dịch đã kết thúc
                            </Button>
                          ) : (
                            <Button className="w-full bg-primary hover:bg-primary/90 transition-colors">
                              <Heart className="w-4 h-4 mr-2" />
                              Quyên Góp Ngay
                            </Button>
                          )}
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

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
