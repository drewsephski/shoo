"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Profile } from "./profile";
import { useShooAuth } from "@/lib/shoo-convex";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const { identity, loading } = useShooAuth();

  const isAuthenticated = !loading && !!identity?.userId;
  const tabs = isAuthenticated
    ? ["admin", "dashboard", "pricing", "docs"]
    : ["features", "pricing", "docs"];

  return (
    <nav className="fixed left-3 right-3 top-4 z-50 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
      <div className="flex items-center justify-between gap-1 rounded-full border border-white/50 bg-white/80 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur-xl sm:justify-start sm:gap-2 sm:px-3 sm:py-2">
        <Link href="/" className="group flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-black/5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 503.44"
            fill="currentColor"
            className="size-4 text-blue-600 transition duration-200 group-hover:scale-90 hover:text-blue-500"
          >
            <path d="M499.33,335.68l-16.99-183.6c-6.92-74.84-66.99-133.68-141.95-139.06L164.61.4C75.67-5.98,0,64.45,0,153.61v196.22c0,84.83,68.77,153.61,153.61,153.61h192.78c90.42,0,161.28-77.72,152.95-167.76ZM312.47,30.89l158.32,158.32-14.14,14.14L298.33,45.04l14.14-14.14ZM183.9,475.98L26.48,318.56l43.59-43.59,157.41,157.41-43.59,43.59ZM289.33,471.74L29.32,211.73l37.96-37.96,260.01,260.01-37.96,37.96ZM365.24,437.98L63.07,135.81l31.73-31.73,302.18,302.18-31.73,31.73ZM420.08,383.15L117.9,80.97l25.31-25.31,302.18,302.18-25.31,25.31ZM453.83,307.23L193.75,47.15l19.68-19.68,260.08,260.08-19.68,19.68Z" />
          </svg>
          <span className="font-serif text-[14px] sm:text-[15px] text-stone-900">Shoo</span>
        </Link>
        <div className="hidden items-center sm:flex relative">
          {tabs.map((tab) => (
            <motion.div key={tab} onHoverStart={() => setHoveredTab(tab)} onHoverEnd={() => setHoveredTab(null)}>
              <Link
                href={tab === "features" ? "/#features" : `/${tab}`}
                className="relative rounded-full px-3 py-1.5 text-[13px] text-stone-600 transition-colors hover:text-stone-900 z-10 inline-block"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {hoveredTab === tab && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-black/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
              )}
            </Link>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center">
          <Profile />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 sm:hidden"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-4 w-4 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-2xl border border-white/50 bg-white/95 py-1.5 shadow-lg shadow-black/10 backdrop-blur-xl" aria-label="Mobile navigation">
          {isAuthenticated ? (
            <Link href="/admin" className="mx-1.5 block rounded-xl px-4 py-2.5 text-[14px] text-stone-600 transition-all hover:bg-black/5 hover:text-stone-900">admin</Link>
          ) : (
            <a href="#features" className="mx-1.5 block rounded-xl px-4 py-2.5 text-[14px] text-stone-600 transition-all hover:bg-black/5 hover:text-stone-900">Features</a>
          )}
          <Link href="/pricing" className="mx-1.5 block rounded-xl px-4 py-2.5 text-[14px] text-stone-600 transition-all hover:bg-black/5 hover:text-stone-900">Pricing</Link>
          <Link href="/docs" className="mx-1.5 block rounded-xl px-4 py-2.5 text-[14px] text-stone-600 transition-all hover:bg-black/5 hover:text-stone-900">Docs</Link>
          {isAuthenticated && (
            <Link href="/tenant-dashboard" className="mx-1.5 block rounded-xl px-4 py-2.5 text-[14px] text-stone-600 transition-all hover:bg-black/5 hover:text-stone-900">dashboard</Link>
          )}
        </nav>
      )}
    </nav>
  );
}
