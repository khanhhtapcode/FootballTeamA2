"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Eye,
  FileText,
  Footprints,
  Handshake,
  MapPin,
  Trophy,
  Users,
  Wallet,
} from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

type MatchDetail = {
  id: number
  date: string
  opponent: string
  location: string | null
  score: string | null
  result: string
  playersCount: number
  pitchFee: number
  scorers: string | null
  notes: string | null
  expenseSource?: string | null
  expenseSpender?: string | null
  playerStats: {
    id: number
    goals: number
    assists: number
    member: {
      id: number
      fullName: string
      jerseyNumber: number | null
      position: string | null
      avatarUrl?: string | null
    }
  }[]
}

type Props = {
  match: MatchDetail
  feePerPerson: number
}

export function MatchDetailDialog({ match, feePerPerson }: Props) {
  const goalStats = match.playerStats.filter((stat) => stat.goals > 0)
  const assistStats = match.playerStats.filter((stat) => stat.assists > 0)
  const hasPlayerStats = match.playerStats.length > 0

  const isWin = match.result === "Thắng"
  const isLoss = match.result === "Thua"
  const pitchFeePayer =
    match.pitchFee <= 0
      ? "Không phát sinh"
      : match.expenseSource === "Cá nhân"
        ? match.expenseSpender || "Chưa chọn"
        : "Quỹ đội"

  return (
    <Dialog>
      <DialogTrigger render={
        <Button
          variant="outline"
          className="w-full h-9 text-xs font-bold border-primary/20 text-primary hover:bg-primary/10"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Chi tiết trận đấu
        </Button>
      } />

      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Trophy className="w-5 h-5" />
            <DialogTitle className="font-heading">Chi tiết trận đấu</DialogTitle>
          </div>

          <DialogDescription className="text-muted-foreground text-xs">
            Thông tin kết quả, cầu thủ ghi bàn, kiến tạo và chi phí trận đấu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Scoreboard */}
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center w-[38%] text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner mb-2">
                  <Image
                    src="/36.png"
                    alt="FC A2Brotherhood"
                    width={32}
                    height={32}
                    className="rounded"
                  />
                </div>
                <span className="font-extrabold text-sm text-foreground">
                  FC A2Brotherhood
                </span>
              </div>

              <div className="flex flex-col items-center shrink-0">
                <div className="bg-slate-950/90 border border-border/80 px-5 py-2.5 rounded-xl shadow-inner font-mono text-2xl font-black tracking-wider text-white">
                  {match.score || "N/A"}
                </div>

                <span
                  className={`px-3 py-0.5 text-[10px] uppercase font-black tracking-wider rounded-full border mt-2.5 text-center ${
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

              <div className="flex flex-col items-center w-[38%] text-center">
                <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 shadow-inner mb-2">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <span className="font-extrabold text-sm text-foreground">
                  {match.opponent}
                </span>
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground mb-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Ngày thi đấu
              </div>
              <p className="text-sm font-bold text-foreground">
                {format(new Date(match.date), "dd/MM/yyyy")}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground mb-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Sân đấu
              </div>
              <p className="text-sm font-bold text-foreground">
                {match.location || "Chưa xác định"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground mb-1">
                <Users className="w-3.5 h-3.5 text-primary" />
                Số người
              </div>
              <p className="text-sm font-bold text-foreground">
                {match.playersCount} người
              </p>
            </div>
          </div>

          {/* Goals and assists summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground mb-2">
                <Footprints className="w-3.5 h-3.5 text-primary" />
                Ghi bàn
              </div>

              {goalStats.length > 0 ? (
                <div className="space-y-1.5">
                  {goalStats.map((stat) => (
                    <div
                      key={`goal-${stat.id}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-semibold text-foreground">
                        {stat.member.fullName}
                      </span>
                      <span className="font-black text-primary">
                        {stat.goals} bàn
                      </span>
                    </div>
                  ))}
                </div>
              ) : match.scorers ? (
                <p className="text-sm text-foreground font-medium">{match.scorers}</p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Chưa có dữ liệu ghi bàn
                </p>
              )}
            </div>

            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground mb-2">
                <Handshake className="w-3.5 h-3.5 text-emerald-500" />
                Kiến tạo
              </div>

              {assistStats.length > 0 ? (
                <div className="space-y-1.5">
                  {assistStats.map((stat) => (
                    <div
                      key={`assist-${stat.id}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-semibold text-foreground">
                        {stat.member.fullName}
                      </span>
                      <span className="font-black text-emerald-500">
                        {stat.assists} kiến tạo
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Chưa có dữ liệu kiến tạo
                </p>
              )}
            </div>
          </div>

          {/* Player stats table */}
          <div className="rounded-xl border border-border bg-card/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-muted/20">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Thống kê cầu thủ
              </p>
            </div>

            {hasPlayerStats ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="text-left px-3 py-2 font-bold">Cầu thủ</th>
                      <th className="text-center px-3 py-2 font-bold">Số áo</th>
                      <th className="text-center px-3 py-2 font-bold">Vị trí</th>
                      <th className="text-center px-3 py-2 font-bold">Bàn</th>
                      <th className="text-center px-3 py-2 font-bold">Kiến tạo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {match.playerStats.map((stat) => (
                      <tr key={stat.id} className="border-b border-border/30 last:border-0">
                        <td className="px-3 py-2 font-semibold text-foreground">
                          {stat.member.fullName}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {stat.member.jerseyNumber !== null
                            ? `#${stat.member.jerseyNumber}`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {stat.member.position || "-"}
                        </td>
                        <td className="px-3 py-2 text-center font-black text-primary">
                          {stat.goals}
                        </td>
                        <td className="px-3 py-2 text-center font-black text-emerald-500">
                          {stat.assists}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-6">
                Trận này chưa nhập thống kê cầu thủ.
              </p>
            )}
          </div>

          {/* Financial info */}
          <div className="rounded-xl border border-border bg-card/40 p-3">
            <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground mb-2">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              Chi phí trận đấu
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs divide-x divide-border/40">
              <div>
                <span className="text-[10px] text-muted-foreground block">
                  Tiền sân
                </span>
                <span className="font-bold text-foreground">
                  {match.pitchFee.toLocaleString("vi-VN")} ₫
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block">
                  Số người
                </span>
                <span className="font-bold text-foreground">
                  {match.playersCount}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground block">
                  Phí / người
                </span>
                <span className="font-black text-primary">
                  {feePerPerson.toLocaleString("vi-VN")} ₫
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Người trả phí sân
              </span>

              <span className="font-bold text-foreground">
                {pitchFeePayer}
              </span>
            </div>
          </div>

          {/* Notes */}
          {match.notes && (
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black text-muted-foreground mb-2">
                <FileText className="w-3.5 h-3.5" />
                Ghi chú
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {match.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog> 
  )
}