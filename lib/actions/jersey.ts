"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addJerseyOrder(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const memberId = parseInt(formData.get("memberId") as string)
  const jerseyRaw = formData.get("jerseyNumber") as string
  const jerseyNumber = jerseyRaw ? parseInt(jerseyRaw) : null
  const size = formData.get("size") as string || null
  const description = formData.get("description") as string || null
  const quantity = parseInt(formData.get("quantity") as string)
  const unitPrice = parseInt(formData.get("unitPrice") as string)
  const isFree = formData.get("isFree") === "on"

  if (Number.isNaN(memberId)) throw new Error("Chưa chọn thành viên")
  if (Number.isNaN(quantity) || quantity < 1) throw new Error("Số lượng không hợp lệ")
  if (Number.isNaN(unitPrice) || unitPrice < 0) throw new Error("Đơn giá không hợp lệ")
  if (jerseyNumber !== null && Number.isNaN(jerseyNumber)) throw new Error("Số áo không hợp lệ")

  const status = isFree ? "Miễn phí" : "Chưa trả"

  await db.jerseyOrder.create({
    data: {
      memberId,
      jerseyNumber,
      size,
      description,
      quantity,
      unitPrice,
      status
    }
  })

  revalidatePath("/jerseys")
}

export async function payJerseyOrder(id: number, amount: number) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  if (Number.isNaN(amount) || amount <= 0) throw new Error("Số tiền không hợp lệ")

  const order = await db.jerseyOrder.findUnique({ where: { id } })
  if (!order) throw new Error("Không tìm thấy đơn áo")

  const newPaidAmount = order.paidAmount + amount
  const totalPrice = order.quantity * order.unitPrice
  
  let newStatus = order.status
  if (order.status !== "Miễn phí") {
    if (newPaidAmount >= totalPrice) {
      newStatus = "Đã trả đủ"
    } else if (newPaidAmount > 0) {
      newStatus = "Trả một phần"
    }
  }

  await db.jerseyOrder.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount > totalPrice ? totalPrice : newPaidAmount,
      status: newStatus
    }
  })

  revalidatePath("/jerseys")
}
