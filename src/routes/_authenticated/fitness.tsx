
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Dumbbell, Check, Plus, TrendingDown, Trash2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useState, useEffect } from "react";
import { badges } from "@/lib/mockData";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/fitness")({
  component: Fitness,
  head: () => ({ meta: [{ title: "NutriMiku — Fitness" }] }),
});

type WorkoutLog = {
  id: string;
  workout_name: string;
  exercises: number;
  duration: number;
  completed: boolean;
  date: string;
  logged_at: string;
};

type WeightEntry = {
  week: string;
  kg: number;
};

const todayPlan = {
  name: "Push Day",
  exercises: [
    { name: "Bench Press", muscle: "Chest", sets: "4 × 8" },
    { name: "Overhead Press", muscle: "Shoulders", sets: "4 × 10" },
    { name: "Incline DB Press", muscle: "Chest", sets: "3 × 12" },
    { name: "Lateral Raises", muscle: "Shoulders", sets: "4 × 15" },
    { name: "Tricep Pushdown", muscle: "Triceps", sets: "3 × 12" },
    { name: "Dips", muscle: "Chest/Tri", sets: "3 × AMRAP" },
  ],
};

function Fitness() {
  const { user } = useSession();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [checkedExercises, setCheckedExercises] = useState<Set<number>>(new Set());
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weightTrend] = useState<WeightEntry[]>([
    { week: "W1", kg: 78.4 },
    { week: "W2", kg: 78.0 },
    { week: "W3", kg: 77.6 },
    { week: "W4", kg: 77.1 },
    { week: "W5", kg: 76.8 },
    { week: "W6", kg: 76.3 },
    { week: "W7", kg: 75.9 },
    { week: "W8", kg: 75.4 },
  ]);

  useEffect(() => {
    if (user) fetchWorkouts();
  }, [user]);

  const fetchWorkouts = async () => {
    const { data } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("logged_at", { ascending: false })
      .limit(10);
    setWorkouts(data || []);
    setLoading(false);
  };

  const toggleExercise = (index: number) => {
    setCheckedExercises((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const startWorkout = () => setWorkoutStarted(true);

  const finishWorkout = async () => {
    if (!user) return;
    await supabase.from("workout_logs").insert({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      workout_name: todayPlan.name,
      exercises: checkedExercises.size,
      duration: 52,
      completed: checkedExercises.size === todayPlan.exercises.length,
    });
    setWorkoutStarted(false);
    setCheckedExercises(new Set());
    fetchWorkouts();
  };

  const deleteWorkout = async (id: string) => {
    await supabase.from("workout_logs").delete().eq("id", id);
    fetchWorkouts();
  };

  return (
    <AppShell>
      <PageHeader title="Training" subtitle="Iron sharpens iron." />

      {/* Today's workout */}
      <div className="glass rounded-3xl p-5 mb-4 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 opacity-20">
          <Dumbbell className="w-32 h-32 text-primary" />
        </div>
        <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
          Today
        </div>
        <h2 className="text-2xl font-bold mt-1">{todayPlan.name}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {todayPlan.exercises.length} exercises · ~52 min
        </p>

        <ul className="mt-4 space-y-2">
          {todayPlan.exercises.map((e, i) => (
            <motion.li
              key={e.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0"
            >
              <div>
                <div className={`font-medium ${checkedExercises.has(i) ? "line-through text-muted-foreground" : ""}`}>
                  {e.name}
                </div>
                <div className="text-[11px] text-muted-foreground">{e.muscle}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-primary">{e.sets}</span>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleExercise(i)}
                  className={`w-7 h-7 rounded-full border grid place-items-center transition ${
                    checkedExercises.has(i)
                      ? "bg-primary border-primary"
                      : "border-border hover:bg-primary/20"
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${checkedExercises.has(i) ? "text-primary-foreground" : ""}`} />
                </motion.button>
              </div>
            </motion.li>
          ))}
        </ul>

        {/* Progress bar */}
        {workoutStarted && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{checkedExercises.size}/{todayPlan.exercises.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
              <motion.div
                animate={{ width: `${(checkedExercises.size / todayPlan.exercises.length) * 100}%` }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--color-cyan), var(--color-mint))" }}
              />
            </div>
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={workoutStarted ? finishWorkout : startWorkout}
          className="mt-4 w-full py-3 rounded-2xl font-bold text-[var(--primary-foreground)] glow-ring"
          style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}
        >
          {workoutStarted
            ? checkedExercises.size === todayPlan.exercises.length
              ? "Complete Workout 🎉"
              : `Finish Early (${checkedExercises.size}/${todayPlan.exercises.length})`
            : "Start Workout"}
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
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                stroke="var(--color-muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
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
          <Plus className="w-4 h-4 text-muted-foreground" />
        </div>
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading...</div>
        ) : workouts.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            No workouts yet — let's get moving, master! 💪
          </div>
        ) : (
          <ul className="space-y-2">
            {workouts.map((w) => (
              <li key={w.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{w.workout_name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {w.exercises} ex · {w.duration} min · {w.date}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {w.completed ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                      Done
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-primary/20 text-primary font-semibold">
                      Partial
                    </span>
                  )}
                  <button onClick={() => deleteWorkout(w.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Badges */}
      <div className="glass rounded-3xl p-4">
        <h3 className="font-bold text-sm mb-3">Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <motion.div
              key={b.name}
              whileHover={{ y: -3 }}
              className={`rounded-2xl p-3 text-center ${
                b.earned ? "bg-primary/15" : "bg-muted/20 opacity-50"
              }`}
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
