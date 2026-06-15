import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createExpense } from "@/lib/services/expense-service"

// POST /api/expenses — ghi nhận chi phí mới
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const expense = await createExpense(body)

    revalidatePath("/expenses")
    revalidatePath("/")

    return ok(expense, 201)
  } catch (error) {
    return handleError(error)
  }
}
