import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Heart, Search, Filter, MapPin, Calendar } from "lucide-react"

export default function DuAnPage() {
  const projects = [
    {
      id: 1,
      ten: "Xây Dựng Trường Học Vùng Cao",
      mo_ta: "Xây dựng trường học cho trẻ em vùng cao Lào Cai",
      danh_muc: "Giáo dục",
      dia_diem: "Lào Cai",
      trang_thai: "dang_thuc_hien",
      muc_tieu: 1000000000,
      da_quyen_gop: 750000000,
      ngay_bat_dau: "2025-01-01",
      ngay_ket_thuc: "2025-06-30",
    },
    {
      id: 2,
      ten: "Hỗ Trợ Y Tế Miền Trung",
      mo_ta: "Cung cấp thiết bị y tế cho bệnh viện vùng lũ",
      danh_muc: "Y tế",
      dia_diem: "Quảng Trị",
      trang_thai: "dang_thuc_hien",
      muc_tieu: 500000000,
      da_quyen_gop: 320000000,
      ngay_bat_dau: "2025-02-01",
      ngay_ket_thuc: "2025-05-31",
    },
    {
      id: 3,
      ten: "Trồng Cây Xanh Đô Thị",
      mo_ta: "Trồng 10,000 cây xanh tại các khu đô thị",
      danh_muc: "Môi trường",
      dia_diem: "Hà Nội",
      trang_thai: "dang_thuc_hien",
      muc_tieu: 300000000,
      da_quyen_gop: 180000000,
      ngay_bat_dau: "2025-03-01",
      ngay_ket_thuc: "2025-12-31",
    },
    {
      id: 4,
      ten: "Hỗ Trợ Trẻ Em Mồ Côi",
      mo_ta: "Cung cấp học bổng và hỗ trợ sinh hoạt cho trẻ em mồ côi",
      danh_muc: "Trẻ em",
      dia_diem: "TP. Hồ Chí Minh",
      trang_thai: "dang_thuc_hien",
      muc_tieu: 800000000,
      da_quyen_gop: 560000000,
      ngay_bat_dau: "2025-01-15",
      ngay_ket_thuc: "2025-12-31",
    },
    {
      id: 5,
      ten: "Chăm Sóc Người Cao Tuổi",
      mo_ta: "Xây dựng nhà dưỡng lão cho người cao tuổi neo đơn",
      danh_muc: "Người cao tuổi",
      dia_diem: "Đà Nẵng",
      trang_thai: "dang_thuc_hien",
      muc_tieu: 1500000000,
      da_quyen_gop: 900000000,
      ngay_bat_dau: "2025-02-15",
      ngay_ket_thuc: "2025-08-31",
    },
    {
      id: 6,
      ten: "Nước Sạch Vùng Khó Khăn",
      mo_ta: "Xây dựng hệ thống nước sạch cho vùng khó khăn",
      danh_muc: "Cơ sở hạ tầng",
      dia_diem: "Cao Bằng",
      trang_thai: "dang_thuc_hien",
      muc_tieu: 600000000,
      da_quyen_gop: 420000000,
      ngay_bat_dau: "2025-01-20",
      ngay_ket_thuc: "2025-07-31",
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
            <Link href="/du-an" className="text-sm font-medium text-primary">
              Dự Án
            </Link>
            <Link href="/su-kien" className="text-sm font-medium hover:text-primary transition-colors">
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
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Các Dự Án Từ Thiện</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Khám phá và đóng góp cho các dự án từ thiện đang cần sự hỗ trợ của bạn
            </p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Tìm kiếm dự án..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="giao-duc">Giáo dục</SelectItem>
                  <SelectItem value="y-te">Y tế</SelectItem>
                  <SelectItem value="moi-truong">Môi trường</SelectItem>
                  <SelectItem value="tre-em">Trẻ em</SelectItem>
                  <SelectItem value="nguoi-cao-tuoi">Người cao tuổi</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="dang-thuc-hien">Đang thực hiện</SelectItem>
                  <SelectItem value="sap-dien-ra">Sắp diễn ra</SelectItem>
                  <SelectItem value="hoan-thanh">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const progress = (project.da_quyen_gop / project.muc_tieu) * 100

              return (
                <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`/charity-.jpg?height=200&width=400&query=charity ${project.danh_muc}`}
                      alt={project.ten}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4 bg-secondary text-white">
                      {project.trang_thai === "dang_thuc_hien" ? "Đang thực hiện" : "Sắp diễn ra"}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline">{project.danh_muc}</Badge>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.dia_diem}
                      </span>
                    </div>
                    <CardTitle className="text-xl text-balance">{project.ten}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.mo_ta}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Đã quyên góp</span>
                        <span className="font-semibold text-primary">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-secondary/20 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">{project.da_quyen_gop.toLocaleString("vi-VN")} đ</span>
                        <span className="text-muted-foreground">/ {project.muc_tieu.toLocaleString("vi-VN")} đ</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <Link href={`/du-an/${project.id}`}>
                      <Button className="w-full">Quyên Góp Ngay</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Sau
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 fill-white" />
                <span className="text-lg font-bold">Từ Thiện Việt</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Nền tảng quyên góp từ thiện minh bạch và hiệu quả cho cộng đồng Việt Nam.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Về Chúng Tôi</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link href="/gioi-thieu" className="hover:text-white transition-colors">
                    Giới Thiệu
                  </Link>
                </li>
                <li>
                  <Link href="/su-menh" className="hover:text-white transition-colors">
                    Sứ Mệnh
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Hỗ Trợ</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link href="/huong-dan" className="hover:text-white transition-colors">
                    Hướng Dẫn
                  </Link>
                </li>
                <li>
                  <Link href="/lien-he" className="hover:text-white transition-colors">
                    Liên Hệ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Liên Hệ</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>Email: contact@tuthienviet.org</li>
                <li>Hotline: 1900 xxxx</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/70">
            <p>&copy; 2025 Từ Thiện Việt. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
