"use client"

import { useActionState } from "react"
import { authenticate } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User } from "lucide-react"

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0f0a]">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.05)_0%,transparent_50%)]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-emerald-500/5 blur-[120px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden">

          {/* Top accent line */}
          <div className="h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent" />

          {/* Header */}
          <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-white/5">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/36.png"
                alt="FC A2Brotherhood"
                width={72}
                height={72}
                className="relative rounded-2xl shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">FC A2Brotherhood</h1>
            <p className="mt-1 text-sm text-white/40">Hệ thống quản lý nội bộ</p>
          </div>

          {/* Form */}
          <form action={dispatch} className="px-8 py-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Tên đăng nhập
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  autoComplete="username"
                  className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder-white/20 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-9 h-11 bg-white/5 border-white/10 text-white placeholder-white/20 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 rounded-xl"
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2.5 rounded-xl" aria-live="polite">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20 transition-all duration-200"
            >
              {isPending ? "Đang xác thực..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Bottom accent line */}
          <div className="h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </div>
    </div>
  )
}
