// Sprawdzarka pakietu dowodowego meczu modeli (zadanie 008c, pkt 8). Uruchomienie z samym Node (bez instalacji):
//   node game/mcp/sprawdz.mjs <katalog pakietu>
// Sprawdza: (a) ziarno = skrót ze zobowiązania, (b) pliki silnika i zasad = skróty ze zobowiązania, (c) odtworzenie meczu
// z ziarna i akcji daje zapisany wynik, (d) każda akcja modelu pochodzi z jego zapisanej odpowiedzi, (e) ustawienia
// = zobowiązanie, (f) autorzy akcji zgodni z graczem, sędzia tylko jako brak reakcji po pełnym oknie. Kod 0, gdy nie ma FAIL.
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { newGame, applyAction } from '../src/engine/game.js';
import { summary } from '../src/engine/view.js';
import { parseAnswer, tekstOdpowiedzi } from './odpowiedzi.js';

const KORZEN = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');   // korzeń repo (game/mcp/ → ../..)
export const sha256 = (b) => createHash('sha256').update(b).digest('hex');
const czytaj = (f) => JSON.parse(readFileSync(f, 'utf8'));
const wire = (v) => JSON.parse(JSON.stringify(v));
const bezGracza = ({ player, expectedRevision, ...r }) => r;

/** Akcja silnika, którą powinna dać odpowiedź modelu (jak decisionCall w pokaz.mjs); null = nie da się porównać wprost. */
function zgodna(kind, out, akcja, r) {
  if (kind === 'setup') {
    if (akcja.type !== 'setup' || akcja.player !== r) return false;
    if (!isDeepStrictEqual(out.action?.loadout ?? undefined, akcja.loadout ?? undefined)) return false;
    return out.random ? true : isDeepStrictEqual(wire(out.action?.ships), wire(akcja.ships));   // losowe pozycje wybiera sędzia
  }
  if (kind === 'reaction') return akcja.type === 'react' && akcja.player === r && isDeepStrictEqual(out.action?.reaction ?? null, akcja.reaction ?? null);
  return akcja.player === r && isDeepStrictEqual(wire(bezGracza(out.action || {})), wire(bezGracza(akcja)));
}

