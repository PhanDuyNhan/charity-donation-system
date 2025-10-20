"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

// Chuẩn hóa TV không dấu + thường hoá
function removeVietnameseTones(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

export default function QuanLyNguoiDungPage() {
  const router = useRouter()
  const ALL_VALUE = "__all"

  const [nguoiDungs, setNguoiDungs] = useState<NguoiDung[]>([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState("")
  const [vaiTro, setVaiTro] = useState<string | undefined>(undefined)
  const [trangThai, setTrangThai] = useState<string | undefined>(undefined)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

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

  // Tìm kiếm nâng cao: không dấu + nhiều từ, quét họ tên, email, sđt, địa chỉ
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
    <div className="space-y-6">
      {/* Thống kê */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries({
          "Tổng người dùng": stats.total,
          "Quản trị viên": stats.quan_tri_vien,
          "Điều hành viên": stats.dieu_hanh_vien,
          "Biên tập viên": stats.bien_tap_vien,
          "Người dùng": stats.nguoi_dung,
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
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Search size={16} />
              <Input
                className="text-sm"
                placeholder="Tìm theo họ tên, email, sđt, địa chỉ (không dấu, nhiều từ)"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <Select onValueChange={(v) => { setVaiTro(v && v !== ALL_VALUE ? v : undefined); setCurrentPage(1) }}>
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

            <Select onValueChange={(v) => { setTrangThai(v && v !== ALL_VALUE ? v : undefined); setCurrentPage(1) }}>
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
            <Button variant="secondary" className="text-sm flex items-center gap-1" onClick={resetFilters}>
              <XCircle className="h-4 w-4" /> Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Danh sách người dùng ({filtered.length} kết quả)
          </CardTitle>
          <Button className="text-sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
          </Button>
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

          {totalPages > 1 && (
            <Pagination className="mt-6">
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
