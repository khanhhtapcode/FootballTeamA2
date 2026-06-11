"use client"

import { updateScheduleStatus } from "@/lib/actions/schedule"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransition } from "react"
import { toast } from "sonner"

export function ScheduleStatusSelect({ id, currentStatus }: { id: number, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      try {
        await updateScheduleStatus(id, value)
        toast.success("Cập nhật trạng thái thành công!")
      } catch (e) {
        toast.error("Lỗi khi cập nhật trạng thái")
      }
    })
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold rounded-full border cursor-pointer ${
        currentStatus === "Đã xác nhận" ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
        currentStatus === "Chờ xác nhận" ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
      }`}>
        <SelectValue placeholder="Trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Đã xác nhận" className="cursor-pointer">Đã xác nhận</SelectItem>
        <SelectItem value="Chờ xác nhận" className="cursor-pointer">Chờ xác nhận</SelectItem>
        <SelectItem value="Đã hủy" className="cursor-pointer">Đã hủy</SelectItem>
      </SelectContent>
    </Select>
  )
}
