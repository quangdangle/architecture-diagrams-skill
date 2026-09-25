#!/usr/bin/env python3
"""Headless browser tests for the diagram pages.

1. Every example: drawing, clicking, steps, keyboard, theme, zoom, search, and every export.
2. The editor: tables, drag to move, Shift+drag to connect, undo, Excel paste, JSON view, palette,
   resize handles, bends, line styles, pin snapping, history, zoom keys and the overview map.
3. Input and wiring checks: required fields, formats, named pins, reversed wires, missing clocks,
   stacked blocks, the Checks list, jumping to a problem, and the shape search.
4. draw.io import and export with a public test file (tests/fixtures/drawio/sample.drawio):
   shapes, groups, routes and labels are drawn, and saving back keeps every cell identical.
5. Quick fixes, patterns and suggestions: fix buttons in Checks, fixing every safe problem at once, inserting
   each pattern (wired to the selected block's pins) and the suggestions for the selected block.
6. The symbol library: every symbol draws, exports to draw.io stencils, and builds a draw.io library.
7. Detail boards: an overview becomes a board of frames with ports and wires that follow the overview.
8. Sticky notes, a block's inside in its own tab, port names and the AI flow (with a stand-in for the bridge),
   then a draw.io round trip that keeps notes, ports and the links between tabs.

Usage:
    python3 tests/interaction_test.py [examples|editor|checks|multi|edge|drawio|manip|assist|grow|symbols|board|notesai ...]

Needs Chrome, Chromium, Edge or Brave (same lookup as scripts/render_png.py).
Exit code: 0 = all checks passed, 1 = a check failed, 2 = no browser found.
"""

import base64
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "architecture-diagrams"
sys.path.insert(0, str(SKILL / "scripts"))
from render_png import find_browser, run_browser  # noqa: E402

COMMON_JS = r"""
  var R = [];
  window.__testErrors = [];
  window.addEventListener('error', function (e) { window.__testErrors.push(String(e.message)); });
  window.addEventListener('unhandledrejection', function (e) { window.__testErrors.push('promise: ' + String(e.reason && e.reason.message || e.reason)); });
  function ok(name, cond, info) { R.push({ name: name, pass: !!cond, info: info === undefined ? '' : String(info) }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function visible(sel) { return document.querySelector('.diagram-section:not(.is-hidden) ' + sel); }
  function svg() { return visible('.canvas svg'); }
  function button(text) { return Array.prototype.find.call(document.querySelectorAll('.diagram-section:not(.is-hidden) .tb-btn'), function (b) { return b.textContent.trim() === text; }); }
  function exportItem(fmt) { return visible('.menu button[data-format="' + fmt + '"]'); }
  function openMenu() { var b = visible('.tb-menu .tb-btn'); b.click(); return b; }
  var captured = [];
  HTMLAnchorElement.prototype.click = function () {
    captured.push({ name: this.getAttribute('download'), blob: fetch(this.href).then(function (r) { return r.blob(); }) });
  };
  async function download(trigger) {
    var n = captured.length;
    trigger();
    for (var k = 0; k < 60 && captured.length <= n; k++) await wait(50);
    return captured[n] ? { name: captured[n].name, blob: await captured[n].blob } : null;
  }
  async function exportText(fmt) {
    var got = await download(function () { openMenu(); exportItem(fmt).click(); });
    return got ? await got.blob.text() : '';
  }
  function pe(type, x, y, extra) { var o = { bubbles: true, clientX: x, clientY: y, button: 0, pointerId: 1 }; for (var k in (extra || {})) o[k] = extra[k]; return new PointerEvent(type, o); }
  async function dragNode(id, dx, dy, extra) {
    var node = svg().querySelector('.node[data-id="' + id + '"]'), r = node.getBoundingClientRect();
    node.dispatchEvent(pe('pointerdown', r.left + 8, r.top + 6, extra));
    for (var i = 1; i <= 10; i++) { window.dispatchEvent(pe('pointermove', r.left + 8 + dx * i / 10, r.top + 6 + dy * i / 10, extra)); await wait(15); }
    window.dispatchEvent(pe('pointerup', r.left + 8 + dx, r.top + 6 + dy, extra));
    await wait(600);
  }
  function kindOf(d) {
    var t = String(d.type || '').toLowerCase();
    if (t === 'timing' || t === 'wave' || (!t && d.wave)) return 'wave';
    if (t === 'register' || t === 'registers' || (!t && d.registers)) return 'register';
    if (t === 'memory' || t === 'memory-map' || t === 'memmap' || (!t && d.regions)) return 'memory';
    if (t === 'chip' || (!t && d.columns)) return 'chip';
    if (t === 'pinout' || (!t && d.package)) return 'pinout';
    return 'graph';
  }
"""

