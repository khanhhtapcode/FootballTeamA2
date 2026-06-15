"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

// Trả về false khi render trên server, true sau khi hydrate ở client.
// Dùng useSyncExternalStore để tránh setState trong effect (gây cascading render).
const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full border bg-background/20 animate-pulse" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full w-9 h-9 border bg-background/40 backdrop-blur-md shadow-sm hover:bg-accent/20 cursor-pointer"
      title="Chuyển chế độ sáng/tối"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.1rem] w-[1.1rem] text-amber-400 animate-spin-slow" />
      ) : (
        <Moon className="h-[1.1rem] w-[1.1rem] text-emerald-600" />
      )}
      <span className="sr-only">Thay đổi giao diện</span>
    </Button>
  )
}
