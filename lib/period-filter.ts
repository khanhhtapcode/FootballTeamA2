export type PeriodMode = "all" | "year" | "month"

export type PeriodSearchParams = {
  mode?: string
  year?: string
  month?: string
}

export function getPeriodMode(mode?: string): PeriodMode {
  if (mode === "year" || mode === "month") return mode
  return "all"
}

export function getSelectedPeriod(searchParams?: PeriodSearchParams) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

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

  const dateFilter =
    mode === "year"
      ? {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        }
      : mode === "month"
        ? {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          }
        : null

  return {
    mode,
    year,
    month,
    dateFilter,
  }
}

export function getPeriodLabel(
  mode: PeriodMode,
  year: number,
  month: number,
  targetLabel = "dữ liệu"
) {
  if (mode === "year") {
    return `Hiển thị ${targetLabel} năm ${year}`
  }

  if (mode === "month") {
    return `Hiển thị ${targetLabel} tháng ${month.toString().padStart(2, "0")}/${year}`
  }

  return `Hiển thị tất cả ${targetLabel}`
}