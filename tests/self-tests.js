#!/usr/bin/env node
/* self-tests — Esoteric. SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0 · (c) 2026 Dr Sohil Momin
 * The spec's done-means: "searching a symbol returns entries from more than one tradition, each sourced." */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.join(__dirname, "..");
var E = require(path.join(ROOT, "docs", "play", "esoteric-core.js"));
var passed = 0, failed = [], group = "";
function section(n) { group = n; }
function ok(n, c, d) { if (c) { passed++; return; } failed.push(group + " :: " + n + (d ? " — " + d : "")); }
function eq(n, a, b) { ok(n, a === b, "expected " + JSON.stringify(b) + ", got " + JSON.stringify(a)); }
function read(f) { return fs.readFileSync(path.join(ROOT, f), "utf8"); }

section("done means — one symbol returns entries from more than one tradition, each sourced");
var lotus = E.search("lotus");
eq("the search succeeds", lotus.ok, true);
eq("three traditions read the lotus", lotus.traditions.length, 3);
ok("and they are kept apart, one entry each", lotus.hits.length === 3 && lotus.hits.every(function (h) { return h.tradition; }));
ok("every entry names its source", lotus.hits.every(function (h) { return h.source && h.source.length > 5; }));
ok("the app says more than one tradition reads it", /More than one tradition reads this symbol/.test(lotus.says), lotus.says);
ok("and that they are kept apart", /kept apart/.test(lotus.says));
var serpent = E.search("serpent");
eq("serpent also spans three traditions", serpent.traditions.length, 3);
ok("the same symbol in two cultures is two entries", serpent.hits.filter(function (h) { return h.symbol === "serpent"; }).length === 3);

section("must-not — it must not give a single meaning for a symbol");
var core = read("docs/play/esoteric-core.js");
ok("no entry carries a 'meaning' field", !/\bmeaning\s*:/.test(core));
ok("the entries say 'reading', not 'means'", /reading:/.test(core) && !/means:/.test(core));
ok("the app carries an attribution note", /does not tell you what a symbol means/.test(E.ATTRIBUTION_NOTE), E.ATTRIBUTION_NOTE);
ok("and every search returns it", /attributed to a tradition and a source/.test(lotus.note));
ok("no tradition is given as the true one", !/\b(true|correct|real) meaning\b/i.test(core));

section("must-not — a search with no matches says so, with the terms used");
var none = E.search("unicorn");
eq("it is refused", none.ok, false);
eq("it is marked as no-match", none.noMatch, true);
eq("the terms used are returned", none.terms.join(","), "unicorn");
ok("the reason quotes the terms", /unicorn/.test(none.reason), none.reason);
ok("and no nearby symbol is offered", /nearby symbol is offered/.test(none.reason));
eq("no hits are invented", none.hits.length, 0);
eq("an empty search is refused", E.search("  ").ok, false);

section("must-not — a note with no symbol attached is marked unsorted");
var first = E.addNote([], { text: "saw it at the temple", symbol: "lotus" }, 1);
eq("a note on a known symbol is attached", first.note.symbol, "lotus");
eq("and not unsorted", first.note.unsorted, false);
var second = E.addNote(first.notes, { text: "unfiled thought", symbol: "nonesuch" }, 2);
eq("a note on an unknown symbol is kept", second.ok, true);
eq("but marked unsorted", second.note.unsorted, true);
eq("and the symbol it asked for is remembered", second.note.askedFor, "nonesuch");
ok("the app says why", /filed under the wrong symbol is worse/.test(second.says), second.says);
eq("one note is unsorted", E.unsorted(second.notes).length, 1);
eq("a note with no text is refused", E.addNote([], { symbol: "lotus" }).field, "text");

section("must-not — the bundled entries are read-only and cannot be corrupted by use");
var bad = E.parseState("{ broken notes");
eq("the note file is reported", bad.ok, false);
eq("it is marked unreadable", bad.unreadable, true);
ok("the bundle is declared intact", bad.bundleIntact, true);
ok("and says the bundle is unaffected", /bundled entries are read-only/.test(bad.reason), bad.reason);
eq("the dictionary still answers after the note file broke", E.search("tree").count, 3);
eq("nothing saved yet is distinguished from a broken file", E.parseState("").empty, true);

section("storage and export");
var state = { savedOn: 1, notes: second.notes };
var file = E.serialize(state);
var back = E.parseState(file);
eq("the notes round-trip", back.state.notes.length, 2);
eq("including the unsorted one", E.unsorted(back.state.notes).length, 1);
var thrown = E.exportFile("notes", { state: state }, { when: "26/11/2026" }, function () {
  var e = new Error("quota"); e.name = "QuotaExceededError"; throw e;
});
eq("a failed write is reported", thrown.ok, false);
ok("it says the file was not written", /not written/.test(thrown.reason));
ok("the page says reading and search continue from the bundle", /continue from the bundle/.test(read("docs/play/app.js")));
ok("no network call", !/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(core + read("docs/play/app.js")));
ok("the page forbids connections", /connect-src 'none'/.test(read("docs/play/index.html")));

section("shape — every script the page loads exists beside it");
var page = read("docs/play/index.html");
var srcs = (page.match(/<script[^>]+src="([^"]+)"/g) || []).map(function (t) { return t.replace(/.*src="([^"]+)"/, "$1"); });
srcs.forEach(function (s) { ok("script src resolves: " + s, fs.existsSync(path.join(ROOT, "docs", "play", s.replace(/^\.\//, "")))); });
ok("the landing page exists", fs.existsSync(path.join(ROOT, "docs", "index.html")));
ok("the page manifest exists", fs.existsSync(path.join(ROOT, "PAGES.json")));
ok("the web manifest exists", fs.existsSync(path.join(ROOT, "docs", "play", "manifest.webmanifest")));

var total = passed + failed.length;
if (!total) { console.error("self-tests: 0 assertions ran."); process.exit(1); }
if (failed.length) { console.error("self-tests: " + passed + "/" + total + " passed, " + failed.length + " FAILED"); failed.slice(0, 12).forEach(function (f) { console.error("  FAIL " + f); }); process.exit(1); }
console.log("self-tests: " + passed + "/" + total + " assertions passed");
