import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createJerseyOrder } from "@/lib/services/jersey-service"

// POST /api/jerseys — tạo đơn áo
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const order = await createJerseyOrder(body)

    revalidatePath("/jerseys")

    return ok(order, 201)
  } catch (error) {
    return handleError(error)
  }
}
