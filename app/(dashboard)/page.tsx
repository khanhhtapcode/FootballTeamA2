import { db } from "@/lib/db"
import { MapPin, Info, ArrowRight, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { FUND_AMOUNT, FUND_STATUS, MEMBER_STATUS } from "@/lib/constants"
import { TacticalBoard } from "./_components/tactical-board"
import { DashboardTimeFilter } from "./_components/dashboard-time-filter"

type DashboardMode = "all" | "year" | "month"

type DashboardSearchParams = {
  mode?: string
  year?: string
  month?: string
}

function getDashboardMode(mode?: string): DashboardMode {
  if (mode === "year" || mode === "month") return mode
  return "all"
}

function getPeriodLabel(mode: DashboardMode, year: number, month: number) {
  if (mode === "year") return `Thống kê năm ${year}`

  if (mode === "month") {
    return `Thống kê tháng ${month.toString().padStart(2, "0")}/${year}`
  }

  return "Thống kê tất cả dữ liệu"
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const mode = getDashboardMode(resolvedSearchParams?.mode)

  const parsedYear = Number(resolvedSearchParams?.year)
  const selectedYear =
    Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
      ? parsedYear
      : currentYear

  const parsedMonth = Number(resolvedSearchParams?.month)
  const selectedMonth =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : currentMonth

  const dateFilter =
    mode === "year"
      ? {
          gte: new Date(selectedYear, 0, 1),
          lt: new Date(selectedYear + 1, 0, 1),
        }
      : mode === "month"
        ? {
            gte: new Date(selectedYear, selectedMonth - 1, 1),
            lt: new Date(selectedYear, selectedMonth, 1),
          }
        : null

  const matchWhere = dateFilter
    ? {
        date: dateFilter,
      }
    : {}

  const expenseWhere = dateFilter
    ? {
        source: "Quỹ đội",
        date: dateFilter,
      }
    : {
        source: "Quỹ đội",
      }

  const fundWhere =
    mode === "year"
      ? {
          status: FUND_STATUS.PAID,
          year: selectedYear,
        }
      : mode === "month"
        ? {
            status: FUND_STATUS.PAID,
            year: selectedYear,
            month: selectedMonth,
          }
        : {
            status: FUND_STATUS.PAID,
          }

  const scheduleWhere = dateFilter
    ? {
        date: dateFilter,
      }
    : {
        date: {
          gte: new Date(),
        },
      }

  const scorerWhere = dateFilter
    ? {
        date: dateFilter,
        NOT: {
          scorers: null,
        },
      }
    : {
        NOT: {
          scorers: null,
        },
      }

  const periodLabel = getPeriodLabel(mode, selectedYear, selectedMonth)

  const [
    membersCount,
    winsCount,
    totalMatches,
    expenseAgg,
    paidFundCount,
    recentMatches,
    upcomingSchedules,
    playerGoalStats,
    activeMembers,
  ] = await Promise.all([
    db.member.count({
      where: {
        status: MEMBER_STATUS.ACTIVE,
      },
    }),

    db.match.count({
      where: {
        ...matchWhere,
        result: "Thắng",
      },
    }),

    db.match.count({
      where: matchWhere,
    }),

    db.expense.aggregate({
      where: expenseWhere,
      _sum: {
        amount: true,
      },
    }),

    db.fundRecord.count({
      where: fundWhere,
    }),

    db.match.findMany({
      where: matchWhere,
      orderBy: {
        date: "desc",
      },
      take: 4,
    }),

    db.schedule.findMany({
      where: scheduleWhere,
      orderBy: {
        date: "asc",
      },
      take: 4,
    }),

    db.playerMatchStat.findMany({
      where: dateFilter
        ? {
            goals: {
              gt: 0,
            },
            match: {
              date: dateFilter,
            },
          }
        : {
            goals: {
              gt: 0,
            },
          },
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            jerseyNumber: true,
            position: true,
            avatarUrl: true,
          },
        },
      },
    }),

    db.member.findMany({
      where: {
        status: MEMBER_STATUS.ACTIVE,
      },
      select: {
        id: true,
        fullName: true,
        jerseyNumber: true,
        lineupPosition: true,
        position: true,
        avatarUrl: true,
      },
      orderBy: {
        fullName: "asc",
      },
    }),
  ])

  const totalExpense = expenseAgg._sum.amount ?? 0
  const totalFundReceived = paidFundCount * FUND_AMOUNT
  const currentBalance = totalFundReceived - totalExpense

  const scorerMap = new Map<
    number,
    {
      id: number
      name: string
      jerseyNumber: number | null
      position: string | null
      avatarUrl: string | null
      goals: number
    }
  >()

  playerGoalStats.forEach((stat) => {
    const current = scorerMap.get(stat.memberId)

    if (current) {
      current.goals += stat.goals
    } else {
        scorerMap.set(stat.memberId, {
          id: stat.member.id,
          name: stat.member.fullName,
          jerseyNumber: stat.member.jerseyNumber,
          position: stat.member.position,
          avatarUrl: stat.member.avatarUrl,
          goals: stat.goals,
        })
    }
  })

  const topScorers = Array.from(scorerMap.values())
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5)

  const formMatches = [...recentMatches].slice(0, 5).reverse()
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

      <DashboardTimeFilter
        mode={mode}
        year={selectedYear}
        month={selectedMonth}
        periodLabel={periodLabel}
      />

      {/* Metrics Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Fund Balance */}
        <div className="rounded-2xl border border-white/5 bg-card/30 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] player-card-glow">
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block">
            CÂN ĐỐI QUỸ
          </span>

          <div className="space-y-1">
            <div
              className={`text-2xl font-black ${
                currentBalance >= 0 ? "text-emerald-500" : "text-red-400"
              }`}
            >
              {currentBalance.toLocaleString("vi-VN")} ₫
            </div>

            <p className="text-[10px] text-muted-foreground">
              {mode === "all" ? "Số dư khả dụng hiện tại" : periodLabel}
            </p>
          </div>

          <div className="text-[9px] font-semibold text-muted-foreground flex gap-3 pt-3 border-t border-border/20 font-mono">
            <span>THU: +{totalFundReceived.toLocaleString("vi-VN")}</span>
            <span>•</span>
            <span>CHI: -{totalExpense.toLocaleString("vi-VN")}</span>
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

            <p className="text-[10px] text-muted-foreground">
              Thành viên đăng ký hoạt động
            </p>
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

            <p className="text-[10px] text-muted-foreground">
              {mode === "all"
                ? "Số trận thi đấu sắp diễn ra"
                : "Số trận trong kỳ thống kê"}
            </p>
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
              {totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : 0}
              % THẮNG
            </div>

            <p className="text-[10px] text-muted-foreground font-mono">
              TỈ LỆ THẮNG / {totalMatches} TRẬN ĐÃ ĐÁ
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-3 border-t border-border/20">
            {formMatches.length === 0 ? (
              <span className="text-[10px] font-mono text-muted-foreground">
                N/A
              </span>
            ) : (
              formMatches.map((match, idx) => (
                <span
                  key={match.id || idx}
                  className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold border ${
                    match.result === "Thắng"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : match.result === "Thua"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  }`}
                  title={`vs ${match.opponent} (${match.score || "N/A"})`}
                >
                  {match.result === "Thắng"
                    ? "W"
                    : match.result === "Thua"
                      ? "L"
                      : "D"}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bento Layout Split */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Column Area */}
        <div className="lg:col-span-2 space-y-8">
          <TacticalBoard activeMembers={activeMembers} />

          {/* Card: Upcoming Fixtures */}
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                {mode === "all"
                  ? "// LỊCH THI ĐẤU TIẾP THEO"
                  : "// LỊCH THI ĐẤU TRONG KỲ"}
              </span>

              <Link
                href="/schedule"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono"
              >
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
                        <Image
                          src="/36.png"
                          alt="Logo"
                          width={18}
                          height={18}
                          className="rounded"
                        />
                      </div>

                      <div>
                        <span className="font-extrabold text-foreground text-sm">
                          FC A2Brotherhood vs {schedule.opponent}
                        </span>

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-medium text-foreground">
                            {format(new Date(schedule.date), "dd/MM/yyyy HH:mm")}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-primary" /> Sân{" "}
                            {schedule.location || "Chưa xác định"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="self-end sm:self-auto mt-2.5 sm:mt-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                          schedule.status === "Đã xác nhận"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : schedule.status === "Đã hủy"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {schedule.status === "Đã xác nhận"
                          ? "CONFIRMED"
                          : schedule.status === "Đã hủy"
                            ? "CANCELLED"
                            : "PENDING"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Recent Results */}
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                {mode === "all"
                  ? "// KẾT QUẢ ĐỐI ĐẦU MỚI NHẤT"
                  : "// KẾT QUẢ ĐỐI ĐẦU TRONG KỲ"}
              </span>

              <Link
                href="/matches"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 font-mono"
              >
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
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                            match.result === "Thắng"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : match.result === "Thua"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {match.result === "Thắng"
                            ? "WIN"
                            : match.result === "Thua"
                              ? "LOSS"
                              : "DRAW"}
                        </span>

                        <span className="font-extrabold text-foreground text-sm">
                          vs {match.opponent}
                        </span>
                      </div>

                      <div className="text-[10px] text-muted-foreground">
                        Ngày {format(new Date(match.date), "dd/MM/yyyy")}{" "}
                        {match.location && `• Sân ${match.location}`}
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

        {/* Right Column Area */}
        <div className="space-y-6">
          {/* Top Scorers */}
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase block border-b border-border/40 pb-2">
              {mode === "all" ? "// VUA PHÁ LƯỚI" : "// VUA PHÁ LƯỚI TRONG KỲ"}
            </span>

            {topScorers.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground border border-dashed rounded-xl">
                Chưa có dữ liệu bàn thắng ghi nhận.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {topScorers.map((scorer, idx) => (
                  <div
                    key={scorer.name}
                    className="flex items-center justify-between text-xs font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-muted-foreground text-xs font-bold w-5">
                        0{idx + 1}
                      </span>

                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                        {scorer.avatarUrl ? (
                          <Image
                            src={scorer.avatarUrl}
                            alt={scorer.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        ) : (
                          <User className="w-4 h-4 text-primary/70" />
                        )}
                      </div>

                      <div>
                        <span className="font-bold text-foreground text-sm block leading-tight">
                          {scorer.name}
                        </span>

                        <span className="text-[9px] text-muted-foreground font-mono">
                          {scorer.jerseyNumber !== null ? `#${scorer.jerseyNumber}` : "Chưa có số áo"}
                          {scorer.position ? ` • ${scorer.position}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-lg">
                      <span className="font-black varsity-font text-xs">
                        {scorer.goals}
                      </span>
                      <span className="text-[8px] font-mono tracking-wider font-extrabold uppercase">
                        BÀN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stadium / Match Rules */}
          <div className="rounded-2xl border border-white/5 bg-card/20 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase block border-b border-border/40 pb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary" />
              {"// ĐIỀU LỆ HOẠT ĐỘNG"}
            </span>

            <div className="space-y-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">
                  {"// LỊCH ĐÁ CỐ ĐỊNH"}
                </span>
                <p className="leading-relaxed text-[11px]">
                  Tối thứ 3 hằng tuần (20h00 - 21h30). Yêu cầu có mặt trước giờ
                  lăn bóng 15 phút để khởi động.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">
                  {"// QUỸ NỘI BỘ"}
                </span>
                <p className="leading-relaxed text-[11px]">
                  Đóng tiền quỹ cố định 100k/tháng. Các tháng nợ sẽ hiển thị nợ
                  công cụ trong trang Quỹ.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider text-primary">
                  {"// PHÂN CHIA CHI PHÍ"}
                </span>
                <p className="leading-relaxed text-[11px]">
                  Tiền thuê sân đấu chia đều tại chỗ cho các cầu thủ đăng ký đá
                  trận đó. Tiền nước uống chi trả từ Quỹ đội.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}