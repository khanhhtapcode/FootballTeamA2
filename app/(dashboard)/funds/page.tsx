import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FundStatusSelect } from "./_components/fund-status-select";
import { BulkFundForm } from "./_components/bulk-fund-form";
import { YearSelect } from "./_components/year-select";
import { Wallet } from "lucide-react";
import { FUND_AMOUNT, FUND_STATUS, MEMBER_STATUS } from "@/lib/constants";
import { ensureFundRecordsForYear } from "@/lib/services/fund-service";

export default async function FundsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year: yearParam } = await searchParams;
  const currentYear = new Date().getFullYear();
  const parsedYear = yearParam ? parseInt(yearParam) : currentYear;
  const year = Number.isNaN(parsedYear) ? currentYear : parsedYear;

  // Danh sách năm chọn được: 3 năm trước -> 1 năm sau (luôn bao gồm năm đang xem)
  const yearSet = new Set<number>([year]);
  for (let y = currentYear - 3; y <= currentYear + 1; y++) yearSet.add(y);
  const years = Array.from(yearSet).sort((a, b) => b - a);

  // Tạo bù các bản ghi quỹ còn thiếu cho năm đang xem (idempotent)
  await ensureFundRecordsForYear(year);

  const members = await db.member.findMany({
    where: { status: { not: MEMBER_STATUS.RETIRED } },
    include: {
      fundRecords: {
        where: { year },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading">
              Quỹ Hàng Tháng ({year})
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Theo dõi chi tiết thu chi đóng quỹ của các cầu thủ theo tháng
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <YearSelect years={years} selectedYear={year} />
          <BulkFundForm
            year={year}
            members={members.map((m) => ({ id: m.id, name: m.fullName }))}
          />
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-sm border border-border/60 bg-card/30 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-6xl">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-12 border-r border-border text-center font-bold">
                  STT
                </TableHead>
                <TableHead className="w-48 border-r border-border font-bold text-foreground">
                  Họ và Tên
                </TableHead>
                {Array.from({ length: 12 }).map((_, i) => (
                  <TableHead
                    key={i}
                    className="text-center w-24 border-r border-border border-dashed font-bold text-foreground"
                  >
                    Tháng {i + 1}
                  </TableHead>
                ))}
                <TableHead className="text-right border-l border-border w-32 font-bold text-foreground bg-emerald-500/5">
                  Tổng đóng
                </TableHead>
                <TableHead className="text-right w-32 font-bold text-foreground bg-red-500/5">
                  Còn nợ
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={16}
                    className="text-center h-32 text-muted-foreground"
                  >
                    Chưa có thành viên hoạt động nào để theo dõi đóng quỹ.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member, index) => {
                  const records = member.fundRecords;
                  let totalPaid = 0;
                  let totalDebt = 0;

                  const monthsData = Array.from({ length: 12 }).map((_, i) => {
                    const record = records.find((r) => r.month === i + 1);
                    const status =
                      record?.status || FUND_STATUS.NOT_PARTICIPATING;
                    if (status === FUND_STATUS.PAID) totalPaid += FUND_AMOUNT;
                    if (status === FUND_STATUS.UNPAID) totalDebt += FUND_AMOUNT;
                    return { month: i + 1, status };
                  });

                  return (
                    <TableRow
                      key={member.id}
                      className="hover:bg-muted/30 border-b border-border/40 transition-colors"
                    >
                      <TableCell className="border-r border-border text-center font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-bold text-foreground border-r border-border">
                        {member.fullName}
                      </TableCell>
                      {monthsData.map((data) => (
                        <TableCell
                          key={data.month}
                          className="p-1 border-r border-border border-dashed"
                        >
                          <FundStatusSelect
                            memberId={member.id}
                            month={data.month}
                            year={year}
                            currentStatus={data.status}
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-right border-l border-border font-extrabold text-emerald-500 bg-emerald-500/5">
                        {totalPaid > 0
                          ? `${totalPaid.toLocaleString("vi-VN")} ₫`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-red-400 bg-red-500/5">
                        {totalDebt > 0
                          ? `${totalDebt.toLocaleString("vi-VN")} ₫`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
