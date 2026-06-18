"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type Props = {
  month: number
  year: number
}

export function StatsFilter({ month, year }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentYear = new Date().getFullYear()
  const years = [currentYear + 1, currentYear, currentYear - 1]

  const updateFilter = (next: { month?: number; year?: number }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", (next.month ?? month).toString())
    params.set("year", (next.year ?? year).toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <Select
        value={month.toString()}
        onValueChange={(val) => val && updateFilter({ month: Number(val) })}
      >
        <SelectTrigger className="w-[120px] bg-background">
          <SelectValue placeholder="Chọn tháng" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <SelectItem key={m} value={m.toString()}>
              Tháng {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year.toString()}
        onValueChange={(val) => val && updateFilter({ year: Number(val) })}
      >
        <SelectTrigger className="w-[100px] bg-background">
          <SelectValue placeholder="Chọn năm" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
