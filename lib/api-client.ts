import { API_CONFIG, getApiUrl, buildQueryString } from "./api-config"
import type { NguoiDung, DuAn, SuKien, TinTuc, QuyenGop, TinhNguyenVien } from "./types"

export class ApiClient {
  // ==================== CORE REQUEST ====================
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = getApiUrl(endpoint)

    // Debug log
    console.log("🌐 API BASE:", API_CONFIG.BASE_URL)
    console.log("➡️ Fetching URL:", url)

    // Lấy Bearer token (nếu có)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    try {
      console.log("🔑 Token:", token);
      const response = await fetch(url, {
        ...options,
        mode: "cors",              // ✅ Cho phép gọi từ FE khác domain
        credentials: "include",    // ✅ Gửi cookie/session theo allowCredentials(true)
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        cache: "no-store",
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error("❌ API Error:", response.status, errText)
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errText}`)
      }

      if (response.status === 204) return {} as T
      return await response.json()
    } catch (error) {
      console.error("🚨 Fetch failed:", error)
      throw error
    }
  }

  // ==================== BASIC METHODS ====================
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? `?${buildQueryString(params)}` : ""
    return this.request<T>(`${endpoint}${query}`, { method: "GET" })
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // ==================== AUTH ====================
  static async login(email: string, password: string): Promise<any> {
    // 🔥 Endpoint: /api/v1/auth/login
    return this.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, { email, password })
  }

  static async register(data: any): Promise<any> {
    // 🔥 Endpoint: /api/v1/auth/register
    return this.post(API_CONFIG.ENDPOINTS.AUTH_REGISTER, data)
  }

  // ==================== NGƯỜI DÙNG ====================
  static async getNguoiDung(params?: Record<string, any>): Promise<NguoiDung[]> {
    return this.get<NguoiDung[]>(API_CONFIG.ENDPOINTS.NGUOI_DUNG, params)
  }

  static async createNguoiDung(data: Partial<NguoiDung>): Promise<NguoiDung> {
    return this.post<NguoiDung>(API_CONFIG.ENDPOINTS.NGUOI_DUNG, data)
  }

  static async updateNguoiDung(id: number, data: Partial<NguoiDung>): Promise<NguoiDung> {
    return this.put<NguoiDung>(`${API_CONFIG.ENDPOINTS.NGUOI_DUNG}/${id}`, data)
  }

  static async deleteNguoiDung(id: number): Promise<void> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.NGUOI_DUNG}/${id}`)
  }

  // ==================== DỰ ÁN ====================
  static async getDuAn(params?: Record<string, any>): Promise<DuAn[]> {
    return this.get<DuAn[]>(API_CONFIG.ENDPOINTS.DU_AN, params)
  }

  static async createDuAn(data: Partial<DuAn>): Promise<DuAn> {
    return this.post<DuAn>(API_CONFIG.ENDPOINTS.DU_AN, data)
  }

  static async updateDuAn(id: number, data: Partial<DuAn>): Promise<DuAn> {
    return this.put<DuAn>(`${API_CONFIG.ENDPOINTS.DU_AN}/${id}`, data)
  }

  static async deleteDuAn(id: number): Promise<void> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.DU_AN}/${id}`)
  }

  // ==================== SỰ KIỆN ====================
  static async getSuKien(params?: Record<string, any>): Promise<SuKien[]> {
    return this.get<SuKien[]>(API_CONFIG.ENDPOINTS.SU_KIEN, params)
  }

  static async createSuKien(data: Partial<SuKien>): Promise<SuKien> {
    return this.post<SuKien>(API_CONFIG.ENDPOINTS.SU_KIEN, data)
  }

  static async updateSuKien(id: number, data: Partial<SuKien>): Promise<SuKien> {
    return this.put<SuKien>(`${API_CONFIG.ENDPOINTS.SU_KIEN}/${id}`, data)
  }

  static async deleteSuKien(id: number): Promise<void> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.SU_KIEN}/${id}`)
  }

  // ==================== TIN TỨC ====================
  static async getTinTuc(params?: Record<string, any>): Promise<TinTuc[]> {
    return this.get<TinTuc[]>(API_CONFIG.ENDPOINTS.TIN_TUC, params)
  }

  static async createTinTuc(data: Partial<TinTuc>): Promise<TinTuc> {
    return this.post<TinTuc>(API_CONFIG.ENDPOINTS.TIN_TUC, data)
  }

  static async updateTinTuc(id: number, data: Partial<TinTuc>): Promise<TinTuc> {
    return this.put<TinTuc>(`${API_CONFIG.ENDPOINTS.TIN_TUC}/${id}`, data)
  }

  static async deleteTinTuc(id: number): Promise<void> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.TIN_TUC}/${id}`)
  }

  // ==================== QUYÊN GÓP ====================
  static async getQuyenGop(params?: Record<string, any>): Promise<QuyenGop[]> {
    return this.get<QuyenGop[]>(API_CONFIG.ENDPOINTS.QUYEN_GOP, params)
  }

  static async createQuyenGop(data: Partial<QuyenGop>): Promise<QuyenGop> {
    return this.post<QuyenGop>(API_CONFIG.ENDPOINTS.QUYEN_GOP, data)
  }

  static async updateQuyenGop(id: number, data: Partial<QuyenGop>): Promise<QuyenGop> {
    return this.put<QuyenGop>(`${API_CONFIG.ENDPOINTS.QUYEN_GOP}/${id}`, data)
  }

  static async deleteQuyenGop(id: number): Promise<void> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.QUYEN_GOP}/${id}`)
  }

  // ==================== TÌNH NGUYỆN VIÊN ====================
  static async getTinhNguyenVien(params?: Record<string, any>): Promise<TinhNguyenVien[]> {
    return this.get<TinhNguyenVien[]>(API_CONFIG.ENDPOINTS.TINH_NGUYEN_VIEN, params)
  }

  static async createTinhNguyenVien(data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    return this.post<TinhNguyenVien>(API_CONFIG.ENDPOINTS.TINH_NGUYEN_VIEN, data)
  }

  static async updateTinhNguyenVien(id: number, data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    return this.put<TinhNguyenVien>(`${API_CONFIG.ENDPOINTS.TINH_NGUYEN_VIEN}/${id}`, data)
  }

  static async deleteTinhNguyenVien(id: number): Promise<void> {
    return this.delete<void>(`${API_CONFIG.ENDPOINTS.TINH_NGUYEN_VIEN}/${id}`)
  }
}

export const apiClient = ApiClient
