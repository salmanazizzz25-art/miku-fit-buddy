import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Mic, Lock } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MikuCharacter } from "@/components/MikuCharacter";
import { mikuChat, cannedReplies } from "@/lib/mockData";

export const Route = createFileRoute("/_authenticated/miku")({
  component: MikuChat,
  head: () => ({ meta: [{ title: "NutriMiku — Talk to Miku" }] }),
});

type Msg = { from: "user" | "miku"; text: string };

function MikuChat() {
  const [messages, setMessages] = useState<Msg[]>(mikuChat);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<"happy" | "cheer" | "idle">("happy");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setMood("cheer");
    setTimeout(() => {
      const reply = cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
      setMessages((m) => [...m, { from: "miku", text: reply }]);
      setMood("happy");
    }, 700);
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
        <div className="text-xs text-primary font-semibold mt-2">Bond Lv. 12 · Mood: Happy</div>
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
            className="w-9 h-9 rounded-full grid place-items-center text-[var(--primary-foreground)] glow-ring"
            style={{ background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint))" }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </AppShell>
  );
}
