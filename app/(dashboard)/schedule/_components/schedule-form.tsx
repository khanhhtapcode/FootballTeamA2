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
import { Plus, CalendarDays } from "lucide-react"
import { addSchedule } from "@/lib/actions/schedule"
import { useState, useTransition } from "react"
import { toast } from "sonner"

export function ScheduleForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await addSchedule(formData)
        toast.success("Thêm lịch thi đấu thành công")
        setOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold hover-lift shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Thêm lịch thi đấu
        </Button>
      } />
      <DialogContent className="sm:max-w-[450px] glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <CalendarDays className="w-5 h-5" />
            <DialogTitle className="font-heading">Lên lịch thi đấu</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Điền thông tin trận đấu sắp tới của đội bóng.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-sm font-semibold">Ngày giờ <span className="text-red-500">*</span></Label>
              <Input 
                id="date" 
                name="date" 
                type="datetime-local" 
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="opponent" className="text-right text-sm font-semibold">Đối thủ <span className="text-red-500">*</span></Label>
              <Input 
                id="opponent" 
                name="opponent" 
                placeholder="Tên đội đối thủ"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right text-sm font-semibold">Sân đấu</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="VD: Sân cỏ nhân tạo A2"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-sm font-semibold">Trạng thái <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select name="status" required defaultValue="Chờ xác nhận">
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đã xác nhận" className="cursor-pointer">Đã xác nhận</SelectItem>
                    <SelectItem value="Chờ xác nhận" className="cursor-pointer">Chờ xác nhận</SelectItem>
                    <SelectItem value="Đã hủy" className="cursor-pointer">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right text-sm font-semibold">Ghi chú</Label>
              <Input 
                id="notes" 
                name="notes" 
                placeholder="VD: Mang áo màu đỏ"
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
              {isPending ? "Đang lưu..." : "Lưu lịch thi đấu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
