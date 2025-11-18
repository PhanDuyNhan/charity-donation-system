// lib/api-client.ts
import { API_CONFIG, getApiUrl, buildQueryString } from "./api-config"
import type {
  NguoiDung,
  DuAn,
  SuKien,
  TinTuc,
  QuyenGop,
  TinhNguyenVien,
  DanhMucDuAn,
  UploadResponse,
  GiaiNgan,
} from "./types"

/**
 * ApiClient - wrapper nhỏ cho fetch với:
 * - xử lý Authorization (localStorage token)
 * - xử lý lỗi 401 (xoá token + redirect login)
 * - helper GET/POST/PUT/PATCH/DELETE
 * - helper uploadFile và getDanhMucDuAn
 *
 * Lưu ý: nếu API_CONFIG.ENDPOINTS không khai báo tất cả keys,
 * hàm getEndpoint sẽ fallback về chuỗi mặc định.
 */

function getEndpoint(key: string, fallback: string) {
  // cast sang any để tránh lỗi TS nếu ENDPOINTS không có key
  const endpoints = (API_CONFIG as any)?.ENDPOINTS ?? {}
  return endpoints[key] ?? fallback
}

export class ApiClient {
  // ==================== CORE REQUEST ====================
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isPublic: boolean = false,
  ): Promise<T> {
    const url = getApiUrl(endpoint)

    // debug
    if (typeof window !== "undefined") {
      console.log("🌐 API BASE:", (API_CONFIG as any)?.BASE_URL ?? API_CONFIG.BASE_URL)
    }
    console.log("➡️ Fetching URL:", url)

    // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const token =
      !isPublic && typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null
    console.log("tokennnnnnnnnnnnnnnnnnnn", token)
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    try {
      console.log("🔑 Token:", token)
      const response = await fetch(url, {
        ...options,
        mode: "cors",
        credentials: "include",
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        cache: "no-store",
      })

      // 401 -> clear token and redirect to login
      if (response.status === 401) {
        let errText = ""
        try {
          errText = await response.text()
        } catch {
          errText = ""
        }
        console.error("❌ API Error:", response.status, errText)

        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token")
            localStorage.removeItem("refresh_token")
          }
        } catch { }

        if (typeof window !== "undefined") {
          if (!window.location.pathname.startsWith("/login")) {
            // add a query flag so UI can show expired message
            window.location.href = "/login?expired=1"
          }
        }

        throw new Error(`API Error: 401 Unauthorized - ${errText}`)
      }

      if (!response.ok) {
        const errText = await response.text()
        console.error("❌ API Error:", response.status, errText)
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errText}`)
      }

      if (response.status === 204) return {} as T
      return (await response.json()) as T
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


  // =================== PUBLIC METHODS (NO AUTH) ====================
  static async getPublic<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? `?${buildQueryString(params)}` : ""
    return this.request<T>(`${endpoint}${query}`, { method: "GET" }, true)
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
  // NOTE: many backends expect { email, mat_khau } for login/register
  static async login(email: string, password: string): Promise<any> {
    const ep = getEndpoint("AUTH_LOGIN", "auth/login")
    return this.post(ep, { email, password })  // ✔ gửi password đúng chuẩn BE
  }

  static async register(data: any): Promise<any> {
    const ep = getEndpoint("AUTH_REGISTER", "auth/register")
    return this.post(ep, data)
  }

  // ==================== NGƯỜI DÙNG ====================
  static async getNguoiDung(params?: Record<string, any>): Promise<NguoiDung[]> {
    const ep = getEndpoint("NGUOI_DUNG", "nguoi_dung")
    return this.get<NguoiDung[]>(ep, params)
  }

  // CREATE should be POST (not PATCH) — sửa để tạo user đúng REST
  static async createNguoiDung(data: Partial<NguoiDung>): Promise<NguoiDung> {
    const ep = getEndpoint("NGUOI_DUNG", "nguoi_dung")
    return this.post<NguoiDung>(ep, data)
  }

  static async updateNguoiDung(id: number, data: Partial<NguoiDung>): Promise<NguoiDung> {
    const ep = getEndpoint("NGUOI_DUNG", "nguoi_dung")
    console.log("🧩 Updating user:", `${ep}?id=eq.${id}`, data)
    return this.patch<NguoiDung>(`${ep}?id=eq.${id}`, data)
  }

  static async deleteNguoiDung(id: number): Promise<void> {
    const ep = getEndpoint("NGUOI_DUNG", "nguoi_dung")
    return this.delete<void>(`${ep}?id=eq.${id}`)
  }


  // ==================== DỰ ÁN ====================
  static async getDuAn(params?: Record<string, any>): Promise<DuAn[]> {
    const ep = getEndpoint("DU_AN", "du_an")
    // return this.get<DuAn[]>(ep, params)
    return this.getPublic<DuAn[]>(ep, params)

  }

  static async createDuAn(data: Partial<DuAn>): Promise<DuAn> {
    const ep = getEndpoint("DU_AN", "du_an")
    return this.post<DuAn>(ep, data)
  }

  static async updateDuAn(id: number, data: Partial<DuAn>): Promise<DuAn> {
    const ep = getEndpoint("DU_AN", "du_an")
    return this.put<DuAn>(`${ep}/${id}`, data)
  }

  static async deleteDuAn(id: number): Promise<void> {
    const ep = getEndpoint("DU_AN", "du_an")
    return this.delete<void>(`${ep}/${id}`)
  }


  // ==================== DANH MỤC DỰ ÁN ====================
  static async getDanhMucDuAn(params?: Record<string, any>): Promise<DanhMucDuAn[]> {
    const ep = getEndpoint("DANH_MUC_DU_AN", "danh_muc_du_an")
    // return this.get<DanhMucDuAn[]>(ep, params)
    return this.getPublic<DanhMucDuAn[]>(ep, params)

  }

  // ==================== FILE UPLOAD ====================
  // upload multipart/form-data; backend should return JSON like { path: "/images/.."} or { url: "..." }
  static async uploadFile(file: File): Promise<UploadResponse> {
    const ep = getEndpoint("UPLOAD", "upload")
    const url = getApiUrl(ep)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const fd = new FormData()
    fd.append("file", file)

    const resp = await fetch(url, {
      method: "POST",
      body: fd,
      mode: "cors",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    if (!resp.ok) {
      const errText = await resp.text()
      console.error("❌ Upload failed:", resp.status, errText)
      throw new Error(`Upload failed: ${resp.status} ${resp.statusText} - ${errText}`)
    }

    return (await resp.json()) as UploadResponse
  }

  // ==================== SỰ KIỆN ====================
  static async getSuKien(params?: Record<string, any>): Promise<SuKien[]> {
    const ep = getEndpoint("SU_KIEN", "su_kien")
    return this.get<SuKien[]>(ep, params)
  }

  static async createSuKien(data: Partial<SuKien>): Promise<SuKien> {
    const ep = getEndpoint("SU_KIEN", "su_kien")
    return this.post<SuKien>(ep, data)
  }

  static async updateSuKien(id: number, data: Partial<SuKien>): Promise<SuKien> {
    const ep = getEndpoint("SU_KIEN", "su_kien")
    return this.put<SuKien>(`${ep}/${id}`, data)
  }

  static async deleteSuKien(id: number): Promise<void> {
    const ep = getEndpoint("SU_KIEN", "su_kien")
    return this.delete<void>(`${ep}/${id}`)
  }

  // ==================== TIN TỨC ====================
  static async getTinTuc(params?: Record<string, any>): Promise<TinTuc[]> {
    const ep = getEndpoint("TIN_TUC", "tin_tuc")
    return this.get<TinTuc[]>(ep, params)
  }

  static async createTinTuc(data: Partial<TinTuc>): Promise<TinTuc> {
    const ep = getEndpoint("TIN_TUC", "tin_tuc")
    return this.post<TinTuc>(ep, data)
  }

  static async updateTinTuc(id: number, data: Partial<TinTuc>): Promise<TinTuc> {
    const ep = getEndpoint("TIN_TUC", "tin_tuc")
    return this.put<TinTuc>(`${ep}/${id}`, data)
  }

  static async deleteTinTuc(id: number): Promise<void> {
    const ep = getEndpoint("TIN_TUC", "tin_tuc")
    return this.delete<void>(`${ep}/${id}`)
  }

  // ==================== QUYÊN GÓP ====================
  static async getQuyenGop(params?: Record<string, any>): Promise<QuyenGop[]> {
    const ep = getEndpoint("QUYEN_GOP", "quyen_gop")
    // return this.get<QuyenGop[]>(ep, params)
    return this.getPublic<QuyenGop[]>(ep, params)

  }

  static async createQuyenGop(data: Partial<QuyenGop>): Promise<QuyenGop> {
    const ep = getEndpoint("QUYEN_GOP", "quyen_gop")
    return this.post<QuyenGop>(ep, data)
  }

  static async updateQuyenGop(id: number, data: Partial<QuyenGop>): Promise<QuyenGop> {
    const ep = getEndpoint("QUYEN_GOP", "quyen_gop")
    return this.put<QuyenGop>(`${ep}/${id}`, data)
  }

  static async deleteQuyenGop(id: number): Promise<void> {
    const ep = getEndpoint("QUYEN_GOP", "quyen_gop")
    return this.delete<void>(`${ep}/${id}`)
  }

  // ==================== TÌNH NGUYỆN VIÊN ====================
  static async getTinhNguyenVien(params?: Record<string, any>): Promise<TinhNguyenVien[]> {
    const ep = getEndpoint("TINH_NGUYEN_VIEN", "tinh_nguyen_vien")
    return this.get<TinhNguyenVien[]>(ep, params)
  }

  static async createTinhNguyenVien(data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    const ep = getEndpoint("TINH_NGUYEN_VIEN", "tinh_nguyen_vien")
    return this.post<TinhNguyenVien>(ep, data)
  }

  static async updateTinhNguyenVien(id: number, data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    const ep = getEndpoint("TINH_NGUYEN_VIEN", "tinh_nguyen_vien")
    return this.put<TinhNguyenVien>(`${ep}/${id}`, data)
  }

  static async deleteTinhNguyenVien(id: number): Promise<void> {
    const ep = getEndpoint("TINH_NGUYEN_VIEN", "tinh_nguyen_vien")
    return this.delete<void>(`${ep}/${id}`)
  }


  // ==================== Payment ====================
  static async createPayment(data: any): Promise<any> {
    const basePath = getEndpoint("QUYEN_GOP", "process-vnpay")
    const endpointPath = `${basePath}/process-vnpay`;
    return this.post(endpointPath, data);
  }


  static async handlePayment(data: any): Promise<any> {
    const basePath = getEndpoint("QUYEN_GOP", "quyen_gop")
    return this.post(basePath, data);
  }


  // ==================== Giải ngân =================================================================
  static async createGiaiNgan(data: any): Promise<any> {
    const ep = getEndpoint("GIAI_NGAN", "giai_ngan")
    return this.post<any>(ep, data)
  }

  // create
  static async createChiTietGiaiNgan(data: any): Promise<any> {
    const ep = getEndpoint("CHI_TIET_GIAI_NGAN", "chi_tiet_giai_ngan")
    return this.post<any>(ep, data)
  }


  // get Chi Tiet Giải ngân
  static async getChiTietGiaiNgan(params?: Record<string, any>): Promise<GiaiNgan[]> {
    const basePath = getEndpoint("GIAI_NGAN", "giai_ngan")
    return this.get<GiaiNgan[]>(basePath, params)
  }

  // update trang thái giải ngân 

   static async updateTrangThaiGiaiNgan(giaiNganId: number, data: any): Promise<any> {
    const baseUrl = getEndpoint("giai_ngan", "giai_ngan")
    const endpointWithQuery = `${baseUrl}?id=eq.${giaiNganId}`;
    console.log(`PATCH URL: ${endpointWithQuery}`);
    return this.patch<any>(endpointWithQuery, data);
  }

}

export const apiClient = ApiClient
