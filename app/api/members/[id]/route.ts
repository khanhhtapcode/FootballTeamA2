// app/api/members/[id]/route.ts
import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import {
  updateMember,
  deleteMember,
  updateMemberStatus,
  updateMemberLineup,
} from "@/lib/services/member-service"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const memberId = parseInt(id, 10)
    const body = await request.json()

    const updatedMember = await updateMember(memberId, body)

    revalidatePath("/members")
    revalidatePath("/")

    return ok(updatedMember)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const memberId = parseInt(id, 10)

    await deleteMember(memberId)

    revalidatePath("/members")
    revalidatePath("/funds")
    revalidatePath("/")

    return ok({ success: true })
  } catch (error) {
    return handleError(error)
  }
}

// PATCH /api/members/[id]
// Dùng cho cập nhật nhanh:
// - status
// - lineupPosition
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const memberId = parseInt(id, 10)
    const body = await request.json()

    let updatedMember

    // Trường hợp cập nhật đội hình ra sân
    if ("lineupPosition" in body) {
      updatedMember = await updateMemberLineup(
        memberId,
        body.lineupPosition === undefined ? null : body.lineupPosition
      )

      revalidatePath("/members")
      revalidatePath("/")

      return ok(updatedMember)
    }

    // Trường hợp cập nhật trạng thái thành viên
    if ("status" in body) {
      updatedMember = await updateMemberStatus(memberId, body.status)

      revalidatePath("/members")
      revalidatePath("/")

      return ok(updatedMember)
    }

    return handleError(new Error("Không có dữ liệu cập nhật hợp lệ"))
  } catch (error) {
    return handleError(error)
  }
}