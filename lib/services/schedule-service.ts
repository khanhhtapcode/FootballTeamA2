import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"

export type CreateScheduleInput = {
  date?: string | null
  opponent?: string | null
  location?: string | null
  status?: string | null
  notes?: string | null
}

const VALID_SCHEDULE_STATUSES = ["Đã xác nhận", "Chờ xác nhận", "Đã hủy"]

function normalizeScheduleInput(input: CreateScheduleInput) {
  const date = new Date(input.date as string)
  const opponent = input.opponent?.toString().trim()
  const location = input.location?.toString() || null
  const status = input.status?.toString()
  const notes = input.notes?.toString() || null

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Ngày thi đấu không hợp lệ")
  }

  if (!opponent) {
    throw new ApiError(400, "Tên đối thủ không được để trống")
  }

  if (!status) {
    throw new ApiError(400, "Chưa chọn trạng thái")
  }

  if (!VALID_SCHEDULE_STATUSES.includes(status)) {
    throw new ApiError(400, "Trạng thái lịch thi đấu không hợp lệ")
  }

  return {
    date,
    opponent,
    location,
    status,
    notes,
  }
}

export async function createSchedule(input: CreateScheduleInput) {
  const data = normalizeScheduleInput(input)

  return db.schedule.create({
    data,
  })
}

export async function updateSchedule(id: number, input: CreateScheduleInput) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, "ID lịch thi đấu không hợp lệ")
  }

  const exists = await db.schedule.findUnique({
    where: {
      id,
    },
  })

  if (!exists) {
    throw new ApiError(404, "Không tìm thấy lịch thi đấu")
  }

  const data = normalizeScheduleInput(input)

  return db.schedule.update({
    where: {
      id,
    },
    data,
  })
}

export async function updateScheduleStatus(id: number, status: string) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, "ID lịch thi đấu không hợp lệ")
  }

  if (!status) {
    throw new ApiError(400, "Chưa chọn trạng thái")
  }

  if (!VALID_SCHEDULE_STATUSES.includes(status)) {
    throw new ApiError(400, "Trạng thái lịch thi đấu không hợp lệ")
  }

  const exists = await db.schedule.findUnique({
    where: {
      id,
    },
  })

  if (!exists) {
    throw new ApiError(404, "Không tìm thấy lịch thi đấu")
  }

  return db.schedule.update({
    where: {
      id,
    },
    data: {
      status,
    },
  })
}

export async function deleteSchedule(id: number) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, "ID lịch thi đấu không hợp lệ")
  }

  const exists = await db.schedule.findUnique({
    where: {
      id,
    },
  })

  if (!exists) {
    throw new ApiError(404, "Không tìm thấy lịch thi đấu")
  }

  await db.schedule.delete({
    where: {
      id,
    },
  })

  return {
    success: true,
  }
}