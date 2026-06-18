import { db } from "@/lib/db"
import { ScheduleForm } from "./_components/schedule-form"
import { ScheduleStatusSelect } from "./_components/schedule-status-select"
import { ScheduleDeleteButton } from "./_components/schedule-delete-button"
import { format } from "date-fns"
import { Calendar, MapPin, Trophy, FileText, Clock } from "lucide-react"
import Image from "next/image"
import { PeriodFilter } from "../_components/period-filter"
import {
  getPeriodLabel,
  getSelectedPeriod,
  type PeriodSearchParams,
} from "@/lib/period-filter"

export default async function SchedulePage({
  searchParams,
}: {
  searchParams?: Promise<PeriodSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  const { mode, year, month, quarter, from, to, dateFilter } = getSelectedPeriod(resolvedSearchParams)

  const periodLabel = getPeriodLabel(mode, year, month, "lịch thi đấu", quarter, from, to)

  const scheduleWhere = dateFilter
    ? {
        date: dateFilter,
      }
    : {}
  const schedules = await db.schedule.findMany({
    where: scheduleWhere,
    orderBy: {
      date: "asc",
    },
  })

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">LỊCH THI ĐẤU</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Lên kế hoạch, quản lý lịch đấu giao hữu và giải đấu của đội bóng</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <ScheduleForm />
        </div>
      </div>

      <PeriodFilter
        mode={mode}
        year={year}
        month={month}
        quarter={quarter}
        from={from}
        to={to}
        periodLabel={periodLabel}
      />

      {/* Fixtures Grid */}
      {schedules.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-2xl bg-card/15 backdrop-blur-md">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">
            Chưa có lịch thi đấu nào
          </h3>
          <p className="text-sm mt-1">
            {"Không có lịch thi đấu nào trong khoảng thời gian đã chọn."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {schedules.map((schedule, index) => {
            const isConfirmed = schedule.status === "Đã xác nhận"
            const isCancelled = schedule.status === "Đã hủy"

            const editSchedule = {
              id: schedule.id,
              date: schedule.date.toISOString(),
              opponent: schedule.opponent,
              location: schedule.location,
              status: schedule.status,
              notes: schedule.notes,
            }

            return (
              <div 
                key={schedule.id}
                className={`player-card-glow relative p-6 rounded-2xl border bg-card/30 backdrop-blur-md transition-all hover:shadow-md flex flex-col justify-between ${
                  isConfirmed ? "border-emerald-500/20 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.1)]" :
                  isCancelled ? "border-red-500/20 opacity-75" :
                  "border-border/80"
                }`}
              >
                {/* Index & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/80">
                    Fixture #{index + 1}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary/80" />
                      {format(new Date(schedule.date), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>

                {/* Scoreboard layout */}
                <div className="flex items-center justify-between gap-4 py-2 border-b border-border/30 pb-4">
                  {/* Home Team */}
                  <div className="flex flex-col items-center w-[40%] text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner mb-2 group-hover:scale-105 transition-transform">
                      <Image src="/36.png" alt="FC A2Brotherhood" width={28} height={28} className="rounded" />
                    </div>
                    <span className="font-extrabold text-sm text-foreground line-clamp-1">FC A2Brotherhood</span>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className={`text-xs font-black px-3 py-1 rounded-lg border ${
                      isConfirmed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      isCancelled ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-muted text-muted-foreground border-border"
                    }`}>
                      {format(new Date(schedule.date), "HH:mm")}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground tracking-widest mt-1">VS</span>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center w-[40%] text-center">
                    <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 shadow-inner mb-2">
                      <Trophy className="w-5 h-5 text-accent" />
                    </div>
                    <span className="font-extrabold text-sm text-foreground line-clamp-1">{schedule.opponent}</span>
                  </div>
                </div>

                {/* Stadium details & Notes */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 text-foreground font-medium">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Sân: {schedule.location || "Chưa xác định"}</span>
                  </div>

                  {schedule.notes && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 border border-border/40 text-muted-foreground">
                      <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{schedule.notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-border/40 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                      Trạng thái:
                    </span>

                    <ScheduleStatusSelect id={schedule.id} currentStatus={schedule.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <ScheduleForm schedule={editSchedule} />
                    <ScheduleDeleteButton
                      scheduleId={schedule.id}
                      opponent={schedule.opponent}
                    />
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
