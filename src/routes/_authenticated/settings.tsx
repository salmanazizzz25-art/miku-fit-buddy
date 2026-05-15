import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  User, Target, Activity, LogOut,
  Crown, ChevronRight, Save,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MikuCharacter } from "@/components/MikuCharacter";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { usePremium } from "@/hooks/use-premium";
import { useState, useEffect } from "react";
import { badges } from "@/lib/mockData";

export const Route = createFileRoute("/_authenticated/settings")({
  component: Settings,
  head: () => ({ meta: [{ title: "NutriMiku — Settings" }] }),
});

type Profile = {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  goal: string;
  activity_level: string;
  bond_level: number;
  xp: number;
  xp_max: number;
  streak: number;
  premium: boolean;
};

const goals = ["Cut", "Maintain", "Bulk"];
const activityLevels = ["Sedentary", "Light", "Moderate", "Active", "Very Active"];
const genders = ["Male", "Female", "Other"];

function Settings() {
  const { user } = useSession();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: 0,
    weight: 0,
    height: 0,
    gender: "Male",
    goal: "Maintain",
    activity_level: "Moderate",
    bond_level: 1,
    xp: 0,
    xp_max: 1000,
    streak: 0,
    premium: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    if (data) setProfile(data);
  };

  const saveProfile = async () => {
    setSaving(true);
    await supabase
      .from("profiles")
      .update({
        name: profile.name,
        age: profile.age,
        weight: profile.weight,
        height: profile.height,
        gender: profile.gender,
        goal: profile.goal,
        activity_level: profile.activity_level,
      })
      .eq("id", user!.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const xpPct = (profile.xp / profile.xp_max) * 100;

  return (
    <AppShell>
      <PageHeader title="Settings" subtitle="Your profile & preferences" />

      {/* Profile card */}
      <div className="glass rounded-3xl p-5 mb-4 flex items-center gap-4">
        <MikuCharacter size={80} mood="happy" />
        <div className="flex-1">
          <div className="font-bold text-lg">{profile.name || "Master"}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isPremium
                ? "bg-amber-500/20 text-amber-300"
                : "bg-muted/30 text-muted-foreground"
            }`}>
              {isPremium ? "💎 Premium" : "Free Plan"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              🔥 {profile.streak} day streak
            </div>
          </div>
        </div>
      </div>

      {/* Bond level */}
      <div className="glass rounded-3xl p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-bold">Bond Level {profile.bond_level}</span>
          <span className="text-muted-foreground">{profile.xp}/{profile.xp_max} XP</span>
        </div>
        <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 1.2 }}
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, var(--color-cyan), var(--color-mint))",
            }}
          />
        </div>
      </div>

      {/* Edit profile */}
      <div className="glass rounded-3xl p-5 mb-4 space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Personal Info
        </h3>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</label>
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            className="w-full bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none mt-1 focus:ring-2 focus:ring-primary"
            placeholder="Your name"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Age</label>
            <input
              type="number"
              value={profile.age || ""}
              onChange={(e) => setProfile((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))}
              className="w-full bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none mt-1"
              placeholder="25"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Weight (kg)</label>
            <input
              type="number"
              value={profile.weight || ""}
              onChange={(e) => setProfile((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none mt-1"
              placeholder="70"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Height (cm)</label>
            <input
              type="number"
              value={profile.height || ""}
              onChange={(e) => setProfile((p) => ({ ...p, height: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-muted/30 rounded-xl px-3 py-2 text-sm outline-none mt-1"
              placeholder="175"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Gender</label>
          <div className="flex gap-2 mt-1">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => setProfile((p) => ({ ...p, gender: g }))}
                className={`flex-1 py-2 text-xs rounded-xl font-semibold transition ${
                  profile.gender === g
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal & Activity */}
      <div className="glass rounded-3xl p-5 mb-4 space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Goal
        </h3>
        <div className="flex gap-2">
          {goals.map((g) => (
            <button
              key={g}
              onClick={() => setProfile((p) => ({ ...p, goal: g }))}
              className={`flex-1 py-2 text-xs rounded-xl font-semibold transition ${
                profile.goal === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <h3 className="font-bold text-sm flex items-center gap-2 pt-1">
          <Activity className="w-4 h-4 text-primary" /> Activity Level
        </h3>
        <div className="flex flex-wrap gap-2">
          {activityLevels.map((a) => (
            <button
              key={a}
              onClick={() => setProfile((p) => ({ ...p, activity_level: a }))}
              className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition ${
                profile.activity_level === a
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="glass rounded-3xl p-4 mb-4">
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

      {/* Premium upgrade */}
      {!isPremium && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate({ to: "/premium" })}
          className="w-full glass rounded-3xl p-4 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-300" />
            <div className="text-left">
              <div className="font-bold text-sm">Upgrade to Premium</div>
              <div className="text-[10px] text-muted-foreground">
                Unlock voice, analytics & more
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      )}

      {/* Save button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={saveProfile}
        disabled={saving}
        className="w-full py-3 rounded-2xl font-bold text-[var(--primary-foreground)] glow-ring mb-3 flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))",
        }}
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : saved ? "Saved! ✓" : "Save Changes"}
      </motion.button>

      {/* Logout */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={logout}
        className="w-full py-3 rounded-2xl font-semibold text-sm bg-destructive/20 text-destructive flex items-center justify-center gap-2 mb-8"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </motion.button>
    </AppShell>
  );
}
