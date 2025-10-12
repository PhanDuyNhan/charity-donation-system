// API Configuration - Dễ dàng thay đổi host API
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "",
  API_VERSION: "v1",
  ENDPOINTS: {
    // User endpoints
    NGUOI_DUNG: "/api/v1/nguoi_dung",
    TINH_NGUYEN_VIEN: "/api/v1/tinh_nguyen_vien",
    TAI_KHOAN_MANG_XA_HOI: "/api/v1/tai_khoan_mang_xa_hoi",

    // Project endpoints
    DANH_MUC_DU_AN: "/api/v1/danh_muc_du_an",
    DU_AN: "/api/v1/du_an",
    CAP_NHAT_DU_AN: "/api/v1/cap_nhat_du_an",
    CHI_PHI_DU_AN: "/api/v1/chi_phi_du_an",

    // Donation endpoints
    QUYEN_GOP: "/api/v1/quyen_gop",
    DANH_MUC_CHI_PHI: "/api/v1/danh_muc_chi_phi",

    // Event endpoints
    SU_KIEN: "/api/v1/su_kien",
    DANG_KY_SU_KIEN: "/api/v1/dang_ky_su_kien",

    // Content endpoints
    TIN_TUC: "/api/v1/tin_tuc",
    FILE_DA_PHUONG_TIEN: "/api/v1/file_da_phuong_tien",

    // Relationship endpoints
    TNV_THAM_GIA_DU_AN: "/api/v1/tnv_tham_gia_du_an",

    // System endpoints
    NHAT_KY_KIEM_TOAN: "/api/v1/nhat_ky_kiem_toan",
    BAO_CAO_TAI_CHINH: "/api/v1/bao_cao_tai_chinh",
    TIN_NHAN_LIEN_HE: "/api/v1/tin_nhan_lien_he",
    DANG_KY_NHAN_TIN: "/api/v1/dang_ky_nhan_tin",
  },
}

// Helper function để tạo full URL
export function getApiUrl(endpoint: string): string {
  // Nếu BASE_URL trống → tự động gọi qua proxy nội bộ (/api)
  if (!API_CONFIG.BASE_URL) return endpoint
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function để tạo query string
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value))
    }
  })
  return query.toString()
}