/** Wynik: { punkty: [{ p, wynik: 'PASS'|'FAIL'|'nie dotyczy', opis }], proba, ok }. root – korzeń repo z plikami ze zobowiązania. */
export function sprawdz(pakiet, { root = KORZEN } = {}) {
  const punkty = [], dodaj = (p, ok, opis) => punkty.push({ p, wynik: ok === null ? 'nie dotyczy' : ok ? 'PASS' : 'FAIL', opis });
  const zob = czytaj(join(pakiet, 'ZOBOWIAZANIE.json')), rep = czytaj(join(pakiet, 'replay.json')), dz = czytaj(join(pakiet, 'dziennik.json'));
  const ziarno = readFileSync(join(pakiet, 'ziarno.txt'), 'utf8').trim();
  // (a) ziarno
  dodaj('a', sha256(ziarno) === zob.ziarnoSha256 && rep.seed === ziarno, 'ziarno = skrót ze zobowiązania i ziarno meczu');
  // (b) pliki
  const zle = Object.entries(zob.pliki).filter(([f, h]) => !existsSync(join(root, f)) || sha256(readFileSync(join(root, f))) !== h).map(([f]) => f);
  dodaj('b', zle.length === 0, zle.length ? `inne niż w zobowiązaniu: ${zle.join(', ')}` : `${Object.keys(zob.pliki).length} plików = zobowiązanie`);
  // (e) ustawienia
  dodaj('e', isDeepStrictEqual(wire(rep.settings), wire(zob.ustawienia)) && rep.reactionWindowMs === zob.oknoMs, 'ustawienia i okno reakcji = zobowiązanie');
  // (c) odtworzenie
  let opisC = '', okC = true;
  const fazaPrzed = [];                                       // faza gry przed każdą akcją (f: brak reakcji tylko w oknie)
  try {
    let s = newGame(rep.settings, ziarno);
    for (const [i, a] of rep.actions.entries()) {
      if (a.revision !== i + 1) throw new Error(`rewizja ${a.revision} zamiast ${i + 1}`);
      fazaPrzed[i] = s.phase;
      s = applyAction(s, a.action).state;
    }
    okC = s.phase === 'over' && isDeepStrictEqual(wire(summary(s)), wire(rep.summary));
    opisC = okC ? `${rep.actions.length} akcji, wynik zgodny (rund ${rep.summary.rounds})` : 'wynik odtworzenia różni się od zapisanego';
  } catch (e) { okC = false; opisC = `akcja odrzucona przy odtworzeniu: ${e.message}`; }
  dodaj('c', okC, opisC);
  // (f) autorzy akcji (audyt r3 F1, F2): gracz 0 albo 1 = gracz akcji; sędzia – tylko brak reakcji po pełnym oknie (bez pauz)
  const czasPauz = (od, doo) => (rep.pauses || []).reduce((s, p) => s + Math.max(0, Math.min(Date.parse(p.to ?? new Date(doo).toISOString()), doo) - Math.max(Date.parse(p.from), od)), 0);
  const bledyF = [];
  for (const [i, a] of rep.actions.entries()) {
    if (a.by === 'referee') {
      if (!(a.action.type === 'react' && a.action.reaction === null)) { bledyF.push(`rew. ${a.revision}: sędzia z akcją inną niż brak reakcji`); continue; }
      const od = i > 0 ? Date.parse(rep.actions[i - 1].at) : NaN, doo = Date.parse(a.at);
      if (fazaPrzed[i] !== 'reaction' || !(doo - od - czasPauz(od, doo) >= zob.oknoMs)) bledyF.push(`rew. ${a.revision}: brak reakcji przed końcem okna ${zob.oknoMs} ms`);
    } else if (!(a.by === 0 || a.by === 1) || a.by !== a.action.player) bledyF.push(`rew. ${a.revision}: autor ${JSON.stringify(a.by)} niezgodny z graczem akcji`);
  }
  dodaj('f', bledyF.length === 0, bledyF.length ? bledyF.slice(0, 5).join('; ') + (bledyF.length > 5 ? ` (+${bledyF.length - 5})` : '') : 'autorzy akcji zgodni; brak reakcji sędziego tylko po pełnym oknie');
  // (d) pochodzenie decyzji według rodzaju uczestnika
  for (const r of [0, 1]) {
    const g = zob.gracze[r];
    if (g.rodzaj !== 'model') { dodaj(`d${r}`, null, `gracz ${r}: ${g.rodzaj} – próba, nie dowód modeli`); continue; }
    const bledy = [];
    for (const a of rep.actions) {
      if (a.action.player !== r || a.by === 'referee') continue;   // akcje gracza r według silnika; sędzia – punkt f
      if (a.by !== r) { bledy.push(`rew. ${a.revision}: autor ${JSON.stringify(a.by)} zamiast gracza ${r}`); continue; }
      const wpis = dz.log.find((e) => e.player === r && e.outcome === 'ok' && e.revision === a.revision - 1);
      const plik = wpis && [...(wpis.raw || [])].reverse().find((n) => existsSync(join(pakiet, 'raw', n)) && czytaj(join(pakiet, 'raw', n)).outcome === 'ok');
      if (!plik) { bledy.push(`rew. ${a.revision}: brak zapisanej odpowiedzi modelu`); continue; }
      const raw = czytaj(join(pakiet, 'raw', plik)), out = parseAnswer(tekstOdpowiedzi(g.cli, raw.raw?.stdout));
      if (!out || !zgodna(wpis.kind, out, a.action, r)) { bledy.push(`rew. ${a.revision}: odpowiedź w ${plik} nie daje tej akcji`); continue; }
      if ((out.comment || undefined) !== (a.comment || undefined)) bledy.push(`rew. ${a.revision}: komentarz różni się od odpowiedzi w ${plik}`);
    }
    dodaj(`d${r}`, bledy.length === 0, bledy.length ? bledy.slice(0, 5).join('; ') + (bledy.length > 5 ? ` (+${bledy.length - 5})` : '') : `gracz ${r} (${g.cli}): każda akcja z zapisanej odpowiedzi modelu`);
  }
  const proba = [0, 1].some((r) => zob.gracze[r].rodzaj !== 'model');
  return { punkty, proba, ok: !punkty.some((x) => x.wynik === 'FAIL') };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (!process.argv[2]) { console.error('użycie: node game/mcp/sprawdz.mjs <katalog pakietu>'); process.exit(2); }
  const w = sprawdz(resolve(process.argv[2]));
  for (const x of w.punkty) console.log(`${x.p}: ${x.wynik} – ${x.opis}`);
  console.log(w.ok ? 'WYNIK: PASS' : 'WYNIK: FAIL');
  if (w.proba) console.log('PRÓBA – boty, nie modele: pakiet nie jest dowodem meczu modeli');
  process.exit(w.ok ? 0 : 1);
}
