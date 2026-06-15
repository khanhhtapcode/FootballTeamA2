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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-client"
import { Check, ClipboardList } from "lucide-react"

export function BulkFundForm({ year, members }: { year: number, members: { id: number, name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const month = parseInt(formData.get("month") as string)

        const memberIds = members
          .filter(m => formData.get(`member_${m.id}`) === "on")
          .map(m => m.id)

        if (memberIds.length === 0) {
          toast.error("Vui lòng chọn ít nhất một thành viên")
          return
        }

        await apiFetch("/api/funds/bulk", {
          method: "POST",
          body: { month, year, memberIds },
        })
        toast.success(`Đã thu quỹ ${memberIds.length} người trong tháng ${month}`)
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
          <Check className="mr-2 h-4 w-4" />
          Đóng quỹ hàng loạt
        </Button>
      } />
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ClipboardList className="w-5 h-5" />
            <DialogTitle className="font-heading">Đóng quỹ hàng loạt</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Chọn tháng và tích vào những thành viên đã đóng quỹ đầy đủ.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm">Chọn tháng đóng:</span>
              <Select name="month" value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || "")}>
                <SelectTrigger className="w-[130px] h-9 border-border bg-background/50 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()} className="cursor-pointer">Tháng {i+1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="border border-border/80 rounded-xl p-3 space-y-1 max-h-[300px] overflow-y-auto bg-muted/20">
              {members.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">Chưa có thành viên nào.</p>
              ) : (
                members.map(member => (
                  <label key={member.id} className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      name={`member_${member.id}`} 
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background cursor-pointer accent-primary bg-background" 
                    />
                    <span className="font-bold text-sm text-foreground">{member.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 w-full sm:w-auto hover-lift"
              disabled={isPending}
            >
              {isPending ? "Đang lưu..." : "Xác nhận thu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
