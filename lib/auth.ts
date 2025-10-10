"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { NguoiDung } from "./types"
import { apiClient } from "./api-client"

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

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
    {
      name: "auth-storage",
    },
  ),
)

// Helper function để check quyền admin
export function isAdmin(user: NguoiDung | null): boolean {
  return user?.vai_tro === "quan_tri_vien" || user?.vai_tro === "dieu_hanh_vien"
}

// Helper function để check quyền biên tập
export function isEditor(user: NguoiDung | null): boolean {
  return user?.vai_tro === "bien_tap_vien" || isAdmin(user)
}

const DEMO_ACCOUNTS = {
  admin: {
    email: "admin@test.com",
    password: "password",
    user: {
      id: "demo-admin-1",
      email: "admin@test.com",
      mat_khau_hash: btoa("password"),
      ho: "Admin",
      ten: "Demo",
      so_dien_thoai: "0123456789",
      dia_chi: "Hà Nội",
      ngay_sinh: "1990-01-01",
      vai_tro: "quan_tri_vien",
      trang_thai: "hoat_dong",
      email_da_xac_thuc: true,
      thoi_gian_xac_thuc_email: new Date().toISOString(),
      token_ghi_nho: null,
      ngay_tao: new Date().toISOString(),
      ngay_cap_nhat: new Date().toISOString(),
    } as NguoiDung,
  },
  user: {
    email: "user@test.com",
    password: "password",
    user: {
      id: "demo-user-1",
      email: "user@test.com",
      mat_khau_hash: btoa("password"),
      ho: "User",
      ten: "Demo",
      so_dien_thoai: "0987654321",
      dia_chi: "TP. Hồ Chí Minh",
      ngay_sinh: "1995-05-15",
      vai_tro: "nguoi_dung",
      trang_thai: "hoat_dong",
      email_da_xac_thuc: true,
      thoi_gian_xac_thuc_email: new Date().toISOString(),
      token_ghi_nho: null,
      ngay_tao: new Date().toISOString(),
      ngay_cap_nhat: new Date().toISOString(),
    } as NguoiDung,
  },
}

export const authService = {
  async login(email: string, mat_khau: string) {
    try {
      const demoAccount = Object.values(DEMO_ACCOUNTS).find(
        (account) => account.email === email && account.password === mat_khau,
      )

      if (demoAccount) {
        const token = btoa(`${email}:${mat_khau}`)
        useAuthStore.getState().login(demoAccount.user, token)
        return { user: demoAccount.user, token }
      }

      // Note: In production, password verification should be done server-side
      const users = await apiClient.get<NguoiDung[]>("/nguoi_dung", {
        email: `eq.${email}`,
      })

      if (users && users.length > 0) {
        const user = users[0]

        // For now, we'll assume the API handles authentication
        // You should implement proper password hashing on the backend
        const token = btoa(`${email}:${mat_khau}`) // Simple token encoding

        // Lưu vào store
        useAuthStore.getState().login(user, token)

        return { user, token }
      } else {
        throw new Error("Email hoặc mật khẩu không đúng")
      }
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại")
    }
  },

  async register(data: {
    ho: string
    ten: string
    email: string
    so_dien_thoai: string
    mat_khau: string
  }) {
    try {
      const mat_khau_hash = btoa(data.mat_khau) // Simple encoding, use bcrypt in production

      const newUser = await apiClient.post<NguoiDung>("/nguoi_dung", {
        ho: data.ho,
        ten: data.ten,
        email: data.email,
        so_dien_thoai: data.so_dien_thoai,
        mat_khau_hash: mat_khau_hash,
        vai_tro: "nguoi_dung",
        trang_thai: "hoat_dong",
        email_da_xac_thuc: false,
        ngay_tao: new Date().toISOString(),
        ngay_cap_nhat: new Date().toISOString(),
      })

      return newUser
    } catch (error: any) {
      throw new Error(error.message || "Đăng ký thất bại")
    }
  },

  logout() {
    useAuthStore.getState().logout()
  },

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
