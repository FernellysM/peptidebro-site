// Area data ported from ~/PeptideBroiOS/Models/InjectionSite.swift (InjectionRules.sites: id, siteName, view)
// and Models/RotationScene.swift (RotationArea.name: "Left shoulder" and so on). Same order as the app.
// `siteName` is the string the app stores and matches after normalising, so it is what the CSV export writes.

export const AREAS = [
  { id: "l-delt", siteName: "l delt", name: "Left shoulder", view: "front" },
  { id: "r-delt", siteName: "r delt", name: "Right shoulder", view: "front" },
  { id: "l-abd", siteName: "l abdomen", name: "Left abdomen", view: "front" },
  { id: "r-abd", siteName: "r abdomen", name: "Right abdomen", view: "front" },
  { id: "l-thigh", siteName: "l thigh", name: "Left thigh", view: "front" },
  { id: "r-thigh", siteName: "r thigh", name: "Right thigh", view: "front" },
  { id: "l-glute", siteName: "l glute", name: "Left glute", view: "back" },
  { id: "r-glute", siteName: "r glute", name: "Right glute", view: "back" },
];

export const AREA_IDS = AREAS.map((a) => a.id);
export const BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a]));

// Flat diagram zones in a 200 x 420 viewBox. The front view faces you, so the person's left
// is on your right; the back view shows the person's left on your left. Each zone is also
// printed with an L or R so the side never depends on reading the picture.
export const ZONES = {
  "r-delt": { x: 30, y: 82, w: 26, h: 42 },
  "l-delt": { x: 144, y: 82, w: 26, h: 42 },
  "r-abd": { x: 66, y: 150, w: 32, h: 46 },
  "l-abd": { x: 102, y: 150, w: 32, h: 46 },
  "r-thigh": { x: 64, y: 238, w: 32, h: 66 },
  "l-thigh": { x: 104, y: 238, w: 32, h: 66 },
  "l-glute": { x: 64, y: 192, w: 34, h: 46 },
  "r-glute": { x: 102, y: 192, w: 34, h: 46 },
};

// The plain geometric figure behind the zones: head, torso, two arms, two legs.
export const FIGURE = [
  { shape: "circle", cx: 100, cy: 40, r: 24 },
  { shape: "rect", x: 60, y: 72, w: 80, h: 156, rx: 18 },
  { shape: "rect", x: 30, y: 78, w: 26, h: 132, rx: 12 },
  { shape: "rect", x: 144, y: 78, w: 26, h: 132, rx: 12 },
  { shape: "rect", x: 62, y: 222, w: 36, h: 176, rx: 14 },
  { shape: "rect", x: 102, y: 222, w: 36, h: 176, rx: 14 },
];
