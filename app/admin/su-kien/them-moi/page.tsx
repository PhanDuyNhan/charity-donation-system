"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { DanhMucDuAn } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"

function toIsoFromLocal(dtLocal: string) { return new Date(dtLocal).toISOString() }

export default function CreateDuAnPage() {
  const router = useRouter()
  const [cats, setCats] = useState<DanhMucDuAn[]>([])
  const [tieu_de, setTieuDe] = useState("")
  const [mo_ta, setMoTa] = useState("")
  const [chi_tiet, setChiTiet] = useState("")
  const [ma_danh_muc, setMaDanhMuc] = useState<number | "">("")
  const [so_tien_muc_tieu, setSoTien] = useState<number | "">("")
  const [ngay_bat_dau, setNgayBatDau] = useState("")
  const [dia_diem, setDiaDiem] = useState("")
  const [thu_vien_anh, setThuVienAnh] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { apiClient.getDanhMucDuAn().then(r => setCats(r || [])).catch(console.error) }, [])

  async function handleUploadImage(file?: File) {
    if (!file) return
    const resp = await apiClient.uploadFile(file)
    // assume resp.url or resp.path
    const url = (resp.url ?? resp.path) as string
    setThuVienAnh(prev => [...prev, url])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tieu_de.trim()) return alert("Tiêu đề bắt buộc")
    if (!ma_danh_muc) return alert("Chọn danh mục")
    if (!so_tien_muc_tieu) return alert("Nhập số tiền mục tiêu")
    setLoading(true)
    try {
      await apiClient.createDuAn({
        tieu_de: tieu_de.trim(),
        mo_ta: mo_ta.trim(),
        mo_chi_tiet: chi_tiet.trim(),
        ma_danh_muc,
        so_tien_muc_tieu: Number(so_tien_muc_tieu),
        ngay_bat_dau: ngay_bat_dau ? toIsoFromLocal(ngay_bat_dau) : undefined,
        dia_diem: dia_diem.trim(),
        thu_vien_anh,
      })
      router.push("/admin/du-an")
    } catch (err) {
      console.error("Tạo dự án thất bại", err)
      alert("Tạo thất bại")
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Thêm dự án</h2>
        <Link href="/admin/du-an" className="text-sm text-muted-foreground">Quay lại danh sách</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Tiêu đề *</label>
          <Input value={tieu_de} onChange={(e) => setTieuDe(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Danh mục *</label>
          <Select onValueChange={(v) => setMaDanhMuc(Number(v))}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
            <SelectContent>
              {cats.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.ten}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm mb-1">Mô tả ngắn</label>
          <Textarea value={mo_ta} onChange={(e) => setMoTa(e.target.value)} rows={3} />
        </div>

        <div>
          <label className="block text-sm mb-1">Mô tả chi tiết</label>
          <Textarea value={chi_tiet} onChange={(e) => setChiTiet(e.target.value)} rows={6} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Số tiền mục tiêu (VND) *</label>
            <Input type="number" value={so_tien_muc_tieu as any} onChange={(e) => setSoTien(Number(e.target.value || ""))} />
          </div>
          <div>
            <label className="block text-sm mb-1">Ngày bắt đầu</label>
            <Input type="date" value={ngay_bat_dau} onChange={(e) => setNgayBatDau(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Địa điểm</label>
          <Input value={dia_diem} onChange={(e) => setDiaDiem(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm mb-1">Ảnh (upload)</label>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f) }} />
          <div className="mt-2 flex gap-2 flex-wrap">
            {thu_vien_anh.map((u, i) => <img key={i} src={u} alt="" className="h-20 w-28 object-cover rounded" />)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? "Đang lưu..." : "Tạo dự án"}</Button>
          <Link href="/admin/du-an" className="btn btn-ghost">Hủy</Link>
        </div>
      </form>
    </div>
  )
}
