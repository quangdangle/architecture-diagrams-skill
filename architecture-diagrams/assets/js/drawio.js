/* draw.io bridge: opens .drawio / .xml / .svg files as editable diagrams with fixed positions, and writes
   every tab back to a .drawio file. Cells that came from draw.io keep their original style, value and
   ids; only what was changed here is rewritten, so a file can go back and forth without losing detail. */

/* ---------- style strings ---------- */
function dioParseStyle(s) {
  var o = { _names: [], _order: [] };
  String(s || '').split(';').forEach(function (part) {
    if (!part) return;
    var i = part.indexOf('=');
    if (i < 0) { if (o._names.indexOf(part) < 0) o._names.push(part); return; }
    var k = part.slice(0, i), v = part.slice(i + 1);
    if (o._order.indexOf(k) < 0) o._order.push(k);
    o[k] = v;
  });
  return o;
}
function dioStyleString(o) {
  return o._names.map(function (n) { return n + ';'; }).join('') +
    o._order.filter(function (k) { return o[k] !== undefined && o[k] !== null; }).map(function (k) { return k + '=' + o[k] + ';'; }).join('');
}
/* The original style text when nothing in it changed, so untouched cells are written back character for character. */
function dioKeepStyle(raw, sty) {
  var out = dioStyleString(sty);
  return out === dioStyleString(dioParseStyle(raw)) ? raw : out;
}
function dioSet(o, k, v) {
  if (v === null || v === undefined) { o[k] = undefined; return; }
  if (o._order.indexOf(k) < 0) o._order.push(k);
  o[k] = String(v);
}
function dioNum(v, dflt) { var n = parseFloat(v); return isFinite(n) ? n : dflt; }
function dioColor(v) {
  var s = str(v);
  if (!s || s === 'default' || s === 'inherit' || s === 'swimlane' || s === 'indicated') return null;
  if (s === 'none') return 'none';
  var ld = /^light-dark\(\s*([^,]+),/.exec(s);
  if (ld) s = ld[1].trim();
  var hex = normColor(s);
  if (hex) return hex;
  measureCtx.fillStyle = '#010203';
  measureCtx.fillStyle = s;
  var out = measureCtx.fillStyle;
  return /^#[0-9a-f]{6}$/i.test(out) && out !== '#010203' ? out.toLowerCase() : null;
}

/* ---------- labels: draw.io values are HTML when the style says html=1 ---------- */
var FONT_SIZES = { 1: 10, 2: 13, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48 };
function dioLabel(value, isHtml) {
  var raw = String(value === undefined || value === null ? '' : value);
  if (!isHtml) return { text: raw.replace(/\r/g, '').trim() };
  var doc = new DOMParser().parseFromString('<div>' + raw + '</div>', 'text/html');
  var lines = [''], stats = {}, boldLen = 0, total = 0, image = null, runs = [[]];
  function add(key, len) { stats[key] = (stats[key] || 0) + len; }
  function walk(node, ctx) {
    if (node.nodeType === 3) {
      var t = node.nodeValue.replace(/[\s ]+/g, ' ');
      if (!t) return;
      if (lines[lines.length - 1] === '' ) t = t.replace(/^ /, '');
      lines[lines.length - 1] += t;
      runs[runs.length - 1].push({ t: t, b: !!ctx.bold });
      var n = t.trim().length;
      total += n;
      if (ctx.size) add('size:' + ctx.size, n);
      if (ctx.color) add('color:' + ctx.color, n);
      if (ctx.bold) boldLen += n;
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    if (tag === 'br') { lines.push(''); runs.push([]); return; }
    if (tag === 'script' || tag === 'style') return;
    if (tag === 'img') {
      if (!image) {
        var css0 = node.getAttribute('style') || '', pw = /width:\s*([\d.]+)px/i.exec(css0), ph = /height:\s*([\d.]+)px/i.exec(css0);
        image = { src: node.getAttribute('src') || '', w: +(node.getAttribute('width') || (pw && pw[1]) || 0) || null, h: +(node.getAttribute('height') || (ph && ph[1]) || 0) || null };
      }
      return;
    }
    var block = /^(div|p|li|h[1-6]|tr|ul|ol|table|blockquote|pre)$/.test(tag);
    if (block && lines[lines.length - 1].trim() !== '') { lines.push(''); runs.push([]); }
    var c = { size: ctx.size, color: ctx.color, bold: ctx.bold };
    var css = node.getAttribute('style') || '';
    var fs = /font-size:\s*([\d.]+)px/i.exec(css);
    if (fs) c.size = +fs[1];
    if (tag === 'font' && FONT_SIZES[node.getAttribute('size')]) c.size = FONT_SIZES[node.getAttribute('size')];
    var col = /(?:^|;)\s*color:\s*([^;]+)/i.exec(css);
    if (col) c.color = dioColor(col[1]);
    if (tag === 'font' && node.getAttribute('color')) c.color = dioColor(node.getAttribute('color'));
    if (tag === 'b' || tag === 'strong' || /font-weight:\s*(bold|[6-9]00)/i.test(css)) c.bold = true;
    if (/font-weight:\s*(normal|[1-4]00)/i.test(css)) c.bold = false;
    Array.prototype.forEach.call(node.childNodes, function (ch) { walk(ch, c); });
    if (block && lines[lines.length - 1].trim() !== '') { lines.push(''); runs.push([]); }
  }
  walk(doc.body, {});
  var allBold = total > 0 && boldLen === total, someBold = boldLen > 0 && !allBold;
  if (someBold) {
    lines = runs.map(function (rs) {
      var out = '';
      rs.forEach(function (r) {
        var core = r.t.trim();
        if (!core) { out += r.t; return; }
        var lead = r.t.match(/^\s*/)[0], trail = r.t.match(/\s*$/)[0];
        out += lead + (r.b ? '**' + core + '**' : core) + trail;
      });
      return out.replace(/\*\*\s*\*\*/g, ' ');
    });
  }
  var text = lines.map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/^\n+|\n+$/g, '');
  function dominant(prefix) {
    var best = null, bestN = 0;
    Object.keys(stats).forEach(function (k) { if (k.indexOf(prefix) === 0 && stats[k] > bestN) { best = k.slice(prefix.length); bestN = stats[k]; } });
    return bestN * 2 >= total ? best : null;
  }
  var size = dominant('size:');
  return { text: text, size: size ? +size : null, color: dominant('color:'), bold: allBold, image: image };
}

/* ---------- mapping a draw.io style to this tool's shapes and styles ---------- */
var DIO_SHAPES = {
  rect: 'box', rectangle: 'box', label: 'box', ellipse: 'ellipse', doubleEllipse: 'ellipse', rhombus: 'diamond',
  triangle: 'triangle', trapezoid: 'trapezoid', hexagon: 'hexagon', parallelogram: 'parallelogram',
  cylinder: 'cylinder', cylinder3: 'cylinder', datastore: 'cylinder', document: 'document', note: 'note', cloud: 'cloud',
  process: 'subroutine', curlyBracket: 'brace', line: 'line', umlActor: 'actor', actor: 'actor', or: 'dio-or', xor: 'dio-xor',
  image: 'image', text: 'text'
};
var DIO_NAMED = ['ellipse', 'rhombus', 'triangle', 'swimlane', 'line', 'image', 'text', 'label', 'group', 'cloud', 'hexagon', 'doubleEllipse', 'cylinder', 'actor'];
function dioShapeName(sty) {
  if (sty.shape) return sty.shape;
  for (var i = 0; i < sty._names.length; i++) if (DIO_NAMED.indexOf(sty._names[i]) >= 0) return sty._names[i];
  return 'rect';
}
function dioLabelPos(sty) {
  if (sty.noLabel === '1') return 'none';
  var lp = sty.labelPosition || 'center', vp = sty.verticalLabelPosition || 'middle';
  if (lp === 'left') return 'left';
  if (lp === 'right') return 'right';
  if (vp === 'top') return 'top';
  if (vp === 'bottom') return 'bottom';
  return 'center';
}
/* Returns the node fields this tool derives from a draw.io vertex style (also used to see what changed). */
function dioVertexModel(sty, w, h, label) {
  var name = dioShapeName(sty), shape = DIO_SHAPES[name], unsupported = false;
  if (sty.adShape && SYMBOLS[sty.adShape] && !SYMBOLS[sty.adShape].native) shape = sty.adShape;
  if (!shape && /^mxgraph\./.test(name) && stencilKnown(name)) shape = name;
  if (!shape) { shape = 'box'; unsupported = true; }
  /* a label that is only a picture (<img> in an HTML label) is drawn as an image */
  var labelImage = label && label.image && !label.text && safeImageSrc(label.image.src) ? label.image : null;
  if (labelImage) shape = 'image';
  var o = {};
  var fill = dioColor(sty.fillColor), stroke = dioColor(sty.strokeColor), text = dioColor(sty.fontColor);
  if (name === 'text' && !sty.fillColor) fill = 'none';
  if (name === 'text' && !sty.strokeColor) stroke = 'none';
  if (fill) o.fill = fill;
  if (stroke) o.stroke = stroke;
  if (label && label.color && !text) text = label.color;
  if (text) o.text = text;
  if (sty.strokeWidth !== undefined) o.strokeWidth = dioNum(sty.strokeWidth, 1);
  if (sty.dashed === '1') o.dashed = sty.dashPattern ? sty.dashPattern.replace(/[, ]+/g, ' ') : true;
  var fs = sty.fontSize !== undefined ? dioNum(sty.fontSize, 12) : null;
  if (label && label.size) fs = label.size;
  if (fs !== null) o.fontSize = fs;
  var fstyle = dioNum(sty.fontStyle, 0) | 0;
  if ((fstyle & 1) || (label && label.bold)) o.bold = true;
  if (fstyle & 2) o.italic = true;
  if (fstyle & 4) o.underline = true;
  if (sty.align) o.align = sty.align;
  if (sty.verticalAlign) o.valign = sty.verticalAlign;
  if (dioNum(sty.rotation, 0)) o.rotation = dioNum(sty.rotation, 0);
  if (sty.direction && sty.direction !== 'east') o.direction = sty.direction;
  if (sty.flipH === '1') o.flipH = true;
  if (sty.flipV === '1') o.flipV = true;
  if (sty.rounded === '1') {
    if (shape === 'box') {
      var arc = dioNum(sty.arcSize, sty.absoluteArcSize === '1' ? 20 : 15);
      o.rounded = sty.absoluteArcSize === '1' ? Math.min(w / 2, h / 2, arc / 2) : Math.min(w, h) * arc / 100;
    } else o.rounded = true;
  } else if (shape === 'box') o.rounded = false;
  o.wrap = sty.whiteSpace === 'wrap';
  if (sty.spacing !== undefined) o.spacing = dioNum(sty.spacing, 2);
  ['spacingTop', 'spacingLeft', 'spacingRight', 'spacingBottom'].forEach(function (k) { if (sty[k] !== undefined) o[k] = dioNum(sty[k], 0); });
  ['opacity', 'fillOpacity', 'strokeOpacity'].forEach(function (k) { if (sty[k] !== undefined && dioNum(sty[k], 100) < 100) o[k] = dioNum(sty[k], 100); });
  if (sty.fontFamily) o.font = sty.fontFamily;
  var lbg = dioColor(sty.labelBackgroundColor), lbd = dioColor(sty.labelBorderColor);
  if (lbg) o.labelBg = lbg;
  if (lbd) o.labelBorder = lbd;
  if (sty.horizontal === '0') o.horizontal = false;
  if (sty.size !== undefined) o.size = dioNum(sty.size, 0);
  if (sty.fixedSize === '1') o.fixedSize = true;
  if (sty.shadow === '1') o.shadow = true;
  var pos = dioLabelPos(sty);
  if (pos !== 'center') o.labelPos = pos;
  var src = labelImage ? labelImage.src : '';
  if (labelImage && labelImage.w && labelImage.h) o.imageBox = [labelImage.w, labelImage.h];
  if (shape === 'image' && sty.image && !labelImage) {
    src = sty.image;
    var m = /^data:(image\/[\w+.-]+),(?!.*;base64)/.exec(src);
    if (m && !/;base64,/.test(src)) src = 'data:' + m[1] + ';base64,' + src.slice(m[0].length);
  }
  return { shape: shape, style: o, labelPos: pos, src: safeImageSrc(src), unsupported: unsupported };
}
var DIO_ROUTES = { orthogonalEdgeStyle: 'orthogonal', elbowEdgeStyle: 'elbow', segmentEdgeStyle: 'segment', entityRelationEdgeStyle: 'orthogonal', sideToSideEdgeStyle: 'elbow', topToBottomEdgeStyle: 'elbow' };
function dioEdgeModel(sty) {
  var route = sty.noEdgeStyle === '1' ? null : DIO_ROUTES[sty.edgeStyle];
  if (!route) route = sty.curved === '1' ? 'curved' : 'straight';
  var elbow = sty.edgeStyle === 'topToBottomEdgeStyle' || sty.elbow === 'vertical' ? 'vertical' : 'horizontal';
  var o = {};
  var c = dioColor(sty.strokeColor);
  if (c) o.color = c;
  var tc = dioColor(sty.fontColor);
  if (tc) o.text = tc;
  var lbg = dioColor(sty.labelBackgroundColor);
  if (lbg) o.labelBg = lbg;
  if (sty.strokeWidth !== undefined) o.width = dioNum(sty.strokeWidth, 1);
  if (sty.fontSize !== undefined) o.fontSize = dioNum(sty.fontSize, 11);
  if (sty.dashed === '1') o.dashed = sty.dashPattern ? sty.dashPattern.replace(/[, ]+/g, ' ') : true;
  o.endArrow = ARROWS.indexOf(sty.endArrow) >= 0 ? sty.endArrow : (sty.endArrow === undefined ? 'classic' : 'classic');
  if (sty.endArrow === 'none') o.endArrow = 'none';
  o.startArrow = ARROWS.indexOf(sty.startArrow) >= 0 ? sty.startArrow : 'none';
  if (sty.endSize !== undefined) o.endSize = dioNum(sty.endSize, 6);
  if (sty.startSize !== undefined) o.startSize = dioNum(sty.startSize, 6);
  if (sty.endFill === '0') o.endFill = false;
  if (sty.startFill === '0') o.startFill = false;
  if (sty.rounded === '1') o.rounded = true;
  if (sty.opacity !== undefined && dioNum(sty.opacity, 100) < 100) o.opacity = dioNum(sty.opacity, 100);
  if ((dioNum(sty.fontStyle, 0) | 0) & 1) o.bold = true;
  var anchor = function (p) {
    if (sty[p + 'X'] === undefined || sty[p + 'Y'] === undefined) return null;
    return { x: dioNum(sty[p + 'X'], 0.5), y: dioNum(sty[p + 'Y'], 0.5), dx: dioNum(sty[p + 'Dx'], 0), dy: dioNum(sty[p + 'Dy'], 0), perimeter: sty[p + 'Perimeter'] !== '0' };
  };
  var end = o.endArrow !== 'none', start = o.startArrow !== 'none';
  return { route: route, elbow: elbow, style: o, fromAnchor: anchor('exit'), toAnchor: anchor('entry'), dir: end && start ? 'both' : end ? 'forward' : start ? 'back' : 'none' };
}

/* ---------- reading files ---------- */
function dioDecodeDiagram(el) {
  var model = null;
  Array.prototype.forEach.call(el.children, function (ch) { if (!model && ch.tagName === 'mxGraphModel') model = ch; });
  if (model) return Promise.resolve(model);
  var text = (el.textContent || '').trim();
  if (!text) return Promise.resolve(null);
  var parse = function (xml) { var doc = new DOMParser().parseFromString(xml, 'application/xml'); return doc.getElementsByTagName('parsererror').length ? null : doc.documentElement; };
  if (text.charAt(0) === '<') return Promise.resolve(parse(text));
  return inflateRawB64(text).then(parse);
}
function dioFileRoot(text) {
  var src = String(text).replace(/^﻿/, '').trim();
  var doc = new DOMParser().parseFromString(src, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) {
    doc = new DOMParser().parseFromString(src, 'text/html');
    var holder = doc.querySelector('[content*="mxfile"], [content*="mxGraphModel"]');
    if (!holder) throw new Error('not a draw.io file');
    return dioFileRoot(holder.getAttribute('content'));
  }
  var root = doc.documentElement;
  if (root.tagName === 'svg') {
    var content = root.getAttribute('content');
    if (!content) throw new Error('this SVG has no draw.io diagram inside');
    return dioFileRoot(content);
  }
  if (root.tagName !== 'mxfile' && root.tagName !== 'mxGraphModel') throw new Error('not a draw.io file');
  return root;
}
/* The diagram inside a PNG saved by draw.io with the diagram included (.drawio.png): a tEXt, zTXt or iTXt chunk named
   mxfile (mxGraphModel in old files), usually URL-encoded. Resolves to the file's text. */
function dioPngText(buf) {
  var b = new Uint8Array(buf), sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (var i = 0; i < 8; i++) if (b[i] !== sig[i]) return Promise.reject(new Error('not a PNG file'));
  var latin = function (a, s, e) { var out = ''; for (var k = s; k < e; k++) out += String.fromCharCode(a[k]); return out; };
  var inflate = function (bytes) {
    if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('this browser cannot unpack the diagram in this PNG'));
    return new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer().then(function (ab) { return new Uint8Array(ab); });
  };
  var finish = function (text) { text = String(text).trim(); return (/^%3C/i.test(text) ? decodeURIComponent(text) : text).trim(); };
  for (var pos = 8; pos + 8 <= b.length;) {
    var len = ((b[pos] << 24) >>> 0) + (b[pos + 1] << 16) + (b[pos + 2] << 8) + b[pos + 3];
    var type = latin(b, pos + 4, pos + 8), start = pos + 8, end = Math.min(b.length, start + len);
    pos = end + 4;
    if (type === 'IEND') break;
    if (type !== 'tEXt' && type !== 'zTXt' && type !== 'iTXt') continue;
    var z = start;
    while (z < end && b[z] !== 0) z++;
    var key = latin(b, start, z);
    if (key !== 'mxfile' && key !== 'mxGraphModel') continue;
    if (type === 'tEXt') return Promise.resolve(finish(latin(b, z + 1, end)));
    if (type === 'zTXt') return inflate(b.subarray(z + 2, end)).then(function (u) { return finish(latin(u, 0, u.length)); });
    var flag = b[z + 1], q = z + 3;
    while (q < end && b[q] !== 0) q++;
    q++;
    while (q < end && b[q] !== 0) q++;
    var body = b.subarray(q + 1, end);
    return (flag ? inflate(body) : Promise.resolve(body)).then(function (u) { return finish(new TextDecoder('utf-8').decode(u)); });
  }
  return Promise.reject(new Error('this PNG has no draw.io diagram inside (in draw.io, export as PNG with the diagram included)'));
}
/* Resolves to a diagram spec. Needs DecompressionStream only for compressed pages. */
function parseDrawio(text, fileName) {
  var root;
  try { root = dioFileRoot(text); } catch (err) { return Promise.reject(err); }
  var pages = root.tagName === 'mxGraphModel' ? [{ el: null, model: root }] :
    Array.prototype.filter.call(root.children, function (c) { return c.tagName === 'diagram'; }).map(function (el) { return { el: el }; });
  /* a compressed page that cannot be unpacked (old browser, damaged data) is left out instead of losing the whole file */
  var skipped = 0, keep = [];
  return Promise.all(pages.map(function (p, i) {
    if (p.model) return Promise.resolve(p.model);
    return Promise.resolve().then(function () { return dioDecodeDiagram(p.el); }).catch(function () {
      skipped++;
      keep.push({ at: i, xml: new XMLSerializer().serializeToString(p.el) });
      return null;
    });
  })).then(function (models) {
    if (!models.some(Boolean) && skipped) throw new Error(t('oldBrowser'));
    var base = str(fileName).replace(/\.(drawio|xml|svg|dio)$/i, '').replace(/\.drawio$/i, '');
    var diagrams = [], unsupported = 0;
    models.forEach(function (model, i) {
      if (!model) return;
      var name = pages[i].el ? str(pages[i].el.getAttribute('name')) : '';
      var dg = dioConvertPage(model, name || ('Page ' + (i + 1)), i, pages[i].el);
      unsupported += dg.unsupported;
      delete dg.unsupported;
      diagrams.push(dg);
    });
    var out = { title: base || (diagrams[0] && diagrams[0].title) || 'draw.io', source: 'drawio', diagrams: diagrams };
    if (unsupported) out.drawioNote = unsupported;
    if (skipped) { out.drawioSkipped = skipped; out.drawioKeep = keep; }
    return out;
  });
}

