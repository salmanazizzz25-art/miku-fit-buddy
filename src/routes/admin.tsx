import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users, Crown, Activity, Send,
  Shield, LogOut, BarChart3,
  Utensils, Dumbbell, Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "NutriMiku — Admin" }] }),
});

const ADMIN_EMAIL = "salmanaziz@nutrimiku.com";

type UserRow = {
  id: string;
  name: string;
  goal: string;
  premium: boolean;
  streak: number;
  created_at: string;
};

type Tab = "overview" | "users" | "food" | "workouts" | "broadcast";

function AdminDashboard() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [foods, setFoods] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [signupTrend, setSignupTrend] = useState<any[]>([]);
  const [newFood, setNewFood] = useState({
    name: "", kcal_per_100g: "", protein_per_100g: "",
    carbs_per_100g: "", fats_per_100g: "", category: "",
  });

  const login = async () => {
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password,
    });
    if (error) { setError(error.message); return; }
    if (data.user?.email !== ADMIN_EMAIL) {
      await supabase.auth.signOut();
      setError("Access denied. Admin only.");
      return;
    }
    setAuthed(true);
    fetchAll();
  };

  const fetchAll = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(profiles || []);
    setTotalUsers(profiles?.length || 0);
    setPremiumUsers(profiles?.filter((p) => p.premium).length || 0);

    const { data: foodData } = await supabase
      .from("food_database")
      .select("*")
      .order("created_at", { ascending: false });
    setFoods(foodData || []);

    const { data: planData } = await supabase
      .from("workout_plans")
      .select("*");
    setWorkoutPlans(planData || []);

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    const trend = last7.map((date) => ({
      day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      signups: (profiles || []).filter((p) =>
        p.created_at?.startsWith(date)
      ).length,
    }));
    setSignupTrend(trend);
  };

  const togglePremium = async (id: string, current: boolean) => {
    await supabase.from("profiles").update({ premium: !current }).eq("id", id);
    fetchAll();
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setSending(true);
    await supabase.from("broadcasts").insert({ message: broadcastMsg });
    setBroadcastMsg("");
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 2000);
  };

  const addFood = async () => {
    await supabase.from("food_database").insert({
      name: newFood.name,
      kcal_per_100g: parseFloat(newFood.kcal_per_100g),
      protein_per_100g: parseFloat(newFood.protein_per_100g),
      carbs_per_100g: parseFloat(newFood.carbs_per_100g),
      fats_per_100g: parseFloat(newFood.fats_per_100g),
      category: newFood.category,
    });
    setNewFood({
      name: "", kcal_per_100g: "", protein_per_100g: "",
      carbs_per_100g: "", fats_per_100g: "", category: "",
    });
    fetchAll();
  };

  const deleteFood = async (id: string) => {
    await supabase.from("food_database").delete().eq("id", id);
    fetchAll();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthed(false);
    navigate({ to: "/" });
  };

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "var(--color-background)" }}>
        <div className="glass rounded-3xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold gradient-text">Admin Access</h1>
          </div>
          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-2 mb-4">
              {error}
            </div>
          )}
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted/30 rounded-xl px-4 py-3 text-sm outline-none mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full bg-muted/30 rounded-xl px-4 py-3 text-sm outline-none mb-4"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={login}
            className="w-full py-3 rounded-xl font-bold text-[var(--primary-foreground)] glow-ring"
            style={{
              background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))",
            }}
          >
            Enter Dashboard
          </motion.button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "food", label: "Food DB", icon: Utensils },
    { id: "workouts", label: "Workouts", icon: Dumbbell },
    { id: "broadcast", label: "Broadcast", icon: Bell },
  ];

  return (
    <div className="min-h-screen px-4 pt-6 pb-12 max-w-2xl mx-auto"
      style={{ background: "var(--color-background)" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">NutriMiku Control Panel</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="glass rounded-full p-2 text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Users} label="Total Users" value={totalUsers} color="var(--color-cyan)" />
            <StatCard icon={Crown} label="Premium" value={premiumUsers} color="var(--color-pink)" />
            <StatCard icon={Activity} label="Conversion" value={`${totalUsers ? Math.round((premiumUsers / totalUsers) * 100) : 0}%`} color="var(--color-mint)" />
          </div>
          <div className="glass rounded-3xl p-4">
            <h3 className="font-bold text-sm mb-3">Signups This Week</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signupTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12, fontSize: 12,
                  }} />
                  <Line type="monotone" dataKey="signups" stroke="var(--color-cyan)" strokeWidth={3} dot={{ fill: "var(--color-cyan)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === "users" && (
        <div className="glass rounded-3xl p-4 space-y-3">
          <h3 className="font-bold text-sm">All Users ({totalUsers})</h3>
          {users.length === 0 ? (
            <div className="text-xs text-muted-foreground">No users yet.</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <div className="font-medium text-sm">{u.name || "Unknown"}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {u.goal} · 🔥{u.streak}d · {new Date(u.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    u.premium
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-muted/30 text-muted-foreground"
                  }`}>
                    {u.premium ? "PRO" : "Free"}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => togglePremium(u.id, u.premium)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-primary/20 text-primary font-semibold"
                  >
                    Toggle
                  </motion.button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Food DB tab */}
      {tab === "food" && (
        <div className="space-y-4">
          <div className="glass rounded-3xl p-4">
            <h3 className="font-bold text-sm mb-3">Add Food</h3>
            <div className="space-y-2">
              <input
                placeholder="Food name"
                value={newFood.name}
                onChange={(e) => setNewFood((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="kcal/100g" value={newFood.kcal_per_100g}
                  onChange={(e) => setNewFood((f) => ({ ...f, kcal_per_100g: e.target.value }))}
                  className="bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none" />
                <input placeholder="protein/100g" value={newFood.protein_per_100g}
                  onChange={(e) => setNewFood((f) => ({ ...f, protein_per_100g: e.target.value }))}
                  className="bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none" />
                <input placeholder="carbs/100g" value={newFood.carbs_per_100g}
                  onChange={(e) => setNewFood((f) => ({ ...f, carbs_per_100g: e.target.value }))}
                  className="bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none" />
                <input placeholder="fats/100g" value={newFood.fats_per_100g}
                  onChange={(e) => setNewFood((f) => ({ ...f, fats_per_100g: e.target.value }))}
                  className="bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none" />
              </div>
              <input placeholder="Category (e.g. Protein, Carbs, Pakistani)"
                value={newFood.category}
                onChange={(e) => setNewFood((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none" />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addFood}
                className="w-full py-2.5 rounded-xl font-bold text-[var(--primary-foreground)] text-sm"
                style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}
              >
                Add Food
              </motion.button>
            </div>
          </div>
          <div className="glass rounded-3xl p-4">
            <h3 className="font-bold text-sm mb-3">Food Database ({foods.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
              {foods.map((f) => (
                <div key={f.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border/30 last:border-0">
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {f.kcal_per_100g} kcal · {f.protein_per_100g}P · {f.category}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFood(f.id)}
                    className="text-[10px] text-destructive px-2 py-1 rounded-lg bg-destructive/10"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workouts tab */}
      {tab === "workouts" && (
        <div className="glass rounded-3xl p-4">
          <h3 className="font-bold text-sm mb-3">Workout Plans ({workoutPlans.length})</h3>
          {workoutPlans.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              No workout plans yet. Add them via Supabase or build the form here.
            </div>
          ) : (
            workoutPlans.map((w) => (
              <div key={w.id} className="py-2 border-b border-border/30 last:border-0">
                <div className="font-medium text-sm">{w.name}</div>
                <div className="text-[10px] text-muted-foreground">
                  {w.level} · {w.goal} · {w.days_per_week}x/week
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Broadcast tab */}
      {tab === "broadcast" && (
        <div className="glass rounded-3xl p-5">
          <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Send Miku Broadcast
          </h3>
          <p className="text-[10px] text-muted-foreground mb-4">
            This message will appear as a Miku notification for all users.
          </p>
          <textarea
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder="Hey master! Don't forget to log your meals today 💚"
            rows={4}
            className="w-full bg-muted/30 rounded-xl px-4 py-3 text-sm outline-none resize-none mb-3"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={sendBroadcast}
            disabled={sending}
            className="w-full py-3 rounded-xl font-bold text-[var(--primary-foreground)] flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))",
            }}
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : sent ? "Sent! ✓" : "Send to All Users"}
          </motion.button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: any; label: string; value: any; color: string;
}) {
  return (
    <div className="glass rounded-2xl p-3 text-center">
      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
