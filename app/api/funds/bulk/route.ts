import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { bulkUpdateFund } from "@/lib/services/fund-service"

// POST /api/funds/bulk — đóng quỹ hàng loạt cho nhiều thành viên trong 1 tháng
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const memberIds: number[] = Array.isArray(body.memberIds)
      ? body.memberIds.map((x: unknown) => Number(x))
      : []

    await bulkUpdateFund(Number(body.month), Number(body.year), memberIds)

    revalidatePath("/funds")

    return ok({ success: true, count: memberIds.length }, 201)
  } catch (error) {
    return handleError(error)
  }
}
