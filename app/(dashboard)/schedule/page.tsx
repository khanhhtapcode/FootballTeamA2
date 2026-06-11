import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScheduleForm } from "./_components/schedule-form"
import { ScheduleStatusSelect } from "./_components/schedule-status-select"
import { format } from "date-fns"
import { Calendar } from "lucide-react"

export default async function SchedulePage() {
  const schedules = await db.schedule.findMany({
    orderBy: { date: 'asc' }
  })

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading">Lịch thi đấu</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Lên kế hoạch các trận đấu giao hữu và giải đấu sắp tới</p>
          </div>
        </div>
        <div>
          <ScheduleForm />
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-16 text-center font-bold">STT</TableHead>
                <TableHead className="font-bold text-foreground">Ngày giờ</TableHead>
                <TableHead className="font-bold text-foreground">Đối thủ</TableHead>
                <TableHead className="font-bold text-foreground">Sân đấu</TableHead>
                <TableHead className="w-44 font-bold text-foreground">Trạng thái</TableHead>
                <TableHead className="font-bold text-foreground">Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                    Chưa có lịch thi đấu nào được lên kế hoạch.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule, index) => (
                  <TableRow key={schedule.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                    <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-bold text-foreground">
                      {format(new Date(schedule.date), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-bold text-primary text-base">{schedule.opponent}</TableCell>
                    <TableCell className="font-medium text-foreground">{schedule.location || "—"}</TableCell>
                    <TableCell className="py-2.5">
                      <ScheduleStatusSelect id={schedule.id} currentStatus={schedule.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{schedule.notes || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
