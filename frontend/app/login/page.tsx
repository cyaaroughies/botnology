"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(1000px_700px_at_20%_10%,rgba(191,230,208,.12),transparent_55%),radial-gradient(900px_600px_at_80%_0%,rgba(214,182,107,.12),transparent_60%),linear-gradient(180deg,#07140e_0%,#0b1a12_45%,#07140e_100%)] text-[#f8f3e7]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] items-center px-4 py-8 lg:px-6">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,420px)]">
          <section className="rounded-[24px] border border-[rgba(214,182,107,.18)] bg-[linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03))] p-6 shadow-[0_20px_60px_rgba(0,0,0,.24)] lg:p-8">
            <div className="flex items-center gap-3">
              <img src="/dr-botonic.jpeg" alt="Dr. Botnotic" className="h-12 w-12 rounded-full border border-[rgba(214,182,107,.32)] object-cover" />
              <div>
                <div className="text-sm font-bold tracking-[0.04em]">Botnology101</div>
                <div className="text-xs text-[#b8c6c0]">Dr. Botnotic • Premium AI Tutor</div>
              </div>
            </div>

            <div className="mt-10 max-w-2xl">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#d6b667]">Secure access</div>
              <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">Sign in to your Botnology101 workspace.</h1>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-[#d7e3dd]">
                The login page now shares the same visual language as the rest of the site: quiet, academic, and gold-accented instead of a default app template.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/courses" className="rounded-full border border-[rgba(214,182,107,.18)] bg-white/5 px-4 py-3 text-sm font-bold text-[#f8f3e7] transition hover:bg-white/10">Browse Courses</Link>
                <Link href="/study-hall" className="rounded-full bg-[linear-gradient(135deg,#d6b667,#b99644)] px-4 py-3 text-sm font-bold text-[#08120d] transition hover:brightness-105">Visit Study Hall</Link>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[rgba(214,182,107,.18)] bg-[rgba(8,20,14,.92)] p-6 shadow-[0_20px_60px_rgba(0,0,0,.28)] lg:p-8">
            <div className="mb-6">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#d6b667]">Student sign in</div>
              <h2 className="mt-3 text-2xl font-semibold">Welcome back.</h2>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button className="w-full bg-[linear-gradient(135deg,#d6b667,#b99644)] text-[#08120d] hover:brightness-105" onClick={handleLogin}>
                Sign In
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-[rgba(214,182,107,.14)] bg-white/5 p-4 text-sm leading-6 text-[#d7e3dd]">
              Use your Botnology101 credentials to continue. If you are exploring the demo, you can move straight into the courses or study hall pages.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
