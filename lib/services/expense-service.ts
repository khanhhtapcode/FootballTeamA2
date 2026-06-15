import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"

export type CreateExpenseInput = {
  date?: string | null
  category?: string | null
  description?: string | null
  amount?: number | string | null
  spender?: string | null
  source?: string | null
  notes?: string | null
}

export async function createExpense(input: CreateExpenseInput) {
  const date = new Date(input.date as string)
  const category = input.category?.toString()
  const description = input.description?.toString().trim()
  const amount = parseInt(input.amount?.toString() ?? "")
  const spender = input.spender?.toString() || null
  const source = input.source?.toString()
  const notes = input.notes?.toString() || null

  if (Number.isNaN(date.getTime())) throw new ApiError(400, "Ngày chi không hợp lệ")
  if (!category) throw new ApiError(400, "Chưa chọn loại chi phí")
  if (!description) throw new ApiError(400, "Nội dung chi không được để trống")
  if (Number.isNaN(amount) || amount <= 0) throw new ApiError(400, "Số tiền không hợp lệ")
  if (!source) throw new ApiError(400, "Chưa chọn nguồn chi")

  return db.expense.create({
    data: { date, category, description, amount, spender, source, notes },
  })
}
