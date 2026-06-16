import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"
import { FUND_STATUS } from "@/lib/constants"

const VALID_LINEUP_POSITIONS = ["GK", "DF_L", "DF_C", "DF_R", "MF_L", "MF_R", "ST"]

export type CreateMemberInput = {
  fullName?: string | null
  position?: string | null
  jerseyNumber?: number | string | null
  phone?: string | null
  avatarUrl?: string | null
}

export async function createMember(input: CreateMemberInput) {
  const fullName = input.fullName?.toString().trim()
  const position = input.position?.toString() || null
  const phone = input.phone?.toString() || null
  const avatarUrl = input.avatarUrl?.toString() || null

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

  const exists = await db.member.findUnique({
    where: { fullName },
  })

  if (exists) {
    throw new ApiError(409, "Tên thành viên đã tồn tại")
  }

  const member = await db.member.create({
    data: {
      fullName,
      position,
      jerseyNumber,
      phone,
      avatarUrl,
    },
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

    fundRecords.push({
      memberId: member.id,
      month,
      year: currentYear,
      status,
    })
  }

  await db.fundRecord.createMany({
    data: fundRecords,
  })

  return member
}

export async function updateMember(id: number, input: CreateMemberInput) {
  if (Number.isNaN(id)) {
    throw new ApiError(400, "ID thành viên không hợp lệ")
  }

  const fullName = input.fullName?.toString().trim()
  const position = input.position?.toString() || null
  const phone = input.phone?.toString() || null
  const avatarUrl = input.avatarUrl?.toString() || null

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

  const exists = await db.member.findFirst({
    where: {
      fullName,
      NOT: {
        id,
      },
    },
  })

  if (exists) {
    throw new ApiError(409, "Tên thành viên đã tồn tại")
  }

  return db.member.update({
    where: {
      id,
    },
    data: {
      fullName,
      position,
      jerseyNumber,
      phone,
      avatarUrl,
    },
  })
}

export async function updateMemberStatus(id: number, status: string) {
  if (Number.isNaN(id)) {
    throw new ApiError(400, "ID thành viên không hợp lệ")
  }

  if (!status) {
    throw new ApiError(400, "Chưa chọn trạng thái")
  }

  const exists = await db.member.findUnique({
    where: {
      id,
    },
  })

  if (!exists) {
    throw new ApiError(404, "Không tìm thấy thành viên")
  }

  return db.member.update({
    where: {
      id,
    },
    data: {
      status,
    },
  })
}

export async function updateMemberLineup(id: number, lineupPosition: string | null) {
  if (Number.isNaN(id)) {
    throw new ApiError(400, "ID thành viên không hợp lệ")
  }

  if (lineupPosition !== null && !VALID_LINEUP_POSITIONS.includes(lineupPosition)) {
    throw new ApiError(400, "Vị trí đội hình không hợp lệ")
  }

  return db.$transaction(async (tx) => {
    const selectedPlayer = await tx.member.findUnique({
      where: {
        id,
      },
    })

    if (!selectedPlayer) {
      throw new ApiError(404, "Không tìm thấy thành viên")
    }

    // Gỡ cầu thủ khỏi đội hình
    if (lineupPosition === null) {
      return tx.member.update({
        where: {
          id,
        },
        data: {
          lineupPosition: null,
        },
      })
    }

    const oldPosition = selectedPlayer.lineupPosition

    // Nếu chọn lại đúng vị trí hiện tại thì không cần cập nhật
    if (oldPosition === lineupPosition) {
      return selectedPlayer
    }

    // Tìm cầu thủ đang giữ vị trí đích
    const currentPlayerAtTarget = await tx.member.findFirst({
      where: {
        lineupPosition,
        id: {
          not: selectedPlayer.id,
        },
      },
    })

    // Nếu vị trí đích đang có người
    if (currentPlayerAtTarget) {
      // Trường hợp 1: cầu thủ được chọn đang ở vị trí khác
      // => đổi chỗ 2 cầu thủ
      if (oldPosition) {
        // Gỡ tạm cầu thủ được chọn để tránh trùng vị trí
        await tx.member.update({
          where: {
            id: selectedPlayer.id,
          },
          data: {
            lineupPosition: null,
          },
        })

        // Đưa cầu thủ đang ở vị trí đích sang vị trí cũ
        await tx.member.update({
          where: {
            id: currentPlayerAtTarget.id,
          },
          data: {
            lineupPosition: oldPosition,
          },
        })

        // Đưa cầu thủ được chọn vào vị trí đích
        return tx.member.update({
          where: {
            id: selectedPlayer.id,
          },
          data: {
            lineupPosition,
          },
        })
      }

      // Trường hợp 2: cầu thủ được chọn đang dự bị
      // => người cũ về dự bị
      await tx.member.update({
        where: {
          id: currentPlayerAtTarget.id,
        },
        data: {
          lineupPosition: null,
        },
      })
    }

    // Gán cầu thủ được chọn vào vị trí mới
    return tx.member.update({
      where: {
        id: selectedPlayer.id,
      },
      data: {
        lineupPosition,
      },
    })
  })
}

export async function deleteMember(id: number) {
  if (Number.isNaN(id)) {
    throw new ApiError(400, "ID thành viên không hợp lệ")
  }

  const exists = await db.member.findUnique({
    where: {
      id,
    },
  })

  if (!exists) {
    throw new ApiError(404, "Không tìm thấy thành viên")
  }

  // Xóa cứng thành viên.
  // Các dữ liệu liên quan sẽ tự động bị xóa nếu Prisma schema có onDelete: Cascade.
  return db.member.delete({
    where: {
      id,
    },
  })
}