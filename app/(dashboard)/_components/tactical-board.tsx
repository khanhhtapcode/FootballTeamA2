"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api-client"
import { toast } from "sonner"
import { Settings, User } from "lucide-react"
import Image from "next/image"

type Member = {
  id: number
  fullName: string
  jerseyNumber: number | null
  lineupPosition: string | null
  position: string | null
  avatarUrl?: string | null
}

type Props = {
  activeMembers: Member[]
}

type PositionItem = {
  id: string
  label: string
  name: string
  className: string
}

type FormationItem = {
  id: string
  name: string
  description: string
  positions: PositionItem[]
}

const FORMATIONS: FormationItem[] = [
  {
    id: "3-2-1",
    name: "3-2-1",
    description: "Cân bằng, phòng ngự chắc",
    positions: [
      { id: "GK", label: "GK", name: "Thủ môn", className: "left-[8%] top-1/2 -translate-y-1/2" },
      { id: "DF_L", label: "DFL", name: "Hậu vệ trái", className: "left-[25%] top-[20%] -translate-y-1/2" },
      { id: "DF_C", label: "DFC", name: "Trung vệ", className: "left-[28%] top-1/2 -translate-y-1/2" },
      { id: "DF_R", label: "DFR", name: "Hậu vệ phải", className: "left-[25%] top-[80%] -translate-y-1/2" },
      { id: "MF_L", label: "MFL", name: "Tiền vệ trái", className: "left-[48%] top-[25%] -translate-y-1/2" },
      { id: "MF_R", label: "MFR", name: "Tiền vệ phải", className: "left-[48%] top-[75%] -translate-y-1/2" },
      { id: "ST", label: "ST", name: "Tiền đạo", className: "right-[15%] top-1/2 -translate-y-1/2" },
    ],
  },
  {
    id: "2-3-1",
    name: "2-3-1",
    description: "Phổ biến, kiểm soát giữa sân tốt",
    positions: [
      { id: "GK", label: "GK", name: "Thủ môn", className: "left-[8%] top-1/2 -translate-y-1/2" },
      { id: "DF_L", label: "DFL", name: "Hậu vệ trái", className: "left-[27%] top-[32%] -translate-y-1/2" },
      { id: "DF_R", label: "DFR", name: "Hậu vệ phải", className: "left-[27%] top-[68%] -translate-y-1/2" },
      { id: "MF_L", label: "MFL", name: "Tiền vệ trái", className: "left-[50%] top-[22%] -translate-y-1/2" },
      { id: "MF_C", label: "MFC", name: "Tiền vệ trung tâm", className: "left-[50%] top-1/2 -translate-y-1/2" },
      { id: "MF_R", label: "MFR", name: "Tiền vệ phải", className: "left-[50%] top-[78%] -translate-y-1/2" },
      { id: "ST", label: "ST", name: "Tiền đạo", className: "right-[15%] top-1/2 -translate-y-1/2" },
    ],
  },
  {
    id: "2-1-2-1",
    name: "2-1-2-1",
    description: "Có tiền vệ trụ, dễ luân chuyển bóng",
    positions: [
      { id: "GK", label: "GK", name: "Thủ môn", className: "left-[8%] top-1/2 -translate-y-1/2" },
      { id: "DF_L", label: "DFL", name: "Hậu vệ trái", className: "left-[25%] top-[32%] -translate-y-1/2" },
      { id: "DF_R", label: "DFR", name: "Hậu vệ phải", className: "left-[25%] top-[68%] -translate-y-1/2" },
      { id: "DM", label: "DM", name: "Tiền vệ trụ", className: "left-[43%] top-1/2 -translate-y-1/2" },
      { id: "AM_L", label: "AML", name: "Hộ công trái", className: "left-[60%] top-[30%] -translate-y-1/2" },
      { id: "AM_R", label: "AMR", name: "Hộ công phải", className: "left-[60%] top-[70%] -translate-y-1/2" },
      { id: "ST", label: "ST", name: "Tiền đạo", className: "right-[12%] top-1/2 -translate-y-1/2" },
    ],
  },
  {
    id: "3-1-2",
    name: "3-1-2",
    description: "Phòng ngự chắc, phản công nhanh",
    positions: [
      { id: "GK", label: "GK", name: "Thủ môn", className: "left-[8%] top-1/2 -translate-y-1/2" },
      { id: "DF_L", label: "DFL", name: "Hậu vệ trái", className: "left-[25%] top-[20%] -translate-y-1/2" },
      { id: "DF_C", label: "DFC", name: "Trung vệ", className: "left-[28%] top-1/2 -translate-y-1/2" },
      { id: "DF_R", label: "DFR", name: "Hậu vệ phải", className: "left-[25%] top-[80%] -translate-y-1/2" },
      { id: "DM", label: "DM", name: "Tiền vệ trụ", className: "left-[50%] top-1/2 -translate-y-1/2" },
      { id: "ST_L", label: "STL", name: "Tiền đạo trái", className: "right-[15%] top-[35%] -translate-y-1/2" },
      { id: "ST_R", label: "STR", name: "Tiền đạo phải", className: "right-[15%] top-[65%] -translate-y-1/2" },
    ],
  },
  {
    id: "2-2-2",
    name: "2-2-2",
    description: "Dễ đá, chia đều các tuyến",
    positions: [
      { id: "GK", label: "GK", name: "Thủ môn", className: "left-[8%] top-1/2 -translate-y-1/2" },
      { id: "DF_L", label: "DFL", name: "Hậu vệ trái", className: "left-[27%] top-[35%] -translate-y-1/2" },
      { id: "DF_R", label: "DFR", name: "Hậu vệ phải", className: "left-[27%] top-[65%] -translate-y-1/2" },
      { id: "MF_L", label: "MFL", name: "Tiền vệ trái", className: "left-[50%] top-[35%] -translate-y-1/2" },
      { id: "MF_R", label: "MFR", name: "Tiền vệ phải", className: "left-[50%] top-[65%] -translate-y-1/2" },
      { id: "ST_L", label: "STL", name: "Tiền đạo trái", className: "right-[15%] top-[35%] -translate-y-1/2" },
      { id: "ST_R", label: "STR", name: "Tiền đạo phải", className: "right-[15%] top-[65%] -translate-y-1/2" },
    ],
  },
  {
    id: "1-3-2",
    name: "1-3-2",
    description: "Tấn công mạnh, cần hậu vệ chắc",
    positions: [
      { id: "GK", label: "GK", name: "Thủ môn", className: "left-[8%] top-1/2 -translate-y-1/2" },
      { id: "SW", label: "SW", name: "Hậu vệ quét", className: "left-[25%] top-1/2 -translate-y-1/2" },
      { id: "MF_L", label: "MFL", name: "Tiền vệ trái", className: "left-[48%] top-[25%] -translate-y-1/2" },
      { id: "MF_C", label: "MFC", name: "Tiền vệ trung tâm", className: "left-[48%] top-1/2 -translate-y-1/2" },
      { id: "MF_R", label: "MFR", name: "Tiền vệ phải", className: "left-[48%] top-[75%] -translate-y-1/2" },
      { id: "ST_L", label: "STL", name: "Tiền đạo trái", className: "right-[15%] top-[35%] -translate-y-1/2" },
      { id: "ST_R", label: "STR", name: "Tiền đạo phải", className: "right-[15%] top-[65%] -translate-y-1/2" },
    ],
  },
]

