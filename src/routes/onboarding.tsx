import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { MikuCharacter } from "@/components/MikuCharacter";
import { useSession } from "@/hooks/use-session";
import { getMyProfile, completeOnboarding } from "@/lib/profile.functions";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "NutriMiku — Welcome" }] }),
});

const goals = [
  { v: "cut", label: "Cut", emoji: "🔥", desc: "Lose fat, keep muscle" },
  { v: "maintain", label: "Maintain", emoji: "⚖️", desc: "Stay where you are" },
  { v: "bulk", label: "Bulk", emoji: "💪", desc: "Build muscle" },
] as const;

const activities = [
  { v: "sedentary", label: "Sedentary", desc: "Mostly sitting" },
  { v: "light", label: "Light", desc: "1-2 workouts / wk" },
  { v: "moderate", label: "Moderate", desc: "3-4 workouts / wk" },
  { v: "active", label: "Active", desc: "5-6 workouts / wk" },
  { v: "very_active", label: "Very active", desc: "Daily training" },
] as const;

const genders = [
  { v: "female", label: "Female" },
  { v: "male", label: "Male" },
  { v: "other", label: "Other" },
] as const;

function Onboarding() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const submit = useServerFn(completeOnboarding);

  const { data } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
    if (data?.profile?.onboarding_complete) navigate({ to: "/" });
  }, [user, loading, data, navigate]);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    age: 25,
    weight_kg: 70,
    height_cm: 170,
    gender: "female" as "male" | "female" | "other",
    goal: "maintain" as "cut" | "bulk" | "maintain",
    activity_level: "moderate" as typeof activities[number]["v"],
  });

  useEffect(() => {
    if (data?.profile?.name && !form.name) {
      setForm((f) => ({ ...f, name: data.profile!.name ?? "" }));
    }
  }, [data, form.name]);

  const mutation = useMutation({
    mutationFn: submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Welcome aboard, master! ✨");
      navigate({ to: "/" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const steps = [
    {
      title: "What should I call you?",
      miku: "happy" as const,
      content: (
        <input
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name"
          className="w-full bg-muted/30 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-primary"
        />
      ),
      valid: form.name.trim().length > 0,
    },
    {
      title: "How old are you?",
      miku: "happy" as const,
      content: (
        <NumberPicker value={form.age} onChange={(v) => setForm({ ...form, age: v })} min={10} max={100} suffix="years" />
      ),
      valid: form.age >= 10,
    },
    {
      title: "Your gender?",
      miku: "happy" as const,
      content: (
        <div className="grid grid-cols-3 gap-2">
          {genders.map((g) => (
            <Choice key={g.v} active={form.gender === g.v} onClick={() => setForm({ ...form, gender: g.v })}>
              {g.label}
            </Choice>
          ))}
        </div>
      ),
      valid: true,
    },
    {
      title: "Weight + height?",
      miku: "happy" as const,
      content: (
        <div className="space-y-3">
          <NumberPicker value={form.weight_kg} onChange={(v) => setForm({ ...form, weight_kg: v })} min={30} max={250} suffix="kg" />
          <NumberPicker value={form.height_cm} onChange={(v) => setForm({ ...form, height_cm: v })} min={120} max={230} suffix="cm" />
        </div>
      ),
      valid: form.weight_kg > 0 && form.height_cm > 0,
    },
    {
      title: "What's your goal?",
      miku: "cheer" as const,
      content: (
        <div className="space-y-2">
          {goals.map((g) => (
            <BigChoice key={g.v} active={form.goal === g.v} onClick={() => setForm({ ...form, goal: g.v })}>
              <span className="text-2xl mr-3">{g.emoji}</span>
              <div>
                <div className="font-bold">{g.label}</div>
                <div className="text-[11px] text-muted-foreground">{g.desc}</div>
              </div>
            </BigChoice>
          ))}
        </div>
      ),
      valid: true,
    },
    {
      title: "Activity level?",
      miku: "cheer" as const,
      content: (
        <div className="space-y-2">
          {activities.map((a) => (
            <BigChoice key={a.v} active={form.activity_level === a.v} onClick={() => setForm({ ...form, activity_level: a.v })}>
              <div>
                <div className="font-bold">{a.label}</div>
                <div className="text-[11px] text-muted-foreground">{a.desc}</div>
              </div>
            </BigChoice>
          ))}
        </div>
      ),
      valid: true,
    },
  ];

  const cur = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen mx-auto max-w-md px-5 pt-8 pb-12 flex flex-col">
      <div className="flex justify-center mb-2">
        <MikuCharacter size={140} mood={cur.miku} />
      </div>

      {/* progress */}
      <div className="flex gap-1.5 mb-6">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition ${i <= step ? "bg-primary" : "bg-muted/40"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="glass rounded-3xl p-5 mb-4"
        >
          <h2 className="text-lg font-bold mb-4">{cur.title}</h2>
          {cur.content}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-auto">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center justify-center w-12 h-12 rounded-full glass"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!cur.valid || mutation.isPending}
          onClick={() => {
            if (isLast) mutation.mutate({ data: form });
            else setStep(step + 1);
          }}
          className="flex-1 py-3 rounded-2xl font-bold text-[var(--primary-foreground)] glow-ring disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}
        >
          {isLast ? (mutation.isPending ? "..." : "Let's go ✨") : (<>Next <ChevronRight className="w-5 h-5" /></>)}
        </motion.button>
      </div>
    </div>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className={`py-3 rounded-xl font-semibold text-sm transition ${active ? "bg-primary text-primary-foreground glow-ring" : "bg-muted/30"}`}>{children}</motion.button>
  );
}

function BigChoice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} className={`w-full text-left flex items-center px-4 py-3 rounded-2xl transition ${active ? "bg-primary/15 glow-ring" : "bg-muted/30"}`}>{children}</motion.button>
  );
}

function NumberPicker({ value, onChange, min, max, suffix }: { value: number; onChange: (v: number) => void; min: number; max: number; suffix: string }) {
  return (
    <div className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-9 h-9 rounded-full bg-background/40 grid place-items-center font-bold">−</button>
      <div className="text-center">
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-[10px] text-muted-foreground">{suffix}</div>
      </div>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-9 h-9 rounded-full bg-background/40 grid place-items-center font-bold">+</button>
    </div>
  );
}
