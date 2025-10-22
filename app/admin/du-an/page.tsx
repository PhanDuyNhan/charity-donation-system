"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { DuAn, DanhMucDuAn, NguoiDung, QuyenGop, SuKien } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, Calendar as CalendarIcon, XCircle } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// helper: remove diacritics for searching
function removeVietnameseTones(str: string): string {
  return (
    str
      .normalize("NFD")
      .replace(/[̀-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
  )
}

export default function AdminDuAnPage() {
  const router = useRouter()
  const ALL_VALUE = "__all"

  // data
  const [duAns, setDuAns] = useState<DuAn[]>([])
  const [danhMucs, setDanhMucs] = useState<DanhMucDuAn[]>([])
  const [quyenGops, setQuyenGops] = useState<QuyenGop[]>([])
  const [nguoiDungs, setNguoiDungs] = useState<NguoiDung[]>([])
  const [suKiens, setSuKiens] = useState<SuKien[]>([])

  // ui state
  const [loading, setLoading] = useState(false)
  const [loadingDanhMuc, setLoadingDanhMuc] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchAll()
    fetchDanhMuc()
    ;(async () => {
      try {
        const [q, u, s] = await Promise.all([apiClient.getQuyenGop(), apiClient.getNguoiDung(), apiClient.getSuKien()])
        setQuyenGops(Array.isArray(q) ? q : [])
        setNguoiDungs(Array.isArray(u) ? u : [])
        setSuKiens(Array.isArray(s) ? s : [])
      } catch (err) {
        console.error(err)
      }
    })()
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

  // filtered list with robust search (no-diacritics, multi-term)
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
      if (!startDate && !endDate) return true
      const projectStart = d.ngay_bat_dau ? new Date(d.ngay_bat_dau) : null
      const projectEnd = d.ngay_ket_thuc ? new Date(d.ngay_ket_thuc) : null
      if (startDate && projectEnd && projectEnd < startDate) return false
      if (endDate && projectStart && projectStart > endDate) return false
      return true
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [totalPages])

  function resetFilters() {
    setSearch("")
    setCategoryId(undefined)
    setStatusFilter(undefined)
    setStartDate(undefined)
    setEndDate(undefined)
    setCurrentPage(1)
  }

  return (
    // page background: slightly gray (like homepage)
    <div className="min-h-[calc(100vh-48px)] p-6 bg-[#111827] text-white">
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Quản lý Dự Án</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <Plus className="h-4 w-4" /> Thêm dự án
            </Button>
            <Button variant="ghost" className="border border-neutral-700 text-neutral-200" onClick={fetchAll}>
              Tải lại
            </Button>
          </div>
        </div>

        {/* Main column only (no sidebar) */}
        <div className="space-y-6">
          {/* Filters Card */}
          <Card className="bg-[#0f1724] border border-neutral-700 p-0 rounded-md overflow-hidden">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-white text-lg">Tìm kiếm & Bộ lọc</CardTitle>
              <CardDescription className="text-neutral-400">Tìm theo tiêu đề, danh mục, trạng thái và khoảng thời gian</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search size={16} className="text-neutral-300" />
                  <Input
                    className="bg-[#111827] border border-neutral-700 text-white placeholder:text-neutral-500"
                    placeholder="Tìm theo tiêu đề (không dấu)"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>

                <Select
                  onValueChange={(v) => {
                    setCategoryId(v && v !== ALL_VALUE ? Number(v) : undefined)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="min-w-[170px] text-sm bg-[#111827] border border-neutral-700 text-white">
                    <SelectValue placeholder={loadingDanhMuc ? "Đang tải..." : "Danh mục"} />
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

                <Select
                  onValueChange={(v) => {
                    setStatusFilter(v && v !== ALL_VALUE ? v : undefined)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="min-w-[140px] text-sm bg-[#111827] border border-neutral-700 text-white">
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

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="text-sm w-[150px] justify-start text-left font-normal border border-neutral-700 bg-[#111827]">
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
                    <Button variant="outline" className="text-sm w-[150px] justify-start text-left font-normal border border-neutral-700 bg-[#111827]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Ngày kết thúc"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={vi} />
                  </PopoverContent>
                </Popover>

                <div className="flex-1" />

                <Button variant="secondary" className="text-sm flex items-center gap-1" onClick={resetFilters}>
                  <XCircle className="h-4 w-4" /> Xóa bộ lọc
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Table card: put border on the Card so it spans full width */}
          <Card className="bg-[#0f1724] border border-neutral-700 p-0 rounded-md overflow-hidden">
            <CardHeader className="px-6 pt-6 flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">Danh sách dự án</CardTitle>
                <CardDescription className="text-neutral-400">{filtered.length} kết quả</CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={fetchAll} className="border border-neutral-700 text-neutral-200">
                  Tải lại
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* inner area with padding so border touches card edges */}
              <div className="overflow-x-auto bg-[#111827] rounded-b-md">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left text-sm text-neutral-400 border-b border-neutral-700">
                      <th className="py-3 px-6">Tiêu đề</th>
                      <th className="py-3 px-6">Danh mục</th>
                      <th className="py-3 px-6">Ngày bắt đầu</th>
                      <th className="py-3 px-6">Ngày kết thúc</th>
                      <th className="py-3 px-6">Mục tiêu</th>
                      <th className="py-3 px-6">Trạng thái</th>
                      <th className="py-3 px-6">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-sm text-neutral-400">Đang tải...</td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-sm text-neutral-400">Không có dự án</td>
                      </tr>
                    ) : (
                      paginated.map((d) => (
                        <tr key={d.id} className="border-b border-neutral-700 hover:bg-[#0b1220]">
                          <td className="py-4 px-6 max-w-[260px] truncate">{d.tieu_de}</td>
                          <td className="py-4 px-6">{getCategoryName(d.ma_danh_muc)}</td>
                          <td className="py-4 px-6">{d.ngay_bat_dau}</td>
                          <td className="py-4 px-6">{d.ngay_ket_thuc}</td>
                          <td className="py-4 px-6">{Number(d.so_tien_muc_tieu || 0).toLocaleString()}</td>
                          <td className="py-4 px-6">{d.trang_thai}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="text-xs bg-[#0f1724] border border-neutral-700" onClick={() => openEdit(d)}>
                                <Edit2 className="mr-1 h-3.5 w-3.5" /> Sửa
                              </Button>
                              <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleDelete(d)}>
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

              {/* pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-end px-6 py-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
