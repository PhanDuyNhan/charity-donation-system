"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, Users, TrendingUp, ArrowLeft, Share2 } from "lucide-react"
import { DonationForm } from "@/components/donation-form"
import { ProjectCard } from "@/components/project-card"
import type { DuAn } from "@/lib/types"

export default function DuAnChiTietPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<DuAn | null>(null)
  const [related, setRelated] = useState<DuAn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await apiClient.getDuAn({ id: `eq.${params.id}` })
        if (data && data.length > 0) {
          setProject(data[0])

          // Lấy dự án tương tự cùng danh mục
          const sameCategory = await apiClient.getDuAn({
            ma_danh_muc: `eq.${data[0].ma_danh_muc}`,
            id: `neq.${params.id}`,
            limit: 3,
          })
          setRelated(sameCategory)
        } else notFound()
      } catch (err) {
        console.error("❌ Lỗi tải dự án:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [params.id])

  if (loading)
    return <div className="text-center py-20 text-blue-300">Đang tải dữ liệu...</div>
  if (!project) return notFound()

  const progress =
    project.so_tien_muc_tieu > 0
      ? (project.so_tien_hien_tai / project.so_tien_muc_tieu) * 100
      : 0
  const daysLeft = project.ngay_ket_thuc
    ? Math.ceil(
        (new Date(project.ngay_ket_thuc).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0
  const anh = project.anh_dai_dien?.startsWith("http")
    ? project.anh_dai_dien
    : `http://j2ee.oshi.id.vn:5555${project.anh_dai_dien}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-900 text-slate-100">
      {/* Nút quay lại */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/du-an">
          <Button variant="ghost" size="sm" className="text-blue-300 hover:text-blue-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách dự án
          </Button>
        </Link>
      </div>

      {/* Nội dung chi tiết */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cột trái */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ảnh banner */}
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-lg">
              <img
                src={anh}
                alt={project.tieu_de}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-blue-600 text-white shadow-md">
                {project.trang_thai === "hoat_dong" ? "Đang hoạt động" : project.trang_thai}
              </Badge>
            </div>

            {/* Thông tin chi tiết */}
            <Card className="bg-blue-950/70 border-blue-800 text-slate-100">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Ưu tiên: {project.muc_do_uu_tien}
                  </Badge>
                  {project.dia_diem && (
                    <span className="flex items-center gap-1 text-sm text-blue-300">
                      <MapPin className="h-4 w-4" />
                      {project.dia_diem}
                    </span>
                  )}
                </div>
                <CardTitle className="text-3xl font-bold text-blue-200">
                  {project.tieu_de}
                </CardTitle>
                {project.mo_ta_ngan && (
                  <CardDescription className="text-blue-300 text-base">
                    {project.mo_ta_ngan}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-blue-400">
                    Mô tả chi tiết
                  </h3>
                  <p className="leading-relaxed text-slate-200 whitespace-pre-line">
                    {project.mo_ta}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cột phải */}
          <div className="space-y-6">
            {/* Tiến độ quyên góp */}
            <Card className="sticky top-20 bg-blue-950/70 border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-400">Tiến độ quyên góp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-bold text-blue-300">
                      {project.so_tien_hien_tai.toLocaleString("vi-VN")} đ
                    </span>
                    <span className="text-sm text-blue-400">
                      Mục tiêu: {project.so_tien_muc_tieu.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="w-full bg-blue-900 rounded-full h-3 mt-3">
                    <div
                      className="h-3 bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-blue-300 mt-1">
                    <span>{progress.toFixed(1)}% hoàn thành</span>
                    <span>{project.so_nguoi_thu_huong || 0} người hưởng lợi</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-blue-800">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-400">
                      <Users className="h-5 w-5" />
                      {project.so_nguoi_thu_huong || 0}
                    </div>
                    <div className="text-xs text-blue-300 mt-1">
                      Người hưởng lợi
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-300">
                      <TrendingUp className="h-5 w-5" />
                      {daysLeft > 0 ? daysLeft : 0}
                    </div>
                    <div className="text-xs text-blue-300 mt-1">Ngày còn lại</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full border-blue-500 text-blue-300">
                  <Share2 className="h-4 w-4 mr-2" />
                  Chia sẻ dự án
                </Button>
              </CardContent>
            </Card>

            {/* Form quyên góp */}
            <DonationForm projectId={project.id} projectName={project.tieu_de} />
          </div>
        </div>

        {/* Dự án tương tự */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-blue-200 mb-6">
              Các dự án tương tự
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
