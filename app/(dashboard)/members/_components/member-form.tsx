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
import { Plus, UserPlus } from "lucide-react"
import { addMember } from "@/lib/actions/member"
import { useState, useTransition } from "react"
import { toast } from "sonner"

export function MemberForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await addMember(formData)
        toast.success("Thêm thành viên thành công")
        setOpen(false)
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold hover-lift shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Thêm thành viên
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <UserPlus className="w-5 h-5" />
            <DialogTitle className="font-heading">Thêm thành viên mới</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Nhập thông tin thành viên. Quỹ các tháng đã qua sẽ tự động được ghi nhận là chưa đóng.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right text-sm font-semibold">
                Họ và Tên <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="fullName" 
                name="fullName" 
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right text-sm font-semibold">Vị trí</Label>
              <div className="col-span-3">
                <Select name="position">
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Chọn vị trí" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thủ môn" className="cursor-pointer">Thủ môn</SelectItem>
                    <SelectItem value="Hậu vệ" className="cursor-pointer">Hậu vệ</SelectItem>
                    <SelectItem value="Tiền vệ" className="cursor-pointer">Tiền vệ</SelectItem>
                    <SelectItem value="Tiền đạo" className="cursor-pointer">Tiền đạo</SelectItem>
                    <SelectItem value="Đa năng" className="cursor-pointer">Đa năng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jerseyNumber" className="text-right text-sm font-semibold">Số áo</Label>
              <Input 
                id="jerseyNumber" 
                name="jerseyNumber" 
                type="number" 
                min="1" 
                max="99" 
                placeholder="Ví dụ: 10"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right text-sm font-semibold">SĐT</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                placeholder="Số điện thoại liên hệ"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 w-full sm:w-auto hover-lift"
              disabled={isPending}
            >
              {isPending ? "Đang lưu..." : "Lưu thành viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
