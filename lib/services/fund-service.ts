import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { FUND_STATUS, MEMBER_STATUS } from "@/lib/constants"

/**
 * Tạo bù các bản ghi quỹ còn thiếu cho 12 tháng của năm `year`.
 * Idempotent (skipDuplicates) nên gọi nhiều lần không tạo trùng.
 * Hàm thuần — được gọi trực tiếp từ Server Component (FundsPage) khi render.
 */
export async function ensureFundRecordsForYear(year: number) {
  const members = await db.member.findMany({
    where: { status: { not: MEMBER_STATUS.RETIRED } },
    select: { id: true },
  })
  if (members.length === 0) return

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const data = []
  for (const member of members) {
    for (let month = 1; month <= 12; month++) {
      const isPastOrCurrent =
        year < currentYear || (year === currentYear && month <= currentMonth)
      data.push({
        memberId: member.id,
        month,
        year,
        status: isPastOrCurrent ? FUND_STATUS.UNPAID : FUND_STATUS.NOT_PARTICIPATING,
      })
    }
  }

  await db.fundRecord.createMany({ data, skipDuplicates: true })
}

export async function updateFundStatus(
  memberId: number,
  month: number,
  year: number,
  status: string
) {
  if (Number.isNaN(memberId)) throw new ApiError(400, "ID thành viên không hợp lệ")
  if (Number.isNaN(month) || month < 1 || month > 12) throw new ApiError(400, "Tháng không hợp lệ")
  if (Number.isNaN(year)) throw new ApiError(400, "Năm không hợp lệ")
  if (!status) throw new ApiError(400, "Chưa chọn trạng thái")

  return db.fundRecord.upsert({
    where: { memberId_month_year: { memberId, month, year } },
    update: { status },
    create: { memberId, month, year, status },
  })
}

export async function bulkUpdateFund(month: number, year: number, memberIds: number[]) {
  if (Number.isNaN(month) || month < 1 || month > 12) throw new ApiError(400, "Tháng không hợp lệ")
  if (Number.isNaN(year)) throw new ApiError(400, "Năm không hợp lệ")
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ApiError(400, "Vui lòng chọn ít nhất một thành viên")
  }

  await db.$transaction(
    memberIds.map((memberId) =>
      db.fundRecord.upsert({
        where: { memberId_month_year: { memberId, month, year } },
        update: { status: FUND_STATUS.PAID },
        create: { memberId, month, year, status: FUND_STATUS.PAID },
      })
    )
  )
}
