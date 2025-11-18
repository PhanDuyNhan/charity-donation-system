import React, { useState } from 'react';
import { Eye, Calendar, User, MapPin, Phone, FileText, DollarSign, ChevronDown } from 'lucide-react';
import { GiaiNgan } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

type TrangThaiKey = "cho_duyet" | "da_duyet" | "tu_choi";

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

const TRANG_THAI_OPTIONS: { value: TrangThaiKey, label: string }[] = [
    { value: "cho_duyet", label: "Chờ Duyệt" },
    { value: "da_duyet", label: "Đã Duyệt" },
    { value: "tu_choi", label: "Từ Chối" },
];



const getTrangThaiStyle = (trang_thai: string): string => {
    switch (trang_thai) {
        case "da_duyet": return "bg-green-500/20 text-green-300 border-green-500/40";
        case "tu_choi": return "bg-red-500/20 text-red-300 border-red-500/40";
        default: return "bg-neutral-500/20 text-neutral-300 border-neutral-500/40";
    }
};

const getTrangThaiIcon = (trang_thai: string): string => {
    switch (trang_thai) {
        case "da_duyet": return "✓";
        case "tu_choi": return "✕";
        default: return "○";
    }
};


interface GiaiNganCardProps {
    gn: GiaiNgan;
    index: number;
    setSelectedGiaiNgan: (giaiNgan: GiaiNgan) => void;
}



const GiaiNganCard: React.FC<GiaiNganCardProps> = ({ gn, index, setSelectedGiaiNgan }) => {

    const [currentStatus, setCurrentStatus] = useState(gn.trang_thai as TrangThaiKey);
    const [isLoading, setIsLoading] = useState(false);

    const currentTrangThai = currentStatus;

    // 2. HÀM XỬ LÝ CẬP NHẬT TRẠNG THÁI VÀ GỌI API TRỰC TIẾP
    const handleSelectChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as TrangThaiKey;
        const oldStatus = currentStatus;

        if (newStatus === oldStatus || isLoading) return;

        setIsLoading(true);
        setCurrentStatus(newStatus);
        const authStorage = localStorage.getItem('auth-storage')
        const userId = authStorage ? JSON.parse(authStorage).state.user.id : null
        const updateData = {
            trang_thai: newStatus,
            nguoi_duyet: userId
        }

        try {
           const result = await apiClient.updateTrangThaiGiaiNgan(gn.id, updateData);

           console.log("ressulttttttt", result)

            // Nếu thành công và có hàm refetch (tùy chọn), gọi nó để cập nhật danh sách cha
            // if (refetchData) {
            //     refetchData();
            // }

        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            alert('Cập nhật trạng thái thất bại. Đã hoàn tác trạng thái.');
            setCurrentStatus(oldStatus); // Rollback trạng thái UI nếu API lỗi
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="group relative bg-gradient-to-br from-[#0f1724] to-[#151f30] border border-neutral-700/50 rounded-xl p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 rounded-xl transition-all duration-300" />

            {/* Content */}
            <div className="relative space-y-5">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                        {/* Badge Number */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                {index + 1}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <p className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                                    Giải ngân #{gn.id}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(gn.ngay_giai_ngan)}
                                </span>
                                <span className="text-neutral-600">•</span>
                                <span className="flex items-center gap-1 opacity-70">
                                    Tạo: {formatDate(gn.ngay_tao)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Amount & Status */}
                    <div className="text-right flex-shrink-0">
                        <div className="flex items-center justify-end gap-2 mb-2">
                            <p className="text-2xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                {formatCurrency(gn.so_tien)}
                            </p>
                        </div>

                        <div className="relative inline-block">
                            <select
                                value={currentTrangThai}
                                onChange={handleSelectChange}
                                className={`appearance-none bg-re px-3 py-1.5 rounded-lg text-xs font-extrabold border cursor-pointer  text-black 
                                    ${getTrangThaiStyle(currentTrangThai)} pr-7 focus:ring-2 focus:ring-blue-500`}
                            >
                                {TRANG_THAI_OPTIONS.map(option => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {getTrangThaiIcon(option.value)} {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-white/80" />
                        </div>



                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-800/40 rounded-lg p-3 border border-neutral-700/30 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <User className="w-3.5 h-3.5 text-purple-400" />
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Người nhận</p>
                        </div>
                        <p className="font-semibold text-white truncate">{gn.nguoi_nhan}</p>
                    </div>

                    <div className="bg-neutral-800/40 rounded-lg p-3 border border-neutral-700/30 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Phone className="w-3.5 h-3.5 text-green-400" />
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Số điện thoại</p>
                        </div>
                        <p className="font-semibold text-white">{gn.thong_tin_nguoi_nhan?.so_dien_thoai || '—'}</p>
                    </div>

                    <div className="bg-neutral-800/40 rounded-lg p-3 border border-neutral-700/30 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Địa chỉ</p>
                        </div>
                        <p className="font-semibold text-white truncate" title={gn.thong_tin_nguoi_nhan?.dia_chi}>
                            {gn.thong_tin_nguoi_nhan?.dia_chi || '—'}
                        </p>
                    </div>
                </div>

                {/* Purpose Section */}
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        Mục đích sử dụng
                    </p>
                    <p className="text-sm text-neutral-200 leading-relaxed line-clamp-2">
                        {gn.muc_dich_su_dung}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-700/50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <div className="w-8 h-8 rounded-lg bg-neutral-700/50 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-neutral-300" />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{gn.chi_tiet_giai_ngan_ma_giai_ngan_fkey?.length || 0}</p>
                                <p className="text-xs">khoản chi tiết</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedGiaiNgan(gn)}
                        className="group/btn relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 overflow-hidden"
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />

                        <Eye className="w-4 h-4 relative z-10 group-hover/btn:scale-110 transition-transform" />
                        <span className="relative z-10">Xem chi tiết</span>
                    </button>
                </div>
            </div>

            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
    );
};

export default GiaiNganCard;