/* Symbols: industry-standard shapes for software, digital and analog IC, and circuit diagrams.
   Every symbol is drawn from scratch for this project (MIT License). A symbol is a list of path parts
   laid out in the node's own box, so one definition draws the SVG and the editable draw.io stencil. */

function Pth() { this.c = []; }
Pth.prototype.M = function (x, y) { this.c.push(['M', x, y]); return this; };
Pth.prototype.L = function (x, y) { this.c.push(['L', x, y]); return this; };
Pth.prototype.Q = function (x1, y1, x, y) { this.c.push(['Q', x1, y1, x, y]); return this; };
Pth.prototype.C = function (x1, y1, x2, y2, x, y) { this.c.push(['C', x1, y1, x2, y2, x, y]); return this; };
Pth.prototype.A = function (rx, ry, rot, large, sweep, x, y) { this.c.push(['A', rx, ry, rot, large, sweep, x, y]); return this; };
Pth.prototype.Z = function () { this.c.push(['Z']); return this; };
Pth.prototype.poly = function (pts, close) {
  var self = this;
  pts.forEach(function (p, i) { self.c.push([i ? 'L' : 'M', p[0], p[1]]); });
  return close ? this.Z() : this;
};
Pth.prototype.rect = function (x, y, w, h) { return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true); };
Pth.prototype.rrect = function (x, y, w, h, r) {
  r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
  if (!r) return this.rect(x, y, w, h);
  return this.M(x + r, y).L(x + w - r, y).A(r, r, 0, 0, 1, x + w, y + r).L(x + w, y + h - r).A(r, r, 0, 0, 1, x + w - r, y + h)
    .L(x + r, y + h).A(r, r, 0, 0, 1, x, y + h - r).L(x, y + r).A(r, r, 0, 0, 1, x + r, y).Z();
};
Pth.prototype.ellipse = function (cx, cy, rx, ry) { return this.M(cx - rx, cy).A(rx, ry, 0, 1, 1, cx + rx, cy).A(rx, ry, 0, 1, 1, cx - rx, cy).Z(); };
Pth.prototype.circle = function (cx, cy, r) { return this.ellipse(cx, cy, r, r); };
Pth.prototype.line = function (x1, y1, x2, y2) { return this.M(x1, y1).L(x2, y2); };
/* A polyline whose corners are rounded with radius r (quadratic corners, like draw.io's rounded style). */
Pth.prototype.rounded = function (pts, r, close) {
  if (!r || pts.length < 3) return this.poly(pts, close);
  var n = pts.length, self = this;
  function cut(a, b, d) { var dx = b[0] - a[0], dy = b[1] - a[1], len = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(d, len / 2) / len; return [a[0] + dx * k, a[1] + dy * k]; }
  if (close) {
    var start = cut(pts[0], pts[1], r);
    self.M(start[0], start[1]);
    for (var i = 1; i <= n; i++) {
      var p = pts[i % n], prev = pts[i - 1], next = pts[(i + 1) % n];
      var a = cut(p, prev, r), b = cut(p, next, r);
      self.L(a[0], a[1]).Q(p[0], p[1], b[0], b[1]);
    }
    return self.Z();
  }
  self.M(pts[0][0], pts[0][1]);
  for (var j = 1; j < n - 1; j++) {
    var q = pts[j], a2 = cut(q, pts[j - 1], r), b2 = cut(q, pts[j + 1], r);
    self.L(a2[0], a2[1]).Q(q[0], q[1], b2[0], b2[1]);
  }
  return self.L(pts[n - 1][0], pts[n - 1][1]);
};

function symNum(n) { return Math.round(n * 100) / 100; }
function pthD(c) {
  return c.map(function (s) { return s[0] + s.slice(1).map(symNum).join(' '); }).join('');
}
/* A drawing part: fill is 'fill' (node fill), 'none' (outline only) or 'ink' (filled with the line color). */
function part(p, fill, extra) {
  var o = { p: p, fill: fill || 'none' };
  if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
  return o;
}
function tpart(text, x, y, size, anchor, weight) { return { text: text, x: x, y: y, size: size, anchor: anchor || 'middle', weight: weight || 600 }; }
function np() { return new Pth(); }
function bubbleR(w, h) { return Math.max(2.5, Math.min(w, h) * 0.09); }
function arrowHead(x1, y1, x2, y2, len, half) {
  var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l;
  return np().poly([[x2, y2], [x2 - ux * len - uy * half, y2 - uy * len + ux * half], [x2 - ux * len + uy * half, y2 - uy * len - ux * half]], true);
}
function sine(p, x0, x1, y, amp, humps) {
  var step = (x1 - x0) / (humps * 2);
  p.M(x0, y);
  for (var i = 0; i < humps * 2; i++) p.Q(x0 + step * (i + 0.5), y + (i % 2 ? amp : -amp) * 2, x0 + step * (i + 1), y);
  return p;
}
function orBody(p, x0, w, h) {
  var d = w - x0;
  return p.M(x0, 0).Q(x0 + d * 0.6, 0, w, h / 2).Q(x0 + d * 0.6, h, x0, h).Q(x0 + d * 0.3, h / 2, x0, 0).Z();
}
function orLeads(w, h, x0) {
  /* input leads reach the concave back so wires attached at x = 0 look connected */
  var d = w - x0, depth = function (y) { var t = 1 - y / h; return x0 + 2 * t * (1 - t) * d * 0.3; };
  return part(np().line(0, h * 0.3, depth(h * 0.3), h * 0.3).line(0, h * 0.7, depth(h * 0.7), h * 0.7), 'none');
}
function clockWedge(p, x, y, s) { return p.M(x, y - s).L(x + s * 1.1, y).L(x, y + s); }
/* Lucide icons are stored as absolute M/L/C/Q/A/Z paths on a 24 x 24 grid; this scales one into a box. */
function iconPath(name, x, y, size) {
  var p = np(), d = typeof ICONS !== 'undefined' ? ICONS[name] : null;
  if (!d) return p.rrect(x + size * 0.1, y + size * 0.1, size * 0.8, size * 0.8, size * 0.12);
  var k = size / 24, re = /([MLCQAZ])([^MLCQAZ]*)/g, m;
  while ((m = re.exec(d))) {
    var v = m[2].trim() ? m[2].trim().split(/[\s,]+/).map(Number) : [];
    if (m[1] === 'M') p.M(x + v[0] * k, y + v[1] * k);
    else if (m[1] === 'L') p.L(x + v[0] * k, y + v[1] * k);
    else if (m[1] === 'C') p.C(x + v[0] * k, y + v[1] * k, x + v[2] * k, y + v[3] * k, x + v[4] * k, y + v[5] * k);
    else if (m[1] === 'Q') p.Q(x + v[0] * k, y + v[1] * k, x + v[2] * k, y + v[3] * k);
    else if (m[1] === 'A') p.A(v[0] * k, v[1] * k, v[2], v[3], v[4], x + v[5] * k, y + v[6] * k);
    else p.Z();
  }
  return p;
}
function iconKnown(name) { return typeof ICONS !== 'undefined' && !!ICONS[name]; }