function dioConvertPage(model, name, index, pageEl) {
  var rootEl = null;
  Array.prototype.forEach.call(model.children, function (c) { if (c.tagName === 'root') rootEl = c; });
  var cells = [], byId = {};
  (rootEl ? Array.prototype.slice.call(rootEl.children) : []).forEach(function (el, z) {
    var cellEl = el, wrapper = null;
    if (el.tagName === 'UserObject' || el.tagName === 'object') {
      wrapper = el;
      cellEl = Array.prototype.filter.call(el.children, function (c) { return c.tagName === 'mxCell'; })[0];
      if (!cellEl) return;
    } else if (el.tagName !== 'mxCell') return;
    var id = (wrapper || cellEl).getAttribute('id');
    if (id === null || byId[id]) return;
    var geoEl = Array.prototype.filter.call(cellEl.children, function (c) { return c.tagName === 'mxGeometry'; })[0] || null;
    var geo = null;
    if (geoEl) {
      geo = { x: dioNum(geoEl.getAttribute('x'), 0), y: dioNum(geoEl.getAttribute('y'), 0), w: dioNum(geoEl.getAttribute('width'), 0), h: dioNum(geoEl.getAttribute('height'), 0),
              relative: geoEl.getAttribute('relative') === '1', points: [], sourcePoint: null, targetPoint: null, offset: null };
      Array.prototype.forEach.call(geoEl.children, function (c) {
        if (c.tagName === 'mxPoint') {
          var pt = { x: dioNum(c.getAttribute('x'), 0), y: dioNum(c.getAttribute('y'), 0) }, as = c.getAttribute('as');
          if (as === 'sourcePoint') geo.sourcePoint = pt; else if (as === 'targetPoint') geo.targetPoint = pt; else if (as === 'offset') geo.offset = pt;
        } else if (c.tagName === 'Array' && c.getAttribute('as') === 'points') {
          Array.prototype.forEach.call(c.children, function (q) { if (q.tagName === 'mxPoint') geo.points.push({ x: dioNum(q.getAttribute('x'), 0), y: dioNum(q.getAttribute('y'), 0) }); });
        }
      });
    }
    var attrs = null;
    if (wrapper) {
      attrs = { tag: wrapper.tagName };
      Array.prototype.forEach.call(wrapper.attributes, function (a) { if (a.name !== 'id') attrs[a.name] = a.value; });
    }
    var cell = {
      id: id, parent: cellEl.getAttribute('parent'), vertex: cellEl.getAttribute('vertex') === '1', edge: cellEl.getAttribute('edge') === '1',
      source: cellEl.getAttribute('source'), target: cellEl.getAttribute('target'), styleRaw: cellEl.getAttribute('style') || '',
      value: wrapper ? (wrapper.getAttribute('label') || '') : (cellEl.getAttribute('value') || ''), visible: cellEl.getAttribute('visible') !== '0',
      geo: geo, z: z, attrs: attrs, children: []
    };
    cell.sty = dioParseStyle(cell.styleRaw);
    cells.push(cell);
    byId[id] = cell;
  });
  cells.forEach(function (c) { if (c.parent && byId[c.parent]) byId[c.parent].children.push(c); });
  var rootCell = cells.filter(function (c) { return !c.parent; })[0];
  var layers = cells.filter(function (c) { return rootCell && c.parent === rootCell.id; });
  var layerIds = {};
  layers.forEach(function (l) { layerIds[l.id] = true; });
  var hiddenLayer = {};
  layers.forEach(function (l) { if (!l.visible) hiddenLayer[l.id] = true; });
  function layerOf(c) { var cur = c; while (cur && !layerIds[cur.id]) cur = byId[cur.parent]; return cur ? cur.id : null; }
  var absCache = {};
  function abs(c) {
    if (!c || layerIds[c.id] || !c.parent) return { x: 0, y: 0 };
    if (absCache[c.id]) return absCache[c.id];
    var p = byId[c.parent], base = p && p.vertex ? abs(p) : { x: 0, y: 0 }, g = c.geo || { x: 0, y: 0, w: 0, h: 0 };
    var r = g.relative && p && p.vertex && p.geo ?
      { x: base.x + g.x * p.geo.w + (g.offset ? g.offset.x : 0), y: base.y + g.y * p.geo.h + (g.offset ? g.offset.y : 0) } :
      { x: base.x + g.x, y: base.y + g.y };
    absCache[c.id] = r;
    return r;
  }
  var nodes = [], groups = [], edges = [], unsupported = 0, kind = {};
  cells.forEach(function (c) {
    if (!c.vertex || layerIds[c.id] || hiddenLayer[layerOf(c)]) return;
    if (c.parent && byId[c.parent] && byId[c.parent].edge) return;
    /* sticky notes and the page's links (written by this tool) are not blocks */
    if (c.attrs && (c.attrs.adNote || c.attrs.adPage)) return;
    var hasKids = c.children.some(function (k) { return k.vertex || k.edge; });
    var isGroup = c.sty._names.indexOf('group') >= 0 || (hasKids && c.sty.shape !== 'image');
    kind[c.id] = isGroup ? 'group' : 'node';
  });
  function parentGroup(c) { var p = byId[c.parent]; return p && kind[p.id] === 'group' ? p.id : null; }
  cells.forEach(function (c) {
    if (!kind[c.id]) return;
    var a = abs(c), g = c.geo || { w: 0, h: 0 };
    var label = dioLabel(c.value, c.sty.html === '1');
    var dio = { style: c.styleRaw, value: c.value, text: label.text, z: c.z, layer: layerOf(c) };
    if (c.attrs) dio.attrs = c.attrs;
    if (!c.visible) dio.hidden = true;
    if (kind[c.id] === 'group') {
      var hidden = c.sty._names.indexOf('group') >= 0;
      var gm = dioVertexModel(c.sty, g.w, g.h, label);
      if (hidden) gm.style = {};
      else {
        var lane = c.sty._names.indexOf('swimlane') >= 0 || c.sty.shape === 'swimlane';
        if (lane) gm.style.header = dioNum(c.sty.startSize, 23);
        if (lane && c.sty.fontStyle === undefined) gm.style.bold = true;
        if (!gm.style.valign) gm.style.valign = lane ? 'top' : 'middle';
      }
      var grp = { id: c.id, label: label.text, x: a.x, y: a.y, w: g.w, h: g.h, hidden: hidden, style: gm.style, drawio: dio };
      dioTakeLinks(grp, dio);
      var pg = parentGroup(c);
      if (pg) grp.parent = pg;
      groups.push(grp);
      return;
    }
    var vm = dioVertexModel(c.sty, g.w, g.h, label);
    if (vm.unsupported) unsupported++;
    var node = { id: c.id, title: label.text, shape: vm.shape, x: a.x, y: a.y, w: g.w || 1, h: g.h || 1, labelPos: vm.labelPos, style: vm.style, drawio: dio };
    dioTakeLinks(node, dio);
    if (vm.src) node.src = vm.src;
    if (c.attrs && c.attrs.tooltip) node.desc = c.attrs.tooltip;
    var pg2 = parentGroup(c);
    if (pg2) node.group = pg2;
    nodes.push(node);
  });
  cells.forEach(function (c) {
    if (!c.edge || hiddenLayer[layerOf(c)]) return;
    if (c.attrs && c.attrs.adNoteLink) return;
    var g = c.geo || { points: [] }, origin = abs(byId[c.parent] && byId[c.parent].vertex ? byId[c.parent] : null);
    var shift = function (p) { return p ? { x: p.x + origin.x, y: p.y + origin.y } : null; };
    var em = dioEdgeModel(c.sty);
    var from = kind[c.source] ? c.source : null, to = kind[c.target] ? c.target : null;
    var edge = { id: c.id, from: from, to: to, route: em.route, dir: em.dir, style: em.style, points: g.points.map(shift) };
    if (em.route === 'elbow' && em.elbow === 'vertical') edge.elbow = 'vertical';
    if (from && em.fromAnchor) edge.fromAnchor = em.fromAnchor;
    if (to && em.toAnchor) edge.toAnchor = em.toAnchor;
    if (!from) edge.fromPoint = shift(g.sourcePoint);
    if (!to) edge.toPoint = shift(g.targetPoint);
    if ((!from && !edge.fromPoint) || (!to && !edge.toPoint)) return;
    var label = dioLabel(c.value, c.sty.html === '1'), texts = label.text ? [label.text] : [];
    var dio = { style: c.styleRaw, value: c.value, text: label.text, z: c.z, layer: layerOf(c) };
    if (c.attrs) dio.attrs = c.attrs;
    if (g.w || g.h) dio.geoSize = [g.w, g.h];
    /* draw.io keeps end points on connected edges although it ignores them; keep them so the file comes back as it was */
    if (from && g.sourcePoint) dio.sp = [g.sourcePoint.x, g.sourcePoint.y];
    if (to && g.targetPoint) dio.tp = [g.targetPoint.x, g.targetPoint.y];
    if (g.relative !== false && (g.x || g.y)) { edge.labelAt = Math.max(-1, Math.min(1, g.x || 0)); edge.labelDist = g.y || 0; dio.ownLabelPos = true; }
    if (g.offset) { edge.labelOffset = g.offset; dio.ownOffset = true; }
    var kids = c.children.filter(function (k) { return k.vertex && k.value; });
    if (kids.length) {
      dio.labelCells = kids.map(function (k) { return new XMLSerializer().serializeToString(cellElementOf(rootEl, k.id)); });
      kids.forEach(function (k, i) {
        var kl = dioLabel(k.value, k.sty.html === '1');
        if (kl.text) texts.push(kl.text);
        if (i === 0 && k.geo) { edge.labelAt = Math.max(-1, Math.min(1, k.geo.x || 0)); edge.labelDist = k.geo.y || 0; if (k.geo.offset) edge.labelOffset = k.geo.offset; }
        if (i === 0 && !edge.style.fontSize && k.sty.fontSize) edge.style.fontSize = dioNum(k.sty.fontSize, 11);
      });
      dio.childText = texts.join('\n');
    }
    edge.label = texts.join('\n');
    edge.drawio = dio;
    edges.push(edge);
  });
  var meta = { id: pageEl ? pageEl.getAttribute('id') : null, name: name, model: {}, layers: layers.map(function (l) {
    var o = { id: l.id, value: l.value };
    if (!l.visible) o.visible = false;
    if (l.styleRaw) o.style = l.styleRaw;
    return o;
  }), root: rootCell ? rootCell.id : '0' };
  Array.prototype.forEach.call(model.attributes, function (a) { meta.model[a.name] = a.value; });
  var page = {
    id: (pageEl && pageEl.getAttribute('id')) || ('page-' + (index + 1)), title: name, type: 'graph', layout: 'manual', source: 'drawio',
    font: 'Helvetica, Arial, sans-serif', nodes: nodes, groups: groups, edges: edges, drawio: meta, unsupported: unsupported
  };
  dioTakeNotes(page, cells, byId, abs);
  return page;
}
/* ---------- this tool's own data kept in a draw.io file: ports, links between pages, sticky notes ---------- */
var DIO_OWN = ['adSource', 'adDetail', 'adPortName', 'adPortDir', 'adPortKind', 'adPortOf'];
function dioTakeLinks(o, dio) {
  var a = dio.attrs;
  if (!a) return;
  if (a.adSource) o.source = a.adSource;
  if (a.adDetail) o.detail = a.adDetail;
  if (a.adPortName) {
    o.port = { name: a.adPortName, dir: a.adPortDir || 'inout' };
    if (a.adPortOf) o.port.of = a.adPortOf;
    if (a.adPortKind) o.port.kind = a.adPortKind;
  }
  if (a.adDetail && /^data:page\/id,/.test(a.link || '')) delete a.link;
  DIO_OWN.forEach(function (k) { delete a[k]; });
  if (Object.keys(a).length === 1 && a.tag === 'UserObject') delete dio.attrs;
}
function dioTakeNotes(page, cells, byId, abs) {
  cells.forEach(function (c) {
    var a = c.attrs;
    if (!a) return;
    if (a.adPage) {
      if (a.adBoardOf) page.boardOf = a.adBoardOf;
      if (a.adDetailTab) page.detailOf = { tab: a.adDetailTab, block: a.adDetailBlock || '' };
      return;
    }
    if (!a.adNote) return;
    var p = abs(c), g = c.geo || { w: 210, h: 60 }, att = str(a.adAttach);
    var q = { id: str(c.id).replace(/^note-/, '') || 'n' + ((page.notes || []).length + 1), text: str(a.adText) || dioLabel(c.value, true).text, kind: NOTE_KINDS.indexOf(a.adKind) >= 0 ? a.adKind : 'note' };
    if (a.adDate) q.date = str(a.adDate);
    if (a.adBy) q.by = str(a.adBy);
    if (att.indexOf('>') > 0) q.attach = att.split('>');
    else if (att) q.attach = att;
    var t = typeof q.attach === 'string' ? byId[q.attach] : null;
    if (t && t.geo) { var tp = abs(t); q.dx = Math.round(p.x - (tp.x + (t.geo.w || 0))); q.dy = Math.round(p.y - tp.y); }
    else if (!q.attach) { q.x = Math.round(p.x); q.y = Math.round(p.y); }
    if (g.w) q.w = Math.round(g.w);
    (page.notes || (page.notes = [])).push(q);
  });
}
function cellElementOf(rootEl, id) {
  var found = null;
  Array.prototype.forEach.call(rootEl.children, function (el) { if (!found && el.getAttribute('id') === id) found = el; });
  return found;
}

