"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Wallet,
  Trophy,
  Receipt,
  Calendar,
  Shirt,
  LogOut,
  Flame, // 1. Đã thêm import icon Flame ở đây
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logOut } from "@/lib/actions/auth"

const navItems = [
  { title: "Tổng quan", url: "/", icon: LayoutDashboard },
  { title: "Thành viên", url: "/members", icon: Users },
  { title: "Quỹ đội", url: "/funds", icon: Wallet },
  { title: "Lịch sử trận đấu", url: "/matches", icon: Trophy },
  { title: "Bảng Phong Độ", url: "/stats", icon: Flame }, // 2. Đã thêm menu thống kê vào đây
  { title: "Chi phí", url: "/expenses", icon: Receipt },
  { title: "Lịch thi đấu", url: "/schedule", icon: Calendar },
  { title: "Thu tiền áo", url: "/jerseys", icon: Shirt },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl">
      <SidebarHeader className="p-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 hover:opacity-95 transition-opacity group">
          <div className="relative">
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Image src="/36.png" alt="FC A2Brotherhood" width={40} height={40} className="relative rounded-lg border border-sidebar-border shadow-md" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-foreground font-heading leading-tight group-hover:text-primary transition-colors">FC A2Brotherhood</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] uppercase font-black tracking-widest text-primary">Football Club</span>
              <span className="text-[8px] px-1 py-0.2 rounded bg-accent/20 text-accent font-mono font-bold">EST. 2026</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.url || (pathname.startsWith(item.url + '/') && item.url !== '/');
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  isActive={isActive}
                  className={`w-full gap-3 py-6 px-3 rounded-xl cursor-pointer active-tactile transition-all duration-300 ${
                    isActive 
                      ? "bg-linear-to-r from-primary/15 via-primary/5 to-transparent text-primary font-bold border-l-[3px] border-primary pl-2.5 shadow-[inset_1px_0_0_rgba(255,255,255,0.05)]"
                      : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground text-muted-foreground"
                  }`}
                  render={
                    <Link href={item.url}>
                      <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover/button:scale-105 ${isActive ? "text-primary filter drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" : "text-muted-foreground"}`} />
                      <span className="text-sm tracking-wide font-medium">{item.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
        <form action={logOut}>
          <SidebarMenuButton 
            type="submit" 
            className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer rounded-xl py-6 px-3 active-tactile transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 transition-transform duration-200 group-hover/button:-translate-x-0.5" />
            <span className="text-sm font-semibold tracking-wide">Đăng xuất</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}