import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createMember } from "@/lib/services/member-service"

// POST /api/members — tạo thành viên mới
export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const member = await createMember(body)

    revalidatePath("/members")
    revalidatePath("/funds")

    return ok(member, 201)
  } catch (error) {
    return handleError(error)
  }
}
