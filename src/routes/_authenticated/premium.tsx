import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Check, Sparkles, Mic, BarChart3,
  ScanBarcode, Palette, Crown, FlaskConical,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MikuCharacter } from "@/components/MikuCharacter";
import { usePremium } from "@/hooks/use-premium";
import { useSession } from "@/hooks/use-session";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/premium")({
  component: Premium,
  head: () => ({ meta: [{ title: "NutriMiku — Premium" }] }),
});

const features = [
  {
    icon: Mic,
    title: "Live voice chat with Miku",
    desc: "Speak naturally, hear her reply in her own anime voice.",
  },
  {
    icon: BarChart3,
    title: "Advanced analytics",
    desc: "Body composition trends, weekly Miku-narrated reports.",
  },
  {
    icon: ScanBarcode,
    title: "Full barcode scanner",
    desc: "Scan any product, instant macros.",
  },
  {
    icon: Sparkles,
    title: "Unlimited meal plans",
    desc: "Goal-tuned plans regenerated anytime.",
  },
  {
    icon: Palette,
    title: "Exclusive Miku outfits",
    desc: "Customize her look — seasonal drops included.",
  },
];

function Premium() {
  const [plan, setPlan] = useState<"month" | "year">("year");
  const { isPremium, loading, togglePremium } = usePremium();
  const { user } = useSession();
  const isAdmin = user?.email === "salmanaziz@nutrimiku.com";

  return (
    <AppShell>
      <PageHeader title="Go Premium" subtitle="Unlock Miku's full potential ✨" />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-5 mb-5 text-center relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, oklch(0.6 0.2 195 / 0.4), transparent 70%)",
          }}
        />
        <div className="flex justify-center">
          <MikuCharacter size={150} mood={isPremium ? "cheer" : "happy"} />
        </div>
        <h2 className="text-2xl font-bold gradient-text mt-2">
          {isPremium ? "You're Premium, master! 💎" : "Unlock Miku's Full Potential"}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          {isPremium
            ? "All features unlocked. Miku is so happy! 💚"
            : "Voice, advanced analytics, and the deepest bond. Cancel anytime."}
        </p>
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold ${
          isPremium
            ? "bg-amber-500/20 text-amber-300"
            : "bg-muted/30 text-muted-foreground"
        }`}>
          <Crown className="w-3.5 h-3.5" />
          {loading ? "..." : isPremium ? "Premium Active" : "Free Plan"}
        </div>
      </motion.div>

      {/* Dev Test Mode — admin only */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-4 mb-4 border border-amber-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-300" />
              <div>
                <div className="text-sm font-bold text-amber-300">Test Mode</div>
                <div className="text-[10px] text-muted-foreground">
                  Toggle premium to test all features
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={togglePremium}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPremium ? "bg-amber-400" : "bg-muted/50"
              }`}
            >
              <motion.div
                animate={{ x: isPremium ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
              />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Plan toggle */}
      {!isPremium && (
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
      )}

      {/* Feature list */}
      <div className="glass rounded-3xl p-5 mb-4 space-y-3">
        {features.map((f) => (
          <div key={f.title} className="flex gap-3 items-start">
            <div
              className="w-9 h-9 rounded-xl grid place-items-center shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))",
              }}
            >
              <f.icon className="w-4 h-4 text-[var(--primary-foreground)]" />
            </div>
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                {f.title}
                {isPremium && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                {!isPremium && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    PRO
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {!isPremium && (
        <>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl font-bold text-[var(--primary-foreground)] glow-ring text-base flex items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(135deg, var(--color-cyan), var(--color-mint), var(--color-pink))",
            }}
          >
            <Crown className="w-5 h-5" />
            Start 7-day free trial
          </motion.button>
          <p className="text-center text-[10px] text-muted-foreground mt-3">
            No charge today. Cancel anytime in settings.
          </p>
        </>
      )}
    </AppShell>
  );
}

function PlanCard({
  active, onClick, name, price, per, badge,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  price: string;
  per: string;
  badge?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative rounded-3xl p-4 text-left transition-all ${
        active ? "glow-ring bg-primary/15" : "glass"
      }`}
    >
      {badge && (
        <span
          className="absolute -top-2 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-[var(--primary-foreground)]"
          style={{ background: "var(--color-pink)" }}
        >
          {badge}
        </span>
      )}
      <div className="text-xs text-muted-foreground">{name}</div>
      <div className="text-xl font-bold mt-1">
        {price}
        <span className="text-xs text-muted-foreground font-normal">{per}</span>
      </div>
    </motion.button>
  );
}