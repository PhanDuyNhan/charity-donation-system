// Type definitions dựa trên database schema

export type VaiTroNguoiDung = "quan_tri_vien" | "dieu_hanh_vien" | "bien_tap_vien" | "nguoi_dung" | "tinh_nguyen_vien"

export type TrangThaiNguoiDung = "hoat_dong" | "khong_hoat_dong" | "bi_khoa"

export type TrangThaiDuAn = "hoat_dong" | "tam_dung" | "ban_nhap" | "hoan_thanh"

export type MucDoUuTien = "khan_cap" | "cao" | "trung_binh" | "thap"

export type PhuongThucThanhToan = "vnpay" | "momo" | "tien_ma_hoa" | "chuyen_khoan_ngan_hang" | "tien_mat"

export type TrangThaiThanhToan = "cho_xu_ly" | "dang_xu_ly" | "hoan_thanh" | "that_bai" | "huy_bo" | "hoan_tien"

export type TrangThaiSuKien = "sap_dien_ra" | "dang_dien_ra" | "da_ket_thuc" | "huy_bo"

export type LoaiSuKien = "gay_quy" | "tinh_nguyen" | "tuyen_truyen" | "dao_tao" | "khac"

export type ChuyenMucTinTuc = "tin_tuc" | "su_kien" | "cau_chuyen_thanh_cong" | "thong_bao"

export type TrangThaiNoiDung = "ban_nhap" | "da_xuat_ban" | "luu_tru"

export interface NguoiDung {
  id: number;
  email: string;
  mat_khau?: string;   // ← khớp với BE /nguoi_dung
  ten: string;
  ho: string;
  so_dien_thoai?: string | null;
  dia_chi?: string | null;
  vai_tro: VaiTroNguoiDung;
  trang_thai?: TrangThaiNguoiDung | string;
  ngay_tao?: string;
}

export interface DanhMucDuAn {
  id: number
  ten: string
  mo_ta?: string
  bieu_tuong?: string
  thu_tu_hien_thi: number
  dang_hoat_dong: boolean
  ngay_tao: string
}

export interface DuAn {
  id: number
  tieu_de: string
  mo_ta: string
  mo_chi_tiet: string
  ma_danh_muc: number
  so_tien_muc_tieu: number
  so_tien_hien_tai: number
  ngay_bat_dau: string
  ngay_ket_thuc: string
  trang_thai?: TrangThaiDuAn
  dia_diem: string
  thu_vien_anh?: string []
  muc_do_uu_tien: MucDoUuTien
  nguoi_tao: number
  nguoi_phe_duyet?: number | null
  ngay_tao?: string
  ngay_cap_nhat?: string
  giai_ngan?: GiaiNgan[]
}

export interface QuyenGop {
  id: number
  ma_nguoi_dung?: number
  ma_du_an: number
  so_tien: number
  don_vi_tien_te: string
  phuong_thuc_thanh_toan: PhuongThucThanhToan
  trang_thai_thanh_toan: TrangThaiThanhToan
  ma_giao_dich?: string
  duong_dan_bien_lai?: string
  loi_nhan?: string
  phi_giao_dich: number
  ngay_tao: string
  ngay_cap_nhat: string
}

export interface SuKien {
  id: number
  tieu_de: string
  mo_ta: string
  thoi_gian_bat_dau: string
  thoi_gian_ket_thuc?: string
  dia_diem: string
  nguoi_tao: number
  ngay_tao: string
}

export interface TinTuc {
  id: number
  tieu_de: string
  noi_dung: string
  ma_tac_gia: number
  anh_dai_dien?: string
  ngay_tao: string
}

export interface TinhNguyenVien {
  id: number
  ma_nguoi_dung: number
  ky_nang?: any
  thoi_gian_ranh?: any
  kinh_nghiem?: string
  gioi_thieu?: string
  trang_thai: string
  diem_danh_gia: number
  tong_gio_dong_gop: number
  ngon_ngu?: any
  trinh_do_hoc_van?: string
  nghe_nghiep?: string
  lien_he_khan_cap?: any
  da_kiem_tra_ly_lich: boolean
  ngay_kiem_tra_ly_lich?: string
  ngay_tao: string
  ngay_cap_nhat: string
}

export interface TinNhanLienHe {
  id: number
  ten_nguoi_gui: string
  email: string
  so_dien_thoai?: string
  chu_de: string
  noi_dung: string
  danh_muc: string
  muc_do_uu_tien: string
  trang_thai_xu_ly: string
  nguoi_phu_trach?: number
  phan_hoi?: string
  thoi_gian_phan_hoi?: string
  dia_chi_ip?: string
  thong_tin_trinh_duyet?: string
  file_dinh_kem?: any
  ngay_tao: string
  ngay_cap_nhat: string
}

export interface BaoCaoTaiChinh {
  id: number
  loai_bao_cao: string
  ngay_bat_dau_ky: string
  ngay_ket_thuc_ky: string
  ma_du_an?: number
  tong_quyen_gop: number
  tong_chi_phi: number
  chi_phi_quan_ly: number
  chi_phi_du_an: number
  chi_phi_van_hanh: number
  so_du_quy: number
  duong_dan_file_bao_cao?: string
  trang_thai: TrangThaiNoiDung
  tom_tat?: string
  ghi_chu?: string
  nguoi_tao: number
  nguoi_phe_duyet?: number
  ngay_xuat_ban?: string
  ngay_tao: string
  ngay_cap_nhat: string
}

export interface UploadResponse {
  path?: string
  url?: string
  [key: string]: any
}



export interface ThongTinNguoiNhan {
  mst?: string
  dia_chi?: string
  so_dien_thoai?: string
}

export interface GiaiNgan {
  id: number
  ghi_chu?: string
  so_tien: number
  ma_du_an: number
  ngay_tao: string
  nguoi_nhan: string
  trang_thai: string
  nguoi_duyet?: number | null
  loai_giai_ngan: string
  ngay_giai_ngan: string
  nguoi_giai_ngan: number
  muc_dich_su_dung: string
  ma_tai_khoan_du_an: number
  tai_lieu_chung_minh?: any
  thong_tin_nguoi_nhan?: ThongTinNguoiNhan
  chi_tiet_giai_ngan_ma_giai_ngan_fkey?: ChiTietGiaiNgan[]
}

export interface ChiTietGiaiNgan {
  id : number,
  mo_ta : string,
  so_tien : number,
  ma_giai_ngan : number
}