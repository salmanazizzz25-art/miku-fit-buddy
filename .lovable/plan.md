# NutriMiku — Backend & Functionality Buildout

The frontend stays exactly as-is (glassmorphism, teal palette, animations, Miku character). I'll layer real functionality underneath in 6 ordered phases. Each phase ends in a working app.

## Phase 1 — Lovable Cloud + Auth + Onboarding
- Enable Lovable Cloud (Supabase under the hood).
- Create tables: `profiles`, `user_roles` (separate table — security best practice), `meal_logs`, `workout_logs`, `daily_stats`, `foods`, `workout_plans`, `broadcasts`.
- RLS on every table; `has_role()` SECURITY DEFINER function.
- Trigger: auto-create profile row on signup.
- Routes: `/login` (email+password + Google OAuth), `/onboarding` (name, age, weight, height, gender, goal, activity level — multi-step with Miku guiding).
- `_authenticated` layout route guards everything else; redirects to `/login` if no session and `/onboarding` if profile incomplete.
- `onAuthStateChange` listener wired in `__root.tsx` (router.invalidate + queryClient invalidate).

## Phase 2 — Real Data Layer
Replace `src/lib/mockData.ts` with TanStack Query hooks reading from Supabase via `createServerFn` (auth-protected):
- Dashboard reads today's `daily_stats` + aggregated `meal_logs`.
- Nutrition page logs meals (optimistic UI), groups by meal type, weekly chart from real history.
- Fitness page logs workouts.
- Water + steps update `daily_stats` for today.

## Phase 3 — Real AI Miku
- AI chat via **Lovable AI Gateway** (`google/gemini-3-flash-preview` default — Claude isn't on the gateway; using Lovable AI is the recommended path and the API key is auto-provisioned). I'll surface this swap in the response.
- `createServerFn` `streamChat` that injects context: goal, today's calories/protein remaining, streak, bond level, recent meals.
- System prompt: cheerful anime companion, calls user "master", nutrition+fitness focused.
- Streaming token-by-token render, animated typing dots before first token.
- `chat_messages` table for history.
- Mood derived from reply sentiment (simple keyword pass: 💪/✨ → cheer, "worried"/"missed" → concerned, default happy).

## Phase 4 — Premium Gating
- `profiles.premium boolean default false`.
- `usePremium()` hook. `<PremiumGate>` wrapper that opens a Miku modal ("Unlock my full potential, master! 💎") with CTA to `/premium`.
- Gate: voice mic, advanced analytics, barcode scanner, custom workout builder, outfits, unlimited meal plans.
- Premium page: "Activate Premium (Test Mode)" toggle that flips `profiles.premium` instantly via server fn.
- Floating dev-tool button (hidden in production via `import.meta.env.DEV`) to toggle free/premium on the fly.

## Phase 5 — Settings + Notifications
- `/settings` route: edit name/weight/height/goal/activity, show level/XP/streak/badges, current plan, logout button.
- Daily check-in banner on dashboard: if no meal logged today, show in-character Miku message.

## Phase 6 — Admin Dashboard
- `admin` role in `user_roles`. `/admin/*` routes guarded by `has_role(uid, 'admin')` server-side check; non-admins redirected.
- Admin panels: stats cards (total/premium/active today), users table with premium toggle, signups line chart, premium conversion %, broadcast composer (writes to `broadcasts` → shown to users as Miku notification), foods CRUD, workout plans CRUD.
- First admin: I'll add a one-time SQL note for you to run that promotes your account to admin after first signup.

## Technical notes (for the curious)
- **AI provider**: Your brief asked for Claude `claude-sonnet-4-20250514`. The Lovable AI Gateway doesn't carry Anthropic models — it serves Google Gemini and OpenAI GPT-5 family with the key auto-provisioned. I'll default to `google/gemini-3-flash-preview` (fast, free tier). If you specifically need Claude, I'd need you to add an `ANTHROPIC_API_KEY` secret and I'll route through a server fn instead. **Recommend: stick with Lovable AI** — same UX, zero key setup.
- **Edge Function vs server fn**: Per TanStack Start guidance, AI streaming goes through `createServerFn` (not a Supabase Edge Function).
- All secrets stay server-side; the publishable Supabase key is the only thing in client bundles.

## Scope confirmation
This is ~6–10 sequential build cycles of work. I'll execute Phase 1 immediately on approval and report back at each phase boundary so you can test before I move on. Reply "go" to start, or tell me to drop/reorder phases.
