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
import { Wallet } from "lucide-react"
import { payJerseyOrder } from "@/lib/actions/jersey"
import { useState, useTransition } from "react"
import { toast } from "sonner"

export function JerseyPayForm({ orderId, maxAmount }: { orderId: number, maxAmount: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const amount = parseInt(formData.get("amount") as string)
        if (amount > maxAmount) {
          toast.error("Số tiền thu lớn hơn số nợ")
          return
        }
        await payJerseyOrder(orderId, amount)
        toast.success("Thu tiền áo thành công")
        setOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" variant="outline" className="h-7 px-2 border-emerald-500/20 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer text-xs font-bold rounded-lg transition-colors">
          <Wallet className="h-3.5 w-3.5 mr-1" /> Thu tiền
        </Button>
      } />
      <DialogContent className="sm:max-w-[400px] glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Wallet className="w-5 h-5" />
            <DialogTitle className="font-heading">Thu tiền áo</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Nhập số tiền thành viên đóng (Tối đa: {maxAmount.toLocaleString('vi-VN')} ₫).
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-sm font-semibold">Số tiền <span className="text-red-500">*</span></Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                min="1" 
                max={maxAmount} 
                defaultValue={maxAmount} 
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 w-full sm:w-auto hover-lift"
              disabled={isPending}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận thu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
