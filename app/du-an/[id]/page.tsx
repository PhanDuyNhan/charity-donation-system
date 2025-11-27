"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import type { QuyenGop } from "@/lib/types"
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Award,
  HeartHandshake,
  Heart,
  Facebook,
  Twitter,
  Copy,
  CheckCircle,
  HandHeart,
} from "lucide-react"
import styles from "./page.module.css"

/**
 * Trang chi tiết dự án - 100% theo HTML template
 * Không có fancy features, chỉ HTML thuần
 */

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [topDonors, setTopDonors] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"intro" | "updates" | "donors" | "comments">("intro")

  // Gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Amount selection
  const [selectedAmount, setSelectedAmount] = useState("1000000")
  const [customAmount, setCustomAmount] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiClient.getDuAn({ id: `eq.${id}` })
        if (!res || res.length === 0) {
          setError("Không tìm thấy dự án.")
          return
        }
        const duAn = res[0]
        setProject(duAn)

        try {
          const qg = await apiClient.getQuyenGop({
            ma_du_an: `eq.${duAn.id}`,
            select: "*,nguoi_dung(*)",
            order: "so_tien.desc",
            limit: 50,
          })
          setTopDonors(qg || [])
        } catch (err) {
          console.error("❌ Lỗi gọi quyen_gop:", err)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: "#757575" }}>
        Đang tải dữ liệu...
      </div>
    )

  if (error)
    return (
      <div style={{ textAlign: "center", padding: "100px 0", color: "#ef4444" }}>{error}</div>
    )

  if (!project) return null

  // Process gallery
  let thuVienAnh: string[] = []
  if (project.thu_vien_anh) {
    try {
      const raw = project.thu_vien_anh
      if (Array.isArray(raw)) {
        thuVienAnh = raw
      } else if (typeof raw === "string") {
        if (raw.trim().startsWith("[")) {
          try {
            const arr = JSON.parse(raw)
            if (Array.isArray(arr)) thuVienAnh = arr
          } catch {
            thuVienAnh = [raw]
          }
        } else {
          thuVienAnh = [raw]
        }
      }
    } catch {
      thuVienAnh = []
    }
  }

  thuVienAnh = thuVienAnh.map((img) =>
    img.startsWith("http") ? img : `https://j2ee.oshi.id.vn/${img.replace(/^\/+/, "")}`
  )

  if (thuVienAnh.length === 0) {
    thuVienAnh = ["/placeholder.svg"]
  }

  const currentImage = thuVienAnh[currentImageIndex]

  const progress =
    project.so_tien_muc_tieu > 0
      ? (project.so_tien_hien_tai / project.so_tien_muc_tieu) * 100
      : 0

  const daysRemaining = Math.ceil(
    (new Date(project.ngay_ket_thuc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % thuVienAnh.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + thuVienAnh.length) % thuVienAnh.length)
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = `${project.tieu_de} - Hãy cùng chung tay quyên góp!`

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
      case "zalo":
        window.open(`https://zalo.me/`, "_blank")
        break
      case "copy":
        navigator.clipboard.writeText(url)
        alert("Đã copy link!")
        break
    }
  }

  const handleDonateClick = () => {
    // Redirect to donation page with project ID
    router.push(`/quyen-gop?project=${project.id}`)
  }

  const amountOptions = [
    { value: "200000", label: "200K" },
    { value: "500000", label: "500K" },
    { value: "1000000", label: "1M" },
    { value: "2000000", label: "2M" },
    { value: "5000000", label: "5M" },
    { value: "10000000", label: "10M" },
  ]

  return (
    <div style={{ background: "#F5F5F5", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb} style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 50px" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); router.push("/") }}>Trang chủ</a>
        <span>/</span>
        <a href="/du-an" onClick={(e) => { e.preventDefault(); router.push("/du-an") }}>Chiến dịch</a>
        <span>/</span>
        <span>Chi tiết chiến dịch</span>
      </div>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Gallery */}
          <div className={styles.campaignGallery}>
            <div
              className={styles.mainImage}
              style={{ backgroundImage: `url('${currentImage}')` }}
            >
              {project.uu_tien === "khan_cap" && (
                <span className={styles.imageBadge}>
                  <Award style={{ width: 16, height: 16, display: "inline", marginRight: 5 }} />
                  Chiến dịch đặc biệt
                </span>
              )}
              {thuVienAnh.length > 1 && (
                <div className={styles.imageNav}>
                  <button onClick={prevImage}>
                    <ChevronLeft style={{ width: 20, height: 20 }} />
                  </button>
                  <button onClick={nextImage}>
                    <ChevronRight style={{ width: 20, height: 20 }} />
                  </button>
                </div>
              )}
            </div>

            {thuVienAnh.length > 1 && (
              <div className={styles.thumbnailRow}>
                {thuVienAnh.slice(0, 8).map((img, i) => (
                  <div
                    key={i}
                    className={`${styles.thumbnail} ${i === currentImageIndex ? styles.active : ""}`}
                    style={{ backgroundImage: `url('${img}')` }}
                    onClick={() => setCurrentImageIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Campaign Info */}
          <div className={styles.campaignInfo}>
            <h1>{project.tieu_de}</h1>

            <div className={styles.campaignMeta}>
              <div className={styles.metaItem}>
                <Calendar style={{ width: 18, height: 18 }} />
                <span>Còn {daysRemaining} ngày</span>
              </div>
              <div className={styles.metaItem}>
                <Users style={{ width: 18, height: 18 }} />
                <span>{topDonors.length} người đã ủng hộ</span>
              </div>
              {project.dia_diem && (
                <div className={styles.metaItem}>
                  <MapPin style={{ width: 18, height: 18 }} />
                  <span>{project.dia_diem}</span>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "intro" ? styles.active : ""}`}
                onClick={() => setActiveTab("intro")}
              >
                Giới thiệu
              </button>
              <button
                className={`${styles.tab} ${activeTab === "updates" ? styles.active : ""}`}
                onClick={() => setActiveTab("updates")}
              >
                Cập nhật (0)
              </button>
              <button
                className={`${styles.tab} ${activeTab === "donors" ? styles.active : ""}`}
                onClick={() => setActiveTab("donors")}
              >
                Nhà hảo tâm ({topDonors.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === "comments" ? styles.active : ""}`}
                onClick={() => setActiveTab("comments")}
              >
                Bình luận (0)
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === "intro" && (
                <div>
                  <h3>
                    <HeartHandshake style={{ width: 20, height: 20 }} />
                    Về chiến dịch
                  </h3>
                  <p style={{ whiteSpace: "pre-line" }}>
                    {project.mo_chi_tiet || project.mo_ta || "Không có mô tả chi tiết"}
                  </p>

                  <div className={styles.highlightBox}>
                    <h4>
                      <Award style={{ width: 20, height: 20 }} />
                      Mục tiêu chiến dịch
                    </h4>
                    <ul>
                      <li>Mục tiêu quyên góp: {formatMoney(project.so_tien_muc_tieu)} đ</li>
                      <li>Số người hưởng lợi: {project.so_nguoi_thu_huong} người</li>
                      <li>Địa điểm thực hiện: {project.dia_diem}</li>
                      <li>
                        Thời gian: {new Date(project.ngay_bat_dau).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(project.ngay_ket_thuc).toLocaleDateString("vi-VN")}
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "updates" && (
                <p style={{ textAlign: "center", padding: "40px 0", color: "#757575" }}>
                  Chưa có cập nhật mới.
                </p>
              )}

              {activeTab === "donors" && (
                <div>
                  <h3>
                    <Heart style={{ width: 20, height: 20, color: "#F44336" }} />
                    Danh sách nhà hảo tâm
                  </h3>
                  {topDonors.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "40px 0", color: "#757575" }}>
                      Chưa có ai quyên góp.
                    </p>
                  ) : (
                    <div>
                      {topDonors.map((d) => (
                        <div key={d.id} className={styles.donorItem}>
                          <div className={styles.donorAvatar}>
                            {d.la_quyen_gop_an_danh
                              ? "?"
                              : d.nguoi_dung?.ho?.charAt(0) + d.nguoi_dung?.ten?.charAt(0)}
                          </div>
                          <div className={styles.donorInfo}>
                            <h4>
                              {d.la_quyen_gop_an_danh
                                ? "Ẩn danh"
                                : `${d.nguoi_dung?.ho} ${d.nguoi_dung?.ten}`}
                            </h4>
                            <p>{new Date(d.ngay_tao).toLocaleString("vi-VN")}</p>
                            {d.loi_nhan && <p className={styles.donorMessage}>"{d.loi_nhan}"</p>}
                          </div>
                          <div className={styles.donorAmount}>{formatMoney(d.so_tien)} đ</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <p style={{ textAlign: "center", padding: "40px 0", color: "#757575" }}>
                  Chưa có bình luận nào.
                </p>
              )}
            </div>
          </div>

          {/* Donors Section (Gần đây) */}
          {topDonors.length > 0 && (
            <div className={styles.donorsSection}>
              <div className={styles.donorsHeader}>
                <h3>
                  <Heart style={{ width: 20, height: 20, color: "#F44336" }} />
                  Nhà hảo tâm gần đây
                </h3>
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("donors") }}>
                  Xem tất cả →
                </a>
              </div>

              {topDonors.slice(0, 4).map((d) => (
                <div key={d.id} className={styles.donorItem}>
                  <div className={styles.donorAvatar}>
                    {d.la_quyen_gop_an_danh
                      ? "?"
                      : d.nguoi_dung?.ho?.charAt(0) + d.nguoi_dung?.ten?.charAt(0)}
                  </div>
                  <div className={styles.donorInfo}>
                    <h4>
                      {d.la_quyen_gop_an_danh
                        ? "Ẩn danh"
                        : `${d.nguoi_dung?.ho} ${d.nguoi_dung?.ten}`}
                    </h4>
                    <p>
                      {Math.floor(
                        (new Date().getTime() - new Date(d.ngay_tao).getTime()) / 60000
                      )}{" "}
                      phút trước
                    </p>
                  </div>
                  <div className={styles.donorAmount}>{formatMoney(d.so_tien)} đ</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          {/* Donation Box */}
          <div className={styles.donationBox}>
            <div className={styles.progressSection}>
              <div className={styles.amountRaised}>{formatMoney(project.so_tien_hien_tai)} đ</div>
              <div className={styles.amountTarget}>
                đã quyên góp / mục tiêu {formatMoney(project.so_tien_muc_tieu)} đ
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <div className={styles.progressStats}>
                <span>
                  Đạt <strong>{Math.round(progress)}%</strong>
                </span>
                <span>
                  Còn <strong>{daysRemaining} ngày</strong>
                </span>
              </div>
            </div>

            <div className={styles.donationStats}>
              <div className={styles.statItem}>
                <h4>{topDonors.length}</h4>
                <p>Lượt ủng hộ</p>
              </div>
              <div className={styles.statItem}>
                <h4>{daysRemaining}</h4>
                <p>Ngày còn lại</p>
              </div>
              <div className={styles.statItem}>
                <h4>{topDonors.length}</h4>
                <p>Lượt chia sẻ</p>
              </div>
            </div>

            <div className={styles.amountOptions}>
              {amountOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.amountBtn} ${selectedAmount === opt.value ? styles.active : ""}`}
                  onClick={() => {
                    setSelectedAmount(opt.value)
                    setCustomAmount("")
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className={styles.customAmount}>
              <input
                type="text"
                placeholder="Nhập số tiền khác"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount("")
                }}
              />
              <span>VNĐ</span>
            </div>

            <button className={styles.btnDonate} onClick={handleDonateClick}>
              <HandHeart style={{ width: 24, height: 24 }} />
              Quyên góp ngay
            </button>

            <div className={styles.shareSection}>
              <p>Chia sẻ chiến dịch này</p>
              <div className={styles.shareButtons}>
                <button
                  className={`${styles.shareBtn} ${styles.facebook}`}
                  onClick={() => handleShare("facebook")}
                  title="Facebook"
                >
                  <Facebook style={{ width: 20, height: 20 }} />
                </button>
                <button
                  className={`${styles.shareBtn} ${styles.twitter}`}
                  onClick={() => handleShare("twitter")}
                  title="Twitter"
                >
                  <Twitter style={{ width: 20, height: 20 }} />
                </button>
                <button
                  className={`${styles.shareBtn} ${styles.zalo}`}
                  onClick={() => handleShare("zalo")}
                  title="Zalo"
                >
                  Z
                </button>
                <button
                  className={`${styles.shareBtn} ${styles.copy}`}
                  onClick={() => handleShare("copy")}
                  title="Copy link"
                >
                  <Copy style={{ width: 20, height: 20 }} />
                </button>
              </div>
            </div>
          </div>

          {/* Organizer Box */}
          <div className={styles.organizerBox}>
            <h3>Đơn vị tổ chức</h3>
            <div className={styles.organizerInfo}>
              <div className={styles.organizerAvatar}>Q</div>
              <div className={styles.organizerDetails}>
                <h4>Quỹ Từ Thiện Xanh</h4>
                <p>Thành lập 2018 • 328 dự án</p>
                <div className={styles.verifiedBadge}>
                  <CheckCircle style={{ width: 14, height: 14 }} />
                  Đã xác minh
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
