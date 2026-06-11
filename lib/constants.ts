// Mức quỹ cố định hàng tháng cho mỗi thành viên (VND)
export const FUND_AMOUNT = 100000

// Trạng thái đóng quỹ
export const FUND_STATUS = {
  PAID: "✅", // Đã đóng
  UNPAID: "❌", // Chưa đóng
  NOT_PARTICIPATING: "—", // Không tham gia
} as const

// Trạng thái thành viên
export const MEMBER_STATUS = {
  ACTIVE: "Hoạt động",
  PAUSED: "Tạm nghỉ",
  RETIRED: "Giải nghệ",
} as const
