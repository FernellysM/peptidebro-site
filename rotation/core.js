// Pure logic, no DOM. Entries, area statuses, longest rest, CSV and JSON export, storage.
// Every function that needs "today" takes it as a YYYY-MM-DD string so tests can pin it.
import { AREAS, AREA_IDS, BY_ID } from "./areas.js";

export const STORAGE_KEY = "fernlabs.siteRotationLog";
export const VERSION = 1;
export const LABEL_MAX = 40;

// ---------- Dates ----------
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real calendar date written YYYY-MM-DD. */
export function isValidDate(text) {
  const m = DATE_RE.exec(String(text));
  if (!m) return false;
  const [y, mo, d] = m.slice(1).map(Number);
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

/** Whole days since 1970-01-01, computed in UTC so time zones and DST never shift the count. */
export function dayNumber(text) {
  const [y, mo, d] = DATE_RE.exec(text).slice(1).map(Number);
  return Date.UTC(y, mo - 1, d) / 86400000;
}

export const daysBetween = (from, to) => dayNumber(to) - dayNumber(from);

/** Today in the viewer's local calendar (never toISOString, which is UTC). */
export function localToday(now = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function agoText(days) {
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

// ---------- Labels ----------
/** Trims a user label. Returns null when it is longer than LABEL_MAX characters. */
export function cleanLabel(text) {
  const label = String(text ?? "").trim();
  return Array.from(label).length > LABEL_MAX ? null : label;
}

// ---------- Entries ----------
export const emptyState = () => ({ version: VERSION, seq: 0, entries: [] });

/** Returns a new state with the entry added, or throws a RangeError with a message for the page. */
export function addEntry(state, { date, area, label = "" }, today) {
  if (!BY_ID[area]) throw new RangeError("Choose an area.");
  if (!isValidDate(date)) throw new RangeError("Enter a date as YYYY-MM-DD.");
  if (daysBetween(date, today) < 0) throw new RangeError("The date cannot be after today.");
  const clean = cleanLabel(label);
  if (clean === null) throw new RangeError(`Keep the label to ${LABEL_MAX} characters.`);
  const seq = state.seq + 1;
  const entry = { id: `e${seq}`, seq, date, area, label: clean };
  return { ...state, seq, entries: [...state.entries, entry] };
}

/** Removes the entry logged most recently (highest sequence), whatever its date. */
export function undoLast(state) {
  if (state.entries.length === 0) return { state, removed: null };
  const removed = state.entries.reduce((a, b) => (b.seq > a.seq ? b : a));
  return { state: { ...state, entries: state.entries.filter((e) => e !== removed) }, removed };
}

export function deleteEntry(state, id) {
  return { ...state, entries: state.entries.filter((e) => e.id !== id) };
}

/** Newest first: by date, then by the order entries were logged. */
const newer = (a, b) => (a.date === b.date ? b.seq - a.seq : a.date < b.date ? 1 : -1);
export const history = (state) => [...state.entries].sort(newer);

// ---------- Status ----------
/**
 * One row per area, in the app's area order. `isLastUsed` marks the area of the newest entry
 * (date, then logging order). `isLongestRest` marks one other area: never logged first, then
 * the oldest last date, then area order. Entries dated after today are ignored, as in the app.
 */
export function statuses(state, today) {
  const usable = state.entries.filter((e) => BY_ID[e.area] && isValidDate(e.date) && daysBetween(e.date, today) >= 0);
  const latest = new Map();
  for (const e of usable) {
    const prev = latest.get(e.area);
    if (!prev || newer(e, prev) < 0) latest.set(e.area, e);
  }
  const newest = history({ entries: usable })[0];
  const rows = AREAS.map((area, order) => {
    const last = latest.get(area.id);
    const days = last ? daysBetween(last.date, today) : null;
    return {
      area, order, lastDate: last?.date ?? null, days,
      when: days === null ? "Not logged yet" : agoText(days),
      isLastUsed: newest?.area === area.id, isLongestRest: false,
    };
  });
  const rest = rows.filter((r) => !r.isLastUsed).sort((a, b) => {
    if (a.lastDate === b.lastDate) return a.order - b.order;
    if (a.lastDate === null) return -1;
    if (b.lastDate === null) return 1;
    return a.lastDate < b.lastDate ? -1 : 1;
  })[0];
  if (rest) rest.isLongestRest = true;
  return rows;
}

// ---------- Export ----------
/** Quotes every field and doubles inner quotes, the same rule as CSVTable.escape in the app. */
export const csvField = (text) => `"${String(text).replace(/"/g, '""')}"`;

/** Columns: date, site, notes. Headers match the app's import aliases; there is no amount column. */
export function toCSV(state) {
  const rows = [["date", "site", "notes"].join(",")];
  for (const e of history(state)) rows.push([e.date, BY_ID[e.area].siteName, e.label].map(csvField).join(","));
  return rows.join("\n") + "\n";
}

export function toJSON(state, today) {
  return JSON.stringify({
    format: "site-rotation-log", version: VERSION, exported: today,
    entries: history(state).map((e) => ({ date: e.date, area: e.area, areaName: BY_ID[e.area].name, label: e.label })),
  }, null, 2) + "\n";
}

// ---------- Storage ----------
export const serialize = (state) => JSON.stringify({ version: VERSION, seq: state.seq, entries: state.entries });

const validEntry = (e) => e && typeof e === "object" && typeof e.id === "string" && Number.isInteger(e.seq) && e.seq > 0 &&
  AREA_IDS.includes(e.area) && isValidDate(e.date) && typeof e.label === "string" && cleanLabel(e.label) === e.label;

/**
 * Reads the stored string. Never throws. Status is "empty" (nothing stored), "ok", "corrupt"
 * (unreadable) or "unsupported" (another version). Only "empty" and "ok" carry a usable state;
 * for the others the caller keeps the raw text and must not overwrite it without asking.
 */
export function parseStored(raw) {
  if (raw === null || raw === undefined || raw === "") return { status: "empty", state: emptyState() };
  let data;
  try { data = JSON.parse(raw); } catch { return { status: "corrupt", raw }; }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { status: "corrupt", raw };
  if (data.version !== VERSION) return { status: "unsupported", raw, version: data.version };
  if (!Array.isArray(data.entries) || !Number.isInteger(data.seq) || !data.entries.every(validEntry)) return { status: "corrupt", raw };
  const ids = new Set(data.entries.map((e) => e.id));
  if (ids.size !== data.entries.length || data.entries.some((e) => e.seq > data.seq)) return { status: "corrupt", raw };
  const entries = data.entries.map(({ id, seq, date, area, label }) => ({ id, seq, date, area, label }));
  return { status: "ok", state: { version: VERSION, seq: data.seq, entries } };
}
