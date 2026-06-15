"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cn } from "@/lib/utils"
import { apiFetch } from "@/lib/api-client"
import { toast } from "sonner"
import { Settings } from "lucide-react"

type Member = {
  id: number
  fullName: string
  jerseyNumber: number | null
  lineupPosition: string | null
  position: string | null
}

type Props = {
  activeMembers: Member[]
}

const POSITIONS = [
  { id: "GK", label: "GK", name: "Thủ môn", className: "left-[8%] top-1/2 -translate-y-1/2", bg: "bg-sky-500 hover:bg-sky-400 border-sky-300 text-slate-950" },
  { id: "DF_L", label: "DFL", name: "Hậu vệ trái", className: "left-[25%] top-[20%] -translate-y-1/2", bg: "bg-teal-500 hover:bg-teal-400 border-teal-300 text-slate-950" },
  { id: "DF_C", label: "DFC", name: "Trung vệ", className: "left-[28%] top-1/2 -translate-y-1/2", bg: "bg-teal-500 hover:bg-teal-400 border-teal-300 text-slate-950" },
  { id: "DF_R", label: "DFR", name: "Hậu vệ phải", className: "left-[25%] top-[80%] -translate-y-1/2", bg: "bg-teal-500 hover:bg-teal-400 border-teal-300 text-slate-950" },
  { id: "MF_L", label: "MFL", name: "Tiền vệ trái", className: "left-[48%] top-[25%] -translate-y-1/2", bg: "bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-slate-950" },
  { id: "MF_R", label: "MFR", name: "Tiền vệ phải", className: "left-[48%] top-[75%] -translate-y-1/2", bg: "bg-emerald-500 hover:bg-emerald-400 border-emerald-300 text-slate-950" },
  { id: "ST", label: "ST", name: "Tiền đạo", className: "right-[15%] top-1/2 -translate-y-1/2", bg: "bg-accent hover:bg-accent/90 border-accent-foreground/20 text-slate-950" },
]

