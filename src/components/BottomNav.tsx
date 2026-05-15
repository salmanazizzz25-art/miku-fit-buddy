import { Link, useLocation } from "@tanstack/react-router";
import { Home, Apple, Dumbbell, MessageCircleHeart, Crown } from "lucide-react";
import { motion } from "motion/react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/nutrition", label: "Food", icon: Apple },
  { to: "/miku", label: "Miku", icon: MessageCircleHeart, primary: true },
  { to: "/fitness", label: "Train", icon: Dumbbell },
  { to: "/premium", label: "Premium", icon: Crown },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="mx-auto max-w-md px-3 pb-3 pointer-events-auto">
        <div className="glass rounded-3xl flex items-end justify-between px-2 py-2 relative">
          {items.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            if (item.primary) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="-mt-7 flex flex-col items-center gap-0.5 flex-1"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="w-14 h-14 rounded-full grid place-items-center glow-ring"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-cyan), var(--color-mint))",
                    }}
                  >
                    <Icon className="w-6 h-6 text-[var(--primary-foreground)]" strokeWidth={2.5} />
                  </motion.div>
                  <span className="text-[10px] font-semibold text-foreground/80">
                    {item.label}
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex-1 flex flex-col items-center gap-1 py-1"
              >
                <motion.div whileTap={{ scale: 0.85 }} className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {active && (
                    <motion.div
                      layoutId="navdot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </motion.div>
                <span
                  className={`text-[10px] ${
                    active ? "text-primary font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
