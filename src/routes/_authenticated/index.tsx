import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Flame, Droplet, Footprints, Plus, Sparkles, ChevronRight, Settings } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MikuCharacter } from "@/components/MikuCharacter";
import { RingChart } from "@/components/RingChart";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
  head: () => ({ meta: [{ title: "NutriMiku — Today" }] }),
});

type Profile = {
  name: string;
  level: number;
  xp: number;
  xp_max: number;
  streak: number;
  goal: string;
};

type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
};

type DailyStats = {
  water_glasses: number;
  steps: number;
};

const TARGETS = {
  calories: 2100,
  protein: 160,
  carbs: 220,
  fats: 70,
  water: 8,
  steps: 10000,
};

function Home() {
  const { user } = useSession();
  const [profile, setProfile] = useState<Profile>({
    name: "Master",
    level: 1,
    xp: 0,
    xp_max: 1000,
    streak: 0,
    goal: "Maintain",
  });
  const [totals, setTotals] = useState<Totals>({ kcal: 0, protein: 0, carbs: 0, fats: 0 });
  const [dailyStats, setDailyStats] = useState<DailyStats>({ water_glasses: 0, steps: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTodayMeals();
      fetchDailyStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    if (data) setProfile(data);
  };

  const fetchTodayMeals = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("meal_logs")
      .select("kcal, protein, carbs, fats")
      .eq("user_id", user!.id)
      .eq("date", today);
    if (data) {
      setTotals(
        data.reduce(
          (acc, m) => ({
            kcal: acc.kcal + (m.kcal || 0),
            protein: acc.protein + (m.protein || 0),
            carbs: acc.carbs + (m.carbs || 0),
            fats: acc.fats + (m.fats || 0),
          }),
          { kcal: 0, protein: 0, carbs: 0, fats: 0 }
        )
      );
    }
    setLoading(false);
  };

  const fetchDailyStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", user!.id)
      .eq("date", today)
      .single();
    if (data) setDailyStats(data);
  };

  const updateWater = async (amount: number) => {
    const today = new Date().toISOString().split("T")[0];
    const newVal = Math.max(0, Math.min(dailyStats.water_glasses + amount, TARGETS.water));
    setDailyStats((p) => ({ ...p, water_glasses: newVal }));
    await supabase
      .from("daily_stats")
      .upsert({
        user_id: user!.id,
        date: today,
        water_glasses: newVal,
        steps: dailyStats.steps,
      });
  };

  const updateSteps = async (steps: number) => {
    const today = new Date().toISOString().split("T")[0];
    setDailyStats((p) => ({ ...p, steps }));
    await supabase
      .from("daily_stats")
      .upsert({
        user_id: user!.id,
        date: today,
        water_glasses: dailyStats.water_glasses,
        steps,
      });
  };

  const xpPct = (profile.xp / profile.xp_max) * 100;
  const mikuMoods = ["You showed up today — that's already a win, master! ✨",
    "Stay consistent and the results will follow 💚",
    "Every meal logged is a step closer to your goal! 🎯",
    "You're doing amazing, master! Keep it up 🌟"];
  const quote = mikuMoods[new Date().getDay() % mikuMoods.length];

  return (
    <AppShell>
      <PageHeader
        title={`Hi, ${profile.name} ✨`}
        subtitle="Let's make today legendary."
       right={
  <div className="flex items-center gap-2">
    <div className="glass rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold">
      <Flame className="w-4 h-4 text-orange-400" />
      {profile.streak}d
    </div>
    <Link to="/settings">
      <div className="glass rounded-full p-1.5">
        <Settings className="w-4 h-4 text-muted-foreground" />
      </div>
    </Link>
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
          <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
            Miku says
          </div>
          <p className="text-sm leading-snug mt-1">{quote}</p>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Bond Lv. {profile.level}</span>
              <span>{profile.xp}/{profile.xp_max} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, var(--color-cyan), var(--color-mint))",
                }}
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
            <div className="text-2xl font-bold">
              {loading ? "..." : totals.kcal}
              <span className="text-sm text-muted-foreground"> / {TARGETS.calories} kcal</span>
            </div>
          </div>
          <Link
            to="/nutrition"
            className="text-xs text-primary flex items-center gap-1 font-semibold"
          >
            Log <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center gap-1">
            <RingChart
              value={totals.kcal}
              max={TARGETS.calories}
              size={104}
              stroke={9}
              color="var(--color-cyan)"
            />
            <span className="text-[10px] text-muted-foreground">Calories</span>
          </div>
          <div className="flex flex-col gap-3 items-stretch flex-1 ml-4">
            <MacroBar
              label="Protein"
              current={totals.protein}
              target={TARGETS.protein}
              color="var(--color-mint)"
            />
            <MacroBar
              label="Carbs"
              current={totals.carbs}
              target={TARGETS.carbs}
              color="var(--color-cyan)"
            />
            <MacroBar
              label="Fats"
              current={totals.fats}
              target={TARGETS.fats}
              color="var(--color-pink)"
            />
          </div>
        </div>
      </div>

      {/* Water + Steps */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <WaterCard
          current={dailyStats.water_glasses}
          target={TARGETS.water}
          onAdd={() => updateWater(1)}
          onRemove={() => updateWater(-1)}
        />
        <StepsCard
          current={dailyStats.steps}
          target={TARGETS.steps}
          onUpdate={updateSteps}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <QuickAction to="/nutrition" label="Log meal" icon={<Plus className="w-5 h-5" />} />
        <QuickAction to="/fitness" label="Workout" icon={<Sparkles className="w-5 h-5" />} />
        <QuickAction to="/miku" label="Ask Miku" icon={<span className="text-base">💚</span>} />
      </div>
    </AppShell>
  );
}

