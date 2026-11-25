// Exercise data ported from ~/HIT/HIT/Domain/ExerciseCatalog.swift and Models/Enums.swift.
// Within each pattern, exercises are in preference order for plan building (same order as the Swift).
// Row: [id, name, pattern, equipment, load, muscles, cue]

const ROWS = [
  // Squat
  ["back-squat", "Back Squat", "squat", ["barbell", "rack"], "barbell", "Quads, glutes, trunk", "Brace hard before you descend, then drive the floor away."],
  ["front-squat", "Front Squat", "squat", ["barbell", "rack"], "barbell", "Quads, upper back", "Elbows high and chest proud through the whole rep."],
  ["leg-press", "Leg Press", "squat", ["machines"], "machine", "Quads, glutes", "Lower until your hips start to curl up, then press through mid-foot."],
  ["goblet-squat", "Goblet Squat", "squat", ["dumbbells"], "dumbbell", "Quads, glutes", "Hold the weight at your chest and sit down between your heels."],
  ["kb-goblet-squat", "Kettlebell Goblet Squat", "squat", ["kettlebell"], "kettlebell", "Quads, glutes", "Grip the horns, keep elbows inside the knees at the bottom."],
  ["tempo-squat", "Tempo Bodyweight Squat", "squat", [], "bodyweight", "Quads, glutes", "Three seconds down, one second pause, stand up fast."],
  // Hinge
  ["deadlift", "Deadlift", "hinge", ["barbell"], "barbell", "Hamstrings, glutes, back", "Pull the slack out of the bar, then push the floor away."],
  ["romanian-deadlift", "Romanian Deadlift", "hinge", ["barbell"], "barbell", "Hamstrings, glutes", "Push your hips back with soft knees. Keep the bar brushing your legs."],
  ["hip-thrust", "Barbell Hip Thrust", "hinge", ["barbell", "bench"], "barbell", "Glutes", "Chin tucked, ribs down, squeeze hard for a beat at the top."],
  ["db-rdl", "Dumbbell Romanian Deadlift", "hinge", ["dumbbells"], "dumbbell", "Hamstrings, glutes", "Slide the dumbbells down your thighs until you feel a deep stretch."],
  ["db-hip-thrust", "Dumbbell Hip Thrust", "hinge", ["dumbbells", "bench"], "dumbbell", "Glutes", "Dumbbell on your hips, drive through your heels, pause at the top."],
  ["kb-swing", "Kettlebell Swing", "hinge", ["kettlebell"], "kettlebell", "Glutes, hamstrings", "Hike the bell back, then snap your hips forward. Arms just guide it."],
  ["leg-curl", "Seated Leg Curl", "hinge", ["machines"], "machine", "Hamstrings", "Lean forward slightly and control the weight back up."],
  ["band-good-morning", "Band Good Morning", "hinge", ["bands"], "band", "Hamstrings, glutes", "Band behind your neck, hinge until your torso is near parallel."],
  ["glute-bridge", "Single-Leg Glute Bridge", "hinge", [], "bodyweight", "Glutes, hamstrings", "Drive through one heel and hold the top for a full second."],
  // Single leg
  ["bulgarian-split-squat", "Bulgarian Split Squat", "singleLeg", ["dumbbells", "bench"], "dumbbell", "Quads, glutes", "Rear foot on the bench. Drop straight down, front heel stays planted."],
  ["walking-lunge", "Walking Lunge", "singleLeg", ["dumbbells"], "dumbbell", "Quads, glutes", "Long steps, back knee kisses the floor, stay tall."],
  ["step-up", "Dumbbell Step-Up", "singleLeg", ["dumbbells", "bench"], "dumbbell", "Quads, glutes", "Push through the top foot only. No bouncing off the back leg."],
  ["reverse-lunge", "Reverse Lunge", "singleLeg", [], "bodyweight", "Quads, glutes", "Step back, drop the back knee, drive up through the front foot."],
  ["split-squat", "Split Squat", "singleLeg", [], "bodyweight", "Quads, glutes", "Stay in a split stance and move straight up and down."],
  // Horizontal push
  ["bench-press", "Bench Press", "horizontalPush", ["barbell", "bench", "rack"], "barbell", "Chest, triceps, shoulders", "Shoulder blades pinned, touch your lower chest, press up and back."],
  ["db-bench-press", "Dumbbell Bench Press", "horizontalPush", ["dumbbells", "bench"], "dumbbell", "Chest, triceps", "Lower until the dumbbells are level with your chest, forearms vertical."],
  ["incline-db-press", "Incline Dumbbell Press", "horizontalPush", ["dumbbells", "bench"], "dumbbell", "Upper chest, shoulders", "Bench at 30 degrees. Press up and slightly in."],
  ["machine-chest-press", "Machine Chest Press", "horizontalPush", ["machines"], "machine", "Chest, triceps", "Handles at mid-chest height. Full stretch, full lockout."],
  ["cable-fly", "Cable Fly", "horizontalPush", ["cable"], "cable", "Chest", "Soft elbows, hug a big tree, squeeze at the middle."],
  ["push-up", "Push-Up", "horizontalPush", [], "bodyweight", "Chest, triceps, core", "One straight line from head to heels. Chest touches first."],
  // Vertical push
  ["overhead-press", "Overhead Press", "verticalPush", ["barbell", "rack"], "barbell", "Shoulders, triceps", "Squeeze your glutes, press, then push your head through."],
  ["seated-db-press", "Seated Dumbbell Press", "verticalPush", ["dumbbells", "bench"], "dumbbell", "Shoulders, triceps", "Back against the pad, press without flaring your ribs."],
  ["machine-shoulder-press", "Machine Shoulder Press", "verticalPush", ["machines"], "machine", "Shoulders, triceps", "Handles start at chin height. Press to full lockout."],
  ["standing-db-press", "Standing Dumbbell Press", "verticalPush", ["dumbbells"], "dumbbell", "Shoulders, triceps, core", "Brace like a plank and press straight up."],
  ["kb-press", "Half-Kneeling Kettlebell Press", "verticalPush", ["kettlebell"], "kettlebell", "Shoulders, core", "Down knee on the same side as the bell. Press in a straight line."],
  ["band-press", "Band Overhead Press", "verticalPush", ["bands"], "band", "Shoulders, triceps", "Stand on the band and press to full lockout."],
  ["pike-push-up", "Pike Push-Up", "verticalPush", [], "bodyweight", "Shoulders, triceps", "Hips high, lower your head to a spot in front of your hands."],
  // Horizontal pull
  ["barbell-row", "Barbell Row", "horizontalPull", ["barbell"], "barbell", "Upper back, lats", "Hinge to about 45 degrees and row to your lower ribs."],
  ["cable-row", "Seated Cable Row", "horizontalPull", ["cable"], "cable", "Upper back, lats", "Tall chest, pull elbows past your ribs, control the return."],
  ["chest-supported-row", "Chest-Supported Dumbbell Row", "horizontalPull", ["dumbbells", "bench"], "dumbbell", "Upper back", "Chest on an incline bench, row with no body English."],
  ["one-arm-db-row", "One-Arm Dumbbell Row", "horizontalPull", ["dumbbells"], "dumbbell", "Lats, upper back", "Pull the dumbbell toward your hip, not your armpit."],
  ["machine-row", "Machine Row", "horizontalPull", ["machines"], "machine", "Upper back", "Chest on the pad, drive elbows back and pause."],
  ["inverted-row", "Inverted Row", "horizontalPull", ["barbell", "rack"], "bodyweight", "Upper back, biceps", "Body stiff as a plank, pull your chest to the bar."],
  ["band-row", "Band Row", "horizontalPull", ["bands"], "band", "Upper back", "Anchor at chest height. Squeeze your shoulder blades together."],
  ["doorframe-row", "Doorframe Row", "horizontalPull", [], "bodyweight", "Upper back, biceps", "Grip a sturdy frame, lean back, row yourself in."],
  // Vertical pull
  ["pull-up", "Pull-Up", "verticalPull", ["pullUpBar"], "bodyweight", "Lats, upper back", "Start from a dead hang and drive your elbows to your ribs."],
  ["lat-pulldown", "Lat Pulldown", "verticalPull", ["cable"], "cable", "Lats", "Pull the bar to your upper chest, lean back only slightly."],
  ["chin-up", "Chin-Up", "verticalPull", ["pullUpBar"], "bodyweight", "Lats, biceps", "Palms facing you, chest to the bar, full hang each rep."],
  ["band-pulldown", "Band Lat Pulldown", "verticalPull", ["bands"], "band", "Lats", "Anchor the band high and pull your elbows down to your sides."],
  ["prone-pulldown", "Prone Floor Pulldown", "verticalPull", [], "bodyweight", "Lats, upper back", "Face down, arms overhead. Lift and pull your elbows to your ribs."],
  // Biceps
  ["db-curl", "Dumbbell Curl", "biceps", ["dumbbells"], "dumbbell", "Biceps", "Elbows pinned at your sides. Lower slowly."],
  ["barbell-curl", "Barbell Curl", "biceps", ["barbell"], "barbell", "Biceps", "No swinging. If you have to lean back, it is too heavy."],
  ["cable-curl", "Cable Curl", "biceps", ["cable"], "cable", "Biceps", "Constant tension. Squeeze at the top."],
  ["hammer-curl", "Hammer Curl", "biceps", ["dumbbells"], "dumbbell", "Biceps, forearms", "Thumbs up, curl straight up in front of you."],
  ["band-curl", "Band Curl", "biceps", ["bands"], "band", "Biceps", "Stand on the band, curl, and fight it on the way down."],
  // Triceps
  ["cable-pressdown", "Cable Pressdown", "triceps", ["cable"], "cable", "Triceps", "Elbows glued to your sides. Lock out every rep."],
  ["db-overhead-extension", "Overhead Dumbbell Extension", "triceps", ["dumbbells"], "dumbbell", "Triceps", "Lower behind your head for a deep stretch, then extend."],
  ["skull-crusher", "Skull Crusher", "triceps", ["barbell", "bench"], "barbell", "Triceps", "Lower the bar behind your forehead, elbows pointed up."],
  ["close-grip-push-up", "Close-Grip Push-Up", "triceps", [], "bodyweight", "Triceps, chest", "Hands under your shoulders, elbows brush your ribs."],
  ["band-pressdown", "Band Pressdown", "triceps", ["bands"], "band", "Triceps", "Anchor high, press down to full lockout."],
  // Core
  ["hanging-knee-raise", "Hanging Knee Raise", "core", ["pullUpBar"], "bodyweight", "Abs, hip flexors", "Curl your pelvis up, do not just lift your knees."],
  ["pallof-press", "Pallof Press", "core", ["cable"], "cable", "Obliques, deep core", "Press out and resist the twist. Count reps per side."],
  ["dead-bug", "Dead Bug", "core", [], "bodyweight", "Deep core", "Lower back glued to the floor. Move slowly. Reps per side."],
  ["band-pallof-press", "Band Pallof Press", "core", ["bands"], "band", "Obliques, deep core", "Anchor at chest height, press out, resist rotation."],
];

