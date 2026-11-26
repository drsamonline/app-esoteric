/* esoteric-core — the engine behind Esoteric.
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * (c) 2026 Dr Sohil Momin
 *
 * ONE JOB: look up a symbol and see what different traditions have made of it, each attributed and
 * each sourced.
 *
 * It NEVER gives a single meaning. The same symbol in two cultures is TWO entries, because that is the
 * whole point: a dictionary that says "the serpent means evil" is not a dictionary, it is an opinion
 * wearing a hat.
 *
 * The bundle is a deliberately small STARTER SET. Every entry carries the reference work it came from,
 * and the app says out loud that an attribution is something to check, not a fact to repeat.
 *
 * Pure functions: no DOM, no network, no storage.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.EsotericCore = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var VERSION = "1.0.0";

  /* The starter bundle. Each entry is one tradition's reading of one symbol, with the reference work
   * it is attributed to. No quotations, no page numbers, no claim that this is the meaning. */
  var BUNDLE = [
    { symbol: "lotus", tradition: "Hindu", reading: "An emblem of purity and of the unfolding of consciousness; associated with Vishnu and Lakshmi in devotional art.", source: "Encyclopaedia Britannica, 'lotus'" },
    { symbol: "lotus", tradition: "Buddhist", reading: "A flower that rises clean out of mud, used for that image rather than for a deity.", source: "Encyclopaedia Britannica, 'lotus'; general Buddhist canonical usage" },
    { symbol: "lotus", tradition: "Ancient Egyptian", reading: "The blue lotus appears in funerary and banquet art; its reading is debated in the scholarship.", source: "Encyclopaedia Britannica, 'blue lotus'" },
    { symbol: "serpent", tradition: "Hindu", reading: "Naga figures guard water and treasure; the serpent is also a seat of Vishnu.", source: "Encyclopaedia Britannica, 'naga'" },
    { symbol: "serpent", tradition: "Ancient Greek", reading: "On the Asclepius staff it marks healing; elsewhere it is a chthonic guardian.", source: "Encyclopaedia Britannica, 'Asclepius'" },
    { symbol: "serpent", tradition: "Jewish and Christian", reading: "Read as tempter in Genesis and as wisdom in other passages; the two readings coexist.", source: "Encyclopaedia Britannica, 'serpent'" },
    { symbol: "tree", tradition: "Norse", reading: "Yggdrasil, the world ash, whose roots and branches hold the nine worlds.", source: "Encyclopaedia Britannica, 'Yggdrasil'" },
    { symbol: "tree", tradition: "Buddhist", reading: "The Bodhi tree, the fig under which the Buddha is said to have awakened.", source: "Encyclopaedia Britannica, 'bodhi tree'" },
    { symbol: "tree", tradition: "Kabbalistic", reading: "The Tree of Life as a diagram of ten sefirot, a map rather than a plant.", source: "Encyclopaedia Britannica, 'Kabbalah'" },
    { symbol: "circle", tradition: "Hindu and Buddhist", reading: "The mandala: a bounded field used as a support for practice.", source: "Encyclopaedia Britannica, 'mandala'" },
    { symbol: "circle", tradition: "Christian", reading: "The rose window and the halo, both enclosing rather than depicting.", source: "Encyclopaedia Britannica, 'rose window'" },
    { symbol: "moon", tradition: "Islamic", reading: "The crescent as a calendar marker, adopted as an emblem long after the religion began.", source: "Encyclopaedia Britannica, 'crescent'" },
    { symbol: "moon", tradition: "Hindu", reading: "Soma, both a plant, a drink and a lunar deity; the senses are historically layered.", source: "Encyclopaedia Britannica, 'Soma'" },
    { symbol: "lion", tradition: "Indian", reading: "The lion capital of Ashoka, now the state emblem; a political reading as much as a religious one.", source: "Encyclopaedia Britannica, 'Lion Capital of Ashoka'" },
    { symbol: "lion", tradition: "Chinese", reading: "Guardian lions at gateways, protective rather than royal.", source: "Encyclopaedia Britannica, 'Chinese guardian lions'" },
    { symbol: "swastika", tradition: "Hindu, Jain and Buddhist", reading: "An ancient auspicious mark, still in ordinary religious use in India.", source: "Encyclopaedia Britannica, 'swastika'" },
    { symbol: "swastika", tradition: "Twentieth-century Europe", reading: "Appropriated by the Nazi party; the same shape carries an entirely different and murderous meaning there.", source: "Encyclopaedia Britannica, 'swastika'" }
  ];

  var ATTRIBUTION_NOTE = "Every reading here is attributed to a tradition and a source. This app does not tell you what a symbol means; it shows you what traditions have made of it, and where that was read.";

  function clean(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim(); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ddmm(ms) { var d = new Date(ms); return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function stamp(when) { var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(when || "")); return m ? m[3] + "-" + m[2] + "-" + m[1] : "undated"; }
  function tokens(s) { return clean(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").split(" ").filter(Boolean); }

  function bundle() { return BUNDLE.map(function (e, i) { return { id: "b" + (i + 1), symbol: e.symbol, tradition: e.tradition, reading: e.reading, source: e.source, bundled: true }; }); }

  /* ---------------------------------------------------------------- search */

  /* A search returns entries from MORE THAN ONE tradition, each sourced. A search with no matches says
   * so with the terms used, and never offers a nearby symbol as if it were the one asked for. */
  function search(query, extraEntries) {
    var q = tokens(query);
    if (!q.length) return { ok: false, reason: "a search with no words in it was refused", terms: [], hits: [] };
    var all = bundle().concat((extraEntries || []).filter(Boolean));
    var hits = all.filter(function (e) {
      var hay = (e.symbol + " " + e.tradition + " " + e.reading).toLowerCase();
      return q.every(function (t) { return hay.indexOf(t) >= 0; });
    });
    if (!hits.length) {
      return {
        ok: false, noMatch: true, terms: q, hits: [],
        reason: "nothing matches " + q.map(function (t) { return "\u201c" + t + "\u201d"; }).join(" ") +
          ". No nearby symbol is offered, because a near miss shown as an answer is worse than nothing."
      };
    }
    var traditions = [];
    hits.forEach(function (h) { if (traditions.indexOf(h.tradition) < 0) traditions.push(h.tradition); });
    return {
      ok: true, hits: hits, terms: q, traditions: traditions, count: hits.length,
      multiTradition: traditions.length > 1,
      says: hits.length + " entr" + (hits.length === 1 ? "y" : "ies") + " from " + traditions.length + " tradition(s), each with its source." +
        (traditions.length > 1 ? " More than one tradition reads this symbol, and they are kept apart." : ""),
      note: ATTRIBUTION_NOTE
    };
  }

  function symbols() {
    var out = [];
    BUNDLE.forEach(function (e) { if (out.indexOf(e.symbol) < 0) out.push(e.symbol); });
    return out;
  }

  /* ----------------------------------------------------------------- notes */

  /* A note with no symbol attached is MARKED UNSORTED rather than guessed at. */
  function addNote(notes, input, now) {
    var text = clean(input && input.text);
    if (!text) return { ok: false, field: "text", reason: "a note with no text is refused" };
    var symbol = clean(input && input.symbol).toLowerCase();
    var known = symbols();
    var attached = known.indexOf(symbol) >= 0;
    var at = now || Date.now();
    var n = {
      id: "n" + ((notes || []).length + 1),
      text: text,
      symbol: attached ? symbol : "",
      askedFor: attached ? "" : symbol,
      unsorted: !attached,
      at: at, on: ddmm(at)
    };
    return {
      ok: true, notes: (notes || []).concat([n]), note: n,
      says: attached
        ? "Note kept against \u201c" + symbol + "\u201d."
        : "Kept as UNSORTED: there is no bundled symbol called \u201c" + (symbol || "(none given)") + "\u201d, and a note filed under the wrong symbol is worse than one waiting."
    };
  }

  function unsorted(notes) { return (notes || []).filter(function (n) { return n.unsorted; }); }

  /* --------------------------------------------------------------- storage */

  function serialize(state) {
    return JSON.stringify({
      version: VERSION, format: "esoteric-notes-1",
      savedOn: (state && state.savedOn) || 0,
      notes: ((state && state.notes) || []).map(function (n) {
        return { id: n.id, text: n.text, symbol: n.symbol, askedFor: n.askedFor || "", unsorted: !!n.unsorted, at: n.at, on: n.on };
      })
    }, null, 2);
  }

  /* Only the notes can be corrupt. The bundled entries are read-only and cannot be damaged by use, so
   * a broken note file never takes the dictionary with it. */
  function parseState(text) {
    var raw = String(text == null ? "" : text);
    if (!raw.trim()) return { ok: false, empty: true, reason: "no note has been kept on this device yet", raw: raw, bundleIntact: true };
    var data;
    try { data = JSON.parse(raw); }
    catch (e) {
      return { ok: false, unreadable: true, bundleIntact: true, reason: "The note file cannot be read. It was NOT replaced with an empty one; export it to keep it. The bundled entries are read-only and are unaffected.", raw: raw };
    }
    if (!data || !Array.isArray(data.notes)) {
      return { ok: false, unreadable: true, bundleIntact: true, reason: "The saved file holds no notes. Nothing was started over it; export it to keep it. The bundled entries are unaffected.", raw: raw };
    }
    return {
      ok: true, bundleIntact: true, raw: raw,
      state: { version: data.version || VERSION, savedOn: Number(data.savedOn) || 0, notes: data.notes.map(function (n) {
        return { id: String(n.id || ""), text: String(n.text || ""), symbol: String(n.symbol || ""), askedFor: String(n.askedFor || ""), unsorted: !!n.unsorted, at: Number(n.at) || 0, on: String(n.on || "") };
      }) }
    };
  }

  function exportFile(what, payload, meta, writer) {
    meta = meta || {};
    if (typeof writer !== "function") return { ok: false, reason: "the file was not written: no writer is available in this browser" };
    var name, body, mime = "application/json";
    if (what === "notes") { name = "esoteric-notes-" + stamp(meta.when) + ".json"; body = serialize(payload.state); }
    else if (what === "raw") { name = "esoteric-unreadable-" + stamp(meta.when) + ".txt"; body = String(payload.raw || ""); mime = "text/plain;charset=utf-8"; }
    else return { ok: false, reason: "nothing was written: unknown export \u201c" + what + "\u201d" };
    try {
      var wrote = writer(name, body, mime);
      if (wrote === false) return { ok: false, filename: name, reason: "the file was not written: the browser refused the save" };
      return { ok: true, filename: name, bytes: body.length };
    } catch (e) {
      var why = e && e.name === "QuotaExceededError" ? "storage is full" : (e && e.message ? e.message : "storage is unavailable");
      return { ok: false, filename: name, reason: "the file was not written: " + why };
    }
  }

  return {
    version: VERSION, ATTRIBUTION_NOTE: ATTRIBUTION_NOTE,
    bundle: bundle, symbols: symbols, search: search,
    addNote: addNote, unsorted: unsorted,
    serialize: serialize, parseState: parseState, exportFile: exportFile
  };
});
