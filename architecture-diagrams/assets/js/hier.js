/* Detail boards, detail tabs and sticky notes.
   A detail board is a hand-placed tab built from an overview tab: every block of the overview becomes a frame
   (a group with `source`) with its ports on the border, and every connection becomes a wire between two ports.
   Engineers draw inside the frames by hand or with AI. The inside of one block can move to a tab of its own
   (`detailOf`); the frame keeps its ports and points to that tab (`detail`). hierSync keeps the levels in step:
   a new block or connection in the overview gets its frame, ports and wire on the board, and ports added on either
   side of a frame and its own tab appear on the other side. Nothing an engineer drew is ever removed by it. */

var HT = {
  en: {
    boardTitle: 'Detail: {x}', boardSum: 'Every block of **{x}** is a frame here, with its ports on the border. Draw the inside of each block in its frame, by hand or with AI.',
    insideSum: 'The inside of **{x}**. The ports on the border are the ports of the block and follow it.', build: 'Detail board', buildTitle: 'Build a hand-placed tab where every block of this tab is a frame with its ports, then draw the inside of each block there',
    openBoard: 'Open the detail board', inside: 'Inside in its own tab', insideTitle: 'Move what is inside this block to a tab of its own; the block keeps its ports and links to that tab',
    openInside: 'Open the inside', lBoard: 'Detail board built', lInside: 'Inside of {x} in its own tab', lSync: 'Follows the overview',
    iGoneBlock: 'Frame {x} stands for block {y}, which is no longer in {z}.', iGoneWire: 'Wire {x} is no longer in {y}.',
    iPortFree: 'Port {x} of {y} is not wired inside yet.', iNoBoard: 'Tab {x}, which this detail board comes from, is missing.',
    iNoDetail: 'Block {x} links to tab {y}, which is missing.', iPortMismatch: 'Port {x} is on {y} but not in tab {z}.',
    noteAdd: 'Note', noteAddTitle: 'Add a sticky note to what is selected (key N)', noteNew: 'New note',
    notes: 'Notes', noteText: 'Text', noteKind: 'Kind', noteAttach: 'About', noteDate: 'Date', noteBy: 'By', noteWhen: 'Date and author',
    tidy: 'Tidy inside', tidyTitle: 'Lay out the blocks inside this frame, signals left to right, and fit the frame to them', lTidy: 'Tidy inside {x}',
    eTidyNone: 'no frame {x}', eTidyBox: 'frame {x} has no fixed place and size (x, y, w, h) to lay out in',
    eArrangeNoBus: 'there is no bus or crossbar to arrange around (a block wired to several others with bus wires, or named bus, crossbar, interconnect)',
    eArrangeBoard: 'arrange works on an overview; a detail board keeps the overview\'s arrangement', eArrangeStyle: 'unknown arrangement {x} (known: bus, stages)',
    iNoteGone: 'The note {x} is attached to {y}, which is no longer in this tab', fNoteTo: 'Attach the note to {x}', fNoteFree: 'Leave the note free on the drawing',
    nsArrange: 'Arrange it as a chip: buses as bars, groups in rows', nsArrangeStages: 'Arrange it as a pipeline: each group a stage, left to right', eArrangeStages: 'a pipeline arrangement needs at least two groups (the stages) with blocks in them', noteFree: '(free on the drawing)',
    noteDel: 'Delete this note', noteIdeas: 'Notes to add', noteIdeasTitle: 'Notes written from this diagram: click one to add it, then edit the text',
    lNoteAdd: 'Note added', lNoteEdit: 'Note edited', lNoteDel: 'Note deleted', lNoteMove: 'Note moved',
    ideaCdc: 'Signal {x} crosses from the {y} clock domain into {z}: it needs a synchronizer (2 flip-flops for one bit, an asynchronous FIFO for data).',
    ideaRst: 'Reset {x} into {y}: release it in step with the clock of {y} (reset synchronizer).',
    ideaIcg: 'Clock gate {x}: use the ICG cell of the technology library; EN may change only while the clock is low.',
    ideaFreePin: 'Pin {x} of {y} is not wired: tie it on purpose (0 or 1) or is a wire missing?',
    ideaEmpty: 'Inside of {x} not drawn yet. Ports: {y}.', ideaPorts_in: 'in {x}', ideaPorts_out: 'out {x}', ideaPorts_inout: 'both ways {x}',
    ideaChangeHint: 'Write down what changed on {x}…', ideaWhyHint: 'Write down why {x} is there…',
    ideaPortsFree: 'Ports of {x} not wired inside yet: {y}.',
    ideaHub: '{x} connects to {y} blocks: which one wins when several access it at once?',
    ideaMem: '{x}: write down its size, data width and read latency in clock cycles.',
    ideaBus: 'Bus {x}: list the address range of every device on it; an access to a device that is off must return an error, never hang.',
    ideaDb: '{x}: how is it backed up and restored?', ideaQueue: 'Whoever reads from {x} must cope with the same message twice.',
    ideaExt: 'Calls to {x} need a timeout and a retry.', ideaDecision: 'Decision {x}: write down what happens on each branch.',
    ideaChange: 'Change {x}: ', ideaLegend: 'Colours: {x}', ideaWhy: 'Why {x}: ', ideaNone: 'none',
    iName: 'Port {x}: {y}; suggested name {z}.', iNameCard: 'Port names of {x} do not follow the naming style: {y}.', fixName: 'Rename to {x}', fixNames: 'Rename them',
    nm_case: 'use lower case', nm_chars: 'use only letters, digits and _', nm_dir: 'start with i_, o_ or io_ for its direction', nm_low: 'active-low signals end in _n',
    naming: 'Port names', namingTitle: 'How the tool names ports and which names the checks flag', nPrefix: 'i_ / o_ / io_ in front (i_clk_sys)', nSuffix: '_i / _o / _io at the end (clk_sys_i)', nOff: 'Do not check names',
    colorNames: { blue: 'blue', teal: 'teal', green: 'green', amber: 'amber', red: 'red', violet: 'violet', slate: 'grey' }
  },
  vi: {
    boardTitle: 'Chi tiết: {x}', boardSum: 'Mỗi khối của **{x}** là một khung ở đây, cổng nằm trên viền khung. Vẽ phần bên trong từng khối trong khung của nó, bằng tay hoặc nhờ AI.',
    insideSum: 'Phần bên trong của **{x}**. Cổng trên viền là cổng của khối đó và luôn khớp với nó.', build: 'Bảng chi tiết', buildTitle: 'Dựng một tab đặt tay, trong đó mỗi khối của tab này là một khung có sẵn các cổng; kỹ sư vẽ phần bên trong từng khối ở đó',
    openBoard: 'Mở bảng chi tiết', inside: 'Tab riêng cho bên trong', insideTitle: 'Chuyển phần bên trong khối này sang một tab riêng; khối giữ nguyên cổng và có nút mở tab đó',
    openInside: 'Mở phần bên trong', lBoard: 'Dựng bảng chi tiết', lInside: 'Chuyển bên trong {x} sang tab riêng', lSync: 'Cập nhật theo tab tổng quan',
    iGoneBlock: 'Khung {x} ứng với khối {y}, nhưng khối này không còn ở tab {z}.', iGoneWire: 'Dây {x} không còn ở tab {y}.',
    iPortFree: 'Cổng {x} của {y} chưa nối vào bên trong.', iNoBoard: 'Không thấy tab {x}, là tab tổng quan của bảng chi tiết này.',
    iNoDetail: 'Khối {x} trỏ tới tab {y}, nhưng không thấy tab đó.', iPortMismatch: 'Cổng {x} có trên {y} nhưng chưa có trong tab {z}.',
    noteAdd: 'Ghi chú', noteAddTitle: 'Thêm ghi chú dán cho phần đang chọn (phím N)', noteNew: 'Ghi chú mới',
    notes: 'Ghi chú', noteText: 'Nội dung', noteKind: 'Loại', noteAttach: 'Gắn với', noteDate: 'Ngày', noteBy: 'Người ghi', noteWhen: 'Ngày và người ghi',
    tidy: 'Sắp lại bên trong', tidyTitle: 'Xếp lại các khối trong khung, tín hiệu đi từ trái sang phải, và nới khung cho vừa', lTidy: 'Sắp lại bên trong {x}',
    eTidyNone: 'không có khung {x}', eTidyBox: 'khung {x} chưa có vị trí và kích thước cố định (x, y, w, h) để xếp',
    eArrangeNoBus: 'không có bus hay crossbar nào làm trục để xếp (khối nối bus tới nhiều khối khác, hoặc tên có bus, crossbar, interconnect)',
    eArrangeBoard: 'thao tác xếp dùng cho sơ đồ tổng quan; bảng chi tiết giữ bố cục của tổng quan', eArrangeStyle: 'không có kiểu xếp {x} (có: bus, stages)',
    iNoteGone: 'Ghi chú {x} gắn vào {y}, thứ này không còn trong tab', fNoteTo: 'Gắn ghi chú vào {x}', fNoteFree: 'Để ghi chú đứng tự do trên hình',
    nsArrange: 'Xếp kiểu sơ đồ chip: bus thành thanh ngang, khối theo nhóm thành hàng', nsArrangeStages: 'Xếp kiểu pipeline: mỗi nhóm một tầng, tín hiệu đi từ trái sang phải', eArrangeStages: 'xếp kiểu pipeline cần ít nhất hai nhóm (các tầng) có khối bên trong', noteFree: '(đặt tự do trên hình)',
    noteDel: 'Xoá ghi chú này', noteIdeas: 'Ghi chú nên thêm', noteIdeasTitle: 'Ghi chú soạn sẵn từ chính sơ đồ: bấm để thêm, rồi sửa lại chữ',
    lNoteAdd: 'Thêm ghi chú', lNoteEdit: 'Sửa ghi chú', lNoteDel: 'Xoá ghi chú', lNoteMove: 'Dời ghi chú',
    ideaCdc: 'Tín hiệu {x} đi từ miền clock {y} sang miền {z}: cần mạch đồng bộ (2 flip-flop cho tín hiệu 1 bit, FIFO bất đồng bộ cho dữ liệu nhiều bit).',
    ideaRst: 'Reset {x} vào {y}: nên nhả reset đồng bộ theo clock của {y} (bộ đồng bộ reset).',
    ideaIcg: 'Cổng clock {x}: dùng cell ICG trong thư viện công nghệ; tín hiệu EN chỉ đổi khi clock đang ở mức thấp.',
    ideaFreePin: 'Chân {x} của {y} chưa nối: cố ý buộc về 0 hoặc 1, hay còn thiếu dây?',
    ideaEmpty: 'Chưa vẽ bên trong {x}. Cổng: {y}.', ideaPorts_in: 'vào {x}', ideaPorts_out: 'ra {x}', ideaPorts_inout: 'hai chiều {x}',
    ideaChangeHint: 'Ghi lại thay đổi ngày {x}…', ideaWhyHint: 'Ghi lý do có {x}…',
    ideaPortsFree: 'Cổng của {x} chưa nối vào bên trong: {y}.',
    ideaHub: '{x} nối với {y} khối: khi nhiều khối cùng truy cập thì khối nào được ưu tiên?',
    ideaMem: '{x}: ghi rõ dung lượng, độ rộng dữ liệu và số chu kỳ clock khi đọc.',
    ideaBus: 'Bus {x}: liệt kê vùng địa chỉ của từng thiết bị; truy cập vào thiết bị đang tắt phải trả lỗi, không được treo bus.',
    ideaDb: '{x}: sao lưu và khôi phục thế nào?', ideaQueue: 'Bên đọc từ {x} phải xử lý được khi một tin đến hai lần.',
    ideaExt: 'Gọi {x} cần có thời gian chờ tối đa và thử lại.', ideaDecision: 'Nút rẽ nhánh {x}: ghi rõ mỗi nhánh dẫn tới việc gì.',
    ideaChange: 'Thay đổi {x}: ', ideaLegend: 'Chú giải màu: {x}', ideaWhy: 'Vì sao {x}: ', ideaNone: 'không có',
    iName: 'Cổng {x}: {y}; tên nên dùng {z}.', iNameCard: 'Tên cổng của {x} chưa theo quy ước đặt tên: {y}.', fixName: 'Đổi thành {x}', fixNames: 'Đổi tên cho đúng',
    nm_case: 'viết thường', nm_chars: 'chỉ dùng chữ, số và dấu _', nm_dir: 'mở đầu bằng i_, o_ hoặc io_ theo chiều cổng', nm_low: 'tín hiệu tích cực mức thấp kết thúc bằng _n',
    naming: 'Tên cổng', namingTitle: 'Cách tool đặt tên cổng và những tên bị báo trong danh sách kiểm tra', nPrefix: 'i_ / o_ / io_ ở đầu (i_clk_sys)', nSuffix: '_i / _o / _io ở cuối (clk_sys_i)', nOff: 'Không kiểm tra tên',
    colorNames: { blue: 'xanh dương', teal: 'xanh ngọc', green: 'xanh lá', amber: 'vàng cam', red: 'đỏ', violet: 'tím', slate: 'xám' }
  }
};
function ht(k) { var tbl = HT[lang] || HT.en; return tbl[k] !== undefined ? tbl[k] : HT.en[k]; }
function hl(k, x, y, z) {
  var v = function (q) { return q === undefined || q === null ? '' : String(q); };
  return ht(k).replace('{x}', v(x)).replace('{y}', v(y)).replace('{z}', v(z));
}
function hq(s) { return '«' + s + '»'; }

/* ---------- reading raw tabs ---------- */
var HB = { portW: 110, portH: 26, portGap: 36, frameMinW: 380, frameMinH: 240, top: 56, bottom: 26, gap: 96, left: 180, topMargin: 90 };
function hierTabId(d, i) { return str(d && d.id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (i + 1)); }
function hierFind(raw, id) {
  var list = raw && Array.isArray(raw.diagrams) ? raw.diagrams : [];
  for (var i = 0; i < list.length; i++) if (hierTabId(list[i], i) === id) return { d: list[i], i: i };
  return null;
}
/* A tab linked to others needs an id of its own: make one from its title when it has none. */
function hierEnsureId(raw, i) {
  var d = raw.diagrams[i];
  if (str(d.id)) return str(d.id);
  var base = str(asText(d.title)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tab';
  d.id = hierUniqueTab(raw, base);
  return d.id;
}
function hierUniqueTab(raw, base) {
  var used = {};
  raw.diagrams.forEach(function (x, i) { used[hierTabId(x, i)] = true; });
  var id = base.replace(/[^A-Za-z0-9_.-]/g, '-') || 'tab', k = 2;
  while (used[id]) id = base + '-' + (k++);
  return id;
}
function hierTitle(n) { return n ? (str(asText(n.title)).split('\n')[0] || str(n.id)) : ''; }
function hierIsGraph(d) { return !!d && edTypeOf(d) === 'graph'; }
function hierPorts(d, of) {
  return (Array.isArray(d.nodes) ? d.nodes : []).filter(function (n) { return n && n.port && typeof n.port === 'object' && (of === undefined ? true : of === null ? !str(n.port.of) : str(n.port.of) === of); });
}
/* The connections of an overview between two blocks, with the key a board wire keeps in `source`. */
/* The two block ids in a wire key "from>to" or "from>to:label" (ids may hold ':'; the longest known id wins). */
function hierKeyEnds(key, nodes) {
  var gt = key.indexOf('>');
  if (gt < 0) return null;
  var a = key.slice(0, gt), rest = key.slice(gt + 1), b = nodes[rest] ? rest : null;
  if (!b) Object.keys(nodes).forEach(function (id) { if (rest.indexOf(id + ':') === 0 && (!b || id.length > b.length)) b = id; });
  if (!b) { var c = rest.indexOf(':'); b = c < 0 ? rest : rest.slice(0, c); }
  return [a, b];
}
function hierEdges(d) {
  var nodes = asNodes(d), out = [];
  (Array.isArray(d.edges) ? d.edges : []).forEach(function (e) {
    if (!e) return;
    var a = str(e.from), b = str(e.to);
    if (!nodes[a] || !nodes[b] || a === b) return;
    var label = str(asText(e.label));
    out.push({ from: a, to: b, label: label, kind: str(e.kind) || 'normal', dir: ['back', 'both', 'none'].indexOf(e.dir) >= 0 ? e.dir : 'forward', key: a + '>' + b + (label ? ':' + label : '') });
  });
  return out;
}
/* The ports a block needs: one per connection (same name and direction merge, as on a bus), plus the port lists of an
   RTL card. A connection takes the RTL port whose name points at the block on the other end (s_axi_cpu for the CPU). */
var HIER_GENERIC = { m: 1, s: 1, i: 1, o: 1, in: 1, out: 1, io: 1, axi: 1, ahb: 1, apb: 1, tl: 1, ul: 1, bus: 1, data: 1, port: 1, sig: 1, clk: 1, rst: 1, the: 1, to: 1, from: 1 };
function hierTokens(v) { return normText(v).split(/[^a-z0-9]+/).filter(function (x) { return x.length > 0; }); }
function hierPeerWords(n) {
  var w = {};
  if (!n) return w;
  hierTokens(str(n.id)).concat(hierTokens(hierTitle(n))).forEach(function (x) { if (x.length >= 2) w[x] = true; });
  return w;
}
function hierRtlLists(me) {
  var ports = me && me.ports && typeof me.ports === 'object' ? me.ports : null, out = { in: [], out: [], inout: [] };
  if (!ports) return out;
  [['in', 'inputs'], ['out', 'outputs'], ['inout', 'inout']].forEach(function (q) {
    var v = ports[q[0]] || ports[q[1]];
    (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : []).forEach(function (name) { name = str(name).slice(0, 48); if (name) out[q[0]].push(name); });
  });
  return out;
}
function hierWordHit(tok, words) {
  if (words[tok]) return true;
  if (tok.length < 3) return false;
  return Object.keys(words).some(function (w) { return w.length >= 3 && (w.indexOf(tok) >= 0 || tok.indexOf(w) >= 0); });
}
function hierPortsOf(d, id, edges) {
  var nodes = asNodes(d), me = nodes[id], list = [], byKey = {}, hw = hierHardware(d);
  var add = function (name, dir, kind, peer, key) {
    name = str(name).slice(0, 48);
    if (!name) return;
    var k = dir + '|' + name, p = byKey[k];
    if (!p) { p = byKey[k] = { name: name, dir: dir, kind: null, peers: [], keys: [] }; list.push(p); }
    if (kind && kind !== 'normal' && !p.kind) p.kind = kind;
    if (peer && p.peers.indexOf(peer) < 0) p.peers.push(peer);
    if (key) p.keys.push(key);
  };
  var rtl = hierRtlLists(me), used = {}, mine = [];
  (edges || hierEdges(d)).forEach(function (e) {
    var side = e.from === id ? 'from' : e.to === id ? 'to' : null;
    if (!side) return;
    var other = side === 'from' ? e.to : e.from;
    var dir = e.dir === 'both' || e.dir === 'none' ? 'inout' : ((side === 'from') === (e.dir === 'forward') ? 'out' : 'in');
    mine.push({ e: e, other: other, dir: dir });
  });
  /* RTL names: the best-scoring unused port of the same direction; a word naming another neighbour counts against it */
  var peers = {};
  mine.forEach(function (m) { peers[m.other] = hierPeerWords(nodes[m.other]); });
  var pairs = [];
  mine.forEach(function (m, mi) {
    (m.dir === 'inout' ? ['in', 'out', 'inout'] : [m.dir, 'inout']).forEach(function (dir) {
      rtl[dir].forEach(function (name) {
        var score = 0;
        hierTokens(name).forEach(function (tok) {
          if (hierWordHit(tok, peers[m.other])) score += HIER_GENERIC[tok] ? 1 : 3;
          else if (!HIER_GENERIC[tok] && Object.keys(peers).some(function (o) { return o !== m.other && hierWordHit(tok, peers[o]); })) score -= 3;
        });
        if (score > 0) pairs.push({ mi: mi, name: name, dir: dir, score: score });
      });
    });
  });
  pairs.sort(function (a, b) { return b.score - a.score; });
  var named = {};
  pairs.forEach(function (q) { if (named[q.mi] === undefined && !used[q.name]) { named[q.mi] = q; used[q.name] = true; } });
  /* an RTL port keeps its declared name and direction; otherwise the connection's words, as an RTL name for hardware.
     An input takes one source, so inputs that would share a name (IRQ from the UART and from the GPIO) also carry the
     name of the block they come from (i_irq_uart, i_irq_gpio) instead of merging into one port with two sources. */
  var base = mine.map(function (m, mi) {
    if (named[mi]) return null;
    var words = m.e.label || hierTitle(nodes[m.other]);
    return { words: words, name: hw ? hierRtlName(words, m.dir, m.e.kind) : words };
  });
  var clash = {};
  mine.forEach(function (m, mi) { if (base[mi] && m.dir === 'in') { var c = clash[base[mi].name] || (clash[base[mi].name] = {}); c[m.other] = true; } });
  mine.forEach(function (m, mi) {
    if (named[mi]) { add(named[mi].name, named[mi].dir, m.e.kind, m.other, m.e.key); return; }
    var b = base[mi];
    if (m.dir === 'in' && Object.keys(clash[b.name]).length > 1) {
      var w2 = m.e.label ? m.e.label + ' ' + hierTitle(nodes[m.other]) : b.words;
      add(hw ? hierRtlName(w2, m.dir, m.e.kind) : w2, m.dir, m.e.kind, m.other, m.e.key);
      return;
    }
    add(b.name, m.dir, m.e.kind, m.other, m.e.key);
  });
  ['in', 'out', 'inout'].forEach(function (dir) { rtl[dir].forEach(function (name) { if (!used[name]) add(name, dir, null, null, null); }); });
  return list;
}
/* ---------- RTL names: lower-case words joined by _, i_ / o_ / io_ in front (the style can be switched), _n for active-low ---------- */
function hierNaming() { var v = storageGet('ad-naming'); return v === 'suffix' || v === 'off' ? v : 'prefix'; }
function hierSlug(v) { return normText(v).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }
function hierHardware(d) {
  var nodes = (d && d.nodes || []).filter(Boolean);
  if (nodes.some(function (n) { return n.port || (n.ports && typeof n.ports === 'object'); })) return true;
  if ((d.edges || []).some(function (e) { return e && (e.kind === 'clock' || e.kind === 'reset' || e.kind === 'bus'); })) return true;
  var hw = /\b(axi\d?|apb|ahb|tl-?ul|irq|clk|rst|sram|dram|rom|fifo|uart|spi|i2c|gpio|dma|cpu|npu|soc|pll|adc|dac|jtag|csr)\b/i;
  return nodes.some(function (n) { var def = SYMBOLS[normShape(n.shape)]; return (def && (def.cat === 'logic' || def.cat === 'digital' || def.cat === 'analog')) || hw.test(hierTitle(n)); });
}
function hierRtlBody(name, kind) {
  /* DataReady and RxFIFOFull become data_ready and rx_fifo_full */
  var split = String(name).replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
  var body = hierSlug(split).replace(/^(i|o|io)_/, '').replace(/_(i|o|io)$/, '') || 'sig';
  body = body.replace(/(^|_)(rstn|resetn|reset_b|rst_b|rst_bar|reset_bar)(?=_|$)/g, '$1rst_n');
  if (kind === 'clock' && !/(^|_)clk(_|$)/.test(body)) body = 'clk_' + body;
  if (kind === 'reset' && !/(^|_)rst(_n)?(_|$)/.test(body)) body = 'rst_n_' + body;
  return body.replace(/_+/g, '_').replace(/^_|_$/g, '') || 'sig';
}
function hierRtlName(name, dir, kind) {
  var body = hierRtlBody(name, kind), style = hierNaming(), pre = dir === 'in' ? 'i' : dir === 'out' ? 'o' : 'io';
  if (HIER_BUS_IF.test(body)) return body;
  return style === 'suffix' ? body + '_' + pre : style === 'off' ? body : pre + '_' + body;
}
/* A bus interface (a bundle of signals going both ways) keeps the name its role and protocol give it: s_axi_cpu, m_apb,
   s_axis_rx, or a SystemVerilog interface ending in _if; no direction mark is asked for. */
var HIER_BUS_IF = /^(s|m|slv|mst)_?(axi\d*|axis|axil|axi_lite|ahb\d*|ahbl|apb\d*|tl|tlul|obi|wb|wishbone|avmm|avs|avm|avst|chi|ace)(_|$)|_(if|intf)$/i;
/* Names that do not follow the style, with the name they should have: ports of frames and tabs, and the port lists of RTL cards. */
function hierNameProblem(name, dir) {
  var style = hierNaming(), base = String(name).replace(/\[[^\]]*\]$/, ''), why = [];
  if (/[A-Z]/.test(base)) why.push('case');
  if (/[^A-Za-z0-9_]/.test(base)) why.push('chars');
  var pre = dir === 'in' ? 'i' : dir === 'out' ? 'o' : 'io', bus = HIER_BUS_IF.test(base);
  if (style === 'prefix' && !bus && base.toLowerCase().indexOf(pre + '_') !== 0) why.push('dir');
  if (style === 'suffix' && !bus && !new RegExp('_' + pre + '$').test(base.toLowerCase())) why.push('dir');
  if (/(^|_)(rstn|resetn|reset_b|rst_b|rst_bar|reset_bar)(_|$)/i.test(base)) why.push('low');
  return why;
}
function hierNamingIssues(d, ti) {
  var out = [];
  if (hierNaming() === 'off' || !hierHardware(d)) return out;
  var kindsOf = function (why) { return why.map(function (w) { return ht('nm_' + w); }).join('; '); };
  (d.nodes || []).forEach(function (n) {
    if (!n || !str(n.id)) return;
    if (n.port && typeof n.port === 'object' && str(n.port.name)) {
      var why = hierNameProblem(str(n.port.name), str(n.port.dir));
      if (!why.length) return;
      var to = hierRtlName(str(n.port.name), str(n.port.dir), n.port.kind), port = edClone(n.port);
      port.name = to;
      out.push({ text: hl('iName', hq(str(n.port.name)), kindsOf(why), hq(to)), id: str(n.id), soft: true,
                 fixes: [{ label: hl('fixName', to), safe: true, ops: [{ op: 'updateNode', id: str(n.id), set: { title: to, port: port } }] }] });
      return;
    }
    var lists = hierRtlLists(n), changed = false, fixed = { in: [], out: [], inout: [] }, bad = [];
    ['in', 'out', 'inout'].forEach(function (dir) {
      lists[dir].forEach(function (name) {
        var why2 = hierNameProblem(name, dir), range = (/\[[^\]]*\]$/.exec(name) || [''])[0];
        if (why2.length) { changed = true; bad.push(name); fixed[dir].push(hierRtlName(name.replace(/\[[^\]]*\]$/, ''), dir, null) + range); } else fixed[dir].push(name);
      });
    });
    if (!changed) return;
    var ports = {};
    ['in', 'out', 'inout'].forEach(function (k) { if (fixed[k].length) ports[k] = fixed[k]; });
    out.push({ text: hl('iNameCard', hq(hierTitle(n)), bad.slice(0, 4).join(', ') + (bad.length > 4 ? '…' : '')), id: str(n.id), soft: true,
               fixes: [{ label: ht('fixNames'), safe: true, ops: [{ op: 'updateNode', id: str(n.id), set: { ports: ports } }] }] });
  });
  void ti;
  return out;
}

