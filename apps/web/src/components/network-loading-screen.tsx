import { motion } from "motion/react";

import { cn } from "@/lib/cn";

export function NetworkLoadingScreen() {
  return (
    <main className="bg-background text-foreground relative grid min-h-dvh place-items-center overflow-x-hidden px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:px-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,var(--color-accent)_0%,transparent_54%)] opacity-15"
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center text-center"
      >
        <motion.div
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="border-border bg-surface shadow-panel grid size-[4.5rem] grid-cols-4 gap-1 rounded-2xl border p-2.5 sm:size-20 sm:p-3"
        >
          {Array.from({ length: 16 }, (_, index) => (
            <span
              key={index}
              className={cn("rounded-xs", {
                "bg-accent-soft": index === 5 || index === 6 || index === 9,
                "bg-border": index !== 5 && index !== 6 && index !== 9,
              })}
            />
          ))}
        </motion.div>
        <p className="text-foreground mt-5 text-lg font-semibold sm:mt-6 sm:text-xl">
          waking up the tiny brain…
        </p>
        <p className="text-muted mt-2 font-mono text-[0.56rem] tracking-[0.1em] sm:text-[0.62rem] sm:tracking-[0.14em]">
          loading trained weights · 784 inputs
        </p>
      </motion.div>
    </main>
  );
}
