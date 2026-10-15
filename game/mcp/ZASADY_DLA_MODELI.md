# Statki z ruchem i zdolnościami: zasady dla zawodnika

Grasz w Statki przeciwko innemu modelowi AI. Nie masz żadnych narzędzi: dostajesz w tym poleceniu wszystko, co wiesz o grze, i odpowiadasz **jednym obiektem JSON** z jedną decyzją. Sędzia (program) pilnuje zasad i mgły wojny: nie znasz pozycji floty przeciwnika poza tym, co odkryłeś. Graj uczciwie i najlepiej, jak umiesz.

## Plansza i współrzędne

Plansza ma n×n pól (rozmiar zależy od trybu – tabela niżej; tryb meczu podaje pierwsza linia widoku). `x` to kolumna od 0 (lewa) do n−1 (prawa), `y` to wiersz od 0 (góra) do n−1 (dół). Pole zapisujemy `(x,y)`.

## Flota i rozstawienie

| tryb | plansza | flota | punkty na zestaw |
|---|---|---|---|
| szybki | 12×12 | lotniskowiec 5×2, pancernik 4, okręt podwodny 4, niszczyciel 4 | 4 |
| standard | 14×14 | lotniskowiec 5×2, pancernik 4, okręt podwodny 3, niszczyciel 3, krążownik 3 | 10 |
| dlugi | 16×16 | lotniskowiec 5×2, pancernik 4, krążownik 4, krążownik 4, okręt podwodny 3, niszczyciel 3, krążownik 3, krążownik 3 | 16 |

Identyfikatory okrętów są w sekcji „DO ROZSTAWIENIA”.

Rozstawienie to `{"ships": [...], "loadout": {...}}`. Każdy okręt: `{"id", "x", "y", "horiz", "pattern"}`:
- `x, y` to lewy górny róg okrętu; `horiz: true` – okręt leży wzdłuż osi x (długość w prawo, szerokość w dół), `false` – wzdłuż osi y (długość w dół, szerokość w prawo). Lotniskowiec 5×2 zajmuje 10 pól.
- Okręty w całości na planszy, bez nakładania się (mogą się stykać).
- `pattern` (wszystkie okręty **oprócz lotniskowca**): `{"kind": "skraj"|"zygzak"|"dryf", "along": 1|-1, "across": 1|-1}`. Wzór patrolu: `skraj` – 2 pola wzdłuż osi okrętu, 2 w poprzek, 2 wstecz wzdłuż, 2 wstecz w poprzek (obwód prostokąta); `zygzak` – na przemian krok wzdłuż i krok w poprzek, potem z powrotem; `dryf` – 2 pola w poprzek i z powrotem. `along` i `across` to kierunki (+1 w stronę rosnących współrzędnych).
- Możesz zamiast tego odpowiedzieć `"random": true` (losowe pozycje i wzory); `loadout` podany obok `random` i tak obowiązuje.

**Zestaw ładunków (`loadout`)**: masz tyle punktów, ile podaje tabela dla trybu meczu, i wydajesz je na pakiety: salwa 3, torpeda 3, zwiad 2, naprawa 2, manewr 2, nalot 1, dym 1, kontrwywiad 1, sonar 1 (2 ładunki), kontrsonar 1 (2 ładunki); pozostałe pakiety dają 1 ładunek. Zapis: `{"sonar": 1, "salwa": 1}` = liczba pakietów. Niewydane punkty przepadają. W trakcie gry za każde 3 nowe trafienia dostajesz 1 punkt, który wydajesz akcją `buy`.

## Ruch okrętów

Na początku każdej twojej tury płynie flota przeciwnika (a na początku jego tury – twoja), o jeden krok wzoru. Lotniskowiec pływa po całej planszy o 1 pole i czasem losowo zmienia kierunek. Okręt nigdy nie wpływa na pole już ostrzelane (pudło też blokuje) ani na inny okręt; zablokowany zawraca albo stoi. **Trafiony okręt jest unieruchomiony** (chyba że go naprawisz). Zatopiony okręt jest odkryty dla obu stron. Gdy trafiony okręt odpłynie (po naprawie albo manewrze), pole trafienia zostaje oznaczone `x` („trafienie – okręt odpłynął”); ostrzelanego pola nie można ostrzelać ponownie.

**Piąte trafienie rozpoznaje typ:** gdy trafisz ten sam okręt po raz piąty (bez zatopienia), w zdarzeniu strzału dostajesz jego typ (np. `lotniskowiec`) i odtąd przy każdym trafieniu w ten okręt.

## Twoja tura

1. Dowolnie wiele `buy` (gdy masz punkty), najwyżej jeden `sonar` i jeden `zwiad` – nie kończą tury.
2. Dokładnie jedna akcja główna, która kończy turę: `attack`, `salwa`, `torpeda`, `nalot` albo `naprawa`.

Zdolności ofensywne wymagają żywego okrętu z rolą: zwiad i nalot – lotniskowiec; salwa – pancernik; torpeda – okręt podwodny; sonar – niszczyciel. Każde użycie zużywa ładunek.

