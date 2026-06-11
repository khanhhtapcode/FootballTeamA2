import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Calendar, Trophy, ArrowRight, TrendingUp, Landmark, CalendarDays } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function DashboardPage() {
  const membersCount = await db.member.count()
  
  const matches = await db.match.findMany({
    orderBy: { date: 'desc' }
  })
  const winsCount = matches.filter(m => m.result === "Thắng").length
  const totalMatches = matches.length

  const expenses = await db.expense.findMany()
  const totalExpense = expenses.filter(e => e.source === "Quỹ đội").reduce((acc, curr) => acc + curr.amount, 0)
  
  const fundRecords = await db.fundRecord.findMany({ where: { status: "✅" } })
  // Assuming each paid fund is 100k
  const totalFundReceived = fundRecords.length * 100000

  const currentBalance = totalFundReceived - totalExpense

  const upcomingSchedules = await db.schedule.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    take: 5
  })

  // Format date helper for banner
  const todayStr = format(new Date(), "eeee, 'ngày' dd 'tháng' MM, yyyy")

  return (
    <div className="space-y-8">
      {/* Welcome & Date Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading">Tổng Quan</h1>
          <p className="text-sm text-muted-foreground mt-1">FC A2Brotherhoods Management Dashboard</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 border text-xs font-semibold text-muted-foreground shadow-sm">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Fund Balance */}
        <Card className="hover-lift border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-full h-[3px] ${currentBalance >= 0 ? "bg-emerald-500" : "bg-red-500"}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tồn Quỹ Hiện Tại</CardTitle>
            <div className={`p-2 rounded-lg ${currentBalance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-3xl font-black font-heading ${currentBalance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {currentBalance.toLocaleString('vi-VN')} ₫
            </div>
            <div className="flex flex-col gap-1 mt-3 text-[11px] text-muted-foreground">
              <div className="flex justify-between">
                <span>Tổng thu:</span>
                <span className="font-semibold text-foreground">+{totalFundReceived.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng chi:</span>
                <span className="font-semibold text-foreground">-{totalExpense.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Members Count */}
        <Card className="hover-lift border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tổng Thành Viên</CardTitle>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black font-heading text-foreground">
              {membersCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
              <span className="pulse-dot bg-emerald-500 after:bg-emerald-500" />
              <span>Thành viên hoạt động chính thức</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Upcoming matches */}
        <Card className="hover-lift border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lịch Trận Tới</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black font-heading text-foreground">
              {upcomingSchedules.length > 0 ? upcomingSchedules.length : "Chưa có"}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              {upcomingSchedules.length > 0 ? "Trận đấu sắp diễn ra" : "Hãy lên lịch trận đấu mới"}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Victory trophy Ratio */}
        <Card className="hover-lift border border-border/60 bg-card/40 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tỉ Lệ Thắng</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-black font-heading text-primary">
              {winsCount} <span className="text-lg text-muted-foreground font-normal">/ {totalMatches}</span>
            </div>
            {/* Visual ratio progress bar */}
            <div className="mt-3 space-y-1.5">
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all" 
                  style={{ width: `${totalMatches > 0 ? (winsCount / totalMatches) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>Tỉ lệ: {totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : 0}%</span>
                <span>{totalMatches} trận đấu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Left: Upcoming Matches */}
        <Card className="border border-border bg-card/20 backdrop-blur-md shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-lg font-bold font-heading">Trận Đấu Sắp Tới</CardTitle>
            </div>
            <Link href="/schedule" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {upcomingSchedules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm">Không có lịch thi đấu sắp tới.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSchedules.map(schedule => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:border-primary/20 transition-all hover:shadow-sm">
                    <div className="flex items-start gap-4">
                      {/* Team Logo Icon Banner */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-inner">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-base text-foreground">vs {schedule.opponent}</p>
                        <div className="flex flex-wrap items-center gap-y-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{format(new Date(schedule.date), "dd/MM/yyyy HH:mm")}</span>
                          {schedule.location && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="truncate max-w-[150px]">Sân: {schedule.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full border ${
                        schedule.status === "Đã xác nhận" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        schedule.status === "Đã hủy" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        {schedule.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Right: Recent Matches */}
        <Card className="border border-border bg-card/20 backdrop-blur-md shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-bold font-heading">Kết Quả Gần Đây</CardTitle>
            </div>
            <Link href="/matches" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                <Trophy className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm">Chưa có kết quả trận đấu nào.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.slice(0, 5).map(match => (
                  <div key={match.id} className="flex items-center justify-between p-4 rounded-xl border border-border/80 bg-background/50 hover:border-primary/20 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      {/* Match outcome status indicator */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg border shadow-inner ${
                        match.result === "Thắng" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        match.result === "Thua" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        <span className="font-extrabold text-sm uppercase">{match.result[0]}</span>
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-bold text-base text-foreground">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(match.date), "dd/MM/yyyy")} {match.location && `• Sân ${match.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black tracking-wider w-12 text-center text-foreground">{match.score || "-"}</span>
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-full border w-18 text-center ${
                        match.result === "Thắng" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        match.result === "Thua" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        {match.result}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
