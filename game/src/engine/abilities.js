// Rozstrzyganie ataków i zdolności, reakcje obronne, naprawa, zestaw i dokupowanie.
// Odpowiedniki: statki_sim.py Player.fire_at, do_*, react_*, try_maneuver, try_repair, add_point.

import {
  AREA, TORPEDO_LENGTH, ROLE_OF, SONAR_STEALTH_TYPE, SLOT_COST, SLOT_CHARGES, ABILITIES, BUDGET, RESUPPLY_HITS,
  SMOKE_TURNS, SMOKE_MIN_LENGTH, REPAIR_MAX_LENGTH, REPAIR_MIN_INTACT, MANEUVER_DISTANCE, CARRIER, UNSHOT, MISS, HIT, IDENTIFY_HITS,
} from './data.js';
import { idx, shipCells, isSunk, isMobile, intact, occupancy, canPlace, moveShip, maneuverOptions } from './fleet.js';
import { pick } from './rng.js';
import { fail } from './errors.js';
import { countShot } from './reports.js';

const opp = (p) => 1 - p;

/** Czy atakujący może ostrzelać pole? Zależy tylko od jego wiedzy (siatka wyników jest jawna dla niego). */
export function attackable(game, atk, x, y) {
  const n = game.n;
  if (x < 0 || y < 0 || x >= n || y >= n) return false;
  const v = game.players[opp(atk)].shots[idx(n, x, y)];
  return v === UNSHOT || (game.settings.hard && v === MISS);        // Hard: dawne pudło znów celem (D1)
}

/** Źródło ataku: pokład lotniskowca albo lotnisko lądowe (DECISIONS 11.10). */
export function attackSource(game, atk) {
  return game.players[atk].ships.some((s) => s.type === CARRIER && !isSunk(s)) ? 'carrier' : 'land';
}

/** Pola z nietrafionymi segmentami niezatopionych okrętów właściciela. */
export function liveCells(game, owner, cells, { skipSmoke = false, skipStealth = false } = {}) {
  const P = game.players[owner];
  const want = new Set(cells.map(([x, y]) => idx(game.n, x, y)));
  const out = [];
  for (const s of P.ships) {
    if (isSunk(s) || (skipSmoke && s.smoke > 0) || (skipStealth && s.type === SONAR_STEALTH_TYPE)) continue;
    shipCells(s).forEach(([x, y], seg) => { if (!s.hits[seg] && want.has(idx(game.n, x, y))) out.push([x, y]); });
  }
  return out;
}

/** Ostrzał jednego pola; zapisuje wynik i zdarzenie publiczne. */
export function fireAt(game, atk, x, y, events) {
  const n = game.n, D = game.players[opp(atk)], A = game.players[atk];
  const i = idx(n, x, y);
  const ship = D.ships.find((s) => shipCells(s).some(([cx, cy]) => cx === x && cy === y));
  const source = attackSource(game, atk);
  if (!ship) {
    D.shots[i] = MISS;
    events.push({ to: 'all', type: 'shot', player: atk, x, y, result: 'miss', source });
    countShot(game, atk, 'miss');
    return 'miss';
  }
  const seg = shipCells(ship).findIndex(([cx, cy]) => cx === x && cy === y);
  const wasSunk = isSunk(ship);
  const fresh = !ship.hits[seg];
  ship.hits[seg] = true;
  ship.immobile = true;
  D.shots[i] = HIT;
  if (fresh) {
    A.hitsDealt += 1;
    if (game.settings.variant === 'B') {
      A.hitCounter += 1;
      if (A.hitCounter >= RESUPPLY_HITS) { A.hitCounter -= RESUPPLY_HITS; A.points += 1; }
    }
  }
  const sunkNow = !wasSunk && isSunk(ship);
  const ev = { to: 'all', type: 'shot', player: atk, x, y, result: sunkNow ? 'sunk' : 'hit', source };
  if (sunkNow) ev.sunkShip = { id: ship.id, type: ship.type, cells: shipCells(ship) };
  else {                                                 // 005g: piąte trafienie w ten sam okręt – piloci rozpoznają typ (raz na zawsze)
    const znane = A.identified || (A.identified = []);   // wiedza atakującego w stanie silnika; widok gracza jej nie kopiuje (audyt r2 F1)
    if (!znane.includes(ship.id) && ship.hits.filter(Boolean).length >= IDENTIFY_HITS) { znane.push(ship.id); ev.identifiedNow = true; }
    if (znane.includes(ship.id)) ev.identified = ship.type;
  }
  events.push(ev);
  countShot(game, atk, ev.result);                       // meldunki po serii pudeł (005f B1)
  return ev.result;
}