/* Shape and mirroring of a port on each side of its frame; EXT always ends up outside. */
function hierPortShape(dir, side) {
  var base = dir === 'in' ? 'port-in' : dir === 'out' ? 'port-out' : 'port-io';
  if (side === 'top' || side === 'bottom') return { shape: base + '-v', flipH: false, flipV: side === 'bottom' };
  return { shape: base, flipH: side === 'right' ? dir !== 'out' : dir === 'out', flipV: false };
}
function hierVertical(n) { return /-v$/.test(normShape(n.shape)); }
/* Where a port's pins sit in the symbol's own box (the renderer mirrors them with flipH and flipV). */
function hierExt(n) { if (hierVertical(n)) return { x: 0.5, y: 0, perimeter: false }; return normShape(n.shape) === 'port-out' ? { x: 1, y: 0.5, perimeter: false } : { x: 0, y: 0.5, perimeter: false }; }
function hierInt(n) { if (hierVertical(n)) return { x: 0.5, y: 1, perimeter: false }; return normShape(n.shape) === 'port-out' ? { x: 0, y: 0.5, perimeter: false } : { x: 1, y: 0.5, perimeter: false }; }
function hierPortSide(n) {
  var st = n.style || {};
  if (hierVertical(n)) return st.flipV ? 'bottom' : 'top';
  return (normShape(n.shape) === 'port-out') === !st.flipH ? 'right' : 'left';
}
var HIER_PORT_FS = 11;
function hierPortSize(name, side) {
  var tw = textWidth(str(name), HIER_PORT_FS, 650);
  if (side === 'top' || side === 'bottom') return { w: Math.max(84, Math.ceil((tw + 26) / 2) * 2), h: 34 };
  return { w: Math.max(96, Math.ceil((tw + 40) / 2) * 2), h: 26 };
}
function hierPortColor(kind, fallback) { return kind === 'clock' ? 'violet' : kind === 'reset' ? 'red' : (fallback || 'slate'); }
function hierPortId(d, frameId, name, dir) {
  var base = (frameId ? frameId + '.' : 'port.') + (str(name).replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_|_$/g, '') || 'p') + (dir === 'in' ? '_i' : dir === 'out' ? '_o' : '_io');
  var used = asNodes(d), id = base, k = 2;
  while (used[id] || asGroupIds(d)[id]) id = base + k++;
  return id;
}
function hierPortNode(d, frameId, spec, side, x, y, color) {
  var sh = hierPortShape(spec.dir, side), size = hierPortSize(spec.name, side);
  var n = { id: hierPortId(d, frameId, spec.name, spec.dir), title: spec.name, shape: sh.shape, color: hierPortColor(spec.kind, color),
    x: Math.round(x), y: Math.round(y), w: size.w, h: size.h, port: { of: frameId || '', name: spec.name, dir: spec.dir }, style: { fontSize: HIER_PORT_FS } };
  if (!frameId) delete n.port.of;
  if (spec.kind) n.port.kind = spec.kind;
  if (frameId) n.group = frameId;
  if (sh.flipH) n.style.flipH = true;
  if (sh.flipV) n.style.flipV = true;
  return n;
}

/* ---------- placement: the overview's arrangement, stretched until the frames no longer overlap ---------- */
function hierSpread(items) {
  var sx = 1, sy = 1, gap = HB.gap;
  for (var iter = 0; iter < 600; iter++) {
    var moved = false;
    for (var i = 0; i < items.length; i++) {
      for (var j = i + 1; j < items.length; j++) {
        var a = items[i], b = items[j], dx = Math.abs(a.cx - b.cx), dy = Math.abs(a.cy - b.cy);
        var needX = (a.w + b.w) / 2 + gap, needY = (a.h + b.h) / 2 + gap;
        if (dx * sx >= needX - 0.5 || dy * sy >= needY - 0.5) continue;
        var fx = dx > 0.5 ? needX / (dx * sx) : Infinity, fy = dy > 0.5 ? needY / (dy * sy) : Infinity;
        if (fx === Infinity && fy === Infinity) { b.cx += 1; moved = true; continue; }
        if (fx <= fy) sx *= fx * 1.001; else sy *= fy * 1.001;
        moved = true;
      }
    }
    if (!moved) break;
  }
  var x1 = Infinity, y1 = Infinity;
  items.forEach(function (it) { it.x = it.cx * sx - it.w / 2; it.y = it.cy * sy - it.h / 2; x1 = Math.min(x1, it.x); y1 = Math.min(y1, it.y); });
  items.forEach(function (it) { it.x = Math.round((it.x - x1 + HB.left) / 10) * 10; it.y = Math.round((it.y - y1 + HB.topMargin) / 10) * 10; });
  return { sx: sx, sy: sy };
}
/* Centres of the overview's blocks: from the drawn page when it is open, else from a quick layout of the raw tab. */
function hierCentres(raw, oi) {
  var d = raw.diagrams[oi], id = hierTabId(d, oi), out = {};
  var st = typeof states !== 'undefined' ? states.filter(function (s) { return s.d && s.d.id === id && s.d.kind === 'graph' && s.L; })[0] : null;
  var L = st ? st.L : null;
  if (!L && typeof normalizeDiagram === 'function') {
    var keep = problems.length, keepList = problemList.length;
    try { var nd = normalizeDiagram(d, oi); if (nd.kind === 'graph' && nd.nodes.length) L = layoutDiagram(nd); } catch (err) { L = null; }
    problems.length = keep; problemList.length = keepList;
  }
  (Array.isArray(d.nodes) ? d.nodes : []).forEach(function (n, k) {
    var p = L && L.nodes ? L.nodes[str(n.id)] : null;
    out[str(n.id)] = p ? { x: p.x, y: p.y } : { x: (k % 4) * 260, y: Math.floor(k / 4) * 160 };
  });
  return out;
}
function hierChipW(title) { return textWidth(String(title).toUpperCase(), 11, 700) + 44; }
function hierFrameSize(title, ports) {
  var n = { left: 0, right: 0 }, run = { top: 0, bottom: 0 };
  ports.forEach(function (p) { if (p.side === 'top' || p.side === 'bottom') run[p.side] += hierPortSize(p.name, p.side).w + 20; else n[p.side]++; });
  var w = Math.max(HB.frameMinW, Math.ceil(textWidth(title, 13, 700) + 120), hierChipW(title) + 30 + Math.max(run.top, run.bottom), Math.max(run.top, run.bottom) + 80);
  var h = Math.max(HB.frameMinH, HB.top + HB.bottom + Math.max(n.left, n.right) * HB.portGap + 40);
  return { w: Math.round(w / 10) * 10, h: Math.round(h / 10) * 10 };
}
/* The side facing the blocks a port leads to; a port with no neighbour: inputs left, outputs right. */
function hierSideFor(p, me, centres, sc) {
  var kx = sc ? sc.sx : 1, ky = sc ? sc.sy : 1;
  if (p.peers.length && me) {
    var dx = 0, dy = 0;
    p.peers.forEach(function (id) { var c = centres[id]; if (c) { dx += (c.x - me.x) * kx; dy += (c.y - me.y) * ky; } });
    dx /= p.peers.length; dy /= p.peers.length;
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'left' : 'right';
      return dy < 0 ? 'top' : 'bottom';
    }
  }
  return p.dir === 'in' ? 'left' : 'right';
}
/* The straight run from the middle of a side of frame a to frame b, and the side to use when that run crosses a third
   frame: the other side facing b, when that one is clear. Wires on the board are not routed around frames, so a port
   that faces its neighbour through another frame would draw its wire across that frame. */
function hierRun(side, a, b) {
  var cx = a.x + a.w / 2, cy = a.y + a.h / 2;
  if (side === 'left') return { x: b.x + b.w, y: cy - 1, w: a.x - b.x - b.w, h: 2 };
  if (side === 'right') return { x: a.x + a.w, y: cy - 1, w: b.x - a.x - a.w, h: 2 };
  if (side === 'top') return { x: cx - 1, y: b.y + b.h, w: 2, h: a.y - b.y - b.h };
  return { x: cx - 1, y: a.y + a.h, w: 2, h: b.y - a.y - a.h };
}
function hierClearSide(side, a, b, boxes) {
  var blocked = function (s) {
    var r = hierRun(s, a, b);
    if (r.w <= 0 || r.h <= 0) return null;
    return boxes.some(function (o) { return o !== a && o !== b && r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y; });
  };
  if (!a || !b || blocked(side) !== true) return side;
  var dx = b.x + b.w / 2 - (a.x + a.w / 2), dy = b.y + b.h / 2 - (a.y + a.h / 2);
  var other = side === 'left' || side === 'right' ? (dy < 0 ? 'top' : 'bottom') : (dx < 0 ? 'left' : 'right');
  return blocked(other) === false ? other : side;
}
/* Ports along each side of a frame, in the order of the blocks they lead to, so wires do not cross. */
function hierLayPorts(d, frame, ports, centres, color) {
  var out = [];
  var peerAt = function (p, axis) { return p.peers.length && centres[p.peers[0]] ? centres[p.peers[0]][axis] : 1e9; };
  ['left', 'right', 'top', 'bottom'].forEach(function (side) {
    var list = ports.filter(function (p) { return p.side === side; }), vertical = side === 'top' || side === 'bottom';
    list.sort(function (a, b) { return peerAt(a, vertical ? 'x' : 'y') - peerAt(b, vertical ? 'x' : 'y') || (a.dir === b.dir ? 0 : a.dir === 'in' ? -1 : 1); });
    if (!vertical) {
      var room = frame.h - HB.top - HB.bottom, start = frame.y + HB.top + Math.max(0, (room - list.length * HB.portGap) / 2);
      list.forEach(function (p, k) {
        var sz = hierPortSize(p.name, side), x = side === 'left' ? frame.x - sz.w / 2 : frame.x + frame.w - sz.w / 2;
        var n = hierPortNode(d, frame.id, p, side, x, Math.round((start + k * HB.portGap + (HB.portGap - sz.h) / 2) / 2) * 2, color);
        d.nodes.push(n);
        out.push({ spec: p, node: n });
      });
    } else {
      var widths = list.map(function (p) { return hierPortSize(p.name, side).w; }), total = widths.reduce(function (t, w) { return t + w + 20; }, -20);
      var lo = frame.x + (side === 'top' ? hierChipW(frame.label) + 10 : 20), hi = frame.x + frame.w - 20;
      var x = Math.max(lo, frame.x + (frame.w - total) / 2);
      if (x + total > hi) x = Math.max(frame.x + 10, hi - total);
      list.forEach(function (p, k) {
        var sz = hierPortSize(p.name, side), y = side === 'top' ? frame.y - sz.h / 2 : frame.y + frame.h - sz.h / 2;
        var n = hierPortNode(d, frame.id, p, side, Math.round(x / 2) * 2, Math.round(y), color);
        d.nodes.push(n);
        out.push({ spec: p, node: n });
        x += widths[k] + 20;
      });
    }
  });
  return out;
}

/* ---------- untangling: the renderer routes wires without looking at other frames, so after the ports are placed, a
   wire that runs through a frame, over another frame's port or along another wire has its ends moved, one at a time,
   to another side of their frame when that leaves fewer such wires and makes no frames collide ---------- */
function hierSegBox(a, b) { return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }; }
function hierHit(s, r) { return s.x < r.x + r.w && s.x + s.w > r.x && s.y < r.y + r.h && s.y + s.h > r.y; }
function hierTangles(board) {
  if (typeof normalizeDiagram !== 'function' || typeof layoutDiagram !== 'function') return null;
  var keep = problems.length, keepList = problemList.length, L = null;
  try { L = layoutDiagram(normalizeDiagram(board, 0)); } catch (err) { L = null; }
  problems.length = keep; problemList.length = keepList;
  if (!L || !L.edges || !L.nodes) return null;
  var boxes = [], edges = board.edges || [];
  (board.groups || []).forEach(function (g) { if (g && str(g.source) && +g.w > 0) boxes.push({ id: str(g.id), x: +g.x + 3, y: +g.y + 3, w: +g.w - 6, h: +g.h - 6 }); });
  (board.nodes || []).forEach(function (n) {
    var b = n && n.port ? L.nodes[str(n.id)] : null;
    if (b) boxes.push({ id: str(n.id), x: b.x - b.w / 2 + 1, y: b.y - b.h / 2 + 1, w: b.w - 2, h: b.h - 2 });
  });
  var segs = [], per = edges.map(function () { return 0; }), len = 0;
  edges.forEach(function (e, i) {
    var pts = (L.edges[i] && L.edges[i].points) || [];
    for (var k = 1; k < pts.length; k++) {
      var sg = hierSegBox(pts[k - 1], pts[k]);
      sg.i = i;
      segs.push(sg);
      len += sg.w + sg.h;
      boxes.forEach(function (b) { if (b.id !== str(e.from) && b.id !== str(e.to) && hierHit(sg, b)) per[i]++; });
    }
  });
  var ends = function (i) { return [str(edges[i].from), str(edges[i].to)]; };
  for (var a = 0; a < segs.length; a++) {
    for (var b = a + 1; b < segs.length; b++) {
      var p = segs[a], q = segs[b];
      if (p.i === q.i || ends(p.i).some(function (id) { return ends(q.i).indexOf(id) >= 0; })) continue;
      var along = (p.h < 0.5 && q.h < 0.5 && Math.abs(p.y - q.y) < 4 && Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x) > 12) ||
                  (p.w < 0.5 && q.w < 0.5 && Math.abs(p.x - q.x) < 4 && Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y) > 12);
      if (along) { per[p.i]++; per[q.i]++; }
    }
  }
  return { per: per, total: per.reduce(function (t, v) { return t + v; }, 0), len: len };
}
function hierFrameClash(board) {
  var fr = (board.groups || []).filter(function (g) { return g && str(g.source) && +g.w > 0; }), n = 0;
  for (var i = 0; i < fr.length; i++) {
    for (var j = i + 1; j < fr.length; j++) {
      var a = fr[i], b = fr[j];
      if (+a.x < +b.x + +b.w + 20 && +a.x + +a.w + 20 > +b.x && +a.y < +b.y + +b.h + 20 && +a.y + +a.h + 20 > +b.y) n++;
    }
  }
  return n;
}
function hierMovePort(board, pid, side) {
  var n = asNodes(board)[pid], frame = n && n.port ? asGroupIds(board)[str(n.port.of)] : null;
  if (!frame) return;
  var gid = str(frame.id), nodes = asNodes(board);
  /* a wire to a block drawn in the frame uses the inner pin, any other wire the outer one */
  var inner = function (id) { var x = nodes[id]; return !!x && !x.port && str(x.group) === gid; };
  board.nodes = board.nodes.filter(function (x) { return x !== n; });
  var m = hierAddPort(board, frame, { name: str(n.port.name), dir: str(n.port.dir), kind: n.port.kind || null }, side, pid);
  ['title', 'desc'].forEach(function (k) { if (n[k] !== undefined) m[k] = n[k]; });
  (board.edges || []).forEach(function (e) {
    if (!e) return;
    if (str(e.from) === pid) { e.fromAnchor = inner(str(e.to)) ? hierInt(m) : hierExt(m); delete e.points; }
    if (str(e.to) === pid) { e.toAnchor = inner(str(e.from)) ? hierInt(m) : hierExt(m); delete e.points; }
  });
}
function hierUntangle(board) {
  var t0 = Date.now(), base = hierTangles(board), clash0 = hierFrameClash(board), late = function () { return Date.now() - t0 > 1500; };
  for (var round = 0; round < 2 && base && base.total && !late(); round++) {
    var better = false;
    for (var i = 0; i < board.edges.length && !late(); i++) {
      if (!base.per[i]) continue;
      [str(board.edges[i].from), str(board.edges[i].to)].forEach(function (pid) {
        var n = asNodes(board)[pid];
        if (!base.per[i] || late() || !n || !n.port) return;
        var cur = hierPortSide(n), best = null;
        ['left', 'right', 'top', 'bottom'].forEach(function (side) {
          if (side === cur || late()) return;
          var snap = JSON.stringify([board.nodes, board.groups, board.edges]);
          hierMovePort(board, pid, side);
          var got = hierTangles(board);
          /* fewer tangles than now; between sides that tie, the shorter wires */
          if (got && hierFrameClash(board) <= clash0 && got.total < base.total &&
              (!best || got.total < best.got.total || (got.total === best.got.total && got.len < best.got.len))) best = { side: side, got: got };
          var back = JSON.parse(snap);
          board.nodes = back[0]; board.groups = back[1]; board.edges = back[2];
        });
        if (best) { hierMovePort(board, pid, best.side); base = best.got; better = true; }
      });
    }
    if (!better) break;
  }
}

/* ---------- building the detail board of an overview ---------- */
function hierBuildBoard(raw, oi) {
  var doc = edClone(raw), ov = doc.diagrams[oi];
  if (!hierIsGraph(ov)) return { raw: raw, error: 'graph' };
  var ovId = hierEnsureId(doc, oi);
  var existing = doc.diagrams.map(function (x, i) { return { d: x, i: i }; }).filter(function (q) { return str(q.d.boardOf) === ovId; })[0];
  if (existing) return { raw: raw, index: existing.i, existed: true };
  var nodes = (ov.nodes || []).filter(function (n) { return n && str(n.id); }), edges = hierEdges(ov), centres = hierCentres(doc, oi);
  var board = { id: hierUniqueTab(doc, ovId + '-detail'), title: hl('boardTitle', str(asText(ov.title)) || ovId), summary: hl('boardSum', str(asText(ov.title)) || ovId),
                boardOf: ovId, layout: 'manual', route: 'orthogonal', nodes: [], edges: [], groups: [] };
  if (ov.legend) board.legend = edClone(ov.legend);
  /* frames: sizes from their ports, places from the overview */
  var items = nodes.map(function (n) {
    var id = str(n.id), me = centres[id];
    return { id: id, n: n, ports: hierPortsOf(ov, id, edges), cx: me.x, cy: me.y, w: HB.frameMinW, h: HB.frameMinH };
  });
  /* first pass with plain frames tells how far the overview stretches; ports then face their neighbours on the board */
  var sc = hierSpread(items);
  items.forEach(function (it) {
    it.ports.forEach(function (p) { p.side = hierSideFor(p, centres[it.id], centres, sc); });
    var size = hierFrameSize(hierTitle(it.n), it.ports);
    it.w = size.w; it.h = size.h; it.cx = centres[it.id].x; it.cy = centres[it.id].y;
  });
  hierSpread(items);
  /* with the frames in place, a port whose way to its neighbour runs through a third frame takes the other side */
  var byId = {}, moved = false;
  items.forEach(function (it) { byId[it.id] = it; });
  items.forEach(function (it) {
    it.ports.forEach(function (p) {
      var s = p.peers.length === 1 ? hierClearSide(p.side, it, byId[p.peers[0]], items) : p.side;
      if (s !== p.side) { p.side = s; moved = true; }
    });
  });
  if (moved) {
    items.forEach(function (it) {
      var size = hierFrameSize(hierTitle(it.n), it.ports);
      it.w = size.w; it.h = size.h; it.cx = centres[it.id].x; it.cy = centres[it.id].y;
    });
    hierSpread(items);
  }
  var ovGroups = asGroupIds(ov), used = {};
  items.forEach(function (it) { if (str(it.n.group) && ovGroups[str(it.n.group)]) used[str(it.n.group)] = true; });
  Object.keys(used).forEach(function (gid) {
    var g = ovGroups[gid], c = { id: asNodes(ov)[gid] ? gid + '_grp' : gid };
    ['label', 'color', 'icon', 'hidden'].forEach(function (k) { if (g[k] !== undefined) c[k] = edClone(g[k]); });
    if (!c.label) c.label = gid;
    used[gid] = c.id;
    board.groups.push(c);
  });
  var portsOf = {};
  items.forEach(function (it) {
    var f = { id: it.id, label: hierTitle(it.n), color: str(it.n.color) || 'slate', source: it.id, x: it.x, y: it.y, w: it.w, h: it.h };
    if (it.n.icon) f.icon = it.n.icon;
    if (str(it.n.group) && used[str(it.n.group)]) f.parent = used[str(it.n.group)];
    board.groups.push(f);
    portsOf[it.id] = hierLayPorts(board, f, it.ports, centres, f.color);
  });
  /* wires: each overview connection joins the outer pins of its two ports */
  edges.forEach(function (e) {
    var find = function (id, dir) {
      return (portsOf[id] || []).filter(function (q) { return q.spec.keys.indexOf(e.key) >= 0; })[0] || null;
    };
    var a = find(e.from), b = find(e.to);
    if (!a || !b) return;
    var w = { from: a.node.id, to: b.node.id, fromAnchor: hierExt(a.node), toAnchor: hierExt(b.node), route: 'orthogonal', source: e.key };
    if (e.label && e.label !== a.spec.name && e.label !== b.spec.name) w.label = e.label;
    if (e.kind && e.kind !== 'normal') w.kind = e.kind;
    if (e.dir !== 'forward') w.dir = e.dir;
    board.edges.push(w);
  });
  hierUntangle(board);
  doc.diagrams.splice(oi + 1, 0, board);
  return { raw: doc, index: oi + 1 };
}

