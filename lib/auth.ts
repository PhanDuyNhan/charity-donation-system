"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { NguoiDung } from "./types"
import { apiClient } from "./api-client"
import { API_CONFIG } from "./api-config"

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
        localStorage.setItem("token", token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        deleteCookie("auth_token")
        deleteCookie("user_role")
        localStorage.removeItem("token")
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

// =================== AUTH SERVICE ===================
export const authService = {
  // ---- LOGIN ----
  async login(email: string, password: string) {
    try {
      const response: any = await apiClient.login(email, password)

      // BE có thể trả nhiều dạng khác nhau
      const user =
        response?.user ??
        response?.data?.userInfo ??
        response?.data?.user ??
        response

      const token =
        response?.token ??
        response?.data?.accessToken ??
        response?.accessToken

      if (!user || !token) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ")
      }

      useAuthStore.getState().login(user, token)
      return { user, token }
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại")
    }
  },

  // ---- REGISTER ----
  async register(data: {
    ho: string
    ten: string
    email: string
    so_dien_thoai: string
    password: string  // FE giữ nguyên
  }) {
    try {
      const payload = {
        email: data.email,
        password: data.password,  // ✔ BE yêu cầu password
        ten: data.ten,
        ho: data.ho,
        so_dien_thoai: data.so_dien_thoai,
      }

      return await apiClient.register(payload)
    } catch (error) {
      throw error
    }
  },

  logout() {
    useAuthStore.getState().logout()
  },

  getCurrentUser() {
    return useAuthStore.getState().user
  },
}

export { useAuthStore }
export { useAuthStore as useAuth }