export function TacticalBoard({ activeMembers }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSelectPlayer = (positionId: string, memberIdStr: string | null) => {
    startTransition(async () => {
      try {
        if (!memberIdStr || memberIdStr === "none") {
          // Tìm cầu thủ hiện tại đang ở vị trí này
          const currentPlayer = activeMembers.find(m => m.lineupPosition === positionId)
          if (currentPlayer) {
            await apiFetch(`/api/members/${currentPlayer.id}`, {
              method: "PATCH",
              body: { lineupPosition: null }
            })
          }
        } else {
          const id = parseInt(memberIdStr, 10)
          await apiFetch(`/api/members/${id}`, {
            method: "PATCH",
            body: { lineupPosition: positionId }
          })
        }
        toast.success("Cập nhật đội hình chính thành công!")
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Lỗi khi cập nhật đội hình")
      }
    })
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-card/25 backdrop-blur-md p-6 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
      <div className="flex items-center justify-between z-10 relative">
        <div className="space-y-1">
          <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-primary animate-spin-slow" />
            // ĐỘI HÌNH RA SÂN CHÍNH THỨC
          </span>
          <p className="text-[10px] text-muted-foreground font-mono uppercase">Lựa chọn cầu thủ ra sân cho từng vị trí (Sơ đồ 3-2-1)</p>
        </div>
        <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded font-mono font-bold">TACTICS BOARD</span>
      </div>

      {/* Grid container: visual pitch on left, text list selectors on right */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-4">
        {/* Left column: Visual Pitch */}
        <div className="xl:col-span-3 relative w-full aspect-[2/1] bg-emerald-950/10 dark:bg-emerald-950/25 border border-emerald-500/10 dark:border-white/10 rounded-xl overflow-hidden shadow-inner">
          {/* Pitch markings */}
          <div className="absolute inset-2 border border-emerald-500/15 dark:border-white/10 rounded-sm pointer-events-none" />
          <div className="absolute top-2 bottom-2 left-1/2 border-l border-emerald-500/15 dark:border-white/10 pointer-events-none" />
          <div className="absolute w-20 h-20 rounded-full border border-emerald-500/15 dark:border-white/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500/25 dark:bg-white/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          {/* Penalty boxes */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-24 border-y border-r border-emerald-500/15 dark:border-white/10 pointer-events-none" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-24 border-y border-l border-emerald-500/15 dark:border-white/10 pointer-events-none" />

          {/* Goalposts outlines */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-10 border-y border-r border-emerald-500/25 dark:border-white/20 bg-emerald-500/5 dark:bg-white/5 pointer-events-none" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-10 border-y border-l border-emerald-500/25 dark:border-white/20 bg-emerald-500/5 dark:bg-white/5 pointer-events-none" />

          {/* Dynamic position selectors */}
          {POSITIONS.map((pos) => {
            const currentPlayer = activeMembers.find(m => m.lineupPosition === pos.id)
            
            return (
              <div key={pos.id} className={cn("absolute flex flex-col items-center z-10", pos.className)}>
                <SelectPrimitive.Root
                  value={currentPlayer ? currentPlayer.id.toString() : "none"}
                  onValueChange={(val) => handleSelectPlayer(pos.id, val)}
                  disabled={isPending}
                >
                  <SelectPrimitive.Trigger
                    className={cn(
                      "w-9 h-9 rounded-full border flex items-center justify-center font-black text-xs shadow-md transition-all cursor-pointer active-tactile select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      currentPlayer 
                        ? "border-white bg-primary text-primary-foreground shadow-[0_0_12px_oklch(var(--primary)/0.4)] scale-105" 
                        : "bg-white/95 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-900/95 dark:border-white/15 dark:text-white/40 dark:hover:bg-slate-800 dark:hover:text-white"
                    )}
                  >
                    {currentPlayer ? (
                      currentPlayer.jerseyNumber !== null ? `${currentPlayer.jerseyNumber}` : currentPlayer.fullName.substring(0, 2).toUpperCase()
                    ) : (
                      pos.label
                    )}
                  </SelectPrimitive.Trigger>

                  <SelectPrimitive.Portal>
                    <SelectPrimitive.Positioner align="center" side="bottom" sideOffset={6} className="isolate z-50">
                      <SelectPrimitive.Popup className="max-h-60 min-w-48 overflow-y-auto rounded-xl bg-popover border border-border p-1 shadow-xl text-xs text-popover-foreground">
                        <SelectPrimitive.List className="space-y-0.5">
                          <SelectPrimitive.Item
                            value="none"
                            className="relative flex w-full cursor-pointer items-center rounded-lg py-1.5 px-3 hover:bg-muted outline-none text-red-500 dark:text-red-400 font-semibold"
                          >
                            <SelectPrimitive.ItemText>-- Để trống --</SelectPrimitive.ItemText>
                          </SelectPrimitive.Item>
                          {activeMembers.map((member) => (
                            <SelectPrimitive.Item
                              key={member.id}
                              value={member.id.toString()}
                              className="relative flex w-full cursor-pointer items-center rounded-lg py-1.5 px-3 hover:bg-muted outline-none font-medium text-foreground/90"
                            >
                              <SelectPrimitive.ItemText>
                                {member.fullName} {member.jerseyNumber !== null ? `(#${member.jerseyNumber})` : ""} {member.position ? `[${member.position}]` : ""}
                              </SelectPrimitive.ItemText>
                            </SelectPrimitive.Item>
                          ))}
                        </SelectPrimitive.List>
                      </SelectPrimitive.Popup>
                    </SelectPrimitive.Positioner>
                  </SelectPrimitive.Portal>
                </SelectPrimitive.Root>
                
                {/* Display player name below position circle */}
                <span 
                  className={cn(
                    "text-[8px] font-mono mt-1 px-1 py-0.2 rounded border truncate max-w-[65px] text-center block",
                    currentPlayer 
                      ? "bg-slate-950/80 text-primary font-bold border-primary/20" 
                      : "bg-slate-950/45 text-white/50 border-white/5"
                  )}
                  title={currentPlayer ? currentPlayer.fullName : "Trống"}
                >
                  {currentPlayer ? currentPlayer.fullName : "Trống"}
                </span>
              </div>
            )
          })}
        </div>

        {/* Right column: Quick text dropdown controllers list */}
        <div className="xl:col-span-2 flex flex-col justify-between border-t xl:border-t-0 xl:border-l border-border/60 pt-4 xl:pt-0 xl:pl-6 space-y-3">
          <div className="space-y-3">
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase block font-bold">
              // DANH SÁCH VỊ TRÍ CHI TIẾT
            </span>
            <div className="space-y-2 max-h-[260px] xl:max-h-[300px] overflow-y-auto pr-1">
              {POSITIONS.map((pos) => {
                const currentPlayer = activeMembers.find(m => m.lineupPosition === pos.id)
                return (
                  <div key={pos.id} className="flex items-center justify-between p-2 rounded-xl border border-border/50 bg-background/40 hover:bg-background/80 transition-all">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-9 py-0.5 rounded text-[9px] font-black text-center border shrink-0",
                        pos.id === "GK" ? "bg-sky-500/10 text-sky-500 border-sky-500/20" :
                        pos.id.startsWith("DF") ? "bg-teal-500/10 text-teal-500 border-teal-500/20" :
                        pos.id.startsWith("MF") ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      )}>
                        {pos.label}
                      </span>
                      <span className="text-xs font-semibold text-foreground">{pos.name}</span>
                    </div>

                    <div className="w-[150px]">
                      <SelectPrimitive.Root
                        value={currentPlayer ? currentPlayer.id.toString() : "none"}
                        onValueChange={(val) => handleSelectPlayer(pos.id, val)}
                        disabled={isPending}
                      >
                        <SelectPrimitive.Trigger
                          className={cn(
                            "w-full h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between cursor-pointer outline-none bg-background border-border text-foreground hover:bg-muted transition-colors active-tactile",
                            currentPlayer && "border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:border-primary/30 dark:bg-primary/10 dark:text-primary"
                          )}
                        >
                          <SelectPrimitive.Value placeholder="-- Trống --" />
                        </SelectPrimitive.Trigger>
                        <SelectPrimitive.Portal>
                          <SelectPrimitive.Positioner align="center" side="bottom" sideOffset={6} className="isolate z-50">
                            <SelectPrimitive.Popup className="max-h-60 min-w-48 overflow-y-auto rounded-xl bg-popover border border-border p-1 shadow-xl text-xs text-popover-foreground">
                              <SelectPrimitive.List className="space-y-0.5">
                                <SelectPrimitive.Item
                                  value="none"
                                  className="relative flex w-full cursor-pointer items-center rounded-lg py-1.5 px-3 hover:bg-muted outline-none text-red-500 dark:text-red-400 font-semibold"
                                >
                                  <SelectPrimitive.ItemText>-- Để trống --</SelectPrimitive.ItemText>
                                </SelectPrimitive.Item>
                                {activeMembers.map((member) => (
                                  <SelectPrimitive.Item
                                    key={member.id}
                                    value={member.id.toString()}
                                    className="relative flex w-full cursor-pointer items-center rounded-lg py-1.5 px-3 hover:bg-muted outline-none font-medium text-foreground/90"
                                  >
                                    <SelectPrimitive.ItemText>
                                      {member.fullName} {member.jerseyNumber !== null ? `(#${member.jerseyNumber})` : ""} {member.position ? `[${member.position}]` : ""}
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
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
