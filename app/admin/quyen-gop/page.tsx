"use client"

import React, { useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { QuyenGop, DuAn } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Search, Eye, FileText, Printer, XCircle, RefreshCw } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Helper: loại bỏ dấu tiếng Việt để tìm kiếm chính xác
function removeVietnameseTones(str: string): string {
  return (
    (str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
  )
}

export default function AdminQuyenGopPage() {
  const ALL = "__all"

  // data
  const [quyens, setQuyens] = useState<QuyenGop[]>([])
  const [duAns, setDuAns] = useState<DuAn[]>([])
  const [projectsMap, setProjectsMap] = useState<Record<number, string>>({})

  // ui state
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const [method, setMethod] = useState<string | undefined>(undefined)
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [detail, setDetail] = useState<QuyenGop | null>(null)

  // selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [qRes, pRes] = await Promise.all([apiClient.getQuyenGop
        (
          { select: "*,ma_nguoi_dung:nguoi_dung(ho,ten,email, so_dien_thoai),ma_du_an:du_an(id, tieu_de)" }
        ), apiClient.getDuAn()])
      console.log("qRessssss", qRes)
      setQuyens(Array.isArray(qRes) ? qRes : [])
      setDuAns(Array.isArray(pRes) ? pRes : [])
      const map: Record<number, string> = {}
        ; (Array.isArray(pRes) ? pRes : []).forEach((p: DuAn) => {
          if (p.id != null) map[p.id] = p.tieu_de || String(p.id)
        })
      setProjectsMap(map)
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err)
      alert("Không thể tải dữ liệu. Kiểm tra kết nối API.")
    } finally {
      setLoading(false)
    }
  }

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, projectId, method, status, startDate, endDate])

  // stats
  const stats = useMemo(() => {
    const totalCount = quyens.length
    const totalAmount = quyens.reduce((s, q) => s + Number(q.so_tien || 0), 0)
    const byMethod: Record<string, { count: number; amount: number }> = {}
    for (const q of quyens) {
      const m = q.phuong_thuc_thanh_toan || "unknown"
      byMethod[m] = byMethod[m] || { count: 0, amount: 0 }
      byMethod[m].count++
      byMethod[m].amount += Number(q.so_tien || 0)
    }
    return { totalCount, totalAmount, byMethod }
  }, [quyens])

  // filtering
  const filtered = useMemo(() => {
    const q = removeVietnameseTones(search)
    return quyens
      .filter((item) => {
        if (!q) return true
        const donor = removeVietnameseTones(item.ma_nguoi_dung?.ten || item.ma_nguoi_dung?.email || "")
        const projectName = removeVietnameseTones(projectsMap[item.ma_du_an?.id ?? -1] || "")
        return donor.includes(q) || projectName.includes(q)
      })
      .filter((item) => (projectId ? item?.ma_du_an?.id === projectId : true))
      .filter((item) => (method ? item.phuong_thuc_thanh_toan === method : true))
      .filter((item) => (status ? item?.trang_thai_ === status : true))
      .filter((item) => {
        if (!startDate && !endDate) return true
        const dateStr = item.ngay_tao ?? item?.trang_thai_ ?? item.ngay_cap_nhat
        if (!dateStr) return false
        const dt = new Date(dateStr)
        if (Number.isNaN(dt.getTime())) return false
        if (startDate) {
          const sd = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0)
          if (dt < sd) return false
        }
        if (endDate) {
          const ed = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59)
          if (dt > ed) return false
        }
        return true
      })
  }, [quyens, search, projectId, method, status, startDate, endDate, projectsMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  function resetFilters() {
    setSearch("")
    setProjectId(undefined)
    setMethod(undefined)
    setStatus(undefined)
    setStartDate(undefined)
    setEndDate(undefined)
    setSelectedIds([])
    setCurrentPage(1)
  }

  // export CSV
  function exportCsv(rows: any[], filename = `quyen-gop-${new Date().toISOString().split("T")[0]}.csv`) {
    try {
      const headers = Object.keys(rows[0] || { id: "", nguoi_quyen: "", du_an: "", so_tien: "", phuong_thuc: "", trang_thai: "", ngay_tao: "", loi_nhan: "" })
      const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\r\n")
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("Xuất CSV thất bại.")
    }
  }

  function exportFilteredCsv() {
    const rows = filtered.map((q) => ({
      id: q.id,
      nguoi_quyen: q?.ma_nguoi_dung?.ten ?? q?.ma_nguoi_dung?.email ?? "-",
      du_an: projectsMap[q?.ma_du_an?.id ?? -1] ?? q.ma_du_an ?? "-",
      so_tien: q.so_tien ?? 0,
      phuong_thuc: q.phuong_thuc_thanh_toan ?? "-",
      trang_thai: q?.trang_thai_ ?? "-",
      ngay_tao: q.ngay_tao ?? "-",
      loi_nhan: q.loi_nhan ?? "",
    }))
    exportCsv(rows)
  }
  console.log("ffffffffffffffffffff", paginated)
  // print
  function printReport() {
    const rowsHtml = filtered.map(q => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd">${q.ma_nguoi_dung?.ten ?? q.ma_nguoi_dung?.email ?? "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${projectsMap[q?.ma_du_an?.id ?? -1] ?? "-"}</td>
        <td style="padding:6px;border:1px solid #ddd;text-align:right">${Number(q.so_tien).toLocaleString()} ${q.don_vi_tien_te ?? ""}</td>
        <td style="padding:6px;border:1px solid #ddd">${q.phuong_thuc_thanh_toan ?? "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${q?.trang_thai_ ?? "-"}</td>
        <td style="padding:6px;border:1px solid #ddd">${q.ngay_tao ? new Date(q.ngay_tao).toLocaleDateString("vi-VN") : "-"}</td>
      </tr>`).join("")

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Báo cáo Quyên gop</title>
          <style>
            body{font-family:Arial;padding:20px;color:#222}
            table{border-collapse:collapse;width:100%;margin-top:12px}
            th,td{border:1px solid #ddd;padding:8px;font-size:13px}
            th{background:#f6f6f6;text-align:left}
            h2{text-align:center}
            .summary{margin-top:10px}
          </style>
        </head>
        <body>
          <h2>BÁO CÁO QUYÊN GÓP</h2>
          <div class="summary">
            <div><strong>Tổng giao dịch:</strong> ${filtered.length}</div>
            <div><strong>Tổng tiền:</strong> ${stats.totalAmount.toLocaleString("vi-VN")} VND</div>
            <div><strong>Khoảng:</strong> ${startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "—"} — ${endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "—"}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Người quyên góp</th>
                <th>Dự án</th>
                <th style="text-align:right">Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>`
    const w = window.open("", "_blank", "noopener,noreferrer")
    if (w) {
      w.document.write(html)
      w.document.close()
    } else {
      alert("Popup bị chặn, cho phép popup để in báo cáo.")
    }
  }

  // bulk actions
  function toggleSelectAllVisible() {
    const visibleIds = paginated.map(p => p.id).filter(Boolean) as number[]
    const allSelected = visibleIds.every(id => selectedIds.includes(id))
    if (allSelected) setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)))
    else setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])))
  }

  function toggleSelect(id?: number) {
    if (id == null) return
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function markSelectedAsCompleted() {
    if (selectedIds.length === 0) return alert('Chưa chọn giao dịch nào.')
    if (!confirm(`Bạn có chắc muốn cập nhật ${selectedIds.length} giao dịch thành "hoàn thành" không?`)) return
    try {
      if (typeof (apiClient as any).updateQuyenGop === 'function') {
        await Promise.all(selectedIds.map(id => (apiClient as any).updateQuyenGop(id, { trang_thai_thanh_toan: 'hoan_thanh' })))
        alert('Cập nhật trạng thái thành công.')
        setSelectedIds([])
        loadAll()
      } else {
        alert('API không hỗ trợ cập nhật hàng loạt — chức năng UI đã được chọn nhưng backend chưa cung cấp endpoint.')
      }
    } catch (err) {
      console.error(err)
      alert('Cập nhật thất bại.')
    }
  }

  // quick helpers
  function formatMoney(v: any) {
    const n = Number(v || 0)
    if (Number.isNaN(n)) return v
    return n.toLocaleString('vi-VN')
  }

  function renderStatusBadge(status?: string) {
    const s = status ?? '—'
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold'
    if (s === 'hoan_thanh') return <span className={`${base} bg-green-700/30 text-green-300`}>Hoàn thành</span>
    if (s === 'that_bai') return <span className={`${base} bg-red-700/30 text-red-300`}>Thất bại</span>
    if (s === 'dang_xu_ly') return <span className={`${base} bg-yellow-700/20 text-yellow-300`}>Đang xử lý</span>
    if (s === 'cho_xu_ly') return <span className={`${base} bg-yellow-700/10 text-yellow-300`}>Chờ xử lý</span>
    if (s === 'huy_bo') return <span className={`${base} bg-red-700/10 text-red-300`}>Hủy bỏ</span>
    return <span className={`${base} bg-neutral-700/20 text-neutral-300`}>{s}</span>
  }

  return (
    <div className="min-h-[calc(100vh-48px)] p-6 bg-[#111827] text-white">
      <div className="max-w-[1280px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Quản lý Quyên Góp</h1>
            <p className="text-sm text-neutral-400 mt-1">Giao diện được tối ưu — cùng màu sắc bạn yêu cầu.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={exportFilteredCsv} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <FileText className="h-4 w-4" /> Xuất CSV
            </Button>
            <Button onClick={printReport} variant="ghost" className="border border-neutral-700 text-neutral-200">
              <Printer className="h-4 w-4" /> In báo cáo
            </Button>
            <Button onClick={loadAll} variant="outline" className="border border-neutral-700 text-neutral-200 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Tải lại
            </Button>
          </div>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-[#0f1724] border border-neutral-700 flex items-center justify-between p-4">
            <CardContent className="p-0 flex items-center justify-between w-full">
              <div>
                <p className="text-sm text-neutral-400">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalCount}</p>
              </div>
              <div className="text-blue-400/70"><FileText size={28} /></div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1724] border border-neutral-700 flex items-center justify-between p-4">
            <CardContent className="p-0 flex items-center justify-between w-full">
              <div>
                <p className="text-sm text-neutral-400">Tổng tiền</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalAmount.toLocaleString('vi-VN')} VND</p>
              </div>
              <div className="text-green-400/70"><Printer size={28} /></div>
            </CardContent>
          </Card>

          {Object.entries(stats.byMethod).slice(0, 4).map(([k, v]) => (
            <Card key={k} className="bg-[#0f1724] border border-neutral-700 p-4">
              <CardContent className="p-0">
                <p className="text-sm text-neutral-400">{k.replaceAll('_', ' ')}</p>
                <p className="text-lg font-semibold mt-1">{v.count} • {formatMoney(v.amount)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters & controls (grid) */}
        <Card className="bg-[#0f1724] border border-neutral-700">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Tìm kiếm & Bộ lọc</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" className="text-sm" onClick={() => { resetFilters(); }}>
                  <XCircle className="h-4 w-4 mr-2" /> Xóa bộ lọc
                </Button>

              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="flex items-center gap-2 w-full">
                <Search className="text-neutral-300" />
                <Input placeholder="Tìm: tên người hoặc dự án" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Dự án</label>
                <Select onValueChange={(v) => setProjectId(v && v !== ALL ? Number(v) : undefined)}>
                  <SelectTrigger className="w-full bg-[#111827] border border-neutral-700 text-white"><SelectValue placeholder="Tất cả dự án" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Tất cả</SelectItem>
                    {duAns.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.tieu_de}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs text-neutral-400 mb-1">Phương thức</label>
                  <Select onValueChange={(v) => setMethod(v && v !== ALL ? v : undefined)}>
                    <SelectTrigger className="w-full bg-[#111827] border border-neutral-700 text-white"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Tất cả</SelectItem>
                      <SelectItem value="vnpay">VNPay</SelectItem>
                      <SelectItem value="momo">MoMo</SelectItem>
                      <SelectItem value="chuyen_khoan_ngan_hang">Chuyển khoản</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-1/2">
                  <label className="block text-xs text-neutral-400 mb-1">Trạng thái</label>
                  <Select onValueChange={(v) => setStatus(v && v !== ALL ? v : undefined)}>
                    <SelectTrigger className="w-full bg-[#111827] border border-neutral-700 text-white"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Tất cả</SelectItem>
                      <SelectItem value="cho_xu_ly">Chờ xử lý</SelectItem>
                      <SelectItem value="dang_xu_ly">Đang xử lý</SelectItem>
                      <SelectItem value="hoan_thanh">Hoàn thành</SelectItem>
                      <SelectItem value="that_bai">Thất bại</SelectItem>
                      <SelectItem value="huy_bo">Hủy bỏ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Từ ngày</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[160px] justify-start text-left bg-[#111827] border border-neutral-700">
                        {startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày bắt đầu"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar mode="single" selected={startDate} onSelect={(d) => setStartDate(d || undefined)} locale={vi} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Đến ngày</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[160px] justify-start text-left bg-[#111827] border border-neutral-700">
                        {endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : "Chọn ngày kết thúc"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-0">
                      <Calendar mode="single" selected={endDate} onSelect={(d) => setEndDate(d || undefined)} locale={vi} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="bg-[#0f1724] border border-neutral-700">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách Quyên Góp</CardTitle>
              <CardDescription className="text-neutral-400">{filtered.length} giao dịch</CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="border border-neutral-700 text-neutral-200" onClick={() => exportFilteredCsv()}>Xuất bộ lọc</Button>
              <Button size="sm" variant="destructive" className="text-sm" onClick={markSelectedAsCompleted}>
                Cập nhật hoàn thành ({selectedIds.length})
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto bg-[#111827] rounded-b-md">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-neutral-400 border-b border-neutral-700">
                    <th className="py-3 px-4">
                      <input type="checkbox" onChange={toggleSelectAllVisible} checked={paginated.every(p => selectedIds.includes(p.id)) && paginated.length > 0} />
                    </th>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Người quyên góp</th>
                    <th className="py-3 px-4">Dự án</th>
                    <th className="py-3 px-4">Số tiền</th>
                    <th className="py-3 px-4">Phương thức</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Ngày</th>
                    <th className="py-3 px-4">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="py-6 text-center text-sm text-neutral-400">Đang tải...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={9} className="py-6 text-center text-sm text-neutral-400">Không có giao dịch</td></tr>
                  ) : (
                    paginated.map(q => (
                      <tr key={q.id} className="border-b border-neutral-700 hover:bg-[#0b1220] text-sm">
                        <td className="py-3 px-4 text-center"><input type="checkbox" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} /></td>
                        <td className="py-3 px-4">{q.id}</td>
                        <td className="py-3 px-4">{q.ma_nguoi_dung?.ten ?? q.ma_nguoi_dung?.email}</td>
                        <td className="py-3 px-4">{projectsMap[q?.ma_du_an?.id ?? -1] ?? "-"}</td>
                        <td className="py-3 px-4 text-right">{formatMoney(q.so_tien)} {q.don_vi_tien_te}</td>
                        <td className="py-3 px-4">{q.phuong_thuc_thanh_toan}</td>

                        <td className="py-3 px-4">{renderStatusBadge(q?.trang_thai_)}</td>
                        <td className="py-3 px-4">{q.ngay_tao ? new Date(q.ngay_tao).toLocaleString() : "-"}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="text-xs bg-[#0f1724] border border-neutral-700" onClick={() => setDetail(q)}>
                              <Eye className="h-4 w-4 mr-1" /> Xem
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
              <div className="mt-4 flex items-center justify-between px-6 py-4">
                <p className="text-sm text-neutral-400">Trang {currentPage} / {totalPages}</p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink isActive={currentPage === i + 1} onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* detail modal */}
        {detail && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0b1220] text-white p-6 rounded-lg w-full max-w-2xl shadow-2xl border border-neutral-700 overflow-y-auto max-h-[90vh]">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold mb-2">Chi tiết giao dịch #{detail.id}</h3>
                <div className="text-sm text-neutral-400">{detail.ngay_tao ? new Date(detail.ngay_tao).toLocaleString() : '-'}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-4">
                <div>
                  <div className="text-xs text-neutral-400">Người quyên góp</div>
                  <div className="font-medium text-white">{detail.ma_nguoi_dung?.ten || '-'}</div>
                  <div className="text-xs text-neutral-400">{detail.ma_nguoi_dung?.email || '-'} • {detail?.ma_nguoi_dung?.so_dien_thoai || '-'}</div>

                  <div className="mt-4 text-xs text-neutral-400">Số tiền</div>
                  <div className="font-medium">{formatMoney(detail.so_tien)} {detail.don_vi_tien_te}</div>
                  <div className="text-xs text-neutral-400">Phí giao dịch: {formatMoney(detail.phi_giao_dich || 0)}</div>
                </div>

                <div>
                  <div className="text-xs text-neutral-400">Dự án</div>
                  <div className="font-medium">{projectsMap[detail?.ma_du_an?.id ?? -1] ?? detail.ma_du_an ?? '-'}</div>

                  <div className="mt-4 text-xs text-neutral-400">Mã giao dịch</div>
                  <div className="font-medium">{detail.ma_giao_dich || '-'}</div>

                  <div className="mt-4 text-xs text-neutral-400">Phương thức</div>
                  <div className="font-medium">{detail.phuong_thuc_thanh_toan || '-'}</div>
                  <div className="mt-1">{renderStatusBadge(detail?.trang_thai_)}</div>

                  {detail.duong_dan_bien_lai && (
                    <div className="mt-3">
                      <a className="text-sm text-blue-400 underline" href={detail.duong_dan_bien_lai} target="_blank" rel="noreferrer">Xem biên lai</a>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 border-t border-neutral-700 pt-3">
                  <div className="text-xs text-neutral-400">Lời nhắn</div>
                  <div className="whitespace-pre-wrap mt-1">{detail.loi_nhan || '-'}</div>
                </div>

              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setDetail(null)}>Đóng</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
