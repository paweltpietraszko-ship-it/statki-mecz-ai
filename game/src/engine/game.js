// Partia: ustawienia, rozstawienie, fazy i tury, akcje, koniec partii, legalne akcje, powtórka.
// Kontrakt: zadania/001_silnik.md (wersja 2). Stan gry to zwykły JSON; applyAction nie zmienia wejścia.

import {
  SIZES, FLEETS, CARRIER_FLEET, SCENARIOS, SCENARIO_MODES, HARD_MODES, CARRIER, PATTERNS, BUDGET, SLOT_COST,
  ABILITIES, RECON, STRIKES, AREA, TORPEDO_LENGTH, LIMIT_FACTOR, UNSHOT, WALKOWER_PRZEPADKI,
} from './data.js';
import { hashSeed, createRng, rand, randInt, pick } from './rng.js';
import { RuleError, fail } from './errors.js';
import { DIRS, shipCells, isSunk, buildShips, moveFleet } from './fleet.js';
import {
  attackable, fireAt, declare, resolvePending, repair, repairable, buy, loadoutCharges, roleLost,
} from './abilities.js';
import { recordHistory, maybeReport, initReports } from './reports.js';

export { RuleError };

/** Definicja floty z identyfikatorami `<typ>-<n>`. */
export function fleetDefinition(settings) {
  const base = settings.scenario === 'carriers' ? CARRIER_FLEET : FLEETS[settings.mode];
  const count = {};
  return base.map((d) => {
    count[d.type] = (count[d.type] || 0) + 1;
    return { ...d, id: `${d.type}-${count[d.type]}` };
  });
}

export function newGame(settings, seed) {
  const s = { mode: settings?.mode, variant: settings?.variant, hard: settings?.hard ?? false,
    scenario: settings?.scenario ?? 'main' };
  if (!(s.mode in SIZES)) fail('BAD_SETTINGS', 'mode');
  if (s.variant !== 'A' && s.variant !== 'B') fail('BAD_SETTINGS', 'variant');
  if (typeof s.hard !== 'boolean') fail('BAD_SETTINGS', 'hard');
  if (!SCENARIOS.includes(s.scenario)) fail('BAD_SETTINGS', 'scenario');
  if (s.hard && !HARD_MODES.includes(s.mode)) fail('HARD_NOT_ALLOWED');
  if (!SCENARIO_MODES[s.scenario].includes(s.mode)) fail('SCENARIO_NOT_ALLOWED');
  if (settings?.reports !== undefined && typeof settings.reports !== 'boolean') fail('BAD_SETTINGS', 'reports');
  if (settings?.reports === true) {                       // meldunki zwiadu (005d): tylko scenariusz główny
    if (s.scenario !== 'main') fail('SCENARIO_NOT_ALLOWED', 'reports');
    s.reports = true;
  }
  const n = SIZES[s.mode];
  const player = () => ({ ready: false, ships: [], shots: new Array(n * n).fill(UNSHOT), charges: {}, points: 0,
    hitsDealt: 0, hitCounter: 0, reactionsUsed: [], recon: [] });
  const players = [player(), player()];
  const game = { version: 1, settings: s, n, rng: hashSeed(seed), revision: 0, phase: 'setup', round: 0, current: null,
    turnFlags: { sonar: false, zwiad: false }, pending: null, players,
    fleet: fleetDefinition(s), winner: null, endReason: null };
  if (s.reports) initReports(game);                      // meldunki: historia i seria pudeł (005d, 005f)
  return game;
}

// ------------------------------------------------------------------ tury
function beginTurn(game, events) {
  const owner = 1 - game.current;                       // na początku tury płynie flota przeciwnika
  recordHistory(game, owner);                           // meldunki: położenie przed ruchem (005d, B1)
  const moves = moveFleet(game, owner);
  events.push({ to: owner, type: 'fleetMoved', moves });
  events.push({ to: 'all', type: 'turnStart', player: game.current, round: game.round });
  maybeReport(game, events);
}

function checkEnd(game, events) {
  if (game.phase === 'over') return true;
  for (const p of [0, 1]) {
    const ships = game.players[p].ships;
    const lostAll = ships.every(isSunk);
    const lostCarriers = game.settings.scenario === 'carriers' && ships.filter((s) => s.type === CARRIER).every(isSunk);
    if (lostAll || lostCarriers) {
      game.phase = 'over';
      game.winner = 1 - p;
      game.endReason = lostAll ? 'fleet' : 'carriers';
      game.pending = null;
      events.push({ to: 'all', type: 'gameOver', winner: game.winner, endReason: game.endReason });
      return true;
    }
  }
  return false;
}

