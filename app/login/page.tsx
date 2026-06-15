"use client"

import { useActionState } from "react"
import { authenticate } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 aurora-bg relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />

      <Card className="w-full max-w-md border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center pb-6 border-b border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/36.png" alt="FC A2Brotherhood" width={80} height={80} className="mx-auto mb-2 rounded-xl drop-shadow-lg" />
          <CardTitle className="text-3xl font-bold font-heading tracking-tight text-white">
            FC A2Brotherhood
          </CardTitle>
          <CardDescription className="text-white/60 text-sm">
            Nhập tài khoản quản trị để truy cập bảng điều khiển
          </CardDescription>
        </CardHeader>
        
        <form action={dispatch}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80 font-medium text-sm">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Tài khoản admin"
                className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:ring-emerald-500/20 h-10 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80 font-medium text-sm">Mật khẩu</Label>
              <Input 
                id="password" 
                name="password" 
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:ring-emerald-500/20 h-10 transition-all"
                required 
              />
            </div>
            {errorMessage && (
              <div className="flex items-center gap-2 text-sm font-medium text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20" aria-live="polite" aria-atomic="true">
                <Lock className="w-4 h-4" />
                {errorMessage}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pb-6 pt-2">
            <Button className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-lg hover-lift shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer text-sm tracking-wide" type="submit" disabled={isPending}>
              {isPending ? "Đang xác thực..." : "Đăng nhập hệ thống"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
