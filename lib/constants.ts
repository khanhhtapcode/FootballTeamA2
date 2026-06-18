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

// Nguồn chi phí
export const EXPENSE_SOURCE = {
  TEAM_FUND: "Quỹ đội",
  PERSONAL: "Cá nhân",
} as const

// Vị trí thi đấu
export const MEMBER_POSITIONS = ["Tất cả", "Thủ môn", "Hậu vệ", "Tiền vệ", "Tiền đạo", "Đa năng"] as const

