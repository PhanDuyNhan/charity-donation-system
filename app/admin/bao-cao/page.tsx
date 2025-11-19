"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Download, Filter, SunMoon } from "lucide-react"
import type { QuyenGop, DuAn, NguoiDung } from "@/lib/types"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js"

import { Bar, Pie, Line } from "react-chartjs-2"

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler)

/**
 * PRO Dashboard - Auto theme (system)
 * - UI improved: subtle gradients, shadows, hover, animations
 * - Export Excel: multiple sheets (Top Projects, Top Donors, Provinces)
 * - Export PDF: landscape with header and multiple tables
 * - Auto theme detection (system) and dynamic chart colors
 *
 * Drop-in replacement for app/admin/bao-cao/page.tsx
 */

function useAnimatedNumber(value: number, ms = 900) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = n
    const to = value
    const loop = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      const eased = 1 - (1 - p) * (1 - p) // easeOutQuad-ish
      setN(Math.round(from + (to - from) * eased))
      if (p < 1) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return n
}

export default function AdminBaoCaoPage() {
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches : false
  )

  // watch system theme
  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mq.addEventListener?.("change", handler)
    return () => mq.removeEventListener?.("change", handler)
  }, [])

  const [data, setData] = useState<{
    quyenGop: QuyenGop[]
    duAn: DuAn[]
    nguoiDung: NguoiDung[]
  }>({
    quyenGop: [],
    duAn: [],
    nguoiDung: [],
  })

  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all")
  const [selectedUserId, setSelectedUserId] = useState<number | "all">("all")

  const [thongKe, setThongKe] = useState<any>(null)

  useEffect(() => { void fetchAll() }, []) // initial load

  useEffect(() => {
    // recompute every time filters change
    computeStats(data.quyenGop, data.duAn, data.nguoiDung)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, selectedProjectId, selectedUserId, data])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [quyenGop, duAn, nguoiDung] = await Promise.all([
        apiClient.getQuyenGop(),
        apiClient.getDuAn(),
        apiClient.getNguoiDung(),
      ])
      setData({ quyenGop, duAn, nguoiDung })
      computeStats(quyenGop, duAn, nguoiDung)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const filterByDate = (list: any[]) => {
    if (!fromDate && !toDate) return list
    return list.filter((item) => {
      const d = item?.ngay_tao ? new Date(item.ngay_tao) : null
      if (!d) return false
      if (fromDate && d < fromDate) return false
      if (toDate && d > toDate) return false
      return true
    })
  }

  const applySelectionFilters = (list: QuyenGop[]) => {
    let out = list
    if (selectedProjectId !== "all") out = out.filter((x) => x.ma_du_an === selectedProjectId)
    if (selectedUserId !== "all") out = out.filter((x) => x.ma_nguoi_dung === selectedUserId)
    return out
  }

  const computeStats = (quyenGop: QuyenGop[], duAn: DuAn[], nguoiDung: NguoiDung[]) => {
    let qg = filterByDate(quyenGop)
    qg = applySelectionFilters(qg)

    const tongQuyenGop = qg.reduce((s, x) => s + (Number(x.so_tien) || 0), 0)
    const tongDuAn = duAn.length
    const tongNguoiDung = nguoiDung.length

    // per-month
    const byMonth: Record<string, number> = {}
    qg.forEach((x) => {
      const m = x.ngay_tao?.slice(0, 7) || "unknown"
      byMonth[m] = (byMonth[m] || 0) + (Number(x.so_tien) || 0)
    })

    // projects by status
    const projectsByStatus: Record<string, number> = {}
    duAn.forEach((d) => {
      const st = d.trang_thai || "khac"
      projectsByStatus[st] = (projectsByStatus[st] || 0) + 1
    })

    // province aggregation (heuristic: last comma part)
    const provinceMap: Record<string, number> = {}
    const extractProvince = (txt?: string) => {
      if (!txt) return "Không rõ"
      const parts = txt.split(",").map(s => s.trim()).filter(Boolean)
      return parts.length ? parts[parts.length - 1] : txt
    }
    qg.forEach((x) => {
      const project = duAn.find((d) => d.id === x.ma_du_an)
      const prov = extractProvince(project?.dia_diem)
      provinceMap[prov] = (provinceMap[prov] || 0) + (Number(x.so_tien) || 0)
    })

    // top projects
    const topProjMap: Record<number, number> = {}
    qg.forEach((x) => {
      topProjMap[x.ma_du_an] = (topProjMap[x.ma_du_an] || 0) + (Number(x.so_tien) || 0)
    })

    const duAnMap: Record<number, string> = duAn.reduce((acc, x) => {
      acc[x.id] = x.tieu_de
      return acc
    }, {} as Record<number, string>)

    const topDuAnList = Object.entries(topProjMap)
      .map(([id, val]) => ({ id: Number(id), tieu_de: duAnMap[Number(id)] || `Dự án ${id}`, so_tien: val }))
      .sort((a, b) => b.so_tien - a.so_tien)
      .slice(0, 10)

    // top donors
    const topDonorMap: Record<number, number> = {}
    qg.forEach((x) => {
      if (!x.ma_nguoi_dung) return
      topDonorMap[x.ma_nguoi_dung] = (topDonorMap[x.ma_nguoi_dung] || 0) + (Number(x.so_tien) || 0)
    })

    const userMap: Record<number, string> = nguoiDung.reduce((acc, x) => {
      acc[x.id] = (x.ten || `${x.ho || ""} ${x.ten || ""}`).trim() || `User ${x.id}`
      return acc
    }, {} as Record<number, string>)

    const topNguoiList = Object.entries(topDonorMap)
      .map(([uid, total]) => ({ uid: Number(uid), ten: userMap[Number(uid)] || `User ${uid}`, so_tien: total }))
      .sort((a, b) => b.so_tien - a.so_tien)
      .slice(0, 10)

    // heatmap per day
    const heatmapCounts: Record<number, number> = {}
    qg.forEach((x) => {
      const d = x.ngay_tao ? new Date(x.ngay_tao) : null
      if (!d) return
      const day = d.getDate()
      heatmapCounts[day] = (heatmapCounts[day] || 0) + (Number(x.so_tien) || 0)
    })

    setThongKe({
      tongQuyenGop,
      tongDuAn,
      tongNguoiDung,
      byMonth,
      projectsByStatus,
      provinceMap,
      topDuAnList,
      topNguoiList,
      heatmapCounts,
    })
  }

  const animatedTotal = useAnimatedNumber(thongKe?.tongQuyenGop || 0, 900)

  // EXCEL: export multiple sheets
  const exportExcel = () => {
    if (!thongKe) return
    const wb = XLSX.utils.book_new()
    // Top projects
    const topProjects = (thongKe.topDuAnList || []).map((p: any) => ({ Dự_án: p.tieu_de, So_tien: p.so_tien }))
    const ws1 = XLSX.utils.json_to_sheet(topProjects)
    XLSX.utils.book_append_sheet(wb, ws1, "Top_Projects")
    // Top donors
    const topDonors = (thongKe.topNguoiList || []).map((d: any) => ({ Ten: d.ten, So_tien: d.so_tien }))
    const ws2 = XLSX.utils.json_to_sheet(topDonors)
    XLSX.utils.book_append_sheet(wb, ws2, "Top_Donors")
    // Provinces
    const provinces = Object.entries(thongKe.provinceMap || {}).map(([k, v]) => ({ Tinh: k, So_tien: v }))
    const ws3 = XLSX.utils.json_to_sheet(provinces)
    XLSX.utils.book_append_sheet(wb, ws3, "Provinces")
    // Write file
    XLSX.writeFile(wb, "bao_cao_pro.xlsx")
  }

  // PDF: multiple tables with header
  const exportPDF = () => {
    if (!thongKe) return
    const doc = new jsPDF({ orientation: "landscape" })
    const title = "BÁO CÁO THỐNG KÊ"
    const now = new Date().toLocaleString()
    doc.setFontSize(18)
    doc.text(title, 14, 14)
    doc.setFontSize(10)
    doc.text(`Ngày xuất: ${now}`, 14, 20)

    // Top projects table
    autoTable(doc, {
      startY: 28,
      head: [["Dự án", "Số tiền"]],
      body: (thongKe.topDuAnList || []).map((p: any) => [p.tieu_de, formatVND(p.so_tien)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 144, 255] },
    })

    // Next table: top donors
    const afterFirst = (doc as any).lastAutoTable.finalY || 28
    autoTable(doc, {
      startY: afterFirst + 8,
      head: [["Người", "Số tiền"]],
      body: (thongKe.topNguoiList || []).map((d: any) => [d.ten, formatVND(d.so_tien)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
    })

    // Next: provinces (if there is space, else new page)
    const afterSecond = (doc as any).lastAutoTable.finalY || afterFirst + 8
    autoTable(doc, {
      startY: afterSecond + 8,
      head: [["Tỉnh/Thành", "Số tiền"]],
      body: Object.entries(thongKe.provinceMap || {}).map(([k, v]) => [k, formatVND(Number(v))]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [99, 102, 241] },
    })

    doc.save("bao_cao_pro.pdf")
  }

  // Chart data via memo
  const lineData = useMemo(() => {
    const labels = thongKe ? Object.keys(thongKe.byMonth || {}).sort() : []
    return {
      labels,
      datasets: [
        {
          label: "Tổng quyên góp",
          data: labels.map((l) => thongKe.byMonth[l] || 0),
          borderColor: isDark ? "#34d399" : "#0ea5a4",
          backgroundColor: isDark ? "rgba(52,211,153,0.08)" : "rgba(14,165,164,0.08)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }
  }, [thongKe, isDark])

  const doughnutData = useMemo(() => {
    const labels = thongKe ? Object.keys(thongKe.projectsByStatus || {}) : []
    const values = labels.map((l) => thongKe.projectsByStatus[l])
    const colors = isDark ? ["#06b6d4", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"] : ["#06b6d4", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"]
    return { labels, datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length) }] }
  }, [thongKe, isDark])

  const provinceBarData = useMemo(() => {
    const entries = thongKe ? Object.entries(thongKe.provinceMap || {}).sort((a: any, b: any) => b[1] - a[1]) : []
    const labels = entries.map((e) => e[0])
    const dataVals = entries.map((e) => e[1])
    return { labels, datasets: [{ label: "Tổng quyên góp", data: dataVals, backgroundColor: isDark ? "#60a5fa" : "#2563eb" }] }
  }, [thongKe, isDark])

  const heatmapMax = useMemo(() => {
    if (!thongKe) return 1
    const vals = Object.values(thongKe.heatmapCounts || {}).map(Number)
    return Math.max(1, ...vals)
  }, [thongKe])

  if (loading) {
    return (
      <div className="min-h-[420px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-dashed rounded-full border-primary/30 border-t-primary mx-auto mb-4" />
          <div className="text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 p-6 transition-colors duration-300 ${isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}`}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Báo cáo & Thống kê</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted/10">
            <SunMoon size={16} />
            <div className="text-sm">{isDark ? "Dark (system)" : "Light (system)"}</div>
          </div>

          <Button variant="ghost" onClick={exportExcel} className="flex items-center gap-2">
            <Download size={16} /> Xuất Excel
          </Button>
          <Button onClick={exportPDF} className="flex items-center gap-2">
            <Download size={16} /> Xuất PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon /> Bộ lọc dữ liệu
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-4 items-center">

          {/* Bộ lọc ngày */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className="flex items-center gap-2 bg-card text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground">
                <Filter /> Chọn ngày
              </Button>
            </PopoverTrigger>

            <PopoverContent
  side="bottom"
  align="start"
  className="p-0 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
>
  <div className="p-4 bg-background">
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl bg-card shadow-sm p-2">
        <Calendar
          mode="single"
          selected={fromDate}
          onSelect={setFromDate}
          className="rounded-md"
        />
      </div>
      <div className="rounded-xl bg-card shadow-sm p-2">
        <Calendar
          mode="single"
          selected={toDate}
          onSelect={setToDate}
          className="rounded-md"
        />
      </div>
    </div>

    <div className="flex justify-between mt-4 gap-3">
      <Button
        variant="secondary"
        className="px-4 py-2 bg-muted rounded-lg font-medium hover:bg-muted/70"
        onClick={() => { setFromDate(undefined); setToDate(undefined); }}
      >
        Reset
      </Button>

      <Button
        variant="default"
        className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90"
        onClick={() => computeStats(data.quyenGop, data.duAn, data.nguoiDung)}
      >
        Áp dụng
      </Button>
    </div>
  </div>
</PopoverContent>

          </Popover>

          {/* Filter dự án */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Dự án</div>
            <Select
              onValueChange={(v) => setSelectedProjectId(v === "all" ? "all" : Number(v))}
              value={String(selectedProjectId)}
            >
              <SelectTrigger className="w-64 bg-card shadow-sm">
                <SelectValue placeholder="Tất cả dự án" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dự án</SelectItem>
                {data.duAn.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.tieu_de}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter người */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Người</div>
            <Select
              onValueChange={(v) => setSelectedUserId(v === "all" ? "all" : Number(v))}
              value={String(selectedUserId)}
            >
              <SelectTrigger className="w-56 bg-card shadow-sm">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {data.nguoiDung.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {(u.ten || `${u.ho || ""} ${u.ten || ""}`).trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>


      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Tổng quyên góp" value={animatedTotal} suffix="đ" isDark={isDark} />
        <KPICard title="Tổng dự án" value={thongKe?.tongDuAn || 0} isDark={isDark} />
        <KPICard title="Người dùng" value={thongKe?.tongNguoiDung || 0} isDark={isDark} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Quyên góp theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={lineData} options={{
              plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
              interaction: { mode: "index", intersect: false },
              animation: { duration: 700, easing: "easeOutQuart" },
              scales: { y: { ticks: { callback: (v) => formatVND(Number(v)) } } },
              maintainAspectRatio: false,
            }} height={220} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Phân loại dự án</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div style={{ width: 260, height: 220 }}>
              <Pie data={doughnutData} options={{ plugins: { legend: { position: "bottom" } }, animation: { duration: 600 } }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provinces + Top lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader><CardTitle>Quyên góp theo tỉnh/thành</CardTitle></CardHeader>
          <CardContent>
            <Bar data={provinceBarData} options={{
              indexAxis: "y",
              plugins: { legend: { display: false } },
              animation: { duration: 700 },
              scales: { x: { ticks: { callback: (v) => formatVND(Number(v)) } } },
              maintainAspectRatio: false,
            }} height={320} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader><CardTitle>Top dự án & người</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Top dự án</div>
                <ol className="list-decimal pl-5 text-sm">
                  {(thongKe?.topDuAnList || []).map((p: any) => (
                    <li key={p.id} className="mb-2">
                      <div className="font-medium">{p.tieu_de}</div>
                      <div className="text-xs text-muted-foreground">{formatVND(p.so_tien)}</div>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-2">Top người</div>
                <ol className="list-decimal pl-5 text-sm">
                  {(thongKe?.topNguoiList || []).map((u: any) => (
                    <li key={u.uid} className="mb-2">
                      <div className="font-medium">{u.ten}</div>
                      <div className="text-xs text-muted-foreground">{formatVND(u.so_tien)}</div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader><CardTitle>Heatmap: Quyên góp theo ngày (trong tháng)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1
              const val = Number(thongKe?.heatmapCounts?.[day] || 0)
              const intensity = Math.min(1, val / (heatmapMax || 1))
              const bg = isDark ? `rgba(99,102,241,${0.08 + intensity * 0.9})` : `rgba(59,130,246,${0.08 + intensity * 0.9})`
              return (
                <div key={day} className="flex flex-col items-center">
                  <div style={{ width: 40, height: 40, background: bg }} className="rounded-md flex items-center justify-center transition-all">
                    <div className="text-sm font-medium">{day}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">{val ? formatVND(val) : "-"}</div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Intensity based on total donations that day (applies current filters).</div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ---------- Small UI components used above (KPICard) ---------- */

function KPICard({ title, value, suffix, isDark }: { title: string; value: number | string; suffix?: string; isDark?: boolean }) {
  return (
    <Card className="transform transition-transform hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className="mt-2 text-2xl font-semibold">
              {typeof value === "number" ? formatVND(value as number) : value} {suffix ? suffix : ""}
            </div>
          </div>
          <div style={{
            background: isDark ? "linear-gradient(135deg,#06b6d4,#7c3aed)" : "linear-gradient(135deg,#60a5fa,#34d399)",
          }} className="h-12 w-12 rounded-full flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white"><circle cx="12" cy="12" r="8" /></svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------- Helpers ---------- */
function formatVND(amount: number) {
  if (typeof amount !== "number" || isNaN(amount)) return "₫0"
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount)
}
