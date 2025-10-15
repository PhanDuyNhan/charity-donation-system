"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { NguoiDung } from "@/lib/types"
import { formatShortDate } from "@/lib/utils"
import { AddUserDialog } from "@/components/add-user-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { EditUserDialog } from "@/components/edit-user-dialog" // ✅ Thêm dialog sửa

export default function AdminNguoiDungPage() {
  const [nguoiDung, setNguoiDung] = useState<NguoiDung[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingUser, setEditingUser] = useState<NguoiDung | null>(null)
  const itemsPerPage = 5

  useEffect(() => {
    fetchNguoiDung()
  }, [])

  const fetchNguoiDung = async () => {
    try {
      const data = await apiClient.getNguoiDung()
      setNguoiDung(data)
    } catch (error) {
      console.error("❌ Lỗi tải người dùng:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return

    try {
      await apiClient.deleteNguoiDung(id)
      setNguoiDung((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("❌ Lỗi xóa người dùng:", error)
      alert("Không thể xóa người dùng này!")
    }
  }

  // 🔍 Tìm kiếm nâng cao trên tất cả thuộc tính
  const filteredNguoiDung = nguoiDung.filter((n) => {
    if (!searchTerm.trim()) return true

    const term = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    const roleLabels: Record<string, string> = {
      quan_tri_vien: "quản trị viên",
      dieu_hanh_vien: "điều hành viên",
      bien_tap_vien: "biên tập viên",
      tinh_nguyen_vien: "tình nguyện viên",
      nguoi_dung: "người dùng",
    }

    const statusLabels: Record<string, string> = {
      hoat_dong: "hoạt động",
      bi_khoa: "bị khóa",
    }

    const combined =
      `${n.id ?? ""} ${n.ho ?? ""} ${n.ten ?? ""} ${n.email ?? ""} ${n.so_dien_thoai ?? ""} ${n.vai_tro ?? ""} ${
        roleLabels[n.vai_tro ?? ""] ?? ""
      } ${n.trang_thai ?? ""} ${statusLabels[n.trang_thai ?? ""] ?? ""} ${n.ngay_tao ?? ""}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")

    return combined.includes(term)
  })

  // 📄 Phân trang
  const totalPages = Math.ceil(filteredNguoiDung.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNguoiDung = filteredNguoiDung.slice(startIndex, startIndex + itemsPerPage)

  // 🎨 Hiển thị Badge vai trò
  const getRoleBadge = (vaiTro: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      quan_tri_vien: "destructive",
      dieu_hanh_vien: "default",
      bien_tap_vien: "secondary",
      tinh_nguyen_vien: "outline",
      nguoi_dung: "outline",
    }

    const labels: Record<string, string> = {
      quan_tri_vien: "Quản trị viên",
      dieu_hanh_vien: "Điều hành viên",
      bien_tap_vien: "Biên tập viên",
      tinh_nguyen_vien: "Tình nguyện viên",
      nguoi_dung: "Người dùng",
    }

    return (
      <Badge
        variant={variants[vaiTro] || "outline"}
        className={`px-3 py-1 text-sm font-semibold rounded-full ${
          vaiTro === "quan_tri_vien"
            ? "bg-red-600 text-white"
            : vaiTro === "dieu_hanh_vien"
            ? "bg-blue-600 text-white"
            : vaiTro === "bien_tap_vien"
            ? "bg-amber-500 text-black"
            : vaiTro === "tinh_nguyen_vien"
            ? "bg-slate-400 text-black"
            : "bg-gray-300 text-black"
        }`}
      >
        {labels[vaiTro] || vaiTro}
      </Badge>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Đang tải dữ liệu...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-100">Quản lý Người dùng</h1>
        <AddUserDialog onUserAdded={fetchNguoiDung}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="mr-2 h-4 w-4" /> Thêm người dùng
          </Button>
        </AddUserDialog>
      </div>

      {/* Cards thống kê */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Tổng người dùng", value: nguoiDung.length },
          { title: "Quản trị viên", value: nguoiDung.filter((n) => n.vai_tro === "quan_tri_vien").length },
          { title: "Biên tập viên", value: nguoiDung.filter((n) => n.vai_tro === "bien_tap_vien").length },
          { title: "Tình nguyện viên", value: nguoiDung.filter((n) => n.vai_tro === "tinh_nguyen_vien").length },
        ].map((card, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition bg-blue-950 border-blue-800">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-blue-100">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-300">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ô tìm kiếm */}
      <Card className="bg-blue-950 border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-100">Tìm kiếm người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
            <Input
              placeholder="Tìm kiếm theo bất kỳ thông tin nào..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-blue-900 text-blue-100 border-blue-700 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bảng dữ liệu */}
      <Card className="bg-blue-950 border-blue-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-blue-800 bg-blue-900">
                <tr className="text-left text-sm font-semibold text-blue-100">
                  <th className="p-4">Họ tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">SĐT</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNguoiDung.map((n) => (
                  <tr key={n.id} className="border-b border-blue-800 hover:bg-blue-900 transition">
                    <td className="p-4 font-medium text-blue-100">{`${n.ho} ${n.ten}`}</td>
                    <td className="p-4 text-blue-100">{n.email || "-"}</td>
                    <td className="p-4 text-blue-100">{n.so_dien_thoai || "-"}</td>
                    <td className="p-4">{getRoleBadge(n.vai_tro)}</td>
                    <td className="p-4">
                      {n.trang_thai === "hoat_dong" ? (
                        <Badge className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Bị khóa
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-blue-300">
                      {n.ngay_tao ? formatShortDate(n.ngay_tao) : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-700 hover:bg-blue-800"
                          onClick={() => setEditingUser(n)}
                        >
                          <Edit className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-700 hover:bg-red-800"
                          onClick={() => handleDelete(n.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG */}
          {totalPages > 1 && (
            <Pagination className="py-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(page)
                      }}
                      className={
                        page === currentPage
                          ? "bg-blue-600 text-white border border-blue-700"
                          : "text-blue-300 hover:bg-blue-800"
                      }
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      {/* Không tìm thấy */}
      {filteredNguoiDung.length === 0 && (
        <Card className="bg-blue-950 border-blue-800">
          <CardContent className="p-12 text-center">
            <p className="text-blue-300">Không tìm thấy người dùng nào</p>
          </CardContent>
        </Card>
      )}

      {/* Hộp thoại sửa người dùng */}
      <EditUserDialog
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdated={fetchNguoiDung}
      />
    </div>
  )
}