/* ---------- keeping the levels in step (runs after every edit, changes nothing when all is in step) ---------- */
function hierFrameBox(g) { return { x: +g.x || 0, y: +g.y || 0, w: +g.w || HB.frameMinW, h: +g.h || HB.frameMinH }; }
function hierAddPort(d, frame, spec, side, keepId) {
  var f = frame ? hierFrameBox(frame) : null, mine = hierPorts(d, frame ? str(frame.id) : null);
  var onSide = mine.filter(function (n) { return hierPortSide(n) === side; });
  var sz = hierPortSize(spec.name, side), vertical = side === 'top' || side === 'bottom', x, y;
  var lastY = function () { return Math.max.apply(null, onSide.map(function (n) { return +n.y || 0; })); };
  var lastX = function () { return Math.max.apply(null, onSide.map(function (n) { return (+n.x || 0) + (+n.w || 96); })); };
  if (f) {
    if (!vertical) {
      x = side === 'left' ? f.x - sz.w / 2 : f.x + f.w - sz.w / 2;
      y = onSide.length ? lastY() + HB.portGap : f.y + HB.top;
      if (y + sz.h + HB.bottom > f.y + f.h) frame.h = Math.round((y + sz.h + HB.bottom - f.y) / 10) * 10;
    } else {
      y = side === 'top' ? f.y - sz.h / 2 : f.y + f.h - sz.h / 2;
      x = onSide.length ? lastX() + 20 : f.x + (side === 'top' ? hierChipW(str(asText(frame.label)) || str(frame.id)) + 10 : 20);
      if (x + sz.w + 20 > f.x + f.w) frame.w = Math.round((x + sz.w + 20 - f.x) / 10) * 10;
    }
  } else {
    /* a tab holding a block's inside: ports around the drawing, on the side they face */
    var box = hierInnerBounds(d) || { x: 220, y: 110, w: 420, h: 260 };
    if (!vertical) {
      x = onSide.length ? +onSide[0].x : side === 'left' ? Math.max(10, box.x - sz.w - 60) : box.x + box.w + 60;
      y = onSide.length ? lastY() + HB.portGap : box.y;
    } else {
      y = onSide.length ? +onSide[0].y : side === 'top' ? Math.max(10, box.y - sz.h - 50) : box.y + box.h + 50;
      x = onSide.length ? lastX() + 20 : box.x;
    }
  }
  var n = hierPortNode(d, frame ? str(frame.id) : '', spec, side, x, y, frame ? frame.color : null);
  if (keepId && !asNodes(d)[keepId] && !asGroupIds(d)[keepId]) n.id = keepId;
  d.nodes = Array.isArray(d.nodes) ? d.nodes : [];
  d.nodes.push(n);
  return n;
}
function hierDropNode(d, id) {
  d.nodes = (d.nodes || []).filter(function (n) { return !(n && str(n.id) === id); });
  d.edges = (d.edges || []).filter(function (e) { return e && str(e.from) !== id && str(e.to) !== id; });
}
function hierInnerBounds(d) {
  var boxes = asBoxes(d, null).filter(function (b) { var n = asNodes(d)[b.id]; return !(n && n.port); });
  return asBounds(boxes);
}
function hierSyncBoard(raw, bi) {
  var B = raw.diagrams[bi], o = hierFind(raw, str(B.boardOf));
  if (!o || !hierIsGraph(o.d) || !hierIsGraph(B)) return 0;
  var O = o.d, changes = 0, edges = hierEdges(O), ovNodes = asNodes(O), centres = null;
  B.nodes = Array.isArray(B.nodes) ? B.nodes : [];
  B.groups = Array.isArray(B.groups) ? B.groups : [];
  B.edges = Array.isArray(B.edges) ? B.edges : [];
  var frames = {};
  B.groups.forEach(function (g) { if (g && str(g.source)) frames[str(g.source)] = g; });
  Object.keys(ovNodes).forEach(function (id) {
    var n = ovNodes[id], f = frames[id], title = hierTitle(n);
    if (f) { if (str(f.label) !== title) { f.label = title; changes++; } return; }
    /* a new block: a frame in free space next to the frame of a block it is connected to */
    centres = centres || hierCentres(raw, o.i);
    var ports = hierPortsOf(O, id, edges);
    ports.forEach(function (p) { p.side = hierSideFor(p, centres[id], centres); });
    var size = hierFrameSize(title, ports), near = null;
    ports.forEach(function (p) { p.peers.forEach(function (q) { if (!near && frames[q]) near = frames[q]; }); });
    var boxes = B.groups.filter(function (g) { return g && str(g.source) && +g.w > 0; }).map(function (g) { return hierFrameBox(g); });
    var all = asBounds(boxes), want = near ? { x: +near.x + (+near.w) + HB.gap + 40, y: +near.y } : { x: all ? all.x + all.w + HB.gap + 40 : HB.left, y: all ? all.y : HB.topMargin };
    var spot = asFreeSpot(boxes, { x: want.x, y: want.y, w: size.w + 120, h: size.h }, HB.gap / 2);
    var fr = { id: asGroupIds(B)[id] || asNodes(B)[id] ? hierUniqueGroup(B, id) : id, label: title, color: str(n.color) || 'slate', source: id,
               x: Math.round(spot.x / 10) * 10, y: Math.round(spot.y / 10) * 10, w: size.w, h: size.h };
    B.groups.push(fr);
    frames[id] = fr;
    changes++;
  });
  /* wires for connections the board does not have yet, with the ports they need */
  var have = {}, keys = {}, hw = hierHardware(O);
  B.edges.forEach(function (e) { if (e && str(e.source)) have[str(e.source)] = true; });
  edges.forEach(function (e) { keys[e.key] = true; });
  edges.forEach(function (e) {
    if (have[e.key]) return;
    var fa = frames[e.from], fb = frames[e.to];
    if (!fa || !fb) return;
    /* the same two blocks with a wire whose connection is gone: its label (or a block id) changed, so keep that wire */
    var old = B.edges.filter(function (w) { var k = w && str(w.source); return k && !keys[k] && (str(w.kind) || 'normal') === (e.kind || 'normal') && (hierKeyEnds(k, ovNodes) || []).join('>') === e.from + '>' + e.to; })[0];
    if (old) {
      old.source = e.key;
      have[e.key] = true;
      if (e.label) old.label = e.label; else delete old.label;
      changes++;
      return;
    }
    var ends = [[fa, e.from, fb], [fb, e.to, fa]].map(function (q) {
      var spec = hierPortsOf(O, q[1], [e])[0], mine = hierPorts(B, str(q[0].id));
      var fed = function (n) { return B.edges.some(function (w) { return w && str(w.source) && (str(w.from) === str(n.id) || str(w.to) === str(n.id)); }); };
      var hit = mine.filter(function (n) { return str(n.port.name) === spec.name && str(n.port.dir) === spec.dir && (spec.dir !== 'in' || !fed(n)); })[0];
      if (hit) return hit;
      /* an input that already has a source: a port of its own, named after the block it comes from */
      var taken = {};
      mine.forEach(function (n) { taken[str(n.port.name)] = true; });
      if (taken[spec.name]) {
        var other = ovNodes[q[1] === e.from ? e.to : e.from], words = (e.label ? e.label + ' ' : '') + hierTitle(other);
        spec.name = hw ? hierRtlName(words, spec.dir, e.kind) : words;
        for (var k = 2; taken[spec.name]; k++) spec.name = hw ? hierRtlName(words + ' ' + k, spec.dir, e.kind) : words + ' ' + k;
      }
      var boxes = B.groups.filter(function (g) { return g && str(g.source) && +g.w > 0; }).map(function (g) { var bx = hierFrameBox(g); bx.id = str(g.id); return bx; });
      var a = boxes.filter(function (bx) { return bx.id === str(q[0].id); })[0] || hierFrameBox(q[0]), b = boxes.filter(function (bx) { return bx.id === str(q[2].id); })[0] || hierFrameBox(q[2]);
      var c = { peer: { x: b.x + b.w / 2, y: b.y + b.h / 2 } }, me = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
      return hierAddPort(B, q[0], spec, hierClearSide(hierSideFor({ peers: ['peer'], dir: spec.dir }, me, c, null), a, b, boxes));
    });
    var w = { from: ends[0].id, to: ends[1].id, fromAnchor: hierExt(ends[0]), toAnchor: hierExt(ends[1]), route: 'orthogonal', source: e.key };
    if (e.label && e.label !== str(ends[0].port.name) && e.label !== str(ends[1].port.name)) w.label = e.label;
    if (e.kind && e.kind !== 'normal') w.kind = e.kind;
    if (e.dir !== 'forward') w.dir = e.dir;
    B.edges.push(w);
    have[e.key] = true;
    changes++;
  });
  return changes;
}
function hierUniqueGroup(d, base) { var ids = asGroupIds(d), nodes = asNodes(d), id = base + '_f', k = 2; while (ids[id] || nodes[id]) id = base + '_f' + k++; return id; }
/* A tab holding the inside of a block and the block's frame share their ports (same id). Names, directions, new and
   removed ports follow the tab being edited; with neither being edited, nothing is removed. A frame port carrying a
   wire from the overview is never removed here: that connection is changed in the overview. */
function hierSyncInside(raw, di, editing) {
  var D = raw.diagrams[di], link = D.detailOf, p = link && typeof link === 'object' ? hierFind(raw, str(link.tab)) : null;
  if (!p || !hierIsGraph(p.d) || !hierIsGraph(D)) return 0;
  var P = p.d, block = str(link.block), frame = asGroupIds(P)[block] || null, node = frame ? null : asNodes(P)[block];
  if (!frame && !node) return 0;
  var changes = 0, inner = hierPorts(D, null);
  if (!frame) {
    /* the own tab of an overview block: its border ports follow the block's connections (added, never removed) */
    var cs = hierCentres(raw, p.i);
    hierPortsOf(P, block).forEach(function (q) {
      if (inner.some(function (n) { return str(n.port.name) === q.name && str(n.port.dir) === q.dir; })) return;
      q.side = hierSideFor(q, cs[block] || { x: 0, y: 0 }, cs);
      hierAddPort(D, null, q, q.side);
      inner = hierPorts(D, null);
      changes++;
    });
    return changes;
  }
  var guard = {};
  (P.edges || []).forEach(function (e) { if (e && str(e.source)) { guard[str(e.from)] = true; guard[str(e.to)] = true; } });
  var twin = function (list, n) {
    return list.filter(function (x) { return str(x.id) === str(n.id); })[0] ||
           list.filter(function (x) { return str(x.port.name) === str(n.port.name) && str(x.port.dir) === str(n.port.dir); })[0] || null;
  };
  var insideWins = editing === di, frameWins = editing === p.i, outer = hierPorts(P, block);
  outer.forEach(function (fp) {
    var ip = twin(inner, fp);
    if (!ip) return;
    var src = insideWins ? ip : fp, dst = src === ip ? fp : ip;
    if (!['name', 'dir', 'kind'].some(function (k) { return str(src.port[k]) !== str(dst.port[k]); }) && str(dst.title) === str(src.title)) return;
    dst.port.name = src.port.name;
    dst.port.dir = src.port.dir;
    if (src.port.kind) dst.port.kind = src.port.kind; else delete dst.port.kind;
    dst.title = src.title;
    var sh = hierPortShape(str(dst.port.dir), hierPortSide(dst));
    dst.shape = sh.shape;
    dst.style = dst.style || {};
    if (sh.flipH) dst.style.flipH = true; else delete dst.style.flipH;
    if (sh.flipV) dst.style.flipV = true; else delete dst.style.flipV;
    changes++;
  });
  outer.forEach(function (fp) {
    if (twin(inner, fp)) return;
    if (insideWins && !guard[str(fp.id)]) { hierDropNode(P, str(fp.id)); changes++; return; }
    hierAddPort(D, null, { name: str(fp.port.name), dir: str(fp.port.dir), kind: fp.port.kind || null }, hierPortSide(fp), str(fp.id));
    inner = hierPorts(D, null);
    changes++;
  });
  inner.forEach(function (ip) {
    if (twin(hierPorts(P, block), ip)) return;
    if (frameWins) { hierDropNode(D, str(ip.id)); changes++; return; }
    hierAddPort(P, frame, { name: str(ip.port.name), dir: str(ip.port.dir), kind: ip.port.kind || null }, hierPortSide(ip), str(ip.id));
    changes++;
  });
  return changes;
}
function hierSync(raw, editing) {
  if (!raw || !Array.isArray(raw.diagrams)) return 0;
  var n = 0;
  raw.diagrams.forEach(function (d, i) { if (d && str(d.boardOf)) n += hierSyncBoard(raw, i); });
  raw.diagrams.forEach(function (d, i) { if (d && d.detailOf) n += hierSyncInside(raw, i, editing); });
  raw.diagrams.forEach(function (d) { if (d && Array.isArray(d.notes) && !d.notes.length) delete d.notes; });
  return n;
}
/* Renaming a block also renames the frames, tabs and notes that point to it. */
function hierRenameRefs(doc, d, oldId, newId) {
  if (!doc || !Array.isArray(doc.diagrams) || !oldId || oldId === newId) return;
  var i = doc.diagrams.indexOf(d), id = i >= 0 ? hierTabId(d, i) : null;
  (Array.isArray(d.notes) ? d.notes : []).forEach(function (q) {
    if (!q) return;
    if (str(q.attach) === oldId) q.attach = newId;
    if (Array.isArray(q.attach)) q.attach = q.attach.map(function (x) { return str(x) === oldId ? newId : x; });
  });
  if (!id) return;
  doc.diagrams.forEach(function (x) {
    if (!x || x === d) return;
    if (str(x.boardOf) === id) {
      (x.groups || []).forEach(function (g) { if (g && str(g.source) === oldId) g.source = newId; });
      (x.edges || []).forEach(function (e) {
        var k = e && str(e.source), ends = k ? hierKeyEnds(k, asNodes(d)) : null;
        if (!ends || (ends[0] !== oldId && ends[1] !== oldId)) return;
        e.source = (ends[0] === oldId ? newId : ends[0]) + '>' + (ends[1] === oldId ? newId : ends[1]) + k.slice(ends[0].length + 1 + ends[1].length);
      });
    }
    if (x.detailOf && str(x.detailOf.tab) === id && str(x.detailOf.block) === oldId) x.detailOf.block = newId;
  });
}
/* A removed block leaves its notes on the drawing, no longer attached. */
function hierDetachNotes(d, id) {
  (Array.isArray(d.notes) ? d.notes : []).forEach(function (q) {
    if (!q) return;
    if (str(q.attach) === id || (Array.isArray(q.attach) && q.attach.map(str).indexOf(id) >= 0)) delete q.attach;
  });
}

/* ---------- the inside of a block in its own tab ---------- */
function hierOpenInside(raw, ti, blockId) {
  var doc = edClone(raw), T = doc.diagrams[ti];
  if (!hierIsGraph(T)) return { raw: raw, error: 'graph' };
  var tid = hierEnsureId(doc, ti), groups = asGroupIds(T), nodes = asNodes(T);
  var frame = groups[blockId] || null, node = frame ? null : nodes[blockId];
  if (!frame && !node) return { raw: raw, error: 'block' };
  var target = frame || node;
  if (str(target.detail)) { var ex = hierFind(doc, str(target.detail)); if (ex) return { raw: raw, index: ex.i, existed: true }; }
  var name = frame ? (str(asText(frame.label)) || blockId) : hierTitle(node);
  var D = { id: hierUniqueTab(doc, tid + '-' + blockId.replace(/[^A-Za-z0-9_.-]+/g, '-')), title: name, summary: hl('insideSum', name),
            detailOf: { tab: tid, block: blockId }, layout: 'manual', route: str(T.route) || 'orthogonal', nodes: [], edges: [], groups: [] };
  if (frame) {
    /* everything inside the frame moves: blocks, frames inside it, wires among them and the notes about them */
    var inG = {}; inG[blockId] = true;
    for (var pass = 0; pass < 20; pass++) (T.groups || []).forEach(function (g) { if (g && str(g.parent) && inG[str(g.parent)]) inG[str(g.id)] = true; });
    var isPortOfFrame = function (n) { return n && n.port && str(n.port.of) === blockId; };
    var moved = {};
    (T.nodes || []).forEach(function (n) { if (n && inG[str(n.group)] && !isPortOfFrame(n)) moved[str(n.id)] = n; });
    var f = hierFrameBox(frame), dx = HB.left + 20 - f.x, dy = HB.topMargin - f.y;
    var shift = function (o) {
      if (!o) return;
      if (finiteNum(o.x) !== null) o.x = Math.round(+o.x + dx);
      if (finiteNum(o.y) !== null) o.y = Math.round(+o.y + dy);
    };
    Object.keys(moved).forEach(function (id) {
      var c = edClone(moved[id]);
      if (str(c.group) === blockId) delete c.group;
      shift(c);
      D.nodes.push(c);
    });
    (T.groups || []).forEach(function (g) {
      if (!g || !inG[str(g.id)] || str(g.id) === blockId) return;
      var c = edClone(g);
      if (str(c.parent) === blockId) delete c.parent;
      shift(c);
      D.groups.push(c);
    });
    /* the frame's ports are copied as the tab's border ports, same place, shape and id, so wires to them move unchanged */
    var ownPort = {};
    hierPorts(T, blockId).forEach(function (pn) {
      var c = edClone(pn);
      delete c.group;
      c.port = { name: str(pn.port.name), dir: str(pn.port.dir) };
      if (pn.port.kind) c.port.kind = pn.port.kind;
      shift(c);
      D.nodes.push(c);
      ownPort[str(pn.id)] = true;
    });
    var keep = [];
    (T.edges || []).forEach(function (e) {
      if (!e) return;
      var a = str(e.from), b = str(e.to);
      var aIn = !!moved[a] || (!!inG[a] && a !== blockId), bIn = !!moved[b] || (!!inG[b] && b !== blockId);
      if ((aIn && (bIn || ownPort[b])) || (ownPort[a] && bIn)) { var c = edClone(e); hierShiftEdge(c, dx, dy); D.edges.push(c); return; }
      if (aIn || bIn) {
        /* a wire from inside straight to something outside the frame: on the board it now ends on the frame */
        var o = edClone(e);
        if (aIn) { o.from = blockId; delete o.fromAnchor; }
        if (bIn) { o.to = blockId; delete o.toAnchor; }
        delete o.points;
        keep.push(o);
        return;
      }
      keep.push(e);
    });
    T.edges = keep;
    T.nodes = (T.nodes || []).filter(function (n) { return !(n && moved[str(n.id)]); });
    T.groups = (T.groups || []).filter(function (g) { return !(g && inG[str(g.id)] && str(g.id) !== blockId); });
    var notesIn = [], notesKeep = [];
    (Array.isArray(T.notes) ? T.notes : []).forEach(function (q) {
      var about = q && (Array.isArray(q.attach) ? q.attach.map(str) : [str(q.attach)]);
      if (q && about.some(function (x) { return moved[x] || (inG[x] && x !== blockId); })) { var c = edClone(q); shift(c); notesIn.push(c); } else notesKeep.push(q);
    });
    if (notesIn.length) { D.notes = notesIn; T.notes = notesKeep; }
    frame.detail = D.id;
  } else {
    /* a block of an overview: the new tab starts with its ports, the inside is drawn there */
    var c = hierCentres(doc, ti);
    hierPortsOf(T, blockId).forEach(function (q) { q.side = hierSideFor(q, c[blockId] || { x: 0, y: 0 }, c); hierAddPort(D, null, q, q.side); });
    node.detail = D.id;
  }
  if (!D.groups.length) delete D.groups;
  var at2 = ti + 1;
  while (at2 < doc.diagrams.length && doc.diagrams[at2] && doc.diagrams[at2].detailOf && str(doc.diagrams[at2].detailOf.tab) === tid) at2++;
  doc.diagrams.splice(at2, 0, D);
  return { raw: doc, index: at2 };
}
/* A bend point moved by dx, dy, in the form it came in: [x, y] (this tool) or {x, y} (read from draw.io). */
function hierMovePt(p, dx, dy) {
  if (Array.isArray(p)) return [Math.round(+p[0] + dx), Math.round(+p[1] + dy)];
  if (p && typeof p === 'object' && finiteNum(p.x) !== null) { var q = edClone(p); q.x = Math.round(+p.x + dx); q.y = Math.round(+p.y + dy); return q; }
  return p;
}
function hierShiftEdge(e, dx, dy) {
  var mv = function (p) { return hierMovePt(p, dx, dy); };
  if (Array.isArray(e.points)) e.points = e.points.map(mv);
  if (e.fromPoint) e.fromPoint = mv(e.fromPoint);
  if (e.toPoint) e.toPoint = mv(e.toPoint);
}

