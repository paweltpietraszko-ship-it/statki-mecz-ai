// Projekcje dla klientów sędziego MCP: zwarta lista legalnych akcji i tekst widoku.
// Czyste funkcje: biorą wyłącznie to, co silnik już oddał graczowi (legalActions, viewFor, eventsFor).
// Kontrakt: zadania/003_sedzia_mcp.md (wersja 2), „Zwarta lista legalnych akcji” i „Tekst widoku”.

import { FLEETS, CARRIER_FLEET, CARRIER, AREA, TORPEDO_LENGTH, ABILITIES, RECON } from '../src/engine/data.js';

const OMITS = ['tl', 'tr', 'bl', 'br'];
const AREA_TYPES = ['sonar', 'zwiad', 'nalot'];

// ------------------------------------------------------------------ zwarta lista legalnych akcji

/** Prostokąt rogów obszaru dla planszy n (lewy górny róg 0..xMax × 0..yMax). */
function rect(type, n) {
  if (type in AREA) return { xMax: n - AREA[type], yMax: n - AREA[type] };
  if (type === 'salwa') return { xMax: n - 2, yMax: n - 2 };
  if (type === 'torpedaH') return { xMax: n - TORPEDO_LENGTH, yMax: n - 1 };
  return { xMax: n - 1, yMax: n - TORPEDO_LENGTH };          // torpedaV
}

/** Skrót obszaru: prostokąt i rogi z prostokąta, których nie ma w pełnej liście. */
function areaSummary(present, type, n, withOmit) {
  if (!present.size) return null;
  const { xMax, yMax } = rect(type, n);
  const except = [];
  for (let y = 0; y <= yMax; y++) {
    for (let x = 0; x <= xMax; x++) {
      if (withOmit) {
        for (const o of OMITS) if (!present.has(`${x},${y},${o}`)) except.push([x, y, o]);
      } else if (!present.has(`${x},${y}`)) except.push([x, y]);
    }
  }
  return { xMax, yMax, except };
}

/** Bezstratny skrót listy legalActions (bez pola `player`). */
export function compactLegal(actions, n) {
  const keys = { sonar: new Set(), zwiad: new Set(), nalot: new Set(), salwa: new Set(), torpedaH: new Set(), torpedaV: new Set() };
  const out = { setup: false, buy: [], attack: null, naprawa: [], react: null };
  const grid = Array.from({ length: n }, () => new Array(n).fill('-'));
  let anyAttack = false;
  for (const a of actions) {
    if (a.type === 'setup') out.setup = true;
    else if (a.type === 'buy') out.buy.push(a.ability);
    else if (a.type === 'attack') { grid[a.y][a.x] = '+'; anyAttack = true; }
    else if (AREA_TYPES.includes(a.type)) keys[a.type].add(`${a.x},${a.y}`);
    else if (a.type === 'salwa') keys.salwa.add(`${a.x},${a.y},${a.omit}`);
    else if (a.type === 'torpeda') keys[a.horiz ? 'torpedaH' : 'torpedaV'].add(`${a.x},${a.y}`);
    else if (a.type === 'naprawa') out.naprawa.push(a.shipId);
    else if (a.type === 'react') (out.react ||= []).push(a.reaction);
    else throw new Error(`compactLegal: nieznana akcja ${a.type}`);
  }
  if (anyAttack) out.attack = grid.map((row) => row.join(''));
  for (const t of AREA_TYPES) out[t] = areaSummary(keys[t], t, n, false);
  out.salwa = areaSummary(keys.salwa, 'salwa', n, true);
  out.torpedaH = areaSummary(keys.torpedaH, 'torpedaH', n, false);
  out.torpedaV = areaSummary(keys.torpedaV, 'torpedaV', n, false);
  return out;
}

/** Czy róg (x, y[, omit]) należy do skrótu obszaru? */
function inArea(summary, x, y, omit) {
  if (!summary || x > summary.xMax || y > summary.yMax) return false;
  return !summary.except.some((e) => e[0] === x && e[1] === y && (omit === undefined || e[2] === omit));
}

/**
 * Pełna lista z powrotem, w kolejności legalActions silnika (ta sama kolejność daje botowi te same decyzje).
 * `player` (0 | 1) dopisuje pole gracza jak w silniku; bez niego akcje są bez `player`.
 */
