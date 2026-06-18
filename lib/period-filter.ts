export type PeriodMode = "month" | "quarter" | "custom"

export type PeriodSearchParams = {
  mode?: string
  year?: string
  month?: string
  quarter?: string
  from?: string
  to?: string
}

export function getPeriodMode(mode?: string): PeriodMode {
  if (mode === "quarter" || mode === "custom") return mode
  return "month"
}

export function getSelectedPeriod(searchParams?: PeriodSearchParams) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentQuarter = Math.ceil(currentMonth / 3)

  const mode = getPeriodMode(searchParams?.mode)

  const parsedYear = Number(searchParams?.year)
  const year =
    Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
      ? parsedYear
      : currentYear

  const parsedMonth = Number(searchParams?.month)
  const month =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : currentMonth

  const parsedQuarter = Number(searchParams?.quarter)
  const quarter =
    Number.isInteger(parsedQuarter) && parsedQuarter >= 1 && parsedQuarter <= 4
      ? parsedQuarter
      : currentQuarter

  const from = searchParams?.from ?? ""
  const to = searchParams?.to ?? ""

  let dateFilter: { gte: Date; lt: Date } | null = null

  if (mode === "month") {
    dateFilter = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    }
  } else if (mode === "quarter") {
    const startMonth = (quarter - 1) * 3
    dateFilter = {
      gte: new Date(year, startMonth, 1),
      lt: new Date(year, startMonth + 3, 1),
    }
  } else if (mode === "custom" && from && to) {
    const fromDate = new Date(from)
    const toDate = new Date(to)
    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      dateFilter = {
        gte: fromDate,
        lt: new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1),
      }
    }
  }

  return { mode, year, month, quarter, from, to, dateFilter }
}

export function getPeriodLabel(
  mode: PeriodMode,
  year: number,
  month: number,
  targetLabel = "dữ liệu",
  quarter = 1,
  from = "",
  to = ""
) {
  if (mode === "quarter") {
    return `Hiển thị ${targetLabel} quý ${quarter}/${year}`
  }

  if (mode === "custom") {
    if (from && to) {
      const fmt = (d: string) => {
        const [y, m, day] = d.split("-")
        return `${day}/${m}/${y}`
      }
      return `Hiển thị ${targetLabel} từ ${fmt(from)} đến ${fmt(to)}`
    }
    return `Chọn khoảng thời gian`
  }

  return `Hiển thị ${targetLabel} tháng ${month.toString().padStart(2, "0")}/${year}`
}
