/* ---------- boot ---------- */
var PRISTINE = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;
var installed = false;

function showNotice(title, lines) {
  var box = document.getElementById('notice');
  box.hidden = false;
  box.appendChild(H('strong', { text: title }));
  if (lines && lines.length) {
    var ul = H('ul');
    lines.forEach(function (l) { ul.appendChild(H('li', { text: l })); });
    box.appendChild(ul);
  }
}

function readSpec() {
  var raw = document.getElementById('diagram-spec').textContent;
  if (raw.indexOf('@@SPEC') >= 0) { showNotice(I18N.en.rawTemplate + ' / ' + I18N.vi.rawTemplate); return null; }
  try { return JSON.parse(raw); }
  catch (err) { showNotice(I18N.en.badSpec + ' ' + err.message); return null; }
}

function resetPage() {
  states.forEach(stopPlay);
  states = [];
  active = null;
  problems = [];
  problemList = [];
  document.getElementById('sections').textContent = '';
  var tabs = document.getElementById('tabs');
  tabs.textContent = '';
  tabs.hidden = true;
  var notice = document.getElementById('notice');
  notice.textContent = '';
  notice.hidden = true;
}

function installGlobal() {
  if (installed) return;
  installed = true;
  document.getElementById('theme-btn').addEventListener('click', function () { setTheme(themeName === 'dark' ? 'light' : 'dark', true); });
  document.addEventListener('keydown', function (ev) {
    if (!active || /^(INPUT|TEXTAREA|SELECT)$/.test((ev.target && ev.target.tagName) || '')) return;
    if (ev.key === '/' && active.searchEl) { ev.preventDefault(); active.searchEl.focus(); return; }
    if (!ev.ctrlKey && !ev.metaKey && !ev.altKey && active.svg) {
      if (ev.key === '+' || ev.key === '=') { ev.preventDefault(); zoomBy(active, 1.25); return; }
      if (ev.key === '-' || ev.key === '_') { ev.preventDefault(); zoomBy(active, 0.8); return; }
      if (ev.key === '0') { ev.preventDefault(); active.scale = null; active.userFit = true; applyZoom(active); return; }
    }
    var hasSteps = active.d.kind === 'graph' && active.d.steps.length;
    if (ev.key === 'ArrowRight' && hasSteps) { ev.preventDefault(); stopPlay(active); setStep(active, active.stepIndex + 1); }
    else if (ev.key === 'ArrowLeft' && hasSteps) { ev.preventDefault(); stopPlay(active); setStep(active, active.stepIndex < 0 ? 0 : active.stepIndex - 1); }
    else if (ev.key === 'Escape' && active.d.kind === 'graph') {
      stopPlay(active); resetSteps(active); active.focus = null; applyFocus(active); hideDetails(active);
      if (active.searchEl && active.searchEl.value) { active.searchEl.value = ''; runSearch(active, ''); }
    }
  });
  var resizeTimer = null;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { states.forEach(alignGrid); }, 120); });
  var printTheme = null;
  window.addEventListener('beforeprint', function () { if (themeName === 'dark') { printTheme = 'dark'; setTheme('light', false); } });
  window.addEventListener('afterprint', function () { if (printTheme) { setTheme(printTheme, false); printTheme = null; } });
}

function renderSpec(raw, keepTheme) {
  resetPage();
  spec = normalizeSpec(raw);
  lang = spec.lang;
  document.documentElement.lang = lang;
  document.getElementById('doc-title').textContent = spec.title || (spec.diagrams[0] && spec.diagrams[0].title) || '';
  if (spec.title) document.title = spec.title;
  var sub = document.getElementById('doc-subtitle');
  sub.hidden = !spec.subtitle;
  sub.textContent = spec.subtitle;
  document.getElementById('foot').textContent = t('made');
  var hasDagre = typeof window.dagre !== 'undefined', dagreMissing = false;
  spec.diagrams.forEach(function (d, i) {
    var st = { d: d, uid: 'ad' + i, scale: null, focus: null, stepIndex: -1, timer: null, adj: {} };
    if (d.kind === 'graph') {
      if (!hasDagre) { dagreMissing = true; return; }
      if (!d.nodes.length) { problem('[' + (d.title || d.id) + '] ', 'noNodes'); return; }
      d.nodes.forEach(function (n) { st.adj[n.id] = []; });
      d.edges.forEach(function (e, k) {
        if (st.adj[e.from]) st.adj[e.from].push(k);
        if (e.to !== e.from && st.adj[e.to]) st.adj[e.to].push(k);
      });
      st.L = layoutDiagram(d);
      /* room to grow while editing a hand-placed drawing (see outW in renderer.js) */
      if (d.layout === 'manual' && document.body.classList.contains('editing')) { st.L.roomX = 240; st.L.roomY = 140; st.L.width += 240; st.L.height += 140; }
    } else if (d.kind === 'wave') {
      if (!d.rows.length) return;
      st.L = layoutWave(d);
    } else if (d.kind === 'register') {
      if (!d.registers.length) return;
      st.L = layoutRegisters(d);
    } else if (d.kind === 'memory') {
      if (!d.items.length) return;
      st.L = layoutMemory(d);
    } else if (d.kind === 'chip') {
      if (!Object.keys(d.blockById).length) return;
      st.L = layoutChip(d);
    } else {
      if (!d.pins.length) return;
      st.L = layoutPinout(d);
    }
    states.push(st);
  });
  if (dagreMissing) showNotice(t('noDagre'));
  states.forEach(buildSection);
  buildTabs();
  setTheme(keepTheme ? themeName : initialTheme(), false);
  var hash = decodeURIComponent(location.hash.replace('#', ''));
  var start = 0;
  states.forEach(function (st, i) { if (st.d.id === hash) start = i; });
  if (states.length) showSection(start, false);
  /* while editing, the Checks list above the form shows these */
  if (problems.length && !document.body.classList.contains('editing')) showNotice(t('skipped'), problems);
}

