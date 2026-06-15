import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateScheduleStatus } from "@/lib/services/schedule-service"

// PATCH /api/schedules/:id — cập nhật trạng thái lịch thi đấu
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const schedule = await updateScheduleStatus(parseInt(id), body.status)

    revalidatePath("/schedule")
    revalidatePath("/")

    return ok(schedule)
  } catch (error) {
    return handleError(error)
  }
}
