"use client"

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api-client"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"

type Props = {
  matchId: number
  opponent: string
}

export function MatchDeleteButton({ matchId, opponent }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa trận gặp "${opponent}" không?`
    )

    if (!confirmed) return

    startTransition(async () => {
      try {
        await apiFetch(`/api/matches/${matchId}`, {
          method: "DELETE",
        })

        toast.success("Xóa trận đấu thành công")
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
      className="h-9 text-xs font-bold border-red-500/20 text-red-500 hover:bg-red-500/10"
    >
      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
      {isPending ? "Đang xóa..." : "Xóa"}
    </Button>
  )
}