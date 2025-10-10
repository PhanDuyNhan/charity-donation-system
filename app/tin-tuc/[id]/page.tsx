"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"

export default function TinTucDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tinTuc, setTinTuc] = useState<TinTuc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchTinTuc()
    }
  }, [params.id])

  const fetchTinTuc = async () => {
    try {
      const data = await apiClient.get<TinTuc[]>("/tin_tuc", {
        id: `eq.${params.id}`,
      })
      if (data.length > 0) {
        setTinTuc(data[0])
      }
    } catch (error) {
      console.error("Lỗi khi tải tin tức:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tinTuc?.tieu_de,
        text: tinTuc?.mo_ta_ngan,
        url: window.location.href,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tinTuc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy tin tức</h2>
          <Button onClick={() => router.push("/tin-tuc")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.push("/tin-tuc")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <article className="bg-card rounded-lg shadow-lg overflow-hidden">
          {tinTuc.hinh_anh && (
            <div className="relative h-96">
              <img
                src={tinTuc.hinh_anh || "/placeholder.svg"}
                alt={tinTuc.tieu_de}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-accent text-accent-foreground">{tinTuc.loai_tin}</Badge>
              <Badge variant="outline">{tinTuc.trang_thai}</Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4 text-balance">{tinTuc.tieu_de}</h1>

            <div className="flex items-center gap-6 text-muted-foreground mb-6 pb-6 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(tinTuc.ngay_xuat_ban).toLocaleDateString("vi-VN")}</span>
              </div>
              {tinTuc.tac_gia && (
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>{tinTuc.tac_gia}</span>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>

            {tinTuc.mo_ta_ngan && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{tinTuc.mo_ta_ngan}</p>
            )}

            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: tinTuc.noi_dung }} />

            {tinTuc.tags && tinTuc.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-semibold mb-3">Thẻ:</h3>
                <div className="flex flex-wrap gap-2">
                  {tinTuc.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
