export const user = {
  name: "Yuki",
  level: 12,
  xp: 740,
  xpMax: 1000,
  streak: 14,
  goal: "Cut" as const,
};

export const todayMacros = {
  calories: { current: 1480, target: 2100 },
  protein: { current: 112, target: 160 },
  carbs: { current: 142, target: 220 },
  fats: { current: 48, target: 70 },
  water: { current: 5, target: 8 },
  steps: { current: 6420, target: 10000 },
};

export const meals = [
  { id: 1, type: "Breakfast", name: "Oats, banana, peanut butter", kcal: 420, p: 18, c: 58, f: 14, time: "08:12" },
  { id: 2, type: "Lunch", name: "Chicken rice bowl", kcal: 620, p: 52, c: 70, f: 14, time: "12:48" },
  { id: 3, type: "Snack", name: "Greek yogurt + berries", kcal: 180, p: 18, c: 22, f: 2, time: "15:30" },
  { id: 4, type: "Dinner", name: "Salmon, sweet potato, broccoli", kcal: 260, p: 24, c: 18, f: 10, time: "19:05" },
];

export const weekMacros = [
  { day: "Mon", kcal: 2050, p: 155 },
  { day: "Tue", kcal: 1980, p: 148 },
  { day: "Wed", kcal: 2160, p: 162 },
  { day: "Thu", kcal: 1890, p: 140 },
  { day: "Fri", kcal: 2020, p: 158 },
  { day: "Sat", kcal: 2240, p: 170 },
  { day: "Sun", kcal: 1480, p: 112 },
];

export const weightTrend = [
  { week: "W1", kg: 78.4 },
  { week: "W2", kg: 78.0 },
  { week: "W3", kg: 77.6 },
  { week: "W4", kg: 77.1 },
  { week: "W5", kg: 76.8 },
  { week: "W6", kg: 76.3 },
  { week: "W7", kg: 75.9 },
  { week: "W8", kg: 75.4 },
];

export const workouts = [
  { id: 1, name: "Push Day", exercises: 6, duration: 52, date: "Today", done: false },
  { id: 2, name: "Pull Day", exercises: 5, duration: 48, date: "Yesterday", done: true },
  { id: 3, name: "Leg Day", exercises: 7, duration: 65, date: "2d ago", done: true },
];

export const exercises = [
  { name: "Bench Press", muscle: "Chest", sets: "4 × 8" },
  { name: "Overhead Press", muscle: "Shoulders", sets: "4 × 10" },
  { name: "Incline DB Press", muscle: "Chest", sets: "3 × 12" },
  { name: "Lateral Raises", muscle: "Shoulders", sets: "4 × 15" },
  { name: "Tricep Pushdown", muscle: "Triceps", sets: "3 × 12" },
  { name: "Dips", muscle: "Chest/Tri", sets: "3 × AMRAP" },
];

export const badges = [
  { name: "First Step", emoji: "👟", earned: true },
  { name: "Week Warrior", emoji: "🔥", earned: true },
  { name: "Hydrated", emoji: "💧", earned: true },
  { name: "Macro Master", emoji: "🥗", earned: true },
  { name: "Iron Bond", emoji: "💎", earned: false },
  { name: "Miku's BFF", emoji: "💖", earned: false },
];

export const quote = "You showed up today — that's already a win, master! ✨";

export const mikuChat = [
  { from: "miku" as const, text: "Welcome back, Yuki! You're on a 14-day streak — I'm so proud! 💚" },
  { from: "miku" as const, text: "You've got 620 kcal and 48g of protein left for today. Want me to suggest a dinner?" },
];

export const cannedReplies = [
  "That's amazing! Keep it up, master! 🌟",
  "Hmm, let me think… try adding some lean protein and leafy greens — your body will love you for it! 🥦",
  "Don't forget to drink water! You're at 5 of 8 glasses today 💧",
  "Rest is part of the grind too. A walk counts! 🚶‍♀️",
  "I believe in you! One small choice at a time builds the dream physique 💪✨",
];
