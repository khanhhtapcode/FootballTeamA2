"use client"

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api-client"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

type Props = {
  scheduleId: number
  opponent: string
}

export function ScheduleDeleteButton({ scheduleId, opponent }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lịch thi đấu gặp "${opponent}" không?`
    )

    if (!confirmed) return

    startTransition(async () => {
      try {
        await apiFetch(`/api/schedules/${scheduleId}`, {
          method: "DELETE",
        })

        toast.success("Xóa lịch thi đấu thành công")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="w-full h-9 text-xs font-bold border-red-500/20 text-red-500 hover:bg-red-500/10"
    >
      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
      {isPending ? "Đang xóa..." : "Xóa"}
    </Button>
  )
}