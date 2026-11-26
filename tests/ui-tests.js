#!/usr/bin/env node
/* ui-tests — the Esoteric page in a real DOM (jsdom). SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0 · (c) 2026 Dr Sohil Momin */
"use strict";
var fs = require("fs"), path = require("path"), { JSDOM } = require("jsdom");
var ROOT = path.join(__dirname, ".."), PLAY = path.join(ROOT, "docs", "play");
var passed = 0, failed = [];
function ok(n, c, d) { if (c) { passed++; return; } failed.push(n + (d ? " — " + d : "")); }
function eq(n, a, b) { ok(n, a === b, "expected " + JSON.stringify(b) + ", got " + JSON.stringify(a)); }
function build(seed) {
  var dom = new JSDOM(fs.readFileSync(path.join(PLAY, "index.html"), "utf8"), { url: "https://example.test/play/index.html", runScripts: "outside-only", pretendToBeVisual: true });
  var w = dom.window;
  if (seed) Object.keys(seed).forEach(function (k) { w.localStorage.setItem(k, seed[k]); });
  w.URL.createObjectURL = function () { return "blob:x"; }; w.URL.revokeObjectURL = function () {};
  w.HTMLAnchorElement.prototype.click = function () {};
  ["web-kit.js", "export-kit.js", "esoteric-core.js", "app.js"].forEach(function (f) { w.eval(fs.readFileSync(path.join(PLAY, f), "utf8")); });
  return dom;
}
var dom = build(null), w = dom.window, d = w.document, $ = function (id) { return d.getElementById(id); };
ok("the engine loaded", !!w.EsotericCore);
ok("the attribution note is on the page", /does not tell you what a symbol means/.test($("attrNote").textContent), $("attrNote").textContent);
eq("seven symbols are offered as chips", d.querySelectorAll("#chips button").length, 7);

$("q").value = "lotus"; $("searchBtn").click();
eq("three entries are shown", d.querySelectorAll("#hitList li").length, 3);
ok("each names its tradition", /Hindu/.test($("hitList").textContent) && /Buddhist/.test($("hitList").textContent));
ok("each names its source", (d.querySelectorAll("#hitList .src").length === 3) && /Source: Encyclopaedia Britannica/.test($("hitList").textContent), $("hitList").textContent);
ok("the app says more than one tradition reads it", /More than one tradition/.test($("status").textContent), $("status").textContent);

$("q").value = "unicorn"; $("searchBtn").click();
eq("no entries for a symbol it does not have", d.querySelectorAll("#hitList li").length, 0);
ok("and it says so with the term used", /unicorn/.test($("searchSays").textContent), $("searchSays").textContent);
ok("and offers no nearby symbol", /nearby symbol is offered/.test($("searchSays").textContent));

$("nText").value = "seen at the temple"; $("nSymbol").value = "lotus"; $("noteBtn").click();
ok("a note on a known symbol is kept", /kept against/.test($("status").textContent), $("status").textContent);
$("nText").value = "unfiled"; $("nSymbol").value = "nonesuch"; $("noteBtn").click();
ok("an unknown symbol is kept as unsorted", /UNSORTED/.test($("status").textContent), $("status").textContent);
eq("two notes are listed", d.querySelectorAll("#noteList li").length, 2);
ok("the unsorted one is marked on screen", /unsorted/.test($("noteList").textContent));
ok("and counted", /1 note\(s\) waiting for a symbol/.test($("unsortedSays").textContent), $("unsortedSays").textContent);

$("exportBtn").click();
ok("the notes export", /Wrote esoteric-notes-\d{4}-\d\d-\d\d\.json/.test($("ioNote").textContent), $("ioNote").textContent);
var saved = w.localStorage.getItem("esoteric:notes");
var dom2 = build({ "esoteric:notes": saved });
var d2 = dom2.window.document;
eq("the reload keeps both notes", d2.querySelectorAll("#noteList li").length, 2);
d2.getElementById("q").value = "tree"; d2.getElementById("searchBtn").click();
eq("and the dictionary still answers", d2.querySelectorAll("#hitList li").length, 3);

var dom3 = build({ "esoteric:notes": "{ broken notes" });
var d3 = dom3.window.document;
ok("a broken note file is reported", /cannot be read/.test(d3.getElementById("status").textContent), d3.getElementById("status").textContent);
ok("and says the bundle is unaffected", /bundled entries are read-only/.test(d3.getElementById("status").textContent));
d3.getElementById("q").value = "moon"; d3.getElementById("searchBtn").click();
eq("the dictionary still answers with a broken note file", d3.querySelectorAll("#hitList li").length, 2);

var dom4 = build(null), w4 = dom4.window, d4 = dom4.window.document;
Object.defineProperty(w4, "localStorage", { configurable: true, get: function () {
  return { getItem: function () { return null; }, setItem: function () { var e = new Error("q"); e.name = "QuotaExceededError"; throw e; }, removeItem: function () {}, clear: function () {} }; } });
d4.getElementById("nText").value = "x"; d4.getElementById("nSymbol").value = "lotus"; d4.getElementById("noteBtn").click();
ok("a failed save says NOT SAVED", /NOT SAVED:/.test(d4.getElementById("status").textContent), d4.getElementById("status").textContent);
ok("and says reading and search continue from the bundle", /continue from the bundle/.test(d4.getElementById("status").textContent));

var total = passed + failed.length;
if (!total) { console.error("ui-tests: 0 assertions ran."); process.exit(1); }
if (failed.length) { console.error("ui-tests: " + passed + "/" + total + " passed, " + failed.length + " FAILED"); failed.forEach(function (f) { console.error("  FAIL " + f); }); process.exit(1); }
console.log("ui-tests: " + passed + "/" + total + " assertions passed");
