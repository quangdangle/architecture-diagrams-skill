/* draw.io stencil shapes: the electrical, flowchart, basic and network libraries of draw.io (Apache
   License 2.0, see assets/stencils) are packed into the page. Shapes such as
   "mxgraph.electrical.logic_gates.and" are drawn here from draw.io's own stencil XML, so imported files
   look the same and exported files keep draw.io's native shape names. */
var STENCIL_XML = {};
var STENCIL_DEFS = {};
var stencilPackPromise = null;

function loadStencilPack() {
  if (stencilPackPromise) return stencilPackPromise;
  var packed = typeof STENCIL_PACK === 'string' ? STENCIL_PACK : '';
  if (!packed || typeof DecompressionStream === 'undefined') { stencilPackPromise = Promise.resolve(false); return stencilPackPromise; }
  stencilPackPromise = inflateRawB64(packed).then(function (text) {
    var table = JSON.parse(text);
    Object.keys(table).forEach(function (k) { STENCIL_XML[k] = table[k]; });
    return true;
  }).catch(function (err) {
    if (window.console) console.warn('[architecture-diagrams] stencil library could not be read', err);
    return false;
  });
  return stencilPackPromise;
}
function specUsesStencils(raw) {
  try { return /mxgraph\.|shape=stencil\(/.test(JSON.stringify(raw)); } catch (e) { return false; }
}
/* Shapes a draw.io file draws itself (style "shape=stencil(...)", made with Edit Shape in draw.io): unpacked once and
   kept under a short key, "stencil.<hash>", so they draw like the library shapes. The packed text stays in the style. */
var STENCIL_INLINE = {};
function stencilInlineKey(b64) {
  var h = 0x811c9dc5;
  for (var i = 0; i < b64.length; i++) { h ^= b64.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return 'stencil.' + ('0000000' + h.toString(16)).slice(-8);
}
function loadInlineStencils(text) {
  var found = {}, re = /shape=stencil\(([A-Za-z0-9+\/=]+)\)/g, m;
  while ((m = re.exec(String(text || '')))) if (!STENCIL_XML[stencilInlineKey(m[1])]) found[m[1]] = true;
  var list = Object.keys(found);
  if (!list.length || typeof DecompressionStream === 'undefined') return Promise.resolve();
  return Promise.all(list.map(function (b64) {
    return inflateRawB64(b64).then(function (xml) {
      xml = String(xml).trim();
      if (!/^<shape[\s>]/.test(xml)) return;
      var key = stencilInlineKey(b64);
      STENCIL_XML[key] = xml;
      STENCIL_INLINE[key] = b64;
      delete STENCIL_DEFS[key];
    }).catch(function () { /* a damaged shape is drawn as a box */ });
  }));
}
/* The library shapes and the file's own shapes a spec needs. */
function loadStencilsFor(raw) {
  var text = '';
  try { text = typeof raw === 'string' ? raw : JSON.stringify(raw); } catch (e) { text = ''; }
  return loadStencilPack().then(function () { return loadInlineStencils(text); });
}
function stencilKnown(name) { return !!STENCIL_XML[String(name).toLowerCase()]; }
function stencilNames() { return Object.keys(STENCIL_XML).sort(); }

/* draw.io names stencil pins "in1", "out", "Q", or by compass point ("N", "SE"); only the first kinds tell a direction. */
function stencilPinDir(name) {
  var s = String(name || '');
  if (/^(in|input|vin)\d*$/i.test(s)) return 'in';
  if (/^(out|output|vout)\d*$/i.test(s) || /^(q|qneg|qn|nq)$/i.test(s)) return 'out';
  return 'io';
}
function stencilParse(name) {
  var key = String(name).toLowerCase();
  if (STENCIL_DEFS[key] !== undefined) return STENCIL_DEFS[key];
  var xml = STENCIL_XML[key];
  if (!xml) return (STENCIL_DEFS[key] = null);
  var el = new DOMParser().parseFromString(xml, 'application/xml').documentElement;
  if (!el || el.tagName !== 'shape') return (STENCIL_DEFS[key] = null);
  var child = function (tag) { return Array.prototype.filter.call(el.children, function (c) { return c.tagName === tag; })[0] || null; };
  var pins = [];
  var cons = child('connections');
  if (cons) Array.prototype.forEach.call(cons.children, function (c) {
    if (c.tagName !== 'constraint') return;
    var name = c.getAttribute('name') || '';
    pins.push([+c.getAttribute('x') || 0, +c.getAttribute('y') || 0, name || null, stencilPinDir(name)]);
  });
  var def = { w: +el.getAttribute('w') || 100, h: +el.getAttribute('h') || 100, aspect: el.getAttribute('aspect') || 'variable',
              sw: el.getAttribute('strokewidth') || '1', bg: child('background'), fg: child('foreground'), pins: pins, title: el.getAttribute('name') || key };
  return (STENCIL_DEFS[key] = def);
}
/* A symbol-like description of a stencil so the layout code can treat it like the built-in symbols. */
function stencilSymbol(name) {
  var def = stencilParse(name);
  if (!def) return null;
  var scale = Math.min(1, 80 / Math.max(def.w, def.h));
  return { cat: 'drawio', size: [Math.round(def.w * scale), Math.round(def.h * scale)], label: 'bottom', stencil: true, pins: def.pins, title: def.title, aspect: 'fixed' };
}
function shapeDef(name) { return SYMBOLS[name] || stencilSymbol(name); }

/* Draws a stencil in the box (0, 0, w, h). c = { fill, stroke, text, strokeWidth, opts, font }. */
function stencilElements(name, w, h, c) {
  var def = stencilParse(name);
  if (!def) return [];
  var o = c.opts || {}, dir = dirAngle(o.direction), pw = w, ph = h;
  if (dir === 90 || dir === 270) { pw = h; ph = w; }
  var sx = pw / def.w, sy = ph / def.h, x0 = 0, y0 = 0;
  if (def.aspect === 'fixed') { var s = Math.min(sx, sy); x0 = (pw - def.w * s) / 2; y0 = (ph - def.h * s) / 2; sx = sy = s; }
  var minScale = Math.min(sx, sy);
  var st = { stroke: c.stroke, fill: c.fill, font: c.text, sw: def.sw === 'inherit' ? c.strokeWidth : (+def.sw || 1) * minScale,
             dashed: false, pattern: null, cap: 'butt', join: 'miter', alpha: 1, fontSize: 12, fontStyle: 0, family: c.font };
  var stack = [], path = '', els = [];
  var X = function (v) { return symNum(x0 + (+v || 0) * sx); }, Y = function (v) { return symNum(y0 + (+v || 0) * sy); };
  var col = function (v) { return v === 'stroke' ? c.stroke : v === 'fill' ? c.fill : v === 'font' ? c.text : (v === 'none' ? 'none' : (normColor(v) || v)); };
  function paint(fill, stroke) {
    if (!path) return;
    var dash = st.dashed ? (st.pattern || [3, 3].map(function (q) { return q * st.sw; }).join(' ')) : null;
    els.push(S('path', { d: path, fill: fill ? st.fill : 'none', stroke: stroke ? st.stroke : 'none', 'stroke-width': symNum(st.sw), 'stroke-dasharray': dash,
      'stroke-linecap': st.cap === 'flat' ? 'butt' : st.cap, 'stroke-linejoin': st.join, opacity: st.alpha < 1 ? st.alpha : null,
      'fill-opacity': c.fillOpacity, 'stroke-opacity': c.strokeOpacity }));
    path = '';
  }
  function roundedPath(node) {
    var segs = [], ok = true;
    Array.prototype.forEach.call(node.children, function (ch) {
      if (ch.tagName === 'move' || ch.tagName === 'line') {
        if (ch.tagName === 'move' || !segs.length) segs.push([]);
        segs[segs.length - 1].push([+X(ch.getAttribute('x')), +Y(ch.getAttribute('y'))]);
      } else ok = false;
    });
    if (!ok || !segs.length) return false;
    var arc = +node.getAttribute('arcSize') || 10;
    segs.forEach(function (pts) {
      var close = pts.length > 2 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
      if (close) pts = pts.slice(0, -1);
      path += pthD(np().rounded(pts, arc / 2, close).c);
    });
    return true;
  }
  function run(node) {
    if (!node) return;
    Array.prototype.forEach.call(node.children, function (n) {
      var t = n.tagName, a = function (k) { return n.getAttribute(k); };
      if (t === 'save') stack.push(JSON.parse(JSON.stringify(st)));
      else if (t === 'restore') { if (stack.length) st = stack.pop(); }
      else if (t === 'path') {
        path = '';
        if (a('rounded') === '1' && roundedPath(n)) return;
        Array.prototype.forEach.call(n.children, function (p) {
          var g = function (k) { return p.getAttribute(k); };
          if (p.tagName === 'move') path += 'M' + X(g('x')) + ' ' + Y(g('y'));
          else if (p.tagName === 'line') path += 'L' + X(g('x')) + ' ' + Y(g('y'));
          else if (p.tagName === 'quad') path += 'Q' + X(g('x1')) + ' ' + Y(g('y1')) + ' ' + X(g('x2')) + ' ' + Y(g('y2'));
          else if (p.tagName === 'curve') path += 'C' + X(g('x1')) + ' ' + Y(g('y1')) + ' ' + X(g('x2')) + ' ' + Y(g('y2')) + ' ' + X(g('x3')) + ' ' + Y(g('y3'));
          else if (p.tagName === 'arc') path += 'A' + symNum((+g('rx') || 0) * sx) + ' ' + symNum((+g('ry') || 0) * sy) + ' ' + (+g('x-axis-rotation') || 0) + ' ' +
            (+g('large-arc-flag') ? 1 : 0) + ' ' + (+g('sweep-flag') ? 1 : 0) + ' ' + X(g('x')) + ' ' + Y(g('y'));
          else if (p.tagName === 'close') path += 'Z';
        });
      }
      else if (t === 'rect') path = pthD(np().rect(+X(a('x')), +Y(a('y')), (+a('w') || 0) * sx, (+a('h') || 0) * sy).c);
      else if (t === 'roundrect') {
        var rw = (+a('w') || 0) * sx, rh = (+a('h') || 0) * sy, f = (+a('arcsize') || 15) / 100;
        path = pthD(np().rrect(+X(a('x')), +Y(a('y')), rw, rh, Math.min(rw * f, rh * f)).c);
      }
      else if (t === 'ellipse') {
        var ew = (+a('w') || 0) * sx, eh = (+a('h') || 0) * sy;
        path = pthD(np().ellipse(+X(a('x')) + ew / 2, +Y(a('y')) + eh / 2, ew / 2, eh / 2).c);
      }
      else if (t === 'fillstroke') paint(true, true);
      else if (t === 'fill') paint(true, false);
      else if (t === 'stroke') paint(false, true);
      else if (t === 'strokewidth') st.sw = (+a('width') || 1) * (a('fixed') === '1' ? 1 : minScale);
      else if (t === 'dashed') st.dashed = a('dashed') === '1';
      else if (t === 'dashpattern') st.pattern = String(a('pattern') || '').split(' ').filter(Boolean).map(function (q) { return symNum(+q * minScale * st.sw); }).join(' ');
      else if (t === 'strokecolor') st.stroke = col(a('color'));
      else if (t === 'fillcolor') st.fill = col(a('color'));
      else if (t === 'fontcolor') st.font = col(a('color'));
      else if (t === 'linecap') st.cap = a('cap') || 'butt';
      else if (t === 'linejoin') st.join = a('join') || 'miter';
      else if (t === 'alpha' || t === 'fillalpha' || t === 'strokealpha') st.alpha = +a('alpha');
      else if (t === 'fontsize') st.fontSize = (+a('size') || 12) * minScale;
      else if (t === 'fontstyle') st.fontStyle = +a('style') || 0;
      else if (t === 'fontfamily') st.family = a('family');
      else if (t === 'text') {
        var align = a('align') || 'left', valign = a('valign') || 'top', fsz = st.fontSize;
        var ty = +Y(a('y')) + (valign === 'middle' ? fsz * 0.35 : valign === 'bottom' ? 0 : fsz * 0.8);
        els.push(S('text', { x: X(a('x')), y: symNum(ty), 'font-size': symNum(fsz), 'text-anchor': align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start',
          'font-weight': st.fontStyle & 1 ? 700 : 400, 'font-style': st.fontStyle & 2 ? 'italic' : null, fill: st.font, 'font-family': st.family || null,
          transform: a('vertical') === '1' ? 'rotate(-90 ' + X(a('x')) + ' ' + symNum(ty) + ')' : null, text: a('str') || '' }));
      }
      else if (t === 'include-shape') {
        var inner = stencilElements(a('name'), (+a('w') || 0) * sx, (+a('h') || 0) * sy, c);
        els.push(S('g', { transform: 'translate(' + X(a('x')) + ' ' + Y(a('y')) + ')' }, inner));
      }
    });
  }
  run(def.bg);
  run(def.fg);
  var tr = [], cx = w / 2, cy = h / 2;
  if (dir) tr.push('rotate(' + dir + ' ' + symNum(cx) + ' ' + symNum(cy) + ')');
  if (o.flipH || o.flipV) tr.push('translate(' + symNum(cx) + ' ' + symNum(cy) + ') scale(' + (o.flipH ? -1 : 1) + ' ' + (o.flipV ? -1 : 1) + ') translate(' + symNum(-cx) + ' ' + symNum(-cy) + ')');
  if (pw !== w) tr.push('translate(' + symNum((w - pw) / 2) + ' ' + symNum((h - ph) / 2) + ')');
  return tr.length ? [S('g', { transform: tr.join(' ') }, els)] : els;
}
