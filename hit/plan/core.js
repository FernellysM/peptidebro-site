// Pure logic, no DOM. Ported from ~/HIT/HIT/Domain/PlanGenerator.swift, ProgressionEngine.swift
// and the WeightUnit / BlockPhase enums in Models/Enums.swift.
import { EXERCISES, PRESETS, GOALS, EXPERIENCE, PHASES, LOWER_BODY } from "./catalog.js";

// ---------- Units (WeightUnit) ----------
export const KG_PER_LB = 0.45359237;
export const fromKg = (kg, unit) => (unit === "kg" ? kg : kg / KG_PER_LB);
export const toKg = (value, unit) => (unit === "kg" ? value : value * KG_PER_LB);

/** Formats a stored kilogram value in this unit, e.g. "135" or "62.5". */
export function formatKg(kg, unit, withUnit = false) {
  const value = Math.round(fromKg(kg, unit) * 10) / 10;
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return withUnit ? `${text} ${unit}` : text;
}

// ---------- Plan generator ----------
export const DAY_MIN = 2;
export const DAY_MAX = 6;
const s = (pattern, role, variant = 0) => ({ pattern, role, variant });
const day = (title, focus, slots) => ({ title, focus, slots });

export function split(count) {
  const fullA = day("Full Body A", "Squat, bench, row", [s("squat", "primary"), s("horizontalPush", "primary"), s("horizontalPull", "secondary"), s("core", "accessory")]);
  const fullB = day("Full Body B", "Hinge, press, pull-up", [s("hinge", "primary"), s("verticalPush", "primary"), s("verticalPull", "secondary"), s("singleLeg", "accessory")]);
  const fullC = day("Full Body C", "Variations and volume", [s("squat", "secondary"), s("horizontalPush", "secondary", 1), s("horizontalPull", "secondary", 1), s("hinge", "accessory"), s("biceps", "accessory")]);
  const upperA = day("Upper A", "Bench and row", [s("horizontalPush", "primary"), s("horizontalPull", "primary"), s("verticalPush", "secondary"), s("verticalPull", "secondary"), s("triceps", "accessory")]);
  const lowerA = day("Lower A", "Squat focus", [s("squat", "primary"), s("hinge", "secondary"), s("singleLeg", "accessory"), s("core", "accessory")]);
  const upperB = day("Upper B", "Press and pull-up", [s("verticalPush", "primary"), s("verticalPull", "primary"), s("horizontalPush", "secondary"), s("horizontalPull", "secondary"), s("biceps", "accessory")]);
  const lowerB = day("Lower B", "Deadlift focus", [s("hinge", "primary"), s("squat", "secondary"), s("singleLeg", "accessory", 1), s("core", "accessory", 1)]);
  const push = day("Push", "Chest, shoulders, triceps", [s("horizontalPush", "primary"), s("verticalPush", "secondary"), s("horizontalPush", "accessory"), s("triceps", "accessory")]);
  const pull = day("Pull", "Back and biceps", [s("horizontalPull", "primary"), s("verticalPull", "secondary"), s("horizontalPull", "accessory"), s("biceps", "accessory")]);
  const legs = day("Legs", "Squat, hinge, single leg", [s("squat", "primary"), s("hinge", "secondary"), s("singleLeg", "accessory"), s("core", "accessory")]);
  const pushB = day("Push B", "Overhead focus", [s("verticalPush", "primary"), s("horizontalPush", "secondary"), s("triceps", "accessory", 1), s("core", "accessory")]);
  const pullB = day("Pull B", "Vertical pull focus", [s("verticalPull", "primary"), s("horizontalPull", "secondary"), s("biceps", "accessory", 1), s("core", "accessory", 1)]);
  const legsB = day("Legs B", "Hinge focus", [s("hinge", "primary"), s("squat", "secondary"), s("singleLeg", "accessory", 1), s("hinge", "accessory")]);
  switch (Math.min(Math.max(count, DAY_MIN), DAY_MAX)) {
    case 2: return { name: "Full Body", days: [fullA, fullB] };
    case 3: return { name: "Full Body", days: [fullA, fullB, fullC] };
    case 4: return { name: "Upper / Lower", days: [upperA, lowerA, upperB, lowerB] };
    case 5: return { name: "Upper / Lower + PPL", days: [upperA, lowerA, push, pull, legs] };
    default:
      return { name: "Push / Pull / Legs", days: [{ ...push, title: "Push A" }, { ...pull, title: "Pull A" }, { ...legs, title: "Legs A" }, pushB, pullB, legsB] };
  }
}

