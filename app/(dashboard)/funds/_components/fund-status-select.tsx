"use client"

import { updateFundStatus } from "@/lib/actions/fund"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransition } from "react"
import { toast } from "sonner"

export function FundStatusSelect({ memberId, month, year, currentStatus }: { memberId: number, month: number, year: number, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      try {
        await updateFundStatus(memberId, month, year, value)
      } catch (e) {
        toast.error("Lỗi khi cập nhật quỹ")
      }
    })
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className={`w-full h-8 px-2 border-0 focus:ring-0 shadow-none text-center justify-center font-bold rounded-md cursor-pointer ${
        currentStatus === "✅" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400" :
        currentStatus === "❌" ? "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400" :
        "bg-muted text-muted-foreground dark:bg-white/5 dark:text-white/40"
      }`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="✅" className="cursor-pointer">Đã đóng (✅)</SelectItem>
        <SelectItem value="❌" className="cursor-pointer font-bold text-red-500">Chưa đóng (❌)</SelectItem>
        <SelectItem value="—" className="cursor-pointer">Không tham gia (—)</SelectItem>
      </SelectContent>
    </Select>
  )
}
