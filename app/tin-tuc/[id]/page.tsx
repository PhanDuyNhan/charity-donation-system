"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar, ArrowLeft, Share2, Copy, Facebook, Bookmark } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"
import { getImageUrl } from "@/lib/utils"

export default function TinTucDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tinTuc, setTinTuc] = useState<TinTuc | null>(null)
  const [related, setRelated] = useState<TinTuc[]>([])
  const [latest, setLatest] = useState<TinTuc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) fetchTinTuc()
  }, [params.id])

  const fetchTinTuc = async () => {
    try {
      const data = await apiClient.getTinTuc({ id: `eq.${params.id}` })
      if (data.length > 0) {
        const current = data[0]
        setTinTuc(current)

        const all = await apiClient.getTinTuc()

        // Tin mới nhất
        setLatest(all.slice(0, 5))

        // Tin liên quan (không trùng id)
        const relatedPosts = all
          .filter((x) => x.id !== current.id)
          .slice(0, 3)

        setRelated(relatedPosts)
      }
    } catch (error) {
      console.error("Lỗi khi tải tin tức:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Đã sao chép liên kết!")
  }

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
      "_blank"
    )
  }

  const shareZalo = () => {
    window.open(
      `https://zalo.me/share?url=${window.location.href}`,
      "_blank"
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tinTuc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => router.push("/tin-tuc")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">

      {/* 🔹 Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4 flex gap-2">
        <Link href="/" className="hover:underline">Trang chủ</Link> /
        <Link href="/tin-tuc" className="hover:underline">Tin tức</Link> /
        <span className="text-foreground">{tinTuc.tieu_de}</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-10">

        {/* ==========================
            📌 CONTENT
        ============================*/}
        <div className="lg:col-span-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/tin-tuc")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          {tinTuc.anh_dai_dien && (
            <img
              src={getImageUrl(tinTuc.anh_dai_dien)}
              className="w-full h-[420px] object-cover rounded-xl shadow-md"
            />
          )}

          <h1 className="text-4xl font-bold mt-6 leading-tight">{tinTuc.tieu_de}</h1>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-muted-foreground mt-4 mb-6">
            <Calendar className="h-5 w-5" />
            <span>{new Date(tinTuc.ngay_tao).toLocaleDateString("vi-VN")}</span>

            {/* Share Buttons */}
            <div className="ml-auto flex gap-3">
              <Button variant="ghost" size="icon" onClick={shareFacebook}>
                <Facebook className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={shareZalo}>
                <Share2 className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 📰 ARTICLE CONTENT */}
          <article
            className="prose prose-lg max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: tinTuc.noi_dung }}
          />

          {/* ==========================
              🔥 RELATED POSTS
          ============================*/}
          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-4">Tin liên quan</h2>

              <div className="grid md:grid-cols-3 gap-6">
                {related.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-lg transition"
                  >
                    <img
                      src={getImageUrl(item.anh_dai_dien)}
                      className="h-28 w-full object-cover"
                    />

                    <div className="p-4">
                      <Link href={`/tin-tuc/${item.id}`}>
                        <h3 className="font-semibold line-clamp-2 hover:text-primary">
                          {item.tieu_de}
                        </h3>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ==========================
            📌 SIDEBAR (Latest news)
        ============================*/}
        <aside className="lg:col-span-1">
          <h3 className="text-lg font-bold mb-4">Tin mới nhất</h3>

          <div className="space-y-4">
            {latest.map((item) => (
              <Link
                key={item.id}
                href={`/tin-tuc/${item.id}`}
                className="flex gap-3 group"
              >
                <img
                  src={getImageUrl(item.anh_dai_dien)}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary">
                    {item.tieu_de}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.ngay_tao).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
