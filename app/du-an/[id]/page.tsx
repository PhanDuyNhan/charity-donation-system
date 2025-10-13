import { notFound } from "next/navigation"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, Users, TrendingUp, ArrowLeft, Share2 } from "lucide-react"
import { DonationForm } from "@/components/donation-form"

async function getProjectDetail(id: string) {
  try {
    const data = await apiClient.get(`/du_an?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.error("Error fetching project:", error)
    return null
  }
}

export default async function DuAnChiTietPage({ params }: { params: { id: string } }) {
  const project = await getProjectDetail(params.id)

  if (!project) {
    notFound()
  }

  const progress = project.muc_tieu > 0 ? (project.da_quyen_gop / project.muc_tieu) * 100 : 0
  const daysLeft = project.ngay_ket_thuc
    ? Math.ceil((new Date(project.ngay_ket_thuc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      sap_dien_ra: "Sắp diễn ra",
      dang_thuc_hien: "Đang thực hiện",
      tam_dung: "Tạm dừng",
      hoan_thanh: "Hoàn thành",
      da_huy: "Đã hủy",
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/du-an">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách dự án
          </Button>
        </Link>
      </div>

      {/* Project Details */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <img
                src={
                  project.hinh_anh || `/placeholder.svg?height=400&width=800&query=charity project ${project.ten_du_an}`
                }
                alt={project.ten_du_an}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-orange-500 text-white">
                {getStatusLabel(project.trang_thai)}
              </Badge>
            </div>

            {/* Project Info */}
            <Card className="border-orange-100">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {project.id_danh_muc && (
                    <Badge variant="outline" className="border-orange-300 text-orange-600">
                      {project.id_danh_muc}
                    </Badge>
                  )}
                  {project.dia_diem && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {project.dia_diem}
                    </span>
                  )}
                </div>
                <CardTitle className="text-3xl text-balance">{project.ten_du_an}</CardTitle>
                {project.mo_ta_ngan && <CardDescription className="text-base">{project.mo_ta_ngan}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-6">
                {project.mo_ta_chi_tiet && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-orange-600">Mô tả dự án</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">{project.mo_ta_chi_tiet}</div>
                  </div>
                )}

                {(project.ngay_bat_dau || project.ngay_ket_thuc) && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-orange-600">Thời gian thực hiện</h3>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <span>
                        {project.ngay_bat_dau && new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")}
                        {project.ngay_ket_thuc && ` - ${new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="sticky top-20 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
                <CardTitle className="text-orange-600">Tiến độ quyên góp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-bold text-orange-600">
                      {(project.da_quyen_gop || 0).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Mục tiêu: {(project.muc_tieu || 0).toLocaleString("vi-VN")} đ
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-orange-600">{progress.toFixed(1)}% hoàn thành</span>
                    <span className="text-gray-600">{project.so_nguoi_quyen_gop || 0} người ủng hộ</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-orange-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-600">
                      <Users className="h-5 w-5" />
                      {project.so_nguoi_quyen_gop || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Người quyên góp</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-pink-600">
                      <TrendingUp className="h-5 w-5" />
                      {daysLeft > 0 ? daysLeft : 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Ngày còn lại</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent border-orange-300 hover:bg-orange-50">
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ dự án
                </Button>
              </CardContent>
            </Card>

            {/* Donation Form */}
            <DonationForm projectId={project.id} projectName={project.ten_du_an} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; 2025 Từ Thiện Việt. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
