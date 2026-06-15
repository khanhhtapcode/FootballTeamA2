import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createSchedule } from "@/lib/services/schedule-service"

// POST /api/schedules — tạo lịch thi đấu
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const schedule = await createSchedule(body)

    revalidatePath("/schedule")
    revalidatePath("/")

    return ok(schedule, 201)
  } catch (error) {
    return handleError(error)
  }
}