/* Box-like symbols can show the description under the title; the others show only the title. */
var SYMBOLS = {
  /* ---- basic shapes ---- */
  box: { cat: 'basic', size: [140, 60], label: 'center', boxy: true, native: 'rect',
    draw: function (w, h, o) { return [part(np().rrect(0, 0, w, h, o.radius), 'fill')]; } },
  ellipse: { cat: 'basic', size: [120, 64], label: 'center', boxy: true, perimeter: 'ellipse', native: 'ellipse',
    draw: function (w, h) { return [part(np().ellipse(w / 2, h / 2, w / 2, h / 2), 'fill')]; } },
  circle: { cat: 'basic', size: [56, 56], label: 'center', boxy: true, perimeter: 'ellipse', native: 'ellipse',
    draw: function (w, h) { return [part(np().ellipse(w / 2, h / 2, w / 2, h / 2), 'fill')]; } },
  diamond: { cat: 'basic', size: [120, 72], label: 'center', boxy: true, perimeter: 'poly', native: 'rhombus',
    outline: function (w, h) { return [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  triangle: { cat: 'basic', size: [48, 56], label: 'center', perimeter: 'poly', native: 'triangle',
    outline: function (w, h) { return [[0, 0], [w, h / 2], [0, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  trapezoid: { cat: 'basic', size: [120, 60], label: 'center', boxy: true, perimeter: 'poly', native: 'trapezoid',
    inset: function (w, o) { return o.fixedSize ? Math.max(0, Math.min(w / 2, o.size === undefined ? 20 : o.size)) : w * Math.max(0, Math.min(0.5, o.size === undefined ? 0.2 : o.size)); },
    outline: function (w, h, o) { var s = this.inset(w, o || {}); return [[0, h], [s, 0], [w - s, 0], [w, h]]; },
    draw: function (w, h, o) { return [part(np().rounded(this.outline(w, h, o), o.rounded ? 10 : 0, true), 'fill')]; } },
  hexagon: { cat: 'basic', size: [120, 60], label: 'center', boxy: true, perimeter: 'poly', native: 'hexagon',
    inset: function (w, o) { return o.fixedSize ? Math.max(0, Math.min(w / 2, o.size === undefined ? 20 : o.size)) : w * Math.max(0, Math.min(1, o.size === undefined ? 0.25 : o.size)); },
    outline: function (w, h, o) { var s = this.inset(w, o || {}); return [[s, 0], [w - s, 0], [w, h / 2], [w - s, h], [s, h], [0, h / 2]]; },
    draw: function (w, h, o) { return [part(np().rounded(this.outline(w, h, o), o.rounded ? 10 : 0, true), 'fill')]; } },
  parallelogram: { cat: 'basic', size: [130, 56], label: 'center', boxy: true, perimeter: 'poly', native: 'parallelogram',
    inset: function (w, o) { return o.fixedSize ? Math.max(0, Math.min(w, o.size === undefined ? 20 : o.size)) : w * Math.max(0, Math.min(1, o.size === undefined ? 0.2 : o.size)); },
    outline: function (w, h, o) { var s = this.inset(w, o || {}); return [[0, h], [s, 0], [w, 0], [w - s, h]]; },
    draw: function (w, h, o) { return [part(np().rounded(this.outline(w, h, o), o.rounded ? 10 : 0, true), 'fill')]; } },
  cylinder: { cat: 'basic', size: [80, 72], label: 'center', boxy: true, native: 'cylinder',
    labelBox: function (w, h, o) { var e = Math.min((o && o.size) || 15, h * 0.3); return { x: 0, y: e * 2, w: w, h: Math.max(10, h - e * 3) }; },
    draw: function (w, h, o) {
      var e = Math.min(o.size || 15, h * 0.3);
      return [part(np().M(0, e).A(w / 2, e, 0, 0, 1, w, e).L(w, h - e).A(w / 2, e, 0, 0, 1, 0, h - e).Z(), 'fill'),
              part(np().M(0, e).A(w / 2, e, 0, 0, 0, w, e), 'none')];
    } },
  document: { cat: 'basic', size: [120, 72], label: 'center', boxy: true, native: 'document',
    draw: function (w, h) {
      return [part(np().M(0, 0).L(w, 0).L(w, h * 0.84).C(w * 0.72, h * 0.66, w * 0.62, h * 0.7, w * 0.5, h * 0.84)
        .C(w * 0.38, h * 0.98, w * 0.24, h * 1.0, 0, h * 0.84).Z(), 'fill')];
    } },
  note: { cat: 'basic', size: [120, 72], label: 'center', boxy: true, native: 'note',
    draw: function (w, h) {
      var c = Math.min(16, w * 0.25, h * 0.25);
      return [part(np().poly([[0, 0], [w - c, 0], [w, c], [w, h], [0, h]], true), 'fill'), part(np().poly([[w - c, 0], [w - c, c], [w, c]]), 'none')];
    } },
  cloud: { cat: 'basic', size: [130, 80], label: 'center', boxy: true, perimeter: 'ellipse', native: 'cloud',
    draw: function (w, h) {
      return [part(np().M(w * 0.25, h * 0.88).C(w * 0.06, h * 0.9, w * -0.01, h * 0.62, w * 0.14, h * 0.52)
        .C(w * 0.07, h * 0.3, w * 0.28, h * 0.14, w * 0.42, h * 0.26).C(w * 0.5, h * 0.02, w * 0.84, h * 0.06, w * 0.8, h * 0.32)
        .C(w * 1.0, h * 0.34, w * 1.03, h * 0.66, w * 0.86, h * 0.74).C(w * 0.9, h * 0.9, w * 0.74, h * 0.94, w * 0.66, h * 0.86)
        .C(w * 0.56, h * 0.98, w * 0.34, h * 0.98, w * 0.25, h * 0.88).Z(), 'fill')];
    } },
  terminator: { cat: 'basic', size: [130, 48], label: 'center', boxy: true, native: 'terminator',
    draw: function (w, h) { return [part(np().rrect(0, 0, w, h, h / 2), 'fill')]; } },
  subroutine: { cat: 'basic', size: [140, 60], label: 'center', boxy: true, native: 'process',
    draw: function (w, h) { var s = Math.min(w * 0.1, 16); return [part(np().rect(0, 0, w, h), 'fill'), part(np().line(s, 0, s, h).line(w - s, 0, w - s, h), 'none')]; } },
  brace: { cat: 'basic', size: [20, 120], label: 'left', native: 'brace',
    draw: function (w, h, o) {
      var s = w * Math.max(0, Math.min(1, o.size === undefined ? 0.5 : o.size));
      return [part(np().rounded([[w, 0], [s, 0], [s, h / 2], [0, h / 2], [s, h / 2], [s, h], [w, h]], 10, false), 'none')];
    } },
  line: { cat: 'basic', size: [120, 10], label: 'top', native: 'line',
    draw: function (w, h) { return [part(np().line(0, h / 2, w, h / 2), 'none')]; } },
  text: { cat: 'basic', size: [120, 30], label: 'center', boxy: true, native: 'text',
    draw: function (w, h) { return [part(np().rect(0, 0, w, h), 'fill')]; } },
  image: { cat: 'basic', size: [80, 80], label: 'bottom', native: 'image',
    draw: function () { return []; } },
  actor: { cat: 'basic', size: [32, 60], label: 'bottom', native: 'actor',
    draw: function (w, h) {
      var r = Math.min(w * 0.28, h * 0.11);
      return [part(np().circle(w / 2, r + 1, r), 'fill'),
              part(np().line(w / 2, 2 * r + 1, w / 2, h * 0.62).line(w * 0.08, h * 0.36, w * 0.92, h * 0.36).line(w / 2, h * 0.62, w * 0.12, h).line(w / 2, h * 0.62, w * 0.88, h), 'none')];
    } },

  /* ---- logic gates (IEEE distinctive shapes, output on the right) ---- */
  and: { cat: 'logic', size: [56, 44], label: 'bottom', pins: [[0, 0.3, 'A', 'in'], [0, 0.7, 'B', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) { return [part(np().M(0, 0).L(w / 2, 0).A(w / 2, h / 2, 0, 0, 1, w / 2, h).L(0, h).Z(), 'fill')]; } },
  nand: { cat: 'logic', size: [60, 44], label: 'bottom', pins: [[0, 0.3, 'A', 'in'], [0, 0.7, 'B', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) {
      var r = bubbleR(w, h), b = w - 2 * r;
      return [part(np().M(0, 0).L(b / 2, 0).A(b / 2, h / 2, 0, 0, 1, b / 2, h).L(0, h).Z(), 'fill'), part(np().circle(b + r, h / 2, r), 'fill')];
    } },
  or: { cat: 'logic', size: [60, 44], label: 'bottom', pins: [[0, 0.3, 'A', 'in'], [0, 0.7, 'B', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) { return [part(orBody(np(), 0, w, h), 'fill'), orLeads(w, h, 0)]; } },
  nor: { cat: 'logic', size: [64, 44], label: 'bottom', pins: [[0, 0.3, 'A', 'in'], [0, 0.7, 'B', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) { var r = bubbleR(w, h), b = w - 2 * r; return [part(orBody(np(), 0, b, h), 'fill'), part(np().circle(b + r, h / 2, r), 'fill'), orLeads(b, h, 0)]; } },
  xor: { cat: 'logic', size: [64, 44], label: 'bottom', pins: [[0, 0.3, 'A', 'in'], [0, 0.7, 'B', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) {
      var g = w * 0.13;
      return [part(orBody(np(), g, w, h), 'fill'), part(np().M(0, 0).Q((w - g) * 0.3, h / 2, 0, h), 'none'), orLeads(w, h, g)];
    } },
  xnor: { cat: 'logic', size: [68, 44], label: 'bottom', pins: [[0, 0.3, 'A', 'in'], [0, 0.7, 'B', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) {
      var r = bubbleR(w, h), b = w - 2 * r, g = b * 0.13;
      return [part(orBody(np(), g, b, h), 'fill'), part(np().M(0, 0).Q((b - g) * 0.3, h / 2, 0, h), 'none'), part(np().circle(b + r, h / 2, r), 'fill'), orLeads(b, h, g)];
    } },
  not: { cat: 'logic', size: [48, 36], label: 'bottom', pins: [[0, 0.5, 'A', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) { var r = bubbleR(w, h), b = w - 2 * r; return [part(np().poly([[0, 0], [b, h / 2], [0, h]], true), 'fill'), part(np().circle(b + r, h / 2, r), 'fill')]; } },
  buffer: { cat: 'logic', size: [44, 36], label: 'bottom', perimeter: 'poly', pins: [[0, 0.5, 'A', 'in'], [1, 0.5, 'Y', 'out']],
    outline: function (w, h) { return [[0, 0], [w, h / 2], [0, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  tristate: { cat: 'logic', size: [48, 46], label: 'bottom', pins: [[0, 0.61, 'A', 'in'], [0.45, 0, 'EN', 'in'], [1, 0.61, 'Y', 'out']],
    draw: function (w, h) {
      var top = h * 0.22, edge = top + 0.45 * (h * 0.61 - top);
      return [part(np().poly([[0, top], [w, h * 0.61], [0, h]], true), 'fill'), part(np().line(w * 0.45, 0, w * 0.45, edge), 'none')];
    } },

  /* ---- digital blocks ---- */
  mux: { cat: 'digital', size: [44, 88], label: 'bottom', perimeter: 'poly', pins: [[0, 0.3, 'I0', 'in'], [0, 0.7, 'I1', 'in'], [0.5, 0.9, 'SEL', 'in'], [1, 0.5, 'Y', 'out']],
    outline: function (w, h) { return [[0, 0], [w, h * 0.2], [w, h * 0.8], [0, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill'), tpart('0', w * 0.16, h * 0.3, 10, 'middle', 500), tpart('1', w * 0.16, h * 0.7, 10, 'middle', 500)]; } },
  demux: { cat: 'digital', size: [44, 88], label: 'bottom', perimeter: 'poly', pins: [[0, 0.5, 'A', 'in'], [0.5, 0.9, 'SEL', 'in'], [1, 0.3, 'Y0', 'out'], [1, 0.7, 'Y1', 'out']],
    outline: function (w, h) { return [[0, h * 0.2], [w, 0], [w, h], [0, h * 0.8]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill'), tpart('0', w * 0.84, h * 0.3, 10, 'middle', 500), tpart('1', w * 0.84, h * 0.7, 10, 'middle', 500)]; } },
  alu: { cat: 'digital', size: [64, 96], label: 'center', perimeter: 'poly', pins: [[0, 0.2, 'A', 'in'], [0, 0.8, 'B', 'in'], [1, 0.5, 'Y', 'out']],
    outline: function (w, h) { return [[0, 0], [w, h * 0.3], [w, h * 0.7], [0, h], [0, h * 0.62], [w * 0.2, h / 2], [0, h * 0.38]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  adder: { cat: 'digital', size: [40, 40], label: 'bottom', perimeter: 'ellipse', pins: [[0, 0.5, 'A', 'in'], [0.5, 0, 'B', 'in'], [0.5, 1, 'C', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) {
      var r = Math.min(w, h) / 2, cx = w / 2, cy = h / 2, k = r * 0.55;
      return [part(np().circle(cx, cy, r), 'fill'), part(np().line(cx - k, cy, cx + k, cy).line(cx, cy - k, cx, cy + k), 'none')];
    } },
  multiplier: { cat: 'digital', size: [40, 40], label: 'bottom', perimeter: 'ellipse', pins: [[0, 0.5, 'A', 'in'], [0.5, 0, 'B', 'in'], [0.5, 1, 'C', 'in'], [1, 0.5, 'Y', 'out']],
    draw: function (w, h) {
      var r = Math.min(w, h) / 2, cx = w / 2, cy = h / 2, k = r * 0.42;
      return [part(np().circle(cx, cy, r), 'fill'), part(np().line(cx - k, cy - k, cx + k, cy + k).line(cx + k, cy - k, cx - k, cy + k), 'none')];
    } },
  dff: { cat: 'digital', size: [56, 72], label: 'bottom', pins: [[0, 0.3, 'D', 'in'], [0, 0.72, 'CLK', 'clk'], [1, 0.3, 'Q', 'out'], [1, 0.78, 'QN', 'out']],
    draw: function (w, h) {
      var s = Math.min(8, h * 0.1);
      return [part(np().rect(0, 0, w, h), 'fill'), part(clockWedge(np(), 0, h * 0.72, s), 'none'),
              tpart('D', w * 0.14, h * 0.3 + 4, 11, 'start'), tpart('Q', w * 0.86, h * 0.3 + 4, 11, 'end'), tpart('Q', w * 0.86, h * 0.78 + 4, 11, 'end'),
              part(np().line(w * 0.86 - 8, h * 0.78 - 6.5, w * 0.86, h * 0.78 - 6.5), 'none', { weight: 0.7 })];
    } },
  dffr: { cat: 'digital', size: [56, 84], label: 'top', pins: [[0, 0.28, 'D', 'in'], [0, 0.6, 'CLK', 'clk'], [1, 0.28, 'Q', 'out'], [1, 0.6, 'QN', 'out'], [0.5, 1, 'RST_N', 'in']],
    draw: function (w, h) {
      /* a flip-flop with an active-low asynchronous reset on the bottom edge */
      var s = Math.min(8, h * 0.1);
      return [part(np().rect(0, 0, w, h), 'fill'), part(clockWedge(np(), 0, h * 0.6, s), 'none'),
              tpart('D', w * 0.14, h * 0.28 + 4, 11, 'start'), tpart('Q', w * 0.86, h * 0.28 + 4, 11, 'end'), tpart('Q', w * 0.86, h * 0.6 + 4, 11, 'end'),
              part(np().line(w * 0.86 - 8, h * 0.6 - 6.5, w * 0.86, h * 0.6 - 6.5), 'none', { weight: 0.7 }),
              tpart('R', w * 0.5, h - 6, 10, 'middle'), part(np().line(w * 0.5 - 3.5, h - 15, w * 0.5 + 3.5, h - 15), 'none', { weight: 0.7 })];
    } },
  latch: { cat: 'digital', size: [56, 72], label: 'bottom', pins: [[0, 0.3, 'D', 'in'], [0, 0.72, 'EN', 'clk'], [1, 0.3, 'Q', 'out']],
    draw: function (w, h) {
      return [part(np().rect(0, 0, w, h), 'fill'), tpart('D', w * 0.12, h * 0.3 + 4, 11, 'start'), tpart('EN', w * 0.12, h * 0.72 + 4, 10, 'start'), tpart('Q', w * 0.88, h * 0.3 + 4, 11, 'end')];
    } },
  register: { cat: 'digital', size: [110, 44], label: 'center', boxy: true, pins: [[0, 0.5, 'D', 'in'], [0.5, 1, 'CLK', 'clk'], [1, 0.5, 'Q', 'out']],
    draw: function (w, h) { var s = Math.min(9, w * 0.12); return [part(np().rect(0, 0, w, h), 'fill'), part(np().M(w / 2 - s, h).L(w / 2, h - s * 1.1).L(w / 2 + s, h), 'none')]; } },
  counter: { cat: 'digital', size: [96, 56], label: 'center', boxy: true, pins: [[0, 0.3, 'EN', 'in'], [0, 0.72, 'CLK', 'clk'], [1, 0.5, 'Q', 'out']],
    draw: function (w, h) { var s = Math.min(8, h * 0.12); return [part(np().rect(0, 0, w, h), 'fill'), part(clockWedge(np(), 0, h * 0.72, s), 'none'), tpart('+1', w - 6, 13, 10, 'end', 700)]; } },
  fifo: { cat: 'digital', size: [96, 44], label: 'bottom', pins: [[0, 0.5, 'IN', 'in'], [1, 0.5, 'OUT', 'out']],
    draw: function (w, h) {
      var p = np();
      [0.44, 0.58, 0.72, 0.86].forEach(function (f) { p.line(w * f, 0, w * f, h); });
      return [part(np().rect(0, 0, w, h), 'fill'), part(p, 'none'), part(np().M(w * 0.08, h / 2).L(w * 0.3, h / 2).M(w * 0.24, h * 0.36).L(w * 0.31, h / 2).L(w * 0.24, h * 0.64), 'none')];
    } },
  ram: { cat: 'digital', size: [100, 76], label: 'center', boxy: true, labelBox: function (w, h) { return { x: 0, y: 0, w: w, h: h * 0.34 }; },
    draw: function (w, h) {
      var p = np().line(0, h * 0.34, w, h * 0.34);
      [0.5, 0.66, 0.82].forEach(function (f) { p.line(w * 0.08, h * f, w * 0.92, h * f); });
      return [part(np().rect(0, 0, w, h), 'fill'), part(p, 'none')];
    } },
  rom: { cat: 'digital', size: [100, 76], label: 'center', boxy: true, labelBox: function (w, h) { return { x: 0, y: 0, w: w, h: h * 0.34 }; },
    draw: function (w, h) {
      var p = np().line(0, h * 0.34, w, h * 0.34).line(0, h * 0.38, w, h * 0.38), q = np();
      [0.54, 0.7, 0.86].forEach(function (f) { q.line(w * 0.08, h * f, w * 0.92, h * f); });
      return [part(np().rect(0, 0, w, h), 'fill'), part(p, 'none'), part(q, 'none', { dash: true })];
    } },
  sync: { cat: 'digital', size: [84, 48], label: 'bottom', pins: [[0, 0.32, 'D', 'in'], [0, 0.78, 'CLK', 'clk'], [1, 0.32, 'Q', 'out']],
    draw: function (w, h) {
      var bw = w * 0.4, s = Math.min(7, h * 0.12);
      return [part(np().rect(0, 0, bw, h).rect(w - bw, 0, bw, h), 'fill'), part(np().line(bw, h * 0.32, w - bw, h * 0.32), 'none'),
              part(clockWedge(np(), 0, h * 0.78, s), 'none'), part(clockWedge(np(), w - bw, h * 0.78, s), 'none'),
              tpart('D', bw * 0.14, h * 0.32 + 3.5, 9.5, 'start'), tpart('Q', bw * 0.88, h * 0.32 + 3.5, 9.5, 'end'),
              tpart('D', w - bw + bw * 0.14, h * 0.32 + 3.5, 9.5, 'start'), tpart('Q', w - bw * 0.12, h * 0.32 + 3.5, 9.5, 'end')];
    } },
  clockgate: { cat: 'digital', size: [72, 52], label: 'bottom', pins: [[0, 0.3, 'EN', 'in'], [0, 0.74, 'CLK', 'clk'], [1, 0.5, 'GCLK', 'out']],
    draw: function (w, h) {
      var s = Math.min(7, h * 0.12), gx = w * 0.54, gw = w * 0.3, gh = h * 0.42, gy = (h - gh) / 2;
      return [part(np().rect(0, 0, w, h), 'fill'), part(clockWedge(np(), 0, h * 0.74, s), 'none'),
              part(np().M(gx, gy).L(gx + gw / 2, gy).A(gw / 2, gh / 2, 0, 0, 1, gx + gw / 2, gy + gh).L(gx, gy + gh).Z(), 'none'),
              tpart('EN', w * 0.1, h * 0.3 + 4, 9.5, 'start')];
    } },
  /* Ports of a block on a detail board or in a detail tab: EXT faces the outside of the frame, INT the inside.
     A port on the right edge of its frame is mirrored (flipH), so EXT stays on the outer side. */
  'port-in': { cat: 'digital', size: [110, 26], label: 'center', boxy: true, perimeter: 'poly', pins: [[0, 0.5, 'EXT', 'in'], [1, 0.5, 'INT', 'out']],
    labelBox: function (w, h) { return { x: 2, y: 0, w: Math.max(8, w - h * 0.5 - 2), h: h }; },
    outline: function (w, h) { return [[0, 0], [w - h * 0.5, 0], [w, h / 2], [w - h * 0.5, h], [0, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  'port-out': { cat: 'digital', size: [110, 26], label: 'center', boxy: true, perimeter: 'poly', pins: [[0, 0.5, 'INT', 'in'], [1, 0.5, 'EXT', 'out']],
    labelBox: function (w, h) { return { x: 2, y: 0, w: Math.max(8, w - h * 0.5 - 2), h: h }; },
    outline: function (w, h) { return [[0, 0], [w - h * 0.5, 0], [w, h / 2], [w - h * 0.5, h], [0, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  'port-io': { cat: 'digital', size: [110, 26], label: 'center', boxy: true, perimeter: 'poly', pins: [[0, 0.5, 'EXT', 'io'], [1, 0.5, 'INT', 'io']],
    labelBox: function (w, h) { return { x: h * 0.5, y: 0, w: Math.max(8, w - h), h: h }; },
    outline: function (w, h) { return [[h * 0.5, 0], [w - h * 0.5, 0], [w, h / 2], [w - h * 0.5, h], [h * 0.5, h], [0, h / 2]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  /* The same ports for the top and bottom edges of a frame: EXT on top, the text stays level. On the bottom edge they are flipped (flipV). */
  'port-in-v': { cat: 'digital', size: [96, 34], label: 'center', boxy: true, perimeter: 'poly', pins: [[0.5, 0, 'EXT', 'in'], [0.5, 1, 'INT', 'out']],
    labelBox: function (w, h) { return { x: 2, y: 0, w: Math.max(8, w - 4), h: h * 0.66 }; },
    outline: function (w, h) { return [[0, 0], [w, 0], [w, h * 0.66], [w / 2, h], [0, h * 0.66]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  'port-out-v': { cat: 'digital', size: [96, 34], label: 'center', boxy: true, perimeter: 'poly', pins: [[0.5, 1, 'INT', 'in'], [0.5, 0, 'EXT', 'out']],
    labelBox: function (w, h) { return { x: 2, y: h * 0.34, w: Math.max(8, w - 4), h: h * 0.66 }; },
    outline: function (w, h) { return [[w / 2, 0], [w, h * 0.34], [w, h], [0, h], [0, h * 0.34]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  'port-io-v': { cat: 'digital', size: [96, 34], label: 'center', boxy: true, perimeter: 'poly', pins: [[0.5, 0, 'EXT', 'io'], [0.5, 1, 'INT', 'io']],
    labelBox: function (w, h) { return { x: 2, y: h * 0.26, w: Math.max(8, w - 4), h: h * 0.48 }; },
    outline: function (w, h) { return [[w / 2, 0], [w, h * 0.26], [w, h * 0.74], [w / 2, h], [0, h * 0.74], [0, h * 0.26]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  ic: { cat: 'digital', size: [96, 72], label: 'center', boxy: true, labelBox: function (w, h) { return { x: w * 0.12, y: 0, w: w * 0.76, h: h }; },
    draw: function (w, h) {
      var p = np(), n = Math.max(2, Math.min(6, Math.round(h / 16)));
      for (var i = 0; i < n; i++) { var y = h * (i + 0.5) / n; p.line(0, y, w * 0.12, y).line(w * 0.88, y, w, y); }
      return [part(np().rrect(w * 0.12, 0, w * 0.76, h, 3), 'fill'), part(p, 'none'), part(np().circle(w * 0.12 + 7, 7, 2.2), 'ink')];
    } },

  /* ---- analog and mixed-signal ---- */
  pll: { cat: 'analog', size: [96, 60], label: 'center', boxy: true, labelBox: function (w, h) { return { x: 0, y: 0, w: w, h: h * 0.68 }; },
    draw: function (w, h) { return [part(np().rrect(0, 0, w, h, 4), 'fill'), part(sine(np(), w * 0.3, w * 0.7, h * 0.8, h * 0.05, 2), 'none')]; } },
  oscillator: { cat: 'analog', size: [44, 44], label: 'bottom', perimeter: 'ellipse', pins: [[1, 0.5, 'OUT', 'out']],
    draw: function (w, h) { var r = Math.min(w, h) / 2; return [part(np().circle(w / 2, h / 2, r), 'fill'), part(sine(np(), w / 2 - r * 0.6, w / 2 + r * 0.6, h / 2, r * 0.16, 1), 'none')]; } },
  clock: { cat: 'analog', size: [44, 44], label: 'bottom', perimeter: 'ellipse', pins: [[1, 0.5, 'CLK', 'out']],
    draw: function (w, h) {
      var r = Math.min(w, h) / 2, cx = w / 2, cy = h / 2, a = r * 0.3;
      return [part(np().circle(cx, cy, r), 'fill'),
              part(np().poly([[cx - r * 0.62, cy + a], [cx - r * 0.3, cy + a], [cx - r * 0.3, cy - a], [cx, cy - a], [cx, cy + a], [cx + r * 0.3, cy + a], [cx + r * 0.3, cy - a], [cx + r * 0.62, cy - a]]), 'none')];
    } },
  crystal: { cat: 'analog', size: [64, 36], label: 'top', pins: [[0, 0.5, 'X1', 'io'], [1, 0.5, 'X2', 'io']],
    draw: function (w, h) {
      return [part(np().line(0, h / 2, w * 0.26, h / 2).line(w * 0.26, h * 0.15, w * 0.26, h * 0.85).line(w * 0.74, h * 0.15, w * 0.74, h * 0.85).line(w * 0.74, h / 2, w, h / 2), 'none'),
              part(np().rect(w * 0.36, h * 0.1, w * 0.28, h * 0.8), 'fill')];
    } },
  adc: { cat: 'analog', size: [92, 52], label: 'center', boxy: true, perimeter: 'poly', pins: [[0, 0.5, 'IN', 'in'], [1, 0.5, 'OUT', 'out']],
    labelBox: function (w, h) { return { x: w * 0.16, y: 0, w: w * 0.84, h: h }; },
    outline: function (w, h) { return [[0, h / 2], [w * 0.22, 0], [w, 0], [w, h], [w * 0.22, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  dac: { cat: 'analog', size: [92, 52], label: 'center', boxy: true, perimeter: 'poly', pins: [[0, 0.5, 'IN', 'in'], [1, 0.5, 'OUT', 'out']],
    labelBox: function (w, h) { return { x: 0, y: 0, w: w * 0.84, h: h }; },
    outline: function (w, h) { return [[0, 0], [w * 0.78, 0], [w, h / 2], [w * 0.78, h], [0, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  opamp: { cat: 'analog', size: [64, 56], label: 'bottom', perimeter: 'poly', pins: [[0, 0.3, 'IN-', 'in'], [0, 0.7, 'IN+', 'in'], [1, 0.5, 'OUT', 'out']],
    outline: function (w, h) { return [[0, 0], [w, h / 2], [0, h]]; },
    draw: function (w, h) {
      var s = Math.min(w, h) * 0.07;
      return [part(np().poly(this.outline(w, h), true), 'fill'),
              part(np().line(w * 0.08, h * 0.3, w * 0.08 + 2 * s, h * 0.3).line(w * 0.08, h * 0.7, w * 0.08 + 2 * s, h * 0.7).line(w * 0.08 + s, h * 0.7 - s, w * 0.08 + s, h * 0.7 + s), 'none')];
    } },
  comparator: { cat: 'analog', size: [64, 56], label: 'bottom', perimeter: 'poly', pins: [[0, 0.3, 'IN-', 'in'], [0, 0.7, 'IN+', 'in'], [1, 0.5, 'OUT', 'out']],
    outline: function (w, h) { return [[0, 0], [w, h / 2], [0, h]]; },
    draw: function (w, h) {
      var s = Math.min(w, h) * 0.07;
      return [part(np().poly(this.outline(w, h), true), 'fill'),
              part(np().line(w * 0.08, h * 0.3, w * 0.08 + 2 * s, h * 0.3).line(w * 0.08, h * 0.7, w * 0.08 + 2 * s, h * 0.7).line(w * 0.08 + s, h * 0.7 - s, w * 0.08 + s, h * 0.7 + s), 'none'),
              part(np().poly([[w * 0.3, h * 0.58], [w * 0.4, h * 0.58], [w * 0.4, h * 0.42], [w * 0.5, h * 0.42]]), 'none')];
    } },
  amp: { cat: 'analog', size: [52, 44], label: 'bottom', perimeter: 'poly', pins: [[0, 0.5, 'IN', 'in'], [1, 0.5, 'OUT', 'out']],
    outline: function (w, h) { return [[0, 0], [w, h / 2], [0, h]]; },
    draw: function (w, h) { return [part(np().poly(this.outline(w, h), true), 'fill')]; } },
  pad: { cat: 'analog', size: [36, 36], label: 'bottom', pins: [[0.5, 0.5, 'PAD', 'io']],
    draw: function (w, h) { return [part(np().rect(0, 0, w, h), 'fill'), part(np().rect(w * 0.18, h * 0.18, w * 0.64, h * 0.64).line(w * 0.18, h * 0.18, w * 0.82, h * 0.82).line(w * 0.82, h * 0.18, w * 0.18, h * 0.82), 'none')]; } },
  power: { cat: 'analog', size: [36, 28], label: 'top', pins: [[0.5, 1, 'VDD', 'io']],
    draw: function (w, h) { return [part(np().line(w / 2, h, w / 2, h * 0.28).line(w * 0.12, h * 0.28, w * 0.88, h * 0.28), 'none', { weight: 1.4 })]; } },
  ground: { cat: 'analog', size: [36, 28], label: 'bottom', pins: [[0.5, 0, 'GND', 'io']],
    draw: function (w, h) { return [part(np().line(w / 2, 0, w / 2, h * 0.42).line(w * 0.08, h * 0.42, w * 0.92, h * 0.42).line(w * 0.26, h * 0.66, w * 0.74, h * 0.66).line(w * 0.42, h * 0.9, w * 0.58, h * 0.9), 'none')]; } },
  antenna: { cat: 'analog', size: [32, 40], label: 'bottom', pins: [[0.5, 1, 'ANT', 'io']],
    draw: function (w, h) { return [part(np().line(w / 2, h, w / 2, h * 0.08).M(w * 0.08, h * 0.08).L(w / 2, h * 0.5).L(w * 0.92, h * 0.08).Z(), 'none')]; } },
  battery: { cat: 'analog', size: [56, 32], label: 'top', pins: [[0, 0.5, '+', 'io'], [1, 0.5, '-', 'io']],
    draw: function (w, h) {
      return [part(np().line(0, h / 2, w * 0.43, h / 2).line(w * 0.43, h * 0.08, w * 0.43, h * 0.92).line(w * 0.57, h / 2, w, h / 2), 'none'),
              part(np().line(w * 0.57, h * 0.28, w * 0.57, h * 0.72), 'none', { weight: 2.2 })];
    } },
  vsource: { cat: 'analog', size: [40, 40], label: 'right', perimeter: 'ellipse', pins: [[0.5, 0, '+', 'io'], [0.5, 1, '-', 'io']],
    draw: function (w, h) {
      var r = Math.min(w, h) / 2, cx = w / 2, cy = h / 2, k = r * 0.2;
      return [part(np().circle(cx, cy, r), 'fill'), part(np().line(cx - k, cy - r * 0.45, cx + k, cy - r * 0.45).line(cx, cy - r * 0.45 - k, cx, cy - r * 0.45 + k).line(cx - k, cy + r * 0.45, cx + k, cy + r * 0.45), 'none')];
    } },
  isource: { cat: 'analog', size: [40, 40], label: 'right', perimeter: 'ellipse', pins: [[0.5, 0, '+', 'io'], [0.5, 1, '-', 'io']],
    draw: function (w, h) {
      var r = Math.min(w, h) / 2, cx = w / 2, cy = h / 2;
      return [part(np().circle(cx, cy, r), 'fill'), part(np().line(cx, cy + r * 0.55, cx, cy - r * 0.3), 'none'), part(arrowHead(cx, cy + r * 0.5, cx, cy - r * 0.58, r * 0.34, r * 0.2), 'ink')];
    } },

  /* ---- passives and transistors ---- */
  resistor: { cat: 'passive', size: [64, 20], label: 'top', pins: [[0, 0.5, '1', 'io'], [1, 0.5, '2', 'io']],
    draw: function (w, h) {
      var pts = [[0, h / 2], [w * 0.2, h / 2]];
      for (var i = 0; i < 6; i++) pts.push([w * (0.25 + i * 0.1), i % 2 ? h : 0]);
      pts.push([w * 0.8, h / 2], [w, h / 2]);
      return [part(np().poly(pts), 'none')];
    } },
  'resistor-box': { cat: 'passive', size: [64, 20], label: 'top', pins: [[0, 0.5, '1', 'io'], [1, 0.5, '2', 'io']],
    draw: function (w, h) { return [part(np().line(0, h / 2, w * 0.2, h / 2).line(w * 0.8, h / 2, w, h / 2), 'none'), part(np().rect(w * 0.2, h * 0.12, w * 0.6, h * 0.76), 'fill')]; } },
  capacitor: { cat: 'passive', size: [40, 32], label: 'top', pins: [[0, 0.5, '1', 'io'], [1, 0.5, '2', 'io']],
    draw: function (w, h) { return [part(np().line(0, h / 2, w * 0.42, h / 2).line(w * 0.42, 0, w * 0.42, h).line(w * 0.58, 0, w * 0.58, h).line(w * 0.58, h / 2, w, h / 2), 'none')]; } },
  inductor: { cat: 'passive', size: [64, 24], label: 'top', pins: [[0, 0.75, '1', 'io'], [1, 0.75, '2', 'io']],
    draw: function (w, h) {
      var base = h * 0.75, x = w * 0.14, d = w * 0.72 / 4, p = np().M(0, base).L(x, base);
      for (var i = 0; i < 4; i++) { p.A(d / 2, Math.min(d / 2, base), 0, 0, 1, x + d, base); x += d; }
      return [part(p.L(w, base), 'none')];
    } },
  diode: { cat: 'passive', size: [48, 28], label: 'top', pins: [[0, 0.5, 'A', 'io'], [1, 0.5, 'K', 'io']],
    draw: function (w, h) {
      return [part(np().line(0, h / 2, w * 0.3, h / 2).line(w * 0.64, h * 0.1, w * 0.64, h * 0.9).line(w * 0.64, h / 2, w, h / 2), 'none'),
              part(np().poly([[w * 0.3, h * 0.1], [w * 0.64, h / 2], [w * 0.3, h * 0.9]], true), 'fill')];
    } },
  led: { cat: 'passive', size: [48, 40], label: 'bottom', pins: [[0, 0.62, 'A', 'io'], [1, 0.62, 'K', 'io']],
    draw: function (w, h) {
      var y = h * 0.62, t = h * 0.3;
      return [part(np().line(0, y, w * 0.3, y).line(w * 0.64, y - t, w * 0.64, y + t).line(w * 0.64, y, w, y), 'none'),
              part(np().poly([[w * 0.3, y - t], [w * 0.64, y], [w * 0.3, y + t]], true), 'fill'),
              part(np().line(w * 0.5, h * 0.22, w * 0.64, h * 0.04).line(w * 0.64, h * 0.3, w * 0.78, h * 0.12), 'none'),
              part(arrowHead(w * 0.5, h * 0.22, w * 0.66, h * 0.02, 5, 2.6), 'ink'), part(arrowHead(w * 0.64, h * 0.3, w * 0.8, h * 0.1, 5, 2.6), 'ink')];
    } },
  nmos: { cat: 'passive', size: [44, 56], label: 'right', pins: [[0, 0.5, 'G', 'in'], [0.8, 0, 'D', 'io'], [0.8, 1, 'S', 'io']],
    draw: function (w, h) {
      return [part(np().line(0, h / 2, w * 0.32, h / 2).line(w * 0.32, h * 0.28, w * 0.32, h * 0.72).line(w * 0.44, h * 0.2, w * 0.44, h * 0.8)
                .poly([[w * 0.44, h * 0.3], [w * 0.8, h * 0.3], [w * 0.8, 0]]).poly([[w * 0.44, h * 0.7], [w * 0.8, h * 0.7], [w * 0.8, h]]), 'none'),
              part(arrowHead(w * 0.5, h * 0.7, w * 0.7, h * 0.7, w * 0.16, h * 0.05), 'ink')];
    } },
  pmos: { cat: 'passive', size: [44, 56], label: 'right', pins: [[0, 0.5, 'G', 'in'], [0.8, 0, 'S', 'io'], [0.8, 1, 'D', 'io']],
    draw: function (w, h) {
      var r = w * 0.06;
      return [part(np().line(0, h / 2, w * 0.32 - 2 * r, h / 2).line(w * 0.32, h * 0.28, w * 0.32, h * 0.72).line(w * 0.44, h * 0.2, w * 0.44, h * 0.8)
                .poly([[w * 0.44, h * 0.3], [w * 0.8, h * 0.3], [w * 0.8, 0]]).poly([[w * 0.44, h * 0.7], [w * 0.8, h * 0.7], [w * 0.8, h]]), 'none'),
              part(np().circle(w * 0.32 - r, h / 2, r), 'fill'),
              part(arrowHead(w * 0.74, h * 0.3, w * 0.5, h * 0.3, w * 0.16, h * 0.05), 'ink')];
    } },
  npn: { cat: 'passive', size: [48, 52], label: 'right', perimeter: 'ellipse', pins: [[0, 0.5, 'B', 'in'], [0.72, 0, 'C', 'io'], [0.72, 1, 'E', 'io']],
    draw: function (w, h) {
      var cx = w * 0.55, cy = h / 2, r = Math.min(w * 0.44, h * 0.44);
      return [part(np().circle(cx, cy, r), 'fill'),
              part(np().line(0, cy, w * 0.38, cy).line(w * 0.38, h * 0.28, w * 0.38, h * 0.72).poly([[w * 0.38, h * 0.4], [w * 0.72, h * 0.14], [w * 0.72, 0]]).poly([[w * 0.38, h * 0.6], [w * 0.72, h * 0.86], [w * 0.72, h]]), 'none'),
              part(arrowHead(w * 0.44, h * 0.645, w * 0.68, h * 0.83, Math.min(w, h) * 0.16, Math.min(w, h) * 0.07), 'ink')];
    } },
  pnp: { cat: 'passive', size: [48, 52], label: 'right', perimeter: 'ellipse', pins: [[0, 0.5, 'B', 'in'], [0.72, 0, 'C', 'io'], [0.72, 1, 'E', 'io']],
    draw: function (w, h) {
      var cx = w * 0.55, cy = h / 2, r = Math.min(w * 0.44, h * 0.44);
      return [part(np().circle(cx, cy, r), 'fill'),
              part(np().line(0, cy, w * 0.38, cy).line(w * 0.38, h * 0.28, w * 0.38, h * 0.72).poly([[w * 0.38, h * 0.4], [w * 0.72, h * 0.14], [w * 0.72, 0]]).poly([[w * 0.38, h * 0.6], [w * 0.72, h * 0.86], [w * 0.72, h]]), 'none'),
              part(arrowHead(w * 0.68, h * 0.83, w * 0.42, h * 0.63, Math.min(w, h) * 0.16, Math.min(w, h) * 0.07), 'ink')];
    } },
  switch: { cat: 'passive', size: [52, 24], label: 'top', pins: [[0, 0.72, '1', 'io'], [1, 0.72, '2', 'io']],
    draw: function (w, h) {
      var y = h * 0.72, r = Math.min(3, h * 0.12);
      return [part(np().line(0, y, w * 0.26 - r, y).line(w * 0.74 + r, y, w, y).line(w * 0.26 + r * 0.7, y - r * 0.7, w * 0.72, h * 0.08), 'none'),
              part(np().circle(w * 0.26, y, r).circle(w * 0.74, y, r), 'fill')];
    } },

  /* ---- software and IT ---- */
  server: { cat: 'software', size: [48, 64], label: 'bottom',
    draw: function (w, h) {
      var p = np(), q = np(), led = Math.max(1.8, Math.min(w, h) * 0.05);
      [1, 2].forEach(function (i) { p.line(0, h * i / 3, w, h * i / 3); });
      [1, 3, 5].forEach(function (i) { p.line(w * 0.14, h * i / 6, w * 0.52, h * i / 6); q.circle(w * 0.78, h * i / 6, led); });
      return [part(np().rrect(0, 0, w, h, 4), 'fill'), part(p, 'none'), part(q, 'ink')];
    } },
  database: { cat: 'software', size: [88, 80], label: 'center', boxy: true,
    labelBox: function (w, h) { var e = Math.min(12, h * 0.15); return { x: 0, y: e * 2.75 + 1, w: w, h: Math.max(10, h - e * 3.75 - 1) }; },
    draw: function (w, h) {
      var e = Math.min(12, h * 0.15);
      return [part(np().M(0, e).A(w / 2, e, 0, 0, 1, w, e).L(w, h - e).A(w / 2, e, 0, 0, 1, 0, h - e).Z(), 'fill'),
              part(np().M(0, e).A(w / 2, e, 0, 0, 0, w, e).M(0, e * 1.75).A(w / 2, e, 0, 0, 0, w, e * 1.75), 'none')];
    } },
  queue: { cat: 'software', size: [110, 44], label: 'center', boxy: true, labelBox: function (w, h) { var e = Math.min(w * 0.12, h * 0.3); return { x: e, y: 0, w: w - e * 3, h: h }; },
    draw: function (w, h) {
      var e = Math.min(w * 0.12, h * 0.3);
      return [part(np().M(e, 0).L(w - e, 0).A(e, h / 2, 0, 0, 1, w - e, h).L(e, h).A(e, h / 2, 0, 0, 1, e, 0).Z(), 'fill'), part(np().M(w - e, 0).A(e, h / 2, 0, 0, 0, w - e, h), 'none')];
    } },
  user: { cat: 'software', size: [40, 44], label: 'bottom',
    draw: function (w, h) {
      var r = Math.min(w * 0.24, h * 0.2);
      return [part(np().circle(w / 2, r + 1, r), 'fill'),
              part(np().M(w * 0.08, h).L(w * 0.08, h * 0.78).Q(w * 0.08, h * 0.52, w / 2, h * 0.52).Q(w * 0.92, h * 0.52, w * 0.92, h * 0.78).L(w * 0.92, h).Z(), 'fill')];
    } },
  browser: { cat: 'software', size: [120, 80], label: 'center', boxy: true, labelBox: function (w, h) { var b = Math.min(16, h * 0.24); return { x: 0, y: b, w: w, h: h - b }; },
    draw: function (w, h) {
      var b = Math.min(16, h * 0.24), r = Math.min(2.6, b * 0.18);
      return [part(np().rrect(0, 0, w, h, 4), 'fill'), part(np().line(0, b, w, b), 'none'), part(np().circle(b * 0.5, b / 2, r).circle(b * 0.5 + r * 3.2, b / 2, r).circle(b * 0.5 + r * 6.4, b / 2, r), 'ink')];
    } },
  mobile: { cat: 'software', size: [36, 60], label: 'bottom',
    draw: function (w, h) { return [part(np().rrect(0, 0, w, h, w * 0.18), 'fill'), part(np().rrect(w * 0.12, h * 0.1, w * 0.76, h * 0.72, 2), 'none'), part(np().circle(w / 2, h * 0.91, Math.min(w, h) * 0.05), 'none')]; } },
  desktop: { cat: 'software', size: [64, 56], label: 'bottom',
    draw: function (w, h) {
      return [part(np().rrect(0, 0, w, h * 0.72, 3), 'fill'), part(np().poly([[w * 0.42, h * 0.72], [w * 0.38, h * 0.93], [w * 0.62, h * 0.93], [w * 0.58, h * 0.72]], true), 'fill'),
              part(np().line(w * 0.26, h * 0.96, w * 0.74, h * 0.96), 'none')];
    } },
  api: { cat: 'software', size: [110, 48], label: 'center', boxy: true, labelBox: function (w, h) { return { x: Math.min(40, w * 0.3), y: 0, w: w - Math.min(40, w * 0.3), h: h }; },
    draw: function (w, h) { var g = Math.min(40, w * 0.3); return [part(np().rrect(0, 0, w, h, 6), 'fill'), part(np().line(g, h * 0.18, g, h * 0.82), 'none'), tpart('</>', g / 2, h / 2 + 4, 11.5, 'middle', 700)]; } },
  lock: { cat: 'software', size: [36, 44], label: 'bottom',
    draw: function (w, h) {
      return [part(np().M(w * 0.26, h * 0.44).L(w * 0.26, h * 0.3).A(w * 0.24, w * 0.24, 0, 0, 1, w * 0.74, h * 0.3).L(w * 0.74, h * 0.44), 'none', { weight: 1.3 }),
              part(np().rrect(w * 0.08, h * 0.42, w * 0.84, h * 0.58, 3), 'fill'), part(np().circle(w / 2, h * 0.66, Math.min(w, h) * 0.07), 'ink'), part(np().line(w / 2, h * 0.68, w / 2, h * 0.84), 'none')];
    } },
  file: { cat: 'software', size: [40, 52], label: 'bottom',
    draw: function (w, h) {
      var c = w * 0.3, p = np();
      [0.46, 0.62, 0.78].forEach(function (f) { p.line(w * 0.18, h * f, w * 0.82, h * f); });
      return [part(np().poly([[0, 0], [w - c, 0], [w, c], [w, h], [0, h]], true), 'fill'), part(np().poly([[w - c, 0], [w - c, c], [w, c]]), 'none'), part(p, 'none')];
    } },
  folder: { cat: 'software', size: [52, 40], label: 'bottom',
    draw: function (w, h) { return [part(np().poly([[0, 0], [w * 0.38, 0], [w * 0.46, h * 0.18], [w, h * 0.18], [w, h], [0, h]], true), 'fill'), part(np().line(0, h * 0.3, w, h * 0.3), 'none')]; } },
  gear: { cat: 'software', size: [44, 44], label: 'bottom', perimeter: 'ellipse',
    draw: function (w, h) {
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2, r0 = R * 0.74, pts = [];
      for (var k = 0; k < 8; k++) {
        [[-15, r0], [-8, R], [8, R], [15, r0]].forEach(function (a) {
          var ang = (k * 45 + a[0]) * Math.PI / 180;
          pts.push([cx + Math.cos(ang) * a[1], cy + Math.sin(ang) * a[1]]);
        });
      }
      return [part(np().poly(pts, true), 'fill'), part(np().circle(cx, cy, R * 0.28), 'none')];
    } },
  message: { cat: 'software', size: [52, 36], label: 'bottom',
    draw: function (w, h) { return [part(np().rect(0, 0, w, h), 'fill'), part(np().poly([[0, 0], [w / 2, h * 0.56], [w, 0]]), 'none')]; } },
  firewall: { cat: 'software', size: [52, 40], label: 'bottom',
    draw: function (w, h) {
      var p = np().line(0, h / 3, w, h / 3).line(0, 2 * h / 3, w, 2 * h / 3);
      [1 / 3, 2 / 3].forEach(function (f) { p.line(w * f, 0, w * f, h / 3).line(w * f, 2 * h / 3, w * f, h); });
      [1 / 6, 1 / 2, 5 / 6].forEach(function (f) { p.line(w * f, h / 3, w * f, 2 * h / 3); });
      return [part(np().rect(0, 0, w, h), 'fill'), part(p, 'none')];
    } },

  /* ---- a Lucide icon chosen with the node's "icon" field ---- */
  icon: { cat: 'icons', size: [44, 44], label: 'bottom',
    draw: function (w, h, o) { var s = Math.min(w, h); return [part(iconPath(o.icon, (w - s) / 2, (h - s) / 2, s), 'none', { round: true })]; } },

  /* ---- draw.io built-ins kept only so imported files look exactly as they do in draw.io ---- */
  'dio-or': { cat: 'drawio', size: [60, 80], label: 'center', native: 'dio-or',
    draw: function (w, h) { return [part(np().M(0, 0).Q(w, 0, w, h / 2).Q(w, h, 0, h).Z(), 'fill')]; } },
  'dio-xor': { cat: 'drawio', size: [60, 80], label: 'center', native: 'dio-xor',
    draw: function (w, h) { return [part(np().M(0, 0).Q(w, 0, w, h / 2).Q(w, h, 0, h).Q(w / 2, h / 2, 0, 0).Z(), 'fill')]; } }
};

/* Glyph-like symbols keep their proportions when resized; box-like ones may stretch. */
var FIXED_ASPECT = ['circle', 'actor', 'and', 'nand', 'or', 'nor', 'xor', 'xnor', 'not', 'buffer', 'tristate', 'adder', 'multiplier', 'dff', 'dffr', 'latch', 'sync',
  'clockgate', 'oscillator', 'clock', 'crystal', 'opamp', 'comparator', 'amp', 'pad', 'power', 'ground', 'antenna', 'battery', 'vsource', 'isource',
  'resistor', 'resistor-box', 'capacitor', 'inductor', 'diode', 'led', 'nmos', 'pmos', 'npn', 'pnp', 'switch', 'server', 'user', 'mobile', 'desktop',
  'lock', 'file', 'folder', 'gear', 'message', 'firewall', 'icon'];
FIXED_ASPECT.forEach(function (k) { if (SYMBOLS[k]) SYMBOLS[k].aspect = 'fixed'; });

var SYMBOL_ALIAS = {
  rect: 'box', rectangle: 'box', square: 'box', process: 'box', block: 'box', rhombus: 'diamond',
  oval: 'ellipse', cylinder3: 'cylinder', db: 'database', datastore: 'database', person: 'user', people: 'user',
  io: 'parallelogram', input: 'parallelogram', output: 'parallelogram', data: 'parallelogram',
  start: 'terminator', end: 'terminator', stop: 'terminator', pill: 'terminator', predefined: 'subroutine',
  inverter: 'not', inv: 'not', buf: 'buffer', tribuf: 'tristate', flipflop: 'dff', ff: 'dff', flop: 'dff', 'd-ff': 'dff', ffr: 'dffr', 'dff-r': 'dffr', dffrn: 'dffr',
  reg: 'register', mem: 'ram', memory: 'ram', sram: 'ram', regfile: 'ram', xtal: 'crystal', osc: 'oscillator', vco: 'oscillator',
  vdd: 'power', vcc: 'power', supply: 'power', gnd: 'ground', vss: 'ground', nfet: 'nmos', pfet: 'pmos',
  icg: 'clockgate', 'clock-gate': 'clockgate', synchronizer: 'sync', cdc: 'sync', sum: 'adder', summer: 'adder', mixer: 'multiplier',
  amplifier: 'amp', comp: 'comparator', chip: 'ic', phone: 'mobile', computer: 'desktop', pc: 'desktop', laptop: 'desktop',
  web: 'browser', mail: 'message', email: 'message', envelope: 'message', settings: 'gear', service: 'gear',
  security: 'lock', doc: 'document', page: 'file', directory: 'folder', bracket: 'brace', 'curly-bracket': 'brace', label: 'text',
  bondpad: 'pad', 'io-pad': 'pad', port: 'port-io', inport: 'port-in', outport: 'port-out', ioport: 'port-io'
};

var SYMBOL_CATS = ['basic', 'logic', 'digital', 'analog', 'passive', 'software'];
var SYMBOL_CAT_NAMES = {
  en: { basic: 'Basic shapes and flowchart', logic: 'Logic gates', digital: 'Digital blocks', analog: 'Analog and mixed-signal', passive: 'Passives and transistors', software: 'Software and IT', drawio: 'draw.io built-ins' },
  vi: { basic: 'Hình cơ bản và lưu đồ', logic: 'Cổng logic', digital: 'Khối số', analog: 'Tương tự và tín hiệu hỗn hợp', passive: 'Linh kiện thụ động và transistor', software: 'Phần mềm và CNTT', drawio: 'Hình có sẵn của draw.io' }
};

function symbolName(v) {
  var s = String(v === undefined || v === null ? '' : v).trim().toLowerCase();
  if (SYMBOLS[s]) return s;
  if (/^mxgraph\./.test(s) && typeof stencilKnown === 'function' && stencilKnown(s)) return s;
  return SYMBOL_ALIAS[s] || null;
}

/* Pins are [x, y, name, dir]: x and y are fractions of the box; dir is 'in', 'out', 'io' (no direction, such as
   the two ends of a resistor) or 'clk' (an input the block cannot work without: a clock or a latch enable). */
function pinList(def) {
  return (def && def.pins ? def.pins : []).map(function (p, i) {
    return { x: +p[0] || 0, y: +p[1] || 0, name: p[2] ? String(p[2]) : 'p' + (i + 1), dir: p[3] || 'io', index: i };
  });
}
function pinIsInput(p) { return !!p && (p.dir === 'in' || p.dir === 'clk'); }

/* Paint box for draw.io's "direction": north and south swap width and height inside the same bounds. */
function dirAngle(dir) { return dir === 'south' ? 90 : dir === 'west' ? 180 : dir === 'north' ? 270 : 0; }

/* Returns the SVG elements of a symbol drawn in the box (0, 0, w, h) with the given colors. */
function symbolElements(name, w, h, c) {
  var def = SYMBOLS[name];
  if (!def) return typeof stencilElements === 'function' ? stencilElements(name, w, h, c) : [];
  var o = c.opts || {};
  var dir = dirAngle(o.direction), pw = w, ph = h;
  if (dir === 90 || dir === 270) { pw = h; ph = w; }
  var parts = def.draw(pw, ph, o);
  var els = [];
  var sw = c.strokeWidth;
  parts.forEach(function (pt) {
    if (pt.text !== undefined) {
      els.push(S('text', { x: symNum(pt.x), y: symNum(pt.y), 'font-size': pt.size, 'font-weight': pt.weight, 'text-anchor': pt.anchor, fill: c.stroke === 'none' ? c.text : c.stroke, 'font-family': c.font, text: pt.text }));
      return;
    }
    var fill = pt.fill === 'fill' ? c.fill : pt.fill === 'ink' ? (c.stroke === 'none' ? c.text : c.stroke) : 'none';
    els.push(S('path', {
      d: pthD(pt.p.c), fill: fill, stroke: pt.round && c.stroke === 'none' ? c.text : c.stroke, 'stroke-width': sw * (pt.weight || 1),
      'stroke-dasharray': pt.dash ? '4 3' : (c.dash || null), 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
      'fill-opacity': c.fillOpacity, 'stroke-opacity': c.strokeOpacity
    }));
  });
  /* SVG applies the rightmost transform first: centre the paint box, flip it, then turn it (as draw.io does) */
  var tr = [], cx = w / 2, cy = h / 2;
  if (dir) tr.push('rotate(' + dir + ' ' + symNum(cx) + ' ' + symNum(cy) + ')');
  if (o.flipH || o.flipV) tr.push('translate(' + symNum(cx) + ' ' + symNum(cy) + ') scale(' + (o.flipH ? -1 : 1) + ' ' + (o.flipV ? -1 : 1) + ') translate(' + symNum(-cx) + ' ' + symNum(-cy) + ')');
  if (pw !== w) tr.push('translate(' + symNum((w - pw) / 2) + ' ' + symNum((h - ph) / 2) + ')');
  return tr.length ? [S('g', { transform: tr.join(' ') }, els)] : els;
}

/* Outline polygon (for perimeter math) in the unrotated node box, honouring draw.io's direction. */
function symbolOutline(name, w, h, o) {
  var def = SYMBOLS[name];
  if (!def || !def.outline) return null;
  var dir = dirAngle(o && o.direction), pw = w, ph = h;
  if (dir === 90 || dir === 270) { pw = h; ph = w; }
  var pts = def.outline(pw, ph, o || {});
  if (!dir) return pts;
  var cx = w / 2, cy = h / 2, a = dir * Math.PI / 180, cos = Math.round(Math.cos(a)), sin = Math.round(Math.sin(a));
  return pts.map(function (p) {
    var x = p[0] + (w - pw) / 2 - cx, y = p[1] + (h - ph) / 2 - cy;
    return [cx + x * cos - y * sin, cy + x * sin + y * cos];
  });
}

/* ---------- draw.io stencils: our symbols stay vector shapes whose colors can be changed in draw.io ---------- */
function stencilXml(name, w, h, o, inkColor) {
  var def = SYMBOLS[name];
  var parts = def.draw(w, h, o || {});
  var n = function (v) { return symNum(v); };
  function pathXml(c) {
    return '<path>' + c.map(function (s) {
      if (s[0] === 'M') return '<move x="' + n(s[1]) + '" y="' + n(s[2]) + '"/>';
      if (s[0] === 'L') return '<line x="' + n(s[1]) + '" y="' + n(s[2]) + '"/>';
      if (s[0] === 'Q') return '<quad x1="' + n(s[1]) + '" y1="' + n(s[2]) + '" x2="' + n(s[3]) + '" y2="' + n(s[4]) + '"/>';
      if (s[0] === 'C') return '<curve x1="' + n(s[1]) + '" y1="' + n(s[2]) + '" x2="' + n(s[3]) + '" y2="' + n(s[4]) + '" x3="' + n(s[5]) + '" y3="' + n(s[6]) + '"/>';
      if (s[0] === 'A') return '<arc rx="' + n(s[1]) + '" ry="' + n(s[2]) + '" x-axis-rotation="' + n(s[3]) + '" large-arc-flag="' + s[4] + '" sweep-flag="' + s[5] + '" x="' + n(s[6]) + '" y="' + n(s[7]) + '"/>';
      return '<close/>';
    }).join('') + '</path>';
  }
  var shapes = parts.filter(function (p) { return p.p; });
  var bg = shapes.filter(function (p) { return p.fill === 'fill'; })[0] || shapes[0];
  var out = ['<shape name="' + name + '" w="' + n(w) + '" h="' + n(h) + '" aspect="variable" strokewidth="inherit">'];
  if (def.pins) {
    out.push('<connections>' + def.pins.map(function (p, i) { return '<constraint x="' + p[0] + '" y="' + p[1] + '" perimeter="0" name="' + xmlEsc(p[2] || 'p' + (i + 1)) + '"/>'; }).join('') + '</connections>');
  }
  out.push('<background>' + (bg ? pathXml(bg.p.c) : '') + '</background><foreground>');
  if (bg) out.push(bg.fill === 'none' ? '<stroke/>' : '<fillstroke/>');
  parts.forEach(function (p) {
    if (p === bg) return;
    if (p.text !== undefined) {
      out.push('<fontsize size="' + p.size + '"/><text str="' + xmlEsc(p.text) + '" x="' + n(p.x) + '" y="' + n(p.y - p.size * 0.35) + '" align="' + (p.anchor === 'start' ? 'left' : p.anchor === 'end' ? 'right' : 'center') + '" valign="middle"/>');
      return;
    }
    if (p.dash) out.push('<dashed dashed="1"/>');
    if (p.fill === 'ink') out.push('<save/><fillcolor color="stroke"/>' + pathXml(p.p.c) + '<fillstroke/><restore/>');
    else out.push(pathXml(p.p.c) + (p.fill === 'fill' ? '<fillstroke/>' : '<stroke/>'));
    if (p.dash) out.push('<dashed dashed="0"/>');
  });
  out.push('</foreground></shape>');
  return out.join('');
}

/* draw.io keeps custom stencils as base64(deflate-raw(encodeURIComponent(xml))). CompressionStream is
   asynchronous, so the stencil strings are prepared before the draw.io file is written. */
function deflateRawB64(text) {
  if (typeof CompressionStream === 'undefined') return Promise.resolve(null);
  var stream = new Blob([new TextEncoder().encode(encodeURIComponent(text))]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Response(stream).arrayBuffer().then(function (buf) {
    var bytes = new Uint8Array(buf), bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  });
}
function inflateRawB64(b64) {
  var bin = atob(b64.replace(/\s+/g, '')), bytes = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text().then(function (text) {
    try { return decodeURIComponent(text); } catch (e) { return text; }
  });
}