export const isRepProgressed = (ex) => ex.load === "bodyweight" || ex.load === "band";
export const isAvailable = (ex, equipment) => ex.equipment.every((item) => equipment.includes(item));
export const available = (pattern, equipment) => EXERCISES.filter((e) => e.pattern === pattern && isAvailable(e, equipment));

const BASE_DOSE = {
  strength: { primary: [4, 4, 6, 180], secondary: [3, 6, 8, 150], accessory: [3, 8, 12, 90] },
  muscle: { primary: [4, 6, 10, 150], secondary: [3, 8, 12, 120], accessory: [3, 10, 15, 75] },
  general: { primary: [3, 5, 8, 150], secondary: [3, 8, 10, 120], accessory: [2, 10, 15, 60] },
};

export function dose(goal, role, experience, exercise) {
  const [sets, repLow, repHigh, rest] = BASE_DOSE[goal][role];
  const d = { sets, repLow, repHigh, rest };
  // Beginners recover from less; experienced lifters need more to keep adapting.
  if (experience === "beginner" && role === "primary") d.sets = Math.max(3, d.sets - 1);
  else if (experience === "advanced" && role === "secondary") d.sets += 1;
  // No external load to add, so these ranges run higher.
  if (exercise.pattern === "core") Object.assign(d, { repLow: 8, repHigh: 12, rest: 60 });
  else if (isRepProgressed(exercise)) {
    [d.repLow, d.repHigh] = { primary: [6, 12], secondary: [8, 15], accessory: [10, 20] }[role];
  }
  return d;
}

const ACCESSORY_ONLY = new Set(["singleLeg", "biceps", "triceps", "core"]);

export function pick(slot, equipment, used) {
  const options = available(slot.pattern, equipment);
  if (options.length === 0) return null;
  const base = slot.role === "primary" ? 0 : slot.role === "secondary" ? 1 : ACCESSORY_ONLY.has(slot.pattern) ? 0 : 2;
  const start = Math.min(base + slot.variant, options.length - 1);
  const rotated = [...options.slice(start), ...options.slice(0, start)];
  return rotated.find((e) => !used.has(e.id)) ?? null;
}

export function item(exercise, role, week, goal, experience) {
  const base = dose(goal, role, experience, exercise);
  const rir = EXPERIENCE[experience].rir;
  let sets = base.sets;
  let weekRIR = rir;
  let note;
  if (week === 1) {
    weekRIR = rir + 1;
    note = `Foundation week: stop each set with about ${weekRIR} reps left so your baseline is honest, not maxed out.`;
  } else if (week === 2) {
    note = `Build week: beat last week by one rep or a small weight jump, with about ${weekRIR} ${weekRIR === 1 ? "rep" : "reps"} in reserve.`;
  } else if (week === 3) {
    weekRIR = Math.max(1, rir - 1);
    if (role === "primary") {
      sets += 1;
      note = "Push week: one extra set on your main lift. This is the hardest week and where most progress is earned.";
    } else {
      note = `Push week: work closer to your limit, about ${weekRIR} ${weekRIR === 1 ? "rep" : "reps"} in reserve.`;
    }
  } else {
    sets = Math.max(2, Math.ceil(base.sets * 0.6));
    weekRIR = 4;
    note = `Deload week: ${sets} sets at about 90% of your working weight. Fatigue drops, fitness stays, and next block starts fresh.`;
  }
  return { exerciseID: exercise.id, role, sets, repLow: base.repLow, repHigh: base.repHigh, rest: base.rest, rir: weekRIR, note };
}

/** The first four-week block for these settings. Exercise choice is fixed across the block. */
export function blueprint({ goal, experience, preset, days }) {
  const equipment = PRESETS[preset].equipment;
  const plan = split(days);
  const chosen = plan.days.map((d) => {
    const used = new Set();
    return d.slots.flatMap((slot) => {
      const exercise = pick(slot, equipment, used);
      if (!exercise) return [];
      used.add(exercise.id);
      return [[exercise, slot.role]];
    });
  });
  const weeks = PHASES.map((phase, i) => ({
    week: i + 1,
    phase: phase.title,
    detail: phase.detail,
    workouts: plan.days.map((d, index) => ({
      dayIndex: index,
      title: d.title,
      focus: d.focus,
      items: chosen[index].map(([exercise, role]) => item(exercise, role, i + 1, goal, experience)),
    })),
  }));
  return {
    name: `${GOALS[goal].title} block`,
    summary: `${plan.days.length} days a week · ${plan.name} · ${EXPERIENCE[experience].level}`,
    splitName: plan.name,
    weeks,
  };
}

// ---------- Progression engine ----------
export const STALL_THRESHOLD = 2;
export const RESET_FACTOR = 0.9;

