import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Sparkles, Mic, BarChart3, ScanBarcode, Palette } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MikuCharacter } from "@/components/MikuCharacter";
import { useState } from "react";

export const Route = createFileRoute("/premium")({
  component: Premium,
  head: () => ({ meta: [{ title: "NutriMiku — Premium" }] }),
});

const features = [
  { icon: Mic, title: "Live voice chat with Miku", desc: "Speak naturally, hear her reply in her own anime voice." },
  { icon: BarChart3, title: "Advanced analytics", desc: "Body composition trends, weekly Miku-narrated reports." },
  { icon: ScanBarcode, title: "Full barcode scanner", desc: "Scan any product, instant macros." },
  { icon: Sparkles, title: "Unlimited meal plans", desc: "Goal-tuned plans regenerated anytime." },
  { icon: Palette, title: "Exclusive Miku outfits", desc: "Customize her look — seasonal drops included." },
];

function Premium() {
  const [plan, setPlan] = useState<"month" | "year">("year");

  return (
    <AppShell>
      <PageHeader title="Go Premium" subtitle="Unlock Miku's full potential ✨" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-5 mb-5 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
          background: "radial-gradient(circle at 50% 0%, oklch(0.6 0.2 195 / 0.4), transparent 70%)"
        }} />
        <div className="flex justify-center"><MikuCharacter size={150} mood="cheer" /></div>
        <h2 className="text-2xl font-bold gradient-text mt-2">Unlock Miku's Full Potential</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Voice, advanced analytics, and the deepest bond. Cancel anytime.
        </p>
      </motion.div>

      {/* Plan toggle */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <PlanCard
          active={plan === "month"}
          onClick={() => setPlan("month")}
          name="Monthly"
          price="$9.99"
          per="/month"
        />
        <PlanCard
          active={plan === "year"}
          onClick={() => setPlan("year")}
          name="Annual"
          price="$59.99"
          per="/year"
          badge="Save 50%"
        />
      </div>

      {/* Feature list */}
      <div className="glass rounded-3xl p-5 mb-4 space-y-3">
        {features.map((f) => (
          <div key={f.title} className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}>
              <f.icon className="w-4 h-4 text-[var(--primary-foreground)]" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                {f.title}
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-muted-foreground">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl font-bold text-[var(--primary-foreground)] glow-ring text-base"
        style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint), var(--color-pink))", backgroundSize: "200% auto" }}
      >
        Start 7-day free trial
      </motion.button>
      <p className="text-center text-[10px] text-muted-foreground mt-3">
        No charge today. Cancel anytime in settings.
      </p>
    </AppShell>
  );
}

function PlanCard({
  active, onClick, name, price, per, badge,
}: { active: boolean; onClick: () => void; name: string; price: string; per: string; badge?: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative rounded-3xl p-4 text-left transition-all ${
        active ? "glow-ring bg-primary/15" : "glass"
      }`}
    >
      {badge && (
        <span className="absolute -top-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-[var(--primary-foreground)]"
              style={{ background: "var(--color-pink)" }}>
          {badge}
        </span>
      )}
      <div className="text-xs text-muted-foreground">{name}</div>
      <div className="text-xl font-bold mt-1">{price}<span className="text-xs text-muted-foreground font-normal">{per}</span></div>
    </motion.button>
  );
}