function endTurn(game, events, przepadek = false) {
  const P = game.players[game.current];
  if (!przepadek && P.przepadki) P.przepadki = 0;          // 009: seria przepadków kończy się turą zakończoną strzałem
  for (const s of game.players[1 - game.current].ships) if (s.smoke > 0) s.smoke -= 1;
  if (checkEnd(game, events)) return;
  if (game.current === 1) {
    game.round += 1;
    if (game.round > LIMIT_FACTOR * game.n * game.n) {
      game.phase = 'over'; game.winner = null; game.endReason = 'limit';
      events.push({ to: 'all', type: 'gameOver', winner: null, endReason: 'limit' });
      return;
    }
  }
  game.current = 1 - game.current;
  game.phase = 'turn';
  game.turnFlags = { sonar: false, zwiad: false };
  beginTurn(game, events);
}

/** Koniec partii bez rozstrzygnięcia na morzu (009): gracz `p` przegrywa – poddanie albo walkower. */
function endBy(game, p, reason, events) {
  game.phase = 'over'; game.winner = 1 - p; game.endReason = reason; game.pending = null;
  events.push({ to: 'all', type: 'gameOver', winner: game.winner, endReason: reason });
}

function doSetup(game, a, events) {
  if (game.phase !== 'setup') fail('NOT_SETUP_PHASE');
  const P = game.players[a.player];
  if (P.ready) fail('ALREADY_READY');
  const ships = buildShips(game, game.fleet, a.ships);
  const { charges, points } = loadoutCharges(game.settings.mode, game.settings.variant, a.loadout);
  for (const s of ships) if (s.type === CARRIER) s.roam = [...pick(game, DIRS)];
  Object.assign(P, { ships, charges, points, ready: true });
  events.push({ to: 'all', type: 'playerReady', player: a.player });
  if (game.players.every((pl) => pl.ready)) {
    game.phase = 'turn'; game.current = 0; game.round = 1;
    beginTurn(game, events);
  }
}

// ------------------------------------------------------------------ akcje
export function applyAction(state, action) {
  const game = structuredClone(state);
  const events = [];
  if (!action || typeof action !== 'object') fail('BAD_ACTION');
  if (action.expectedRevision !== undefined && action.expectedRevision !== game.revision) fail('STALE_REVISION');
  const p = action.player;
  if (p !== 0 && p !== 1) fail('BAD_PLAYER');
  if (game.phase === 'over') fail('GAME_OVER');

  if (action.type === 'poddanie') endBy(game, p, action.powod === 'rozlaczenie' ? 'walkower' : 'poddanie', events);   // 009: tylko serwer PvP
  else if (action.type === 'setup') doSetup(game, action, events);
  else if (game.phase === 'setup') fail('SETUP_PHASE');
  else if (game.phase === 'reaction') {
    if (action.type !== 'react') fail('AWAITING_REACTION');
    if (p !== game.pending.defender) fail('NOT_YOUR_DECISION');
    const ability = game.pending.ability;
    const back = resolvePending(game, action.reaction ?? null, events);
    if (!checkEnd(game, events)) {
      if (back) { game.phase = 'turn'; game.turnFlags[ability] = true; } else endTurn(game, events);
    }
  } else {
    if (p !== game.current) fail('NOT_YOUR_TURN');
    const t = action.type;
    if (t === 'buy') buy(game, p, action.ability, events);
    else if (RECON.includes(t)) {
      if (game.turnFlags[t]) fail('RECON_ALREADY_USED', t);
      declare(game, p, action, events);
      game.phase = 'reaction';
    } else if (STRIKES.includes(t)) {
      declare(game, p, action, events);
      game.phase = 'reaction';
    } else if (t === 'attack') {
      const { x, y } = action;
      if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= game.n || y >= game.n) fail('OUT_OF_BOARD');
      if (!attackable(game, p, x, y)) fail('CELL_ALREADY_SHOT');
      fireAt(game, p, x, y, events);
      if (!checkEnd(game, events)) endTurn(game, events);
    } else if (t === 'naprawa') {
      repair(game, p, action.shipId, events);
      endTurn(game, events);
    } else if (t === 'przepadek') {                       // 009: 15 s bez decyzji – tura przepada bez strzału (tylko serwer PvP)
      const P = game.players[p];
      P.przepadki = (P.przepadki || 0) + 1;
      events.push({ to: 'all', type: 'przepadek', player: p, count: P.przepadki });
      if (P.przepadki >= WALKOWER_PRZEPADKI) endBy(game, p, 'walkower', events);
      else endTurn(game, events, true);
    } else if (t === 'react') fail('NO_PENDING');
    else fail('BAD_ACTION', t);
  }
  game.revision += 1;
  return { state: game, events };
}

