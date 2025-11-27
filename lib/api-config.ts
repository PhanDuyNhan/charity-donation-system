export const API_CONFIG = {
  BASE_URL: "https://j2ee.oshi.id.vn/api/v1", // ✅ khớp CorsConfig backend
  // BASE_URL: "http://localhost:5555/api/v1", // ✅ khớp CorsConfig backend

  ENDPOINTS: {
    AUTH_LOGIN: "auth/login",
    AUTH_REGISTER: "auth/register",
    NGUOI_DUNG: "nguoi_dung",
    DU_AN: "du_an",
    SU_KIEN: "su_kien",
    TIN_TUC: "tin_tuc",
    QUYEN_GOP: "quyen_gop",
    TINH_NGUYEN_VIEN: "tinh_nguyen_vien",
    GIAI_NGAN: "giai_ngan",
    CHI_TIET_GIAI_NGAN: "chi_tiet_giai_ngan",
    THONG_BAO : "thong_bao"
  },
}

// ✅ Hàm tạo URL đầy đủ
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}/${endpoint}`
}

// ✅ Tạo query string cho GET request
export function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join("&")
}
