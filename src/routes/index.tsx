import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, Droplet, Footprints, Plus, Sparkles, ChevronRight } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MikuCharacter } from "@/components/MikuCharacter";
import { RingChart } from "@/components/RingChart";
import { user, todayMacros, quote } from "@/lib/mockData";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: "NutriMiku — Today" }],
  }),
});

function Home() {
  const xpPct = (user.xp / user.xpMax) * 100;
  const m = todayMacros;

  return (
    <AppShell>
      <PageHeader
        title={`Hi, ${user.name} ✨`}
        subtitle="Let's make today legendary."
        right={
          <div className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold">
            <Flame className="w-4 h-4 text-orange-400" />
            {user.streak}d
          </div>
        }
      />

      {/* Miku quote card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-4 flex gap-3 items-center mb-5 relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-2 opacity-30">
          <Sparkles className="w-24 h-24 text-primary" />
        </div>
        <MikuCharacter size={84} mood="happy" />
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">Miku says</div>
          <p className="text-sm leading-snug mt-1">{quote}</p>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Bond Lv. {user.level}</span>
              <span>{user.xp}/{user.xpMax} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-mint))" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Macro rings */}
      <div className="glass rounded-3xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted-foreground">Today's Energy</div>
            <div className="text-2xl font-bold">{m.calories.current}<span className="text-sm text-muted-foreground"> / {m.calories.target} kcal</span></div>
          </div>
          <Link to="/nutrition" className="text-xs text-primary flex items-center gap-1 font-semibold">
            Log <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center gap-1">
            <RingChart value={m.calories.current} max={m.calories.target} size={104} stroke={9} color="var(--color-cyan)" />
            <span className="text-[10px] text-muted-foreground">Calories</span>
          </div>
          <div className="flex flex-col gap-3 items-stretch flex-1 ml-4">
            <MacroBar label="Protein" current={m.protein.current} target={m.protein.target} color="var(--color-mint)" />
            <MacroBar label="Carbs" current={m.carbs.current} target={m.carbs.target} color="var(--color-cyan)" />
            <MacroBar label="Fats" current={m.fats.current} target={m.fats.target} color="var(--color-pink)" />
          </div>
        </div>
      </div>

      {/* Water + Steps */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <WaterCard current={m.water.current} target={m.water.target} />
        <StepsCard current={m.steps.current} target={m.steps.target} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <QuickAction to="/nutrition" label="Log meal" icon={<Plus className="w-5 h-5" />} />
        <QuickAction to="/fitness" label="Workout" icon={<Sparkles className="w-5 h-5" />} />
        <QuickAction to="/miku" label="Ask Miku" icon={<MikuMini />} />
      </div>
    </AppShell>
  );
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{current}<span className="text-muted-foreground">/{target}g</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
    </div>
  );
}

function WaterCard({ current, target }: { current: number; target: number }) {
  const pct = (current / target) * 100;
  return (
    <motion.div whileTap={{ scale: 0.97 }} className="glass rounded-3xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: `${100 - pct}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 h-full"
          style={{
            background: "linear-gradient(180deg, transparent, oklch(0.6 0.18 200 / 0.35) 30%, oklch(0.5 0.18 210 / 0.5))",
          }}
        />
      </div>
      <div className="relative">
        <Droplet className="w-5 h-5 text-cyan-300" />
        <div className="text-2xl font-bold mt-2">{current}<span className="text-xs text-muted-foreground">/{target}</span></div>
        <div className="text-[10px] text-muted-foreground">glasses water</div>
      </div>
    </motion.div>
  );
}

function StepsCard({ current, target }: { current: number; target: number }) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <motion.div whileTap={{ scale: 0.97 }} className="glass rounded-3xl p-4">
      <Footprints className="w-5 h-5 text-emerald-300" />
      <div className="text-2xl font-bold mt-2">{current.toLocaleString()}</div>
      <div className="text-[10px] text-muted-foreground mb-2">steps · goal {target.toLocaleString()}</div>
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1 }}
          className="h-full rounded-full"
          style={{ background: "var(--color-mint)", boxShadow: "0 0 8px var(--color-mint)" }}
        />
      </div>
    </motion.div>
  );
}

function QuickAction({ to, label, icon }: { to: "/nutrition" | "/fitness" | "/miku"; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to}>
      <motion.div whileTap={{ scale: 0.94 }} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5">
        <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}>
          <span className="text-[var(--primary-foreground)]">{icon}</span>
        </div>
        <span className="text-[11px] font-semibold">{label}</span>
      </motion.div>
    </Link>
  );
}

function MikuMini() {
  return <span className="text-base">💚</span>;
}
