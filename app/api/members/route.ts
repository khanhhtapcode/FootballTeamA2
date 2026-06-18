import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { requireAuth, ok, handleError } from "@/lib/api"
import { createMember } from "@/lib/services/member-service"
import { db } from "@/lib/db" // Thêm import db

// GET /api/members — lấy danh sách thành viên
export async function GET() {
  try {
    await requireAuth() // Kiểm tra quyền truy cập (nếu cần)
    
    // Truy vấn lấy id và tên của tất cả thành viên
    const members = await db.member.findMany({
      select: {
        id: true,
        fullName: true,
      },
      orderBy: {
        fullName: 'asc' // Sắp xếp theo tên A-Z
      }
    })

    return ok(members) // Sử dụng hàm ok() giống với chuẩn của bạn
  } catch (error) {
    return handleError(error)
  }
}

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