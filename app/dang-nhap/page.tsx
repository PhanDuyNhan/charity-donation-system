"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail, Lock, AlertCircle } from "lucide-react"
import { isAdmin, authService } from "@/lib/auth"

export default function DangNhapPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { user } = await authService.login(email, password)

      // Redirect based on role
      if (isAdmin(user)) {
        router.push("/admin")
      } else {
        router.push("/")
      }
    } catch (err: any) {
      setError(err.message || "Email hoặc mật khẩu không đúng. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-(--color-background-tertiary) to-(--color-background-secondary) flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-10 w-10 text-(--color-primary) fill-(--color-primary)" />
            <span className="text-2xl font-bold text-(--color-foreground)">Từ Thiện Việt</span>
          </Link>
          <p className="text-(--color-foreground-secondary)">Đăng nhập để tiếp tục</p>
        </div>

        <Card className="border-(--color-border) shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Đăng Nhập</CardTitle>
            <CardDescription>Nhập thông tin tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-(--color-foreground-tertiary)" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-(--color-foreground-tertiary)" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-(--color-border)" />
                  <span className="text-(--color-foreground-secondary)">Ghi nhớ đăng nhập</span>
                </label>
                <Link href="/quen-mat-khau" className="text-(--color-primary) hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover)"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </Button>

              <div className="text-center text-sm text-(--color-foreground-secondary)">
                Chưa có tài khoản?{" "}
                <Link href="/dang-ky" className="text-(--color-primary) hover:underline font-semibold">
                  Đăng ký ngay
                </Link>
              </div>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">Demo Credentials:</p>
              <p className="text-xs text-blue-700">Admin: admin@test.com / password</p>
              <p className="text-xs text-blue-700">User: user@test.com / password</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-(--color-foreground-secondary) hover:text-(--color-primary)">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
