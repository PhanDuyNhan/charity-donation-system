import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  const userRole = request.cookies.get("user_role")?.value

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/dang-nhap?redirect=/admin", request.url))
    }

    if (userRole !== "quan_tri_vien" && userRole !== "dieu_hanh_vien" && userRole !== "bien_tap_vien") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
