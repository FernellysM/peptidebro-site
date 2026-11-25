// DOM layer. All logic lives in core.js; user labels go in through textContent only.
import { AREAS, BY_ID, ZONES, FIGURE } from "./areas.js";
import * as core from "./core.js";
import { APP_STORE_URL, HOME_URL, SITE_LINKS } from "./config.js";

const $ = (sel) => document.querySelector(sel);
const SVG = "http://www.w3.org/2000/svg";
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
function svg(tag, attrs = {}) {
  const node = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
}

// ---------- Storage ----------
let storageOK = true;
function readStored() {
  try { return localStorage.getItem(core.STORAGE_KEY); } catch { storageOK = false; return null; }
}
const loaded = core.parseStored(readStored());
let state = loaded.state ?? core.emptyState();
// While stored data cannot be read, nothing is written, so it is never overwritten by accident.
let blocked = loaded.status === "corrupt" || loaded.status === "unsupported";

function save() {
  if (blocked || !storageOK) return;
  try { localStorage.setItem(core.STORAGE_KEY, core.serialize(state)); }
  catch { storageOK = false; showNotice("This browser would not save the log. Entries stay until you close the page; export them to keep a copy."); }
}

// ---------- Notices ----------
function showNotice(text, ...actions) {
  const box = $("#notice");
  box.replaceChildren(el("p", { text }), ...actions);
  box.hidden = false;
}
function storedNotice() {
  const reason = loaded.status === "unsupported"
    ? "The log saved in this browser is from a different version of this page."
    : "The log saved in this browser could not be read.";
  const keep = el("button", { type: "button", class: "ghost", text: "Download the saved data" });
  keep.addEventListener("click", () => download("site-rotation-log-saved-data.txt", loaded.raw, "text/plain"));
  showNotice(`${reason} It has not been changed or deleted. Download it to keep a copy, or use Clear all data to start a new log.`, keep);
}

// ---------- Rendering ----------
const today = () => core.localToday();
const fmtDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });

function statusText(row) {
  const parts = [];
  if (row.isLastUsed) parts.push("Last used");
  if (row.isLongestRest) parts.push("Longest rest");
  parts.push(row.when);
  return parts.join(", ");
}

