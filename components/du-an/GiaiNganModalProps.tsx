import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Plus, Minus, Trash2 } from "lucide-react"

interface ChiTietGiaiNgan {
  mo_ta: string
  so_tien: string
}

interface GiaiNganModalProps {
  isOpen: boolean
  onClose: () => void
  duAnId: number
  duAnTitle: string
  onSubmit: (data: any) => Promise<any>
  onSubmitChiTiet: (data: any) => Promise<any>

}

export default function GiaiNganModal({ isOpen, onClose, duAnId, duAnTitle, onSubmit, onSubmitChiTiet }: GiaiNganModalProps) {
  const [loading, setLoading] = useState(false)

  // Form state
  const [loaiGiaiNgan, setLoaiGiaiNgan] = useState("chuyen_khoan")
  const [nguoiNhan, setNguoiNhan] = useState("")

  // Thông tin người nhận
  const [mst, setMst] = useState("")
  const [diaChi, setDiaChi] = useState("")
  const [soDienThoai, setSoDienThoai] = useState("")

  const [mucDichSuDung, setMucDichSuDung] = useState("")
  const [ghiChu, setGhiChu] = useState("")

  // Chi tiết giải ngân
  const [chiTietGiaiNgan, setChiTietGiaiNgan] = useState<ChiTietGiaiNgan[]>([
    { mo_ta: "", so_tien: "" }
  ])

  // Tính tổng tiền tự động
  const tongTien = chiTietGiaiNgan.reduce((total, item) => {
    const tien = Number(item.so_tien) || 0
    return total + tien
  }, 0)

  const resetForm = () => {
    setLoaiGiaiNgan("chuyen_khoan")
    setNguoiNhan("")
    setMst("")
    setDiaChi("")
    setSoDienThoai("")
    setMucDichSuDung("")
    setGhiChu("")
    setChiTietGiaiNgan([{ mo_ta: "", so_tien: "" }])
  }

  const handleAddChiTiet = () => {
    setChiTietGiaiNgan([...chiTietGiaiNgan, { mo_ta: "", so_tien: "" }])
  }

  const handleRemoveChiTiet = (index: number) => {
    if (chiTietGiaiNgan.length > 1) {
      const newChiTiet = chiTietGiaiNgan.filter((_, i) => i !== index)
      setChiTietGiaiNgan(newChiTiet)
    }
  }

  const handleChiTietChange = (index: number, field: keyof ChiTietGiaiNgan, value: string) => {
    const newChiTiet = [...chiTietGiaiNgan]
    newChiTiet[index][field] = value
    setChiTietGiaiNgan(newChiTiet)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!nguoiNhan || chiTietGiaiNgan.length === 0) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc")
      return
    }

    // Validate chi tiết giải ngân
    const hasEmptyChiTiet = chiTietGiaiNgan.some(item => !item.mo_ta || !item.so_tien)
    if (hasEmptyChiTiet) {
      alert("Vui lòng điền đầy đủ mô tả và số tiền cho tất cả chi tiết giải ngân")
      return
    }

    const authStorage = localStorage.getItem('auth-storage')
    const userId = authStorage ? JSON.parse(authStorage).state.user.id : null
    const currentDateTime = new Date()
    const ngayGiaiNgan = currentDateTime.toISOString()

    const data = {
      ma_du_an: duAnId,
      so_tien: tongTien,
      loai_giai_ngan: loaiGiaiNgan,
      ngay_giai_ngan: ngayGiaiNgan,
      nguoi_nhan: nguoiNhan,
      thong_tin_nguoi_nhan: {
        mst: mst,
        dia_chi: diaChi,
        so_dien_thoai: soDienThoai,
      },
      muc_dich_su_dung: mucDichSuDung,
      nguoi_giai_ngan: Number(userId),
      ghi_chu: ghiChu,
    }

    setLoading(true)
    try {
      const result = await onSubmit(data)
      console.log("ressultttt", result)
      console.log("chi_tieti_giait)ngan", chiTietGiaiNgan)
      // Sau khi lưu giải ngân thành công, chuẩn bị chi tiết giải ngân
      if (result && result?.length > 0) {
        const chiTietData = chiTietGiaiNgan.map(item => ({
          ma_giai_ngan: result[0]?.id,
          mo_ta: item.mo_ta,
          so_tien: Number(item.so_tien)
        }))

        // Log chi tiết để xử lý tiếp (hoặc gọi API riêng)
        console.log("Chi tiết giải ngân:", chiTietData)
        await onSubmitChiTiet(chiTietData) // Uncomment khi có API
      }

      resetForm()
      onClose()
    } catch (err) {
      console.error("Lỗi khi giải ngân:", err)
      alert("Có lỗi xảy ra khi giải ngân. Vui lòng thử lại!")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f1724] border border-neutral-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Giải ngân dự án</DialogTitle>
          <DialogDescription className="text-neutral-400">
            {duAnTitle} (ID: {duAnId})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-neutral-700 pb-2">Thông tin giải ngân</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loai_giai_ngan" className="text-neutral-200">
                  Loại giải ngân <span className="text-red-400">*</span>
                </Label>
                <Select value={loaiGiaiNgan} onValueChange={setLoaiGiaiNgan}>
                  <SelectTrigger className="bg-[#111827] border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chuyen_khoan">Chuyển khoản</SelectItem>
                    <SelectItem value="tien_mat">Tiền mặt</SelectItem>
                    <SelectItem value="sec">Séc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-200">
                  Tổng số tiền (VNĐ)
                </Label>
                <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-md px-4 py-2.5 text-white font-bold text-lg">
                  {tongTien.toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết giải ngân */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
              <h3 className="text-lg font-semibold">Chi tiết giải ngân</h3>
              <Button
                type="button"
                onClick={handleAddChiTiet}
                className="bg-green-600 hover:bg-green-700 gap-1"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                Thêm chi tiết
              </Button>
            </div>

            <div className="space-y-3">
              {chiTietGiaiNgan.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-[#111827] border border-neutral-700 rounded-lg hover:border-neutral-600 transition-colors">
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-700 flex items-center justify-center text-sm font-semibold text-blue-300">
                      {index + 1}
                    </div>
                  </div>

                  <div className="col-span-6 space-y-1">
                    <Label className="text-xs text-neutral-400">
                      Mô tả <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={item.mo_ta}
                      onChange={(e) => handleChiTietChange(index, "mo_ta", e.target.value)}
                      className="bg-[#1f2937] border-neutral-600 text-white focus:border-blue-500"
                      placeholder="VD: Mua vật tư, Chi lương, Thuê thiết bị..."
                      required
                    />
                  </div>

                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs text-neutral-400">
                      Số tiền (VNĐ) <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={item.so_tien}
                      onChange={(e) => handleChiTietChange(index, "so_tien", e.target.value)}
                      className="bg-[#1f2937] border-neutral-600 text-white focus:border-blue-500"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>

                  <div className="col-span-1 flex items-end justify-center pb-1">
                    <Button
                      type="button"
                      onClick={() => handleRemoveChiTiet(index)}
                      disabled={chiTietGiaiNgan.length === 1}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed h-8 w-8 p-0"
                      title={chiTietGiaiNgan.length === 1 ? "Phải có ít nhất 1 chi tiết" : "Xóa chi tiết"}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {chiTietGiaiNgan.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                Chưa có chi tiết giải ngân. Nhấn "Thêm chi tiết" để bắt đầu.
              </div>
            )}
          </div>

          {/* Thông tin người nhận */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-neutral-700 pb-2">Thông tin người nhận</h3>


            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nguoi_nhan" className="text-neutral-200">
                  Tên người nhận <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="nguoi_nhan"
                  value={nguoiNhan}
                  onChange={(e) => setNguoiNhan(e.target.value)}
                  className="bg-[#111827] border-neutral-700 text-white"
                  placeholder="Nhập tên người nhận"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="so_dien_thoai" className="text-neutral-200">
                  Số điện thoại
                </Label>
                <Input
                  id="so_dien_thoai"
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  className="bg-[#111827] border-neutral-700 text-white"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dia_chi" className="text-neutral-200">
                Địa chỉ
              </Label>
              <Input
                id="dia_chi"
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
                className="bg-[#111827] border-neutral-700 text-white"
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          {/* Thông tin khác */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b border-neutral-700 pb-2">Thông tin bổ sung</h3>

            <div className="space-y-2">
              <Label htmlFor="muc_dich" className="text-neutral-200">
                Mục đích sử dụng
              </Label>
              <Input
                id="muc_dich"
                value={mucDichSuDung}
                onChange={(e) => setMucDichSuDung(e.target.value)}
                className="bg-[#111827] border-neutral-700 text-white"
                placeholder="VD: Tình nguyện, hỗ trợ cộng đồng..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ghi_chu" className="text-neutral-200">
                Ghi chú
              </Label>
              <Textarea
                id="ghi_chu"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                className="bg-[#111827] border-neutral-700 text-white min-h-[80px]"
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-neutral-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-neutral-700 text-neutral-200 hover:bg-[#1f2937]"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? "Đang xử lý..." : "Xác nhận giải ngân"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}