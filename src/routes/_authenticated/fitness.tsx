import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Dumbbell, Check, Plus, TrendingDown } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { workouts, exercises, weightTrend, badges } from "@/lib/mockData";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/fitness")({
  component: Fitness,
  head: () => ({ meta: [{ title: "NutriMiku — Fitness" }] }),
});

function Fitness() {
  return (
    <AppShell>
      <PageHeader title="Training" subtitle="Iron sharpens iron." />

      {/* Today's workout */}
      <div className="glass rounded-3xl p-5 mb-4 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 opacity-20">
          <Dumbbell className="w-32 h-32 text-primary" />
        </div>
        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">Today</div>
        <h2 className="text-2xl font-bold mt-1">Push Day</h2>
        <p className="text-xs text-muted-foreground mt-1">6 exercises · ~52 min</p>
        <ul className="mt-4 space-y-2">
          {exercises.map((e, i) => (
            <motion.li
              key={e.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0"
            >
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-[11px] text-muted-foreground">{e.muscle}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-primary">{e.sets}</span>
                <motion.button whileTap={{ scale: 0.85 }} className="w-7 h-7 rounded-full border border-border grid place-items-center hover:bg-primary/20">
                  <Check className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.li>
          ))}
        </ul>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full py-3 rounded-2xl font-bold text-[var(--primary-foreground)] glow-ring"
          style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}
        >
          Start Workout
        </motion.button>
      </div>

      {/* Weight trend */}
      <div className="glass rounded-3xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">Weight Trend</h3>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> -3.0 kg
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="kg"
                stroke="var(--color-cyan)"
                strokeWidth={3}
                dot={{ fill: "var(--color-cyan)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent workouts */}
      <div className="glass rounded-3xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Recent</h3>
          <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-full grid place-items-center bg-primary/20 text-primary">
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
        <ul className="space-y-2">
          {workouts.map((w) => (
            <li key={w.id} className="flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {w.exercises} ex · {w.duration} min · {w.date}
                </div>
              </div>
              {w.done ? (
                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">Done</span>
              ) : (
                <span className="text-[10px] px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">Today</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Badges */}
      <div className="glass rounded-3xl p-4">
        <h3 className="font-bold text-sm mb-3">Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <motion.div
              key={b.name}
              whileHover={{ y: -3 }}
              className={`rounded-2xl p-3 text-center ${b.earned ? "bg-primary/15" : "bg-muted/20 opacity-50"}`}
            >
              <div className="text-3xl">{b.emoji}</div>
              <div className="text-[10px] mt-1 font-semibold">{b.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
