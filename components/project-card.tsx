import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar, Target, TrendingUp, MapPin, Heart } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { DuAn } from "@/lib/types"

interface ProjectCardProps {
  project: DuAn
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress =
    project.so_tien_muc_tieu > 0
      ? (project.so_tien_hien_tai / project.so_tien_muc_tieu) * 100
      : 0

  const daysLeft = Math.ceil(
    (new Date(project.ngay_ket_thuc).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  )

  const anh = project.anh_dai_dien?.startsWith("http")
    ? project.anh_dai_dien
    : `http://j2ee.oshi.id.vn:5555${project.anh_dai_dien}`

  return (
    <Card className="overflow-hidden bg-blue-950/70 border-blue-800 text-slate-100 hover:shadow-lg hover:shadow-blue-800/30 transition-all duration-300">
      {/* Hình ảnh dự án */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={anh || "/placeholder.svg?height=200&width=400"}
          alt={project.tieu_de}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur ${
              project.trang_thai === "hoat_dong"
                ? "bg-green-600/90 text-white"
                : "bg-gray-600/70 text-gray-200"
            }`}
          >
            {project.trang_thai === "hoat_dong" ? "🟢 Hoạt động" : "⚪ Khác"}
          </span>
        </div>
      </div>

      {/* Nội dung */}
      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-blue-200">
          {project.tieu_de}
        </h3>
        <p className="text-sm text-blue-300 mb-4 line-clamp-2">
          {project.mo_ta_ngan || "Không có mô tả ngắn"}
        </p>

        <div className="space-y-3">
          {/* Thanh tiến độ */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-300">Đã quyên góp</span>
              <span className="font-semibold text-blue-400">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-blue-900" />
          </div>

          {/* Thông tin tiền */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-blue-300">
              <TrendingUp className="h-4 w-4" />
              <span>{formatCurrency(project.so_tien_hien_tai)}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-300">
              <Target className="h-4 w-4" />
              <span>{formatCurrency(project.so_tien_muc_tieu)}</span>
            </div>
          </div>

          {/* Thông tin khác */}
          <div className="flex items-center justify-between text-sm text-blue-300 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {daysLeft > 0 ? `${daysLeft} ngày còn lại` : "Đã kết thúc"}
              </span>
            </div>
            {project.dia_diem && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{project.dia_diem}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-5 pt-0">
        <Button
          asChild
          className="w-full bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        >
          <Link href={`/du-an/${project.id}`}>
            <Heart className="h-4 w-4 mr-2" /> Xem chi tiết
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
