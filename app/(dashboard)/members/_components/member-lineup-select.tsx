"use client"

import { apiFetch } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const LINEUP_POSITIONS = [
  { value: "none", label: "Dự bị" },
  { value: "GK", label: "GK - Thủ môn" },
  { value: "DF_L", label: "DFL - Hậu vệ trái" },
  { value: "DF_C", label: "DFC - Trung vệ" },
  { value: "DF_R", label: "DFR - Hậu vệ phải" },
  { value: "MF_L", label: "MFL - Tiền vệ trái" },
  { value: "MF_R", label: "MFR - Tiền vệ phải" },
  { value: "ST", label: "ST - Tiền đạo" },
]

export function MemberLineupSelect({ id, currentLineupPosition }: { id: number, currentLineupPosition: string | null }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const value = currentLineupPosition || "none"

  function handleLineupChange(val: string | null) {
    if (!val) return;
    const lineupVal = val === "none" ? null : val;
    startTransition(async () => {
      try {
        await apiFetch(`/api/members/${id}`, { 
          method: "PATCH", 
          body: { lineupPosition: lineupVal } 
        })
        toast.success("Cập nhật đội hình chính thành công!")
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Lỗi khi cập nhật đội hình")
      }
    })
  }

  const isSelected = value !== "none"

  return (
    <Select value={value} onValueChange={handleLineupChange} disabled={isPending}>
      <SelectTrigger 
        className={cn(
          "w-[145px] h-8 text-xs font-semibold rounded-full border cursor-pointer outline-none transition-all",
          isSelected 
            ? "bg-emerald-100 text-emerald-800 border-emerald-250 hover:bg-emerald-200 dark:bg-primary/20 dark:text-primary dark:border-primary/30 dark:hover:bg-primary/30"
            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10 dark:hover:bg-white/10"
        )}
      >
        <SelectValue placeholder="Đội hình chính" />
      </SelectTrigger>
      <SelectContent>
        {LINEUP_POSITIONS.map((pos) => (
          <SelectItem key={pos.value} value={pos.value} className="cursor-pointer">
            {pos.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
