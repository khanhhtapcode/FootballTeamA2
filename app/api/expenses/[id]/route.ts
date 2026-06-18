import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError, ApiError } from "@/lib/api"
import { updateExpense, deleteExpense } from "@/lib/services/expense-service"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function parseExpenseId(id: string) {
  const expenseId = parseInt(id, 10)

  if (Number.isNaN(expenseId)) {
    throw new ApiError(400, "ID chi phí không hợp lệ")
  }

  return expenseId
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth()

    const { id } = await context.params
    const expenseId = parseExpenseId(id)
    const body = await request.json()

    const expense = await updateExpense(expenseId, body)

    revalidatePath("/expenses")
    revalidatePath("/")

    return ok(expense)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAuth()

    const { id } = await context.params
    const expenseId = parseExpenseId(id)

    const result = await deleteExpense(expenseId)

    revalidatePath("/expenses")
    revalidatePath("/")

    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}