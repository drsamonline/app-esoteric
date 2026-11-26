# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Dates: dd/mm/yyyy.

## [Unreleased]

## [1.0.0] — 26/11/2026

### Added
- A bundled cross-cultural dictionary: **seven symbols, seventeen entries**, one entry per tradition per
  symbol, each naming its tradition and its source. The same symbol in two cultures is **two entries**,
  because merging them would be inventing a single meaning.
- **Search across traditions** that says when more than one tradition reads the symbol, and returns the
  attribution note with every result.
- A search with **no match says so with the terms used**, and offers **no nearby symbol** — a near miss
  shown as an answer is worse than nothing.
- **Notes**, kept against a bundled symbol; a note on an unknown symbol is kept and marked
  **unsorted**, with the symbol it asked for remembered.
- The bundled entries are **read-only**: an unreadable note file is reported and offered for export,
  and the dictionary still answers.
- A failed save says the note was not kept and that **reading and search continue from the bundle**.
- PWA shell, CI (48 engine assertions + 23 in jsdom + page smoke), and the app-builder pipeline pinned
  to the canonical SHA for the EXE/APK/Linux release.

### Not built
- A complete dictionary. The bundle is a starter set demonstrating the structure; every entry says to
  check its source rather than repeat it.