function drawFigure(target, view) {
  target.setAttribute("aria-hidden", "true");
  target.removeAttribute("role");
  const body = svg("g", { class: "figure" });
  for (const p of FIGURE) {
    body.append(p.shape === "circle" ? svg("circle", { cx: p.cx, cy: p.cy, r: p.r })
      : svg("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: p.rx }));
  }
  target.replaceChildren(body);
  for (const area of AREAS.filter((a) => a.view === view)) {
    const z = ZONES[area.id];
    const g = svg("g", { class: "zone", "data-area": area.id });
    g.append(svg("rect", { x: z.x, y: z.y, width: z.w, height: z.h, rx: 8 }));
    const t = svg("text", { x: z.x + z.w / 2, y: z.y + z.h / 2 + 5, "text-anchor": "middle" });
    t.textContent = area.id.startsWith("l-") ? "L" : "R";
    g.append(t);
    g.addEventListener("click", () => logArea(area.id));
    target.append(g);
  }
}

function buildList() {
  const list = $("#areas");
  for (const area of AREAS) {
    const button = el("button", { type: "button", "data-area": area.id },
      el("span", { class: "name", text: area.name }),
      el("span", { class: "side", text: area.view === "front" ? "Front" : "Back" }),
      el("span", { class: "state" }));
    button.addEventListener("click", () => logArea(area.id));
    list.append(el("li", {}, button));
  }
}

function render() {
  const rows = core.statuses(state, today());
  for (const row of rows) {
    const cls = row.isLastUsed ? "is-last" : row.isLongestRest ? "is-rest" : row.days === null ? "is-new" : "";
    for (const node of document.querySelectorAll(`[data-area="${row.area.id}"]`)) {
      node.classList.remove("is-last", "is-rest", "is-new");
      if (cls) node.classList.add(cls);
    }
    const button = $(`#areas [data-area="${row.area.id}"]`);
    button.querySelector(".state").textContent = statusText(row);
    button.setAttribute("aria-label", `Log ${row.area.name}. ${statusText(row)}.`);
    button.disabled = blocked;
  }
  const last = rows.find((r) => r.isLastUsed);
  const rest = rows.find((r) => r.isLongestRest);
  $("#sum-last").textContent = last ? `${last.area.name}, ${last.when.toLowerCase()}` : "Nothing logged yet";
  $("#sum-rest").textContent = rest ? `${rest.area.name}, ${rest.days === null ? "not logged yet" : rest.when.toLowerCase()}` : "-";
  renderHistory();
  $("#undo").disabled = blocked || state.entries.length === 0;
  for (const id of ["#csv", "#json", "#print"]) $(id).disabled = state.entries.length === 0;
  $("#f-date").max = today();
}

function renderHistory() {
  const entries = core.history(state);
  const body = $("#hist-body");
  body.replaceChildren();
  for (const e of entries) {
    const del = el("button", { type: "button", class: "link", text: "Delete", "aria-label": `Delete ${BY_ID[e.area].name} on ${e.date}` });
    del.disabled = blocked;
    del.addEventListener("click", () => {
      state = core.deleteEntry(state, e.id);
      save(); render();
      say(`Deleted ${BY_ID[e.area].name} on ${fmtDate(e.date)}.`);
      $("#hist-title").focus();
    });
    body.append(el("tr", {},
      el("td", { text: fmtDate(e.date) }),
      el("td", { text: BY_ID[e.area].name }),
      el("td", { class: "label", text: e.label }),
      el("td", { class: "act" }, del)));
  }
  $("#hist").hidden = entries.length === 0;
  $("#empty").hidden = entries.length > 0;
}

// ---------- Actions ----------
const say = (text) => {
  const live = $("#live");
  live.textContent = "";
  setTimeout(() => { live.textContent = text; }, 60);
};

function logArea(id) {
  if (blocked) return;
  const date = $("#f-date").value || today();
  try {
    state = core.addEntry(state, { date, area: id, label: $("#f-label").value }, today());
  } catch (err) {
    say(err.message);
    return;
  }
  save();
  $("#f-label").value = "";
  render();
  say(`Logged ${BY_ID[id].name} on ${fmtDate(date)}.`);
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = el("a", { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function wire() {
  $("#f-date").value = today();
  $("#undo").addEventListener("click", () => {
    const { state: next, removed } = core.undoLast(state);
    if (!removed) return;
    state = next;
    save(); render();
    say(`Removed ${BY_ID[removed.area].name} on ${fmtDate(removed.date)}.`);
  });
  $("#print").addEventListener("click", () => window.print());
  $("#csv").addEventListener("click", () => download(`site-rotation-log-${today()}.csv`, core.toCSV(state), "text/csv"));
  $("#json").addEventListener("click", () => download(`site-rotation-log-${today()}.json`, core.toJSON(state, today()), "application/json"));

  const confirm = $("#confirm");
  $("#clear").addEventListener("click", () => { confirm.hidden = false; $("#confirm-no").focus(); });
  $("#confirm-no").addEventListener("click", () => { confirm.hidden = true; $("#clear").focus(); });
  $("#confirm-yes").addEventListener("click", () => {
    try { localStorage.removeItem(core.STORAGE_KEY); } catch { /* storage unavailable: nothing stored */ }
    state = core.emptyState();
    blocked = false;
    $("#notice").hidden = true;
    confirm.hidden = true;
    render();
    say("All entries were deleted from this browser.");
    $("#clear").focus();
  });

  for (const a of document.querySelectorAll("[data-store]")) {
    a.href = APP_STORE_URL;
    a.rel = "noopener";
  }
  const home = document.querySelector("[data-home]");
  if (home && HOME_URL) home.href = HOME_URL;

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
  $("#hist-title").tabIndex = -1;
}

drawFigure($("#map-front"), "front");
drawFigure($("#map-back"), "back");
buildList();
wire();
if (blocked) storedNotice();
else if (!storageOK) showNotice("This browser is not allowing storage, so entries last only until you close the page. Export them to keep a copy.");
render();
