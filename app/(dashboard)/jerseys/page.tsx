import { db } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { JerseyForm } from "./_components/jersey-form"
import { JerseyPayForm } from "./_components/jersey-pay-form"
import { Shirt, Landmark, BadgeCheck, Wallet } from "lucide-react"

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

  const paymentRatio = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">THU TIỀN ÁO</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Theo dõi đơn đặt hàng trang phục thi đấu, doanh thu và đối chiếu công nợ</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <JerseyForm members={members.map(m => ({ id: m.id, name: m.fullName }))} />
        </div>
      </div>

      {/* Bento Statistics Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* Large Widget: Financial Progress (col-span-2) */}
        <div className="md:col-span-2 rounded-2xl border border-border bg-card/30 backdrop-blur-md p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" />
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tiến độ thu tiền áo</span>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-foreground font-heading">
                {totalPaid.toLocaleString('vi-VN')} ₫
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                đã thu được trên tổng {totalAmount.toLocaleString('vi-VN')} ₫ ({paymentRatio}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden border border-border/20">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 shadow-[0_0_8px_oklch(var(--primary)/0.5)]" 
                  style={{ width: `${paymentRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                <span>Khởi động</span>
                <span>Hoàn thành: {paymentRatio}%</span>
                <span>Mục tiêu</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><Landmark className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Đã thu</span>
                <span className="font-extrabold text-emerald-500">{totalPaid.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400"><Wallet className="w-4 h-4" /></div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Còn nợ</span>
                <span className="font-extrabold text-red-400">{totalDebt.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Small Widgets Stack (col-span-1) */}
        <div className="grid grid-cols-2 gap-4 h-full md:flex md:flex-col md:justify-between">
          {/* Order count widget */}
          <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-md p-4 flex flex-col justify-between flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-sky-500" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tổng số đơn</span>
              <p className="text-3xl font-black text-foreground font-heading mt-1.5">{orders.length}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-4 pt-2 border-t border-border/30">
              <Shirt className="w-3.5 h-3.5 text-sky-500" />
              <span>Cầu thủ đặt áo</span>
            </div>
          </div>

          {/* Completion state widget */}
          <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-md p-4 flex flex-col justify-between flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-accent" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trạng thái đơn</span>
              <div className="flex justify-between items-baseline mt-1.5">
                <span className="text-2xl font-black text-emerald-500 font-heading">{fullyPaidCount} <span className="text-xs text-muted-foreground font-normal">Xong</span></span>
                <span className="text-2xl font-black text-amber-500 font-heading">{unpaidCount} <span className="text-xs text-muted-foreground font-normal">Nợ</span></span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-4 pt-2 border-t border-border/30">
              <BadgeCheck className="w-3.5 h-3.5 text-accent" />
              <span>Hoàn tất / Tổng số</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card/25 backdrop-blur-md overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-16 text-center font-bold text-muted-foreground">STT</TableHead>
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
                      <TableCell className="text-center font-semibold text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-extrabold text-foreground">{order.member.fullName}</TableCell>
                      <TableCell className="text-center font-black text-primary text-base">
                        {order.jerseyNumber !== null ? `#${order.jerseyNumber}` : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 text-xs rounded-lg bg-muted border border-border/80 font-black text-foreground">
                          {order.size || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{order.description || "Trống"}</TableCell>
                      <TableCell className="text-center font-bold text-foreground">{order.quantity}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {order.unitPrice.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground bg-muted/5">
                        {order.status === "Miễn phí" ? "0 ₫" : `${totalPrice.toLocaleString('vi-VN')} ₫`}
                      </TableCell>
                      <TableCell className="text-right font-black text-emerald-500 bg-emerald-500/5">
                        {order.paidAmount.toLocaleString('vi-VN')} ₫
                      </TableCell>
                      <TableCell className="text-right font-black text-red-400 bg-red-500/5">
                        {debt > 0 ? `${debt.toLocaleString('vi-VN')} ₫` : "0 ₫"}
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
