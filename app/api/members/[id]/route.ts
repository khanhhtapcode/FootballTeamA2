import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateMemberStatus } from "@/lib/services/member-service"

// PATCH /api/members/:id — cập nhật trạng thái thành viên
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    const member = await updateMemberStatus(parseInt(id), body.status)

    revalidatePath("/members")

    return ok(member)
  } catch (error) {
    return handleError(error)
  }
}
