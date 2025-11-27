"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { SuKien } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Search, Plus, Edit, Trash2, Download } from "lucide-react"
import { formatShortDate } from "@/lib/utils"
import { motion } from "framer-motion"

const PAGE_SIZE = 6

export default function AdminSuKienListRedesign() {
  const [items, setItems] = useState<SuKien[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [view, setView] = useState<"grid" | "table">("grid")
  const [page, setPage] = useState(1)
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [locationFilter, setLocationFilter] = useState("")
  const [sort, setSort] = useState<"newest" | "oldest">("newest")

  const router = useRouter()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const data = await apiClient.getSuKien()
      setItems(data ?? [])
    } catch (err) {
      console.error("Lỗi khi load sự kiện:", err)
      setItems([])
    } finally { setLoading(false) }
  }

  function handleDelete(id: number) {
    if (!confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) return
    apiClient.deleteSuKien(id)
      .then(() => setItems((prev) => prev.filter((it) => it.id !== id)))
      .catch((err) => { console.error("Xóa thất bại:", err); alert("Xóa thất bại. Kiểm tra console.") })
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    let list = items.slice()

    // search
    if (term) {
      list = list.filter((it) => (it.tieu_de ?? "").toLowerCase().includes(term) || (it.dia_diem ?? "").toLowerCase().includes(term) || (it.mo_ta ?? "").toLowerCase().includes(term))
    }

    // location
    if (locationFilter) {
      const t = locationFilter.toLowerCase()
      list = list.filter((it) => (it.dia_diem ?? "").toLowerCase().includes(t))
    }

    // date range
    if (fromDate) {
      const f = new Date(fromDate)
      list = list.filter((it) => new Date(it.thoi_gian_bat_dau) >= f)
    }
    if (toDate) {
      const t = new Date(toDate)
      list = list.filter((it) => new Date(it.thoi_gian_bat_dau) <= t)
    }

    // sort
    list.sort((a, b) => {
      const da = new Date(a.thoi_gian_bat_dau).getTime()
      const db = new Date(b.thoi_gian_bat_dau).getTime()
      return sort === "newest" ? db - da : da - db
    })

    return list
  }, [items, q, locationFilter, fromDate, toDate, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [q, locationFilter, fromDate, toDate, sort, view])

  function exportCSV(list: SuKien[]) {
    const header = ["ID", "Tiêu đề", "Mô tả", "Thời gian", "Địa điểm", "Người tạo", "Ngày tạo"]
    const rows = list.map((r) => [r.id, r.tieu_de, (r.mo_ta || "").replace(/\n/g, " "), r.thoi_gian_bat_dau, r.dia_diem, r.nguoi_tao ?? "", r.ngay_tao])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `su_kien_export_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Sự kiện</h1>
          <p className="text-sm text-muted-foreground mt-1">Danh sách sự kiện — Giao diện mới, rõ ràng và trực quan</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-2">
            <Button variant={view === "grid" ? "secondary" : "ghost"} onClick={() => setView("grid")}>Grid</Button>
            <Button variant={view === "table" ? "secondary" : "ghost"} onClick={() => setView("table")}>Bảng</Button>
          </div>

          <Button asChild>
            <Link href="/admin/su-kien/them-moi"><Plus className="mr-2 h-4 w-4" /> Thêm sự kiện</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex gap-3 items-center w-full sm:w-auto">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm theo tiêu đề, địa điểm, mô tả..." className="pl-10" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>

              <Select onValueChange={(val) => setSort(val as any)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={sort === "newest" ? "Sắp xếp: Mới nhất" : "Sắp xếp: Cũ nhất"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-center">
              <Input type="date" className="w-40" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="Từ..." />
              <Input type="date" className="w-40" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="Đến..." />
              <Input className="w-48" placeholder="Lọc địa điểm" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />

              <Button variant="outline" onClick={() => exportCSV(filtered)}><Download className="mr-2 h-4 w-4" />Xuất CSV</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-12">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">Không tìm thấy sự kiện</div>
          ) : (
            <div>
              {/* GRID VIEW */}
              {view === "grid" ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pageItems.map((sk) => (
                    <motion.article key={sk.id} whileHover={{ translateY: -4 }} className="bg-white/3 p-4 rounded-2xl shadow-sm border border-slate-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{sk.tieu_de}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{sk.mo_ta}</p>
                        </div>
                        <Badge variant="secondary">#{sk.id}</Badge>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatShortDate(sk.thoi_gian_bat_dau)}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{sk.dia_diem}</div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" asChild><Link href={`/admin/su-kien/${sk.id}`}><Edit className="h-4 w-4 mr-2" />Sửa</Link></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sk.id)}><Trash2 className="h-4 w-4 mr-2" />Xóa</Button>
                      </div>
                    </motion.article>
                  ))}
                </motion.div>
              ) : (
                // TABLE VIEW
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="px-4 py-2">Tiêu đề</th>
                        <th className="px-4 py-2">Thời gian</th>
                        <th className="px-4 py-2">Địa điểm</th>
                        <th className="px-4 py-2">Ngày tạo</th>
                        <th className="px-4 py-2">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pageItems.map((sk) => (
                        <tr key={sk.id} className="hover:bg-slate-50/5">
                          <td className="px-4 py-3">
                            <div className="font-medium">{sk.tieu_de}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">{sk.mo_ta}</div>
                          </td>
                          <td className="px-4 py-3">{formatShortDate(sk.thoi_gian_bat_dau)}</td>
                          <td className="px-4 py-3">{sk.dia_diem}</td>
                          <td className="px-4 py-3 text-sm">{formatShortDate(sk.ngay_tao)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild><Link href={`/admin/su-kien/${sk.id}`}><Edit className="h-4 w-4" />Sửa</Link></Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(sk.id)}><Trash2 className="h-4 w-4" />Xóa</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{filtered.length} sự kiện — Trang {page} / {totalPages}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page === 1}>Trước</Button>
                  <Button size="sm" onClick={() => setPage((p) => Math.min(totalPages, p+1))} disabled={page === totalPages}>Sau</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
