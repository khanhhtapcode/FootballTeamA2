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
import { Plus, Trophy, CalendarIcon } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function MatchForm() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState<Date>(new Date())
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await apiFetch("/api/matches", {
          method: "POST",
          body: {
            date: formData.get("date"),
            opponent: formData.get("opponent"),
            location: formData.get("location"),
            score: formData.get("score"),
            result: formData.get("result"),
            playersCount: formData.get("playersCount"),
            pitchFee: formData.get("pitchFee"),
            scorers: formData.get("scorers"),
          },
        })
        toast.success("Thêm trận đấu thành công")
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
        <Button className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold hover-lift shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Thêm trận đấu
        </Button>
      } />
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Trophy className="w-5 h-5" />
            <DialogTitle className="font-heading">Thêm kết quả trận đấu</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Điền thông tin kết quả. Chi phí sân sẽ tự động được thêm vào bảng Chi Phí.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-sm font-semibold">Ngày <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger 
                    render={
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 border-border bg-background/50 hover:bg-background/80 focus:border-primary",
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
                <input type="hidden" name="date" value={date ? date.toISOString().split('T')[0] : ''} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="opponent" className="text-right text-sm font-semibold">Đối thủ <span className="text-red-500">*</span></Label>
              <Input 
                id="opponent" 
                name="opponent" 
                placeholder="Tên đội bạn"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right text-sm font-semibold">Sân đấu</Label>
              <Input 
                id="location" 
                name="location" 
                placeholder="Tên sân bóng"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right text-sm font-semibold">Tỷ số</Label>
              <Input 
                id="score" 
                name="score" 
                placeholder="VD: 3-1" 
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="result" className="text-right text-sm font-semibold">Kết quả <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select name="result" defaultValue="Thắng" required>
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Kết quả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thắng" className="cursor-pointer">Thắng</SelectItem>
                    <SelectItem value="Hòa" className="cursor-pointer">Hòa</SelectItem>
                    <SelectItem value="Thua" className="cursor-pointer">Thua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="playersCount" className="text-right text-sm font-semibold">Số người <span className="text-red-500">*</span></Label>
              <Input 
                id="playersCount" 
                name="playersCount" 
                type="number" 
                min="1" 
                placeholder="Số cầu thủ tham gia chia tiền"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pitchFee" className="text-right text-sm font-semibold">Phí sân (₫)</Label>
              <Input 
                id="pitchFee" 
                name="pitchFee" 
                type="number" 
                min="0" 
                defaultValue="0" 
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scorers" className="text-right text-sm font-semibold">Ghi bàn</Label>
              <Input 
                id="scorers" 
                name="scorers" 
                placeholder="VD: Cường(2), Tuấn(1)" 
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
              {isPending ? "Đang lưu..." : "Lưu kết quả"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
