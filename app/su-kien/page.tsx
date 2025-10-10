import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, MapPin, Users, Clock } from "lucide-react"

export default function SuKienPage() {
  const events = [
    {
      id: 1,
      ten: "Ngày Hội Từ Thiện 2025",
      mo_ta: "Sự kiện quyên góp và giao lưu cộng đồng",
      dia_diem: "Công viên Thống Nhất, Hà Nội",
      ngay_dien_ra: "2025-02-15",
      gio_bat_dau: "08:00",
      gio_ket_thuc: "17:00",
      so_nguoi_tham_gia: 245,
      gioi_han_nguoi: 500,
      trang_thai: "sap_dien_ra",
    },
    {
      id: 2,
      ten: "Chạy Bộ Vì Trẻ Em",
      mo_ta: "Giải chạy từ thiện gây quỹ cho trẻ em khó khăn",
      dia_diem: "Hồ Gươm, Hà Nội",
      ngay_dien_ra: "2025-03-01",
      gio_bat_dau: "06:00",
      gio_ket_thuc: "10:00",
      so_nguoi_tham_gia: 567,
      gioi_han_nguoi: 1000,
      trang_thai: "sap_dien_ra",
    },
    {
      id: 3,
      ten: "Trao Quà Trung Thu",
      mo_ta: "Trao quà và tổ chức vui chơi cho trẻ em vùng cao",
      dia_diem: "Lào Cai",
      ngay_dien_ra: "2025-09-10",
      gio_bat_dau: "09:00",
      gio_ket_thuc: "16:00",
      so_nguoi_tham_gia: 89,
      gioi_han_nguoi: 200,
      trang_thai: "sap_dien_ra",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <span className="text-xl font-bold">Từ Thiện Việt</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/du-an" className="text-sm font-medium hover:text-primary transition-colors">
              Dự Án
            </Link>
            <Link href="/su-kien" className="text-sm font-medium text-primary">
              Sự Kiện
            </Link>
            <Link href="/tin-tuc" className="text-sm font-medium hover:text-primary transition-colors">
              Tin Tức
            </Link>
            <Link href="/lien-he" className="text-sm font-medium hover:text-primary transition-colors">
              Liên Hệ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dang-nhap">
              <Button variant="ghost" size="sm">
                Đăng Nhập
              </Button>
            </Link>
            <Link href="/dang-ky">
              <Button size="sm">Đăng Ký</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 to-orange-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Sự Kiện Từ Thiện</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Tham gia các sự kiện từ thiện ý nghĩa và kết nối với cộng đồng
            </p>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {events.map((event) => {
              const participationRate = (event.so_nguoi_tham_gia / event.gioi_han_nguoi) * 100

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-[300px_1fr] gap-6">
                    <div className="relative h-[200px] md:h-auto">
                      <img
                        src={`/charity-event-.jpg?height=300&width=300&query=charity event ${event.id}`}
                        alt={event.ten}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-4 left-4 bg-accent text-white">
                        {event.trang_thai === "sap_dien_ra" ? "Sắp diễn ra" : "Đang diễn ra"}
                      </Badge>
                    </div>

                    <div className="p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div>
                          <CardTitle className="text-2xl mb-2 text-balance">{event.ten}</CardTitle>
                          <CardDescription className="text-base">{event.mo_ta}</CardDescription>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{new Date(event.ngay_dien_ra).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>
                              {event.gio_bat_dau} - {event.gio_ket_thuc}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{event.dia_diem}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 text-primary" />
                            <span>
                              {event.so_nguoi_tham_gia}/{event.gioi_han_nguoi} người
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Số người đăng ký</span>
                            <span className="font-semibold">{participationRate.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-secondary/20 rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full transition-all"
                              style={{ width: `${participationRate}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Link href={`/su-kien/${event.id}`} className="flex-1">
                          <Button className="w-full">Xem Chi Tiết</Button>
                        </Link>
                        <Button variant="outline">Đăng Ký Tham Gia</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-white/70">
            <p>&copy; 2025 Từ Thiện Việt. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