/* ---------- writing .drawio files ---------- */
var STENCIL_B64 = {};
function stencilKey(n, m, stroke) { return [n.shape, fmt(m.w), fmt(m.h), JSON.stringify(n.opts), stroke].join('|'); }
function ownStencilNeeded(n) { var def = SYMBOLS[n.shape]; return def && !def.native; }
/* Our own symbols go to draw.io as compressed stencils; compression is asynchronous, so do it first. */
function prepareDrawioExport() {
  var jobs = [];
  states.forEach(function (st) {
    if (st.d.kind !== 'graph') return;
    st.d.nodes.forEach(function (n) {
      if (!ownStencilNeeded(n) || (n.drawio && dioVertexModel(dioParseStyle(n.drawio.style), 1, 1, null).shape === n.shape)) return;
      var m = st.L.nodeM[n.id], key = stencilKey(n, m, symbolColors(n, THEMES.light).stroke);
      if (STENCIL_B64[key] !== undefined) return;
      STENCIL_B64[key] = null;
      var opts = {};
      Object.keys(n.opts).forEach(function (k) { opts[k] = n.opts[k]; });
      opts.direction = null;
      var xml = stencilXml(n.shape, m.w, m.h, opts, symbolColors(n, THEMES.light).stroke);
      jobs.push(deflateRawB64(xml).then(function (b64) { STENCIL_B64[key] = b64; }));
    });
  });
  return Promise.all(jobs);
}
function dioNumOut(v) { return String(Math.round(v * 10000) / 10000); }
function dioGeometry(x, y, w, h) { return '<mxGeometry x="' + dioNumOut(x) + '" y="' + dioNumOut(y) + '" width="' + dioNumOut(w) + '" height="' + dioNumOut(h) + '" as="geometry"/>'; }
function dioValue(text) { return htmlEsc(text).replace(/\n/g, '<br>'); }
function dioCell(attrs, inner, wrapperAttrs) {
  if (wrapperAttrs) {
    wrapperAttrs = JSON.parse(JSON.stringify(wrapperAttrs));
    wrapperAttrs.label = attrs.value || '';
    wrapperAttrs.id = attrs.id;
    attrs = JSON.parse(JSON.stringify(attrs));
    delete attrs.value;
    delete attrs.id;
  }
  var head = '<mxCell' + Object.keys(attrs).filter(function (k) { return attrs[k] !== null && attrs[k] !== undefined; })
    .map(function (k) { return ' ' + k + '="' + xmlEsc(attrs[k]) + '"'; }).join('');
  var cell = head + (inner ? '>' + inner + '</mxCell>' : '/>');
  if (!wrapperAttrs) return cell;
  var tag = wrapperAttrs.tag === 'object' ? 'object' : 'UserObject';
  var keys = ['label'].concat(Object.keys(wrapperAttrs).filter(function (k) { return k !== 'tag' && k !== 'label' && k !== 'id'; })).concat(['id']);
  var w = '<' + tag + keys.filter(function (k) { return wrapperAttrs[k] !== undefined && wrapperAttrs[k] !== null; }).map(function (k) { return ' ' + k + '="' + xmlEsc(wrapperAttrs[k]) + '"'; }).join('') + '>';
  return w + cell + '</' + tag + '>';
}

