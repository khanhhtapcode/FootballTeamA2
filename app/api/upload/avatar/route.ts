import { NextRequest } from "next/server"
import { requireAuth, ok, handleError } from "@/lib/api"
import { cloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 4 * 1024 * 1024

function uploadBufferToCloudinary(buffer: Buffer, folder: string) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          {
            width: 600,
            height: 600,
            crop: "fill",
            gravity: "face",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result) {
          reject(new Error("Không nhận được kết quả upload từ Cloudinary"))
          return
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        })
      }
    )

    uploadStream.end(buffer)
  })
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      throw new Error("Chưa chọn file ảnh")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("File tải lên phải là ảnh")
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Ảnh không được vượt quá 4MB")
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploaded = await uploadBufferToCloudinary(
      buffer,
      "football-team-a2/avatars"
    )

    return ok({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    })
  } catch (error) {
    return handleError(error)
  }
}