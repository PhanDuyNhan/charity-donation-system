import { getApiUrl, buildQueryString } from "./api-config"
import type { NguoiDung, DuAn, SuKien, TinTuc, QuyenGop, TinhNguyenVien } from "./types"

// Generic API client với error handling
export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = getApiUrl(endpoint)

    const defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? `?${buildQueryString(params)}` : ""
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    })
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }

  // Người dùng (Users)
  static async getNguoiDung(params?: Record<string, any>): Promise<NguoiDung[]> {
    return this.get<NguoiDung[]>("/nguoi_dung", params)
  }

  static async createNguoiDung(data: Partial<NguoiDung>): Promise<NguoiDung> {
    return this.post<NguoiDung>("/nguoi_dung", data)
  }

  static async updateNguoiDung(id: number, data: Partial<NguoiDung>): Promise<NguoiDung> {
    return this.patch<NguoiDung>(`/nguoi_dung?id=eq.${id}`, data)
  }

  static async deleteNguoiDung(id: number): Promise<void> {
    return this.delete<void>(`/nguoi_dung?id=eq.${id}`)
  }

  // Dự án (Projects)
  static async getDuAn(params?: Record<string, any>): Promise<DuAn[]> {
    return this.get<DuAn[]>("/du_an", params)
  }

  static async createDuAn(data: Partial<DuAn>): Promise<DuAn> {
    return this.post<DuAn>("/du_an", data)
  }

  static async updateDuAn(id: number, data: Partial<DuAn>): Promise<DuAn> {
    return this.patch<DuAn>(`/du_an?id=eq.${id}`, data)
  }

  static async deleteDuAn(id: number): Promise<void> {
    return this.delete<void>(`/du_an?id=eq.${id}`)
  }

  // Sự kiện (Events)
  static async getSuKien(params?: Record<string, any>): Promise<SuKien[]> {
    return this.get<SuKien[]>("/su_kien", params)
  }

  static async createSuKien(data: Partial<SuKien>): Promise<SuKien> {
    return this.post<SuKien>("/su_kien", data)
  }

  static async updateSuKien(id: number, data: Partial<SuKien>): Promise<SuKien> {
    return this.patch<SuKien>(`/su_kien?id=eq.${id}`, data)
  }

  static async deleteSuKien(id: number): Promise<void> {
    return this.delete<void>(`/su_kien?id=eq.${id}`)
  }

  // Tin tức (News)
  static async getTinTuc(params?: Record<string, any>): Promise<TinTuc[]> {
    return this.get<TinTuc[]>("/tin_tuc", params)
  }

  static async createTinTuc(data: Partial<TinTuc>): Promise<TinTuc> {
    return this.post<TinTuc>("/tin_tuc", data)
  }

  static async updateTinTuc(id: number, data: Partial<TinTuc>): Promise<TinTuc> {
    return this.patch<TinTuc>(`/tin_tuc?id=eq.${id}`, data)
  }

  static async deleteTinTuc(id: number): Promise<void> {
    return this.delete<void>(`/tin_tuc?id=eq.${id}`)
  }

  // Quyên góp (Donations)
  static async getQuyenGop(params?: Record<string, any>): Promise<QuyenGop[]> {
    return this.get<QuyenGop[]>("/quyen_gop", params)
  }

  static async createQuyenGop(data: Partial<QuyenGop>): Promise<QuyenGop> {
    return this.post<QuyenGop>("/quyen_gop", data)
  }

  static async updateQuyenGop(id: number, data: Partial<QuyenGop>): Promise<QuyenGop> {
    return this.patch<QuyenGop>(`/quyen_gop?id=eq.${id}`, data)
  }

  static async deleteQuyenGop(id: number): Promise<void> {
    return this.delete<void>(`/quyen_gop?id=eq.${id}`)
  }

  // Tình nguyện viên (Volunteers)
  static async getTinhNguyenVien(params?: Record<string, any>): Promise<TinhNguyenVien[]> {
    return this.get<TinhNguyenVien[]>("/tinh_nguyen_vien", params)
  }

  static async createTinhNguyenVien(data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    return this.post<TinhNguyenVien>("/tinh_nguyen_vien", data)
  }

  static async updateTinhNguyenVien(id: number, data: Partial<TinhNguyenVien>): Promise<TinhNguyenVien> {
    return this.patch<TinhNguyenVien>(`/tinh_nguyen_vien?id=eq.${id}`, data)
  }

  static async deleteTinhNguyenVien(id: number): Promise<void> {
    return this.delete<void>(`/tinh_nguyen_vien?id=eq.${id}`)
  }
}

export const apiClient = ApiClient