/* Style keys this tool manages, written from the node's current fields. */
function dioApplyVertexStyle(sty, n, pos, keepExisting) {
  var st = n.style;
  var put = function (k, v) { if (keepExisting && (v === null || v === undefined)) return; dioSet(sty, k, v); };
  put('fillColor', st.fill || null);
  put('strokeColor', st.stroke || null);
  put('fontColor', st.text || null);
  put('strokeWidth', st.strokeWidth !== undefined ? st.strokeWidth : null);
  put('dashed', st.dashed ? 1 : null);
  put('dashPattern', typeof st.dashed === 'string' ? st.dashed : null);
  put('fontSize', st.fontSize || null);
  var fsty = (st.bold ? 1 : 0) | (st.italic ? 2 : 0) | (st.underline ? 4 : 0);
  put('fontStyle', fsty || null);
  put('align', st.align || null);
  put('verticalAlign', st.valign || null);
  put('rotation', st.rotation || null);
  put('direction', st.direction || null);
  put('flipH', st.flipH ? 1 : null);
  put('flipV', st.flipV ? 1 : null);
  if (typeof st.rounded === 'number') { put('rounded', st.rounded ? 1 : 0); put('absoluteArcSize', st.rounded ? 1 : null); put('arcSize', st.rounded ? fmt(st.rounded * 2) : null); }
  else put('rounded', st.rounded === true ? 1 : (st.rounded === false ? 0 : null));
  put('whiteSpace', st.wrap === false ? null : 'wrap');
  put('fontFamily', st.font || null);
  put('labelBackgroundColor', st.labelBg || null);
  put('labelBorderColor', st.labelBorder || null);
  put('horizontal', st.horizontal === false ? 0 : null);
  put('opacity', st.opacity !== undefined ? st.opacity : null);
  put('fillOpacity', st.fillOpacity !== undefined ? st.fillOpacity : null);
  put('strokeOpacity', st.strokeOpacity !== undefined ? st.strokeOpacity : null);
  put('shadow', st.shadow ? 1 : null);
  put('noLabel', pos === 'none' ? 1 : null);
  put('labelPosition', pos === 'left' || pos === 'right' ? pos : null);
  put('verticalLabelPosition', pos === 'top' || pos === 'bottom' ? pos : null);
  if (pos === 'bottom' && !st.valign) put('verticalAlign', 'top');
  if (pos === 'top' && !st.valign) put('verticalAlign', 'bottom');
  if (pos === 'left' && !st.align) put('align', 'right');
  if (pos === 'right' && !st.align) put('align', 'left');
}
var DIO_NATIVE_STYLE = {
  rect: '', ellipse: 'ellipse;', rhombus: 'rhombus;', triangle: 'triangle;', trapezoid: 'shape=trapezoid;perimeter=trapezoidPerimeter;',
  hexagon: 'shape=hexagon;perimeter=hexagonPerimeter2;', parallelogram: 'shape=parallelogram;perimeter=parallelogramPerimeter;',
  cylinder: 'shape=cylinder3;boundedLbl=1;backgroundOutline=1;', document: 'shape=document;boundedLbl=1;', note: 'shape=note;backgroundOutline=1;',
  cloud: 'ellipse;shape=cloud;', terminator: 'rounded=1;arcSize=50;', process: 'shape=process;', brace: 'shape=curlyBracket;rounded=1;',
  line: 'line;', text: 'text;', image: 'shape=image;imageAspect=0;', actor: 'shape=umlActor;outlineConnect=0;', 'dio-or': 'shape=or;', 'dio-xor': 'shape=xor;'
};
function dioShapeStyle(n, m) {
  var def = SYMBOLS[n.shape];
  if (!def) return /^mxgraph\./.test(n.shape) ? 'shape=' + n.shape + ';' : '';
  if (def.native) {
    var base = DIO_NATIVE_STYLE[def.native] || '';
    if (n.shape === 'circle') base += 'aspect=fixed;';
    if (n.shape === 'image' && n.src) base += 'image=' + n.src.replace(/;base64,/, ',') + ';';
    return base;
  }
  var b64 = STENCIL_B64[stencilKey(n, m, symbolColors(n, THEMES.light).stroke)];
  /* adShape names the symbol, so opening the file here again gives the symbol back with its pins */
  if (b64) return 'shape=stencil(' + b64 + ');adShape=' + n.shape + ';';
  /* no CompressionStream: fall back to a picture of the symbol */
  var svg = S('svg', { xmlns: SVG_NS, width: fmt(m.w), height: fmt(m.h), viewBox: '0 0 ' + fmt(m.w) + ' ' + fmt(m.h) }, symbolElements(n.shape, m.w, m.h, symbolColors(n, THEMES.light)));
  return 'shape=image;imageAspect=0;image=data:image/svg+xml,' + b64utf8(new XMLSerializer().serializeToString(svg)) + ';';
}
function dioVertexStyle(n, m) {
  var pos = m.pos || n.labelPos || 'center';
  if (n.drawio && typeof n.drawio.style === 'string') {
    var sty = dioParseStyle(n.drawio.style);
    var was = dioVertexModel(sty, m.w, m.h, dioLabel(n.drawio.value, sty.html === '1'));
    was.style = normNodeStyle(was.style);
    if (was.shape !== n.shape) {
      ['shape', 'perimeter', 'size', 'fixedSize', 'image'].forEach(function (k) { sty[k] = undefined; });
      sty._names = sty._names.filter(function (x) { return DIO_NAMED.indexOf(x) < 0; });
      var fresh = dioParseStyle(dioShapeStyle(n, m));
      sty._names = fresh._names.concat(sty._names);
      fresh._order.forEach(function (k) { dioSet(sty, k, fresh[k]); });
    }
    if (JSON.stringify(was.style) !== JSON.stringify(n.style) || was.labelPos !== pos) {
      var changed = {};
      Object.keys(was.style).concat(Object.keys(n.style)).forEach(function (k) { if (JSON.stringify(was.style[k]) !== JSON.stringify(n.style[k])) changed[k] = true; });
      var probe = dioParseStyle('');
      dioApplyVertexStyle(probe, n, pos);
      var keysFor = { fill: ['fillColor'], stroke: ['strokeColor'], text: ['fontColor'], strokeWidth: ['strokeWidth'], dashed: ['dashed', 'dashPattern'], fontSize: ['fontSize'],
        bold: ['fontStyle'], italic: ['fontStyle'], underline: ['fontStyle'], align: ['align'], valign: ['verticalAlign'], rotation: ['rotation'], direction: ['direction'],
        flipH: ['flipH'], flipV: ['flipV'], rounded: ['rounded', 'absoluteArcSize', 'arcSize'], wrap: ['whiteSpace'], font: ['fontFamily'], labelBg: ['labelBackgroundColor'],
        labelBorder: ['labelBorderColor'], horizontal: ['horizontal'], opacity: ['opacity'], fillOpacity: ['fillOpacity'], strokeOpacity: ['strokeOpacity'], shadow: ['shadow'] };
      Object.keys(changed).forEach(function (k) { (keysFor[k] || []).forEach(function (sk) { dioSet(sty, sk, probe[sk]); }); });
      if (was.labelPos !== pos) ['noLabel', 'labelPosition', 'verticalLabelPosition', 'align', 'verticalAlign'].forEach(function (sk) { dioSet(sty, sk, probe[sk]); });
    }
    return dioKeepStyle(n.drawio.style, sty);
  }
  var s = dioParseStyle(dioShapeStyle(n, m) + 'html=1;');
  var st = n.style, c = symbolColors(n, THEMES.light);
  dioApplyVertexStyle(s, n, pos, true);
  if (!st.fill && n.shape !== 'text' && n.shape !== 'line') dioSet(s, 'fillColor', c.fill === 'none' ? 'none' : c.fill);
  if (!st.stroke) dioSet(s, 'strokeColor', c.stroke);
  if (!st.text && n.colorSet) dioSet(s, 'fontColor', c.text);
  if (st.strokeWidth === undefined && !n.drawio) dioSet(s, 'strokeWidth', 1.5);
  if (n.shape === 'box' && st.rounded === undefined) { dioSet(s, 'rounded', 1); dioSet(s, 'absoluteArcSize', 1); dioSet(s, 'arcSize', 12); }
  if (!st.fontSize) dioSet(s, 'fontSize', m.fs ? fmt(m.fs) : 13);
  if (m.weight >= 600 && !st.bold) dioSet(s, 'fontStyle', 1);
  if (n.external) { dioSet(s, 'dashed', 1); dioSet(s, 'dashPattern', '5 4'); }
  return dioStyleString(s);
}
function dioVertexValue(n) {
  if (n.drawio && str(n.drawio.text) === n.title) return n.drawio.value;
  var text = n.title;
  if (!n.drawio && n.desc && SYMBOLS[n.shape] && SYMBOLS[n.shape].boxy && (n.labelPos || SYMBOLS[n.shape].label) === 'center') {
    return '<b>' + dioValue(text) + '</b><br><span style="font-size:11px">' + dioValue(n.desc) + '</span>';
  }
  return dioValue(text);
}
function dioEdgeStyle(e, d) {
  var es = e.style, pos = null;
  if (e.drawio && typeof e.drawio.style === 'string') {
    var sty = dioParseStyle(e.drawio.style), was = dioEdgeModel(sty);
    was.style = normEdgeStyle(was.style);
    was.fromAnchor = normAnchor(was.fromAnchor);
    was.toAnchor = normAnchor(was.toAnchor);
    var route = e.route || d.route || 'straight';
    if (was.route !== route || (route === 'elbow' && was.elbow !== e.elbow)) {
      dioSet(sty, 'edgeStyle', { orthogonal: 'orthogonalEdgeStyle', elbow: 'elbowEdgeStyle', segment: 'segmentEdgeStyle' }[route] || null);
      dioSet(sty, 'elbow', route === 'elbow' && e.elbow === 'vertical' ? 'vertical' : null);
      dioSet(sty, 'curved', route === 'curved' || route === 'spline' ? 1 : null);
    }
    var cmp = function (a, b) { return JSON.stringify(a) !== JSON.stringify(b); };
    if (cmp(was.style.color, es.color)) dioSet(sty, 'strokeColor', es.color || null);
    if (cmp(was.style.width, es.width)) dioSet(sty, 'strokeWidth', es.width !== undefined ? es.width : null);
    if (cmp(was.style.dashed, es.dashed)) { dioSet(sty, 'dashed', es.dashed ? 1 : null); dioSet(sty, 'dashPattern', typeof es.dashed === 'string' ? es.dashed : null); }
    if (cmp(was.style.endArrow, es.endArrow)) dioSet(sty, 'endArrow', es.endArrow || null);
    if (cmp(was.style.startArrow, es.startArrow)) dioSet(sty, 'startArrow', es.startArrow || null);
    if (cmp(was.style.text, es.text)) dioSet(sty, 'fontColor', es.text || null);
    if (cmp(was.style.fontSize, es.fontSize)) dioSet(sty, 'fontSize', es.fontSize || null);
    ['from', 'to'].forEach(function (end) {
      var key = end === 'from' ? 'exit' : 'entry', now = e[end + 'Anchor'], before = end === 'from' ? was.fromAnchor : was.toAnchor;
      /* an end that is not attached to a shape keeps whatever the file had; draw.io ignores it there */
      if (!e[end] || !cmp(now, before)) return;
      dioSet(sty, key + 'X', now ? now.x : null); dioSet(sty, key + 'Y', now ? now.y : null);
      dioSet(sty, key + 'Dx', now ? now.dx : null); dioSet(sty, key + 'Dy', now ? now.dy : null);
      dioSet(sty, key + 'Perimeter', now && !now.perimeter ? 0 : null);
    });
    return dioKeepStyle(e.drawio.style, sty);
  }
  var T = THEMES.light, kind = EDGE_STYLE[e.kind], pill = T.pills[e.kind];
  var route2 = d.layout === 'manual' ? (e.route || d.route || 'straight') : 'spline';
  var arrows = { forward: 'endArrow=block;endFill=1;startArrow=none;', back: 'endArrow=none;startArrow=block;startFill=1;', both: 'endArrow=block;endFill=1;startArrow=block;startFill=1;', none: 'endArrow=none;startArrow=none;' }[e.dir];
  if (es.endArrow || es.startArrow) arrows = 'endArrow=' + (es.endArrow || 'none') + ';startArrow=' + (es.startArrow || 'none') + ';' + (es.endFill === false ? 'endFill=0;' : '') + (es.startFill === false ? 'startFill=0;' : '');
  var s = 'html=1;' + ({ orthogonal: 'edgeStyle=orthogonalEdgeStyle;', elbow: 'edgeStyle=elbowEdgeStyle;' + (e.elbow === 'vertical' ? 'elbow=vertical;' : ''), segment: 'edgeStyle=segmentEdgeStyle;', curved: 'curved=1;', spline: 'curved=1;' }[route2] || '') +
    'rounded=' + (route2 === 'orthogonal' || es.rounded ? 1 : 0) + ';strokeColor=' + (es.color || T.edges[e.kind]) + ';strokeWidth=' + (es.width !== undefined ? es.width : kind.width) + ';' +
    (es.dashed || kind.dash ? 'dashed=1;dashPattern=' + (typeof es.dashed === 'string' ? es.dashed : (kind.dash || '4 3')) + ';' : '') + arrows +
    'fontSize=' + (es.fontSize || 11) + ';fontColor=' + (es.text || pill[1]) + ';labelBackgroundColor=' + (es.labelBg || pill[0]) + ';';
  if (!Object.keys(es).length) s += 'labelBorderColor=' + pill[2] + ';';
  ['from', 'to'].forEach(function (end) {
    var a = e[end + 'Anchor'], key = end === 'from' ? 'exit' : 'entry';
    if (a) s += key + 'X=' + a.x + ';' + key + 'Y=' + a.y + ';' + key + 'Dx=' + a.dx + ';' + key + 'Dy=' + a.dy + ';' + (a.perimeter ? '' : key + 'Perimeter=0;');
  });
  return s;
}

