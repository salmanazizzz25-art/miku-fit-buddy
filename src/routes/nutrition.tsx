import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Search, Plus, ScanBarcode } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { meals, todayMacros, weekMacros } from "@/lib/mockData";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/nutrition")({
  component: Nutrition,
  head: () => ({ meta: [{ title: "NutriMiku — Nutrition" }] }),
});

function Nutrition() {
  const grouped = ["Breakfast", "Lunch", "Snack", "Dinner"].map((type) => ({
    type,
    items: meals.filter((m) => m.type === type),
  }));
  const m = todayMacros;

  return (
    <AppShell>
      <PageHeader title="Nutrition" subtitle="Fuel the grind, master." />

      {/* Search */}
      <div className="glass rounded-2xl p-2 flex items-center gap-2 mb-4">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <input
          placeholder="Search foods…"
          className="bg-transparent flex-1 text-sm py-2 outline-none placeholder:text-muted-foreground"
        />
        <motion.button whileTap={{ scale: 0.92 }} className="w-9 h-9 rounded-xl grid place-items-center bg-primary/20 text-primary">
          <ScanBarcode className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <Stat label="kcal" v={m.calories.current} t={m.calories.target} c="var(--color-cyan)" />
        <Stat label="P" v={m.protein.current} t={m.protein.target} c="var(--color-mint)" />
        <Stat label="C" v={m.carbs.current} t={m.carbs.target} c="var(--color-cyan)" />
        <Stat label="F" v={m.fats.current} t={m.fats.target} c="var(--color-pink)" />
      </div>

      {/* Meals */}
      <div className="space-y-3 mb-6">
        {grouped.map(({ type, items }) => (
          <div key={type} className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">{type}</h3>
              <motion.button whileTap={{ scale: 0.9 }} className="w-7 h-7 rounded-full grid place-items-center bg-primary/20 text-primary">
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            {items.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">No items yet — Miku is hungry 👀</div>
            ) : (
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {it.time} · {it.p}P · {it.c}C · {it.f}F
                      </div>
                    </div>
                    <div className="font-bold text-primary">{it.kcal}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="glass rounded-3xl p-4">
        <h3 className="font-bold text-sm mb-3">This Week · Calories</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekMacros}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="kcal" fill="var(--color-cyan)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, v, t, c }: { label: string; v: number; t: number; c: string }) {
  const pct = Math.min((v / t) * 100, 100);
  return (
    <div className="glass rounded-2xl p-2 text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{v}</div>
      <div className="h-1 mt-1 rounded-full bg-muted/40 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full" style={{ background: c }} />
      </div>
    </div>
  );
}
