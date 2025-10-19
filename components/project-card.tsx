"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp } from "lucide-react"
import type { DuAn } from "@/lib/types"

interface ProjectCardProps {
  project: DuAn
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = project.so_tien_muc_tieu > 0 ? (project.so_tien_hien_tai / project.so_tien_muc_tieu) * 100 : 0

  const anh = project.anh_dai_dien
    ? project.anh_dai_dien.startsWith("https")
      ? project.anh_dai_dien
      : `https://j2ee.oshi.id.vn${project.anh_dai_dien}`
    : "https://via.placeholder.com/400x250?text=No+Image"

  return (
    <Link href={`/du-an/${project.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full border-border">
        <div className="relative h-40 overflow-hidden bg-secondary">
          <img
            src={anh || "/placeholder.svg"}
            alt={project.tieu_de}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">{progress.toFixed(0)}%</Badge>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2 text-foreground">{project.tieu_de}</CardTitle>
          {project.dia_diem && (
            <CardDescription className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {project.dia_diem}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-primary">{project.so_tien_hien_tai.toLocaleString("vi-VN")} đ</span>
              <span className="text-muted-foreground">{project.so_tien_muc_tieu.toLocaleString("vi-VN")} đ</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="h-2 bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>{project.so_nguoi_thu_huong || 0} người hưởng lợi</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
