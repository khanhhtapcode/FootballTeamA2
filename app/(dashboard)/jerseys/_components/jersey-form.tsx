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
import { Plus, Shirt } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function JerseyForm({ members }: { members: { id: number, name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await apiFetch("/api/jerseys", {
          method: "POST",
          body: {
            memberId: formData.get("memberId"),
            jerseyNumber: formData.get("jerseyNumber"),
            size: formData.get("size"),
            description: formData.get("description"),
            quantity: formData.get("quantity"),
            unitPrice: formData.get("unitPrice"),
            isFree: formData.get("isFree") === "on",
          },
        })
        toast.success("Thêm đơn áo thành công")
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
          Thêm đơn áo
        </Button>
      } />
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Shirt className="w-5 h-5" />
            <DialogTitle className="font-heading">Thêm đơn áo</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            Đăng ký áo đấu và ghi nhận thanh toán cho thành viên.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memberId" className="text-right text-sm font-semibold">Thành viên <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select name="memberId" required>
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Chọn thành viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id.toString()} className="cursor-pointer">{m.name}</SelectItem>
                    ))}
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
                placeholder="VD: 10"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right text-sm font-semibold">Size</Label>
              <div className="col-span-3">
                <Select name="size">
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Chọn size" />
                  </SelectTrigger>
                  <SelectContent>
                    {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map(s => (
                      <SelectItem key={s} value={s} className="cursor-pointer">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-sm font-semibold">Màu/Loại</Label>
              <Input 
                id="description" 
                name="description" 
                placeholder="VD: Đỏ sân nhà"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right text-sm font-semibold">Số lượng <span className="text-red-500">*</span></Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number" 
                min="1" 
                defaultValue="1" 
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitPrice" className="text-right text-sm font-semibold">Đơn giá (₫) <span className="text-red-500">*</span></Label>
              <Input 
                id="unitPrice" 
                name="unitPrice" 
                type="number" 
                min="0" 
                placeholder="Ví dụ: 180000"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20" 
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isFree" className="text-right text-sm font-semibold">Miễn phí</Label>
              <input 
                id="isFree" 
                name="isFree" 
                type="checkbox" 
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary bg-background" 
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 w-full sm:w-auto hover-lift"
              disabled={isPending}
            >
              {isPending ? "Đang lưu..." : "Lưu đơn áo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
