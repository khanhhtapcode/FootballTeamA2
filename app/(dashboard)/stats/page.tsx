import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Flame, User } from "lucide-react"
import Image from "next/image"
import { getMonthlyPlayerStats } from "@/lib/services/stat-service"
import { StatsFilter } from "./_components/stats-filter"

type StatsSearchParams = {
  month?: string
  year?: string
}

// Hàm render icon xếp hạng (Top 1, 2, 3)
function renderRankIcon(index: number) {
  if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />
  if (index === 1) return <Medal className="w-5 h-5 text-gray-400 mx-auto" />
  if (index === 2) return <Medal className="w-5 h-5 text-amber-600 mx-auto" />
  return <span className="font-semibold text-muted-foreground">{index + 1}</span>
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams?: Promise<StatsSearchParams>
}) {
  const resolvedSearchParams = await searchParams

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  const parsedMonth = Number(resolvedSearchParams?.month)
  const month =
    Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : currentMonth

  const parsedYear = Number(resolvedSearchParams?.year)
  const year =
    Number.isInteger(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100
      ? parsedYear
      : currentYear

  const stats = await getMonthlyPlayerStats(month, year)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            Bảng Phong Độ
          </h1>
          <p className="text-muted-foreground">Thống kê bàn thắng và kiến tạo theo tháng</p>
        </div>

        {/* Bộ lọc Tháng & Năm */}
        <StatsFilter month={month} year={year} />
      </div>

      <Card className="glass-panel border-border">
        <CardHeader>
          <CardTitle>Thống kê tháng {month}/{year}</CardTitle>
          <CardDescription>Danh sách các cầu thủ ghi dấu giày vào bàn thắng nhiều nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px] text-center">Hạng</TableHead>
                  <TableHead>Cầu thủ</TableHead>
                  <TableHead className="text-center">Số áo</TableHead>
                  <TableHead className="text-center font-bold text-green-600 dark:text-green-500">Bàn thắng ⚽</TableHead>
                  <TableHead className="text-center font-bold text-blue-600 dark:text-blue-500">Kiến tạo 👟</TableHead>
                  <TableHead className="text-center font-bold">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      Không có dữ liệu ghi bàn/kiến tạo nào trong tháng này.
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.map((stat, index) => (
                    <TableRow key={stat.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="text-center font-medium">
                        {renderRankIcon(index)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-primary/10 flex items-center justify-center shrink-0">
                            {stat.avatarUrl ? (
                              <Image
                                src={stat.avatarUrl}
                                alt={stat.fullName}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            ) : (
                              <User className="w-4 h-4 text-primary/70" />
                            )}
                          </div>

                          <div>
                            <div className="font-semibold text-foreground">
                              {stat.fullName}
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {stat.position || "Chưa cập nhật"}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-center text-muted-foreground">
                        {stat.jerseyNumber ? `#${stat.jerseyNumber}` : "-"}
                      </TableCell>

                      <TableCell className="text-center text-lg font-bold text-green-600 dark:text-green-500">
                        {stat.totalGoals}
                      </TableCell>

                      <TableCell className="text-center text-lg font-bold text-blue-600 dark:text-blue-500">
                        {stat.totalAssists}
                      </TableCell>

                      <TableCell className="text-center text-lg font-extrabold">
                        {stat.totalGoals + stat.totalAssists}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
