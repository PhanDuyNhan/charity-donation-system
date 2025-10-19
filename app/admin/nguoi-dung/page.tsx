"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung, VaiTroNguoiDung, TrangThaiNguoiDung } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function QuanLyNguoiDungPage() {
  const ALL_VALUE = "__all"
  const [nguoiDungs, setNguoiDungs] = useState<NguoiDung[]>([])
  const [search, setSearch] = useState("")
  const [vaiTro, setVaiTro] = useState<string | undefined>(undefined)
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<NguoiDung | null>(null)
  const [form, setForm] = useState<Partial<NguoiDung>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNguoiDung()
  }, [])

  async function fetchNguoiDung() {
    setLoading(true)
    try {
      const res = await apiClient.getNguoiDung()
      setNguoiDungs(res || [])
    } catch (err) {
      console.error("Lỗi lấy người dùng:", err)
      alert("Không thể tải danh sách người dùng.")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({})
    setShowForm(true)
  }

  function openEdit(user: NguoiDung) {
    setEditing(user)
    setForm({
      ten: user.ten,
      ho: user.ho,
      email: user.email,
      so_dien_thoai: user.so_dien_thoai,
      dia_chi: user.dia_chi,
      ngay_sinh: user.ngay_sinh,
      vai_tro: user.vai_tro,
      trang_thai: user.trang_thai,
    })
    setShowForm(true)
  }

  async function handleSave() {
    try {
      if (!form.email || !form.ten || !form.ho) {
        alert("Vui lòng nhập đủ họ, tên và email.")
        return
      }

      if (editing) {
        await apiClient.updateNguoiDung(editing.id, form)
        alert("Cập nhật người dùng thành công.")
      } else {
        await apiClient.createNguoiDung(form)
        alert("Thêm người dùng thành công.")
      }

      setShowForm(false)
      fetchNguoiDung()
    } catch (err) {
      console.error(err)
      alert("Lưu thất bại.")
    }
  }

  async function handleDelete(user: NguoiDung) {
    const ok = confirm(`Bạn có chắc muốn xóa người dùng \"${user.ho} ${user.ten}\" không?`)
    if (!ok) return
    try {
      await apiClient.deleteNguoiDung(user.id)
      alert("Xóa thành công.")
      fetchNguoiDung()
    } catch (err) {
      console.error(err)
      alert("Xóa thất bại.")
    }
  }

  const filtered = nguoiDungs
    .filter((n) =>
      search
        ? `${n.ho} ${n.ten}`.toLowerCase().includes(search.toLowerCase()) ||
          n.email.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .filter((n) => (vaiTro ? n.vai_tro === vaiTro : true))
    .filter((n) => (trangThai ? n.trang_thai === trangThai : true))

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: nguoiDungs.length,
    quan_tri_vien: nguoiDungs.filter((n) => n.vai_tro === "quan_tri_vien").length,
    dieu_hanh_vien: nguoiDungs.filter((n) => n.vai_tro === "dieu_hanh_vien").length,
    bien_tap_vien: nguoiDungs.filter((n) => n.vai_tro === "bien_tap_vien").length,
    nguoi_dung: nguoiDungs.filter((n) => n.vai_tro === "nguoi_dung").length,
    tinh_nguyen_vien: nguoiDungs.filter((n) => n.vai_tro === "tinh_nguyen_vien").length,
  }

  return (
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries({
          'Tổng người dùng': stats.total,
          'Quản trị viên': stats.quan_tri_vien,
          'Điều hành viên': stats.dieu_hanh_vien,
          'Biên tập viên': stats.bien_tap_vien,
          'Người dùng': stats.nguoi_dung,
        }).map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bộ lọc */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Tìm kiếm & bộ lọc người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <Input
                className="text-sm"
                placeholder="Tìm theo tên hoặc email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select onValueChange={(v) => setVaiTro(v && v !== ALL_VALUE ? v : undefined)}>
              <SelectTrigger className="min-w-[160px] text-sm">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                <SelectItem value="quan_tri_vien">Quản trị viên</SelectItem>
                <SelectItem value="dieu_hanh_vien">Điều hành viên</SelectItem>
                <SelectItem value="bien_tap_vien">Biên tập viên</SelectItem>
                <SelectItem value="nguoi_dung">Người dùng</SelectItem>
                <SelectItem value="tinh_nguyen_vien">Tình nguyện viên</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(v) => setTrangThai(v && v !== ALL_VALUE ? v : undefined)}>
              <SelectTrigger className="min-w-[160px] text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                <SelectItem value="hoat_dong">Hoạt động</SelectItem>
                <SelectItem value="khong_hoat_dong">Không hoạt động</SelectItem>
                <SelectItem value="bi_khoa">Bị khóa</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />
            <Button className="text-sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />Thêm người dùng
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Danh sách người dùng ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b">
                  <th className="py-2">Họ tên</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Số điện thoại</th>
                  <th className="py-2">Vai trò</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-6 text-center text-sm">Đang tải...</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-sm">Không có người dùng</td></tr>
                ) : (
                  paginated.map((n) => (
                    <tr key={n.id} className="border-b text-sm">
                      <td className="py-2">{`${n.ho} ${n.ten}`}</td>
                      <td className="py-2">{n.email}</td>
                      <td className="py-2">{n.so_dien_thoai ?? "-"}</td>
                      <td className="py-2 capitalize">{n.vai_tro.replaceAll("_", " ")}</td>
                      <td className="py-2">{n.trang_thai}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="text-xs" onClick={() => openEdit(n)}>
                            <Edit2 className="mr-1 h-3.5 w-3.5" />Sửa
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleDelete(n)}>
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

      {/* Form thêm/sửa */}
      {showForm && (
  <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center">
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg w-full max-w-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">
        {editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      </h2>
      <div className="space-y-3">
        <Input
          placeholder="Họ"
          className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
          value={form.ho || ""}
          onChange={(e) => setForm({ ...form, ho: e.target.value })}
        />
        <Input
          placeholder="Tên"
          className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
          value={form.ten || ""}
          onChange={(e) => setForm({ ...form, ten: e.target.value })}
        />
        <Input
          placeholder="Email"
          className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          placeholder="Số điện thoại"
          className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
          value={form.so_dien_thoai || ""}
          onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })}
        />
        <Input
          placeholder="Địa chỉ"
          className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500"
          value={form.dia_chi || ""}
          onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}
        />

        <Select
          onValueChange={(v) => setForm({ ...form, vai_tro: v as VaiTroNguoiDung })}
          defaultValue={form.vai_tro}
        >
          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="quan_tri_vien">Quản trị viên</SelectItem>
            <SelectItem value="dieu_hanh_vien">Điều hành viên</SelectItem>
            <SelectItem value="bien_tap_vien">Biên tập viên</SelectItem>
            <SelectItem value="nguoi_dung">Người dùng</SelectItem>
            <SelectItem value="tinh_nguyen_vien">Tình nguyện viên</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v) => setForm({ ...form, trang_thai: v as TrangThaiNguoiDung })}
          defaultValue={form.trang_thai}
        >
          <SelectTrigger className="bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoat_dong">Hoạt động</SelectItem>
            <SelectItem value="khong_hoat_dong">Không hoạt động</SelectItem>
            <SelectItem value="bi_khoa">Bị khóa</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
          <Button onClick={handleSave}>Lưu</Button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  )
}