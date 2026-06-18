"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarDays, Filter, RotateCcw } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { PeriodMode } from "@/lib/period-filter"

type Props = {
  mode: PeriodMode
  year: number
  month: number
  quarter: number
  from: string
  to: string
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

const QUARTERS = [
  { value: "1", label: "Quý 1 (T1–T3)" },
  { value: "2", label: "Quý 2 (T4–T6)" },
  { value: "3", label: "Quý 3 (T7–T9)" },
  { value: "4", label: "Quý 4 (T10–T12)" },
]

export function PeriodFilter({ mode, year, month, quarter, from, to, periodLabel }: Props) {
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
    mode?: PeriodMode
    year?: number
    month?: number
    quarter?: number
    from?: string
    to?: string
  }) => {
    const nextMode = next.mode ?? mode
    const params = new URLSearchParams()

    params.set("mode", nextMode)

    if (nextMode === "month") {
      params.set("year", (next.year ?? year).toString())
      params.set("month", (next.month ?? month).toString())
    } else if (nextMode === "quarter") {
      params.set("year", (next.year ?? year).toString())
      params.set("quarter", (next.quarter ?? quarter).toString())
    } else if (nextMode === "custom") {
      const nextFrom = next.from ?? from
      const nextTo = next.to ?? to
      if (nextFrom) params.set("from", nextFrom)
      if (nextTo) params.set("to", nextTo)
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const handleModeChange = (value: string | null) => {
    if (!value) return
    const nextMode = value as PeriodMode

    if (nextMode === "custom" && !from && !to) {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, "0")
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
      updateFilter({ mode: nextMode, from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` })
    } else {
      updateFilter({ mode: nextMode })
    }
  }

  const resetFilter = () => {
    const now = new Date()
    const params = new URLSearchParams(searchParams.toString())
    params.set("mode", "month")
    params.set("year", now.getFullYear().toString())
    params.set("month", (now.getMonth() + 1).toString())
    params.delete("quarter")
    params.delete("from")
    params.delete("to")
    router.push(`${pathname}?${params.toString()}`)
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
              Bộ lọc thời gian
            </p>
            <h2 className="text-sm font-extrabold text-foreground">
              {periodLabel}
            </h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap">
          {/* Mode selector — fixed 3 options */}
          <Select value={mode} onValueChange={handleModeChange}>
            <SelectTrigger className="h-9 w-full sm:w-40 bg-background/50 border-border text-xs font-bold">
              <SelectValue placeholder="Chọn kiểu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Theo tháng</SelectItem>
              <SelectItem value="quarter">Theo quý</SelectItem>
              <SelectItem value="custom">Tùy chọn</SelectItem>
            </SelectContent>
          </Select>

          {/* Year selector — shown for month + quarter */}
          {(mode === "month" || mode === "quarter") && (
            <Select
              value={year.toString()}
              onValueChange={(value) => value && updateFilter({ year: Number(value) })}
            >
              <SelectTrigger className="h-9 w-full sm:w-28 bg-background/50 border-border text-xs font-bold">
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

          {/* Month selector */}
          {mode === "month" && (
            <Select
              value={month.toString()}
              onValueChange={(value) => value && updateFilter({ month: Number(value) })}
            >
              <SelectTrigger className="h-9 w-full sm:w-37.5 bg-background/50 border-border text-xs font-bold">
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

          {/* Quarter selector */}
          {mode === "quarter" && (
            <Select
              value={quarter.toString()}
              onValueChange={(value) => value && updateFilter({ quarter: Number(value) })}
            >
              <SelectTrigger className="h-9 w-full sm:w-44 bg-background/50 border-border text-xs font-bold">
                <SelectValue placeholder="Quý" />
              </SelectTrigger>
              <SelectContent>
                {QUARTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Custom date range */}
          {mode === "custom" && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">Từ</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => updateFilter({ from: e.target.value })}
                  className="h-9 px-3 text-xs font-bold bg-background/50 border border-border rounded-md text-foreground"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">đến</span>
                <input
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => updateFilter({ to: e.target.value })}
                  className="h-9 px-3 text-xs font-bold bg-background/50 border border-border rounded-md text-foreground"
                />
              </div>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={resetFilter}
            className="h-9 text-xs font-bold border-border"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Tháng này
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
