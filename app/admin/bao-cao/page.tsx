"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Download, Filter, TrendingUp, TrendingDown, Users, DollarSign, Target, Activity, BarChart3, PieChart, Clock, MapPin, Award, Zap, RefreshCw, FileSpreadsheet, FileText, AlertCircle } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { apiClient } from "@/lib/api-client"
import type { QuyenGop, DuAn, NguoiDung } from "@/lib/types"

// Improved animated number hook: no dependency loop, uses a ref to keep previous value
function useAnimatedNumber(value: number, ms = 1200) {
  const [n, setN] = useState(0)
  const rafRef = useRef<number | null>(null)
  const fromRef = useRef<number>(0)

  useEffect(() => {
    const startTs = performance.now()
    const from = fromRef.current
    const to = value

    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const loop = (t: number) => {
      const p = Math.min(1, (t - startTs) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(from + (to - from) * eased))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // only re-run when the target value or duration changes
  }, [value, ms])

  return n
}

export default function AdminBaoCaoPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()
  const [selectedProjectId, setSelectedProjectId] = useState<number | "all">("all")
  const [selectedUserId, setSelectedUserId] = useState<number | "all">("all")

  const [data, setData] = useState<{
    quyenGop: QuyenGop[]
    duAn: DuAn[]
    nguoiDung: NguoiDung[]
  }>({
    quyenGop: [],
    duAn: [],
    nguoiDung: [],
  })

  const [thongKe, setThongKe] = useState<any>(null)

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    if (data.quyenGop.length > 0) {
      computeStats()
    }
  }, [fromDate, toDate, selectedProjectId, selectedUserId, data])

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [quyenGop, duAn, nguoiDung] = await Promise.all([
        apiClient.getQuyenGop(),
        apiClient.getDuAn(),
        apiClient.getNguoiDung(),
      ])

      console.log('Fetched data:', { quyenGop, duAn, nguoiDung })

      setData({ quyenGop, duAn, nguoiDung })
      computeStatsWithData(quyenGop, duAn, nguoiDung)
    } catch (err: any) {
      console.error("Fetch error:", err)
      setError(err.message || "Không thể tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  // make date filter inclusive (start of fromDate, end of toDate)
  const filterByDate = (list: any[]) => {
    if (!fromDate && !toDate) return list
    const fromStart = fromDate ? new Date(fromDate) : null
    if (fromStart) fromStart.setHours(0, 0, 0, 0)
    const toEnd = toDate ? new Date(toDate) : null
    if (toEnd) toEnd.setHours(23, 59, 59, 999)

    return list.filter((item) => {
      const d = item?.ngay_tao ? new Date(item.ngay_tao) : null
      if (!d) return false
      if (fromStart && d < fromStart) return false
      if (toEnd && d > toEnd) return false
      return true
    })
  }

  const applySelectionFilters = (list: QuyenGop[]) => {
    let out = list
    if (selectedProjectId !== "all") out = out.filter((x) => x.ma_du_an === selectedProjectId)
    if (selectedUserId !== "all") out = out.filter((x) => x.ma_nguoi_dung === selectedUserId)
    return out
  }

  const computeStats = () => {
    computeStatsWithData(data.quyenGop, data.duAn, data.nguoiDung)
  }

  const computeStatsWithData = (quyenGop: QuyenGop[], duAn: DuAn[], nguoiDung: NguoiDung[]) => {
    let qg = filterByDate(quyenGop)
    qg = applySelectionFilters(qg)

    const tongQuyenGop = qg.reduce((s, x) => s + (Number(x.so_tien) || 0), 0)
    const tongDuAn = duAn.length
    const tongNguoiDung = nguoiDung.length
    const soGiaoDich = qg.length

    // Monthly data
    const byMonth: Record<string, number> = {}
    qg.forEach((x) => {
      const m = x.ngay_tao?.slice(0, 7) || "unknown"
      byMonth[m] = (byMonth[m] || 0) + (Number(x.so_tien) || 0)
    })

    // Project status
    const projectsByStatus: Record<string, number> = {}
    duAn.forEach((d) => {
      const st = d.trang_thai || "khac"
      projectsByStatus[st] = (projectsByStatus[st] || 0) + 1
    })

    // Province data
    const provinceMap: Record<string, number> = {}
    qg.forEach((x) => {
      const project = duAn.find((d) => d.id === x.ma_du_an)
      const prov = project?.dia_diem?.split(",").pop()?.trim() || "Không rõ"
      provinceMap[prov] = (provinceMap[prov] || 0) + (Number(x.so_tien) || 0)
    })

    // Top projects
    const topProjMap: Record<number, number> = {}
    qg.forEach((x) => {
      topProjMap[x.ma_du_an] = (topProjMap[x.ma_du_an] || 0) + (Number(x.so_tien) || 0)
    })
    const topDuAnList = Object.entries(topProjMap)
      .map(([id, val]) => ({
        id: Number(id),
        tieu_de: duAn.find(d => d.id === Number(id))?.tieu_de || `Dự án ${id}`,
        so_tien: val
      }))
      .sort((a, b) => b.so_tien - a.so_tien)
      .slice(0, 5)

    // Top donors
    const topDonorMap: Record<number, number> = {}
    qg.forEach((x) => {
      if (!x.ma_nguoi_dung) return
      topDonorMap[x.ma_nguoi_dung] = (topDonorMap[x.ma_nguoi_dung] || 0) + (Number(x.so_tien) || 0)
    })
    const topNguoiList = Object.entries(topDonorMap)
      .map(([uid, total]) => ({
        uid: Number(uid),
        ten: nguoiDung.find(u => u.id === Number(uid))?.ten || `User ${uid}`,
        so_tien: total
      }))
      .sort((a, b) => b.so_tien - a.so_tien)
      .slice(0, 5)

    // Growth calculation (defensive)
    const currentMonth = new Date().toISOString().slice(0, 7)
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7)
    const currentMonthAmount = byMonth[currentMonth] || 0
    const lastMonthAmount = byMonth[lastMonth] || 0
    const growthRate = lastMonthAmount ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount * 100) : (currentMonthAmount > 0 ? 100 : 0)

    setThongKe({
      tongQuyenGop,
      tongDuAn,
      tongNguoiDung,
      soGiaoDich,
      byMonth,
      projectsByStatus,
      provinceMap,
      topDuAnList,
      topNguoiList,
      growthRate,
      currentMonthAmount,
      lastMonthAmount,
      avgDonation: soGiaoDich ? tongQuyenGop / soGiaoDich : 0
    })
  }

  const animatedTotal = useAnimatedNumber(thongKe?.tongQuyenGop || 0, 1200)
  const animatedProjects = useAnimatedNumber(thongKe?.tongDuAn || 0, 800)
  const animatedUsers = useAnimatedNumber(thongKe?.tongNguoiDung || 0, 900)
  const animatedTransactions = useAnimatedNumber(thongKe?.soGiaoDich || 0, 1000)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-900 p-6 text-slate-200">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-indigo-300 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-slate-100">Đang tải dữ liệu...</div>
            <div className="text-slate-400">Vui lòng chờ trong giây lát</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-900 p-6">
        <Card className="max-w-md w-full border-2 border-red-700 shadow-xl bg-slate-800">
          <CardContent className="pt-6 text-slate-200">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Lỗi tải dữ liệu</h3>
                <p className="text-slate-300">{error}</p>
              </div>
              <Button onClick={fetchAll} className="w-full bg-indigo-600 hover:bg-indigo-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950 p-6 text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-white/90 bg-clip-text text-transparent">
              Báo Cáo & Thống Kê
            </h1>
            <p className="text-slate-400">Tổng quan hoạt động quyên góp và dự án từ thiện</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={fetchAll}
              className="flex items-center gap-2 border-2 border-slate-700 hover:border-indigo-400 hover:bg-indigo-800"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-2 border-slate-700 hover:border-emerald-400 hover:bg-emerald-900"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </Button>
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-900 hover:from-indigo-700 hover:to-indigo-950"
            >
              <FileText className="w-4 h-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-slate-800 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-indigo-900">
            <CardTitle className="flex items-center gap-2 text-indigo-100">
              <Filter className="w-5 h-5" />
              Bộ Lọc Dữ Liệu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal border-2 border-slate-700 hover:border-indigo-400">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? fromDate.toLocaleDateString('vi-VN') : "Từ ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={fromDate} onSelect={setFromDate} />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal border-2 border-slate-700 hover:border-indigo-400">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? toDate.toLocaleDateString('vi-VN') : "Đến ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={toDate} onSelect={setToDate} />
                </PopoverContent>
              </Popover>

              <Select value={String(selectedProjectId)} onValueChange={(v) => setSelectedProjectId(v === "all" ? "all" : Number(v))}>
                <SelectTrigger className="border-2 border-slate-700 hover:border-indigo-400">
                  <SelectValue placeholder="Chọn dự án" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-slate-100">
                  <SelectItem value="all">Tất cả dự án</SelectItem>
                  {data.duAn.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.tieu_de}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={String(selectedUserId)} onValueChange={(v) => setSelectedUserId(v === "all" ? "all" : Number(v))}>
                <SelectTrigger className="border-2 border-slate-700 hover:border-indigo-400">
                  <SelectValue placeholder="Chọn người dùng" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 text-slate-100">
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                  {data.nguoiDung.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.ho} {u.ten}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Tổng Quyên Góp"
          value={formatVND(animatedTotal)}
          icon={<DollarSign className="w-8 h-8" />}
          gradient="from-emerald-600 to-teal-700"
          trend={thongKe?.growthRate || 0}
          subtitle="So với tháng trước"
        />
        <KPICard
          title="Số Dự Án"
          value={animatedProjects.toString()}
          icon={<Target className="w-8 h-8" />}
          gradient="from-blue-600 to-indigo-700"
          subtitle="Dự án đang hoạt động"
        />
        <KPICard
          title="Người Dùng"
          value={animatedUsers.toString()}
          icon={<Users className="w-8 h-8" />}
          gradient="from-purple-600 to-pink-700"
          subtitle="Người dùng đã đăng ký"
        />
        <KPICard
          title="Giao Dịch"
          value={animatedTransactions.toString()}
          icon={<Activity className="w-8 h-8" />}
          gradient="from-orange-600 to-red-700"
          subtitle="Giao dịch thành công"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 border-2 shadow-lg hover:shadow-xl transition-all bg-slate-800 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-indigo-900">
            <CardTitle className="flex items-center gap-2 text-indigo-100">
              <TrendingUp className="w-5 h-5" />
              Xu Hướng Quyên Góp Theo Tháng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <MonthlyChart data={thongKe?.byMonth || {}} />
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-all bg-slate-800 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-purple-800 to-pink-900">
            <CardTitle className="flex items-center gap-2 text-pink-100">
              <PieChart className="w-5 h-5" />
              Trạng Thái Dự Án
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <StatusChart data={thongKe?.projectsByStatus || {}} />
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Projects */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-all bg-slate-800 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-green-800 to-emerald-900">
            <CardTitle className="flex items-center gap-2 text-emerald-100">
              <Award className="w-5 h-5" />
              Top 5 Dự Án Được Quyên Góp Nhiều Nhất
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {(thongKe?.topDuAnList || []).map((p: any, idx: number) => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-800 to-emerald-900 border-2 border-emerald-800 hover:border-emerald-600 transition-all">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-100">{p.tieu_de}</div>
                    <div className="text-sm text-slate-300 mt-1">{formatVND(p.so_tien)}</div>
                  </div>
                  <Zap className="w-5 h-5 text-emerald-300" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Donors */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-all bg-slate-800 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-orange-800 to-red-900">
            <CardTitle className="flex items-center gap-2 text-orange-100">
              <Users className="w-5 h-5" />
              Top 5 Nhà Hảo Tâm
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {(thongKe?.topNguoiList || []).map((u: any, idx: number) => (
                <div key={u.uid} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-800 to-orange-900 border-2 border-orange-800 hover:border-orange-600 transition-all">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-700 text-white font-bold shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-100">{u.ten}</div>
                    <div className="text-sm text-slate-300 mt-1">{formatVND(u.so_tien)}</div>
                  </div>
                  <Award className="w-5 h-5 text-orange-300" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Province Distribution */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-all mb-8 bg-slate-800 border-slate-700">
        <CardHeader className="bg-gradient-to-r from-indigo-800 to-blue-900">
          <CardTitle className="flex items-center gap-2 text-indigo-100">
            <MapPin className="w-5 h-5" />
            Phân Bố Quyên Góp Theo Địa Phương
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ProvinceChart data={thongKe?.provinceMap || {}} />
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-all bg-slate-800 border-slate-700">
        <CardHeader className="bg-gradient-to-r from-slate-800 to-blue-900">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <BarChart3 className="w-5 h-5" />
            Tóm Tắt Thống Kê Chi Tiết
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatItem label="Giá trị trung bình mỗi giao dịch" value={formatVND(thongKe?.avgDonation || 0)} icon={<DollarSign className="w-5 h-5" />} />
            <StatItem label="Tổng quyên góp tháng này" value={formatVND(thongKe?.currentMonthAmount || 0)} icon={<TrendingUp className="w-5 h-5" />} />
            <StatItem label="Tổng quyên góp tháng trước" value={formatVND(thongKe?.lastMonthAmount || 0)} icon={<Clock className="w-5 h-5" />} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Component: KPI Card
function KPICard({ title, value, icon, gradient, trend, subtitle }: any) {
  return (
    <Card className="relative overflow-hidden border-2 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-slate-800 border-slate-700">
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-10">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient}`} />
      </div>
      <CardContent className="p-6 relative text-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm font-medium text-slate-300">{title}</div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
            {icon}
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-100 mb-2">{value}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            {trend >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-300 font-semibold">+{trend.toFixed(1)}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-semibold">{trend.toFixed(1)}%</span>
              </>
            )}
            <span className="text-slate-400">{subtitle}</span>
          </div>
        )}
        {!trend && subtitle && (
          <div className="text-sm text-slate-400">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  )
}

// Component: Monthly Chart
function MonthlyChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort()
  const max = Math.max(...entries.map(([, v]) => v), 1)

  if (entries.length === 0) {
    return <div className="text-center text-slate-400 py-8">Chưa có dữ liệu</div>
  }

  return (
    <div className="space-y-3">
      {entries.map(([month, amount]) => (
        <div key={month} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-200">{month}</span>
            <span className="font-semibold text-indigo-300">{formatVND(amount)}</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-900 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(amount / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Component: Status Chart
function StatusChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
  const total = entries.reduce((sum, [, v]) => sum + v, 0)
  const colors = ['from-blue-600 to-blue-800', 'from-green-600 to-green-800', 'from-purple-600 to-purple-800', 'from-orange-600 to-orange-800']

  if (entries.length === 0) {
    return <div className="text-center text-slate-400 py-8">Chưa có dữ liệu</div>
  }

  return (
    <div className="space-y-4">
      {entries.map(([status, count], idx) => (
        <div key={status} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[idx % colors.length]}`} />
              <span className="font-medium text-slate-200 capitalize">{status.replace(/_/g, ' ')}</span>
            </div>
            <span className="font-semibold text-slate-100">{count}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} rounded-full transition-all duration-1000`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Component: Province Chart
function ProvinceChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(([, v]) => v), 1)

  if (entries.length === 0) {
    return <div className="text-center text-slate-400 py-8">Chưa có dữ liệu</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([province, amount]) => (
        <div key={province} className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-900 border-2 border-indigo-800 hover:border-indigo-600 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-700 flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-100">{province}</div>
              <div className="text-xs text-slate-400">Địa phương</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-lg font-bold text-indigo-300">{formatVND(amount)}</div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-700 rounded-full transition-all duration-1000"
                style={{ width: `${(amount / max) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Component: Stat Item
function StatItem({ label, value, icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-indigo-600 transition-all hover:shadow-lg text-slate-100">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-lg">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-sm text-slate-300 mb-2">{label}</div>
          <div className="text-2xl font-bold text-slate-100">{value}</div>
        </div>
      </div>
    </div>
  )
}

// Helper: Format VND
function formatVND(amount: number) {
  if (typeof amount !== "number" || isNaN(amount)) return "₫0"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(amount)
}
