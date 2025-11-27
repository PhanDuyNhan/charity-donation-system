"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, ArrowRight, HandHeart, Target, Shield, MapPin, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { apiClient } from "@/lib/api-client"
import ChatbotWidget from "@/components/ui/chatbox"
import { DuAn, DanhMucDuAn } from "@/lib/types"

// Map lưu tổng tiền quyên góp theo mã dự án
type ProjectDonationMap = Record<number, number>;

export default function HomePage() {
  const [page, setPage] = useState(1)
  const [projects, setProjects] = useState<DuAn[]>([])
  const [categories, setCategories] = useState<DanhMucDuAn[]>([])
  const [projectDonations, setProjectDonations] = useState<ProjectDonationMap>({})
  const [isLoading, setIsLoading] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);
  const pageSize = 3;

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setIsLoading(true);

      try {
        // Lấy danh mục
        const categoriesRes = await apiClient.getDanhMucDuAn();
        if (mounted && Array.isArray(categoriesRes)) {
          setCategories(categoriesRes);
        }

        // Tính toán offset (vị trí bắt đầu)
        const offset = (page - 1) * pageSize;

        const res = await apiClient.getDuAn({
          select: "*",
          order: "id.desc",
          limit: pageSize,
          offset: offset,
        });

        if (mounted && Array.isArray(res)) {
          setProjects(res);

          // Lấy tổng tiền quyên góp cho từng dự án từ API quyen_gop
          const donationMap: ProjectDonationMap = {};
          await Promise.all(
            res.map(async (project) => {
              try {
                const donations = await apiClient.getQuyenGop({
                  ma_du_an: `eq.${project.id}`,
                  trang_thai_: `eq.thanh_cong`,
                  select: "so_tien_thuc",
                });
                // Tính tổng so_tien_thuc
                const total = Array.isArray(donations)
                  ? donations.reduce((sum, d) => sum + (d.so_tien_thuc || 0), 0)
                  : 0;
                donationMap[project.id] = total;
              } catch {
                donationMap[project.id] = 0;
              }
            })
          );
          if (mounted) {
            setProjectDonations(donationMap);
          }
        }

        // Lấy tổng số dự án để tính toán phân trang
        const countRes = await apiClient.getDuAn({ select: "id" });
        if (mounted && Array.isArray(countRes)) {
          setTotalProjects(countRes.length);
        }

      } catch (err) {
        console.error("Failed to load projects", err);
        if (mounted) setProjects([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
    return () => {
      mounted = false;
    };
  }, [page, pageSize]);
  // Pagination controls
  const totalPages = Math.ceil(totalProjects / pageSize);

  function handlePrevPage() {
    setPage((prev) => Math.max(1, prev - 1));
  }
  function handleNextPage() {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }

  console.log("object", projects)

  const { user, isAuthenticated, logout } = useAuth() // 👈 lấy state đăng nhập
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-(--color-background-tertiary) to-(--color-background-secondary) py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold text-balance text-(--color-foreground)">
                Cùng Nhau Tạo Nên <span className="text-(--color-primary)">Sự Thay Đổi</span>
              </h1>
              <p className="text-lg text-(--color-foreground-secondary) text-pretty leading-relaxed">
                Mỗi đóng góp của bạn đều có ý nghĩa. Hãy cùng chúng tôi mang lại cuộc sống tốt đẹp hơn cho cộng đồng.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/du-an">
                  <Button size="lg" className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white">
                    Khám Phá Dự Án
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/tinh-nguyen-vien">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white bg-transparent"
                  >
                    Trở Thành TNV
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <img src="/happy-children-receiving-charity-donations.jpg" alt="Hoạt động từ thiện" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {/* <StatsBlock /> */}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-(--color-background-secondary)">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Dự Án Nổi Bật</h2>
            <p className="text-(--color-foreground-secondary) text-lg">Những dự án đang cần sự hỗ trợ của bạn</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {projects?.map((project: DuAn) => {
              // Lấy tổng tiền đã quyên góp từ API quyen_gop (giống trang chi tiết)
              const totalDonated = projectDonations[project.id] || 0;

              // Tính toán phần trăm quyên góp
              const progressPercentage = calculatePercentage(
                totalDonated,
                project.so_tien_muc_tieu
              );

              // Định dạng tiền tệ - format VNĐ nhất quán
              const currentAmountFormatted = formatMoney(totalDonated);
              const targetAmountFormatted = formatMoney(project.so_tien_muc_tieu);

              // Xác định mức độ khẩn cấp
              const isUrgent = project.muc_do_uu_tien === 'khan_cap';

              // Lấy tên danh mục từ categories
              const category = categories.find(c => c.id === project.ma_danh_muc);
              const categoryName = category?.ten || 'Chưa phân loại';

              // Tách địa điểm - lấy phần cuối
              const locationParts = project.dia_diem?.split(',').map(s => s.trim()) || [];
              const mainLocation = locationParts[locationParts.length - 1] || project.dia_diem;

              // Sử dụng thu_vien_anh, nếu không có thì dùng ảnh mặc định
              const imageUrl = Array.isArray(project.thu_vien_anh)
                ? project.thu_vien_anh[0] || '/default-project-image.jpg'
                : project.thu_vien_anh || '/default-project-image.jpg';

              // Tính số ngày còn lại
              const daysRemaining = Math.ceil(
                (new Date(project.ngay_ket_thuc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              const isExpired = daysRemaining < 0;

              return (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-(--color-border) group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={project.tieu_de}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge danh mục */}
                    <div className="absolute top-4 left-4 bg-(--color-primary) text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                      {categoryName}
                    </div>

                    {/* Badge khẩn cấp */}
                    {isUrgent && (
                      <div className="absolute top-4 right-4 bg-(--color-secondary) text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                        🔥 Khẩn Cấp
                      </div>
                    )}

                    {/* Badge hết hạn */}
                    {isExpired && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                          Đã kết thúc
                        </span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-balance line-clamp-2 min-h-[3.5rem]">
                      {project?.tieu_de}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {mainLocation}
                      </span>
                      {!isExpired && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Còn {daysRemaining} ngày
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2">
                      {/* Thanh tiến độ */}
                      <div className="w-full bg-(--color-border) rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-(--color-primary) to-(--color-success) h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>

                      {/* Thông tin số tiền */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-(--color-foreground-secondary)">Đã đạt</p>
                          <p className="font-bold text-(--color-primary) text-lg">{currentAmountFormatted}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-(--color-foreground-secondary)">Mục tiêu</p>
                          <p className="font-semibold text-(--color-foreground)">{targetAmountFormatted}</p>
                        </div>
                      </div>

                      {/* Phần trăm */}
                      <div className="text-center">
                        <span className="inline-block bg-(--color-background-tertiary) text-(--color-primary) px-3 py-1 rounded-full text-sm font-semibold">
                          {progressPercentage}% hoàn thành
                        </span>
                      </div>
                    </div>

                    {/* Nút quyên góp */}
                    <Link href={`/du-an/${project.id}`}>
                      {isExpired ? (
                        <Button
                          className="w-full bg-gray-400 cursor-not-allowed"
                          disabled
                        >
                          Chiến dịch đã kết thúc
                        </Button>
                      ) : (
                        <Button className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) transition-colors">
                          <Heart className="w-4 h-4 mr-2" />
                          Quyên Góp Ngay
                        </Button>
                      )}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1 || isLoading}
                className="min-w-[40px]"
              >
                &lt;
              </Button>
              <span className="text-sm">
                Trang <span className="font-semibold">{page}</span> / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === totalPages || isLoading}
                className="min-w-[40px]"
              >
                &gt;
              </Button>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/du-an">
              <Button
                variant="outline"
                size="lg"
                className="border-(--color-primary) text-(--color-primary) bg-transparent"
              >
                Xem Tất Cả Dự Án
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Tại Sao Chọn Chúng Tôi?</h2>
            <p className="text-(--color-foreground-secondary) text-lg">Cam kết minh bạch và hiệu quả</p>
          </div>

          <ChatbotWidget />

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 border-(--color-border) hover:border-(--color-primary) transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--color-background-tertiary) mb-6">
                <Shield className="h-8 w-8 text-(--color-primary)" />
              </div>
              <CardTitle className="mb-4">Minh Bạch 100%</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Mọi khoản quyên góp đều được công khai và báo cáo chi tiết
              </CardDescription>
            </Card>

            <Card className="text-center p-8 border-(--color-border) hover:border-(--color-primary) transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-(--color-background-secondary) mb-6">
                <Target className="h-8 w-8 text-(--color-secondary)" />
              </div>
              <CardTitle className="mb-4">Hiệu Quả Cao</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                100% số tiền quyên góp được sử dụng đúng mục đích
              </CardDescription>
            </Card>

            <Card className="text-center p-8 border-(--color-border) hover:border-(--color-primary) transition-colors">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-50 mb-6">
                <HandHeart className="h-8 w-8 text-(--color-accent)" />
              </div>
              <CardTitle className="mb-4">Dễ Dàng Tham Gia</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Quy trình đơn giản, nhanh chóng và an toàn
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-(--color-primary) to-(--color-success) text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Sẵn Sàng Tạo Nên Sự Khác Biệt?</h2>
          <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto text-pretty leading-relaxed">
            Hãy bắt đầu hành trình từ thiện của bạn ngay hôm nay. Mỗi hành động nhỏ đều có ý nghĩa lớn.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/dang-ky">
              <Button size="lg" variant="secondary" className="bg-white text-(--color-primary) hover:bg-white/90">
                Đăng Ký Ngay
              </Button>
            </Link>
            <Link href="/lien-he">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Liên Hệ Với Chúng Tôi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-(--color-foreground) text-white py-12">
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
                <li>
                  <Link href="/doi-ngu" className="hover:text-white transition-colors">
                    Đội Ngũ
                  </Link>
                </li>
                <li>
                  <Link href="/bao-cao" className="hover:text-white transition-colors">
                    Báo Cáo
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
                  <Link href="/cau-hoi" className="hover:text-white transition-colors">
                    Câu Hỏi Thường Gặp
                  </Link>
                </li>
                <li>
                  <Link href="/chinh-sach" className="hover:text-white transition-colors">
                    Chính Sách
                  </Link>
                </li>
                <li>
                  <Link href="/dieu-khoan" className="hover:text-white transition-colors">
                    Điều Khoản
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Liên Hệ</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>Email: contact@tuthienviet.org</li>
                <li>Hotline: 1900 xxxx</li>
                <li>Địa chỉ: Hà Nội, Việt Nam</li>
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

// Format tiền VNĐ - đảm bảo số dương và format nhất quán
function formatMoney(n: number) {
  // Đảm bảo số không âm
  const amount = Math.abs(n || 0);

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)} triệu`;
  }
  if (amount >= 1_000) {
    return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
  }
  return `${amount} đ`;
}

// function StatsBlock() {
//   const [projectsCompleted, setProjectsCompleted] = useState<number | null>(null)
//   const [uniqueDonors, setUniqueDonors] = useState<number | null>(null)
//   const [volunteersCount, setVolunteersCount] = useState<number | null>(null)
//   const [totalDonations, setTotalDonations] = useState<number | null>(null)

//   useEffect(() => {
//     let mounted = true

//     async function loadStats() {
//       try {
//         // 1) Projects completed

//         // Using PostgREST-style filters (eq.) so queries match backend expectations
//         const projects = await apiClient.getDuAn({ trang_thai: "eq.hoan_thanh", select: "id" })

//         // Donations: fetch all donors (for unique count) and completed donations (for sum)
//         const donationsAll = await apiClient.getQuyenGop({ select: "ma_nguoi_dung,email_nguoi_quyen_gop" })
//         const donationsCompleted = await apiClient.getQuyenGop({ select: "so_tien", trang_thai_thanh_toan: "eq.hoan_thanh" })

//         // Volunteers
//         const volunteers = await apiClient.getTinhNguyenVien({ select: "id,ma_nguoi_dung" })

//         if (!mounted) return

//         setProjectsCompleted(Array.isArray(projects) ? projects.length : 0)

//         // compute unique donors from donationsAll
//         const donors = new Set<string | number>()
//         if (Array.isArray(donationsAll)) {
//           donationsAll.forEach((d: any) => {
//             const key = d.ma_nguoi_dung ?? d.email_nguoi_quyen_gop ?? JSON.stringify(d)
//             donors.add(key)
//           })
//         }

//         // sum amounts from completed donations
//         let sum = 0
//         if (Array.isArray(donationsCompleted)) {
//           donationsCompleted.forEach((d: any) => {
//             const amount = typeof d.so_tien === "number" ? d.so_tien : Number(d.so_tien) || 0
//             sum += amount
//           })
//         }

//         setUniqueDonors(donors.size)
//         setTotalDonations(sum)
//         setVolunteersCount(Array.isArray(volunteers) ? volunteers.length : 0)
//       } catch (err) {
//         console.error("Stats load failed", err)
//         if (mounted) {
//           setProjectsCompleted(0)
//           setUniqueDonors(0)
//           setVolunteersCount(0)
//           setTotalDonations(0)
//         }
//       }
//     }

//     loadStats()
//     return () => {
//       mounted = false
//     }
//   }, [])

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//       <div className="text-center space-y-2">
//         <div className="text-4xl font-bold text-(--color-primary)">{projectsCompleted == null ? "—" : projectsCompleted.toLocaleString()}</div>
//         <div className="text-sm text-(--color-foreground-secondary)">Dự Án Hoàn Thành</div>
//       </div>

//       <div className="text-center space-y-2">
//         <div className="text-4xl font-bold text-(--color-secondary)">{uniqueDonors == null ? "—" : uniqueDonors.toLocaleString()}</div>
//         <div className="text-sm text-(--color-foreground-secondary)">Người Quyên Góp</div>
//       </div>

//       <div className="text-center space-y-2">
//         <div className="text-4xl font-bold text-(--color-accent)">{volunteersCount == null ? "—" : volunteersCount.toLocaleString()}</div>
//         <div className="text-sm text-(--color-foreground-secondary)">Tình Nguyện Viên</div>
//       </div>

//       <div className="text-center space-y-2">
//         <div className="text-4xl font-bold text-(--color-success)">{totalDonations == null ? "—" : formatNumber(totalDonations)}</div>
//         <div className="text-sm text-(--color-foreground-secondary)">Đồng Quyên Góp</div>
//       </div>
//     </div>
//   )
// }


function calculatePercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(100, Math.round(percentage));
}