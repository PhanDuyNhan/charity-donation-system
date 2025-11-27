"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import type { TinTuc } from "@/lib/types"
import Link from "next/link"

export default function ChinhSuaTinTucPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<TinTuc>>({
    tieu_de: "",
    noi_dung: "",
    anh_dai_dien: "",
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const data = await apiClient.getTinTuc({ id: `eq.${id}` })
      if (data.length > 0) {
        setFormData(data[0])
      }
    } catch (err) {
      alert("Không thể tải dữ liệu!")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await apiClient.updateTinTuc(id, formData)
      alert("Cập nhật thành công!")
      router.push("/admin/tin-tuc")
    } catch (error) {
      alert("Không thể cập nhật!")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-10">Đang tải...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/tin-tuc">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Chỉnh sửa Tin tức</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tin tức</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Tiêu đề *</Label>
              <Input
                required
                value={formData.tieu_de}
                onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Nội dung *</Label>
              <Textarea
                required
                rows={10}
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ảnh đại diện (URL)</Label>
              <Input
                type="url"
                value={formData.anh_dai_dien || ""}
                onChange={(e) => setFormData({ ...formData, anh_dai_dien: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 w-4 h-4" />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>

              <Link href="/admin/tin-tuc">
                <Button variant="outline">Hủy</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
