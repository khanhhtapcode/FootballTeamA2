import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createMatch } from "@/lib/services/match-service"

// POST /api/matches — thêm kết quả trận đấu (tự sinh chi phí tiền sân nếu có)
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const match = await createMatch(body)

    revalidatePath("/matches")
    revalidatePath("/expenses")
    revalidatePath("/")

    return ok(match, 201)
  } catch (error) {
    return handleError(error)
  }
}