/* ---------- checks across tabs (shown in the editor's Checks list) ---------- */
function hierIssues(raw, ti) {
  var d = raw && raw.diagrams ? raw.diagrams[ti] : null, out = [];
  if (!hierIsGraph(d)) return out;
  var id = hierTabId(d, ti);
  if (str(d.boardOf)) {
    var o = hierFind(raw, str(d.boardOf));
    if (!o) out.push({ text: hl('iNoBoard', hq(str(d.boardOf))) });
    else {
      var ov = asNodes(o.d), keys = {};
      hierEdges(o.d).forEach(function (e) { keys[e.key] = true; });
      (d.groups || []).forEach(function (g) { if (g && str(g.source) && !ov[str(g.source)]) out.push({ text: hl('iGoneBlock', hq(str(asText(g.label)) || str(g.id)), hq(str(g.source)), hq(str(asText(o.d.title)) || str(d.boardOf))), group: str(g.id) }); });
      (d.edges || []).forEach(function (e, k) { if (e && str(e.source) && !keys[str(e.source)]) out.push({ text: hl('iGoneWire', hq(str(e.source).replace('>', ' → ')), hq(str(asText(o.d.title)) || str(d.boardOf))), edge: k }); });
    }
  }
  var nodes = asNodes(d), groups = asGroupIds(d);
  [].concat(d.groups || [], d.nodes || []).forEach(function (x) {
    if (x && str(x.detail) && !hierFind(raw, str(x.detail))) out.push({ text: hl('iNoDetail', hq(str(asText(x.label || x.title)) || str(x.id)), hq(str(x.detail))), id: str(x.id) });
  });
  /* a frame with something drawn inside: every port should be wired to it */
  (d.groups || []).forEach(function (g) {
    if (!g || !str(g.source) || str(g.detail)) return;
    var gid = str(g.id), inside = (d.nodes || []).some(function (n) { return n && str(n.group) === gid && !(n.port && str(n.port.of) === gid); });
    if (!inside) return;
    hierPorts(d, gid).forEach(function (pn) {
      var wired = (d.edges || []).some(function (e) { return e && ((str(e.from) === str(pn.id) && !hierIsExtEnd(pn, e.fromAnchor)) || (str(e.to) === str(pn.id) && !hierIsExtEnd(pn, e.toAnchor))); });
      if (!wired) out.push({ text: hl('iPortFree', hq(str(pn.port.name)), hq(str(asText(g.label)) || gid)), id: str(pn.id), soft: true });
    });
  });
  hierNamingIssues(d, ti).forEach(function (q) { out.push(q); });
  /* a note still attached to a block, frame or wire that was removed (the AI reroutes a wire and the reason written on
     it loses its place): attach it to what is left of it, or leave it free */
  (d.notes || []).forEach(function (q) {
    if (!q || q.attach === undefined || q.attach === null || q.attach === '' || hierAttachOk(d, q.attach)) return;
    var head = str(asText(q.text)).split('\n')[0], short = head.length > 48 ? head.slice(0, 47) + '…' : head;
    var what = Array.isArray(q.attach) ? str(q.attach[0]) + ' → ' + str(q.attach[1]) : str(q.attach), fixes = [];
    var left = Array.isArray(q.attach) ? q.attach.map(str).filter(function (x) { return nodes[x] || groups[x]; }) : [];
    if (left.length) fixes.push({ label: hl('fNoteTo', hq(left[0])), safe: true, ops: [{ op: 'updateNote', id: str(q.id), set: { attach: left[0] } }] });
    fixes.push({ label: ht('fNoteFree'), safe: !left.length, ops: [{ op: 'updateNote', id: str(q.id), set: { attach: null } }] });
    out.push({ text: hl('iNoteGone', hq(short), hq(what)), fixes: fixes });
  });
  void id;
  return out;
}
function hierIsExtEnd(n, a) { var e = hierExt(n), p = normAnchor(a); return !!p && Math.abs(p.x - e.x) < 0.02 && Math.abs(p.y - e.y) < 0.02; }

/* ---------- sticky notes: ops for the editor, AI and scripts ---------- */
var NOTE_KEYS = ['text', 'kind', 'attach', 'x', 'y', 'dx', 'dy', 'w', 'date', 'by'];
function hierToday() { var d = new Date(), p = function (v) { return (v < 10 ? '0' : '') + v; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function hierNoteId(d) { var used = {}; (d.notes || []).forEach(function (q) { if (q && q.id) used[str(q.id)] = true; }); var k = (d.notes || []).length + 1; while (used['n' + k]) k++; return 'n' + k; }
function hierAttachOk(d, att) {
  if (att === undefined || att === null || att === '') return true;
  if (Array.isArray(att)) return att.length === 2 && (d.edges || []).some(function (e) { return e && str(e.from) === str(att[0]) && str(e.to) === str(att[1]); });
  return !!(asNodes(d)[str(att)] || asGroupIds(d)[str(att)]);
}
AS_OPS.tidyFrame = function (d, op) { return hierTidyFrame(d, str(op.id)); };
/* every wire of a hand-placed tab that runs under a block gets a path round the blocks */
/* (in a tab laid out automatically there is nothing to do: the layout keeps wires off the blocks). `wires`, a list of
   [from, to] (a pin after a dot is allowed), limits it to those wires. */
AS_OPS.routeAround = function (d, op) {
  if (d.layout !== 'manual' && d.layout !== 'fixed') return null;
  var only = null, via = null, ids = asNodes(d), bare = function (v) { v = str(v); return ids[v] || v.indexOf('.') < 0 ? v : v.slice(0, v.lastIndexOf('.')); };
  if (Array.isArray(op.wires)) {
    only = {};
    op.wires.forEach(function (w) { if (Array.isArray(w) && w.length === 2) only[bare(w[0]) + '>' + bare(w[1])] = true; });
  }
  if (Array.isArray(op.blocks)) {
    via = {};
    op.blocks.forEach(function (b) { via[str(b)] = true; });
  }
  hierUnblock(d, only, via);
  return null;
};
AS_OPS.arrange = function (d, op) {
  var style = str(op.style) || 'bus';
  if (style === 'stages') return hierArrangeStages(d);
  if (style !== 'bus') return hl('eArrangeStyle', hq(style));
  return hierArrangeBus(d);
};
AS_OPS.addNote = function (d, op, touched) {
  var q = op.note && typeof op.note === 'object' ? op.note : null;
  if (!q || !str(asText(q.text))) return lang === 'vi' ? 'ghi chú cần có nội dung (text)' : 'a note needs text';
  if (q.kind !== undefined && NOTE_KINDS.indexOf(q.kind) < 0) return (lang === 'vi' ? 'loại ghi chú không có: ' : 'unknown note kind: ') + str(q.kind);
  if (!hierAttachOk(d, q.attach)) return (lang === 'vi' ? 'ghi chú gắn vào thứ không có trong tab: ' : 'the note is attached to something not in this tab: ') + JSON.stringify(q.attach);
  d.notes = Array.isArray(d.notes) ? d.notes : [];
  var id = str(q.id) && !d.notes.some(function (x) { return x && str(x.id) === str(q.id); }) ? str(q.id) : hierNoteId(d);
  var c = { id: id };
  NOTE_KEYS.forEach(function (k) { if (q[k] !== undefined && q[k] !== null && q[k] !== '') c[k] = k === 'text' ? String(asText(q[k])) : edClone(q[k]); });
  if (!c.date) c.date = hierToday();
  d.notes.push(c);
  touched.push('note:' + id);
  return null;
};
AS_OPS.updateNote = function (d, op) {
  var q = (d.notes || []).filter(function (x) { return x && str(x.id) === str(op.id); })[0];
  if (!q) return (lang === 'vi' ? 'không có ghi chú ' : 'no note ') + str(op.id);
  var set = op.set && typeof op.set === 'object' ? op.set : {};
  if (set.kind !== undefined && set.kind !== null && NOTE_KINDS.indexOf(set.kind) < 0) return (lang === 'vi' ? 'loại ghi chú không có: ' : 'unknown note kind: ') + str(set.kind);
  if ('attach' in set && !hierAttachOk(d, set.attach)) return (lang === 'vi' ? 'ghi chú gắn vào thứ không có trong tab: ' : 'the note is attached to something not in this tab: ') + JSON.stringify(set.attach);
  Object.keys(set).forEach(function (k) {
    if (NOTE_KEYS.indexOf(k) < 0) return;
    if (set[k] === null || set[k] === '') { if (k !== 'text') delete q[k]; } else q[k] = k === 'text' ? String(asText(set[k])) : edClone(set[k]);
  });
  (Array.isArray(op.unset) ? op.unset : []).forEach(function (k) { if (k !== 'id' && k !== 'text') delete q[k]; });
  return null;
};
AS_OPS.removeNote = function (d, op) {
  var before = (d.notes || []).length;
  d.notes = (d.notes || []).filter(function (x) { return !(x && str(x.id) === str(op.id)); });
  return d.notes.length === before ? (lang === 'vi' ? 'không có ghi chú ' : 'no note ') + str(op.id) : null;
};

/* ---------- notes written from the diagram: rules, no AI ---------- */
function hierNoteIdeas(raw, ti, st, ids) {
  var d = raw.diagrams[ti], out = [], seen = {};
  if (!hierIsGraph(d)) return out;
  var nodes = asNodes(d), groups = asGroupIds(d), edges = (d.edges || []).filter(Boolean);
  var add = function (kind, text, attach, hint) {
    if (seen[text] || out.length >= 6) return;
    if ((d.notes || []).some(function (q) { return q && str(q.text) === text; })) return;
    seen[text] = true;
    out.push({ kind: kind, text: text, attach: attach || null, hint: hint || null });
  };
  /* the ports of a frame by direction, for "not drawn yet" */
  var portList = function (gid) {
    var by = { in: [], out: [], inout: [] };
    hierPorts(d, gid).forEach(function (pn) { var k = str(pn.port.dir); (by[k] || by.inout).push(str(pn.port.name)); });
    var parts = [];
    ['in', 'out', 'inout'].forEach(function (k) { if (by[k].length) parts.push(hl('ideaPorts_' + k, by[k].join(', '))); });
    return parts.length ? parts.join('; ') : ht('ideaNone');
  };
  var name = function (id) { return nodes[id] ? hierTitle(nodes[id]) : groups[id] ? (str(asText(groups[id].label)) || id) : id; };
  var targets = (ids && ids.length ? ids : []).filter(function (id) { return nodes[id] || groups[id]; });
  var words = function (n) { return normText(hierTitle(n) + ' ' + str(asText(n.desc)) + ' ' + str(n.shape) + ' ' + str(n.icon)); };
  var clockOf = function (id) { var f = asFeedingClock(d, id); return f || null; };
  targets.forEach(function (id) {
    var n = nodes[id], g = groups[id];
    if (g) {
      var inside = (d.nodes || []).some(function (x) { return x && str(x.group) === id && !(x.port && str(x.port.of) === id); });
      if (str(g.source) && !inside && !str(g.detail)) add('todo', hl('ideaEmpty', hq(name(id)), portList(id)), id);
      if (inside) {
        var free = hierIssues(raw, ti).filter(function (q) { return q.soft && hierPorts(d, id).some(function (pn) { return str(pn.id) === q.id; }); }).map(function (q) { return str(nodes[q.id] && nodes[q.id].port.name); });
        if (free.length) add('todo', hl('ideaPortsFree', hq(name(id)), free.join(', ')), id);
      }
      return;
    }
    if (!n) return;
    var shape = normShape(n.shape), w = words(n);
    /* clock domains: data from a block on another clock */
    var mine = clockOf(id);
    edges.forEach(function (e) {
      if (str(e.to) !== id || e.kind === 'clock' || e.kind === 'reset') return;
      var other = str(e.from), theirs = clockOf(other);
      if (mine && theirs && mine !== theirs && shape !== 'sync' && normShape((nodes[other] || {}).shape) !== 'sync')
        add('constraint', hl('ideaCdc', hq(str(asText(e.label)) || name(other)), hq(name(theirs)), hq(name(mine))), id);
    });
    edges.forEach(function (e) {
      if (str(e.to) !== id || e.kind !== 'reset') return;
      var src = nodes[str(e.from)];
      if (src && normShape(src.shape) !== 'sync' && !/sync|đồng bộ/.test(words(src))) add('reason', hl('ideaRst', hq(str(asText(e.label)) || name(str(e.from))), hq(name(id))), id);
    });
    if (shape === 'clockgate' || /\bicg\b|clock gate|cổng clock/.test(w)) add('constraint', hl('ideaIcg', hq(name(id))), id);
    var used = asUsed(d);
    asFreePins(d, id, used, ['in', 'clk']).slice(0, 2).forEach(function (p) { add('question', hl('ideaFreePin', hq(p.name), hq(name(id))), id); });
    var deg = edges.filter(function (e) { return str(e.from) === id || str(e.to) === id; }).length;
    if (deg >= 4) add('question', hl('ideaHub', hq(name(id)), deg), id);
    if (shape === 'ram' || shape === 'rom' || shape === 'fifo' || /\b(sram|dram|rom|ram|memory|bộ nhớ)\b/.test(w)) add('constraint', hl('ideaMem', hq(name(id))), id);
    if (/\b(axi|apb|ahb|tl-?ul|bus|interconnect|crossbar)\b/.test(w)) add('constraint', hl('ideaBus', hq(name(id))), id);
    if (shape === 'database' || /\b(database|postgres|mysql|db|csdl)\b/.test(w)) add('question', hl('ideaDb', hq(name(id))), id);
    if (shape === 'queue' || /\b(queue|kafka|rabbitmq|sqs|hàng đợi)\b/.test(w)) add('constraint', hl('ideaQueue', hq(name(id))), id);
    if (n.external === true || shape === 'api' || /\b(api|external|third[- ]party|bên ngoài)\b/.test(w)) add('constraint', hl('ideaExt', hq(name(id))), id);
    if (shape === 'decision') add('reason', hl('ideaDecision', hq(name(id))), id);
    add('change', hl('ideaChange', noteDate(hierToday())), id, hl('ideaChangeHint', noteDate(hierToday())));
    add('reason', hl('ideaWhy', hq(name(id))), id, hl('ideaWhyHint', hq(name(id))));
  });
  if (!targets.length) {
    /* the whole tab: empty frames first, then a colour legend */
    (d.groups || []).forEach(function (g) {
      if (!g || !str(g.source) || str(g.detail)) return;
      var gid = str(g.id), inside = (d.nodes || []).some(function (x) { return x && str(x.group) === gid && !(x.port && str(x.port.of) === gid); });
      if (!inside) add('todo', hl('ideaEmpty', hq(name(gid)), portList(gid)), gid);
    });
    var colors = {};
    (d.nodes || []).forEach(function (n) { if (n && n.color && !n.port) colors[n.color] = true; });
    (d.groups || []).forEach(function (g) { if (g && g.color) colors[g.color] = true; });
    var list = Object.keys(colors);
    var noLegend = !(d.notes || []).some(function (q) { return q && q.kind === 'legend'; }) && !(d.legend && d.legend.colors && Object.keys(d.legend.colors).length);
    if (list.length >= 2 && noLegend) {
      var cn = ht('colorNames');
      add('legend', hl('ideaLegend', list.map(function (c) { return (cn[c] || c) + ' = …'; }).join(', ')), null);
    }
    add('change', hl('ideaChange', noteDate(hierToday())), null, hl('ideaChangeHint', noteDate(hierToday())));
  }
  void st;
  return out;
}

/* ====================== in the editor: boards, inside tabs, frames and notes ====================== */
function hierGoTab(i) {
  if (!ED || !ED.raw.diagrams[i]) return;
  ED.diag = i; ED.selected = null; ED.multi = null; ED.gsel = null; ED.nsel = null;
  edBuildForm();
  edRender();
}
function hierTabOf(i) { return ED.raw.diagrams.map(function (x, k) { return { d: x, i: k }; }).filter(function (q) { return str(q.d.boardOf) === hierTabId(ED.raw.diagrams[i], i); })[0] || null; }
/* Buttons beside the tab picker: build or open the detail board, or go back up from a board or an inside tab. */
function hierPickButtons(pick) {
  var d = edDiagram();
  if (!hierIsGraph(d)) return;
  var up = str(d.boardOf) || (d.detailOf && str(d.detailOf.tab));
  if (up) {
    var t0 = hierFind(ED.raw, up);
    if (!t0) return;
    var b0 = H('button', { type: 'button', class: 'tb-btn ed-hier-btn', title: str(asText(t0.d.title)) || up, text: '↰ ' + (str(asText(t0.d.title)) || up) });
    b0.addEventListener('click', function () { hierGoTab(t0.i); });
    pick.appendChild(b0);
    return;
  }
  if (!(d.nodes || []).length) return;
  var board = hierTabOf(ED.diag);
  var b = H('button', { type: 'button', class: 'tb-btn ed-hier-btn', title: board ? ht('openBoard') : ht('buildTitle'), text: board ? '↘ ' + ht('openBoard') : '▦ ' + ht('build') });
  b.addEventListener('click', function () { if (board) hierGoTab(board.i); else hierBuildNow(); });
  pick.appendChild(b);
}
function hierBuildNow() {
  var r = hierBuildBoard(ED.raw, ED.diag);
  if (r.error) return;
  if (r.existed) { hierGoTab(r.index); return; }
  ED.raw = r.raw; ED.diag = r.index; ED.selected = null; ED.multi = null; ED.gsel = null; ED.nsel = null;
  edChanged(true, ht('lBoard'));
  edRender();
  hierFitSoon();
}
function hierOpenInsideNow(id) {
  var d = edDiagram(), g = asGroupIds(d)[id], n = asNodes(d)[id], name = g ? (str(asText(g.label)) || id) : hierTitle(n);
  var r = hierOpenInside(ED.raw, ED.diag, id);
  if (r.error) return;
  if (r.existed) { hierGoTab(r.index); return; }
  ED.raw = r.raw; ED.diag = r.index; ED.selected = null; ED.multi = null; ED.gsel = null; ED.nsel = null;
  edChanged(true, hl('lInside', name));
  edRender();
  hierFitSoon();
}
function hierFitSoon() { setTimeout(function () { if (active) { active.scale = null; active.userFit = true; applyZoom(active); } }, 30); }

/* The notes pane: every note of the tab as a row. */
function hierNotesPane(d, pane) {
  var kinds = NOTE_KINDS.map(function (k) { return [k, (t('noteKinds') || {})[k] || k]; });
  var about = function () {
    return [['', ht('noteFree')]].concat(
      (d.groups || []).filter(function (g) { return g && str(g.id); }).map(function (g) { return [str(g.id), '▭ ' + (str(asText(g.label)) || str(g.id))]; }),
      (d.nodes || []).filter(function (n) { return n && str(n.id) && !n.port; }).map(function (n) { return [str(n.id), hierTitle(n)]; }));
  };
  pane.appendChild(H('p', { class: 'ed-note', text: ht('noteAddTitle') }));
  pane.appendChild(edTable({
    rows: function () {
      if (Array.isArray(d.notes)) return d.notes;
      var tmp = [];
      tmp.push = function (x) { d.notes = [x]; return 1; };
      return tmp;
    },
    rowKey: function (q) { return 'note:' + str(q.id); }, name: ht('notes'), vkey: 'notes',
    cols: [
      { k: 'text', label: ht('noteText'), req: true, type: 'area' },
      { k: 'kind', label: ht('noteKind'), type: 'select', options: kinds, w: '104px' },
      { k: 'attach', label: ht('noteAttach'), type: 'select', options: about, w: '132px', structural: true,
        get: function (q) { return Array.isArray(q.attach) ? '' : str(q.attach); }, set: function (q, v) { if (v) { q.attach = v; delete q.x; delete q.y; } else delete q.attach; } }
    ],
    /* the text needs the room: date and author sit under ⋯ */
    extra: function (q) {
      var box = H('div', { class: 'ed-more' });
      edGroup(box, ht('noteWhen'), [
        [ht('noteDate'), edInput(str(q.date), function (v) { setOrDelete(q, 'date', v.trim()); edChanged(false); }, { placeholder: 'YYYY-MM-DD' })],
        [ht('noteBy'), edInput(str(q.by), function (v) { setOrDelete(q, 'by', v.trim()); edChanged(false); })]
      ]);
      return box;
    },
    add: function () { notesOnForEdit(); return { id: hierNoteId(d), text: ht('noteNew'), kind: 'note', date: hierToday() }; },
    addLabel: '+ ' + ht('noteAdd'), paste: false, note: false
  }));
}
function notesOnForEdit() { if (!notesShown()) storageSet('ad-notes', 'on'); }

/* Selection of frames (ED.gsel) and of one note (ED.nsel), next to the blocks (ED.selected / ED.multi). */
function hierFrameAt(st, ev) {
  if (!st || !st.L || !st.L.groups) return null;
  var pt = edPoint(st, ev), best = null;
  st.d.groups.forEach(function (g) {
    var b = st.L.groups[g.id];
    if (!b || g.hidden || !g.source) return;
    if (pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h && (!best || b.w * b.h < best.a)) best = { id: g.id, a: b.w * b.h };
  });
  return best ? best.id : null;
}
function hierClearSel() { ED.gsel = null; ED.nsel = null; }
function hierCanvasClick(ev) {
  if (!ED || !active || !active.svg || active.d.kind !== 'graph' || !active.svg.contains(ev.target)) return false;
  var noteEl = ev.target.closest ? ev.target.closest('.note-sticky') : null;
  if (noteEl) {
    ev.stopPropagation();
    ED.selected = null; ED.multi = null; ED.gsel = null; ED.nsel = noteEl.getAttribute('data-note');
    edMarkSelection();
    return true;
  }
  if (ev.target.closest && ev.target.closest('.node, .edge, .ed-h')) { hierClearSel(); return false; }
  var chip = ev.target.closest ? ev.target.closest('.group-label') : null;
  var gid = chip ? chip.getAttribute('data-id') : hierFrameAt(active, ev);
  if (!gid || !active.d.groupById[gid] || !(active.d.groupById[gid].source || chip)) { hierClearSel(); return false; }
  ev.stopPropagation();
  ED.selected = null; ED.multi = null; ED.nsel = null;
  var list = (ev.shiftKey || ev.metaKey || ev.ctrlKey) && ED.gsel ? ED.gsel.slice() : [], k = list.indexOf(gid);
  if (k >= 0) list.splice(k, 1); else list.push(gid);
  ED.gsel = list.length ? list : null;
  edMarkSelection();
  return true;
}
function hierDblClick(ev) {
  if (!ED || !active || !active.svg || active.d.kind !== 'graph' || !active.svg.contains(ev.target)) return false;
  var noteEl = ev.target.closest ? ev.target.closest('.note-sticky') : null;
  if (noteEl) { ev.stopPropagation(); hierInlineNote(active, noteEl.getAttribute('data-note')); return true; }
  if (ev.target.closest && ev.target.closest('.node, .edge, .ed-h')) return false;
  var chip = ev.target.closest ? ev.target.closest('.group-label') : null, gid = chip ? chip.getAttribute('data-id') : hierFrameAt(active, ev);
  var g = gid ? active.d.groupById[gid] : null;
  if (g && g.detail) { ev.stopPropagation(); goToTab(g.detail); return true; }
  return false;
}
function hierKey(ev) {
  if (!ED || !active || active.d.kind !== 'graph' || edTyping(ev) || ev.ctrlKey || ev.metaKey || ev.altKey) return false;
  var key = (ev.key || '').toLowerCase();
  if (key === 'n' && !ev.shiftKey) { ev.preventDefault(); hierAddNote(); return true; }
  if (ED.nsel && (ev.key === 'Delete' || ev.key === 'Backspace')) {
    ev.preventDefault();
    var d = edDiagram(), id = ED.nsel;
    d.notes = (d.notes || []).filter(function (q) { return !(q && str(q.id) === id); });
    ED.nsel = null;
    edChanged(true, ht('lNoteDel'));
    return true;
  }
  if ((ED.nsel || ED.gsel) && ev.key === 'Escape') { hierClearSel(); edMarkSelection(); return true; }
  if (ED.gsel && (ev.key === 'Delete' || ev.key === 'Backspace') && !ED.selected) { ev.preventDefault(); return true; }
  return false;
}
/* A note for what is selected (a block, a frame, a wire), or a free note in the middle of the view. */
function hierAddNote(text, kind, attachTo) {
  var d = edDiagram(), st = active;
  if (!hierIsGraph(d) || !st) return;
  notesOnForEdit();
  var att = attachTo !== undefined ? attachTo : ED.gsel && ED.gsel.length ? ED.gsel[0] : ED.selected && ED.selected.id !== undefined ? ED.selected.id
          : ED.selected && ED.selected.edge !== undefined && d.edges[ED.selected.edge] ? [str(d.edges[ED.selected.edge].from), str(d.edges[ED.selected.edge].to)] : null;
  var q = { id: hierNoteId(d), text: text || ht('noteNew'), kind: kind || 'note', date: hierToday() };
  if (att) q.attach = att;
  else if (st.L) {
    var c = edViewCenter ? edViewCenter() : null;
    if (c) { q.x = Math.round(c.x / 10) * 10; q.y = Math.round(c.y / 10) * 10; }
  }
  d.notes = Array.isArray(d.notes) ? d.notes : [];
  d.notes.push(q);
  ED.nsel = q.id; ED.selected = null; ED.multi = null; ED.gsel = null;
  edChanged(true, ht('lNoteAdd'));
  if (!text) setTimeout(function () { if (active) hierInlineNote(active, q.id); }, 60);
}
function hierInlineNote(st, id) {
  var d = edDiagram(), q = (d.notes || []).filter(function (x) { return x && str(x.id) === id; })[0];
  var b = st && st.L && st.L.notes ? st.L.notes.filter(function (x) { return x.id === id; })[0] : null;
  if (!q || !b) return;
  var old = st.canvas.querySelector('.ed-inline-edit');
  if (old) old.remove();
  var s = svgScale(st), off = svgOffset(st), text = String(q.text || '');
  var ta = H('textarea', { class: 'ed-inline-edit ed-note-edit', spellcheck: 'true', 'aria-label': ht('noteText') });
  ta.value = text;
  ta.style.left = Math.round(off.x + (b.x + st.L.ox) * s) + 'px';
  ta.style.top = Math.round(off.y + (b.y + st.L.oy) * s) + 'px';
  ta.style.width = Math.round(Math.max(b.w, 200) * s) + 'px';
  ta.style.height = Math.round(Math.max(b.h, 90) * s) + 'px';
  st.canvas.appendChild(ta);
  ta.focus();
  if (text === ht('noteNew')) ta.select(); else ta.setSelectionRange(text.length, text.length);
  var done = false;
  var finish = function (save) {
    if (done) return;
    done = true;
    var v = ta.value.trim();
    ta.remove();
    if (!save || v === text) return;
    if (!v) d.notes = d.notes.filter(function (x) { return x !== q; }); else q.text = v;
    edChanged(true, v ? ht('lNoteEdit') : ht('lNoteDel'));
  };
  ta.addEventListener('keydown', function (ev) {
    ev.stopPropagation();
    if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
    else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); finish(true); }
  });
  ta.addEventListener('blur', function () { finish(true); });
}

