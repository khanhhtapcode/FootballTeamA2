import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { FUND_STATUS } from "@/lib/constants"

export type CreateMemberInput = {
  fullName?: string | null
  position?: string | null
  jerseyNumber?: number | string | null
  phone?: string | null
}

export async function createMember(input: CreateMemberInput) {
  const fullName = input.fullName?.toString().trim()
  const position = input.position?.toString() || null
  const phone = input.phone?.toString() || null

  const jerseyRaw = input.jerseyNumber
  const jerseyNumber =
    jerseyRaw === null || jerseyRaw === undefined || jerseyRaw === ""
      ? null
      : parseInt(jerseyRaw.toString())

  if (!fullName) {
    throw new ApiError(400, "Tên thành viên không được để trống")
  }
  if (jerseyNumber !== null && Number.isNaN(jerseyNumber)) {
    throw new ApiError(400, "Số áo không hợp lệ")
  }

  const exists = await db.member.findUnique({ where: { fullName } })
  if (exists) {
    throw new ApiError(409, "Tên thành viên đã tồn tại")
  }

  const member = await db.member.create({
    data: { fullName, position, jerseyNumber, phone },
  })

  // Auto tạo FundRecord cho năm hiện tại
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const fundRecords = []
  for (let month = 1; month <= 12; month++) {
    let status: string = FUND_STATUS.NOT_PARTICIPATING
    if (month <= currentMonth) {
      status = FUND_STATUS.UNPAID
    }
    fundRecords.push({ memberId: member.id, month, year: currentYear, status })
  }
  await db.fundRecord.createMany({ data: fundRecords })

  return member
}

export async function updateMemberStatus(id: number, status: string) {
  if (Number.isNaN(id)) throw new ApiError(400, "ID thành viên không hợp lệ")
  if (!status) throw new ApiError(400, "Chưa chọn trạng thái")

  const exists = await db.member.findUnique({ where: { id } })
  if (!exists) throw new ApiError(404, "Không tìm thấy thành viên")

  return db.member.update({ where: { id }, data: { status } })
}

export async function updateMemberLineup(id: number, lineupPosition: string | null) {
  if (Number.isNaN(id)) throw new ApiError(400, "ID thành viên không hợp lệ")

  // Nếu gán vào một vị trí cụ thể, xoá vị trí đó khỏi các cầu thủ khác trước để tránh trùng lặp
  if (lineupPosition) {
    await db.member.updateMany({
      where: { lineupPosition },
      data: { lineupPosition: null }
    })
  }

  return db.member.update({
    where: { id },
    data: { lineupPosition }
  })
}

