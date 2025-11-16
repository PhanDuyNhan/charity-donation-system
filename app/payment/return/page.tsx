// app/payment/return/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface VNPayParams {
  vnp_Amount: string;
  vnp_BankCode: string;
  vnp_BankTranNo: string;
  vnp_CardType: string;
  vnp_OrderInfo: string;
  vnp_PayDate: string;
  vnp_ResponseCode: string;
  vnp_TmnCode: string;
  vnp_TransactionNo: string;
  vnp_TransactionStatus: string;
  vnp_TxnRef: string;
  vnp_SecureHash: string;
}

interface PaymentData {
  maNguoiDung: number;
  maDuAn: number;
  soTien: number;
  phuongThucThanhToan: string;
  trangThaiThanhToan: string;
  maGiaoDich: string;
  loiNhan: string;
  phiGiaoDich: number;
  soTienThuc: number;
  donViTienTe: string;
}

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<VNPayParams | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Lấy tất cả params từ URL
        const params: VNPayParams = {
          vnp_Amount: searchParams.get('vnp_Amount') || '',
          vnp_BankCode: searchParams.get('vnp_BankCode') || '',
          vnp_BankTranNo: searchParams.get('vnp_BankTranNo') || '',
          vnp_CardType: searchParams.get('vnp_CardType') || '',
          vnp_OrderInfo: searchParams.get('vnp_OrderInfo') || '',
          vnp_PayDate: searchParams.get('vnp_PayDate') || '',
          vnp_ResponseCode: searchParams.get('vnp_ResponseCode') || '',
          vnp_TmnCode: searchParams.get('vnp_TmnCode') || '',
          vnp_TransactionNo: searchParams.get('vnp_TransactionNo') || '',
          vnp_TransactionStatus: searchParams.get('vnp_TransactionStatus') || '',
          vnp_TxnRef: searchParams.get('vnp_TxnRef') || '',
          vnp_SecureHash: searchParams.get('vnp_SecureHash') || '',
        };

        setPaymentInfo(params);

        // Kiểm tra mã phản hồi
        // vnp_ResponseCode = '00' và vnp_TransactionStatus = '00' nghĩa là thành công
        const isPaymentSuccess = params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00';
        setIsSuccess(isPaymentSuccess);

        if (isPaymentSuccess) {
          // Chuyển đổi số tiền (VNPay trả về số tiền * 100)
          const amount = parseInt(params.vnp_Amount) / 100;
          // const transactionFee = amount * 0.02; // 2% phí giao dịch
          // const actualAmount = amount - transactionFee;

          // Chuẩn bị dữ liệu gửi lên API
          // Lưu ý: Bạn cần lấy maNguoiDung và maDuAn từ session/context/localStorage
          const paymentData: PaymentData = {
            maNguoiDung: 1, // TODO: Lấy từ session/context
            maDuAn: 1, // TODO: Lấy từ session/localStorage khi tạo thanh toán
            soTien: amount,
            phuongThucThanhToan: 'VNPAY',
            trangThaiThanhToan: 'THANH_CONG',
            maGiaoDich: params.vnp_TransactionNo,
            loiNhan: decodeURIComponent(params.vnp_OrderInfo),
            phiGiaoDich: 0,
            soTienThuc: amount,
            donViTienTe: 'VND',
          };

          // Gọi API để lưu thông tin thanh toán
          const response = await apiClient.handlePayment(paymentData);

          if (!response.ok) {
            throw new Error('Không thể lưu thông tin thanh toán');
          }

          const result = await response.json();
          console.log('Payment saved:', result);
        }
      } catch (err) {
        console.error('Error processing payment:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams]);

  // Format số tiền
  const formatAmount = (amount: string) => {
    const num = parseInt(amount) / 100;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  // Format ngày giờ
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 14) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {isSuccess ? (
            <>
              <div className="mb-4 flex justify-center">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-600">Giao dịch của bạn đã được xử lý thành công</p>
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-center">
                <div className="bg-red-100 rounded-full p-4">
                  <XCircle className="w-16 h-16 text-red-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thanh toán thất bại!</h1>
              <p className="text-gray-600">Giao dịch không thành công. Vui lòng thử lại</p>
            </>
          )}
        </div>

        {/* Thông tin giao dịch */}
        {paymentInfo && (
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin giao dịch</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-gray-800">{formatAmount(paymentInfo.vnp_Amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-semibold text-gray-800">{paymentInfo.vnp_TransactionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-800">{paymentInfo.vnp_TxnRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngân hàng:</span>
                <span className="font-semibold text-gray-800">{paymentInfo.vnp_BankCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loại thẻ:</span>
                <span className="font-semibold text-gray-800">{paymentInfo.vnp_CardType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-semibold text-gray-800">{formatDate(paymentInfo.vnp_PayDate)}</span>
              </div>
              {paymentInfo.vnp_OrderInfo && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Nội dung:</span>
                  <span className="font-semibold text-gray-800">{decodeURIComponent(paymentInfo.vnp_OrderInfo)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-semibold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {isSuccess ? 'Thành công' : 'Thất bại'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo lỗi */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Về trang chủ
          </button>
          {isSuccess ? (
            <button
              onClick={() => router.push('/my-contributions')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Xem đóng góp
            </button>
          ) : (
            <button
              onClick={() => router.back()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Thử lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}