/* Dragging a note, or a frame by its name tag (the frame takes its ports and everything inside along). */
function hierPointerDown(ev) {
  if (!ED || !active || active.d.kind !== 'graph' || ev.button !== 0 || !active.svg || !active.svg.contains(ev.target)) return false;
  var noteEl = ev.target.closest ? ev.target.closest('.note-sticky') : null;
  if (noteEl) { ED.drag = { hier: 'note', id: noteEl.getAttribute('data-note'), sx: ev.clientX, sy: ev.clientY, started: false, el: noteEl, tr: noteEl.getAttribute('transform') || '' }; ev.preventDefault(); return true; }
  var chip = ev.target.closest ? ev.target.closest('.group-label') : null, gid = chip && chip.getAttribute('data-id');
  var d = edDiagram();
  if (gid && active.d.groupById[gid] && d.layout === 'manual') { ED.drag = { hier: 'frame', id: gid, sx: ev.clientX, sy: ev.clientY, started: false }; ev.preventDefault(); return true; }
  return false;
}
function hierDescendants(st, gid) {
  var inG = {}; inG[gid] = true;
  for (var pass = 0; pass < 20; pass++) st.d.groups.forEach(function (g) { if (g.parent && inG[g.parent]) inG[g.id] = true; });
  var nodes = st.d.nodes.filter(function (n) { return n.group && inG[n.group]; }).map(function (n) { return n.id; });
  return { groups: inG, nodes: nodes };
}
function hierPointerMove(ev) {
  var dr = ED.drag;
  if (!dr.started) {
    if (Math.abs(ev.clientX - dr.sx) + Math.abs(ev.clientY - dr.sy) < 4) return;
    dr.started = true;
    ED.suppressClick = true;
    dr.st = active;
    edHideEdgeBar();
    var ovl = active.svg.querySelector('.ed-overlay');
    if (ovl) ovl.remove();
    if (ED.actBar) { ED.actBar.remove(); ED.actBar = null; }
    if (dr.hier === 'frame') {
      var st = active, m = hierDescendants(st, dr.id);
      dr.members = m;
      dr.start = {};
      m.nodes.forEach(function (id) { var q = st.L.nodes[id]; if (q && st.nodeEls[id]) dr.start[id] = { x: q.x, y: q.y, tr: st.nodeEls[id].getAttribute('transform') || '' }; });
      dr.gstart = {};
      Object.keys(m.groups).forEach(function (g) { var b = st.L.groups[g]; if (b) dr.gstart[g] = { x: b.x, y: b.y }; });
      dr.els = Array.prototype.filter.call(st.svg.querySelectorAll('.group[data-id], .group-label[data-id], .frame-hint[data-id], .frame-detail[data-id]'), function (el) { return m.groups[el.getAttribute('data-id')]; })
        .map(function (el) { return { el: el, tr: el.getAttribute('transform') || '' }; });
      dr.notes = Array.prototype.filter.call(st.svg.querySelectorAll('.note-sticky'), function (el) {
        var b = (st.L.notes || []).filter(function (x) { return x.id === el.getAttribute('data-note'); })[0], a = b && b.q.attach;
        return a && ((a.type === 'node' && dr.start[a.id]) || (a.type === 'group' && m.groups[a.id]));
      }).map(function (el) { return { el: el, tr: el.getAttribute('transform') || '' }; });
    }
  }
  var s = svgScale(dr.st), dx = Math.round((ev.clientX - dr.sx) / s / 10) * 10, dy = Math.round((ev.clientY - dr.sy) / s / 10) * 10;
  if (ev.altKey) { dx = (ev.clientX - dr.sx) / s; dy = (ev.clientY - dr.sy) / s; }
  dr.dx = dx; dr.dy = dy;
  var tr = 'translate(' + fmt(dx) + ' ' + fmt(dy) + ') ';
  if (dr.hier === 'note') { dr.el.setAttribute('transform', tr + dr.tr); return; }
  var st2 = dr.st, moved = {};
  Object.keys(dr.start).forEach(function (id) {
    var q = st2.L.nodes[id], o = dr.start[id];
    q.x = o.x + dx; q.y = o.y + dy;
    st2.nodeEls[id].setAttribute('transform', tr + o.tr);
    (st2.adj[id] || []).forEach(function (i) { moved[i] = true; });
  });
  Object.keys(dr.gstart).forEach(function (g) { var b = st2.L.groups[g]; b.x = dr.gstart[g].x + dx; b.y = dr.gstart[g].y + dy; });
  dr.els.concat(dr.notes).forEach(function (x) { x.el.setAttribute('transform', tr + x.tr); });
  Object.keys(moved).forEach(function (i) { edLiveEdge(st2, +i); });
}
function hierPointerUp(ev, dr) {
  if (!dr.started) return;
  setTimeout(function () { if (ED) ED.suppressClick = false; }, 0);
  var d = edDiagram(), dx = dr.dx || 0, dy = dr.dy || 0;
  if (!dx && !dy) { edRender(); return; }
  if (dr.hier === 'note') {
    var q = (d.notes || []).filter(function (x) { return x && str(x.id) === dr.id; })[0], b = (dr.st.L.notes || []).filter(function (x) { return x.id === dr.id; })[0];
    if (!q || !b) return;
    if (b.target) { q.dx = Math.round(b.x + dx - (b.target.x + b.target.w)); q.dy = Math.round(b.y + dy - b.target.y); }
    else { q.x = Math.round(b.x + dx); q.y = Math.round(b.y + dy); }
    ED.nsel = dr.id;
    edChanged(false, ht('lNoteMove'));
    return;
  }
  /* a frame: its box, the frames inside it, its blocks and ports, and the bends of the wires inside all move */
  var m = dr.members, inside = {};
  m.nodes.forEach(function (id) { inside[id] = true; });
  (d.groups || []).forEach(function (g) {
    if (!g || !m.groups[str(g.id)]) return;
    if (finiteNum(g.x) !== null && finiteNum(g.y) !== null) { g.x = Math.round(+g.x + dx); g.y = Math.round(+g.y + dy); }
  });
  (d.nodes || []).forEach(function (n) {
    if (!n || !inside[str(n.id)]) return;
    var P = dr.st.L.nodes[str(n.id)];
    if (P) { n.x = Math.round(P.x - P.w / 2); n.y = Math.round(P.y - P.h / 2); }
  });
  (d.edges || []).forEach(function (e) {
    if (!e) return;
    var a = inside[str(e.from)] || m.groups[str(e.from)], b = inside[str(e.to)] || m.groups[str(e.to)];
    if (a && b && Array.isArray(e.points)) e.points = e.points.map(function (p) { return hierMovePt(p, dx, dy); });
    else if ((a || b) && Array.isArray(e.points)) delete e.points;
  });
  ED.gsel = [dr.id];
  edChanged(false, el('lMove', dr.id));
}

/* After every selection change: outline the selected frames and note, and show the actions next to them. */
function hierAfterSelect() {
  if (!ED || !active || !active.svg || active.d.kind !== 'graph' || !active.L) return;
  if (ED.actBar) { ED.actBar.remove(); ED.actBar = null; }
  var st = active, root = st.svg.querySelector('g.root');
  Array.prototype.forEach.call(st.svg.querySelectorAll('.note-sticky.sel'), function (x) { x.classList.remove('sel'); });
  var old = st.svg.querySelector('.hier-overlay');
  if (old) old.remove();
  if (ED.gsel) ED.gsel = ED.gsel.filter(function (g) { return st.L.groups[g]; });
  if (ED.gsel && !ED.gsel.length) ED.gsel = null;
  if (ED.nsel && st.nodeEls && st.svg.querySelector('.note-sticky[data-note="' + edCss(ED.nsel) + '"]')) st.svg.querySelector('.note-sticky[data-note="' + edCss(ED.nsel) + '"]').classList.add('sel');
  var k = 1 / svgScale(st);
  if (ED.gsel && root) {
    var ov = S('g', { class: 'hier-overlay' });
    ED.gsel.forEach(function (g) {
      var b = st.L.groups[g];
      ov.appendChild(S('rect', { x: fmt(b.x - 4 * k), y: fmt(b.y - 4 * k), width: fmt(b.w + 8 * k), height: fmt(b.h + 8 * k), rx: fmt(10 * k), fill: 'none', style: ED_ACCENT, 'stroke-width': fmt(2 * k), 'stroke-dasharray': '6 4', 'pointer-events': 'none' }));
    });
    root.appendChild(ov);
  }
  var targets = hierSelTargets();
  if (!targets.ids.length && !ED.nsel) return;
  hierActionBar(st, targets);
}
/* What the actions apply to: selected blocks, or selected frames. */
function hierSelTargets() {
  var ids = edSelIds(), kind = 'node';
  if (!ids.length && ED.gsel && ED.gsel.length) { ids = ED.gsel.slice(); kind = 'group'; }
  return { ids: ids, kind: kind };
}
function hierActionBar(st, targets) {
  var bar = H('div', { class: 'ed-edgebar ed-actbar', role: 'toolbar' });
  var btn = function (text, title, fn, cls) {
    var b = H('button', { type: 'button', class: 'ed-bb ed-bb-text' + (cls ? ' ' + cls : ''), title: title, text: text });
    b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
    bar.appendChild(b);
    return b;
  };
  var d = edDiagram(), ids = targets.ids, one = ids.length === 1 ? ids[0] : null;
  if (ED.nsel && !ids.length) {
    btn('✎', ht('noteText'), function () { hierInlineNote(st, ED.nsel); });
    btn('🗑', ht('noteDel'), function () { d.notes = (d.notes || []).filter(function (q) { return !(q && str(q.id) === ED.nsel); }); ED.nsel = null; edChanged(true, ht('lNoteDel')); });
  } else {
    if (typeof aiOpenBox === 'function') btn('✦ AI', typeof aiT === 'function' ? aiT('askTitle') : 'AI', function () { aiOpenBox(targets); }, 'ed-bb-ai');
    btn('🗒 ' + ht('noteAdd'), ht('noteAddTitle'), function () { hierAddNote(); });
    if (one) {
      var g = targets.kind === 'group' ? asGroupIds(d)[one] : null, n = targets.kind === 'node' ? asNodes(d)[one] : null;
      var link = (g && str(g.detail)) || (n && str(n.detail));
      if (link) btn('▸ ' + ht('openInside'), ht('openInside'), function () { goToTab(link); });
      else if ((g && str(g.source)) || (n && !n.port && !str(d.boardOf) && !d.detailOf && hierIsGraph(d))) btn('▸ ' + ht('inside'), ht('insideTitle'), function () { hierOpenInsideNow(one); });
      if (g && finiteNum(g.x) !== null && (d.nodes || []).some(function (x) { return x && str(x.group) === one && !x.port; }))
        btn('⟲ ' + ht('tidy'), ht('tidyTitle'), function () { edRunOps([{ op: 'tidyFrame', id: one }], hl('lTidy', hq(str(asText(g.label)) || one)), null); });
    }
  }
  /* above the top-right corner of what is selected */
  var x2 = -Infinity, y1 = Infinity;
  ids.forEach(function (id) {
    var p = targets.kind === 'group' ? st.L.groups[id] : st.L.nodes[id];
    if (!p) return;
    var bx = targets.kind === 'group' ? p.x + p.w : p.x + p.w / 2, by = targets.kind === 'group' ? p.y : p.y - p.h / 2;
    x2 = Math.max(x2, bx); y1 = Math.min(y1, by);
  });
  if (!ids.length && ED.nsel) {
    var nb = (st.L.notes || []).filter(function (x) { return x.id === ED.nsel; })[0];
    if (nb) { x2 = nb.x + nb.w; y1 = nb.y; }
  }
  if (x2 === -Infinity) return;
  var s = svgScale(st), off = svgOffset(st);
  st.canvas.appendChild(bar);
  hierPlaceIn(st.canvas, bar, off.x + (x2 + st.L.ox) * s - bar.offsetWidth, off.y + (y1 + st.L.oy) * s - 48);
  ED.actBar = bar;
}
/* Puts a bar or box at left, top in the drawing area, moved in as far as needed to stay in its visible part (a block at
   the edge of the view would otherwise leave its buttons cut off). */
function hierPlaceIn(canvas, el, left, top) {
  var w = el.offsetWidth, h = el.offsetHeight, x0 = canvas.scrollLeft || 0, y0 = canvas.scrollTop || 0;
  el.style.transform = 'none';
  el.style.left = Math.round(Math.max(x0 + 6, Math.min(left, x0 + canvas.clientWidth - w - 6))) + 'px';
  el.style.top = Math.round(Math.max(y0 + 6, Math.min(top, y0 + canvas.clientHeight - h - 6))) + 'px';
}

/* Notes written from the diagram, under the suggestions. */
function hierNoteBox(box) {
  if (!ED || !box) return;
  var d = edDiagram();
  if (!hierIsGraph(d) || !(d.nodes || []).length) return;
  var t0 = hierSelTargets(), ideas = hierNoteIdeas(ED.raw, ED.diag, edStateFor(d), t0.ids);
  if (!ideas.length) return;
  box.hidden = false;
  var wrap = H('div', { class: 'ed-sg-notes' }, [H('div', { class: 'ed-sg-head' }, [H('span', { title: ht('noteIdeasTitle'), text: '🗒 ' + ht('noteIdeas') })])]);
  var kinds = t('noteKinds') || {};
  ideas.forEach(function (x) {
    var b = H('button', { type: 'button', class: 'ed-sg ed-sg-note', 'data-kind': x.kind, title: ht('noteIdeasTitle') }, [H('b', { text: (kinds[x.kind] || x.kind) + ' · ' }), H('span', { text: x.hint || x.text })]);
    b.addEventListener('click', function () {
      var open = /: $/.test(x.text);
      hierAddNote(x.text, x.kind, x.attach);
      if (open) setTimeout(function () { if (active) hierInlineNote(active, ED.nsel); }, 80);
    });
    wrap.appendChild(b);
  });
  box.appendChild(wrap);
}

/* A tab's id changed: the boards, tabs and blocks that point to it follow. */
function hierRenameTab(raw, oldId, newId) {
  if (!raw || !oldId || !newId || oldId === newId) return;
  raw.diagrams.forEach(function (x) {
    if (!x) return;
    if (str(x.boardOf) === oldId) x.boardOf = newId;
    if (x.detailOf && str(x.detailOf.tab) === oldId) x.detailOf.tab = newId;
    [].concat(x.groups || [], x.nodes || []).forEach(function (o) { if (o && str(o.detail) === oldId) o.detail = newId; });
  });
}
/* Settings pane of a block diagram: how ports are named. */
function hierSetupRows(pane) {
  var sel = edInput(hierNaming(), function (v) { storageSet('ad-naming', v); edChanged(false); edRefreshChecks(); }, { type: 'select', title: ht('namingTitle'),
    options: [['prefix', ht('nPrefix')], ['suffix', ht('nSuffix')], ['off', ht('nOff')]] });
  edGroup(pane, ht('naming'), [[ht('naming'), sel, { hint: ht('namingTitle') }]]);
}

/* A block added into a frame (by AI, a script or a paste) lands inside the frame's box, clear of the other blocks and
   of the ports; the frame grows when it is full. A port added to a frame goes to the next free place on the side it
   was put nearest to, with the shape for that side. Models are poor at pixel sums, so geometry is settled here. */
function hierRealSize(n) {
  var shape = normShape(n.shape);
  if (CORE_SHAPES[shape] && shape === 'card') { var c = edClone(n); delete c.h; return asSize(c); }
  return asSize(n);
}
function hierOverlaps(b, boxes, gap) {
  return boxes.some(function (q) { return b.x < q.x + q.w + gap && b.x + b.w + gap > q.x && b.y < q.y + q.h + gap && b.y + b.h + gap > q.y; });
}
function hierFitFrame(d, n, g) {
  var pad = 40, top = 50, s = hierRealSize(n);
  var others = (d.nodes || []).filter(function (x) { return x && x !== n && finiteNum(x.x) !== null && finiteNum(x.y) !== null && (str(x.group) === str(g.id) || (x.port && str(x.port.of) === str(g.id))); })
    .map(function (x) { var z = hierRealSize(x); return { x: +x.x, y: +x.y, w: z.w, h: z.h }; });
  var inner = function () { return { x: +g.x + pad, y: +g.y + top, w: +g.w - pad * 2, h: +g.h - top - pad }; };
  var fits = function (x, y) { var r = inner(); return x >= r.x && y >= r.y && x + s.w <= r.x + r.w && y + s.h <= r.y + r.h; };
  var x = finiteNum(n.x), y = finiteNum(n.y);
  if (x !== null && y !== null && fits(x, y) && !hierOverlaps({ x: x, y: y, w: s.w, h: s.h }, others, 24)) return;
  var r0 = inner(), want = { x: x === null ? r0.x : Math.max(r0.x, Math.min(x, r0.x + r0.w - s.w)), y: y === null ? r0.y : Math.max(r0.y, Math.min(y, r0.y + r0.h - s.h)), w: s.w, h: s.h };
  var spot = null;
  for (var yy = r0.y; !spot && yy + s.h <= r0.y + r0.h; yy += 10) {
    for (var xx = r0.x; xx + s.w <= r0.x + r0.w; xx += 10) {
      if (!hierOverlaps({ x: xx, y: yy, w: s.w, h: s.h }, others, 24)) {
        var dd = Math.abs(xx - want.x) + Math.abs(yy - want.y);
        if (!spot || dd < spot.d) spot = { x: xx, y: yy, d: dd };
      }
    }
    if (spot && yy > want.y + 200) break;
  }
  if (!spot) {
    /* full: the block goes under everything inside and the frame grows to hold it */
    var low = others.filter(function (b) { return b.y < +g.y + +g.h; }).reduce(function (m, b) { return Math.max(m, b.y + b.h); }, r0.y - 24);
    spot = { x: r0.x, y: low + 30 };
  }
  n.x = Math.round(spot.x / 10) * 10;
  n.y = Math.round(spot.y / 10) * 10;
  hierGrowFrame(d, g, Math.max(+g.w, n.x + s.w + pad - +g.x), Math.max(+g.h, n.y + s.h + pad - +g.y));
}
/* A frame grows to at least w x h: the ports on its right and bottom borders move with them, and room is made the way
   an editor inserts space: the frames to its right in the rows it spans move right by the growth, the frames under it
   move down by it, so the rest of the board keeps its arrangement. Whatever still touches it is pushed away last. */
function hierGrowFrame(d, g, w, h) {
  var dw = Math.max(0, Math.ceil(w / 10) * 10 - +g.w), dh = Math.max(0, Math.ceil(h / 10) * 10 - +g.h);
  if (!dw && !dh) return false;
  var gid = str(g.id), old = hierFrameBox(g), mine = hierFrameMembers(d, gid), ancestors = {};
  for (var up = str(g.parent), k = 0; up && k < 20; k++) { ancestors[up] = true; var pg = asGroupIds(d)[up]; up = pg ? str(pg.parent) : ''; }
  hierPorts(d, gid).forEach(function (p) {
    var side = hierPortSide(p);
    if (side === 'right' && finiteNum(p.x) !== null) p.x = Math.round(+p.x + dw);
    if (side === 'bottom' && finiteNum(p.y) !== null) p.y = Math.round(+p.y + dh);
  });
  g.w = +g.w + dw;
  g.h = +g.h + dh;
  var me = hierFrameBox(g), gap = HB.gap / 2, moved = [];
  var groups = asGroupIds(d);
  /* frames that qualify, without the ones inside another that qualifies (they move with it) */
  var pick = function (test) {
    var hit = (d.groups || []).filter(function (o) { return o && o !== g && !mine[str(o.id)] && !ancestors[str(o.id)] && str(o.source) && finiteNum(o.x) !== null && test(hierFrameBox(o)); });
    var ids = {};
    hit.forEach(function (o) { ids[str(o.id)] = true; });
    return hit.filter(function (o) {
      for (var up = str(o.parent), n = 0; up && n < 20; n++) { if (ids[up]) return false; var q = groups[up]; up = q ? str(q.parent) : ''; }
      return true;
    });
  };
  if (dw) pick(function (b) { return b.x >= old.x + old.w - 1 && b.y < me.y + me.h + gap && b.y + b.h + gap > me.y; })
    .forEach(function (o) { hierShiftFrame(d, str(o.id), dw, 0); moved.push(o); });
  if (dh) pick(function (b) { return b.y >= old.y + old.h - 1 && b.x < me.x + me.w + gap && b.x + b.w + gap > me.x; })
    .forEach(function (o) { hierShiftFrame(d, str(o.id), 0, dh); if (moved.indexOf(o) < 0) moved.push(o); });
  var pinned = {};
  pinned[gid] = true;
  hierPushAway(d, g, 0, pinned);
  moved.forEach(function (o) { hierPushAway(d, o, 1, pinned); });
  return true;
}

/* ---------- tidying the inside of a frame: blocks in layers, signals from the frame's inputs to its outputs; the ports
   then line up with the blocks they lead to, and the frame fits the drawing ---------- */