function drawioGraphPage(st) {
  var d = st.d, L = st.L, T = THEMES.light, manual = d.layout === 'manual';
  var ox = manual ? 0 : L.ox, oy = manual ? 0 : L.oy, meta = d.drawio || null;
  var items = [], cellId = {};
  var rootId = meta && meta.root ? meta.root : '0';
  var layers = meta && meta.layers && meta.layers.length ? meta.layers : [{ id: '1' }];
  var layerSet = {};
  layers.forEach(function (l) { layerSet[l.id] = true; });
  var defaultLayer = layers[0].id;
  d.groups.forEach(function (g) { cellId['g:' + g.id] = g.drawio ? g.id : 'g-' + g.id; });
  d.nodes.forEach(function (n) { cellId['n:' + n.id] = n.drawio ? n.id : 'n-' + n.id; });
  var groupPos = {};
  d.groups.forEach(function (g) { var b = L.groups[g.id]; if (b) groupPos[g.id] = { x: b.x + ox, y: b.y + oy }; });
  function parentOf(groupId, dio) {
    if (groupId && cellId['g:' + groupId] && groupPos[groupId]) return { id: cellId['g:' + groupId], x: groupPos[groupId].x, y: groupPos[groupId].y };
    return { id: dio && dio.layer && layerSet[dio.layer] ? dio.layer : defaultLayer, x: 0, y: 0 };
  }
  var endCell = function (id) { return !id ? null : cellId['n:' + id] || cellId['g:' + id] || null; };
  d.groups.slice().sort(function (a, b) { return groupDepth(d, a) - groupDepth(d, b); }).forEach(function (g, i) {
    var b = L.groups[g.id];
    if (!b) return;
    var par = parentOf(g.parent, g.drawio), style, value;
    if (g.drawio) {
      var sty = dioParseStyle(g.drawio.style);
      style = g.drawio.style;
      value = str(g.drawio.text) === g.label ? g.drawio.value : dioValue(g.label);
      if (g.hidden && sty._names.indexOf('group') < 0) style = 'group;' + style;
    } else if (g.hidden) {
      style = 'group;'; value = '';
    } else {
      var c = PALETTE[g.color];
      style = 'rounded=1;arcSize=4;dashed=1;dashPattern=7 5;fillColor=' + mix(c, '#ffffff', 0.93) + ';strokeColor=' + mix(c, '#ffffff', 0.35) +
        ';fontColor=' + mix(c, '#000000', 0.2) + ';fontStyle=1;fontSize=11;align=left;verticalAlign=top;spacingLeft=10;spacingTop=2;container=1;collapsible=0;html=1;whiteSpace=wrap;';
      value = htmlEsc(chipLabel(g));
    }
    items.push({ z: g.drawio && isFinite(g.drawio.z) ? g.drawio.z : -1e6 + i, xml: dioCell({ id: cellId['g:' + g.id], value: value, style: style, vertex: 1, connectable: g.hidden ? 0 : null, parent: par.id },
      dioGeometry(b.x + ox - par.x, b.y + oy - par.y, b.w, b.h), dioOwnAttrs(g.drawio && g.drawio.attrs, { adSource: dioCellOf(d.boardOf, g.source, false), adDetail: g.detail, link: g.detail ? 'data:page/id,' + dioPageOf(g.detail) : null })) });
  });
  d.nodes.forEach(function (n, i) {
    var p = L.nodes[n.id], m = L.nodeM[n.id];
    var x = p.x - m.w / 2 + ox, y = p.y - m.h / 2 + oy, par = parentOf(n.group, n.drawio);
    var id = cellId['n:' + n.id], style, value, extra = '';
    if (!CORE_SHAPES[n.shape]) {
      style = dioVertexStyle(n, m);
      value = dioVertexValue(n);
    } else {
      var c = PALETTE[n.color], s = m.s, title = (n.icon && !ICONS[n.icon] ? n.icon + ' ' : '') + n.title;
      if (m.decision) {
        style = 'rhombus;whiteSpace=wrap;html=1;fillColor=' + c + ';strokeColor=' + c + ';fontColor=#ffffff;fontStyle=1;fontSize=' + s.title + ';';
        value = htmlEsc(title);
      } else if (m.state) {
        style = 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=' + c + ';fontColor=#ffffff;fontSize=' + s.title + ';' +
          (n.final ? 'strokeWidth=3;strokeColor=' + mix(c, '#000000', 0.45) + ';' : 'strokeColor=' + c + ';');
        value = '<b>' + htmlEsc(title) + '</b>' + (n.desc ? '<br><span style="font-size:11px">' + htmlEsc(n.desc) + '</span>' : '');
      } else {
        style = 'swimlane;rounded=1;arcSize=6;startSize=' + fmt(m.headH) + ';fontStyle=1;fontSize=' + s.title + ';fontColor=#ffffff;fillColor=' + c +
          ';swimlaneFillColor=#ffffff;strokeColor=' + (n.external ? c : T.cardBorder) + ';' + (n.external ? 'dashed=1;' : '') + 'align=left;spacingLeft=' + s.padX + ';html=1;whiteSpace=wrap;collapsible=0;';
        value = htmlEsc(title);
        if (n.desc || n.ports) {
          var body = n.desc ? htmlEsc(n.desc) : '';
          if (n.ports) {
            var list = function (label, arr) { return arr.length ? '<b>' + label + '</b> ' + htmlEsc(arr.join(', ')) : ''; };
            var ports = [list('in:', n.ports.in), list('out:', n.ports.out), list('inout:', n.ports.inout)].filter(Boolean).join('<br>');
            body += (body ? '<br>' : '') + '<span style="font-family:monospace;font-size:10px">' + ports + '</span>';
          }
          extra = dioCell({ id: id + '-body', value: body, style: 'text;html=1;whiteSpace=wrap;align=left;verticalAlign=top;spacingLeft=' + s.padX + ';spacingRight=' + s.padX +
            ';spacingTop=2;fontSize=' + s.desc + ';fontColor=' + T.cardText + ';', vertex: 1, connectable: 0, parent: id }, dioGeometry(0, m.headH, m.w, m.h - m.headH));
        }
      }
    }
    var own = { adDetail: n.detail, link: n.detail ? 'data:page/id,' + dioPageOf(n.detail) : null };
    if (n.port) { own.adPortName = n.port.name; own.adPortDir = n.port.dir; own.adPortKind = n.port.kind; own.adPortOf = n.port.of ? cellId['g:' + n.port.of] || n.port.of : null; }
    items.push({ z: n.drawio && isFinite(n.drawio.z) ? n.drawio.z : 1e6 + i, xml: dioCell({ id: id, value: value, style: style, vertex: 1, parent: par.id },
      dioGeometry(x - par.x, y - par.y, m.w, m.h), dioOwnAttrs(n.drawio && n.drawio.attrs, own)) + extra });
  });
  d.edges.forEach(function (e, i) {
    var geo = L.edges[i], id = e.drawio && e.id ? e.id : 'e-' + i;
    var src = endCell(e.from), tgt = endCell(e.to);
    var pts = manual ? e.points : geo.points.slice(1, -1);
    var inner = '<mxGeometry relative="1" as="geometry">';
    var N = dioNumOut;
    if (!src) { var sp = e.fromPoint || geo.points[0]; if (sp) inner += '<mxPoint x="' + N(sp.x + ox) + '" y="' + N(sp.y + oy) + '" as="sourcePoint"/>'; }
    else if (e.drawio && e.drawio.sp) inner += '<mxPoint x="' + N(e.drawio.sp[0]) + '" y="' + N(e.drawio.sp[1]) + '" as="sourcePoint"/>';
    if (!tgt) { var tp = e.toPoint || geo.points[geo.points.length - 1]; if (tp) inner += '<mxPoint x="' + N(tp.x + ox) + '" y="' + N(tp.y + oy) + '" as="targetPoint"/>'; }
    else if (e.drawio && e.drawio.tp) inner += '<mxPoint x="' + N(e.drawio.tp[0]) + '" y="' + N(e.drawio.tp[1]) + '" as="targetPoint"/>';
    if (pts.length) inner += '<Array as="points">' + pts.map(function (q) { return '<mxPoint x="' + N(q.x + ox) + '" y="' + N(q.y + oy) + '"/>'; }).join('') + '</Array>';
    /* a label kept in its own child cell carries its offset there; the edge writes one only if it had one */
    var kidsKeep = e.drawio && e.drawio.labelCells && str(e.drawio.childText) === e.label;
    if (e.labelOffset && (!kidsKeep || e.drawio.ownOffset)) inner += '<mxPoint x="' + N(e.labelOffset.x) + '" y="' + N(e.labelOffset.y) + '" as="offset"/>';
    inner += '</mxGeometry>';
    var keepKidsPos = e.drawio && e.drawio.labelCells && str(e.drawio.childText) === e.label && !e.drawio.ownLabelPos;
    if ((e.labelAt || e.labelDist) && !keepKidsPos) inner = inner.replace('<mxGeometry relative="1"', '<mxGeometry x="' + dioNumOut(e.labelAt || 0) + '" y="' + dioNumOut(e.labelDist || 0) + '" relative="1"');
    if (e.drawio && e.drawio.geoSize) inner = inner.replace('<mxGeometry ', '<mxGeometry width="' + dioNumOut(e.drawio.geoSize[0]) + '" height="' + dioNumOut(e.drawio.geoSize[1]) + '" ');
    var keepKids = e.drawio && e.drawio.labelCells && str(e.drawio.childText) === e.label;
    var value = keepKids ? e.drawio.value : (e.drawio && str(e.drawio.text) === e.label ? e.drawio.value : dioValue(e.label));
    var layer = e.drawio && e.drawio.layer && layerSet[e.drawio.layer] ? e.drawio.layer : defaultLayer;
    var xml = dioCell({ id: id, value: value, style: dioEdgeStyle(e, d), edge: 1, parent: layer, source: src, target: tgt }, inner, e.drawio && e.drawio.attrs);
    if (keepKids) xml += e.drawio.labelCells.join('');
    items.push({ z: e.drawio && isFinite(e.drawio.z) ? e.drawio.z : 2e6 + i, xml: xml });
  });
  dioNoteItems(d, L, ox, oy, endCell, defaultLayer, items);
  if (d.boardOf || d.detailOf) {
    items.push({ z: -2e6, xml: dioCell({ id: 'ad-page', value: '', style: 'text;html=1;', vertex: 1, parent: defaultLayer, visible: 0 }, dioGeometry(0, 0, 10, 10),
      { tag: 'UserObject', adPage: '1', adBoardOf: d.boardOf || null, adDetailTab: d.detailOf ? d.detailOf.tab : null,
        adDetailBlock: d.detailOf ? dioCellOf(d.detailOf.tab, d.detailOf.block, true) : null }) });
  }
  items.sort(function (a, b) { return a.z - b.z; });
  var model = meta && meta.model ? meta.model : {};
  var modelAttrs = { dx: 0, dy: 0, grid: 1, gridSize: 10, guides: 1, tooltips: 1, connect: 1, arrows: 1, fold: 1, page: 1, pageScale: 1,
    pageWidth: Math.ceil(outW(L)), pageHeight: Math.ceil(outH(L)), math: 0, shadow: 0 };
  Object.keys(model).forEach(function (k) { modelAttrs[k] = model[k]; });
  var head = '<mxGraphModel' + Object.keys(modelAttrs).map(function (k) { return ' ' + k + '="' + xmlEsc(modelAttrs[k]) + '"'; }).join('') + '><root>';
  var layerXml = '<mxCell id="' + xmlEsc(rootId) + '"/>' + layers.map(function (l) {
    return dioCell({ id: l.id, value: l.value || null, style: l.style || null, visible: l.visible === false ? 0 : null, parent: rootId });
  }).join('');
  var pageId = meta && meta.id ? meta.id : d.id;
  return '<diagram id="' + xmlEsc(pageId) + '" name="' + xmlEsc(d.title || (meta && meta.name) || d.id) + '">' + head + layerXml + items.map(function (it) { return it.xml; }).join('') + '</root></mxGraphModel></diagram>';
}
function dioOwnAttrs(base, own) {
  var keys = Object.keys(own).filter(function (k) { return own[k] !== undefined && own[k] !== null && own[k] !== ''; });
  if (!keys.length) return base || null;
  var a = base ? JSON.parse(JSON.stringify(base)) : { tag: 'UserObject' };
  keys.forEach(function (k) { a[k] = String(own[k]); });
  return a;
}
/* The draw.io page id of a tab, and the cell id a block or frame of a tab gets in the file (see cellId above). */
function dioPageOf(tabId) {
  var hit = (spec && spec.diagrams ? spec.diagrams : []).filter(function (x) { return x.id === tabId; })[0];
  return hit && hit.drawio && hit.drawio.id ? hit.drawio.id : tabId;
}
function dioCellOf(tabId, id, groupsFirst) {
  if (!id) return null;
  var hit = (spec && spec.diagrams ? spec.diagrams : []).filter(function (x) { return x.id === tabId; })[0];
  if (!hit || hit.kind !== 'graph') return id;
  var g = hit.groupById[id], n = hit.nodeById[id];
  if (groupsFirst && g) return g.drawio ? g.id : 'g-' + g.id;
  if (n) return n.drawio ? n.id : 'n-' + n.id;
  if (g) return g.drawio ? g.id : 'g-' + g.id;
  return id;
}
/* Sticky notes as draw.io note shapes (yellow, like the notes engineers draw), with a dashed line to what they are about. */
function dioNoteItems(d, L, ox, oy, endCell, layer, items) {
  var boxes = L.notes && L.notes.length ? L.notes : layoutNotes(d, L, true), kinds = t('noteKinds') || {};
  boxes.forEach(function (b, k) {
    var q = b.q, id = 'note-' + q.id, att = null, target = null;
    if (q.attach && q.attach.type === 'edge') { var e = d.edges[q.attach.index]; if (e) att = endCell(e.from) + '>' + endCell(e.to); }
    else if (q.attach) { att = endCell(q.attach.id); target = att; }
    var head = [kinds[q.kind] || q.kind, noteDate(q.date), q.by].filter(Boolean).join(' · ');
    var value = '<b>' + htmlEsc(head) + '</b><br>' + htmlEsc(q.text).replace(/\n/g, '<br>');
    items.push({ z: 3e6 + k * 2, xml: dioCell({ id: id, value: value, style: 'shape=note;whiteSpace=wrap;html=1;size=11;fillColor=#fff2cc;strokeColor=#d6b656;fontColor=#3a3320;align=left;verticalAlign=top;spacing=6;fontSize=11;',
      vertex: 1, parent: layer }, dioGeometry(b.x + ox, b.y + oy, b.w, b.h), { tag: 'UserObject', adNote: '1', adKind: q.kind, adText: q.text, adDate: q.date || null, adBy: q.by || null, adAttach: att }) });
    if (target) items.push({ z: 3e6 + k * 2 + 1, xml: dioCell({ id: id + '-link', value: '', style: 'endArrow=none;dashed=1;strokeColor=#c9a227;html=1;', edge: 1, parent: layer, source: id, target: target },
      '<mxGeometry relative="1" as="geometry"/>', { tag: 'UserObject', adNoteLink: '1' }) });
  });
}
function drawioImagePage(st) {
  var saved = themeName;
  themeName = 'light';
  var svg = exportXml(st).replace(/^<\?xml[^>]*>\s*/, '');
  themeName = saved;
  var cell = '<mxCell id="img" value="" style="shape=image;imageAspect=0;aspect=fixed;verticalLabelPosition=bottom;verticalAlign=top;image=data:image/svg+xml,' + b64utf8(svg) +
    ';" vertex="1" parent="1">' + dioGeometry(0, 0, st.L.width, st.L.height) + '</mxCell>';
  return '<diagram id="' + xmlEsc(st.d.id) + '" name="' + xmlEsc(st.d.title || st.d.id) + '"><mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="' +
    Math.ceil(st.L.width) + '" pageHeight="' + Math.ceil(st.L.height) + '" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>' + cell + '</root></mxGraphModel></diagram>';
}
function drawioDocument() {
  var pages = states.map(function (st) { return st.d.kind === 'graph' ? drawioGraphPage(st) : drawioImagePage(st); });
  /* pages this browser could not unpack go back into the file exactly as they came */
  (currentRaw && Array.isArray(currentRaw.drawioKeep) ? currentRaw.drawioKeep : []).forEach(function (k) {
    if (k && typeof k.xml === 'string' && /^<diagram[\s>]/.test(k.xml)) pages.splice(Math.min(+k.at || 0, pages.length), 0, k.xml);
  });
  return '<mxfile host="architecture-diagrams" agent="architecture-diagrams skill" version="26.0.0">' + pages.join('') + '</mxfile>\n';
}

