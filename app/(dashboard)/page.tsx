import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Calendar, Trophy, ArrowRight, CalendarDays, MapPin, Sparkles, Footprints } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { FUND_AMOUNT, FUND_STATUS, MEMBER_STATUS } from "@/lib/constants"

export default async function DashboardPage() {
  // Chạy song song các truy vấn độc lập để giảm thời gian chờ
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
    db.match.findMany({ orderBy: { date: "desc" }, take: 5 }),
    db.schedule.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 5,
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
      // Matches Name(goals) or Name (goals)
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
    .slice(0, 3) // Top 3

  // Form indicator (Last 5 matches, from oldest to newest)
  const formMatches = [...recentMatches].reverse()

  // Format date helper for banner
  const todayStr = format(new Date(), "eeee, 'ngày' dd 'tháng' MM, yyyy")

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome & Date Header Banner with tactical pitch background */}
      <div className="relative rounded-2xl border border-border/70 overflow-hidden tactical-grid p-6 md:p-8 bg-card/10 backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chân thành - Đoàn kết - Chiến thắng</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight font-heading text-foreground">
              BẢNG TỔNG QUAN CLB
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Chào mừng bạn đến với trung tâm chỉ huy của FC A2Brotherhood. Cập nhật dữ liệu đội hình, tài chính, phong độ và lịch sử thi đấu thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center px-4 py-2.5 rounded-xl bg-muted/40 border text-xs font-bold text-muted-foreground shadow-sm">
            <CalendarDays className="w-4.5 h-4.5 text-primary" />
            <span>{todayStr}</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Fund Balance */}
        <Card className="player-card-glow border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-full h-[3px] ${currentBalance >= 0 ? "bg-emerald-500" : "bg-red-500"}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tồn Quỹ Hiện Tại</CardTitle>
            <div className={`p-2 rounded-lg ${currentBalance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-3xl font-black font-heading ${currentBalance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {currentBalance.toLocaleString('vi-VN')} ₫
            </div>
            <div className="flex flex-col gap-1.5 mt-4 pt-3 text-[11px] text-muted-foreground border-t border-border/40">
              <div className="flex justify-between">
                <span>Tổng thu:</span>
                <span className="font-bold text-foreground">+{totalFundReceived.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng chi:</span>
                <span className="font-bold text-foreground">-{totalExpense.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Members Count */}
        <Card className="player-card-glow border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng Thành Viên</CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black font-heading text-foreground">
              {membersCount}
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
              <span className="pulse-dot bg-emerald-500 after:bg-emerald-500" />
              <span className="font-medium">Đang hoạt động chính thức</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Upcoming matches */}
        <Card className="player-card-glow border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lịch Trận Tới</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black font-heading text-foreground">
              {upcomingSchedules.length > 0 ? upcomingSchedules.length : "Chưa có"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40">
              {upcomingSchedules.length > 0 ? "Các cuộc đối đầu đang chờ" : "Chưa lập lịch thi đấu mới"}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Victory trophy Ratio & Form */}
        <Card className="player-card-glow border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phong Độ & Tỷ Lệ</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex justify-between items-baseline">
              <div className="text-3xl font-black font-heading text-primary">
                {winsCount} <span className="text-sm text-muted-foreground font-normal">/ {totalMatches} W</span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">
                Tỉ lệ: {totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : 0}%
              </span>
            </div>
            
            {/* Form list and progress bar */}
            <div className="mt-3.5 space-y-2 pt-2.5 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Phong độ:</span>
                <div className="flex gap-1">
                  {formMatches.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  ) : (
                    formMatches.map((m, idx) => (
                      <span
                        key={m.id || idx}
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black text-white ${
                          m.result === "Thắng" ? "bg-emerald-500" :
                          m.result === "Thua" ? "bg-red-500" :
                          "bg-zinc-400"
                        }`}
                        title={`vs ${m.opponent} (${m.score})`}
                      >
                        {m.result[0]}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sporty Bento Grid Area */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Upcoming Schedules & Recent Results */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card: Upcoming Matches (Fixtures scoreboards) */}
          <Card className="border border-border/80 bg-card/25 backdrop-blur-md shadow-md rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg font-bold font-heading">Trận Đấu Sắp Tới</CardTitle>
              </div>
              <Link href="/schedule" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {upcomingSchedules.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-muted/15">
                  <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm">Không có lịch thi đấu sắp tới.</p>
                </div>
              ) : (
                upcomingSchedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="relative p-5 rounded-2xl border border-border bg-background/40 hover:border-primary/30 transition-all hover:shadow-md overflow-hidden group active-tactile cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Left: Home Team */}
                      <div className="flex items-center gap-3 w-full sm:w-[40%] justify-end sm:justify-start">
                        <span className="font-extrabold text-sm truncate text-foreground order-1 sm:order-2">FC A2Brotherhood</span>
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 order-2 sm:order-1">
                          <Image src="/36.png" alt="FC A2Brotherhood" width={22} height={22} className="rounded" />
                        </div>
                      </div>

                      {/* Center: VS & Time Info */}
                      <div className="flex flex-col items-center justify-center shrink-0 py-1 px-3 rounded-xl bg-muted/40 border w-24">
                        <span className="text-[10px] font-black tracking-widest text-primary uppercase">VS</span>
                        <span className="text-[10px] font-bold text-muted-foreground mt-0.5">{format(new Date(schedule.date), "dd/MM HH:mm")}</span>
                      </div>

                      {/* Right: Opponent Team */}
                      <div className="flex items-center gap-3 w-full sm:w-[40%] justify-start">
                        <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          <Trophy className="w-4.5 h-4.5 text-accent" />
                        </div>
                        <span className="font-extrabold text-sm truncate text-foreground">{schedule.opponent}</span>
                      </div>
                    </div>

                    {/* Bottom detail row */}
                    <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary/80" />
                        <span>Sân: {schedule.location || "Chưa xác định"}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-black tracking-wider rounded-full border ${
                        schedule.status === "Đã xác nhận" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        schedule.status === "Đã hủy" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Card: Recent Results */}
          <Card className="border border-border/80 bg-card/25 backdrop-blur-md shadow-md rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg font-bold font-heading">Kết Quả Gần Đây</CardTitle>
              </div>
              <Link href="/matches" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {recentMatches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-muted/15">
                  <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm">Chưa có kết quả trận đấu nào.</p>
                </div>
              ) : (
                recentMatches.map((match) => (
                  <div 
                    key={match.id} 
                    className="p-5 rounded-2xl border border-border bg-background/40 hover:border-primary/30 transition-all hover:shadow-md overflow-hidden relative group active-tactile cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Left: Home Team */}
                      <div className="flex items-center gap-3 w-full sm:w-[38%] justify-end sm:justify-start">
                        <span className="font-extrabold text-sm truncate text-foreground order-1 sm:order-2">FC A2Brotherhood</span>
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 order-2 sm:order-1">
                          <Image src="/36.png" alt="FC A2Brotherhood" width={22} height={22} className="rounded" />
                        </div>
                      </div>

                      {/* Center Scoreboard Container */}
                      <div className="flex items-center justify-center gap-1 bg-slate-950/80 border border-border/80 px-4 py-1.5 rounded-xl shadow-inner shrink-0">
                        <span className={`text-base font-black tracking-wider font-mono ${
                          match.result === "Thắng" ? "text-emerald-400" :
                          match.result === "Thua" ? "text-red-400" : "text-white"
                        }`}>
                          {match.score || "-"}
                        </span>
                      </div>

                      {/* Right: Opponent Team */}
                      <div className="flex items-center gap-3 w-full sm:w-[38%] justify-start">
                        <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                          <Trophy className="w-4.5 h-4.5 text-accent" />
                        </div>
                        <span className="font-extrabold text-sm truncate text-foreground">{match.opponent}</span>
                      </div>
                    </div>

                    {/* Footer match details */}
                    <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>Ngày: {format(new Date(match.date), "dd/MM/yyyy")}</span>
                        {match.location && (
                          <>
                            <span>•</span>
                            <span>Sân {match.location}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {match.scorers && (
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-medium truncate max-w-[150px]" title={match.scorers}>
                            ⚽ {match.scorers}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-black tracking-wider rounded-full border w-16 text-center ${
                          match.result === "Thắng" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          match.result === "Thua" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {match.result}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Top Scorers Widget (Podium layout) */}
        <div>
          <Card className="border border-border/80 bg-card/25 backdrop-blur-md shadow-md rounded-2xl h-full flex flex-col">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2.5">
                <Footprints className="w-5 h-5 text-accent" />
                <CardTitle className="text-lg font-bold font-heading">Vua Phá Lưới (Goals)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-between">
              {topScorers.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl bg-muted/15 my-auto">
                  <Footprints className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm">Chưa có bàn thắng nào được ghi.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Visual Podium for Top 3 */}
                  <div className="flex items-end justify-center gap-3 pt-6 pb-2 border-b border-border/30">
                    {/* Rank 2 (Silver) */}
                    {topScorers[1] && (
                      <div className="flex flex-col items-center w-[30%]">
                        <div className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">{topScorers[1].name}</div>
                        <div className="w-full bg-zinc-600/35 border-t-2 border-zinc-400/50 rounded-t-lg h-16 mt-2 flex flex-col items-center justify-center">
                          <span className="text-sm font-black text-zinc-300 varsity-font leading-none">{topScorers[1].goals}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 mt-1">2ND</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 1 (Gold) */}
                    {topScorers[0] && (
                      <div className="flex flex-col items-center w-[35%] relative">
                        <div className="absolute -top-6 text-xl">👑</div>
                        <div className="text-xs font-black text-foreground truncate w-full text-center">{topScorers[0].name}</div>
                        <div className="w-full bg-accent/20 border-t-2 border-accent/70 rounded-t-xl h-22 mt-2 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                          <span className="text-lg font-black text-accent varsity-font leading-none">{topScorers[0].goals}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-accent mt-1">1ST</span>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 (Bronze) */}
                    {topScorers[2] && (
                      <div className="flex flex-col items-center w-[30%]">
                        <div className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">{topScorers[2].name}</div>
                        <div className="w-full bg-amber-900/20 border-t-2 border-amber-700/50 rounded-t-lg h-12 mt-2 flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-amber-600 varsity-font leading-none">{topScorers[2].goals}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-700 mt-1">3RD</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* List View details */}
                  <div className="space-y-3 mt-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Xếp Hạng Ghi Bàn</p>
                    {topScorers.map((scorer, idx) => (
                      <div 
                        key={scorer.name} 
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? "bg-accent/25 text-accent border border-accent/20" :
                            idx === 1 ? "bg-zinc-500/20 text-zinc-300 border border-zinc-500/20" :
                            idx === 2 ? "bg-amber-900/35 text-amber-600 border border-amber-850/20" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-foreground">{scorer.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg text-primary">
                          <span className="text-sm font-black varsity-font">{scorer.goals}</span>
                          <span className="text-[9px] font-bold uppercase">Bàn</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom motivation tag */}
              <div className="mt-6 p-4 rounded-xl border border-border/80 bg-muted/20 text-center text-xs text-muted-foreground flex flex-col justify-center items-center">
                <Sparkles className="w-4 h-4 text-accent mb-1 animate-pulse" />
                <p className="font-semibold">Chiến thắng đến từ tinh thần đồng đội!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
