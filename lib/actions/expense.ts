"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addExpense(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const date = new Date(formData.get("date") as string)
  const category = formData.get("category") as string
  const description = (formData.get("description") as string)?.trim()
  const amount = parseInt(formData.get("amount") as string)
  const spender = formData.get("spender") as string || null
  const source = formData.get("source") as string
  const notes = formData.get("notes") as string || null

  if (Number.isNaN(date.getTime())) throw new Error("Ngày chi không hợp lệ")
  if (!category) throw new Error("Chưa chọn loại chi phí")
  if (!description) throw new Error("Nội dung chi không được để trống")
  if (Number.isNaN(amount) || amount <= 0) throw new Error("Số tiền không hợp lệ")
  if (!source) throw new Error("Chưa chọn nguồn chi")

  await db.expense.create({
    data: {
      date,
      category,
      description,
      amount,
      spender,
      source,
      notes
    }
  })

  revalidatePath("/expenses")
  revalidatePath("/") 
}