/* ---------- draw.io shape library (File > Open Library in draw.io) with this tool's symbols ---------- */
function drawioLibrary() {
  var T = THEMES.light, names = Object.keys(SYMBOLS).filter(function (k) { var d = SYMBOLS[k]; return d.cat !== 'drawio' && d.cat !== 'icons' && !d.native; });
  var jobs = names.map(function (name) {
    var def = SYMBOLS[name], w = def.size[0], h = def.size[1];
    return deflateRawB64(stencilXml(name, w, h, {}, T.ink)).then(function (b64) {
      var pos = def.label;
      var style = 'shape=stencil(' + b64 + ');whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=' + T.ink + ';strokeWidth=1.5;fontSize=12;' +
        (pos === 'bottom' ? 'verticalLabelPosition=bottom;verticalAlign=top;' : pos === 'top' ? 'verticalLabelPosition=top;verticalAlign=bottom;' :
         pos === 'left' ? 'labelPosition=left;align=right;' : pos === 'right' ? 'labelPosition=right;align=left;' : '');
      var xml = '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>' + dioCell({ id: '2', value: '', style: style, vertex: 1, parent: '1' }, dioGeometry(0, 0, w, h)) + '</root></mxGraphModel>';
      return deflateRawB64(xml).then(function (x) { return { xml: x, w: w, h: h, aspect: 'fixed', title: name }; });
    });
  });
  return Promise.all(jobs).then(function (items) { return '<mxlibrary>' + JSON.stringify(items) + '</mxlibrary>\n'; });
}
