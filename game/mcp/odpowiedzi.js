// Odczyt odpowiedzi modelu z surowego wyjścia CLI (Claude Code stream-json, Codex --json) – wspólny dla koordynatora
// (players.js) i sprawdzarki pakietu dowodowego (sprawdz.mjs, zadanie 008c). Bez zależności: idzie do publicznego repo.

/** Linie JSON z wyjścia procesu (pozostałe linie pomijane). */
export const jsonLines = (s) => String(s ?? '').split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

/** Decyzja z tekstu modelu: pierwszy `{` do ostatniego `}`; { action, random, comment (≤ 280), note (≤ 2000) } albo null. */
export function parseAnswer(text) {
  if (typeof text !== 'string') return null;
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  let o;
  try { o = JSON.parse(text.slice(a, b + 1)); } catch { return null; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  if (o.action !== undefined && o.action !== null && (typeof o.action !== 'object' || Array.isArray(o.action))) return null;
  return {
    action: o.action ?? null, random: o.random === true,
    comment: typeof o.comment === 'string' ? o.comment.slice(0, 280) : '',
    note: typeof o.note === 'string' ? o.note.slice(0, 2000) : '',
  };
}

/** Końcowy tekst odpowiedzi modelu: Claude – zdarzenie `result`, Codex – ostatnia wiadomość agenta. */
export function tekstOdpowiedzi(kind, stdout) {
  const ev = jsonLines(stdout);
  if (kind === 'claude') return ev.find((e) => e.type === 'result')?.result ?? '';
  const items = ev.filter((e) => e.type === 'item.completed' || e.type === 'item.started').map((e) => e.item);
  return items.filter((i) => i?.type === 'agent_message').at(-1)?.text ?? '';
}
