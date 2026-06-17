import { db } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ExpenseForm } from "./_components/expense-form"
import { ExpenseDeleteButton } from "./_components/expense-delete-button"
import { format } from "date-fns"
import { Receipt } from "lucide-react"

export default async function ExpensesPage() {
  const [expenses, members] = await Promise.all([
    db.expense.findMany({
      orderBy: {
        date: "desc",
      },
    }),

    db.member.findMany({
      where: {
        status: "Hoạt động",
      },
      select: {
        id: true,
        fullName: true,
        jerseyNumber: true,
        position: true,
      },
      orderBy: {
        fullName: "asc",
      },
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Receipt className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading">
              Chi phí
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Quản lý và ghi nhận chi tiết các khoản chi tiêu của đội bóng
            </p>
          </div>
        </div>

        <div>
          <ExpenseForm members={members} />
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1050px]">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-16 text-center font-bold">
                  STT
                </TableHead>

                <TableHead className="font-bold text-foreground">
                  Ngày chi
                </TableHead>

                <TableHead className="font-bold text-foreground">
                  Loại
                </TableHead>

                <TableHead className="w-1/4 font-bold text-foreground">
                  Mô tả chi tiết
                </TableHead>

                <TableHead className="text-right font-bold text-foreground bg-red-500/5">
                  Số tiền
                </TableHead>

                <TableHead className="font-bold text-foreground">
                  Người chi
                </TableHead>

                <TableHead className="font-bold text-foreground">
                  Nguồn chi
                </TableHead>

                <TableHead className="font-bold text-foreground">
                  Ghi chú
                </TableHead>

                <TableHead className="w-[170px] text-center font-bold text-foreground">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center h-32 text-muted-foreground"
                  >
                    Chưa có khoản chi phí nào được ghi nhận.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense, index) => {
                  const isAutoMatchExpense = !!expense.matchId

                  const editExpense = {
                    id: expense.id,
                    date: expense.date.toISOString(),
                    category: expense.category,
                    description: expense.description,
                    amount: expense.amount,
                    spender: expense.spender,
                    source: expense.source,
                    notes: expense.notes,
                    matchId: expense.matchId,
                  }

                  return (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-muted/30 border-b border-border/40 transition-colors"
                    >
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {format(new Date(expense.date), "dd/MM/yyyy")}
                      </TableCell>

                      <TableCell>
                        <span className="px-2.5 py-1 text-xs rounded-lg bg-muted border font-semibold text-foreground">
                          {expense.category}
                        </span>
                      </TableCell>

                      <TableCell className="font-bold text-foreground">
                        {expense.description}
                      </TableCell>

                      <TableCell className="text-right font-extrabold text-red-400 bg-red-500/5">
                        -{expense.amount.toLocaleString("vi-VN")} ₫
                      </TableCell>

                      <TableCell className="font-medium text-foreground">
                        {expense.spender || "Chưa có"}
                      </TableCell>

                      <TableCell className="py-2.5">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-bold border inline-block w-24 text-center ${
                            expense.source === "Quỹ đội"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          }`}
                        >
                          {expense.source}
                        </span>
                      </TableCell>

                      <TableCell
                        className="text-xs text-muted-foreground max-w-[150px] truncate"
                        title={expense.notes || ""}
                      >
                        {expense.notes || "Không có"}
                      </TableCell>

                      <TableCell>
                        {isAutoMatchExpense ? (
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 text-[10px] font-semibold text-amber-500 text-center leading-snug">
                            Tự động từ trận đấu
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <ExpenseForm members={members} expense={editExpense} />

                            <ExpenseDeleteButton
                              expenseId={expense.id}
                              description={expense.description}
                            />
                          </div>
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