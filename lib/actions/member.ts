"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addMember(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const fullName = formData.get("fullName") as string
  const position = formData.get("position") as string || null
  const jerseyNumber = formData.get("jerseyNumber") ? parseInt(formData.get("jerseyNumber") as string) : null
  const phone = formData.get("phone") as string || null

  if (!fullName) {
    throw new Error("Tên thành viên không được để trống")
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
    let status = "—" // Không tham gia
    if (month <= currentMonth) {
      status = "❌" // Chưa đóng (các tháng đã qua và tháng hiện tại)
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