var currentRaw = null;

/* A spec can carry a whole draw.io file ({"drawio": "<mxfile…>"}); it is converted before drawing. */
function prepareSpec(raw) {
  if (raw && typeof raw.drawio === 'string') {
    return loadStencilPack().then(function () { return parseDrawio(raw.drawio, raw.name || raw.title || ''); }).then(function (spec) {
      if (raw.title) spec.title = raw.title;
      spec.lang = raw.lang || spec.lang;
      return spec;
    });
  }
  return specUsesStencils(raw) ? loadStencilsFor(raw).then(function () { return raw; }) : Promise.resolve(raw);
}
function drawioNotice(spec) {
  if (spec && spec.drawioSkipped) showNotice((lang === 'vi' ? spec.drawioSkipped + ' trang nén trong file chưa mở được. ' : spec.drawioSkipped + ' compressed page(s) of this file could not be opened. ') + t('oldBrowser'));
  if (!spec || !spec.drawioNote) return;
  showNotice(lang === 'vi'
    ? spec.drawioNote + ' hình trong file dùng thư viện hình chưa có trong tool nên được vẽ thành khung chữ nhật. Khi lưu lại thành file draw.io, các hình này vẫn giữ nguyên dạng gốc.'
    : spec.drawioNote + ' shapes in this file come from a draw.io library this tool does not draw, so they are shown as plain boxes. Saving back to draw.io keeps their original look.');
}

function runCliExport(format, id) {
  var st = states.filter(function (x) { return x.d.id === id; })[0] || states[0];
  var done = function (payload) { document.documentElement.setAttribute('data-export', payload); };
  var fail = function (err) { done('error:' + encodeURIComponent(err && err.message ? err.message : String(err))); };
  try {
    if (format === 'spec') done(encodeURIComponent(JSON.stringify(currentRaw, null, 1)));
    else if (format === 'library') drawioLibrary().then(function (xml) { done(encodeURIComponent(xml)); }, fail);
    else if (!st) done('error:' + encodeURIComponent('nothing to export'));
    else if (format === 'drawio') prepareDrawioExport().then(function () { done(encodeURIComponent(drawioDocument())); }, fail);
    else if (format === 'mermaid') done(encodeURIComponent(id ? mermaidText(st) : mermaidDocument()));
    else if (format === 'svg') done(encodeURIComponent(exportXml(st)));
    else if (format === 'csv') done(encodeURIComponent(csvText(st)));
    else if (format === 'png') pngDataUrl(st, function (url) { done(url || 'error:png'); });
    else done('error:' + encodeURIComponent('unknown format ' + format));
  } catch (err) { done('error:' + encodeURIComponent(err.message)); }
}

function boot() {
  if (booted) return;
  booted = true;
  var raw = readSpec();
  if (!raw) return;
  var params = new URLSearchParams(location.search);
  if (params.get('shot') === '1') document.documentElement.classList.add('shot');
  installGlobal();
  installEditor();
  prepareSpec(raw).then(function (ready) {
    var wantsEditor = ready.editor === true || ready.playground === true || params.get('edit') === '1';
    var start = (ready.editor || ready.playground) && ready.example && typeof ready.example === 'object' ? ready.example : ready;
    if ((ready.editor || ready.playground) && !ready.example) start = { title: '', lang: ready.lang || 'vi', diagrams: [] };
    currentRaw = start;
    if (!start.lang && ready.lang) start.lang = ready.lang;
    renderSpec(start, false);
    editorButton();
    drawioNotice(ready);
    /* draw.io shapes and compressed draw.io pages are unpacked with DecompressionStream */
    if (typeof DecompressionStream === 'undefined' && !ready.drawioSkipped && (typeof raw.drawio === 'string' || specUsesStencils(raw))) showNotice(t('oldBrowser'));
    if (wantsEditor) openEditor(start);
    var pageBox = document.querySelector('.page').getBoundingClientRect();
    document.documentElement.setAttribute('data-shot-height', String(Math.ceil(pageBox.bottom + window.scrollY)));
    if (params.get('export')) runCliExport(params.get('export'), params.get('diagram'));
    if (params.get('assist') === '1') runCliAssist();
  }).catch(function (err) {
    showNotice(t('badSpec') + ' ' + (err && err.message ? err.message : err));
    if (params.get('export') || params.get('assist')) document.documentElement.setAttribute('data-export', 'error:' + encodeURIComponent(String(err && err.message || err)));
  });
}

window.__adBoot = function () {
  if (window.dagre || window.__adDagre) boot();
};
if (window.dagre || window.__adDagre) window.__adBoot();
setTimeout(function () { if (!booted) boot(); }, 15000);
