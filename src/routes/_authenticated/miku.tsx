import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Mic, Lock } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MikuCharacter } from "@/components/MikuCharacter";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/_authenticated/miku")({
  component: MikuChat,
  head: () => ({ meta: [{ title: "NutriMiku — Talk to Miku" }] }),
});

type Msg = { from: "user" | "miku"; text: string };
type ClaudeMsg = { role: "user" | "assistant"; content: string };

function MikuChat() {
  const { user } = useSession();
  const [messages, setMessages] = useState<Msg[]>([
    { from: "miku", text: "Hey master! I'm Miku, your personal nutrition companion 💚 Ask me anything about food, fitness, or just chat!" }
  ]);
  const [claudeHistory, setClaudeHistory] = useState<ClaudeMsg[]>([]);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<"happy" | "cheer" | "concerned" | "idle">("happy");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const detectMood = (text: string): "happy" | "cheer" | "concerned" | "idle" => {
    const lower = text.toLowerCase();
    if (lower.includes("amazing") || lower.includes("great") || lower.includes("proud") || lower.includes("awesome")) return "cheer";
    if (lower.includes("worried") || lower.includes("careful") || lower.includes("concern") || lower.includes("make sure")) return "concerned";
    if (lower.includes("💚") || lower.includes("✨") || lower.includes("🌟") || lower.includes("happy")) return "happy";
    return "happy";
  };

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Msg = { from: "user", text };
    const claudeMsg: ClaudeMsg = { role: "user", content: text };

    setMessages((m) => [...m, userMsg]);
    setClaudeHistory((h) => [...h, claudeMsg]);
    setInput("");
    setTyping(true);
    setMood("idle");

    try {
      const newHistory = [...claudeHistory, claudeMsg];

      const { data, error } = await supabase.functions.invoke("miku-chat", {
        body: {
          messages: newHistory,
          userContext: {
            goal: "Cut",
            calories: 1480,
            calorieTarget: 2100,
            proteinRemaining: 48,
            streak: 14,
            bondLevel: 12,
          },
        },
      });

      if (error) throw error;

      const reply = data.reply;
      const detectedMood = detectMood(reply);

      setMessages((m) => [...m, { from: "miku", text: reply }]);
      setClaudeHistory((h) => [...h, { role: "assistant", content: reply }]);
      setMood(detectedMood);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: "miku", text: "Oops, something went wrong on my end! Try again, master 💦" },
      ]);
      setMood("concerned");
    } finally {
      setTyping(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Miku" subtitle="Your AI nutrition companion 💚" />

      {/* Hero character */}
      <div className="glass rounded-3xl p-5 mb-4 flex flex-col items-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, oklch(0.6 0.2 195 / 0.3), transparent 60%)",
          }}
        />
        <MikuCharacter size={200} mood={mood} />
        <div className="text-xs text-primary font-semibold mt-2">
          Bond Lv. 12 · Mood: {mood.charAt(0).toUpperCase() + mood.slice(1)}
        </div>
      </div>

      {/* Chat */}
      <div className="glass rounded-3xl flex flex-col h-[420px] overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    m.from === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/50 text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="bg-muted/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-border/40 p-2 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Tell Miku anything…"
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            className="w-9 h-9 rounded-full grid place-items-center bg-muted/40 text-muted-foreground relative"
            title="Voice — Premium"
          >
            <Mic className="w-4 h-4" />
            <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-amber-300" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={send}
            disabled={typing}
            className="w-9 h-9 rounded-full grid place-items-center text-[var(--primary-foreground)] glow-ring disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </AppShell>
  );
}