/** The five checker exercise types, as the engine sees them. */
export const EXERCISE_TYPES = {
  barbellUpper: { title: "Barbell, upper body", load: "barbell", pattern: "horizontalPush" },
  barbellLower: { title: "Barbell, lower body", load: "barbell", pattern: "squat" },
  dumbbell: { title: "Dumbbell", load: "dumbbell", pattern: "horizontalPush" },
  bodyweight: { title: "Bodyweight", load: "bodyweight", pattern: "horizontalPush" },
  band: { title: "Band", load: "band", pattern: "horizontalPull" },
};

export const OUTCOME_NAMES = { increase: "Earn it", addReps: "Build", hold: "Hold", reduce: "Reset", harderVariation: "Level up" };

/** The load most sets were done with. Ties go to the heavier load. */
export function workingWeight(sets) {
  const groups = new Map();
  for (const set of sets) {
    const key = Math.round(set.weightKg * 100);
    groups.set(key, { weight: set.weightKg, count: (groups.get(key)?.count ?? 0) + 1 });
  }
  let best = null;
  for (const g of groups.values()) {
    if (!best || g.count > best.count || (g.count === best.count && g.weight > best.weight)) best = g;
  }
  return best ? best.weight : 0;
}

/** Weight added after earning it, in the lifter's unit. */
export function increment(exercise, unit, experience) {
  const lower = LOWER_BODY.has(exercise.pattern);
  const lb = unit === "lb";
  switch (exercise.load) {
    case "barbell": return lower && experience === "beginner" ? (lb ? 10 : 5) : (lb ? 5 : 2.5);
    case "dumbbell": return lb ? 5 : 2;
    case "kettlebell": return lb ? 10 : 4;
    case "machine": return lb ? 10 : 5;
    case "cable": case "bodyweight": return lb ? 5 : 2.5;
    default: return 0; // band
  }
}

/** The smallest jump real equipment allows. */
export function loadableStep(exercise, unit) {
  if (exercise.load === "kettlebell") return unit === "kg" ? 4 : 5;
  if (exercise.load === "dumbbell" && unit === "kg") return 1;
  return unit === "lb" ? 5 : 2.5;
}

export function roundToLoadable(kg, exercise, unit) {
  const step = loadableStep(exercise, unit);
  return toKg(Math.round(fromKg(kg, unit) / step) * step, unit);
}

export function roundDown(kg, exercise, unit) {
  const step = loadableStep(exercise, unit);
  const value = Math.floor(fromKg(kg, unit) / step + 1e-9) * step;
  return toKg(Math.max(value, step), unit);
}

const formatStep = (step, unit) => `${Number.isInteger(step) ? String(step) : step.toFixed(1)} ${unit}`;

/**
 * input: { exercise: {load, pattern}, repLow, repHigh, sets: [{weightKg, reps}], previousMissStreak,
 *          isFirstSession, unit, experience }
 * Returns null when there is nothing honest to progress from.
 */