EXAMPLE_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    await wait(200);
    ok('page rendered', svg(), document.querySelectorAll('.canvas svg').length + ' diagram(s)');
    ok('no warning banner', document.getElementById('notice').hidden, document.getElementById('notice').textContent);
    var spec = JSON.parse(document.getElementById('diagram-spec').textContent);
    var list = spec.diagrams || [spec];
    if (kindOf(list[0]) === 'graph') {
      var nodes = svg().querySelectorAll('.node');
      ok('nodes drawn', nodes.length > 0, nodes.length);
      ok('text is inside cards', Array.prototype.every.call(svg().querySelectorAll('.node[data-shape="card"]'), function (n) {
        var card = n.querySelector('rect').getBBox();
        return Array.prototype.every.call(n.querySelectorAll('text'), function (t) { var b = t.getBBox(); return b.x + b.width <= card.width + 1.5; });
      }));
      nodes[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      ok('click highlights a card', svg().classList.contains('has-focus') && nodes[0].classList.contains('sel'), svg().querySelectorAll('.on').length + ' highlighted');
      nodes[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      ok('second click clears', !svg().classList.contains('has-focus'));
      var steps = document.querySelectorAll('.diagram-section:not(.is-hidden) .step');
      if (steps.length > 1) {
        steps[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        ok('step click activates', steps[0].classList.contains('active') && svg().classList.contains('has-focus'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        ok('right arrow goes to next step', steps[1].classList.contains('active'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        ok('escape clears', !svg().classList.contains('has-focus') && !steps[1].classList.contains('active'));
      }
      var before = svg(), theme = document.documentElement.getAttribute('data-theme');
      document.getElementById('theme-btn').click();
      ok('theme toggles and redraws', document.documentElement.getAttribute('data-theme') !== theme && svg() !== before && svg().querySelectorAll('.node').length === nodes.length);
      var w0 = svg().getBoundingClientRect().width;
      button('+').click();
      ok('zoom in grows the diagram', svg().getBoundingClientRect().width > w0 + 1, w0 + ' -> ' + svg().getBoundingClientRect().width);
      button('+').previousElementSibling.click();
      ok('fit button works', svg().style.width === '100%');
      var canvas = visible('.canvas');
      ok('grid follows the diagram', /px/.test(canvas.style.backgroundSize) && !canvas.classList.contains('no-grid'), canvas.style.backgroundSize);
      visible('.tb-grid').click();
      ok('grid button hides the grid', canvas.classList.contains('no-grid'));
      visible('.tb-grid').click();
      var search = visible('.tb-search');
      var firstTitle = nodes[0].querySelector('title').textContent.split('\n')[0];
      search.value = firstTitle.slice(0, Math.max(3, Math.min(8, firstTitle.length)));
      search.dispatchEvent(new Event('input', { bubbles: true }));
      ok('search marks matching cards', svg().classList.contains('has-search') && svg().querySelectorAll('.node.match').length >= 1, svg().querySelectorAll('.node.match').length + ' match(es)');
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      var details = visible('.details');
      ok('enter selects a match and opens details', svg().classList.contains('has-focus') && details && !details.hidden, details ? details.querySelector('.det-title').textContent : 'no panel');
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      ok('escape clears search and details', !svg().classList.contains('has-search') && details.hidden && !svg().classList.contains('has-focus'));
      var mmd = await exportText('mermaid');
      ok('Mermaid export starts a flowchart with every card', mmd.indexOf('flowchart ') === 0 && (mmd.match(/\["|\{"|\(\["|\(\("|\[\("|\{\{"|\[\/"/g) || []).length >= nodes.length, mmd.split('\n').length + ' lines');
    }
    openMenu();
    ok('download menu opens', !visible('.menu').hidden);
    document.body.click();
    var svgText = await exportText('svg');
    ok('SVG export is a clean standalone file', svgText.indexOf('<svg') > 0 && svgText.indexOf('has-focus') < 0 && svgText.indexOf('xmlns="http://www.w3.org/2000/svg"') > 0, svgText.length + ' bytes');
    var png = await download(function () { openMenu(); exportItem('png').click(); });
    ok('PNG export produces an image', png && png.blob.type === 'image/png' && png.blob.size > 5000, png ? png.name + ' ' + png.blob.size + ' bytes' : 'no download');
    var drawio = await exportText('drawio');
    var xml = new DOMParser().parseFromString(drawio, 'application/xml');
    ok('draw.io export is valid XML with one page per tab', drawio.indexOf('<mxfile') === 0 && !xml.getElementsByTagName('parsererror').length && xml.getElementsByTagName('diagram').length === list.length,
       xml.getElementsByTagName('diagram').length + ' page(s), ' + drawio.length + ' bytes');
    if (kindOf(list[0]) === 'graph') ok('draw.io graph page keeps cards and arrows', xml.querySelectorAll('mxCell[vertex="1"]').length >= 2 && xml.querySelectorAll('mxCell[edge="1"]').length >= 1,
       xml.querySelectorAll('mxCell[vertex="1"]').length + ' vertices, ' + xml.querySelectorAll('mxCell[edge="1"]').length + ' edges');
    var tabs = document.querySelectorAll('.tab');
    if (tabs.length > 1) {
      tabs[1].click();
      ok('second tab shows its own diagram', document.querySelectorAll('.diagram-section:not(.is-hidden)').length === 1 && location.hash.length > 1 && svg(), location.hash);
    }
    for (var ti = 0; ti < Math.max(1, tabs.length); ti++) {
      if (tabs.length) tabs[ti].click();
      var kind = kindOf(list[ti]), tsvg = svg();
      ok('tab ' + (ti + 1) + ' (' + kind + ') draws', tsvg && tsvg.querySelectorAll('*').length > 12 && tsvg.getBoundingClientRect().width > 50, tsvg ? tsvg.querySelectorAll('*').length + ' elements' : 'nothing');
      if (kind === 'register' || kind === 'memory' || kind === 'pinout') {
        var csv = await exportText('csv');
        ok('tab ' + (ti + 1) + ' CSV export has rows', csv.split('\r\n').length > 2 && visible('table.data tbody tr'), csv.split('\r\n').length + ' lines');
      }
      if (kind === 'wave') ok('tab ' + (ti + 1) + ' timing rows drawn', tsvg.querySelectorAll('path').length >= 3, tsvg.querySelectorAll('path').length + ' paths');
      if (kind === 'chip') ok('tab ' + (ti + 1) + ' chip blocks drawn', tsvg.querySelectorAll('rect').length >= 6 && tsvg.textContent.length > 20, tsvg.querySelectorAll('rect').length + ' rects');
      if (kind === 'pinout') ok('tab ' + (ti + 1) + ' every pin drawn', tsvg.textContent.indexOf('VDD') >= 0 && tsvg.querySelectorAll('rect, circle').length >= 20, tsvg.querySelectorAll('rect, circle').length + ' pins');
    }
    var wantsDiamond = list.some(function (d) { return (d.nodes || []).some(function (n) { return n.shape === 'decision'; }); });
    if (wantsDiamond) ok('decision nodes are drawn as diamonds', document.querySelectorAll('.canvas svg .node polygon').length >= 1, document.querySelectorAll('.canvas svg .node polygon').length + ' polygon(s)');
"""

EDITOR_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-panel .ed-row'); j++) await wait(100);
    var raw = function () { return window.__adEditor.raw(); };
    ok('editor opens with tables', document.querySelector('.ed-panel') && document.querySelectorAll('.ed-row').length > 5, document.querySelectorAll('.ed-row').length + ' rows');
    ok('grid shows stronger dots while editing', getComputedStyle(document.body).getPropertyValue('--dot-major').trim() !== 'transparent');
    var title = document.querySelector('.ed-row textarea');
    title.value = 'Renamed in table';
    title.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(600);
    ok('typing in a table redraws the diagram', svg().textContent.indexOf('Renamed in table') >= 0);
    var edgesBefore = raw().diagrams[0].edges.length;
    await dragNode(raw().diagrams[0].nodes[2].id, 140, 50);
    var d0 = raw().diagrams[0];
    ok('dragging switches to hand-placed positions', d0.layout === 'manual' && d0.nodes.every(function (n) { return typeof n.x === 'number' && typeof n.y === 'number'; }));
    ok('dragged block snaps to the grid', d0.nodes[2].x % 10 === 0 && d0.nodes[2].y % 10 === 0, d0.nodes[2].x + ',' + d0.nodes[2].y);
    var a = d0.nodes[3].id, b = d0.nodes[5].id;
    var na = svg().querySelector('.node[data-id="' + a + '"]'), nb = svg().querySelector('.node[data-id="' + b + '"]');
    var ra = na.getBoundingClientRect(), rb = nb.getBoundingClientRect();
    na.dispatchEvent(pe('pointerdown', ra.left + 8, ra.top + 6, { shiftKey: true }));
    for (var s = 1; s <= 8; s++) { window.dispatchEvent(pe('pointermove', ra.left + 8 + (rb.left - ra.left) * s / 8, ra.top + 6 + (rb.top - ra.top) * s / 8, { shiftKey: true })); await wait(15); }
    window.dispatchEvent(pe('pointerup', rb.left + 8, rb.top + 6, { shiftKey: true }));
    await wait(600);
    var last = raw().diagrams[0].edges[raw().diagrams[0].edges.length - 1];
    ok('Shift+drag connects two blocks', raw().diagrams[0].edges.length === edgesBefore + 1 && last.from === a && last.to === b, JSON.stringify(last));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    await wait(500);
    ok('Ctrl+Z undoes the new connection', raw().diagrams[0].edges.length === edgesBefore, raw().diagrams[0].edges.length);
    var sel = document.querySelector('.ed-pick select');
    var regTab = Array.prototype.findIndex.call(sel.options, function (o) { return /regist|thanh ghi/i.test(o.textContent); });
    if (regTab >= 0) {
      sel.value = String(regTab); sel.dispatchEvent(new Event('change', { bubbles: true }));
      await wait(400);
      var cell = document.querySelector('.ed-sec[open] .ed-tbl .ed-row input');
      var dt = new DataTransfer();
      dt.setData('text/plain', 'Bits\tName\tAccess\tReset\tDescription\n15:8\tDIV\tRW\t0x10\tBaud divider\n16\tLOOP\tRW\t0\tLoopback');
      cell.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      await wait(600);
      var fields = raw().diagrams[regTab].registers[0].fields;
      ok('pasting rows from Excel fills the field table', fields[0].name === 'DIV' && fields[1].name === 'LOOP' && fields[0].desc === 'Baud divider', JSON.stringify(fields.slice(0, 2)));
    }
    document.querySelectorAll('.ed-tab')[1].click();
    await wait(200);
    var area = document.querySelector('.ed-json'), obj = JSON.parse(area.value);
    obj.title = 'Set from the JSON view';
    area.value = JSON.stringify(obj);
    area.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    await wait(600);
    ok('JSON view applies changes', document.getElementById('doc-title').textContent === 'Set from the JSON view');
    document.querySelectorAll('.ed-tab')[0].click();
    await wait(300);
    sel = document.querySelector('.ed-pick select');
    sel.value = '0'; sel.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(400);
    var pal = Array.prototype.find.call(document.querySelectorAll('.ed-sec > summary'), function (x) { return /shape|hình/i.test(x.textContent); });
    pal.parentNode.open = true;
    await wait(300);
    var count = raw().diagrams[0].nodes.length;
    var sym = Array.prototype.find.call(document.querySelectorAll('.ed-sym'), function (x) { return x.title === 'nand'; }) || document.querySelector('.ed-sym');
    sym.click();
    await wait(600);
    ok('palette adds a symbol block', raw().diagrams[0].nodes.length === count + 1 && svg().querySelectorAll('.node').length === count + 1, raw().diagrams[0].nodes[count] && raw().diagrams[0].nodes[count].shape);
    var saved = await download(function () { document.querySelector('.ed-head .tb-menu .tb-btn').click(); document.querySelector('.ed-head .menu button').click(); });
    var savedJson = saved ? JSON.parse(await saved.blob.text()) : null;
    ok('Save writes the edited JSON', savedJson && savedJson.title === 'Set from the JSON view' && savedJson.diagrams[0].layout === 'manual', saved ? saved.name : 'no download');
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.slice(0, 3).join('; '));
"""

CHECKS_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-panel .ed-row'); j++) await wait(100);
    await wait(400);
    var raw = function () { return window.__adEditor.raw().diagrams[1]; };
    var items = function () { return Array.prototype.map.call(document.querySelectorAll('.ed-chk-item'), function (x) { return x.textContent; }); };
    var has = function (re) { return items().some(function (t) { return re.test(t); }); };
    async function applyJson(mut) {
      var all = JSON.parse(JSON.stringify(window.__adEditor.raw()));
      mut(all.diagrams[1]);
      document.querySelectorAll('.ed-tab')[1].click(); await wait(150);
      var area = document.querySelector('.ed-json'); area.value = JSON.stringify(all);
      area.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true })); await wait(600);
      document.querySelectorAll('.ed-tab')[0].click(); await wait(600);
    }
    function pinPoint(name) {
      var t = Array.prototype.find.call(svg().querySelectorAll('.ed-overlay .ed-pins text'), function (x) { return x.textContent === name; });
      var r = t && t.previousSibling.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
    }
    function pick(id) { svg().querySelector('.node[data-id="' + id + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true })); return wait(300); }

    ok('a clean diagram reports no problems', /✓/.test(document.querySelector('.ed-checks').textContent), document.querySelector('.ed-checks').textContent);
    ok('the form is split into sub-tabs with one pane showing', document.querySelectorAll('.ed-stab').length === 7 && document.querySelectorAll('.ed-pane:not([hidden])').length === 1);
    ok('required columns are marked', document.querySelectorAll('.ed-pane:not([hidden]) .ed-tbl th.ed-req').length >= 1);
    document.querySelector('.ed-row[data-key="n:ffa"]').moreToggle(true);
    await wait(250);
    var chips = Array.prototype.map.call(document.querySelectorAll('.ed-pin'), function (x) { return x.textContent; }).join(' | ');
    ok('a flip-flop lists its named pins and marks the wired ones', /CLK/.test(chips) && /QN/.test(chips) && document.querySelectorAll('.ed-pin.on').length === 2, chips);
    ok('block settings are split into titled groups', document.querySelectorAll('.ed-more .ed-gtitle').length >= 5);

    await applyJson(function (d) {
      d.edges[1] = { from: 'ff2', to: 'ff1', fromAnchor: [0, 0.3], toAnchor: [1, 0.3] };
      d.edges.splice(9, 1);
      d.edges[0].from = '';
      d.nodes[7].shape = 'textt';
      d.nodes.push({ id: 'u2', title: 'U2', shape: 'and', x: 790, y: 90 });
      d.edges.push({ from: 'ff1', to: 'ff3', fromAnchor: [1, 0.3], toAnchor: [1, 0.78] });
      d.edges.push({ from: 'clka', to: 'ff3', fromAnchor: [1, 0.5], toAnchor: [0, 0.3] });
      d.edges.push({ from: 'ff3', to: 'out', fromAnchor: [0, 0.3] });
      d.edges.push({ from: 'out', to: 'ffa', toAnchor: [1, 0.3] });
    });
    ok('a wire from an input into an output is reported as reversed', has(/(ngược chiều|backwards).*sync2\.D.*sync1\.Q/), items().join(' || '));
    ok('two outputs wired together are reported', has(/sync1\.Q.*sync3\.QN/));
    ok('an input with two sources is reported', has(/sync3\.D.*(3|2)/));
    ok('a wire leaving an input is reported', has(/(đi ra từ chân vào|leaves from input) sync3\.D/));
    ok('a wire going into an output is reported', has(/(đi vào chân ra|goes into output) req_a\.Q/));
    ok('a wired flip-flop without a clock is reported', has(/sync3.*CLK/));
    ok('stacked blocks are reported', has(/U2.*U1/));
    ok('an unknown shape is marked on its field', document.querySelector('[data-vk="nodes:7:shape"].ed-bad') && has(/textt/));
    ok('an empty required field is marked', document.querySelector('[data-vk="edges:0:from"].ed-bad'));
    ok('sub-tabs show how many problems they hold', /⚠/.test(document.querySelector('.ed-stab[data-pane="edges"] .ed-bdg').textContent));
    ok('the drawing rings the pins that have a problem', svg().querySelectorAll('.ed-issues circle').length >= 6 && svg().querySelector('.ed-issues rect'), svg().querySelectorAll('.ed-issues circle').length + ' rings');
    ok('the page notice stays empty while the editor lists the problems', document.getElementById('notice').hidden);

    var rev = Array.prototype.find.call(document.querySelectorAll('button.ed-chk-item'), function (b) { return /ngược chiều|backwards/.test(b.textContent); });
    rev.click();
    await wait(300);
    ok('clicking a wiring problem selects the connection and opens its pane', window.__adEditor.selected() && window.__adEditor.selected().edge === 1 && !document.querySelector('.ed-pane[data-pane="edges"]').hidden);
    var sh = Array.prototype.find.call(document.querySelectorAll('button.ed-chk-item'), function (b) { return /textt/.test(b.textContent); });
    sh.click();
    await wait(300);
    ok('clicking a field problem focuses that field', document.activeElement && document.activeElement.getAttribute('data-vk') === 'nodes:7:shape');
    var inp = document.querySelector('[data-vk="nodes:7:shape"]');
    inp.value = 'text';
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(700);
    ok('fixing the field clears its mark', !document.querySelector('[data-vk="nodes:7:shape"].ed-bad') && !has(/textt/));

    await applyJson(function (d) {
      d.edges = d.edges.filter(function (e, k) { return k < 9 && k !== 0; });
      d.nodes = d.nodes.filter(function (n) { return n.id !== 'u2'; });
    });
    ok('sync3 still needs its clock', has(/sync3.*CLK/));
    await pick('clkb');
    var a = pinPoint('CLK');
    await pick('ff3');
    var b = pinPoint('CLK');
    var src = svg().querySelector('.node[data-id="clkb"]');
    src.dispatchEvent(pe('pointerdown', a.x, a.y, { shiftKey: true }));
    for (var s2 = 1; s2 <= 10; s2++) { window.dispatchEvent(pe('pointermove', a.x + (b.x - a.x) * s2 / 10, a.y + (b.y - a.y) * s2 / 10, { shiftKey: true })); await wait(20); }
    var status = document.querySelector('.ed-status').textContent;
    ok('while wiring, the target pin is named with its direction', /CLK/.test(status), status);
    window.dispatchEvent(pe('pointerup', b.x, b.y, { shiftKey: true }));
    await wait(700);
    var last = raw().edges[raw().edges.length - 1];
    ok('the new wire lands on the clock pin and the check clears', last.to === 'ff3' && last.toAnchor && Math.abs(last.toAnchor.y - 0.72) < 0.01 && !has(/sync3.*CLK/), JSON.stringify(last));

    var pal = document.querySelector('.ed-sec[data-sec="palette"]');
    pal.open = true;
    await wait(200);
    var q = pal.querySelector('.ed-palsearch');
    q.value = 'flip';
    q.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(400);
    var found = Array.prototype.map.call(pal.querySelectorAll('.ed-sym'), function (x) { return x.title; });
    ok('the shape search finds symbols by name or alias', found.length >= 1 && found.length < 40, found.slice(0, 6).join(', '));
    q.value = 'logic gates and';
    q.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(400);
    found = Array.prototype.map.call(pal.querySelectorAll('.ed-sym'), function (x) { return x.title; });
    ok('the shape search also finds draw.io library shapes', found.some(function (t) { return /draw\.io/.test(t); }), found.slice(0, 4).join(', '));
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.slice(0, 3).join('; '));
"""

MULTI_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-panel .ed-row'); j++) await wait(100);
    await wait(300);
    var d = function () { return window.__adEditor.raw().diagrams[0]; };
    var node = function (id) { return d().nodes.filter(function (n) { return n.id === id; })[0]; };
    var el = function (id) { return svg().querySelector('.node[data-id="' + id + '"]'); };
    var click = function (id, extra) { var o = { bubbles: true }; for (var k in (extra || {})) o[k] = extra[k]; el(id).dispatchEvent(new MouseEvent('click', o)); return wait(250); };
    async function drag(target, fromX, fromY, dx, dy, extra) {
      target.dispatchEvent(pe('pointerdown', fromX, fromY, extra));
      for (var q = 1; q <= 10; q++) { window.dispatchEvent(pe('pointermove', fromX + dx * q / 10, fromY + dy * q / 10, extra)); await wait(15); }
      window.dispatchEvent(pe('pointerup', fromX + dx, fromY + dy, extra));
      await wait(700);
    }
    function center(e) { var r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

    await click('a');
    await click('b', { shiftKey: true });
    ok('Shift + click selects several blocks and shows the alignment bar', window.__adEditor.selected() && document.querySelector('.ed-selbar') && svg().querySelectorAll('.ed-overlay .ed-box').length === 2);
    var ax = node('a').x, bx = node('b').x, ca = center(el('a'));
    await drag(el('a'), ca.x, ca.y, 60, 0);
    ok('dragging one selected block moves all selected blocks', node('a').x !== ax && node('a').x - ax === node('b').x - bx, (node('a').x - ax) + ' / ' + (node('b').x - bx));

    await click('c');
    await click('e', { shiftKey: true });
    document.querySelector('.ed-selbar button[title="' + (document.documentElement.lang === 'vi' ? 'Căn mép dưới' : 'Align bottom edges') + '"]').click();
    await wait(600);
    ok('align bottom lines the blocks up', node('c').y === node('e').y, node('c').y + ' / ' + node('e').y);

    var ra = el('a').getBoundingClientRect(), rb = el('b').getBoundingClientRect();
    var start = { x: Math.min(ra.left, rb.left) - 8, y: Math.min(ra.top, rb.top) - 8 };
    await drag(svg(), start.x, start.y, Math.max(ra.right, rb.right) + 8 - start.x, Math.max(ra.bottom, rb.bottom) + 8 - start.y, { shiftKey: true });
    var rows = document.querySelectorAll('.ed-row.sel').length;
    ok('Shift + drag on empty space selects the blocks inside the box', rows === 2 && document.querySelector('.ed-selbar'), rows + ' rows selected');

    var before = d().nodes.length, edgesBefore = d().edges.length;
    var dt = new DataTransfer();
    document.dispatchEvent(new ClipboardEvent('copy', { clipboardData: dt, bubbles: true, cancelable: true }));
    var copied = dt.getData('text/plain');
    ok('Ctrl+C puts the selected blocks on the clipboard', /architecture-diagrams/.test(copied), copied.slice(0, 60));
    var dt2 = new DataTransfer();
    dt2.setData('text/plain', copied);
    document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt2, bubbles: true, cancelable: true }));
    await wait(700);
    var added = d().nodes.slice(before);
    ok('Ctrl+V pastes new blocks with new IDs and the wire between them', added.length === 2 && added.every(function (n) { return n.id !== 'a' && n.id !== 'b'; }) && d().edges.length === edgesBefore + 1, added.map(function (n) { return n.id; }).join(', '));
    ok('pasted blocks sit next to the originals and stay selected', added[0].x === node('a').x + 20 && document.querySelectorAll('.ed-row.sel').length === 2);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    await wait(700);
    ok('Delete removes every selected block', d().nodes.length === before, d().nodes.length);
    await click('e');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true }));
    await wait(700);
    ok('Ctrl+D duplicates the selected block', d().nodes.length === before + 1);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    await wait(700);

    var ce = center(el('e'));
    el('e').dispatchEvent(new MouseEvent('dblclick', { bubbles: true, clientX: ce.x, clientY: ce.y }));
    await wait(200);
    var ta = document.querySelector('.ed-inline-edit');
    ok('double-click opens a text box on the block', ta && ta.value === 'E');
    ta.value = 'Edited on the drawing';
    ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await wait(700);
    ok('Enter saves the new title', node('e').title === 'Edited on the drawing' && svg().textContent.indexOf('Edited on the drawing') >= 0);
    var edgeEl = svg().querySelectorAll('.edge')[2], hit = edgeEl.querySelector('.edge-hit') || edgeEl;
    hit.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await wait(200);
    ta = document.querySelector('.ed-inline-edit');
    ta.value = 'new label';
    ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await wait(700);
    ok('double-click on a connection edits its label', d().edges[2].label === 'new label', d().edges[2].label);
    el('b').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    await wait(200);
    ta = document.querySelector('.ed-inline-edit');
    ta.value = 'should not stay';
    ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(500);
    ok('Esc cancels the text box', node('b').title === 'B' && !document.querySelector('.ed-inline-edit'));

    var frame = center(svg().querySelector('.group[data-id="right"]')), ce2 = center(el('e'));
    await drag(el('e'), ce2.x, ce2.y, frame.x - ce2.x, frame.y - ce2.y);
    ok('dropping a block inside a group frame puts it in that group', node('e').group === 'right', node('e').group);
    var ce3 = center(el('e'));
    await drag(el('e'), ce3.x, ce3.y, -40, 420);
    ok('dragging it out of the frame takes it out of the group', !node('e').group, node('e').group);

    var clip = null, items = null;
    navigator.clipboard.writeText = function (t) { clip = t; return Promise.resolve(); };
    navigator.clipboard.write = function (list) { items = list; return Promise.resolve(); };
    document.querySelectorAll('.ed-tab')[1].click();
    await wait(200);
    var aiBtn = Array.prototype.find.call(document.querySelectorAll('.ed-panel .tb-btn'), function (b) { return /prompt/i.test(b.textContent); });
    aiBtn.click();
    await wait(200);
    ok('Copy prompt for AI puts the instructions, the pin list and this diagram on the clipboard', clip && /Symbols for/.test(clip) && /dff: D\(in\)/.test(clip) && clip.indexOf('"id": "e"') >= 0, clip ? clip.length + ' chars' : 'nothing copied');
    var area = document.querySelector('.ed-json'), obj = JSON.parse(area.value);
    obj.title = 'Pasted from an AI chat';
    area.value = 'Here is the diagram:\n```json\n' + JSON.stringify(obj) + '\n```';
    area.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    await wait(700);
    ok('JSON pasted with its code fence from an AI chat still applies', document.getElementById('doc-title').textContent === 'Pasted from an AI chat');
    document.querySelectorAll('.ed-tab')[0].click();
    await wait(300);
    openMenu();
    exportItem('copy').click();
    for (var w = 0; w < 40 && !items; w++) await wait(100);
    var png = items ? await items[0].getType('image/png') : null;
    ok('Copy picture puts a PNG on the clipboard for Word, PowerPoint or Teams', png && png.size > 1000, png ? png.size + ' bytes' : 'no clipboard write');
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.slice(0, 3).join('; '));
"""

EDGE_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    await wait(300);
    ok('markup and scripts in titles never run', window.__pwned === undefined);
    ok('markup in titles shows as plain text', svg().textContent.indexOf('<img src=x') >= 0 && document.getElementById('doc-title').textContent.indexOf('<b>') >= 0);
    ok('non-Latin text is drawn', svg().textContent.indexOf('中文') >= 0 && svg().textContent.indexOf('tiếng Việt') >= 0);
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-panel .ed-row'); j++) await wait(100);
    await wait(300);
    var raw = function () { return window.__adEditor.raw().diagrams[0]; };
    svg().querySelector('.node[data-id="x1"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(200);
    var box = document.querySelector('.ed-row[data-key="n:x2"] textarea');
    box.focus();
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    await wait(400);
    ok('Delete while typing in a field does not delete the selected block', raw().nodes.length === 3);
    box.blur();
    /* typing in the x2 row selected x2; Shift+click adds x1 */
    svg().querySelector('.node[data-id="x1"]').dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    await wait(200);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    await wait(700);
    ok('Delete removes both selected blocks and their connections', raw().nodes.length === 1 && raw().edges.length === 0, raw().nodes.length + ' nodes, ' + raw().edges.length + ' edges');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    await wait(700);
    ok('one undo brings both blocks and their connections back', raw().nodes.length === 3 && raw().edges.length === 3, raw().nodes.length + ' nodes, ' + raw().edges.length + ' edges');
    document.querySelector('.ed-stab[data-pane="edges"]').click();
    await wait(200);
    var from = document.querySelector('[data-vk="edges:0:from"]');
    from.value = '';
    from.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(700);
    from = document.querySelector('[data-vk="edges:0:from"]');
    ok('clearing a required field marks it and lists it under Checks', from.classList.contains('ed-bad') && /Required|Bắt buộc/.test(document.querySelector('.ed-checks').textContent));
    from.value = 'x1';
    from.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(700);
    ok('filling it in again clears the mark', !document.querySelector('[data-vk="edges:0:from"]').classList.contains('ed-bad') && /✓/.test(document.querySelector('.ed-checks').textContent));
    var dt = new DataTransfer();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wait(200);
    document.dispatchEvent(new ClipboardEvent('copy', { clipboardData: dt, bubbles: true, cancelable: true }));
    ok('copy with nothing selected leaves the clipboard alone', dt.getData('text/plain') === '');
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.slice(0, 3).join('; '));
"""

DRAWIO_JS = r"""
    for (var i = 0; i < 80 && !svg(); i++) await wait(100);
    await wait(300);
    var tabs = document.querySelectorAll('.tab');
    ok('both draw.io pages become tabs', tabs.length === 2, tabs.length);
    ok('the unknown library shape is reported', /1 /.test(document.getElementById('notice').textContent), document.getElementById('notice').textContent);
    var s = svg();
    var ids = ['cpu', 'cache', 'mux', 'gate', 'and1', 'note', 'ctrl', 'fancy', 'bridge', 'uart'];
    ok('every shape is drawn', ids.every(function (id) { return s.querySelector('.node[data-id="' + id + '"]'); }), s.querySelectorAll('.node').length + ' nodes');
    ok('every connection is drawn', s.querySelectorAll('.edge').length === 5, s.querySelectorAll('.edge').length);
    ok('rotation is kept', /rotate\(90/.test(s.querySelector('.node[data-id="mux"]').getAttribute('transform')));
    ok('draw.io electrical stencil is drawn from its library', s.querySelectorAll('.node[data-id="and1"] path').length >= 2);
    ok('invisible draw.io groups draw nothing, containers draw a box', !s.querySelector('.group[data-id="cpu-group"]') && s.querySelector('.group[data-id="lane"]'));
    ok('HTML labels keep bold parts', s.querySelector('.node[data-id="cpu"] tspan[font-weight="700"]'));
    ok('edge label from a child cell is shown', s.textContent.indexOf('APB') >= 0);
    tabs[1].click();
    ok('compressed page is decoded', svg().querySelectorAll('.node').length === 2 && svg().textContent.indexOf('Sink') >= 0);
    tabs[0].click();
    var original = JSON.parse(document.getElementById('diagram-spec').textContent).drawio;
    async function pages(text) {
      var doc = new DOMParser().parseFromString(text, 'application/xml'), out = [];
      for (var d of Array.prototype.slice.call(doc.getElementsByTagName('diagram'))) {
        var model = d.getElementsByTagName('mxGraphModel')[0];
        if (!model) {
          var bin = atob(d.textContent.trim()), bytes = new Uint8Array(bin.length);
          for (var q = 0; q < bin.length; q++) bytes[q] = bin.charCodeAt(q);
          var txt = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
          model = new DOMParser().parseFromString(decodeURIComponent(txt), 'application/xml').documentElement;
        }
        var cells = {};
        Array.prototype.forEach.call(model.getElementsByTagName('root')[0].children, function (el) {
          var cell = el.tagName === 'mxCell' ? el : el.getElementsByTagName('mxCell')[0], g = cell.getElementsByTagName('mxGeometry')[0];
          cells[el.getAttribute('id')] = { style: cell.getAttribute('style') || '', value: el.tagName === 'mxCell' ? (cell.getAttribute('value') || '') : (el.getAttribute('label') || ''),
            parent: cell.getAttribute('parent'), source: cell.getAttribute('source'), target: cell.getAttribute('target'),
            geo: g ? ['x', 'y', 'width', 'height'].map(function (k) { return +(g.getAttribute(k) || 0); }).join(',') : '',
            pts: g ? Array.prototype.map.call(g.getElementsByTagName('mxPoint'), function (q) { return (q.getAttribute('as') || '') + ':' + (+(q.getAttribute('x') || 0)).toFixed(3) + ',' + (+(q.getAttribute('y') || 0)).toFixed(3); }).sort().join(' ') : '' };
        });
        out.push(cells);
      }
      return out;
    }
    var exported = await exportText('drawio');
    var before = await pages(original), after = await pages(exported), diffs = [];
    before.forEach(function (cells, p) {
      Object.keys(cells).forEach(function (id) {
        var x = cells[id], y = after[p] && after[p][id];
        if (!y) { diffs.push(p + ':' + id + ' missing'); return; }
        ['style', 'value', 'source', 'target', 'parent', 'geo', 'pts'].forEach(function (k) { if ((x[k] || '') !== (y[k] || '')) diffs.push(p + ':' + id + ' ' + k); });
      });
    });
    ok('saving back to draw.io keeps every cell unchanged', !diffs.length, diffs.slice(0, 8).join('; '));
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-row'); j++) await wait(100);
    var row = document.querySelector('.ed-row[data-key="n:uart"] textarea');
    row.value = 'UART0';
    row.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(600);
    var edited = await pages(await exportText('drawio'));
    ok('an edited label is written back, other cells stay as they were', edited[0].uart.value === 'UART0' && edited[0].cpu.value === before[0].cpu.value && edited[0].uart.style === before[0].uart.style, edited[0].uart.value);
    await dragNode('ctrl', 60, 0);
    var moved = await pages(await exportText('drawio'));
    ok('a moved shape keeps its size and style in draw.io', moved[0].ctrl.geo !== before[0].ctrl.geo && moved[0].ctrl.style === before[0].ctrl.style && moved[0].ctrl.geo.split(',').slice(2).join() === before[0].ctrl.geo.split(',').slice(2).join(),
       before[0].ctrl.geo + ' -> ' + moved[0].ctrl.geo);
    /* a PNG saved by draw.io with the diagram inside, dropped on the page */
    var bin = atob('@@SAMPLE_PNG@@'), bytes = new Uint8Array(bin.length);
    for (var k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
    var dt = new DataTransfer();
    dt.items.add(new File([bytes], 'sample.drawio.png', { type: 'image/png' }));
    document.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    for (var k2 = 0; k2 < 60 && !(window.__adEditor.raw() && /sample/.test(window.__adEditor.raw().title || '') && window.__adEditor.raw().diagrams.length === 2 && svg() && svg().querySelector('.node[data-id="uart"]')); k2++) await wait(100);
    var fromPng = window.__adEditor.raw();
    ok('a .drawio.png dropped on the page opens its diagram', fromPng && fromPng.diagrams.length === 2 && !!svg().querySelector('.node[data-id="uart"]') && !!svg().querySelector('.node[data-id="and1"]'),
       fromPng && (fromPng.title + ' / ' + fromPng.diagrams.length));
"""

MANIP_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-panel .ed-row'); j++) await wait(100);
    var raw = function () { return window.__adEditor.raw().diagrams[0]; };
    async function dragEl(el, dx, dy, extra) {
      var r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      el.dispatchEvent(pe('pointerdown', x, y, extra));
      for (var q = 1; q <= 8; q++) { window.dispatchEvent(pe('pointermove', x + dx * q / 8, y + dy * q / 8, extra)); await wait(15); }
      window.dispatchEvent(pe('pointerup', x + dx, y + dy, extra));
      await wait(700);
    }
    function pick(sel) { svg().querySelector(sel).dispatchEvent(new MouseEvent('click', { bubbles: true })); return wait(300); }
    await pick('.node[data-id="g1"]');
    ok('selecting a block shows eight resize handles', svg().querySelectorAll('.ed-h[data-h^="resize-"]').length === 8);
    await dragEl(svg().querySelector('.ed-h[data-h="resize-se"]'), 70, 5);
    var g1 = raw().nodes[1];
    ok('a gate keeps its proportions when resized', g1.w > 56 && Math.abs(g1.w / g1.h - 56 / 44) < 0.02, g1.w + 'x' + g1.h);
    await pick('.node[data-id="a"]');
    await dragEl(svg().querySelector('.ed-h[data-h="resize-e"]'), 80, 0);
    ok('a box stretches freely', raw().nodes[0].w > 150 && raw().nodes[0].h === 50, raw().nodes[0].w + 'x' + raw().nodes[0].h);
    await dragEl(svg().querySelector('.node[data-id="db"]'), 3, 207);
    ok('a dragged block lines up with its neighbours or the grid', raw().nodes[4].x % 10 === 0 || raw().nodes[4].x === raw().nodes[0].x, raw().nodes[4].x + ',' + raw().nodes[4].y);
    svg().querySelectorAll('.edge')[2].querySelector('.edge-hit').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(300);
    ok('selecting a connection shows its end handles and a toolbar', svg().querySelectorAll('.ed-h[data-h^="end-"]').length === 2 && document.querySelector('.ed-edgebar'));
    var mid = svg().querySelector('.ed-h.ed-mid');
    await dragEl(mid, 0, 40);
    ok('dragging the middle of a segment adds a bend', (raw().edges[2].points || []).length >= 1, JSON.stringify(raw().edges[2].points));
    document.querySelectorAll('.ed-edgebar .ed-bb')[0].click();
    await wait(700);
    ok('the toolbar switches the line style', raw().edges[2].route === 'straight', raw().edges[2].route);
    svg().querySelectorAll('.edge')[1].querySelector('.edge-hit').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(300);
    var endH = svg().querySelector('.ed-h[data-h="end-to"]'), gr = svg().querySelector('.node[data-id="g2"]').getBoundingClientRect(), er = endH.getBoundingClientRect();
    await dragEl(endH, gr.left + 1 - (er.left + er.width / 2), gr.top + gr.height * 0.3 - (er.top + er.height / 2));
    var e1 = raw().edges[1];
    ok('dragging a wire end onto a gate connects it to the nearest pin', e1.to === 'g2' && e1.toAnchor && e1.toAnchor.x === 0 && Math.abs(e1.toAnchor.y - 0.3) < 0.01, JSON.stringify(e1));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    await wait(700);
    ok('Delete removes the selected connection', raw().edges.length === 2, raw().edges.length);
    document.querySelectorAll('.ed-tab')[2].click();
    await wait(400);
    var steps = document.querySelectorAll('.ed-hstep');
    ok('history lists every step with a name', steps.length >= 8 && /Xóa đường|Delete connection/.test(steps[0].textContent), steps.length + ' steps, latest: ' + steps[0].textContent);
    steps[steps.length - 1].click();
    await wait(800);
    ok('clicking the first step goes back to the opened file', raw().edges.length === 3 && raw().nodes[1].w === undefined, raw().edges.length);
    var undone = document.querySelectorAll('.ed-hstep.undone');
    undone[undone.length - 1].click();
    await wait(800);
    ok('later steps stay available to go forward again', document.querySelectorAll('.ed-hstep.undone').length >= 1);
    ok('the change list compares with the opened file', document.querySelectorAll('.ed-diff li').length >= 1 || /Chưa|No changes/.test(document.querySelector('.ed-hint') ? document.querySelector('.ed-hint').textContent : ''));
    var zoom = visible('.tb-zoom').textContent;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true }));
    await wait(200);
    ok('the + key zooms in and the zoom level shows', visible('.tb-zoom').textContent !== zoom && /%/.test(visible('.tb-zoom').textContent), zoom + ' -> ' + visible('.tb-zoom').textContent);
    for (var z = 0; z < 4; z++) { document.dispatchEvent(new KeyboardEvent('keydown', { key: '+', bubbles: true })); await wait(80); }
    await wait(200);
    ok('a large drawing shows the overview map', visible('.minimap') && !visible('.minimap').hidden);
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.slice(0, 3).join('; '));
"""

SYMBOLS_JS = r"""
    for (var i = 0; i < 80 && !svg(); i++) await wait(100);
    await wait(300);
    var s = svg(), nodes = s.querySelectorAll('.node');
    ok('no warning banner', document.getElementById('notice').hidden, document.getElementById('notice').textContent);
    var empty = Array.prototype.filter.call(nodes, function (n) {
      var shape = n.getAttribute('data-shape');
      if (shape === 'text' || shape === 'image') return false;
      return !Array.prototype.some.call(n.querySelectorAll('path'), function (p) { return /^M[\d.]+ [\d.]+[LCQAZ]/.test(p.getAttribute('d') || ''); });
    }).map(function (n) { return n.getAttribute('data-shape'); });
    ok('every symbol draws', !empty.length && nodes.length > 80, nodes.length + ' symbols' + (empty.length ? ', empty: ' + empty.join(' ') : ''));
    var drawio = await exportText('drawio');
    var stencils = (drawio.match(/shape=stencil\(/g) || []).length;
    ok('symbols go to draw.io as editable stencils', stencils >= 50, stencils + ' stencils');
    var enc = drawio.match(/shape=stencil\(([^)]+)\)/)[1];
    var bin = atob(enc), bytes = new Uint8Array(bin.length);
    for (var q = 0; q < bin.length; q++) bytes[q] = bin.charCodeAt(q);
    var xml = decodeURIComponent(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());
    ok('a stencil decodes to draw.io stencil XML', /^<shape [^>]*aspect="variable"/.test(xml) && xml.indexOf('<foreground>') > 0, xml.slice(0, 60));
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-head'); j++) await wait(100);
    var lib = await download(function () { document.querySelector('.ed-head .tb-menu .tb-btn').click(); document.querySelectorAll('.ed-head .menu button')[3].click(); });
    var libText = lib ? await lib.blob.text() : '';
    var items = libText ? JSON.parse(libText.replace(/^<mxlibrary>/, '').replace(/<\/mxlibrary>\s*$/, '')) : [];
    ok('draw.io symbol library is written', items.length >= 50 && items[0].xml && items[0].w, items.length + ' entries');
"""


ASSIST_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-panel .ed-row'); j++) await wait(100);
    await wait(400);
    var raw = function () { return window.__adEditor.raw().diagrams[1]; };
    var items = function () { return Array.prototype.map.call(document.querySelectorAll('.ed-chk-item'), function (x) { return x.textContent; }); };
    var has = function (re) { return items().some(function (t) { return re.test(t); }); };
    var wiring = /chưa có dây|nothing on|ngược chiều|backwards|chồng lên|on top of|hai chân ra|two outputs|nhận \d+ tín hiệu|receives \d+ signals|đi ra từ chân vào|leaves from input|đi vào chân ra|goes into output/;
    async function applyJson(mut) {
      var all = JSON.parse(JSON.stringify(window.__adEditor.raw()));
      mut(all);
      document.querySelectorAll('.ed-tab')[1].click(); await wait(150);
      var area = document.querySelector('.ed-json'); area.value = JSON.stringify(all);
      area.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true })); await wait(600);
      document.querySelectorAll('.ed-tab')[0].click(); await wait(600);
    }
    function fix(re) { return Array.prototype.find.call(document.querySelectorAll('.ed-fix'), function (b) { return re.test(b.textContent); }); }
    function row(re) { return Array.prototype.find.call(document.querySelectorAll('.ed-chk-list li'), function (li) { return re.test(li.textContent); }); }
    function pick(id) { svg().querySelector('.node[data-id="' + id + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true })); return wait(350); }
    function tab(k) { var sel = document.querySelector('.ed-pick select'); sel.value = String(k); sel.dispatchEvent(new Event('change', { bubbles: true })); return wait(500); }

    await applyJson(function (all) {
      var d = all.diagrams[1];
      d.edges[1] = { from: 'ff2', to: 'ff1', fromAnchor: [0, 0.3], toAnchor: [1, 0.3] };
      d.edges.splice(9, 1);
      d.nodes[7].shape = 'textt';
      d.nodes.push({ id: 'u2', title: 'U2', shape: 'and', x: 790, y: 90 });
      d.edges[0].to = 'ff1x';
    });
    ok('problems in Checks come with quick-fix buttons', document.querySelectorAll('.ed-chk-list .ed-fix').length >= 6, document.querySelectorAll('.ed-chk-list .ed-fix').length + ' buttons');
    ok('one button counts the safe fixes', /⚡/.test((document.querySelector('.ed-fixall') || {}).textContent || ''), (document.querySelector('.ed-fixall') || {}).textContent);
    fix(/Đảo hai đầu|Swap its ends/).click();
    await wait(700);
    ok('the swap fix turns a backwards wire around', raw().edges[1].from === 'ff1' && raw().edges[1].to === 'ff2' && !has(/ngược chiều|backwards/), JSON.stringify(raw().edges[1]));
    var clk = row(/sync3.*CLK/);
    ok('a missing clock offers the clock of its own domain first', clk && /clk_b/.test(clk.querySelector('.ed-fix').textContent), clk ? clk.textContent : 'no row');
    clk.querySelector('.ed-fix').click();
    await wait(700);
    var last = raw().edges[raw().edges.length - 1];
    ok('the clock fix wires clk_b to the CLK pin', last.from === 'clkb' && last.to === 'ff3' && last.toAnchor && Math.abs(last.toAnchor.y - 0.72) < 0.01 && last.kind === 'clock' && !has(/sync3.*CLK/), JSON.stringify(last));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    await wait(700);
    ok('Undo takes a quick fix back in one step', has(/sync3.*CLK/) && raw().edges[1].from === 'ff1');
    var shape = fix(/Đổi thành “text”|Use “text”/);
    ok('an unknown shape offers the closest name', !!shape);
    document.querySelector('.ed-fixall').click();
    await wait(1200);
    ok('one click fixes every safe problem', !has(/sync3.*CLK/) && !has(/U2.*U1/) && !has(/textt/), items().join(' || '));
    var d1 = raw(), u2 = d1.nodes.filter(function (n) { return n.id === 'u2'; })[0];
    ok('the stacked block moved to free space and the shape typo is fixed', u2 && (u2.x !== 790 || u2.y !== 90) && d1.nodes[7].shape === 'text', JSON.stringify(u2));
    var endRow = row(/ff1x/), endFixes = endRow ? Array.prototype.map.call(endRow.querySelectorAll('.ed-fix'), function (b) { return b.textContent; }) : [];
    ok('a short misspelled block name is left for a person to pick', endRow && !endRow.querySelector('.ed-fix.safe') && endFixes.some(function (t) { return /“ff1”/.test(t); }) && endFixes.some(function (t) { return /“ff1x”/.test(t); }), endFixes.join(' | '));
    fix(/Nối vào “ff1”|Point it at “ff1”/).click();
    await wait(700);
    var e0 = raw().edges[0];
    ok('pointing it at the block keeps the wire on its pin', e0.to === 'ff1' && e0.toAnchor && Math.abs((e0.toAnchor.x !== undefined ? e0.toAnchor.x : e0.toAnchor[0]) - 0) < 0.01 && !has(/ff1x/), JSON.stringify(e0));
    document.querySelectorAll('.ed-tab')[2].click();
    await wait(400);
    var steps = Array.prototype.map.call(document.querySelectorAll('.ed-hstep'), function (h) { return h.textContent; });
    ok('fixing everything is one step in the history', steps.filter(function (t) { return /Sửa nhanh \d+ lỗi|Quick fix: \d+ problems/.test(t); }).length === 1, steps.slice(-3).join(' | '));
    document.querySelectorAll('.ed-tab')[0].click();
    await wait(500);

    await pick('ff3');
    var sec = document.querySelector('.ed-sec[data-sec="patterns"]');
    sec.open = true;
    await wait(200);
    ok('the pattern list has four groups of patterns', sec.querySelectorAll('.ed-pat').length === __PATCOUNT__ && sec.querySelectorAll('.ed-gtitle').length === 4, sec.querySelectorAll('.ed-pat').length + ' patterns');
    ok('each pattern shows a small picture of itself', Array.prototype.every.call(sec.querySelectorAll('.ed-pat'), function (x) { var t = x.querySelector('svg.ed-pat-thumb'); return t && t.querySelectorAll('path').length && t.querySelectorAll('rect, g g').length; }));
    var q = sec.querySelector('.ed-palsearch');
    q.value = 'reset'; q.dispatchEvent(new Event('input', { bubbles: true }));
    var found = Array.prototype.map.call(sec.querySelectorAll('.ed-pat'), function (x) { return x.getAttribute('data-pattern'); });
    ok('the pattern search finds by name and keyword, in every group', found[0] === 'rstsync' && found.indexOf('clktree') > 0, found.join(','));
    q.value = 'dong bo mien'; q.dispatchEvent(new Event('input', { bubbles: true }));
    ok('the pattern search ignores Vietnamese accents', Array.prototype.some.call(sec.querySelectorAll('.ed-pat'), function (x) { return x.getAttribute('data-pattern') === 'sync2'; }));
    q.value = ''; q.dispatchEvent(new Event('input', { bubbles: true }));
    var n0 = raw().nodes.length;
    sec.querySelector('.ed-pat[data-pattern="sync2"] .ed-pat-add').click();
    await wait(900);
    var d2 = raw(), added = d2.nodes.slice(n0);
    ok('a pattern goes into free space next to the selected block', added.filter(function (n) { return n.shape === 'dff'; }).length === 2 && added.every(function (n) { return n.x > 700; }) && !has(/chồng lên|on top of/), JSON.stringify(added));
    var link = d2.edges.filter(function (e) { return e.from === 'ff3' && e.to === added[0].id; })[0];
    ok('the pattern is wired to the selected block pin by pin', link && link.fromAnchor.x === 1 && Math.abs(link.fromAnchor.y - 0.3) < 0.01 && link.toAnchor.x === 0, JSON.stringify(link));
    var clocked = d2.edges.filter(function (e) { return e.from === 'clka' && (e.to === added[0].id || e.to === added[1].id); });
    ok('a synchronizer takes the clock of the other domain and says so', clocked.length === 2 && /clk_a/.test(document.querySelector('.ed-status').textContent), document.querySelector('.ed-status').textContent);
    await pick(added[1].id);
    var sg = document.querySelector('.ed-suggest');
    ok('selecting a flip-flop suggests the next stage and a synchronizer into the other domain', sg && !sg.hidden && /Thêm tầng flip-flop|next flip-flop/.test(sg.textContent) && /sang miền clk_b|into the clk_b domain/.test(sg.textContent), sg ? sg.textContent : '');
    document.querySelectorAll('.ed-tab')[1].click();
    await wait(200);
    var area = document.querySelector('.ed-json');
    area.value = JSON.stringify({ ops: [{ op: 'addNode', node: { id: 'lone', shape: 'dff', title: 'lone', group: 'db' }, near: 'ff2', side: 'below' }, { op: 'connect', from: 'ff2.Q', to: 'lone.D' }] });
    area.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    await wait(700);
    document.querySelectorAll('.ed-tab')[0].click();
    await wait(600);
    ok('the JSON tab applies a list of operations to the open tab', raw().nodes.some(function (n) { return n.id === 'lone' && typeof n.x === 'number'; }) && has(/lone.*CLK/), items().join(' || '));
    await pick('lone');
    ok('a suggested wire shows faintly on the drawing too', svg().querySelector('.ed-ghost path') && !svg().querySelector('.ed-ghost rect') && /CLK/.test(document.querySelector('.ed-ghostbar').textContent), document.querySelector('.ed-ghostbar') ? document.querySelector('.ed-ghostbar').textContent : 'no bar');
    var sgClk = Array.prototype.find.call(document.querySelectorAll('.ed-sg'), function (b) { return /CLK.*clk_b/.test(b.textContent); });
    ok('a block with an open clock pin suggests the clock of its domain', !!sgClk, document.querySelector('.ed-suggest').textContent);
    sgClk.click();
    await wait(800);
    ok('the suggestion wires it', !has(/lone.*CLK/), items().join(' || '));
    await pick('ff3');
    var sec2 = document.querySelector('.ed-sec[data-sec="patterns"]');
    sec2.open = true;
    await wait(150);
    sec2.querySelector('.ed-pat[data-pattern="afifo"] .ed-pat-add').click();
    await wait(900);
    var wd = raw().edges.filter(function (e) { return e.from === 'ff3' && e.to === 'mem'; })[0];
    ok('a FIFO next to a flip-flop takes its output as write data', wd && wd.label === 'wdata' && wd.fromAnchor && wd.fromAnchor.x === 1 && !items().some(function (t) { return wiring.test(t); }), JSON.stringify(wd));
    var frames = Array.prototype.map.call(svg().querySelectorAll('g.group'), function (g) { var b = g.querySelector('rect').getBBox(); return { id: g.getAttribute('data-id'), x: b.x, y: b.y, w: b.width, h: b.height }; });
    var clash = [];
    frames.forEach(function (a) { frames.forEach(function (b) {
      if (/^(wdom|rdom)/.test(a.id) && /^(da|db)$/.test(b.id) && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) clash.push(a.id + '/' + b.id);
    }); });
    ok('its clock-domain frames stay clear of the frames already drawn', frames.length === 4 && !clash.length, clash.join(', ') || frames.map(function (f) { return f.id; }).join(','));

    var ids = __PATIDS__;
    await applyJson(function (all) { ids.forEach(function (id) { all.diagrams.push({ id: 'p-' + id, title: id, nodes: [], edges: [] }); }); });
    var bad = [];
    for (var k = 0; k < ids.length; k++) {
      await tab(2 + k);
      var s2 = document.querySelector('.ed-sec[data-sec="patterns"]');
      s2.open = true;
      await wait(150);
      s2.querySelector('.ed-pat[data-pattern="' + ids[k] + '"] .ed-pat-add').click();
      await wait(150);  /* drawn at once: the check below counts the blocks on the drawing right after the click */
      var dd = window.__adEditor.raw().diagrams[2 + k], left = items().filter(function (t) { return wiring.test(t); });
      if (!dd.nodes.length || left.length || !svg() || svg().querySelectorAll('.node').length !== dd.nodes.length) bad.push(ids[k] + ': ' + dd.nodes.length + ' blocks, ' + (left[0] || 'drawn ' + (svg() ? svg().querySelectorAll('.node').length : 0)));
    }
    ok('every pattern goes into an empty tab without problems and is drawn at once', !bad.length, bad.join(' | '));

    var sample = function () { return { title: 'Sơ đồ mới', direction: 'LR', nodes: [{ id: 'a', title: 'Khối A', color: 'blue' }, { id: 'b', title: 'Khối B', color: 'teal' }], edges: [{ from: 'a', to: 'b', label: 'dữ liệu' }] }; };
    await applyJson(function (all) { all.diagrams.push(sample(), sample(), sample(), sample()); });
    var base = window.__adEditor.raw().diagrams.length - 4;
    await tab(base);
    var start = document.querySelector('.ed-start');
    ok('a new tab asks where to start', start && start.querySelectorAll('.ed-start-card').length === 6 && start.querySelectorAll('.ed-start-pats .ed-sg').length === __PATTOP__ && start.querySelector('.ed-start-all') && start.querySelector('.ed-start-ask'), start ? start.textContent.slice(0, 80) : 'no panel');
    start.querySelector('.ed-start-pats .ed-sg[data-pattern="sync2"]').click();
    await wait(900);
    var fresh = window.__adEditor.raw().diagrams[base];
    ok('starting from a pattern replaces the two sample blocks', fresh.nodes.length === 5 && !fresh.nodes.some(function (n) { return n.id === 'a'; }) && !items().some(function (t) { return wiring.test(t); }) && !document.querySelector('.ed-start'), JSON.stringify(fresh.nodes.map(function (n) { return n.id; })));
    await pick('sync2');
    ok('the likely next block shows faintly on the drawing with a Tab button', svg().querySelector('.ed-ghost rect') && document.querySelector('.ed-ghostbar kbd'), document.querySelector('.ed-ghostbar') ? document.querySelector('.ed-ghostbar').textContent : 'no bar');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await wait(900);
    var grown = window.__adEditor.raw().diagrams[base];
    var nextFf = grown.nodes[grown.nodes.length - 1];
    ok('Tab adds it, wired and clocked, and the output label moves on to it', grown.nodes.length === 6 && grown.edges.some(function (e) { return e.from === nextFf.id && e.to === 'd_sync'; }) && grown.edges.some(function (e) { return e.from === 'sync2' && e.to === nextFf.id; }) && grown.edges.some(function (e) { return e.to === nextFf.id && e.kind === 'clock'; }) && !items().some(function (t) { return wiring.test(t); }), JSON.stringify(nextFf));
    ok('the new block is selected, so Tab can go on', window.__adEditor.selected() && window.__adEditor.selected().id === nextFf.id && svg().querySelector('.ed-ghost'));
    await tab(base + 1);
    document.querySelector('.ed-start-card[data-type="pinout"]').click();
    await wait(800);
    ok('picking a kind of diagram turns the tab into it', window.__adEditor.raw().diagrams[base + 1].type === 'pinout' && !document.querySelector('.ed-start'));
    await tab(base + 2);
    Array.prototype.filter.call(document.querySelectorAll('.ed-start .ed-fix'), function (b) { return /hai khối mẫu|two sample/.test(b.textContent); })[0].click();
    await wait(300);
    var titleIn = document.querySelector('.ed-row[data-key="n:a"] textarea');
    titleIn.focus();
    titleIn.value = 'SRAM 64KB';
    titleIn.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(900);
    var byName = Array.prototype.find.call(document.querySelectorAll('.ed-sg'), function (b) { return /ký hiệu RAM|the RAM symbol/.test(b.textContent); });
    ok('typing a block name suggests the shape that fits it', !!byName, document.querySelector('.ed-suggest') ? document.querySelector('.ed-suggest').textContent : '');
    byName.click();
    await wait(800);
    ok('the name suggestion changes the shape', window.__adEditor.raw().diagrams[base + 2].nodes[0].shape === 'ram');
    await tab(base + 3);
    var answer = document.querySelector('.ed-start .ed-start-answer');
    var applyBtn = function () { return Array.prototype.filter.call(document.querySelectorAll('.ed-start .tb-btn'), function (b) { return /^(Áp dụng|Apply)$/.test(b.textContent); })[0]; };
    answer.value = 'không phải JSON';
    applyBtn().click();
    await wait(300);
    ok('a broken AI answer shows why it was not applied', /JSON/.test(document.querySelector('.ed-start .ed-err').textContent) && window.__adEditor.raw().diagrams[base + 3].nodes[0].id === 'a', document.querySelector('.ed-start .ed-err').textContent);
    answer.value = 'Đây là thay đổi:\n```json\n' + JSON.stringify({ ops: [{ op: 'renameNode', id: 'a', to: 'cpu' }, { op: 'updateNode', id: 'cpu', set: { title: 'CPU' } }] }) + '\n```';
    applyBtn().click();
    await wait(800);
    var pasted = window.__adEditor.raw().diagrams[base + 3];
    ok('an AI answer pasted into the start panel changes the tab', pasted.nodes[0].id === 'cpu' && pasted.nodes[0].title === 'CPU' && pasted.edges[0].from === 'cpu', JSON.stringify(pasted.nodes[0]));
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.slice(0, 3).join('; '));
"""


GROW_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var j = 0; j < 40 && !document.querySelector('.ed-panel .ed-row'); j++) await wait(100);
    await wait(400);
    var tabRaw = function (k) { return window.__adEditor.raw().diagrams[k]; };
    var items = function () { return Array.prototype.map.call(document.querySelectorAll('.ed-chk-item'), function (x) { return x.textContent; }); };
    var wiring = /chưa có dây|ngược chiều|chồng lên|hai chân ra|nhận \d+ tín hiệu|đi ra từ chân vào|đi vào chân ra|không có khối/;
    var problems = function () { return items().filter(function (t) { return wiring.test(t); }); };
    var box = function () { return document.querySelector('.ed-suggest'); };
    var sgs = function () { return Array.prototype.map.call(document.querySelectorAll('.ed-suggest .ed-sg'), function (b) { return b.textContent; }); };
    function pick(id) { svg().querySelector('.node[data-id="' + id + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true })); return wait(350); }
    function tab(k) { var sel = document.querySelector('.ed-pick select'); sel.value = String(k); sel.dispatchEvent(new Event('change', { bubbles: true })); return wait(500); }
    function key(k, target) { (target || document).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); return wait(700); }
    function count(k) { var d = tabRaw(k); return d.nodes.length + '/' + (d.edges || []).length + '/' + (d.groups || []).length + '/' + d.nodes.filter(function (n) { return n.group; }).length; }
    /* a newcomer who only presses Tab (take the faint block) or 1 (the first suggestion or next step) */
    async function follow(k, steps) {
      var bad = [];
      for (var s = 0; s < steps; s++) {
        var before = count(k);
        if (document.querySelector('.ed-ghostbar')) await key('Tab'); else await key('1');
        if (count(k) === before) bad.push('step ' + (s + 1) + ' changed nothing');
        var pr = problems();
        if (pr.length) bad.push('step ' + (s + 1) + ': ' + pr[0]);
      }
      return bad;
    }

    await tab(0);
    ok('with nothing selected, the box lists next steps for the whole tab', box() && !box().hidden && /Bước tiếp theo/.test(box().textContent) && /CPU RISC-V: Thêm bus AXI/.test(box().textContent), box() ? box().textContent : 'no box');
    var socBad = await follow(0, 10), soc = tabRaw(0), titles = soc.nodes.map(function (n) { return n.title; }).join(', ');
    ok('pressing only Tab and 1 grows an SoC ten steps without a problem', !socBad.length && soc.nodes.length >= 9, socBad.join(' | ') || titles);
    ok('the SoC gets a bus, memory, a bridge and peripherals in order', /Bus AXI/.test(titles) && /SRAM/.test(titles) && /Cầu AXI sang APB/.test(titles) && /UART/.test(titles) && /GPIO/.test(titles), titles);
    var framed = (soc.groups || []).length ? soc.nodes.filter(function (n) { return n.group; }).length : 0;
    if (!framed) {
      await key('Escape');
      var fr = sgs().map(function (t, i) { return [t, i]; }).filter(function (x) { return /Gom \d+ ngoại vi/.test(x[0]); })[0];
      if (fr) await key(String(fr[1] + 1));
      framed = tabRaw(0).nodes.filter(function (n) { return n.group; }).length;
    }
    var bare = tabRaw(0).nodes.filter(function (n) { return n.id !== 'cpu' && !(n.color && n.desc); }).map(function (n) { return n.id; });
    ok('every block the suggestions added has its color and description filled in', !bare.length, bare.join(', '));
    ok('a grown SoC is offered one frame for its peripherals', framed >= 3 && !problems().length, framed + ' blocks in a frame; ' + sgs().join(' | '));

    await tab(1);
    await pick('ff0');
    var chipBad = await follow(1, 6), chip = tabRaw(1), flops = chip.nodes.filter(function (n) { return n.shape === 'dff'; });
    var clocked = flops.filter(function (f) { return chip.edges.some(function (e) { return e.to === f.id && e.kind === 'clock'; }); });
    ok('a flip-flop chain grows with every stage clocked and nothing stacked', !chipBad.length && flops.length === 7 && clocked.length === 7, chipBad.join(' | ') || flops.length + ' flops, ' + clocked.length + ' clocked');

    await tab(2);
    await pick('start');
    var flowBad = await follow(2, 3);
    await key('2');
    var flow = tabRaw(2), check = flow.nodes.filter(function (n) { return n.shape === 'decision'; })[0];
    ok('a flowchart offers the next step and a yes/no check', !flowBad.length && check && window.__adEditor.selected().id === check.id, flowBad.join(' | ') || JSON.stringify(flow.nodes.map(function (n) { return n.shape || n.title; })));
    ok('a check offers both branches and a way back', sgs().some(function (t) { return /Thêm nhánh “Có”/.test(t); }) && sgs().some(function (t) { return /quay lại/.test(t); }), sgs().join(' | '));
    await key('3');
    await key('1');
    var outs = tabRaw(2).edges.filter(function (e) { return e.from === check.id; }).map(function (e) { return e.label; }).sort();
    ok('the check ends with a Yes branch and a No branch back a step', outs.join(',') === 'Có,Không' && !problems().length, outs.join(','));

    await tab(3);
    await pick('b');
    await key('Delete');
    ok('deleting a block in the middle says how to join its neighbours again', /Bấm phím 1 để nối lại Nhận đơn tới Giao hàng/.test(document.querySelector('.ed-status').textContent) && /Nối lại Nhận đơn tới Giao hàng/.test(sgs()[0] || ''), document.querySelector('.ed-status').textContent + ' / ' + sgs()[0]);
    await key('1');
    var healed = tabRaw(3).edges.filter(function (e) { return e.from === 'a' && e.to === 'c'; })[0];
    ok('one key joins them again, keeping the label', healed && healed.label === 'đơn mới' && !problems().length, JSON.stringify(tabRaw(3).edges));

    await tab(5);
    await pick('ffb');
    await key('Delete');
    await key('1');
    var wire = tabRaw(5).edges.filter(function (e) { return e.from === 'ffa' && e.to === 'ffc'; })[0];
    var ax = function (a) { return a ? (a.x !== undefined ? [a.x, a.y] : a) : []; };
    ok('a wired chain is joined again pin to pin (Q to D)', wire && ax(wire.fromAnchor).join() === '1,0.3' && ax(wire.toAnchor).join() === '0,0.3' && !problems().length, JSON.stringify(wire));

    await tab(4);
    await pick('idle');
    var fsmBad = await follow(4, 4), fsm = tabRaw(4);
    var back = fsm.edges.filter(function (e) { return e.to === 'idle'; });
    ok('a state machine grows and, from four states, closes the loop back to the start', !fsmBad.length && fsm.nodes.length === 4 && back.length === 1, fsmBad.join(' | ') || JSON.stringify(fsm.edges));

    await tab(1);
    var last = tabRaw(1).nodes[tabRaw(1).nodes.length - 1].id;
    await pick(last);
    ok('the faint block is there before it is turned off', !!document.querySelector('.ed-ghostbar'));
    document.querySelector('.ed-sg-ghost').click();
    await wait(400);
    var n1 = count(1);
    await key('Tab');
    ok('turned off, no faint block shows and Tab adds nothing', !document.querySelector('.ed-ghostbar') && count(1) === n1 && /tắt/.test(document.querySelector('.ed-sg-ghost').textContent));
    document.querySelector('.ed-sg-ghost').click();
    await wait(400);
    ok('turned on again, it comes back', !!document.querySelector('.ed-ghostbar'));

    /* Tab on a block reached with the keyboard moves the focus on; after a click it takes the faint block */
    var nodeEl = svg().querySelector('.node[data-id="' + last + '"]');
    nodeEl.focus();
    await key('Enter');
    await pick(last);
    var n2 = count(1);
    await key('Tab', nodeEl);
    ok('Tab on a block focused with the keyboard does not add a block', count(1) === n2, count(1) + ' vs ' + n2);
    nodeEl = svg().querySelector('.node[data-id="' + last + '"]');
    nodeEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
    await pick(last);
    await key('Tab');
    ok('after a click, Tab adds the faint block', count(1) !== n2, count(1) + ' vs ' + n2);

    var area = document.querySelector('.ed-row textarea');
    area.focus();
    var n3 = count(1);
    await key('1', area);
    ok('the number keys do nothing while typing in a table', count(1) === n3);
    area.blur();

    /* the page's own tab buttons: the editor follows, so a Tab goes into the tab on screen */
    var pageTabs = document.querySelectorAll('#tabs .tab');
    pageTabs[3].click();
    await wait(600);
    ok('clicking a tab of the page moves the editor to that tab', document.querySelector('.ed-pick select').value === '3', document.querySelector('.ed-pick select').value);
    var s3 = tabRaw(3).nodes.length, s1 = tabRaw(1).nodes.length;
    await pick('c');
    await key('Tab');
    ok('and Tab adds the block to that tab, not the one before', tabRaw(1).nodes.length === s1 && tabRaw(3).nodes.length === s3 + 1, count(3) + ' / ' + count(1));
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.slice(0, 3).join('; '));
"""

BOARD_JS = r"""
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var i = 0; i < 60 && !document.querySelector('.ed-hier-btn'); i++) await wait(100);
    var btn = document.querySelector('.ed-hier-btn');
    ok('the overview offers a detail board', !!btn, btn && btn.textContent);
    btn.click();
    await wait(900);
    var raw = window.__adEditor.raw(), B = raw.diagrams[window.__adEditor.tab()];
    ok('the board is a new hand-placed tab linked to the overview', B && B.boardOf === raw.diagrams[0].id && B.layout === 'manual', B && B.id);
    var frames = (B.groups || []).filter(function (g) { return g.source; }), ports = (B.nodes || []).filter(function (n) { return n.port; });
    ok('every block of the overview became a frame', frames.length === raw.diagrams[0].nodes.length, frames.length);
    ok('frames carry the ports of their connections', ports.length >= 14 && ports.every(function (n) { return n.port.of && frames.some(function (f) { return f.id === n.port.of; }); }), ports.length);
    ok('every connection became a wire between two ports', (B.edges || []).length === raw.diagrams[0].edges.length && B.edges.every(function (e) { return e.source && e.fromAnchor && e.toAnchor; }), (B.edges || []).length);
    ok('frames, ports and hints are drawn', svg().querySelectorAll('.group.frame').length === frames.length && svg().querySelectorAll('.node[data-shape^="port-"]').length === ports.length && svg().querySelectorAll('.frame-hint').length === frames.length);
    var overlap = 0;
    frames.forEach(function (p, a) { frames.forEach(function (q, b) { if (b > a && p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h) overlap++; }); });
    ok('frames keep the overview arrangement without overlapping', overlap === 0, overlap);
    ok('ports sit on all four sides where the neighbours are', ['port-in', 'port-out', 'port-in-v', 'port-out-v'].filter(function (sh) { return ports.some(function (n) { return n.shape === sh; }); }).length >= 3);
    ok('the board links back to its overview', /↰/.test(visible('.crumbs') ? visible('.crumbs').textContent : ''), visible('.crumbs') && visible('.crumbs').textContent);
    var items = Array.prototype.map.call(document.querySelectorAll('.ed-checks .ed-chk-item'), function (x) { return x.textContent; });
    ok('a fresh board has no wiring problems, only port names to tidy', items.every(function (x) { return /^(Port|Cổng) «/.test(x); }), items.slice(0, 3).join(' | '));
    document.querySelector('.ed-hier-btn').click();
    await wait(700);
    ok('back to the overview', window.__adEditor.tab() === 0);
    var first = raw.diagrams[0].nodes[0].id;
    window.__adEditor.ops([{ op: 'addNode', node: { id: 'npu2', title: 'NPU 2', color: 'violet' } }, { op: 'connect', from: 'npu2', to: first, label: 'AXI' }], 'add');
    await wait(900);
    raw = window.__adEditor.raw(); B = raw.diagrams.filter(function (d) { return d.boardOf; })[0];
    ok('a new block gets its frame on the board', (B.groups || []).some(function (g) { return g.source === 'npu2'; }));
    ok('a new connection gets its ports and wire', (B.edges || []).some(function (e) { return /^npu2>/.test(e.source); }));
    window.__adEditor.ops([{ op: 'renameNode', id: 'npu2', to: 'npu_b' }], 'rename');
    await wait(900);
    raw = window.__adEditor.raw(); B = raw.diagrams.filter(function (d) { return d.boardOf; })[0];
    ok('renaming a block keeps its frame', (B.groups || []).some(function (g) { return g.source === 'npu_b'; }) && !(B.groups || []).some(function (g) { return g.source === 'npu2'; }));
    ok('and its wire, with no second wire into the port', (B.edges || []).filter(function (e) { return /^npu_b>/.test(e.source); }).length === 1 && !(B.edges || []).some(function (e) { return /^npu2>/.test(e.source); }),
       JSON.stringify((B.edges || []).map(function (e) { return e.source; }).filter(function (k) { return /npu/.test(k); })));
    var ovE = raw.diagrams[0].edges.map(function (e, k) { return { e: e, k: k }; }).filter(function (q) { return q.e.from === 'npu_b'; })[0];
    window.__adEditor.ops([{ op: 'updateEdge', edge: ovE.k, set: { label: 'AXI4' } }], 'relabel');
    await wait(900);
    raw = window.__adEditor.raw(); B = raw.diagrams.filter(function (d) { return d.boardOf; })[0];
    ok('a relabelled connection keeps its wire', (B.edges || []).filter(function (e) { return /^npu_b>/.test(e.source); }).length === 1 && (B.edges || []).some(function (e) { return /^npu_b>.*:AXI4$/.test(e.source) && e.label === 'AXI4'; }),
       JSON.stringify((B.edges || []).map(function (e) { return e.source; }).filter(function (k) { return /npu/.test(k); })));
    window.__adEditor.ops([{ op: 'removeNode', id: 'npu_b' }], 'remove');
    await wait(900);
    document.querySelector('.ed-hier-btn').click();
    await wait(900);
    raw = window.__adEditor.raw(); B = raw.diagrams[window.__adEditor.tab()];
    ok('removing a block leaves the drawn frame alone', (B.groups || []).some(function (g) { return g.source === 'npu_b'; }));
    ok('and the Checks list says it is gone', /npu_b/.test(document.querySelector('.ed-checks').textContent), document.querySelector('.ed-checks').textContent.slice(0, 240));
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.join(' | '));
"""

NOTES_AI_JS = r"""
    var asked = [], realFetch = window.fetch;
    window.fetch = function (url, opts) {
      if (String(url).indexOf('http://127.0.0.1:') === 0) {
        var path = String(url).replace(/^http:\/\/127\.0\.0\.1:\d+/, '');
        if (path === '/health') return Promise.resolve(new Response(JSON.stringify({ ok: true, paired: true, claude: '2.1.233', busy: false }), { status: 200 }));
        var body = JSON.parse(opts.body);
        asked.push(body);
        /* first answer: a FIFO inside the frame placed outside it, and a wire to a pin that does not exist; the page asks again */
        var data = asked.length === 1 ? { ops: [{ op: 'addNode', node: { id: 'u_fifo_rx', title: 'u_fifo_rx', shape: 'fifo', group: 'uart', x: 0, y: 0 } }, { op: 'connect', from: 'u_fifo_rx.NOPE', to: 'u_fifo_rx.IN' }], note: 'x' }
                 : asked.length === 2 ? { ops: [{ op: 'addNode', node: { id: 'u_fifo_rx', title: 'u_fifo_rx', shape: 'fifo', group: 'uart', x: 0, y: 0 } }], note: 'Đã thêm FIFO nhận u_fifo_rx vào khung UART.' }
                 : { ops: [{ op: 'addNode', node: { id: 'u_baud', title: 'u_baud', group: 'uart', x: 0, y: 0 } }], note: 'Đã thêm bộ tạo baud u_baud.' };
        var reply = new Response(JSON.stringify({ ok: true, data: data, model: 'claude-sonnet-5', ms: 800 }), { status: 200 });
        return asked.length >= 3 ? new Promise(function (r) { setTimeout(function () { r(reply); }, 1200); }) : Promise.resolve(reply);
      }
      return realFetch.apply(this, arguments);
    };
    for (var i = 0; i < 60 && !svg(); i++) await wait(100);
    document.getElementById('edit-btn').click();
    for (var i = 0; i < 60 && !document.querySelector('.ed-hier-btn'); i++) await wait(100);
    document.querySelector('.ed-hier-btn').click();
    await wait(900);
    window.__adEditor.select([], ['uart']);
    await wait(300);
    var bar = document.querySelector('.ed-actbar');
    ok('a selected frame shows AI, note and inside actions', !!bar && bar.querySelectorAll('button').length >= 3, bar && bar.textContent);
    ok('notes are suggested from the diagram', document.querySelectorAll('.ed-sg-note').length > 0, document.querySelectorAll('.ed-sg-note').length);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }));
    await wait(400);
    var ta = document.querySelector('.ed-note-edit');
    ok('N opens a note on the selected frame', !!ta);
    if (ta) { ta.value = 'FIFO nhận sâu 16 byte.'; ta.dispatchEvent(new Event('blur')); }
    await wait(700);
    var raw = window.__adEditor.raw(), B = raw.diagrams[window.__adEditor.tab()];
    ok('the note is saved with the frame it is about', (B.notes || []).some(function (q) { return q.attach === 'uart' && /FIFO/.test(q.text) && q.date; }), JSON.stringify(B.notes));
    ok('the note is drawn', svg().querySelectorAll('.note-sticky').length === (B.notes || []).length);
    window.__adEditor.select([], ['uart']);
    await wait(300);
    document.querySelector('.ed-actbar .ed-bb-ai').click();
    await wait(300);
    var box = document.querySelector('.ai-box');
    ok('the AI box opens next to the frame', !!box && /UART/.test(box.textContent));
    box.querySelector('textarea').value = 'Thêm FIFO nhận vào khung này';
    box.querySelector('.ai-send').click();
    for (var i = 0; i < 50 && !document.querySelector('.ai-bar'); i++) await wait(100);
    var pbar = document.querySelector('.ai-bar');
    ok('an answer that fails is sent back once, then the change is shown first', !!pbar && asked.length === 2 && /Errors/.test(asked[1].prompt), asked.length + ' asks');
    ok('the request carries the selection and the naming rule', /"selected":\["uart"\]/.test(asked[0].prompt) && /snake_case/.test(asked[0].system));
    ok('the change is outlined before it is applied', svg().querySelectorAll('.ai-overlay rect').length >= 1);
    ok('nothing is applied before Apply', !window.__adEditor.raw().diagrams[window.__adEditor.tab()].nodes.some(function (n) { return n.id === 'u_fifo_rx'; }));
    pbar.querySelector('.ai-accept').click();
    await wait(900);
    raw = window.__adEditor.raw(); B = raw.diagrams[window.__adEditor.tab()];
    var fifo = (B.nodes || []).filter(function (n) { return n.id === 'u_fifo_rx'; })[0], fr = (B.groups || []).filter(function (g) { return g.id === 'uart'; })[0];
    ok('Apply adds the block inside the frame', fifo && fifo.group === 'uart' && fifo.x >= fr.x && fifo.y >= fr.y && fifo.x < fr.x + fr.w && fifo.y < fr.y + fr.h, JSON.stringify(fifo) + ' in ' + JSON.stringify(fr));
    ok('the AI writes a note about what it did', (B.notes || []).some(function (q) { return q.by === 'AI' && /u_fifo_rx/.test(q.text); }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
    await wait(600);
    ok('one undo takes the whole AI change back', !window.__adEditor.raw().diagrams[window.__adEditor.tab()].nodes.some(function (n) { return n.id === 'u_fifo_rx'; }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
    await wait(600);
    window.__adEditor.select([], ['uart']);
    await wait(300);
    document.querySelector('.ed-actbar .ed-bb-ai').click();
    await wait(300);
    box = document.querySelector('.ai-box');
    box.querySelector('textarea').value = 'Thêm bộ tạo baud';
    var n0 = asked.length;
    box.querySelector('.ai-send').click();
    box.querySelector('.ai-send').click();
    box.querySelector('textarea').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    await wait(150);
    window.__adEditor.ops([{ op: 'addNote', note: { text: 'Ghi chú viết trong lúc AI làm', attach: 'gpio' } }], 'meanwhile');
    for (var i = 0; i < 60 && !document.querySelector('.ai-bar'); i++) await wait(100);
    ok('one request at a time: clicking again sends nothing', asked.length === n0 + 1, (asked.length - n0) + ' sent');
    window.__adEditor.ops([{ op: 'addNote', note: { text: 'Ghi chú viết khi đang xem đề xuất', attach: 'gpio' } }], 'during preview');
    await wait(300);
    document.querySelector('.ai-bar .ai-accept').click();
    await wait(900);
    B = window.__adEditor.raw().diagrams[window.__adEditor.tab()];
    ok('what was edited while the AI worked is kept when its change is applied', (B.nodes || []).some(function (n) { return n.id === 'u_baud'; }) &&
       (B.notes || []).some(function (q) { return /trong lúc AI làm/.test(q.text); }) && (B.notes || []).some(function (q) { return /khi đang xem/.test(q.text); }),
       JSON.stringify((B.notes || []).map(function (q) { return q.text.slice(0, 30); })));
    window.__adEditor.select([], ['uart']);
    await wait(300);
    var inside = Array.prototype.filter.call(document.querySelectorAll('.ed-actbar .ed-bb'), function (b) { return /▸/.test(b.textContent); })[0];
    inside.click();
    await wait(900);
    raw = window.__adEditor.raw();
    var D = raw.diagrams[window.__adEditor.tab()], board = raw.diagrams.filter(function (d) { return d.boardOf; })[0];
    fr = (board.groups || []).filter(function (g) { return g.id === 'uart'; })[0];
    ok('the inside of a frame moves to its own tab', D.detailOf && D.detailOf.block === 'uart' && fr.detail === D.id, D.id);
    ok('what was drawn inside moves along', (D.nodes || []).some(function (n) { return n.id === 'u_fifo_rx'; }) && !(board.nodes || []).some(function (n) { return n.id === 'u_fifo_rx'; }));
    var fports = (board.nodes || []).filter(function (n) { return n.port && n.port.of === 'uart'; }), dports = (D.nodes || []).filter(function (n) { return n.port; });
    ok('the tab has the frame ports on its border', fports.length === dports.length && fports.every(function (f) { return dports.some(function (x) { return x.id === f.id; }); }));
    var p0 = dports[0];
    window.__adEditor.ops([{ op: 'updateNode', id: p0.id, set: { title: 'i_uart_rx', port: { name: 'i_uart_rx', dir: p0.port.dir } } }], 'rename port');
    await wait(900);
    raw = window.__adEditor.raw(); board = raw.diagrams.filter(function (d) { return d.boardOf; })[0];
    ok('renaming a port inside renames it on the frame', (board.nodes || []).some(function (n) { return n.id === p0.id && n.port.name === 'i_uart_rx'; }));
    document.querySelector('.ed-hier-btn').click();
    await wait(900);
    ok('the frame shows a link to its inside', !!svg().querySelector('.frame-detail[data-detail="' + D.id + '"]'));
    svg().querySelector('.frame-detail[data-detail="' + D.id + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wait(900);
    ok('the link opens the inside tab', window.__adEditor.tab() === raw.diagrams.indexOf(raw.diagrams.filter(function (d) { return d.id === D.id; })[0]), window.__adEditor.tab());
    document.querySelector('.ed-hier-btn').click();
    await wait(900);
    document.querySelector('.ed-hier-btn').click();
    await wait(900);
    var checks = document.querySelector('.ed-checks');
    ok('bus interfaces keep their protocol names (s_axi_cpu, m_apb)', checks && !/s_axi_cpu|m_apb/.test(checks.textContent), checks && checks.textContent.slice(0, 200));
    var ov = window.__adEditor.raw().diagrams[window.__adEditor.tab()], ic = ov.nodes.filter(function (n) { return n.ports && n.ports.in && n.ports.in.indexOf('s_axi_cpu') >= 0; })[0];
    var icPorts = JSON.parse(JSON.stringify(ic.ports));
    icPorts.in.push('DataReady');
    window.__adEditor.ops([{ op: 'updateNode', id: ic.id, set: { ports: icPorts } }], 'a name off the style');
    await wait(900);
    checks = document.querySelector('.ed-checks');
    var fixName = checks && Array.prototype.filter.call(checks.querySelectorAll('button'), function (b) { return /Rename|Đổi tên/.test(b.textContent); })[0];
    ok('port names off the naming style are flagged with a fix', checks && /DataReady/.test(checks.textContent) && !!fixName, checks && checks.textContent.slice(0, 200));
    if (fixName) fixName.click();
    await wait(900);
    ic = window.__adEditor.raw().diagrams[window.__adEditor.tab()].nodes.filter(function (n) { return n.id === ic.id; })[0];
    ok('the fix gives the RTL name and keeps the bus interfaces', ic.ports.in.indexOf('i_data_ready') >= 0 && ic.ports.in.indexOf('s_axi_cpu') >= 0, JSON.stringify(ic.ports.in));
    var text = await exportText('drawio');
    ok('the draw.io file keeps notes, ports and links', /adNote="1"/.test(text) && /adPortName=/.test(text) && /adPage="1"/.test(text) && /link="data:page\/id,/.test(text), text.length);
    R.push({ name: 'drawio export', pass: true, info: text });
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.join(' | '));
"""

ROUNDTRIP_JS = r"""
    for (var i = 0; i < 80 && !svg(); i++) await wait(100);
    await wait(300);
    var tabs = document.querySelectorAll('#tabs .tab');
    ok('every tab comes back', tabs.length >= 4, tabs.length);
    function openTab(re) { var t = Array.prototype.filter.call(tabs, function (b) { return re.test(b.textContent); })[0]; if (t) t.click(); return !!t; }
    ok('the board is found', openTab(/Detail|Chi tiết/));
    await wait(400);
    ok('the board still links to its overview', !!visible('.crumbs') && !/null|undefined/.test(visible('.crumbs').textContent), visible('.crumbs') && visible('.crumbs').textContent);
    ok('ports are ports again', svg().querySelectorAll('.node[data-shape^="port-"]').length > 10);
    ok('the frame still opens its inside', !!svg().querySelector('.frame-detail[data-detail]'));
    ok('notes are notes again', svg().querySelectorAll('.note-sticky').length >= 1, svg().querySelectorAll('.note-sticky').length);
    ok('no script errors while testing', !window.__testErrors.length, window.__testErrors.join(' | '));
"""


def wrap(body):
    return ("<script>\n(async function () {\n" + COMMON_JS + "\n  try {\n" + body +
            "\n  } catch (err) {\n    ok('test script ran without errors', false, err && err.stack ? err.stack.split('\\n').slice(0, 2).join(' | ') : err);\n  }\n"
            "  document.documentElement.setAttribute('data-test-results', encodeURIComponent(JSON.stringify(R)));\n})();\n</script>\n")


def symbols_spec():
    src = (SKILL / "assets" / "js" / "symbols.js").read_text(encoding="utf-8")
    body = src[src.index("var SYMBOLS = {"):src.index("var SYMBOL_ALIAS")]
    names = [n for n, cat in re.findall(r"^  '?([a-z][a-z0-9-]*)'?: \{ cat: '(\w+)'", body, re.M) if cat != "icons"]
    nodes = [{"id": f"s{i}", "title": n, "shape": n, "x": 40 + (i % 8) * 170, "y": 40 + (i // 8) * 150} for i, n in enumerate(names)]
    nodes.append({"id": "icon1", "title": "server icon", "shape": "icon", "icon": "server", "x": 40, "y": 40 + (len(names) // 8 + 1) * 150})
    return {"title": "Symbols", "lang": "en", "diagrams": [{"id": "all", "title": "All symbols", "layout": "manual", "nodes": nodes}]}


def run_page(browser, source, js, name, tmp, query="?theme=light", budget=40000):
    page = Path(tmp) / (name + ".html")
    build = subprocess.run([sys.executable, str(SKILL / "scripts" / "build.py"), str(source), "-o", str(page), "--force"], capture_output=True, text=True)
    if build.returncode != 0:
        return None, f"build failed\n{build.stdout}{build.stderr}"
    html = page.read_text(encoding="utf-8")
    cut = html.rfind("</body>")
    page.write_text(html[:cut] + wrap(js) + html[cut:], encoding="utf-8")
    with tempfile.TemporaryDirectory() as profile:
        dom = run_browser(browser, profile, 1440, 1000, 1, page.as_uri() + query, timeout=300, budget=budget)
    match = re.search(r'data-test-results="([^"]*)"', dom or "")
    if not match:
        return None, "no test results (page did not finish)"
    return json.loads(unquote(match.group(1))), None


def report(label, results, error):
    if error:
        print(f"FAIL {label}: {error}")
        return 1
    bad = [r for r in results if not r["pass"]]
    print(f"{'ok  ' if not bad else 'FAIL'} {label}: {len(results) - len(bad)}/{len(results)} checks passed")
    for r in results:
        print(("  ✓ " if r["pass"] else "  ✗ ") + r["name"] + (f"  ({r['info']})" if r["info"] else ""))
    return len(bad)


def main(argv):
    browser = find_browser()
    if not browser:
        print("No Chromium-based browser found; cannot run the interaction test.")
        return 2
    wanted = set(argv[1:]) or {"examples", "editor", "checks", "multi", "edge", "drawio", "manip", "assist", "grow", "symbols", "board", "notesai"}
    failures = 0
    with tempfile.TemporaryDirectory() as tmp:
        if "examples" in wanted:
            for spec in sorted((SKILL / "examples").glob("*.json")):
                results, error = run_page(browser, spec, EXAMPLE_JS, spec.stem, tmp)
                failures += report(spec.name, results, error)
        if "editor" in wanted:
            results, error = run_page(browser, SKILL / "examples" / "uart-ip.json", EDITOR_JS, "editor", tmp)
            failures += report("editor (uart-ip.json)", results, error)
        if "checks" in wanted:
            results, error = run_page(browser, SKILL / "examples" / "clock-reset-tree.json", CHECKS_JS, "checks", tmp, query="?theme=light#cdc")
            failures += report("input and wiring checks (clock-reset-tree.json)", results, error)
        if "multi" in wanted:
            results, error = run_page(browser, ROOT / "tests" / "fixtures" / "multi.json", MULTI_JS, "multi", tmp, query="?theme=light")
            failures += report("several blocks, copy and paste, text on the drawing, group frames (multi.json)", results, error)
        if "edge" in wanted:
            results, error = run_page(browser, ROOT / "tests" / "fixtures" / "edge.json", EDGE_JS, "edge", tmp)
            failures += report("edge cases: markup in text, keys while typing, undo (edge.json)", results, error)
        if "drawio" in wanted:
            png64 = base64.b64encode((ROOT / "tests" / "fixtures" / "drawio" / "sample.drawio.png").read_bytes()).decode("ascii")
            results, error = run_page(browser, ROOT / "tests" / "fixtures" / "drawio" / "sample.drawio", DRAWIO_JS.replace("@@SAMPLE_PNG@@", png64), "drawio", tmp)
            failures += report("draw.io import and export (sample.drawio)", results, error)
        if "manip" in wanted:
            results, error = run_page(browser, ROOT / "tests" / "fixtures" / "manip.json", MANIP_JS, "manip", tmp, query="?theme=light&lang=vi")
            failures += report("editing on the drawing (manip.json)", results, error)
        if "assist" in wanted:
            pats = json.loads((SKILL / "assets" / "patterns.json").read_text(encoding="utf-8"))["patterns"]
            js = ASSIST_JS.replace("__PATIDS__", json.dumps([p["id"] for p in pats])).replace("__PATCOUNT__", str(len(pats)))
            js = js.replace("__PATTOP__", str(len([p for p in pats if p.get("top")])))
            # every pattern goes into its own tab, so this page needs more (virtual) time than the others
            results, error = run_page(browser, SKILL / "examples" / "clock-reset-tree.json", js, "assist", tmp, query="?theme=light#cdc", budget=120000)
            failures += report("quick fixes, patterns and suggestions (clock-reset-tree.json)", results, error)
        if "board" in wanted:
            results, error = run_page(browser, SKILL / "examples" / "soc-block-diagram.json", BOARD_JS, "board", tmp, budget=90000)
            failures += report("detail board built from an overview (soc-block-diagram.json)", results, error)
        if "notesai" in wanted:
            results, error = run_page(browser, SKILL / "examples" / "soc-block-diagram.json", NOTES_AI_JS, "notesai", tmp, budget=150000)
            exported = [r for r in (results or []) if r["name"] == "drawio export"]
            failures += report("notes, inside tabs, port names and AI with a stand-in bridge (soc-block-diagram.json)",
                               [r for r in results if r["name"] != "drawio export"] if results else results, error)
            if exported and exported[0]["info"]:
                again = Path(tmp) / "roundtrip.drawio"
                again.write_text(exported[0]["info"], encoding="utf-8")
                results, error = run_page(browser, again, ROUNDTRIP_JS, "roundtrip", tmp, budget=60000)
            else:
                results, error = None, "no draw.io file from the notes and AI group"
            failures += report("draw.io round trip of notes, ports and links", results, error)
        if "grow" in wanted:
            results, error = run_page(browser, ROOT / "tests" / "fixtures" / "grow.json", GROW_JS, "grow", tmp)
            failures += report("a diagram that grows and shrinks, following only suggestions (grow.json)", results, error)
        if "symbols" in wanted:
            spec_path = Path(tmp) / "symbols.json"
            spec_path.write_text(json.dumps(symbols_spec()), encoding="utf-8")
            results, error = run_page(browser, spec_path, SYMBOLS_JS, "symbols", tmp)
            failures += report("symbol library", results, error)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
