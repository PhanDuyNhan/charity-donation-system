"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import type { DuAn, DanhMucDuAn, MucDoUuTien, TrangThaiDuAn, UploadResponse } from "@/lib/types"
import { Dialog as Lightbox, DialogContent as LightboxContent } from "@/components/ui/dialog"
import { Upload, Image as ImageIcon, X } from "lucide-react"

// --- Helper Component for Form Fields ---
const FormField = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
  <div>
    <Label className="text-sm font-medium text-blue-300">{label}</Label>
    <div className="mt-1">{children}</div>
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
  </div>
)

export function EditProjectDialog({
  project,
  onClose,
  onUpdated,
}: {
  project: DuAn | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [formData, setFormData] = useState<Partial<DuAn>>(project ? { ...project } : {})
  const [cats, setCats] = useState<DanhMucDuAn[]>([])
  const [loading, setLoading] = useState(false)
  const [catLoading, setCatLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(project?.anh_dai_dien ?? null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (project) {
      setFormData({ ...project })
      setImagePreview(project.anh_dai_dien ?? null)
    }
  }, [project])

  useEffect(() => {
    const loadCats = async () => {
      setCatLoading(true)
      try {
        const data = await apiClient.getDanhMucDuAn()
        setCats(data)
      } catch (err) {
        console.error("Lỗi tải danh mục:", err)
      } finally {
        setCatLoading(false)
      }
    }
    loadCats()
  }, [])

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/đ/g, "d")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setFormData((p) => ({
      ...p,
      tieu_de: v,
      duong_dan: !p.duong_dan ? slugify(v) : p.duong_dan,
    }))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isNumber = false
  ) => {
    const { name, value } = e.target
    setFormData((p) => ({
      ...p,
      [name]: isNumber ? (value === "" ? undefined : Number(value)) : value,
    }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const resp: UploadResponse = await apiClient.uploadFile(file)
      const path = resp?.path ?? resp?.url ?? String(resp)
      setFormData((p) => ({ ...p, anh_dai_dien: path }))
      setImagePreview(path)
    } catch (err) {
      alert("Upload ảnh thất bại.")
    } finally {
      setUploading(false)
      e.currentTarget.value = ""
    }
  }

  const validate = () => {
    const newErr: Record<string, string> = {}
    if (!formData.tieu_de?.trim()) newErr.tieu_de = "Tiêu đề không được để trống"
    const soTien = Number(formData.so_tien_muc_tieu)
    if (!Number.isFinite(soTien) || soTien <= 0)
      newErr.so_tien_muc_tieu = "Số tiền mục tiêu phải là một số lớn hơn 0"
    setErrors(newErr)
    return Object.keys(newErr).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload: any = { ...formData }
      // Không cho phép cập nhật số tiền hiện tại từ form này
      delete payload.so_tien_hien_tai
      await apiClient.updateDuAn((project as DuAn).id, payload)
      onUpdated()
      onClose()
    } catch (err) {
      console.error("Lỗi cập nhật:", err)
      alert("Cập nhật thất bại")
    } finally {
      setLoading(false)
    }
  }

  if (!project) return null

  const getFullImageUrl = (path?: string | null): string | null => {
    if (!path) return null
    if (path.startsWith("http")) return path
    // Giả sử có một biến môi trường cho URL cơ sở của API/ảnh
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"
    return `${baseUrl}${path}`
  }

  const finalImagePreview = getFullImageUrl(imagePreview)

  return (
    <>
      <Dialog open={!!project} onOpenChange={onClose}>
        <DialogContent
          className="w-[95vw] max-w-[1500px] h-[90vh] bg-slate-900 text-slate-100 
             border border-slate-700 shadow-2xl rounded-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <DialogHeader className="flex-shrink-0 border-b border-slate-700 p-6 bg-slate-950">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              🖊️ Cập nhật dự án
            </DialogTitle>
            <p className="text-slate-400 text-sm mt-1">Chỉnh sửa toàn bộ thông tin dự án (trừ số tiền hiện tại)</p>
          </DialogHeader>

          {/* Nội dung chính */}
          <div className="flex-1 overflow-y-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột trái: Thông tin */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/60 p-5 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Thông tin cơ bản</h3>
                <div className="space-y-4">
                  <FormField label="Tiêu đề *" error={errors.tieu_de}>
                    <Input name="tieu_de" value={formData.tieu_de ?? ""} onChange={handleTitleChange} />
                  </FormField>
                  <FormField label="Đường dẫn (slug)">
                    <Input name="duong_dan" value={formData.duong_dan ?? ""} onChange={(e) => handleChange(e)} />
                  </FormField>
                  <FormField label="Mô tả ngắn">
                    <Textarea name="mo_ta_ngan" rows={2} value={formData.mo_ta_ngan ?? ""} onChange={(e) => handleChange(e)} />
                  </FormField>
                  <FormField label="Mô tả chi tiết">
                    <Textarea name="mo_ta" rows={5} value={formData.mo_ta ?? ""} onChange={(e) => handleChange(e)} />
                  </FormField>
                </div>
              </div>

              <div className="bg-slate-800/60 p-5 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Thời gian & Mục tiêu</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Ngày bắt đầu">
                    <Input type="date" name="ngay_bat_dau" value={formData.ngay_bat_dau?.slice(0, 10) ?? ""} onChange={(e) => handleChange(e)} />
                  </FormField>
                  <FormField label="Ngày kết thúc">
                    <Input type="date" name="ngay_ket_thuc" value={formData.ngay_ket_thuc?.slice(0, 10) ?? ""} onChange={(e) => handleChange(e)} />
                  </FormField>
                  <FormField label="Số tiền mục tiêu (VNĐ) *" error={errors.so_tien_muc_tieu}>
                    <Input type="number" name="so_tien_muc_tieu" value={formData.so_tien_muc_tieu ?? ""} onChange={(e) => handleChange(e, true)} />
                  </FormField>
                  <FormField label="Số người hưởng lợi">
                    <Input type="number" name="so_nguoi_thu_huong" value={formData.so_nguoi_thu_huong ?? ""} onChange={(e) => handleChange(e, true)} />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-6">
              <div className="bg-slate-800/60 p-5 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Phân loại</h3>
                <div className="space-y-4">
                  <FormField label="Danh mục">
                    <Select
                      value={String(formData.ma_danh_muc ?? "0")}
                      onValueChange={(v) => setFormData((p) => ({ ...p, ma_danh_muc: v === "0" ? undefined : Number(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">-- Không chọn --</SelectItem>
                        {cats.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.ten}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Mức độ ưu tiên">
                    <Select
                      value={formData.muc_do_uu_tien ?? "trung_binh"}
                      onValueChange={(v) => setFormData((p) => ({ ...p, muc_do_uu_tien: v as any }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Chọn ưu tiên" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="khan_cap">Khẩn cấp</SelectItem>
                        <SelectItem value="cao">Cao</SelectItem>
                        <SelectItem value="trung_binh">Trung bình</SelectItem>
                        <SelectItem value="thap">Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </div>

              <div className="bg-slate-800/60 p-5 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-sky-400 mb-4">Ảnh đại diện</h3>
                <div className="space-y-3">
                  <div className="w-full aspect-video bg-slate-700/40 border border-slate-600 rounded-md overflow-hidden relative group">
                    {finalImagePreview ? (
                      <>
                        <img src={finalImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div
                          onClick={() => setLightboxOpen(true)}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          Xem ảnh lớn
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                        <span className="mt-2 text-sm">Chưa có ảnh</span>
                      </div>
                    )}
                  </div>

                  <FormField label="URL ảnh đại diện">
                    <Input
                      name="anh_dai_dien"
                      value={formData.anh_dai_dien ?? ""}
                      onChange={(e) => { handleChange(e); setImagePreview(e.target.value) }}
                    />
                  </FormField>

                  <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-shrink-0 border-t border-slate-700 p-4 bg-slate-950 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white">Hủy</Button>
            <Button
              onClick={handleSave}
              disabled={loading || uploading}
              className="bg-sky-600 hover:bg-sky-500 text-white"
            >
              {loading ? "Đang lưu..." : "Cập nhật dự án"}
            </Button>
          </DialogFooter>
        </DialogContent>



      </Dialog>

      {/* LIGHTBOX IMAGE */}
      {finalImagePreview && (
        <Lightbox open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <LightboxContent className="max-w-4xl bg-transparent border-none shadow-none">
            <img src={finalImagePreview} alt="Preview Large" className="w-full h-auto rounded-lg" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/80" onClick={() => setLightboxOpen(false)}>
              <X />
            </Button>
          </LightboxContent>
        </Lightbox>
      )}
    </>
  )
}


