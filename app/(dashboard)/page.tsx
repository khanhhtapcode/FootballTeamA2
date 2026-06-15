import { db } from "@/lib/db"
import { Users, DollarSign, Calendar, Trophy, MapPin, Footprints, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { FUND_AMOUNT, FUND_STATUS, MEMBER_STATUS } from "@/lib/constants"

export default async function DashboardPage() {
  // Chạy song song các truy vấn độc lập
  const [
    membersCount,
    winsCount,
    totalMatches,
    expenseAgg,
    paidFundCount,
    recentMatches,
    upcomingSchedules,
    allMatchesForScorers,
  ] = await Promise.all([
    db.member.count({ where: { status: MEMBER_STATUS.ACTIVE } }),
    db.match.count({ where: { result: "Thắng" } }),
    db.match.count(),
    db.expense.aggregate({
      where: { source: "Quỹ đội" },
      _sum: { amount: true },
    }),
    db.fundRecord.count({ where: { status: FUND_STATUS.PAID } }),
    db.match.findMany({ orderBy: { date: "desc" }, take: 4 }),
    db.schedule.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 4,
    }),
    db.match.findMany({
      where: { NOT: { scorers: null } },
      select: { scorers: true },
    }),
  ])

  const totalExpense = expenseAgg._sum.amount ?? 0
  const totalFundReceived = paidFundCount * FUND_AMOUNT
  const currentBalance = totalFundReceived - totalExpense

  // Parse scorers string to aggregate top scorers
  const scorerMap: { [name: string]: number } = {}
  allMatchesForScorers.forEach((m) => {
    if (!m.scorers) return
    const parts = m.scorers.split(",")
    parts.forEach((part) => {
      const matchObj = part.trim().match(/^([^(]+)(?:\((\d+)\))?$/)
      if (matchObj) {
        const name = matchObj[1].trim()
        const goals = matchObj[2] ? parseInt(matchObj[2], 10) : 1
        scorerMap[name] = (scorerMap[name] || 0) + goals
      }
    })
  })
  
  const topScorers = Object.entries(scorerMap)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5)

  // Form indicator (Last 5 matches, oldest to newest)
  const formMatches = [...recentMatches].slice(0, 5).reverse()

  // Format date helper
  const todayStr = format(new Date(), "dd.MM.yyyy")

  return (
    <div className="space-y-10 pb-16">
      {/* Raw Editorial Header (No AI background banners) */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            QUẢN TRỊ NỘI BỘ
          </h1>
          <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
            FC A2BROTHERHOOD // CHỈ HUY HỆ THỐNG
          </p>
        </div>
        <div className="text-xs font-mono bg-muted px-2.5 py-1 rounded border text-muted-foreground">
          DATE: {todayStr}
        </div>
      </div>

      {/* Telemetry Metrics Grid (1px border separation like Linear/Vercel dashboard) */}
      <div className="grid gap-px bg-border/80 border border-border/80 rounded-2xl overflow-hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cell 1: Fund Balance */}
        <div className="p-6 bg-card/20 backdrop-blur-md space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            01 / CÂN ĐỐI QUỸ
          </span>
          <div className="space-y-1">
            <div className={`text-2xl font-black ${currentBalance >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              {currentBalance.toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-[10px] text-muted-foreground">Số dư tồn khả dụng hiện thời</p>
          </div>
          <div className="text-[10px] font-semibold text-muted-foreground flex gap-3 pt-2 border-t border-border/40 font-mono">
            <span>THU: +{totalFundReceived.toLocaleString('vi-VN')}</span>
            <span>•</span>
            <span>CHI: -{totalExpense.toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Cell 2: Roster */}
        <div className="p-6 bg-card/20 backdrop-blur-md space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            02 / ĐỘI HÌNH
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground">
              {membersCount} CẦU THỦ
            </div>
            <p className="text-[10px] text-muted-foreground">Thành viên đăng ký chính thức</p>
          </div>
          <div className="text-[10px] font-semibold text-muted-foreground pt-2 border-t border-border/40 font-mono">
            TRẠNG THÁI: <span className="text-emerald-500 font-bold">HOẠT ĐỘNG CHỦ CHỐT</span>
          </div>
        </div>

        {/* Cell 3: Fixtures */}
        <div className="p-6 bg-card/20 backdrop-blur-md space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            03 / LỊCH ĐẤU
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground">
              {upcomingSchedules.length} TRẬN
            </div>
            <p className="text-[10px] text-muted-foreground">Số trận đấu giao hữu sắp diễn ra</p>
          </div>
          <div className="text-[10px] font-semibold text-muted-foreground pt-2 border-t border-border/40 font-mono">
            TIÊU CHÍ: <span className="text-amber-500 font-bold">ĐÃ XÁC NHẬN SÂN ĐẤU</span>
          </div>
        </div>

        {/* Cell 4: Performance */}
        <div className="p-6 bg-card/20 backdrop-blur-md space-y-4">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            04 / PHONG ĐỘ
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-black text-primary">
              {totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : 0}% THẮNG
            </div>
            <p className="text-[10px] text-muted-foreground">Tỉ lệ chiến thắng / {totalMatches} trận</p>
          </div>
          <div className="flex items-center gap-1 pt-2 border-t border-border/40">
            {formMatches.length === 0 ? (
              <span className="text-[10px] font-mono text-muted-foreground">—</span>
            ) : (
              formMatches.map((m, idx) => (
                <span
                  key={m.id || idx}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${
                    m.result === "Thắng" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    m.result === "Thua" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  }`}
                  title={`vs ${m.opponent} (${m.score})`}
                >
                  {m.result === "Thắng" ? "W" : m.result === "Thua" ? "L" : "D"}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Column Split */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Area: Match Center logs (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card: Upcoming Fixtures */}
          <div className="rounded-2xl border border-border bg-card/10 backdrop-blur-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                // LỊCH TRẬN GIAO HỮU SẮP TỚI
              </span>
              <Link href="/schedule" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono">
                LỊCH TRÌNH CHỈ TIẾT <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl">
                Không tìm thấy trận đấu sắp tới trong hệ thống.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div 
                    key={schedule.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/10 transition-all text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Image src="/36.png" alt="Logo" width={18} height={18} className="rounded" />
                      </div>
                      <div>
                        <span className="font-extrabold text-foreground text-sm">FC A2Brotherhood vs {schedule.opponent}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-medium text-foreground">{format(new Date(schedule.date), "dd/MM/yyyy HH:mm")}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> Sân {schedule.location || "Chưa xác định"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="self-end sm:self-auto mt-2.5 sm:mt-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                        schedule.status === "Đã xác nhận" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        schedule.status === "Đã hủy" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {schedule.status === "Đã xác nhận" ? "CONFIRMED" : schedule.status === "Đã hủy" ? "CANCELLED" : "PENDING"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Recent Results logs */}
          <div className="rounded-2xl border border-border bg-card/10 backdrop-blur-md p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                // KẾT QUẢ ĐỐI ĐẦU GẦN NHẤT
              </span>
              <Link href="/matches" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono">
                TOÀN BỘ KẾT QUẢ <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentMatches.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl">
                Chưa có dữ liệu kết quả trận đấu.
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div 
                    key={match.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/10 transition-all text-xs"
                  >
                    <div className="space-y-1 w-full sm:w-[60%]">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                          match.result === "Thắng" ? "bg-emerald-500/10 text-emerald-400" :
                          match.result === "Thua" ? "bg-red-500/10 text-red-400" :
                          "bg-zinc-500/10 text-zinc-400"
                        }`}>
                          {match.result === "Thắng" ? "WIN" : match.result === "Thua" ? "LOSS" : "DRAW"}
                        </span>
                        <span className="font-extrabold text-foreground text-sm">vs {match.opponent}</span>
                      </div>
                      
                      <div className="text-[10px] text-muted-foreground">
                        Ngày {format(new Date(match.date), "dd/MM/yyyy")} {match.location && `• Sân ${match.location}`}
                      </div>
                      
                      {match.scorers && (
                        <p className="text-[10px] text-primary font-medium truncate pt-1">
                          ⚽ BÀN THẮNG: {match.scorers}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto mt-2.5 sm:mt-0 font-mono">
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded font-black text-sm text-foreground w-16 text-center">
                        {match.score || "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Scorers & Operations info (1/3 width) */}
        <div className="space-y-6">
          {/* Top Scorers list widget */}
          <div className="rounded-2xl border border-border bg-card/10 backdrop-blur-md p-6 space-y-6">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase block border-b border-border/40 pb-2">
              // THỐNG KÊ GHI BÀN (TOP)
            </span>

            {topScorers.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground border border-dashed rounded-xl">
                Chưa có dữ liệu bàn thắng.
              </div>
            ) : (
              <div className="space-y-3.5 pt-2">
                {topScorers.map((scorer, idx) => (
                  <div key={scorer.name} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-muted-foreground text-xs font-bold">
                        0{idx + 1}
                      </span>
                      <span className="font-bold text-foreground text-sm">{scorer.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-lg">
                      <span className="font-black varsity-font text-xs">{scorer.goals}</span>
                      <span className="text-[8px] font-mono tracking-wider font-extrabold uppercase">BÀN</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stadium / Match Rules Operations Card */}
          <div className="rounded-2xl border border-border bg-card/10 backdrop-blur-md p-6 space-y-4">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase block border-b border-border/40 pb-2">
              // QUY CHẾ & TIÊU CHUẨN CLB
            </span>
            
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">// LỊCH ĐÁ CỐ ĐỊNH</span>
                <p className="leading-relaxed text-[11px]">Tối thứ 3 hằng tuần (20h00 - 21h30). Yêu cầu có mặt trước giờ lăn bóng 15 phút.</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">// ĐÓNG QUỸ NỘI BỘ</span>
                <p className="leading-relaxed text-[11px]">Quỹ đội thu cố định 100k/tháng. Đóng tiền áo riêng lẻ theo đợt sản xuất trang phục.</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">// PHÂN BỔ TIỀN SÂN</span>
                <p className="leading-relaxed text-[11px]">Chi phí thuê sân bóng được chia đều tại chỗ cho tổng số cầu thủ đăng ký tham dự thi đấu trận đó.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
