"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api-client"

export function DeleteMemberButton({ id, name }: { id: number, name: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    // Xác nhận trước khi xóa cứng
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN cầu thủ "${name}" không? \nHành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu quỹ, thống kê của người này.`)) {
      return
    }

    startTransition(async () => {
      try {
        await apiFetch(`/api/members/${id}`, {
          method: "DELETE",
        })
        toast.success("Đã xóa thành viên thành công")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Lỗi khi xóa")
      }
    })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={isPending}
      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
      title="Xóa thành viên"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}