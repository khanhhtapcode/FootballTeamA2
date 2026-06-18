import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { updateMatch, deleteMatch } from "@/lib/services/match-service"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await requireAuth()

    const { id } = await context.params
    const matchId = Number(id)

    if (Number.isNaN(matchId)) {
      throw new Error("ID trận đấu không hợp lệ")
    }

    const body = await request.json()
    const match = await updateMatch(matchId, body)

    revalidatePath("/matches")
    revalidatePath("/stats")
    revalidatePath("/expenses")
    revalidatePath("/")

    return ok(match)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireAuth()

    const { id } = await context.params
    const matchId = Number(id)

    if (Number.isNaN(matchId)) {
      throw new Error("ID trận đấu không hợp lệ")
    }

    const result = await deleteMatch(matchId)

    revalidatePath("/matches")
    revalidatePath("/stats")
    revalidatePath("/expenses")
    revalidatePath("/")

    return ok(result)
  } catch (error) {
    return handleError(error)
  }
}