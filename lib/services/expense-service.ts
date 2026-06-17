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

const VALID_EXPENSE_SOURCES = ["Quỹ đội", "Cá nhân"]

function normalizeExpenseInput(input: CreateExpenseInput) {
  const date = new Date(input.date as string)
  const category = input.category?.toString()
  const description = input.description?.toString().trim()
  const amount = parseInt(input.amount?.toString() ?? "", 10)

  const rawSpender = input.spender?.toString().trim()
  const spender = rawSpender && rawSpender !== "__none__" ? rawSpender : null

  const source = input.source?.toString()
  const notes = input.notes?.toString() || null

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "Ngày chi không hợp lệ")
  }

  if (!category) {
    throw new ApiError(400, "Chưa chọn loại chi phí")
  }

  if (!description) {
    throw new ApiError(400, "Nội dung chi không được để trống")
  }

  if (Number.isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "Số tiền không hợp lệ")
  }

  if (!source) {
    throw new ApiError(400, "Chưa chọn nguồn chi")
  }

  if (!VALID_EXPENSE_SOURCES.includes(source)) {
    throw new ApiError(400, "Nguồn chi không hợp lệ")
  }

  if (source === "Cá nhân" && !spender) {
    throw new ApiError(400, "Vui lòng chọn người chi")
  }

  return {
    date,
    category,
    description,
    amount,
    spender,
    source,
    notes,
  }
}

export async function createExpense(input: CreateExpenseInput) {
  const data = normalizeExpenseInput(input)

  return db.expense.create({
    data,
  })
}

export async function updateExpense(id: number, input: CreateExpenseInput) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, "ID chi phí không hợp lệ")
  }

  const existingExpense = await db.expense.findUnique({
    where: {
      id,
    },
  })

  if (!existingExpense) {
    throw new ApiError(404, "Không tìm thấy chi phí")
  }

  if (existingExpense.matchId) {
    throw new ApiError(
      400,
      "Chi phí này được tạo tự động từ Lịch sử trận đấu. Vui lòng sửa ở phần Lịch sử trận đấu."
    )
  }

  const data = normalizeExpenseInput(input)

  return db.expense.update({
    where: {
      id,
    },
    data,
  })
}

export async function deleteExpense(id: number) {
  if (!id || Number.isNaN(id)) {
    throw new ApiError(400, "ID chi phí không hợp lệ")
  }

  const existingExpense = await db.expense.findUnique({
    where: {
      id,
    },
  })

  if (!existingExpense) {
    throw new ApiError(404, "Không tìm thấy chi phí")
  }

  if (existingExpense.matchId) {
    throw new ApiError(
      400,
      "Chi phí này được tạo tự động từ Lịch sử trận đấu. Vui lòng xóa ở phần Lịch sử trận đấu."
    )
  }

  await db.expense.delete({
    where: {
      id,
    },
  })

  return {
    success: true,
  }
}