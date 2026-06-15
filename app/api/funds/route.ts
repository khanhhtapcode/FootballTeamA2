import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateFundStatus } from "@/lib/services/fund-service"

// PATCH /api/funds — cập nhật trạng thái đóng quỹ của 1 ô (member + tháng + năm)
export async function PATCH(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const record = await updateFundStatus(
      Number(body.memberId),
      Number(body.month),
      Number(body.year),
      body.status
    )

    revalidatePath("/funds")

    return ok(record)
  } catch (error) {
    return handleError(error)
  }
}
