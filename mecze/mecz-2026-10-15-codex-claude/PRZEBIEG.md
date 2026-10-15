# Mecz modeli 008c: codex kontra claude

Ustawienia: tryb standard, wariant B, scenariusz main, okno reakcji 120 s, ziarno `1d5815d3-b87c-4290-822d-b7d7d447c434`.
Gracz 0: codex (model gpt-6.1-sol); gracz 1: claude (model claude-opus-5-5). Poziom myślenia: medium dla obu. Losowanie gracza 0: Gracz 0: codex, gracz 1: claude (moneta z crypto)..
Wynik: wygrywa gracz 1 (claude), powód fleet, rund 65.

## Warunki i liczby

| | gracz 0 | gracz 1 |
|---|---|---|
| wywołania modelu (także przerwane) | 86 | 90 |
| w tym przerwane (zużycie tokenów nieznane, niewliczone niżej) | 0 | 0 |
| ponowne próby | 0 | 5 |
| tokeny wejście / wyjście | 819808 / 31845 | 696649 / 66717 |
| przegapione okna reakcji (błąd) | 0 | 0 |

Okna reakcji: 20; bez odpowiedzi obrońcy (sędzia zastosował brak reakcji): 0.
Sesje: 2026-10-15T13:29:29.421Z – 2026-10-15T14:37:29.867Z (Koniec partii: wygrywa gracz 1.).
Pauzy: brak.

