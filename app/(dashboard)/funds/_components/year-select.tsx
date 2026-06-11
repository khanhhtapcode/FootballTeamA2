"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays } from "lucide-react"

export function YearSelect({ years, selectedYear }: { years: number[], selectedYear: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function onChange(value: string | null) {
    if (!value) return
    startTransition(() => {
      router.push(`/funds?year=${value}`)
    })
  }

  return (
    <Select value={selectedYear.toString()} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="w-[140px] h-10 border-border bg-background/50 cursor-pointer font-semibold">
        <CalendarDays className="w-4 h-4 text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()} className="cursor-pointer">
            Năm {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