function hierTidyFrame(d, gid) {
  var g = asGroupIds(d)[gid];
  if (!g) return hl('eTidyNone', hq(gid));
  if (finiteNum(g.x) === null || finiteNum(g.y) === null || !(+g.w > 0) || !(+g.h > 0)) return hl('eTidyBox', hq(str(asText(g.label)) || gid));
  var inside = (d.nodes || []).filter(function (n) { return n && str(n.group) === gid && !n.port; });
  if (!inside.length) return null;
  var ids = {}, ports = hierPorts(d, gid), pids = {}, size = {};
  inside.forEach(function (n) { ids[str(n.id)] = true; size[str(n.id)] = hierRealSize(n); });
  ports.forEach(function (p) { pids[str(p.id)] = true; });
  /* a port with no wire to the rest of the board yet follows the RTL habit: inputs on the left, outputs on the right */
  var outside = function (p) {
    return (d.edges || []).some(function (e) {
      if (!e) return false;
      var a = str(e.from), b = str(e.to);
      return (a === str(p.id) && !ids[b] && !pids[b]) || (b === str(p.id) && !ids[a] && !pids[a]);
    });
  };
  ports.forEach(function (p) {
    if (outside(p)) return;
    var dir = str(p.port && p.port.dir), side = hierPortSide(p), want = dir === 'in' ? 'left' : dir === 'out' ? 'right' : side;
    if (want !== side) hierMovePort(d, str(p.id), want);
  });
  ports = hierPorts(d, gid);
  var wires = (d.edges || []).filter(function (e) { return e && (ids[str(e.from)] || pids[str(e.from)]) && (ids[str(e.to)] || pids[str(e.to)]) && str(e.from) !== str(e.to) && !(pids[str(e.from)] && pids[str(e.to)]); });
  var pos = hierLayers(inside, ports, wires, size);
  var bx = Infinity, by = Infinity, bx2 = -Infinity, by2 = -Infinity;
  inside.forEach(function (n) { var p = pos[str(n.id)], z = size[str(n.id)]; bx = Math.min(bx, p.x); by = Math.min(by, p.y); bx2 = Math.max(bx2, p.x + z.w); by2 = Math.max(by2, p.y + z.h); });
  /* room kept clear of the ports, which reach into the frame from its border */
  var reach = { left: 0, right: 0, top: 0, bottom: 0 };
  ports.forEach(function (p) {
    var side = hierPortSide(p), z = hierRealSize(p);
    if (side === 'left') reach.left = Math.max(reach.left, +p.x + z.w - +g.x);
    if (side === 'right') reach.right = Math.max(reach.right, +g.x + +g.w - +p.x);
    if (side === 'top') reach.top = Math.max(reach.top, +p.y + z.h - +g.y);
    if (side === 'bottom') reach.bottom = Math.max(reach.bottom, +g.y + +g.h - +p.y);
  });
  /* and room for the labels of the wires between those ports and the blocks */
  var room = { left: 0, right: 0, top: 0, bottom: 0 }, nodesNow = asNodes(d);
  wires.forEach(function (e) {
    var lab = str(asText(e.label)), pid = pids[str(e.from)] ? str(e.from) : pids[str(e.to)] ? str(e.to) : null;
    if (!lab || !pid || !nodesNow[pid]) return;
    var side = hierPortSide(nodesNow[pid]);
    room[side] = Math.max(room[side], side === 'left' || side === 'right' ? textWidth(lab, 11, 600) + 24 : 26);
  });
  var mL = Math.max(40, reach.left + 30 + room.left), mR = Math.max(40, reach.right + 30 + room.right);
  var mT = Math.max(HB.top, reach.top + 30 + room.top), mB = Math.max(36, reach.bottom + 30 + room.bottom);
  var needW = mL + (bx2 - bx) + mR, needH = mT + (by2 - by) + mB;
  hierGrowFrame(d, g, Math.max(+g.w, needW), Math.max(+g.h, needH));
  var ox = +g.x + mL + Math.max(0, (+g.w - needW) / 2) - bx, oy = +g.y + mT + Math.max(0, (+g.h - needH) / 2) - by, delta = {};
  inside.forEach(function (n) {
    var p = pos[str(n.id)], x0 = finiteNum(n.x), y0 = finiteNum(n.y);
    n.x = Math.round((ox + p.x) / 10) * 10; n.y = Math.round((oy + p.y) / 10) * 10;
    delta[str(n.id)] = x0 !== null && y0 !== null ? [n.x - x0, n.y - y0] : null;
  });
  (d.edges || []).forEach(function (e) {
    if (!e || !Array.isArray(e.points)) return;
    var a = delta[str(e.from)], b = delta[str(e.to)];
    if (a === undefined && b === undefined) return;
    if (a && b && a[0] === b[0] && a[1] === b[1]) e.points = e.points.map(function (q) { return hierMovePt(q, a[0], a[1]); });
    else delete e.points;
  });
  hierAlignPorts(d, g, ports, wires, ids, size);
  return null;
}
/* Columns by distance from the frame's inputs (wires followed both ways, so a loop through a register block stays
   compact instead of stretching into one long row), each column ordered after the blocks it connects to on its left. */
function hierLayers(inside, ports, wires, size) {
  var ids = inside.map(function (n) { return str(n.id); }), nb = {}, into = {}, portDir = {};
  ids.forEach(function (id) { nb[id] = []; into[id] = 0; });
  ports.forEach(function (p) { portDir[str(p.id)] = str(p.port && p.port.dir) || 'inout'; });
  var fromIn = {}, toOut = {}, labelW = 0, portSide = {}, leftMate = {}, rightMate = {};
  ports.forEach(function (p) { portSide[str(p.id)] = hierPortSide(p); });
  wires.forEach(function (e) {
    var a = str(e.from), b = str(e.to), lab = str(asText(e.label));
    if (lab) labelW = Math.max(labelW, textWidth(lab, 11, 600) + 16);
    if (nb[a] && nb[b]) { nb[a].push(b); nb[b].push(a); into[b]++; return; }
    if (portDir[a] && nb[b] && portDir[a] !== 'out') fromIn[b] = true;
    if (portDir[b] && nb[a] && portDir[b] === 'in') fromIn[a] = true;
    if (portDir[b] && nb[a] && portDir[b] === 'out') toOut[a] = true;
    if (portDir[a] && nb[b] && portDir[a] === 'out') toOut[b] = true;
    /* which side of the frame each block's port is on: a block wired to a port on the right belongs on the right */
    var pid = portDir[a] ? a : portDir[b] ? b : null, inner = pid === a ? b : a;
    if (pid && nb[inner]) { if (portSide[pid] === 'left') leftMate[inner] = true; if (portSide[pid] === 'right') rightMate[inner] = true; }
  });
  var rank = {}, queue = [];
  var seed = function (list) { list.forEach(function (id) { if (rank[id] === undefined) { rank[id] = 0; queue.push(id); } }); };
  /* the columns start from the blocks on the frame's left ports; when the frame's ports are all on the right, from the
     blocks there, and the columns are then mirrored so those blocks sit next to their ports; else from the inputs */
  var mirror = false;
  seed(ids.filter(function (id) { return leftMate[id]; }));
  if (!queue.length) { seed(ids.filter(function (id) { return rightMate[id]; })); mirror = queue.length > 0; }
  if (!queue.length) seed(ids.filter(function (id) { return fromIn[id]; }));
  if (!queue.length) seed(ids.filter(function (id) { return !into[id] && !toOut[id]; }));
  if (!queue.length) seed(ids.slice(0, 1));
  for (;;) {
    while (queue.length) {
      var id = queue.shift();
      nb[id].forEach(function (m) { if (rank[m] === undefined) { rank[m] = rank[id] + 1; queue.push(m); } });
    }
    var rest = ids.filter(function (x) { return rank[x] === undefined; });
    if (!rest.length) break;
    seed(rest.slice(0, 1));
  }
  var last = Math.max.apply(null, ids.map(function (id) { return rank[id]; }));
  if (mirror) ids.forEach(function (id) { rank[id] = last - rank[id]; });
  /* with ports on both sides: blocks on a right-side port go to the last column, next to their port */
  else ids.forEach(function (id) { if (rightMate[id] && !leftMate[id] && last > 0) rank[id] = last; });
  var cols = [];
  ids.forEach(function (id) { (cols[rank[id]] = cols[rank[id]] || []).push(id); });
  cols = cols.filter(Boolean);
  /* order each column by the mean place of its neighbours in the columns before and after it, twice each way */
  var place = {};
  var setPlaces = function () { cols.forEach(function (c) { c.forEach(function (id, k) { place[id] = k; }); }); };
  setPlaces();
  var sweep = function (c, side) {
    var col = cols[c], other = cols[c + side];
    if (!other) return;
    var inOther = {};
    other.forEach(function (id) { inOther[id] = true; });
    var key = function (id) { var ms = nb[id].filter(function (m) { return inOther[m]; }); return ms.length ? ms.reduce(function (t, m) { return t + place[m]; }, 0) / ms.length : place[id]; };
    col.sort(function (a, b) { return key(a) - key(b); });
    setPlaces();
  };
  for (var pass = 0; pass < 2; pass++) {
    for (var c = 1; c < cols.length; c++) sweep(c, -1);
    for (var c2 = cols.length - 2; c2 >= 0; c2--) sweep(c2, 1);
  }
  var gapX = Math.max(70, Math.min(170, labelW + 24)), gapY = 36, x = 0, heights = [], pos = {};
  cols.forEach(function (col) { heights.push(col.reduce(function (t, id) { return t + size[id].h; }, 0) + gapY * (col.length - 1)); });
  var tall = Math.max.apply(null, heights);
  cols.forEach(function (col, k) {
    var w = Math.max.apply(null, col.map(function (id) { return size[id].w; })), y = (tall - heights[k]) / 2;
    col.forEach(function (id) { pos[id] = { x: x + (w - size[id].w) / 2, y: y }; y += size[id].h + gapY; });
    x += w + gapX;
  });
  return pos;
}
/* ---------- arranging a chip diagram around its buses: every bus or crossbar a long bar, each group of blocks kept
   together in a row above or below the bar most of its blocks hang on, hosts (CPU, DMA, debug) above, and the wires to
   the bar straight up or down. The way chip block diagrams are drawn by hand (OpenTitan, datasheets). ---------- */
var HA = { gapX: 50, gapCluster: 110, gapBar: 90, tierGap: 160, left: 80, top: 80, minBar: 640 };
/* Block sizes as the renderer draws them (text wrapped, symbols with their labels), not estimates: an estimate a few
   pixels short let a tall cache symbol cover the block under it. */
function hierMeasure(d) {
  var out = {};
  if (typeof normalizeDiagram !== 'function' || typeof measureNode !== 'function') return out;
  var keep = problems.length, keepList = problemList.length;
  try { var nd = normalizeDiagram(d, 0); nd.nodes.forEach(function (n) { var m = measureNode(n, nd); if (m && m.w && m.h) out[n.id] = { w: m.w, h: m.h }; }); } catch (err) { out = {}; }
  problems.length = keep; problemList.length = keepList;
  return out;
}
/* An arrangement places every block again: frames of groups follow their blocks instead of keeping an old box. */
function hierFreeGroups(d) { (d.groups || []).forEach(function (g) { if (g && !str(g.source)) { delete g.x; delete g.y; delete g.w; delete g.h; } }); }
var HIER_HOSTS = { cpu: true, dma: true, acc: true, debug: true };
function hierArrangeBus(d) {
  if (str(d.boardOf) || d.detailOf) return ht('eArrangeBoard');
  var nodes = (d.nodes || []).filter(function (n) { return n && str(n.id) && !n.port; });
  var byId = {};
  nodes.forEach(function (n) { byId[str(n.id)] = n; });
  var edges = (d.edges || []).filter(function (e) { return e && byId[str(e.from)] && byId[str(e.to)] && str(e.from) !== str(e.to); });
  var ctx = asContext(d), kind = {}, deg = {}, busDeg = {};
  nodes.forEach(function (n) { kind[str(n.id)] = asHwKind(n, ctx); });
  edges.forEach(function (e) {
    [str(e.from), str(e.to)].forEach(function (k) { deg[k] = (deg[k] || 0) + 1; if (e.kind === 'bus') busDeg[k] = (busDeg[k] || 0) + 1; });
  });
  var hubs = nodes.map(function (n) { return str(n.id); }).filter(function (k) { return (kind[k] === 'bus' && (deg[k] || 0) >= 2) || (busDeg[k] || 0) >= 5; });
  if (!hubs.length) return ht('eArrangeNoBus');
  var isHub = {};
  hubs.forEach(function (h) { isHub[h] = true; });
  var hubsOf = {};
  edges.forEach(function (e) {
    var a = str(e.from), b = str(e.to);
    if (isHub[a] && !isHub[b]) (hubsOf[b] = hubsOf[b] || []).push(a);
    if (isHub[b] && !isHub[a]) (hubsOf[a] = hubsOf[a] || []).push(b);
  });
  /* the bar with the most hosts first, then the bars wired to it, and so on */
  var hostCount = {};
  hubs.forEach(function (h) { hostCount[h] = 0; });
  Object.keys(hubsOf).forEach(function (k) { if (HIER_HOSTS[kind[k]]) hubsOf[k].forEach(function (h) { hostCount[h]++; }); });
  var order = [], seen = {};
  hubs.slice().sort(function (a, b) { return hostCount[b] - hostCount[a] || (deg[b] || 0) - (deg[a] || 0); }).forEach(function (h0) {
    if (seen[h0]) return;
    var queue = [h0];
    seen[h0] = true;
    while (queue.length) {
      var h = queue.shift();
      order.push(h);
      edges.forEach(function (e) { var a = str(e.from), b = str(e.to), o = a === h ? b : b === h ? a : null; if (o && isHub[o] && !seen[o]) { seen[o] = true; queue.push(o); } });
    }
  });
  var tierOf = {};
  order.forEach(function (h, i) { tierOf[h] = i; });
  /* clusters: the tab's groups, members kept together; a block in no group is a cluster of its own */
  var clusters = [], clusterOf = {};
  var keyOf = function (id) { var n = byId[id]; return str(n.group) || ('solo:' + id); };
  nodes.forEach(function (n) {
    var id = str(n.id);
    if (isHub[id]) return;
    var c = clusterOf[keyOf(id)];
    if (!c) { c = clusterOf[keyOf(id)] = { members: [], hub: null, host: false, after: null }; clusters.push(c); }
    c.members.push(id);
  });
  clusters.forEach(function (c) {
    var votes = {};
    c.members.forEach(function (m) { (hubsOf[m] || []).forEach(function (h) { votes[h] = (votes[h] || 0) + 1; }); if (HIER_HOSTS[kind[m]]) c.host = true; });
    Object.keys(votes).forEach(function (h) { if (!c.hub || votes[h] > votes[c.hub] || (votes[h] === votes[c.hub] && tierOf[h] < tierOf[c.hub])) c.hub = h; });
  });
  /* a cluster on no bus (an embedded flash behind its controller) sits right after the cluster it is wired to */
  for (var pass = 0; pass < 4; pass++) {
    clusters.forEach(function (c) {
      if (c.hub || c.after) return;
      edges.forEach(function (e) {
        if (c.hub || c.after) return;
        var a = str(e.from), b = str(e.to), o = c.members.indexOf(a) >= 0 ? b : c.members.indexOf(b) >= 0 ? a : null;
        if (!o || isHub[o]) return;
        var oc = clusterOf[keyOf(o)];
        if (oc && oc !== c && (oc.hub || oc.after)) c.after = oc;
      });
    });
  }
  var size = {}, measured = hierMeasure(d);
  nodes.forEach(function (n) { size[str(n.id)] = measured[str(n.id)] || hierRealSize(n); });
  hierFreeGroups(d);
  var width = function (c) { return c.members.reduce(function (t, m) { return t + size[m].w; }, 0) + HA.gapX * (c.members.length - 1); };
  var height = function (c) { return Math.max.apply(null, c.members.map(function (m) { return size[m].h; })); };
  var tiers = order.map(function (h) { return { hub: h, above: [], below: [], y0: 0, y1: 0 }; }), placed = {};
  tiers.forEach(function (t) {
    var mine = clusters.filter(function (c) { return c.hub === t.hub; });
    var wa = 0, wb = 0;
    mine.filter(function (c) { return c.host; }).forEach(function (c) { t.above.push(c); wa += width(c) + HA.gapCluster; });
    mine.filter(function (c) { return !c.host; }).forEach(function (c) { var w = width(c) + HA.gapCluster; if (wb <= wa) { t.below.push(c); wb += w; } else { t.above.push(c); wa += w; } });
    [t.above, t.below].forEach(function (row) {
      for (var i = 0; i < row.length; i++) {
        placed[clusters.indexOf(row[i])] = true;
        var sats = clusters.filter(function (c) { return c.after === row[i]; });
        Array.prototype.splice.apply(row, [i + 1, 0].concat(sats));
      }
    });
  });
  var loose = clusters.filter(function (c, i) { return !placed[i]; });
  var rowW = function (row) { return row.reduce(function (t, c) { return t + width(c); }, 0) + HA.gapCluster * Math.max(0, row.length - 1); };
  var rowH = function (row) { return row.length ? Math.max.apply(null, row.map(height)) : 0; };
  var putRow = function (row, x0, top, alignBottom) {
    var x = x0, h = rowH(row);
    row.forEach(function (c) {
      c.members.forEach(function (m) {
        var n = byId[m];
        n.x = Math.round(x / 10) * 10;
        n.y = Math.round((alignBottom ? top + h - size[m].h : top) / 10) * 10;
        x += size[m].w + HA.gapX;
      });
      x += HA.gapCluster - HA.gapX;
    });
  };
  var widest = Math.max.apply(null, tiers.map(function (t) { return Math.max(rowW(t.above), rowW(t.below)); }).concat([HA.minBar]));
  var y = HA.top;
  tiers.forEach(function (t) {
    t.y0 = y;
    var hub = byId[t.hub], wA = rowW(t.above), wB = rowW(t.below), barW = Math.max(HA.minBar, wA, wB) + 80, hA = rowH(t.above), hB = rowH(t.below);
    var x0 = HA.left + (widest + 80 - barW) / 2;
    putRow(t.above, x0 + (barW - wA) / 2, y, true);
    var barY = y + (hA ? hA + HA.gapBar : 0);
    hub.x = Math.round(x0 / 10) * 10;
    hub.y = Math.round(barY / 10) * 10;
    hub.w = Math.round(barW / 10) * 10;
    delete hub.h;
    size[t.hub] = hierRealSize(hub);
    var yB = hub.y + size[t.hub].h + HA.gapBar;
    putRow(t.below, x0 + (barW - wB) / 2, yB, false);
    t.y1 = hB ? yB + hB : hub.y + size[t.hub].h;
    y = yB + hB + HA.tierGap;
  });
  if (loose.length) putRow(loose, HA.left, y, false);
  /* a group made only of bars on different tiers would draw one frame over the whole chip: the bars leave it */
  var tierSet = {};
  hubs.forEach(function (h) { var g = str(byId[h].group); if (g) (tierSet[g] = tierSet[g] || {})[tierOf[h]] = true; });
  Object.keys(tierSet).forEach(function (g) {
    var onlyBars = nodes.every(function (n) { return str(n.group) !== g || isHub[str(n.id)]; });
    if (onlyBars && Object.keys(tierSet[g]).length > 1) hubs.forEach(function (h) { if (str(byId[h].group) === g) delete byId[h].group; });
  });
  /* wires to a bar go straight up or down from the middle of the block; other wires are routed afresh */
  var pinned = function (id) { return asPinsOf(byId[id]).length > 0; };
  var sideOf = {};
  tiers.forEach(function (t) {
    t.above.forEach(function (c) { c.members.forEach(function (m) { sideOf[t.hub + '|' + m] = 'above'; }); });
    t.below.forEach(function (c) { c.members.forEach(function (m) { sideOf[t.hub + '|' + m] = 'below'; }); });
  });
  var r3 = function (v) { return Math.round(v * 1000) / 1000; };
  /* bands, top to bottom: each row of blocks and each bar; the corridors between them carry the wires that are not a
     straight drop to a bar. A wire leaves its block up or down, runs along corridors, passes a row through a gap
     between two blocks (or a bar around its end), and comes into its target from above or below. */
  var bands = [], bandOf = {};
  var addBand = function (type, ids) {
    if (!ids.length) return;
    var b = { type: type, y0: Infinity, y1: -Infinity, spans: [] };
    ids.forEach(function (id) {
      var n = byId[id];
      b.y0 = Math.min(b.y0, +n.y); b.y1 = Math.max(b.y1, +n.y + size[id].h);
      b.spans.push([+n.x, +n.x + (type === 'bar' ? +n.w : size[id].w)]);
      bandOf[id] = bands.length;
    });
    b.spans.sort(function (p, q) { return p[0] - q[0]; });
    bands.push(b);
  };
  var members = function (row) { var out = []; row.forEach(function (c) { out = out.concat(c.members); }); return out; };
  tiers.forEach(function (t) { addBand('row', members(t.above)); addBand('bar', [t.hub]); addBand('row', members(t.below)); });
  addBand('row', members(loose));
  /* wires sharing a corridor or a gap get lanes of their own, 9 px apart, so they do not run on top of each other */
  var lanes = {};
  var lane = function (key, room) {
    var k = lanes[key] = (lanes[key] || 0) + 1, off = (k % 2 ? 1 : -1) * Math.floor(k / 2) * 9;
    return Math.max(-room, Math.min(room, off));
  };
  var corridor = function (k) { /* between band k and band k + 1; -1 above the first, bands.length - 1 below the last */
    if (k < 0) return bands[0].y0 - 50 + lane('c-1', 40);
    if (k >= bands.length - 1) return bands[bands.length - 1].y1 + 50 + lane('c' + k, 40);
    return Math.round((bands[k].y1 + bands[k + 1].y0) / 2) + lane('c' + k, Math.max(0, (bands[k + 1].y0 - bands[k].y1) / 2 - 12));
  };
  /* the free x nearest to want where a wire can cross band k: a gap between blocks, or past the ends of a bar */
  var passAt = function (k, want) {
    var b = bands[k], spots = [];
    if (b.type === 'bar') { spots.push(b.spans[0][0] - 40, b.spans[0][1] + 40); }
    else {
      var at = -Infinity;
      b.spans.forEach(function (sp) { if (at > -Infinity && sp[0] - at >= 36) spots.push((at + sp[0]) / 2); at = Math.max(at, sp[1]); });
      spots.push(b.spans[0][0] - 40, at + 40);
    }
    var at0 = spots.reduce(function (best, x) { return best === null || Math.abs(x - want) < Math.abs(best - want) ? x : best; }, null);
    return at0 === null ? null : at0 + lane('g' + k + ':' + Math.round(at0), 14);
  };
  var cx = function (id) { return +byId[id].x + (isHub[id] ? +byId[id].w : size[id].w) / 2; };
  var route = function (e) {
    var a = str(e.from), b = str(e.to), ka = bandOf[a], kb = bandOf[b];
    if (ka === undefined || kb === undefined || pinned(a) || pinned(b)) return false;
    var A = byId[a], B = byId[b], wA = isHub[a] ? +A.w : size[a].w, wB = isHub[b] ? +B.w : size[b].w;
    var pts = [], x, fromA, toA;
    if (ka === kb) {
      /* same row: neighbours join straight; others go round through the corridor on the side away from the bar */
      var lo = Math.min(cx(a), cx(b)), hi = Math.max(cx(a), cx(b)), between = bands[ka].spans.some(function (sp) { return sp[0] > lo + 1 && sp[1] < hi - 1 && sp[0] > Math.min(+A.x + wA, +B.x + wB) - 1; });
      if (!between || bands[ka].type === 'bar') return false;
      var up = ka === 0 || bands[ka - 1].type !== 'bar';
      var yc = corridor(up ? ka - 1 : ka);
      pts = [[cx(a), yc], [cx(b), yc]];
      fromA = [0.5, up ? 0 : 1]; toA = [0.5, up ? 0 : 1];
    } else {
      var down = kb > ka, step = down ? 1 : -1;
      x = isHub[a] ? passAt(ka + step, cx(b)) : cx(a);
      if (isHub[a]) x = Math.max(+A.x + 10, Math.min(+A.x + wA - 10, x));
      fromA = [(x - +A.x) / wA, down ? 1 : 0];
      for (var k = ka; k !== kb; k += step) {
        var yc2 = corridor(down ? k : k - 1), next = k + step;
        if (next === kb) {
          var xe = isHub[b] ? Math.max(+B.x + 10, Math.min(+B.x + wB - 10, x)) : cx(b);
          pts.push([x, yc2], [xe, yc2]);
          toA = [(xe - +B.x) / wB, down ? 0 : 1];
        } else {
          var xp = passAt(next, isHub[b] ? x : cx(b));
          pts.push([x, yc2], [xp, yc2]);
          x = xp;
        }
      }
    }
    var clean = [];
    pts.forEach(function (q) { q = [Math.round(q[0]), Math.round(q[1])]; var l = clean[clean.length - 1]; if (!l || l[0] !== q[0] || l[1] !== q[1]) clean.push(q); });
    e.fromAnchor = [r3(fromA[0]), fromA[1]];
    e.toAnchor = [r3(toA[0]), toA[1]];
    if (clean.length) e.points = clean; else delete e.points;
    return true;
  };
  edges.forEach(function (e) {
    var a = str(e.from), b = str(e.to), h = isHub[a] ? a : isHub[b] ? b : null, m = h === a ? b : a;
    delete e.points;
    /* a block on a row next to its own bar: straight up or down to the bar */
    if (h && !isHub[m] && sideOf[h + '|' + m]) {
      var hub = byId[h], n = byId[m], above = sideOf[h + '|' + m] === 'above';
      var hubA = [r3(Math.max(0.01, Math.min(0.99, (+n.x + size[m].w / 2 - hub.x) / hub.w))), above ? 0 : 1], memA = [0.5, above ? 1 : 0];
      if (h === a) { e.fromAnchor = hubA; if (!pinned(m)) e.toAnchor = memA; }
      else { e.toAnchor = hubA; if (!pinned(m)) e.fromAnchor = memA; }
      return;
    }
    if (!route(e) && !pinned(a) && !pinned(b)) { delete e.fromAnchor; delete e.toAnchor; }
  });
  d.layout = 'manual';
  d.route = 'orthogonal';
  /* remembered, so blocks the AI adds later are placed by arranging again */
  d.arranged = 'bus';
  hierFreeNotes(d);
  (d.edges || []).forEach(function (e) { if (e) { delete e.labelAt; delete e.labelDist; } });
  hierUnblock(d);
  hierPlaceLabels(d);
  return null;
}

