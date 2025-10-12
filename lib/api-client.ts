import { API_CONFIG,getApiUrl, buildQueryString } from "./api-config"
import type { NguoiDung, DuAn, SuKien, TinTuc, QuyenGop, TinhNguyenVien } from "./types"

// Generic API client với error handling
export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = getApiUrl(endpoint)
 // 👇 Thêm dòng này ngay dưới đây để kiểm tra URL thực tế
  console.log("✅ API BASE:", API_CONFIG.BASE_URL)
  console.log("➡️ Fetching URL:", url)

  // ✅ Thêm Bearer token tự động (nếu có trong localStorage)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {}),
        },
      })

      // ✅ Bắt lỗi HTTP rõ ràng
      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errText}`)
      }

      // ✅ Nếu không có nội dung (204 No Content)
      if (response.status === 204) return {} as T

      return await response.json()
    } catch (error) {
      console.error("❌ API Request failed:", error)
      throw error
    }
  }

  // ==================== BASIC METHODS ====================
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${buildQueryString(params)}` : ""
    return this.request<T>(`${endpoint}${queryString}`, { method: "GET" })
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined })
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined })
  }

  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body: data ? JSON.stringify(data) : undefined })
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // ==================== NGƯỜI DÙNG ====================
  static async getNguoiDung(params?: Record<string, any>): Promise<NguoiDung[]> {
    return this.get<NguoiDung[]>("/api/v1/nguoi_dung", params)
  }

  static async createNguoiDung(data: Partial<NguoiDung>): Promise<NguoiDung> {
    return this.post<NguoiDung>("/api/v1/nguoi_dung", data)
  }

  static async updateNguoiDung(id: number, data: Partial<NguoiDung>): Promise<NguoiDung> {
    return this.patch<NguoiDung>(`/api/v1/nguoi_dung/${id}`, data)
  }

  static async deleteNguoiDung(id: number): Promise<void> {
    return this.delete<void>(`/api/v1/nguoi_dung/${id}`)
  }

  // ==================== DỰ ÁN ====================
  static async getDuAn(params?: Record<string, any>): Promise<DuAn[]> {
    return this.get<DuAn[]>("/api/v1/du_an", params)
  }

  static async createDuAn(data: Partial<DuAn>): Promise<DuAn> {
    return this.post<DuAn>("/api/v1/du_an", data)
  }

  static async updateDuAn(id: number, data: Partial<DuAn>): Promise<DuAn> {
    return this.patch<DuAn>(`/api/v1/du_an/${id}`, data)
  }

  static async deleteDuAn(id: number): Promise<void> {
    return this.delete<void>(`/api/v1/du_an/${id}`)
  }

  // ==================== SỰ KIỆN ====================
  static async getSuKien(params?: Record<string, any>): Promise<SuKien[]> {
    return this.get<SuKien[]>("/api/v1/su_kien", params)
  }

  static async createSuKien(data: Partial<SuKien>): Promise<SuKien> {
    return this.post<SuKien>("/api/v1/su_kien", data)
  }

  static async updateSuKien(id: number, data: Partial<SuKien>): Promise<SuKien> {
    return this.patch<SuKien>(`/api/v1/su_kien/${id}`, data)
  }

  static async deleteSuKien(id: number): Promise<void> {
    return this.delete<void>(`/api/v1/su_kien/${id}`)
  }

  // ==================== TIN TỨC ====================
  static async getTinTuc(params?: Record<string, any>): Promise<TinTuc[]> {
    return this.get<TinTuc[]>("/api/v1/tin_tuc", params)
  }

  static async createTinTuc(data: Partial<TinTuc>): Promise<TinTuc> {
    return this.post<TinTuc>("/api/v1/tin_tuc", data)
  }

  static async updateTinTuc(id: number, data: Partial<TinTuc>): Promise<TinTuc> {
    return this.patch<TinTuc>(`/api/v1/tin_tuc/${id}`, data)
  }

  static async deleteTinTuc(id: number): Promise<void> {
    return this.delete<void>(`/api/v1/tin_tuc/${id}`)
  }

  // ==================== QUYÊN GÓP ====================
  static async getQuyenGop(params?: Record<string, any>): Promise<QuyenGop[]> {
    return this.get<QuyenGop[]>("/api/v1/quyen_gop", params)
  }

  static async createQuyenGop(data: Partial<QuyenGop>): Promise<QuyenGop> {
    return this.post<QuyenGop>("/api/v1/quyen_gop", data)
  }

  static async updateQuyenGop(id: number, data: Partial<QuyenGop>): Promise<QuyenGop> {
    return this.patch<QuyenGop>(`/api/v1/quyen_gop/${id}`, data)
  }

  static async deleteQuyenGop(id: number): Promise<void> {
    return this.delete<void>(`/api/v1/quyen_gop/${id}`)
  }

  // ==================== TÌNH NGUYỆN VIÊN ====================
  static async getTinhNguyenVien(params?: Record<string, any>): Promise<TinhNguyenVien[]> {
    return this.get<TinhNguyenVien[]>("/api/v1/tinh_nguyen_vien", params)
  }

  static async createTinhNguyenVien(data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    return this.post<TinhNguyenVien>("/api/v1/tinh_nguyen_vien", data)
  }

  static async updateTinhNguyenVien(id: number, data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    return this.patch<TinhNguyenVien>(`/api/v1/tinh_nguyen_vien/${id}`, data)
  }

  static async deleteTinhNguyenVien(id: number): Promise<void> {
    return this.delete<void>(`/api/v1/tinh_nguyen_vien/${id}`)
  }
}

export const apiClient = ApiClient
