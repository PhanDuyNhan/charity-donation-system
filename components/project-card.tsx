import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Calendar, Target, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface ProjectCardProps {
  project: {
    id: number
    ten_du_an: string
    mo_ta_ngan: string
    hinh_anh_dai_dien?: string
    muc_tieu_quyen_gop: number
    so_tien_hien_tai: number
    ngay_bat_dau: string
    ngay_ket_thuc: string
    trang_thai: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = (project.so_tien_hien_tai / project.muc_tieu_quyen_gop) * 100
  const daysLeft = Math.ceil((new Date(project.ngay_ket_thuc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={project.hinh_anh_dai_dien || "/placeholder.svg?height=200&width=400"}
          alt={project.ten_du_an}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur">
            {project.trang_thai === "dang_mo" ? "🟢 Đang mở" : "🔴 Đã đóng"}
          </span>
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.ten_du_an}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.mo_ta_ngan}</p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Đã quyên góp</span>
              <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{formatCurrency(project.so_tien_hien_tai)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{formatCurrency(project.muc_tieu_quyen_gop)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Còn {daysLeft > 0 ? `${daysLeft} ngày` : "Đã kết thúc"}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full">
          <Link href={`/du-an/${project.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
