import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface EventCardProps {
  event: {
    id: number
    ten_su_kien: string
    mo_ta_ngan: string
    hinh_anh?: string
    ngay_bat_dau: string
    dia_diem: string
    so_luong_tham_gia?: number
    trang_thai: string
  }
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={event.hinh_anh || "/placeholder.svg?height=200&width=400"}
          alt={event.ten_su_kien}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur">
            {event.trang_thai === "sap_dien_ra" ? "📅 Sắp diễn ra" : "✅ Đã diễn ra"}
          </span>
        </div>
      </div>

      <CardContent className="p-5">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.ten_su_kien}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.mo_ta_ngan}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(event.ngay_bat_dau)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">{event.dia_diem}</span>
          </div>
          {event.so_luong_tham_gia && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{event.so_luong_tham_gia} người tham gia</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button asChild variant="outline" className="w-full bg-transparent">
          <Link href={`/su-kien/${event.id}`}>Xem chi tiết</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
