"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { NguoiDung } from "./types"
import { apiClient } from "./api-client"

// =================== COOKIE HELPERS ===================
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

// =================== AUTH STORE ===================
interface AuthState {
  user: NguoiDung | null
  token: string | null
  isAuthenticated: boolean
  login: (user: NguoiDung, token: string) => void
  logout: () => void
  updateUser: (user: Partial<NguoiDung>) => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        setCookie("auth_token", token)
        setCookie("user_role", user.vai_tro || "nguoi_dung")
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        deleteCookie("auth_token")
        deleteCookie("user_role")
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    { name: "auth-storage" },
  ),
)

// =================== ROLE HELPERS ===================
export function isAdmin(user: NguoiDung | null): boolean {
  return user?.vai_tro === "quan_tri_vien" || user?.vai_tro === "dieu_hanh_vien"
}

export function isEditor(user: NguoiDung | null): boolean {
  return user?.vai_tro === "bien_tap_vien" || isAdmin(user)
}

// =================== DEMO ACCOUNTS (giữ lại để test admin) ===================
const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@test.com",
    password: "password",
    user: {
      id: "demo-admin-1",
      email: "admin@test.com",
      ho: "Admin",
      ten: "Demo",
      vai_tro: "quan_tri_vien",
      so_dien_thoai: "0123456789",
      dia_chi: "Hà Nội",
      trang_thai: "hoat_dong",
      email_da_xac_thuc: true,
      ngay_tao: new Date().toISOString(),
      ngay_cap_nhat: new Date().toISOString(),
    } as NguoiDung,
  },
}

// =================== AUTH SERVICE ===================
export const authService = {
  // ---- LOGIN ----
  async login(email: string, password: string) {
    try {
      const response: any = await apiClient.post("/api/v1/auth/login", { email, password })

      const user = response?.data?.userInfo
      const token = response?.data?.accessToken

      if (!user || !token) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ")
      }

      useAuthStore.getState().login(user, token)
      return { user, token }
    } catch (error: any) {
      console.warn("API login failed, thử DEMO admin...")

      const demo = DEMO_ACCOUNTS.admin
      if (email === demo.email && password === demo.password) {
        const token = btoa(`${email}:${password}`)
        useAuthStore.getState().login(demo.user, token)
        return { user: demo.user, token }
      }

      throw new Error(error.message || "Đăng nhập thất bại")
    }
  }
  ,

  // ---- REGISTER ----
  async register(data: {
    ho: string
    ten: string
    email: string
    so_dien_thoai: string
    password: string
  }) {
    const response = await apiClient.post("/api/v1/auth/register", {
      email: data.email,
      password: data.password, // ✅
      ten: data.ten,
      ho: data.ho,
      so_dien_thoai: data.so_dien_thoai,
    })
    return response
  },

  // ---- LOGOUT ----
  logout() {
    useAuthStore.getState().logout()
  },

  // ---- HELPERS ----
  getCurrentUser() {
    return useAuthStore.getState().user
  },

  getToken() {
    return useAuthStore.getState().token
  },

  isAuthenticated() {
    return useAuthStore.getState().isAuthenticated
  },
}

export { useAuthStore }
export { useAuthStore as useAuth }
