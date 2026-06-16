import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"

export type CreateMatchInput = {
  date?: string | null
  opponent?: string | null
  location?: string | null
  score?: string | null
  result?: string | null
  playersCount?: number | string | null
  pitchFee?: number | string | null
  scorers?: string | null
  notes?: string | null
  playerStats?: {
    memberId: number | string
    goals: number | string
    assists: number | string
  }[] | null
}

function parseOptionalInt(value: number | string | null | undefined, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback
  }

  const parsed = parseInt(value.toString(), 10)
  return parsed
}

function normalizePlayerStats(inputStats: CreateMatchInput["playerStats"]) {
  const statMap = new Map<number, { memberId: number; goals: number; assists: number }>()

  for (const stat of inputStats || []) {
    const memberId = parseOptionalInt(stat.memberId, NaN)
    const goals = parseOptionalInt(stat.goals, 0)
    const assists = parseOptionalInt(stat.assists, 0)

    if (Number.isNaN(memberId)) {
      throw new ApiError(400, "Cầu thủ trong thống kê không hợp lệ")
    }

    if (Number.isNaN(goals) || goals < 0) {
      throw new ApiError(400, "Số bàn thắng không hợp lệ")
    }

    if (Number.isNaN(assists) || assists < 0) {
      throw new ApiError(400, "Số kiến tạo không hợp lệ")
    }

    // Không lưu dòng cả bàn thắng và kiến tạo đều bằng 0
    if (goals === 0 && assists === 0) {
      continue
    }

    const existing = statMap.get(memberId)

    if (existing) {
      statMap.set(memberId, {
        memberId,
        goals: existing.goals + goals,
        assists: existing.assists + assists,
      })
    } else {
      statMap.set(memberId, {
        memberId,
        goals,
        assists,
      })
    }
  }

  return Array.from(statMap.values())
}

export async function createMatch(input: CreateMatchInput) {
  const date = new Date(input.date as string)
  const opponent = input.opponent?.toString().trim()
  const location = input.location?.toString() || null
  const score = input.score?.toString() || null
  const result = input.result?.toString()
  const playersCount = parseOptionalInt(input.playersCount, NaN)
  const pitchFee = parseOptionalInt(input.pitchFee, 0)
  const scorers = input.scorers?.toString() || null
  const notes = input.notes?.toString() || null
  const normalizedPlayerStats = normalizePlayerStats(input.playerStats)

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Ngày thi đấu không hợp lệ")
  }

  if (!opponent) {
    throw new ApiError(400, "Tên đối thủ không được để trống")
  }

  if (!result) {
    throw new ApiError(400, "Chưa chọn kết quả trận đấu")
  }

  if (Number.isNaN(playersCount) || playersCount < 1) {
    throw new ApiError(400, "Số cầu thủ không hợp lệ")
  }

  if (Number.isNaN(pitchFee) || pitchFee < 0) {
    throw new ApiError(400, "Tiền sân không hợp lệ")
  }

  if (normalizedPlayerStats.length > 0) {
    const memberIds = normalizedPlayerStats.map((stat) => stat.memberId)

    const existingMembersCount = await db.member.count({
      where: {
        id: {
          in: memberIds,
        },
      },
    })

    if (existingMembersCount !== memberIds.length) {
      throw new ApiError(400, "Có cầu thủ trong thống kê không tồn tại")
    }
  }

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
      notes,
      playerStats: {
        create: normalizedPlayerStats.map((stat) => ({
          memberId: stat.memberId,
          goals: stat.goals,
          assists: stat.assists,
        })),
      },
      expense:
        pitchFee > 0
          ? {
              create: {
                date,
                category: "Tiền sân",
                description: `Tiền sân trận gặp ${opponent}`,
                amount: pitchFee,
                source: "Quỹ đội",
                notes: "Tự động tạo từ Lịch sử trận đấu",
              },
            }
          : undefined,
    },
    include: {
      playerStats: {
        include: {
          member: true,
        },
      },
      expense: true,
    },
  })

  return match
}

