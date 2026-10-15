// Projekcje dla ról (granica ochrony, PLAN_TECHNICZNY §4): to jedyne dane, które wolno przekazać graczowi
// albo widzowi. Pełny stan i pełna lista zdarzeń zostają u sędziego (serwer PvP, proces MCP).

import { shipCells, isSunk } from './fleet.js';
import { HIT } from './data.js';
import { fail } from './errors.js';
import { reportsOn, reportsView } from './reports.js';

const SUNK_CELL = 3;

/** Wiedza o wodach gracza `owner`, którą ma każdy: wyniki ataków (0 nic, 1 pudło, 2 trafienie, 3 zatopiony). */
function publicWaters(game, owner) {
  const P = game.players[owner], n = game.n;
  const grid = P.shots.slice();
  const sunk = [];
  for (const s of P.ships) {
    if (!isSunk(s)) continue;
    const cells = shipCells(s);
    for (const [x, y] of cells) grid[y * n + x] = SUNK_CELL;
    sunk.push({ id: s.id, type: s.type, cells });
  }
  const afloat = P.ships.filter((s) => !isSunk(s)).map((s) => ({ type: s.type, length: s.length, width: s.width }));
  // 005i, B1: trafienia, z których okręt odpłynął (po naprawie albo manewrze). Pole raz opuszczone zostaje puste (canPlace).
  const taken = new Set(P.ships.flatMap((s) => shipCells(s).map(([x, y]) => y * n + x)));
  const left = [];
  for (let i = 0; i < grid.length; i++) if (grid[i] === HIT && !taken.has(i)) left.push([i % n, Math.floor(i / n)]);
  return { grid, sunk, afloat, left };
}

function publicPending(game) {
  const pd = game.pending;
  if (!pd) return null;
  const out = { waiting: true, ability: pd.ability, attacker: pd.attacker, defender: pd.defender, x: pd.x, y: pd.y, cells: pd.cells };
  if (pd.horiz !== undefined) out.horiz = pd.horiz;
  if (pd.omit !== undefined) out.omit = pd.omit;
  return out;
}

function header(game) {
  return { phase: game.phase, round: game.round, current: game.current, revision: game.revision,
    settings: { ...game.settings }, n: game.n, winner: game.winner, endReason: game.endReason,
    ready: game.players.map((p) => p.ready) };
}

/** Widok gracza (0 | 1) albo widza ('spectator'). */
export function viewFor(game, role) {
  if (role === 'spectator') return publicView(game);
  if (role !== 0 && role !== 1) fail('BAD_ROLE');
  const me = game.players[role], enemyIdx = 1 - role;
  const view = header(game);
  view.role = role;
  view.me = {
    ships: structuredClone(me.ships),
    waters: publicWaters(game, role),                 // gdzie przeciwnik strzelał w nasze wody
    charges: { ...me.charges }, points: me.points, hitsDealt: me.hitsDealt,
    reactionsUsed: structuredClone(me.reactionsUsed),
  };
  view.enemy = {
    waters: publicWaters(game, enemyIdx),             // wyniki naszych ataków
    recon: structuredClone(me.recon),                 // nasze rozpoznanie (sonar, zwiad, puste obszary)
  };
  if (reportsOn(game)) view.enemy.reports = reportsView(game, role);   // nasze meldunki zwiadu, bez prawdy (005d)
  if (game.phase === 'turn' && game.current === role) view.turnFlags = { ...game.turnFlags };
  if (game.pending) {
    view.pending = publicPending(game);
    if (game.pending.defender === role) view.pending.options = structuredClone(game.pending.options);
  } else view.pending = null;
  return view;
}

/** Widok publiczny: to, co widzą obaj gracze (widz w trakcie partii). */
export function publicView(game) {
  const view = header(game);
  view.role = 'spectator';
  view.waters = [publicWaters(game, 0), publicWaters(game, 1)];
  view.pending = publicPending(game);
  return view;
}

/** Zdarzenia dla roli: prywatne (`to: 0|1`) tylko dla właściciela; widz dostaje tylko publiczne. */
export function eventsFor(events, role) {
  return events.filter((e) => e.to === 'all' || e.to === role).map((e) => structuredClone(e));
}

/** Pełna wiedza po końcu partii (reakcje, tory, ładunki). */
export function summary(game) {
  if (game.phase !== 'over') fail('NOT_OVER');
  return {
    settings: { ...game.settings }, winner: game.winner, endReason: game.endReason, rounds: game.round,
    players: game.players.map((p) => ({
      ships: structuredClone(p.ships), reactionsUsed: structuredClone(p.reactionsUsed),
      charges: { ...p.charges }, points: p.points, hitsDealt: p.hitsDealt,
      hitCells: p.shots.reduce((a, v, i) => (v === HIT ? a + 1 : a), 0),
      ...(reportsOn(game) ? { reports: structuredClone(p.reports) } : {}),   // z prawdą: ujawnione po partii
    })),
  };
}
