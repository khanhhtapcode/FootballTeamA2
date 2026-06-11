"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { FUND_STATUS } from "@/lib/constants"

export async function addMember(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const fullName = (formData.get("fullName") as string)?.trim()
  const position = formData.get("position") as string || null
  const jerseyRaw = formData.get("jerseyNumber") as string
  const jerseyNumber = jerseyRaw ? parseInt(jerseyRaw) : null
  const phone = formData.get("phone") as string || null

  if (!fullName) {
    throw new Error("Tên thành viên không được để trống")
  }

  if (jerseyNumber !== null && Number.isNaN(jerseyNumber)) {
    throw new Error("Số áo không hợp lệ")
  }

  // Check if member exists
  const exists = await db.member.findUnique({
    where: { fullName }
  })
  if (exists) {
    throw new Error("Tên thành viên đã tồn tại")
  }

  // Create member
  const member = await db.member.create({
    data: {
      fullName,
      position,
      jerseyNumber,
      phone,
    }
  })

  // Auto create FundRecords for current year
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  
  const fundRecords = []
  for (let month = 1; month <= 12; month++) {
    let status: string = FUND_STATUS.NOT_PARTICIPATING
    if (month <= currentMonth) {
      status = FUND_STATUS.UNPAID // Chưa đóng (các tháng đã qua và tháng hiện tại)
    }

    fundRecords.push({
      memberId: member.id,
      month,
      year: currentYear,
      status
    })
  }

  await db.fundRecord.createMany({
    data: fundRecords
  })

  revalidatePath("/members")
  revalidatePath("/funds")
}

export async function updateMemberStatus(id: number, status: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await db.member.update({
    where: { id },
    data: { status }
  })

  revalidatePath("/members")
}
