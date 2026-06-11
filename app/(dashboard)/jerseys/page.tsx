import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { JerseyForm } from "./_components/jersey-form"
import { JerseyPayForm } from "./_components/jersey-pay-form"
import { Shirt, Landmark, BadgeAlert, BadgeCheck, DollarSign, Wallet } from "lucide-react"

export default async function JerseysPage() {
  const members = await db.member.findMany({
    orderBy: { fullName: 'asc' }
  })
  
  const orders = await db.jerseyOrder.findMany({
    include: { member: true },
    orderBy: { createdAt: 'desc' }
  })

  const totalAmount = orders.reduce((acc, curr) => acc + (curr.status !== "Miễn phí" ? curr.quantity * curr.unitPrice : 0), 0)
  const totalPaid = orders.reduce((acc, curr) => acc + curr.paidAmount, 0)
  const totalDebt = totalAmount - totalPaid
  
  const fullyPaidCount = orders.filter(o => o.status === "Đã trả đủ" || o.status === "Miễn phí").length
  const unpaidCount = orders.length - fullyPaidCount

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading">Thu tiền áo</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Theo dõi đơn đặt áo đấu, tình trạng thanh toán và công nợ của thành viên</p>
          </div>
        </div>
        <div>
          <JerseyForm members={members.map(m => ({ id: m.id, name: m.fullName }))} />
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/20 backdrop-blur-sm shadow-sm">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Shirt className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Đơn áo</p>
            <p className="text-sm font-extrabold text-foreground">{orders.length} người</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/20 backdrop-blur-sm shadow-sm">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400"><DollarSign className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Tổng tiền</p>
            <p className="text-sm font-extrabold text-foreground">{totalAmount.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/20 backdrop-blur-sm shadow-sm">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><Landmark className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Đã thu</p>
            <p className="text-sm font-extrabold text-emerald-500">{totalPaid.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/20 backdrop-blur-sm shadow-sm">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400"><Wallet className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Còn nợ</p>
            <p className="text-sm font-extrabold text-red-400">{totalDebt.toLocaleString('vi-VN')} ₫</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/20 backdrop-blur-sm shadow-sm">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><BadgeCheck className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Đã xong</p>
            <p className="text-sm font-extrabold text-foreground">{fullyPaidCount} đơn</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card/20 backdrop-blur-sm shadow-sm">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><BadgeAlert className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Chưa xong</p>
            <p className="text-sm font-extrabold text-foreground">{unpaidCount} đơn</p>
          </div>
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-16 text-center font-bold">STT</TableHead>
                <TableHead className="font-bold text-foreground">Họ và Tên</TableHead>
                <TableHead className="text-center font-bold text-foreground">Số áo</TableHead>
                <TableHead className="text-center font-bold text-foreground">Size</TableHead>
                <TableHead className="font-bold text-foreground">Màu / Loại</TableHead>
                <TableHead className="text-center font-bold text-foreground">SL</TableHead>
                <TableHead className="text-right font-bold text-foreground">Đơn giá</TableHead>
                <TableHead className="text-right font-bold text-foreground">Thành tiền</TableHead>
                <TableHead className="text-right font-bold text-foreground bg-emerald-500/5">Đã trả</TableHead>
                <TableHead className="text-right font-bold text-foreground bg-red-500/5">Còn nợ</TableHead>
                <TableHead className="text-center font-bold text-foreground">Trạng thái</TableHead>
                <TableHead className="text-center w-28 font-bold text-foreground">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center h-32 text-muted-foreground">
                    Chưa có đơn áo nào được ghi nhận.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, index) => {
                  const totalPrice = order.quantity * order.unitPrice
                  const debt = order.status === "Miễn phí" ? 0 : totalPrice - order.paidAmount
                  return (
                    <TableRow key={order.id} className="hover:bg-muted/30 border-b border-border/40 transition-colors">
                      <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-bold text-foreground">{order.member.fullName}</TableCell>
                      <TableCell className="text-center font-black text-primary text-base">
                        {order.jerseyNumber !== null ? `#${order.jerseyNumber}` : "—"}
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground">
                        <span className="px-2 py-0.5 text-xs rounded bg-muted border font-semibold">
                          {order.size || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{order.description || "—"}</TableCell>
                      <TableCell className="text-center font-semibold text-foreground">{order.quantity}</TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {order.unitPrice.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground bg-muted/5">
                        {order.status === "Miễn phí" ? "0 ₫" : `${totalPrice.toLocaleString('vi-VN')} ₫`}
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-emerald-500 bg-emerald-500/5">
                        {order.paidAmount.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-red-400 bg-red-500/5">
                        {debt > 0 ? `${debt.toLocaleString('vi-VN')} ₫` : "—"}
                      </TableCell>
                      <TableCell className="text-center py-2.5">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-bold border inline-block w-24 text-center ${
                          order.status === 'Đã trả đủ' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          order.status === 'Trả một phần' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          order.status === 'Chưa trả' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {order.status !== "Đã trả đủ" && order.status !== "Miễn phí" && (
                          <JerseyPayForm orderId={order.id} maxAmount={debt} />
                        )}
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
