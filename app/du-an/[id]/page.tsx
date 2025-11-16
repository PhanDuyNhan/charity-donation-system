"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { QuyenGop } from "@/lib/types"
import {
  Calendar,
  MapPin,
  Users,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  X,
  Award,
  HeartHandshake,
} from "lucide-react"
import { DonationForm } from "@/components/donation-form"
import { ProjectCard } from "@/components/project-card"

/**
 * Trang chi tiết dự án - phiên bản PREMIUM
 * - TOP Donors chạy ngang
 * - Gallery 8 ảnh
 * - Lightbox mượt
 * - Danh sách donors đẹp
 * - Khung biểu đồ placeholder
 */

export default function ProjectDetailPage() {
  const { id } = useParams()

  const [project, setProject] = useState<any | null>(null)
  const [relatedProjects, setRelatedProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [donations, setDonations] = useState<any[]>([])
  const [topDonors, setTopDonors] = useState<any[]>([])

  // Lightbox
  const [showGallery, setShowGallery] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        // ---- Lấy dữ liệu dự án ----
        const res = await apiClient.getDuAn({ id: `eq.${id}` })
        if (!res || res.length === 0) {
          setError("Không tìm thấy dự án.")
          return
        }
        const duAn = res[0]
        setProject(duAn)

        // ---- Lấy danh sách quyên góp ----
        let qg: QuyenGop[] = []

        try {

          qg = await apiClient.getQuyenGop({
            ma_du_an: `eq.${duAn.id}`,
            // trang_thai_thanh_toan: "eq.hoan_thanh",
            select: "*,nguoi_dung(*)",
            order: "so_tien.desc",
            limit: 10
          })
          setTopDonors(qg)
          console.log("qg", qg)

        } catch (err) {
          console.error("❌ Lỗi gọi quyen_gop:", err)
          setError("Lỗi khi tải dữ liệu dự án.")
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading)
    return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>

  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>

  if (!project) return null

  // ---------------- GALLERY ----------------

  let thuVienAnh: string[] = []

  if (project.thu_vien_anh) {
    try {
      const raw = project.thu_vien_anh

      if (Array.isArray(raw)) {
        thuVienAnh = raw
      } else if (typeof raw === "string") {
        if (raw.trim().startsWith("[")) {
          try {
            const arr = JSON.parse(raw)
            if (Array.isArray(arr)) thuVienAnh = arr
          } catch {
            thuVienAnh = [raw]
          }
        } else {
          thuVienAnh = [raw]
        }
      }
    } catch {
      thuVienAnh = []
    }
  }

  thuVienAnh = thuVienAnh.map((img) =>
    img.startsWith("http")
      ? img
      : `https://j2ee.oshi.id.vn/${img.replace(/^\/+/, "")}`
  )

  const anhDaiDien =
    thuVienAnh.length > 0
      ? thuVienAnh[0]
      : "/placeholder.svg"

  const progress =
    project.so_tien_muc_tieu > 0
      ? (project.so_tien_hien_tai / project.so_tien_muc_tieu) * 100
      : 0

  // Lightbox
  const openGallery = (index: number) => {
    setCurrentImage(index)
    setShowGallery(true)
  }

  const closeGallery = () => setShowGallery(false)

  const nextImg = () => {
    setCurrentImage((prev) => (prev + 1) % thuVienAnh.length)
  }

  const prevImg = () => {
    setCurrentImage((prev) => (prev - 1 + thuVienAnh.length) % thuVienAnh.length)
  }


  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  const getTopBadge = (index: number) => {
    if (index === 0) return { emoji: "🥇", color: "from-yellow-400 to-yellow-600", text: "TOP 1" }
    if (index === 1) return { emoji: "🥈", color: "from-gray-300 to-gray-500", text: "TOP 2" }
    if (index === 2) return { emoji: "🥉", color: "from-orange-400 to-orange-600", text: "TOP 3" }
    return null
  }


  const handleQuyenGop = async () => {
    try {
      const body = {
        loiNhan: "hello",
        soTien: 100000,
        phuongThucThanhToan: "VNPAY",
      }
      const res = await apiClient.handlePayment(body)
      console.log("Kết quả quyên góp:", res)
    } catch (err) {
      console.error("Lỗi khi quyên góp:", err)
    }
  }


  return (
    <div className="min-h-screen bg-background">

     
      {/* ======== HERO ======== */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img src={anhDaiDien} className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end pb-8 px-4">
          <div className="text-center">
            <h1 className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg">
              {project.tieu_de}
            </h1>

            <p className="text-white/80 mt-2 max-w-2xl mx-auto">
              {project.mo_ta || project.mo_chi_tiet || "Không có mô tả"}
            </p>

            <Badge className="mt-4 bg-primary text-primary-foreground px-4 py-1 rounded-full shadow">
              {project.trang_thai === "hoat_dong" ? "Đang hoạt động" : "Đã kết thúc"}
            </Badge>
          </div>
        </div>
      </section>

      {/* ======== MAIN CONTENT ======== */}
      <section className="py-12 container mx-auto px-4 grid md:grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-8">

          {/* ---- GALLERY (8 ảnh) ---- */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {thuVienAnh.slice(0, 8).map((img, i) => (
              <img
                key={i}
                src={img}
                className="h-40 w-full object-cover rounded-xl shadow cursor-pointer hover:opacity-90 transition"
                onClick={() => openGallery(i)}
              />
            ))}

            {thuVienAnh.length > 8 && (
              <button
                onClick={() => openGallery(8)}
                className="col-span-full text-center text-primary hover:underline text-sm"
              >
                Xem thêm {thuVienAnh.length - 8} ảnh →
              </button>
            )}
          </div>

          {/* ---- LIGHTBOX ---- */}
          {showGallery && (
            <div
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
              onClick={closeGallery}
            >
              <div
                className="relative w-[90vw] max-w-6xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={thuVienAnh[currentImage]}
                  className="max-h-[80vh] w-full object-contain"
                />

                <button
                  onClick={closeGallery}
                  className="absolute top-3 right-3 bg-white/20 text-white p-2 rounded-full"
                >
                  <X />
                </button>

                {thuVienAnh.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full"
                    >
                      <ChevronLeft />
                    </button>

                    <button
                      onClick={nextImg}
                      className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ---- GIỚI THIỆU DỰ ÁN ---- */}
          <Card className="rounded-xl shadow">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <HeartHandshake className="text-primary" /> Giới thiệu dự án
              </h2>

              <p className="text-muted-foreground whitespace-pre-line">
                {project.mo_chi_tiet || project.mo_ta || "Không có mô tả chi tiết"}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                {project.dia_diem && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {project.dia_diem}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {project.so_nguoi_thu_huong} người hưởng lợi
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---- BIỂU ĐỒ (Placeholder) ---- */}
          <Card className="h-72 border-dashed border-2 flex items-center justify-center rounded-xl">
            <p className="text-muted-foreground">📈 Khu vực để nhúng biểu đồ chứng khoán</p>
          </Card>

          {/* ---- TOP DONORS (mini list) ---- */}
          <Card className="rounded-xl shadow">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="text-primary" /> Top người quyên góp
              </h3>

              {topDonors.length === 0 ? (
                <p className="text-muted-foreground">Không có dữ liệu.</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {topDonors.slice(0, 3).map((d, index) => {
                      const badge = getTopBadge(index)
                      const heights = ["h-40", "h-32", "h-28"]
                      const orders = [1, 0, 2] // Thứ tự: 2-1-3

                      return (
                        <div key={d.id} className={`order-${orders[index]}`}>
                          <div className="text-center mb-3">
                            <div className={`inline-block w-16 h-16 bg-gradient-to-br ${badge?.color} rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2 shadow-lg`}>
                              {d.la_quyen_gop_an_danh
                                ? "?"
                                : d.nguoi_dung?.ho?.charAt(0) + d.nguoi_dung?.ten?.charAt(0)}
                            </div>
                            <p className="font-bold text-gray-900 truncate px-2">
                              {d.la_quyen_gop_an_danh
                                ? "Ẩn danh"
                                : `${d.nguoi_dung?.ho} ${d.nguoi_dung?.ten}`}
                            </p>
                            <p className="text-xl font-bold text-blue-600 mt-1">
                              {formatMoney(d.so_tien)} đ
                            </p>
                          </div>
                          <div className={`bg-gradient-to-br ${badge?.color} ${heights[index]} rounded-t-2xl flex items-center justify-center shadow-lg`}>
                            <div className="text-center text-white">
                              <div className="text-4xl mb-2">{badge?.emoji}</div>
                              <p className="font-bold text-lg">{badge?.text}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-3">
                    {topDonors.slice(3).map((d, index) => (
                      <div
                        key={d.id}
                        className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 p-4 border border-gray-100"
                      >
                        <div className="flex items-center gap-4">
                          {/* Thứ hạng */}
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600">
                            #{index + 4}
                          </div>

                          {/* Avatar */}
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow">
                            {d.la_quyen_gop_an_danh
                              ? "?"
                              : d.nguoi_dung?.ho?.charAt(0) + d.nguoi_dung?.ten?.charAt(0)}
                          </div>

                          {/* Thông tin */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {d.la_quyen_gop_an_danh
                                ? "Ẩn danh"
                                : `${d.nguoi_dung?.ho} ${d.nguoi_dung?.ten}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(d.ngay_tao).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>

                          {/* Số tiền */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">
                              {formatMoney(d.so_tien)} đ
                            </p>
                          </div>
                        </div>

                        {/* Lời nhắn */}
                        {d.loi_nhan && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600 italic pl-14">
                              💬 "{d.loi_nhan}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>


                </div>
              )}
            </CardContent>
          </Card>
          {/* ---- DANH SÁCH NGƯỜI QUYÊN GÓP ---- */}
          <Card className="rounded-xl shadow">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="text-primary" /> Người đã quyên góp
              </h3>

              {donations.length === 0 ? (
                <p className="text-muted-foreground">Chưa có ai quyên góp.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {donations.map((d) => (
                    <div
                      key={d.id}
                      className="flex justify-between border-b pb-3"
                    >
                      <div>
                        <p className="font-medium">
                          {d.la_quyen_gop_an_danh ? "Ẩn danh" : d.ten_nguoi_quyen_gop}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {new Date(d.ngay_tao).toLocaleString("vi-VN")}
                        </p>

                        {d.loi_nhan && (
                          <p className="text-sm text-muted-foreground mt-1">
                            "{d.loi_nhan}"
                          </p>
                        )}
                      </div>

                      <p className="font-semibold text-primary">
                        {d.so_tien.toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <aside className="space-y-6">
          {/* ---- PROGRESS ---- */}
          <Card className="sticky top-24 rounded-xl shadow-lg">
            <CardContent className="p-6 space-y-5">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <PiggyBank className="text-primary" /> Tiến độ quyên góp
              </h3>

              <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden mt-2">
                <div
                  className="h-3 bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-bold text-primary">
                  {project.so_tien_hien_tai.toLocaleString("vi-VN")} đ
                </span>

                <span className="text-muted-foreground">
                  / {project.so_tien_muc_tieu.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <DonationForm projectId={project.id} projectName={project.tieu_de} />
            </CardContent>
          </Card>


        </aside>

      </section>

      {/* ======== RELATED ======== */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Các dự án tương tự
          </h2>

          {relatedProjects.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Không có dự án tương tự.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-foreground text-white py-6 text-center text-xs">
        © 2025 Từ Thiện Việt. Chung tay vì cộng đồng 💗
      </footer>

    </div>
  )
}
