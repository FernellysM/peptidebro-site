// DOM layer. All logic lives in core.js; all text goes in through textContent.
import { BY_ID, PRESETS, GOALS, EXPERIENCE, ROLE_TITLES, EQUIPMENT } from "./catalog.js";
import * as core from "./core.js";
import { APP_STORE_URL, SITE_LINKS } from "./config.js";

const $ = (sel, root = document) => root.querySelector(sel);
function el(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  for (const kid of kids) if (kid != null) node.append(kid);
  return node;
}

const GEAR_NAMES = { barbell: "barbell", rack: "rack", bench: "bench", dumbbells: "dumbbells", kettlebell: "kettlebells", cable: "cable", machines: "machines", pullUpBar: "pull-up bar", bands: "bands" };
const OPTIONS = {
  goal: Object.entries(GOALS).map(([v, g]) => [v, g.title]),
  experience: Object.entries(EXPERIENCE).map(([v, x]) => [v, x.title]),
  preset: Object.entries(PRESETS).map(([v, p]) => [v, p.title]),
  days: [2, 3, 4, 5, 6].map((d) => [String(d), String(d)]),
  unit: [["lb", "lb"], ["kg", "kg"]],
};

let settings = core.decodeSettings(location.hash);
const form = $("#plan-form");

function buildSegments() {
  for (const group of form.querySelectorAll(".seg")) {
    const name = group.dataset.name;
    group.setAttribute("role", "radiogroup");
    for (const [value, label] of OPTIONS[name]) {
      const input = el("input", { type: "radio", name, value, id: `${name}-${value}` });
      input.checked = String(settings[name]) === value;
      group.append(el("label", { for: `${name}-${value}`, class: "pill" }, input, el("span", { text: label })));
    }
  }
  form.addEventListener("change", () => {
    const data = new FormData(form);
    settings = { goal: data.get("goal"), experience: data.get("experience"), preset: data.get("preset"), days: Number(data.get("days")), unit: data.get("unit") };
    history.replaceState(null, "", core.encodeSettings(settings));
    renderPlan();
  });
}

const restText = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

function sessionTable(items) {
  const body = el("tbody");
  for (const it of items) {
    const ex = BY_ID[it.exerciseID];
    const range = it.repLow === it.repHigh ? `${it.repLow}` : `${it.repLow}-${it.repHigh}`;
    body.append(el("tr", { class: it.role },
      el("th", { scope: "row" }, el("span", { class: "ex", text: ex.name }), el("span", { class: "role", text: `${ROLE_TITLES[it.role]} · ${ex.muscles}` })),
      el("td", { class: "num", text: String(it.sets) }),
      el("td", { class: "num", text: range }),
      el("td", { class: "num sm", text: restText(it.rest) }),
      el("td", { class: "num sm", text: String(it.rir) })));
  }
  const head = el("tr", {}, ...["Exercise", "Sets", "Reps", "Rest", "RIR"].map((h) => el("th", { scope: "col", text: h })));
  return el("table", { class: "sets" }, el("thead", {}, head), body);
}

function renderPlan() {
  const bp = core.blueprint(settings);
  const equipment = PRESETS[settings.preset].equipment;
  $("#goal-detail").textContent = GOALS[settings.goal].detail;
  $("#exp-detail").textContent = EXPERIENCE[settings.experience].detail;
  $("#gear-detail").textContent = equipment.length === EQUIPMENT.length ? "Everything: barbell, rack, bench, dumbbells, kettlebells, cable, machines, pull-up bar, bands." : `Uses: ${equipment.map((e) => GEAR_NAMES[e]).join(", ")}.`;

  const root = $("#plan");
  root.replaceChildren();
  root.append(el("header", { class: "plan-head" },
    el("p", { class: "kicker", text: "Your first block" }),
    el("h2", { text: bp.name }),
    el("p", { class: "summary", text: bp.summary })));

  const nav = el("nav", { class: "weeks-nav", "aria-label": "Weeks" });
  for (const w of bp.weeks) nav.append(el("a", { href: `#week-${w.week}`, "data-week": "" }, el("b", { text: `W${w.week}` }), el("span", { text: w.phase })));
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    $(a.getAttribute("href")).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  root.append(nav, el("p", { class: "units-note", text: `Weights are yours to set in ${settings.unit}: start where every set stops with the reps in reserve (RIR) shown.` }));

  for (const w of bp.weeks) {
    const notes = [...new Set(w.workouts.flatMap((wo) => wo.items.map((i) => i.note)))];
    const week = el("section", { class: `week w${w.week}`, id: `week-${w.week}`, "aria-labelledby": `wk-${w.week}` },
      el("h3", { id: `wk-${w.week}` }, el("span", { class: "wnum", text: String(w.week) }), el("span", { text: `Week ${w.week}: ${w.phase}` })),
      el("p", { class: "detail", text: w.detail }),
      el("ul", { class: "notes" }, ...notes.map((n) => el("li", { text: n }))));
    const grid = el("div", { class: "sessions" });
    for (const wo of w.workouts) {
      grid.append(el("article", { class: "session" },
        el("h4", {}, el("span", { class: "day", text: `Day ${wo.dayIndex + 1}` }), el("span", { text: wo.title })),
        el("p", { class: "focus", text: wo.focus }),
        sessionTable(wo.items)));
    }
    week.append(grid);
    root.append(week);
  }
  root.append(el("p", { class: "pro-note", text: "This is your first four-week block. In the app, HIT Pro builds the blocks after it, plus swaps and plan editing." }),
    el("p", { class: "print-row" }, el("button", { type: "button", id: "print", text: "Print this plan" })));
  $("#print").addEventListener("click", () => window.print());
}