// ------------------------------------------------------------------ obszary i deklaracje
/** Pola obszaru zdolności; obszar musi być w całości na planszy. */
export function areaCells(game, a) {
  const n = game.n;
  let cells;
  if (a.type in AREA) {
    const k = AREA[a.type];
    cells = [];
    for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) cells.push([a.x + dx, a.y + dy]);
  } else if (a.type === 'torpeda') {
    if (typeof a.horiz !== 'boolean') fail('BAD_ACTION', 'horiz');
    if (a.rev !== undefined && typeof a.rev !== 'boolean') fail('BAD_ACTION', 'rev');
    cells = Array.from({ length: TORPEDO_LENGTH }, (_, k) => (a.horiz ? [a.x + k, a.y] : [a.x, a.y + k]));
    if (a.rev) cells.reverse();                          // 005h: pola w kolejności biegu torpedy (rev: od drugiego końca)
  } else if (a.type === 'salwa') {
    const corners = { tl: [0, 0], tr: [1, 0], bl: [0, 1], br: [1, 1] };
    if (!(a.omit in corners)) fail('BAD_SHAPE', 'omit');
    cells = Object.entries(corners).filter(([k]) => k !== a.omit).map(([, [dx, dy]]) => [a.x + dx, a.y + dy]);
  } else fail('BAD_ACTION', a.type);
  if (!Number.isInteger(a.x) || !Number.isInteger(a.y)) fail('BAD_ACTION', 'x/y');
  if (cells.some(([x, y]) => x < 0 || y < 0 || x >= n || y >= n)) fail('OUT_OF_BOARD');
  return cells;
}

/** Czy gracz może użyć zdolności ofensywnej (wariant, ładunki, rola)? */
export function checkOffensive(game, p, ability) {
  if (game.settings.variant !== 'B') fail('NO_ABILITIES_IN_A');
  if (!(game.players[p].charges[ability] > 0)) fail('NO_CHARGES', ability);
  if (roleLost(game, p, ability)) fail('ROLE_LOST', ability);
}

export function roleLost(game, p, ability) {
  const role = ROLE_OF[ability];
  return !!role && !game.players[p].ships.some((s) => s.type === role && !isSunk(s));
}

/** Deklaracja zdolności z fazą reakcji: zużywa ładunek i ustawia game.pending. */
export function declare(game, atk, a, events) {
  checkOffensive(game, atk, a.type);
  const cells = areaCells(game, a);
  const targets = cells.filter(([x, y]) => attackable(game, atk, x, y));
  if (a.type === 'salwa' && targets.length === 0) fail('NO_TARGETS');
  game.players[atk].charges[a.type] -= 1;
  const pending = { ability: a.type, attacker: atk, defender: opp(atk), x: a.x, y: a.y, cells };
  if (a.type === 'torpeda') Object.assign(pending, { horiz: a.horiz, rev: !!a.rev });
  if (a.type === 'salwa') pending.omit = a.omit;
  pending.options = reactionOptions(game, pending);
  game.pending = pending;
  const pub = { to: 'all', type: 'ability', player: atk, ability: a.type, x: a.x, y: a.y, cells };
  if (a.type === 'torpeda') Object.assign(pub, { horiz: a.horiz, rev: !!a.rev });
  if (a.type === 'salwa') pub.omit = a.omit;
  events.push(pub, { to: 'all', type: 'reactionPending', defender: opp(atk) });
}

