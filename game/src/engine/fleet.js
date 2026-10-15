// Okręty, pola, rozstawienie i ruch. Odpowiedniki: statki_sim.py Fleet.can_place, move_fleet, make_pattern.
// Różnica świadoma (DECISIONS 11.10, D2): żaden segment, także już trafiony, nie wjeżdża na ostrzelane pole.

import { PATTERNS, PATTERN_ALONG, PATTERN_ACROSS, CARRIER, CARRIER_TURN_P, UNSHOT, MISS } from './data.js';
import { rand, pick, shuffle } from './rng.js';
import { fail } from './errors.js';

export const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
export const idx = (n, x, y) => y * n + x;

/** Pola okrętu w kolejności segmentów (jak Ship.cells w symulatorze). */
export function shipCells(ship, x = ship.x, y = ship.y) {
  const out = [];
  for (let i = 0; i < ship.length; i++) {
    for (let j = 0; j < ship.width; j++) out.push(ship.horiz ? [x + i, y + j] : [x + j, y + i]);
  }
  return out;
}

export const isSunk = (ship) => ship.hits.every(Boolean);
export const isMobile = (ship) => !ship.immobile && !isSunk(ship);
export const intact = (ship) => ship.hits.filter((h) => !h).length;

/** Mapa zajętości: indeks pola -> id okrętu. */
export function occupancy(n, ships) {
  const occ = new Array(n * n).fill(null);
  for (const s of ships) for (const [x, y] of shipCells(s)) occ[idx(n, x, y)] = s.id;
  return occ;
}

/** Kroki wzoru patrolu (make_pattern z symulatora). */
export function patternSteps(kind, horiz, along, across) {
  const ax = horiz ? [1, 0] : [0, 1];
  const pp = horiz ? [0, 1] : [1, 0];
  const a = [ax[0] * along, ax[1] * along], p = [pp[0] * across, pp[1] * across];
  const na = [-a[0], -a[1]], np = [-p[0], -p[1]];
  const rep = (v, k) => Array.from({ length: k }, () => v);
  if (kind === 'skraj') return [...rep(a, PATTERN_ALONG), ...rep(p, PATTERN_ACROSS), ...rep(na, PATTERN_ALONG), ...rep(np, PATTERN_ACROSS)];
  if (kind === 'zygzak') {
    const fwd = [], back = [];
    for (let i = 0; i < PATTERN_ALONG; i++) fwd.push(a, i % 2 === 0 ? p : np);
    for (let i = 0; i < PATTERN_ALONG; i++) back.push(na, i % 2 === 0 ? p : np);
    return [...fwd, ...back];
  }
  return [...rep(p, PATTERN_ACROSS), ...rep(np, PATTERN_ACROSS)];   // dryf
}

/**
 * Czy okręt może stanąć w (nx, ny)? Nie na innych okrętach. Na ostrzelane pole wolno tylko:
 * w Hard na pudło; albo już trafionym segmentem na pole, które okręt sam zajmuje (D2).
 * Nietrafiony segment nigdy nie staje na ostrzelanym polu innym niż pudło w Hard – inaczej okręt
 * byłby nie do zatopienia (w to pole nie da się już strzelić).
 */
export function canPlace(n, ships, shots, hard, ship, nx, ny, occ = occupancy(n, ships)) {
  const own = new Set(shipCells(ship).map(([x, y]) => idx(n, x, y)));
  const cells = shipCells(ship, nx, ny);
  for (let seg = 0; seg < cells.length; seg++) {
    const [x, y] = cells[seg];
    if (x < 0 || y < 0 || x >= n || y >= n) return false;
    const i = idx(n, x, y);
    if (occ[i] !== null && occ[i] !== ship.id) return false;
    if (shots[i] === UNSHOT || (hard && shots[i] === MISS)) continue;
    if (!(own.has(i) && ship.hits[seg])) return false;
  }
  return true;
}

/** Przesunięcie okrętu (bez sprawdzania; najpierw canPlace). */
export function moveShip(ship, nx, ny) {
  ship.x = nx;
  ship.y = ny;
}