export function recommend(input) {
  const { exercise, repLow: low, repHigh: high, unit = "lb", experience = "intermediate" } = input;
  const completed = input.sets.filter((x) => x.reps > 0);
  if (completed.length === 0) return null;
  const range = low === high ? `${low}` : `${low}-${high}`;
  const working = workingWeight(completed);
  if (working <= 0 && !isRepProgressed(exercise)) return null;
  const reps = completed.map((x) => x.reps);
  const repsText = reps.join(", ");
  const count = completed.length;
  const setsWord = count === 1 ? "set" : "sets";
  const loadless = working <= 0;
  const weightText = formatKg(working, unit, true);
  const prefix = input.isFirstSession ? (loadless ? "Baseline logged. " : `Baseline logged at ${weightText}. `) : "";
  const belowLow = reps.filter((r) => r < low).length;
  const rec = (action, nextWeightKg, nextRepTarget, missStreak, headline, reason) =>
    ({ action, outcome: OUTCOME_NAMES[action], nextWeightKg, nextRepTarget, missStreak, headline, reason });

  // Rule 1 and 5: top of the range on every set.
  if (reps.every((r) => r >= high)) {
    if (loadless) {
      const band = exercise.load === "band";
      const harder = band ? "a heavier band" : "a harder variation or add load";
      return rec("harderVariation", null, low, 0, `Ready for ${band ? "a heavier band" : "a harder variation"}`,
        prefix + `You reached ${high}+ reps on all ${count} ${setsWord} (${repsText}), the top of your ${range} range. `
          + `More reps would turn strength work into endurance work, so move to ${harder} and build back up from ${low} reps.`);
    }
    const overshoot = reps.every((r) => r >= high + 3);
    const step = increment(exercise, unit, experience) * (overshoot ? 2 : 1);
    const next = roundToLoadable(toKg(fromKg(working, unit) + step, unit), exercise, unit);
    const stepText = formatStep(step, unit);
    const why = overshoot
      ? `You beat the top of your ${range} range by 3 or more reps on every set (${repsText}), so HIT makes a double jump of ${stepText}.`
      : `You hit ${high} reps on all ${count} ${setsWord} (${repsText}), the top of your ${range} range. The weight no longer challenges you enough to drive progress, so HIT adds ${stepText}.`;
    return rec("increase", next, low, 0, `Go up to ${formatKg(next, unit, true)}`, prefix + why + ` Your target resets to ${low} reps.`);
  }

  // Rule 2: everything inside the range.
  if (belowLow === 0) {
    const target = Math.min(high, Math.min(...reps) + 1);
    const hold = loadless ? "Keep the same variation" : `Keep ${weightText}`;
    return rec("addReps", loadless ? null : working, target, 0,
      loadless ? `Aim for ${target}+ reps` : `Stay at ${weightText}, aim for ${target}+ reps`,
      prefix + `Every set landed inside your ${range} range (${repsText}). ${hold} and add a rep to the sets that fell short. `
        + `When all ${count} ${setsWord} reach ${high}, HIT ${loadless ? "moves you to a harder variation" : "adds weight"}.`);
  }

  // Rule 3: half the sets or fewer fell short.
  if (belowLow * 2 <= count) {
    const what = belowLow === 1
      ? `One set dipped below ${low} reps (${repsText}). A single short set is usually fatigue, not a sign the load is too heavy.`
      : `${belowLow} of ${count} sets dipped below ${low} reps (${repsText}). Most of your work was on target, so this is fatigue, not a stall.`;
    return rec("hold", loadless ? null : working, low, 0, loadless ? "Repeat this variation" : `Hold at ${weightText}`,
      prefix + what + ` Repeat it and aim to keep every set at ${low} or more.`);
  }

  // Rule 4: most sets short of the range.
  const streak = (input.previousMissStreak ?? 0) + 1;
  if (streak >= STALL_THRESHOLD) {
    if (loadless) {
      return rec("reduce", null, low, 0, "Use an easier variation",
        prefix + `Two sessions in a row most sets fell short of ${low} reps (${repsText}). `
          + `Swap to an easier variation (or use assistance) until you own ${low} clean reps, then progress again.`);
    }
    const next = Math.min(roundDown(working * RESET_FACTOR, exercise, unit), working);
    return rec("reduce", next, low, 0, `Drop to ${formatKg(next, unit, true)}`,
      prefix + `This is the second session in a row where most sets fell short of ${low} reps (${repsText}). `
        + "Grinding a load you cannot move for the target reps builds fatigue, not strength. HIT lowers it about 10% "
        + `so you rebuild with clean reps and pass ${weightText} again within a few sessions.`);
  }
  return rec("hold", loadless ? null : working, low, streak, loadless ? "Repeat this variation" : `Hold at ${weightText}, one more try`,
    prefix + `Most sets fell short of ${low} reps (${repsText}). One tough day is normal: sleep, food, and stress all show up on the bar. `
      + `Repeat it next time. If it happens again, HIT will ${loadless ? "suggest an easier variation" : "lower the weight"}.`);
}

// ---------- Shareable settings (URL hash) ----------
export const DEFAULT_SETTINGS = { goal: "strength", experience: "intermediate", preset: "fullGym", days: 3, unit: "lb" };

export function encodeSettings(settings) {
  const { goal, experience, preset, days, unit } = settings;
  return "#" + new URLSearchParams({ goal, exp: experience, gear: preset, days: String(days), unit }).toString();
}

export function decodeSettings(hash) {
  const p = new URLSearchParams(String(hash || "").replace(/^#/, ""));
  const pickKey = (value, table, fallback) => (Object.hasOwn(table, value ?? "") ? value : fallback);
  const d = DEFAULT_SETTINGS;
  const days = Number.parseInt(p.get("days"), 10);
  return {
    goal: pickKey(p.get("goal"), GOALS, d.goal),
    experience: pickKey(p.get("exp"), EXPERIENCE, d.experience),
    preset: pickKey(p.get("gear"), PRESETS, d.preset),
    days: Number.isFinite(days) ? Math.min(DAY_MAX, Math.max(DAY_MIN, days)) : d.days,
    unit: p.get("unit") === "kg" ? "kg" : "lb",
  };
}
