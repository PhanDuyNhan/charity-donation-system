"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { DuAn, DanhMucDuAn, TrangThaiDuAn } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function AdminDuAnPage() {
  const ALL_VALUE = "__all"
  const [duAns, setDuAns] = useState<DuAn[]>([])
  const [loading, setLoading] = useState(false)

  // filters
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [month, setMonth] = useState<string>("__all")
  const [year, setYear] = useState<string>("__all")

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // danh muc
  const [danhMucs, setDanhMucs] = useState<DanhMucDuAn[]>([])

  // modal / form
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DuAn | null>(null)
  const [form, setForm] = useState<Partial<DuAn>>({})
  const [provinces, setProvinces] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [thuVienAnhUploading, setThuVienAnhUploading] = useState(false)

  useEffect(() => {
    fetchAll()
    fetchDanhMuc()
    fetchProvinces()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const res = await apiClient.getDuAn()
      setDuAns(res || [])
    } catch (err) {
      console.error(err)
      alert("Lấy danh sách dự án thất bại. Kiểm tra console.")
    } finally {
      setLoading(false)
    }
  }

  async function fetchDanhMuc() {
    try {
      const res = await apiClient.getDanhMucDuAn()
      setDanhMucs(res || [])
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchProvinces() {
    try {
      const r = await fetch("https://provinces.open-api.vn/api/?depth=1")
      if (!r.ok) return
      const data = await r.json()
      setProvinces(data)
    } catch (err) {
      console.error("Không lấy được list tỉnh:", err)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({})
    setShowForm(true)
  }

  function openEdit(item: DuAn) {
    setEditing(item)
    setForm({
      tieu_de: item.tieu_de,
      mo_ta: item.mo_ta,
      ma_danh_muc: item.ma_danh_muc,
      so_tien_muc_tieu: item.so_tien_muc_tieu,
      ngay_bat_dau: item.ngay_bat_dau,
      ngay_ket_thuc: item.ngay_ket_thuc,
      dia_diem: item.dia_diem,
      anh_dai_dien: item.anh_dai_dien,
      thu_vien_anh: (item.thu_vien_anh ?? []) as string[],
    })
    setShowForm(true)
  }

  async function handleSave() {
    try {
      if (!form.tieu_de || !form.ma_danh_muc) {
        alert("Vui lòng nhập tiêu đề và chọn danh mục")
        return
      }

      if (editing) {
        await apiClient.updateDuAn(editing.id, form)
        alert("Cập nhật dự án thành công")
      } else {
        await apiClient.createDuAn(form)
        alert("Tạo dự án thành công")
      }
      setShowForm(false)
      fetchAll()
    } catch (err) {
      console.error(err)
      alert("Lưu dự án thất bại.")
    }
  }

  async function handleDelete(item: DuAn) {
    const ok = confirm(`Bạn có chắc muốn xóa dự án: "${item.tieu_de}" không?`)
    if (!ok) return
    try {
      await apiClient.deleteDuAn(item.id)
      alert("Xóa thành công")
      fetchAll()
    } catch (err) {
      console.error(err)
      alert("Xóa thất bại.")
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // @ts-ignore
      const resp = await apiClient.uploadFile(file)
      const url = resp.url ?? resp.path
      setForm((s) => ({ ...s, anh_dai_dien: url }))
    } catch (err) {
      alert("Upload ảnh thất bại")
    } finally {
      setUploading(false)
    }
  }

  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setThuVienAnhUploading(true)
    try {
      const uploaded: string[] = []
      for (const f of files) {
        // @ts-ignore
        const resp = await apiClient.uploadFile(f)
        const url = resp.url ?? resp.path
        if (url) uploaded.push(url)
      }
      setForm((s) => ({ ...s, thu_vien_anh: [...(s.thu_vien_anh ?? []), ...uploaded] }))
    } finally {
      setThuVienAnhUploading(false)
    }
  }

  function removeGalleryImage(idx: number) {
    setForm((s) => ({ ...s, thu_vien_anh: (s.thu_vien_anh || []).filter((_, i) => i !== idx) }))
  }

  // lọc
  const filtered = duAns
    .filter((d) => (search ? d.tieu_de?.toLowerCase().includes(search.toLowerCase()) : true))
    .filter((d) => (categoryId ? d.ma_danh_muc === categoryId : true))
    .filter((d) => (statusFilter ? String(d.trang_thai) === statusFilter : true))
    .filter((d) => {
      if (month === "__all" && year === "__all") return true
      const startDate = new Date(d.ngay_bat_dau)
      const monthMatch = month === "__all" || startDate.getMonth() + 1 === Number(month)
      const yearMatch = year === "__all" || startDate.getFullYear() === Number(year)
      return monthMatch && yearMatch
    })

  // phân trang
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // thống kê
  const stats = {
    total: duAns.length,
    hoat_dong: duAns.filter((d) => d.trang_thai === "hoat_dong").length,
    tam_dung: duAns.filter((d) => d.trang_thai === "tam_dung").length,
    ban_nhap: duAns.filter((d) => d.trang_thai === "ban_nhap").length,
    hoan_thanh: duAns.filter((d) => d.trang_thai === "hoan_thanh").length,
  }

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng dự án</p>
            <p className="text-sm font-medium">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Hoạt động</p>
            <p className="text-lg font-medium">{stats.hoat_dong}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tạm dừng</p>
            <p className="text-lg font-medium">{stats.tam_dung}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Hoàn thành</p>
            <p className="text-lg font-medium">{stats.hoan_thanh}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Tìm kiếm & bộ lọc</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <Input className="text-sm" placeholder="Tìm theo tiêu đề" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Danh mục */}
            <Select onValueChange={(v) => setCategoryId(v && v !== ALL_VALUE ? Number(v) : undefined)}>
              <SelectTrigger className="min-w-[160px] text-sm">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                {danhMucs.map((dm) => <SelectItem key={dm.id} value={String(dm.id)}>{dm.ten}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Trạng thái */}
            <Select onValueChange={(v) => setStatusFilter(v && v !== ALL_VALUE ? v : undefined)}>
              <SelectTrigger className="min-w-[140px] text-sm">
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

            {/* Tháng */}
            <Select onValueChange={(v) => setMonth(v)}>
              <SelectTrigger className="w-[110px] text-sm">
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Tất cả</SelectItem>
                {[...Array(12)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Tháng {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Năm */}
            <Select onValueChange={(v) => setYear(v)}>
              <SelectTrigger className="w-[110px] text-sm">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">Tất cả</SelectItem>
                {[2022, 2023, 2024, 2025].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />
            <Button className="text-sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Thêm dự án
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Danh sách dự án ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="py-2">Tiêu đề</th>
                  <th className="py-2">Danh mục</th>
                  <th className="py-2">Mục tiêu</th>
                  <th className="py-2">Địa điểm</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-6 text-center text-sm">Đang tải...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-sm">Không có dự án</td></tr>
                ) : (
                  paginated.map((d) => (
                    <tr key={d.id} className="border-b text-sm">
                      <td className="py-2">{d.tieu_de}</td>
                      <td className="py-2">{d.ma_danh_muc}</td>
                      <td className="py-2">{d.so_tien_muc_tieu?.toLocaleString?.() ?? ""}</td>
                      <td className="py-2">{d.dia_diem}</td>
                      <td className="py-2">{d.trang_thai}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="text-xs" onClick={() => openEdit(d)}>
                            <Edit2 className="mr-1 h-3.5 w-3.5" />Sửa
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleDelete(d)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />Xóa
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
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
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
      {/* Form thêm / sửa dự án */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100">
              {editing ? "Chỉnh sửa dự án" : "Thêm dự án"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Tiêu đề
                </label>
                <Input
                  placeholder="Nhập tiêu đề dự án"
                  className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  value={form.tieu_de || ""}
                  onChange={(e) => setForm({ ...form, tieu_de: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Số tiền mục tiêu
                </label>
                <Input
                  type="number"
                  placeholder="Nhập số tiền mục tiêu"
                  className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  value={form.so_tien_muc_tieu || ""}
                  onChange={(e) =>
                    setForm({ ...form, so_tien_muc_tieu: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Danh mục
                </label>
                <Select
                  onValueChange={(v) => setForm({ ...form, ma_danh_muc: Number(v) })}
                  defaultValue={String(form.ma_danh_muc || "")}
                >
                  <SelectTrigger className="bg-gray-100 dark:bg-slate-800">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {danhMucs.map((dm) => (
                      <SelectItem key={dm.id} value={String(dm.id)}>
                        {dm.ten}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Địa điểm (tỉnh/thành)
                </label>
                <Select
                  value={form.dia_diem || ""}
                  onValueChange={(v) => setForm({ ...form, dia_diem: v })}
                >
                  <SelectTrigger className="bg-gray-100 dark:bg-slate-800">
                    <SelectValue placeholder="Chọn địa điểm (tỉnh/thành)" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.code} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Ngày bắt đầu
                </label>
                <Input
  type="date"
  value={form.ngay_bat_dau || ""}
  onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })}
  className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 [color-scheme:light]"
/>

              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                  Ngày kết thúc
                </label>
                <Input
  type="date"
  value={form.ngay_ket_thuc || ""}
  onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })}
  className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 [color-scheme:light]"
/>

              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Mô tả dự án
              </label>
              <Textarea
                rows={4}
                placeholder="Nhập mô tả ngắn gọn về dự án"
                className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                value={form.mo_ta || ""}
                onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
              />
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Ảnh đại diện
              </label>
              <Input type="file" onChange={handleFileChange} />
              {form.anh_dai_dien && (
                <img
                  src={form.anh_dai_dien}
                  alt="preview"
                  className="w-32 h-32 object-cover rounded-md mt-2 border"
                />
              )}
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                Thư viện ảnh (mô tả chi tiết)
              </label>
              <Input type="file" multiple onChange={handleGalleryChange} />
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.thu_vien_anh || []).map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={uploading || thuVienAnhUploading}>
                {editing ? "Cập nhật" : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