// ---------- Checker ----------
const check = $("#check-form");
const F = new Proxy({}, { get: (_, name) => check.elements.namedItem(name) });
const setsBody = $("#c-sets");
const verdict = $("#verdict");

function addSetRow(reps = "") {
  const n = setsBody.children.length + 1;
  if (n > 10) return;
  const input = el("input", { type: "number", inputmode: "numeric", min: "0", max: "100", name: "rep", "aria-label": `Reps on set ${n}`, value: String(reps) });
  setsBody.append(el("tr", {}, el("th", { scope: "row", class: "num sm", text: String(n) }), el("td", {}, input)));
}

function syncLoad() {
  const loadless = core.isRepProgressed(core.EXERCISE_TYPES[F.type.value]);
  F.weight.disabled = loadless;
  if (loadless) F.weight.value = "0";
}

function showVerdict(nodes, cls) {
  verdict.hidden = false;
  verdict.className = `verdict ${cls}`;
  verdict.replaceChildren(...nodes);
  verdict.focus();
}

function decide(event) {
  event.preventDefault();
  const low = Number.parseInt(F.low.value, 10);
  const high = Number.parseInt(F.high.value, 10);
  const unit = F.unit.value;
  const weight = Number.parseFloat(F.weight.value) || 0;
  const reps = [...setsBody.querySelectorAll("input")].map((i) => Number.parseInt(i.value, 10) || 0);
  if (!(low >= 1 && high >= low)) return showVerdict([el("p", { text: "Set a rep range where the low end is at least 1 and not above the high end." })], "none");
  const rec = core.recommend({
    exercise: core.EXERCISE_TYPES[F.type.value], repLow: low, repHigh: high, unit, experience: F.experience.value,
    sets: reps.map((r) => ({ weightKg: core.toKg(weight, unit), reps: r })), previousMissStreak: F.streak.checked ? 1 : 0,
  });
  if (!rec) {
    const msg = reps.some((r) => r > 0) ? "Enter the weight you used. A loaded lift needs a weight to progress from." : "Enter the reps you hit on at least one set.";
    return showVerdict([el("p", { text: msg })], "none");
  }
  const next = rec.nextWeightKg == null ? null
    : el("div", {}, el("dt", { text: "Next weight" }), el("dd", { text: core.formatKg(rec.nextWeightKg, unit, true) }));
  showVerdict([
    el("p", { class: "outcome", text: rec.outcome }),
    el("p", { class: "headline", text: rec.headline }),
    el("dl", { class: "next" }, next,
      el("div", {}, el("dt", { text: "Rep target" }), el("dd", { text: `${rec.nextRepTarget}+` }))),
    el("p", { class: "reason", text: rec.reason }),
  ], rec.action);
}

function initChecker() {
  for (const [v, t] of Object.entries(core.EXERCISE_TYPES)) F.type.append(el("option", { value: v, text: t.title }));
  for (const [v, x] of Object.entries(EXPERIENCE)) F.experience.append(el("option", { value: v, text: x.title }));
  [6, 6, 6, 6].forEach((r) => addSetRow(r));
  verdict.tabIndex = -1;
  F.type.addEventListener("change", syncLoad);
  $("#add-set").addEventListener("click", () => addSetRow());
  $("#remove-set").addEventListener("click", () => { if (setsBody.children.length > 1) setsBody.lastElementChild.remove(); });
  check.addEventListener("submit", decide);
}

for (const a of document.querySelectorAll("[data-store]")) a.href = APP_STORE_URL;

// Links back to the host site. An empty list removes the row.
const siteLinks = document.querySelector("[data-site-links]");
if (siteLinks) {
  if (!SITE_LINKS.length) siteLinks.remove();
  SITE_LINKS.forEach(([label, href], i) => {
    if (i) siteLinks.append(" \u00b7 ");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    siteLinks.append(a);
  });
}
// The skip link must not replace the settings hash, or the share link is lost.
$(".skip").addEventListener("click", (e) => { e.preventDefault(); $("#plan").focus(); });
initChecker();
buildSegments();
renderPlan();
F.experience.value = settings.experience; // checker starts from the plan settings, then stays the user's own
F.unit.value = settings.unit;
window.addEventListener("hashchange", () => {
  if (!location.hash.includes("=")) return; // in-page anchors such as the skip link
  const next = core.decodeSettings(location.hash);
  if (core.encodeSettings(next) === core.encodeSettings(settings)) return;
  settings = next;
  for (const [name, value] of Object.entries(settings)) {
    const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  }
  renderPlan();
});