export function expandLegal(c, n, player) {
  const mk = (type, rest) => (player === undefined ? { type, ...rest } : { type, player, ...rest });
  const out = [];
  if (c.setup) out.push(mk('setup', {}));
  if (c.react) for (const reaction of c.react) out.push(mk('react', { reaction }));
  for (const ab of ABILITIES) if (c.buy.includes(ab)) out.push(mk('buy', { ability: ab }));
  for (const ab of RECON) {
    const s = c[ab];
    if (!s) continue;
    for (let y = 0; y <= s.yMax; y++) for (let x = 0; x <= s.xMax; x++) if (inArea(s, x, y)) out.push(mk(ab, { x, y }));
  }
  if (c.attack) {
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (c.attack[y][x] === '+') out.push(mk('attack', { x, y }));
  }
  if (c.salwa) {
    for (let y = 0; y <= c.salwa.yMax; y++) {
      for (let x = 0; x <= c.salwa.xMax; x++) {
        for (const omit of OMITS) if (inArea(c.salwa, x, y, omit)) out.push(mk('salwa', { x, y, omit }));
      }
    }
  }
  if (c.torpedaH || c.torpedaV) {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        for (const rev of [false, true]) {               // 005h: obie wersje kierunku biegu (ten sam obszar, ta sama dozwoloność)
          if (inArea(c.torpedaH, x, y)) out.push(mk('torpeda', { x, y, horiz: true, rev }));
          if (inArea(c.torpedaV, x, y)) out.push(mk('torpeda', { x, y, horiz: false, rev }));
        }
      }
    }
  }
  if (c.nalot) {
    for (let y = 0; y <= c.nalot.yMax; y++) for (let x = 0; x <= c.nalot.xMax; x++) if (inArea(c.nalot, x, y)) out.push(mk('nalot', { x, y }));
  }
  for (const shipId of c.naprawa) out.push(mk('naprawa', { shipId }));
  return out;
}

// ------------------------------------------------------------------ tekst widoku

/** Skład floty z ustawień (dane gry, nie stan): identyfikatory `<typ>-<n>`. */
export function fleetFromSettings(settings) {
  const base = settings.scenario === 'carriers' ? CARRIER_FLEET : FLEETS[settings.mode];
  const count = {};
  return base.map((d) => {
    count[d.type] = (count[d.type] || 0) + 1;
    return { ...d, id: `${d.type}-${count[d.type]}` };
  });
}

const cellsOf = (s) => {
  const out = [];
  for (let i = 0; i < s.length; i++) for (let j = 0; j < s.width; j++) out.push(s.horiz ? [s.x + i, s.y + j] : [s.x + j, s.y + i]);
  return out;
};
const fmt = (cells) => cells.map(([x, y]) => `(${x},${y})`).join(' ');
const pad = (v, w) => String(v).padStart(w);

/** Mapka znakowa: kolumny x w prawo, wiersze y w dół. */
function drawGrid(n, charAt) {
  const w = String(n - 1).length;
  const lines = [`${' '.repeat(w)} ${Array.from({ length: n }, (_, x) => pad(x, w)).join(' ')}`];
  for (let y = 0; y < n; y++) lines.push(`${pad(y, w)} ${Array.from({ length: n }, (_, x) => pad(charAt(x, y), w)).join(' ')}`);
  return lines;
}

const ENEMY_CHARS = ['.', 'o', 'X', '#'];

/** Mapa i listy współrzędnych wód, o których wiedza jest jawna dla patrzącego. */
function watersBlock(n, waters, title) {
  const left = new Set((waters.left || []).map(([x, y]) => y * n + x));   // 005i, B3: trafienie, z którego okręt odpłynął
  const out = [title, ...drawGrid(n, (x, y) => (left.has(y * n + x) ? 'x' : ENEMY_CHARS[waters.grid[y * n + x]]))];
  const list = (v) => {
    const c = [];
    for (let i = 0; i < waters.grid.length; i++) if (waters.grid[i] === v) c.push([i % n, Math.floor(i / n)]);
    return c;
  };
  out.push(`Pudła: ${fmt(list(1)) || 'brak'}`);
  out.push(`Trafienia (okręt jeszcze pływa): ${fmt(list(2).filter(([x, y]) => !left.has(y * n + x))) || 'brak'}`);
  out.push(`Trafienia, z których okręt odpłynął: ${fmt(waters.left || []) || 'brak'}`);
  out.push(`Zatopione: ${waters.sunk.map((s) => `${s.id} [${fmt(s.cells)}]`).join('; ') || 'brak'}`);
  out.push(`Okręty na wodzie: ${waters.afloat.map((s) => `${s.type} ${s.length}×${s.width}`).join(', ') || 'brak'}`);
  return out;
}