/** Pełne opcje reakcji obrońcy (bez null, który jest zawsze dozwolony). */
export function reactionOptions(game, pending) {
  const d = pending.defender, D = game.players[d];
  if (game.settings.variant !== 'B') return [];
  const has = (ab) => D.charges[ab] > 0;
  const inArea = (s) => liveCells(game, d, pending.cells).some(([x, y]) =>
    shipCells(s).some(([cx, cy]) => cx === x && cy === y));
  const opts = [];
  const ab = pending.ability;
  if ((ab === 'sonar' || ab === 'zwiad') && has('dym')) {
    for (const s of D.ships) {
      if (isMobile(s) && s.smoke === 0 && s.length >= SMOKE_MIN_LENGTH && inArea(s)) opts.push({ type: 'dym', shipId: s.id });
    }
  }
  if (ab === 'sonar' && has('kontrsonar')) opts.push({ type: 'kontrsonar' });
  if (ab === 'zwiad' && has('kontrwywiad')) opts.push({ type: 'kontrwywiad' });
  if (ab !== 'sonar' && has('manewr')) {
    for (const s of D.ships) {
      if (!inArea(s)) continue;
      for (const m of maneuverOptions(game, d, s, MANEUVER_DISTANCE)) opts.push({ type: 'manewr', shipId: s.id, dx: m.dx, dy: m.dy });
    }
  }
  return opts;
}

/** Ta sama opcja reakcji niezależnie od kolejności pól (znaczenie, nie zapis). */
function sameOption(a, b) {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && kb.every((k) => Object.prototype.hasOwnProperty.call(a, k) && a[k] === b[k]);
}

/** Odpowiedź obrońcy i rozstrzygnięcie zdolności. Zwraca true, jeśli tura wraca do atakującego. */
export function resolvePending(game, reaction, events) {
  const pd = game.pending;
  const atk = pd.attacker, d = pd.defender, D = game.players[d], A = game.players[atk];
  let counterSonar = false, counterRecon = false;
  if (reaction !== null) {
    if (!pd.options.some((o) => sameOption(o, reaction))) fail('BAD_REACTION');
    D.charges[reaction.type] -= 1;
    D.reactionsUsed.push({ round: game.round, ability: pd.ability, ...reaction });
    const ship = reaction.shipId ? D.ships.find((s) => s.id === reaction.shipId) : null;
    if (reaction.type === 'dym') ship.smoke = SMOKE_TURNS;
    if (reaction.type === 'kontrsonar') counterSonar = true;
    if (reaction.type === 'kontrwywiad') counterRecon = true;
    if (reaction.type === 'manewr') {                                 // przed rozstrzygnięciem ataku
      moveShip(ship, ship.x + reaction.dx, ship.y + reaction.dy);
      ship.maneuvered = true;
    }
    events.push({ to: d, type: 'reaction', ...reaction, ...(ship ? { x: ship.x, y: ship.y } : {}) });
  }
  game.pending = null;
  const result = { to: 'all', type: 'resolved', player: atk, ability: pd.ability };
  switch (pd.ability) {
    case 'sonar': {
      const count = liveCells(game, d, pd.cells, { skipSmoke: true, skipStealth: true }).length + (counterSonar ? 1 : 0);
      A.recon.push({ round: game.round, ability: 'sonar', x: pd.x, y: pd.y, count });
      events.push(result, { to: atk, type: 'sonarResult', x: pd.x, y: pd.y, count });
      return true;
    }
    case 'zwiad': {
      const cells = counterRecon ? [] : liveCells(game, d, pd.cells, { skipSmoke: true });
      A.recon.push({ round: game.round, ability: 'zwiad', x: pd.x, y: pd.y, cells });
      events.push(result, { to: atk, type: 'zwiadResult', x: pd.x, y: pd.y, cells });
      return true;
    }
    case 'salwa': {
      const fire = pd.cells.filter(([x, y]) => attackable(game, atk, x, y));
      result.skipped = pd.cells.filter(([x, y]) => !attackable(game, atk, x, y));
      events.push(result);
      for (const [x, y] of fire) fireAt(game, atk, x, y, events);
      return false;
    }
    case 'torpeda': {
      if (liveCells(game, d, pd.cells).length) {
        // 005h (DECISIONS 14.10): torpeda płynie po polach w kolejności biegu i wybucha na pierwszym niezatopionym okręcie
        const D = game.players[d], okretNa = ([x, y]) => D.ships.find((s) => !isSunk(s) && shipCells(s).some(([cx, cy]) => cx === x && cy === y));
        const fire = [];
        for (const c of pd.cells) {
          const s = okretNa(c);
          if (!s) { if (attackable(game, atk, ...c)) fire.push(c); continue; }   // woda albo wrak: pudło, pole ostrzelane wcześniej torpeda mija
          const pola = shipCells(s);
          for (const p of pd.cells) if (pola.some(([cx, cy]) => cx === p[0] && cy === p[1]) && attackable(game, atk, ...p)) fire.push(p);
          break;
        }
        result.skipped = pd.cells.filter(([x, y]) => !fire.some(([fx, fy]) => fx === x && fy === y));
        events.push(result);
        for (const [x, y] of fire) fireAt(game, atk, x, y, events);
      } else {
        events.push(result, { to: atk, type: 'emptyResult', ability: 'torpeda', cells: pd.cells });   // „pusto” tylko dla atakującego
        A.recon.push({ round: game.round, ability: 'torpeda', empty: true, cells: pd.cells });
      }
      return false;
    }
    case 'nalot': {
      const live = liveCells(game, d, pd.cells);
      if (live.length) {
        events.push(result);
        const [x, y] = pick(game, live);
        fireAt(game, atk, x, y, events);
      } else {
        events.push(result, { to: atk, type: 'emptyResult', ability: 'nalot', cells: pd.cells });
        A.recon.push({ round: game.round, ability: 'nalot', empty: true, cells: pd.cells });
      }
      return false;
    }
    default:
      return fail('BAD_ACTION', pd.ability);
  }
}

