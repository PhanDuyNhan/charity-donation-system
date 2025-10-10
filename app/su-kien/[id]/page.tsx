import { notFound } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Heart } from "lucide-react"

async function getEventDetail(id: string) {
  try {
    const data = await apiClient.get(`/su_kien?id=eq.${id}`)
    return data[0] || null
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventDetail(params.id)

  if (!event) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      sap_dien_ra: { variant: "default", label: "Sắp diễn ra" },
      dang_dien_ra: { variant: "default", label: "Đang diễn ra" },
      da_ket_thuc: { variant: "secondary", label: "Đã kết thúc" },
      da_huy: { variant: "destructive", label: "Đã hủy" },
    }
    return variants[status] || { variant: "default", label: status }
  }

  const statusInfo = getStatusBadge(event.trang_thai)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {event.loai_su_kien && <Badge variant="outline">{event.loai_su_kien}</Badge>}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.ten_su_kien}</h1>
          <p className="text-xl text-gray-600">{event.mo_ta_ngan}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.hinh_anh && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={event.hinh_anh || "/placeholder.svg"}
                  alt={event.ten_su_kien}
                  className="w-full h-[400px] object-cover"
                />
              </div>
            )}

            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-medium">Thời gian</p>
                    <p className="text-gray-600">Bắt đầu: {new Date(event.ngay_bat_dau).toLocaleDateString("vi-VN")}</p>
                    {event.ngay_ket_thuc && (
                      <p className="text-gray-600">
                        Kết thúc: {new Date(event.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                </div>

                {event.dia_diem && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="font-medium">Địa điểm</p>
                      <p className="text-gray-600">{event.dia_diem}</p>
                    </div>
                  </div>
                )}

                {event.so_luong_tham_gia && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-orange-500 mt-1" />
                    <div>
                      <p className="font-medium">Số lượng tham gia</p>
                      <p className="text-gray-600">
                        {event.so_luong_tham_gia_thuc_te || 0} / {event.so_luong_tham_gia} người
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả sự kiện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-gray-700">{event.mo_ta_chi_tiet || event.mo_ta_ngan}</div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <Heart className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Tham gia sự kiện</h3>
                  <p className="text-gray-600">Hãy cùng chúng tôi tạo nên sự khác biệt</p>
                </div>
                <Button className="w-full bg-orange-500 hover:bg-orange-600" size="lg">
                  Đăng ký tham gia
                </Button>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            {event.nguoi_to_chuc && (
              <Card>
                <CardHeader>
                  <CardTitle>Người tổ chức</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{event.nguoi_to_chuc}</p>
                </CardContent>
              </Card>
            )}

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle>Chia sẻ sự kiện</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Chia sẻ sự kiện này để nhiều người biết đến</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
