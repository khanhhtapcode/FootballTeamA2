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
import { Plus, CalendarDays, CalendarIcon, Pencil } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type ScheduleFormData = {
  id: number
  date: string
  opponent: string
  location: string | null
  status: string
  notes: string | null
}

function getInitialDate(schedule?: ScheduleFormData) {
  if (!schedule?.date) return new Date()

  const parsedDate = new Date(schedule.date)

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date()
  }

  return parsedDate
}

function getInitialTime(schedule?: ScheduleFormData) {
  if (!schedule?.date) return "18:00"

  const parsedDate = new Date(schedule.date)

  if (Number.isNaN(parsedDate.getTime())) {
    return "18:00"
  }

  return format(parsedDate, "HH:mm")
}

export function ScheduleForm({ schedule }: { schedule?: ScheduleFormData }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState<Date>(getInitialDate(schedule))
  const [time, setTime] = useState<string>(getInitialTime(schedule))
  const router = useRouter()
  const isEdit = !!schedule

  useEffect(() => {
    if (open) {
      setDate(getInitialDate(schedule))
      setTime(getInitialTime(schedule))
    }
  }, [open, schedule])

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const payload = {
          date: formData.get("date"),
          opponent: formData.get("opponent"),
          location: formData.get("location"),
          status: formData.get("status"),
          notes: formData.get("notes"),
        }

        if (isEdit) {
          await apiFetch(`/api/schedules/${schedule.id}`, {
            method: "PUT",
            body: payload,
          })

          toast.success("Cập nhật lịch thi đấu thành công")
        } else {
          await apiFetch("/api/schedules", {
            method: "POST",
            body: payload,
          })

          toast.success("Thêm lịch thi đấu thành công")
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
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs font-bold border-blue-500/20 text-blue-500 hover:bg-blue-500/10"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Sửa
          </Button>
        ) : (
          <Button className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold hover-lift shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm lịch thi đấu
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-112.5 glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <CalendarDays className="w-5 h-5" />
            <DialogTitle className="font-heading">
              {isEdit ? "Cập nhật lịch thi đấu" : "Lên lịch thi đấu"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            {isEdit ? "Chỉnh sửa thông tin lịch thi đấu của đội bóng." : "Điền thông tin trận đấu sắp tới của đội bóng."}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-sm font-semibold">Ngày giờ <span className="text-red-500">*</span></Label>
              <div className="col-span-3 flex gap-2">
                <Popover>
                  <PopoverTrigger 
                    render={
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 border-border bg-background/50 hover:bg-background/80 focus:border-primary flex-1",
                          !date && "text-muted-foreground"
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                    />
                  </PopoverContent>
                </Popover>

                <div className="relative w-32 shrink-0">
                  <Input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20 w-full"
                    required
                  />
                </div>
                
                <input type="hidden" name="date" value={`${date ? format(date, "yyyy-MM-dd") : ''}T${time}`} />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="opponent" className="text-right text-sm font-semibold">Đối thủ <span className="text-red-500">*</span></Label>
              <Input 
                id="opponent" 
                name="opponent" 
                defaultValue={schedule?.opponent || ""}
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
                defaultValue={schedule?.location || ""}
                placeholder="VD: Sân cỏ nhân tạo A2"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right text-sm font-semibold">Trạng thái <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select name="status" required defaultValue={schedule?.status || "Chờ xác nhận"}>
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
                defaultValue={schedule?.notes || ""}
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
              {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu lịch thi đấu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
