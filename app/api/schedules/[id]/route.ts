import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError, ApiError } from "@/lib/api"
import {
  updateSchedule,
  updateScheduleStatus,
  deleteSchedule,
} from "@/lib/services/schedule-service"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function parseScheduleId(id: string) {
  const scheduleId = parseInt(id, 10)

  if (Number.isNaN(scheduleId)) {
    throw new ApiError(400, "ID lịch thi đấu không hợp lệ")
  }

  return scheduleId
}

// PUT /api/schedules/:id — sửa đầy đủ lịch thi đấu
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth()

    const { id } = await context.params
    const scheduleId = parseScheduleId(id)
    const body = await request.json()

    const schedule = await updateSchedule(scheduleId, body)

    revalidatePath("/schedule")
    revalidatePath("/")

    return ok(schedule)
  } catch (error) {
    return handleError(error)
  }
}

// PATCH /api/schedules/:id — cập nhật nhanh trạng thái lịch thi đấu
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth()

    const { id } = await context.params
    const scheduleId = parseScheduleId(id)
    const body = await request.json()

    const schedule = await updateScheduleStatus(scheduleId, body.status)

    revalidatePath("/schedule")
    revalidatePath("/")

    return ok(schedule)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/schedules/:id — xóa lịch thi đấu
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAuth()

    const { id } = await context.params
    const scheduleId = parseScheduleId(id)

    const result = await deleteSchedule(scheduleId)

    revalidatePath("/schedule")
    revalidatePath("/")

    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}