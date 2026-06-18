"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CalendarDays, Filter, RotateCcw } from "lucide-react"

type DashboardMode = "all" | "year" | "month"

type Props = {
  mode: DashboardMode
  year: number
  month: number
  periodLabel: string
}

const MONTHS = [
  { value: "1", label: "Tháng 01" },
  { value: "2", label: "Tháng 02" },
  { value: "3", label: "Tháng 03" },
  { value: "4", label: "Tháng 04" },
  { value: "5", label: "Tháng 05" },
  { value: "6", label: "Tháng 06" },
  { value: "7", label: "Tháng 07" },
  { value: "8", label: "Tháng 08" },
  { value: "9", label: "Tháng 09" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
]

export function DashboardTimeFilter({ mode, year, month, periodLabel }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentYear = new Date().getFullYear()

  const yearOptions = Array.from(
    new Set([
      year,
      currentYear + 1,
      currentYear,
      currentYear - 1,
      currentYear - 2,
      currentYear - 3,
      currentYear - 4,
      currentYear - 5,
    ])
  ).sort((a, b) => b - a)

  const updateFilter = (next: {
    mode?: DashboardMode
    year?: number
    month?: number
  }) => {
    const nextMode = next.mode ?? mode
    const nextYear = next.year ?? year
    const nextMonth = next.month ?? month

    const params = new URLSearchParams(searchParams.toString())

    if (nextMode === "all") {
      params.delete("mode")
      params.delete("year")
      params.delete("month")
      router.push(pathname)
      return
    }

    params.set("mode", nextMode)
    params.set("year", nextYear.toString())

    if (nextMode === "month") {
      params.set("month", nextMonth.toString())
    } else {
      params.delete("month")
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const resetFilter = () => {
    router.push(pathname)
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-card/25 backdrop-blur-md p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Filter className="w-4 h-4" />
          </div>

          <div>
            <p className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
              Bộ lọc thống kê
            </p>
            <h2 className="text-sm font-extrabold text-foreground">
              {periodLabel}
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select
            value={mode}
            onValueChange={(value) => updateFilter({ mode: value as DashboardMode })}
          >
            <SelectTrigger className="h-9 w-full sm:w-[150px] bg-background/50 border-border text-xs font-bold">
              <SelectValue placeholder="Chọn kiểu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="year">Theo năm</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
            </SelectContent>
          </Select>

          {mode !== "all" && (
            <Select
              value={year.toString()}
              onValueChange={(value) => updateFilter({ year: Number(value) })}
            >
              <SelectTrigger className="h-9 w-full sm:w-[120px] bg-background/50 border-border text-xs font-bold">
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((item) => (
                  <SelectItem key={item} value={item.toString()}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {mode === "month" && (
            <Select
              value={month.toString()}
              onValueChange={(value) => updateFilter({ month: Number(value) })}
            >
              <SelectTrigger className="h-9 w-full sm:w-[130px] bg-background/50 border-border text-xs font-bold">
                <SelectValue placeholder="Tháng" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={resetFilter}
            className="h-9 text-xs font-bold border-border"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Tất cả
          </Button>

          <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono border border-border rounded-lg px-2.5 h-9 bg-background/40">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            {periodLabel}
          </div>
        </div>
      </div>
    </div>
  )
}