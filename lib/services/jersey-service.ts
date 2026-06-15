import { db } from "@/lib/db"
import { ApiError } from "@/lib/api"

export type CreateJerseyOrderInput = {
  memberId?: number | string | null
  jerseyNumber?: number | string | null
  size?: string | null
  description?: string | null
  quantity?: number | string | null
  unitPrice?: number | string | null
  isFree?: boolean
}

export async function createJerseyOrder(input: CreateJerseyOrderInput) {
  const memberId = parseInt(input.memberId?.toString() ?? "")
  const jerseyRaw = input.jerseyNumber
  const jerseyNumber =
    jerseyRaw === null || jerseyRaw === undefined || jerseyRaw === ""
      ? null
      : parseInt(jerseyRaw.toString())
  const size = input.size?.toString() || null
  const description = input.description?.toString() || null
  const quantity = parseInt(input.quantity?.toString() ?? "")
  const unitPrice = parseInt(input.unitPrice?.toString() ?? "")
  const isFree = input.isFree === true

  if (Number.isNaN(memberId)) throw new ApiError(400, "Chưa chọn thành viên")
  if (Number.isNaN(quantity) || quantity < 1) throw new ApiError(400, "Số lượng không hợp lệ")
  if (Number.isNaN(unitPrice) || unitPrice < 0) throw new ApiError(400, "Đơn giá không hợp lệ")
  if (jerseyNumber !== null && Number.isNaN(jerseyNumber)) throw new ApiError(400, "Số áo không hợp lệ")

  const status = isFree ? "Miễn phí" : "Chưa trả"

  return db.jerseyOrder.create({
    data: { memberId, jerseyNumber, size, description, quantity, unitPrice, status },
  })
}

export async function addJerseyPayment(id: number, amount: number) {
  if (Number.isNaN(id)) throw new ApiError(400, "ID đơn áo không hợp lệ")
  if (Number.isNaN(amount) || amount <= 0) throw new ApiError(400, "Số tiền không hợp lệ")

  const order = await db.jerseyOrder.findUnique({ where: { id } })
  if (!order) throw new ApiError(404, "Không tìm thấy đơn áo")

  const totalPrice = order.quantity * order.unitPrice
  if (amount > totalPrice - order.paidAmount) {
    throw new ApiError(400, "Số tiền thu lớn hơn số nợ")
  }

  const newPaidAmount = order.paidAmount + amount

  let newStatus = order.status
  if (order.status !== "Miễn phí") {
    if (newPaidAmount >= totalPrice) {
      newStatus = "Đã trả đủ"
    } else if (newPaidAmount > 0) {
      newStatus = "Trả một phần"
    }
  }

  return db.jerseyOrder.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount > totalPrice ? totalPrice : newPaidAmount,
      status: newStatus,
    },
  })
}
