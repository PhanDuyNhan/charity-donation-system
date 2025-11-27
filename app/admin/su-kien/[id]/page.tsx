"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { DuAn, DanhMucDuAn } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"

function toIsoFromLocal(dtLocal: string) { return new Date(dtLocal).toISOString() }

export default function EditDuAnPage() {
  const params = useParams() as { id?: string }
  const id = Number(params?.id)
  const router = useRouter()

  const [cats, setCats] = useState<DanhMucDuAn[]>([])
  const [item, setItem] = useState<Partial<DuAn>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiClient.getDanhMucDuAn().then(r => setCats(r || [])).catch(console.error)
    if (id) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function load() {
    setLoading(true)
    try {
      const list = await apiClient.getDuAn()
      const found = list.find(d => d.id === id)
      if (!found) return alert("Không tìm thấy dự án")
      setItem(found)
    } catch (err) {
      console.error(err)
      alert("Load thất bại")
    } finally { setLoading(false) }
  }

  async function handleUploadImage(file?: File) {
    if (!file) return
    const resp = await apiClient.uploadFile(file)
    const url = (resp.url ?? resp.path) as string
    setItem(prev => ({ ...(prev || {}), thu_vien_anh: [...(prev?.thu_vien_anh || []), url] }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!item.tieu_de) return alert("Tiêu đề bắt buộc")
    if (!item.ma_danh_muc) return alert("Chọn danh mục")
    setSaving(true)
    try {
      const payload: Partial<DuAn> = {
        tieu_de: item.tieu_de,
        mo_ta: item.mo_ta,
        mo_chi_tiet: item.mo_chi_tiet,
        ma_danh_muc: item.ma_danh_muc,
        so_tien_muc_tieu: Number(item.so_tien_muc_tieu),
        ngay_bat_dau: item.ngay_bat_dau ? new Date(item.ngay_bat_dau).toISOString() : undefined,
        dia_diem: item.dia_diem,
        thu_vien_anh: item.thu_vien_anh,
      }
      await apiClient.updateDuAn(id, payload)
      router.push("/admin/du-an")
    } catch (err) {
      console.error("Lưu thất bại", err)
      alert("Lưu thất bại")
    } finally { setSaving(false) }
  }

  if (loading) return <div>Đang tải...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Sửa dự án</h2>
        <Link href="/admin/du-an" className="text-sm text-muted-foreground">Quay lại</Link>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Tiêu đề *</label>
          <Input value={item.tieu_de ?? ""} onChange={(e) => setItem({ ...item, tieu_de: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm mb-1">Danh mục *</label>
          <Select onValueChange={(v) => setItem({ ...item, ma_danh_muc: Number(v) })}>
            <SelectTrigger className="w-full"><SelectValue placeholder={cats.find(c => c.id === item.ma_danh_muc)?.ten || "Chọn danh mục"} /></SelectTrigger>
            <SelectContent>
              {cats.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.ten}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm mb-1">Mô tả ngắn</label>
          <Textarea value={item.mo_ta ?? ""} onChange={(e) => setItem({ ...item, mo_ta: e.target.value })} rows={3} />
        </div>

        <div>
          <label className="block text-sm mb-1">Mô tả chi tiết</label>
          <Textarea value={item.mo_chi_tiet ?? ""} onChange={(e) => setItem({ ...item, mo_chi_tiet: e.target.value })} rows={6} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Số tiền mục tiêu (VND)</label>
            <Input type="number" value={String(item.so_tien_muc_tieu ?? "")} onChange={(e) => setItem({ ...item, so_tien_muc_tieu: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Ngày bắt đầu</label>
            <Input type="date" value={item.ngay_bat_dau ? new Date(item.ngay_bat_dau).toISOString().slice(0,10) : ""} onChange={(e) => setItem({ ...item, ngay_bat_dau: e.target.value ? new Date(e.target.value).toISOString() : undefined })} />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Ảnh (upload)</label>
          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f) }} />
          <div className="mt-2 flex gap-2 flex-wrap">
            {(item.thu_vien_anh || []).map((u, i) => <img key={i} src={u} alt="" className="h-20 w-28 object-cover rounded" />)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</Button>
          <Link href="/admin/du-an" className="btn btn-ghost">Hủy</Link>
        </div>
      </form>
    </div>
  )
}
