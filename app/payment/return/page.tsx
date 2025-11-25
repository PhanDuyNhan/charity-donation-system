"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth"
import {
  Heart,
  Check,
  X,
  Home,
  FileText,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Loader2,
} from "lucide-react"
import styles from "./page.module.css"

/**
 * Payment Return Page - 100% from HTML Template
 * Handles VNPay callback and displays success/error
 */

export default function PaymentReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [transactionData, setTransactionData] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get all VNPay params
        const vnpParams: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          vnpParams[key] = value
        })

        // Check if payment successful
        const responseCode = vnpParams.vnp_ResponseCode
        const transactionStatus = vnpParams.vnp_TransactionStatus

        const isSuccess =
          responseCode === "00" && (!transactionStatus || transactionStatus === "00")

        setSuccess(isSuccess)

        if (isSuccess) {
          // Show confetti
          setShowConfetti(true)

          // Parse transaction data
          const amount = parseInt(vnpParams.vnp_Amount || "0") / 100
          const transactionNo = vnpParams.vnp_TransactionNo || "N/A"
          const transactionDate = vnpParams.vnp_PayDate || ""
          const bankCode = vnpParams.vnp_BankCode || "VNPAY"
          const cardType = vnpParams.vnp_CardType || "ATM"

          // Format date
          let formattedDate = new Date().toLocaleString("vi-VN")
          if (transactionDate && transactionDate.length === 14) {
            // Format: YYYYMMDDHHmmss
            const year = transactionDate.substring(0, 4)
            const month = transactionDate.substring(4, 6)
            const day = transactionDate.substring(6, 8)
            const hour = transactionDate.substring(8, 10)
            const minute = transactionDate.substring(10, 12)
            const second = transactionDate.substring(12, 14)
            formattedDate = `${day}/${month}/${year} - ${hour}:${minute}:${second}`
          }

          setTransactionData({
            amount,
            transactionNo,
            transactionDate: formattedDate,
            bankCode,
            cardType,
            projectId: vnpParams.vnp_OrderInfo || "N/A",
            donorName: user?.ho && user?.ten ? `${user.ho} ${user.ten}` : "Ẩn danh",
            paymentMethod: `${bankCode} (${cardType})`,
          })

          // Save to database
          try {
            const paymentData = {
              maNguoiDung: user?.id || 1,
              maDuAn: parseInt(vnpParams.vnp_OrderInfo || "1"),
              soTien: amount,
              phuongThucThanhToan: "VNPAY",
              trangThaiThanhToan: "THANH_CONG",
              maGiaoDich: transactionNo,
              loiNhan: "Quyên góp thành công qua VNPay",
              laQuyenGopAnDanh: !user,
            }

            await apiClient.handlePayment(paymentData)
          } catch (err) {
            console.error("Error saving payment:", err)
          }
        } else {
          setTransactionData({
            error: "Thanh toán không thành công",
            errorCode: responseCode,
            errorMessage: getErrorMessage(responseCode),
          })
        }
      } catch (error) {
        console.error("Error processing payment:", error)
        setSuccess(false)
        setTransactionData({
          error: "Có lỗi xảy ra khi xử lý thanh toán",
        })
      } finally {
        setLoading(false)
      }
    }

    processPayment()
  }, [searchParams, user])

  const getErrorMessage = (code: string) => {
    const errorMessages: Record<string, string> = {
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ",
      "10": "Thẻ/Tài khoản không đủ số dư",
      "11": "Giao dịch hết hạn thanh toán",
      "12": "Thẻ/Tài khoản bị khóa",
      "13": "Sai mật khẩu xác thực",
      "24": "Giao dịch bị hủy",
      "51": "Tài khoản không đủ số dư",
      "65": "Tài khoản vượt quá giới hạn giao dịch",
      "75": "Ngân hàng đang bảo trì",
      "79": "Giao dịch vượt quá số lần nhập sai mật khẩu",
      "99": "Lỗi không xác định",
    }
    return errorMessages[code] || "Giao dịch không thành công"
  }

  const handleCopy = () => {
    if (transactionData?.transactionNo) {
      navigator.clipboard.writeText(transactionData.transactionNo)
      alert("Đã sao chép mã giao dịch!")
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.origin
    const text = `Tôi vừa quyên góp ${
      transactionData?.amount || 0
    } đ cho chiến dịch từ thiện!`

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        )
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        )
        break
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        )
        break
      case "copy":
        navigator.clipboard.writeText(url)
        alert("Đã copy link!")
        break
    }
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  // Confetti pieces
  const confettiColors = [
    "#2E7D32",
    "#FF9800",
    "#8BC34A",
    "#2196F3",
    "#E91E63",
    "#9C27B0",
    "#FF5722",
    "#4CAF50",
    "#FFC107",
  ]

  if (loading) {
    return (
      <div className={styles.body}>
        <div className={styles.loading}>
          <Loader2 style={{ width: 48, height: 48 }} />
          <p>Đang xử lý giao dịch...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.body}>
      {/* Confetti */}
      {showConfetti && success && (
        <div className={styles.confetti}>
          {confettiColors.map((color, i) => (
            <div
              key={i}
              className={styles.confettiPiece}
              style={{
                left: `${(i + 1) * 10}%`,
                animationDelay: `${i * 0.1}s`,
                background: color,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <Heart style={{ width: 28, height: 28 }} />
            <span>TỪ THIỆN XANH</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.successContainer}>
          <div className={`${styles.successCard} ${!success ? styles.errorCard : ""}`}>
            {success ? (
              <>
                <div className={styles.successIcon}>
                  <Check style={{ width: 60, height: 60 }} />
                </div>

                <h1>Quyên góp thành công!</h1>
                <p>Cảm ơn bạn đã đồng hành cùng Từ Thiện Xanh</p>

                {transactionData && (
                  <>
                    <div className={styles.transactionDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Dự án</span>
                        <span className={styles.value}>
                          Mã dự án #{transactionData.projectId}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Phương thức</span>
                        <span className={styles.value}>{transactionData.paymentMethod}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Thời gian</span>
                        <span className={styles.value}>{transactionData.transactionDate}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.label}>Người quyên góp</span>
                        <span className={styles.value}>{transactionData.donorName}</span>
                      </div>
                      <div className={`${styles.detailRow} ${styles.total}`}>
                        <span className={styles.label}>Số tiền quyên góp</span>
                        <span className={styles.value}>
                          {formatMoney(transactionData.amount)}đ
                        </span>
                      </div>
                    </div>

                    <div className={styles.transactionId}>
                      <div className={styles.idGroup}>
                        <div className={styles.idLabel}>Mã giao dịch</div>
                        <div className={styles.id}>{transactionData.transactionNo}</div>
                      </div>
                      <button className={styles.copyBtn} onClick={handleCopy}>
                        <Copy style={{ width: 14, height: 14 }} />
                        Sao chép
                      </button>
                    </div>

                    <div className={styles.thankMessage}>
                      <p>
                        <Heart style={{ width: 18, height: 18 }} />
                        Mỗi đóng góp của bạn đều mang lại niềm vui và hy vọng cho những
                        người khó khăn. 100% số tiền sẽ được chuyển đến dự án. Chúng tôi sẽ
                        cập nhật tiến độ qua email cho bạn.
                      </p>
                    </div>
                  </>
                )}

                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => router.push("/")}
                  >
                    <Home style={{ width: 20, height: 20 }} />
                    Về trang chủ
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnOutline}`}
                    onClick={() => router.push("/ho-so")}
                  >
                    <FileText style={{ width: 20, height: 20 }} />
                    Xem lịch sử
                  </button>
                </div>

                <div className={styles.shareSection}>
                  <p>Chia sẻ để lan tỏa yêu thương</p>
                  <div className={styles.socialShare}>
                    <button
                      className={`${styles.shareBtn} ${styles.facebook}`}
                      onClick={() => handleShare("facebook")}
                    >
                      <Facebook style={{ width: 20, height: 20 }} />
                    </button>
                    <button
                      className={`${styles.shareBtn} ${styles.twitter}`}
                      onClick={() => handleShare("twitter")}
                    >
                      <Twitter style={{ width: 20, height: 20 }} />
                    </button>
                    <button
                      className={`${styles.shareBtn} ${styles.linkedin}`}
                      onClick={() => handleShare("linkedin")}
                    >
                      <Linkedin style={{ width: 20, height: 20 }} />
                    </button>
                    <button
                      className={`${styles.shareBtn} ${styles.copy}`}
                      onClick={() => handleShare("copy")}
                    >
                      <Copy style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.errorIcon}>
                  <X style={{ width: 60, height: 60 }} />
                </div>

                <h1>Thanh toán không thành công</h1>
                <p>{transactionData?.errorMessage || "Đã có lỗi xảy ra"}</p>

                {transactionData && (
                  <div className={styles.transactionDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Mã lỗi</span>
                      <span className={styles.value}>{transactionData.errorCode}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Thời gian</span>
                      <span className={styles.value}>
                        {new Date().toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                )}

                <div className={styles.thankMessage}>
                  <p>
                    Giao dịch của bạn không thành công. Vui lòng thử lại hoặc liên hệ với
                    chúng tôi nếu bạn cần hỗ trợ.
                  </p>
                </div>

                <div className={styles.actionButtons}>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => router.back()}
                  >
                    Thử lại
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnOutline}`}
                    onClick={() => router.push("/")}
                  >
                    <Home style={{ width: 20, height: 20 }} />
                    Về trang chủ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
