"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/lib/auth"
import {
  Heart,
  ArrowLeft,
  Coins,
  CreditCard,
  User,
  Check,
  ShieldCheck,
  University,
} from "lucide-react"
import styles from "./page.module.css"

/**
 * Trang Quyên Góp - 100% theo HTML template
 * Route: /quyen-gop?project=[id]
 */

type PaymentMethod = "MOMO" | "VNPAY" | "BANK" | "CARD"

export default function DonationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")
  console.log("🚀 ~ DonationPage ~ projectId:", projectId)

  const { user } = useAuthStore()

  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [totalDonated, setTotalDonated] = useState(0)
  const [donorCount, setDonorCount] = useState(0)

  // Form states
  const [step, setStep] = useState<1 | 2 | 3>(2) // Mặc định step 2 như HTML
  const [selectedAmount, setSelectedAmount] = useState("1000000")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("VNPAY")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorName, setDonorName] = useState("")
  const [donorPhone, setDonorPhone] = useState("")
  const [donorEmail, setDonorEmail] = useState("")
  const [message, setMessage] = useState("")

  // Load project data
  useEffect(() => {
    if (!projectId) {
      router.push("/du-an")
      return
    }

    const loadProject = async () => {
      try {
        const res = await apiClient.getDuAn({ id: `eq.${projectId}` })
        if (!res || res.length === 0) {
          alert("Không tìm thấy dự án!")
          router.push("/du-an")
          return
        }
        setProject(res[0])

        // Fetch donations from quyen_gop API
        try {
          const donations = await apiClient.getQuyenGop({
            ma_du_an: `eq.${projectId}`,
            trang_thai_: `eq.thanh_cong`,
            select: "so_tien,so_tien_thuc",
          })
          if (Array.isArray(donations)) {
            // Tính tổng tiền đã quyên góp
            const total = donations.reduce((sum: number, d: any) => sum + (d.so_tien_thuc || d.so_tien || 0), 0)
            setTotalDonated(total)
            // Đếm số người ủng hộ
            setDonorCount(donations.length)
          }
        } catch (donationErr) {
          console.error("Error loading donations:", donationErr)
        }

        // Pre-fill user info if logged in
        if (user) {
          setDonorName(`${user.ho || ""} ${user.ten || ""}`.trim())
          setDonorPhone(user.so_dien_thoai || "")
          setDonorEmail(user.email || "")
        }
      } catch (err) {
        console.error("Error loading project:", err)
        alert("Lỗi khi tải dự án!")
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId, user, router])

  if (loading || !project) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: "#757575" }}>
        Đang tải...
      </div>
    )
  }

  const amount = parseInt(customAmount || selectedAmount)

  const progress =
    project.so_tien_muc_tieu > 0
      ? (totalDonated / project.so_tien_muc_tieu) * 100
      : 0

  const daysRemaining = Math.ceil(
    (new Date(project.ngay_ket_thuc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  // Get project image
  let projectImage = "/placeholder.svg"
  if (project.thu_vien_anh) {
    try {
      let imgs = []
      const raw = project.thu_vien_anh
      if (Array.isArray(raw)) {
        imgs = raw
      } else if (typeof raw === "string") {
        if (raw.trim().startsWith("[")) {
          imgs = JSON.parse(raw)
        } else {
          imgs = [raw]
        }
      }
      if (imgs.length > 0) {
        projectImage = imgs[0].startsWith("http")
          ? imgs[0]
          : `https://j2ee.oshi.id.vn/${imgs[0].replace(/^\/+/, "")}`
      }
    } catch {}
  }

  const paymentMethodMap: Record<PaymentMethod, string> = {
    MOMO: "Ví MoMo",
    VNPAY: "VNPay",
    BANK: "Chuyển khoản ngân hàng",
    CARD: "Thẻ Visa/Mastercard",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || amount < 10000) {
      alert("Số tiền tối thiểu là 10,000 đ")
      return
    }

    if (!isAnonymous) {
      if (!donorName.trim()) {
        alert("Vui lòng nhập họ tên!")
        return
      }
      if (!donorPhone.trim()) {
        alert("Vui lòng nhập số điện thoại!")
        return
      }
    }

    setSubmitting(true)

    try {
      // Call API to create payment
      const paymentData = {
        maDuAn: parseInt(projectId!),
        soTien: amount,
        phuongThucThanhToan: paymentMethod,
        loiNhan: message.trim() || "Quyên góp từ thiện",
        laQuyenGopAnDanh: isAnonymous,
        // Include donor info if not anonymous
        ...((!isAnonymous && {
          tenNguoiQuyenGop: donorName,
          soDienThoai: donorPhone,
          email: donorEmail,
        })),
      }

      const response = await apiClient.createPayment(paymentData)

      if (response && response.vnpUrl) {
        // Lưu projectId vào localStorage để sử dụng khi VNPay redirect về
        localStorage.setItem('pending_payment_project_id', projectId!)
        // Redirect to VNPay payment page
        window.location.href = response.vnpUrl
      } else {
        alert("Thanh toán thành công!")
        router.push(`/du-an/${projectId}`)
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      alert(error.message || "Có lỗi xảy ra khi xử lý thanh toán!")
    } finally {
      setSubmitting(false)
    }
  }

  const amountOptions = [
    { value: 200000, label: "200,000đ", desc: "1 phần quà nhỏ" },
    { value: 500000, label: "500,000đ", desc: "1 phần quà Tết" },
    { value: 1000000, label: "1,000,000đ", desc: "1 gia đình ấm Tết" },
    { value: 2000000, label: "2,000,000đ", desc: "2 gia đình" },
    { value: 5000000, label: "5,000,000đ", desc: "5 gia đình" },
    { value: 10000000, label: "10,000,000đ", desc: "10 gia đình" },
  ]

  return (
    <div className={styles.body}>
      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <Heart style={{ width: 28, height: 28 }} />
            <span>TỪ THIỆN XANH</span>
          </div>
          <button
            className={styles.backBtn}
            onClick={() => router.push(`/du-an/${projectId}`)}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
            Quay lại chiến dịch
          </button>
        </nav>
      </header>

      {/* Campaign Banner */}
      <section className={styles.campaignBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerInfo}>
            <h1>{project.tieu_de}</h1>
            <p>{project.mo_ta}</p>
          </div>
          <div className={styles.campaignStats}>
            <div className={styles.statItem}>
              <h3>{donorCount}</h3>
              <p>Người ủng hộ</p>
            </div>
            <div className={styles.statItem}>
              <h3>{formatMoney(totalDonated)}đ</h3>
              <p>Đã quyên góp</p>
            </div>
            <div className={styles.statItem}>
              <h3>{daysRemaining > 0 ? `${daysRemaining} ngày` : "Đã kết thúc"}</h3>
              <p>Còn lại</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Left - Form */}
        <div className={styles.donationFormContainer}>
          <div className={styles.formHeader}>
            <h2>Quyên góp cho chiến dịch</h2>
            <p>Mỗi đóng góp của bạn sẽ mang lại một cái Tết ấm áp</p>
          </div>

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${styles.completed}`}>
              <div className={styles.stepNumber}>
                <Check style={{ width: 20, height: 20 }} />
              </div>
              <span className={styles.stepLabel}>Chọn số tiền</span>
            </div>
            <div className={`${styles.step} ${styles.active}`}>
              <div className={styles.stepNumber}>2</div>
              <span className={styles.stepLabel}>Thanh toán</span>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <span className={styles.stepLabel}>Hoàn tất</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Amount Selection */}
            <h3 className={styles.sectionTitle}>
              <Coins style={{ width: 20, height: 20 }} />
              Chọn số tiền quyên góp
            </h3>
            <div className={styles.amountGrid}>
              {amountOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`${styles.amountOption} ${
                    selectedAmount === opt.value.toString() && !customAmount
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedAmount(opt.value.toString())
                    setCustomAmount("")
                  }}
                >
                  <div className={styles.value}>{opt.label}</div>
                  <div className={styles.desc}>{opt.desc}</div>
                </div>
              ))}
            </div>

            <div className={styles.customAmountInput}>
              <input
                type="text"
                placeholder="Hoặc nhập số tiền khác"
                value={customAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "")
                  setCustomAmount(val)
                  setSelectedAmount("")
                }}
              />
              <span className={styles.currency}>VNĐ</span>
            </div>

            {/* Payment Methods */}
            <h3 className={styles.sectionTitle}>
              <CreditCard style={{ width: 20, height: 20 }} />
              Phương thức thanh toán
            </h3>
            <div className={styles.paymentMethods}>
              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === "MOMO" ? styles.selected : ""
                }`}
                onClick={() => setPaymentMethod("MOMO")}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "MOMO"}
                  readOnly
                />
                <div className={`${styles.paymentIcon} ${styles.momo}`}>M</div>
                <div className={styles.paymentDetails}>
                  <h4>Ví MoMo</h4>
                  <p>Thanh toán nhanh chóng qua ví MoMo</p>
                </div>
              </div>

              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === "VNPAY" ? styles.selected : ""
                }`}
                onClick={() => setPaymentMethod("VNPAY")}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "VNPAY"}
                  readOnly
                />
                <div className={`${styles.paymentIcon} ${styles.vnpay}`}>VN</div>
                <div className={styles.paymentDetails}>
                  <h4>VNPay</h4>
                  <p>Quét mã QR hoặc thẻ nội địa</p>
                </div>
              </div>

              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === "BANK" ? styles.selected : ""
                }`}
                onClick={() => setPaymentMethod("BANK")}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "BANK"}
                  readOnly
                />
                <div className={`${styles.paymentIcon} ${styles.bank}`}>
                  <University style={{ width: 20, height: 20 }} />
                </div>
                <div className={styles.paymentDetails}>
                  <h4>Chuyển khoản ngân hàng</h4>
                  <p>Chuyển khoản trực tiếp đến tài khoản</p>
                </div>
              </div>

              <div
                className={`${styles.paymentOption} ${
                  paymentMethod === "CARD" ? styles.selected : ""
                }`}
                onClick={() => setPaymentMethod("CARD")}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "CARD"}
                  readOnly
                />
                <div className={`${styles.paymentIcon} ${styles.card}`}>
                  <CreditCard style={{ width: 20, height: 20 }} />
                </div>
                <div className={styles.paymentDetails}>
                  <h4>Thẻ Visa/Mastercard</h4>
                  <p>Thanh toán bằng thẻ quốc tế</p>
                </div>
              </div>
            </div>

            {/* Donor Information */}
            <h3 className={styles.sectionTitle}>
              <User style={{ width: 20, height: 20 }} />
              Thông tin người quyên góp
            </h3>

            <div className={styles.anonymousCheck}>
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              <label htmlFor="anonymous">Quyên góp ẩn danh (không hiển thị tên)</label>
            </div>

            {!isAnonymous && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      required={!isAnonymous}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      placeholder="0901 234 567"
                      value={donorPhone}
                      onChange={(e) => setDonorPhone(e.target.value)}
                      required={!isAnonymous}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className={`${styles.formGroup} ${styles.messageBox}`}>
              <label>Lời nhắn (tùy chọn)</label>
              <textarea
                placeholder="Gửi lời chúc đến những người khó khăn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={submitting}
            >
              <Heart style={{ width: 24, height: 24 }} />
              {submitting
                ? "Đang xử lý..."
                : `Xác nhận quyên góp ${formatMoney(amount)}đ`}
            </button>
          </form>
        </div>

        {/* Right - Summary */}
        <div className={styles.donationSummary}>
          <div className={styles.campaignPreview}>
            <div
              className={styles.campaignImage}
              style={{ backgroundImage: `url('${projectImage}')` }}
            >
              {project.uu_tien === "khan_cap" && (
                <span className={styles.campaignBadge}>Chiến dịch đặc biệt</span>
              )}
            </div>
            <div className={styles.campaignInfo}>
              <h3>{project.tieu_de}</h3>
              <div className={styles.campaignProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className={styles.progressText}>
                  <span className={styles.raised}>
                    {formatMoney(totalDonated)}đ
                  </span>
                  <span className={styles.goal}>
                    / {formatMoney(project.so_tien_muc_tieu)}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.summaryBox}>
            <h3>Tóm tắt quyên góp</h3>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Số tiền quyên góp</span>
              <span className={styles.value}>{formatMoney(amount)}đ</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Phương thức</span>
              <span className={styles.value}>{paymentMethodMap[paymentMethod]}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Chiến dịch</span>
              <span className={styles.value}>{project.tieu_de}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.label}>Phí giao dịch</span>
              <span className={styles.value} style={{ color: "#2E7D32" }}>
                Miễn phí
              </span>
            </div>
            <div className={styles.summaryTotal}>
              <span className={styles.label}>Tổng cộng</span>
              <span className={styles.value}>{formatMoney(amount)}đ</span>
            </div>

            <div className={styles.securityNote}>
              <ShieldCheck style={{ width: 20, height: 20 }} />
              <span>
                Giao dịch được bảo mật SSL 256-bit. 100% số tiền sẽ được chuyển đến
                chiến dịch.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
