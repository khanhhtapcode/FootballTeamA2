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
}

export async function createMatch(input: CreateMatchInput) {
  const date = new Date(input.date as string)
  const opponent = input.opponent?.toString().trim()
  const location = input.location?.toString() || null
  const score = input.score?.toString() || null
  const result = input.result?.toString()
  const playersCount = parseInt(input.playersCount?.toString() ?? "")
  const pitchFee = input.pitchFee ? parseInt(input.pitchFee.toString()) : 0
  const scorers = input.scorers?.toString() || null
  const notes = input.notes?.toString() || null

  if (Number.isNaN(date.getTime())) throw new ApiError(400, "Ngày thi đấu không hợp lệ")
  if (!opponent) throw new ApiError(400, "Tên đối thủ không được để trống")
  if (!result) throw new ApiError(400, "Chưa chọn kết quả trận đấu")
  if (Number.isNaN(playersCount) || playersCount < 0) throw new ApiError(400, "Số cầu thủ không hợp lệ")
  if (Number.isNaN(pitchFee) || pitchFee < 0) throw new ApiError(400, "Tiền sân không hợp lệ")

  const match = await db.match.create({
    data: { date, opponent, location, score, result, playersCount, pitchFee, scorers, notes },
  })

  // Tự tạo chi phí nếu có tiền sân
  if (pitchFee > 0) {
    await db.expense.create({
      data: {
        date,
        category: "Tiền sân",
        description: `Tiền sân trận gặp ${opponent}`,
        amount: pitchFee,
        source: "Quỹ đội",
        notes: "Tự động tạo từ Lịch sử trận đấu",
      },
    })
  }

  return match
}
