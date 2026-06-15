import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { addJerseyPayment } from "@/lib/services/jersey-service"

// POST /api/jerseys/:id/payments — ghi nhận một lần thu tiền áo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const order = await addJerseyPayment(parseInt(id), Number(body.amount))

    revalidatePath("/jerseys")

    return ok(order, 201)
  } catch (error) {
    return handleError(error)
  }
}
