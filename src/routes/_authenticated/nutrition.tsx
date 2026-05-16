import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, ScanBarcode, X, Check } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/nutrition")({
  component: Nutrition,
  head: () => ({ meta: [{ title: "NutriMiku — Nutrition" }] }),
});

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type MealLog = {
  id: string;
  meal_type: MealType;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  log_date: string;
  created_at: string;
};

type FoodItem = {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string | null;
};

type WeekDay = { day: string; kcal: number };

const MEAL_TYPES: { id: MealType; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Snack" },
  { id: "dinner", label: "Dinner" },
];

function Nutrition() {
  const { user } = useSession();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [weekData, setWeekData] = useState<WeekDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [addingTo, setAddingTo] = useState<MealType | null>(null);
  const [grams, setGrams] = useState("100");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const calorieTarget = 2100;
  const proteinTarget = 160;
  const carbsTarget = 220;
  const fatsTarget = 70;

  useEffect(() => {
    if (user) {
      fetchTodayMeals();
      fetchWeekData();
    }
  }, [user]);

  const fetchTodayMeals = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user!.id)
      .eq("log_date", today)
      .order("created_at", { ascending: true });
    setMeals(data || []);
    setLoading(false);
  };

  const fetchWeekData = async () => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    const { data } = await supabase
      .from("meal_logs")
      .select("log_date, kcal")
      .eq("user_id", user!.id)
      .in("log_date", days);

    const grouped = days.map((date) => ({
      day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      kcal: (data || [])
        .filter((m) => m.log_date === date)
        .reduce((sum, m) => sum + (m.kcal || 0), 0),
    }));
    setWeekData(grouped);
  };

  const searchFoods = async (query: string) => {
    setSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from("foods")
      .select("*")
      .ilike("name", `%${query}%`)
      .limit(6);
    setSearchResults((data as FoodItem[]) || []);
  };

  const logMeal = async () => {
    if (!selectedFood || !addingTo || !user) return;
    const g = parseFloat(grams) / 100;
    await supabase.from("meal_logs").insert({
      user_id: user.id,
      log_date: new Date().toISOString().split("T")[0],
      meal_type: addingTo,
      name: selectedFood.name,
      kcal: Math.round(selectedFood.kcal * g),
      protein: Math.round(selectedFood.protein * g),
      carbs: Math.round(selectedFood.carbs * g),
      fats: Math.round(selectedFood.fats * g),
    });
    setSelectedFood(null);
    setAddingTo(null);
    setSearch("");
    setSearchResults([]);
    setGrams("100");
    fetchTodayMeals();
    fetchWeekData();
  };

  const deleteMeal = async (id: string) => {
    await supabase.from("meal_logs").delete().eq("id", id);
    fetchTodayMeals();
    fetchWeekData();
  };

  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.kcal || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fats: acc.fats + (m.fats || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const grouped = MEAL_TYPES.map(({ id, label }) => ({
    id,
    label,
    items: meals.filter((m) => m.meal_type === id),
  }));

  return (
    <AppShell>
      <PageHeader title="Nutrition" subtitle="Fuel the grind, master." />

      <div className="glass rounded-2xl p-2 flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <input
          placeholder="Search foods…"
          value={search}
          onChange={(e) => searchFoods(e.target.value)}
          className="bg-transparent flex-1 text-sm py-2 outline-none placeholder:text-muted-foreground"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          className="w-9 h-9 rounded-xl grid place-items-center bg-primary/20 text-primary"
        >
          <ScanBarcode className="w-4 h-4" />
        </motion.button>
      </div>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl p-2 mb-3 space-y-1"
          >
            {!addingTo && (
              <div className="text-xs text-muted-foreground px-2 pb-1">
                Add to which meal?
              </div>
            )}
            {!addingTo ? (
              <div className="flex gap-2 px-2 pb-2 flex-wrap">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setAddingTo(t.id)}
                    className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                {searchResults.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition ${
                      selectedFood?.id === food.id ? "bg-primary/20" : "hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{food.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {food.kcal} kcal · {food.protein}P · {food.carbs}C · {food.fats}F per 100g
                      </div>
                    </div>
                    {selectedFood?.id === food.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </div>
                ))}
                {selectedFood && (
                  <div className="flex items-center gap-2 px-3 pt-2">
                    <input
                      type="number"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="w-20 bg-muted/30 rounded-xl px-3 py-1.5 text-sm outline-none"
                      placeholder="grams"
                    />
                    <span className="text-xs text-muted-foreground">grams</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={logMeal}
                      className="ml-auto px-4 py-1.5 rounded-xl text-xs font-bold text-[var(--primary-foreground)]"
                      style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}
                    >
                      Log meal
                    </motion.button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 gap-2 mb-5">
        <Stat label="kcal" v={totals.kcal} t={calorieTarget} c="var(--color-cyan)" />
        <Stat label="P" v={totals.protein} t={proteinTarget} c="var(--color-mint)" />
        <Stat label="C" v={totals.carbs} t={carbsTarget} c="var(--color-cyan)" />
        <Stat label="F" v={totals.fats} t={fatsTarget} c="var(--color-pink)" />
      </div>

      <div className="space-y-3 mb-6">
        {grouped.map(({ id, label, items }) => (
          <div key={id} className="glass rounded-3xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">{label}</h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setAddingTo(id); searchFoods("a"); }}
                className="w-7 h-7 rounded-full grid place-items-center bg-primary/20 text-primary"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
            {loading ? (
              <div className="text-xs text-muted-foreground py-2">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">
                No items yet — Miku is hungry 👀
              </div>
            ) : (
              <ul className="space-y-2">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {it.protein}P · {it.carbs}C · {it.fats}F
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-primary">{it.kcal}</div>
                      <button onClick={() => deleteMeal(it.id)}>
                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-4">
        <h3 className="font-bold text-sm mb-3">This Week · Calories</h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
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
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          className="h-full"
          style={{ background: c }}
        />
      </div>
    </div>
  );
}