/* ---------- wires of an arranged tab: round the blocks in their way, labels clear of blocks and of each other ---------- */
var HR = { cell: 10, clear: 10, bend: 6, along: 14, near: 2, cross: 2, label: 4 };
function hierLayoutNow(d) {
  if (typeof normalizeDiagram !== 'function' || typeof layoutDiagram !== 'function') return null;
  var keep = problems.length, keepList = problemList.length, out = null;
  try { var nd = normalizeDiagram(d, 0); out = { nd: nd, L: layoutDiagram(nd) }; } catch (err) { out = null; }
  problems.length = keep; problemList.length = keepList;
  return out;
}
function hierBoxes(L, pad) {
  return Object.keys(L.nodes).map(function (id) { var p = L.nodes[id]; return { id: id, x: p.x - p.w / 2 - pad, y: p.y - p.h / 2 - pad, w: p.w + 2 * pad, h: p.h + 2 * pad }; });
}
/* wires whose drawn path runs through a block that is neither of its ends: [{i: wire, via: block}]. A bus drawn as a
   long thin bar is not in the way: wires cross such bars by convention (the bar is drawn over them). */
function hierIsBar(r) { return (r.w >= 360 && r.w >= 6 * r.h) || (r.h >= 360 && r.h >= 6 * r.w); }
function hierBlockedWires(lay) {
  var boxes = hierBoxes(lay.L, -2).filter(function (r) { return !hierIsBar(r); }), out = [];
  lay.nd.edges.forEach(function (e, i) {
    var pts = (lay.L.edges[i] || {}).points || [];
    for (var k = 1; k < pts.length; k++) {
      var a = pts[k - 1], b = pts[k];
      var hit = boxes.filter(function (r) { return r.id !== e.from && r.id !== e.to && segHitsBox(a, b, r); })[0];
      if (hit) { out.push({ i: i, via: hit.id }); return; }
    }
  });
  return out;
}
/* A path for wire i on a 10 px grid (A*): never through a block, few bends, and it keeps off the other wires and labels
   (running along another wire costs most, crossing one little). Returns anchors on the two blocks and the corners. */
function hierGridRoute(lay, i) {
  var nd = lay.nd, L = lay.L, e = nd.edges[i], G = HR.cell;
  var S = frameOf(nd, L, e.from), T = frameOf(nd, L, e.to);
  if (!S || !T || S.rot || T.rot || e.from === e.to) return null;
  var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  var grow = function (x, y) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); };
  hierBoxes(L, 0).forEach(function (r) { grow(r.x, r.y); grow(r.x + r.w, r.y + r.h); });
  L.edges.forEach(function (r) { (r.points || []).forEach(function (q) { grow(q.x, q.y); }); });
  x1 = Math.floor((x1 - 160) / G) * G; y1 = Math.floor((y1 - 160) / G) * G; x2 += 160; y2 += 160;
  var W = Math.ceil((x2 - x1) / G) + 1, H = Math.ceil((y2 - y1) / G) + 1, N = W * H;
  if (N > 600000) return null;
  var wall = new Uint8Array(N), extra = new Float32Array(N), runH = new Uint8Array(N), runV = new Uint8Array(N);
  var fill = function (r, fn) {
    var a0 = Math.max(0, Math.ceil((r.x - x1) / G)), a1 = Math.min(W - 1, Math.floor((r.x + r.w - x1) / G));
    var b0 = Math.max(0, Math.ceil((r.y - y1) / G)), b1 = Math.min(H - 1, Math.floor((r.y + r.h - y1) / G));
    for (var gy = b0; gy <= b1; gy++) for (var gx = a0; gx <= a1; gx++) fn(gy * W + gx);
  };
  hierBoxes(L, HR.clear).forEach(function (r) {
    if (hierIsBar({ w: r.w - 2 * HR.clear, h: r.h - 2 * HR.clear })) fill(r, function (k) { extra[k] += HR.label; });
    else fill(r, function (k) { wall[k] = 1; });
  });
  L.edges.forEach(function (r, j) {
    if (j === i) return;
    var pts = r.points || [];
    for (var k = 1; k < pts.length; k++) {
      var a = pts[k - 1], b = pts[k], hz = Math.abs(a.y - b.y) < Math.abs(a.x - b.x);
      var box = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
      fill(box, function (c) { if (hz) runH[c] = 1; else runV[c] = 1; });
      fill({ x: box.x - G, y: box.y - G, w: box.w + 2 * G, h: box.h + 2 * G }, function (c) { extra[c] += HR.near; });
    }
    var lm = L.labelM[j];
    if (lm && lm.w && isFinite(r.lx)) fill({ x: r.lx - lm.w / 2 - 4, y: r.ly - lm.h / 2 - 4, w: lm.w + 8, h: lm.h + 8 }, function (c) { extra[c] += HR.label; });
  });
  /* the border of a group frame counts as a wire (a path along it would hide in it), its title as a label */
  nd.groups.forEach(function (g) {
    var b = L.groups[g.id];
    if (!b || g.hidden) return;
    [[b.x, b.y, b.w, 0], [b.x, b.y + b.h, b.w, 0], [b.x, b.y, 0, b.h], [b.x + b.w, b.y, 0, b.h]].forEach(function (q) {
      var hz = !q[3];
      fill({ x: q[0], y: q[1], w: q[2], h: q[3] }, function (c) { if (hz) runH[c] = 1; else runV[c] = 1; });
      fill({ x: q[0] - G, y: q[1] - G, w: q[2] + 2 * G, h: q[3] + 2 * G }, function (c) { extra[c] += HR.near; });
    });
    if (!g.drawio) fill({ x: b.x, y: b.y - 12, w: chipWidth(g) + 14, h: 24 }, function (c) { extra[c] += HR.label; });
  });
  var dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  var taken = function (x, y) {
    return L.edges.some(function (r, j) {
      var p = r.points || [];
      return j !== i && p.length && [p[0], p[p.length - 1]].some(function (q) { return Math.abs(q.x - x) < 6 && Math.abs(q.y - y) < 6; });
    });
  };
  /* where the wire may leave or enter a block: a point the wire is tied to (a pin, an anchor set by hand) stays; else
     the middle of a side, or a point off the middle no other wire uses */
  var ends = function (F, fixed) {
    var out = [];
    if (fixed) {
      var P = anchorPt(F, fixed), sd = { E: 0, S: 1, W: 2, N: 3 }[sideFor(F, P)];
      var fx = Math.round((P.x - x1) / G), fy = Math.round((P.y - y1) / G), n0 = 0;
      while (fx >= 0 && fy >= 0 && fx < W && fy < H && wall[fy * W + fx] && n0 < 12) { fx += dirs[sd][0]; fy += dirs[sd][1]; n0++; }
      if (fx >= 0 && fy >= 0 && fx < W && fy < H && !wall[fy * W + fx]) out.push({ side: sd, pt: P, cell: fy * W + fx, steps: n0 });
      return out;
    }
    [0, 1, 2, 3].forEach(function (s) {
      var hzSide = s === 0 || s === 2, pick = null;
      [0.5, 0.3, 0.7, 0.2, 0.8].some(function (f) {
        var v = hzSide ? y1 + Math.round((F.y + F.h * f - y1) / G) * G : x1 + Math.round((F.x + F.w * f - x1) / G) * G;
        if (hzSide ? v <= F.y + 3 || v >= F.y + F.h - 3 : v <= F.x + 3 || v >= F.x + F.w - 3) return false;
        var px = hzSide ? (s === 0 ? F.x + F.w : F.x) : v, py = hzSide ? v : (s === 1 ? F.y + F.h : F.y);
        if (taken(px, py)) return false;
        pick = { x: px, y: py };
        return true;
      });
      if (!pick) return;
      var gx = Math.round((pick.x - x1) / G), gy = Math.round((pick.y - y1) / G), steps = 0;
      while (gx >= 0 && gy >= 0 && gx < W && gy < H && wall[gy * W + gx] && steps < 8) { gx += dirs[s][0]; gy += dirs[s][1]; steps++; }
      if (gx < 0 || gy < 0 || gx >= W || gy >= H || wall[gy * W + gx]) return;
      out.push({ side: s, pt: pick, cell: gy * W + gx, steps: steps });
    });
    return out;
  };
  var starts = ends(S, e.fromAnchor), goals = ends(T, e.toAnchor);
  if (!starts.length || !goals.length) return null;
  var goalAt = {};
  goals.forEach(function (g) { goalAt[g.cell] = g; });
  var best = new Float64Array(N * 4).fill(Infinity), prev = new Int32Array(N * 4).fill(-1), heap = [];
  var push = function (f, st) {
    heap.push([f, st]);
    for (var c = heap.length - 1; c;) { var p = (c - 1) >> 1; if (heap[p][0] <= heap[c][0]) break; var t = heap[p]; heap[p] = heap[c]; heap[c] = t; c = p; }
  };
  var pop = function () {
    var top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (var c = 0; ;) {
        var l = 2 * c + 1, r = l + 1, m = c;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === c) break;
        var t = heap[m]; heap[m] = heap[c]; heap[c] = t; c = m;
      }
    }
    return top;
  };
  var hx = function (c) {
    var gx = c % W, gy = (c / W) | 0, h = Infinity;
    goals.forEach(function (g) { var v = Math.abs(gx - g.cell % W) + Math.abs(gy - ((g.cell / W) | 0)); if (v < h) h = v; });
    return h;
  };
  starts.forEach(function (s0) { var st = s0.cell * 4 + s0.side; if (s0.steps < best[st]) { best[st] = s0.steps; push(s0.steps + hx(s0.cell), st); } });
  var done = -1, doneCost = Infinity;
  while (heap.length) {
    var top = pop(), st = top[1], c = (st / 4) | 0, dir = st % 4, g = best[st];
    if (top[0] >= doneCost) break;
    if (top[0] > g + hx(c) + 1e-6) continue;
    var goal = goalAt[c];
    if (goal) {
      var fin = g + goal.steps + (dir === (goal.side + 2) % 4 ? 0 : HR.bend);
      if (fin < doneCost) { doneCost = fin; done = st; }
    }
    var gx = c % W, gy = (c / W) | 0;
    for (var k = 0; k < 4; k++) {
      if (k === (dir + 2) % 4) continue;
      var nx = gx + dirs[k][0], ny = gy + dirs[k][1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      var nc = ny * W + nx;
      if (wall[nc]) continue;
      var hz = k % 2 === 0;
      var step = 1 + extra[nc] + (hz ? (runH[nc] ? HR.along : 0) + (runV[nc] ? HR.cross : 0) : (runV[nc] ? HR.along : 0) + (runH[nc] ? HR.cross : 0)) + (k !== dir ? HR.bend : 0);
      var ns = nc * 4 + k, ng = g + step;
      if (ng < best[ns]) { best[ns] = ng; prev[ns] = st; push(ng + hx(nc), ns); }
    }
  }
  if (done < 0) return null;
  var chain = [];
  for (var s1 = done; s1 >= 0; s1 = prev[s1]) chain.push(s1);
  chain.reverse();
  var first = chain[0], start = starts.filter(function (q) { return q.cell === ((first / 4) | 0) && q.side === first % 4; })[0], end = goalAt[(done / 4) | 0];
  if (!start || !end) return null;
  var pts = [start.pt].concat(chain.map(function (q) { var cc = (q / 4) | 0; return { x: x1 + (cc % W) * G, y: y1 + ((cc / W) | 0) * G }; }), [end.pt]);
  /* an end tied to a pin is off the grid: the cells level with it are moved onto its level, the straight run from
     one end to the other gets a small jog halfway; then every step is made square and only the corners are kept */
  var n = pts.length, hzS = start.side % 2 === 0, hzE = end.side % 2 === 0, k;
  var same = function (a, b, hz) { return hz ? a.y === b.y : a.x === b.x; };
  var put = function (q, from, hz) { if (hz) q.y = from.y; else q.x = from.x; };
  if (n > 2) {
    var runEnd = 1, runStart = n - 2;
    while (runEnd + 1 < n - 1 && same(pts[runEnd + 1], pts[1], hzS)) runEnd++;
    while (runStart - 1 > 0 && same(pts[runStart - 1], pts[n - 2], hzE)) runStart--;
    if (hzS === hzE && runEnd >= runStart) {
      var mid = Math.floor((n - 1) / 2);
      for (k = 1; k <= n - 2; k++) put(pts[k], k <= mid ? pts[0] : pts[n - 1], hzS);
    } else {
      for (k = 1; k <= runEnd; k++) put(pts[k], pts[0], hzS);
      for (k = runStart; k <= n - 2; k++) put(pts[k], pts[n - 1], hzE);
    }
  }
  var sq = [pts[0]];
  for (k = 1; k < n; k++) {
    var a = sq[sq.length - 1], b = pts[k];
    if (a.x !== b.x && a.y !== b.y) {
      var before = sq.length > 1 ? sq[sq.length - 2] : null, wasHz = before ? before.y === a.y : hzS;
      sq.push(wasHz ? { x: a.x, y: b.y } : { x: b.x, y: a.y });
    }
    sq.push(b);
  }
  var path = [sq[0]];
  for (k = 1; k < sq.length - 1; k++) {
    var p0 = path[path.length - 1], q1 = sq[k], q2 = sq[k + 1];
    if ((p0.x === q1.x && q1.x === q2.x) || (p0.y === q1.y && q1.y === q2.y) || (p0.x === q1.x && p0.y === q1.y)) continue;
    path.push(q1);
  }
  path.push(sq[sq.length - 1]);
  var frac = function (F, p) { return [Math.round((p.x - F.x) / F.w * 10000) / 10000, Math.round((p.y - F.y) / F.h * 10000) / 10000]; };
  return { fromAnchor: frac(S, start.pt), toAnchor: frac(T, end.pt), points: path.slice(1, -1).map(function (p) { return [p.x, p.y]; }), path: path };
}
/* Can wire i get a new path? An end on a symbol with pins must be tied to one (a free end there would land on a pin
   the wire does not belong to). */
function hierCanReroute(nd, i) {
  var e = nd.edges[i], ok = function (id, a) { var n = nd.nodeById[id]; return a || !n || !(typeof pinList === 'function' && pinList(shapeDef(n.shape)).length); };
  return !!e && e.from !== e.to && ok(e.from, e.fromAnchor) && ok(e.to, e.toAnchor);
}
/* Wires of the tab that the plain router would draw through a block get a path round them; `only` (a set of
   "from>to") and `via` (a set of block ids) limit it to those wires and to wires under those blocks. */
function hierUnblock(d, only, via) {
  var lay = hierLayoutNow(d), fixed = 0;
  if (!lay) return 0;
  hierBlockedWires(lay).forEach(function (w) {
    var i = w.i, ne = lay.nd.edges[i], e = d.edges[ne.rawIndex];
    if (!e || !hierCanReroute(lay.nd, i)) return;
    if ((only || via) && !((only && only[ne.from + '>' + ne.to]) || (via && via[w.via]))) return;
    var r = hierGridRoute(lay, i);
    if (!r) return;
    /* ends tied to a pin or placed by hand keep their point; only the path between them changes */
    if (!ne.fromAnchor) e.fromAnchor = r.fromAnchor;
    if (!ne.toAnchor) e.toAnchor = r.toAnchor;
    e.points = r.points;
    var lp = labelPoint(r.path, ne.labelAt, ne.labelDist, ne.labelOffset);
    lay.L.edges[i] = { points: r.path, lx: lp.x, ly: lp.y };
    fixed++;
  });
  return fixed;
}
/* Two or more wires between the same two blocks side by side instead of on top of each other. */
function hierSplitPairs(d) {
  var lay = hierLayoutNow(d);
  if (!lay) return;
  var byId = {}, sets = {};
  (d.nodes || []).forEach(function (n) { if (n) byId[str(n.id)] = n; });
  lay.nd.edges.forEach(function (ne, i) {
    var e = d.edges[ne.rawIndex];
    if (!e || ne.from === ne.to || !lay.L.nodes[ne.from] || !lay.L.nodes[ne.to]) return;
    if ((e.points && e.points.length) || e.fromAnchor || e.toAnchor || asPinsOf(byId[ne.from]).length || asPinsOf(byId[ne.to]).length) return;
    var key = [ne.from, ne.to].sort().join('\u0001');
    (sets[key] = sets[key] || []).push({ e: e, from: ne.from, to: ne.to });
  });
  Object.keys(sets).forEach(function (key) {
    var list = sets[key];
    if (list.length < 2) return;
    var A = lay.L.nodes[list[0].from], B = lay.L.nodes[list[0].to];
    var ax1 = A.x - A.w / 2, ax2 = A.x + A.w / 2, ay1 = A.y - A.h / 2, ay2 = A.y + A.h / 2;
    var bx1 = B.x - B.w / 2, bx2 = B.x + B.w / 2, by1 = B.y - B.h / 2, by2 = B.y + B.h / 2;
    var ox1 = Math.max(ax1, bx1), ox2 = Math.min(ax2, bx2), oy1 = Math.max(ay1, by1), oy2 = Math.min(ay2, by2);
    var vertical = ox2 - ox1 >= 30 && (ay2 <= by1 || by2 <= ay1), across = oy2 - oy1 >= 20 && (ax2 <= bx1 || bx2 <= ax1);
    if (!vertical && !across) return;
    list.forEach(function (it, k) {
      var P = lay.L.nodes[it.from], Q = lay.L.nodes[it.to], f = (k + 1) / (list.length + 1);
      if (vertical) {
        var x = Math.round(ox1 + (ox2 - ox1) * f), down = P.y < Q.y;
        it.e.fromAnchor = [Math.round((x - (P.x - P.w / 2)) / P.w * 1000) / 1000, down ? 1 : 0];
        it.e.toAnchor = [Math.round((x - (Q.x - Q.w / 2)) / Q.w * 1000) / 1000, down ? 0 : 1];
      } else {
        var y = Math.round(oy1 + (oy2 - oy1) * f), right = P.x < Q.x;
        it.e.fromAnchor = [right ? 1 : 0, Math.round((y - (P.y - P.h / 2)) / P.h * 1000) / 1000];
        it.e.toAnchor = [right ? 0 : 1, Math.round((y - (Q.y - Q.h / 2)) / Q.h * 1000) / 1000];
      }
    });
  });
}
/* Each label at the point of its wire where it covers the fewest blocks, labels and other wires. */
function hierPlaceLabels(d) {
  var lay = hierLayoutNow(d);
  if (!lay) return;
  var L = lay.L, blocks = hierBoxes(L, 3), segs = [], frames = [];
  L.edges.forEach(function (r, j) { var p = r.points || []; for (var k = 1; k < p.length; k++) segs.push({ j: j, a: p[k - 1], b: p[k] }); });
  /* a group title is drawn over the labels: a label under it would be hidden, so it counts as a block */
  lay.nd.groups.forEach(function (g) {
    var b = L.groups[g.id];
    if (!b || g.hidden) return;
    frames.push(b);
    if (g.label && !g.drawio && !Object.keys(g.style || {}).length) blocks.push({ id: g.id + ':chip', x: b.x + 11, y: b.y - 13, w: chipWidth(g) + 6, h: 26 });
  });
  var cut = function (b, q) { return b.x < q.x + q.w && b.x + b.w > q.x && b.y < q.y + q.h && b.y + b.h > q.y; };
  var astride = function (b, f) { return cut(b, f) && !(b.x >= f.x && b.y >= f.y && b.x + b.w <= f.x + f.w && b.y + b.h <= f.y + f.h); };
  /* every label's candidate spots with what each costs on its own: the middle of each piece of its wire and each end of
     that piece with the label just fitting in, on the wire or just beside it where the wire runs up or down */
  var items = [];
  lay.nd.edges.forEach(function (ne, i) {
    var lm = L.labelM[i], r = L.edges[i], e = d.edges[ne.rawIndex];
    if (!e || !lm || !lm.w || !r || !r.points || r.points.length < 2 || ne.labelOffset) return;
    var cur = isFinite(+e.labelAt) ? +e.labelAt : 0, pts = r.points, lens = [], total = 0, spots = [];
    for (var k = 1; k < pts.length; k++) { var l = Math.sqrt(Math.pow(pts[k].x - pts[k - 1].x, 2) + Math.pow(pts[k].y - pts[k - 1].y, 2)); lens.push(l); total += l; }
    if (!total) return;
    var ats = [cur, 0], s0 = 0;
    lens.forEach(function (l, k) {
      var half = (Math.abs(pts[k + 1].y - pts[k].y) < 0.5 ? lm.w : lm.h) / 2 + 8;
      [s0 + l / 2, s0 + half, s0 + l - half].forEach(function (at) { if (at > s0 && at < s0 + l) ats.push(Math.round((2 * at / total - 1) * 1000) / 1000); });
      s0 += l;
    });
    ats.filter(function (at, k) { return ats.indexOf(at) === k; }).forEach(function (at) {
      var p0 = labelPoint(pts, at, 0), p1 = labelPoint(pts, at, 1);
      if (!isFinite(p0.x)) return;
      var upright = Math.abs(p1.x - p0.x) > 0.5, side = upright ? lm.w / 2 + 8 : lm.h / 2 + 6;
      [0, side, -side].forEach(function (dist) {
        var p = labelPoint(pts, at, dist), b = { x: p.x - lm.w / 2, y: p.y - lm.h / 2, w: lm.w, h: lm.h };
        var own = blocks.filter(function (q) { return cut(b, q); }).length * 20
          + segs.reduce(function (seen, sg) { if (sg.j !== i && seen.indexOf(sg.j) < 0 && segHitsBox(sg.a, sg.b, b)) seen.push(sg.j); return seen; }, []).length * 2
          + frames.filter(function (f) { return astride(b, f); }).length * 3 + Math.abs(at) * 0.5 + (dist ? (upright ? 3 : 6) : 0);
        spots.push({ at: at, dist: dist, own: own, box: { x: b.x - 3, y: b.y - 3, w: b.w + 6, h: b.h + 6 } });
      });
    });
    if (spots.length) items.push({ e: e, spots: spots, pick: null });
  });
  /* one label after the other, then each again knowing where all the others went, until nothing moves: a label placed
     early gives way when that lets a later one off another label */
  var costOf = function (it, sp) {
    return sp.own + items.reduce(function (t, o) { return o === it || !o.pick ? t : t + (cut(sp.box, o.pick.box) ? 10 : 0); }, 0);
  };
  for (var round = 0; round < 6; round++) {
    var moved = false;
    items.forEach(function (it) {
      var best = null, bestCost = Infinity;
      it.spots.forEach(function (sp) { var c = costOf(it, sp); if (c < bestCost - 1e-9) { bestCost = c; best = sp; } });
      if (best !== it.pick) { it.pick = best; moved = true; }
    });
    if (!moved) break;
  }
  items.forEach(function (it) {
    if (it.pick.at) it.e.labelAt = it.pick.at; else delete it.e.labelAt;
    if (it.pick.dist) it.e.labelDist = Math.round(it.pick.dist); else delete it.e.labelDist;
  });
}
/* An arrangement places the notes again: attached ones find a free spot by what they are about, the others go right. */
function hierFreeNotes(d) { (d.notes || []).forEach(function (q) { if (q) { delete q.x; delete q.y; delete q.dx; delete q.dy; } }); }

