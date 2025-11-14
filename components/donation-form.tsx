"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, CreditCard, Wallet } from "lucide-react"

interface DonationFormProps {
  projectId: number
  projectName: string
}

export function DonationForm({ projectId, projectName }: DonationFormProps) {
  const [amount, setAmount] = useState("")
  const [donationType, setDonationType] = useState("one-time")
  const [paymentMethod, setPaymentMethod] = useState("vnpay")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const presetAmounts = [50000, 100000, 500000, 1000000]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      console.log("Donation submitted:", {
        projectId,
        projectName,
        amount,
        donationType,
        paymentMethod,
      })
      // TODO: Implement payment gateway integration (VNPay, MoMo)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="bg-accent/10 pb-4">
        <CardTitle className="text-lg text-foreground flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" />
          Quyên góp cho dự án
        </CardTitle>
        <CardDescription>Hỗ trợ {projectName}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Chọn số tiền</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    amount === preset.toString()
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {(preset / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Số tiền khác (VNĐ)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền tùy chọn"
              min="10000"
              step="10000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phương thức thanh toán</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vnpay">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    VNPay (Thẻ ngân hàng)
                  </div>
                </SelectItem>
                <SelectItem value="momo">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    MoMo (Ví điện tử)
                  </div>
                </SelectItem>
                <SelectItem value="bank-transfer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Chuyển khoản ngân hàng
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !amount}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-10"
          >
            {isSubmitting
              ? "Đang xử lý..."
              : `Quyên góp ${amount ? `${Number.parseInt(amount).toLocaleString("vi-VN")} đ` : ""}`}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Thông tin giao dịch của bạn được bảo mật và mã hóa
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
