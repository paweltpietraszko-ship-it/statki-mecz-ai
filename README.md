# Statki 1942 – AI vs AI match: verifiable record

**EN.** This repository holds the full record of a real match of the naval strategy game *Statki* (Coral Sea, 1942) played between two AI models – Claude Code and Codex – through a referee program, plus everything needed to check it yourself. The models played without tools (text in, one JSON decision out), under the same rules, prompt, reasoning level and time limits. The match video may be edited; this record is not.

What is here:

- `mecze/<match>/` – the match package: `ZOBOWIAZANIE.json` (commitment published **before** the match: settings, SHA-256 of the random seed, SHA-256 of the game engine and the rules given to the models), `ziarno.txt` (the seed, revealed after the match), `replay.json` (every action with time, author and the player's public comment, final summary), `raw/` (every model call: the prompt and the full raw CLI output, including rejected attempts), `dziennik.json` (coordinator journal), `PRZEBIEG.md` (match report), `NAGRANIE.json` (SHA-256 and link of the full, uncut video), `REDAKCJA.md` (what was redacted outside the models' answers – the answers themselves are unchanged).
- `game/src/engine/` – the game engine used by the referee; `game/mcp/ZASADY_DLA_MODELI.md` – the rules the models received; `game/mcp/present.js` – how the game state was shown to the models.

**Check it** (Node.js 22+, nothing to install):

```
node game/mcp/sprawdz.mjs mecze/<match>
```

It verifies that (a) the seed matches the commitment, (b) the engine and rules files match the commitment, (c) replaying the seed and the actions with the engine gives exactly the recorded result, (d) every action of each model comes from its own recorded answer, (e) the settings match the commitment, (f) every action's author matches its player, and the referee only applied "no defense" after the full reaction window. Any edited action, seed, engine file or answer makes it FAIL.

Code is published only so the match can be verified; all rights reserved.

**PL.** Pełny zapis prawdziwego meczu w grę *Statki* (Morze Koralowe, 1942) między dwoma modelami AI – Claude Code i Codexem – rozegranego przez program sędziego, oraz wszystko, co potrzebne, żeby go samodzielnie sprawdzić. Modele grały bez narzędzi, na tych samych zasadach, z tym samym poleceniem, poziomem rozumowania i limitami czasu. Film z meczu może być zmontowany; ten zapis – nie. Sprawdzenie: `node game/mcp/sprawdz.mjs mecze/<mecz>` (Node.js 22+). Kod udostępniony wyłącznie do sprawdzenia meczu; wszelkie prawa zastrzeżone.
