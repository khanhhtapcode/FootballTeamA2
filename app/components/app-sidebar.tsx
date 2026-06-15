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
  { title: "Chi phí", url: "/expenses", icon: Receipt },
  { title: "Lịch thi đấu", url: "/schedule", icon: Calendar },
  { title: "Thu tiền áo", url: "/jerseys", icon: Shirt },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar/70 backdrop-blur-xl">
      <SidebarHeader className="p-5 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image src="/36.png" alt="FC A2Brotherhood" width={36} height={36} className="rounded-lg" />
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground font-heading leading-tight">FC A2Brotherhood</h2>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-primary">Football Club</span>
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
                  className={`w-full gap-3 py-5 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5 shadow-sm"
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-muted-foreground"
                  }`}
                  render={
                    <Link href={item.url}>
                      <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm tracking-wide">{item.title}</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <form action={logOut}>
          <SidebarMenuButton 
            type="submit" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer rounded-lg py-5 px-3"
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">Đăng xuất</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  )
}