/** Ruch floty na początku tury przeciwnika (move_fleet). Zwraca listę przesunięć. */
export function moveFleet(game, owner) {
  const P = game.players[owner];
  const n = game.n, hard = game.settings.hard;
  const order = shuffle(game, P.ships.map((s, i) => i));
  const moves = [];
  for (const i of order) {
    const s = P.ships[i];
    if (!isMobile(s)) continue;
    const occ = occupancy(n, P.ships);
    const ok = (dx, dy) => canPlace(n, P.ships, P.shots, hard, s, s.x + dx, s.y + dy, occ);
    if (s.roam) {
      let d = s.roam;
      if (rand(game) < CARRIER_TURN_P || !ok(d[0], d[1])) {
        const opts = DIRS.filter((o) => (o[0] !== d[0] || o[1] !== d[1]) && ok(o[0], o[1]));
        if (ok(d[0], d[1])) opts.push(d);
        if (!opts.length) continue;
        d = pick(game, opts);
        s.roam = [d[0], d[1]];
      }
      moveShip(s, s.x + d[0], s.y + d[1]);
      moves.push({ id: s.id, x: s.x, y: s.y });
      continue;
    }
    const pt = s.pattern, L = pt.steps.length;
    for (const dir of [pt.dir, -pt.dir]) {
      let step, nidx;
      if (dir === 1) { step = pt.steps[pt.idx]; nidx = (pt.idx + 1) % L; }
      else { nidx = (pt.idx - 1 + L) % L; step = [-pt.steps[nidx][0], -pt.steps[nidx][1]]; }
      if (ok(step[0], step[1])) {
        moveShip(s, s.x + step[0], s.y + step[1]);
        pt.idx = nidx; pt.dir = dir;
        moves.push({ id: s.id, x: s.x, y: s.y });
        break;
      }
    }
  }
  return moves;
}

/** Legalne manewry okrętu: 2 pola w linii prostej, oba kroki dozwolone. */
export function maneuverOptions(game, owner, ship, distance) {
  const P = game.players[owner];
  const n = game.n, hard = game.settings.hard;
  const out = [];
  if (!isMobile(ship) || ship.maneuvered) return out;
  for (const [ux, uy] of DIRS) {
    let ok = true;
    const probe = { ...ship };
    for (let k = 1; k <= distance && ok; k++) {
      const occ = occupancy(n, P.ships.map((s) => (s.id === ship.id ? probe : s)));
      ok = canPlace(n, P.ships, P.shots, hard, probe, ship.x + ux * k, ship.y + uy * k, occ);
      if (ok) { probe.x = ship.x + ux * k; probe.y = ship.y + uy * k; }
    }
    if (ok) out.push({ dx: ux * distance, dy: uy * distance });
  }
  return out;
}

/** Tworzy okręty gracza z akcji setup; sprawdza planszę, nakładanie, komplet floty i wzory. */
export function buildShips(game, fleetDef, setupShips) {
  const n = game.n;
  if (!Array.isArray(setupShips)) fail('BAD_SETUP', 'ships');
  for (let i = 0; i < setupShips.length; i++) {          // pętla po indeksach: every() pomija dziury w tablicy
    const s = setupShips[i];
    if (!s || typeof s !== 'object' || Array.isArray(s) || typeof s.id !== 'string') fail('BAD_SETUP', `ship ${i}`);
  }
  const ids = fleetDef.map((d) => d.id);
  const given = new Map(setupShips.map((s) => [s.id, s]));
  if (given.size !== setupShips.length || setupShips.length !== ids.length || !ids.every((id) => given.has(id))) {
    fail('INCOMPLETE_FLEET');
  }
  const ships = [];
  const occ = new Array(n * n).fill(null);
  for (const def of fleetDef) {
    const g = given.get(def.id);
    if (!Number.isInteger(g.x) || !Number.isInteger(g.y) || typeof g.horiz !== 'boolean') fail('BAD_SETUP', def.id);
    const s = { id: def.id, type: def.type, length: def.length, width: def.width, x: g.x, y: g.y, horiz: g.horiz,
      hits: new Array(def.length * def.width).fill(false), immobile: false, repaired: false, maneuvered: false,
      smoke: 0, pattern: null, roam: null };
    for (const [x, y] of shipCells(s)) {
      if (x < 0 || y < 0 || x >= n || y >= n) fail('OUT_OF_BOARD', def.id);
      if (occ[idx(n, x, y)] !== null) fail('OVERLAP', def.id);
      occ[idx(n, x, y)] = def.id;
    }
    if (def.type === CARRIER) {
      if (g.pattern) fail('PATTERN_NOT_ALLOWED', def.id);
    } else {
      const pt = g.pattern;
      if (!pt || typeof pt !== 'object' || !PATTERNS.includes(pt.kind) || ![1, -1].includes(pt.along) || ![1, -1].includes(pt.across)) {
        fail('BAD_PATTERN', def.id);
      }
      s.pattern = { kind: pt.kind, along: pt.along, across: pt.across,
        steps: patternSteps(pt.kind, s.horiz, pt.along, pt.across), idx: 0, dir: 1 };
    }
    ships.push(s);
  }
  return ships;
}