function MacroBar({
  label, current, target, color,
}: {
  label: string; current: number; target: number; color: string;
}) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {current}
          <span className="text-muted-foreground">/{target}g</span>
        </span>
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

function WaterCard({
  current, target, onAdd, onRemove,
}: {
  current: number; target: number; onAdd: () => void; onRemove: () => void;
}) {
  const pct = (current / target) * 100;
  return (
    <motion.div className="glass rounded-3xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: `${100 - pct}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-x-0 bottom-0 h-full"
          style={{
            background:
              "linear-gradient(180deg, transparent, oklch(0.6 0.18 200 / 0.35) 30%, oklch(0.5 0.18 210 / 0.5))",
          }}
        />
      </div>
      <div className="relative">
        <Droplet className="w-5 h-5 text-cyan-300" />
        <div className="text-2xl font-bold mt-2">
          {current}
          <span className="text-xs text-muted-foreground">/{target}</span>
        </div>
        <div className="text-[10px] text-muted-foreground">glasses water</div>
        <div className="flex gap-2 mt-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            className="w-7 h-7 rounded-full bg-muted/40 grid place-items-center text-sm font-bold"
          >
            -
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="w-7 h-7 rounded-full bg-primary/20 grid place-items-center text-primary text-sm font-bold"
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function StepsCard({
  current, target, onUpdate,
}: {
  current: number; target: number; onUpdate: (steps: number) => void;
}) {
  const pct = Math.min((current / target) * 100, 100);
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(current.toString());

  return (
    <motion.div className="glass rounded-3xl p-4">
      <Footprints className="w-5 h-5 text-emerald-300" />
      {editing ? (
        <div className="mt-2">
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-muted/30 rounded-xl px-2 py-1 text-sm outline-none"
            autoFocus
          />
          <button
            onClick={() => { onUpdate(parseInt(val) || 0); setEditing(false); }}
            className="mt-1 text-xs text-primary font-semibold"
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <div
            className="text-2xl font-bold mt-2 cursor-pointer"
            onClick={() => { setVal(current.toString()); setEditing(true); }}
          >
            {current.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground mb-2">
            steps · tap to update
          </div>
        </>
      )}
      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1 }}
          className="h-full rounded-full"
          style={{
            background: "var(--color-mint)",
            boxShadow: "0 0 8px var(--color-mint)",
          }}
        />
      </div>
    </motion.div>
  );
}

function QuickAction({
  to, label, icon,
}: {
  to: "/nutrition" | "/fitness" | "/miku";
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link to={to}>
      <motion.div
        whileTap={{ scale: 0.94 }}
        className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5"
      >
        <div
          className="w-9 h-9 rounded-full grid place-items-center"
          style={{
            background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))",
          }}
        >
          <span className="text-[var(--primary-foreground)]">{icon}</span>
        </div>
        <span className="text-[11px] font-semibold">{label}</span>
      </motion.div>
    </Link>
  );
}
