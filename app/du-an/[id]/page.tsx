"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Users, PiggyBank } from "lucide-react"
import { DonationForm } from "@/components/donation-form"
import { ProjectGallery } from "@/components/project-gallery"
import { ProjectCard } from "@/components/project-card"

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [relatedProjects, setRelatedProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadProjectAndRelated = async () => {
      try {
        const res = await apiClient.getDuAn({ id: `eq.${id}` })
        if (res && res.length > 0) {
          const duAn = res[0]
          setProject(duAn)

          // ✅ Lấy toàn bộ dự án khác, sau đó chọn ngẫu nhiên 3 dự án
          const allProjects = await apiClient.getDuAn({
            id: `neq.${duAn.id}`,
          })

          const shuffled = allProjects.sort(() => 0.5 - Math.random())
          const randomThree = shuffled.slice(0, 3)
          setRelatedProjects(randomThree)
        } else {
          setError("Không tìm thấy dự án.")
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải chi tiết dự án:", err)
        setError("Lỗi khi tải chi tiết dự án.")
      } finally {
        setLoading(false)
      }
    }
    loadProjectAndRelated()
  }, [id])

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>
  if (!project) return null

  const anhDaiDien = project.anh_dai_dien?.startsWith("https")
    ? project.anh_dai_dien
    : `https://j2ee.oshi.id.vn${project.anh_dai_dien}`

  let thuVienAnh: string[] = []
  if (project.thu_vien_anh) {
    try {
      const parsed =
        typeof project.thu_vien_anh === "string"
          ? JSON.parse(project.thu_vien_anh)
          : project.thu_vien_anh
      if (Array.isArray(parsed)) {
        thuVienAnh = parsed.map((img: string) =>
          img.startsWith("https") ? img : `https://j2ee.oshi.id.vn${img}`
        )
      }
    } catch {
      console.warn("⚠️ Không thể parse thu_vien_anh:", project.thu_vien_anh)
    }
  }

  const progress =
    project.so_tien_muc_tieu > 0
      ? (project.so_tien_hien_tai / project.so_tien_muc_tieu) * 100
      : 0

  return (
    <div className="min-h-screen bg-background">
      {/* ============ Hero ============ */}
      <section className="relative h-60 md:h-72 overflow-hidden">
        <img src={anhDaiDien} alt={project.tieu_de} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-3">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1">{project.tieu_de}</h1>
          <p className="text-white/90 text-sm md:text-base max-w-xl">{project.mo_ta_ngan}</p>
          <Badge className="mt-2 bg-accent text-accent-foreground uppercase shadow-md">
            {project.trang_thai === "hoat_dong" ? "Đang hoạt động" : "Đã kết thúc"}
          </Badge>
        </div>
      </section>

      {/* ============ Nội dung chính ============ */}
      <section className="py-10 container mx-auto px-4 grid md:grid-cols-3 gap-8">
        {/* Bên trái */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden shadow-lg">
            <img src={anhDaiDien} alt={project.tieu_de} className="w-full h-72 object-cover" />
          </Card>

          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="text-xl font-bold text-foreground">Giới thiệu dự án</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                {project.mo_ta}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-muted-foreground text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {project.dia_diem}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {project.so_nguoi_thu_huong} người hưởng lợi
                </div>
              </div>
            </CardContent>
          </Card>

          {thuVienAnh.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Thư viện ảnh</h2>
              <ProjectGallery images={thuVienAnh} projectTitle={project.tieu_de} />
            </div>
          )}
        </div>

        {/* Bên phải */}
        <div className="space-y-6">
          <Card className="border-border shadow-md sticky top-24">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-accent" />
                Tiến độ quyên góp
              </h3>

              <div className="w-full bg-secondary/30 rounded-full h-2">
                <div
                  className="h-2 bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${progress.toFixed(0)}%` }}
                />
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-primary">
                  {project.so_tien_hien_tai.toLocaleString("vi-VN")} đ
                </span>
                <span className="text-muted-foreground">
                  / {project.so_tien_muc_tieu.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <DonationForm projectId={project.id} projectName={project.tieu_de} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============ Dự án tương tự ============ */}
      <section className="bg-muted/30 py-12 animate-fade-in">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Các dự án tương tự</h2>

          {relatedProjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <div
                  key={p.id}
                  className="transition-transform hover:scale-[1.02] duration-300"
                >
                  <ProjectCard project={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Hiện chưa có dự án tương tự nào.
            </p>
          )}
        </div>
      </section>

      <footer className="bg-foreground text-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm text-white/70">
          © 2025 Từ Thiện Việt. Cùng chung tay vì cộng đồng 💗
        </div>
      </footer>
    </div>
  )
}
