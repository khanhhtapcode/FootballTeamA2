import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateMemberStatus, updateMemberLineup } from "@/lib/services/member-service"

// PATCH /api/members/:id — cập nhật trạng thái hoặc đội hình thành viên
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()
    
    let member
    if (body.lineupPosition !== undefined) {
      member = await updateMemberLineup(parseInt(id), body.lineupPosition)
      revalidatePath("/")
    } else {
      member = await updateMemberStatus(parseInt(id), body.status)
    }

    revalidatePath("/members")

    return ok(member)
  } catch (error) {
    return handleError(error)
  }
}
