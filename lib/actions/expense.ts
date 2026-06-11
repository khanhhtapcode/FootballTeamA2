"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function addExpense(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const date = new Date(formData.get("date") as string)
  const category = formData.get("category") as string
  const description = formData.get("description") as string
  const amount = parseInt(formData.get("amount") as string)
  const spender = formData.get("spender") as string || null
  const source = formData.get("source") as string
  const notes = formData.get("notes") as string || null

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
