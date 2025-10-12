import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// ✅ import Navbar (client component)
import Navbar from "@/components/Navbar"

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Hệ Thống Quyên Góp Từ Thiện",
  description: "Nền tảng quyên góp từ thiện minh bạch và hiệu quả",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="antialiased">
        {/* ✅ Navbar luôn hiển thị trên mọi trang */}
        <Navbar />

        {/* Nội dung trang */}
        <main>{children}</main>
      </body>
    </html>
  )
}
