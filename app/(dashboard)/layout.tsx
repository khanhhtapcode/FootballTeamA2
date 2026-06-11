import { AppSidebar } from "@/app/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChevronRight } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-hidden flex flex-col min-h-screen bg-background">
        {/* Sticky Glass Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 border-b px-6 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="cursor-pointer hover:bg-muted p-1.5 rounded-lg" />
            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span>Hệ thống</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground">Bảng quản trị</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
