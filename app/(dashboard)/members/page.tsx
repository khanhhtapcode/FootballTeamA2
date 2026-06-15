import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MemberForm } from "./_components/member-form"
import { MemberStatusSelect } from "./_components/member-status-select"
import { MemberLineupSelect } from "./_components/member-lineup-select"
import { Users, LayoutGrid, List, Phone, Calendar, Shirt } from "lucide-react"
import Link from "next/link"
import { MEMBER_POSITIONS } from "@/lib/constants"

interface RosterMember {
  id: number
  fullName: string
  position: string | null
  jerseyNumber: number | null
  phone: string | null
  joinDate: Date
  status: string
  lineupPosition: string | null
}

type Props = {
  searchParams: Promise<{ view?: string; position?: string }>
}

const POSITIONS = MEMBER_POSITIONS

export default async function MembersPage({ searchParams }: Props) {
  const { view: viewParam, position: positionParam } = await searchParams
  const view = viewParam === "list" ? "list" : "grid"
  const selectedPosition = positionParam || "Tất cả"

  // Xây dựng điều kiện lọc theo vị trí thi đấu
  const whereClause = selectedPosition !== "Tất cả" ? { position: selectedPosition } : {}

  const members = (await db.member.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  })) as unknown as RosterMember[]

  // Định nghĩa màu sắc badge cho từng vị trí thi đấu
  const getPositionColor = (pos: string | null) => {
    switch (pos) {
      case "Thủ môn": return "bg-sky-500/10 text-sky-400 border-sky-500/20"
      case "Hậu vệ": return "bg-teal-500/10 text-teal-400 border-teal-500/20"
      case "Tiền vệ": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "Tiền đạo": return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      default: return "bg-accent/10 text-accent border-accent/20"
    }
  }

  // Định nghĩa class nền dựa trên vị trí thi đấu
  const getPlayerCardBackground = (pos: string | null) => {
    switch (pos) {
      case "Thủ môn": return "player-card-bg-gk"
      case "Hậu vệ": return "player-card-bg-df"
      case "Tiền vệ": return "player-card-bg-mf"
      case "Tiền đạo": return "player-card-bg-fw"
      default: return "player-card-bg-ut"
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">THÀNH VIÊN</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Quản lý danh sách cầu thủ, số áo đấu, vị trí và trạng thái thi đấu</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <MemberForm />
        </div>
      </div>

      {/* Control bar: Filters & View Switchers */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between p-4 rounded-xl border border-border/80 bg-card/25 backdrop-blur-md">
        {/* Positions filters */}
        <div className="flex flex-wrap gap-1.5">
          {POSITIONS.map((pos) => {
            const isSelected = selectedPosition === pos
            return (
              <Link
                key={pos}
                href={`?view=${view}&position=${pos}`}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all active-tactile ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background/40 hover:bg-background/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {pos}
              </Link>
            )
          })}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border self-start md:self-auto">
          <Link
            href={`?view=grid&position=${selectedPosition}`}
            className={`p-2 rounded-lg transition-all active-tactile ${
              view === "grid"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Dạng thẻ"
          >
            <LayoutGrid className="w-4 h-4" />
          </Link>
          <Link
            href={`?view=list&position=${selectedPosition}`}
            className={`p-2 rounded-lg transition-all active-tactile ${
              view === "list"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Dạng danh sách"
          >
            <List className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Roster Showcase */}
      {members.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-2xl bg-card/10 backdrop-blur-md">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">Không tìm thấy thành viên</h3>
          <p className="text-sm mt-1">Không có cầu thủ nào khớp với bộ lọc vị trí đã chọn.</p>
        </div>
      ) : view === "grid" ? (
        /* GRID VIEW: FUT digital cards roster */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((member) => {
            const bgClass = getPlayerCardBackground(member.position)
            const posBadgeColor = getPositionColor(member.position)
            return (
              <div 
                key={member.id} 
                className={`player-card-glow relative rounded-2xl border border-border/80 p-5 ${bgClass} backdrop-blur-md flex flex-col justify-between h-[230px]`}
              >
                {/* Huge varsity background jersey number */}
                {member.jerseyNumber !== null && (
                  <div className="absolute bottom-1 right-2 text-primary/8 font-black varsity-font text-8xl pointer-events-none select-none">
                    {member.jerseyNumber}
                  </div>
                )}

                {/* Top content */}
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-black tracking-wider rounded-md border ${posBadgeColor}`}>
                      {member.position || "UT"}
                    </span>
                    {member.jerseyNumber !== null ? (
                      <span className="flex items-center gap-0.5 text-xs font-black text-primary">
                        <Shirt className="w-3.5 h-3.5" />
                        #{member.jerseyNumber}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground tracking-tight leading-snug line-clamp-1">{member.fullName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary/80" />
                      <span>Gia nhập: {new Date(member.joinDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom content & interactions */}
                <div className="space-y-3 relative z-10">
                  {member.phone ? (
                    <a 
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group/phone"
                    >
                      <Phone className="w-3.5 h-3.5 text-primary group-hover/phone:scale-105 transition-transform" />
                      <span>{member.phone}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/40">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground/30" />
                      <span>Chưa có SĐT</span>
                    </span>
                  )}

                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">Trạng thái</span>
                      <MemberStatusSelect id={member.id} currentStatus={member.status} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">Đội hình chính</span>
                      <MemberLineupSelect id={member.id} currentLineupPosition={member.lineupPosition} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* LIST VIEW: High contrast table list */
        <div className="rounded-2xl border border-border/60 bg-card/20 backdrop-blur-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="w-16 text-center font-bold text-muted-foreground">STT</TableHead>
                  <TableHead className="font-bold text-foreground">Họ và Tên</TableHead>
                  <TableHead className="font-bold text-foreground">Vị trí</TableHead>
                  <TableHead className="font-bold text-foreground text-center">Số áo</TableHead>
                  <TableHead className="font-bold text-foreground">Số điện thoại</TableHead>
                  <TableHead className="font-bold text-foreground">Ngày tham gia</TableHead>
                  <TableHead className="w-44 font-bold text-foreground text-center">Đội hình chính</TableHead>
                  <TableHead className="w-44 font-bold text-foreground text-right">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => {
                  const posBadgeColor = getPositionColor(member.position)
                  return (
                    <TableRow key={member.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                      <TableCell className="text-center font-semibold text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-extrabold text-foreground text-base">{member.fullName}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border inline-block ${posBadgeColor}`}>
                          {member.position || "Chưa chọn"}
                        </span>
                      </TableCell>
                      <TableCell className="font-black text-primary text-center text-base">
                        {member.jerseyNumber !== null ? `#${member.jerseyNumber}` : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground font-semibold">
                        {member.phone ? (
                          <a href={`tel:${member.phone}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-primary" />
                            {member.phone}
                          </a>
                        ) : (
                          "Chưa có"
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-medium">
                        {new Date(member.joinDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="py-2.5 text-center">
                        <div className="flex justify-center">
                          <MemberLineupSelect id={member.id} currentLineupPosition={member.lineupPosition} />
                        </div>
                      </TableCell>
                      <TableCell className="flex justify-end py-2.5">
                        <MemberStatusSelect id={member.id} currentStatus={member.status} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
