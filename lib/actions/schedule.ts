"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addSchedule(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const date = new Date(formData.get("date") as string)
  const opponent = formData.get("opponent") as string
  const location = formData.get("location") as string || null
  const status = formData.get("status") as string
  const notes = formData.get("notes") as string || null

  await db.schedule.create({
    data: {
      date,
      opponent,
      location,
      status,
      notes
    }
  })

  revalidatePath("/schedule")
  revalidatePath("/")
}

export async function updateScheduleStatus(id: number, status: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await db.schedule.update({
    where: { id },
    data: { status }
  })

  revalidatePath("/schedule")
  revalidatePath("/")
}
