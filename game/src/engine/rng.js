// Generator liczb losowych z ziarnem. Cały stan to jedna liczba (uint32) trzymana w stanie gry,
// więc partia zapisana w JSON kontynuuje się identycznie (powtórki, serwer, MCP).

/** Zamienia ziarno (liczba albo tekst) na uint32 (FNV-1a). */
export function hashSeed(seed) {
  const text = String(seed);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Następna liczba z [0, 1) według mulberry32; przesuwa stan w obiekcie `holder.rng`. */
export function rand(holder) {
  const t = (holder.rng + 0x6d2b79f5) >>> 0;
  holder.rng = t;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
}

/** Liczba całkowita z [0, n). */
export function randInt(holder, n) {
  return Math.floor(rand(holder) * n);
}

/** Losowy element tablicy. */
export function pick(holder, arr) {
  return arr[randInt(holder, arr.length)];
}

/** Tasowanie Fishera-Yatesa w miejscu; zwraca tę samą tablicę. */
export function shuffle(holder, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(holder, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Samodzielny generator (np. do losowego rozstawienia), niezależny od stanu gry. */
export function createRng(seed) {
  return { rng: hashSeed(seed) };
}
