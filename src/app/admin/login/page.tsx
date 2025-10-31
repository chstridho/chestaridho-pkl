"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Anton, Manrope } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Suspense } from 'react';


const anton = Anton({ weight: "400", subsets: ["latin"] });
const manrope = Manrope({ subsets: ["latin"] });

// tuple ease untuk framer-motion
const ease = [0.2, 0.65, 0.2, 1] as const;

export default function AdminLoginPage() {
    const router = useRouter();
    const q = useSearchParams();
    // arahkan ke dashboard setelah login
    const next = q.get("next") || "/admin/dashboard";

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [show, setShow] = useState(false);
    const [remember, setRemember] = useState(true); // UI saja (Supabase persist session by default)

    // Supabase browser client
    const supabase = useMemo(() => createSupabaseBrowser(), []);

    // Spotlight mengikuti kursor (ringan & nonaktif di touch/reduced motion)
    const stageRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        const isTouch = window.matchMedia("(pointer: coarse)").matches;
        if (prefersReduced || isTouch) return;

        let raf = 0;
        const onMove = (e: MouseEvent) => {
            if (raf) cancelAnimationFrame(raf);
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            raf = requestAnimationFrame(() => {
                el.style.setProperty("--mx", `${x}px`);
                el.style.setProperty("--my", `${y}px`);
            });
        };
        el.addEventListener("mousemove", onMove);
        return () => {
            el.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            await fetch("/api/auth/callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ event, session }),
            });
        });
        return () => subscription.unsubscribe();
    }, [supabase]);

    // Submit pakai Supabase Auth
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr(null);
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("username") || "");
        const password = String(fd.get("password") || "");

        if (!email || !password) {
            setErr("Masukkan email & password");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            router.replace(next);
        } catch (e: any) {
            setErr(e?.message || "Login gagal");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            ref={stageRef}
            className="theme-surface min-h-dvh grid place-items-center relative overflow-hidden"
        >
            {/* Wrapper tunggal agar .theme-surface > * tidak menimpa anak-absolute */}
            <div className="relative w-full">
                {/* Background statis (blob + grid + spotlight) sebagai grandchild */}
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/12 blur-3xl animate-[blob_14s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-[blob_18s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 hero-grid opacity-[0.06]" />
                    <div className="absolute inset-0 [background:radial-gradient(520px_360px_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.10),transparent_60%)]" />
                </div>

                {/* Konten */}
                <div className="container-app py-12 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, ease }}
                        className="mx-auto w-full max-w-md text-center"
                    >
                        <h1
                            className={`${anton.className} text-4xl font-extrabold text-white`}
                        >
                            Sign In
                        </h1>
                        <p className={`${manrope.className} mt-2 text-white/85`}>
                            Masuk untuk mengelola portofolio anda.
                        </p>
                    </motion.div>

                    {/* Card */}
                    <motion.form
                        onSubmit={onSubmit}
                        initial={{ opacity: 0, scale: 0.98, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease, delay: 0.1 }}
                        className="mx-auto mt-8 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 sm:p-8 ring-1 ring-white/15 backdrop-blur-md"
                    >
                        <div className="grid gap-4">
                            {/* Username */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="block text-xs font-semibold uppercase text-white/80">
                                    Email
                                </label>
                                <div className="input-wrap mt-2 rounded-lg border border-white/20 bg-white/5">
                                    <input
                                        name="username"
                                        type="email"
                                        placeholder="admin@example.com"
                                        required
                                        className="input-el w-full bg-transparent px-3 py-2 text-white placeholder:text-white/50 outline-none"
                                        autoComplete="username"
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="block text-xs font-semibold uppercase text-white/80">
                                    Password
                                </label>
                                <div className="input-wrap mt-2 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2">
                                    <input
                                        name="password"
                                        type={show ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        className="input-el w-full bg-transparent text-white placeholder:text-white/50 outline-none"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShow((v) => !v)}
                                        className="text-xs text-white/80 hover:text-white transition"
                                        aria-label="Toggle password"
                                    >
                                        {show ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Controls */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs text-white/80">
                                    <input
                                        type="checkbox"
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        className="h-4 w-4 accent-white/80"
                                    />
                                    Remember me
                                </label>
                                <a
                                    href="/"
                                    className="text-xs text-white/80 hover:text-white transition"
                                >
                                    Kembali ke Home
                                </a>
                            </div>

                            {/* Error shake */}
                            <AnimatePresence>
                                {err && (
                                    <motion.div
                                        key="err"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1, x: [0, -10, 10, -8, 8, -4, 4, 0] }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.5, ease }}
                                        className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
                                    >
                                        {err}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                disabled={loading}
                                whileTap={{ scale: 0.98 }}
                                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white/90 ring-1 ring-white/20 hover:bg-white/20 transition"
                            >
                                {loading ? (
                                    <motion.span
                                        className="inline-block h-4 w-4 rounded-full border-2 border-white/70 border-r-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            repeat: Infinity,
                                            ease: "linear",
                                            duration: 0.8,
                                        }}
                                    />
                                ) : null}
                                {loading ? "Memproses…" : "Masuk"}
                            </motion.button>
                        </div>
                    </motion.form>

                    <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease, delay: 0.2 }}
                        className="mt-4 text-center text-xs text-white/70"
                    >
                    </motion.p>
                </div>
            </div>
        </div>
    );
}