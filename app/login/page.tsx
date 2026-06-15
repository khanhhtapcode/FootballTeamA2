"use client"

import { useActionState } from "react"
import { authenticate } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, ShieldAlert, Trophy } from "lucide-react"

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <div className="flex min-h-screen w-full bg-[#070A08] text-white">
      {/* Left Panel: Sports Editorial Photography & Team Motto (Hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 overflow-hidden border-r border-slate-900 bg-slate-950">
        {/* Dark Green/Black Editorial Soccer Stadium Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop"
          alt="FC A2Brotherhood Stadium"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35] contrast-[1.05]"
        />
        
        {/* Dark vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-primary/10" />

        {/* Tactical branding texts */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/36.png"
              alt="FC A2Brotherhood"
              className="w-12 h-12 rounded-xl border border-white/10"
            />
            <div>
              <span className="text-xs uppercase font-black tracking-widest text-primary">Football Club</span>
              <h2 className="text-sm font-extrabold tracking-tight text-white/90">A2Brotherhood</h2>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <span className="text-xs font-black uppercase tracking-widest text-accent font-mono">EST. 2026</span>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tighter leading-none font-heading text-white">
              KỶ LUẬT,<br />
              TINH THẦN,<br />
              CHIẾN THẮNG
            </h1>
            <p className="text-sm text-white/50 leading-relaxed font-medium">
              Trung tâm kỹ thuật số quản lý chỉ số, công nợ, lịch đấu và hoạt động nội bộ của câu lạc bộ bóng đá FC A2Brotherhood.
            </p>
          </div>

          <div className="text-xs text-white/30 font-semibold tracking-wider uppercase">
            © 2026 FC A2Brotherhood. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel: Clean Minimalist Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 xl:px-24 bg-[#090D0A]">
        <div className="w-full max-w-sm mx-auto space-y-8">
          
          {/* Header Mobile Logo (visible on mobile only) */}
          <div className="flex flex-col lg:hidden items-center text-center space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/36.png"
              alt="FC A2Brotherhood"
              className="w-16 h-16 rounded-2xl border border-white/10"
            />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight font-heading">FC A2Brotherhood</h1>
              <span className="text-[10px] uppercase font-black tracking-widest text-primary mt-1 block">Hệ thống quản lý nội bộ</span>
            </div>
          </div>

          <div className="space-y-2 hidden lg:block">
            <h2 className="text-3xl font-black tracking-tight text-white font-heading">ĐĂNG NHẬP</h2>
            <p className="text-sm text-white/40 font-medium">Nhập tài khoản quản trị để truy cập bảng điều khiển</p>
          </div>

          <form action={dispatch} className="space-y-5">
            {/* Username field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/60 text-xs font-bold uppercase tracking-wider block">
                Tên đăng nhập
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  className="pl-11 h-12 bg-white/5 border-slate-800 text-white placeholder-white/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-slate-900/40 rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-xs font-bold uppercase tracking-wider block">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-11 h-12 bg-white/5 border-slate-800 text-white placeholder-white/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-slate-900/40 rounded-xl transition-all"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-3 rounded-xl" aria-live="polite">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="font-semibold leading-normal">{errorMessage}</span>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-4 bg-primary hover:bg-primary/95 text-slate-950 font-extrabold rounded-xl shadow-md active-tactile cursor-pointer transition-all duration-200 uppercase tracking-wider text-xs"
            >
              {isPending ? "Đang xác thực..." : "Đăng nhập hệ thống"}
            </Button>
          </form>

          {/* Footer decoration (visible on mobile only) */}
          <div className="lg:hidden text-center text-[10px] text-white/20 uppercase tracking-widest font-semibold pt-4">
            © 2026 FC A2Brotherhood
          </div>
        </div>
      </div>
    </div>
  )
}
