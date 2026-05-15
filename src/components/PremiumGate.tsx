import { motion, AnimatePresence } from "motion/react";
import { X, Crown } from "lucide-react";
import { MikuCharacter } from "./MikuCharacter";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function PremiumGate({ open, onClose, feature }: Props) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 glass rounded-3xl p-6 max-w-sm mx-auto text-center"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center">
              <MikuCharacter size={130} mood="cheer" />
            </div>

            <h2 className="text-xl font-bold gradient-text mt-2">
              Premium Feature
            </h2>

            {feature && (
              <p className="text-sm text-muted-foreground mt-1">
                {feature}
              </p>
            )}

            <p className="text-sm mt-3 leading-snug">
              Unlock my full potential, master! 💎 Get access to all premium features and let's reach your goals together!
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { onClose(); navigate({ to: "/premium" }); }}
              className="mt-4 w-full py-3 rounded-2xl font-bold text-[var(--primary-foreground)] glow-ring flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, var(--color-cyan), var(--color-mint), var(--color-pink))",
              }}
            >
              <Crown className="w-4 h-4" />
              Unlock Premium
            </motion.button>

            <button
              onClick={onClose}
              className="mt-2 text-xs text-muted-foreground"
            >
              Maybe later
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