export function TacticalBoard({ activeMembers }: Props) {
  const router = useRouter()

  const [members, setMembers] = React.useState<Member[]>(activeMembers)
  const [updatingPosition, setUpdatingPosition] = React.useState<string | null>(null)
  const [formationId, setFormationId] = React.useState(() => {
    if (typeof window === "undefined") return "3-2-1"
    const saved = window.localStorage.getItem("football-formation")
    return saved && FORMATIONS.some((f) => f.id === saved) ? saved : "3-2-1"
  })
  const [, startSyncTransition] = React.useTransition()

  const isUpdatingRef = React.useRef(false)
  const isBoardUpdating = updatingPosition !== null

  const currentFormation =
    FORMATIONS.find((formation) => formation.id === formationId) || FORMATIONS[0]

  const POSITIONS = currentFormation.positions

  React.useEffect(() => {
    startSyncTransition(() => {
      setMembers(activeMembers)
    })
  }, [activeMembers])

  const getLineupLabel = (positionId: string | null) => {
    if (!positionId) return "Dự bị"

    for (const formation of FORMATIONS) {
      const found = formation.positions.find((position) => position.id === positionId)
      if (found) return found.label
    }

    return positionId   
  }

  const handleChangeFormation = async (nextFormationId: string | null) => {
    if (!nextFormationId) return
    if (isUpdatingRef.current) return
    if (nextFormationId === formationId) return

    const nextFormation = FORMATIONS.find((formation) => formation.id === nextFormationId)
    if (!nextFormation) return

    const previousFormationId = formationId

    const validPositionIds = nextFormation.positions.map((position) => position.id)

    const playersNeedReset = members.filter(
      (member) => member.lineupPosition && !validPositionIds.includes(member.lineupPosition)
    )

    setFormationId(nextFormationId)
    window.localStorage.setItem("football-formation", nextFormationId)

    // Nếu đổi sơ đồ nhưng không cần cập nhật DB thì không cần khóa loading
    if (playersNeedReset.length === 0) return

    isUpdatingRef.current = true
    setUpdatingPosition("formation")

    const beforeUpdate = members

    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.lineupPosition && !validPositionIds.includes(member.lineupPosition)
          ? { ...member, lineupPosition: null }
          : member
      )
    )

    try {
      await Promise.all(
        playersNeedReset.map((member) =>
          apiFetch(`/api/members/${member.id}`, {
            method: "PATCH",
            body: {
              lineupPosition: null,
            },
          })
        )
      )

      toast.success("Đã đổi sơ đồ và đưa cầu thủ không phù hợp về dự bị!")
      router.refresh()
    } catch (error) {
      setMembers(beforeUpdate)
      setFormationId(previousFormationId)
      window.localStorage.setItem("football-formation", previousFormationId)
      toast.error(error instanceof Error ? error.message : "Lỗi khi đổi sơ đồ")
    } finally {
      isUpdatingRef.current = false
      setUpdatingPosition(null)
    }
  }

  const handleSelectPlayer = async (positionId: string, memberIdStr: string | null) => {
    if (!memberIdStr) return
    if (isUpdatingRef.current) return

    const beforeUpdate = members

    const currentPlayer = members.find((member) => member.lineupPosition === positionId)

    const selectedPlayer =
      memberIdStr === "none"
        ? null
        : members.find((member) => member.id === Number(memberIdStr))

    // Nếu vị trí đang trống và người dùng chọn "Để trống" thì không làm gì
    if (!selectedPlayer && !currentPlayer) return

    // Nếu chọn lại đúng cầu thủ đang ở vị trí đó thì không làm gì
    if (selectedPlayer?.id === currentPlayer?.id) return

    let nextMembers = members

    if (!selectedPlayer) {
      // Gỡ cầu thủ khỏi vị trí
      nextMembers = members.map((member) =>
        currentPlayer && member.id === currentPlayer.id
          ? { ...member, lineupPosition: null }
          : member
      )
    } else {
      const selectedOldPosition = selectedPlayer.lineupPosition

      nextMembers = members.map((member) => {
        // Cầu thủ được chọn vào vị trí mới
        if (member.id === selectedPlayer.id) {
          return { ...member, lineupPosition: positionId }
        }

        // Nếu vị trí đích đang có cầu thủ:
        // - selectedPlayer đang ở vị trí khác => đổi chỗ
        // - selectedPlayer đang dự bị => currentPlayer về dự bị
        if (currentPlayer && member.id === currentPlayer.id) {
          return { ...member, lineupPosition: selectedOldPosition || null }
        }

        return member
      })
    }

    const targetMemberId = selectedPlayer ? selectedPlayer.id : currentPlayer?.id

    if (!targetMemberId) return

    isUpdatingRef.current = true
    setMembers(nextMembers)
    setUpdatingPosition(positionId)

    try {
      await apiFetch(`/api/members/${targetMemberId}`, {
        method: "PATCH",
        body: {
          lineupPosition: selectedPlayer ? positionId : null,
        },
      })

      if (selectedPlayer && currentPlayer && selectedPlayer.lineupPosition) {
        toast.success("Đã đổi chỗ cầu thủ!")
      } else if (selectedPlayer && currentPlayer) {
        toast.success("Đã thay cầu thủ!")
      } else if (selectedPlayer) {
        toast.success("Đã gán cầu thủ vào đội hình!")
      } else {
        toast.success("Đã để trống vị trí!")
      }

      router.refresh()
    } catch (error) {
      setMembers(beforeUpdate)
      toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật đội hình")
    } finally {
      isUpdatingRef.current = false
      setUpdatingPosition(null)
    }
  }

  const renderPlayerOptions = (posId: string) => {
    return (
      <>
        <SelectPrimitive.Item
          value="none"
          className="relative flex w-full cursor-pointer items-center rounded-lg py-1.5 px-3 hover:bg-muted outline-none text-red-500 dark:text-red-400 font-semibold"
        >
          <SelectPrimitive.ItemText>-- Để trống --</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>

        {members.map((member) => (
          <SelectPrimitive.Item
            key={member.id}
            value={member.id.toString()}
            className="relative flex w-full cursor-pointer items-center rounded-lg py-1.5 px-3 hover:bg-muted outline-none font-medium text-foreground/90"
          >
            <SelectPrimitive.ItemText>
              <span className="flex flex-col">
                <span>
                  {member.fullName}
                  {member.jerseyNumber !== null ? ` (#${member.jerseyNumber})` : ""}
                  {member.position ? ` [${member.position}]` : ""}
                </span>

                <span className="text-[10px] text-muted-foreground">
                  {member.lineupPosition === posId
                    ? "Đang ở vị trí này"
                    : member.lineupPosition
                      ? `Đang ở ${getLineupLabel(member.lineupPosition)} - chọn để đổi chỗ`
                      : "Dự bị - chọn để thay vào"}
                </span>
              </span>
            </SelectPrimitive.ItemText>
          </SelectPrimitive.Item>
        ))}
      </>
    )
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-card/25 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
      {isBoardUpdating && (
        <div className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-background/55 backdrop-blur-[2px]">
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow">
            Đang cập nhật đội hình...
          </div>
        </div>
      )}
      <div className="flex items-center justify-between z-10 relative">
        <div className="space-y-1">
          <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-primary animate-spin-slow" />
            {"// ĐỘI HÌNH RA SÂN CHÍNH THỨC"}
          </span>

          <p className="text-[10px] text-muted-foreground font-mono uppercase">
            Lựa chọn cầu thủ ra sân cho từng vị trí (Sơ đồ {currentFormation.name})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-mono text-muted-foreground uppercase">
              Sơ đồ hiện tại
            </p>
            <p className="text-xs font-bold text-primary">
              {currentFormation.name}
            </p>
          </div>

          <SelectPrimitive.Root
            value={formationId}
            onValueChange={handleChangeFormation}
            disabled={isBoardUpdating}
          >
            <SelectPrimitive.Trigger className="h-8 min-w-[120px] px-3 rounded-lg border border-primary/20 bg-primary/10 text-primary text-xs font-bold flex items-center justify-between gap-2 outline-none hover:bg-primary/15">
              <SelectPrimitive.Value placeholder="Chọn sơ đồ" />
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
              <SelectPrimitive.Positioner
                align="end"
                side="bottom"
                sideOffset={6}
                className="isolate z-50"
              >
                <SelectPrimitive.Popup className="min-w-64 rounded-xl bg-popover border border-border p-1 shadow-xl text-xs text-popover-foreground">
                  <SelectPrimitive.List className="space-y-0.5">
                    {FORMATIONS.map((formation) => (
                      <SelectPrimitive.Item
                        key={formation.id}
                        value={formation.id}
                        className="relative flex w-full cursor-pointer items-center rounded-lg py-2 px-3 hover:bg-muted outline-none"
                      >
                        <SelectPrimitive.ItemText>
                          <span className="flex flex-col">
                            <span className="font-bold">{formation.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formation.description}
                            </span>
                          </span>
                        </SelectPrimitive.ItemText>
                      </SelectPrimitive.Item>
                    ))}
                  </SelectPrimitive.List>
                </SelectPrimitive.Popup>
              </SelectPrimitive.Positioner>
            </SelectPrimitive.Portal>
          </SelectPrimitive.Root>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-4">
        {/* Sân chiến thuật */}
        <div className="xl:col-span-3 relative w-full aspect-[2/1] bg-emerald-950/10 dark:bg-emerald-950/25 border border-emerald-500/10 dark:border-white/10 rounded-xl overflow-hidden shadow-inner">
          {/* Vạch sân */}
          <div className="absolute inset-2 border border-emerald-500/15 dark:border-white/10 rounded-sm pointer-events-none" />
          <div className="absolute top-2 bottom-2 left-1/2 border-l border-emerald-500/15 dark:border-white/10 pointer-events-none" />
          <div className="absolute w-20 h-20 rounded-full border border-emerald-500/15 dark:border-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500/25 dark:bg-white/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Vòng cấm */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-24 border-y border-r border-emerald-500/15 dark:border-white/10 pointer-events-none" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-24 border-y border-l border-emerald-500/15 dark:border-white/10 pointer-events-none" />

          {/* Khung thành */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-10 border-y border-r border-emerald-500/25 dark:border-white/20 bg-emerald-500/5 dark:bg-white/5 pointer-events-none" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 border-y border-l border-emerald-500/25 dark:border-white/20 bg-emerald-500/5 dark:bg-white/5 pointer-events-none" />

          {POSITIONS.map((pos) => {
            const currentPlayer = members.find((member) => member.lineupPosition === pos.id)

            return (
              <div
                key={pos.id}
                className={cn("absolute flex flex-col items-center z-10 group", pos.className)}
              >
                <div className="relative">
                  <SelectPrimitive.Root
                    value={currentPlayer ? currentPlayer.id.toString() : "none"}
                    onValueChange={(value) => handleSelectPlayer(pos.id, value)}
                    disabled={isBoardUpdating}
                  >
                    <SelectPrimitive.Trigger
                      className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-black text-xs shadow-md transition-transform duration-300 cursor-pointer active-tactile select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/50 overflow-hidden relative group-hover:scale-110",
                        currentPlayer
                          ? "border-white bg-slate-800 text-white shadow-[0_0_12px_oklch(var(--primary)/0.4)]"
                          : "bg-white/95 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-900/95 dark:border-white/15 dark:text-white/40 dark:hover:bg-slate-800 dark:hover:text-white",
                        isBoardUpdating && "opacity-70 pointer-events-none"
                      )}
                    >
                      {currentPlayer ? (
                        currentPlayer.avatarUrl ? (
                          <Image
                            src={currentPlayer.avatarUrl}
                            alt={currentPlayer.fullName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white/50" />
                        )
                      ) : (
                        <span className="text-[10px]">{pos.label}</span>
                      )}
                    </SelectPrimitive.Trigger>

                    <SelectPrimitive.Portal>
                      <SelectPrimitive.Positioner
                        align="center"
                        side="bottom"
                        sideOffset={6}
                        className="isolate z-50"
                      >
                        <SelectPrimitive.Popup className="max-h-60 min-w-56 overflow-y-auto rounded-xl bg-popover border border-border p-1 shadow-xl text-xs text-popover-foreground">
                          <SelectPrimitive.List className="space-y-0.5">
                            {renderPlayerOptions(pos.id)}
                          </SelectPrimitive.List>
                        </SelectPrimitive.Popup>
                      </SelectPrimitive.Positioner>
                    </SelectPrimitive.Portal>
                  </SelectPrimitive.Root>

                  {currentPlayer && currentPlayer.jerseyNumber !== null && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full border border-background z-20 pointer-events-none shadow-sm">
                      {currentPlayer.jerseyNumber}
                    </div>
                  )}
                </div>

                <span
                  className={cn(
                    "text-[9px] sm:text-[10px] mt-1.5 px-1.5 py-0.5 rounded border truncate max-w-[70px] sm:max-w-[85px] text-center block shadow-sm backdrop-blur-sm transition-colors",
                    currentPlayer
                      ? "bg-black/60 text-white font-bold border-white/20"
                      : "bg-black/40 text-white/50 border-white/5"
                  )}
                  title={currentPlayer ? currentPlayer.fullName : "Trống"}
                >
                  {currentPlayer ? currentPlayer.fullName.split(" ").pop() : "Trống"}
                </span>
              </div>
            )
          })}
        </div>

        {/* Danh sách vị trí bên phải */}
        <div className="xl:col-span-2 flex flex-col justify-between border-t xl:border-t-0 xl:border-l border-border/60 pt-4 xl:pt-0 xl:pl-6 space-y-3">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block font-bold">
              {"// DANH SÁCH VỊ TRÍ CHI TIẾT"}
            </span>

            <div className="space-y-2 max-h-[260px] xl:max-h-[300px] overflow-y-auto pr-1">
              {POSITIONS.map((pos) => {
                const currentPlayer = members.find((member) => member.lineupPosition === pos.id)

                return (
                  <div
                    key={pos.id}
                    className="flex items-center justify-between p-2 rounded-xl border border-border/50 bg-background/40 hover:bg-background/80 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-9 py-0.5 rounded text-[9px] font-black text-center border shrink-0",
                          pos.id === "GK"
                            ? "bg-sky-500/10 text-sky-500 border-sky-500/20"
                            : pos.id.startsWith("DF")
                              ? "bg-teal-500/10 text-teal-500 border-teal-500/20"
                              : pos.id.startsWith("MF")
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                        )}
                      >
                        {pos.label}
                      </span>

                      <span className="text-xs font-semibold text-foreground">
                        {pos.name}
                      </span>
                    </div>

                    <div className="w-[150px]">
                      <SelectPrimitive.Root
                        value={currentPlayer ? currentPlayer.id.toString() : "none"}
                        onValueChange={(value) => handleSelectPlayer(pos.id, value)}
                        disabled={isBoardUpdating}
                      >
                        <SelectPrimitive.Trigger
                          className={cn(
                            "w-full h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer outline-none bg-background border-border text-foreground hover:bg-muted transition-colors active-tactile",
                            currentPlayer &&
                              "border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:border-primary/30 dark:bg-primary/10 dark:text-primary",
                            isBoardUpdating && "opacity-70 pointer-events-none"
                          )}
                        >
                          <SelectPrimitive.Value placeholder="-- Trống --" />
                        </SelectPrimitive.Trigger>

                        <SelectPrimitive.Portal>
                          <SelectPrimitive.Positioner
                            align="center"
                            side="bottom"
                            sideOffset={6}
                            className="isolate z-50"
                          >
                            <SelectPrimitive.Popup className="max-h-60 min-w-56 overflow-y-auto rounded-xl bg-popover border border-border p-1 shadow-xl text-xs text-popover-foreground">
                              <SelectPrimitive.List className="space-y-0.5">
                                {renderPlayerOptions(pos.id)}
                              </SelectPrimitive.List>
                            </SelectPrimitive.Popup>
                          </SelectPrimitive.Positioner>
                        </SelectPrimitive.Portal>
                      </SelectPrimitive.Root>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}