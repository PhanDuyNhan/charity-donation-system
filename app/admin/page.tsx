import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, FolderKanban, Calendar, TrendingUp, ArrowUp } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-(--color-admin-text)">Tổng Quan</h2>
        <p className="text-(--color-admin-text-secondary) mt-1">Thống kê tổng quan hệ thống từ thiện</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-(--color-admin-text-secondary)">Tổng Quyên Góp</CardTitle>
            <DollarSign className="h-5 w-5 text-(--color-success)" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--color-admin-text)">89,234,567,890 đ</div>
            <p className="text-xs text-(--color-success) flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+12.5% so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-(--color-admin-text-secondary)">
              Dự Án Đang Hoạt Động
            </CardTitle>
            <FolderKanban className="h-5 w-5 text-(--color-primary)" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--color-admin-text)">156</div>
            <p className="text-xs text-(--color-admin-text-secondary) mt-1">23 dự án mới trong tháng</p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-(--color-admin-text-secondary)">Người Dùng</CardTitle>
            <Users className="h-5 w-5 text-(--color-secondary)" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--color-admin-text)">45,678</div>
            <p className="text-xs text-(--color-success) flex items-center gap-1 mt-1">
              <ArrowUp className="h-3 w-3" />
              <span>+8.2% so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-(--color-admin-text-secondary)">Sự Kiện Sắp Tới</CardTitle>
            <Calendar className="h-5 w-5 text-(--color-accent)" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-(--color-admin-text)">28</div>
            <p className="text-xs text-(--color-admin-text-secondary) mt-1">12 sự kiện trong tuần này</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-(--color-admin-text)">Quyên Góp Theo Tháng</CardTitle>
            <CardDescription className="text-(--color-admin-text-secondary)">Thống kê 6 tháng gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-(--color-admin-text-secondary)">
              <TrendingUp className="h-12 w-12 mb-2" />
              <span className="ml-2">Biểu đồ quyên góp</span>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="text-(--color-admin-text)">Dự Án Theo Danh Mục</CardTitle>
            <CardDescription className="text-(--color-admin-text-secondary)">
              Phân bố dự án theo lĩnh vực
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Giáo dục", count: 45, color: "bg-blue-500" },
                { name: "Y tế", count: 38, color: "bg-green-500" },
                { name: "Môi trường", count: 32, color: "bg-emerald-500" },
                { name: "Trẻ em", count: 28, color: "bg-pink-500" },
                { name: "Người cao tuổi", count: 13, color: "bg-orange-500" },
              ].map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-(--color-admin-text)">{category.name}</span>
                    <span className="text-(--color-admin-text-secondary)">{category.count} dự án</span>
                  </div>
                  <div className="w-full bg-(--color-admin-bg) rounded-full h-2">
                    <div
                      className={`${category.color} h-2 rounded-full`}
                      style={{ width: `${(category.count / 156) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-(--color-admin-text)">Hoạt Động Gần Đây</CardTitle>
          <CardDescription className="text-(--color-admin-text-secondary)">
            Các hoạt động mới nhất trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "Quyên góp mới",
                detail: 'Nguyễn Văn A quyên góp 5,000,000đ cho dự án "Xây trường học"',
                time: "5 phút trước",
              },
              { action: "Dự án mới", detail: 'Dự án "Hỗ trợ người già neo đơn" đã được tạo', time: "15 phút trước" },
              { action: "Đăng ký TNV", detail: "Trần Thị B đăng ký làm tình nguyện viên", time: "1 giờ trước" },
              { action: "Sự kiện mới", detail: 'Sự kiện "Ngày hội từ thiện" được lên lịch', time: "2 giờ trước" },
              { action: "Tin tức mới", detail: 'Bài viết "Câu chuyện cảm động" đã được xuất bản', time: "3 giờ trước" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b border-(--color-admin-border) last:border-0 last:pb-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-primary)/10">
                  <div className="h-2 w-2 rounded-full bg-(--color-primary)" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-(--color-admin-text)">{activity.action}</p>
                  <p className="text-sm text-(--color-admin-text-secondary)">{activity.detail}</p>
                  <p className="text-xs text-(--color-admin-text-secondary)">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
