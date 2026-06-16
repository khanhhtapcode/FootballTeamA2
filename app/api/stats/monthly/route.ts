import { NextResponse } from "next/server";
import { getMonthlyPlayerStats } from "@/lib/services/stat-service";

// Bắt buộc tên hàm là GET để định nghĩa phương thức GET cho API này
export async function GET(request: Request) {
  try {
    // 1. Phân tích URL để lấy các tham số truyền lên từ Frontend (ví dụ: ?month=6&year=2026)
    const { searchParams } = new URL(request.url);

    // Lấy thời gian hiện tại làm giá trị mặc định nếu Frontend không truyền
    const currentMonth = new Date().getMonth() + 1; // getMonth() trả về 0-11, nên phải + 1
    const currentYear = new Date().getFullYear();

    // 2. Ép kiểu tham số sang dạng số nguyên (Int)
    const month = parseInt(searchParams.get("month") || currentMonth.toString(), 10);
    const year = parseInt(searchParams.get("year") || currentYear.toString(), 10);

    // 3. Gọi hàm Service đã tạo ở Bước 3
    const stats = await getMonthlyPlayerStats(month, year);

    // 4. Trả về kết quả dưới dạng JSON với status 200 (Thành công)
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error("[STATS_GET_ERROR]", error);
    
    // Trả về lỗi 500 nếu có bất kỳ sự cố nào xảy ra trong quá trình truy vấn
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi tải dữ liệu thống kê" },
      { status: 500 }
    );
  }
}