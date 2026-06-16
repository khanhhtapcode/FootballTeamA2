import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên file ngẫu nhiên để không bị trùng
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, fileName);

    // Tạo thư mục nếu chưa tồn tại
    await mkdir(uploadDir, { recursive: true });
    
    // Lưu file vào thư mục public/uploads
    await writeFile(filePath, buffer);

    // Trả về đường dẫn để lưu vào database
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ error: "Lỗi khi upload ảnh" }, { status: 500 });
  }
}