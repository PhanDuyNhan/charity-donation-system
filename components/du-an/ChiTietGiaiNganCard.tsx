import React from 'react';
import { X, FileText, DollarSign, Calendar, User } from 'lucide-react';
import { GiaiNgan } from '@/lib/types';


const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '—';
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getTrangThaiText = (trang_thai: number): string => {
    switch (trang_thai) {
        case 1: return "Đã Duyệt";
        case 2: return "Đang Xử Lý";
        case 3: return "Thất Bại";
        default: return "Chờ Duyệt";
    }
};

const getTrangThaiStyle = (trang_thai: number): string => {
    switch (trang_thai) {
        case 1: return "bg-green-500/10 text-green-400 border-green-500";
        case 2: return "bg-yellow-500/10 text-yellow-400 border-yellow-500";
        case 3: return "bg-red-500/10 text-red-400 border-red-500";
        default: return "bg-neutral-500/10 text-neutral-400 border-neutral-500";
    }
};
// --- COMPONENT CHÍNH ---

interface GiaiNganDetailModalProps {
    selectedGiaiNgan: GiaiNgan;
    setSelectedGiaiNgan: (giaiNgan: GiaiNgan | null) => void;
    // Thêm một prop riêng cho hàm đóng modal nếu cần logic đóng đặc biệt
    onClose?: () => void;
}

const ChiTietGiaiNganCard: React.FC<GiaiNganDetailModalProps> = ({
    selectedGiaiNgan,
    setSelectedGiaiNgan,
    onClose
}) => {
    const handleClose = onClose || (() => setSelectedGiaiNgan(null));

    if (!selectedGiaiNgan) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0f1724] border border-neutral-700 rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-400" />
                            Chi tiết giải ngân #{selectedGiaiNgan.id}
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">
                            Mã dự án: {selectedGiaiNgan.ma_du_an} | Tạo ngày: {formatDate(selectedGiaiNgan.ngay_tao)}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-neutral-700/50 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Thông tin chính */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#111827] border border-neutral-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-blue-400" />
                                <p className="text-xs text-neutral-400 uppercase tracking-wide">Số tiền giải ngân</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">{formatCurrency(selectedGiaiNgan.so_tien)}</p>
                        </div>

                        <div className="bg-[#111827] border border-neutral-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-green-400" />
                                <p className="text-xs text-neutral-400 uppercase tracking-wide">Ngày giải ngân</p>
                            </div>
                            <p className="text-lg font-semibold text-white">{formatDate(selectedGiaiNgan.ngay_giai_ngan)}</p>
                        </div>

                        <div className="bg-[#111827] border border-neutral-700 rounded-lg p-4">
                            <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wide">Loại giải ngân</p>
                            <p className="font-medium text-white capitalize">
                                {selectedGiaiNgan.loai_giai_ngan.replace(/_/g, ' ')}
                            </p>
                        </div>

                        <div className="bg-[#111827] border border-neutral-700 rounded-lg p-4">
                            <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wide">Trạng thái</p>
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getTrangThaiStyle(Number(selectedGiaiNgan.trang_thai))}`}>
                                {getTrangThaiText(Number(selectedGiaiNgan.trang_thai))}
                            </span>
                        </div>
                    </div>

                    {/* Thông tin người nhận */}
                    <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 border border-neutral-700 rounded-lg p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">Thông tin người nhận</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-neutral-400 mb-1">Tên người nhận</p>
                                <p className="font-semibold text-white">{selectedGiaiNgan.nguoi_nhan}</p>
                            </div>
                            <div>
                                <p className="text-xs text-neutral-400 mb-1">Số điện thoại</p>
                                <p className="font-medium text-white">{selectedGiaiNgan?.thong_tin_nguoi_nhan?.so_dien_thoai || '—'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs text-neutral-400 mb-1">Địa chỉ</p>
                                <p className="font-medium text-white">{selectedGiaiNgan?.thong_tin_nguoi_nhan?.dia_chi || '—'}</p>
                            </div>
                            {selectedGiaiNgan?.thong_tin_nguoi_nhan?.mst && (
                                <div>
                                    <p className="text-xs text-neutral-400 mb-1">Mã số thuế</p>
                                    <p className="font-medium text-white">{selectedGiaiNgan.thong_tin_nguoi_nhan.mst}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mục đích sử dụng */}
                    <div className="bg-[#111827] border border-neutral-700 rounded-lg p-5">
                        <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wide">
                            Mục đích sử dụng
                        </h3>
                        <p className="text-white leading-relaxed">{selectedGiaiNgan.muc_dich_su_dung}</p>
                    </div>

                    {/* Chi tiết giải ngân */}
                    <div className="border border-neutral-700 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 px-5 py-3">
                            <h3 className="text-lg font-semibold text-white">Chi tiết khoản giải ngân</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#111827]">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                            STT
                                        </th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                            Mô tả
                                        </th>
                                        <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                            Số tiền
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-700">
                                    {selectedGiaiNgan.chi_tiet_giai_ngan_ma_giai_ngan_fkey?.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-5 py-4 text-sm text-neutral-400 font-mono">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-white">{item.mo_ta}</td>
                                            <td className="px-5 py-4 text-sm text-right font-semibold text-blue-400">
                                                {formatCurrency(item.so_tien)}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 font-bold">
                                        <td colSpan={2} className="px-5 py-4 text-sm text-white uppercase tracking-wide">
                                            Tổng cộng
                                        </td>
                                        <td className="px-5 py-4 text-lg text-right text-green-400 font-bold">
                                            {formatCurrency(selectedGiaiNgan.so_tien)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    {selectedGiaiNgan.ghi_chu && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-yellow-400 mb-2 uppercase tracking-wide">
                                Ghi chú
                            </h3>
                            <p className="text-neutral-200 leading-relaxed">{selectedGiaiNgan.ghi_chu}</p>
                        </div>
                    )}

                    {/* Thông tin khác */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-700">
                        <div className="text-sm">
                            <p className="text-neutral-400 mb-1">Người giải ngân</p>
                            <p className="font-medium text-white">ID: #{selectedGiaiNgan.nguoi_giai_ngan}</p>
                        </div>
                        <div className="text-sm">
                            <p className="text-neutral-400 mb-1">Người duyệt</p>
                            <p className="font-medium text-white">
                                {selectedGiaiNgan.nguoi_duyet ? `ID: #${selectedGiaiNgan.nguoi_duyet}` : 'Chưa có'}
                            </p>
                        </div>
                        <div className="text-sm">
                            <p className="text-neutral-400 mb-1">Mã tài khoản dự án</p>
                            <p className="font-medium text-white">#{selectedGiaiNgan.ma_tai_khoan_du_an}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between gap-3 p-6 border-t border-neutral-700 bg-[#0b0f1a]">
                    <button
                        onClick={() => setSelectedGiaiNgan(null)}
                        className="px-6 py-2.5 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors font-medium"
                    >
                        ← Quay lại danh sách
                    </button>
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChiTietGiaiNganCard;