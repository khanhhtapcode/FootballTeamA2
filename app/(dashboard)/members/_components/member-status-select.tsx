"use client"

import { apiFetch } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function MemberStatusSelect({ id, currentStatus }: { id: number, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleStatusChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      try {
        await apiFetch(`/api/members/${id}`, { method: "PATCH", body: { status: value } })
        toast.success("Cập nhật trạng thái thành công!")
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi khi cập nhật trạng thái")
      }
    })
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold rounded-full border cursor-pointer ${
        currentStatus === "Hoạt động" ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
        currentStatus === "Tạm nghỉ" ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
        "bg-muted text-muted-foreground border-border dark:bg-white/5 dark:text-white/40 dark:border-white/10"
      }`}>
        <SelectValue placeholder="Trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Hoạt động" className="cursor-pointer">Hoạt động</SelectItem>
        <SelectItem value="Tạm nghỉ" className="cursor-pointer">Tạm nghỉ</SelectItem>
        <SelectItem value="Giải nghệ" className="cursor-pointer">Giải nghệ</SelectItem>
      </SelectContent>
    </Select>
  )
}