// ------------------------------------------------------------------ legalne akcje (bez ukrytej wiedzy)
export function legalActions(state, role) {
  const g = state, n = g.n, out = [];
  if (role !== 0 && role !== 1) return out;
  if (g.phase === 'setup') return g.players[role].ready ? [] : [{ type: 'setup', player: role }];
  if (g.phase === 'reaction') {
    if (g.pending.defender !== role) return out;
    out.push({ type: 'react', player: role, reaction: null });
    for (const o of g.pending.options) out.push({ type: 'react', player: role, reaction: o });
    return out;
  }
  if (g.phase !== 'turn' || g.current !== role) return out;
  const P = g.players[role], B = g.settings.variant === 'B';
  const usable = (ab) => B && P.charges[ab] > 0 && !roleLost(g, role, ab);
  if (B) for (const ab of ABILITIES) if (P.points >= SLOT_COST[ab] && !roleLost(g, role, ab)) out.push({ type: 'buy', player: role, ability: ab });
  for (const ab of RECON) {
    if (!usable(ab) || g.turnFlags[ab]) continue;
    for (let y = 0; y + AREA[ab] <= n; y++) for (let x = 0; x + AREA[ab] <= n; x++) out.push({ type: ab, player: role, x, y });
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (attackable(g, role, x, y)) out.push({ type: 'attack', player: role, x, y });
  if (usable('salwa')) {
    for (let y = 0; y + 2 <= n; y++) for (let x = 0; x + 2 <= n; x++) {
      for (const omit of ['tl', 'tr', 'bl', 'br']) {
        const cells = [[x, y, 'tl'], [x + 1, y, 'tr'], [x, y + 1, 'bl'], [x + 1, y + 1, 'br']].filter((c) => c[2] !== omit);
        if (cells.some(([cx, cy]) => attackable(g, role, cx, cy))) out.push({ type: 'salwa', player: role, x, y, omit });
      }
    }
  }
  if (usable('torpeda')) {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      for (const rev of [false, true]) {                 // 005h: kierunek biegu torpedy
        if (x + TORPEDO_LENGTH <= n) out.push({ type: 'torpeda', player: role, x, y, horiz: true, rev });
        if (y + TORPEDO_LENGTH <= n) out.push({ type: 'torpeda', player: role, x, y, horiz: false, rev });
      }
    }
  }
  if (usable('nalot')) {
    for (let y = 0; y + AREA.nalot <= n; y++) for (let x = 0; x + AREA.nalot <= n; x++) out.push({ type: 'nalot', player: role, x, y });
  }
  if (B && P.charges.naprawa > 0) for (const s of repairable(g, role)) out.push({ type: 'naprawa', player: role, shipId: s.id });
  return out;
}

// ------------------------------------------------------------------ losowe rozstawienie i powtórka
export function randomSetup(state, player, seed) {
  const r = createRng(seed), n = state.n;
  const occ = new Set();
  const ships = [];
  for (const def of state.fleet) {
    for (let tries = 0; ; tries++) {
      if (tries > 5000) throw new Error('randomSetup: brak miejsca');
      const horiz = rand(r) < 0.5;
      const w = horiz ? def.length : def.width, h = horiz ? def.width : def.length;
      const x = randInt(r, n - w + 1), y = randInt(r, n - h + 1);
      const cells = shipCells({ ...def, horiz }, x, y).map(([cx, cy]) => cy * n + cx);
      if (cells.some((c) => occ.has(c))) continue;
      cells.forEach((c) => occ.add(c));
      const s = { id: def.id, x, y, horiz };
      if (def.type !== CARRIER) s.pattern = { kind: pick(r, PATTERNS), along: pick(r, [1, -1]), across: pick(r, [1, -1]) };
      ships.push(s);
      break;
    }
  }
  const action = { type: 'setup', player, ships };
  if (state.settings.variant === 'B') {
    let budget = BUDGET[state.settings.mode];
    const loadout = {};
    for (;;) {
      const opts = ABILITIES.filter((ab) => SLOT_COST[ab] <= budget);
      if (!opts.length) break;
      const ab = pick(r, opts);
      loadout[ab] = (loadout[ab] || 0) + 1;
      budget -= SLOT_COST[ab];
    }
    action.loadout = loadout;
  }
  return action;
}

export function replay(settings, seed, actions) {
  let s = newGame(settings, seed);
  for (const a of actions) s = applyAction(s, a).state;
  return s;
}
