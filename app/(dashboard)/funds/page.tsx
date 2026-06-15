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
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth() + 1; // 1 to 12
  
  const parsedYear = yearParam ? parseInt(yearParam) : currentYear;
  const year = Number.isNaN(parsedYear) ? currentYear : parsedYear;
  const isCurrentYear = year === currentYear;

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
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
              QUỸ ĐỘI HẰNG THÁNG ({year})
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Theo dõi tình hình đóng quỹ 100k hằng tháng của các cầu thủ
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          <YearSelect years={years} selectedYear={year} />
          <BulkFundForm
            year={year}
            members={members.map((m) => ({ id: m.id, name: m.fullName }))}
          />
        </div>
      </div>

      {/* Main Glass Table Card */}
      <div className="rounded-2xl border border-border/60 bg-card/25 backdrop-blur-md overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <Table className="min-w-6xl">
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="w-12 border-r border-border text-center font-black text-muted-foreground">
                  STT
                </TableHead>
                <TableHead className="w-48 border-r border-border font-extrabold text-foreground sticky left-0 bg-background/90 z-10">
                  Họ và Tên
                </TableHead>
                {Array.from({ length: 12 }).map((_, i) => {
                  const isCurrentMonth = isCurrentYear && (i + 1 === currentMonthIndex);
                  return (
                    <TableHead
                      key={i}
                      className={`text-center w-24 border-r border-border border-dashed font-extrabold text-foreground ${
                        isCurrentMonth ? "bg-primary/15 border-x border-x-primary/40 text-primary" : ""
                      }`}
                    >
                      <span className="block leading-tight">Tháng {i + 1}</span>
                      {isCurrentMonth && (
                        <span className="inline-block text-[8px] bg-primary/20 border border-primary/30 text-primary px-1 rounded font-black tracking-wider uppercase mt-0.5">
                          Hiện tại
                        </span>
                      )}
                    </TableHead>
                  );
                })}
                <TableHead className="text-right border-l border-border w-32 font-bold text-foreground bg-emerald-500/10">
                  Tổng đóng
                </TableHead>
                <TableHead className="text-right w-32 font-bold text-foreground bg-red-500/10">
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
                      <TableCell className="border-r border-border text-center font-semibold text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-extrabold text-foreground border-r border-border sticky left-0 bg-background/95 z-10">
                        {member.fullName}
                      </TableCell>
                      {monthsData.map((data) => {
                        const isCurrentMonth = isCurrentYear && (data.month === currentMonthIndex);
                        return (
                          <TableCell
                            key={data.month}
                            className={`p-1 border-r border-border border-dashed transition-all ${
                              isCurrentMonth ? "bg-primary/5 border-x border-x-primary/20" : ""
                            }`}
                          >
                            <FundStatusSelect
                              memberId={member.id}
                              month={data.month}
                              year={year}
                              currentStatus={data.status}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right border-l border-border font-black text-emerald-500 bg-emerald-500/5 text-sm">
                        {totalPaid > 0
                          ? `${totalPaid.toLocaleString("vi-VN")} ₫`
                          : "0 ₫"}
                      </TableCell>
                      <TableCell className="text-right font-black text-red-400 bg-red-500/5 text-sm">
                        {totalDebt > 0
                          ? `${totalDebt.toLocaleString("vi-VN")} ₫`
                          : "0 ₫"}
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
