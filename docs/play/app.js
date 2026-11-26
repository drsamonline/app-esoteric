/* app — the Esoteric page. SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0 · (c) 2026 Dr Sohil Momin
 * Wiring only: the bundle, the search and the notes live in esoteric-core.js. */
(function () {
  "use strict";
  var E = window.EsotericCore;
  var $ = function (id) { return document.getElementById(id); };
  var K = "esoteric:notes";
  var state = { notes: [], unreadable: null };

  var els = {
    status: $("status"), q: $("q"), searchBtn: $("searchBtn"), chips: $("chips"), attrNote: $("attrNote"),
    searchSays: $("searchSays"), hitList: $("hitList"),
    nText: $("nText"), nSymbol: $("nSymbol"), noteBtn: $("noteBtn"), noteSays: $("noteSays"),
    noteList: $("noteList"), unsortedSays: $("unsortedSays"),
    exportBtn: $("exportBtn"), ioNote: $("ioNote")
  };

  function today() { var d = new Date(), p = function (n) { return (n < 10 ? "0" : "") + n; }; return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function setStatus(k, m) { els.status.className = "status show " + k; els.status.textContent = m; }
  function node(t, c, x) { var n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }

  function persist() {
    try { window.localStorage.setItem(K, E.serialize({ savedOn: Date.now(), notes: state.notes })); return true; }
    catch (e) {
      /* reading and search continue from the bundle */
      setStatus("bad", "NOT SAVED: " + (e && e.name === "QuotaExceededError" ? "storage is full" : "storage is unavailable") +
        ". The note was not kept \u2014 reading and search continue from the bundle.");
      return false;
    }
  }

  function renderNotes() {
    els.noteList.textContent = "";
    if (!state.notes.length) { els.noteList.appendChild(node("li", null, "No notes yet.")); }
    state.notes.forEach(function (n) {
      var li = node("li", n.unsorted ? "unsorted" : "");
      li.appendChild(node("div", "tr", n.unsorted ? "unsorted" + (n.askedFor ? " \u2014 asked for \u201c" + n.askedFor + "\u201d" : "") : n.symbol));
      li.appendChild(node("div", "rd", n.text));
      li.appendChild(node("div", "src", "kept " + n.on));
      els.noteList.appendChild(li);
    });
    var u = E.unsorted(state.notes);
    els.unsortedSays.textContent = u.length ? u.length + " note(s) waiting for a symbol." : "";
  }

  function lookUp(query) {
    var out = E.search(query);
    els.searchSays.textContent = out.ok ? out.says : out.reason;
    els.hitList.textContent = "";
    if (!out.ok) { setStatus("warn", out.reason); return; }
    out.hits.forEach(function (h) {
      var li = node("li");
      li.appendChild(node("div", "tr", h.tradition));
      li.appendChild(node("div", "rd", h.reading));
      li.appendChild(node("div", "src", "Source: " + h.source));
      els.hitList.appendChild(li);
    });
    setStatus(out.multiTradition ? "ok" : "warn", out.says);
  }

  function keepNote() {
    var out = E.addNote(state.notes, { text: els.nText.value, symbol: els.nSymbol.value }, Date.now());
    if (!out.ok) { setStatus("bad", out.reason); return; }
    state.notes = out.notes;
    if (!persist()) return;
    els.nText.value = "";
    renderNotes();
    els.noteSays.textContent = out.says;
    setStatus(out.note.unsorted ? "warn" : "ok", out.says);
  }

  function doExport() {
    var out = E.exportFile("notes", { state: { savedOn: Date.now(), notes: state.notes } }, { when: today() }, function (name, text, mime) {
      if (!window.Export || typeof window.Export.save !== "function") throw new Error("the export kit did not load");
      window.Export.save(name, text, mime); return true;
    });
    if (out.ok) { els.ioNote.textContent = "Wrote " + out.filename + " \u2014 your notes only; the bundle is read-only."; setStatus("ok", "Exported."); }
    else setStatus("bad", out.reason + ".");
  }

  els.searchBtn.addEventListener("click", function () { lookUp(els.q.value); });
  els.q.addEventListener("keydown", function (e) { if (e.key === "Enter") lookUp(els.q.value); });
  els.noteBtn.addEventListener("click", keepNote);
  els.exportBtn.addEventListener("click", doExport);

  els.attrNote.textContent = E.ATTRIBUTION_NOTE;
  E.symbols().forEach(function (s) {
    var b = node("button", "small", s);
    b.addEventListener("click", function () { els.q.value = s; lookUp(s); });
    els.chips.appendChild(b);
  });

  var raw = null;
  try { raw = window.localStorage.getItem(K); } catch (e) { raw = null; }
  if (raw) {
    var parsed = E.parseState(raw);
    if (parsed.ok) state.notes = parsed.state.notes;
    else {
      state.unreadable = parsed;
      setStatus("bad", parsed.reason);
      var keep = node("button", "small", "Export the unreadable note file");
      keep.addEventListener("click", function () {
        var out = E.exportFile("raw", parsed, { when: today() }, function (name, text, mime) {
          if (!window.Export || typeof window.Export.save !== "function") throw new Error("the export kit did not load");
          window.Export.save(name, text, mime); return true;
        });
        setStatus(out.ok ? "ok" : "bad", out.ok ? "Wrote " + out.filename + "." : out.reason);
      });
      els.ioNote.parentNode.insertBefore(keep, els.ioNote);
    }
  }

  renderNotes();
  if (window.Loom && window.Loom.pwa) window.Loom.pwa.register("sw.js");
})();
