"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, ArrowRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail("");
    setMessage("");
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <span className="text-sm font-serif text-stone-600">hi theo</span>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-32 sm:w-40 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white transition-all hover:bg-stone-800 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isSubmitted ? (
                  <span className="text-xs">✓</span>
                ) : isSubmitting ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Send className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
              </button>
            </form>
          </motion.div>

          <motion.a
            href="https://github.com/drewsephski"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <img src="/github-icon.png" alt="GitHub" width={16} height={16} className="h-4 w-4" />
            <span>drewsephski</span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
