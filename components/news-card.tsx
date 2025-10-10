import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface NewsCardProps {
  news: {
    id: number
    tieu_de: string
    mo_ta_ngan: string
    hinh_anh_dai_dien?: string
    ngay_dang: string
    tac_gia?: string
  }
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Link href={`/tin-tuc/${news.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={news.hinh_anh_dai_dien || "/placeholder.svg?height=200&width=400"}
            alt={news.tieu_de}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>

        <CardContent className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {news.tieu_de}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{news.mo_ta_ngan}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(news.ngay_dang)}</span>
            </div>
            {news.tac_gia && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{news.tac_gia}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
