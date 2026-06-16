import { db } from "@/lib/db"
import { MatchForm } from "./_components/match-form"
import { MatchDetailDialog } from "./_components/match-detail-dialog"
import { MatchDeleteButton } from "./_components/match-delete-button"
import { format } from "date-fns"
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Footprints,
  FileText,
} from "lucide-react"
import Image from "next/image"

export default async function MatchesPage() {
  const matches = await db.match.findMany({
    orderBy: { date: "desc" },
    include: {
      playerStats: {
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
        orderBy: [
          { goals: "desc" },
          { assists: "desc" },
        ],
      },
    },
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
              LỊCH SỬ TRẬN ĐẤU
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Lịch sử đối đầu, kết quả tỉ số, số người tham gia và chia sẻ chi phí
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <MatchForm />
        </div>
      </div>

      {/* Matches Scoreboard Grid */}
      {matches.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-2xl bg-card/15 backdrop-blur-md">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">Chưa có kết quả trận đấu</h3>
          <p className="text-sm mt-1">Hãy thêm kết quả trận đấu giao hữu đầu tiên!</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {matches.map((match, index) => {
            const feePerPerson =
              match.playersCount > 0
                ? Math.round(match.pitchFee / match.playersCount)
                : 0

            const isWin = match.result === "Thắng"
            const isLoss = match.result === "Thua"

            const goalStats = match.playerStats.filter((stat) => stat.goals > 0)
            const assistStats = match.playerStats.filter((stat) => stat.assists > 0)

            const scorerText =
              goalStats.length > 0
                ? goalStats
                    .map((stat) => {
                      const name = stat.member.fullName.split(" ").pop()
                      return `${name} (${stat.goals})`
                    })
                    .join(", ")
                : match.scorers

            const detailMatch = {
              id: match.id,
              date: match.date.toISOString(),
              opponent: match.opponent,
              location: match.location,
              score: match.score,
              result: match.result,
              playersCount: match.playersCount,
              pitchFee: match.pitchFee,
              scorers: match.scorers,
              notes: match.notes,
              playerStats: match.playerStats.map((stat) => ({
                id: stat.id,
                goals: stat.goals,
                assists: stat.assists,
                member: {
                  id: stat.member.id,
                  fullName: stat.member.fullName,
                  jerseyNumber: stat.member.jerseyNumber,
                  position: stat.member.position,
                  avatarUrl: stat.member.avatarUrl,
                },
              })),
            }

            const editMatch = {
              id: match.id,
              date: match.date.toISOString(),
              opponent: match.opponent,
              location: match.location,
              score: match.score,
              result: match.result,
              playersCount: match.playersCount,
              pitchFee: match.pitchFee,
              scorers: match.scorers,
              notes: match.notes,
              playerStats: match.playerStats.map((stat) => ({
                id: stat.id,
                goals: stat.goals,
                assists: stat.assists,
                member: {
                  id: stat.member.id,
                  fullName: stat.member.fullName,
                  jerseyNumber: stat.member.jerseyNumber,
                  position: stat.member.position,
                  avatarUrl: stat.member.avatarUrl,
                },
              })),
            }

            return (
              <div
                key={match.id}
                className={`player-card-glow relative p-6 rounded-2xl border bg-card/30 backdrop-blur-md transition-all hover:shadow-md flex flex-col justify-between ${
                  isWin
                    ? "border-emerald-500/20 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.1)]"
                    : isLoss
                      ? "border-red-500/20 shadow-[0_4px_20px_-10px_rgba(239,68,68,0.05)]"
                      : "border-border/80"
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/80">
                    Match #{matches.length - index}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{format(new Date(match.date), "dd/MM/yyyy")}</span>
                  </div>
                </div>

                {/* Main Versus Scoreboard */}
                <div className="flex items-center justify-between gap-4 py-3 border-b border-border/30 pb-4">
                  {/* Home Team */}
                  <div className="flex flex-col items-center w-[38%] text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner mb-2 group-hover:scale-105 transition-transform">
                      <Image
                        src="/36.png"
                        alt="FC A2Brotherhood"
                        width={28}
                        height={28}
                        className="rounded"
                      />
                    </div>
                    <span className="font-extrabold text-sm text-foreground line-clamp-1">
                      FC A2Brotherhood
                    </span>
                  </div>

                  {/* Score Box */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="bg-slate-950/90 border border-border/80 px-4.5 py-2 rounded-xl shadow-inner font-mono text-xl font-black tracking-wider text-white">
                      {match.score || "N/A"}
                    </div>

                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase font-black tracking-wider rounded-full border mt-2.5 w-16 text-center ${
                        isWin
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : isLoss
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {match.result}
                    </span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center w-[38%] text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 shadow-inner mb-2">
                      <Trophy className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-extrabold text-sm text-foreground line-clamp-1">
                      {match.opponent}
                    </span>
                  </div>
                </div>

                {/* Match Details Section */}
                <div className="mt-4 space-y-3">
                  {/* Stadium Location */}
                  <div className="flex items-center gap-2 text-xs text-foreground font-semibold">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span>Sân: {match.location || "Chưa xác định"}</span>
                  </div>

                  {/* Goals/Scorers */}
                  {scorerText && (
                    <div className="flex items-start gap-2 text-xs text-foreground p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <Footprints className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                          Ghi bàn:
                        </span>
                        <span className="font-medium text-foreground">{scorerText}</span>
                      </div>
                    </div>
                  )}

                  {/* Assists preview */}
                  {assistStats.length > 0 && (
                    <div className="flex items-start gap-2 text-xs text-foreground p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <Footprints className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                          Kiến tạo:
                        </span>
                        <span className="font-medium text-foreground">
                          {assistStats
                            .map((stat) => {
                              const name = stat.member.fullName.split(" ").pop()
                              return `${name} (${stat.assists})`
                            })
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* General Match Notes */}
                  {match.notes && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground p-2 rounded-lg bg-muted/20 border border-border/40">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{match.notes}</span>
                    </div>
                  )}

                  {/* Financial Breakdown split */}
                  <div className="p-3.5 rounded-xl bg-card border border-border/70 mt-3 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block border-b border-border/40 pb-1.5">
                      Phân bổ chi phí sân
                    </span>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-border/40 pt-1">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          Tiền sân
                        </span>
                        <span className="font-bold text-foreground">
                          {match.pitchFee.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          Số người
                        </span>
                        <span className="font-extrabold text-foreground flex items-center justify-center gap-0.5">
                          <Users className="w-3.5 h-3.5 text-primary" />{" "}
                          {match.playersCount}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">
                          Phí / Cầu thủ
                        </span>
                        <span className="font-black text-primary">
                          {feePerPerson.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <MatchDetailDialog match={detailMatch} feePerPerson={feePerPerson} />
                    </div>
                    <div className="flex-1">
                      <MatchForm match={editMatch} />
                    </div>
                    <div className="flex-1">
                      <MatchDeleteButton matchId={match.id} opponent={match.opponent} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}