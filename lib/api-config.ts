export const API_CONFIG = {
  BASE_URL: "http://j2ee.oshi.id.vn:5555/api/v1", // ✅ KHÔNG có slash cuối

  ENDPOINTS: {
    AUTH_LOGIN: "auth/login",
    AUTH_REGISTER: "auth/register",
    NGUOI_DUNG: "nguoi_dung",
    DU_AN: "du_an",
    SU_KIEN: "su_kien",
    TIN_TUC: "tin_tuc",
    QUYEN_GOP: "quyen_gop",
    TINH_NGUYEN_VIEN: "tinh_nguyen_vien",
  },
}

// ✅ Hàm helper build URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}/${endpoint}`
}

// ✅ Build query string cho GET
export function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
    .join("&")
}
