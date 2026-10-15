// Meldunki zwiadu (zadanie 005d, częstotliwość 005f): po serii pudeł z rzędu (próg losowany z REPORT_MISSES) gracz dostaje
// obszar REPORT_AREA×REPORT_AREA, w którym okręt przeciwnika był 1–REPORT_AGE_MAX pełnych rund wcześniej; z szansą
// 1 − REPORT_TRUE obszar losowy (pomyłka). Jednakowo dla obu stron, losowanie z RNG stanu (powtórki, PvP).
// Wzorzec: sim/partia.py give_report (MELDUNKI_PUDLA, „po 7-9 pudłach z rzędu”), seria w sim/gracz.py fire_at.

import { REPORT_MISSES, REPORT_AREA, REPORT_AGE_MAX, REPORT_TRUE, REPORT_TTL } from './data.js';
import { shipCells, isSunk } from './fleet.js';
import { rand, randInt, pick } from './rng.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const reportsOn = (game) => game.settings.reports === true;
const nowyProg = (game) => REPORT_MISSES[0] + randInt(game, REPORT_MISSES[1] - REPORT_MISSES[0] + 1);

/** Przy utworzeniu partii z meldunkami: historia, meldunki, seria pudeł i pierwszy próg każdego gracza (005f B1). */
export function initReports(game) {
  for (const p of game.players) Object.assign(p, { hist: [], reports: [], missStreak: 0, missGoal: nowyProg(game) });
}

/** Każdy strzał gracza `atk` po kolei: pudło +1, trafienie zeruje serię (także każdy strzał salwy osobno). */
export function countShot(game, atk, result) {
  if (!reportsOn(game)) return;
  const P = game.players[atk];
  P.missStreak = result === 'miss' ? P.missStreak + 1 : 0;
}

/** Położenia floty `owner` przed jej ruchem na początku tury: najnowszy zapis = położenie sprzed 1 rundy (B1). */
export function recordHistory(game, owner) {
  if (!reportsOn(game)) return;
  const P = game.players[owner];
  P.hist.push(P.ships.filter((s) => !isSunk(s)).map((s) => ({ id: s.id, cells: shipCells(s) })));
  if (P.hist.length > REPORT_AGE_MAX) P.hist.splice(0, P.hist.length - REPORT_AGE_MAX);
}

/** Na początku tury gracza `game.current`: meldunek, gdy seria pudeł osiągnęła próg i przeciwnik ma więcej niż jeden okręt. */
export function maybeReport(game, events) {
  if (!reportsOn(game)) return;
  const p = game.current, round = game.round, D = game.players[1 - p], A = game.players[p];
  if (A.missStreak < A.missGoal) return;
  const alive = new Set(D.ships.filter((s) => !isSunk(s)).map((s) => s.id));
  if (alive.size <= 1 || !D.hist.length) return;                 // ostatni okręt: bez podpowiedzi (B2)
  const age = Math.min(D.hist.length, 1 + randInt(game, REPORT_AGE_MAX));
  const cand = D.hist[D.hist.length - age].filter((e) => alive.has(e.id));
  const n = game.n, k = REPORT_AREA;
  let x, y, truth = false, shipId = null;
  if (cand.length && rand(game) < REPORT_TRUE) {
    const e = pick(game, cand), [cx, cy] = pick(game, e.cells);
    x = clamp(cx - randInt(game, k), 0, n - k);
    y = clamp(cy - randInt(game, k), 0, n - k);
    truth = true; shipId = e.id;
  } else {
    x = randInt(game, n - k + 1);
    y = randInt(game, n - k + 1);
  }
  A.reports.push({ round, age, x, y, size: k, truth, shipId });
  A.missStreak = 0; A.missGoal = nowyProg(game);                 // po meldunku seria od zera i nowy próg
  events.push({ to: p, type: 'report', round, age, x, y, size: k });
}

/** Meldunki gracza do widoku: bez prawdy; `active` gaśnie po REPORT_TTL rundach i od razu przy ostatnim okręcie przeciwnika. */
export function reportsView(game, role) {
  const last = game.players[1 - role].ships.filter((s) => !isSunk(s)).length <= 1;
  return game.players[role].reports.map((r) => ({ round: r.round, age: r.age, x: r.x, y: r.y, size: r.size,
    active: !last && game.round <= r.round + REPORT_TTL }));
}
