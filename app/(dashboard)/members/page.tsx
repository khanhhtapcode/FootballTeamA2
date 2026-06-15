import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MemberForm } from "./_components/member-form"
import { MemberStatusSelect } from "./_components/member-status-select"
import { Users } from "lucide-react"

export default async function MembersPage() {
  const members = await db.member.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading">Thành Viên</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Quản lý danh sách cầu thủ và tình trạng đóng quỹ</p>
          </div>
        </div>
        <div>
          <MemberForm />
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-16 text-center font-bold">STT</TableHead>
                <TableHead className="font-bold text-foreground">Họ và Tên</TableHead>
                <TableHead className="font-bold text-foreground">Vị trí</TableHead>
                <TableHead className="font-bold text-foreground">Số áo</TableHead>
                <TableHead className="font-bold text-foreground">SĐT</TableHead>
                <TableHead className="font-bold text-foreground">Ngày tham gia</TableHead>
                <TableHead className="w-44 font-bold text-foreground">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-32 text-muted-foreground">
                    Chưa có thành viên nào. Hãy thêm thành viên đầu tiên!
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member, index) => (
                  <TableRow key={member.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                    <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-bold text-foreground">{member.fullName}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 text-xs rounded-lg bg-muted border font-medium">
                        {member.position || "Chưa chọn"}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {member.jerseyNumber !== null ? `#${member.jerseyNumber}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {member.phone || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.joinDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <MemberStatusSelect id={member.id} currentStatus={member.status} />
                    </TableCell>
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