// ------------------------------------------------------------------ naprawa, dokupowanie, zestaw
export function repairable(game, p) {
  return game.players[p].ships.filter((s) => s.immobile && !isSunk(s) && !s.repaired
    && s.length <= REPAIR_MAX_LENGTH && intact(s) >= REPAIR_MIN_INTACT);
}

export function repair(game, p, shipId, events) {
  if (game.settings.variant !== 'B') fail('NO_ABILITIES_IN_A');
  const P = game.players[p];
  if (!(P.charges.naprawa > 0)) fail('NO_CHARGES', 'naprawa');
  const ship = repairable(game, p).find((s) => s.id === shipId);
  if (!ship) fail('CANNOT_REPAIR', shipId);
  P.charges.naprawa -= 1;
  ship.immobile = false;
  ship.repaired = true;
  events.push({ to: p, type: 'repair', shipId });
}

export function buy(game, p, ability, events) {
  if (game.settings.variant !== 'B') fail('NO_ABILITIES_IN_A');
  if (!ABILITIES.includes(ability)) fail('BAD_ACTION', ability);
  if (roleLost(game, p, ability)) fail('ROLE_LOST', ability);
  const P = game.players[p];
  if (P.points < SLOT_COST[ability]) fail('NO_POINTS', ability);
  P.points -= SLOT_COST[ability];
  P.charges[ability] = (P.charges[ability] || 0) + (SLOT_CHARGES[ability] || 1);
  events.push({ to: p, type: 'buy', ability, points: P.points });
}

/** Zestaw z akcji setup: { zdolność: liczba pakietów } -> ładunki; reszta budżetu przepada. */
export function loadoutCharges(mode, variant, loadout) {
  const charges = Object.fromEntries(ABILITIES.map((a) => [a, 0]));
  if (variant !== 'B') {
    if (loadout && Object.keys(loadout).length) fail('NO_ABILITIES_IN_A');
    return { charges, points: 0 };
  }
  let spent = 0;
  for (const [ab, packs] of Object.entries(loadout || {})) {
    if (!ABILITIES.includes(ab)) fail('BAD_LOADOUT', ab);
    if (!Number.isInteger(packs) || packs < 0) fail('BAD_LOADOUT', ab);
    spent += packs * SLOT_COST[ab];
    charges[ab] = packs * (SLOT_CHARGES[ab] || 1);
  }
  if (spent > BUDGET[mode]) fail('LOADOUT_TOO_EXPENSIVE', `${spent} > ${BUDGET[mode]}`);
  return { charges, points: 0 };                       // niewydane punkty przepadają (OWNER_CORRECTED 11.10)
}

/** Czy pole jest przejezdne dla okrętu w tej chwili (do testów i bota). */
export function placeable(game, owner, ship, x, y) {
  const P = game.players[owner];
  return canPlace(game.n, P.ships, P.shots, game.settings.hard, ship, x, y, occupancy(game.n, P.ships));
}
