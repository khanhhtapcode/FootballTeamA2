"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addMatch(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const date = new Date(formData.get("date") as string)
  const opponent = formData.get("opponent") as string
  const location = formData.get("location") as string || null
  const score = formData.get("score") as string || null
  const result = formData.get("result") as string
  const playersCount = parseInt(formData.get("playersCount") as string)
  const pitchFee = formData.get("pitchFee") ? parseInt(formData.get("pitchFee") as string) : 0
  const scorers = formData.get("scorers") as string || null
  const notes = formData.get("notes") as string || null

  const match = await db.match.create({
    data: {
      date,
      opponent,
      location,
      score,
      result,
      playersCount,
      pitchFee,
      scorers,
      notes
    }
  })

  // Auto create expense if pitch fee > 0
  if (pitchFee > 0) {
    await db.expense.create({
      data: {
        date,
        category: "Tiền sân",
        description: `Tiền sân trận gặp ${opponent}`,
        amount: pitchFee,
        source: "Quỹ đội",
        notes: "Tự động tạo từ Lịch sử trận đấu"
      }
    })
  }

  revalidatePath("/matches")
  revalidatePath("/expenses")
  revalidatePath("/") 
}
