import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MatchForm } from "./_components/match-form"
import { format } from "date-fns"
import { Trophy } from "lucide-react"

export default async function MatchesPage() {
  const matches = await db.match.findMany({
    orderBy: { date: 'desc' }
  })

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading">Lịch sử Trận đấu</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Lịch sử thi đấu, tỉ số, số lượng tham gia và phân bổ chi phí</p>
          </div>
        </div>
        <div>
          <MatchForm />
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-16 text-center font-bold">STT</TableHead>
                <TableHead className="font-bold text-foreground">Ngày</TableHead>
                <TableHead className="font-bold text-foreground">Đối thủ</TableHead>
                <TableHead className="font-bold text-foreground">Sân đấu</TableHead>
                <TableHead className="text-center font-bold text-foreground">Tỷ số</TableHead>
                <TableHead className="text-center font-bold text-foreground">Kết quả</TableHead>
                <TableHead className="text-center font-bold text-foreground">Cầu thủ</TableHead>
                <TableHead className="text-right font-bold text-foreground">Phí sân</TableHead>
                <TableHead className="text-right font-bold text-foreground">Phí / người</TableHead>
                <TableHead className="font-bold text-foreground">Ghi bàn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center h-32 text-muted-foreground">
                    Chưa có trận đấu nào được ghi nhận.
                  </TableCell>
                </TableRow>
              ) : (
                matches.map((match, index) => {
                  const feePerPerson = match.playersCount > 0 ? Math.round(match.pitchFee / match.playersCount) : 0
                  return (
                    <TableRow key={match.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                      <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        {format(new Date(match.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{match.opponent}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{match.location || "—"}</TableCell>
                      <TableCell className="text-center font-black text-base text-foreground tracking-wider bg-muted/5">{match.score || "—"}</TableCell>
                      <TableCell className="text-center py-2.5">
                        <span className={`px-3 py-1 text-xs rounded-full font-bold border inline-block w-20 text-center ${
                          match.result === "Thắng" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          match.result === "Thua" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {match.result}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-foreground">{match.playersCount}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {match.pitchFee.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-primary bg-primary/5">
                        {feePerPerson.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate text-foreground font-medium" title={match.scorers || ""}>
                        {match.scorers || "—"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
