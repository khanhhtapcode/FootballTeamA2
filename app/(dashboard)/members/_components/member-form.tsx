"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, UserPlus, UserCog, Upload } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function MemberForm({ member }: { member?: any }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  // State để lưu ảnh xem trước (preview)
  const [preview, setPreview] = useState<string | null>(member?.avatarUrl || null)
  const isEdit = !!member;

  // Cập nhật lại preview mỗi khi mở/đóng form
  useEffect(() => {
    if (open) {
      setPreview(member?.avatarUrl || null)
    }
  }, [open, member])

  // Hàm xử lý hiển thị ảnh ngay lập tức khi vừa chọn file
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh")
      e.target.value = ""
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 4MB")
      e.target.value = ""
      return
    }

    const imageUrl = URL.createObjectURL(file)
    setPreview(imageUrl)
  }

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        let avatarUrl: string | null = member?.avatarUrl || null
        const file = formData.get("avatar")

        // Nếu có chọn ảnh mới thì upload lên Cloudinary
        if (file instanceof File && file.size > 0) {
          if (!file.type.startsWith("image/")) {
            throw new Error("File tải lên phải là ảnh")
          }

          if (file.size > 4 * 1024 * 1024) {
            throw new Error("Ảnh không được vượt quá 4MB")
          }

          const uploadData = new FormData()
          uploadData.append("file", file)

          const uploadRes = await fetch("/api/upload/avatar", {
            method: "POST",
            body: uploadData,
          })

          const uploadResult = await uploadRes.json()

          if (!uploadRes.ok) {
            throw new Error(
              uploadResult?.error ||
                uploadResult?.message ||
                "Upload ảnh thất bại"
            )
          }

          const uploadedUrl = uploadResult?.data?.url || uploadResult?.url

          if (!uploadedUrl) {
            throw new Error("Không nhận được URL ảnh từ Cloudinary")
          }

          avatarUrl = uploadedUrl
        }

        const payload = {
          fullName: formData.get("fullName"),
          position: formData.get("position"),
          jerseyNumber: formData.get("jerseyNumber"),
          phone: formData.get("phone"),
          avatarUrl,
        }

        if (isEdit) {
          await apiFetch(`/api/members/${member.id}`, {
            method: "PUT",
            body: payload,
          })

          toast.success("Cập nhật thành viên thành công")
        } else {
          await apiFetch("/api/members", {
            method: "POST",
            body: payload,
          })

          toast.success("Thêm thành viên thành công")
        }

        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        isEdit ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
            <UserCog className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold hover-lift shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm thành viên
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[450px] glass-panel border border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            {isEdit ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            <DialogTitle className="font-heading">
              {isEdit ? "Cập nhật thành viên" : "Thêm thành viên mới"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            {isEdit ? "Chỉnh sửa thông tin cá nhân và ảnh đại diện." : "Nhập thông tin. Quỹ các tháng đã qua sẽ được ghi nhận là chưa đóng."}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            
            {/* --- KHU VỰC ẢNH ĐẠI DIỆN --- */}
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
              <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center overflow-hidden bg-muted/50">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>
              <Label htmlFor="avatar-upload" className="cursor-pointer text-xs text-primary font-medium hover:underline">
                {isEdit ? "Đổi ảnh đại diện" : "Tải ảnh lên"}
              </Label>
              <Input 
                id="avatar-upload" name="avatar" type="file" accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>
            
            {/* Các input khác */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right text-sm font-semibold">Họ Tên <span className="text-red-500">*</span></Label>
              <Input id="fullName" name="fullName" defaultValue={member?.fullName} required className="col-span-3 h-10 border-border bg-background/50 focus:border-primary" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right text-sm font-semibold">Vị trí</Label>
              <div className="col-span-3">
                <Select name="position" defaultValue={member?.position || undefined}>
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thủ môn">Thủ môn</SelectItem>
                    <SelectItem value="Hậu vệ">Hậu vệ</SelectItem>
                    <SelectItem value="Tiền vệ">Tiền vệ</SelectItem>
                    <SelectItem value="Tiền đạo">Tiền đạo</SelectItem>
                    <SelectItem value="Đa năng">Đa năng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jerseyNumber" className="text-right text-sm font-semibold">Số áo</Label>
              <Input id="jerseyNumber" name="jerseyNumber" type="number" min="1" max="99" defaultValue={member?.jerseyNumber || ""} placeholder="VD: 10" className="col-span-3 h-10 border-border bg-background/50 focus:border-primary" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right text-sm font-semibold">SĐT</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={member?.phone || ""} placeholder="Số điện thoại" className="col-span-3 h-10 border-border bg-background/50 focus:border-primary" />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 w-full sm:w-auto" disabled={isPending}>
              {isPending ? "Đang lưu..." : (isEdit ? "Cập nhật" : "Lưu thành viên")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}