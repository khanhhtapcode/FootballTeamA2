"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

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
      update: { status: "✅" },
      create: { memberId, month, year, status: "✅" }
    })
  }

  revalidatePath("/funds")
}