Oba modele grały bez narzędzi, z tym samym poleceniem (`ZASADY_DLA_MODELI.md`), tą samą linią instrukcji bazowych, tym samym poziomem myślenia i tymi samymi limitami czasu. Komentarze to deklaracje graczy, widoczne dopiero po partii.
Dowód braku narzędzi: Claude Code podaje przy każdym wywołaniu pustą listę narzędzi i serwerów MCP. Codex CLI nie podaje listy narzędzi (brak trybu „zero narzędzi”, openai/codex#6049): wyłączono wszystkie przełączniki narzędzi z dokumentacji, Codex deklaruje pustą listę, a każde wywołanie jest sprawdzane, czy nie zawiera użycia narzędzia.

## Przebieg

Publiczny wynik to to, co widzieli obaj gracze i widz; wyniki rozpoznania (sonar, zwiad) zna tylko atakujący. Reakcja obrońcy rozstrzyga się po końcu okna, więc wynik zdolności z obroną stoi w wierszu reakcji.

| runda | gracz | decyzja | publiczny wynik | komentarz |
|---|---|---|---|---|
| 0 | 0 (codex) | rozstawienie (sonar×1, zwiad×1, torpeda×2, nalot×1) |  | Rozpraszam flotę, pozostawiając miejsce na patrol. Sonar i zwiad pomogą znaleźć cel dla dwóch torped. |
| 0 | 1 (claude) | rozstawienie (salwa×1, torpeda×1, sonar×1, manewr×1, dym×1) |  | Rozpraszam flotę po całej planszy, żeby jeden sonar czy nalot nie odkrył kilku okrętów naraz. Każdy okręt patroluje innym wzorem. Zestaw: salwa, torpeda, sonar, manewr i dym. |
| 1 | 0 (codex) | sonar (4,4) | gracz 0: sonar na polach (4,4) (5,4) (6,4) (7,4) (8,4) (4,5) (5,5) (6,5) (7,5) (8,5) (4,6) (5,6) (6,6) (7,6) (8,6) (4,7) (5,7) (6,7) (7,7) (8,7) (4,8) (5,8) (6,8) (7,8) (8,8) | Sprawdzam centralny obszar 5×5, szukając skupiska okrętów przed zwiadem i ostrzałem. |
| 1 | 1 (claude) | bez reakcji |  | Sonar obejmuje tylko mój okręt podwodny, a sonar i tak go nie widzi. Wynik będzie 0 bez żadnej reakcji, więc zostawiam dym na później. |
| 1 | 0 (codex) | zwiad (9,3) | gracz 0: zwiad na polach (9,3) (10,3) (11,3) (9,4) (10,4) (11,4) (9,5) (10,5) (11,5) | Sprawdzam prawą część planszy zwiadem, aby znaleźć cel do natychmiastowego trafienia. |
| 1 | 1 (claude) | reakcja dym pancernik-1 |  | Zwiad wroga obejmuje 3 segmenty pancernika. Stawiam dym: zwiad nic nie znajdzie. Manewr zostawiam na salwę albo torpedę. |
| 1 | 0 (codex) | nalot (2,8) | gracz 0: nalot na polach (2,8) (3,8) (4,8) (2,9) (3,9) (4,9) (2,10) (3,10) (4,10) | Przeszukuję nalotem obszar poza pustymi strefami rozpoznania, aby znaleźć i unieruchomić pierwszy okręt. |
| 1 | 1 (claude) | reakcja manewr podwodny-1 |  | Nalot celuje w obszar z moim okrętem podwodnym, więc trafienie byłoby pewne. Manewruję o 2 pola w górę, na (3-5,6), poza obszar ataku. Ten rejon przeciwnik sprawdził już sonarem i dostał 0. |
| 1 | 1 (claude) | sonar (4,4) | gracz 1: sonar na polach (4,4) (5,4) (6,4) (7,4) (8,4) (4,5) (5,5) (6,5) (7,5) (8,5) (4,6) (5,6) (6,6) (7,6) (8,6) (4,7) (5,7) (6,7) (7,7) (8,7) (4,8) (5,8) (6,8) (7,8) (8,8) | Zaczynam rozpoznanie od sonaru na środku planszy przeciwnika (x4-8, y4-8). Wynik pomoże wybrać cel pierwszego strzału. |
| 1 | 0 (codex) | bez reakcji |  | Brak dostępnej obrony przed sonarem; zachowuję pozostałe ładunki. |
| 1 | 1 (claude) | torpeda (4,6) poziomo | gracz 1: torpeda na polach (4,6) (5,6) (6,6) (7,6) (8,6) | Sonar wykrył 3 segmenty w obszarze x4-8, y4-8. Puszczam torpedę środkowym wierszem tego obszaru (y6, x4-8). Pokrywa 5 pól, a jeśli trafi okręt, uderza we wszystkie jego segmenty na linii. |
| 1 | 0 (codex) | bez reakcji | torpeda: pominięte pola już ostrzelane (8,6); gracz 1: strzał w (4,6) – pudło (z lotniskowca); gracz 1: strzał w (5,6) – pudło (z lotniskowca); gracz 1: strzał w (6,6) – pudło (z lotniskowca); gracz 1: strzał w (7,6) – trafienie (z lotniskowca) | Brak dostępnej obrony przed torpedą; zachowuję pozostałe ładunki. |
| 2 | 0 (codex) | sonar (8,8) | gracz 0: sonar na polach (8,8) (9,8) (10,8) (11,8) (12,8) (8,9) (9,9) (10,9) (11,9) (12,9) (8,10) (9,10) (10,10) (11,10) (12,10) (8,11) (9,11) (10,11) (11,11) (12,11) (8,12) (9,12) (10,12) (11,12) (12,12) | Sprawdzam prawy dolny sektor sonarem, by lepiej wycelować pozostałe torpedy. |
| 2 | 1 (claude) | bez reakcji |  | Nie mam już ładunków reakcji (dym i manewr zużyte), więc sonar przeciwnika przechodzi bez obrony. Wykryje mój niszczyciel w tym obszarze. |
| 2 | 0 (codex) | torpeda (8,10) poziomo | gracz 0: torpeda na polach (8,10) (9,10) (10,10) (11,10) (12,10) | Sonar wykrył trzy segmenty w prawym dolnym sektorze. Torpeda przez środek obszaru może trafić i unieruchomić okręt, a przy dobrym ustawieniu zatopić go od razu. |
| 2 | 1 (claude) | bez reakcji |  | Nie mam reakcji. Na linii (8..12,10) nie stoi żaden mój okręt, więc torpeda powinna przejść pusto. |
| 2 | 1 (claude) | salwa (7,6) bez tl | gracz 1: salwa na polach (8,6) (7,7) (8,7) | Salwa wokół trafienia (7,6): strzelam w (8,6), (7,7) i (8,7). Sprawdzam jednocześnie przedłużenie w prawo i w dół, bo pole na lewo od trafienia to pudło. |
| 2 | 0 (codex) | bez reakcji | gracz 1: strzał w (8,6) – pudło (z lotniskowca); gracz 1: strzał w (7,7) – trafienie (z lotniskowca); gracz 1: strzał w (8,7) – pudło (z lotniskowca) | Brak dostępnej obrony; zachowuję pozostałą torpedę. |
| 3 | 0 (codex) | torpeda (10,8) pionowo | gracz 0: torpeda na polach (10,8) (10,9) (10,10) (10,11) (10,12) | Pionowa torpeda przeczesze obszar ostatniego dodatniego sonaru i może trafić kilka segmentów naraz. |
| 3 | 1 (claude) | bez reakcji | torpeda: pominięte pola już ostrzelane (10,10) (10,11) (10,12); gracz 0: strzał w (10,8) – pudło (z lotniskowca); gracz 0: strzał w (10,9) – trafienie (z lotniskowca) | Nie mam żadnej reakcji. Torpeda w kolumnie x10 trafi zapewne niszczyciel w (10,9), stracę jeden segment. |
| 3 | 1 (claude) | attack (7,8) | gracz 1: strzał w (7,8) – pudło (z lotniskowca) | Dobijam okręt stojący pionowo w kolumnie 7. Pudła po bokach wykluczają lotniskowiec, więc to okręt o szerokości 1. Strzelam w dół, w (7,8). |
| 4 | 0 (codex) | attack (9,9) | gracz 0: strzał w (9,9) – pudło (z lotniskowca) | Sprawdzam pole na lewo od trafienia; pojedyncze trafienie pionową torpedą sugeruje poziomy okręt. |
| 4 | 1 (claude) | attack (7,5) | gracz 1: strzał w (7,5) – zatopiony okret-1 (z lotniskowca) | Dobijam okręt w kolumnie 7: trafienia (7,6) i (7,7), a pod nimi pudło (7,8). Kadłub musi więc ciągnąć się w górę, więc strzelam w (7,5). |
| 5 | 0 (codex) | attack (11,9) | gracz 0: strzał w (11,9) – trafienie (z lotniskowca) | Sprawdzam prawą stronę trafionego okrętu; lewy sąsiad i pole powyżej są puste. |
| 5 | 1 (claude) | sonar (9,9) | gracz 1: sonar na polach (9,9) (10,9) (11,9) (12,9) (13,9) (9,10) (10,10) (11,10) (12,10) (13,10) (9,11) (10,11) (11,11) (12,11) (13,11) (9,12) (10,12) (11,12) (12,12) (13,12) (9,13) (10,13) (11,13) (12,13) (13,13) | Okret-1 wroga zatopiony. Zostały lotniskowiec, pancernik, podwodny i niszczyciel, o których nic nie wiem. Ostatnim ładunkiem sonaru sprawdzam nieznany prawy dolny róg. |
| 5 | 0 (codex) | bez reakcji |  | Bez reakcji. Okręt podwodny jest niewidoczny dla sonaru. |
| 5 | 1 (claude) | attack (6,3) | gracz 1: strzał w (6,3) – pudło (z lotniskowca) | Sonar w prawym dolnym rogu nic nie pokazał, więc przenoszę ostrzał na górny środek planszy. Szukam tam dużego lotniskowca. |
| 6 | 0 (codex) | attack (12,9) | gracz 0: strzał w (12,9) – zatopiony niszczyciel-1 (z lotniskowca) | Przedłużam linię dwóch trafień w prawo, by zatopić lub rozpoznać unieruchomiony okręt. |
| 6 | 1 (claude) | buy nalot |  | Mój niszczyciel zatonął, więc sonaru nie kupię. Za punkt biorę nalot: obszar 3×3 da znacznie większą szansę trafienia niż pojedynczy strzał na ślepo. |
| 6 | 1 (claude) | nalot (10,2) | gracz 1: nalot na polach (10,2) (11,2) (12,2) (10,3) (11,3) (12,3) (10,4) (11,4) (12,4) | Używam nalotu na nieostrzelany obszar 3×3 od (10,2). Prawy górny rejon jest jeszcze nieznany, a jeśli trafię, okręt stanie w miejscu i będę go dobijał. |
| 6 | 0 (codex) | bez reakcji | gracz 1: strzał w (11,3) – trafienie (z lotniskowca) | Brak dostępnej obrony przed nalotem na pancernik. |
| 7 | 0 (codex) | buy sonar |  | Kupuję dwa ładunki sonaru za punkt. Pomogą znaleźć kolejny cel bez strzelania na ślepo. |
| 7 | 0 (codex) | sonar (1,1) | gracz 0: sonar na polach (1,1) (2,1) (3,1) (4,1) (5,1) (1,2) (2,2) (3,2) (4,2) (5,2) (1,3) (2,3) (3,3) (4,3) (5,3) (1,4) (2,4) (3,4) (4,4) (5,4) (1,5) (2,5) (3,5) (4,5) (5,5) | Przeszukuję sonarami północno-zachodni obszar, szukając przede wszystkim dużego lotniskowca. |
| 7 | 1 (claude) | bez reakcji |  | Nie mam żadnych ładunków obronnych, więc sonar przeciwnika przechodzi bez reakcji. Zobaczy fragment mojego lotniskowca w lewym górnym rejonie. |
| 7 | 0 (codex) | attack (3,3) | gracz 0: strzał w (3,3) – pudło (z lotniskowca) | Sonar wykrył 4 segmenty w obszarze (1–5,1–5). Strzelam w środek, by trafić i unieruchomić okręt. |
| 7 | 1 (claude) | attack (11,4) | gracz 1: strzał w (11,4) – pudło (z lotniskowca) | Dobijam okręt trafiony w (11,3). Jest unieruchomiony, więc sprawdzam sąsiednie pola. Zaczynam od (11,4). |
| 8 | 0 (codex) | attack (4,2) | gracz 0: strzał w (4,2) – trafienie (z lotniskowca) | Szukam okrętu w obszarze, gdzie ostatni sonar wykrył cztery segmenty. Omijam wcześniejsze pudło. |
| 8 | 1 (claude) | attack (11,2) | gracz 1: strzał w (11,2) – pudło (z lotniskowca) | Dobijam trafiony okręt w (11,3): w dół było pudło, więc teraz sprawdzam pole nad trafieniem. |
| 9 | 0 (codex) | attack (5,2) | gracz 0: strzał w (5,2) – trafienie (z lotniskowca) | Sprawdzam pole obok trafienia (4,2), by ustalić kierunek unieruchomionego okrętu. |
| 9 | 1 (claude) | attack (10,3) | gracz 1: strzał w (10,3) – trafienie (z lotniskowca) | Pudła w (11,2) i (11,4) wokół trafienia (11,3), więc okręt leży poziomo w wierszu 3. To nie lotniskowiec, bo 5×2 zająłby jedno z tych pól. Dobijam w lewo: (10,3). |
| 10 | 0 (codex) | attack (6,2) | gracz 0: strzał w (6,2) – trafienie (z lotniskowca) | Kontynuuję ostrzał wzdłuż dwóch trafionych segmentów, aby ustalić długość i zatopić okręt. |
| 10 | 1 (claude) | attack (9,3) | gracz 1: strzał w (9,3) – trafienie (z lotniskowca) | Dobijam trafiony okręt w wierszu 3. Pudła nad i pod (11,3) wykluczają lotniskowiec, więc to okręt poziomy o długości 3–4. Teraz strzelam w lewo, w (9,3). |
| 11 | 0 (codex) | attack (7,2) | gracz 0: strzał w (7,2) – trafienie (z lotniskowca) | Kontynuuję ostrzał wzdłuż trzech trafień, szukając końca okrętu. |
| 11 | 1 (claude) | attack (8,3) | gracz 1: strzał w (8,3) – zatopiony pancernik-1 (z lotniskowca) | Trafiłem (9,3), (10,3) i (11,3), a okręt wciąż pływa, więc ma 4 pola. Brakuje jednego segmentu: na (8,3) albo na (12,3). Strzelam w (8,3). |
| 12 | 0 (codex) | attack (5,3) | gracz 0: strzał w (5,3) – pudło (z lotniskowca) | Cztery trafienia bez zatopienia sugerują lotniskowiec. Sprawdzam jego drugi rząd. |
| 12 | 1 (claude) | attack (3,9) | gracz 1: strzał w (3,9) – pudło (z lotniskowca) | Pancernik i okret-1 wroga zatopione. Zostały lotniskowiec, podwodny i niszczyciel. Przeczesuję szachownicą duży, nieostrzelany lewy-dolny obszar. |
| 13 | 0 (codex) | attack (5,1) | gracz 0: strzał w (5,1) – trafienie (z lotniskowca); piąte trafienie – rozpoznany typ: lotniskowiec | Sprawdzam drugi rząd domniemanego lotniskowca nad pasmem czterech trafień. |
| 13 | 1 (claude) | attack (2,10) | gracz 1: strzał w (2,10) – pudło (z lotniskowca) | Kontynuuję przeszukiwanie lewego dołu planszy szachownicą. Lotniskowiec przeciwnika zajmuje 10 pól, więc w tym dużym nieodkrytym obszarze szansa trafienia jest spora. |
| 14 | 0 (codex) | attack (6,1) | gracz 0: strzał w (6,1) – trafienie (z lotniskowca); rozpoznany typ: lotniskowiec | Sprawdzam górny rząd prawdopodobnego lotniskowca i kontynuuję dobijanie unieruchomionego celu. |
| 14 | 1 (claude) | buy nalot |  | Kupuję nalot za jedyny punkt, póki mój lotniskowiec jeszcze żyje. Nalot w obszarze 3×3 ma dużo większą szansę na trafienie niż pojedynczy strzał. |
| 14 | 1 (claude) | nalot (0,4) | gracz 1: nalot na polach (0,4) (1,4) (2,4) (0,5) (1,5) (2,5) (0,6) (1,6) (2,6) | Zużywam nalot, póki mój lotniskowiec jeszcze żyje. Celuję w nieostrzelany lewy bok (x0-2, y4-6), gdzie może pływać wrogi lotniskowiec 5×2. |
| 14 | 0 (codex) | bez reakcji |  | Nalot omija nasze okręty; bez reakcji. |
| 15 | 0 (codex) | attack (4,1) | gracz 0: strzał w (4,1) – trafienie (z lotniskowca); rozpoznany typ: lotniskowiec | Sprawdzam pole nad trafieniem (4,2), aby potwierdzić obrys możliwego lotniskowca. |
| 15 | 1 (claude) | attack (5,11) | gracz 1: strzał w (5,11) – pudło (z lotniskowca) | Bez ładunków strzelam szachownicą w lewy dół planszy. Ta część jest jeszcze nieostrzelana, a przeciwnikowi zostały lotniskowiec 5×2, podwodny i niszczyciel. |
| 16 | 0 (codex) | attack (7,1) | gracz 0: strzał w (7,1) – trafienie (z lotniskowca); rozpoznany typ: lotniskowiec | Sprawdzam (7,1), domykając prostokąt trafień i ustalając kształt unieruchomionych okrętów. |
| 16 | 1 (claude) | attack (10,11) | gracz 1: strzał w (10,11) – trafienie (z lotniskowca) | Strzelam w duży, nieostrzelany obszar w prawym dolnym rogu. Lotniskowiec 5×2 łatwo tam namierzyć siatką co drugie pole. |
| 17 | 0 (codex) | attack (8,1) | gracz 0: strzał w (8,1) – pudło (z lotniskowca) | Sprawdzam prawy koniec trafionego prostokąta — możliwy ostatni słupek lotniskowca. |
| 17 | 1 (claude) | attack (11,11) | gracz 1: strzał w (11,11) – pudło (z lotniskowca) | Dobijam okręt trafiony w (10,11). Trafiony okręt stoi w miejscu, więc sprawdzam sąsiednie pola, zaczynając od (11,11). |
| 18 | 0 (codex) | attack (3,1) | gracz 0: strzał w (3,1) – trafienie (z lotniskowca); rozpoznany typ: lotniskowiec | Sprawdzam lewy koniec trafionego prostokąta; pudło po prawej wskazuje na lotniskowiec rozciągnięty w lewo. |
| 18 | 1 (claude) | attack (9,11) | gracz 1: strzał w (9,11) – pudło (z lotniskowca) | Dobijam okręt trafiony w (10,11). Pole (11,11) okazało się pudłem, więc sprawdzam lewego sąsiada (9,11). |
| 19 | 0 (codex) | attack (3,2) | gracz 0: strzał w (3,2) – zatopiony lotniskowiec-1 (z lotniskowca) | Strzelam w ostatnie pole przypuszczalnego lotniskowca, aby go zatopić. |
| 19 | 1 (claude) | attack (10,10) | gracz 1: strzał w (10,10) – trafienie (z lotniska lądowego) | Dobijam okręt trafiony w (10,11). Pola (9,11) i (11,11) to pudła, więc okręt leży pionowo. Sprawdzam pole nad trafieniem. |
| 20 | 0 (codex) | sonar (0,4) | gracz 0: sonar na polach (0,4) (1,4) (2,4) (3,4) (4,4) (0,5) (1,5) (2,5) (3,5) (4,5) (0,6) (1,6) (2,6) (3,6) (4,6) (0,7) (1,7) (2,7) (3,7) (4,7) (0,8) (1,8) (2,8) (3,8) (4,8) | Sprawdzam lewą część planszy, szukając pancernika lub krążownika przed zakupem uzbrojenia. |
| 20 | 1 (claude) | bez reakcji |  | Nie mam żadnych ładunków reakcji, więc nie odpowiadam na sonar. Sonar nie widzi okrętu podwodnego, ale wykryje segment okret-1 na (4,8). |
| 20 | 0 (codex) | buy zwiad |  | Sonar wykrył jeden segment przy granicy obszaru. Kupuję zwiad, żeby ustalić jego pozycję przed atakiem. |
| 20 | 0 (codex) | zwiad (3,3) | gracz 0: zwiad na polach (3,3) (4,3) (5,3) (3,4) (4,4) (5,4) (3,5) (4,5) (5,5) | Sprawdzam granicę obszaru sonaru: pojedynczy segment sugeruje okręt wystający poza badany kwadrat. |
| 20 | 1 (claude) | bez reakcji |  | Nie mam ładunków reakcji, więc brak obrony. Zwiad na (3..5,3..5) i tak raczej nic nie znajdzie, bo mój podwodny stoi w wierszu y6, tuż pod obszarem. |
| 20 | 0 (codex) | buy nalot |  | Kupuję nalot, by przeszukać granicę obszaru, w którym sonar wykrył segment. |
| 20 | 0 (codex) | nalot (3,6) | gracz 0: nalot na polach (3,6) (4,6) (5,6) (3,7) (4,7) (5,7) (3,8) (4,8) (5,8) | Nalot przy granicy obszaru sonaru: próbuję trafić i unieruchomić wykryty okręt. |
| 20 | 1 (claude) | bez reakcji | gracz 0: strzał w (4,8) – trafienie (z lotniskowca) | Nie mam ładunków reakcji, więc nalot na (3-5,6-8) przyjmuję bez obrony. Zagrożone są podwodny na y6 i okret-1 w (4,8). |
| 20 | 1 (claude) | attack (10,9) | gracz 1: strzał w (10,9) – zatopiony podwodny-1 (z lotniska lądowego) | Dobijam okręt w kolumnie x=10. Trafienia (10,10) i (10,11), a pudła na (9,11) i (11,11) wykluczają lotniskowiec 5×2, więc to statek długości 3. Strzelam w (10,9), w razie pudła zostaje (10,12). |
| 21 | 0 (codex) | attack (5,8) | gracz 0: strzał w (5,8) – pudło (z lotniskowca) | Sprawdzam pole na prawo od trafienia, aby ustalić kierunek unieruchomionego okrętu. |
| 21 | 1 (claude) | attack (6,12) | gracz 1: strzał w (6,12) – pudło (z lotniska lądowego) | Szukam lotniskowca 5x2 i niszczyciela 3x1. Strzelam w szeroki, nieostrzelany pas na dole planszy. |
| 22 | 0 (codex) | attack (4,9) | gracz 0: strzał w (4,9) – trafienie (z lotniskowca) | Sprawdzam pole pod trafieniem (4,8), szukając pionowego okrętu. |
| 22 | 1 (claude) | attack (3,2) | gracz 1: strzał w (3,2) – trafienie (z lotniska lądowego) | Zostały lotniskowiec 5×2 i niszczyciel. Strzelam w środek dużego nieostrzelanego obszaru w lewym górnym rogu. Tam lotniskowiec 5×2 ma najwięcej możliwych ustawień. |
| 23 | 0 (codex) | attack (4,10) | gracz 0: strzał w (4,10) – zatopiony okret-1 (z lotniskowca) | Kontynuuję ostrzał wzdłuż dwóch trafień, próbując zatopić unieruchomiony okręt. |
| 23 | 1 (claude) | attack (4,2) | gracz 1: strzał w (4,2) – pudło (z lotniska lądowego) | Trafiliśmy w (3,2) i ten okręt stoi teraz w miejscu. Dobijam go od sąsiednich pól. Najpierw strzelam w prawo, w (4,2), bo duży lotniskowiec 5×2 jest tu bardziej prawdopodobny. |
| 24 | 0 (codex) | buy sonar |  | Kupuję dwa ładunki sonaru, by odnaleźć pozostały pancernik. Okręt podwodny jest niewidoczny dla sonaru. |
| 24 | 0 (codex) | sonar (8,3) | gracz 0: sonar na polach (8,3) (9,3) (10,3) (11,3) (12,3) (8,4) (9,4) (10,4) (11,4) (12,4) (8,5) (9,5) (10,5) (11,5) (12,5) (8,6) (9,6) (10,6) (11,6) (12,6) (8,7) (9,7) (10,7) (11,7) (12,7) | Sprawdzam prawą środkową część planszy, szukając pozostałego pancernika. |
| 24 | 1 (claude) | bez reakcji |  | Nie mam ładunków obronnych, więc brak reakcji. Sonar przeciwnika obejmuje mój pancernik. |
| 24 | 0 (codex) | attack (10,5) | gracz 0: strzał w (10,5) – pudło (z lotniskowca) | Sonar wykrył trzy segmenty pancernika. Strzelam w środek obszaru, gdzie przecinają się najbardziej prawdopodobne ustawienia. |
| 24 | 1 (claude) | attack (2,2) | gracz 1: strzał w (2,2) – trafienie (z lotniska lądowego) | Dobijam okręt trafiony w (3,2). Pudło w (4,2) wyklucza poziomy lotniskowiec. Jeśli to lotniskowiec, stoi pionowo w kolumnach 2-3, więc (2,2) na pewno jest trafieniem. Pasuje też do poziomego niszczyciela x1-3. |
| 25 | 0 (codex) | sonar (8,5) | gracz 0: sonar na polach (8,5) (9,5) (10,5) (11,5) (12,5) (8,6) (9,6) (10,6) (11,6) (12,6) (8,7) (9,7) (10,7) (11,7) (12,7) (8,8) (9,8) (10,8) (11,8) (12,8) (8,9) (9,9) (10,9) (11,9) (12,9) | Sprawdzam dolną część rejonu ostatniego kontaktu, aby zawęzić pozycję pancernika przed strzałem. |
| 25 | 1 (claude) | bez reakcji |  | Nie mam ładunków obronnych, jedyna możliwa reakcja to brak reakcji. Sonar przeciwnika złapie fragment mojego pancernika w kolumnie 9. |
| 25 | 0 (codex) | attack (9,6) | gracz 0: strzał w (9,6) – trafienie (z lotniskowca) | Strzelam w przecięcie najbardziej prawdopodobnych pozycji pancernika po obu sonarach. |
| 25 | 1 (claude) | attack (2,3) | gracz 1: strzał w (2,3) – trafienie (z lotniska lądowego) | Dobijam okręt trafiony w (2,2) i (3,2). Pionowy lotniskowiec w kolumnach 2-3 zawsze obejmuje wiersz 3, więc (2,3) to najpewniejsze pole. |
| 26 | 0 (codex) | attack (9,5) | gracz 0: strzał w (9,5) – trafienie (z lotniskowca) | Sprawdzam pole nad trafieniem, aby ustalić kierunek unieruchomionego okrętu. |
| 26 | 1 (claude) | attack (3,3) | gracz 1: strzał w (3,3) – trafienie (z lotniska lądowego) | Trafienia (2,2), (3,2) i (2,3) tworzą literę L. Najpewniej to lotniskowiec ustawiony pionowo w kolumnach 2-3, więc dobijam pole (3,3) w środku tego układu. |
| 27 | 0 (codex) | attack (9,4) | gracz 0: strzał w (9,4) – trafienie (z lotniskowca) | Dwa trafienia wyznaczają pionowy okręt. Sprawdzam przedłużenie na północ, zgodnie ze wskazaniami sonaru. |
| 27 | 1 (claude) | attack (2,4) | gracz 1: strzał w (2,4) – trafienie (z lotniska lądowego); piąte trafienie – rozpoznany typ: lotniskowiec | Kwadrat 2×2 trafień w (2-3,2-3) wskazuje na pionowy lotniskowiec w kolumnach 2-3. Pudło w (4,2) wyklucza wariant poziomy, więc szukam jego końca: strzelam w (2,4). |
| 28 | 0 (codex) | attack (9,3) | gracz 0: strzał w (9,3) – zatopiony pancernik-1 (z lotniskowca) | Sprawdzam północny koniec trafionego okrętu; sonary wskazują na pancernik. |
| 28 | 1 (claude) | attack (3,4) | gracz 1: strzał w (3,4) – trafienie (z lotniska lądowego); rozpoznany typ: lotniskowiec | Trafienie w (2,4) potwierdza pionowy lotniskowiec w kolumnach 2-3. Pole (3,4) należy do niego w każdym możliwym ułożeniu, więc to pewny strzał. |
| 29 | 0 (codex) | buy nalot |  | Kupuję nalot: przeciw ostatniemu, niewidocznemu dla sonaru okrętowi podwodnemu przeszuka jednocześnie dziewięć pól. |
| 29 | 0 (codex) | nalot (6,10) | gracz 0: nalot na polach (6,10) (7,10) (8,10) (6,11) (7,11) (8,11) (6,12) (7,12) (8,12) | Przeszukuję nalotem nieostrzelany obszar, szukając ostatniego okrętu podwodnego. |
| 29 | 1 (claude) | bez reakcji |  | Nalot spada na (6-8, 10-12), a mój okręt podwodny stoi w (3-5,6), więc poza obszarem. Nie mam też ładunków manewru, dlatego zostawiam bez reakcji. |
| 29 | 1 (claude) | attack (2,1) | gracz 1: strzał w (2,1) – trafienie (z lotniska lądowego); rozpoznany typ: lotniskowiec | Lotniskowiec stoi pionowo w kolumnach 2-3 i obejmuje wiersze 2-4. Pole (2,1) leży w dwóch z trzech możliwych ustawień. Nalot z r14 sugeruje, że wariant schodzący do wiersza 6 odpada. |
| 30 | 0 (codex) | attack (6,6) | gracz 0: strzał w (6,6) – pudło (z lotniskowca) | Szukam ostatniego okrętu podwodnego w nieostrzelanym centrum planszy. |
| 30 | 1 (claude) | attack (3,1) | gracz 1: strzał w (3,1) – trafienie (z lotniska lądowego); rozpoznany typ: lotniskowiec | Trafienie w (2,1) potwierdza, że lotniskowiec stoi pionowo w kolumnach 2-3 i obejmuje wiersze 1-4. Pole (3,1) musi więc być jego segmentem. Dobijam go zwykłym strzałem i zostawiam punkty na obronę. |
| 31 | 0 (codex) | attack (3,6) | gracz 0: strzał w (3,6) – pudło (z lotniskowca) | Przeszukuję słabo sprawdzoną lewą część planszy, szukając ostatniego okrętu podwodnego. |
| 31 | 1 (claude) | attack (2,0) | gracz 1: strzał w (2,0) – pudło (z lotniska lądowego) | Dobijam unieruchomiony lotniskowiec w kolumnach 2-3. Ma już 8 trafień w wierszach 1-4, więc brakuje rzędu 0 albo 5. Sprawdzam (2,0). |
| 32 | 0 (codex) | attack (7,7) | gracz 0: strzał w (7,7) – pudło (z lotniskowca) | Sprawdzam środek planszy, szukając ostatniego okrętu podwodnego. Trafienie zatrzyma jego ruch. |
| 32 | 1 (claude) | buy torpeda |  | Kupuję torpedę. Lotniskowiec stoi w x2-3, y1-5, a jego brakujące segmenty to (2,5) i (3,5). Pozioma torpeda od (2,5) trafi oba naraz i zatopi go w jednej turze. |
| 32 | 1 (claude) | torpeda (2,5) poziomo | gracz 1: torpeda na polach (2,5) (3,5) (4,5) (5,5) (6,5) | Torpeda wzdłuż wiersza 5 od (2,5). Lotniskowiec wroga stoi unieruchomiony w x2-3, y1-5, a pole (2,0) to pudło. Brakują mu tylko (2,5) i (3,5), więc torpeda powinna trafić oba pola naraz i go zatopić. |
| 32 | 0 (codex) | bez reakcji | torpeda: pominięte pola już ostrzelane (4,5) (5,5) (6,5); gracz 1: strzał w (2,5) – trafienie (z lotniska lądowego); rozpoznany typ: lotniskowiec; gracz 1: strzał w (3,5) – zatopiony lotniskowiec-1 (z lotniska lądowego) | Brak dostępnej obrony przed torpedą. |
| 33 | 0 (codex) | attack (2,10) | gracz 0: strzał w (2,10) – pudło (z lotniska lądowego) | Przeszukuję słabo ostrzelany lewy dolny sektor. Jedno trafienie unieruchomi ostatni okręt i da punkt. |
| 33 | 1 (claude) | attack (11,7) | gracz 1: strzał w (11,7) – pudło (z lotniska lądowego) | Lotniskowiec zatopiony! Wrogowi został tylko niszczyciel 3x1. Zaczynam przeszukiwać duży niezbadany obszar po prawej stronie planszy. |
| 34 | 0 (codex) | attack (11,4) | gracz 0: strzał w (11,4) – pudło (z lotniska lądowego) | Przeszukuję słabo ostrzelany prawy górny sektor, szukając ostatniego okrętu podwodnego. |
| 34 | 1 (claude) | attack (1,12) | gracz 1: strzał w (1,12) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela wroga. Strzelam w lewy dolny róg, czyli duży obszar, w który jeszcze nie strzelałem. |
| 35 | 0 (codex) | attack (6,11) | gracz 0: strzał w (6,11) – pudło (z lotniska lądowego) | Sprawdzam dolną część planszy. Okręt podwodny mógł tu dopłynąć od ostatniego nalotu. |
| 35 | 1 (claude) | attack (12,5) | gracz 1: strzał w (12,5) – pudło (z lotniska lądowego) | Polowanie na ostatni niszczyciel wroga. Strzelam w prawy pas x12-13, którego jeszcze nie zbadałem. |
| 36 | 0 (codex) | attack (1,4) | gracz 0: strzał w (1,4) – pudło (z lotniska lądowego) | Przeszukuję słabo ostrzelaną lewą część planszy, szukając ostatniego okrętu podwodnego. |
| 36 | 1 (claude) | attack (10,12) | gracz 1: strzał w (10,12) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela przeciwnika. Prawy dół planszy (y12-13) jest jeszcze nieostrzelany, więc strzelam w (10,12). |
| 37 | 0 (codex) | attack (12,6) | gracz 0: strzał w (12,6) – pudło (z lotniska lądowego) | Przeszukuję prawą część planszy, szukając ostatniego okrętu podwodnego. |
| 37 | 1 (claude) | attack (12,8) | gracz 1: strzał w (12,8) – pudło (z lotniska lądowego) | Przeciwnikowi został jeden niszczyciel 3x1. Przeczesuję duży niezbadany obszar po prawej stronie, między x9-13 a y5-10, strzałami co kilka pól. |
| 38 | 0 (codex) | attack (8,12) | gracz 0: strzał w (8,12) – pudło (z lotniska lądowego) | Przeszukuję słabo ostrzelaną dolną część planszy, szukając ostatniego okrętu podwodnego. |
| 38 | 1 (claude) | attack (8,1) | gracz 1: strzał w (8,1) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela w dużym nieostrzelanym pasie u góry po prawej (x4-13, y0-1). Strzelam w jego środek, (8,1). |
| 39 | 0 (codex) | attack (1,8) | gracz 0: strzał w (1,8) – pudło (z lotniska lądowego) | Przeszukuję słabo ostrzelany lewy sektor, szukając ostatniego okrętu podwodnego. |
| 39 | 1 (claude) | attack (11,0) | gracz 1: strzał w (11,0) – pudło (z lotniska lądowego) | Przeciwnikowi został jeden niszczyciel 3×1. Przeczesuję systematycznie nieostrzelany górny pas planszy, zaczynając od prawej strony. |
| 40 | 0 (codex) | attack (6,9) | gracz 0: strzał w (6,9) – pudło (z lotniska lądowego) | Sprawdzam środek nieostrzelanego obszaru, szukając ostatniego okrętu podwodnego. |
| 40 | 1 (claude) | attack (5,0) | gracz 1: strzał w (5,0) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela wroga. Zgodnie z planem przeczesuję górny pas planszy, gdzie zostało sporo nieostrzelanych pól. |
| 41 | 0 (codex) | attack (7,10) | gracz 0: strzał w (7,10) – pudło (z lotniska lądowego) | Sprawdzam otwarty obszar na dole planszy, szukając ostatniego okrętu podwodnego. |
| 41 | 1 (claude) | attack (12,1) | gracz 1: strzał w (12,1) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela wroga. Systematycznie przeczesuję niezbadane rejony, teraz górny prawy pas. |
| 42 | 0 (codex) | attack (2,7) | gracz 0: strzał w (2,7) – pudło (z lotniska lądowego) | Przeszukuję lewą część planszy, szukając ostatniego okrętu podwodnego. |
| 42 | 1 (claude) | attack (3,13) | gracz 1: strzał w (3,13) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela wroga. Sprawdzam dolny wiersz, który jest jeszcze nieostrzelany. Nie mam ładunków, więc zostaje mi zwykły strzał. |
| 43 | 0 (codex) | attack (11,11) | gracz 0: strzał w (11,11) – pudło (z lotniska lądowego) | Przeszukuję dolną prawą część planszy, szukając ostatniego okrętu podwodnego. |
| 43 | 1 (claude) | attack (8,13) | gracz 1: strzał w (8,13) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela wroga i ostrzeliwuję nieprzeszukane rejony planszy, tym razem dolną krawędź. |
| 44 | 0 (codex) | attack (11,2) | gracz 0: strzał w (11,2) – pudło (z lotniska lądowego) | Szukam ostatniego okrętu podwodnego w słabo sprawdzonej prawej górnej części planszy. |
| 44 | 1 (claude) | attack (13,12) | gracz 1: strzał w (13,12) – pudło (z lotniska lądowego) | Polowanie na ostatni niszczyciel. Przeczesuję prawy dolny róg (13,12), którego jeszcze nie sprawdzałem. Potem przejdę do prawej kolumny i środka. |
| 45 | 0 (codex) | attack (6,4) | gracz 0: strzał w (6,4) – pudło (z lotniska lądowego) | Sprawdzam środkowy, słabo ostrzelany obszar, szukając ostatniego okrętu podwodnego. |
| 45 | 1 (claude) | attack (10,6) | gracz 1: strzał w (10,6) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela wroga. Strzelam w (10,6), w nieprzeszukany pas po prawej stronie środka planszy, gdzie okręt mógł patrolować. |
| 46 | 0 (codex) | attack (3,12) | gracz 0: strzał w (3,12) – pudło (z lotniska lądowego) | Przeszukuję dolny pas planszy, gdzie podwodny nadal ma dużo miejsca do patrolowania. |
| 46 | 1 (claude) | attack (13,10) | gracz 1: strzał w (13,10) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela. Strzelam w prawą krawędź (13,10), w nieostrzelany rejon na wschodzie. |
| 47 | 0 (codex) | attack (5,5) | gracz 0: strzał w (5,5) – pudło (z lotniska lądowego) | Sprawdzam środek otwartego obszaru, gdzie może mieścić się podwodny długości 3. |
| 47 | 1 (claude) | buy kontrwywiad |  | Kupuję kontrwywiad za ostatni punkt. Jeśli wróg użyje zwiadu na mój ostatni okręt, podwodny pozostanie ukryty. Zakup nie kończy tury, więc zaraz strzelam. |
| 47 | 1 (claude) | attack (9,8) | gracz 1: strzał w (9,8) – pudło (z lotniska lądowego) | Polujemy na ostatni niszczyciel wroga. Strzelam w (9,8), wolne pole między pudłami w tym rejonie. |
| 48 | 0 (codex) | attack (11,7) | gracz 0: strzał w (11,7) – pudło (z lotniska lądowego) | Sprawdzam prawy sektor: pole pasuje do kilku możliwych ustawień ostatniego okrętu podwodnego. |
| 48 | 1 (claude) | attack (13,6) | gracz 1: strzał w (13,6) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela przeciwnika. Strzelam w (13,6), nieostrzelany prawy skraj, gdzie zostało sporo wolnego miejsca dla okrętu 3×1. |
| 49 | 0 (codex) | attack (8,8) | gracz 0: strzał w (8,8) – pudło (z lotniska lądowego) | Szukam ostatniego okrętu podwodnego na przecięciu możliwych ustawień długości 3. |
| 49 | 1 (claude) | attack (10,8) | gracz 1: strzał w (10,8) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela. Strzelam w (10,8), zgodnie z planem przeszukiwania prawej strony planszy. |
| 50 | 0 (codex) | attack (2,5) | gracz 0: strzał w (2,5) – pudło (z lotniska lądowego) | Przeszukuję lewą część planszy, gdzie pozostało wiele możliwych ustawień trzysegmentowego okrętu podwodnego. |
| 50 | 1 (claude) | attack (6,9) | gracz 1: strzał w (6,9) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela 3x1. Strzelam w środek dużego nieostrzelanego obszaru na dole planszy (x4-9, y8-12), gdzie zmieści się patrolujący okręt. |
| 51 | 0 (codex) | attack (1,11) | gracz 0: strzał w (1,11) – pudło (z lotniska lądowego) | Przeszukuję słabo ostrzelany lewy dolny sektor, gdzie może patrolować ostatni okręt podwodny. |
| 51 | 1 (claude) | attack (4,11) | gracz 1: strzał w (4,11) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela. Strzelam w (4,11), w mało sprawdzony rejon na dole po lewej. |
| 52 | 0 (codex) | attack (12,3) | gracz 0: strzał w (12,3) – pudło (z lotniska lądowego) | Sprawdzam słabo ostrzelany prawy sektor, szukając ostatniego okrętu podwodnego. |
| 52 | 1 (claude) | attack (8,10) | gracz 1: strzał w (8,10) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela wroga. Strzelam w (8,10), środek niezbadanej kieszeni między pudłami w prawej dolnej części planszy. |
| 53 | 0 (codex) | attack (12,12) | gracz 0: strzał w (12,12) – pudło (z lotniska lądowego) | Sprawdzam słabo ostrzelany prawy dolny sektor, gdzie może patrolować ostatni okręt podwodny. |
| 53 | 1 (claude) | attack (6,4) | gracz 1: strzał w (6,4) – pudło (z lotniska lądowego) | Wrogowi został tylko niszczyciel 3x1. Strzelam w (6,4), pole z listy celów: to luka w środku planszy między pudłami. |
| 54 | 0 (codex) | attack (7,5) | gracz 0: strzał w (7,5) – pudło (z lotniska lądowego) | Sprawdzam lukę między ostrzelanymi polami, szukając ostatniego okrętu podwodnego. |
| 54 | 1 (claude) | attack (5,2) | gracz 1: strzał w (5,2) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela 3x1. Strzelam w (5,2), duża niezbadana luka między zatopionym lotniskowcem a pancernikiem. |
| 55 | 0 (codex) | attack (10,12) | gracz 0: strzał w (10,12) – pudło (z lotniska lądowego) | Sprawdzam dolny sektor, gdzie pozostało miejsce na trzypolowy okręt podwodny w obu orientacjach. |
| 55 | 1 (claude) | attack (3,7) | gracz 1: strzał w (3,7) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela 3x1 w dużym niezbadanym obszarze na lewo od środka (wiersze 6-9, kolumny 0-6). Pole (3,7) leży w jego środku, więc może trafić okręt ustawiony poziomo albo pionowo. |
| 56 | 0 (codex) | attack (5,11) | gracz 0: strzał w (5,11) – pudło (z lotniska lądowego) | Sprawdzam lukę, w której podwodny może mieścić się zarówno pionowo, jak i poziomo. |
| 56 | 1 (claude) | attack (0,8) | gracz 1: strzał w (0,8) – pudło (z lotniska lądowego) | Przeciwnikowi został tylko niszczyciel 3×1. Sprawdzam lewą krawędź planszy (kolumny 0-1), bo prawie tam nie strzelałem. |
| 57 | 0 (codex) | attack (1,2) | gracz 0: strzał w (1,2) – pudło (z lotniska lądowego) | Sprawdzam słabo ostrzelany lewy górny sektor, gdzie nadal może ukrywać się okręt podwodny. |
| 57 | 1 (claude) | attack (1,10) | gracz 1: strzał w (1,10) – pudło (z lotniska lądowego) | Przeciwnikowi został tylko niszczyciel. Przeczesuję słabo zbadane kolumny 0-1 i strzelam w (1,10). |
| 58 | 0 (codex) | attack (8,10) | gracz 0: strzał w (8,10) – pudło (z lotniska lądowego) | Sprawdzam lukę między ostrzelanymi polami, gdzie może mieścić się trzysegmentowy podwodny. |
| 58 | 1 (claude) | attack (1,7) | gracz 1: strzał w (1,7) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela na zachodniej flance. Kolumny 0–1 i wiersze 6–9 przy lewej krawędzi są prawie niezbadane, a niszczyciel patroluje blisko swojej pozycji startowej. |
| 59 | 0 (codex) | attack (3,9) | gracz 0: strzał w (3,9) – pudło (z lotniska lądowego) | Sprawdzam lukę, w której może mieścić się ostatni okręt podwodny. |
| 59 | 1 (claude) | attack (5,8) | gracz 1: strzał w (5,8) – pudło (z lotniska lądowego) | Strzelam w (5,8), środek dużego nieostrzelanego bloku x4-7, y7-10. W tym obszarze może patrolować ostatni niszczyciel przeciwnika. |
| 60 | 0 (codex) | attack (10,1) | gracz 0: strzał w (10,1) – pudło (z lotniska lądowego) | Przeszukuję słabo ostrzelany prawy górny sektor, gdzie nadal mieści się podwodny długości 3. |
| 60 | 1 (claude) | attack (6,10) | gracz 1: strzał w (6,10) – pudło (z lotniska lądowego) | Polowanie na ostatni niszczyciel 3x1. Przeczesuję słabo zbadany blok x4-7, y7-10. |
| 61 | 0 (codex) | attack (4,4) | gracz 0: strzał w (4,4) – pudło (z lotniska lądowego) | Sprawdzam lukę, w której pozostały podwodny może mieścić się zarówno poziomo, jak i pionowo. |
| 61 | 1 (claude) | attack (4,8) | gracz 1: strzał w (4,8) – pudło (z lotniska lądowego) | Szukam ostatniego niszczyciela w słabo zbadanym bloku x4-7, y7-10. Pole (4,8) przecina najwięcej możliwych ułożeń okrętu 3×1: dwa pionowe w kolumnie 4 i jedno poziome w wierszu 8. |
| 62 | 0 (codex) | attack (9,11) | gracz 0: strzał w (9,11) – pudło (z lotniska lądowego) | Sprawdzam lukę, w której trzysegmentowy okręt może leżeć w obu osiach. |
| 62 | 1 (claude) | attack (4,9) | gracz 1: strzał w (4,9) – pudło (z lotniska lądowego) | Przeciwnikowi został tylko niszczyciel 3x1. Przeczesuję środek planszy przy niedawnych pudłach, bo okręt na patrolu trzyma się blisko miejsca startu. |
| 63 | 0 (codex) | attack (13,10) | gracz 0: strzał w (13,10) – pudło (z lotniska lądowego) | Sprawdzam prawą krawędź: to pole pasuje do kilku możliwych ustawień ostatniego okrętu. |
| 63 | 1 (claude) | attack (5,10) | gracz 1: strzał w (5,10) – trafienie (z lotniska lądowego) | Wrogowi został tylko niszczyciel 3x1. Strzelam w kolejne pole z listy celów, (5,10), żeby domknąć słabo zbadany obszar w centrum-dole. |
| 64 | 0 (codex) | attack (0,6) | gracz 0: strzał w (0,6) – pudło (z lotniska lądowego) | Sprawdzam lewą krawędź: to pole pasuje do kilku możliwych ustawień ostatniego okrętu podwodnego. |
| 64 | 1 (claude) | attack (4,10) | gracz 1: strzał w (4,10) – trafienie (z lotniska lądowego) | Dobijam niszczyciel trafiony w (5,10). Pola (6,10), (5,11) i (5,8) to pudła, więc okręt musi leżeć poziomo na (3..5,10). Strzelam w (4,10). |
| 65 | 0 (codex) | attack (8,4) | gracz 0: strzał w (8,4) – pudło (z lotniska lądowego) | Sprawdzam środek długiego, nieostrzelanego pasa — może kryć ostatni okręt podwodny. |
| 65 | 1 (claude) | attack (3,10) | gracz 1: strzał w (3,10) – zatopiony niszczyciel-1 (z lotniska lądowego); koniec partii: wygrywa gracz 1 | Niszczyciel trafiony w (4,10) i (5,10) leży poziomo. Pole (6,10) to pudło, więc trzeci segment musi być na (3,10). Strzelam tam, żeby go zatopić. |

## Po partii

- Gracz 0 (codex): zadane trafienia 20; użyte reakcje brak; pozostałe ładunki brak; niewydane punkty 0; notatka końcowa: R65 strzał (8,4), wynik oczekiwany. Pozostał podwodny długości 3; brak aktywnych trafień. (0,6) i (13,10) pudła. Nasz ostatni okręt ma tylko jeden nietrafiony segment (3,10); (4,10),(5,10) trafione. Brak ładunków i punktów, punkt po następnym trafieniu. Po trafieniu natychmiast sprawdzać orientację i dobijać. Sonar nie wykrywa podwodnego. Szukać ciągów 3 wolnych pól, także przy krawędziach.
- Gracz 1 (claude): zadane trafienia 23; użyte reakcje dym, manewr; pozostałe ładunki kontrwywiad 1; niewydane punkty 1; notatka końcowa: r65: strzał w (3,10), żeby dobić niszczyciel (4,10)(5,10). (6,10) to pudło, pion odpada. Jeśli (3,10) okaże się pudłem, przeanalizować ponownie, np. czy okręt odpłynął. Mam kontrwywiad 1 i 1 punkt. Mój ostatni okręt to podwodny na (3-5,7).
