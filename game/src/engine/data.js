// Wszystkie liczby zasad gry. Źródło: DECISIONS.md (11.10.2026) i symulator statki_sim.py / seria2.py.
// Pierwszeństwo mają liczby z DECISIONS (seria 2), nie domyślne wartości w statki_sim.py.

export const SIZES = { szybki: 12, standard: 14, dlugi: 16 };

/** Okręt floty: typ, długość, szerokość. Identyfikatory nadaje game.js: `<typ>-<n>` w tej kolejności. */
const ship = (type, length, width = 1) => ({ type, length, width });

export const FLEETS = {
  szybki: [ship('lotniskowiec', 5, 2), ship('pancernik', 4), ship('podwodny', 4), ship('niszczyciel', 4)],
  standard: [ship('lotniskowiec', 5, 2), ship('pancernik', 4), ship('podwodny', 3), ship('niszczyciel', 3), ship('okret', 3)],
  dlugi: [ship('lotniskowiec', 5, 2), ship('pancernik', 4), ship('okret', 4), ship('okret', 4),
    ship('podwodny', 3), ship('niszczyciel', 3), ship('okret', 3), ship('okret', 3)],
};

/** Scenariusz „Bitwa lotniskowców” (tylko tryb standard). */
export const CARRIER_FLEET = [ship('lotniskowiec', 5, 2), ship('lotniskowiec', 4), ship('podwodny', 3),
  ship('niszczyciel', 3), ship('okret', 3)];

export const SCENARIOS = ['main', 'carriers'];
export const SCENARIO_MODES = { main: ['szybki', 'standard', 'dlugi'], carriers: ['standard'] };
export const HARD_MODES = ['szybki', 'standard'];

export const CARRIER = 'lotniskowiec';
/** Tyle trafionych segmentów jednego okrętu i piloci go rozpoznają (DECISIONS 14.10; w każdej flocie tylko lotniskowiec ma > 4 pola). */
export const IDENTIFY_HITS = 5;

// Wzory patrolu (make_pattern): przesunięcie o PATTERN_ALONG wzdłuż osi i PATTERN_ACROSS w poprzek.
export const PATTERNS = ['skraj', 'zygzak', 'dryf'];
export const PATTERN_ALONG = 2;
export const PATTERN_ACROSS = 2;
export const CARRIER_TURN_P = 0.15;

// Zestaw ładunków (wariant B)
export const BUDGET = { szybki: 4, standard: 10, dlugi: 16 };
export const SLOT_COST = { salwa: 3, torpeda: 3, zwiad: 2, naprawa: 2, manewr: 2,
  nalot: 1, dym: 1, kontrwywiad: 1, sonar: 1, kontrsonar: 1 };
export const SLOT_CHARGES = { sonar: 2, kontrsonar: 2 };          // pozostałe: 1 ładunek za pakiet
export const RESUPPLY_HITS = 3;                                  // +1 punkt za 3 nowe trafienia

export const ABILITIES = Object.keys(SLOT_COST);
export const RECON = ['sonar', 'zwiad'];                         // nie zużywają akcji głównej
export const STRIKES = ['salwa', 'torpeda', 'nalot'];            // akcja główna z fazą reakcji
export const REACTIONS = ['dym', 'manewr', 'kontrsonar', 'kontrwywiad'];

/** Rola okrętu potrzebna do zdolności ofensywnej (DECISIONS, U4). */
export const ROLE_OF = { zwiad: 'lotniskowiec', nalot: 'lotniskowiec', salwa: 'pancernik',
  torpeda: 'podwodny', sonar: 'niszczyciel' };
export const SONAR_STEALTH_TYPE = 'podwodny';

export const AREA = { sonar: 5, zwiad: 3, nalot: 3 };
export const TORPEDO_LENGTH = 5;

export const SMOKE_TURNS = 2;
export const SMOKE_MIN_LENGTH = 3;
export const REPAIR_MAX_LENGTH = 4;
export const REPAIR_MIN_INTACT = 2;
export const MANEUVER_DISTANCE = 2;

// Meldunki zwiadu (zadanie 005d, DECISIONS 13.10): ustawienie partii `reports`, domyślnie wyłączone w silniku.
export const REPORT_MISSES = [7, 9];  // meldunek na początku tury po serii tylu pudeł z rzędu; próg losowany z [7, 9] (DECISIONS 14.10)
export const REPORT_AREA = 3;         // obszar 3×3
export const REPORT_AGE_MAX = 3;      // położenie sprzed 1–3 pełnych rund
export const REPORT_TRUE = 0.85;      // szansa, że meldunek jest prawdziwy (inaczej obszar losowy)
export const REPORT_TTL = 3;          // ile rund ramka i trop z meldunku są aktywne (jak trop z sonaru u bota)

/** Okno decyzji obrońcy; pilnuje go wywołujący (serwer, UI, MCP), silnik nie liczy czasu. */
export const REACTION_WINDOW_MS = 8000;
/** PvP (DECISIONS 14.10, zadanie 009): tyle przepadniętych tur z rzędu i walkower. */
export const WALKOWER_PRZEPADKI = 3;

/** Runda = tura gracza 0 i gracza 1; po LIMIT_FACTOR * n^2 rundach remis. */
export const LIMIT_FACTOR = 4;

// Wartości pól w siatce strzałów na wodach gracza
export const UNSHOT = 0;
export const MISS = 1;
export const HIT = 2;
