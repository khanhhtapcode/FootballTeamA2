"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addSchedule(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const date = new Date(formData.get("date") as string)
  const opponent = (formData.get("opponent") as string)?.trim()
  const location = formData.get("location") as string || null
  const status = formData.get("status") as string
  const notes = formData.get("notes") as string || null

  if (Number.isNaN(date.getTime())) throw new Error("Ngày thi đấu không hợp lệ")
  if (!opponent) throw new Error("Tên đối thủ không được để trống")
  if (!status) throw new Error("Chưa chọn trạng thái")

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
