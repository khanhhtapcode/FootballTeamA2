"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Flame } from "lucide-react"
import { apiFetch } from "@/lib/api-client"

// Định nghĩa kiểu dữ liệu trả về từ API
type PlayerStat = {
  id: number;
  fullName: string;
  position: string | null;
  jerseyNumber: number | null;
  totalGoals: number;
  totalAssists: number;
}

export default function StatsPage() {
  const currentDate = new Date()
  const [month, setMonth] = useState<string>((currentDate.getMonth() + 1).toString())
  const [year, setYear] = useState<string>(currentDate.getFullYear().toString())
  const [stats, setStats] = useState<PlayerStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Hàm gọi API lấy dữ liệu
  const fetchStats = async (selectedMonth: string, selectedYear: string) => {
    setIsLoading(true)
    try {
      const data = await apiFetch(`/api/stats/monthly?month=${selectedMonth}&year=${selectedYear}`)
      setStats(data as PlayerStat[])
    } catch (error) {
      console.error("Lỗi khi lấy thống kê:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Tự động gọi lại API mỗi khi thay đổi tháng hoặc năm
  useEffect(() => {
    fetchStats(month, year)
  }, [month, year])

  // Tạo mảng năm (ví dụ: từ năm ngoái đến năm sau)
  const years = [
    (currentDate.getFullYear() - 1).toString(),
    currentDate.getFullYear().toString(),
    (currentDate.getFullYear() + 1).toString(),
  ]

  // Hàm render icon xếp hạng (Top 1, 2, 3)
  const renderRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400 mx-auto" />
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600 mx-auto" />
    return <span className="font-semibold text-muted-foreground">{index + 1}</span>
  }

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
        <div className="flex items-center gap-3">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[100px] bg-background">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : stats.length === 0 ? (
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
                        <div className="font-semibold">{stat.fullName}</div>
                        <div className="text-xs text-muted-foreground">{stat.position || "Chưa cập nhật"}</div>
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