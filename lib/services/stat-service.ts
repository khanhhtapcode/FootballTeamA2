import { db } from "@/lib/db";

export async function getMonthlyPlayerStats(month: number, year: number) {
  // 1. Tính toán ngày bắt đầu và ngày kết thúc để lọc trận đấu trong tháng
  // Lưu ý: month trong JS bắt đầu từ 0 (0 = Tháng 1), nên ta truyền month - 1
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // 2. Truy vấn Database: Lấy danh sách thành viên KÈM THEO thống kê các trận đấu trong khoảng thời gian trên
  const members = await db.member.findMany({
    select: {
      id: true,
      fullName: true,
      position: true,
      jerseyNumber: true,
      avatarUrl: true,
      matchStats: {
        where: {
          match: {
            // Lọc ra các trận đấu diễn ra từ đầu tháng (>= startDate) đến trước ngày mùng 1 tháng sau (< endDate)
            date: {
              gte: startDate,
              lt: endDate,
            },
          },
        },
        select: {
          goals: true,
          assists: true,
        },
      },
    },
  });

  // 3. Xử lý dữ liệu: Cộng dồn bàn thắng và kiến tạo từ tất cả các trận trong tháng
  const stats = members.map((member) => {
    // reduce() giúp duyệt qua mảng matchStats và cộng dồn giá trị
    const totalGoals = member.matchStats.reduce((sum, stat) => sum + stat.goals, 0);
    const totalAssists = member.matchStats.reduce((sum, stat) => sum + stat.assists, 0);

    return {
      id: member.id,
      fullName: member.fullName,
      position: member.position,
      jerseyNumber: member.jerseyNumber,
      avatarUrl: member.avatarUrl,
      totalGoals,
      totalAssists,
    };
  });

  // 4. Lọc dữ liệu: (Tùy chọn) Chỉ lấy những cầu thủ có ít nhất 1 bàn thắng HOẶC 1 kiến tạo
  // Việc này giúp bảng xếp hạng không bị loãng bởi những người không có thông số nào
  const activeStats = stats.filter(
    (stat) => stat.totalGoals > 0 || stat.totalAssists > 0
  );

  // 5. Sắp xếp bảng xếp hạng:
  // - Ưu tiên 1: Ai nhiều bàn thắng hơn thì đứng trên
  // - Ưu tiên 2: Nếu số bàn thắng bằng nhau, ai nhiều kiến tạo hơn thì đứng trên
  return activeStats.sort((a, b) => {
    if (b.totalGoals !== a.totalGoals) {
      return b.totalGoals - a.totalGoals; // Sắp xếp giảm dần theo Bàn thắng
    }
    return b.totalAssists - a.totalAssists; // Sắp xếp giảm dần theo Kiến tạo
  });
}