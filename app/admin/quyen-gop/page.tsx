"use client"

import React, { useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { QuyenGop, DuAn } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Search, Eye } from "lucide-react"

export default function AdminQuyenGopPage() {
  const ALL = "__all"
  const [quyens, setQuyens] = useState<QuyenGop[]>([])
  const [loading, setLoading] = useState(false)
  const [projectsMap, setProjectsMap] = useState<Record<number, string>>({})

  // filters / search
  const [search, setSearch] = useState("")
  const [method, setMethod] = useState<string>(ALL)
  const [status, setStatus] = useState<string>(ALL)
  const [month, setMonth] = useState<string>(ALL)
  const [year, setYear] = useState<string>(ALL)

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // detail modal
  const [detail, setDetail] = useState<QuyenGop | null>(null)

  useEffect(() => {
    fetchAll()
    fetchProjects()
  }, [])

  // reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, method, status, month, year])

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await apiClient.getQuyenGop()
      setQuyens(res || [])
    } catch (err) {
      console.error(err)
      alert("Lấy danh sách quyên góp thất bại")
    } finally {
      setLoading(false)
    }
  }

  async function fetchProjects() {
    try {
      const res = await apiClient.getDuAn()
      if (res && Array.isArray(res)) {
        const map: Record<number, string> = {}
        res.forEach((p: DuAn) => {
          if (p.id != null) map[p.id] = p.tieu_de || String(p.id)
        })
        setProjectsMap(map)
      }
    } catch (err) {
      console.error("Không lấy được danh sách dự án:", err)
    }
  }

  // small helper to normalize strings (case-insensitive, accent-insensitive)
  const normalize = (s?: string) =>
    (s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()

  // statistics
  const stats = useMemo(() => {
    const totalCount = quyens.length
    const totalAmount = quyens.reduce((s, q) => s + Number(q.so_tien || 0), 0)
    const byMethod: Record<string, { count: number; amount: number }> = {}
    const byStatus: Record<string, { count: number; amount: number }> = {}

    for (const q of quyens) {
      const m = q.phuong_thuc_thanh_toan || "unknown"
      const st = q.trang_thai_thanh_toan || "unknown"
      byMethod[m] = byMethod[m] || { count: 0, amount: 0 }
      byMethod[m].count++
      byMethod[m].amount += Number(q.so_tien || 0)

      byStatus[st] = byStatus[st] || { count: 0, amount: 0 }
      byStatus[st].count++
      byStatus[st].amount += Number(q.so_tien || 0)
    }

    return { totalCount, totalAmount, byMethod, byStatus }
  }, [quyens])

  // filtering logic — NOTE: search ONLY by donor name and project name (accent-insensitive)
  const filtered = useMemo(() => {
    const q = normalize(search)
    return quyens
      .filter((item) => {
        if (!q) return true
        const donor = normalize(item.ten_nguoi_quyen_gop || "")
        const projectName = normalize(projectsMap[item.ma_du_an ?? -1] || "")
        return donor.includes(q) || projectName.includes(q)
      })
      .filter((q) => (method === ALL ? true : q.phuong_thuc_thanh_toan === method))
      .filter((q) => (status === ALL ? true : q.trang_thai_thanh_toan === status))
      .filter((q) => {
        // month/year filter: try to use ngay_tao, fallback to ngay_hoan_thanh / ngay_cap_nhat
        if (month === ALL && year === ALL) return true
        const dateStr = q.ngay_tao ?? q.ngay_hoan_thanh ?? q.ngay_cap_nhat
        if (!dateStr) return false

        // parse date robustly and compare using UTC to avoid timezone-shift issues
        let dt = new Date(dateStr)
        if (Number.isNaN(dt.getTime())) {
          // try appending Z (treat as UTC) if server returned an ISO without timezone
          dt = new Date(dateStr + "Z")
          if (Number.isNaN(dt.getTime())) return false
        }

        const mm = dt.getUTCMonth() + 1
        const yy = dt.getUTCFullYear()
        const monthMatch = month === ALL ? true : mm === Number(month)
        const yearMatch = year === ALL ? true : yy === Number(year)
        return monthMatch && yearMatch
      })
  }, [quyens, search, method, status, month, year, projectsMap])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  function resetFilters() {
    setSearch("")
    setMethod(ALL)
    setStatus(ALL)
    setMonth(ALL)
    setYear(ALL)
    setCurrentPage(1)
  }

  // small helper to format currency
  const formatVnd = (n: number) => n.toLocaleString("vi-VN") + " VND"

  return (
    <div className="space-y-6">
      {/* statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Giao dịch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">Tổng giao dịch</div>
            <div className="text-2xl font-semibold">{stats.totalCount}</div>
            <div className="mt-3 text-xs text-muted-foreground">Tổng tiền</div>
            <div className="text-lg font-medium text-emerald-400">{formatVnd(stats.totalAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Theo phương thức</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              {Object.entries(stats.byMethod).length === 0 ? (
                <li className="text-muted-foreground">Không có dữ liệu</li>
              ) : (
                Object.entries(stats.byMethod).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="capitalize text-slate-200">{k.replaceAll("_", " ")}</span>
                    <span className="text-slate-100">{v.count} — {Number(v.amount).toLocaleString()}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              {Object.entries(stats.byStatus).length === 0 ? (
                <li className="text-muted-foreground">Không có dữ liệu</li>
              ) : (
                Object.entries(stats.byStatus).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="capitalize text-slate-200">{k.replaceAll("_", " ")}</span>
                    <span className="text-slate-100">{v.count} — {Number(v.amount).toLocaleString()}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm & Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Search />
              <Input placeholder="Tìm: tên người quyên hoặc tên dự án" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Phương thức</span>
              <Select value={method} onValueChange={(v) => setMethod(v)}>
                <SelectTrigger className="min-w-[160px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả</SelectItem>
                  <SelectItem value="vnpay">vnpay</SelectItem>
                  <SelectItem value="momo">momo</SelectItem>
                  <SelectItem value="chuyen_khoan_ngan_hang">chuyển khoản</SelectItem>                
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Trạng thái</span>
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger className="min-w-[160px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả</SelectItem>
                  <SelectItem value="cho_xu_ly">chờ xử lý</SelectItem>
                  <SelectItem value="dang_xu_ly">đang xử lý</SelectItem>
                  <SelectItem value="hoan_thanh">hoàn thành</SelectItem>
                  <SelectItem value="that_bai">thất bại</SelectItem>
                  <SelectItem value="huy_bo">hủy bỏ</SelectItem>
                  <SelectItem value="hoan_tien">hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Tháng</span>
              <Select value={month} onValueChange={(v) => setMonth(v)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả</SelectItem>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{`Tháng ${i + 1}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Năm</span>
              <Select value={year} onValueChange={(v) => setYear(v)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Tất cả</SelectItem>
                  {[2022, 2023, 2024, 2025].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />
            <Button variant="outline" onClick={resetFilters}>Làm mới</Button>
          </div>
        </CardContent>
      </Card>

      {/* list */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách quyên góp ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="py-2">ID</th>
                  <th className="py-2">Người quyên góp</th>
                  <th className="py-2">Dự án</th>
                  <th className="py-2">Số tiền</th>
                  <th className="py-2">Phương thức</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Ngày</th>
                  <th className="py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-6 text-center text-sm">Đang tải...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={8} className="py-6 text-center text-sm">Không có giao dịch</td></tr>
                ) : (
                  paginated.map((q) => (
                    <tr key={q.id} className="border-b text-sm">
                      <td className="py-2">{q.id}</td>
                      <td className="py-2">{q.ten_nguoi_quyen_gop ?? q.email_nguoi_quyen_gop}</td>
                      <td className="py-2">{projectsMap[q.ma_du_an ?? -1] ?? q.ma_du_an}</td>
                      <td className="py-2">{Number(q.so_tien).toLocaleString()} {q.don_vi_tien_te}</td>
                      <td className="py-2">{q.phuong_thuc_thanh_toan}</td>
                      <td className="py-2">{q.trang_thai_thanh_toan}</td>
                      <td className="py-2">{q.ngay_tao ? new Date(q.ngay_tao).toLocaleString() : "-"}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="text-xs" onClick={() => setDetail(q)}>
                            <Eye className="mr-1 h-3.5 w-3.5" />Xem
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
                {[...Array(totalPages)].map((_, i) => (
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
          )}
        </CardContent>
      </Card>

      {/* detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 rounded-lg w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-60 overflow-y-auto max-h-[90vh] opacity-100">
            <h3 className="text-lg font-semibold mb-4">Chi tiết giao dịch #{detail.id}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Người quyên góp</div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{detail.ten_nguoi_quyen_gop || '-'}</div>
                <div className="text-xs text-muted-foreground">{detail.email_nguoi_quyen_gop || '-'} • {detail.sdt_nguoi_quyen_gop || '-'}</div>

                <div className="mt-3 text-xs text-muted-foreground">Số tiền</div>
                <div className="font-medium">{Number(detail.so_tien).toLocaleString()} {detail.don_vi_tien_te}</div>
                <div className="text-xs text-muted-foreground">Phí giao dịch: {Number(detail.phi_giao_dich || 0).toLocaleString()}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Dự án (id)</div>
                <div className="font-medium">{projectsMap[detail.ma_du_an ?? -1] ?? detail.ma_du_an ?? '-'}</div>
                <div className="mt-3 text-xs text-muted-foreground">Mã giao dịch</div>
                <div className="font-medium">{detail.ma_giao_dich || '-'}</div>

                <div className="mt-3 text-xs text-muted-foreground">Phương thức</div>
                <div className="font-medium">{detail.phuong_thuc_thanh_toan || '-'}</div>
                <div className="mt-1 text-xs text-muted-foreground">Trạng thái: <span className="font-medium">{detail.trang_thai_thanh_toan || '-'}</span></div>

                {detail.duong_dan_bien_lai && (
                  <div className="mt-3">
                    <a className="text-sm text-blue-600 underline" href={detail.duong_dan_bien_lai} target="_blank" rel="noreferrer">Xem biên lai</a>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground">Lời nhắn</div>
                <div className="whitespace-pre-wrap">{detail.loi_nhan || '-'}</div>
              </div>

              <div className="md:col-span-2">
                <div className="text-xs text-muted-foreground">Ngày tạo</div>
                <div>{detail.ngay_tao ? new Date(detail.ngay_tao).toLocaleString() : '-'}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDetail(null)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
