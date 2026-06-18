"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trophy, CalendarIcon, Trash2, Pencil } from "lucide-react"
import { apiFetch } from "@/lib/api-client"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Kiểu dữ liệu cho state thống kê
type PlayerStatInput = {
  memberId: string;
  goals: number;
  assists: number;
}

type MatchFormData = {
  id: number
  date: string
  opponent: string
  location: string | null
  score: string | null
  result: string
  playersCount: number
  pitchFee: number
  scorers: string | null
  notes: string | null
  expenseSource?: string | null
  expenseSpender?: string | null
  playerStats: {
    id: number
    goals: number
    assists: number
    member: {
      id: number
      fullName: string
      jerseyNumber: number | null
      position: string | null
      avatarUrl?: string | null
    }
  }[]
}

export function MatchForm({ match }: { match?: MatchFormData }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState<Date>(
    match?.date ? new Date(match.date) : new Date()
  )
  const router = useRouter()
  const isEdit = !!match

  type MemberOption = {
    id: number
    fullName: string
    jerseyNumber: number | null
    position: string | null
  }

    // State lưu danh sách thành viên lấy từ API
  const [members, setMembers] = useState<MemberOption[]>([])

  // State lưu danh sách thống kê cầu thủ đang nhập
  const [playerStats, setPlayerStats] = useState<PlayerStatInput[]>([])

  // State lưu nguồn trả phí sân
  const [expenseSource, setExpenseSource] = useState(match?.expenseSource || "Quỹ đội")

  // Load danh sách thành viên khi mở form
  useEffect(() => {
    if (open && members.length === 0) {
      apiFetch("/api/members").then((data: unknown) => {
        const arr = data as { data?: unknown[] } | unknown[]
        const memberList = Array.isArray(arr) ? arr : ((arr as { data?: unknown[] }).data || []);
        setMembers(memberList as MemberOption[]);
      }).catch(err => console.error("Lỗi tải thành viên", err));
    }
  }, [open, members.length])

  // Reset form khi đóng/mở
  useEffect(() => {
    if (open) {
      startTransition(() => {
        setDate(match?.date ? new Date(match.date) : new Date())
        setExpenseSource(match?.expenseSource || "Quỹ đội")

        setPlayerStats(
          match?.playerStats?.map((stat) => ({
            memberId: stat.member.id.toString(),
            goals: stat.goals,
            assists: stat.assists,
          })) || []
        )
      })
    }
  }, [open, match])

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const validStats = playerStats
          .filter((stat) => stat.memberId !== "")
          .map((stat) => ({
            memberId: parseInt(stat.memberId, 10),
            goals: stat.goals,
            assists: stat.assists,
          }))

        const rawExpenseSpender = formData.get("expenseSpender")?.toString()
        const expenseSpender =
          rawExpenseSpender === "__none__" ? null : rawExpenseSpender

        const payload = {
          date: formData.get("date"),
          opponent: formData.get("opponent"),
          location: formData.get("location"),
          score: formData.get("score"),
          result: formData.get("result"),
          playersCount: formData.get("playersCount"),
          pitchFee: formData.get("pitchFee"),
          scorers: formData.get("scorers"),
          notes: formData.get("notes"),
          expenseSource: formData.get("expenseSource"),
          expenseSpender,
          playerStats: validStats,
        }

        if (isEdit) {
          await apiFetch(`/api/matches/${match.id}`, {
            method: "PUT",
            body: payload,
          })

          toast.success("Cập nhật trận đấu thành công")
        } else {
          await apiFetch("/api/matches", {
            method: "POST",
            body: payload,
          })

          toast.success("Thêm trận đấu thành công")
        }

        setOpen(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra")
      }
    })
  }

  const addStatRow = () => {
    setPlayerStats([...playerStats, { memberId: "", goals: 0, assists: 0 }])
  }

  const updateStatRow = (index: number, field: keyof PlayerStatInput, value: string | number) => {
    const newStats = [...playerStats]
    newStats[index] = { ...newStats[index], [field]: value }
    setPlayerStats(newStats)
  }

  const removeStatRow = (index: number) => {
    const newStats = [...playerStats]
    newStats.splice(index, 1)
    setPlayerStats(newStats)
  }

  const getMemberDisplayName = (memberId: string) => {
    if (!memberId) return "Chọn cầu thủ"

    const foundMember = members.find((member) => member.id.toString() === memberId)

    if (foundMember) {
      return foundMember.fullName
    }

    return "Đang tải..."
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        isEdit ? (
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs font-bold border-blue-500/20 text-blue-500 hover:bg-blue-500/10"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Sửa
          </Button>
        ) : (
          <Button className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold hover-lift shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm trận đấu
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto glass-panel border border-border">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Trophy className="w-5 h-5" />
            <DialogTitle className="font-heading">
              {isEdit ? "Cập nhật kết quả trận đấu" : "Thêm kết quả trận đấu"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-xs">
            {isEdit
              ? "Chỉnh sửa thông tin kết quả, bàn thắng và kiến tạo của trận đấu."
              : "Điền thông tin kết quả. Chi phí sân sẽ tự động được thêm vào bảng Chi Phí."}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* ... CÁC INPUT CŨ GIỮ NGUYÊN BÊN TRÊN ... */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-sm font-semibold">Ngày <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger 
                    render={
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal h-10 border-border bg-background/50", !date && "text-muted-foreground")} />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
                  </PopoverContent>
                </Popover>
                <input type="hidden" name="date" value={date ? date.toISOString().split('T')[0] : ''} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="opponent" className="text-right text-sm font-semibold">Đối thủ <span className="text-red-500">*</span></Label>
              <Input
                id="opponent"
                name="opponent"
                defaultValue={match?.opponent || ""}
                placeholder="Tên đội bạn"
                className="col-span-3 h-10 border-border bg-background/50"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right text-sm font-semibold">Sân đấu</Label>
              <Input
                id="location"
                name="location"
                defaultValue={match?.location || ""}
                placeholder="Tên sân bóng"
                className="col-span-3 h-10 border-border bg-background/50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="score" className="text-right text-sm font-semibold">Tỷ số</Label>
              <Input
                id="score"
                name="score"
                defaultValue={match?.score || ""}
                placeholder="VD: 3-1"
                className="col-span-3 h-10 border-border bg-background/50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="result" className="text-right text-sm font-semibold">Kết quả <span className="text-red-500">*</span></Label>
              <div className="col-span-3">
                <Select name="result" defaultValue={match?.result || "Thắng"} required>
                  <SelectTrigger className="h-10 border-border bg-background/50">
                    <SelectValue placeholder="Kết quả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thắng">Thắng</SelectItem>
                    <SelectItem value="Hòa">Hòa</SelectItem>
                    <SelectItem value="Thua">Thua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="playersCount" className="text-right text-sm font-semibold">Số người <span className="text-red-500">*</span></Label>
              <Input
                id="playersCount"
                name="playersCount"
                type="number"
                min="1"
                defaultValue={match?.playersCount || ""}
                placeholder="Số cầu thủ chia tiền"
                className="col-span-3 h-10 border-border bg-background/50"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pitchFee" className="text-right text-sm font-semibold">Phí sân (₫)</Label>
              <Input
                id="pitchFee"
                name="pitchFee"
                type="number"
                min="0"
                defaultValue={match?.pitchFee ?? 0}
                className="col-span-3 h-10 border-border bg-background/50"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expenseSource" className="text-right text-sm font-semibold">
                Phí sân do
              </Label>

              <div className="col-span-3">
                <Select
                  name="expenseSource"
                  value={expenseSource}
                  onValueChange={(val) => val && setExpenseSource(val)}
                >
                  <SelectTrigger className="h-10 border-border bg-background/50">
                    <SelectValue placeholder="Chọn nguồn trả phí sân" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Quỹ đội">Quỹ đội</SelectItem>
                    <SelectItem value="Cá nhân">Cá nhân</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expenseSpender" className="text-right text-sm font-semibold">
                Người trả {expenseSource === "Cá nhân" && <span className="text-red-500">*</span>}
              </Label>

              <div className="col-span-3">
                <Select name="expenseSpender" defaultValue={match?.expenseSpender || "__none__"}>
                  <SelectTrigger className="h-10 border-border bg-background/50">
                    <SelectValue placeholder="Chọn người trả tiền sân" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="__none__">-- Chưa chọn --</SelectItem>

                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.fullName}>
                        {member.fullName}
                        {member.jerseyNumber !== null ? ` (#${member.jerseyNumber})` : ""}
                        {member.position ? ` - ${member.position}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {expenseSource === "Cá nhân" && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Nếu cá nhân trả tiền sân, bắt buộc chọn thành viên đã ứng tiền.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scorers" className="text-right text-sm font-semibold">Ghi bàn (Tóm tắt)</Label>
              <Input
                id="scorers"
                name="scorers"
                defaultValue={match?.scorers || ""}
                placeholder="VD: Cường(2), Tuấn(1)"
                className="col-span-3 h-10 border-border bg-background/50"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right text-sm font-semibold">
                Ghi chú
              </Label>
              <Input
                id="notes"
                name="notes"
                defaultValue={match?.notes || ""}
                placeholder="VD: Trận đấu hay, thiếu người, thời tiết xấu..."
                className="col-span-3 h-10 border-border bg-background/50"
              />
            </div>

            {/* --- KHU VỰC MỚI: THỐNG KÊ CHI TIẾT --- */}
            <div className="col-span-4 mt-2 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold text-primary">Thống kê cá nhân (Bàn thắng / Kiến tạo)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStatRow} className="h-8">
                  <Plus className="mr-1 h-3 w-3" /> Thêm cầu thủ
                </Button>
              </div>
              
              <div className="space-y-3">
                {playerStats.map((stat, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select
                      value={stat.memberId}
                      onValueChange={(val) => val && updateStatRow(index, "memberId", val)}
                    >
                      <SelectTrigger className="w-45 h-9 bg-background/50">
                        <span
                          className={cn(
                            "block truncate text-left",
                            !stat.memberId && "text-muted-foreground"
                          )}
                        >
                          {getMemberDisplayName(stat.memberId)}
                        </span>
                      </SelectTrigger>

                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground w-8">Bàn:</span>
                      <Input 
                        type="number" min="0" className="w-16 h-9" 
                        value={stat.goals} 
                        onChange={(e) => updateStatRow(index, "goals", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground w-8">Kiến:</span>
                      <Input 
                        type="number" min="0" className="w-16 h-9" 
                        value={stat.assists} 
                        onChange={(e) => updateStatRow(index, "assists", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <Button type="button" variant="ghost" size="icon" onClick={() => removeStatRow(index)} className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {playerStats.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-2 bg-background/30 rounded-md border border-dashed border-border">
                    Chưa có thống kê nào. Nhấn &quot;Thêm cầu thủ&quot; để nhập.
                  </p>
                )}
              </div>
            </div>
            {/* --- KẾT THÚC KHU VỰC MỚI --- */}

          </div>
          <DialogFooter className="pt-2">
            <Button type="submit" className="cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 w-full sm:w-auto hover-lift" disabled={isPending}>
              {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu kết quả"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}