export const EXERCISES = ROWS.map(([id, name, pattern, equipment, load, muscles, cue]) =>
  ({ id, name, pattern, equipment, load, muscles, cue }));

export const BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const EQUIPMENT = ["barbell", "rack", "bench", "dumbbells", "kettlebell", "cable", "machines", "pullUpBar", "bands"];

export const PRESETS = {
  fullGym: { title: "Full gym", equipment: EQUIPMENT },
  homeGym: { title: "Home gym", equipment: ["barbell", "rack", "bench", "dumbbells", "pullUpBar"] },
  dumbbells: { title: "Dumbbells", equipment: ["dumbbells", "bench"] },
  minimal: { title: "Bodyweight", equipment: ["pullUpBar", "bands"] },
};

export const GOALS = {
  strength: { title: "Get stronger", detail: "Heavier loads and lower reps. Your main lifts lead every session." },
  muscle: { title: "Build muscle", detail: "Moderate loads with more reps and sets, so you grow while getting stronger." },
  general: { title: "Strong and fit", detail: "Balanced strength for everyday life, in sessions that stay efficient." },
};

export const EXPERIENCE = {
  beginner: { title: "New to lifting", level: "Beginner", detail: "Less than 6 months of consistent training.", rir: 3 },
  intermediate: { title: "Some experience", level: "Intermediate", detail: "6 months to 2 years. You know the main lifts.", rir: 2 },
  advanced: { title: "Experienced", level: "Advanced", detail: "2+ years of structured training. You know your numbers.", rir: 1 },
};

export const PHASES = [
  { title: "Foundation", detail: "Find honest working weights. Stop every set with a couple of clean reps left, so HIT has a reliable baseline." },
  { title: "Build", detail: "Same structure, more output. Beat last week by a rep or a small jump in weight." },
  { title: "Push", detail: "Main lifts get an extra set. This is the hardest week of the block, and where most progress is earned." },
  { title: "Deload", detail: "Fewer sets at about 90% of your working weights. Fatigue clears so you start the next block stronger." },
];

export const ROLE_TITLES = { primary: "Main lift", secondary: "Secondary", accessory: "Accessory" };

export const LOWER_BODY = new Set(["squat", "hinge", "singleLeg"]);