/* Stages: every top-level group is a stage (a column), in the order the signal runs through them. Blocks in no group
   sit above or below the stage they share most wires with (caches, memories). Wires to the next stage go straight
   across, wires back or over a stage run in a corridor under the columns, and the rest round the blocks in their way. */
var HS = { left: 80, top: 80, colGap: 170, gapY: 44, band: 90, minCol: 200 };
function hierArrangeStages(d) {
  if (str(d.boardOf) || d.detailOf) return ht('eArrangeBoard');
  var nodes = (d.nodes || []).filter(function (n) { return n && str(n.id) && !n.port; });
  var byId = {}, groups = asGroupIds(d);
  nodes.forEach(function (n) { byId[str(n.id)] = n; });
  var topOf = function (gid) { for (var k = 0; gid && groups[gid] && str(groups[gid].parent) && groups[str(groups[gid].parent)] && k < 30; k++) gid = str(groups[gid].parent); return gid || null; };
  var stageOf = {}, stages = [];
  (d.groups || []).forEach(function (g) { if (g && !str(g.parent)) stages.push(str(g.id)); });
  nodes.forEach(function (n) { var t = topOf(str(n.group)); if (t && stages.indexOf(t) >= 0) stageOf[str(n.id)] = t; });
  stages = stages.filter(function (s0) { return nodes.some(function (n) { return stageOf[str(n.id)] === s0; }); });
  if (stages.length < 2) return ht('eArrangeStages');
  var edges = (d.edges || []).filter(function (e) { return e && byId[str(e.from)] && byId[str(e.to)] && str(e.from) !== str(e.to); });
  var back = function (e) { return e.kind === 'feedback' || e.dir === 'back'; };
  /* the order of the stages: the flow between them, feedback wires left out */
  var inDeg = {}, next = {};
  stages.forEach(function (s0) { inDeg[s0] = 0; next[s0] = {}; });
  edges.forEach(function (e) {
    var a = stageOf[str(e.from)], b = stageOf[str(e.to)];
    if (!a || !b || a === b || back(e) || next[a][b]) return;
    next[a][b] = true; inDeg[b]++;
  });
  var order = [], left = stages.slice();
  while (left.length) {
    var pick = left.filter(function (s0) { return inDeg[s0] === 0; })[0] || left.slice().sort(function (a, b) { return inDeg[a] - inDeg[b]; })[0];
    order.push(pick);
    left.splice(left.indexOf(pick), 1);
    Object.keys(next[pick]).forEach(function (b) { inDeg[b]--; });
  }
  var col = {};
  order.forEach(function (s0, i) { col[s0] = i; });
  /* blocks in no stage go with the stage they share most wires with: above it when they feed it, below when they read it */
  var sat = {};
  nodes.forEach(function (n) {
    var id = str(n.id);
    if (stageOf[id]) return;
    var votes = {}, into = 0, from = 0;
    edges.forEach(function (e) {
      var a = str(e.from), b = str(e.to), o = a === id ? b : b === id ? a : null;
      if (!o || !stageOf[o]) return;
      votes[stageOf[o]] = (votes[stageOf[o]] || 0) + 1;
      if (a === id) into++; else from++;
    });
    var best = null;
    Object.keys(votes).forEach(function (s0) { if (!best || votes[s0] > votes[best] || (votes[s0] === votes[best] && col[s0] < col[best])) best = s0; });
    sat[id] = { stage: best || order[order.length - 1], above: into >= from };
  });
  /* each stage stacked in the order its own wires run (a wire through a cache of the stage counts: PC → I-cache → fetch);
     where the wires leave a choice, blocks wired to a cache above the column go up and those wired to one below go down */
  var lean = {};
  Object.keys(sat).forEach(function (sid) {
    edges.forEach(function (e) {
      var o = str(e.from) === sid ? str(e.to) : str(e.to) === sid ? str(e.from) : null;
      if (o && stageOf[o] === sat[sid].stage) lean[o] = (lean[o] || 0) + (sat[sid].above ? 1 : -1);
    });
  });
  var size = {}, measured = hierMeasure(d);
  nodes.forEach(function (n) { size[str(n.id)] = measured[str(n.id)] || hierRealSize(n); });
  hierFreeGroups(d);
  hierFreeNotes(d);
  var stack = {};
  order.forEach(function (s0) {
    var mine = nodes.filter(function (n) { return stageOf[str(n.id)] === s0; }).map(function (n) { return str(n.id); });
    var indeg = {}, adj = {}, link = function (a, b) { if (adj[a] && adj[b] && a !== b && adj[a].indexOf(b) < 0) { adj[a].push(b); indeg[b]++; } };
    mine.forEach(function (m) { indeg[m] = 0; adj[m] = []; });
    edges.forEach(function (e) { if (!back(e)) link(str(e.from), str(e.to)); });
    Object.keys(sat).forEach(function (sid) {
      if (sat[sid].stage !== s0) return;
      edges.forEach(function (e1) { if (str(e1.to) !== sid || back(e1)) return; edges.forEach(function (e2) { if (str(e2.from) === sid && !back(e2)) link(str(e1.from), str(e2.to)); }); });
    });
    var out = [], pool = mine.slice();
    while (pool.length) {
      var free = pool.filter(function (x) { return indeg[x] === 0; });
      if (!free.length) free = [pool[0]];
      free.sort(function (p, q) { return (lean[q] || 0) - (lean[p] || 0) || pool.indexOf(p) - pool.indexOf(q); });
      var m = free[0];
      out.push(m);
      pool.splice(pool.indexOf(m), 1);
      adj[m].forEach(function (b) { indeg[b]--; });
    }
    stack[s0] = out;
  });
  var colW = order.map(function (s0) {
    var w = HS.minCol;
    stack[s0].forEach(function (m) { w = Math.max(w, size[m].w); });
    Object.keys(sat).forEach(function (id) { if (sat[id].stage === s0) w = Math.max(w, size[id].w); });
    return w;
  });
  (d.edges || []).forEach(function (e) {
    if (!e) return;
    delete e.points; delete e.labelAt; delete e.labelDist;
    if (!asPinsOf(byId[str(e.from)]).length && !asPinsOf(byId[str(e.to)]).length) { delete e.fromAnchor; delete e.toAnchor; }
  });
  /* The wires between the columns. A wire to the next stage leaves its block on the right and enters the next on the
     left, across the empty gap (left to itself the router takes the top or bottom of a wide block and runs down through
     the column). A block feeding several blocks of the next stage runs one trunk just outside its own frame, a block fed
     by several runs one just outside the frame of the next stage, so each wire keeps a long piece of its own for its
     label. Wires back or over a stage run down into the corridor under the columns, along it and up again; the run
     spanning fewer columns takes the row nearest the columns, so the runs nest instead of crossing. */
  var colOf = function (id) { return stageOf[id] ? col[stageOf[id]] : sat[id] ? col[sat[id].stage] : null; };
  var fwdList = [], runs = [];
  edges.forEach(function (e) {
    var a = str(e.from), b = str(e.to), ca = colOf(a), cb = colOf(b);
    if (asPinsOf(byId[a]).length || asPinsOf(byId[b]).length || ca === null || cb === null || sat[a] || sat[b] || ca === cb) return;
    if (cb === ca + 1) fwdList.push({ e: e, a: a, b: b, ca: ca });
    else runs.push({ e: e, a: a, b: b, ca: ca, cb: cb, span: Math.abs(cb - ca) });
  });
  var outs = {}, ins = {}, pairN = {};
  fwdList.forEach(function (w) {
    (outs[w.a] = outs[w.a] || {})[w.b] = 1;
    (ins[w.b] = ins[w.b] || {})[w.a] = 1;
    w.k = pairN[w.a + '\u0001' + w.b] = (pairN[w.a + '\u0001' + w.b] || 0) + 1;
  });
  var laneR = order.map(function () { return 0; }), laneL = order.map(function () { return 0; }), trunk = {};
  fwdList.forEach(function (w) {
    var no = Object.keys(outs[w.a]).length, ni = Object.keys(ins[w.b]).length, n = pairN[w.a + '\u0001' + w.b];
    var f = n > 1 ? Math.round(w.k / (n + 1) * 1000) / 1000 : 0.5;
    w.e.fromAnchor = [1, f];
    w.e.toAnchor = [0, f];
    w.trunk = no > 1 && ni === 1 ? 'out:' + w.a : ni > 1 && no === 1 ? 'in:' + w.b : null;
    if (w.trunk && trunk[w.trunk] === undefined) trunk[w.trunk] = w.trunk.charAt(0) === 'o' ? laneR[w.ca]++ : laneL[w.ca + 1]++;
  });
  runs.sort(function (p, q) { return p.span - q.span || p.ca - q.ca || p.cb - q.cb; });
  runs.forEach(function (r, k) { r.row = k; r.laneA = laneR[r.ca]++; r.laneB = laneL[r.cb]++; });
  /* each gap wide enough for the longest label crossing it next to the lanes it holds */
  var labelW = {};
  if (typeof normalizeDiagram === 'function' && typeof measureLabel === 'function') {
    var keepP = problems.length, keepL = problemList.length;
    try { normalizeDiagram(d, 0).edges.forEach(function (ne) { labelW[ne.rawIndex] = measureLabel(ne).w || 0; }); } catch (err) { labelW = {}; }
    problems.length = keepP; problemList.length = keepL;
  }
  var gapW = order.slice(0, -1).map(function (s0, g) {
    var mw = 0;
    fwdList.forEach(function (w) { if (w.ca === g) mw = Math.max(mw, labelW[d.edges.indexOf(w.e)] || 0); });
    return Math.min(440, Math.max(HS.colGap, mw + 64 + 10 * (laneR[g] + laneL[g + 1])));
  });
  var aboveH = 0, bandN = 0;
  Object.keys(sat).forEach(function (id) {
    if (!sat[id].above) return;
    aboveH = Math.max(aboveH, size[id].h);
    bandN = Math.max(bandN, edges.filter(function (e) { return (str(e.from) === id || str(e.to) === id) && str(asText(e.label)); }).length);
  });
  /* the band between the caches above and the columns holds the labels of their wires, one above the other */
  var band = Math.max(HS.band, 50 + 30 * bandN);
  var top = HS.top + (aboveH ? aboveH + band : 0), x = HS.left + 10 * laneL[0], colX = [], colBottom = top;
  order.forEach(function (s0, i) {
    colX.push(x);
    var y = top;
    stack[s0].forEach(function (m) {
      var n = byId[m];
      n.x = Math.round((x + (colW[i] - size[m].w) / 2) / 10) * 10;
      n.y = Math.round(y / 10) * 10;
      y += size[m].h + HS.gapY;
    });
    colBottom = Math.max(colBottom, y - HS.gapY);
    x += colW[i] + (gapW[i] || 0);
  });
  d.layout = 'manual';
  d.route = 'orthogonal';
  d.arranged = 'stages';
  /* the frames the renderer draws round each stage: the lanes run just outside them */
  var lay0 = hierLayoutNow(d), frameL = [], frameR = [], frameB = colBottom;
  order.forEach(function (s0, i) {
    var b = lay0 && lay0.L.groups[s0];
    frameL.push(b ? b.x : colX[i] - 20);
    frameR.push(b ? b.x + b.w : colX[i] + colW[i] + 20);
    if (b) frameB = Math.max(frameB, b.y + b.h);
  });
  var laneX = function (key, c) { return key.charAt(0) === 'o' ? frameR[c] + 16 + trunk[key] * 10 : frameL[c + 1] - 16 - trunk[key] * 10; };
  fwdList.forEach(function (w) {
    if (!w.trunk) return;
    var A = byId[w.a], B = byId[w.b], ys = Math.round(+A.y + size[w.a].h * w.e.fromAnchor[1]), yt = Math.round(+B.y + size[w.b].h * w.e.toAnchor[1]);
    if (ys !== yt) { var xt = Math.round(laneX(w.trunk, w.ca)); w.e.points = [[xt, ys], [xt, yt]]; }
  });
  var corridorTop = frameB + 20, corridorH = Math.max(HS.band, 20 + runs.length * 10 + 26);
  /* where a run leaves and enters its blocks: the middle of the side when no other wire uses it, lower down otherwise;
     the deeper run higher up, so it does not cross the others at the block */
  var busy = {};
  fwdList.forEach(function (w) { busy[w.a + '|E'] = 1; busy[w.b + '|W'] = 1; });
  var slotN = {};
  var slot = function (id, side) {
    var k = slotN[id + '|' + side] = (slotN[id + '|' + side] || 0) + 1;
    var list = busy[id + '|' + side] ? [0.7, 0.8, 0.9, 0.3, 0.2] : [0.5, 0.66, 0.8, 0.34, 0.2];
    return list[Math.min(k - 1, list.length - 1)];
  };
  runs.slice().sort(function (p, q) { return q.row - p.row; }).forEach(function (r) {
    var fs = slot(r.a, 'E'), ft = slot(r.b, 'W'), A = byId[r.a], B = byId[r.b];
    var ys = Math.round(+A.y + size[r.a].h * fs), yt = Math.round(+B.y + size[r.b].h * ft), yc = corridorTop + r.row * 10;
    var xa = Math.round(frameR[r.ca] + 16 + r.laneA * 10), xb = Math.round(frameL[r.cb] - 16 - r.laneB * 10);
    r.e.fromAnchor = [1, fs];
    r.e.toAnchor = [0, ft];
    r.e.points = [[xa, ys], [xa, yc], [xb, yc], [xb, yt]];
  });
  /* the satellites of a stage, side by side above or below its column */
  var belowTop = corridorTop + corridorH;
  order.forEach(function (s0, i) {
    ['above', 'below'].forEach(function (side) {
      var ids = Object.keys(sat).filter(function (id) { return sat[id].stage === s0 && sat[id].above === (side === 'above'); });
      var total = ids.reduce(function (t, id) { return t + size[id].w; }, 0) + 30 * Math.max(0, ids.length - 1), sx = colX[i] + (colW[i] - total) / 2;
      ids.forEach(function (id) {
        var n = byId[id];
        n.x = Math.round(sx / 10) * 10;
        n.y = Math.round((side === 'above' ? HS.top + aboveH - size[id].h : belowTop) / 10) * 10;
        sx += size[id].w + 30;
      });
    });
  });
  hierSplitPairs(d);
  hierUnblock(d);
  hierPlaceLabels(d);
  return null;
}

/* Each port slides along its side to face the block it leads to, keeping clear of the other ports on that side. */
function hierAlignPorts(d, g, ports, wires, ids, size) {
  var nodes = asNodes(d), bySide = { left: [], right: [], top: [], bottom: [] };
  ports.forEach(function (p) {
    var mate = null;
    wires.forEach(function (e) {
      if (mate) return;
      if (str(e.from) === str(p.id) && ids[str(e.to)]) mate = nodes[str(e.to)];
      else if (str(e.to) === str(p.id) && ids[str(e.from)]) mate = nodes[str(e.from)];
    });
    var side = hierPortSide(p), z = hierRealSize(p), vertical = side === 'top' || side === 'bottom';
    var want = mate ? (vertical ? +mate.x + size[str(mate.id)].w / 2 - z.w / 2 : +mate.y + size[str(mate.id)].h / 2 - z.h / 2) : (vertical ? +p.x : +p.y);
    bySide[side].push({ p: p, z: z, want: want });
  });
  Object.keys(bySide).forEach(function (side) {
    var list = bySide[side], vertical = side === 'top' || side === 'bottom';
    if (!list.length) return;
    list.sort(function (a, b) { return a.want - b.want; });
    var lo = vertical ? +g.x + (side === 'top' ? hierChipW(str(asText(g.label)) || str(g.id)) + 10 : 20) : +g.y + 30;
    var hi = vertical ? +g.x + +g.w - 20 : +g.y + +g.h - 20;
    var len = function (q) { return vertical ? q.z.w : q.z.h; }, gap = vertical ? 16 : 10, at = [];
    list.forEach(function (q, k) { at[k] = Math.max(q.want, lo, k ? at[k - 1] + len(list[k - 1]) + gap : lo); });
    for (var k = list.length - 1; k >= 0; k--) at[k] = Math.min(at[k], (k < list.length - 1 ? at[k + 1] - gap : hi) - len(list[k]));
    list.forEach(function (q, k) { if (vertical) q.p.x = Math.round(Math.max(at[k], lo) / 2) * 2; else q.p.y = Math.round(Math.max(at[k], lo) / 2) * 2; });
  });
}
/* Frames a growing frame now covers move out of its way (down, or right when they sit beside it), with their ports and insides. */
function hierFrameMembers(d, gid) {
  var inG = {}; inG[gid] = true;
  for (var pass = 0; pass < 20; pass++) (d.groups || []).forEach(function (x) { if (x && str(x.parent) && inG[str(x.parent)]) inG[str(x.id)] = true; });
  return inG;
}
function hierShiftFrame(d, gid, dx, dy) {
  var inG = hierFrameMembers(d, gid), moved = {};
  (d.groups || []).forEach(function (x) { if (x && inG[str(x.id)] && finiteNum(x.x) !== null) { x.x = Math.round(+x.x + dx); x.y = Math.round(+x.y + dy); } });
  (d.nodes || []).forEach(function (n) {
    if (!n || !(inG[str(n.group)] || (n.port && inG[str(n.port.of)])) || finiteNum(n.x) === null) return;
    n.x = Math.round(+n.x + dx); n.y = Math.round(+n.y + dy); moved[str(n.id)] = true;
  });
  (d.edges || []).forEach(function (e) {
    if (!e || !Array.isArray(e.points)) return;
    var a = moved[str(e.from)] || inG[str(e.from)], b = moved[str(e.to)] || inG[str(e.to)];
    if (a && b) e.points = e.points.map(function (q) { return hierMovePt(q, dx, dy); });
    else if (a || b) delete e.points;
  });
}
function hierPushAway(d, g, depth, pinned) {
  if ((depth || 0) > 6) return;
  pinned = pinned || {};
  pinned[str(g.id)] = true;
  var me = hierFrameBox(g), mine = hierFrameMembers(d, str(g.id)), gap = HB.gap / 2;
  var ancestors = {};
  for (var up = str(g.parent), k = 0; up && k < 20; k++) { ancestors[up] = true; var pg = asGroupIds(d)[up]; up = pg ? str(pg.parent) : ''; }
  (d.groups || []).forEach(function (o) {
    if (!o || o === g || pinned[str(o.id)] || mine[str(o.id)] || ancestors[str(o.id)] || !str(o.source) || finiteNum(o.x) === null) return;
    var b = hierFrameBox(o);
    if (!(b.x < me.x + me.w + gap && b.x + b.w + gap > me.x && b.y < me.y + me.h + gap && b.y + b.h + gap > me.y)) return;
    var needX = me.x + me.w + gap - b.x, needY = me.y + me.h + gap - b.y;
    var right = b.x >= me.x + 10, down = b.y >= me.y + me.h / 2;
    var toRight = right && (!down || needX <= needY);
    if (!right && !down) toRight = needX <= needY;
    var dx = toRight ? needX : 0, dy = toRight ? 0 : needY;
    if (dx <= 0 && dy <= 0) return;
    hierShiftFrame(d, str(o.id), Math.max(0, Math.ceil(dx / 10) * 10), Math.max(0, Math.ceil(dy / 10) * 10));
    hierPushAway(d, o, (depth || 0) + 1, pinned);
  });
}
function hierPlacePort(d, n, g) {
  var f = hierFrameBox(g), x = finiteNum(n.x), y = finiteNum(n.y), s = hierPortSize(str(n.port.name), 'left');
  var cx = x === null ? f.x + f.w : x + s.w / 2, cy = y === null ? f.y + f.h / 2 : y + s.h / 2;
  var dists = { left: Math.abs(cx - f.x), right: Math.abs(cx - (f.x + f.w)), top: Math.abs(cy - f.y), bottom: Math.abs(cy - (f.y + f.h)) };
  var side = Object.keys(dists).sort(function (a, b) { return dists[a] - dists[b]; })[0];
  var id = str(n.id), keep = { name: str(n.port.name), dir: PORT_DIRS.indexOf(n.port.dir) >= 0 ? n.port.dir : 'inout', kind: n.port.kind || null };
  d.nodes = d.nodes.filter(function (q) { return q !== n; });
  var made = hierAddPort(d, g, keep, side, id);
  ['title', 'desc'].forEach(function (k) { if (n[k] !== undefined) made[k] = n[k]; });
}
var hierAddNode0 = AS_OPS.addNode;
AS_OPS.addNode = function (d, op, touched) {
  var err = hierAddNode0(d, op, touched);
  if (err || !asManual(d)) return err;
  var n = asNodes(d)[str(op.node && op.node.id)];
  if (!n) return null;
  var gid = n.port && str(n.port.of) ? str(n.port.of) : str(n.group), g = gid ? asGroupIds(d)[gid] : null;
  if (!g || finiteNum(g.x) === null || finiteNum(g.y) === null || !(+g.w > 0) || !(+g.h > 0)) return null;
  /* only the frames of a detail board (and frames drawn on one): other hand-placed groups keep what the op says */
  if (!str(g.source) && !str(d.boardOf) && !(d.detailOf && typeof d.detailOf === 'object')) return null;
  if (n.port) { hierPlacePort(d, n, g); return null; }
  /* a tidyFrame later in the same batch lays the frame out: growing it block by block first would push its neighbours
     further than the final drawing needs */
  if (AS_LIST && AS_LIST.some(function (o) { return o && o.op === 'tidyFrame' && str(o.id) === gid; })) return null;
  hierFitFrame(d, n, g);
  return null;
};