function myWatersBlock(n, me) {
  const ch = new Map();
  for (let i = 0; i < me.waters.grid.length; i++) if (me.waters.grid[i] === 1) ch.set(i, 'o');
  for (const [x, y] of me.waters.left || []) ch.set(y * n + x, 'x');   // 005i, B3
  for (const s of me.ships) {
    const sunk = s.hits.every(Boolean);
    cellsOf(s).forEach(([x, y], seg) => ch.set(y * n + x, sunk ? '#' : s.hits[seg] ? 'X' : 'S'));
  }
  const out = ['TWOJE WODY (. woda, S twój nietrafiony segment, X twój trafiony segment, # twój zatopiony okręt, o pudło przeciwnika, x trafienie, z którego twój okręt odpłynął)'];
  out.push(...drawGrid(n, (x, y) => ch.get(y * n + x) || '.'));
  for (const s of me.ships) {
    const sunk = s.hits.every(Boolean);
    const state = sunk ? 'zatopiony' : s.immobile ? 'unieruchomiony' : 'pływa';
    const extra = [];
    if (s.pattern) extra.push(`patrol ${s.pattern.kind} (along ${s.pattern.along}, across ${s.pattern.across})`);
    if (s.type === CARRIER && !sunk && !s.immobile) extra.push('lotniskowiec pływa po całej planszy');
    if (s.smoke > 0) extra.push(`dym jeszcze ${s.smoke} tury`);
    if (s.repaired) extra.push('naprawiony');
    if (s.maneuvered) extra.push('manewr użyty');
    out.push(`- ${s.id} ${s.length}×${s.width}: ${fmt(cellsOf(s))}; ${state}${extra.length ? `; ${extra.join('; ')}` : ''}`);
  }
  return out;
}

function reconLine(r) {
  if (r.ability === 'sonar') return `- runda ${r.round}: sonar 5×5 od (${r.x},${r.y}): ${r.count} nietrafionych segmentów`;
  if (r.ability === 'zwiad') return `- runda ${r.round}: zwiad 3×3 od (${r.x},${r.y}): segmenty na ${fmt(r.cells) || 'żadnym polu'}`;
  return `- runda ${r.round}: ${r.ability} bez celu, pusto na ${fmt(r.cells)}`;
}

/** Tekst widoku dla modelu (po polsku). Czysta funkcja samego widoku. */
export function renderText(view) {
  const n = view.n, s = view.settings;
  const spectator = view.role === 'spectator';
  const who = (p) => (spectator ? `gracz ${p}` : p === view.role ? 'ty' : 'przeciwnik');
  const lines = [`Tryb ${s.mode}, wariant ${s.variant}${s.hard ? ', Hard' : ''}${s.scenario === 'carriers' ? ', Bitwa lotniskowców' : ''}; plansza ${n}×${n}.`];
  lines.push(`Runda ${view.round}, faza ${view.phase}, ruch: ${view.phase === 'setup' ? 'rozstawienie' : who(view.current)}, rewizja ${view.revision}.`);
  if (view.phase === 'over') lines.push(`Koniec partii: ${view.winner === null ? 'remis' : `wygrywa ${who(view.winner)}`} (${view.endReason}).`);
  if (spectator) {
    lines.push('', ...watersBlock(n, view.waters[0], 'WODY GRACZA 0 (. nieznane, o pudło, X trafienie, x trafienie – okręt odpłynął, # zatopiony)'));
    lines.push('', ...watersBlock(n, view.waters[1], 'WODY GRACZA 1 (. nieznane, o pudło, X trafienie, x trafienie – okręt odpłynął, # zatopiony)'));
  } else {
    if (view.phase === 'setup' && !view.ready[view.role]) {
      lines.push('', 'DO ROZSTAWIENIA:');
      for (const d of fleetFromSettings(s)) lines.push(`- ${d.id} ${d.length}×${d.width}`);
    } else lines.push('', ...myWatersBlock(n, view.me));
    lines.push('', ...watersBlock(n, view.enemy.waters, 'WODY PRZECIWNIKA (. nieznane, o twoje pudło, X trafienie, x trafienie – okręt odpłynął, # zatopiony)'));
    lines.push('', 'ROZPOZNANIE:', ...(view.enemy.recon.length ? view.enemy.recon.map(reconLine) : ['- brak']));
    if (view.enemy.reports) lines.push('', 'MELDUNKI ZWIADU (niepewne: bywają pomyłką):', ...(view.enemy.reports.length ? view.enemy.reports.map(reportLine) : ['- brak']));   // 008c (005d)
    if (s.variant === 'B') {
      const ch = Object.entries(view.me.charges).filter(([, v]) => v > 0).map(([k, v]) => `${k} ${v}`).join(', ');
      lines.push('', `Ładunki: ${ch || 'brak'}. Punkty: ${view.me.points}. Zadane trafienia: ${view.me.hitsDealt}.`);
      if (view.me.reactionsUsed.length) lines.push(`Twoje użyte reakcje: ${view.me.reactionsUsed.map((r) => `${r.type} (runda ${r.round})`).join(', ')}.`);
      if (view.turnFlags) lines.push(`W tej turze użyte: sonar ${view.turnFlags.sonar ? 'tak' : 'nie'}, zwiad ${view.turnFlags.zwiad ? 'tak' : 'nie'}.`);
    }
  }
  const pd = view.pending;
  if (pd) {
    lines.push('');
    if (pd.options) {
      lines.push(`REAKCJA: przeciwnik użył ${pd.ability} na polach ${fmt(pd.cells)}. Twoje opcje:`);
      lines.push('- null (bez reakcji)', ...pd.options.map((o) => `- ${JSON.stringify(o)}`));
    } else lines.push(`Czekam na przeciwnika (${pd.ability} na polach ${fmt(pd.cells)}).`);
  }
  return lines.join('\n');
}

