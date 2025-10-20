"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, FolderKanban, Calendar, TrendingUp, ArrowUp } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { DuAn, QuyenGop, DanhMucDuAn, NguoiDung, SuKien } from "@/lib/types"

function formatCurrency(n?: number) {
  if (!n) return "0 đ"
  try {
    return n.toLocaleString("vi-VN") + " đ"
  } catch {
    return String(n) + " đ"
  }
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

export default function Page() {
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

  const totalQuyenGop = useMemo(() => {
    return quyenGops.reduce((s, q) => s + (q.so_tien_thuc_nhan ?? q.so_tien ?? 0), 0)
  }, [quyenGops])

  const duAnCount = duAns.length

  // Count active projects safely
  const activeDuAnCount = useMemo(() => {
    return duAns.filter((d) => {
      const s = String((d as any).trang_thai ?? (d as any).status ?? "").toLowerCase()
      return s === "hoat_dong" || s === "active" || s.includes("hoat") || s.includes("active")
    }).length
  }, [duAns])

  const nguoiDungCount = nguoiDungs.length
  const suKienCount = suKiens.length

  const categories = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>()
    for (const dm of danhMucs) {
      map.set(dm.id, { id: dm.id, name: dm.ten, count: 0 })
    }
    for (const d of duAns) {
      const id = d.ma_danh_muc
      if (map.has(id)) map.get(id)!.count++
      else map.set(id, { id, name: `#${id}`, count: 1 })
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [danhMucs, duAns])

  // Precompute monthly sums and max value safely
  const monthly = useMemo(() => {
    const labels = lastNMonthsLabels(6)
    const data = labels.map(() => 0)
    const keyToIndex = new Map(labels.map((l, i) => [l.key, i]))

    for (const q of quyenGops) {
      const dateStr = q.ngay_tao ?? q.ngay_hoan_thanh ?? q.ngay_thanh_toan_tiep_theo
      if (!dateStr) continue
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      const idx = keyToIndex.get(key)
      if (typeof idx === "number") {
        data[idx] += q.so_tien_thuc_nhan ?? q.so_tien ?? 0
      }
    }

    const list = labels.map((l, i) => ({ label: l.label, value: data[i] }))
    return list
  }, [quyenGops])

  const monthlyMax = useMemo(() => {
    const max = Math.max(...monthly.map((m) => m.value), 0)
    return max
  }, [monthly])

  const recentActivity = useMemo(() => {
    const items: { action: string; detail: string; time: string; date: string }[] = []

    for (const q of quyenGops.slice(-10).reverse()) {
      items.push({
        action: "Quyên góp mới",
        detail: `${q.ten_nguoi_quyen_gop ?? "Người dùng ẩn"} quyên góp ${formatCurrency(
          q.so_tien_thuc_nhan ?? q.so_tien ?? 0
        )} cho dự án #${q.ma_du_an}`,
        time: q.ngay_tao ?? q.ngay_hoan_thanh ?? "",
        date: q.ngay_tao ?? q.ngay_hoan_thanh ?? "",
      })
    }

    for (const p of duAns.slice(-5).reverse()) {
      items.push({
        action: "Dự án mới",
        detail: `${p.tieu_de} — mục tiêu ${formatCurrency(p.so_tien_muc_tieu)}`,
        time: p.ngay_tao ?? "",
        date: p.ngay_tao ?? "",
      })
    }

    for (const s of suKiens.slice(-5).reverse()) {
      items.push({
        action: "Sự kiện",
        detail: s.tieu_de,
        time: s.ngay_tao ?? s.thoi_gian_bat_dau ?? "",
        date: s.ngay_tao ?? s.thoi_gian_bat_dau ?? "",
      })
    }

    items.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0
      const db = b.date ? new Date(b.date).getTime() : 0
      return db - da
    })

    return items.slice(0, 6)
  }, [quyenGops, duAns, suKiens])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div>Đang tải dữ liệu...</div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Có lỗi: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Tổng Quan</h2>
        <p className="text-neutral-400 mt-1">Thống kê tổng quan hệ thống từ thiện (dữ liệu thực tế)</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="admin-card bg-[#0f1724]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Tổng Quyên Góp</CardTitle>
            <DollarSign className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalQuyenGop)}</div>
            <p className="text-xs text-green-400 flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>So sánh tự động chưa bật</span>
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card bg-[#0f1724]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Dự Án Đang Hoạt Động</CardTitle>
            <FolderKanban className="h-5 w-5 text-primary-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{activeDuAnCount}</div>
            <p className="text-xs text-neutral-400 mt-1">
              {duAnCount} dự án tổng · {activeDuAnCount} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card bg-[#0f1724]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Người Dùng</CardTitle>
            <Users className="h-5 w-5 text-secondary-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{nguoiDungCount}</div>
            <p className="text-xs text-neutral-400 mt-1">Người dùng đã đăng ký</p>
          </CardContent>
        </Card>

        <Card className="admin-card bg-[#0f1724]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Sự Kiện Sắp Tới</CardTitle>
            <Calendar className="h-5 w-5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{suKienCount}</div>
            <p className="text-xs text-neutral-400 mt-1">Sự kiện được tạo</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly donations */}
        <Card className="admin-card bg-[#0f1724]">
          <CardHeader>
            <CardTitle className="text-white">Quyên Góp Theo Tháng</CardTitle>
            <CardDescription className="text-neutral-400">6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-[240px] flex flex-col justify-center text-neutral-400">
                {monthly.map((m) => {
                  const pct = monthlyMax > 0 ? Math.round((m.value / monthlyMax) * 100) : 0
                  return (
                    <div key={m.label} className="w-full flex items-center gap-4 py-1">
                      <div className="w-36 text-sm text-neutral-300">{m.label}</div>

                      <div className="flex-1">
                        {/* track */}
                        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                          {/* fill */}
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#60a5fa,#3b82f6)" }}
                          />
                        </div>
                      </div>

                      <div className="w-28 text-right text-sm text-neutral-300">{formatCurrency(m.value)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="admin-card bg-[#0f1724]">
          <CardHeader>
            <CardTitle className="text-white">Dự Án Theo Danh Mục</CardTitle>
            <CardDescription className="text-neutral-400">Phân bố dự án theo danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((c) => {
                const pct = duAnCount > 0 ? Math.round((c.count / duAnCount) * 100) : 0
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-200">{c.name}</span>
                      <span className="text-neutral-400">{c.count} dự án</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg,#34d399,#10b981)" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="admin-card bg-[#0f1724]">
        <CardHeader>
          <CardTitle className="text-white">Hoạt Động Gần Đây</CardTitle>
          <CardDescription className="text-neutral-400">Các hoạt động mới nhất trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-neutral-800 last:border-0 last:pb-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <div className="h-2 w-2 rounded-full bg-primary-500" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-neutral-200">{activity.action}</p>
                  <p className="text-sm text-neutral-400">{activity.detail}</p>
                  <p className="text-xs text-neutral-500">{new Date(activity.time).toLocaleString()}</p>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && <div className="text-neutral-400">Không có hoạt động gần đây</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
