"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { FUND_STATUS, MEMBER_STATUS } from "@/lib/constants"

// Tạo bù các bản ghi quỹ còn thiếu cho 12 tháng của năm `year`.
// Idempotent (skipDuplicates) nên gọi nhiều lần không tạo trùng.
// Tháng đã qua/hiện tại -> "Chưa đóng" (❌); tháng tương lai -> "Không tham gia" (—).
export async function ensureFundRecordsForYear(year: number) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

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

export async function updateFundStatus(memberId: number, month: number, year: number, status: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await db.fundRecord.upsert({
    where: { memberId_month_year: { memberId, month, year } },
    update: { status },
    create: { memberId, month, year, status }
  })

  revalidatePath("/funds")
}

export async function bulkUpdateFund(month: number, year: number, memberIds: number[]) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  for (const memberId of memberIds) {
    await db.fundRecord.upsert({
      where: { memberId_month_year: { memberId, month, year } },
      update: { status: FUND_STATUS.PAID },
      create: { memberId, month, year, status: FUND_STATUS.PAID }
    })
  }

  revalidatePath("/funds")
}