| Akcja | Zapis | Działanie |
|---|---|---|
| atak | `{"type":"attack","x":3,"y":5}` | strzał w jedno pole jeszcze nieostrzelane |
| sonar | `{"type":"sonar","x":0,"y":0}` | obszar 5×5 od lewego górnego rogu: liczba nietrafionych segmentów; okręt podwodny i okręty w dymie są niewidoczne |
| zwiad | `{"type":"zwiad","x":4,"y":4}` | obszar 3×3: lista pól z nietrafionymi segmentami (bez okrętów w dymie) |
| salwa | `{"type":"salwa","x":2,"y":2,"omit":"tl"}` | kwadrat 2×2 bez jednego rogu (`tl`, `tr`, `bl`, `br`): 3 strzały w dozwolone pola |
| torpeda | `{"type":"torpeda","x":0,"y":6,"horiz":true}`, od drugiego końca: `{"type":"torpeda","x":0,"y":6,"horiz":true,"rev":true}` | linia 5 pól w prawo (`horiz: true`) albo w dół od (x, y); `rev: true` – torpeda płynie od drugiego końca (w lewo albo w górę). Jeśli w linii jest nietrafiony segment: torpeda płynie po polach, woda przed okrętem to pudła, na pierwszym niezatopionym okręcie wybucha (trafione są wszystkie jego pola leżące na linii), dalsze pola zostają nieostrzelane; inaczej „pusto” |
| nalot | `{"type":"nalot","x":5,"y":1}` | obszar 3×3: trafiony jeden losowy nietrafiony segment w obszarze; inaczej „pusto” |
| naprawa | `{"type":"naprawa","shipId":"pancernik-1"}` | twój unieruchomiony, niezatopiony okręt o długości ≤ 4 i co najmniej 2 nietrafionych segmentach znów pływa; raz na okręt |
| zakup | `{"type":"buy","ability":"sonar"}` | pakiet za punkty z trafień |

Obszar zdolności musi leżeć w całości na planszy. Wyniki sonaru, zwiadu i „pusto” widzisz tylko ty.

## Meldunki zwiadu

Gdy meldunki są włączone (pierwsza linia widoku podaje ustawienia meczu, sekcja „MELDUNKI ZWIADU”), po serii 7–9 pudeł z rzędu dostajesz na początku tury meldunek: obszar 3×3, w którym okręt przeciwnika był 1–3 pełne rundy wcześniej (od tego czasu mógł odpłynąć). Meldunek jest prawdziwy w 85% przypadków, w pozostałych obszar jest losowy (pomyłka). Gdy przeciwnikowi został najwyżej jeden okręt, nowych meldunków nie ma, a dawne są nieaktualne. Meldunki widzisz tylko ty; prawda wychodzi po partii.

## Obrona (reakcja)

Po sonarze, zwiadzie, salwie, torpedzie i nalocie przeciwnika masz **okno reakcji** (długość ustala mecz; pozostały czas podaje polecenie przy decyzji o reakcji). Wynik zawsze pojawia się dopiero po końcu okna, więc przeciwnik nie wie, czy i jak się broniłeś (dowie się po partii). Opcje dostajesz w liście:
- po sonarze: `dym` (okręt w obszarze, pływający, długość ≥ 3: przez 2 tury przeciwnika niewidoczny dla sonaru i zwiadu), `kontrsonar` (wynik sonaru +1);
- po zwiadzie: `kontrwywiad` (zwiad nic nie znajdzie), `dym`, `manewr`;
- po salwie, torpedzie, nalocie: `manewr` (okręt w celu przesuwa się o 2 pola w linii prostej przed strzałem; raz na okręt).
- `null` – bez reakcji (zawsze wolno).

Reakcja zużywa ładunek. Zwykły `attack` nie daje okna reakcji.

## Koniec

Wygrywa ten, kto zatopi całą flotę przeciwnika. Po 4·n² rundach bez rozstrzygnięcia partia kończy się remisem.

## Co dostajesz w poleceniu

- tekst widoku: twoje wody (`S` twój nietrafiony segment, `X` trafiony, `#` zatopiony, `o` pudło przeciwnika), wody przeciwnika (`o` pudło, `X` trafienie, `x` trafienie – okręt odpłynął, `#` zatopiony) z listami współrzędnych, rozpoznanie, meldunki zwiadu, ładunki;
- zdarzenia od twojej poprzedniej decyzji;
- **listę dozwolonych akcji** w skrócie: `attack` to n napisów (wiersz y, znak x; `+` wolno strzelić); `sonar`/`zwiad`/`nalot`/`salwa`/`torpedaH`/`torpedaV` to prostokąt dozwolonych lewych górnych rogów `0..xMax × 0..yMax` bez pozycji z `except` (`null` – niedostępne); każda pozycja `torpedaH`/`torpedaV` jest dozwolona w obu kierunkach (`rev` false i true); `buy`, `naprawa`, `react` to listy; `setup: true` – rozstawienie;
- twoją notatkę z poprzednich decyzji (nie pamiętasz poprzednich rozmów; zapisz w notatce, co chcesz pamiętać).

## Odpowiedź

Jeden obiekt JSON, bez dodatkowego tekstu:

```json
{"action": {"type": "attack", "x": 3, "y": 5}, "comment": "krótko po polsku: co robisz i dlaczego (dla widzów, po partii)", "note": "twoja prywatna notatka na następne decyzje"}
```

- tura: `action` to jedna akcja z tabeli (bez pola `player`);
- rozstawienie: `action` to `{"ships": [...], "loadout": {...}}` albo `"random": true`;
- reakcja: `action` to `{"reaction": null}` albo `{"reaction": <jedna opcja z listy>}`.

`comment` najwyżej 280 znaków, `note` najwyżej 2000 znaków. Akcja spoza listy dozwolonych zostanie odrzucona i dostaniesz drugą próbę.
