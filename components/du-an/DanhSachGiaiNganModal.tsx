import { GiaiNgan } from "@/lib/types";
import { X, FileText, User, Calendar, DollarSign, Eye } from "lucide-react";
import { useState } from "react";
import GiaiNganCard from "./GiaiNganCard";
import CardChiTietGiaiNgan from "./ChiTietGiaiNganCard";

export const DanhSachGiaiNganModal = ({
  isOpen,
  onClose,
  giaiNgans,
  duAnTitle
}: {
  isOpen: boolean;
  onClose: () => void;
  giaiNgans: GiaiNgan[];
  duAnTitle: string;
}) => {
  const [selectedGiaiNgan, setSelectedGiaiNgan] = useState<GiaiNgan | null>(null);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTrangThaiStyle = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_duyet':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'da_duyet':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'tu_choi':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTrangThaiText = (trangThai: string) => {
    switch (trangThai) {
      case 'cho_duyet':
        return 'Chờ duyệt';
      case 'da_duyet':
        return 'Đã duyệt';
      case 'tu_choi':
        return 'Từ chối';
      default:
        return trangThai;
    }
  };

  const tongTienGiaiNgan = giaiNgans.reduce((sum, gn) => sum + Number(gn.so_tien || 0), 0);

  // Nếu đang xem chi tiết 1 giải ngân cụ thể
  if (selectedGiaiNgan) {
    return (
      <CardChiTietGiaiNgan
        selectedGiaiNgan={selectedGiaiNgan}
        setSelectedGiaiNgan={setSelectedGiaiNgan}
      />
    );
  }

  // Danh sách các lần giải ngân
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1724] border border-neutral-700 rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-gradient-to-r from-blue-900/30 to-indigo-900/30">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              Danh sách giải ngân
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Dự án: {duAnTitle}
            </p>
          </div>
          <div className="text-right mr-4">
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Tổng đã giải ngân</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(tongTienGiaiNgan)}</p>
            <p className="text-xs text-neutral-400 mt-1">{giaiNgans.length} lần giải ngân</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-700/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-neutral-400" />
          </button>
        </div>

        {/* Content - Danh sách */}
        <div className="p-6 overflow-y-auto flex-1">
          {giaiNgans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-400">Chưa có lần giải ngân nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {giaiNgans.map((gn, index) => (
                <GiaiNganCard
                  key={gn.id}
                  gn={gn}
                  index={index}
                  setSelectedGiaiNgan={setSelectedGiaiNgan}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-neutral-700 bg-[#0b0f1a]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors font-medium shadow-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};