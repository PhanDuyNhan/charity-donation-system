"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, CreditCard } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface DonationFormProps {
  projectId: number
  projectName: string
}

export function DonationForm({ projectId, projectName }: DonationFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [donorPhone, setDonorPhone] = useState("")
  const [message, setMessage] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("chuyen_khoan")

  const presetAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const donationAmount = amount === "custom" ? Number.parseFloat(customAmount) : Number.parseFloat(amount)

      if (!donationAmount || donationAmount <= 0) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập số tiền quyên góp hợp lệ",
          variant: "destructive",
        })
        return
      }

      const donationData = {
        id_du_an: projectId,
        so_tien: donationAmount,
        ten_nguoi_quyen_gop: donorName,
        email: donorEmail,
        so_dien_thoai: donorPhone,
        loi_nhan: message,
        phuong_thuc_thanh_toan: paymentMethod,
        trang_thai: "cho_xac_nhan",
        ngay_quyen_gop: new Date().toISOString(),
      }

      await apiClient.post("/quyen_gop", donationData)

      toast({
        title: "Thành công!",
        description: "Cảm ơn bạn đã quyên góp. Chúng tôi sẽ xác nhận sớm nhất.",
      })

      // Reset form
      setAmount("")
      setCustomAmount("")
      setDonorName("")
      setDonorEmail("")
      setDonorPhone("")
      setMessage("")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-orange-200">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-6 h-6 text-orange-500" />
          <CardTitle>Quyên góp cho dự án</CardTitle>
        </div>
        <CardDescription>{projectName}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Selection */}
          <div className="space-y-3">
            <Label>Chọn số tiền quyên góp</Label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? "default" : "outline"}
                  className={amount === preset.toString() ? "bg-orange-500 hover:bg-orange-600" : ""}
                  onClick={() => {
                    setAmount(preset.toString())
                    setCustomAmount("")
                  }}
                >
                  {(preset / 1000).toLocaleString()}K
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant={amount === "custom" ? "default" : "outline"}
              className={`w-full ${amount === "custom" ? "bg-orange-500 hover:bg-orange-600" : ""}`}
              onClick={() => setAmount("custom")}
            >
              Số tiền khác
            </Button>
            {amount === "custom" && (
              <Input
                type="number"
                placeholder="Nhập số tiền (VNĐ)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1000"
              />
            )}
          </div>

          {/* Donor Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="donorName">Họ và tên *</Label>
              <Input
                id="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                required
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <Label htmlFor="donorEmail">Email *</Label>
              <Input
                id="donorEmail"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                required
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="donorPhone">Số điện thoại</Label>
              <Input
                id="donorPhone"
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="0123456789"
              />
            </div>
            <div>
              <Label htmlFor="message">Lời nhắn</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Gửi lời động viên của bạn..."
                rows={3}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Phương thức thanh toán</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chuyen_khoan" id="bank" />
                <Label htmlFor="bank" className="cursor-pointer">
                  Chuyển khoản ngân hàng
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tien_mat" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer">
                  Tiền mặt
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="the" id="card" />
                <Label htmlFor="card" className="cursor-pointer">
                  Thẻ tín dụng/ghi nợ
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" size="lg" disabled={loading}>
            <CreditCard className="w-4 h-4 mr-2" />
            {loading ? "Đang xử lý..." : "Quyên góp ngay"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
