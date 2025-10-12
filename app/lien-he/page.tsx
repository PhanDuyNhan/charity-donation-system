"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/Navbar"
export default function LienHePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
    chu_de: "",
    noi_dung: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Gửi thành công!",
        description: "Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.",
      })
      setFormData({
        ho_ten: "",
        email: "",
        so_dien_thoai: "",
        chu_de: "",
        noi_dung: "",
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Liên Hệ Với Chúng Tôi</h1>
            <p className="text-xl text-white/90">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">contact@charity.org</p>
                <p className="text-muted-foreground">support@charity.org</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Điện thoại</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">+84 123 456 789</p>
                <p className="text-muted-foreground">+84 987 654 321</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Địa chỉ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  123 Đường ABC, Quận 1<br />
                  TP. Hồ Chí Minh, Việt Nam
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Gửi Tin Nhắn</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="so_dien_thoai">Số điện thoại</Label>
                    <Input
                      id="so_dien_thoai"
                      value={formData.so_dien_thoai}
                      onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chu_de">Chủ đề *</Label>
                    <Input
                      id="chu_de"
                      required
                      value={formData.chu_de}
                      onChange={(e) => setFormData({ ...formData, chu_de: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noi_dung">Nội dung *</Label>
                    <Textarea
                      id="noi_dung"
                      required
                      rows={6}
                      value={formData.noi_dung}
                      onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      "Đang gửi..."
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Gửi Tin Nhắn
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
