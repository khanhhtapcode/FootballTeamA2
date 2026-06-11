"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-heading">Đã xảy ra lỗi</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Không thể tải dữ liệu trang này. Vui lòng thử lại.
        </p>
      </div>
      <Button onClick={() => reset()} className="cursor-pointer font-bold hover-lift">
        Thử lại
      </Button>
    </div>
  )
}
