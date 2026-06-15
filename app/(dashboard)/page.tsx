import { db } from "@/lib/db"
import { Users, DollarSign, Calendar, Trophy, MapPin, Footprints, ShieldAlert, Settings, Info, ArrowRight } from "lucide-react"
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

  // Form indicator (Last 5 matches, oldest to newest) - NO em-dashes
  const formMatches = [...recentMatches].slice(0, 5).reverse()

  // Format date helper
  const todayStr = format(new Date(), "dd.MM.yyyy")

  return (
    <div className="space-y-10 pb-16">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-border/60">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            BẢNG ĐIỀU KHIỂN
          </h1>
          <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase">
            FC A2BROTHERHOOD // HỆ THỐNG QUẢN TRỊ NỘI BỘ
          </p>
        </div>
        <div className="text-xs font-mono bg-muted px-2.5 py-1 rounded border text-muted-foreground">
          DATE: {todayStr}
        </div>
      </div>

      {/* Metrics Row (Sleek card look with inner shadows and corner consistency) */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Fund Balance */}
        <div className="rounded-2xl border border-white/5 bg-card/30 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] player-card-glow">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            CÂN ĐỐI QUỸ
          </span>
          <div className="space-y-1">
            <div className={`text-2xl font-black ${currentBalance >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              {currentBalance.toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-[10px] text-muted-foreground">Số dư khả dụng hiện tại</p>
          </div>
          <div className="text-[9px] font-semibold text-muted-foreground flex gap-3 pt-3 border-t border-border/20 font-mono">
            <span>THU: +{totalFundReceived.toLocaleString('vi-VN')}</span>
            <span>•</span>
            <span>CHI: -{totalExpense.toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Card 2: Roster */}
        <div className="rounded-2xl border border-white/5 bg-card/30 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] player-card-glow">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            ĐỘI HÌNH
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground">
              {membersCount} CẦU THỦ
            </div>
            <p className="text-[10px] text-muted-foreground">Thành viên đăng ký hoạt động</p>
          </div>
          <div className="text-[9px] font-semibold text-emerald-400 pt-3 border-t border-border/20 font-mono uppercase tracking-wider">
            TRẠNG THÁI: HOẠT ĐỘNG CHỦ CHỐT
          </div>
        </div>

        {/* Card 3: Fixtures */}
        <div className="rounded-2xl border border-white/5 bg-card/30 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] player-card-glow">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            LỊCH ĐẤU
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-black text-foreground">
              {upcomingSchedules.length} TRẬN
            </div>
            <p className="text-[10px] text-muted-foreground">Số trận thi đấu sắp diễn ra</p>
          </div>
          <div className="text-[9px] font-semibold text-amber-500 pt-3 border-t border-border/20 font-mono uppercase tracking-wider">
            SÂN ĐẤU: ĐÃ XÁC NHẬN
          </div>
        </div>

        {/* Card 4: Performance */}
        <div className="rounded-2xl border border-white/5 bg-card/30 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] player-card-glow">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            HIỆU SUẤT
          </span>
          <div className="space-y-1">
            <div className="text-2xl font-black text-primary">
              {totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : 0}% THẮNG
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">TỈ LỆ THẮNG / {totalMatches} TRẬN ĐÃ ĐÁ</p>
          </div>
          <div className="flex items-center gap-1.5 pt-3 border-t border-border/20">
            {formMatches.length === 0 ? (
              <span className="text-[10px] font-mono text-muted-foreground">N/A</span>
            ) : (
              formMatches.map((m, idx) => (
                <span
                  key={m.id || idx}
                  className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold border ${
                    m.result === "Thắng" ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20" :
                    m.result === "Thua" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  }`}
                  title={`vs ${m.opponent} (${m.score || "N/A"})`}
                >
                  {m.result === "Thắng" ? "W" : m.result === "Thua" ? "L" : "D"}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bento Layout Split */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        
        {/* Left Column Area: Tactical Board & Fixtures logs (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Bento Visual Diversity Block: High-contrast Mini CSS Tactical Board */}
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="flex items-center justify-between z-10 relative">
              <div className="space-y-1">
                <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-primary animate-spin-slow" />
                  // BẢN ĐỒ CHIẾN THUẬT ĐỘI HÌNH
                </span>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">Sơ đồ bố trí chiến thuật chuẩn 3-2-1 sân 7</p>
              </div>
              <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-mono font-bold">TACTICS BOARD</span>
            </div>

            {/* CSS football pitch drawing */}
            <div className="relative w-full aspect-[2/1] bg-emerald-950/20 border border-white/10 rounded-xl overflow-hidden mt-4 shadow-inner">
              {/* Pitch Outer Circle & markings */}
              <div className="absolute inset-2 border border-white/5 rounded-sm" />
              <div className="absolute top-2 bottom-2 left-1/2 border-l border-white/5" />
              <div className="absolute w-20 h-20 rounded-full border border-white/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

              {/* Penalty boxes */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-24 border-y border-r border-white/5" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-24 border-y border-l border-white/5" />

              {/* Goalposts outlines */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-10 border-y border-r border-white/10 bg-white/5" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 border-y border-l border-white/10 bg-white/5" />

              {/* Player dots - color coded by position (GK: Sky, DF: Teal, MF: Emerald, FW: Gold) */}
              {/* GK */}
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-sky-500 border border-white shadow-[0_0_10px_#0ea5e9] animate-pulse" />
                <span className="text-[7px] text-white/50 font-mono mt-0.5">GK</span>
              </div>

              {/* DF left */}
              <div className="absolute left-20 top-[28%] flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-teal-500 border border-white shadow-[0_0_10px_#14b8a6]" />
                <span className="text-[7px] text-white/50 font-mono mt-0.5">DF</span>
              </div>
              {/* DF right */}
              <div className="absolute left-20 top-[72%] flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-teal-500 border border-white shadow-[0_0_10px_#14b8a6]" />
                <span className="text-[7px] text-white/50 font-mono mt-0.5">DF</span>
              </div>
              {/* DF center */}
              <div className="absolute left-24 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-teal-500 border border-white shadow-[0_0_10px_#14b8a6]" />
                <span className="text-[7px] text-white/50 font-mono mt-0.5">CB</span>
              </div>

              {/* MF center left */}
              <div className="absolute left-[40%] top-[30%] flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white shadow-[0_0_10px_#10b981]" />
                <span className="text-[7px] text-white/50 font-mono mt-0.5">LM</span>
              </div>
              {/* MF center right */}
              <div className="absolute left-[40%] top-[70%] flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white shadow-[0_0_10px_#10b981]" />
                <span className="text-[7px] text-white/50 font-mono mt-0.5">RM</span>
              </div>

              {/* FW */}
              <div className="absolute right-24 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-accent border border-white shadow-[0_0_10px_#eab308] animate-pulse" />
                <span className="text-[7px] text-white/50 font-mono mt-0.5">ST</span>
              </div>
            </div>
          </div>

          {/* Card: Upcoming Fixtures */}
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                // LỊCH THI ĐẤU TIẾP THEO
              </span>
              <Link href="/schedule" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono">
                QUẢN LÝ LỊCH <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl">
                Không tìm thấy dữ liệu lịch thi đấu giao hữu.
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
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-primary" /> Sân {schedule.location || "Chưa xác định"}</span>
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
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                // KẾT QUẢ ĐỐI ĐẦU MỚI NHẤT
              </span>
              <Link href="/matches" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono">
                LỊCH SỬ TRẬN ĐẤU <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentMatches.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl">
                Chưa có dữ liệu kết quả trận đấu được nhập.
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
                          ⚽ GHI BÀN: {match.scorers}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto mt-2.5 sm:mt-0 font-mono">
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded font-black text-sm text-foreground w-16 text-center">
                        {match.score || "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column Area: Scorers & Operations info (1/3 width) */}
        <div className="space-y-6">
          {/* Top Scorers list widget */}
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase block border-b border-border/40 pb-2">
              // VUA PHÁ LƯỚI
            </span>

            {topScorers.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground border border-dashed rounded-xl">
                Chưa có dữ liệu bàn thắng ghi nhận.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
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
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase block border-b border-border/40 pb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary" />
              // ĐIỀU LỆ HOẠT ĐỘNG
            </span>
            
            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">// LỊCH ĐÁ CỐ ĐỊNH</span>
                <p className="leading-relaxed text-[11px]">Tối thứ 3 hằng tuần (20h00 - 21h30). Yêu cầu có mặt trước giờ lăn bóng 15 phút để khởi động.</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">// QUỸ NỘI BỘ</span>
                <p className="leading-relaxed text-[11px]">Đóng tiền quỹ cố định 100k/tháng. Các tháng nợ sẽ hiển thị nợ công cụ trong trang Quỹ.</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">// PHÂN CHIA CHI PHÍ</span>
                <p className="leading-relaxed text-[11px]">Tiền thuê sân đấu chia đều tại chỗ cho các cầu thủ đăng ký đá trận đó. Tiền nước uống chi trả từ Quỹ đội.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
