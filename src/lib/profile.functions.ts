import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    // Check if admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");

    return { profile: data, isAdmin };
  });

const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(60),
  age: z.number().int().min(10).max(120),
  weight_kg: z.number().min(20).max(400),
  height_cm: z.number().min(80).max(260),
  gender: z.enum(["male", "female", "other"]),
  goal: z.enum(["cut", "bulk", "maintain"]),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => onboardingSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, onboarding_complete: true })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  weight_kg: z.number().min(20).max(400).optional(),
  height_cm: z.number().min(80).max(260).optional(),
  goal: z.enum(["cut", "bulk", "maintain"]).optional(),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setPremium = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ premium: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ premium: data.premium })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
