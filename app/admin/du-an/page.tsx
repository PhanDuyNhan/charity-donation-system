"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { DuAn, DanhMucDuAn, NguoiDung, QuyenGop, SuKien, GiaiNgan } from "@/lib/types"
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

// NEW imports for added UI pieces
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import GiaiNganModal from "@/components/du-an/GiaiNganModalProps"
import { DanhSachGiaiNganModal } from "@/components/du-an/DanhSachGiaiNganModal"

//
// helper: remove Vietnamese tones for searching
//
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

  // selection state for checkboxes
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [showGiaiNganModal, setShowGiaiNganModal] = useState(false)
  const [selectedDuAn, setSelectedDuAn] = useState<DuAn | null>(null)
  console.log("showGiaingnaModal", showGiaiNganModal)
  const [showDanhSachGiaiNganModal, setShowDanhSachGiaiNganModal] = useState(false)
  const [selectedGiaiNganList, setSelectedGiaiNganList] = useState<GiaiNgan[]>([])
  const [selectedDuAnTitle, setSelectedDuAnTitle] = useState("")
  const [loadingGiaiNgan, setLoadingGiaiNgan] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchDanhMuc()
      ; (async () => {
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
      const paramsToFetch = {
        select: "*,giai_ngan(*)"
      };
      const res = await apiClient.getDuAn(paramsToFetch)
      console.log("ressssssssssssssss", res)
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

  // Filtered list
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
      const start = d.ngay_bat_dau ? new Date(d.ngay_bat_dau) : null
      const end = d.ngay_ket_thuc ? new Date(d.ngay_ket_thuc) : null
      if (startDate && end && end < startDate) return false
      if (endDate && start && start > endDate) return false
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
    setSelectedIds([])
  }

  // --- Selection helpers ---
  const isAllPageSelected = paginated.length > 0 && paginated.every((p) => selectedIds.includes(Number(p.id)))
  const isSomeSelected = selectedIds.length > 0

  function toggleSelectOne(id: number, checked?: boolean) {
    setSelectedIds((prev) => {
      const has = prev.includes(id)
      if (typeof checked === "boolean") {
        if (checked && !has) return [...prev, id]
        if (!checked && has) return prev.filter((x) => x !== id)
        return prev
      } else {
        // toggle
        return has ? prev.filter((x) => x !== id) : [...prev, id]
      }
    })
  }

  function toggleSelectAllOnPage(checked: boolean) {
    if (checked) {
      // add all paginated ids that aren't already selected
      setSelectedIds((prev) => {
        const add = paginated.map((p) => Number(p.id)).filter((id) => !prev.includes(id))
        return [...prev, ...add]
      })
    } else {
      // remove all paginated ids from selection
      setSelectedIds((prev) => prev.filter((id) => !paginated.some((p) => Number(p.id) === id)))
    }
  }

  // Bulk actions
  async function handleBulkDelete() {
    if (selectedIds.length === 0) {
      alert("Chưa chọn dự án nào.")
      return
    }
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} dự án đã chọn không?`)) return
    try {
      // call delete API for each selected id
      await Promise.all(selectedIds.map((id) => apiClient.deleteDuAn(Number(id))))
      alert("Xóa thành công.")
      setSelectedIds([])
      fetchAll()
    } catch (err) {
      console.error("Lỗi xóa hàng loạt:", err)
      alert("Xóa thất bại.")
    }
  }

  // open Giai Ngan modal
  function openGiaiNganModal(duAn: DuAn) {
    setSelectedDuAn(duAn)
    setShowGiaiNganModal(true)
  }

  // open modal chi tiet giai ngan 
  async function openDanhSachGiaiNganModal(duAn: DuAn) {
    setLoadingGiaiNgan(true)
    try {
      // Gọi API để lấy danh sách giải ngân của dự án
      const response = await apiClient.getChiTietGiaiNgan({
        ma_du_an: `eq.${duAn.id}`,
        select: '*,chi_tiet_giai_ngan_ma_giai_ngan_fkey(*)'
      })

      console.log("Danh sách giải ngân:", response)

      if (response && Array.isArray(response) && response.length > 0) {
        setSelectedGiaiNganList(response)
        setSelectedDuAnTitle(duAn.tieu_de)
        setShowDanhSachGiaiNganModal(true)
      } else {
        alert('Dự án này chưa có giải ngân nào')
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin giải ngân:', err)
      alert('Không thể lấy thông tin giải ngân')
    } finally {
      setLoadingGiaiNgan(false)
    }
  }

  function exportSelectedToCSV() {
    if (selectedIds.length === 0) {
      alert("Chưa chọn dự án nào để xuất.")
      return
    }
    const rows = duAns
      .filter((d) => selectedIds.includes(Number(d.id)))
      .map((d) => ({
        id: d.id,
        tieu_de: d.tieu_de,
        danh_muc: getCategoryName(d.ma_danh_muc),
        ngay_bat_dau: d.ngay_bat_dau,
        ngay_ket_thuc: d.ngay_ket_thuc,
        so_tien_muc_tieu: d.so_tien_muc_tieu,
        trang_thai: d.trang_thai,
      }))

    const header = Object.keys(rows[0] || {}).join(",")
    const csv = [header, ...rows.map((r) => Object.values(r).map((v) => `"${String(v ?? "")}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `du-an-export-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Stats for top cards
  const stats = useMemo(() => {
    const total = duAns.length
    const hoat_dong = duAns.filter((d) => d.trang_thai === "hoat_dong").length
    const hoan_thanh = duAns.filter((d) => d.trang_thai === "hoan_thanh").length
    const tam_dung = duAns.filter((d) => d.trang_thai === "tam_dung").length
    return { total, hoat_dong, hoan_thanh, tam_dung }
  }, [duAns])


  // handle Giai Ngan
  async function handleGiaiNgan(data: any) {
    try {
      // Gọi API giải ngân
      const response = await apiClient.createGiaiNgan(data) 
      alert("Giải ngân thành công!")
      fetchAll() 
      return response;
    } catch (err) {
      console.error("Lỗi giải ngân:", err)
      throw err
    }
  }

  async function handleChiTietGiaiNgan(data: any) {
    try {
      // Gọi API giải ngân
      const response = await apiClient.createChiTietGiaiNgan(data) // Thay bằng API thực tế của bạn
      // fetchAll() // Tải lại danh sách dự án
      return response;
    } catch (err) {
      console.error("Lỗi giải ngân:", err)
      throw err
    }
  }


  return (
    <div className="min-h-[calc(100vh-48px)] p-6 bg-[#111827] text-white">
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold">Quản lý Dự Án</h1>
          <div className="flex items-center gap-3">
            <Button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <Plus className="h-4 w-4" /> Thêm dự án
            </Button>
           
          </div>
        </div>

        {/* --- Stats cards --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="admin-card bg-[#0f1724] border border-neutral-700 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Tổng dự án</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="text-neutral-300 text-xl">📚</div>
            </CardContent>
          </Card>

          <Card className="admin-card bg-[#0f1724] border border-neutral-700 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Đang hoạt động</p>
                <p className="text-2xl font-bold">{stats.hoat_dong}</p>
              </div>
              <div className="text-neutral-300 text-xl">⚡️</div>
            </CardContent>
          </Card>

          <Card className="admin-card bg-[#0f1724] border border-neutral-700 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Hoàn thành</p>
                <p className="text-2xl font-bold">{stats.hoan_thanh}</p>
              </div>
              <div className="text-neutral-300 text-xl">✅</div>
            </CardContent>
          </Card>

          <Card className="admin-card bg-[#0f1724] border border-neutral-700 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Tạm dừng</p>
                <p className="text-2xl font-bold">{stats.tam_dung}</p>
              </div>
              <div className="text-neutral-300 text-xl">⏸️</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="admin-card bg-[#0f1724] border border-neutral-700 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tìm kiếm & Bộ lọc</CardTitle>
            <CardDescription className="text-neutral-400">Tìm theo tiêu đề, danh mục, trạng thái và khoảng thời gian</CardDescription>
          </CardHeader>
          <CardContent>
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

              {/* Danh mục */}
              <Select onValueChange={(v) => { setCategoryId(v && v !== ALL_VALUE ? Number(v) : undefined); setCurrentPage(1) }}>
                <SelectTrigger className="min-w-[160px] text-sm bg-[#111827] border border-neutral-700 text-white">
                  <SelectValue placeholder={loadingDanhMuc ? "Đang tải..." : "Danh mục"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                  {danhMucs.map((dm) => (
                    <SelectItem key={dm.id} value={String(dm.id)}>{dm.ten}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Trạng thái */}
              <Select onValueChange={(v) => { setStatusFilter(v && v !== ALL_VALUE ? v : undefined); setCurrentPage(1) }}>
                <SelectTrigger className="min-w-[150px] text-sm bg-[#111827] border border-neutral-700 text-white">
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

              {/* Ngày */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`text-sm w-[150px] justify-start border border-neutral-700 bg-[#111827] ${startDate ? "ring-1 ring-green-500" : ""}`}>
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
                  <Button variant="outline" className={`text-sm w-[150px] justify-start border border-neutral-700 bg-[#111827] ${endDate ? "ring-1 ring-green-500" : ""}`}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Ngày kết thúc"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={vi} />
                </PopoverContent>
              </Popover>

              <div className="flex-1" />
              <Button variant="secondary" className="text-sm flex items-center gap-1 hover:bg-[#1f2937]" onClick={resetFilters}>
                <XCircle className="h-4 w-4" /> Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table with selection, hovercard, dropdown action */}
        <Card className="admin-card bg-[#0f1724] border border-neutral-700 shadow-md">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Danh sách dự án</CardTitle>
              <CardDescription className="text-neutral-400">{filtered.length} kết quả</CardDescription>
            </div>

            <div className="flex items-center gap-2">
        
              {/* Bulk actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={exportSelectedToCSV} disabled={!isSomeSelected} className="text-sm" >
                  Xuất CSV
                </Button>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={!isSomeSelected} className="text-sm">
                  Xóa đã chọn
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto bg-[#111827] rounded-b-md">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-neutral-400 border-b border-neutral-700">
                    <th className="py-3 px-4">
                      <Checkbox
                        checked={isAllPageSelected}
                        onCheckedChange={(v) => toggleSelectAllOnPage(Boolean(v))}
                      />
                    </th>
                    <th className="py-3 px-6">Tiêu đề</th>
                    <th className="py-3 px-6">Danh mục</th>
                    {/* <th className="py-3 px-6">Ngày bắt đầu</th> */}
                    {/* <th className="py-3 px-6">Ngày kết thúc</th> */}
                    <th className="py-3 px-6">Thời gian</th>

                    <th className="py-3 px-6">Mục tiêu</th>
                    <th className="py-3 px-6">Số tiền quyên góp hiện tại</th>
                    <th className="py-3 px-6">Số tiền đã giải ngân</th>

                    <th className="py-3 px-6">Trạng thái</th>
                    <th className="py-3 px-6 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="py-6 text-center text-sm text-neutral-400">Đang tải...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center">
                        <div className="space-y-3">
                          <p className="text-neutral-400">Không có dự án khớp.</p>
                          <Button onClick={openCreate}>Tạo dự án mới</Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginated.map((d) => (
                      <tr key={d.id} className="border-b border-neutral-700 hover:bg-[#0b1220] transition-colors text-neutral-300"> {/* Áp dụng màu chữ nhạt cho toàn bộ hàng */}
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedIds.includes(Number(d.id))}
                            onCheckedChange={(v) => toggleSelectOne(Number(d.id), Boolean(v))}
                          />
                        </td>

                        {/* HoverCard around title (truncate + preview) */}
                        <td className="py-3 px-6 max-w-[200px] text-base font-medium"> {/* Giữ tiêu đề rõ ràng */}
                          <HoverCard>
                            <HoverCardTrigger>
                              <div className="truncate cursor-help text-xs">{d.tieu_de}</div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72 p-3 bg-neutral-800 border-neutral-700 shadow-xl"> {/* Tăng độ tương phản cho HoverCard */}
                              <p className="text-sm text-neutral-200">{d.mo_ta ?? "Không có mô tả"}</p>
                              <div className="mt-2 text-xs text-neutral-400 font-light">Người tạo: {d.nguoi_tao ?? "—"}</div> {/* Chữ nhỏ hơn, mỏng hơn */}
                              <div className="text-xs text-neutral-400 font-light">ID: {d.id}</div> {/* Chữ nhỏ hơn, mỏng hơn */}
                            </HoverCardContent>
                          </HoverCard>
                        </td>

                        <td className="py-3 px-6 text-xs">{getCategoryName(d.ma_danh_muc)}</td> {/* Cột Danh mục - làm nhỏ hơn */}
                        <td className="py-3 px-6 text-xs">{d.ngay_bat_dau} {'->'} {d.ngay_ket_thuc}</td> {/* Cột Ngày - làm nhỏ hơn và mỏng hơn */}
                        <td className="py-3 px-6 text-xs">{Number(d.so_tien_muc_tieu || 0).toLocaleString()}</td> {/* Cột Số tiền - làm nhỏ hơn, dùng font monospace để căn chỉnh số đẹp hơn */}
                        <td className="py-3 px-6 text-xs">{Number(d.so_tien_hien_tai || 0).toLocaleString()}</td> {/* Cột Số tiền hiện tại - làm nhỏ hơn, màu nổi bật */}
                        <td className="py-3 px-6 text-xs">
                          {d?.giai_ngan && d.giai_ngan.length > 0 ? (

                            Number(
                              (d?.giai_ngan?.reduce((sum, item) => sum + (item.so_tien || 0), 0) || 0)
                            ).toLocaleString()
                          ) : 
                            Number(d?.so_tien_hien_tai).toLocaleString()
                          }
                        </td>

                        <td className="py-3 px-6">
                          <span className={`inline-block px-2 py-0.5 text-[8px] uppercase font-semibold rounded-full 
        whitespace-nowrap {/* <--- THÊM CLASS NÀY */}
        ${d.trang_thai === "hoat_dong" ? "bg-green-700 text-green-50"
                              : d.trang_thai === "hoan_thanh" ? "bg-neutral-600 text-neutral-50"
                                : d.trang_thai === "tam_dung" ? "bg-yellow-600 text-neutral-900"
                                  : "bg-neutral-700 text-neutral-300"}`}
                          >
                            {d.trang_thai ? d.trang_thai.replace('_', ' ') : "—"}
                          </span>
                        </td>

                        {/* DropdownMenu for actions */}
                        <td className="py-3 px-6 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="px-2">⋯</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-neutral-800 border-neutral-700"> {/* Áp dụng màu nền tối cho dropdown */}

                              <DropdownMenuItem onSelect={() => handleDelete(d)} className="focus:bg-neutral-700">
                                <div className="flex items-center gap-2 text-red-400 text-sm"><Trash2 className="h-4 w-4" /> Xóa</div>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onSelect={() => openDanhSachGiaiNganModal(d)}
                                className="text-neutral-200 text-sm focus:bg-neutral-700"
                                disabled={loadingGiaiNgan}
                              >
                                <div className="flex items-center gap-2">
                                {loadingGiaiNgan ? 'Đang tải...' : 'Chi tiết'}
                                </div>
                              </DropdownMenuItem>

                              <DropdownMenuItem onSelect={() => openGiaiNganModal(d)}className="text-neutral-200 text-sm focus:bg-neutral-700">
                                Giải ngân
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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


      {/* Modal Giải ngân */}
      {showGiaiNganModal && selectedDuAn && (
        <GiaiNganModal
          isOpen={showGiaiNganModal}
          onClose={() => setShowGiaiNganModal(false)}
          duAnId={Number(selectedDuAn.id)}
          duAnTitle={selectedDuAn.tieu_de}
          onSubmit={handleGiaiNgan}
          onSubmitChiTiet={handleChiTietGiaiNgan}
        />
      )}

      {showDanhSachGiaiNganModal && (
        <DanhSachGiaiNganModal
          isOpen={showDanhSachGiaiNganModal}
          onClose={() => {
            setShowDanhSachGiaiNganModal(false)
            setSelectedGiaiNganList([])
            setSelectedDuAnTitle("")
          }}
          giaiNgans={selectedGiaiNganList}
          duAnTitle={selectedDuAnTitle}
        />
      )}

    </div>
  )
}
