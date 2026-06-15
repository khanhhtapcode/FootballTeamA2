import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Lỗi nghiệp vụ có kèm HTTP status code.
 * Service ném ApiError, route handler sẽ map sang đúng status trả về client.
 */
export class ApiError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

/** Bắt buộc đăng nhập. Trả về session, hoặc ném 401. */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new ApiError(401, "Unauthorized")
  }
  return session
}

/** Trả về JSON thành công (mặc định 200, dùng 201 cho create). */
export function ok(data: unknown = { success: true }, status = 200) {
  return NextResponse.json(data, { status })
}

/** Chuẩn hoá lỗi -> JSON { error }. ApiError giữ status, còn lại là 500. */
export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }
  console.error("[API] Unhandled error:", error)
  return NextResponse.json({ error: "Đã xảy ra lỗi máy chủ" }, { status: 500 })
}
