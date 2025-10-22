"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, XCircle } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Helper: loại bỏ dấu tiếng Việt để tìm kiếm chính xác
function removeVietnameseTones(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

export default function AdminNguoiDungPage() {
  const router = useRouter()
  const ALL_VALUE = "__all"

  const [nguoiDungs, setNguoiDungs] = useState<NguoiDung[]>([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [vaiTro, setVaiTro] = useState<string | undefined>(undefined)
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchNguoiDung()
  }, [])

  async function fetchNguoiDung() {
    setLoading(true)
    try {
      const res = await apiClient.getNguoiDung()
      setNguoiDungs(Array.isArray(res) ? res : [])
    } catch (err) {
      console.error("Lỗi lấy người dùng:", err)
      alert("Không thể tải danh sách người dùng.")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    router.push("/admin/nguoi-dung/them")
  }

  function openEdit(user: NguoiDung) {
    router.push(`/admin/nguoi-dung/${user.id}/sua`)
  }

  async function handleDelete(user: NguoiDung) {
    const ok = confirm(`Bạn có chắc muốn xóa người dùng "${user.ho} ${user.ten}" không?`)
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

  // Bộ lọc
  const filtered = nguoiDungs
    .filter((n) => {
      if (!search) return true
      const text = removeVietnameseTones(`${n.ho} ${n.ten} ${n.email} ${n.so_dien_thoai || ""} ${n.dia_chi || ""}`)
      const query = removeVietnameseTones(search)
      return query.split(" ").every((w) => text.includes(w))
    })
    .filter((n) => (vaiTro ? n.vai_tro === vaiTro : true))
    .filter((n) => (trangThai ? n.trang_thai === trangThai : true))

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: nguoiDungs.length,
    quan_tri_vien: nguoiDungs.filter((n) => n.vai_tro === "quan_tri_vien").length,
    dieu_hanh_vien: nguoiDungs.filter((n) => n.vai_tro === "dieu_hanh_vien").length,
    bien_tap_vien: nguoiDungs.filter((n) => n.vai_tro === "bien_tap_vien").length,
    nguoi_dung: nguoiDungs.filter((n) => n.vai_tro === "nguoi_dung").length,
    tinh_nguyen_vien: nguoiDungs.filter((n) => n.vai_tro === "tinh_nguyen_vien").length,
  }

  function resetFilters() {
    setSearch("")
    setVaiTro(undefined)
    setTrangThai(undefined)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-[calc(100vh-48px)] p-6 bg-[#111827] text-white">
      <div className="max-w-[1280px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold">Quản lý Người Dùng</h1>
          <div className="flex items-center gap-3">
            <Button onClick={openCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <Plus className="h-4 w-4" /> Thêm người dùng
            </Button>
            <Button variant="ghost" className="border border-neutral-700 text-neutral-200" onClick={fetchNguoiDung}>
              Tải lại
            </Button>
          </div>
        </div>

        {/* Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries({
            "Tổng người dùng": stats.total,
            "Quản trị viên": stats.quan_tri_vien,
            "Điều hành viên": stats.dieu_hanh_vien,
            "Biên tập viên": stats.bien_tap_vien,
            "Người dùng": stats.nguoi_dung,
          }).map(([label, value]) => (
            <Card key={label} className="bg-[#0f1724] border border-neutral-700">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-neutral-400">{label}</p>
                <p className="text-xl font-bold text-white mt-1">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bộ lọc */}
        <Card className="bg-[#0f1724] border border-neutral-700">
          <CardHeader>
            <CardTitle className="text-lg">Tìm kiếm & Bộ lọc người dùng</CardTitle>
            <CardDescription className="text-neutral-400">Tìm theo họ tên, email, số điện thoại, vai trò và trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search size={16} className="text-neutral-300" />
                <Input
                  className="bg-[#111827] border border-neutral-700 text-white placeholder:text-neutral-500"
                  placeholder="Tìm người dùng (không dấu)"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>

              <Select onValueChange={(v) => { setVaiTro(v && v !== ALL_VALUE ? v : undefined); setCurrentPage(1) }}>
                <SelectTrigger className="min-w-[160px] text-sm bg-[#111827] border border-neutral-700 text-white">
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

              <Select onValueChange={(v) => { setTrangThai(v && v !== ALL_VALUE ? v : undefined); setCurrentPage(1) }}>
                <SelectTrigger className="min-w-[160px] text-sm bg-[#111827] border border-neutral-700 text-white">
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
              <Button variant="secondary" className="text-sm flex items-center gap-1" onClick={resetFilters}>
                <XCircle className="h-4 w-4" /> Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danh sách */}
        <Card className="bg-[#0f1724] border border-neutral-700">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Danh sách người dùng</CardTitle>
              <CardDescription className="text-neutral-400">{filtered.length} kết quả</CardDescription>
            </div>
            <Button size="sm" variant="ghost" className="border border-neutral-700 text-neutral-200" onClick={fetchNguoiDung}>
              Tải lại
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto bg-[#111827] rounded-b-md">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-sm text-neutral-400 border-b border-neutral-700">
                    <th className="py-3 px-6">Họ tên</th>
                    <th className="py-3 px-6">Email</th>
                    <th className="py-3 px-6">Số điện thoại</th>
                    <th className="py-3 px-6">Vai trò</th>
                    <th className="py-3 px-6">Trạng thái</th>
                    <th className="py-3 px-6">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="py-6 text-center text-sm text-neutral-400">Đang tải...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={6} className="py-6 text-center text-sm text-neutral-400">Không có người dùng</td></tr>
                  ) : (
                    paginated.map((n) => (
                      <tr key={n.id} className="border-b border-neutral-700 hover:bg-[#0b1220]">
                        <td className="py-3 px-6">{`${n.ho} ${n.ten}`}</td>
                        <td className="py-3 px-6">{n.email}</td>
                        <td className="py-3 px-6">{n.so_dien_thoai ?? "-"}</td>
                        <td className="py-3 px-6 capitalize">{n.vai_tro.replaceAll("_", " ")}</td>
                        <td className="py-3 px-6">{n.trang_thai}</td>
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <Button size="sm" className="text-xs bg-[#0f1724] border border-neutral-700" onClick={() => openEdit(n)}>
                              <Edit2 className="mr-1 h-3.5 w-3.5" /> Sửa
                            </Button>
                            <Button size="sm" variant="destructive" className="text-xs" onClick={() => handleDelete(n)}>
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end px-6 py-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
