"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, Users, Calendar, Award, CheckCircle2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function TinhNguyenVienPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    ngay_sinh: "",
    gioi_tinh: "",
    dia_chi: "",
    nghe_nghiep: "",
    kinh_nghiem: "",
    ky_nang: "",
    thoi_gian_ranh: "",
    ly_do_tham_gia: "",
    dong_y_dieu_khoan: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.dong_y_dieu_khoan) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đồng ý với điều khoản",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await apiClient.post("/tinh_nguyen_vien", {
        ...formData,
        trang_thai: "Chờ duyệt",
        ngay_dang_ky: new Date().toISOString(),
      })

      toast({
        title: "Đăng ký thành công!",
        description: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      })

      // Reset form
      setFormData({
        ho_ten: "",
        email: "",
        so_dien_thoai: "",
        ngay_sinh: "",
        gioi_tinh: "",
        dia_chi: "",
        nghe_nghiep: "",
        kinh_nghiem: "",
        ky_nang: "",
        thoi_gian_ranh: "",
        ly_do_tham_gia: "",
        dong_y_dieu_khoan: false,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng ký. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Trở Thành Tình Nguyện Viên</h1>
            <p className="text-xl text-white/90">
              Hãy cùng chúng tôi lan tỏa yêu thương và tạo nên những thay đổi tích cực cho cộng đồng
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Lợi Ích Khi Tham Gia</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Kết Nối</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gặp gỡ những người có cùng chí hướng và mở rộng mạng lưới quan hệ
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Phát Triển</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Học hỏi kỹ năng mới và phát triển bản thân qua các hoạt động</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Ý Nghĩa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Đóng góp cho cộng đồng và tạo ra những thay đổi tích cực</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Linh Hoạt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Lựa chọn thời gian và hoạt động phù hợp với lịch trình của bạn</p>
              </CardContent>
            </Card>
          </div>

          {/* Registration Form */}
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Đăng Ký Tình Nguyện Viên</CardTitle>
                <CardDescription>Vui lòng điền đầy đủ thông tin để chúng tôi có thể liên hệ với bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ho_ten">Họ và tên *</Label>
                      <Input
                        id="ho_ten"
                        required
                        value={formData.ho_ten}
                        onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="so_dien_thoai">Số điện thoại *</Label>
                      <Input
                        id="so_dien_thoai"
                        required
                        value={formData.so_dien_thoai}
                        onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ngay_sinh">Ngày sinh *</Label>
                      <Input
                        id="ngay_sinh"
                        type="date"
                        required
                        value={formData.ngay_sinh}
                        onChange={(e) => setFormData({ ...formData, ngay_sinh: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gioi_tinh">Giới tính *</Label>
                      <Select
                        value={formData.gioi_tinh}
                        onValueChange={(value) => setFormData({ ...formData, gioi_tinh: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nam">Nam</SelectItem>
                          <SelectItem value="Nữ">Nữ</SelectItem>
                          <SelectItem value="Khác">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nghe_nghiep">Nghề nghiệp</Label>
                      <Input
                        id="nghe_nghiep"
                        value={formData.nghe_nghiep}
                        onChange={(e) => setFormData({ ...formData, nghe_nghiep: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dia_chi">Địa chỉ *</Label>
                    <Input
                      id="dia_chi"
                      required
                      value={formData.dia_chi}
                      onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ky_nang">Kỹ năng</Label>
                    <Textarea
                      id="ky_nang"
                      placeholder="Ví dụ: Tổ chức sự kiện, thiết kế đồ họa, viết bài..."
                      value={formData.ky_nang}
                      onChange={(e) => setFormData({ ...formData, ky_nang: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kinh_nghiem">Kinh nghiệm tình nguyện</Label>
                    <Textarea
                      id="kinh_nghiem"
                      placeholder="Mô tả các hoạt động tình nguyện bạn đã tham gia (nếu có)"
                      value={formData.kinh_nghiem}
                      onChange={(e) => setFormData({ ...formData, kinh_nghiem: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thoi_gian_ranh">Thời gian rảnh</Label>
                    <Textarea
                      id="thoi_gian_ranh"
                      placeholder="Ví dụ: Thứ 7, Chủ nhật, buổi tối các ngày trong tuần..."
                      value={formData.thoi_gian_ranh}
                      onChange={(e) => setFormData({ ...formData, thoi_gian_ranh: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ly_do_tham_gia">Lý do muốn tham gia *</Label>
                    <Textarea
                      id="ly_do_tham_gia"
                      required
                      placeholder="Chia sẻ lý do bạn muốn trở thành tình nguyện viên..."
                      value={formData.ly_do_tham_gia}
                      onChange={(e) => setFormData({ ...formData, ly_do_tham_gia: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dong_y_dieu_khoan"
                      checked={formData.dong_y_dieu_khoan}
                      onCheckedChange={(checked) => setFormData({ ...formData, dong_y_dieu_khoan: checked as boolean })}
                    />
                    <Label htmlFor="dong_y_dieu_khoan" className="text-sm">
                      Tôi đồng ý với các điều khoản và cam kết tham gia các hoạt động tình nguyện
                    </Label>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      "Đang xử lý..."
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Đăng Ký Ngay
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
