"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { DuAn, DanhMucDuAn } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, Calendar as CalendarIcon, XCircle } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// ✅ Hàm loại bỏ dấu tiếng Việt để tìm kiếm không dấu
function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

export default function AdminDuAnPage() {
  const router = useRouter()
  const ALL_VALUE = "__all"

  const [duAns, setDuAns] = useState<DuAn[]>([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [month, setMonth] = useState<string>("__all")
  const [year, setYear] = useState<string>("__all")

  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const [danhMucs, setDanhMucs] = useState<DanhMucDuAn[]>([])
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true)

  useEffect(() => {
    fetchAll()
    fetchDanhMuc()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await apiClient.getDuAn()
      setDuAns(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error("Lỗi khi lấy dự án:", err)
      alert("Không thể lấy danh sách dự án.")
    } finally {
      setLoading(false)
    }
  }

  async function fetchDanhMuc() {
    try {
      const res = await apiClient.getDanhMucDuAn()
      setDanhMucs(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error("Lỗi khi lấy danh mục:", err)
    } finally {
      setLoadingDanhMuc(false)
    }
  }

  function openCreate() {
    router.push("/admin/du-an/them")
  }

  function openEdit(item: DuAn) {
    router.push(`/admin/du-an/${item.id}/sua`)
  }

  async function handleDelete(item: DuAn) {
    const ok = confirm(`Bạn có chắc muốn xóa dự án: "${item.tieu_de}" không?`)
    if (!ok) return
    try {
      await apiClient.deleteDuAn(Number(item.id))
      alert("Xóa thành công")
      fetchAll()
    } catch (err) {
      console.error("Xóa thất bại:", err)
      alert("Xóa thất bại.")
    }
  }

  function getCategoryName(ma: number) {
    const found = danhMucs.find((d) => Number(d.id) === Number(ma))
    return found ? found.ten : "—"
  }

  // ✅ Tìm kiếm nâng cao: không dấu, không phân biệt hoa/thường, nhiều từ
  const filtered = duAns
    .filter((d) => {
      if (!search) return true
      const text = removeVietnameseTones(d.tieu_de || "")
      const query = removeVietnameseTones(search)
      return query.split(" ").every((word) => text.includes(word))
    })
    .filter((d) => (categoryId ? Number(d.ma_danh_muc) === categoryId : true))
    .filter((d) => (statusFilter ? String(d.trang_thai) === statusFilter : true))
    .filter((d) => {
      if (month === "__all" && year === "__all") return true
      const startDateObj = d.ngay_bat_dau ? new Date(d.ngay_bat_dau) : null
      const monthMatch = month === "__all" || (startDateObj && startDateObj.getMonth() + 1 === Number(month))
      const yearMatch = year === "__all" || (startDateObj && startDateObj.getFullYear() === Number(year))
      return monthMatch && yearMatch
    })
    .filter((d) => {
      const projectStart = new Date(d.ngay_bat_dau)
      const projectEnd = new Date(d.ngay_ket_thuc)
      if (startDate && projectStart < startDate) return false
      if (endDate && projectEnd > endDate) return false
      return true
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: duAns.length,
    hoat_dong: duAns.filter((d) => d.trang_thai === "hoat_dong").length,
    tam_dung: duAns.filter((d) => d.trang_thai === "tam_dung").length,
    ban_nhap: duAns.filter((d) => d.trang_thai === "ban_nhap").length,
    hoan_thanh: duAns.filter((d) => d.trang_thai === "hoan_thanh").length,
  }

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages])

  function resetFilters() {
    setSearch("")
    setCategoryId(undefined)
    setStatusFilter(undefined)
    setMonth("__all")
    setYear("__all")
    setStartDate(undefined)
    setEndDate(undefined)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý Dự Án</h1>

      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Tổng dự án", stats.total],
          ["Hoạt động", stats.hoat_dong],
          ["Tạm dừng", stats.tam_dung],
          ["Hoàn thành", stats.hoan_thanh],
        ].map(([label, val]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-lg font-medium">{val as string}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bộ lọc */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tìm kiếm & bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <Input
                className="text-sm"
                placeholder="Tìm theo tiêu đề (viết không dấu, nhiều từ)"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            {/* Danh mục */}
            <Select
              onValueChange={(v) => {
                setCategoryId(v && v !== ALL_VALUE ? Number(v) : undefined)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="min-w-[160px] text-sm">
                <SelectValue placeholder={loadingDanhMuc ? "Đang tải danh mục..." : "Danh mục"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                {danhMucs.map((dm) => (
                  <SelectItem key={dm.id} value={String(dm.id)}>
                    {dm.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Trạng thái */}
            <Select
              onValueChange={(v) => {
                setStatusFilter(v && v !== ALL_VALUE ? v : undefined)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="min-w-[140px] text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                <SelectItem value="hoat_dong">Hoạt động</SelectItem>
                <SelectItem value="tam_dung">Tạm dừng</SelectItem>
                <SelectItem value="ban_nhap">Bản nháp</SelectItem>
                <SelectItem value="hoan_thanh">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>

            {/* Lọc theo ngày */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="text-sm w-[150px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Ngày bắt đầu"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={vi} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="text-sm w-[150px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Ngày kết thúc"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={vi} />
              </PopoverContent>
            </Popover>

            <div className="flex-1" />
            <Button
              variant="secondary"
              className="text-sm flex items-center gap-1"
              onClick={resetFilters}
            >
              <XCircle className="h-4 w-4" /> Xóa bộ lọc
            </Button>
            
          </div>
        </CardContent>
      </Card>

      {/* Danh sách */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
  <CardTitle className="text-base font-semibold">
    Danh sách dự án ({filtered.length} kết quả)
  </CardTitle>
  <Button className="text-sm" onClick={openCreate}>
    <Plus className="mr-2 h-4 w-4" /> Thêm dự án
  </Button>
</CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="py-2">Tiêu đề</th>
                  <th className="py-2">Danh mục</th>
                  <th className="py-2">Ngày bắt đầu</th>
                  <th className="py-2">Ngày kết thúc</th>
                  <th className="py-2">Mục tiêu</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-6 text-center text-sm">Đang tải...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-sm">Không có dự án</td></tr>
                ) : (
                  paginated.map((d) => (
                    <tr key={d.id} className="border-b text-sm">
                      <td className="py-2">{d.tieu_de}</td>
                      <td className="py-2">{getCategoryName(d.ma_danh_muc)}</td>
                      <td className="py-2">{d.ngay_bat_dau}</td>
                      <td className="py-2">{d.ngay_ket_thuc}</td>
                      <td className="py-2">{Number(d.so_tien_muc_tieu || 0).toLocaleString()}</td>
                      <td className="py-2">{d.trang_thai}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="text-xs" onClick={() => openEdit(d)}>
                            <Edit2 className="mr-1 h-3.5 w-3.5" /> Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={() => handleDelete(d)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Xóa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
