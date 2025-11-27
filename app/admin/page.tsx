"use client"

import React, { useEffect, useMemo, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Users, FolderKanban, Calendar, BarChart3, MapPin, Zap } from "lucide-react"
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Brush } from 'recharts' 
import { apiClient } from "@/lib/api-client"
import type { DuAn, QuyenGop, DanhMucDuAn, NguoiDung, SuKien } from "@/lib/types"

// Animated number hook (smooth, non-looping)
function useAnimatedNumber(value: number, ms = 900) {
  const [n, setN] = useState(0)
  const rafRef = useRef<number | null>(null)
  const fromRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const from = fromRef.current
    const to = value
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const frame = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(from + (to - from) * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(frame)
      else fromRef.current = to
    }

    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, ms])

  return n
}

function formatVND(amount?: number) {
  if (typeof amount !== "number" || isNaN(amount)) return "₫0"
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount)
}

function lastNMonthsLabels(n = 6) {
  const res: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleString("vi-VN", { month: "short", year: "numeric" })
    res.push({ key, label })
  }
  return res
}

export default function HomePageDark() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [duAns, setDuAns] = useState<DuAn[]>([])
  const [nguoiDungs, setNguoiDungs] = useState<NguoiDung[]>([])
  const [suKiens, setSuKiens] = useState<SuKien[]>([])
  const [quyenGops, setQuyenGops] = useState<QuyenGop[]>([])
  const [danhMucs, setDanhMucs] = useState<DanhMucDuAn[]>([])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [duAnRes, nguoiRes, suKienRes, quyenRes, danhMucRes] = await Promise.all([
          apiClient.getDuAn(),
          apiClient.getNguoiDung(),
          apiClient.getSuKien(),
          apiClient.getQuyenGop(),
          apiClient.getDanhMucDuAn(),
        ])
        if (!mounted) return
        setDuAns(duAnRes || [])
        setNguoiDungs(nguoiRes || [])
        setSuKiens(suKienRes || [])
        setQuyenGops(quyenRes || [])
        setDanhMucs(danhMucRes || [])
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "Lỗi khi gọi API")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  // Use fields that actually exist on the QuyenGop type (so_tien, ngay_tao)
  const totalQuyenGop = useMemo(() => quyenGops.reduce((s, q) => s + (Number(q.so_tien) || 0), 0), [quyenGops])
  const animatedTotal = useAnimatedNumber(totalQuyenGop, 1000)
  const duAnCount = duAns.length
  const activeDuAnCount = useMemo(() => duAns.filter((d) => String((d as any).trang_thai ?? "").toLowerCase().includes("hoat")).length, [duAns])
  const nguoiDungCount = nguoiDungs.length
  const suKienCount = suKiens.length

  // categories distribution
  const categories = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>()
    for (const dm of danhMucs) map.set(dm.id, { id: dm.id, name: dm.ten, count: 0 })
    for (const d of duAns) {
      const id = (d as any).ma_danh_muc ?? d.ma_danh_muc
      if (typeof id === "number") {
        if (map.has(id)) map.get(id)!.count++
        else map.set(id, { id, name: `#${id}`, count: 1 })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [danhMucs, duAns])

  // Monthly aggregation (use existing fields: ngay_tao and so_tien)
  const monthly = useMemo(() => {
    const labels = lastNMonthsLabels(6)
    const data = labels.map(() => 0)
    const keyToIndex = new Map(labels.map((l, i) => [l.key, i]))
    for (const q of quyenGops) {
      const dateStr = q.ngay_tao ?? q.ngay_cap_nhat
      if (!dateStr) continue
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const idx = keyToIndex.get(key)
      if (typeof idx === "number") data[idx] += Number(q.so_tien) || 0
    }
    return labels.map((l, i) => ({ label: l.label, value: data[i] }))
  }, [quyenGops])

  const monthlyMax = useMemo(() => Math.max(...monthly.map((m) => m.value), 0), [monthly])

  // CSV download helper for monthly data
  function downloadCSV(data: { label: string; value: number }[]) {
    const header = ['Tháng', 'Số tiền']
    const rows = data.map(d => [d.label, String(d.value)])
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', 'quyen_gop_theo_thang.csv')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Recent activity: resolve donor name from nguoiDungs where possible
  const recentActivity = useMemo(() => {
    const items: { action: string; detail: string; time: string }[] = []
    for (const q of quyenGops.slice(-10).reverse()) {
      const donorName = nguoiDungs.find((u) => u.id === q.ma_nguoi_dung)?.ten ?? "Người ẩn"
      items.push({ action: "Quyên góp", detail: `${donorName} quyên góp ${formatVND(Number(q.so_tien) || 0)} cho dự án #${q.ma_du_an}`, time: q.ngay_tao ?? q.ngay_cap_nhat ?? "" })
    }
    for (const p of duAns.slice(-5).reverse()) items.push({ action: "Dự án", detail: `${p.tieu_de} — mục tiêu ${formatVND(p.so_tien_muc_tieu)}`, time: p.ngay_tao ?? "" })
    for (const s of suKiens.slice(-5).reverse()) items.push({ action: "Sự kiện", detail: s.tieu_de, time: s.ngay_tao ?? s.thoi_gian_bat_dau ?? "" })
    items.sort((a, b) => (b.time ? new Date(b.time).getTime() : 0) - (a.time ? new Date(a.time).getTime() : 0))
    return items.slice(0, 6)
  }, [quyenGops, duAns, suKiens, nguoiDungs])

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950 p-6 text-slate-100 rounded-lg">
        <div className="text-center">
          <BarChart3 className="mx-auto w-12 h-12 animate-pulse text-indigo-300" />
          <div className="mt-3 text-lg font-semibold">Đang tải dữ liệu...</div>
          <div className="text-sm text-slate-400">Vui lòng chờ — đang lấy dữ liệu từ server</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[200px] p-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent>
            <div className="text-red-400">Có lỗi: {error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6 p-6 bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-950 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-white/90">Trang Chủ — Tổng Quan</h1>
          <p className="text-slate-400 mt-1">Bảng điều khiển tóm tắt hoạt động quyên góp và dự án</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-gradient-to-r from-indigo-600 to-indigo-900">Xem báo cáo</Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Tổng Quyên Góp</div>
                <div className="text-2xl font-bold mt-1">{formatVND(animatedTotal)}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Dự Án Đang Hoạt Động</div>
                <div className="text-2xl font-bold mt-1">{activeDuAnCount}</div>
                <div className="text-xs text-slate-400 mt-1">{duAnCount} dự án tổng</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow">
                <FolderKanban className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Người Dùng</div>
                <div className="text-2xl font-bold mt-1">{nguoiDungCount}</div>
                <div className="text-xs text-slate-400 mt-1">Người dùng đã đăng ký</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-700 text-white shadow">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Sự Kiện</div>
                <div className="text-2xl font-bold mt-1">{suKienCount}</div>
                <div className="text-xs text-slate-400 mt-1">Sự kiện gần đây</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-600 to-red-700 text-white shadow">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly: improved visual — interactive Recharts chart */}
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-200">
              Quyên Góp Theo Tháng
            </CardTitle>
            <CardDescription className="text-[15px] text-slate-300/90 leading-relaxed mt-1 font-medium">
              6 tháng gần nhất · <span className="text-indigo-300 font-semibold">Hover</span> để xem chi tiết · <span className="text-indigo-300 font-semibold">Kéo</span> để zoom
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-slate-300">Tổng: <span className="font-semibold text-slate-100">{formatVND(monthly.reduce((s, m) => s + m.value, 0))}</span></div>
              <div className="flex items-center gap-2">
                <Button onClick={() => downloadCSV(monthly)} className="text-sm bg-slate-700 border-slate-600">Export CSV</Button>
                <Button onClick={() => window.print()} className="text-sm bg-slate-700 border-slate-600">In</Button>
              </div>
            </div>

            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <ComposedChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="label" tick={{ fill: '#e2e8f0', fontSize: 13, fontWeight: 600 }} tickMargin={10} />
                  <YAxis
                    tickFormatter={(v: number) => (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(v))}
                    tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatVND(Number(value))}
                    contentStyle={{ background:'#0f172a', border:'1px solid #334155', borderRadius:8 }}
                    labelStyle={{ color:'#e2e8f0', fontWeight:700 }}
                    itemStyle={{ color:'#cbd5e1', fontSize:13 }}
                  />
                  <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600 }} />

                  <Area type="monotone" dataKey="value" name="Xu hướng" stroke="#6366f1" fill="url(#colorAmt)" fillOpacity={0.6} />
                  <Bar dataKey="value" name="Số tiền" barSize={22} fill="url(#colorBar)" radius={[6,6,0,0]} />

                  <Brush dataKey="label" height={30} stroke="#374151" travellerWidth={10} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 text-xs text-slate-400">Gợi ý: dùng chuột để kéo vùng trên thanh dưới (brush) để zoom vào khoảng thời gian.</div>
          </CardContent>
        </Card>

        {/* Categories: show percent badges + progress */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Dự Án Theo Danh Mục</CardTitle>
            <CardDescription className="text-slate-400">Phân bố dự án</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((c) => {
                const pct = duAnCount > 0 ? Math.round((c.count / duAnCount) * 100) : 0
                return (
                  <div key={c.id} className="p-3 rounded-md bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">{c.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="text-sm font-medium text-slate-100">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.count} dự án</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-200">{pct}%</div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div style={{ width: `${pct}%`, background: "linear-gradient(90deg,#34d399,#10b981)" }} className="h-2 rounded-full transition-all duration-500" />
                    </div>
                  </div>
                )
              })}

              {categories.length === 0 && <div className="text-slate-400">Chưa có danh mục hoặc dự án.</div>}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity panel spanning full width on small screens */}
        <Card className="lg:col-span-3 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Hoạt Động Gần Đây</CardTitle>
            <CardDescription className="text-slate-400">Các sự kiện và quyên góp mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentActivity.map((act, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-gradient-to-r from-slate-800 to-indigo-900 border border-indigo-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">{idx + 1}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-100">{act.action}</div>
                      <div className="text-sm text-slate-300 mt-1">{act.detail}</div>
                      <div className="text-xs text-slate-500 mt-2">{act.time ? new Date(act.time).toLocaleString() : "-"}</div>
                    </div>
                    <div className="text-indigo-200"><Zap /></div>
                  </div>
                </div>
              ))}

              {recentActivity.length === 0 && <div className="text-slate-400">Không có hoạt động gần đây.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