/** Meldunek zwiadu w widoku gracza (005d): obszar od lewego górnego rogu, runda i wiek położenia; nieaktywny po czasie. */
const reportLine = (r) => `- runda ${r.round}: okręt przeciwnika widziany ${r.age} ${r.age === 1 ? 'rundę' : 'rundy'} wcześniej w obszarze ${r.size}×${r.size} od (${r.x},${r.y})${r.active ? '' : ' (nieaktualny)'}`;

/** Słowny opis paczek zdarzeń `{ revision, events }` dla roli (do polecenia modelu). */
export function describeEvents(batches, role) {
  const who = (p) => (role === 'spectator' ? `gracz ${p}` : p === role ? 'ty' : 'przeciwnik');
  const lines = [];
  for (const b of batches) {
    for (const e of b.events) {
      const t = `[rew. ${b.revision}] `;
      if (e.type === 'shot') lines.push(`${t}${who(e.player)}: strzał w (${e.x},${e.y}) – ${{ miss: 'pudło', hit: 'trafienie', sunk: `zatopiony ${e.sunkShip?.id}` }[e.result]} (${e.source === 'carrier' ? 'z lotniskowca' : 'z lotniska lądowego'})${e.identified ? `; ${e.identifiedNow ? 'piąte trafienie – rozpoznany typ' : 'rozpoznany typ'}: ${e.identified}` : ''}`);
      else if (e.type === 'report') lines.push(`${t}meldunek zwiadu: okręt przeciwnika widziany ${e.age} ${e.age === 1 ? 'rundę' : 'rundy'} temu w obszarze ${e.size}×${e.size} od (${e.x},${e.y}) (niepewny)`);   // 008c (005d)
      else if (e.type === 'przepadek') lines.push(`${t}${who(e.player)}: tura przepadła (brak decyzji w czasie)`);
      else if (e.type === 'ability') lines.push(`${t}${who(e.player)}: ${e.ability} na polach ${fmt(e.cells)}`);
      else if (e.type === 'resolved' && e.skipped?.length) lines.push(`${t}${e.ability}: pominięte pola już ostrzelane ${fmt(e.skipped)}`);
      else if (e.type === 'sonarResult') lines.push(`${t}wynik sonaru od (${e.x},${e.y}): ${e.count}`);
      else if (e.type === 'zwiadResult') lines.push(`${t}wynik zwiadu od (${e.x},${e.y}): ${fmt(e.cells) || 'pusto'}`);
      else if (e.type === 'emptyResult') lines.push(`${t}${e.ability}: pusto na ${fmt(e.cells)}`);
      else if (e.type === 'reaction') lines.push(`${t}twoja reakcja: ${JSON.stringify({ ...e, to: undefined })}`);
      else if (e.type === 'repair') lines.push(`${t}naprawa: ${e.shipId}`);
      else if (e.type === 'buy') lines.push(`${t}zakup: ${e.ability}, zostało punktów ${e.points}`);
      else if (e.type === 'fleetMoved') lines.push(`${t}twoja flota płynie: ${e.moves.map((m) => `${m.id}→(${m.x},${m.y})`).join(', ') || 'bez ruchu'}`);
      else if (e.type === 'turnStart') lines.push(`${t}runda ${e.round}, tura: ${who(e.player)}`);
      else if (e.type === 'playerReady') lines.push(`${t}${who(e.player)}: flota rozstawiona`);
      else if (e.type === 'gameOver') lines.push(`${t}koniec partii: ${e.winner === null ? 'remis' : `wygrywa ${who(e.winner)}`}`);
    }
  }
  return lines;
}
