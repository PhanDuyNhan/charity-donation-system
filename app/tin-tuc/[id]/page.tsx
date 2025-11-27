"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Calendar,
  ArrowLeft,
  Share2,
  Copy,
  Facebook,
  Clock,
  Tag,
  ChevronRight,
  Twitter,
  CheckCircle
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"
import { getImageUrl, truncateText } from "@/lib/utils"

// Map chuyên mục
const CHUYEN_MUC_MAP: Record<string, string> = {
  tin_tuc: "Tin tức",
  su_kien: "Sự kiện",
  cau_chuyen_thanh_cong: "Câu chuyện thành công",
  thong_bao: "Thông báo",
}

// Format ngày
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Tính thời gian đã đăng
function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return formatDate(dateStr)
}

export default function TinTucDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tinTuc, setTinTuc] = useState<TinTuc | null>(null)
  const [related, setRelated] = useState<TinTuc[]>([])
  const [latest, setLatest] = useState<TinTuc[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (params.id) fetchTinTuc()
  }, [params.id])

  const fetchTinTuc = async () => {
    try {
      const data = await apiClient.getTinTuc({ id: `eq.${params.id}` })
      if (data.length > 0) {
        const current = data[0]
        setTinTuc(current)

        const all = await apiClient.getTinTuc({ order: "ngay_tao.desc" })

        // Tin mới nhất (không trùng bài hiện tại)
        setLatest(all.filter(x => x.id !== current.id).slice(0, 5))

        // Tin liên quan - cùng chuyên mục (nếu có)
        const currentCategory = (current as any).chuyen_muc
        let relatedPosts = all.filter((x) => x.id !== current.id)

        if (currentCategory) {
          const sameCategoryPosts = relatedPosts.filter(
            (x) => (x as any).chuyen_muc === currentCategory
          )
          if (sameCategoryPosts.length >= 3) {
            relatedPosts = sameCategoryPosts
          }
        }

        setRelated(relatedPosts.slice(0, 3))
      }
    } catch (error) {
      console.error("Lỗi khi tải tin tức:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank"
    )
  }

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(tinTuc?.tieu_de || "")}`,
      "_blank"
    )
  }

  const shareZalo = () => {
    window.open(
      `https://zalo.me/share?url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-muted-foreground">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tinTuc) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">📰</div>
        <h2 className="text-2xl font-bold">Không tìm thấy bài viết</h2>
        <p className="text-muted-foreground">Bài viết có thể đã bị xóa hoặc không tồn tại</p>
        <Button onClick={() => router.push("/tin-tuc")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang tin tức
        </Button>
      </div>
    )
  }

  const category = (tinTuc as any).chuyen_muc
  const categoryName = category ? (CHUYEN_MUC_MAP[category] || category) : null

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      {tinTuc.anh_dai_dien && (
        <div className="relative h-[400px] md:h-[500px] w-full">
          <img
            src={getImageUrl(tinTuc.anh_dai_dien)}
            alt={tinTuc.tieu_de}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto max-w-4xl">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
                <Link href="/" className="hover:text-white transition">Trang chủ</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/tin-tuc" className="hover:text-white transition">Tin tức</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white/90 line-clamp-1">{tinTuc.tieu_de}</span>
              </div>

              {/* Category badge */}
              {categoryName && (
                <span className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Tag className="w-3 h-3" />
                  {categoryName}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                {tinTuc.tieu_de}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(tinTuc.ngay_tao)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {timeAgo(tinTuc.ngay_tao)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Article Content */}
          <div className="lg:col-span-3">
            {/* Back button - chỉ hiển thị nếu không có ảnh banner */}
            {!tinTuc.anh_dai_dien && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push("/tin-tuc")}
                  className="mb-6"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>

                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                  {tinTuc.tieu_de}
                </h1>

                <div className="flex items-center gap-4 text-muted-foreground mb-6">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(tinTuc.ngay_tao)}
                  </span>
                </div>
              </>
            )}

            {/* Share buttons - sticky */}
            <div className="flex items-center gap-2 mb-8 p-4 bg-muted/50 rounded-lg">
              <span className="text-sm text-muted-foreground mr-2">Chia sẻ:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={shareFacebook}
                className="gap-2"
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareTwitter}
                className="gap-2"
              >
                <Twitter className="h-4 w-4 text-sky-500" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareZalo}
                className="gap-2"
              >
                <Share2 className="h-4 w-4 text-blue-500" />
                Zalo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Đã copy
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy link
                  </>
                )}
              </Button>
            </div>

            {/* Article Content */}
            <article
              className="prose prose-lg max-w-none leading-relaxed
                prose-headings:font-bold prose-headings:text-foreground
                prose-p:text-foreground/90 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-md
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-li:text-foreground/90"
              dangerouslySetInnerHTML={{ __html: tinTuc.noi_dung }}
            />

            {/* Tags */}
            {categoryName && (
              <div className="mt-10 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Chuyên mục:</span>
                  <Link
                    href={`/tin-tuc?category=${category}`}
                    className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full hover:bg-primary/20 transition"
                  >
                    {categoryName}
                  </Link>
                </div>
              </div>
            )}

            {/* Related Posts */}
            {related.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  📰 Bài viết liên quan
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {related.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
                    >
                      <Link href={`/tin-tuc/${item.id}`} className="block">
                        <div className="relative overflow-hidden">
                          <img
                            src={getImageUrl(item.anh_dai_dien)}
                            alt={item.tieu_de}
                            className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {(item as any).chuyen_muc && (
                            <span className="absolute top-2 left-2 bg-primary/90 text-white px-2 py-0.5 rounded text-xs">
                              {CHUYEN_MUC_MAP[(item as any).chuyen_muc] || (item as any).chuyen_muc}
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                            {item.tieu_de}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(item.ngay_tao)}
                          </p>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Back button */}
              <Button
                variant="outline"
                onClick={() => router.push("/tin-tuc")}
                className="w-full mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại trang tin tức
              </Button>

              {/* Latest news */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  🔥 Tin mới nhất
                </h3>

                <div className="space-y-4">
                  {latest.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/tin-tuc/${item.id}`}
                      className="flex gap-3 group"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={getImageUrl(item.anh_dai_dien)}
                          alt={item.tieu_de}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {item.tieu_de}
                        </h4>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(item.ngay_tao)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link href="/tin-tuc">
                  <Button variant="outline" className="w-full mt-6">
                    Xem tất cả tin tức
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
