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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Receipt, CalendarIcon, Pencil } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

type MemberOption = {
  id: number
  fullName: string
  jerseyNumber: number | null
  position: string | null
}

type ExpenseFormData = {
  id: number
  date: string
  category: string
  description: string
  amount: number
  spender: string | null
  source: string
  notes: string | null
  matchId?: number | null
}

export function ExpenseForm({
  members,
  expense,
}: {
  members: MemberOption[]
  expense?: ExpenseFormData
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState<Date>(
    expense?.date ? new Date(expense.date) : new Date()
  )
  const [source, setSource] = useState(expense?.source || "Quỹ đội")
  const router = useRouter()
  const isEdit = !!expense

  useEffect(() => {
    if (open) {
      startTransition(() => {
        setDate(expense?.date ? new Date(expense.date) : new Date())
        setSource(expense?.source || "Quỹ đội")
      })
    }
  }, [open, expense])

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const rawSpender = formData.get("spender")?.toString()
        const spender = rawSpender === "__none__" ? null : rawSpender

        const payload = {
          date: formData.get("date"),
          category: formData.get("category"),
          description: formData.get("description"),
          amount: formData.get("amount"),
          spender,
          source: formData.get("source"),
          notes: formData.get("notes"),
        }

        if (isEdit) {
          await apiFetch(`/api/expenses/${expense.id}`, {
            method: "PUT",
            body: payload,
          })

          toast.success("Cập nhật chi phí thành công")
        } else {
          await apiFetch("/api/expenses", {
            method: "POST",
            body: payload,
          })

          toast.success("Thêm chi phí thành công")
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
      <DialogTrigger
        render={
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
              Thêm chi phí
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-[500px] glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Receipt className="w-5 h-5" />
            <DialogTitle className="font-heading">
              {isEdit ? "Cập nhật chi phí" : "Ghi nhận chi phí mới"}
            </DialogTitle>
          </div>

          <DialogDescription className="text-muted-foreground text-xs">
            Điền thông tin chi phí. Những khoản chi từ Quỹ đội sẽ tự động trừ vào tổng tồn quỹ.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Ngày */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-sm font-semibold">
                Ngày <span className="text-red-500">*</span>
              </Label>

              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
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

                <input
                  type="hidden"
                  name="date"
                  value={date ? date.toISOString().split("T")[0] : ""}
                />
              </div>
            </div>

            {/* Loại */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-sm font-semibold">
                Loại <span className="text-red-500">*</span>
              </Label>

              <div className="col-span-3">
                <Select name="category" required defaultValue={expense?.category || "Tiền sân"}>
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Chọn loại chi phí" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Tiền sân" className="cursor-pointer">
                      Tiền sân
                    </SelectItem>
                    <SelectItem value="Mua bóng" className="cursor-pointer">
                      Mua bóng
                    </SelectItem>
                    <SelectItem value="Trang phục" className="cursor-pointer">
                      Trang phục
                    </SelectItem>
                    <SelectItem value="Nước uống" className="cursor-pointer">
                      Nước uống
                    </SelectItem>
                    <SelectItem value="Đăng ký giải" className="cursor-pointer">
                      Đăng ký giải
                    </SelectItem>
                    <SelectItem value="Khác" className="cursor-pointer">
                      Khác
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mô tả */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="description"
                className="text-right text-sm font-semibold"
              >
                Mô tả <span className="text-red-500">*</span>
              </Label>

              <Input
                id="description"
                name="description"
                defaultValue={expense?.description || ""}
                placeholder="VD: Tiền mua nước chanh giải khát"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>

            {/* Số tiền */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-sm font-semibold">
                Số tiền (₫) <span className="text-red-500">*</span>
              </Label>

              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                defaultValue={expense?.amount || ""}
                placeholder="Ví dụ: 150000"
                className="col-span-3 h-10 border-border bg-background/50 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>

            {/* Nguồn tiền */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="source" className="text-right text-sm font-semibold">
                Nguồn tiền <span className="text-red-500">*</span>
              </Label>

              <div className="col-span-3">
                <Select
                  name="source"
                  required
                  value={source}
                  onValueChange={(val) => val && setSource(val)}
                >
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Chọn nguồn tiền" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Quỹ đội" className="cursor-pointer">
                      Quỹ đội
                    </SelectItem>
                    <SelectItem value="Cá nhân" className="cursor-pointer">
                      Cá nhân
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spender" className="text-right text-sm font-semibold">
                Người chi {source === "Cá nhân" && <span className="text-red-500">*</span>}
              </Label>

              <div className="col-span-3">
                <Select name="spender" defaultValue={expense?.spender || "__none__"}>
                  <SelectTrigger className="h-10 border-border bg-background/50 focus:border-primary cursor-pointer">
                    <SelectValue placeholder="Chọn người chi" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="__none__" className="cursor-pointer">
                      -- Chưa chọn --
                    </SelectItem>

                    {members.map((member) => (
                      <SelectItem
                        key={member.id}
                        value={member.fullName}
                        className="cursor-pointer"
                      >
                        {member.fullName}
                        {member.jerseyNumber !== null ? ` (#${member.jerseyNumber})` : ""}
                        {member.position ? ` - ${member.position}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {source === "Cá nhân" && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Khi nguồn tiền là Cá nhân, bắt buộc chọn thành viên đã chi trả.
                  </p>
                )}
              </div>
            </div>

            {/* Ghi chú */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right text-sm font-semibold">
                Ghi chú
              </Label>

              <Input
                id="notes"
                name="notes"
                defaultValue={expense?.notes || ""}
                placeholder="Ghi chú thêm..."
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
              {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu chi phí"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}