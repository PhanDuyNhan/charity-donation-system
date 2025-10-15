"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { DuAn } from "@/lib/types"
import { formatShortDate } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"

export default function AdminDuAnPage() {
  const [duAn, setDuAn] = useState<DuAn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState<DuAn | null>(null)
  const [openAdd, setOpenAdd] = useState(false)

  const itemsPerPage = 5

  useEffect(() => {
    fetchDuAn()
  }, [])

  const fetchDuAn = async () => {
    try {
      const data = await apiClient.getDuAn()
      setDuAn(data)
    } catch (error) {
      console.error("❌ Lỗi tải dự án:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) return
    try {
      await apiClient.deleteDuAn(id)
      setDuAn((prev) => prev.filter((d) => d.id !== id))
    } catch (error) {
      console.error("❌ Lỗi xóa dự án:", error)
      alert("Không thể xóa dự án này!")
    }
  }

  // 🔍 Tìm kiếm nâng cao
  const filteredDuAn = duAn.filter((d) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const combined = `${d.tieu_de ?? ""} ${d.mo_ta ?? ""} ${d.mo_ta_ngan ?? ""} ${d.dia_diem ?? ""} ${
      d.trang_thai ?? ""
    } ${d.muc_do_uu_tien ?? ""}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    return combined.includes(term)
  })

  // 📄 Phân trang
  const totalPages = Math.ceil(filteredDuAn.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDuAn = filteredDuAn.slice(startIndex, startIndex + itemsPerPage)

  // 🎨 Badge trạng thái
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      hoat_dong: "bg-green-600 text-white",
      tam_dung: "bg-yellow-500 text-black",
      ban_nhap: "bg-gray-500 text-white",
      hoan_thanh: "bg-blue-600 text-white",
    }
    const label: Record<string, string> = {
      hoat_dong: "Hoạt động",
      tam_dung: "Tạm dừng",
      ban_nhap: "Bản nháp",
      hoan_thanh: "Hoàn thành",
    }
    return (
      <Badge className={`${map[status] ?? "bg-gray-400 text-black"} px-3 py-1 rounded-full text-sm font-semibold`}>
        {label[status] ?? status}
      </Badge>
    )
  }

  // 🎨 Badge mức độ ưu tiên
  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      khan_cap: "bg-red-600 text-white",
      cao: "bg-orange-500 text-black",
      trung_binh: "bg-blue-500 text-white",
      thap: "bg-gray-500 text-white",
    }
    const label: Record<string, string> = {
      khan_cap: "Khẩn cấp",
      cao: "Cao",
      trung_binh: "Trung bình",
      thap: "Thấp",
    }
    return (
      <Badge className={`${map[priority] ?? "bg-gray-400 text-black"} px-3 py-1 rounded-full text-sm font-semibold`}>
        {label[priority] ?? priority}
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
        <h1 className="text-3xl font-bold text-blue-100">Quản lý Dự án</h1>
        <AddProjectDialog
          onProjectAdded={() => {
            fetchDuAn()
            setOpenAdd(false)
          }}
        >
          <Button onClick={() => setOpenAdd(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Thêm dự án mới
          </Button>
        </AddProjectDialog>
      </div>

      {/* Cards thống kê */}
      <div className="grid gap-4 md:grid-cols-4">
        {[ 
          { title: "Tổng dự án", value: duAn.length },
          { title: "Hoạt động", value: duAn.filter((d) => d.trang_thai === "hoat_dong").length },
          { title: "Bản nháp", value: duAn.filter((d) => d.trang_thai === "ban_nhap").length },
          { title: "Khẩn cấp", value: duAn.filter((d) => d.muc_do_uu_tien === "khan_cap").length },
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
          <CardTitle className="text-blue-100">Tìm kiếm dự án</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, mô tả, địa điểm..."
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
                  <th className="p-4">Tiêu đề</th>
                  <th className="p-4">Địa điểm</th>
                  <th className="p-4">Ngày bắt đầu</th>
                  <th className="p-4">Ngày kết thúc</th>
                  <th className="p-4">Ưu tiên</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Tiến độ</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDuAn.map((d) => (
                  <tr key={d.id} className="border-b border-blue-800 hover:bg-blue-900 transition">
                    <td className="p-4 font-medium text-blue-100">{d.tieu_de}</td>
                    <td className="p-4 text-blue-100">{d.dia_diem || "-"}</td>
                    <td className="p-4 text-blue-100">{formatShortDate(d.ngay_bat_dau)}</td>
                    <td className="p-4 text-blue-100">{formatShortDate(d.ngay_ket_thuc)}</td>
                    <td className="p-4">{getPriorityBadge(d.muc_do_uu_tien ?? "")}</td>
                    <td className="p-4">{getStatusBadge(d.trang_thai ?? "")}</td>
                    <td className="p-4 text-right text-blue-300">
                      {`${((d.so_tien_hien_tai / d.so_tien_muc_tieu) * 100).toFixed(1)}%`}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-blue-700 hover:bg-blue-800"
                          onClick={() => setSelectedProject(d)}
                        >
                          <Edit className="h-4 w-4 text-blue-400" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-red-700 hover:bg-red-800"
                          onClick={() => handleDelete(d.id)}
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

          {/* Phân trang */}
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

      {/* Popups */}
      {selectedProject && (
        <EditProjectDialog
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdated={fetchDuAn}
        />
      )}
    </div>
  )
}
