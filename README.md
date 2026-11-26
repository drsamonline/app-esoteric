# Esoteric

A cross-cultural dictionary of symbols. **The same symbol in two cultures is two entries**, each
attributed and each sourced — and the app never tells you what a symbol means.

- **Demo:** https://drsamonline.github.io/app-esoteric/play/index.html
- **Landing page:** https://drsamonline.github.io/app-esoteric/
- **Release:** https://github.com/drsamonline/app-esoteric/releases/tag/app-latest
- **Plan row:** #21 of 37 in `drsamonline/forge` → `QUEUE/PLAN.json`
- **Specs absorbed:** `app-symbology` (lead), `app-tree-of-life`, `app-sacred-geometry`, `app-mantra`
- **Licence:** PolyForm Noncommercial 1.0.0

## Status

| | |
|---|---|
| **Built** | Seven symbols, seventeen entries; every entry names its tradition and source; search across traditions that says when more than one applies; no-match said with the terms used and no nearby symbol offered; notes with an explicit **unsorted** state; read-only bundle that a broken note file cannot touch. |
| **Release** | Windows EXE, Android APK and Linux binary, built from this source by `app-builder` in CI. |
| **Not built** | **A complete dictionary.** Seven symbols is a demonstration of the structure, not a dictionary — said on the page, in the app, in NOTICE and here. |
| **Untested** | Whether any particular attribution satisfies a scholar of that tradition. The app's claim is narrow — *this tradition has been read this way, and here is where that was read* — and the bundle carries no quotations or page numbers, because a citation this project cannot verify to the page is not a citation. |

## The spec's "done means", counted

> "searching a symbol returns entries from more than one tradition, each sourced."

| Symbol | Traditions | Entries |
|---|---|---|
| lotus | Hindu · Buddhist · Ancient Egyptian | 3 |
| serpent | Hindu · Ancient Greek · Jewish and Christian | 3 |
| tree | Norse · Buddhist · Kabbalistic | 3 |

And every entry is asserted to carry a source of real length, not a placeholder.

## The rule that shapes everything: no single meaning

There is no `meaning` field in the engine — the field is `reading`, and every reading belongs to a
tradition. Merging the traditions into one line would be the one thing the spec forbids, so the mutation
that *merges them* fails seven assertions.

## What it will not do

- **Give a single meaning.** Meanings are attributed and sourced.
- **Offer a nearby symbol as the one you asked for.** A near miss shown as an answer is worse than nothing.
- **File a note under a symbol it does not have.** Kept as **unsorted**, with the name it asked for remembered.
- **Lose the dictionary to a broken note file.** The bundle is read-only.

## When things go wrong

| Case | Behaviour |
|---|---|
| **Bad input** | No match → the terms used are quoted back, and no nearby symbol is offered. A note with no text is refused. |
| **No network** | Nothing changes; the entries are bundled. |
| **Storage full or unavailable** | The note is not saved and the app says so; reading and search continue from the bundle. |
| **Corrupt saved state** | The note file is reported and offered for export; the bundled entries cannot be corrupted by use. |

## Tests

```bash
npm test                      # all three suites
node tests/self-tests.js      # engine — 48 assertions
node tests/ui-tests.js        # the page in jsdom — 23 assertions
node tests/page-smoke.js      # every local src/href resolves, nothing off-origin
```

Mutation-tested six ways on 26/11/2026, all red: entries merged into one meaning per symbol (7 failures),
a no-match offering a nearby symbol (1), entries losing their source (1), an unknown symbol silently
attached (5), a broken note file taking the bundle with it (1), and the attribution note dropped (1).

One of them **survived on the first attempt** — because my mutation's anchor did not match the file and
nothing was changed. A mutation that silently does nothing looks exactly like a test that cannot catch
it, which is why the anchor is now printed before the mutation runs.

## Layout

```
docs/index.html            landing page
docs/play/index.html       the app — look up, the entries, notes
docs/play/app.js           DOM wiring: search, notes, unsorted state, export
docs/play/esoteric-core.js the engine — bundle, search, notes, storage
docs/play/web-kit.js       vendored kit (unmodified)
docs/play/export-kit.js    vendored kit (unmodified)
tests/self-tests.js        engine suite (48)
tests/ui-tests.js          page suite (23, jsdom)
tests/page-smoke.js        shape on disk
PAGES.json                 landing = docs/index.html, app = docs/play/index.html
```

## Where the spec was silent, and what was chosen

- **The field is `reading`, not `meaning`.** The word in the code is the word in the refusal to assert one.
- **Sources are named reference works, by article title**, with no quotations and no page numbers. An invented citation is worse than a thin one.
- **A note on an unknown symbol is kept, not refused** — but marked unsorted, and the name it asked for is remembered so it can be filed later.
- **The attribution note is returned with every search result**, not shown once at the top, because a result can be read on its own.
- **Seven symbols.** A bigger bundle written from memory would be a bigger pile of unverified claims.

## What is not built, and why

**A complete dictionary.** It would need real scholarship and real page numbers. What ships is the
structure — traditions kept apart, sources named, no verdict — which is the part a program can honestly
provide, and a starter set the person can extend.