export async function updateMatch(id: number, input: CreateMatchInput) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, "ID trận đấu không hợp lệ")
  }

  const existingMatch = await db.match.findUnique({
    where: { id },
  })

  if (!existingMatch) {
    throw new ApiError(404, "Không tìm thấy trận đấu")
  }

  const date = new Date(input.date as string)
  const opponent = input.opponent?.toString().trim()
  const location = input.location?.toString() || null
  const score = input.score?.toString() || null
  const result = input.result?.toString()
  const playersCount = parseOptionalInt(input.playersCount, NaN)
  const pitchFee = parseOptionalInt(input.pitchFee, 0)
  const scorers = input.scorers?.toString() || null
  const notes = input.notes?.toString() || null
  const normalizedPlayerStats = normalizePlayerStats(input.playerStats)

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Ngày thi đấu không hợp lệ")
  }

  if (!opponent) {
    throw new ApiError(400, "Tên đối thủ không được để trống")
  }

  if (!result) {
    throw new ApiError(400, "Chưa chọn kết quả trận đấu")
  }

  if (Number.isNaN(playersCount) || playersCount < 1) {
    throw new ApiError(400, "Số cầu thủ không hợp lệ")
  }

  if (Number.isNaN(pitchFee) || pitchFee < 0) {
    throw new ApiError(400, "Tiền sân không hợp lệ")
  }

  if (normalizedPlayerStats.length > 0) {
    const memberIds = normalizedPlayerStats.map((stat) => stat.memberId)

    const existingMembersCount = await db.member.count({
      where: {
        id: {
          in: memberIds,
        },
      },
    })

    if (existingMembersCount !== memberIds.length) {
      throw new ApiError(400, "Có cầu thủ trong thống kê không tồn tại")
    }
  }

  const updatedMatch = await db.$transaction(async (tx) => {
    await tx.playerMatchStat.deleteMany({
      where: {
        matchId: id,
      },
    })

    const updated = await tx.match.update({
      where: {
        id,
      },
      data: {
        date,
        opponent,
        location,
        score,
        result,
        playersCount,
        pitchFee,
        scorers,
        notes,
        playerStats: {
          create: normalizedPlayerStats.map((stat) => ({
            memberId: stat.memberId,
            goals: stat.goals,
            assists: stat.assists,
          })),
        },
      },
      include: {
        playerStats: {
          include: {
            member: true,
          },
        },
        expense: true,
      },
    })

    const existingExpense = await tx.expense.findUnique({
      where: {
        matchId: id,
      },
    })

    if (pitchFee > 0) {
      if (existingExpense) {
        await tx.expense.update({
          where: {
            matchId: id,
          },
          data: {
            date,
            category: "Tiền sân",
            description: `Tiền sân trận gặp ${opponent}`,
            amount: pitchFee,
            source: "Quỹ đội",
            notes: "Tự động cập nhật từ Lịch sử trận đấu",
          },
        })
      } else {
        await tx.expense.create({
          data: {
            date,
            category: "Tiền sân",
            description: `Tiền sân trận gặp ${opponent}`,
            amount: pitchFee,
            source: "Quỹ đội",
            notes: "Tự động tạo từ Lịch sử trận đấu",
            matchId: id,
          },
        })
      }
    } else if (existingExpense) {
      await tx.expense.delete({
        where: {
          matchId: id,
        },
      })
    }

    return tx.match.findUnique({
      where: {
        id,
      },
      include: {
        playerStats: {
          include: {
            member: true,
          },
        },
        expense: true,
      },
    })
  })

  return updatedMatch
}

export async function deleteMatch(id: number) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, "ID trận đấu không hợp lệ")
  }

  const existingMatch = await db.match.findUnique({
    where: {
      id,
    },
  })

  if (!existingMatch) {
    throw new ApiError(404, "Không tìm thấy trận đấu")
  }

  await db.$transaction(async (tx) => {
    await tx.expense.deleteMany({
      where: {
        matchId: id,
      },
    })

    await tx.match.delete({
      where: {
        id,
      },
    })
  })

  return {
    success: true,
  }
}