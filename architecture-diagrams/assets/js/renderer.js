/* Renderer: parses the spec, lays out and draws every diagram type. */
var SVG_NS = 'http://www.w3.org/2000/svg';
var FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';
var LH = 1.34;

var I18N = {
  en: {
    readFirst: 'READ ME FIRST',
    hint: 'Click a card to trace its connections. Click empty space to reset.',
    steps: 'Steps', prev: 'Previous step', next: 'Next step', play: 'Play the steps', pause: 'Pause',
    zoomIn: 'Zoom in', zoomOut: 'Zoom out', fit: 'Fit', fitTitle: 'Fit the diagram to the window',
    exportSvg: 'Download as SVG (vector image for PowerPoint, Word and draw.io)', exportPng: 'Download as PNG image',
    toLight: 'Switch to light theme', toDark: 'Switch to dark theme',
    external: 'External system', stepMark: 'Reading order (see Steps)',
    kinds: { normal: 'Connection', main: 'Main path', async: 'Asynchronous (queue, event, interrupt)', storage: 'Read or write data', ok: 'Success', fail: 'Failure', feedback: 'Loop back or retry', bus: 'Bus', clock: 'Clock', reset: 'Reset' },
    exportDrawio: 'Download for draw.io / diagrams.net: every tab becomes an editable page', exportMermaid: 'Download this diagram as Mermaid text (GitHub, GitLab, Confluence, Notion)', exportCsv: 'Download the table as CSV (Excel, Google Sheets)',
    regCols: ['Bits', 'Field', 'Access', 'Reset', 'Description'], reserved: 'Reserved', bitsWord: 'bit',
    memCols: ['Start', 'End', 'Size', 'Region', 'Description'], unmapped: 'Unmapped',
    pinCols: ['Pin', 'Name', 'Type', 'Alternate functions', 'Description'],
    pinTypes: { power: 'Power', ground: 'Ground', analog: 'Analog', clock: 'Clock', reset: 'Reset', debug: 'Debug', config: 'Configuration', nc: 'Not connected' },
    hintChip: 'Block diagram in datasheet style: blocks hang off the buses, pins sit on the chip outline.',
    hintPin: 'Package pinout, top view. Hover a pin for its details; the full table is below.',
    hintWave: 'Timing diagram (WaveJSON, the WaveDrom format). Each column is one clock cycle.',
    hintReg: 'Bit numbers on top, fields below. The table under the picture lists access type and reset value.',
    hintMem: 'Address map: lowest address at the bottom, highest at the top.',
    initial: 'Initial state', final: 'Final state',
    noteKinds: { note: 'Note', constraint: 'Constraint', reason: 'Why', change: 'Change', question: 'Question', todo: 'To do', legend: 'Legend' },
    notesOn: 'Notes: shown (click to hide them)', notesOff: 'Notes: hidden (click to show them)', notesBtn: 'Notes',
    frameEmpty: 'Nothing inside yet', frameEmptyHint: 'Draw here, or select the frame and ask AI',
    detailIn: 'Inside: tab {x}', detailOpen: 'Open the tab with what is inside this block',
    crumbUp: 'Back to', crumbBoard: 'Detail board', crumbDetail: 'Inside of', boardOfIt: 'This tab is the detail board of',
    hasBoard: 'Detail board:', portIn: 'input', portOut: 'output', portIo: 'in/out',
    download: 'Download', fmtCopy: 'Copy picture (paste into Word, PowerPoint, Teams)', copied: 'Copied', copyFail: 'Saved as PNG instead', fmtSvg: 'SVG, vector (PowerPoint, Word)', fmtPng: 'PNG image', fmtDrawio: 'draw.io file, editable (all tabs)', fmtMermaid: 'Mermaid text', fmtCsv: 'CSV table (Excel)',
    noDagre: 'The layout library (dagre) could not be loaded. Open this file with an internet connection, or rebuild it with build.py --dagre <path to dagre.min.js> to embed the library.',
    badSpec: 'The diagram data could not be read:',
    rawTemplate: 'This is the empty template. Build a diagram with scripts/build.py instead of opening this file directly.',
    skipped: 'Some parts of the diagram were skipped:',
    oldBrowser: 'This browser is too old to open draw.io shapes and compressed draw.io pages. Use a recent Chrome or Edge, Firefox 113 or later, or Safari 16.4 or later.',
    pngFail: 'The browser could not turn this diagram into a PNG. Use the SVG download instead.',
    made: 'Made with the architecture-diagrams skill',
    gridTitle: 'Show or hide the alignment grid', zoomLevel: 'Zoom level (keys: + and − to zoom, 0 to fit)',
    search: 'Find a card', searchTitle: 'Find cards by name or description (shortcut: /)', incoming: 'Incoming from', outgoing: 'Outgoing to', none: 'None', close: 'Close',
    msg: {
      nodeNoId: 'node #{k} has no "id".', dupNode: 'duplicate node id "{id}".',
      groupNoId: 'group #{k} has no "id".', dupGroup: 'duplicate group id "{id}".',
      badParent: 'group "{id}" has an unknown parent "{p}".', parentLoop: 'group parents form a loop at "{id}".',
      badGroup: 'node "{id}" uses an unknown group "{g}".', badEdge: 'edge #{k} ({a} → {b}) points to a missing node.',
      stepNode: 'step {k} points to a missing node "{id}".', stepEdge: 'step {k} points to a missing edge {a} → {b}.',
      stepNeither: 'step {k} needs "node" or "edge".', noNodes: 'has no nodes.',
      waveEmpty: 'has no signals.', waveEdge: 'arrow "{e}" uses a marker that no signal defines.',
      regBits: 'register {r}: field "{f}" has no valid bit range and was skipped.', regRange: 'register {r}: field "{f}" does not fit in {w} bits and was skipped.',
      regOverlap: 'register {r}: field "{f}" overlaps another field and was skipped.', regNone: 'has no registers.',
      memBad: 'region "{r}" needs a valid "base" and a "size" or "end".', memOverlap: 'region "{r}" overlaps "{o}".', memNone: 'has no regions.',
      badShape: 'node "{id}" uses an unknown shape "{s}", so it is drawn as a card.'
    },
    pinDir: { in: 'input', out: 'output', clk: 'clock or enable input', io: 'no direction' },
    wire: {
      outOut: 'Connection {k} joins two outputs: {a} and {b}.',
      reversed: 'Connection {k} runs backwards, from input {a} into output {b}. Swap its two ends or its arrow.',
      fromInput: 'Connection {k} leaves from input {a}. A signal should leave from an output.',
      intoOutput: 'Connection {k} goes into output {b}. A signal should go into an input.',
      twoDrivers: 'Input {p} receives {c} signals. An input should have one source.',
      needPin: '{n} has nothing on its {p} pin. This block needs a clock or enable there.',
      stacked: '{a} sits on top of {b}.'
    }
  },
  vi: {
    readFirst: 'ĐỌC TRƯỚC',
    hint: 'Bấm vào một khối để xem các kết nối của nó. Bấm vào chỗ trống để bỏ chọn.',
    steps: 'Các bước', prev: 'Bước trước', next: 'Bước sau', play: 'Tự chạy lần lượt các bước', pause: 'Tạm dừng',
    zoomIn: 'Phóng to', zoomOut: 'Thu nhỏ', fit: 'Vừa khung', fitTitle: 'Thu sơ đồ cho vừa khung nhìn',
    exportSvg: 'Tải về dạng SVG (ảnh vector, dán vào PowerPoint, Word và draw.io)', exportPng: 'Tải về dạng ảnh PNG',
    toLight: 'Chuyển sang nền sáng', toDark: 'Chuyển sang nền tối',
    external: 'Hệ thống bên ngoài', stepMark: 'Thứ tự đọc (xem mục Các bước)',
    kinds: { normal: 'Kết nối', main: 'Luồng chính', async: 'Bất đồng bộ (hàng đợi, sự kiện, ngắt)', storage: 'Đọc hoặc ghi dữ liệu', ok: 'Thành công', fail: 'Lỗi', feedback: 'Quay lại hoặc làm lại', bus: 'Bus', clock: 'Xung nhịp (clock)', reset: 'Reset' },
    exportDrawio: 'Tải về cho draw.io / diagrams.net: mỗi tab thành một trang sửa được', exportMermaid: 'Tải sơ đồ này dạng văn bản Mermaid (GitHub, GitLab, Confluence, Notion)', exportCsv: 'Tải bảng dạng CSV (Excel, Google Sheets)',
    regCols: ['Bit', 'Trường', 'Truy cập', 'Giá trị reset', 'Mô tả'], reserved: 'Dự trữ', bitsWord: 'bit',
    memCols: ['Bắt đầu', 'Kết thúc', 'Kích thước', 'Vùng', 'Mô tả'], unmapped: 'Chưa dùng',
    pinCols: ['Chân', 'Tên', 'Loại', 'Chức năng khác', 'Mô tả'],
    pinTypes: { power: 'Nguồn', ground: 'Đất (GND)', analog: 'Tương tự', clock: 'Xung nhịp', reset: 'Reset', debug: 'Gỡ lỗi', config: 'Cấu hình', nc: 'Không nối' },
    hintChip: 'Sơ đồ khối kiểu datasheet: các khối gắn vào bus, chân tín hiệu nằm trên viền chip.',
    hintPin: 'Sơ đồ chân vỏ chip, nhìn từ trên. Đưa chuột vào một chân để xem chi tiết; bảng đầy đủ ở bên dưới.',
    hintWave: 'Giản đồ thời gian (định dạng WaveJSON của WaveDrom). Mỗi cột là một chu kỳ clock.',
    hintReg: 'Số bit ở trên, các trường ở dưới. Bảng dưới hình ghi kiểu truy cập và giá trị reset.',
    hintMem: 'Bản đồ địa chỉ: địa chỉ thấp nhất ở dưới cùng, cao nhất ở trên cùng.',
    initial: 'Trạng thái đầu', final: 'Trạng thái cuối',
    noteKinds: { note: 'Ghi chú', constraint: 'Ràng buộc', reason: 'Lý do', change: 'Thay đổi', question: 'Câu hỏi', todo: 'Việc cần làm', legend: 'Chú giải' },
    notesOn: 'Ghi chú: đang hiện (bấm để ẩn)', notesOff: 'Ghi chú: đang ẩn (bấm để hiện)', notesBtn: 'Ghi chú',
    frameEmpty: 'Chưa có chi tiết bên trong', frameEmptyHint: 'Vẽ vào đây, hoặc chọn khung rồi nhờ AI',
    detailIn: 'Bên trong: tab {x}', detailOpen: 'Mở tab chứa phần bên trong của khối này',
    crumbUp: 'Quay lại', crumbBoard: 'Bảng chi tiết', crumbDetail: 'Bên trong', boardOfIt: 'Tab này là bảng chi tiết của',
    hasBoard: 'Bảng chi tiết:', portIn: 'vào', portOut: 'ra', portIo: 'vào/ra',
    download: 'Tải về', fmtCopy: 'Chép ảnh để dán vào Word, PowerPoint, Teams', copied: 'Đã chép', copyFail: 'Đã tải PNG thay thế', fmtSvg: 'SVG, ảnh vector (PowerPoint, Word)', fmtPng: 'Ảnh PNG', fmtDrawio: 'File draw.io sửa được (mọi tab)', fmtMermaid: 'Văn bản Mermaid', fmtCsv: 'Bảng CSV (Excel)',
    noDagre: 'Không tải được thư viện dàn trang dagre. Bạn mở file khi có mạng internet, hoặc build lại bằng build.py --dagre <đường dẫn tới dagre.min.js> để nhúng sẵn thư viện.',
    badSpec: 'Không đọc được dữ liệu sơ đồ:',
    rawTemplate: 'Đây là file mẫu rỗng. Bạn dùng scripts/build.py để tạo sơ đồ thay vì mở trực tiếp file này.',
    skipped: 'Một số phần của sơ đồ đã bị bỏ qua:',
    oldBrowser: 'Trình duyệt này quá cũ nên không mở được hình draw.io và trang draw.io dạng nén. Hãy dùng Chrome hoặc Edge bản mới, Firefox từ bản 113, hoặc Safari từ bản 16.4.',
    pngFail: 'Trình duyệt không chuyển được sơ đồ này sang PNG. Bạn dùng nút tải SVG thay thế.',
    made: 'Tạo bằng skill architecture-diagrams',
    gridTitle: 'Bật hoặc tắt lưới canh hàng', zoomLevel: 'Mức phóng (phím + và − để phóng to, thu nhỏ; phím 0 để vừa khung)',
    search: 'Tìm khối', searchTitle: 'Tìm khối theo tên hoặc mô tả (phím tắt: /)', incoming: 'Đi vào từ', outgoing: 'Đi ra tới', none: 'Không có', close: 'Đóng',
    msg: {
      nodeNoId: 'khối thứ {k} thiếu "id".', dupNode: 'trùng id khối "{id}".',
      groupNoId: 'nhóm thứ {k} thiếu "id".', dupGroup: 'trùng id nhóm "{id}".',
      badParent: 'nhóm "{id}" trỏ tới nhóm cha không tồn tại "{p}".', parentLoop: 'các nhóm lồng nhau thành vòng tại "{id}".',
      badGroup: 'khối "{id}" dùng nhóm không tồn tại "{g}".', badEdge: 'mũi tên thứ {k} ({a} → {b}) trỏ tới khối không tồn tại.',
      stepNode: 'bước {k} trỏ tới khối không tồn tại "{id}".', stepEdge: 'bước {k} trỏ tới mũi tên không tồn tại {a} → {b}.',
      stepNeither: 'bước {k} cần có "node" hoặc "edge".', noNodes: 'không có khối nào.',
      waveEmpty: 'không có tín hiệu nào.', waveEdge: 'mũi tên "{e}" dùng điểm đánh dấu không có trong tín hiệu nào.',
      regBits: 'thanh ghi {r}: trường "{f}" thiếu dải bit hợp lệ nên bị bỏ qua.', regRange: 'thanh ghi {r}: trường "{f}" vượt quá {w} bit nên bị bỏ qua.',
      regOverlap: 'thanh ghi {r}: trường "{f}" chồng lên trường khác nên bị bỏ qua.', regNone: 'không có thanh ghi nào.',
      memBad: 'vùng "{r}" cần "base" hợp lệ và "size" hoặc "end".', memOverlap: 'vùng "{r}" chồng lên vùng "{o}".', memNone: 'không có vùng địa chỉ nào.',
      badShape: 'khối "{id}" dùng hình không có trong bộ ký hiệu "{s}", nên được vẽ thành thẻ thường.'
    },
    pinDir: { in: 'chân vào', out: 'chân ra', clk: 'chân clock hoặc enable', io: 'chân không phân chiều' },
    wire: {
      outOut: 'Đường nối {k} nối hai chân ra với nhau: {a} và {b}.',
      reversed: 'Đường nối {k} đi ngược chiều, từ chân vào {a} sang chân ra {b}. Hãy đổi hai đầu hoặc đổi chiều mũi tên.',
      fromInput: 'Đường nối {k} đi ra từ chân vào {a}. Tín hiệu phải đi ra từ một chân ra.',
      intoOutput: 'Đường nối {k} đi vào chân ra {b}. Tín hiệu phải đi vào một chân vào.',
      twoDrivers: 'Chân vào {p} đang nhận {c} tín hiệu. Mỗi chân vào chỉ nên có một nguồn.',
      needPin: 'Khối {n} chưa có dây vào chân {p}. Khối này cần tín hiệu clock hoặc enable ở chân đó.',
      stacked: 'Khối {a} đang nằm chồng lên khối {b}.'
    }
  }
};

/* Header colors are dark enough for white text (contrast >= 4.5:1). */
var PALETTE = {
  blue: '#2563eb', teal: '#0e7490', green: '#15803d', amber: '#b45309',
  red: '#dc2626', violet: '#7c3aed', slate: '#475569'
};
var COLOR_ORDER = Object.keys(PALETTE);

var EDGE_STYLE = {
  normal:   { width: 1.5, dash: null },
  main:     { width: 2.4, dash: null },
  async:    { width: 1.6, dash: '6 4' },
  storage:  { width: 1.4, dash: '3 3' },
  ok:       { width: 1.8, dash: null },
  fail:     { width: 1.8, dash: null },
  feedback: { width: 1.6, dash: '6 4' },
  bus:      { width: 4.2, dash: null },
  clock:    { width: 1.5, dash: '2 3' },
  reset:    { width: 1.5, dash: '8 3 2 3' }
};
var KIND_ORDER = ['main', 'bus', 'normal', 'async', 'storage', 'clock', 'reset', 'ok', 'fail', 'feedback'];
var MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
var PORT_MIN_W = { sm: 224, md: 252, lg: 284 };
var PORT_LH = 15, PORT_SIZE = 10.5, PORT_MAX = 10;

var THEMES = {
  light: {
    page: '#ffffff', cardBody: '#ffffff', cardBorder: '#d8e0ea', cardText: '#475569', shadow: 'rgba(15,23,42,0.13)',
    stepFill: '#1d4ed8', stepText: '#ffffff', stepRing: '#ffffff',
    groupFill: 0.045, groupStroke: 0.5, chipMix: ['#ffffff', 0.86], chipText: ['#000000', 0.18],
    edges: { normal: '#94a3b8', main: '#2563eb', async: '#0e7490', storage: '#a5b3c4', ok: '#16a34a', fail: '#dc2626', feedback: '#c2410c', bus: '#64748b', clock: '#7c3aed', reset: '#be123c' },
    pills: {
      normal: ['#f1f5f9', '#334155', '#e2e8f0'], storage: ['#f1f5f9', '#334155', '#e2e8f0'],
      main: ['#fef3c7', '#854d0e', '#fcd34d'], async: ['#ecfeff', '#155e75', '#a5f3fc'],
      ok: ['#dcfce7', '#166534', '#86efac'], fail: ['#fee2e2', '#991b1b', '#fca5a5'], feedback: ['#ffedd5', '#9a3412', '#fdba74'],
      bus: ['#f1f5f9', '#1e293b', '#cbd5e1'], clock: ['#f5f3ff', '#5b21b6', '#ddd6fe'], reset: ['#fff1f2', '#9f1239', '#fecdd3']
    },
    ink: '#1e293b', symFill: '#ffffff', labelBg: '#ffffff', muted: '#64748b', dioInk: '#000000',
    wave: { line: '#1e293b', grid: '#e6ebf2', z: '#2563eb', x: '#94a3b8', name: '#334155', arrow: '#2563eb', text: '#0f172a',
            fill: { '=': '#ffffff', '2': '#ffffff', '3': '#fef3c7', '4': '#dbeafe', '5': '#dcfce7', '6': '#ede9fe', '7': '#cffafe', '8': '#fee2e2', '9': '#e2e8f0' } },
    reg: { text: '#0f172a', muted: '#64748b', border: '#94a3b8', hatch: '#cbd5e1',
           fills: { RW: '#dbeafe', RO: '#e2e8f0', WO: '#ede9fe', W1C: '#fef3c7', W1S: '#fef3c7', RC: '#ffedd5', RS: '#ffedd5', other: '#dcfce7', reserved: '#f8fafc' } }
  },
  dark: {
    page: '#111827', cardBody: '#172033', cardBorder: '#2a3852', cardText: '#aab6c8', shadow: 'rgba(0,0,0,0.55)',
    stepFill: '#3b82f6', stepText: '#ffffff', stepRing: '#111827',
    groupFill: 0.08, groupStroke: 0.55, chipMix: ['#111827', 0.72], chipText: ['#ffffff', 0.6],
    edges: { normal: '#6b7a90', main: '#60a5fa', async: '#22d3ee', storage: '#5d6b80', ok: '#4ade80', fail: '#f87171', feedback: '#fb923c', bus: '#94a3b8', clock: '#a78bfa', reset: '#fb7185' },
    pills: {
      normal: ['#1e293b', '#cbd5e1', '#334155'], storage: ['#1e293b', '#cbd5e1', '#334155'],
      main: ['#3a2f0b', '#fcd34d', '#78590f'], async: ['#0b3440', '#67e8f9', '#155e75'],
      ok: ['#0f3321', '#86efac', '#166534'], fail: ['#3b1417', '#fca5a5', '#7f1d1d'], feedback: ['#3b1d0b', '#fdba74', '#7c2d12'],
      bus: ['#1e293b', '#e2e8f0', '#475569'], clock: ['#2e1065', '#ddd6fe', '#4c1d95'], reset: ['#4c0519', '#fecdd3', '#881337']
    },
    ink: '#e2e8f0', symFill: '#172033', labelBg: '#111827', muted: '#95a3b8', dioInk: '#e2e8f0',
    wave: { line: '#cbd5e1', grid: '#1f2a3d', z: '#60a5fa', x: '#64748b', name: '#cbd5e1', arrow: '#60a5fa', text: '#e5e9f0',
            fill: { '=': '#172033', '2': '#172033', '3': '#3a2f0b', '4': '#172554', '5': '#0f3321', '6': '#2e1065', '7': '#083344', '8': '#3b1417', '9': '#1e293b' } },
    reg: { text: '#e5e9f0', muted: '#95a3b8', border: '#475569', hatch: '#334155',
           fills: { RW: '#172554', RO: '#1e293b', WO: '#2e1065', W1C: '#3a2f0b', W1S: '#3a2f0b', RC: '#3b1d0b', RS: '#3b1d0b', other: '#0f3321', reserved: '#111827' } }
  }
};

var SIZES = {
  sm: { w: 176, title: 13,   desc: 11.5, padX: 10, headPad: 7,  bodyPad: 7,  icon: 14 },
  md: { w: 216, title: 14,   desc: 12,   padX: 12, headPad: 8,  bodyPad: 8,  icon: 16 },
  lg: { w: 260, title: 15.5, desc: 13,   padX: 14, headPad: 10, bodyPad: 10, icon: 18 }
};

var lang = 'en';
var themeName = 'light';
var states = [];
var active = null;
var booted = false;
var spec = null;
var problems = [];
var problemList = [];

function t(key) { return (I18N[lang] || I18N.en)[key]; }
function problem(where, key, vals) {
  var text = where + t('msg')[key].replace(/\{(\w+)\}/g, function (m, name) { return vals && vals[name] !== undefined ? vals[name] : m; });
  problems.push(text);
  problemList.push({ where: where, key: key, text: text });
}
function fmt(n) { return Math.round(n * 10) / 10; }
function str(v) { return (v === undefined || v === null) ? '' : String(v).trim(); }
function posInt(v) { var n = parseInt(v, 10); return n > 0 ? n : null; }

function hexToRgb(hex) {
  var h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgba(hex, a) { var c = hexToRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
function mix(hex, withHex, amount) {
  var a = hexToRgb(hex), b = hexToRgb(withHex);
  return '#' + a.map(function (v, i) {
    var m = Math.round(v + (b[i] - v) * amount);
    return (m < 16 ? '0' : '') + m.toString(16);
  }).join('');
}

/* ---------- DOM helpers ---------- */
function S(tag, attrs, kids) {
  var el = document.createElementNS(SVG_NS, tag);
  setAttrs(el, attrs);
  appendKids(el, kids);
  return el;
}
function H(tag, attrs, kids) {
  var el = document.createElement(tag);
  setAttrs(el, attrs);
  appendKids(el, kids);
  return el;
}
function setAttrs(el, attrs) {
  if (!attrs) return;
  Object.keys(attrs).forEach(function (k) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) return;
    if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  });
}
function appendKids(el, kids) {
  if (!kids) return;
  kids.forEach(function (k) {
    if (k === null || k === undefined) return;
    el.appendChild(typeof k === 'string' ? document.createTextNode(k) : k);
  });
}
/* Safe mini-markup: only **bold**, everything else is plain text. */
function richText(parent, text) {
  String(text).split(/\*\*(.+?)\*\*/g).forEach(function (part, i) {
    if (!part) return;
    parent.appendChild(i % 2 ? H('strong', { text: part }) : document.createTextNode(part));
  });
  return parent;
}

/* ---------- text measurement ---------- */
var measureCtx = document.createElement('canvas').getContext('2d');
function textWidth(text, size, weight, family) {
  measureCtx.font = (weight || 400) + ' ' + size + 'px ' + (family || FONT);
  return measureCtx.measureText(text).width;
}
function wrapText(text, maxWidth, size, weight, maxLines, family) {
  var lines = [];
  String(text).split(/\n/).forEach(function (para) {
    var words = [];
    para.split(/[ \t]+/).filter(Boolean).forEach(function (w) {
      var prev = words[words.length - 1];
      var glue = prev !== undefined && (
        (/^[\d.,:%+\-−×x]+$/.test(prev) && /\d/.test(prev) && Array.from(w).length <= 4) ||
        (/^[\d.,:%]+$/.test(w) && Array.from(w).length <= 3) ||
        !/[0-9A-Za-zÀ-ỹ]/.test(w));
      if (glue) words[words.length - 1] = prev + ' ' + w;
      else words.push(w);
    });
    var line = '';
    words.forEach(function (word) {
      var candidate = line ? line + ' ' + word : word;
      if (textWidth(candidate, size, weight, family) <= maxWidth) { line = candidate; return; }
      if (line) lines.push(line);
      if (textWidth(word, size, weight, family) <= maxWidth) { line = word; return; }
      var chunk = '';
      Array.from(word).forEach(function (ch) {
        if (chunk && textWidth(chunk + ch, size, weight, family) > maxWidth) { lines.push(chunk); chunk = ch; }
        else chunk += ch;
      });
      line = chunk;
    });
    lines.push(line);
  });
  if (maxLines && lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    var last = lines[maxLines - 1];
    while (last && textWidth(last + '…', size, weight, family) > maxWidth) last = Array.from(last).slice(0, -1).join('');
    lines[maxLines - 1] = last + '…';
  }
  var widest = 0;
  lines.forEach(function (l) { widest = Math.max(widest, textWidth(l, size, weight, family)); });
  return { lines: lines, width: widest };
}
function baseline(lineHeight, size) { return (lineHeight - size) / 2 + size * 0.8; }
function monoWidth(text, size) { measureCtx.font = '500 ' + size + 'px ' + MONO; return measureCtx.measureText(text).width; }
function fitMono(text, maxW, size) {
  if (monoWidth(text, size) <= maxW) return text;
  var chars = Array.from(text);
  while (chars.length > 1 && monoWidth(chars.join('') + '…', size) > maxW) chars.pop();
  return chars.join('') + '…';
}
function fitText(text, maxW, size, weight) {
  if (textWidth(text, size, weight) <= maxW) return text;
  var chars = Array.from(text);
  while (chars.length > 1 && textWidth(chars.join('') + '…', size, weight) > maxW) chars.pop();
  return chars.length > 1 ? chars.join('') + '…' : '';
}
function normPorts(v) {
  if (!v || typeof v !== 'object') return null;
  var list = function (x) { return (Array.isArray(x) ? x : (typeof x === 'string' ? x.split(',') : [])).map(function (q) { return str(q).slice(0, 48); }).filter(Boolean); };
  var ports = { in: list(v.in || v.inputs), out: list(v.out || v.outputs), inout: list(v.inout) };
  return ports.in.length + ports.out.length + ports.inout.length ? ports : null;
}

/* ---------- spec normalisation ---------- */
function detectLang(obj) {
  return /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(JSON.stringify(obj)) ? 'vi' : 'en';
}

function normalizeSpec(raw) {
  var src = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};
  var l = str(src.lang || detectLang(src)).toLowerCase();
  lang = l.indexOf('vi') === 0 ? 'vi' : 'en';
  var list = Array.isArray(src.diagrams) ? src.diagrams : [src];
  return {
    title: str(src.title),
    subtitle: str(src.subtitle),
    lang: lang,
    theme: ['light', 'dark'].indexOf(src.theme) >= 0 ? src.theme : 'auto',
    diagrams: list.map(function (d, i) { return normalizeDiagram(d && typeof d === 'object' ? d : {}, i); })
  };
}

function normalizeDiagram(d, index) {
  var type = str(d.type).toLowerCase();
  if (type === 'wave' || type === 'timing' || (!type && d.wave)) return normalizeWave(d, index);
  if (type === 'register' || type === 'registers' || (!type && d.registers)) return normalizeRegisters(d, index);
  if (type === 'memory' || type === 'memory-map' || type === 'memmap' || (!type && d.regions)) return normalizeMemory(d, index);
  if (type === 'chip' || (!type && d.columns)) return normalizeChip(d, index);
  if (type === 'pinout' || (!type && d.package)) return normalizePinout(d, index);
  var id = str(d.id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (index + 1));
  var where = '[' + (str(d.title) || id) + '] ';
  var manual = d.layout === 'manual' || d.layout === 'fixed';
  var nodes = [], nodeById = {};
  (Array.isArray(d.nodes) ? d.nodes : []).forEach(function (n, k) {
    if (!n || str(n.id) === '') { problem(where, 'nodeNoId', { k: k + 1 }); return; }
    var nid = str(n.id);
    if (nodeById[nid]) { problem(where, 'dupNode', { id: nid }); return; }
    var shape = normShape(n.shape);
    var iconName = str(n.icon) || (str(n.shape).toLowerCase().indexOf('icon:') === 0 ? str(n.shape).slice(5).trim().toLowerCase() : '');
    if (str(n.shape) && shape === 'card' && str(n.shape).toLowerCase() !== 'card') problem(where, 'badShape', { id: nid, s: str(n.shape) });
    var sym = !CORE_SHAPES[shape], sty = normNodeStyle(n.style);
    var node = {
      id: nid, title: str(n.title) || (sym ? '' : nid), icon: iconName, desc: str(n.desc),
      color: PALETTE[n.color] ? n.color : 'slate', colorSet: !!PALETTE[n.color], size: SIZES[n.size] ? n.size : 'md',
      group: str(n.group) || null, external: n.external === true, width: posInt(n.width), steps: [],
      shape: shape, ports: normPorts(n.ports), initial: n.initial === true, final: n.final === true,
      x: finiteNum(n.x), y: finiteNum(n.y), w: posNum(n.w), h: posNum(n.h), style: sty,
      labelPos: LABEL_POS.indexOf(n.labelPos) >= 0 ? n.labelPos : (sty.labelPos || null),
      src: safeImageSrc(n.src), drawio: n.drawio && typeof n.drawio === 'object' ? n.drawio : null,
      port: normPort(n.port), detail: str(n.detail) || null
    };
    node.opts = { radius: sty.rounded === true ? null : (typeof sty.rounded === 'number' ? sty.rounded : null), rounded: !!sty.rounded, size: sty.size, fixedSize: sty.fixedSize,
                  direction: sty.direction, flipH: sty.flipH, flipV: sty.flipV, icon: iconName };
    nodes.push(node);
    nodeById[nid] = node;
  });

  var groups = [], groupById = {};
  (Array.isArray(d.groups) ? d.groups : []).forEach(function (g, k) {
    if (!g || str(g.id) === '') { problem(where, 'groupNoId', { k: k + 1 }); return; }
    var gid = str(g.id);
    if (groupById[gid]) { problem(where, 'dupGroup', { id: gid }); return; }
    var grp = { id: gid, label: str(g.label), icon: str(g.icon), color: PALETTE[g.color] ? g.color : 'slate', parent: str(g.parent) || null,
                x: finiteNum(g.x), y: finiteNum(g.y), w: posNum(g.w), h: posNum(g.h), hidden: g.hidden === true, style: normNodeStyle(g.style),
                drawio: g.drawio && typeof g.drawio === 'object' ? g.drawio : null, source: str(g.source) || null, detail: str(g.detail) || null };
    if (!grp.label && !grp.hidden && !grp.drawio) grp.label = gid;
    groups.push(grp);
    groupById[gid] = grp;
  });
  groups.forEach(function (g) {
    if (g.parent && !groupById[g.parent]) { problem(where, 'badParent', { id: g.id, p: g.parent }); g.parent = null; }
  });
  groups.forEach(function (g) {
    var seen = {}, cur = g;
    while (cur && cur.parent) {
      if (seen[cur.id]) { problem(where, 'parentLoop', { id: g.id }); g.parent = null; break; }
      seen[cur.id] = true;
      cur = groupById[cur.parent];
    }
  });
  nodes.forEach(function (n) {
    if (n.group && !groupById[n.group]) { problem(where, 'badGroup', { id: n.id, g: n.group }); n.group = null; }
  });
  var used = {};
  nodes.forEach(function (n) {
    var gid = n.group;
    while (gid) { used[gid] = true; gid = groupById[gid].parent; }
  });
  groups.forEach(function (g) {
    if (g.w && g.h && isFinite(g.x) && isFinite(g.y) && g.x !== null && g.y !== null) { var gid = g.id; while (gid) { used[gid] = true; gid = groupById[gid].parent; } }
  });
  groups = groups.filter(function (g) { return used[g.id]; });
  groupById = {};
  groups.forEach(function (g) { groupById[g.id] = g; });

  var edges = [];
  (Array.isArray(d.edges) ? d.edges : []).forEach(function (e, k) {
    if (!e) return;
    var from = str(e.from), to = str(e.to);
    var fromPoint = normPt(e.fromPoint), toPoint = normPt(e.toPoint);
    var fromOk = nodeById[from] || (manual && groupById[from]) || (!from && fromPoint && manual);
    var toOk = nodeById[to] || (manual && groupById[to]) || (!to && toPoint && manual);
    if (!fromOk || !toOk) {
      problem(where, 'badEdge', { k: k + 1, a: from || '?', b: to || '?' });
      return;
    }
    var route = ROUTES.indexOf(e.route) >= 0 ? e.route : null;
    edges.push({ id: str(e.id) || null, rawIndex: k, from: from || null, to: to || null, label: str(e.label), kind: EDGE_STYLE[e.kind] ? e.kind : 'normal',
                 minlen: posInt(e.minlen), weight: posInt(e.weight), steps: [],
                 dir: ['back', 'both', 'none'].indexOf(e.dir) >= 0 ? e.dir : 'forward',
                 points: normPts(e.points), fromAnchor: normAnchor(e.fromAnchor), toAnchor: normAnchor(e.toAnchor), fromPoint: fromPoint, toPoint: toPoint,
                 route: route, elbow: e.elbow === 'vertical' ? 'vertical' : 'horizontal', style: normEdgeStyle(e.style),
                 labelAt: isFinite(+e.labelAt) && e.labelAt !== null && e.labelAt !== '' ? Math.max(-1, Math.min(1, +e.labelAt)) : 0,
                 labelOffset: normPt(e.labelOffset), labelDist: finiteNum(e.labelDist) || 0,
                 drawio: e.drawio && typeof e.drawio === 'object' ? e.drawio : null, source: str(e.source) || null });
  });

  var steps = [];
  (Array.isArray(d.steps) ? d.steps : []).forEach(function (s, k) {
    if (!s) return;
    var text = str(s.text);
    if (s.node !== undefined && s.node !== null) {
      var node = nodeById[str(s.node)];
      if (!node) { problem(where, 'stepNode', { k: k + 1, id: str(s.node) }); return; }
      steps.push({ type: 'node', node: node.id, title: str(s.title) || nodeName(node), text: text });
      node.steps.push(steps.length);
    } else if (Array.isArray(s.edge) && s.edge.length === 2) {
      var a = str(s.edge[0]), b = str(s.edge[1]);
      var ei = -1;
      edges.forEach(function (e, i) { if (ei < 0 && e.from === a && e.to === b) ei = i; });
      if (ei < 0) { problem(where, 'stepEdge', { k: k + 1, a: a, b: b }); return; }
      var ed = edges[ei];
      steps.push({ type: 'edge', edge: ei, title: str(s.title) || (endName(nodeById, groupById, a) + ' → ' + endName(nodeById, groupById, b)), text: text });
      ed.steps.push(steps.length);
    } else {
      problem(where, 'stepNeither', { k: k + 1 });
    }
  });

  var spacing = d.spacing && typeof d.spacing === 'object' ? d.spacing : {};
  var direction = ['TB', 'LR', 'BT', 'RL'].indexOf(d.direction) >= 0 ? d.direction : 'TB';
  var horizontal = direction === 'LR' || direction === 'RL';
  var legend = d.legend && typeof d.legend === 'object' ? d.legend : {};
  return {
    kind: 'graph',
    id: id, title: str(d.title), tag: str(d.tag), summary: str(d.summary),
    direction: direction, layout: manual ? 'manual' : 'auto', route: ROUTES.indexOf(d.route) >= 0 ? d.route : null,
    font: str(d.font).replace(/[^A-Za-z0-9 ,"'_-]/g, '').slice(0, 80) || null, source: str(d.source) || null,
    spacing: { rank: +spacing.rank || (horizontal ? 44 : 60), node: +spacing.node || (horizontal ? 30 : 36), edge: +spacing.edge || 18 },
    nodes: nodes, nodeById: nodeById, groups: groups, groupById: groupById, edges: edges, steps: steps,
    legend: { colors: legend.colors && typeof legend.colors === 'object' ? legend.colors : {}, edges: legend.edges && typeof legend.edges === 'object' ? legend.edges : {} },
    notes: normNotes(d.notes, nodeById, groupById, edges),
    boardOf: str(d.boardOf) || null,
    detailOf: d.detailOf && typeof d.detailOf === 'object' && str(d.detailOf.tab) ? { tab: str(d.detailOf.tab), block: str(d.detailOf.block) } : null,
    /* the draw.io page this tab came from (its layers, root cell and page settings), written back on export */
    drawio: d.drawio && typeof d.drawio === 'object' ? d.drawio : null
  };
}

/* ---------- ports, notes: the parts a detail board and a detail tab add (hier.js builds them) ---------- */
var PORT_DIRS = ['in', 'out', 'inout'];
function normPort(v) {
  if (!v || typeof v !== 'object' || !str(v.name)) return null;
  return { of: str(v.of) || null, name: str(v.name).slice(0, 48), dir: PORT_DIRS.indexOf(v.dir) >= 0 ? v.dir : 'inout', kind: EDGE_STYLE[v.kind] ? v.kind : null };
}
var NOTE_KINDS = ['note', 'constraint', 'reason', 'change', 'question', 'todo', 'legend'];
function normNotes(list, nodeById, groupById, edges) {
  var out = [], seen = {};
  (Array.isArray(list) ? list : []).forEach(function (q, k) {
    if (!q || typeof q !== 'object') return;
    var text = String(q.text === undefined || q.text === null ? '' : q.text).trim();
    if (!text) return;
    var id = str(q.id) || ('note-' + (k + 1));
    while (seen[id]) id += '_';
    seen[id] = true;
    var att = null;
    if (Array.isArray(q.attach) && q.attach.length === 2) {
      var a = str(q.attach[0]), b = str(q.attach[1]);
      edges.forEach(function (e, i) { if (!att && e.from === a && e.to === b) att = { type: 'edge', index: i }; });
    } else if (str(q.attach)) {
      var tid = str(q.attach);
      if (nodeById[tid]) att = { type: 'node', id: tid };
      else if (groupById[tid]) att = { type: 'group', id: tid };
    }
    out.push({ id: id, index: k, text: text.slice(0, 2000), kind: NOTE_KINDS.indexOf(q.kind) >= 0 ? q.kind : 'note', attach: att,
               x: finiteNum(q.x), y: finiteNum(q.y), dx: finiteNum(q.dx), dy: finiteNum(q.dy),
               w: clampNum(q.w, 80, 600) || 210, date: str(q.date).slice(0, 10), by: str(q.by).slice(0, 60) });
  });
  return out;
}

/* ---------- spec helpers for shapes, styles and manual layout ---------- */
var CORE_SHAPES = { card: true, state: true, decision: true };
var LABEL_POS = ['center', 'top', 'bottom', 'left', 'right', 'none'];
var ROUTES = ['curved', 'spline', 'straight', 'orthogonal', 'elbow', 'segment'];
var ARROWS = ['none', 'classic', 'block', 'open', 'oval', 'diamond', 'classicThin', 'blockThin', 'openThin', 'dash', 'cross'];
function normShape(v) {
  var s = str(v).toLowerCase();
  if (!s) return 'card';
  if (CORE_SHAPES[s]) return s;
  if (s.indexOf('icon:') === 0) return 'icon';
  return symbolName(s) || 'card';
}
function finiteNum(v) { if (v === null || v === undefined || v === '') return null; var n = +v; return isFinite(n) ? n : null; }
function posNum(v) { var n = finiteNum(v); return n !== null && n > 0 ? n : null; }
function clampNum(v, lo, hi) { var n = finiteNum(v); return n === null ? null : Math.max(lo, Math.min(hi, n)); }
function normPt(v) {
  if (Array.isArray(v) && v.length >= 2 && finiteNum(v[0]) !== null && finiteNum(v[1]) !== null) return { x: +v[0], y: +v[1] };
  if (v && typeof v === 'object' && finiteNum(v.x) !== null && finiteNum(v.y) !== null) return { x: +v.x, y: +v.y };
  return null;
}
function normPts(v) { return Array.isArray(v) ? v.map(normPt).filter(Boolean) : []; }
function normAnchor(v) {
  var p = normPt(v);
  if (!p) return null;
  return { x: Math.max(0, Math.min(1, p.x)), y: Math.max(0, Math.min(1, p.y)), dx: finiteNum(v.dx) || 0, dy: finiteNum(v.dy) || 0, perimeter: !(v && v.perimeter === false) };
}
function normColor(v) {
  var s = str(v).toLowerCase();
  if (!s) return null;
  if (s === 'none' || s === 'transparent') return 'none';
  if (PALETTE[s]) return PALETTE[s];
  var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(s);
  if (m) return m[1].length === 3 ? '#' + m[1].replace(/(.)/g, '$1$1') : s;
  return null;
}
function safeImageSrc(v) {
  var s = str(v);
  return /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,])/i.test(s) ? s : '';
}
function normDash(v) {
  if (v === true) return true;
  if (typeof v === 'string' && /^\s*[\d.]+([ ,]+[\d.]+)*\s*$/.test(v)) return v.trim().replace(/[ ,]+/g, ' ');
  return null;
}
function normNodeStyle(s) {
  var o = {};
  if (!s || typeof s !== 'object') return o;
  ['fill', 'stroke', 'text', 'labelBg', 'labelBorder'].forEach(function (k) { var c = normColor(k === 'text' ? (s.text || s.color) : s[k]); if (c) o[k] = c; });
  var n;
  if ((n = clampNum(s.strokeWidth, 0, 20)) !== null) o.strokeWidth = n;
  if ((n = clampNum(s.fontSize, 4, 160)) !== null) o.fontSize = n;
  if ((n = clampNum(s.rotation, -360, 360)) !== null && n) o.rotation = n;
  if ((n = clampNum(s.size, 0, 10000)) !== null) o.size = n;
  if ((n = clampNum(s.header, 0, 400)) !== null) o.header = n;
  if (Array.isArray(s.imageBox) && s.imageBox.length === 2 && posNum(s.imageBox[0]) && posNum(s.imageBox[1])) o.imageBox = [posNum(s.imageBox[0]), posNum(s.imageBox[1])];
  ['opacity', 'fillOpacity', 'strokeOpacity'].forEach(function (k) { var v = clampNum(s[k], 0, 100); if (v !== null && v < 100) o[k] = v; });
  ['spacing', 'spacingTop', 'spacingLeft', 'spacingRight', 'spacingBottom'].forEach(function (k) { var v = clampNum(s[k], -200, 200); if (v !== null) o[k] = v; });
  var dash = normDash(s.dashed);
  if (dash) o.dashed = dash;
  ['bold', 'italic', 'underline', 'flipH', 'flipV', 'shadow', 'fixedSize'].forEach(function (k) { if (s[k] === true) o[k] = true; });
  if (s.wrap === false) o.wrap = false;
  if (s.horizontal === false) o.horizontal = false;
  if (['left', 'center', 'right'].indexOf(s.align) >= 0) o.align = s.align;
  if (['top', 'middle', 'bottom'].indexOf(s.valign) >= 0) o.valign = s.valign;
  if (s.rounded === true || s.rounded === false) o.rounded = s.rounded;
  else if ((n = clampNum(s.rounded, 0, 500)) !== null) o.rounded = n;
  if (['east', 'west', 'north', 'south'].indexOf(s.direction) >= 0 && s.direction !== 'east') o.direction = s.direction;
  if (LABEL_POS.indexOf(s.labelPos) >= 0) o.labelPos = s.labelPos;
  var font = str(s.font).replace(/[^A-Za-z0-9 ,"'_-]/g, '').slice(0, 80);
  if (font) o.font = font;
  return o;
}
function normEdgeStyle(s) {
  var o = {};
  if (!s || typeof s !== 'object') return o;
  var c = normColor(s.color || s.stroke);
  if (c) o.color = c;
  var t = normColor(s.text);
  if (t) o.text = t;
  var bg = normColor(s.labelBg);
  if (bg) o.labelBg = bg;
  var n;
  if ((n = clampNum(s.width, 0, 30)) !== null) o.width = n;
  if ((n = clampNum(s.fontSize, 4, 120)) !== null) o.fontSize = n;
  ['endSize', 'startSize'].forEach(function (k) { var v = clampNum(s[k], 0, 60); if (v !== null) o[k] = v; });
  var dash = normDash(s.dashed);
  if (dash) o.dashed = dash;
  ['endArrow', 'startArrow'].forEach(function (k) { if (ARROWS.indexOf(s[k]) >= 0) o[k] = s[k]; });
  ['endFill', 'startFill'].forEach(function (k) { if (s[k] === false) o[k] = false; });
  if (s.rounded === true) o.rounded = true;
  var op = clampNum(s.opacity, 0, 100);
  if (op !== null && op < 100) o.opacity = op;
  if (s.bold === true) o.bold = true;
  return o;
}
function nodeName(n) {
  if (n.title) return stripMarks(n.title);
  if (n.shape === 'icon' && n.icon) return n.icon;
  var def = shapeDef(n.shape);
  return def ? (def.title || n.shape) : n.id;
}
function endName(nodeById, groupById, id) {
  if (nodeById[id]) return nodeName(nodeById[id]);
  if (groupById[id]) return groupById[id].label || id;
  return id || '·';
}

/* ---------- measuring & layout ---------- */
function measureNode(n, d) {
  if (!CORE_SHAPES[n.shape]) return measureSymbol(n, d || {});
  var s = SIZES[n.size];
  if (n.shape === 'state') {
    var stTitle = wrapText((n.icon && !iconKnown(n.icon) ? n.icon + ' ' : '') + n.title, s.w * 0.8, s.title, 700, 2);
    var stDesc = n.desc ? wrapText(n.desc, s.w * 0.9, s.desc - 0.5, 400, 2) : null;
    var stW = Math.max(stTitle.width, stDesc ? stDesc.width : 0);
    var stH = stTitle.lines.length * s.title * LH + (stDesc ? stDesc.lines.length * (s.desc - 0.5) * LH + 2 : 0);
    var sw = Math.ceil(Math.max(stW + 44, 112)), sh = Math.ceil(Math.max(stH + 22, 46));
    return { s: s, w: sw, h: sh, state: true, title: stTitle, desc: stDesc, headH: sh, iconW: 0 };
  }
  if (n.shape === 'decision') {
    var label = (n.icon && !iconKnown(n.icon) ? n.icon + ' ' : '') + n.title;
    var wrapD = wrapText(label, s.w * 0.62, s.title, 700, 3);
    var tw = Math.max(wrapD.width, 44), th = wrapD.lines.length * s.title * LH;
    var dw = Math.ceil(Math.max(2 * tw + 28, 132)), dh = Math.ceil(Math.max(2 * th + 22, 66));
    return { s: s, w: dw, h: dh, decision: true, title: wrapD, desc: null, headH: dh, iconW: 0 };
  }
  var iconW = n.icon ? (iconKnown(n.icon) ? s.icon + 7 : textWidth(n.icon, s.icon, 400) + 7) : 0;
  var w = s.w;
  var oneLine = textWidth(n.title, s.title, 700) + iconW + s.padX * 2 + 2;
  if (oneLine > w) w = Math.min(Math.ceil(oneLine), Math.round(s.w * 1.4));
  if (n.ports) w = Math.max(w, PORT_MIN_W[n.size]);
  if (n.width) w = n.width;
  if (n.w) w = n.w;
  var title = wrapText(n.title, w - s.padX * 2 - iconW - 2, s.title, 700, 3);
  var headH = s.headPad * 2 + title.lines.length * s.title * LH;
  var desc = null, bodyH = 0, ports = null;
  if (n.desc) {
    desc = wrapText(n.desc, w - s.padX * 2 - 2, s.desc, 400, 9);
    bodyH = s.bodyPad * 2 + desc.lines.length * s.desc * LH;
  }
  if (n.ports) {
    var colW = (w - s.padX * 2 - 12) / 2;
    var cap = function (list) { return list.length > PORT_MAX ? list.slice(0, PORT_MAX - 1).concat(['+' + (list.length - PORT_MAX + 1)]) : list; };
    var left = cap(n.ports.in.map(function (q) { return '→ ' + q; }).concat(n.ports.inout.map(function (q) { return '↔ ' + q; })));
    var right = cap(n.ports.out.map(function (q) { return q + ' →'; }));
    left = left.map(function (q) { return fitMono(q, colW, PORT_SIZE); });
    right = right.map(function (q) { return fitMono(q, colW, PORT_SIZE); });
    var above = bodyH ? bodyH - s.bodyPad + 4 : s.bodyPad;
    ports = { left: left, right: right, top: headH + above, rows: Math.max(left.length, right.length) };
    bodyH = above + ports.rows * PORT_LH + s.bodyPad;
  }
  return { s: s, w: w, h: Math.max(Math.ceil(headH + bodyH), n.h || 0), headH: headH, iconW: iconW, title: title, desc: desc, ports: ports };
}

/* Symbols keep their own box; the label sits inside it or next to it (draw.io's labelPosition rules). */
function measureSymbol(n, d) {
  var def = shapeDef(n.shape) || SYMBOLS.box, st = n.style, manual = d.layout === 'manual', dio = !!n.drawio;
  var family = st.font || d.font || null;
  var fs = st.fontSize || (dio ? 12 : (def.boxy ? 13 : 12));
  var weight = st.bold ? 700 : (dio ? 400 : (def.boxy ? 650 : 550));
  var w = n.w || (!manual && n.width) || def.size[0], h = n.h || def.size[1];
  if (def.aspect === 'fixed' && !dio) {
    /* a glyph never stretches: a box with other proportions shrinks it to fit, centred */
    var ratio = def.size[0] / def.size[1];
    if (n.w && !n.h) h = w / ratio;
    else if (n.h && !n.w) w = h * ratio;
    else if (Math.abs(w / h - ratio) > 0.02) { var fw = Math.min(w, h * ratio), fh = fw / ratio; w = fw; h = fh; }
  }
  var pos = n.labelPos || def.label;
  if (!manual && !n.labelPos && pos === 'bottom' && (d.direction === 'TB' || d.direction === 'BT')) pos = 'right';
  if (n.shape === 'text' && !manual && !n.w) {
    var tw = wrapText(n.title || ' ', 260, fs, weight, 0, family);
    w = Math.ceil(tw.width + 10);
    h = n.h || Math.ceil(tw.lines.length * fs * LH + 8);
  }
  if (n.shape === 'image' && !n.w && !n.h) { w = def.size[0]; h = def.size[1]; }
  var m = { s: SIZES[n.size], w: w, h: h, sym: def, fs: fs, weight: weight, family: family, pos: pos };
  m.label = symbolLabel(n, m, dio);
  if (!dio && !n.h && m.label && pos === 'center' && def.aspect !== 'fixed') {
    /* a box-like symbol grows taller when its title and description need the room */
    var band = def.labelBox ? def.labelBox(w, h, n.opts) : { h: h };
    var need = m.label.th + 10 - band.h;
    if (need > 0) { m.h = h = Math.ceil(h + need * h / band.h); m.label = symbolLabel(n, m, dio); }
  }
  var pad = { t: 0, r: 0, b: 0, l: 0 };
  if (m.label) {
    pad.l = Math.max(0, -m.label.x1); pad.t = Math.max(0, -m.label.y1);
    pad.r = Math.max(0, m.label.x2 - w); pad.b = Math.max(0, m.label.y2 - h);
  }
  m.pad = pad;
  return m;
}

function symbolLabel(n, m, dio) {
  var st = n.style, w = m.w, h = m.h, pos = m.pos, text = n.title;
  if (pos === 'none' || !text) return null;
  var lh = m.fs * (dio ? 1.2 : LH);
  var outside = pos !== 'center';
  var box;
  if (pos === 'center') box = m.sym.labelBox ? m.sym.labelBox(w, h, n.opts) : { x: 0, y: 0, w: w, h: h };
  else if (dio) box = { x: pos === 'left' ? -w : pos === 'right' ? w : 0, y: pos === 'top' ? -h : pos === 'bottom' ? h : 0, w: w, h: h };
  else box = null;
  var align = st.align || (pos === 'left' ? 'right' : pos === 'right' ? 'left' : 'center');
  var valign = st.valign || (pos === 'bottom' ? 'top' : pos === 'top' ? 'bottom' : 'middle');
  var sp = st.spacing !== undefined ? st.spacing : 2;
  var pl = sp + (st.spacingLeft || 0), pr = sp + (st.spacingRight || 0), pt = sp + (st.spacingTop || 0), pb = sp + (st.spacingBottom || 0);
  var wrap = st.wrap !== false;
  var wrapW = box ? box.w - pl - pr : 150;
  if (!dio && outside) wrapW = Math.max(w, 150);
  if (!dio && pos === 'center') wrapW = Math.max(24, wrapW - 6);
  if (wrap) {
    /* never break inside a word: a long word may stick out of a narrow shape, as in draw.io */
    stripMarks(text).split(/\s+/).forEach(function (word) { wrapW = Math.max(wrapW, textWidth(word, m.fs, m.weight, m.family) + 1); });
  }
  var lines = wrap ? wrapText(text, Math.max(8, wrapW), m.fs, m.weight, dio ? 0 : 4, m.family).lines : String(text).split('\n');
  var desc = null, dfs = Math.max(9, m.fs - 1.5), dlh = dfs * LH;
  if (!dio && pos === 'center' && m.sym.boxy && n.desc) desc = wrapText(n.desc, Math.max(8, wrapW), dfs, 400, 4, m.family).lines;
  var th = lines.length * lh + (desc ? 2 + desc.length * dlh : 0), tw = 0;
  lines.forEach(function (l) { tw = Math.max(tw, textWidth(stripMarks(l), m.fs, m.weight, m.family)); });
  if (desc) desc.forEach(function (l) { tw = Math.max(tw, textWidth(l, dfs, 400, m.family)); });
  if (!box) {
    var gap = 4;
    if (pos === 'bottom') box = { x: (w - Math.max(w, tw + pl + pr)) / 2, y: h + gap - pt, w: Math.max(w, tw + pl + pr), h: th + pt + pb };
    else if (pos === 'top') box = { x: (w - Math.max(w, tw + pl + pr)) / 2, y: -gap - th - pb, w: Math.max(w, tw + pl + pr), h: th + pt + pb };
    else if (pos === 'left') box = { x: -gap - tw - pl - pr, y: 0, w: tw + pl + pr, h: h };
    else box = { x: w + gap, y: 0, w: tw + pl + pr, h: h };
  }
  var ax = align === 'left' ? box.x + pl : align === 'right' ? box.x + box.w - pr : box.x + box.w / 2;
  var top = valign === 'top' ? box.y + pt : valign === 'bottom' ? box.y + box.h - pb - th : box.y + (box.h - th) / 2;
  var x1 = align === 'left' ? ax : align === 'right' ? ax - tw : ax - tw / 2;
  return { lines: lines, desc: desc, fs: m.fs, dfs: dfs, lh: lh, dlh: dlh, weight: m.weight, family: m.family,
           anchor: align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle', x: ax, y: top, tw: tw, th: th,
           x1: x1, y1: top, x2: x1 + tw, y2: top + th, outside: outside };
}

function measureLabel(e) {
  var size = 11.5, padX = 8, padY = 4;
  var stepText = e.steps.join(',');
  var badge = stepText ? Math.max(20, textWidth(stepText, 10.5, 800) + 12) : 0;
  if (!e.label) return { w: badge, h: badge ? 20 : 0, lines: [], size: size, padX: padX, badge: badge, stepText: stepText };
  var wrap = wrapText(e.label, 170, size, 600, 3);
  var w = wrap.width + padX * 2 + (badge ? badge + 4 : 0);
  var h = Math.max(wrap.lines.length * size * LH + padY * 2, 20);
  return { w: Math.ceil(w), h: Math.ceil(h), lines: wrap.lines, size: size, padX: padX, badge: badge, stepText: stepText };
}

function groupDepth(d, g) { var n = 0; while (g && g.parent) { n++; g = d.groupById[g.parent]; } return n; }

function layoutDiagram(d) {
  if (d.layout === 'manual') return layoutManual(d);
  var nodeM = {}, labelM = [];
  d.nodes.forEach(function (n) { nodeM[n.id] = measureNode(n, d); });
  d.edges.forEach(function (e) { labelM.push(measureLabel(e)); });
  var res;
  if (d.groups.length) {
    try { res = runDagre(d, nodeM, labelM, true); }
    catch (err) {
      if (window.console) console.warn('[architecture-diagrams] grouped layout failed, using simple layout', err);
      res = null;
    }
    if (res && !res.groupsOk) res = null;
  }
  if (!res) res = runDagre(d, nodeM, labelM, false);
  res.nodeM = nodeM;
  res.labelM = labelM;
  res.notes = layoutNotes(d, res);
  finalizeBounds(d, res);
  return res;
}

/* ---------- sticky notes: an attached note sits right of what it is attached to and moves with it ---------- */
var NOTE_FS = 11.5, NOTE_PAD = 8, NOTE_HEAD = 17, NOTE_FOLD = 11;
function notesShown() { return storageGet('ad-notes') !== 'off'; }
function noteTarget(d, res, att) {
  if (!att) return null;
  if (att.type === 'node') { var p = res.nodes[att.id]; return p ? { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h } : null; }
  if (att.type === 'group') { var b = res.groups[att.id]; return b ? { x: b.x, y: b.y, w: b.w, h: b.h } : null; }
  var e = res.edges[att.index];
  if (!e || !e.points || !e.points.length) return null;
  var m = isFinite(e.lx) ? { x: e.lx, y: e.ly } : e.points[Math.floor(e.points.length / 2)];
  return { x: m.x, y: m.y, w: 0, h: 0 };
}
/* Does the segment a-b pass through box r (Liang-Barsky clipping)? */
function segHitsBox(a, b, r) {
  var t0 = 0, t1 = 1, dx = b.x - a.x, dy = b.y - a.y;
  var p = [-dx, dx, -dy, dy], q = [a.x - r.x, r.x + r.w - a.x, a.y - r.y, r.y + r.h - a.y];
  for (var i = 0; i < 4; i++) {
    if (!p[i]) { if (q[i] < 0) return false; continue; }
    var t = q[i] / p[i];
    if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
    else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return true;
}
function layoutNotes(d, res, always) {
  if (!d.notes || !d.notes.length || (!always && !notesShown())) return [];
  var x2 = -Infinity, y1 = Infinity;
  Object.keys(res.nodes).forEach(function (id) { var p = res.nodes[id]; x2 = Math.max(x2, p.x + p.w / 2); y1 = Math.min(y1, p.y - p.h / 2); });
  Object.keys(res.groups || {}).forEach(function (id) { var b = res.groups[id]; x2 = Math.max(x2, b.x + b.w); y1 = Math.min(y1, b.y); });
  (res.edges || []).forEach(function (r) { (r.points || []).forEach(function (pt) { x2 = Math.max(x2, pt.x); }); });
  if (x2 === -Infinity) { x2 = 0; y1 = 0; }
  var colY = y1, placed = [];
  /* things a note placed by default should not cover: blocks, frames of a detail board, group titles, wires and their
     labels, other notes; a note sits wholly inside a group frame (one that holds what it is about) or wholly outside */
  var solid = [], frames = [], segs = [];
  Object.keys(res.nodes).forEach(function (id) { var p = res.nodes[id]; solid.push({ id: id, x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h }); });
  d.groups.forEach(function (g) {
    var b = (res.groups || {})[g.id];
    if (!b || g.hidden) return;
    if (g.source) { solid.push({ id: g.id, x: b.x, y: b.y, w: b.w, h: b.h }); return; }
    frames.push({ id: g.id, x: b.x, y: b.y, w: b.w, h: b.h });
    if (!g.drawio) solid.push({ id: g.id + ':chip', x: b.x, y: b.y - 12, w: chipWidth(g) + 14, h: 24 });
  });
  (res.edges || []).forEach(function (r, i) {
    var lm = res.labelM && res.labelM[i], pts = r.points || [];
    if (lm && lm.w && isFinite(r.lx)) solid.push({ id: 'label:' + i, x: r.lx - lm.w / 2, y: r.ly - lm.h / 2, w: lm.w, h: lm.h });
    for (var k = 1; k < pts.length; k++) segs.push([pts[k - 1], pts[k]]);
  });
  var holds = function (gid, att) {
    var g = att.type === 'group' ? d.groupById[att.id] : att.type === 'node' && d.nodeById[att.id] ? d.groupById[d.nodeById[att.id].group] : null;
    for (var k = 0; g && k < 40; k++) { if (g.id === gid) return true; g = g.parent ? d.groupById[g.parent] : null; }
    return false;
  };
  var hits = function (b, skip, att) {
    if (solid.concat(placed).some(function (q) { return q.id !== skip && b.x < q.x + q.w + 6 && b.x + b.w + 6 > q.x && b.y < q.y + q.h + 6 && b.y + b.h + 6 > q.y; })) return true;
    var grown = { x: b.x - 4, y: b.y - 4, w: b.w + 8, h: b.h + 8 };
    if (segs.some(function (sg) { return segHitsBox(sg[0], sg[1], grown); })) return true;
    return frames.some(function (f) {
      if (!(b.x < f.x + f.w + 4 && b.x + b.w + 4 > f.x && b.y < f.y + f.h + 4 && b.y + b.h + 4 > f.y)) return false;
      var inside = b.x >= f.x + 8 && b.y >= f.y + 8 && b.x + b.w <= f.x + f.w - 8 && b.y + b.h <= f.y + f.h - 8;
      return !(inside && holds(f.id, att));
    });
  };
  return d.notes.map(function (q) {
    var lines = wrapText(q.text, q.w - NOTE_PAD * 2, NOTE_FS, 400, 14).lines;
    var h = NOTE_PAD * 2 + NOTE_HEAD + lines.length * NOTE_FS * LH;
    var el = noteTarget(d, res, q.attach), x, y;
    if (el) {
      x = el.x + el.w + (q.dx !== null ? q.dx : 18); y = el.y + (q.dy !== null ? q.dy : -4);
      if (q.dx === null && q.dy === null) {
        /* no place chosen yet: the nearest free spot around it, rings further out each time, right of it first;
           a note on a wire starts from the wire's label */
        var skip = q.attach.type === 'edge' ? null : q.attach.id, sb = el, lm = q.attach.type === 'edge' && res.labelM ? res.labelM[q.attach.index] : null;
        if (lm && lm.w) { sb = { x: el.x - lm.w / 2, y: el.y - lm.h / 2, w: lm.w, h: lm.h }; el.lbox = sb; skip = 'label:' + q.attach.index; }
        var found = false;
        [18, 40, 70, 110, 160, 230, 320].some(function (g) {
          return [0, 1, -1, 2, -2, 3].some(function (k) {
            var sy = k * Math.max(30, h / 2), sx = k * Math.max(40, q.w / 2);
            var tries = [[sb.x + sb.w + g, sb.y - 4 + sy], [sb.x - q.w - g, sb.y - 4 + sy]];
            if (Math.abs(k) <= 2) tries.push([sb.x + sx, sb.y + sb.h + g - 4], [sb.x + sx, sb.y - h - g]);
            return tries.some(function (t0) {
              if (hits({ x: t0[0], y: t0[1], w: q.w, h: h }, skip, q.attach)) return false;
              x = t0[0]; y = t0[1]; found = true;
              return true;
            });
          });
        });
        /* nowhere free near it: in the column right of the drawing, with its leader line */
        if (!found) { x = x2 + 44; y = colY; colY += h + 14; }
      }
    }
    else if (q.x !== null && q.y !== null) { x = q.x; y = q.y; }
    else { x = x2 + 44; y = colY; colY += h + 14; }
    var box = { id: 'note:' + q.id, q: q, x: x, y: y, w: q.w, h: h, lines: lines, target: el };
    placed.push({ id: box.id, x: x, y: y, w: q.w, h: h });
    box.id = q.id;
    return box;
  });
}

function runDagre(d, nodeM, labelM, compound) {
  var g = new dagre.graphlib.Graph({ compound: compound, multigraph: true });
  g.setGraph({ rankdir: d.direction, ranksep: d.spacing.rank, nodesep: d.spacing.node, edgesep: d.spacing.edge, marginx: 24, marginy: 24 });
  g.setDefaultEdgeLabel(function () { return {}; });
  if (compound) {
    d.groups.forEach(function (gr) { g.setNode('g:' + gr.id, {}); });
    d.groups.forEach(function (gr) { if (gr.parent) g.setParent('g:' + gr.id, 'g:' + gr.parent); });
  }
  d.nodes.forEach(function (n) {
    var m = nodeM[n.id], pad = m.pad || { t: 0, r: 0, b: 0, l: 0 };
    g.setNode('n:' + n.id, { width: m.w + pad.l + pad.r, height: m.h + pad.t + pad.b });
    if (compound && n.group) g.setParent('n:' + n.id, 'g:' + n.group);
  });
  d.edges.forEach(function (e, i) {
    var lm = labelM[i];
    g.setEdge('n:' + e.from, 'n:' + e.to, {
      width: lm.w, height: lm.h, labelpos: 'c',
      minlen: e.minlen || 1, weight: e.weight || (e.kind === 'main' ? 3 : 1)
    }, 'e' + i);
  });
  dagre.layout(g);

  var nodes = {};
  d.nodes.forEach(function (n) {
    var p = g.node('n:' + n.id), m = nodeM[n.id], pad = m.pad || { t: 0, r: 0, b: 0, l: 0 };
    nodes[n.id] = { x: p.x + (pad.l - pad.r) / 2, y: p.y + (pad.t - pad.b) / 2, w: m.w, h: m.h };
  });
  var edges = d.edges.map(function (e, i) {
    var p = g.edge({ v: 'n:' + e.from, w: 'n:' + e.to, name: 'e' + i }) || {};
    return { points: (p.points || []).filter(function (pt) { return isFinite(pt.x) && isFinite(pt.y); }), lx: p.x, ly: p.y };
  });
  d.edges.forEach(function (e, i) {
    var pts = edges[i].points;
    if (pts.length < 2) return;
    [[e.from, 0, 1], [e.to, pts.length - 1, pts.length - 2]].forEach(function (end) {
      var n = d.nodeById[end[0]];
      if (n.shape === 'card' || n.shape === 'state') return;
      var c = nodes[n.id], ref = pts[end[2]];
      if (n.shape === 'decision') {
        var a = c.w / 2, b = c.h / 2, dx = ref.x - c.x, dy = ref.y - c.y;
        if (!dx && !dy) return;
        var k = 1 / (Math.abs(dx) / a + Math.abs(dy) / b);
        pts[end[1]] = { x: c.x + dx * k, y: c.y + dy * k };
        return;
      }
      /* symbols: dagre ends on the box that includes the label, so move the end onto the symbol itself */
      var f = { x: c.x - c.w / 2, y: c.y - c.h / 2, w: c.w, h: c.h, cx: c.x, cy: c.y, rot: 0, shape: n.shape, opts: n.opts };
      pts[end[1]] = perimeterPt(f, ref, false);
    });
  });
  var groups = {}, ok = true;
  if (compound) {
    d.groups.forEach(function (gr) {
      var p = g.node('g:' + gr.id);
      if (!p || !isFinite(p.x) || !(p.width > 0)) { ok = false; return; }
      groups[gr.id] = { x: p.x - p.width / 2, y: p.y - p.height / 2, w: p.width, h: p.height };
    });
    ok = ok && groupsLookSane(d, nodes, groups);
  } else {
    groups = boxGroups(d, nodes);
  }
  return { nodes: nodes, edges: edges, groups: groups, groupsOk: ok };
}

/* dagre's cluster support occasionally misplaces a cluster; fall back if any member sits outside its box. */
function groupsLookSane(d, nodes, groups) {
  return d.nodes.every(function (n) {
    if (!n.group) return true;
    var b = groups[n.group], p = nodes[n.id];
    return b && p.x - p.w / 2 >= b.x - 1 && p.x + p.w / 2 <= b.x + b.w + 1 && p.y - p.h / 2 >= b.y - 1 && p.y + p.h / 2 <= b.y + b.h + 1;
  });
}

function boxGroups(d, nodes) {
  var boxes = {};
  var ordered = d.groups.slice().sort(function (a, b) { return groupDepth(d, b) - groupDepth(d, a); });
  ordered.forEach(function (gr) {
    var pad = 22, x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    d.nodes.forEach(function (n) {
      if (n.group !== gr.id) return;
      var p = nodes[n.id];
      x1 = Math.min(x1, p.x - p.w / 2); y1 = Math.min(y1, p.y - p.h / 2);
      x2 = Math.max(x2, p.x + p.w / 2); y2 = Math.max(y2, p.y + p.h / 2);
    });
    d.groups.forEach(function (child) {
      if (child.parent !== gr.id || !boxes[child.id]) return;
      var b = boxes[child.id];
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y - 8);
      x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
    });
    if (x1 === Infinity) return;
    boxes[gr.id] = { x: x1 - pad, y: y1 - pad - 6, w: x2 - x1 + pad * 2, h: y2 - y1 + pad * 2 + 6 };
  });
  return boxes;
}

function chipLabel(gr) { return (gr.icon && !iconKnown(gr.icon) ? gr.icon + ' ' : '') + gr.label.toUpperCase(); }
function chipWidth(gr) { var txt = chipLabel(gr); return textWidth(txt, 11, 700) + Array.from(txt).length * 0.44 + 18 + (iconKnown(gr.icon) ? 16 : 0); }

function finalizeBounds(d, res) {
  var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  function add(a, b, c, e) { x1 = Math.min(x1, a); y1 = Math.min(y1, b); x2 = Math.max(x2, c); y2 = Math.max(y2, e); }
  d.nodes.forEach(function (n) {
    var p = res.nodes[n.id], m = res.nodeM[n.id];
    if (!CORE_SHAPES[n.shape]) {
      var rot = n.style.rotation || 0, bx = p.x - p.w / 2, by = p.y - p.h / 2, c = { x: p.x, y: p.y };
      var boxes = [[0, 0, p.w, p.h]];
      if (m.label) boxes.push([m.label.x1, m.label.y1, m.label.x2, m.label.y2]);
      if (n.steps.length) boxes.push([-13, -13, 13, 13]);
      boxes.forEach(function (b) {
        [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]].forEach(function (q) {
          var pt = rot ? rotPt({ x: bx + q[0], y: by + q[1] }, rot, c) : { x: bx + q[0], y: by + q[1] };
          add(pt.x, pt.y, pt.x, pt.y);
        });
      });
      return;
    }
    var over = n.steps.length ? 13 : 0, side = n.ports ? 9 : 0;
    add(p.x - p.w / 2 - Math.max(over, side, n.initial ? 32 : 0), p.y - p.h / 2 - over, p.x + p.w / 2 + side, p.y + p.h / 2);
  });
  d.groups.forEach(function (gr) {
    var b = res.groups[gr.id];
    if (!b || gr.hidden) return;
    if (gr.drawio || res.manual) add(b.x, b.y, b.x + b.w, b.y + b.h);
    else add(b.x, b.y - 12, Math.max(b.x + b.w, b.x + 14 + chipWidth(gr)), b.y + b.h);
  });
  res.edges.forEach(function (e, i) {
    e.points.forEach(function (pt) { add(pt.x, pt.y, pt.x, pt.y); });
    var lm = res.labelM[i];
    if (lm.w && isFinite(e.lx)) add(e.lx - lm.w / 2, e.ly - lm.h / 2, e.lx + lm.w / 2, e.ly + lm.h / 2);
  });
  (res.notes || []).forEach(function (b) { add(b.x, b.y, b.x + b.w, b.y + b.h); });
  var M = 20;
  res.ox = M - x1;
  res.oy = M - y1;
  res.width = Math.ceil(x2 - x1 + M * 2);
  res.height = Math.ceil(y2 - y1 + M * 2);
}

/* ---------- manual layout: fixed positions and draw.io-compatible edge routing ----------
   Node x/y are the top-left corner of the node box (as in draw.io). Edge routing follows the rules
   draw.io uses for its "straight", "elbow" and "segment" styles, so imported files keep their look. */
function layoutManual(d) {
  var nodeM = {}, labelM = [], nodes = {}, missing = [];
  d.nodes.forEach(function (n) { nodeM[n.id] = measureNode(n, d); });
  d.edges.forEach(function (e) { labelM.push(measureLabel(e)); });
  d.nodes.forEach(function (n) {
    var m = nodeM[n.id];
    if (n.x !== null && n.y !== null) nodes[n.id] = { x: n.x + m.w / 2, y: n.y + m.h / 2, w: m.w, h: m.h };
    else missing.push(n);
  });
  if (missing.length) placeMissing(d, nodeM, nodes, missing);
  var groups = manualGroups(d, nodes, nodeM);
  var res = { nodes: nodes, groups: groups, nodeM: nodeM, labelM: labelM, manual: true };
  res.edges = d.edges.map(function (e, i) { return routeEdge(d, res, e, labelM[i]); });
  res.notes = layoutNotes(d, res);
  finalizeBounds(d, res);
  return res;
}

/* Nodes without coordinates: all of them use the automatic layout once; a few new ones go under the drawing. */
function placeMissing(d, nodeM, nodes, missing) {
  if (missing.length === d.nodes.length && window.dagre) {
    var auto = runDagre(d, nodeM, d.edges.map(measureLabel), false);
    missing.forEach(function (n) { nodes[n.id] = auto.nodes[n.id]; });
    return;
  }
  var x1 = Infinity, y2 = -Infinity;
  Object.keys(nodes).forEach(function (id) { var p = nodes[id]; x1 = Math.min(x1, p.x - p.w / 2); y2 = Math.max(y2, p.y + p.h / 2); });
  if (x1 === Infinity) { x1 = 20; y2 = 0; }
  var x = x1, y = y2 + 60, rowH = 0;
  missing.forEach(function (n) {
    var m = nodeM[n.id];
    if (x > x1 + 900) { x = x1; y += rowH + 40; rowH = 0; }
    nodes[n.id] = { x: x + m.w / 2, y: y + m.h / 2, w: m.w, h: m.h };
    x += m.w + 40;
    rowH = Math.max(rowH, m.h);
  });
}

function manualGroups(d, nodes, nodeM) {
  var boxes = {};
  var ordered = d.groups.slice().sort(function (a, b) { return groupDepth(d, b) - groupDepth(d, a); });
  ordered.forEach(function (gr) {
    if (gr.x !== null && gr.y !== null && gr.w && gr.h) { boxes[gr.id] = { x: gr.x, y: gr.y, w: gr.w, h: gr.h }; return; }
    var pad = gr.hidden ? 0 : 20, top = gr.hidden ? 0 : 30, x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    d.nodes.forEach(function (n) {
      if (n.group !== gr.id || !nodes[n.id]) return;
      var p = nodes[n.id];
      x1 = Math.min(x1, p.x - p.w / 2); y1 = Math.min(y1, p.y - p.h / 2);
      x2 = Math.max(x2, p.x + p.w / 2); y2 = Math.max(y2, p.y + p.h / 2);
    });
    d.groups.forEach(function (child) {
      if (child.parent !== gr.id || !boxes[child.id]) return;
      var b = boxes[child.id];
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h);
    });
    if (x1 === Infinity) return;
    boxes[gr.id] = { x: x1 - pad, y: y1 - top, w: x2 - x1 + pad * 2, h: y2 - y1 + top + pad };
  });
  return boxes;
}

function rotPt(p, deg, c) {
  var a = deg * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a), dx = p.x - c.x, dy = p.y - c.y;
  return { x: c.x + dx * cos - dy * sin, y: c.y + dx * sin + dy * cos };
}
function frameOf(d, L, id) {
  if (!id) return null;
  var p = L.nodes[id];
  if (p) {
    var n = d.nodeById[id];
    return { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h, cx: p.x, cy: p.y, rot: n.style.rotation || 0,
             dir: n.style.direction || null, flipH: !!n.style.flipH, flipV: !!n.style.flipV, shape: n.shape, opts: n.opts };
  }
  var b = L.groups[id];
  if (b) return { x: b.x, y: b.y, w: b.w, h: b.h, cx: b.x + b.w / 2, cy: b.y + b.h / 2, rot: 0, shape: 'box', opts: {} };
  return null;
}
function frameOutline(f) {
  if (f.shape === 'decision') return [[f.w / 2, 0], [f.w, f.h / 2], [f.w / 2, f.h], [0, f.h / 2]];
  return symbolOutline(f.shape, f.w, f.h, f.opts);
}
function perimeterKind(f) {
  var def = SYMBOLS[f.shape];
  if (f.shape === 'decision') return 'poly';
  return def && def.perimeter ? def.perimeter : 'rect';
}
function rectPerim(f, next, orth) {
  var cx = f.cx, cy = f.cy, dx = next.x - cx, dy = next.y - cy, alpha = Math.atan2(dy, dx), p = { x: 0, y: 0 };
  var pi = Math.PI, beta = pi / 2 - alpha, t = Math.atan2(f.h, f.w);
  if (alpha < -pi + t || alpha > pi - t) { p.x = f.x; p.y = cy - f.w * Math.tan(alpha) / 2; }
  else if (alpha < -t) { p.y = f.y; p.x = cx - f.h * Math.tan(beta) / 2; }
  else if (alpha < t) { p.x = f.x + f.w; p.y = cy + f.w * Math.tan(alpha) / 2; }
  else { p.y = f.y + f.h; p.x = cx + f.h * Math.tan(beta) / 2; }
  if (orth) {
    if (next.x >= f.x && next.x <= f.x + f.w) p.x = next.x;
    else if (next.y >= f.y && next.y <= f.y + f.h) p.y = next.y;
    if (next.x < f.x) p.x = f.x; else if (next.x > f.x + f.w) p.x = f.x + f.w;
    if (next.y < f.y) p.y = f.y; else if (next.y > f.y + f.h) p.y = f.y + f.h;
  }
  return p;
}
function ellipsePerim(f, next, orth) {
  var a = f.w / 2, b = f.h / 2, cx = f.cx, cy = f.cy, px = next.x, py = next.y;
  var dx = px - cx, dy = py - cy;
  if (orth) {
    if (py >= f.y && py <= f.y + f.h) { var ty = py - cy, tx = Math.sqrt(Math.max(0, a * a * (1 - ty * ty / (b * b)))); return { x: px <= f.x ? cx - tx : cx + tx, y: py }; }
    if (px >= f.x && px <= f.x + f.w) { var tx2 = px - cx, ty2 = Math.sqrt(Math.max(0, b * b * (1 - tx2 * tx2 / (a * a)))); return { x: px, y: py <= f.y ? cy - ty2 : cy + ty2 }; }
  }
  if (!dx && !dy) return { x: px, y: py };
  var k = 1 / Math.sqrt((dx * dx) / (a * a) + (dy * dy) / (b * b));
  return { x: cx + dx * k, y: cy + dy * k };
}
function polyPerim(f, poly, next, orth) {
  var ox = f.x, oy = f.y, cx = f.cx, cy = f.cy, px = next.x, py = next.y;
  var from = { x: cx, y: cy }, dirx = px - cx, diry = py - cy;
  if (orth) {
    if (px >= f.x && px <= f.x + f.w) { from = { x: px, y: cy }; dirx = 0; diry = py < cy ? -1 : 1; }
    else if (py >= f.y && py <= f.y + f.h) { from = { x: cx, y: py }; dirx = px < cx ? -1 : 1; diry = 0; }
  }
  if (!dirx && !diry) return { x: px, y: py };
  var best = null;
  for (var i = 0; i < poly.length; i++) {
    var a = poly[i], b = poly[(i + 1) % poly.length];
    var ax = a[0] + ox, ay = a[1] + oy, bx = b[0] + ox, by = b[1] + oy;
    var ex = bx - ax, ey = by - ay, den = dirx * ey - diry * ex;
    if (Math.abs(den) < 1e-9) continue;
    var tt = ((ax - from.x) * ey - (ay - from.y) * ex) / den, u = ((ax - from.x) * diry - (ay - from.y) * dirx) / den;
    if (tt >= 0 && u >= -1e-6 && u <= 1 + 1e-6 && (best === null || tt < best)) best = tt;
  }
  if (best === null) return rectPerim(f, next, orth);
  return { x: from.x + dirx * best, y: from.y + diry * best };
}
function perimeterPt(f, next, orth) {
  var n = { x: next.x, y: next.y };
  if (f.flipH) n.x = 2 * f.cx - n.x;
  if (f.flipV) n.y = 2 * f.cy - n.y;
  var kind = perimeterKind(f), p;
  if (kind === 'ellipse') p = ellipsePerim(f, n, orth);
  else if (kind === 'poly') { var poly = frameOutline(f); p = poly ? polyPerim(f, poly, n, orth) : rectPerim(f, n, orth); }
  else p = rectPerim(f, n, orth);
  if (f.flipH) p.x = 2 * f.cx - p.x;
  if (f.flipV) p.y = 2 * f.cy - p.y;
  return p;
}
/* A fixed connection point (draw.io exitX/exitY/entryX/entryY), turned with the shape. */
function anchorPt(f, a) {
  var r1 = dirAngle(f.dir), bx = f.x, by = f.y, bw = f.w, bh = f.h, c = { x: f.cx, y: f.cy };
  if (r1 === 90 || r1 === 270) { bx = f.cx - f.h / 2; by = f.cy - f.w / 2; bw = f.h; bh = f.w; }
  var p = { x: bx + a.x * bw + a.dx, y: by + a.y * bh + a.dy }, r2 = f.rot || 0;
  if (a.perimeter) {
    if (r1) p = rotPt(p, r1, c);
    p = perimeterPt(f, p, false);
  } else {
    r2 += r1;
    if (f.flipH) p.x = 2 * f.cx - p.x;
    if (f.flipV) p.y = 2 * f.cy - p.y;
  }
  return r2 ? rotPt(p, r2, c) : p;
}
function floatingPt(f, next, orth) {
  var c = { x: f.cx, y: f.cy }, rot = f.rot || 0;
  var p = perimeterPt(f, rot ? rotPt(next, -rot, c) : next, rot === 0 && orth);
  return rot ? rotPt(p, rot, c) : p;
}
function boxContains(b, x, y) { return !!b && b.x <= x && b.x + b.w >= x && b.y <= y && b.y + b.h >= y; }
function pointBox(p) { return { x: p.x, y: p.y, w: 0, h: 0 }; }

function sideToSide(src, tgt, p0, pe, pt) {
  var s = p0 ? pointBox(p0) : src, t = pe ? pointBox(pe) : tgt, res = [];
  if (!s || !t) return res;
  var l = Math.max(s.x, t.x), r = Math.min(s.x + s.w, t.x + t.w);
  var x = pt ? pt.x : Math.round(r + (l - r) / 2), y1 = s.y + s.h / 2, y2 = t.y + t.h / 2;
  if (pt) {
    if (pt.y >= s.y && pt.y <= s.y + s.h) y1 = pt.y;
    if (pt.y >= t.y && pt.y <= t.y + t.h) y2 = pt.y;
  }
  if (!boxContains(t, x, y1) && !boxContains(s, x, y1)) res.push({ x: x, y: y1 });
  if (!boxContains(t, x, y2) && !boxContains(s, x, y2)) res.push({ x: x, y: y2 });
  if (res.length === 1) {
    if (pt) { if (!boxContains(t, x, pt.y) && !boxContains(s, x, pt.y)) res.push({ x: x, y: pt.y }); }
    else { var tt = Math.max(s.y, t.y), bb = Math.min(s.y + s.h, t.y + t.h); res.push({ x: x, y: tt + (bb - tt) / 2 }); }
  }
  return res;
}
function topToBottom(src, tgt, p0, pe, pt) {
  var s = p0 ? pointBox(p0) : src, t = pe ? pointBox(pe) : tgt, res = [];
  if (!s || !t) return res;
  var tp = Math.max(s.y, t.y), bt = Math.min(s.y + s.h, t.y + t.h);
  var x = s.x + s.w / 2;
  if (pt && pt.x >= s.x && pt.x <= s.x + s.w) x = pt.x;
  var y = pt ? pt.y : Math.round(bt + (tp - bt) / 2);
  if (!boxContains(t, x, y) && !boxContains(s, x, y)) res.push({ x: x, y: y });
  x = pt && pt.x >= t.x && pt.x <= t.x + t.w ? pt.x : t.x + t.w / 2;
  if (!boxContains(t, x, y) && !boxContains(s, x, y)) res.push({ x: x, y: y });
  if (res.length === 1) {
    if (pt) { if (!boxContains(t, pt.x, y) && !boxContains(s, pt.x, y)) res.push({ x: pt.x, y: y }); }
    else { var l = Math.max(s.x, t.x), r = Math.min(s.x + s.w, t.x + t.w); res.push({ x: l + (r - l) / 2, y: y }); }
  }
  return res;
}
function elbowRoute(src, tgt, p0, pe, hints, elbow) {
  var pt = hints.length ? hints[0] : null, vertical = false, horizontal = false;
  if (src && tgt) {
    if (pt) {
      var left = Math.min(src.x, tgt.x), right = Math.max(src.x + src.w, tgt.x + tgt.w);
      var top = Math.min(src.y, tgt.y), bottom = Math.max(src.y + src.h, tgt.y + tgt.h);
      vertical = pt.y < top || pt.y > bottom;
      horizontal = pt.x < left || pt.x > right;
    } else {
      var l = Math.max(src.x, tgt.x), r = Math.min(src.x + src.w, tgt.x + tgt.w);
      vertical = l === r;
      if (!vertical) { var t = Math.max(src.y, tgt.y), b = Math.min(src.y + src.h, tgt.y + tgt.h); horizontal = t === b; }
    }
  }
  if (!horizontal && (vertical || elbow === 'vertical')) return topToBottom(src, tgt, p0, pe, pt);
  return sideToSide(src, tgt, p0, pe, pt);
}
/* Orthogonal route through user waypoints: each waypoint fixes the next horizontal or vertical segment. */
function segmentRoute(src, tgt, p0, pe, hintsIn) {
  var tol = 1, result = [], temp = [], lastPushed = p0 || null;
  function push(q) {
    q = { x: Math.round(q.x * 10) / 10, y: Math.round(q.y * 10) / 10 };
    if (!lastPushed || Math.abs(lastPushed.x - q.x) >= tol || Math.abs(lastPushed.y - q.y) >= tol) { result.push(q); lastPushed = q; }
  }
  var pt = p0 ? { x: p0.x, y: p0.y } : (src ? { x: src.cx, y: src.cy } : null);
  var horizontal = true, hint = null, hints = hintsIn.map(function (q) { return { x: q.x, y: q.y }; });
  if (hints.length) {
    if (pt) { if (Math.abs(hints[0].x - pt.x) < tol) hints[0].x = pt.x; if (Math.abs(hints[0].y - pt.y) < tol) hints[0].y = pt.y; }
    var hl = hints[hints.length - 1];
    if (pe) { if (Math.abs(hl.x - pe.x) < tol) hl.x = pe.x; if (Math.abs(hl.y - pe.y) < tol) hl.y = pe.y; }
    hint = hints[0];
    var term = p0 ? null : src, cur = p0, curHint = hint;
    for (var i = 0; i < 2; i++) {
      var fixedV = !!cur && cur.x === curHint.x, fixedH = !!cur && cur.y === curHint.y;
      var inH = !!term && curHint.y >= term.y && curHint.y <= term.y + term.h;
      var inV = !!term && curHint.x >= term.x && curHint.x <= term.x + term.w;
      var hozChan = fixedH || (!cur && inH), vertChan = fixedV || (!cur && inV);
      if (!(i === 0 && ((hozChan && vertChan) || (fixedV && fixedH)))) {
        if (cur && !fixedH && !fixedV && (inH || inV)) { horizontal = !inH; break; }
        if (vertChan || hozChan) {
          horizontal = hozChan;
          if (i === 1) horizontal = hints.length % 2 === 0 ? hozChan : vertChan;
          break;
        }
      }
      term = pe ? null : tgt; cur = pe; curHint = hints[hints.length - 1];
      if (fixedV && fixedH) hints = hints.slice(1);
    }
    if (!pt) pt = { x: hint.x, y: hint.y };
    if (horizontal && ((p0 && p0.y !== hint.y) || (!p0 && src && (hint.y < src.y || hint.y > src.y + src.h)))) temp.push({ x: pt.x, y: hint.y });
    else if (!horizontal && ((p0 && p0.x !== hint.x) || (!p0 && src && (hint.x < src.x || hint.x > src.x + src.w)))) temp.push({ x: hint.x, y: pt.y });
    if (horizontal) pt.y = hint.y; else pt.x = hint.x;
    for (var k = 0; k < hints.length; k++) {
      horizontal = !horizontal;
      hint = hints[k];
      if (horizontal) pt.y = hint.y; else pt.x = hint.x;
      temp.push({ x: pt.x, y: pt.y });
    }
  } else {
    hint = pt;
    horizontal = true;
  }
  var end = pe || (tgt ? { x: tgt.cx, y: tgt.cy } : null);
  if (end && hint) {
    if (horizontal && ((pe && pe.y !== hint.y) || (!pe && tgt && (hint.y < tgt.y || hint.y > tgt.y + tgt.h)))) temp.push({ x: end.x, y: hint.y });
    else if (!horizontal && ((pe && pe.x !== hint.x) || (!pe && tgt && (hint.x < tgt.x || hint.x > tgt.x + tgt.w)))) temp.push({ x: hint.x, y: end.y });
  }
  if (!p0 && src) while (temp.length && boxContains(src, temp[0].x, temp[0].y)) temp.shift();
  if (!pe && tgt) while (temp.length && boxContains(tgt, temp[temp.length - 1].x, temp[temp.length - 1].y)) temp.pop();
  temp.forEach(push);
  if (pe && result.length) {
    var last = result[result.length - 1];
    if (Math.abs(pe.x - last.x) <= tol && Math.abs(pe.y - last.y) <= tol) {
      result.pop();
      var prev = result[result.length - 1];
      if (prev) { if (Math.abs(prev.x - pe.x) < tol) prev.x = pe.x; if (Math.abs(prev.y - pe.y) < tol) prev.y = pe.y; }
    }
  }
  return result;
}
/* Simple orthogonal router for edges drawn in this tool without waypoints. */
function sideFor(f, fixed, other) {
  if (fixed) {
    var dl = Math.abs(fixed.x - f.x), dr = Math.abs(f.x + f.w - fixed.x), dt = Math.abs(fixed.y - f.y), db = Math.abs(f.y + f.h - fixed.y);
    var m = Math.min(dl, dr, dt, db);
    return m === dr ? 'E' : m === dl ? 'W' : m === db ? 'S' : 'N';
  }
  var dx = (other.x - f.cx) / Math.max(f.w, 1), dy = (other.y - f.cy) / Math.max(f.h, 1);
  return Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'E' : 'W') : (dy >= 0 ? 'S' : 'N');
}
function sidePoint(f, side) {
  return side === 'E' ? { x: f.x + f.w, y: f.cy } : side === 'W' ? { x: f.x, y: f.cy } : side === 'S' ? { x: f.cx, y: f.y + f.h } : { x: f.cx, y: f.y };
}
function orthRoute(src, tgt, p0, pe) {
  var sc = p0 || (src && { x: src.cx, y: src.cy }), tc = pe || (tgt && { x: tgt.cx, y: tgt.cy });
  if (!sc || !tc) return [];
  var ds = src ? sideFor(src, p0, tc) : (Math.abs(tc.x - sc.x) >= Math.abs(tc.y - sc.y) ? (tc.x >= sc.x ? 'E' : 'W') : (tc.y >= sc.y ? 'S' : 'N'));
  var dt = tgt ? sideFor(tgt, pe, sc) : (Math.abs(sc.x - tc.x) >= Math.abs(sc.y - tc.y) ? (sc.x >= tc.x ? 'E' : 'W') : (sc.y >= tc.y ? 'S' : 'N'));
  var S0 = p0 || (src ? sidePoint(src, ds) : sc), T0 = pe || (tgt ? sidePoint(tgt, dt) : tc);
  var hs = ds === 'E' || ds === 'W', ht = dt === 'E' || dt === 'W', stub = 18;
  var vec = { E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1] };
  var S1 = { x: S0.x + vec[ds][0] * stub, y: S0.y + vec[ds][1] * stub }, T1 = { x: T0.x + vec[dt][0] * stub, y: T0.y + vec[dt][1] * stub };
  var ahead = function (from, side, to) { return side === 'E' ? to.x > from.x : side === 'W' ? to.x < from.x : side === 'S' ? to.y > from.y : to.y < from.y; };
  if (hs && ht) {
    /* ends level to within a pixel: one straight line, not a hair-thin jog */
    if (ahead(S0, ds, T0) && ahead(T0, dt, S0) && ds !== dt && Math.abs(S0.y - T0.y) < 1.5) return [];
    if (ahead(S0, ds, T0) && ahead(T0, dt, S0) && ds !== dt) { var mx = (S0.x + T0.x) / 2; return [{ x: mx, y: S0.y }, { x: mx, y: T0.y }]; }
    if (ds === dt) { var ex = ds === 'E' ? Math.max(S1.x, T1.x) : Math.min(S1.x, T1.x); return [{ x: ex, y: S0.y }, { x: ex, y: T0.y }]; }
    var my = (S0.y + T0.y) / 2;
    return [{ x: S1.x, y: S0.y }, { x: S1.x, y: my }, { x: T1.x, y: my }, { x: T1.x, y: T0.y }];
  }
  if (!hs && !ht) {
    if (ahead(S0, ds, T0) && ahead(T0, dt, S0) && ds !== dt && Math.abs(S0.x - T0.x) < 1.5) return [];
    if (ahead(S0, ds, T0) && ahead(T0, dt, S0) && ds !== dt) { var my2 = (S0.y + T0.y) / 2; return [{ x: S0.x, y: my2 }, { x: T0.x, y: my2 }]; }
    if (ds === dt) { var ey = ds === 'S' ? Math.max(S1.y, T1.y) : Math.min(S1.y, T1.y); return [{ x: S0.x, y: ey }, { x: T0.x, y: ey }]; }
    var mx2 = (S0.x + T0.x) / 2;
    return [{ x: S0.x, y: S1.y }, { x: mx2, y: S1.y }, { x: mx2, y: T1.y }, { x: T0.x, y: T1.y }];
  }
  if (hs) {
    if (ahead(S0, ds, T0) && ahead(T0, dt, S0)) return [{ x: T0.x, y: S0.y }];
    return [{ x: S1.x, y: S0.y }, { x: S1.x, y: T1.y }, { x: T0.x, y: T1.y }];
  }
  if (ahead(S0, ds, T0) && ahead(T0, dt, S0)) return [{ x: S0.x, y: T0.y }];
  return [{ x: S0.x, y: S1.y }, { x: T1.x, y: S1.y }, { x: T1.x, y: T0.y }];
}
function selfLoop(f) {
  var x = f.x + f.w, y = f.cy, s = Math.max(20, Math.min(40, f.h / 2));
  return [{ x: x + s, y: y - s * 0.6 }, { x: x + s, y: y + s * 0.6 }];
}
function routeEdge(d, L, e, lm) {
  var src = frameOf(d, L, e.from), tgt = frameOf(d, L, e.to);
  var route = e.route || d.route || 'straight', orth = route === 'elbow' || route === 'segment' || route === 'orthogonal';
  var hints = e.points.map(function (q) { return { x: q.x, y: q.y }; });
  var p0 = src ? (e.fromAnchor ? anchorPt(src, e.fromAnchor) : null) : (e.fromPoint ? { x: e.fromPoint.x, y: e.fromPoint.y } : null);
  var pe = tgt ? (e.toAnchor ? anchorPt(tgt, e.toAnchor) : null) : (e.toPoint ? { x: e.toPoint.x, y: e.toPoint.y } : null);
  var mid;
  /* a wire from a block to itself is a loop, unless its two ends sit on different points of the block (draw.io files
     draw a border line that way, from one corner of a box to another) */
  var twoPoints = e.fromAnchor && e.toAnchor && (e.fromAnchor.x !== e.toAnchor.x || e.fromAnchor.y !== e.toAnchor.y);
  if (e.from && e.from === e.to && !hints.length && src && !twoPoints) mid = selfLoop(src);
  else if (route === 'elbow') mid = elbowRoute(src, tgt, p0, pe, hints, e.elbow);
  else if (route === 'segment' || (route === 'orthogonal' && hints.length)) mid = segmentRoute(src, tgt, p0, pe, hints);
  else if (route === 'orthogonal') mid = orthRoute(src, tgt, p0, pe);
  else mid = hints;
  var pts = [p0].concat(mid, [pe]), last = pts.length - 1;
  if (!pts[last] && tgt) {
    var nt = pts[last - 1] || (src ? { x: src.cx, y: src.cy } : null);
    pts[last] = nt ? floatingPt(tgt, nt, orth) : { x: tgt.cx, y: tgt.cy };
  }
  if (!pts[0] && src) {
    var ns = pts[1] || pts[last];
    pts[0] = ns ? floatingPt(src, ns, orth) : { x: src.cx, y: src.cy };
  }
  pts = pts.filter(Boolean);
  var lp = labelPoint(pts, e.labelAt, e.labelDist, e.labelOffset);
  return { points: pts, lx: lp.x, ly: lp.y };
}
/* Label position along a polyline: at = -1 (start) … 0 (middle) … 1 (end), dist = offset to the side. */
function labelPoint(pts, at, dist, offset) {
  if (!pts.length) return { x: NaN, y: NaN };
  var segs = [], total = 0;
  for (var i = 1; i < pts.length; i++) { var l = Math.sqrt(Math.pow(pts[i].x - pts[i - 1].x, 2) + Math.pow(pts[i].y - pts[i - 1].y, 2)); segs.push(l); total += l; }
  var target = ((at || 0) / 2 + 0.5) * total, acc = 0, k = 0;
  while (k < segs.length - 1 && acc + segs[k] < target) { acc += segs[k]; k++; }
  var a = pts[k], b = pts[Math.min(k + 1, pts.length - 1)], seg = segs[k] || 0, f = seg ? (target - acc) / seg : 0;
  var nx = seg ? (b.y - a.y) / seg : 0, ny = seg ? (b.x - a.x) / seg : 0;
  var x = a.x + (b.x - a.x) * f + nx * (dist || 0) + (offset ? offset.x : 0);
  var y = a.y + (b.y - a.y) * f - ny * (dist || 0) + (offset ? offset.y : 0);
  return { x: x, y: y };
}

/* ---------- wiring checks: every pin has a name and a direction, so wires are checked like a schematic ---------- */
function edgeFlow(e) {
  var es = e.style || {};
  var end = es.endArrow ? es.endArrow !== 'none' : (e.dir === 'forward' || e.dir === 'both');
  var start = es.startArrow ? es.startArrow !== 'none' : (e.dir === 'back' || e.dir === 'both');
  return end && !start ? 'forward' : start && !end ? 'back' : 'none';
}
/* The pin a wire end is fixed to: the end's anchor sits on one of the shape's pins. */
function boundPin(d, id, a) {
  var n = id ? d.nodeById[id] : null;
  if (!n || !a || Math.abs(a.dx || 0) > 3 || Math.abs(a.dy || 0) > 3) return null;
  var pins = pinList(shapeDef(n.shape));
  for (var i = 0; i < pins.length; i++) if (Math.abs(pins[i].x - a.x) <= 0.02 && Math.abs(pins[i].y - a.y) <= 0.02) return pins[i];
  return null;
}
function wireName(d, id, p) {
  var n = d.nodeById[id];
  return (n && n.title ? stripMarks(n.title).split('\n')[0] : id) + (p ? '.' + p.name : '');
}
/* Returns [{ key, text, edge (raw index), node, pin (index), node2, pins: [[node id, pin index]] }].
   L (the layout) adds the check for stacked blocks. */
function wiringChecks(d, L) {
  var out = [];
  if (!d || d.kind !== 'graph') return out;
  var msgs = t('wire');
  var add = function (key, vals, ref) {
    out.push({ key: key, edge: ref.edge, node: ref.node, pin: ref.pin, node2: ref.node2, pins: ref.pins || [],
               text: msgs[key].replace(/\{(\w+)\}/g, function (m, k) { return vals[k] !== undefined ? vals[k] : m; }) });
  };
  var used = {}, inputs = {};
  d.edges.forEach(function (e) {
    var a = boundPin(d, e.from, e.fromAnchor), b = boundPin(d, e.to, e.toAnchor), k = e.rawIndex + 1;
    if (a) (used[e.from] || (used[e.from] = {}))[a.index] = true;
    if (b) (used[e.to] || (used[e.to] = {}))[b.index] = true;
    if (!a && !b) return;
    if (a && b && a.dir === 'out' && b.dir === 'out') { add('outOut', { k: k, a: wireName(d, e.from, a), b: wireName(d, e.to, b) }, { edge: e.rawIndex, pins: [[e.from, a.index], [e.to, b.index]] }); return; }
    var aIn = pinIsInput(a), bIn = pinIsInput(b);
    /* a wire between two inputs continues a net, like a clock drawn from one flip-flop on to the next */
    if (aIn && bIn) return;
    var flow = edgeFlow(e), back = flow === 'back';
    var src = back ? b : a, dst = back ? a : b, srcId = back ? e.to : e.from, dstId = back ? e.from : e.to;
    if (flow !== 'none') {
      var fromIn = pinIsInput(src), intoOut = !!dst && dst.dir === 'out';
      if (fromIn && intoOut) add('reversed', { k: k, a: wireName(d, srcId, src), b: wireName(d, dstId, dst) }, { edge: e.rawIndex, pins: [[srcId, src.index], [dstId, dst.index]] });
      else if (fromIn) add('fromInput', { k: k, a: wireName(d, srcId, src) }, { edge: e.rawIndex, pins: [[srcId, src.index]] });
      else if (intoOut) add('intoOutput', { k: k, b: wireName(d, dstId, dst) }, { edge: e.rawIndex, pins: [[dstId, dst.index]] });
    }
    /* what drives each input pin: every wire whose other end is not an input */
    [[a, e.from], [b, e.to]].forEach(function (q) {
      if (!pinIsInput(q[0])) return;
      var key = q[1] + '\n' + q[0].index;
      (inputs[key] || (inputs[key] = { id: q[1], pin: q[0], edges: [] })).edges.push(e.rawIndex);
    });
  });
  Object.keys(inputs).forEach(function (key) {
    var q = inputs[key];
    if (q.edges.length > 1) add('twoDrivers', { p: wireName(d, q.id, q.pin), c: q.edges.length }, { node: q.id, pin: q.pin.index, edge: q.edges[q.edges.length - 1], pins: [[q.id, q.pin.index]] });
  });
  /* a block wired pin by pin needs its clock or enable pin wired too */
  d.nodes.forEach(function (n) {
    if (!used[n.id]) return;
    pinList(shapeDef(n.shape)).forEach(function (p) {
      if (p.dir === 'clk' && !used[n.id][p.index]) add('needPin', { n: wireName(d, n.id), p: p.name }, { node: n.id, pin: p.index, pins: [[n.id, p.index]] });
    });
  });
  if (L && L.nodes && d.layout === 'manual') {
    var boxes = d.nodes.filter(function (n) { return !n.drawio && n.shape !== 'text' && n.shape !== 'line' && L.nodes[n.id]; }).map(function (n) {
      var p = L.nodes[n.id];
      return { n: n, x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
    });
    for (var i = 0; i < boxes.length; i++) for (var j = i + 1; j < boxes.length; j++) {
      var A = boxes[i], B = boxes[j];
      var ix = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x), iy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
      if (ix > 0 && iy > 0 && ix * iy >= 0.6 * Math.max(A.w * A.h, B.w * B.h)) add('stacked', { a: wireName(d, B.n.id), b: wireName(d, A.n.id) }, { node: B.n.id, node2: A.n.id });
    }
  }
  return out;
}

/* ---------- drawing ---------- */
function basisPath(pts) {
  if (!pts.length) return '';
  var d = 'M' + fmt(pts[0].x) + ',' + fmt(pts[0].y);
  if (pts.length === 1) return d;
  if (pts.length === 2) return d + 'L' + fmt(pts[1].x) + ',' + fmt(pts[1].y);
  var x0 = pts[0].x, y0 = pts[0].y, x1 = pts[1].x, y1 = pts[1].y;
  d += 'L' + fmt((5 * x0 + x1) / 6) + ',' + fmt((5 * y0 + y1) / 6);
  function curve(x, y) {
    d += 'C' + fmt((2 * x0 + x1) / 3) + ',' + fmt((2 * y0 + y1) / 3) + ' ' + fmt((x0 + 2 * x1) / 3) + ',' + fmt((y0 + 2 * y1) / 3) + ' ' + fmt((x0 + 4 * x1 + x) / 6) + ',' + fmt((y0 + 4 * y1 + y) / 6);
  }
  for (var i = 2; i < pts.length; i++) {
    curve(pts[i].x, pts[i].y);
    x0 = x1; y0 = y1; x1 = pts[i].x; y1 = pts[i].y;
  }
  curve(x1, y1);
  return d + 'L' + fmt(x1) + ',' + fmt(y1);
}
function shortenStart(points, by) {
  return shortenEnd(points.slice().reverse(), by).reverse();
}
function shortenEnd(points, by) {
  var pts = points.slice();
  if (pts.length < 2) return pts;
  var a = pts[pts.length - 2], b = pts[pts.length - 1];
  var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
  var k = Math.min(by, len * 0.45) / len;
  pts[pts.length - 1] = { x: b.x - dx * k, y: b.y - dy * k };
  return pts;
}
function topRounded(w, h, r) {
  return 'M0,' + r + 'A' + r + ',' + r + ' 0 0 1 ' + r + ',0H' + (w - r) + 'A' + r + ',' + r + ' 0 0 1 ' + w + ',' + r + 'V' + h + 'H0Z';
}
function svgText(content, x, y, size, weight, fill, extra) {
  var attrs = { x: fmt(x), y: fmt(y), 'font-size': size, 'font-weight': weight, fill: fill, text: content };
  if (extra) Object.keys(extra).forEach(function (k) { attrs[k] = extra[k]; });
  return S('text', attrs);
}
function badge(label, cx, cy, T) {
  var w = Math.max(20, textWidth(label, 10.5, 800) + 12);
  return S('g', { class: 'badge' }, [
    S('rect', { x: fmt(cx - w / 2), y: fmt(cy - 10), width: fmt(w), height: 20, rx: 10, fill: T.stepFill, stroke: T.stepRing, 'stroke-width': 2 }),
    svgText(label, cx, cy + 3.8, 10.5, 800, T.stepText, { 'text-anchor': 'middle' })
  ]);
}

/* Size of the drawing; while editing, a hand-placed tab keeps some free room on the right and at the bottom
   (for new blocks and the suggested next block), which downloads leave out. */
function outW(L) { return L.width - (L.roomX || 0); }
function outH(L) { return L.height - (L.roomY || 0); }
function drawDiagram(st, forExport) {
  var d = st.d, L = st.L, T = THEMES[themeName];
  var uid = st.uid + (forExport ? 'x' : '');
  var W = forExport ? outW(L) : L.width, Hh = forExport ? outH(L) : L.height;
  var svg = S('svg', {
    xmlns: SVG_NS, width: W, height: Hh, viewBox: '0 0 ' + W + ' ' + Hh,
    'font-family': FONT, role: 'img', 'aria-label': d.title || spec.title || 'Diagram'
  });
  var defs = S('defs');
  svg.appendChild(defs);
  defs.appendChild(S('filter', { id: uid + '-sh', x: '-10%', y: '-10%', width: '120%', height: '145%' }, [
    S('feDropShadow', { dx: 0, dy: 1.5, stdDeviation: 2.2, 'flood-color': T.shadow, 'flood-opacity': 1 })
  ]));
  var markers = {};
  function marker(color) {
    if (markers[color]) return markers[color];
    var id = uid + '-arrow-' + color.replace(/[^0-9a-z]/gi, '');
    defs.appendChild(S('marker', { id: id, viewBox: '0 0 10 10', refX: 5.2, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto' }, [
      S('path', { d: 'M0,0.6 L10,5 L0,9.4 Z', fill: color })
    ]));
    markers[color] = 'url(#' + id + ')';
    return markers[color];
  }
  function markerStart(color) {
    var key = 'start:' + color;
    if (markers[key]) return markers[key];
    var id = uid + '-arrows-' + color.replace(/[^0-9a-z]/gi, '');
    defs.appendChild(S('marker', { id: id, viewBox: '0 0 10 10', refX: 5.6, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto' }, [
      S('path', { d: 'M10,0.6 L0,5 L10,9.4 Z', fill: color })
    ]));
    markers[key] = 'url(#' + id + ')';
    return markers[key];
  }
  /* draw.io-style arrowheads (classic, block, open, oval, diamond), sized like draw.io's markers */
  function styledMarker(type, size, color, filled, sw, atStart) {
    var key = [type, size, color, filled, sw, atStart].join('|');
    if (markers[key]) return markers[key];
    var id = uid + '-m' + Object.keys(markers).length;
    var thin = /Thin$/.test(type), base = type.replace(/Thin$/, ''), len = size + sw, half = len / (thin ? 3 : 2), shape;
    if (base === 'oval') shape = S('circle', { cx: len / 2, cy: len / 2, r: size / 2 });
    else if (base === 'diamond') shape = S('path', { d: 'M0,' + fmt(len / 2) + ' L' + fmt(len / 2) + ',' + fmt(len / 2 - half) + ' L' + fmt(len) + ',' + fmt(len / 2) + ' L' + fmt(len / 2) + ',' + fmt(len / 2 + half) + ' Z' });
    else if (base === 'open') shape = S('path', { d: 'M0,' + fmt(len / 2 - half) + ' L' + fmt(len) + ',' + fmt(len / 2) + ' L0,' + fmt(len / 2 + half), fill: 'none' });
    else if (base === 'dash') shape = S('path', { d: 'M' + fmt(len / 2 - half * 0.6) + ',' + fmt(len / 2 + half) + ' L' + fmt(len / 2 + half * 0.6) + ',' + fmt(len / 2 - half), fill: 'none' });
    else if (base === 'cross') shape = S('path', { d: 'M' + fmt(len / 2 - half) + ',' + fmt(len / 2 - half) + ' L' + fmt(len / 2 + half) + ',' + fmt(len / 2 + half) + ' M' + fmt(len / 2 - half) + ',' + fmt(len / 2 + half) + ' L' + fmt(len / 2 + half) + ',' + fmt(len / 2 - half), fill: 'none' });
    else shape = S('path', { d: 'M0,' + fmt(len / 2 - half) + ' L' + fmt(len) + ',' + fmt(len / 2) + ' L0,' + fmt(len / 2 + half) + (base === 'classic' ? ' L' + fmt(len / 4) + ',' + fmt(len / 2) : '') + ' Z' });
    var open = base === 'open' || base === 'dash' || base === 'cross' || !filled;
    setAttrs(shape, { fill: open ? (base === 'open' || base === 'dash' || base === 'cross' ? 'none' : T.page) : color, stroke: color, 'stroke-width': sw, 'stroke-linejoin': 'miter' });
    var refX = (base === 'oval' ? len / 2 : len) - arrowInset(type, size, sw);
    defs.appendChild(S('marker', { id: id, viewBox: fmt(-sw) + ' ' + fmt(-sw) + ' ' + fmt(len + 2 * sw) + ' ' + fmt(len + 2 * sw), refX: fmt(refX), refY: fmt(len / 2),
      markerWidth: fmt(len + 2 * sw), markerHeight: fmt(len + 2 * sw), markerUnits: 'userSpaceOnUse', orient: atStart ? 'auto-start-reverse' : 'auto' }, [shape]));
    markers[key] = 'url(#' + id + ')';
    return markers[key];
  }
  if (forExport) svg.appendChild(S('rect', { width: W, height: Hh, fill: T.page }));
  var root = S('g', { class: 'root', transform: 'translate(' + fmt(L.ox) + ' ' + fmt(L.oy) + ')' });
  svg.appendChild(root);

  var gLayer = S('g', { class: 'groups' });
  var chipLayer = S('g', { class: 'group-labels' });
  d.groups.slice().sort(function (a, b) { return groupDepth(d, a) - groupDepth(d, b); }).forEach(function (gr) {
    var b = L.groups[gr.id];
    if (!b || gr.hidden) return;
    var c = PALETTE[gr.color];
    if (gr.drawio || Object.keys(gr.style).length) {
      gLayer.appendChild(drawStyledGroup(gr, b, T));
      if (gr.source) drawFrameInfo(d, gr, b, c, T, chipLayer, forExport);
      return;
    }
    var label = chipLabel(gr), cw = chipWidth(gr), frame = !!gr.source;
    /* a frame of a detail board stands for one block: solid border, like the block's own outline */
    gLayer.appendChild(S('g', { class: 'group' + (frame ? ' frame' : ''), 'data-id': gr.id }, [
      S('rect', { x: fmt(b.x), y: fmt(b.y), width: fmt(b.w), height: fmt(b.h), rx: frame ? 8 : 14, fill: rgba(c, frame ? T.groupFill * 0.7 : T.groupFill),
                  stroke: rgba(c, frame ? Math.min(1, T.groupStroke + 0.35) : T.groupStroke), 'stroke-width': frame ? 2 : 1.5, 'stroke-dasharray': frame ? null : '7 5' })
    ]));
    if (frame) drawFrameInfo(d, gr, b, c, T, chipLayer, forExport);
    if (!gr.label) return;
    var named = iconKnown(gr.icon), chipInk = mix(c, T.chipText[0], T.chipText[1]);
    chipLayer.appendChild(S('g', { class: 'group-label', 'data-id': gr.id }, [
      S('rect', { x: fmt(b.x + 14), y: fmt(b.y - 10), width: fmt(cw), height: 20, rx: 6, fill: mix(c, T.chipMix[0], T.chipMix[1]), stroke: rgba(c, T.groupStroke), 'stroke-width': 1 }),
      named ? S('path', { d: pthD(iconPath(gr.icon, b.x + 14 + 7, b.y - 6, 12).c), fill: 'none', stroke: chipInk, 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) : null,
      svgText(label, b.x + 14 + 9 + (named ? 16 : 0), b.y + 3.9, 11, 700, chipInk, { 'letter-spacing': '0.04em' })
    ]));
  });
  root.appendChild(gLayer);

  var eLayer = S('g', { class: 'edges' });
  var lLayer = S('g', { class: 'labels' });
  var refs = { nodeEls: {}, edgeEls: [], labelEls: [] };
  d.edges.forEach(function (e, i) {
    var geo = L.edges[i], es = e.style, styled = Object.keys(es).length > 0 || !!e.drawio;
    var style = EDGE_STYLE[e.kind], color = es.color || (e.drawio ? T.dioInk : T.edges[e.kind]);
    var width = es.width !== undefined ? es.width : (styled ? 1 : style.width);
    var dash = es.dashed ? scaleDash(es.dashed === true ? '3 3' : es.dashed, width) : (styled ? null : style.dash);
    var pts = geo.points, attrs = { fill: 'none', stroke: color, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linejoin': 'round' };
    if (styled) {
      var endType = es.endArrow || (e.dir === 'forward' || e.dir === 'both' ? 'classic' : 'none');
      var startType = es.startArrow || (e.dir === 'back' || e.dir === 'both' ? 'classic' : 'none');
      if (endType !== 'none') {
        var es1 = es.endSize !== undefined ? es.endSize : 6;
        pts = shortenEnd(pts, arrowInset(endType, es1, width));
        attrs['marker-end'] = styledMarker(endType, es1, color, es.endFill !== false, width, false);
      }
      if (startType !== 'none') {
        var ss1 = es.startSize !== undefined ? es.startSize : 6;
        pts = shortenStart(pts, arrowInset(startType, ss1, width));
        attrs['marker-start'] = styledMarker(startType, ss1, color, es.startFill !== false, width, true);
      }
      attrs['stroke-linecap'] = 'butt';
      if (es.opacity !== undefined) attrs['stroke-opacity'] = es.opacity / 100;
    } else {
      var headEnd = e.dir === 'forward' || e.dir === 'both', headStart = e.dir === 'back' || e.dir === 'both';
      if (headEnd) pts = shortenEnd(pts, 5);
      if (headStart) pts = shortenStart(pts, 5);
      attrs['stroke-linecap'] = e.kind === 'bus' ? 'butt' : 'round';
      attrs['marker-end'] = headEnd ? marker(color) : null;
      attrs['marker-start'] = headStart ? markerStart(color) : null;
    }
    var route = d.layout === 'manual' ? (e.route || d.route || 'straight') : 'spline';
    attrs.d = edgePath(pts, route, es.rounded || (!styled && route === 'orthogonal'));
    var g = S('g', { class: 'edge', 'data-i': i }, [S('path', attrs)]);
    if (!forExport) g.appendChild(S('path', { d: attrs.d, fill: 'none', stroke: 'transparent', 'stroke-width': 10, class: 'edge-hit' }));
    eLayer.appendChild(g);
    refs.edgeEls.push(g);
    var lm = L.labelM[i], lab = null;
    if (lm.w && isFinite(geo.lx)) {
      lab = S('g', { class: 'elabel', 'data-i': i, transform: 'translate(' + fmt(geo.lx) + ' ' + fmt(geo.ly) + ')' });
      if (lm.lines.length && styled) {
        var fsz = es.fontSize || 11, lh2 = fsz * 1.2, top2 = -lm.lines.length * lh2 / 2, tw2 = 0;
        lm.lines.forEach(function (line) { tw2 = Math.max(tw2, textWidth(line, fsz, es.bold ? 700 : 400, d.font)); });
        var bg = es.labelBg || T.labelBg;
        if (bg !== 'none') lab.appendChild(S('rect', { x: fmt(-tw2 / 2 - 2), y: fmt(top2 - 1), width: fmt(tw2 + 4), height: fmt(lm.lines.length * lh2 + 2), fill: bg }));
        lm.lines.forEach(function (line, k) {
          lab.appendChild(svgText(line, 0, top2 + k * lh2 + baseline(lh2, fsz), fsz, es.bold ? 700 : 400, es.text || (e.drawio ? T.dioInk : T.ink), { 'text-anchor': 'middle', 'font-family': d.font || null }));
        });
        if (lm.badge) lab.appendChild(badge(lm.stepText, -tw2 / 2 - lm.badge / 2 - 4, 0, T));
      } else if (lm.lines.length) {
        var pill = T.pills[e.kind];
        lab.appendChild(S('rect', { x: fmt(-lm.w / 2), y: fmt(-lm.h / 2), width: lm.w, height: lm.h, rx: Math.min(10, lm.h / 2), fill: pill[0], stroke: pill[2], 'stroke-width': 1 }));
        var textX = -lm.w / 2 + lm.padX + (lm.badge ? lm.badge + 4 : 0);
        var lineH = lm.size * LH, top = -lm.lines.length * lineH / 2;
        lm.lines.forEach(function (line, k) {
          lab.appendChild(svgText(line, textX, top + k * lineH + baseline(lineH, lm.size), lm.size, 600, pill[1]));
        });
        if (lm.badge) lab.appendChild(badge(lm.stepText, -lm.w / 2 + lm.badge / 2 + 2, 0, T));
      } else if (lm.badge) {
        lab.appendChild(badge(lm.stepText, 0, 0, T));
      }
      lLayer.appendChild(lab);
    }
    refs.labelEls.push(lab);
  });

  var nLayer = S('g', { class: 'nodes' });
  d.nodes.forEach(function (n) {
    var m = L.nodeM[n.id], p = L.nodes[n.id], s = m.s, c = PALETTE[n.color], r = 10;
    var x = p.x - m.w / 2, y = p.y - m.h / 2;
    if (!CORE_SHAPES[n.shape]) {
      var sg = drawSymbolNode(n, m, x, y, T, uid, forExport);
      nLayer.appendChild(sg);
      refs.nodeEls[n.id] = sg;
      return;
    }
    var g = S('g', {
      class: 'node', 'data-id': n.id, 'data-shape': n.shape, transform: 'translate(' + fmt(x) + ' ' + fmt(y) + ')',
      tabindex: forExport ? null : 0, role: forExport ? null : 'button',
      'aria-label': forExport ? null : n.title + (n.desc ? '. ' + n.desc : '')
    });
    g.appendChild(S('title', { text: n.title + (n.desc ? '\n' + n.desc : '') }));
    if (n.initial) {
      var iy = m.h / 2;
      g.appendChild(S('circle', { cx: -26, cy: fmt(iy), r: 5.5, fill: T.ink }));
      g.appendChild(S('path', { d: 'M-20,' + fmt(iy) + 'H-6', stroke: T.ink, 'stroke-width': 1.8 }));
      g.appendChild(S('path', { d: 'M-7,' + fmt(iy - 4.5) + 'L0,' + fmt(iy) + 'L-7,' + fmt(iy + 4.5) + 'Z', fill: T.ink }));
    }
    if (m.state) {
      var rr = m.h / 2;
      g.appendChild(S('rect', { width: m.w, height: m.h, rx: fmt(rr), fill: c, filter: 'url(#' + uid + '-sh)', stroke: n.external ? T.cardBody : 'none', 'stroke-dasharray': n.external ? '5 4' : null, 'stroke-width': 1.5 }));
      if (n.final) g.appendChild(S('rect', { x: 3.5, y: 3.5, width: m.w - 7, height: m.h - 7, rx: fmt(rr - 3.5), fill: 'none', stroke: '#ffffff', 'stroke-width': 1.6, 'stroke-opacity': 0.9 }));
      var stl = s.title * LH, sdl = (s.desc - 0.5) * LH;
      var blockH = m.title.lines.length * stl + (m.desc ? m.desc.lines.length * sdl + 2 : 0);
      var sy = m.h / 2 - blockH / 2;
      m.title.lines.forEach(function (line, k) {
        g.appendChild(svgText(line, m.w / 2, sy + k * stl + baseline(stl, s.title), s.title, 700, '#ffffff', { 'text-anchor': 'middle' }));
      });
      if (m.desc) {
        var dy0 = sy + m.title.lines.length * stl + 2;
        m.desc.lines.forEach(function (line, k) {
          g.appendChild(svgText(line, m.w / 2, dy0 + k * sdl + baseline(sdl, s.desc - 0.5), s.desc - 0.5, 400, '#ffffff', { 'text-anchor': 'middle', 'fill-opacity': 0.88 }));
        });
      }
      g.appendChild(S('rect', { class: 'card-outline', width: m.w, height: m.h, rx: fmt(rr), fill: 'none', stroke: 'none' }));
      if (n.steps.length) g.appendChild(badge(n.steps.join(','), m.w / 2, 2, T));
      nLayer.appendChild(g);
      refs.nodeEls[n.id] = g;
      return;
    }
    if (m.decision) {
      var poly = fmt(m.w / 2) + ',0 ' + m.w + ',' + fmt(m.h / 2) + ' ' + fmt(m.w / 2) + ',' + m.h + ' 0,' + fmt(m.h / 2);
      g.appendChild(S('polygon', { points: poly, fill: c, filter: 'url(#' + uid + '-sh)', stroke: n.external ? T.cardBody : 'none', 'stroke-width': 1.5, 'stroke-dasharray': n.external ? '5 4' : null }));
      var dtl = s.title * LH, top0 = m.h / 2 - m.title.lines.length * dtl / 2;
      m.title.lines.forEach(function (line, k) {
        g.appendChild(svgText(line, m.w / 2, top0 + k * dtl + baseline(dtl, s.title), s.title, 700, '#ffffff', { 'text-anchor': 'middle' }));
      });
      g.appendChild(S('polygon', { class: 'card-outline', points: poly, fill: 'none', stroke: 'none' }));
      if (n.steps.length) g.appendChild(badge(n.steps.join(','), m.w / 2, 2, T));
      nLayer.appendChild(g);
      refs.nodeEls[n.id] = g;
      return;
    }
    g.appendChild(S('rect', {
      width: m.w, height: m.h, rx: r, fill: T.cardBody, filter: 'url(#' + uid + '-sh)',
      stroke: n.external ? c : T.cardBorder, 'stroke-width': n.external ? 1.5 : 1, 'stroke-dasharray': n.external ? '5 4' : null
    }));
    if (m.desc || m.ports) g.appendChild(S('path', { d: topRounded(m.w, m.headH, r), fill: c }));
    else g.appendChild(S('rect', { width: m.w, height: m.h, rx: r, fill: c }));
    var tl = s.title * LH;
    if (n.icon && iconKnown(n.icon)) g.appendChild(S('path', { d: pthD(iconPath(n.icon, s.padX, s.headPad + (tl - s.icon) / 2, s.icon).c), fill: 'none', stroke: '#ffffff', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    else if (n.icon) g.appendChild(svgText(n.icon, s.padX, s.headPad + baseline(tl, s.icon), s.icon, 400, '#ffffff'));
    m.title.lines.forEach(function (line, k) {
      g.appendChild(svgText(line, s.padX + m.iconW, s.headPad + k * tl + baseline(tl, s.title), s.title, 700, '#ffffff'));
    });
    if (m.desc) {
      var dl = s.desc * LH;
      m.desc.lines.forEach(function (line, k) {
        g.appendChild(svgText(line, s.padX, m.headH + s.bodyPad + k * dl + baseline(dl, s.desc), s.desc, 400, T.cardText));
      });
    }
    if (m.ports) {
      var P = m.ports;
      g.appendChild(S('line', { x1: s.padX, y1: fmt(P.top - 4), x2: fmt(m.w - s.padX), y2: fmt(P.top - 4), stroke: T.cardBorder, 'stroke-width': 1 }));
      [[P.left, 'left'], [P.right, 'right']].forEach(function (side) {
        side[0].forEach(function (txt, k) {
          var py = P.top + k * PORT_LH, cy = py + PORT_LH / 2;
          var extra = { 'font-family': MONO };
          if (side[1] === 'right') extra['text-anchor'] = 'end';
          g.appendChild(svgText(txt, side[1] === 'left' ? s.padX : m.w - s.padX, py + baseline(PORT_LH, PORT_SIZE), PORT_SIZE, 500, T.cardText, extra));
          if (txt.charAt(0) !== '+') {
            var x1 = side[1] === 'left' ? -8 : m.w, x2 = side[1] === 'left' ? 0 : m.w + 8;
            g.appendChild(S('line', { x1: x1, y1: fmt(cy), x2: x2, y2: fmt(cy), stroke: c, 'stroke-width': 2, 'stroke-linecap': 'round' }));
          }
        });
      });
    }
    if (n.external) g.appendChild(S('rect', { width: m.w, height: m.h, rx: r, fill: 'none', stroke: c, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }));
    g.appendChild(S('rect', { class: 'card-outline', width: m.w, height: m.h, rx: r, fill: 'none', stroke: 'none' }));
    if (n.steps.length) g.appendChild(badge(n.steps.join(','), 1, 1, T));
    nLayer.appendChild(g);
    refs.nodeEls[n.id] = g;
  });
  d.nodes.forEach(function (n) { if (n.detail && refs.nodeEls[n.id]) drawNodeDetailMark(n, L, T, nLayer, forExport); });
  /* draw.io paints cells in file order: edges and shapes interleave, so imported drawings keep that order */
  if (d.source === 'drawio') {
    root.appendChild(eLayer);
    root.appendChild(nLayer);
    root.appendChild(lLayer);
    root.appendChild(chipLayer);
    interleave(d, root, eLayer, nLayer, refs);
  } else {
    root.appendChild(eLayer);
    root.appendChild(lLayer);
    root.appendChild(chipLayer);
    root.appendChild(nLayer);
  }
  refs.noteEls = {};
  if (L.notes && L.notes.length) root.appendChild(drawNotes(L, T, refs, forExport, uid));
  return { svg: svg, refs: refs };
}

/* ---------- frames, links between tabs and sticky notes ---------- */
function tabTitle(id) {
  var list = spec && spec.diagrams ? spec.diagrams : [], hit = list.filter(function (x) { return x.id === id; })[0];
  return hit ? (hit.title || hit.id) : id;
}
function frameInside(d, gid) {
  var n = 0;
  d.nodes.forEach(function (x) { if (x.group === gid && !(x.port && x.port.of === gid)) n++; });
  d.groups.forEach(function (x) { if (x.parent === gid) n++; });
  return n;
}
function drawFrameInfo(d, gr, b, c, T, layer, forExport) {
  var cx = b.x + b.w / 2, cy = b.y + b.h / 2, ink = mix(c, T.chipText[0], T.chipText[1]);
  if (gr.detail) {
    var txt = '▸ ' + t('detailIn').replace('{x}', tabTitle(gr.detail)), tw = textWidth(txt, 12, 700) + 30;
    layer.appendChild(S('g', { class: 'frame-detail', 'data-detail': gr.detail, 'data-id': gr.id, role: forExport ? null : 'link', tabindex: forExport ? null : 0 }, [
      forExport ? null : S('title', { text: t('detailOpen') }),
      S('rect', { x: fmt(cx - tw / 2), y: fmt(cy - 16), width: fmt(tw), height: 32, rx: 16, fill: mix(c, T.chipMix[0], T.chipMix[1]), stroke: rgba(c, 0.85), 'stroke-width': 1.2 }),
      svgText(txt, cx, cy + 4.5, 12, 700, ink, { 'text-anchor': 'middle' })
    ]));
  } else if (!forExport && !frameInside(d, gr.id)) {
    layer.appendChild(S('g', { class: 'frame-hint', 'data-id': gr.id }, [
      svgText(t('frameEmpty'), cx, cy - 3, 13, 600, T.muted, { 'text-anchor': 'middle' }),
      svgText(t('frameEmptyHint'), cx, cy + 15, 11, 400, T.muted, { 'text-anchor': 'middle', 'fill-opacity': 0.85 })
    ]));
  }
}
/* A block whose inside lives in its own tab: a small ▸ in its top-right corner opens that tab. */
function drawNodeDetailMark(n, L, T, layer, forExport) {
  var p = L.nodes[n.id];
  if (!p) return;
  var x = p.x + p.w / 2 - 9, y = p.y - p.h / 2 + 9, c = PALETTE[n.color];
  layer.appendChild(S('g', { class: 'node-detail', 'data-detail': n.detail, 'data-id': n.id, role: forExport ? null : 'link', tabindex: forExport ? null : 0 }, [
    forExport ? null : S('title', { text: t('detailOpen') + ': ' + tabTitle(n.detail) }),
    S('circle', { cx: fmt(x), cy: fmt(y), r: 8, fill: T.page, stroke: c, 'stroke-width': 1.4 }),
    svgText('▸', x + 0.6, y + 4, 10, 700, c, { 'text-anchor': 'middle' })
  ]));
}
var NOTE_TAGS = { note: ['#f6d77a', '#4d3b00'], constraint: ['#f4b4b0', '#6e1712'], reason: ['#b9d3f5', '#16366a'], change: ['#bfe3b8', '#1a4f16'],
                  question: ['#d8c6ea', '#43245f'], todo: ['#f9cf9f', '#5e3300'], legend: ['#dddddd', '#2b2b2b'] };
function noteDate(v) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
  return m ? m[3] + '/' + m[2] + (m[1] !== String(new Date().getFullYear()) ? '/' + m[1] : '') : (v || '');
}
function noteHeadText(q) {
  var kinds = t('noteKinds') || {};
  return [kinds[q.kind] || q.kind, noteDate(q.date), q.by].filter(Boolean).join(' · ');
}
function drawNotes(L, T, refs, forExport, uid) {
  var layer = S('g', { class: 'notes' });
  L.notes.forEach(function (b) {
    var q = b.q, w = b.w, h = b.h, tag = NOTE_TAGS[q.kind] || NOTE_TAGS.note;
    if (b.target) {
      /* a thin dashed leader from the note to what it is about (to the edge of a wire's label, not across it) */
      var tb = b.target.lbox || b.target;
      var tx = Math.min(Math.max(b.x, tb.x), tb.x + tb.w), ty = Math.min(Math.max(b.y + 14, tb.y), tb.y + tb.h);
      var sx = b.x <= tx ? b.x + w : b.x, sy = b.y + 14;
      if (Math.abs(sx - tx) + Math.abs(sy - ty) > 6) layer.appendChild(S('path', { class: 'note-leader', d: 'M' + fmt(sx) + ',' + fmt(sy) + ' L' + fmt(tx) + ',' + fmt(ty), fill: 'none', stroke: '#c9a227', 'stroke-width': 1, 'stroke-dasharray': '3 3' }));
    }
    var g = S('g', { class: 'note-sticky', 'data-note': q.id, 'data-kind': q.kind, transform: 'translate(' + fmt(b.x) + ' ' + fmt(b.y) + ')', tabindex: forExport ? null : 0 });
    if (!forExport) g.appendChild(S('title', { text: noteHeadText(q) + '\n' + q.text }));
    g.appendChild(S('path', { class: 'note-body', d: 'M0,0 H' + fmt(w - NOTE_FOLD) + ' L' + fmt(w) + ',' + NOTE_FOLD + ' V' + fmt(h) + ' H0 Z', fill: '#fff2cc', stroke: '#d6b656', 'stroke-width': 1, filter: forExport ? null : 'url(#' + uid + '-sh)' }));
    g.appendChild(S('path', { d: 'M' + fmt(w - NOTE_FOLD) + ',0 V' + NOTE_FOLD + ' H' + fmt(w) + ' Z', fill: '#efd98f', stroke: '#d6b656', 'stroke-width': 1, 'stroke-linejoin': 'round' }));
    var head = noteHeadText(q), hw = Math.min(w - NOTE_PAD * 2 - NOTE_FOLD, textWidth(head, 10, 700) + 12);
    g.appendChild(S('rect', { x: NOTE_PAD - 2, y: NOTE_PAD - 3, width: fmt(hw), height: 15, rx: 4, fill: tag[0] }));
    g.appendChild(svgText(fitText(head, hw - 10, 10, 700), NOTE_PAD + 4, NOTE_PAD + 8, 10, 700, tag[1]));
    var lh = NOTE_FS * LH;
    b.lines.forEach(function (line, k) {
      g.appendChild(svgText(line, NOTE_PAD, NOTE_PAD + NOTE_HEAD + k * lh + baseline(lh, NOTE_FS), NOTE_FS, 400, '#3a3320'));
    });
    layer.appendChild(g);
    refs.noteEls[q.id] = g;
  });
  return layer;
}

/* Imported draw.io pages: put every edge right before the first shape drawn after it in the file. */
function interleave(d, root, eLayer, nLayer, refs) {
  var order = d.nodes.map(function (n, i) { return { z: n.drawio && isFinite(n.drawio.z) ? n.drawio.z : 1e9 + i, el: refs.nodeEls[n.id] }; })
    .concat(d.edges.map(function (e, i) { return { z: e.drawio && isFinite(e.drawio.z) ? e.drawio.z : 1e9 + i, el: refs.edgeEls[i] }; }))
    .filter(function (o) { return o.el; })
    .sort(function (a, b) { return a.z - b.z; });
  var layer = S('g', { class: 'cells' });
  order.forEach(function (o) { layer.appendChild(o.el); });
  root.insertBefore(layer, eLayer);
  eLayer.remove();
  nLayer.remove();
}

function arrowInset(type, size, sw) {
  var base = type.replace(/Thin$/, ''), len = size + sw;
  if (base === 'classic') return len * 0.75;
  if (base === 'block' || base === 'diamond') return len * 0.9;
  if (base === 'oval') return size / 2;
  return sw * 1.1;
}
function edgePath(pts, route, rounded) {
  if (!pts.length) return '';
  if (route === 'spline') return basisPath(pts);
  var d = 'M' + fmt(pts[0].x) + ',' + fmt(pts[0].y);
  if (route === 'curved' && pts.length > 2) {
    for (var i = 1; i < pts.length - 2; i++) {
      var a = pts[i], b = pts[i + 1];
      d += 'Q' + fmt(a.x) + ',' + fmt(a.y) + ' ' + fmt((a.x + b.x) / 2) + ',' + fmt((a.y + b.y) / 2);
    }
    var p1 = pts[pts.length - 2], p2 = pts[pts.length - 1];
    return d + 'Q' + fmt(p1.x) + ',' + fmt(p1.y) + ' ' + fmt(p2.x) + ',' + fmt(p2.y);
  }
  if (rounded && pts.length > 2) {
    var r = 10;
    for (var k = 1; k < pts.length - 1; k++) {
      var q = pts[k], pa = pts[k - 1], pb = pts[k + 1];
      var la = Math.hypot(pa.x - q.x, pa.y - q.y) || 1, lb = Math.hypot(pb.x - q.x, pb.y - q.y) || 1;
      var ra = Math.min(r, la / 2) / la, rb = Math.min(r, lb / 2) / lb;
      d += 'L' + fmt(q.x + (pa.x - q.x) * ra) + ',' + fmt(q.y + (pa.y - q.y) * ra) + 'Q' + fmt(q.x) + ',' + fmt(q.y) + ' ' + fmt(q.x + (pb.x - q.x) * rb) + ',' + fmt(q.y + (pb.y - q.y) * rb);
    }
    return d + 'L' + fmt(pts[pts.length - 1].x) + ',' + fmt(pts[pts.length - 1].y);
  }
  for (var j = 1; j < pts.length; j++) d += 'L' + fmt(pts[j].x) + ',' + fmt(pts[j].y);
  return d;
}

function symbolColors(n, T) {
  var st = n.style, c = n.colorSet ? PALETTE[n.color] : null, bare = n.shape === 'text' || n.shape === 'image';
  var dark = themeName === 'dark';
  var sw = st.strokeWidth !== undefined ? st.strokeWidth : (n.drawio ? 1 : 1.6);
  var explicitFill = st.fill && st.fill !== 'none' && !bare, ink = n.drawio ? T.dioInk : T.ink;
  return {
    fill: st.fill || (bare ? 'none' : (c ? mix(c, dark ? '#111827' : '#ffffff', dark ? 0.7 : 0.87) : T.symFill)),
    stroke: st.stroke || (bare ? 'none' : (c || ink)),
    text: st.text || (explicitFill && m_labelInside(n) && (dark || !n.drawio) ? contrastInk(st.fill) : (c ? mix(c, dark ? '#ffffff' : '#000000', dark ? 0.55 : 0.4) : ink)),
    strokeWidth: sw,
    dash: st.dashed ? scaleDash(st.dashed === true ? '3 3' : st.dashed, sw) : (n.external ? '5 4' : null),
    fillOpacity: st.fillOpacity !== undefined ? st.fillOpacity / 100 : null,
    strokeOpacity: st.strokeOpacity !== undefined ? st.strokeOpacity / 100 : null,
    opts: n.opts, font: st.font || null
  };
}
function m_labelInside(n) { return (n.labelPos || (shapeDef(n.shape) || {}).label) === 'center'; }
function contrastInk(hex) {
  var c = hexToRgb(hex), lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  return lum > 0.55 ? '#1e293b' : '#ffffff';
}
function scaleDash(pattern, sw) {
  var k = Math.max(1, sw || 1);
  return String(pattern).split(/\s+/).filter(Boolean).map(function (v) { return fmt(+v * k); }).join(' ');
}
function drawSymbolNode(n, m, x, y, T, uid, forExport) {
  var st = n.style, col = symbolColors(n, T), rot = st.rotation || 0;
  var g = S('g', {
    class: 'node', 'data-id': n.id, 'data-shape': n.shape,
    transform: 'translate(' + fmt(x) + ' ' + fmt(y) + ')' + (rot ? ' rotate(' + fmt(rot) + ' ' + fmt(m.w / 2) + ' ' + fmt(m.h / 2) + ')' : ''),
    tabindex: forExport ? null : 0, role: forExport ? null : 'button',
    'aria-label': forExport ? null : (nodeName(n) + (n.desc ? '. ' + n.desc : '')), opacity: st.opacity !== undefined ? st.opacity / 100 : null
  });
  var tip = nodeName(n) + (n.desc ? '\n' + n.desc : '');
  g.appendChild(S('title', { text: tip }));
  var opts = {};
  Object.keys(n.opts).forEach(function (k) { opts[k] = n.opts[k]; });
  if (n.shape === 'box') opts.radius = st.rounded === true ? Math.min(m.w, m.h) * 0.15 : (typeof st.rounded === 'number' ? st.rounded : (st.rounded === false || n.drawio ? 0 : 6));
  col.opts = opts;
  /* the whole box answers clicks and drops, even where a thin symbol leaves it empty */
  if (!forExport) g.appendChild(S('rect', { class: 'hit', width: fmt(m.w), height: fmt(m.h), fill: 'transparent' }));
  var shapeEls = symbolElements(n.shape, m.w, m.h, col);
  if (st.shadow) shapeEls.forEach(function (el) { el.setAttribute('filter', 'url(#' + uid + '-sh)'); });
  shapeEls.forEach(function (el) { g.appendChild(el); });
  if (n.shape === 'image') {
    var ib = st.imageBox, iw = ib ? Math.min(ib[0], m.w) : m.w, ih = ib ? Math.min(ib[1], m.h) : m.h;
    if (n.src) g.appendChild(S('image', { href: n.src, x: 0, y: 0, width: fmt(iw), height: fmt(ih), preserveAspectRatio: n.drawio ? 'xMinYMin meet' : 'xMidYMid meet' }));
    else g.appendChild(S('rect', { width: m.w, height: m.h, fill: 'none', stroke: T.muted, 'stroke-dasharray': '4 3' }));
  }
  var lab = m.label;
  if (lab) {
    var textColor = col.text, extra = { 'text-anchor': lab.anchor };
    if (lab.family) extra['font-family'] = lab.family;
    if (st.italic) extra['font-style'] = 'italic';
    if (st.underline) extra['text-decoration'] = 'underline';
    if (st.labelBg && st.labelBg !== 'none') {
      var bx = lab.anchor === 'start' ? lab.x : lab.anchor === 'end' ? lab.x - lab.tw : lab.x - lab.tw / 2;
      g.appendChild(S('rect', { x: fmt(bx - 1), y: fmt(lab.y - 1), width: fmt(lab.tw + 2), height: fmt(lab.th + 2), fill: st.labelBg, stroke: st.labelBorder || 'none' }));
    }
    lab.lines.forEach(function (line, k) {
      g.appendChild(richLine(line, lab.x, lab.y + k * lab.lh + baseline(lab.lh, lab.fs), lab.fs, lab.weight, textColor, extra));
    });
    if (lab.desc) {
      var dy = lab.y + lab.lines.length * lab.lh + 2, dextra = { 'text-anchor': lab.anchor };
      if (lab.family) dextra['font-family'] = lab.family;
      lab.desc.forEach(function (line, k) {
        g.appendChild(svgText(line, lab.x, dy + k * lab.dlh + baseline(lab.dlh, lab.dfs), lab.dfs, 400, T.cardText, dextra));
      });
    }
  }
  g.appendChild(S('rect', { class: 'card-outline', x: -3, y: -3, width: fmt(m.w + 6), height: fmt(m.h + 6), rx: 5, fill: 'none', stroke: 'none' }));
  if (n.steps.length) g.appendChild(badge(n.steps.join(','), m.pos === 'top' || m.pos === 'left' ? m.w : 0, m.pos === 'top' ? m.h : 0, T));
  return g;
}

/* A label line where **text** is bold (draw.io labels that are only partly bold arrive this way). */
function richLine(line, x, y, size, weight, fill, extra) {
  if (line.indexOf('**') < 0) return svgText(line, x, y, size, weight, fill, extra);
  var el = svgText('', x, y, size, weight, fill, extra);
  line.split(/\*\*(.+?)\*\*/g).forEach(function (part, i) {
    if (part) el.appendChild(S('tspan', { 'font-weight': i % 2 ? 700 : null, text: part }));
  });
  return el;
}
function stripMarks(v) { return String(v).replace(/\*\*(.+?)\*\*/g, '$1'); }
function drawStyledGroup(gr, b, T) {
  var st = gr.style, dark = themeName === 'dark', c = PALETTE[gr.color];
  var fill = st.fill || (gr.drawio ? 'none' : rgba(c, T.groupFill)), stroke = st.stroke || (gr.drawio ? T.dioInk : rgba(c, T.groupStroke));
  var r = st.rounded === true ? Math.min(b.w, b.h) * 0.15 : (typeof st.rounded === 'number' ? st.rounded : 0);
  var g = S('g', { class: 'group', 'data-id': gr.id }, [
    S('rect', { x: fmt(b.x), y: fmt(b.y), width: fmt(b.w), height: fmt(b.h), rx: fmt(r), fill: fill, stroke: stroke,
                'stroke-width': st.strokeWidth !== undefined ? st.strokeWidth : 1, 'stroke-dasharray': st.dashed ? (st.dashed === true ? '4 3' : st.dashed) : null,
                'fill-opacity': st.fillOpacity !== undefined ? st.fillOpacity / 100 : null })
  ]);
  if (st.header) g.appendChild(S('line', { x1: fmt(b.x), y1: fmt(b.y + st.header), x2: fmt(b.x + b.w), y2: fmt(b.y + st.header), stroke: stroke, 'stroke-width': st.strokeWidth !== undefined ? st.strokeWidth : 1 }));
  if (gr.label) {
    var fs = st.fontSize || 12, weight = st.bold ? 700 : 400, lh = fs * 1.2, family = st.font || null;
    var align = st.align || 'center', valign = st.valign || 'top';
    if (st.header) b = { x: b.x, y: b.y, w: b.w, h: st.header };
    var lines = st.wrap === false ? gr.label.split('\n') : wrapText(gr.label, Math.max(8, b.w - 4), fs, weight, 0, family).lines;
    var th = lines.length * lh, ax = align === 'left' ? b.x + 4 : align === 'right' ? b.x + b.w - 4 : b.x + b.w / 2;
    var top = valign === 'top' ? b.y + 2 : valign === 'bottom' ? b.y + b.h - 2 - th : b.y + (b.h - th) / 2;
    lines.forEach(function (line, k) {
      g.appendChild(svgText(line, ax, top + k * lh + baseline(lh, fs), fs, weight, st.text || (gr.drawio ? T.dioInk : T.ink), { 'text-anchor': align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle', 'font-family': family }));
    });
  }
  return g;
}

/* ---------- other diagram types: timing, registers, address maps ---------- */
function commonFields(d, index, kind) {
  var legend = d.legend && typeof d.legend === 'object' ? d.legend : {};
  return {
    kind: kind, id: str(d.id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (index + 1)),
    title: str(d.title), tag: str(d.tag), summary: str(d.summary),
    nodes: [], edges: [], groups: [], steps: [], nodeById: {}, groupById: {},
    legend: { colors: legend.colors && typeof legend.colors === 'object' ? legend.colors : {}, edges: {} }
  };
}
function parseNum(v) {
  if (typeof v === 'number') return isFinite(v) ? v : NaN;
  var q = str(v).replace(/[_\s]/g, '').toLowerCase();
  if (/^0x[0-9a-f]+$/.test(q)) return parseInt(q.slice(2), 16);
  if (/^0b[01]+$/.test(q)) return parseInt(q.slice(2), 2);
  if (/^\d+$/.test(q)) return parseInt(q, 10);
  return NaN;
}
function parseSize(v) {
  if (typeof v === 'number') return v;
  var q = str(v).replace(/[_\s]/g, '').toLowerCase();
  var m = q.match(/^(0x[0-9a-f]+|\d+(?:\.\d+)?)(k|m|g|t)?i?b?$/);
  if (!m) return NaN;
  var n = m[1].indexOf('0x') === 0 ? parseInt(m[1].slice(2), 16) : parseFloat(m[1]);
  return Math.round(n * ({ k: 1024, m: 1048576, g: 1073741824, t: 1099511627776 }[m[2]] || 1));
}
function formatSize(n) {
  var units = ['B', 'KB', 'MB', 'GB', 'TB'], i = 0, v = n;
  while (i < units.length - 1 && v >= 1024 && v % 1024 === 0) { v /= 1024; i++; }
  if (v < 1024 || i === units.length - 1) return v + ' ' + units[i];
  v = n; i = 0;
  while (i < units.length - 1 && v >= 1024) { v /= 1024; i++; }
  return '≈' + (v >= 100 ? Math.round(v) : Math.round(v * 10) / 10) + ' ' + units[i];
}
function hexAddr(n, digits) {
  var h = Math.max(0, n).toString(16).toUpperCase();
  while (h.length < digits) h = '0' + h;
  return '0x' + h.replace(/(....)(?=.)/g, '$1_');
}

/* Timing diagrams use WaveJSON, the WaveDrom format, so existing WaveDrom sources can be reused. */
var WAVE = { row: 34, amp: 18, slope: 3.5 };
function normalizeWave(d, index) {
  var dg = commonFields(d, index, 'wave');
  dg.where = '[' + (dg.title || dg.id) + '] ';
  var src = d.wave && typeof d.wave === 'object' && !Array.isArray(d.wave) ? d.wave : d;
  var rows = [], groups = [];
  var dataList = function (v) { return Array.isArray(v) ? v.map(str) : (typeof v === 'string' ? v.trim().split(/\s+/).filter(Boolean) : []); };
  (function walk(items, depth) {
    (Array.isArray(items) ? items : []).forEach(function (item) {
      if (Array.isArray(item)) {
        var hasLabel = typeof item[0] === 'string';
        var grp = { label: hasLabel ? str(item[0]) : '', depth: depth, start: rows.length, end: rows.length - 1 };
        groups.push(grp);
        walk(item.slice(hasLabel ? 1 : 0), depth + 1);
        grp.end = rows.length - 1;
      } else if (item && typeof item === 'object' && (item.wave !== undefined || item.name !== undefined)) {
        rows.push({ name: str(item.name), wave: String(item.wave || ''), data: dataList(item.data), node: String(item.node || ''),
                    period: Math.max(0.25, +item.period || 1), phase: +item.phase || 0, depth: depth });
      } else {
        rows.push({ spacer: true, depth: depth });
      }
    });
  })(src.signal, 0);
  if (!rows.some(function (r) { return !r.spacer; })) problem(dg.where, 'waveEmpty');
  dg.rows = rows;
  dg.waveGroups = groups.filter(function (g) { return g.end >= g.start && g.label; });
  dg.arrows = (Array.isArray(src.edge) ? src.edge : []).map(str).filter(Boolean);
  dg.head = src.head && typeof src.head === 'object' ? src.head : {};
  dg.foot = src.foot && typeof src.foot === 'object' ? src.foot : {};
  var cfg = src.config && typeof src.config === 'object' ? src.config : {};
  dg.hscale = Math.max(1, Math.min(4, +cfg.hscale || 1));
  return dg;
}
function parseWave(r) {
  var segs = [], gaps = [], prev = null, dataIdx = 0;
  Array.from(r.wave).forEach(function (ch, i) {
    var x0 = i * r.period - r.phase, x1 = x0 + r.period;
    if (ch === '.' || ch === '|') {
      if (ch === '|') gaps.push(x0 + r.period / 2);
      if (!prev) return;
      if (prev.k === 'clk') { prev = { k: 'clk', clk: prev.clk, x0: x0, x1: x1 }; segs.push(prev); }
      else prev.x1 = x1;
      return;
    }
    var seg = { x0: x0, x1: x1 };
    if ('pnPN'.indexOf(ch) >= 0) { seg.k = 'clk'; seg.clk = ch; }
    else if ('0lL'.indexOf(ch) >= 0) { seg.k = 'low'; seg.sharp = ch !== '0'; }
    else if ('1hH'.indexOf(ch) >= 0) { seg.k = 'high'; seg.sharp = ch !== '1'; }
    else if (ch === 'z') seg.k = 'z';
    else if (ch === 'u') { seg.k = 'high'; seg.pull = true; }
    else if (ch === 'd') { seg.k = 'low'; seg.pull = true; }
    else if (ch === '=' || (ch >= '2' && ch <= '9')) { seg.k = 'data'; seg.color = ch; seg.label = r.data[dataIdx++] || ''; }
    else seg.k = 'x';
    segs.push(seg);
    prev = seg;
  });
  return { segs: segs, gaps: gaps };
}
function layoutWave(dg) {
  var cw = 36 * dg.hscale, cycles = 1, nameW = 40, depth = 0;
  dg.rows.forEach(function (r) {
    if (r.spacer) return;
    cycles = Math.max(cycles, Math.ceil(Array.from(r.wave).length * r.period - r.phase - 1e-6));
    nameW = Math.max(nameW, textWidth(r.name, 12.5, 600) + 18);
  });
  dg.waveGroups.forEach(function (g) { depth = Math.max(depth, g.depth + 1); });
  var ticks = function (o) { return o.tick !== undefined || o.tock !== undefined; };
  var headH = (dg.head.text ? 28 : 0) + (ticks(dg.head) ? 18 : 0);
  var footH = (dg.foot.text ? 28 : 0) + (ticks(dg.foot) ? 18 : 0);
  var G = { cw: cw, cycles: cycles, waveX: 14 + depth * 20 + nameW, top: 12 + headH };
  G.width = Math.ceil(G.waveX + cycles * cw + 18);
  G.height = Math.ceil(G.top + dg.rows.length * WAVE.row + footH + 14);
  var marks = {};
  dg.rows.forEach(function (r, i) {
    if (r.spacer) return;
    var y = G.top + i * WAVE.row + WAVE.row / 2;
    Array.from(r.node).forEach(function (ch, k) {
      if (ch !== '.' && ch !== ' ') marks[ch] = { x: G.waveX + (k * r.period - r.phase) * cw, y: y };
    });
  });
  G.arrows = [];
  dg.arrows.forEach(function (text) {
    var m = text.match(/^\s*([^\s<>~\-|])\s*([<>~\-|]+)\s*([^\s<>~\-|])\s*(.*)$/);
    if (!m || !marks[m[1]] || !marks[m[3]]) { problem(dg.where, 'waveEdge', { e: text }); return; }
    var op = m[2], shape = op.replace(/[<>]/g, '');
    G.arrows.push({ p1: marks[m[1]], p2: marks[m[3]], label: str(m[4]), start: op.charAt(0) === '<', end: op.charAt(op.length - 1) === '>',
                    shape: shape.indexOf('~') >= 0 ? '~' : (['-|', '|-', '-|-'].indexOf(shape) >= 0 ? shape : '-') });
  });
  return G;
}
function drawWaveRow(svg, r, X, yHi, yLo, yMid, W, T, uid) {
  var parsed = parseWave(r), segs = parsed.segs, SL = WAVE.slope;
  var line = '', zline = '', pull = '';
  var near = function (a, b) { return Math.abs(a - b) < 1e-6; };
  var isBand = function (q) { return q && (q.k === 'data' || q.k === 'x'); };
  var levelY = function (q) { return q.k === 'high' ? yHi : q.k === 'low' ? yLo : yMid; };
  var endY = function (q) { return q.k === 'clk' ? ((q.clk === 'p' || q.clk === 'P') ? yLo : yHi) : levelY(q); };
  var P = function (x, y) { return fmt(x) + ',' + fmt(y); };
  segs.forEach(function (sg, i) {
    var a = X(sg.x0), b = X(sg.x1);
    var pv = i > 0 && near(segs[i - 1].x1, sg.x0) ? segs[i - 1] : null;
    var nx = i + 1 < segs.length && near(segs[i + 1].x0, sg.x1) ? segs[i + 1] : null;
    if (sg.k === 'low' || sg.k === 'high' || sg.k === 'z') {
      var y = levelY(sg), part;
      if (!pv) part = 'M' + P(a, y);
      else if (isBand(pv)) part = 'M' + P(a, yMid) + 'L' + P(a + SL, y);
      else {
        var py = endY(pv), vertical = sg.sharp || pv.sharp || pv.k === 'clk';
        part = 'M' + P(a, py) + (near(py, y) ? '' : 'L' + P(vertical ? a : a + SL, y));
      }
      part += 'L' + P(isBand(nx) ? b - SL : b, y) + (isBand(nx) ? 'L' + P(b, yMid) : '');
      if (sg.k === 'z') zline += part; else if (sg.pull) pull += part; else line += part;
    } else if (sg.k === 'clk') {
      var half = (b - a) / 2, first = (sg.clk === 'p' || sg.clk === 'P') ? yHi : yLo, second = first === yHi ? yLo : yHi;
      var from = !pv ? second : (isBand(pv) || pv.k === 'z' ? yMid : endY(pv));
      line += 'M' + P(a, from) + 'L' + P(a, first) + 'L' + P(a + half, first) + 'L' + P(a + half, second) + 'L' + P(b, second);
      if (sg.clk === 'P' || sg.clk === 'N') {
        var up = sg.clk === 'P';
        svg.appendChild(S('path', { d: 'M' + P(a - 4, up ? yMid + 3 : yMid - 3) + 'L' + P(a + 4, up ? yMid + 3 : yMid - 3) + 'L' + P(a, up ? yMid - 4 : yMid + 4) + 'Z', fill: W.line }));
      }
    } else {
      var pts = [];
      if (pv) pts.push([a, yMid], [a + SL, yHi]); else pts.push([a, yHi]);
      if (nx) pts.push([b - SL, yHi], [b, yMid], [b - SL, yLo]); else pts.push([b, yHi], [b, yLo]);
      pts.push(pv ? [a + SL, yLo] : [a, yLo]);
      svg.appendChild(S('polygon', {
        points: pts.map(function (q) { return P(q[0], q[1]); }).join(' '),
        fill: sg.k === 'x' ? 'url(#' + uid + '-hatch)' : (W.fill[sg.color] || W.fill['=']),
        stroke: W.line, 'stroke-width': 1.3, 'stroke-linejoin': 'round'
      }));
      if (pv && pv.k === 'clk') line += 'M' + P(a, endY(pv)) + 'L' + P(a, yMid);
      if (sg.k === 'data' && sg.label) {
        var label = fitText(sg.label, b - a - 2 * SL - 4, 11, 600);
        if (label) svg.appendChild(svgText(label, (a + b) / 2, yMid + 3.9, 11, 600, W.text, { 'text-anchor': 'middle' }));
      }
    }
  });
  if (line) svg.appendChild(S('path', { d: line, fill: 'none', stroke: W.line, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  if (pull) svg.appendChild(S('path', { d: pull, fill: 'none', stroke: W.line, 'stroke-width': 1.3, 'stroke-dasharray': '3 2' }));
  if (zline) svg.appendChild(S('path', { d: zline, fill: 'none', stroke: W.z, 'stroke-width': 1.6 }));
  parsed.gaps.forEach(function (gt) {
    var gx = X(gt);
    svg.appendChild(S('path', { d: 'M' + P(gx - 5, yLo + 4) + 'L' + P(gx + 1, yHi - 4) + 'L' + P(gx + 5, yHi - 4) + 'L' + P(gx - 1, yLo + 4) + 'Z', fill: T.page }));
    svg.appendChild(S('path', { d: 'M' + P(gx - 5, yLo + 4) + 'L' + P(gx + 1, yHi - 4) + 'M' + P(gx - 1, yLo + 4) + 'L' + P(gx + 5, yHi - 4), stroke: W.line, 'stroke-width': 1.2 }));
  });
}
function newSvg(st, forExport, label) {
  var G = st.L, T = THEMES[themeName];
  var svg = S('svg', { xmlns: SVG_NS, width: G.width, height: G.height, viewBox: '0 0 ' + G.width + ' ' + G.height, 'font-family': FONT, role: 'img', 'aria-label': st.d.title || spec.title || label });
  var defs = S('defs');
  svg.appendChild(defs);
  if (forExport) svg.appendChild(S('rect', { width: G.width, height: G.height, fill: T.page }));
  return { svg: svg, defs: defs };
}
function hatch(defs, id, bg, stroke) {
  defs.appendChild(S('pattern', { id: id, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, [
    S('rect', { width: 6, height: 6, fill: bg }), S('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: stroke, 'stroke-width': 1.4 })
  ]));
}
function drawWave(st, forExport) {
  var dg = st.d, G = st.L, T = THEMES[themeName], W = T.wave, uid = st.uid + (forExport ? 'x' : '');
  var made = newSvg(st, forExport, 'Timing diagram'), svg = made.svg, defs = made.defs;
  hatch(defs, uid + '-hatch', T.page, W.x);
  defs.appendChild(S('marker', { id: uid + '-wa', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, markerUnits: 'userSpaceOnUse', orient: 'auto' }, [S('path', { d: 'M0,1 L10,5 L0,9 Z', fill: W.arrow })]));
  defs.appendChild(S('marker', { id: uid + '-was', viewBox: '0 0 10 10', refX: 1, refY: 5, markerWidth: 7, markerHeight: 7, markerUnits: 'userSpaceOnUse', orient: 'auto' }, [S('path', { d: 'M10,1 L0,5 L10,9 Z', fill: W.arrow })]));
  var X = function (tt) { return G.waveX + tt * G.cw; };
  var bottom = G.top + dg.rows.length * WAVE.row;
  for (var c = 0; c <= G.cycles; c++) {
    svg.appendChild(S('line', { x1: fmt(X(c)), y1: G.top - 4, x2: fmt(X(c)), y2: bottom + 2, stroke: W.grid, 'stroke-width': 1, 'stroke-dasharray': '2 3' }));
  }
  var ticks = function (o, y) {
    var k;
    if (o.tick !== undefined && isFinite(+o.tick)) for (k = 0; k <= G.cycles; k++) svg.appendChild(svgText(String(+o.tick + k), X(k), y, 10.5, 500, W.name, { 'text-anchor': 'middle' }));
    if (o.tock !== undefined && isFinite(+o.tock)) for (k = 0; k < G.cycles; k++) svg.appendChild(svgText(String(+o.tock + k), X(k + 0.5), y, 10.5, 500, W.name, { 'text-anchor': 'middle' }));
  };
  var hy = 12;
  if (dg.head.text) { svg.appendChild(svgText(str(dg.head.text), X(G.cycles / 2), hy + 18, 14, 700, W.text, { 'text-anchor': 'middle' })); hy += 28; }
  if (dg.head.tick !== undefined || dg.head.tock !== undefined) ticks(dg.head, hy + 11);
  var fy = bottom + 16;
  if (dg.foot.tick !== undefined || dg.foot.tock !== undefined) { ticks(dg.foot, fy); fy += 18; }
  if (dg.foot.text) svg.appendChild(svgText(str(dg.foot.text), X(G.cycles / 2), fy + 10, 13, 600, W.text, { 'text-anchor': 'middle' }));
  dg.waveGroups.forEach(function (g) {
    var gx = 14 + g.depth * 20 + 8, gy1 = G.top + g.start * WAVE.row + 5, gy2 = G.top + (g.end + 1) * WAVE.row - 5, cy = (gy1 + gy2) / 2;
    svg.appendChild(S('path', { d: 'M' + (gx + 6) + ',' + gy1 + 'H' + gx + 'V' + gy2 + 'H' + (gx + 6), fill: 'none', stroke: W.name, 'stroke-width': 1.2 }));
    svg.appendChild(svgText(fitText(g.label, gy2 - gy1, 11, 700), gx - 5, cy, 11, 700, W.name, { 'text-anchor': 'middle', transform: 'rotate(-90 ' + fmt(gx - 5) + ' ' + fmt(cy) + ')' }));
  });
  dg.rows.forEach(function (r, i) {
    if (r.spacer) return;
    var rowTop = G.top + i * WAVE.row;
    var yHi = rowTop + (WAVE.row - WAVE.amp) / 2, yLo = yHi + WAVE.amp, yMid = (yHi + yLo) / 2;
    svg.appendChild(svgText(r.name, G.waveX - 10, yMid + 4.3, 12.5, 600, W.name, { 'text-anchor': 'end' }));
    drawWaveRow(svg, r, X, yHi, yLo, yMid, W, T, uid);
  });
  G.arrows.forEach(function (A) {
    var a = A.p1, b = A.p2, d;
    if (A.shape === '~') { var dx = (b.x - a.x) * 0.5; d = 'M' + fmt(a.x) + ',' + fmt(a.y) + 'C' + fmt(a.x + dx) + ',' + fmt(a.y) + ' ' + fmt(b.x - dx) + ',' + fmt(b.y) + ' ' + fmt(b.x) + ',' + fmt(b.y); }
    else if (A.shape === '-|') d = 'M' + fmt(a.x) + ',' + fmt(a.y) + 'H' + fmt(b.x) + 'V' + fmt(b.y);
    else if (A.shape === '|-') d = 'M' + fmt(a.x) + ',' + fmt(a.y) + 'V' + fmt(b.y) + 'H' + fmt(b.x);
    else if (A.shape === '-|-') d = 'M' + fmt(a.x) + ',' + fmt(a.y) + 'H' + fmt((a.x + b.x) / 2) + 'V' + fmt(b.y) + 'H' + fmt(b.x);
    else d = 'M' + fmt(a.x) + ',' + fmt(a.y) + 'L' + fmt(b.x) + ',' + fmt(b.y);
    svg.appendChild(S('path', { d: d, fill: 'none', stroke: W.arrow, 'stroke-width': 1.3, 'marker-end': A.end ? 'url(#' + uid + '-wa)' : null, 'marker-start': A.start ? 'url(#' + uid + '-was)' : null }));
    [a, b].forEach(function (pt) { svg.appendChild(S('circle', { cx: fmt(pt.x), cy: fmt(pt.y), r: 2.2, fill: W.arrow })); });
    if (A.label) {
      var lx = (a.x + b.x) / 2, ly = (a.y + b.y) / 2, lw = textWidth(A.label, 10.5, 600) + 10;
      svg.appendChild(S('rect', { x: fmt(lx - lw / 2), y: fmt(ly - 8), width: fmt(lw), height: 16, rx: 5, fill: T.page, stroke: W.arrow, 'stroke-width': 0.8 }));
      svg.appendChild(svgText(A.label, lx, ly + 3.7, 10.5, 600, W.arrow, { 'text-anchor': 'middle' }));
    }
  });
  return { svg: svg, refs: { nodeEls: {}, edgeEls: [], labelEls: [] } };
}

/* Registers: our own field list, or the WaveDrom "reg" bit-field list (LSB first). */
function normAccess(a) {
  var q = str(a).toUpperCase().replace(/[\s\/_-]/g, '');
  return { R: 'RO', RO: 'RO', W: 'WO', WO: 'WO', RW: 'RW', W1C: 'W1C', RW1C: 'W1C', W1S: 'W1S', RW1S: 'W1S', RC: 'RC', RS: 'RS' }[q] || q;
}
function parseBits(f) {
  var pair = function (hi, lo) { return isFinite(hi) && isFinite(lo) && hi >= 0 && lo >= 0 ? { msb: Math.max(hi, lo), lsb: Math.min(hi, lo) } : null; };
  if (f.msb !== undefined) return pair(parseInt(f.msb, 10), f.lsb !== undefined ? parseInt(f.lsb, 10) : parseInt(f.msb, 10));
  if (Array.isArray(f.bits) && f.bits.length) return pair(parseInt(f.bits[0], 10), parseInt(f.bits[f.bits.length - 1], 10));
  if (typeof f.bits === 'number') return pair(f.bits, f.bits);
  var m = str(f.bits).replace(/[\[\]\s]/g, '').match(/^(\d+)(?::(\d+))?$/);
  return m ? pair(parseInt(m[1], 10), m[2] !== undefined ? parseInt(m[2], 10) : parseInt(m[1], 10)) : null;
}
function normalizeRegisters(d, index) {
  var dg = commonFields(d, index, 'register');
  var where = '[' + (dg.title || dg.id) + '] ';
  dg.registers = [];
  (Array.isArray(d.registers) ? d.registers : []).forEach(function (r, k) {
    if (!r || typeof r !== 'object') return;
    var name = str(r.name) || ('REG' + k), width = posInt(r.width) || 0, fields = [], fromReg = [];
    if (Array.isArray(r.reg)) {
      var pos = 0;
      r.reg.forEach(function (f) {
        var n = posInt(f && f.bits) || 1;
        if (f && str(f.name)) fromReg.push({ msb: pos + n - 1, lsb: pos, name: str(f.name), access: normAccess(typeof f.attr === 'string' ? f.attr : ''), reset: '', desc: '' });
        pos += n;
      });
      if (!width) width = pos;
    }
    width = Math.min(width || 32, 128);
    var add = function (f) {
      if (f.msb >= width) { problem(where, 'regRange', { r: name, f: f.name || '?', w: width }); return; }
      if (fields.some(function (o) { return !(f.lsb > o.msb || f.msb < o.lsb); })) { problem(where, 'regOverlap', { r: name, f: f.name || '?' }); return; }
      fields.push(f);
    };
    fromReg.forEach(add);
    (Array.isArray(r.fields) ? r.fields : []).forEach(function (f) {
      if (!f || typeof f !== 'object') return;
      var range = parseBits(f);
      if (!range) { problem(where, 'regBits', { r: name, f: str(f.name) || '?' }); return; }
      add({ msb: range.msb, lsb: range.lsb, name: str(f.name), access: normAccess(f.access || f.attr), reset: str(f.reset), desc: str(f.desc) });
    });
    fields.sort(function (a, b) { return b.msb - a.msb; });
    var all = [], bit = width - 1;
    fields.forEach(function (f) {
      if (f.msb < bit) all.push({ msb: bit, lsb: f.msb + 1, reserved: true, name: '', access: '', reset: '', desc: '' });
      all.push(f);
      bit = f.lsb - 1;
    });
    if (bit >= 0) all.push({ msb: bit, lsb: 0, reserved: true, name: '', access: '', reset: '', desc: '' });
    dg.registers.push({ name: name, offset: str(r.offset), width: width, desc: str(r.desc), reset: str(r.reset), fields: all });
  });
  if (!dg.registers.length) problem(where, 'regNone');
  return dg;
}
var REG = { num: 16, box: 46, gap: 12 };
function layoutRegisters(dg) {
  var laneBits = 8;
  dg.registers.forEach(function (r) { laneBits = Math.max(laneBits, Math.min(r.width, 32)); });
  var cell = Math.max(24, Math.min(56, Math.floor(880 / laneBits))), innerW = laneBits * cell, y = 14, blocks = [];
  var tall = 46;
  dg.registers.forEach(function (r) {
    r.fields.forEach(function (f) {
      var w = (f.msb - f.lsb + 1) * cell;
      if (f.name && textWidth(f.name, 11.5, 700) > w - 8 && w < 48) tall = Math.max(tall, Math.min(96, textWidth(f.name, 10.5, 700) + 12));
    });
  });
  REG.box = Math.ceil(tall);
  dg.registers.forEach(function (r) {
    var desc = r.desc ? wrapText(r.desc, innerW, 12, 400, 3) : null;
    var headH = 24 + (desc ? desc.lines.length * 12 * LH + 2 : 0), lanes = Math.ceil(r.width / 32);
    blocks.push({ r: r, y: y, headH: headH, desc: desc, lanes: lanes });
    y += headH + lanes * (REG.num + REG.box + REG.gap) + 16;
  });
  return { cell: cell, x0: 20, innerW: innerW, blocks: blocks, width: Math.ceil(40 + innerW), height: Math.ceil(y) };
}
function drawRegisters(st, forExport) {
  var G = st.L, T = THEMES[themeName], R = T.reg, uid = st.uid + (forExport ? 'x' : '');
  var made = newSvg(st, forExport, 'Register map'), svg = made.svg;
  hatch(made.defs, uid + '-rsv', R.fills.reserved, R.hatch);
  G.blocks.forEach(function (blk) {
    var r = blk.r, x0 = G.x0, cell = G.cell;
    svg.appendChild(svgText(r.name, x0, blk.y + 16, 14.5, 750, R.text));
    var meta = [r.offset ? '@ ' + r.offset : '', r.width + '-' + t('bitsWord'), r.reset ? 'reset ' + r.reset : ''].filter(Boolean).join('   ');
    svg.appendChild(svgText(meta, x0 + textWidth(r.name, 14.5, 750) + 14, blk.y + 16, 12, 500, R.muted, { 'font-family': MONO }));
    if (blk.desc) blk.desc.lines.forEach(function (line, k) { svg.appendChild(svgText(line, x0, blk.y + 24 + k * 12 * LH + 12, 12, 400, R.muted)); });
    for (var lane = 0; lane < blk.lanes; lane++) {
      var laneTop = r.width - 1 - lane * 32, laneLow = Math.max(0, laneTop - 31);
      var ly = blk.y + blk.headH + lane * (REG.num + REG.box + REG.gap);
      var bx = function (bit) { return x0 + (laneTop - bit) * cell; };
      r.fields.forEach(function (f) {
        var hi = Math.min(f.msb, laneTop), lo = Math.max(f.lsb, laneLow);
        if (hi < lo) return;
        var x = bx(hi), w = (hi - lo + 1) * cell, top = ly + REG.num;
        var tip = (f.reserved ? t('reserved') : f.name) + ' [' + (f.msb === f.lsb ? f.msb : f.msb + ':' + f.lsb) + ']' + (f.access ? ' ' + f.access : '') + (f.reset ? ' reset=' + f.reset : '') + (f.desc ? '\n' + f.desc : '');
        var g = S('g', { class: 'reg-field' }, [S('title', { text: tip })]);
        g.appendChild(S('rect', { x: fmt(x), y: fmt(top), width: fmt(w), height: REG.box, fill: f.reserved ? 'url(#' + uid + '-rsv)' : (R.fills[f.access] || R.fills.other), stroke: R.border, 'stroke-width': 1 }));
        for (var b = hi - 1; b >= lo; b--) {
          var tx = bx(b);
          g.appendChild(S('path', { d: 'M' + fmt(tx) + ',' + fmt(top) + 'v5M' + fmt(tx) + ',' + fmt(top + REG.box) + 'v-5', stroke: R.border, 'stroke-width': 1 }));
        }
        g.appendChild(svgText(String(hi), x + cell / 2, ly + 11, 10, 500, R.muted, { 'text-anchor': 'middle', 'font-family': MONO }));
        if (lo !== hi) g.appendChild(svgText(String(lo), x + w - cell / 2, ly + 11, 10, 500, R.muted, { 'text-anchor': 'middle', 'font-family': MONO }));
        if (!f.reserved && f.name) {
          var cx = x + w / 2, cy = top + REG.box / 2;
          if (textWidth(f.name, 11.5, 700) <= w - 8) {
            g.appendChild(svgText(f.name, cx, cy + (f.access && w >= 30 ? -1 : 4), 11.5, 700, R.text, { 'text-anchor': 'middle' }));
            if (f.access && w >= 30) g.appendChild(svgText(f.access, cx, cy + 13, 9.5, 600, R.muted, { 'text-anchor': 'middle' }));
          } else if (w < 48) {
            g.appendChild(svgText(fitText(f.name, REG.box - 6, 10.5, 700), cx + 3.6, cy, 10.5, 700, R.text, { 'text-anchor': 'middle', transform: 'rotate(-90 ' + fmt(cx + 3.6) + ' ' + fmt(cy) + ')' }));
          } else {
            g.appendChild(svgText(fitText(f.name, w - 8, 11.5, 700), cx, cy + 4, 11.5, 700, R.text, { 'text-anchor': 'middle' }));
          }
        }
        svg.appendChild(g);
      });
    }
  });
  return { svg: svg, refs: { nodeEls: {}, edgeEls: [], labelEls: [] } };
}

/* Address maps: regions with a base and a size (or end); unmapped gaps are filled in. */
function normalizeMemory(d, index) {
  var dg = commonFields(d, index, 'memory');
  var where = '[' + (dg.title || dg.id) + '] ', regions = [];
  (Array.isArray(d.regions) ? d.regions : []).forEach(function (m, k) {
    if (!m || typeof m !== 'object') return;
    var name = str(m.name) || ('region ' + (k + 1));
    var base = parseNum(m.base), size = m.size !== undefined ? parseSize(m.size) : NaN, end = m.end !== undefined ? parseNum(m.end) : NaN;
    if (!isFinite(size) && isFinite(end)) size = end - base + 1;
    if (!isFinite(base) || !isFinite(size) || size <= 0) { problem(where, 'memBad', { r: name }); return; }
    regions.push({ name: name, base: base, size: size, end: base + size - 1, desc: str(m.desc), color: PALETTE[m.color] ? m.color : 'blue' });
  });
  regions.sort(function (a, b) { return a.base - b.base; });
  for (var i = 1; i < regions.length; i++) {
    if (regions[i].base <= regions[i - 1].end) problem(where, 'memOverlap', { r: regions[i].name, o: regions[i - 1].name });
  }
  var digits = 8;
  regions.forEach(function (r) { digits = Math.max(digits, r.end.toString(16).length); });
  dg.digits = Math.ceil(digits / 4) * 4;
  dg.items = [];
  regions.forEach(function (r, j) {
    var before = regions[j - 1];
    if (before && r.base > before.end + 1 && d.gaps !== false) dg.items.push({ gap: true, base: before.end + 1, end: r.base - 1, size: r.base - before.end - 1 });
    dg.items.push(r);
  });
  if (!regions.length) problem(where, 'memNone');
  return dg;
}
function layoutMemory(dg) {
  var addrW = monoWidth(hexAddr(0, dg.digits), 11.5) + 22, boxW = 400, y = 16, rows = [];
  dg.items.slice().reverse().forEach(function (it) {
    var h = it.gap ? 30 : (it.desc ? 58 : 42);
    rows.push({ it: it, y: y, h: h });
    y += h;
  });
  return { addrW: addrW, boxX: 16 + addrW, boxW: boxW, rows: rows, width: Math.ceil(16 + addrW + boxW + 20), height: Math.ceil(y + 18) };
}
function drawMemory(st, forExport) {
  var dg = st.d, G = st.L, T = THEMES[themeName], R = T.reg, uid = st.uid + (forExport ? 'x' : '');
  var made = newSvg(st, forExport, 'Address map'), svg = made.svg;
  hatch(made.defs, uid + '-gap', R.fills.reserved, R.hatch);
  G.rows.forEach(function (row, k) {
    var it = row.it, x = G.boxX, w = G.boxW;
    var g = S('g', { class: 'mem-region' }, [S('title', { text: (it.gap ? t('unmapped') : it.name) + '\n' + hexAddr(it.base, dg.digits) + ' – ' + hexAddr(it.end, dg.digits) + ' (' + formatSize(it.size) + ')' + (it.desc ? '\n' + it.desc : '') })]);
    if (it.gap) {
      g.appendChild(S('rect', { x: x, y: fmt(row.y), width: w, height: row.h, fill: 'url(#' + uid + '-gap)', stroke: R.border, 'stroke-width': 1 }));
      g.appendChild(svgText(t('unmapped') + ' · ' + formatSize(it.size), x + w / 2, row.y + row.h / 2 + 4, 11, 500, R.muted, { 'text-anchor': 'middle', 'font-style': 'italic' }));
    } else {
      var c = PALETTE[it.color];
      g.appendChild(S('rect', { x: x, y: fmt(row.y), width: w, height: row.h, fill: mix(c, T.page, themeName === 'dark' ? 0.78 : 0.88), stroke: R.border, 'stroke-width': 1 }));
      g.appendChild(S('rect', { x: x, y: fmt(row.y), width: 6, height: row.h, fill: c }));
      g.appendChild(svgText(fitText(it.name, w - 120, 13, 700), x + 16, row.y + 18, 13, 700, R.text));
      g.appendChild(svgText(formatSize(it.size), x + w - 10, row.y + 18, 11.5, 600, R.muted, { 'text-anchor': 'end' }));
      if (it.desc) g.appendChild(svgText(fitText(it.desc, w - 28, 11.5, 400), x + 16, row.y + 38, 11.5, 400, R.muted));
    }
    g.appendChild(svgText(hexAddr(it.base, dg.digits), x - 8, row.y + row.h - 3, 11, 500, R.muted, { 'text-anchor': 'end', 'font-family': MONO }));
    if (k === 0) g.appendChild(svgText(hexAddr(it.end, dg.digits), x - 8, row.y + 11, 11, 500, R.muted, { 'text-anchor': 'end', 'font-family': MONO }));
    svg.appendChild(g);
  });
  return { svg: svg, refs: { nodeEls: {}, edgeEls: [], labelEls: [] } };
}

/* Chip block diagrams in datasheet style: block columns hang off vertical bus spines inside a chip outline. */
var CHIP = { row: 38, gap: 12, busW: 26, busGap: 54, blockGap: 64, pad: 22 };
function normalizeChip(d, index) {
  var dg = commonFields(d, index, 'chip');
  var where = '[' + (dg.title || dg.id) + '] ';
  var domains = {};
  (Array.isArray(d.domains) ? d.domains : []).forEach(function (g) {
    if (g && str(g.id)) domains[str(g.id)] = { id: str(g.id), label: str(g.label) || str(g.id), color: PALETTE[g.color] ? g.color : 'slate' };
  });
  var byId = {}, columns = [];
  (Array.isArray(d.columns) ? d.columns : []).forEach(function (c, ci) {
    if (!c || typeof c !== 'object') return;
    if (c.bus !== undefined) { columns.push({ kind: 'bus', label: str(c.bus), id: str(c.id) || ('bus' + ci), style: c.style === 'matrix' ? 'matrix' : 'bar' }); return; }
    var col = { kind: 'blocks', blocks: [] };
    (Array.isArray(c.blocks) ? c.blocks : []).forEach(function (b, bi) {
      if (!b || !str(b.title)) return;
      var id = str(b.id) || str(b.title);
      if (byId[id]) id = id + '-' + ci + '-' + bi;
      var pinDir = ['in', 'out', 'both'].indexOf(b.pinDir || b.pin_dir) >= 0 ? (b.pinDir || b.pin_dir) : 'both';
      var blk = {
        id: id, title: str(b.title), sub: str(b.sub || b.desc), rows: Math.max(1, Math.min(12, posInt(b.rows) || 1)),
        row: b.row !== undefined && isFinite(+b.row) ? Math.max(0, Math.floor(+b.row)) : null,
        domain: domains[str(b.domain)] ? str(b.domain) : null, color: PALETTE[b.color] ? b.color : null,
        multi: Math.max(1, Math.min(4, posInt(b.multi) || 1)), pins: (Array.isArray(b.pins) ? b.pins : (b.pins ? [b.pins] : [])).map(str).filter(Boolean),
        pinDir: pinDir, link: ['left', 'right', 'both', 'none'].indexOf(b.link) >= 0 ? b.link : null, col: columns.length
      };
      byId[id] = blk;
      col.blocks.push(blk);
    });
    columns.push(col);
  });
  dg.columns = columns;
  dg.blockById = byId;
  dg.domains = Object.keys(domains).map(function (k) { return domains[k]; });
  dg.domainById = domains;
  dg.domainLabel = str(d.domain_label || d.domainLabel);
  dg.chip = str(d.chip);
  dg.links = (Array.isArray(d.links) ? d.links : []).filter(function (l) { return l && byId[str(l.from)] && byId[str(l.to)]; }).map(function (l) {
    return { from: str(l.from), to: str(l.to), label: str(l.label), dir: ['back', 'both', 'none'].indexOf(l.dir) >= 0 ? l.dir : 'forward' };
  });
  if (!Object.keys(byId).length) problem(where, 'noNodes');
  return dg;
}
function layoutChip(dg) {
  var cols = dg.columns, x = 0, maxRow = 0;
  cols.forEach(function (c) {
    if (c.kind === 'bus') { c.w = CHIP.busW; return; }
    var cursor = 0, w = 110;
    c.blocks.forEach(function (b) {
      b.r0 = b.row !== null ? b.row : cursor;
      cursor = b.r0 + b.rows;
      maxRow = Math.max(maxRow, cursor);
      w = Math.max(w, textWidth(b.title, 13, 700) + 30 + (b.multi > 1 ? 8 : 0), b.sub ? textWidth(b.sub, 11, 400) + 26 : 0);
    });
    c.w = Math.min(Math.ceil(w), 240);
  });
  var pinFont = 11, pinLine = 14;
  function pinLines(b) {
    if (b.pins.length <= 3) return b.pins;
    var lines = [], cur = '';
    b.pins.forEach(function (pn) {
      var cand = cur ? cur + ', ' + pn : pn;
      if (cur && cand.length > 24) { lines.push(cur + ','); cur = pn; } else cur = cand;
    });
    if (cur) lines.push(cur);
    return lines;
  }
  var leftW = 0, rightW = 0, firstBlocks = null, lastBlocks = null;
  cols.forEach(function (c, i) {
    if (c.kind !== 'blocks') return;
    if (firstBlocks === null) firstBlocks = i;
    lastBlocks = i;
  });
  cols.forEach(function (c, i) {
    if (c.kind !== 'blocks') return;
    c.blocks.forEach(function (b) {
      if (!b.pins.length) return;
      b.pinText = pinLines(b);
      var wmax = 0;
      b.pinText.forEach(function (l) { wmax = Math.max(wmax, textWidth(l, pinFont, 500)); });
      if (i === firstBlocks && i !== lastBlocks) { b.pinSide = 'left'; leftW = Math.max(leftW, wmax); }
      else if (i === lastBlocks && i !== firstBlocks) { b.pinSide = 'right'; rightW = Math.max(rightW, wmax); }
      else if (i === firstBlocks) { b.pinSide = 'left'; leftW = Math.max(leftW, wmax); }
    });
  });
  var headH = dg.chip ? 26 : 0;
  var outlineX = 16 + (leftW ? leftW + 28 : 0), top = 16 + headH + CHIP.pad + 8;
  x = outlineX + CHIP.pad + (leftW ? 36 : 0);
  cols.forEach(function (c, i) {
    c.x = x;
    var next = cols[i + 1];
    if (next) x += c.w + ((c.kind === 'bus' || next.kind === 'bus') ? CHIP.busGap : CHIP.blockGap);
    else x += c.w;
  });
  var outlineW = x + CHIP.pad + (rightW ? 36 : 0) - outlineX;
  var yOf = function (r) { return top + r * (CHIP.row + CHIP.gap); };
  cols.forEach(function (c) {
    if (c.kind !== 'blocks') return;
    c.blocks.forEach(function (b) {
      b.x = c.x; b.w = c.w; b.y = yOf(b.r0); b.h = b.rows * CHIP.row + (b.rows - 1) * CHIP.gap;
      b.cy = b.y + b.h / 2;
    });
  });
  cols.forEach(function (c, i) {
    if (c.kind !== 'bus') return;
    c.links = [];
    [i - 1, i + 1].forEach(function (j) {
      var nb = cols[j];
      if (!nb || nb.kind !== 'blocks') return;
      nb.blocks.forEach(function (b) {
        var side = j < i ? 'right' : 'left';
        var otherBus = cols[j < i ? j - 1 : j + 1];
        var wants = b.link || (otherBus && otherBus.kind === 'bus' ? (j < i ? 'right' : 'none') : (j < i ? 'right' : 'left'));
        if (wants === 'both' || wants === side) c.links.push(b);
      });
    });
    var ys = c.links.map(function (b) { return [b.y, b.y + b.h]; });
    c.y1 = ys.length ? Math.min.apply(null, ys.map(function (v) { return v[0]; })) - 6 : top;
    c.y2 = ys.length ? Math.max.apply(null, ys.map(function (v) { return v[1]; })) + 6 : yOf(maxRow);
  });
  var bottom = yOf(maxRow) - CHIP.gap;
  var outlineY = top - CHIP.pad - 8, outlineH = bottom + CHIP.pad - outlineY;
  var legendH = dg.domains.length ? 34 : 0;
  return {
    cols: cols, outlineX: outlineX, outlineY: outlineY, outlineW: outlineW, outlineH: outlineH, headH: headH, pinLine: pinLine,
    legendY: outlineY + outlineH + 24, width: Math.ceil(outlineX + outlineW + (rightW ? rightW + 28 : 0) + 16),
    height: Math.ceil(outlineY + outlineH + legendH + 22)
  };
}
function fatArrow(x1, x2, y, heads, T) {
  var len = Math.abs(x2 - x1), dirn = x2 >= x1 ? 1 : -1, sh = 5, hh = 11, hl = Math.min(12, len / 3);
  var L = Math.min(x1, x2), R = Math.max(x1, x2);
  var left = heads === 'both' || (heads === 'end' && dirn < 0) || (heads === 'start' && dirn > 0);
  var right = heads === 'both' || (heads === 'end' && dirn > 0) || (heads === 'start' && dirn < 0);
  var pts = [];
  if (left) pts.push([L, y], [L + hl, y - hh], [L + hl, y - sh]); else pts.push([L, y - sh]);
  if (right) pts.push([R - hl, y - sh], [R - hl, y - hh], [R, y], [R - hl, y + hh], [R - hl, y + sh]); else pts.push([R, y - sh], [R, y + sh]);
  if (left) pts.push([L + hl, y + sh], [L + hl, y + hh]); else pts.push([L, y + sh]);
  return S('polygon', { points: pts.map(function (q) { return fmt(q[0]) + ',' + fmt(q[1]); }).join(' '), fill: T.page, stroke: T.ink, 'stroke-width': 1.2, 'stroke-linejoin': 'round' });
}
function drawChip(st, forExport) {
  var dg = st.d, G = st.L, T = THEMES[themeName], uid = st.uid + (forExport ? 'x' : '');
  var made = newSvg(st, forExport, 'Chip block diagram'), svg = made.svg;
  made.defs.appendChild(S('marker', { id: uid + '-ca', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, markerUnits: 'userSpaceOnUse', orient: 'auto' }, [S('path', { d: 'M0,1 L10,5 L0,9 Z', fill: T.ink })]));
  made.defs.appendChild(S('marker', { id: uid + '-cs', viewBox: '0 0 10 10', refX: 1, refY: 5, markerWidth: 8, markerHeight: 8, markerUnits: 'userSpaceOnUse', orient: 'auto' }, [S('path', { d: 'M10,1 L0,5 L10,9 Z', fill: T.ink })]));
  var muted = T.reg.muted;
  if (dg.chip) svg.appendChild(svgText(dg.chip, G.outlineX, 30, 15, 750, T.ink));
  svg.appendChild(S('rect', { x: fmt(G.outlineX), y: fmt(G.outlineY), width: fmt(G.outlineW), height: fmt(G.outlineH), fill: 'none', stroke: T.ink, 'stroke-width': 1.4 }));
  G.cols.forEach(function (c) {
    if (c.kind !== 'blocks') return;
    var run = null;
    c.blocks.concat([null]).forEach(function (b) {
      if (run && (!b || b.domain !== run.domain || b.r0 !== run.end)) {
        var dom = dg.domainById[run.domain];
        svg.appendChild(S('rect', { x: fmt(c.x - 7), y: fmt(run.y - 7), width: fmt(c.w + 14), height: fmt(run.y2 - run.y + 14), fill: mix(PALETTE[dom.color], T.page, themeName === 'dark' ? 0.7 : 0.72) }));
        run = null;
      }
      if (b && b.domain) {
        if (!run) run = { domain: b.domain, y: b.y, y2: b.y + b.h, end: b.r0 + b.rows };
        else { run.y2 = b.y + b.h; run.end = b.r0 + b.rows; }
      }
    });
  });
  G.cols.forEach(function (c) {
    if (c.kind !== 'bus') return;
    var x = c.x, w = c.w, y1 = c.y1, y2 = c.y2, cy = (y1 + y2) / 2;
    if (c.style === 'matrix') {
      svg.appendChild(S('polygon', { points: [[x, y1 + 18], [x + w, y1], [x + w, y2], [x, y2 - 18]].map(function (q) { return fmt(q[0]) + ',' + fmt(q[1]); }).join(' '), fill: T.page, stroke: T.ink, 'stroke-width': 1.2 }));
    } else {
      svg.appendChild(S('rect', { x: fmt(x), y: fmt(y1), width: w, height: fmt(y2 - y1), fill: T.page, stroke: T.ink, 'stroke-width': 1.2 }));
    }
    svg.appendChild(svgText(c.label, x + w / 2 + 4.5, cy, 12.5, 600, T.ink, { 'text-anchor': 'middle', transform: 'rotate(-90 ' + fmt(x + w / 2 + 4.5) + ' ' + fmt(cy) + ')' }));
    c.links.forEach(function (b) {
      var fromX = b.x + b.w <= x ? b.x + b.w : b.x, toX = b.x + b.w <= x ? x : x + w;
      svg.appendChild(fatArrow(fromX + (fromX < toX ? 3 : -3), toX + (fromX < toX ? -3 : 3), b.cy, 'both', T));
    });
  });
  G.cols.forEach(function (c) {
    if (c.kind !== 'blocks') return;
    c.blocks.forEach(function (b) {
      var g = S('g', { class: 'chip-block' }, [S('title', { text: b.title + (b.sub ? '\n' + b.sub : '') })]);
      var fill = b.color ? mix(PALETTE[b.color], T.page, themeName === 'dark' ? 0.72 : 0.84) : T.page;
      for (var k = Math.min(b.multi, 3) - 1; k >= 1; k--) {
        g.appendChild(S('rect', { x: fmt(b.x + k * 4), y: fmt(b.y + k * 4), width: fmt(b.w), height: fmt(b.h), fill: fill, stroke: T.ink, 'stroke-width': 1 }));
      }
      g.appendChild(S('rect', { x: fmt(b.x), y: fmt(b.y), width: fmt(b.w), height: fmt(b.h), fill: fill, stroke: T.ink, 'stroke-width': 1.2 }));
      var ty = b.cy + (b.sub ? -3 : 4.5);
      g.appendChild(svgText(fitText(b.title, b.w - 10, 13, 650), b.x + b.w / 2, ty, 13, 650, T.ink, { 'text-anchor': 'middle' }));
      if (b.sub) g.appendChild(svgText(fitText(b.sub, b.w - 10, 11, 400), b.x + b.w / 2, ty + 15, 11, 400, muted, { 'text-anchor': 'middle' }));
      if (b.pinSide) {
        var left = b.pinSide === 'left', edgeX = left ? G.outlineX : G.outlineX + G.outlineW;
        var bx = left ? b.x : b.x + b.w, single = b.pins.length === 1 && b.pinDir !== 'both';
        if (single) {
          var inward = b.pinDir === 'in';
          var sx = inward ? edgeX : bx, ex = inward ? bx : edgeX;
          g.appendChild(S('path', { d: 'M' + fmt(sx + (sx < ex ? 5 : -5)) + ',' + fmt(b.cy) + 'L' + fmt(ex + (sx < ex ? -2 : 2)) + ',' + fmt(b.cy), stroke: T.ink, 'stroke-width': 1.3, 'marker-end': 'url(#' + uid + '-ca)' }));
        } else {
          var heads = b.pinDir === 'both' ? 'both' : (b.pinDir === 'in' ? (left ? 'end' : 'start') : (left ? 'start' : 'end'));
          g.appendChild(fatArrow(left ? edgeX + 5 : bx + 3, left ? bx - 3 : edgeX - 5, b.cy, heads, T));
        }
        g.appendChild(S('rect', { x: fmt(edgeX - 4.5), y: fmt(b.cy - 4.5), width: 9, height: 9, fill: T.page, stroke: T.ink, 'stroke-width': 1.1 }));
        var lines = b.pinText, lh = G.pinLine, y0 = b.cy - (lines.length - 1) * lh / 2 + 4;
        lines.forEach(function (line, k) {
          g.appendChild(svgText(line, left ? edgeX - 12 : edgeX + 12, y0 + k * lh, 11, 500, T.ink, left ? { 'text-anchor': 'end' } : null));
        });
      }
      svg.appendChild(g);
    });
  });
  dg.links.forEach(function (ln) {
    var a = dg.blockById[ln.from], b = dg.blockById[ln.to], d;
    var lx, ly;
    var ay = a.cy + Math.min(12, a.h / 4), by2 = b.cy + Math.min(12, b.h / 4);
    if (a.col === b.col) {
      var rx = a.x + a.w + 12;
      d = 'M' + fmt(a.x + a.w) + ',' + fmt(ay) + 'H' + fmt(rx) + 'V' + fmt(by2) + 'H' + fmt(b.x + b.w + 2);
      lx = rx + 4; ly = (ay + by2) / 2 + 4;
    } else {
      var toRight = b.x > a.x, sx = toRight ? a.x + a.w : a.x, ex = toRight ? b.x : b.x + b.w, mx = (sx + ex) / 2;
      d = 'M' + fmt(sx) + ',' + fmt(ay) + 'H' + fmt(mx) + 'V' + fmt(by2) + 'H' + fmt(ex + (toRight ? -2 : 2));
      lx = mx + 4; ly = (ay + by2) / 2 + 4;
    }
    svg.appendChild(S('path', { d: d, fill: 'none', stroke: T.ink, 'stroke-width': 1.2,
      'marker-end': ln.dir === 'forward' || ln.dir === 'both' ? 'url(#' + uid + '-ca)' : null, 'marker-start': ln.dir === 'back' || ln.dir === 'both' ? 'url(#' + uid + '-cs)' : null }));
    if (ln.label) {
      var lw = textWidth(ln.label, 10.5, 600) + 8;
      svg.appendChild(S('rect', { x: fmt(lx - 2), y: fmt(ly - 11), width: fmt(lw), height: 15, rx: 3, fill: T.page }));
      svg.appendChild(svgText(ln.label, lx + 2, ly, 10.5, 600, muted));
    }
  });
  if (dg.domains.length) {
    var lx = G.outlineX, ly = G.legendY;
    var head = (dg.domainLabel || (lang === 'vi' ? 'Miền nguồn' : 'Power domain')) + ':';
    svg.appendChild(svgText(head, lx, ly + 4, 12.5, 600, T.ink));
    lx += textWidth(head, 12.5, 600) + 16;
    dg.domains.forEach(function (dm) {
      svg.appendChild(S('rect', { x: fmt(lx), y: fmt(ly - 8), width: 40, height: 16, fill: mix(PALETTE[dm.color], T.page, themeName === 'dark' ? 0.7 : 0.72) }));
      svg.appendChild(svgText(dm.label, lx + 48, ly + 4, 12, 500, T.ink));
      lx += 48 + textWidth(dm.label, 12, 500) + 28;
    });
  }
  return { svg: svg, refs: { nodeEls: {}, edgeEls: [], labelEls: [] } };
}

/* Package pinouts: quad (QFP, QFN), dual (DIP, SOIC, TSSOP) and ball-grid (BGA) packages, top view. */
var PIN_TYPES = { io: 'slate', power: 'red', ground: 'slate', analog: 'violet', clock: 'amber', reset: 'red', debug: 'teal', config: 'blue', nc: 'slate' };
function pinFill(type, T) {
  if (type === 'io' || !type) return T.page;
  if (type === 'ground') return mix(PALETTE.slate, T.page, themeName === 'dark' ? 0.45 : 0.6);
  if (type === 'reset') return mix('#be123c', T.page, themeName === 'dark' ? 0.65 : 0.8);
  return mix(PALETTE[PIN_TYPES[type]] || PALETTE.slate, T.page, themeName === 'dark' ? 0.65 : 0.8);
}
function normalizePinout(d, index) {
  var dg = commonFields(d, index, 'pinout');
  var where = '[' + (dg.title || dg.id) + '] ';
  var pkg = d.package, style = '', total = 0, rows = 0, cols = 0, name = '';
  if (typeof pkg === 'string') {
    name = pkg;
    var m = pkg.replace(/[\s-]/g, '').match(/^([A-Za-z]+?)(\d+)$/);
    var fam = m ? m[1].toUpperCase() : '';
    total = m ? parseInt(m[2], 10) : 0;
    style = /QFP/.test(fam) ? 'qfp' : /QFN|MLF|LGA/.test(fam) ? 'qfn' : /BGA|CSP/.test(fam) ? 'bga' : /DIP|SO|SSOP|TSSOP|MSOP|DFN|SOP/.test(fam) ? 'dual' : 'qfp';
  } else if (pkg && typeof pkg === 'object') {
    style = { qfp: 'qfp', qfn: 'qfn', dip: 'dual', soic: 'dual', bga: 'bga' }[str(pkg.style).toLowerCase()] || 'qfp';
    total = posInt(pkg.pins) || 0; rows = posInt(pkg.rows) || 0; cols = posInt(pkg.cols) || 0;
    name = str(pkg.name) || (str(pkg.style).toUpperCase() + (total || ''));
  }
  var pins = [];
  (Array.isArray(d.pins) ? d.pins : []).forEach(function (p, i) {
    if (typeof p === 'string') { pins.push({ n: i + 1, name: p, type: '', desc: '', alt: '' }); return; }
    if (!p || typeof p !== 'object') return;
    pins.push({ n: p.ball !== undefined ? str(p.ball).toUpperCase() : (posInt(p.n) || i + 1), name: str(p.name), type: PIN_TYPES[p.type] ? p.type : '', desc: str(p.desc), alt: Array.isArray(p.alt) ? p.alt.map(str).join(', ') : str(p.alt) });
  });
  pins.forEach(function (p) {
    if (!p.type) {
      var up = p.name.toUpperCase();
      p.type = /^(VDD|VCC|VBAT|AVDD|DVDD|VREF|VDDA|VDDIO|VCORE)/.test(up) ? 'power' : /^(VSS|GND|AVSS|DVSS|VSSA)/.test(up) ? 'ground' : /^(NC|N\/C|DNC)$/.test(up) ? 'nc' : /^(NRST|RST|RESET|NRESET)/.test(up) ? 'reset' : 'io';
    }
  });
  if (style === 'bga') {
    var letters = 'ABCDEFGHJKLMNPRTUVWY';
    pins.forEach(function (p) {
      var m2 = String(p.n).match(/^([A-Z]+)(\d+)$/);
      if (!m2) return;
      p.r = letters.indexOf(m2[1]); p.c = parseInt(m2[2], 10) - 1;
      rows = Math.max(rows, p.r + 1); cols = Math.max(cols, p.c + 1);
    });
    dg.letters = letters;
  } else {
    if (!total) total = pins.reduce(function (mx, p) { return Math.max(mx, +p.n || 0); }, 0);
    if (style === 'qfp' || style === 'qfn') total = Math.ceil(total / 4) * 4; else total = Math.ceil(total / 2) * 2;
    var byN = {};
    pins.forEach(function (p) { byN[p.n] = p; });
    for (var k = 1; k <= total; k++) if (!byN[k]) pins.push({ n: k, name: 'NC', type: 'nc', desc: '', alt: '' });
    pins.sort(function (a, b) { return a.n - b.n; });
  }
  if (!pins.length) problem(where, 'noNodes');
  dg.pkg = { style: style, total: total, rows: rows, cols: cols, name: name };
  dg.pins = pins;
  dg.chip = str(d.chip);
  dg.view = str(d.view);
  return dg;
}
function layoutPinout(dg) {
  var P = dg.pkg, G = { pitch: 21, lead: P.style === 'qfn' ? 0 : 9 };
  var nameW = 0;
  dg.pins.forEach(function (p) { nameW = Math.max(nameW, textWidth(p.name, 11.5, 500)); });
  G.nameW = Math.ceil(nameW) + 10;
  if (P.style === 'bga') {
    G.cell = 52;
    G.x0 = 40; G.y0 = 40;
    G.width = Math.ceil(G.x0 + P.cols * G.cell + 24); G.height = Math.ceil(G.y0 + P.rows * G.cell + 64);
    return G;
  }
  if (P.style === 'dual') {
    var per = P.total / 2;
    G.bodyW = 150; G.bodyH = per * G.pitch + 28;
    G.bodyX = 20 + G.nameW + G.lead + 22; G.bodyY = 30;
    G.width = Math.ceil(G.bodyX + G.bodyW + G.lead + 22 + G.nameW + 20); G.height = Math.ceil(G.bodyY + G.bodyH + 40);
    return G;
  }
  var side = P.total / 4;
  G.body = side * G.pitch + 44;
  G.bodyX = 20 + G.nameW + G.lead + 22; G.bodyY = 20 + G.nameW + G.lead + 22;
  G.width = Math.ceil(G.bodyX * 2 + G.body); G.height = Math.ceil(G.bodyY * 2 + G.body);
  return G;
}
function drawPinout(st, forExport) {
  var dg = st.d, G = st.L, P = dg.pkg, T = THEMES[themeName], muted = T.reg.muted, uid = st.uid + (forExport ? 'x' : '');
  var made = newSvg(st, forExport, 'Pinout'), svg = made.svg;
  hatch(made.defs, uid + '-nc', T.page, T.reg.hatch);
  var fillOf = function (p) { return p.type === 'nc' ? 'url(#' + uid + '-nc)' : pinFill(p.type, T); };
  var tip = function (p) { return p.n + ': ' + p.name + (p.type && p.type !== 'io' ? ' (' + p.type + ')' : '') + (p.alt ? '\n' + p.alt : '') + (p.desc ? '\n' + p.desc : ''); };
  var center = function (cx, cy) {
    var lines = [[dg.chip, 17, 700, T.ink], [P.name, 14, 600, T.ink], [dg.view || (lang === 'vi' ? 'Nhìn từ trên' : 'Top view'), 11.5, 500, muted]].filter(function (l) { return l[0]; });
    var y = cy - (lines.length - 1) * 11;
    lines.forEach(function (l) { svg.appendChild(svgText(l[0], cx, y, l[1], l[2], l[3], { 'text-anchor': 'middle' })); y += 22; });
  };
  if (P.style === 'bga') {
    for (var c = 0; c < P.cols; c++) svg.appendChild(svgText(String(c + 1), G.x0 + c * G.cell + G.cell / 2, G.y0 - 12, 11, 600, muted, { 'text-anchor': 'middle' }));
    for (var r = 0; r < P.rows; r++) svg.appendChild(svgText(dg.letters.charAt(r), G.x0 - 14, G.y0 + r * G.cell + G.cell / 2 + 4, 11, 600, muted, { 'text-anchor': 'middle' }));
    dg.pins.forEach(function (p) {
      if (p.r === undefined || p.r < 0) return;
      var cx = G.x0 + p.c * G.cell + G.cell / 2, cy = G.y0 + p.r * G.cell + G.cell / 2;
      var g = S('g', {}, [S('title', { text: tip(p) })]);
      g.appendChild(S('rect', { x: fmt(cx - G.cell / 2 + 2), y: fmt(cy - G.cell / 2 + 2), width: G.cell - 4, height: G.cell - 4, rx: 7, fill: fillOf(p), stroke: T.reg.border, 'stroke-width': 1 }));
      g.appendChild(svgText(fitText(p.name, G.cell - 8, 10, 600), cx, cy + 2, 10, 600, T.ink, { 'text-anchor': 'middle' }));
      g.appendChild(svgText(String(p.n), cx, cy + 15, 8.5, 500, muted, { 'text-anchor': 'middle' }));
      svg.appendChild(g);
    });
    center(G.width / 2, G.y0 + P.rows * G.cell + 30);
    return { svg: svg, refs: { nodeEls: {}, edgeEls: [], labelEls: [] } };
  }
  var bx = G.bodyX, by = G.bodyY, pad = 22;
  var place = [];
  if (P.style === 'dual') {
    var per = P.total / 2;
    svg.appendChild(S('rect', { x: fmt(bx), y: fmt(by), width: G.bodyW, height: fmt(G.bodyH), rx: 6, fill: themeName === 'dark' ? '#1b2436' : '#f8fafc', stroke: T.ink, 'stroke-width': 1.4 }));
    svg.appendChild(S('path', { d: 'M' + fmt(bx + G.bodyW / 2 - 12) + ',' + fmt(by) + 'A12,12 0 0 0 ' + fmt(bx + G.bodyW / 2 + 12) + ',' + fmt(by), fill: 'none', stroke: T.ink, 'stroke-width': 1.2 }));
    dg.pins.forEach(function (p, i) {
      if (i < per) place.push({ p: p, side: 'L', x: bx, y: by + 14 + (i + 0.5) * G.pitch });
      else place.push({ p: p, side: 'R', x: bx + G.bodyW, y: by + 14 + (P.total - 1 - i + 0.5) * G.pitch });
    });
    svg.appendChild(S('circle', { cx: fmt(bx + 14), cy: fmt(by + 14), r: 4, fill: T.ink }));
    center(bx + G.bodyW / 2, by + G.bodyH / 2);
  } else {
    var side = P.total / 4, B = G.body, ch = 16;
    svg.appendChild(S('polygon', { points: [[bx + ch, by], [bx + B - ch, by], [bx + B, by + ch], [bx + B, by + B - ch], [bx + B - ch, by + B], [bx + ch, by + B], [bx, by + B - ch], [bx, by + ch]].map(function (q) { return fmt(q[0]) + ',' + fmt(q[1]); }).join(' '),
      fill: themeName === 'dark' ? '#1b2436' : '#f8fafc', stroke: T.ink, 'stroke-width': 1.4 }));
    svg.appendChild(S('circle', { cx: fmt(bx + 26), cy: fmt(by + 26), r: 4.5, fill: T.ink }));
    dg.pins.forEach(function (p, i) {
      var k = i % side, s2 = Math.floor(i / side), off = pad + (k + 0.5) * G.pitch;
      if (s2 === 0) place.push({ p: p, side: 'L', x: bx, y: by + off });
      else if (s2 === 1) place.push({ p: p, side: 'B', x: bx + off, y: by + B });
      else if (s2 === 2) place.push({ p: p, side: 'R', x: bx + B, y: by + B - off });
      else place.push({ p: p, side: 'T', x: bx + B - off, y: by });
    });
    center(bx + B / 2, by + B / 2);
  }
  var L = G.lead, sq = 11;
  place.forEach(function (q) {
    var p = q.p, g = S('g', { class: 'pin' }, [S('title', { text: tip(p) })]);
    var horiz = q.side === 'L' || q.side === 'R', outward = q.side === 'L' || q.side === 'T' ? -1 : 1;
    var lx = horiz ? q.x + outward * (L + sq / 2) : q.x, ly = horiz ? q.y : q.y + outward * (L + sq / 2);
    if (L) g.appendChild(S('line', { x1: fmt(q.x), y1: fmt(q.y), x2: fmt(horiz ? q.x + outward * L : q.x), y2: fmt(horiz ? q.y : q.y + outward * L), stroke: T.ink, 'stroke-width': 1 }));
    g.appendChild(S('rect', { x: fmt(lx - sq / 2), y: fmt(ly - sq / 2), width: sq, height: sq, fill: fillOf(p), stroke: T.ink, 'stroke-width': 1 }));
    var nx = horiz ? q.x - outward * 5 : q.x, ny = horiz ? q.y + 3.5 : q.y - outward * 6;
    var numAttrs = horiz ? { 'text-anchor': outward < 0 ? 'start' : 'end' } : { 'text-anchor': outward < 0 ? 'end' : 'start', transform: 'rotate(-90 ' + fmt(nx + 3.5) + ' ' + fmt(ny) + ')' };
    g.appendChild(svgText(String(p.n), horiz ? nx : nx + 3.5, ny, 9.5, 500, muted, numAttrs));
    var tx = horiz ? lx + outward * (sq / 2 + 5) : lx, ty = horiz ? ly + 4 : ly + outward * (sq / 2 + 5);
    var nameAttrs = horiz ? { 'text-anchor': outward < 0 ? 'end' : 'start' } : { 'text-anchor': outward < 0 ? 'start' : 'end', transform: 'rotate(-90 ' + fmt(tx + 4) + ' ' + fmt(ty) + ')' };
    g.appendChild(svgText(p.name, horiz ? tx : tx + 4, ty, 11.5, 500, T.ink, nameAttrs));
    svg.appendChild(g);
  });
  return { svg: svg, refs: { nodeEls: {}, edgeEls: [], labelEls: [] } };
}

function dataTable(title, cols, rows, monoCols) {
  var wrap = H('div', { class: 'tbl-wrap' });
  if (title) wrap.appendChild(H('h3', { text: title }));
  var table = H('table', { class: 'data' });
  table.appendChild(H('thead', {}, [H('tr', {}, cols.map(function (c) { return H('th', { text: c }); }))]));
  var body = H('tbody');
  rows.forEach(function (r) {
    body.appendChild(H('tr', { class: r.cls || null }, r.cells.map(function (v, i) { return H('td', { class: monoCols.indexOf(i) >= 0 ? 'mono' : null, text: v }); })));
  });
  table.appendChild(body);
  wrap.appendChild(table);
  return wrap;
}
function buildTables(st) {
  var box = H('div', { class: 'tables' });
  if (st.d.kind === 'register') {
    st.d.registers.forEach(function (r) {
      var rows = r.fields.map(function (f) {
        return { cls: f.reserved ? 'reserved' : null, cells: [f.msb === f.lsb ? String(f.msb) : f.msb + ':' + f.lsb, f.reserved ? t('reserved') : f.name, f.access, f.reset, f.desc] };
      });
      box.appendChild(dataTable(r.name + (r.offset ? '  @ ' + r.offset : '') + (r.desc ? ': ' + r.desc : ''), t('regCols'), rows, [0, 3]));
    });
  } else if (st.d.kind === 'pinout') {
    var hasAlt = st.d.pins.some(function (p) { return p.alt; });
    var prow = st.d.pins.map(function (p) { return { cls: p.type === 'nc' ? 'reserved' : null, cells: [String(p.n), p.name, p.type, hasAlt ? p.alt : p.desc].concat(hasAlt ? [p.desc] : []) }; });
    box.appendChild(dataTable('', t('pinCols').slice(0, hasAlt ? 5 : 4).map(function (c, i) { return !hasAlt && i === 3 ? t('pinCols')[4] : c; }), prow, [0]));
  } else if (st.d.kind === 'memory') {
    var rows = st.d.items.filter(function (it) { return !it.gap; }).map(function (it) {
      return { cells: [hexAddr(it.base, st.d.digits), hexAddr(it.end, st.d.digits), formatSize(it.size), it.name, it.desc] };
    });
    box.appendChild(dataTable('', t('memCols'), rows, [0, 1]));
  }
  return box;
}

/* ---------- exports for other tools: draw.io, Mermaid, CSV ---------- */
function xmlEsc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '&#10;'); }
function htmlEsc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function b64utf8(text) {
  var bytes = new TextEncoder().encode(text), bin = '';
  for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
function mermaidEsc(v) { return String(v).replace(/&/g, '#38;').replace(/"/g, '#34;').replace(/</g, '#60;').replace(/>/g, '#62;').replace(/\|/g, '#124;').replace(/\n/g, ' '); }
function mermaidText(st) {
  var d = st.d, out = ['flowchart ' + d.direction], ids = {}, classes = {}, links = [];
  d.nodes.forEach(function (n, i) { ids[n.id] = 'n' + i + '_' + n.id.replace(/[^A-Za-z0-9_]/g, '_'); });
  var decl = function (n) {
    var label = mermaidEsc((n.icon && !iconKnown(n.icon) ? n.icon + ' ' : '') + nodeName(n)) + (n.desc ? '<br/>' + mermaidEsc(n.desc) : '');
    if (n.shape === 'decision') return ids[n.id] + '{"' + label + '"}';
    if (n.shape === 'state') return ids[n.id] + '(["' + label + '"])';
    return ids[n.id] + '["' + label + '"]';
  };
  var emitGroup = function (gr, indent) {
    out.push(indent + 'subgraph g_' + gr.id.replace(/[^A-Za-z0-9_]/g, '_') + '["' + mermaidEsc((gr.icon && !iconKnown(gr.icon) ? gr.icon + ' ' : '') + (gr.label || ' ')) + '"]');
    out.push(indent + '  direction ' + d.direction);
    d.groups.forEach(function (child) { if (child.parent === gr.id) emitGroup(child, indent + '  '); });
    d.nodes.forEach(function (n) { if (n.group === gr.id) out.push(indent + '  ' + decl(n)); });
    out.push(indent + 'end');
  };
  d.groups.forEach(function (gr) { if (!gr.parent) emitGroup(gr, '  '); });
  d.nodes.forEach(function (n) { if (!n.group || !d.groupById[n.group]) out.push('  ' + decl(n)); });
  d.edges.forEach(function (e, i) {
    var thick = e.kind === 'main' || e.kind === 'bus', dotted = !!EDGE_STYLE[e.kind].dash;
    var body = thick ? '==' : dotted ? '-.-' : '--';
    var head = e.dir === 'none' ? (thick ? '=' : dotted ? '' : '-') : '>';
    var tail = e.dir === 'both' ? '<' : '';
    var a = e.dir === 'back' ? e.to : e.from, b = e.dir === 'back' ? e.from : e.to;
    var arrow = tail + (dotted ? '-.-' : body) + head;
    if (dotted) arrow = tail + '-.' + (e.dir === 'none' ? '-' : '->');
    out.push('  ' + ids[a] + ' ' + arrow + (e.label ? '|"' + mermaidEsc(e.label) + '"|' : '') + ' ' + ids[b]);
    links.push('  linkStyle ' + i + ' stroke:' + THEMES.light.edges[e.kind] + ',stroke-width:' + EDGE_STYLE[e.kind].width + 'px');
  });
  d.nodes.forEach(function (n) { (classes[n.color] = classes[n.color] || []).push(ids[n.id]); });
  Object.keys(classes).forEach(function (c) {
    out.push('  classDef c_' + c + ' fill:' + mix(PALETTE[c], '#ffffff', 0.86) + ',stroke:' + PALETTE[c] + ',color:#0f172a');
    out.push('  class ' + classes[c].join(',') + ' c_' + c);
  });
  var ext = d.nodes.filter(function (n) { return n.external; }).map(function (n) { return ids[n.id]; });
  if (ext.length) { out.push('  classDef ext stroke-dasharray:5 4'); out.push('  class ' + ext.join(',') + ' ext'); }
  return out.concat(links).join('\n') + '\n';
}
function mermaidDocument() {
  var parts = ['# ' + (spec.title || 'Diagrams'), ''];
  states.forEach(function (st) {
    if (st.d.kind !== 'graph') return;
    parts.push('## ' + (st.d.title || st.d.id), '', '```mermaid', mermaidText(st).trimEnd(), '```', '');
  });
  return parts.join('\n');
}
function csvCell(v) { var q = String(v === undefined || v === null ? '' : v); return /[",\n;]/.test(q) ? '"' + q.replace(/"/g, '""') + '"' : q; }
function csvText(st) {
  var rows = [];
  if (st.d.kind === 'register') {
    rows.push(['Register', 'Offset', 'Bits', 'Field', 'Access', 'Reset', 'Description']);
    st.d.registers.forEach(function (r) {
      r.fields.forEach(function (f) { rows.push([r.name, r.offset, f.msb === f.lsb ? String(f.msb) : f.msb + ':' + f.lsb, f.reserved ? t('reserved') : f.name, f.access, f.reset, f.desc]); });
    });
  } else if (st.d.kind === 'pinout') {
    rows.push(['Pin', 'Name', 'Type', 'Alternate functions', 'Description']);
    st.d.pins.forEach(function (p) { rows.push([String(p.n), p.name, p.type, p.alt, p.desc]); });
  } else if (st.d.kind === 'memory') {
    rows.push(['Start', 'End', 'Size (bytes)', 'Region', 'Description']);
    st.d.items.forEach(function (it) { if (!it.gap) rows.push([hexAddr(it.base, st.d.digits), hexAddr(it.end, st.d.digits), String(it.size), it.name, it.desc]); });
  }
  return '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n') + '\r\n';
}

/* ---------- highlight & steps ---------- */
function clearFocus(st) {
  if (!st.svg) return;
  st.svg.classList.remove('has-focus');
  Array.prototype.forEach.call(st.svg.querySelectorAll('.on, .sel'), function (el) { el.classList.remove('on'); el.classList.remove('sel'); });
}
function markEdge(st, i) {
  st.edgeEls[i].classList.add('on');
  if (st.labelEls[i]) st.labelEls[i].classList.add('on');
}
function markNode(st, id) { if (id && st.nodeEls[id]) st.nodeEls[id].classList.add('on'); }
function applyFocus(st) {
  clearFocus(st);
  var f = st.focus;
  if (!f) return;
  st.svg.classList.add('has-focus');
  if (f.type === 'node') {
    st.nodeEls[f.id].classList.add('on', 'sel');
    (st.adj[f.id] || []).forEach(function (i) {
      var e = st.d.edges[i];
      markEdge(st, i);
      markNode(st, e.from);
      markNode(st, e.to);
    });
  } else {
    var e = st.d.edges[f.index];
    markEdge(st, f.index);
    markNode(st, e.from);
    markNode(st, e.to);
  }
}
function setStep(st, i) {
  if (!st.d.steps.length) return;
  st.stepIndex = Math.max(0, Math.min(st.d.steps.length - 1, i));
  var step = st.d.steps[st.stepIndex];
  st.focus = step.type === 'node' ? { type: 'node', id: step.node } : { type: 'edge', index: step.edge };
  applyFocus(st);
  hideDetails(st);
  st.stepItems.forEach(function (li, k) {
    li.classList.toggle('active', k === st.stepIndex);
    li.setAttribute('aria-current', k === st.stepIndex ? 'step' : 'false');
  });
  var li = st.stepItems[st.stepIndex];
  if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
  scrollToFocus(st, step);
}
function scrollToFocus(st, step) {
  var c = st.canvas;
  if (c.scrollWidth <= c.clientWidth + 2 && c.scrollHeight <= c.clientHeight + 2) return;
  var p;
  if (step.type === 'node') p = st.L.nodes[step.node];
  else { var ed = st.L.edges[step.edge]; p = { x: ed.lx, y: ed.ly }; }
  if (!p || !isFinite(p.x)) return;
  var scale = st.svg.getBoundingClientRect().width / st.L.width || 1;
  c.scrollTo({ left: (p.x + st.L.ox) * scale - c.clientWidth / 2, top: (p.y + st.L.oy) * scale - c.clientHeight / 2, behavior: 'smooth' });
}
function resetSteps(st) {
  st.stepIndex = -1;
  (st.stepItems || []).forEach(function (li) { li.classList.remove('active'); li.setAttribute('aria-current', 'false'); });
}
function stopPlay(st) {
  if (st.timer) { clearInterval(st.timer); st.timer = null; }
  if (st.playBtn) { st.playBtn.textContent = '▶'; st.playBtn.title = t('play'); st.playBtn.setAttribute('aria-label', t('play')); }
}
function togglePlay(st) {
  if (st.timer) { stopPlay(st); return; }
  if (st.stepIndex >= st.d.steps.length - 1) st.stepIndex = -1;
  setStep(st, st.stepIndex + 1);
  st.playBtn.textContent = '❚❚';
  st.playBtn.title = t('pause');
  st.playBtn.setAttribute('aria-label', t('pause'));
  st.timer = setInterval(function () {
    if (st.stepIndex >= st.d.steps.length - 1) { stopPlay(st); return; }
    setStep(st, st.stepIndex + 1);
  }, 2600);
}

/* ---------- search & details ---------- */
function normText(v) {
  return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}
function runSearch(st, q) {
  var words = normText(q).split(/\s+/).filter(Boolean);
  st.matchIndex = -1;
  st.matches = words.length ? st.d.nodes.filter(function (n) {
    var hay = normText(n.title + ' ' + n.desc + ' ' + (n.drawio ? '' : n.id));
    return words.every(function (w) { return hay.indexOf(w) >= 0; });
  }).map(function (n) { return n.id; }) : null;
  applySearch(st);
}
function applySearch(st) {
  if (!st.svg) return;
  var hit = {};
  (st.matches || []).forEach(function (id) { hit[id] = true; });
  st.svg.classList.toggle('has-search', !!st.matches);
  Object.keys(st.nodeEls).forEach(function (id) { st.nodeEls[id].classList.toggle('match', !!hit[id]); });
  if (st.countEl) st.countEl.textContent = st.matches ? String(st.matches.length) : '';
}
function hideDetails(st) { if (st.detailsEl) st.detailsEl.hidden = true; }
function showDetails(st, id) {
  var box = st.detailsEl, n = st.d.nodeById[id];
  if (!box || !n) return;
  box.textContent = '';
  var close = H('button', { type: 'button', class: 'det-close', title: t('close'), 'aria-label': t('close'), text: '×' });
  close.addEventListener('click', function () { st.focus = null; applyFocus(st); hideDetails(st); });
  box.appendChild(H('div', { class: 'det-head' }, [
    H('span', { class: 'det-dot', style: 'background:' + nodeDot(n) }),
    H('span', { class: 'det-title', text: nodeName(n) }),
    close
  ]));
  if (n.desc) box.appendChild(H('p', { class: 'det-desc', text: n.desc }));
  [['incoming', 'from', 'to'], ['outgoing', 'to', 'from']].forEach(function (cfg) {
    var items = [];
    st.d.edges.forEach(function (e) {
      if (e[cfg[2]] === id && e[cfg[1]] !== id) items.push(e);
    });
    var list = H('ul', { class: 'det-list' });
    if (!items.length) list.appendChild(H('li', { class: 'det-empty', text: t('none') }));
    items.forEach(function (e) {
      var otherId = e[cfg[1]], other = st.d.nodeById[otherId];
      var btn = H('button', { type: 'button', class: 'det-item' }, [
        H('span', { class: 'det-dot', style: 'background:' + (other ? nodeDot(other) : '#94a3b8') }),
        H('span', { text: other ? nodeName(other) : endName(st.d.nodeById, st.d.groupById, otherId) }),
        e.label ? H('span', { class: 'via', text: e.label }) : null
      ]);
      if (other) btn.addEventListener('click', function () { selectNode(st, other.id, true); });
      else btn.disabled = true;
      list.appendChild(H('li', {}, [btn]));
    });
    box.appendChild(H('div', { class: 'det-sec' }, [H('div', { class: 'det-label', text: t(cfg[0]) + ' (' + items.length + ')' }), list]));
  });
  box.hidden = false;
  var nodeBox = st.nodeEls[id] && st.nodeEls[id].getBoundingClientRect();
  var canvasBox = st.canvas.getBoundingClientRect();
  box.classList.toggle('on-left', !!nodeBox && nodeBox.left + nodeBox.width / 2 > canvasBox.left + canvasBox.width / 2);
}
function nodeDot(n) {
  if (!CORE_SHAPES[n.shape] && !n.colorSet) return n.style.fill && n.style.fill !== 'none' ? n.style.fill : (n.style.stroke && n.style.stroke !== 'none' ? n.style.stroke : '#94a3b8');
  return PALETTE[n.color];
}
function selectNode(st, id, scroll) {
  stopPlay(st);
  resetSteps(st);
  st.focus = { type: 'node', id: id };
  applyFocus(st);
  showDetails(st, id);
  if (scroll) scrollToFocus(st, { type: 'node', node: id });
}

/* ---------- zoom & export ---------- */
function applyZoom(st) {
  var s = st.svg;
  if (st.scale === null && !st.userFit && !document.documentElement.classList.contains('shot')) {
    var avail = st.canvas.clientWidth - 20;
    if (avail > 0 && avail / st.L.width < 0.6) st.scale = 0.6;
  }
  if (st.scale === null) {
    s.style.width = '100%';
    s.style.maxWidth = st.L.width + 'px';
    s.style.height = 'auto';
  } else {
    s.style.width = Math.round(st.L.width * st.scale) + 'px';
    s.style.maxWidth = 'none';
    s.style.height = Math.round(st.L.height * st.scale) + 'px';
  }
  alignGrid(st);
  if (st.zoomEl) st.zoomEl.textContent = Math.round((s.getBoundingClientRect().width / st.L.width || 1) * 100) + '%';
  updateMinimap(st);
}

/* ---------- minimap: the whole drawing in a corner, with the visible area marked ---------- */
function buildMinimap(st) {
  if (st.minimap) st.minimap.remove();
  st.minimap = null;
  if (!st.board || !st.L || st.d.kind !== 'graph') return;
  var L = st.L, T = THEMES[themeName], W = 190, k = W / L.width, H0 = Math.max(40, Math.min(190, L.height * k));
  if (L.height * k > 190) k = 190 / L.height;
  var mw = Math.round(L.width * k), mh = Math.round(L.height * k);
  var svg = S('svg', { width: mw, height: mh, viewBox: '0 0 ' + fmt(L.width) + ' ' + fmt(L.height), 'aria-hidden': 'true' });
  var g = S('g', { transform: 'translate(' + fmt(L.ox) + ' ' + fmt(L.oy) + ')' });
  st.d.groups.forEach(function (gr) { var b = L.groups[gr.id]; if (b && !gr.hidden) g.appendChild(S('rect', { x: fmt(b.x), y: fmt(b.y), width: fmt(b.w), height: fmt(b.h), fill: 'none', stroke: T.muted, 'stroke-width': fmt(1.2 / k), 'stroke-opacity': 0.5 })); });
  st.d.edges.forEach(function (e, i) {
    var pts = L.edges[i] && L.edges[i].points;
    if (pts && pts.length > 1) g.appendChild(S('path', { d: 'M' + pts.map(function (p) { return fmt(p.x) + ',' + fmt(p.y); }).join('L'), fill: 'none', stroke: T.muted, 'stroke-width': fmt(1 / k), 'stroke-opacity': 0.6 }));
  });
  st.d.nodes.forEach(function (n) {
    var p = L.nodes[n.id];
    if (!p) return;
    var fill = CORE_SHAPES[n.shape] ? PALETTE[n.color] : (n.style.fill && n.style.fill !== 'none' ? n.style.fill : T.ink);
    g.appendChild(S('rect', { x: fmt(p.x - p.w / 2), y: fmt(p.y - p.h / 2), width: fmt(p.w), height: fmt(p.h), fill: fill, 'fill-opacity': CORE_SHAPES[n.shape] ? 0.9 : 0.35 }));
  });
  svg.appendChild(g);
  var view = H('div', { class: 'mm-view' });
  var box = H('div', { class: 'minimap', title: lang === 'vi' ? 'Bản đồ thu nhỏ: kéo khung để di chuyển' : 'Overview: drag the frame to move around' }, [svg, view]);
  box.style.width = mw + 'px';
  box.style.height = mh + 'px';
  st.minimap = box;
  st.mmView = view;
  st.mmScale = k;
  var goTo = function (ev) {
    var r = box.getBoundingClientRect(), c = st.canvas, s = st.svg.getBoundingClientRect().width / L.width || 1, off = svgOffset(st);
    var dx = (ev.clientX - r.left) / k, dy = (ev.clientY - r.top) / k;
    c.scrollLeft = off.x + dx * s - c.clientWidth / 2;
    c.scrollTop = off.y + dy * s - c.clientHeight / 2;
  };
  box.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    goTo(ev);
    var move = function (e2) { goTo(e2); };
    var up = function () { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
  st.board.appendChild(box);
  if (!st.mmScroll) { st.mmScroll = true; st.canvas.addEventListener('scroll', function () { updateMinimap(st); }); }
  updateMinimap(st);
}
function updateMinimap(st) {
  if (!st.minimap || !st.svg || !st.canvas) return;
  var c = st.canvas, s = st.svg.getBoundingClientRect().width / st.L.width || 1, k = st.mmScale;
  var overflow = c.scrollWidth > c.clientWidth + 24 || c.scrollHeight > c.clientHeight + 24;
  st.minimap.hidden = !overflow;
  if (!overflow) return;
  var off = svgOffset(st), x = (c.scrollLeft - off.x) / s, y = (c.scrollTop - off.y) / s;
  st.minimap.style.bottom = Math.max(8, st.board.clientHeight - (c.offsetTop + c.clientHeight) + 12) + 'px';
  var w = c.clientWidth / s, h = c.clientHeight / s;
  var v = st.mmView.style;
  v.left = Math.max(0, x * k) + 'px';
  v.top = Math.max(0, y * k) + 'px';
  v.width = Math.max(6, Math.min(st.L.width, w) * k) + 'px';
  v.height = Math.max(6, Math.min(st.L.height, h) * k) + 'px';
}
function zoomBy(st, factor) {
  var current = st.scale === null ? (st.svg.getBoundingClientRect().width / st.L.width || 1) : st.scale;
  st.scale = Math.max(0.2, Math.min(4, current * factor));
  applyZoom(st);
}
/* The dotted background is a grid in diagram units: one dot every 20 units (blocks snap to 10 when
   dragged), a stronger dot every 100 units while editing. It follows zoom and scrolling. */
var GRID = 20;
var gridPref = null;
function gridOn() {
  if (gridPref === null) gridPref = storageGet('architecture-diagrams-grid');
  return gridPref !== '0';
}
function toggleGrid() {
  gridPref = gridOn() ? '0' : '1';
  storageSet('architecture-diagrams-grid', gridPref);
  states.forEach(alignGrid);
}
/* Where the drawing sits inside the scrollable canvas (SVG elements have no offsetLeft). */
function svgOffset(st) {
  var c = st.canvas, r = st.svg.getBoundingClientRect(), cr = c.getBoundingClientRect();
  return { x: r.left - cr.left - c.clientLeft + c.scrollLeft, y: r.top - cr.top - c.clientTop + c.scrollTop };
}
function alignGrid(st) {
  var c = st.canvas, s = st.svg;
  if (!c) return;
  var on = gridOn();
  c.classList.toggle('no-grid', !on);
  var gb = st.section && st.section.querySelector('.tb-grid');
  if (gb) gb.setAttribute('aria-pressed', on ? 'true' : 'false');
  if (!on || !s || !st.L || st.d.kind !== 'graph') { c.style.backgroundSize = ''; c.style.backgroundPosition = ''; return; }
  var scale = s.getBoundingClientRect().width / st.L.width || 1, g = GRID * scale;
  if (g < 6) g *= Math.ceil(6 / g);
  var off = svgOffset(st), x0 = off.x + st.L.ox * scale, y0 = off.y + st.L.oy * scale;
  var pos = function (v, step) { return ((v - step / 2) % step + step) % step; };
  var sizes = [g + 'px ' + g + 'px', 5 * g + 'px ' + 5 * g + 'px'];
  c.style.backgroundSize = sizes.join(', ');
  c.style.backgroundPosition = pos(x0, g) + 'px ' + pos(y0, g) + 'px, ' + pos(x0, 5 * g) + 'px ' + pos(y0, 5 * g) + 'px';
}
function slug(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 60) || 'diagram';
}
function fileName(st, ext) {
  var base = slug(spec.title || st.d.title || 'diagram');
  return (states.length > 1 ? base + '-' + slug(st.d.id) : base) + '.' + ext;
}
function download(blob, name) {
  var url = URL.createObjectURL(blob);
  var a = H('a', { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}
function drawAny(st, forExport) {
  var kind = st.d.kind;
  if (kind === 'wave') return drawWave(st, forExport);
  if (kind === 'register') return drawRegisters(st, forExport);
  if (kind === 'memory') return drawMemory(st, forExport);
  if (kind === 'chip') return drawChip(st, forExport);
  if (kind === 'pinout') return drawPinout(st, forExport);
  return drawDiagram(st, forExport);
}
function exportXml(st) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(drawAny(st, true).svg);
}
function pngDataUrl(st, done) {
  var url = URL.createObjectURL(new Blob([exportXml(st)], { type: 'image/svg+xml;charset=utf-8' }));
  var img = new Image();
  img.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = outW(st.L) * 2;
    canvas.height = outH(st.L) * 2;
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    try { done(canvas.toDataURL('image/png')); } catch (err) { done(null); }
  };
  img.onerror = function () { URL.revokeObjectURL(url); done(null); };
  img.src = url;
}
function docBase() { return slug(spec.title || (states[0] && states[0].d.title) || 'diagram'); }
function exportAs(st, fmt) {
  if (fmt === 'svg') exportSvg(st);
  else if (fmt === 'png') exportPng(st);
  else if (fmt === 'drawio') prepareDrawioExport().then(function () { download(new Blob([drawioDocument()], { type: 'application/xml' }), docBase() + '.drawio'); });
  else if (fmt === 'library') drawioLibrary().then(function (xml) { download(new Blob([xml], { type: 'application/xml' }), 'architecture-diagrams-symbols.xml'); });
  else if (fmt === 'mermaid') download(new Blob([mermaidText(st)], { type: 'text/plain;charset=utf-8' }), fileName(st, 'mmd'));
  else if (fmt === 'csv') download(new Blob([csvText(st)], { type: 'text/csv;charset=utf-8' }), fileName(st, 'csv'));
}
function exportSvg(st) { download(new Blob([exportXml(st)], { type: 'image/svg+xml;charset=utf-8' }), fileName(st, 'svg')); }
/* The drawing as a PNG at twice the screen resolution. */
function pngBlob(st) {
  return new Promise(function (resolve, reject) {
    var url = URL.createObjectURL(new Blob([exportXml(st)], { type: 'image/svg+xml;charset=utf-8' }));
    var img = new Image();
    img.onload = function () {
      var k = 2, canvas = document.createElement('canvas');
      canvas.width = outW(st.L) * k;
      canvas.height = outH(st.L) * k;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      try { canvas.toBlob(function (b) { if (b) resolve(b); else reject(new Error('png')); }, 'image/png'); }
      catch (err) { reject(err); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('png')); };
    img.src = url;
  });
}
function exportPng(st) { pngBlob(st).then(function (b) { download(b, fileName(st, 'png')); }, function () { alert(t('pngFail')); }); }
/* Puts the picture on the clipboard for Word, PowerPoint or Teams; downloads the PNG where the browser does not allow that. */
function copyPng(st, btn) {
  var blob = pngBlob(st);
  var flash = function (text) { if (!btn) return; var old = btn.textContent; btn.textContent = text; setTimeout(function () { btn.textContent = old; }, 1800); };
  var fallback = function () { blob.then(function (b) { download(b, fileName(st, 'png')); flash(t('copyFail')); }, function () { alert(t('pngFail')); }); };
  if (!navigator.clipboard || !navigator.clipboard.write || typeof ClipboardItem === 'undefined') { fallback(); return; }
  try { navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function () { flash('✓ ' + t('copied')); }, fallback); }
  catch (err) { fallback(); }
}

/* ---------- page building ---------- */
function legendSwatchLine(color, dash, width) {
  return S('svg', { width: 30, height: 10, viewBox: '0 0 30 10', 'aria-hidden': 'true' }, [
    S('line', { x1: 1, y1: 5, x2: 29, y2: 5, stroke: color, 'stroke-width': Math.max(width, 1.6), 'stroke-dasharray': dash, 'stroke-linecap': 'round' })
  ]);
}
function buildLegend(st) {
  var d = st.d, T = THEMES[themeName], box = st.legendEl;
  box.textContent = '';
  var items = [];
  if (d.kind === 'register') {
    var seen = {};
    d.registers.forEach(function (r) { r.fields.forEach(function (f) { seen[f.reserved ? '_rsv' : (f.access || '?')] = true; }); });
    Object.keys(seen).sort().forEach(function (a) {
      var fill = a === '_rsv' ? T.reg.fills.reserved : (T.reg.fills[a] || T.reg.fills.other);
      items.push([S('svg', { width: 16, height: 14, viewBox: '0 0 16 14', 'aria-hidden': 'true' }, [S('rect', { x: 0.5, y: 0.5, width: 15, height: 13, rx: 2, fill: fill, stroke: T.reg.border })]), a === '_rsv' ? t('reserved') : (a === '?' ? '—' : a)]);
    });
  }
  if (d.kind === 'pinout') {
    var types = {};
    d.pins.forEach(function (p) { types[p.type] = true; });
    Object.keys(PIN_TYPES).forEach(function (ty) {
      if (!types[ty] || ty === 'io') return;
      items.push([S('svg', { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true' }, [S('rect', { x: 0.5, y: 0.5, width: 13, height: 13, fill: pinFill(ty, T), stroke: T.ink })]), (t('pinTypes') || {})[ty] || ty]);
    });
  }
  if (d.kind === 'memory') {
    COLOR_ORDER.forEach(function (c) {
      if (!str(d.legend.colors[c])) return;
      items.push([S('svg', { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true' }, [S('rect', { width: 14, height: 14, rx: 3.5, fill: PALETTE[c] })]), str(d.legend.colors[c])]);
    });
  }
  if (d.kind !== 'graph') {
    box.hidden = !items.length;
    items.forEach(function (it) { box.appendChild(H('span', { class: 'item' }, [it[0], it[1]])); });
    return;
  }
  var usedColors = {};
  d.nodes.forEach(function (n) { usedColors[n.color] = true; });
  COLOR_ORDER.forEach(function (c) {
    if (!usedColors[c] || !str(d.legend.colors[c])) return;
    items.push([S('svg', { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true' }, [S('rect', { width: 14, height: 14, rx: 3.5, fill: PALETTE[c] })]), str(d.legend.colors[c])]);
  });
  var usedKinds = {};
  d.edges.forEach(function (e) { usedKinds[e.kind] = true; });
  var otherKinds = Object.keys(usedKinds).filter(function (k) { return k !== 'normal'; }).length;
  KIND_ORDER.forEach(function (k) {
    if (!usedKinds[k] || (k === 'normal' && !otherKinds && !str(d.legend.edges.normal))) return;
    items.push([legendSwatchLine(T.edges[k], EDGE_STYLE[k].dash, EDGE_STYLE[k].width), str(d.legend.edges[k]) || t('kinds')[k]]);
  });
  if (d.nodes.some(function (n) { return n.external; })) {
    items.push([S('svg', { width: 18, height: 14, viewBox: '0 0 18 14', 'aria-hidden': 'true' }, [S('rect', { x: 1, y: 1, width: 16, height: 12, rx: 3, fill: 'none', stroke: T.edges.normal, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' })]), t('external')]);
  }
  if (d.nodes.some(function (n) { return n.initial; })) {
    items.push([S('svg', { width: 26, height: 12, viewBox: '0 0 26 12', 'aria-hidden': 'true' }, [
      S('circle', { cx: 5, cy: 6, r: 4, fill: T.ink }), S('path', { d: 'M9,6H20', stroke: T.ink, 'stroke-width': 1.6 }), S('path', { d: 'M19,2.5L25,6L19,9.5Z', fill: T.ink })
    ]), t('initial')]);
  }
  if (d.nodes.some(function (n) { return n.final; })) {
    items.push([S('svg', { width: 30, height: 16, viewBox: '0 0 30 16', 'aria-hidden': 'true' }, [
      S('rect', { x: 1, y: 1, width: 28, height: 14, rx: 7, fill: PALETTE.slate }), S('rect', { x: 3.5, y: 3.5, width: 23, height: 9, rx: 4.5, fill: 'none', stroke: '#ffffff', 'stroke-width': 1.2 })
    ]), t('final')]);
  }
  if (d.steps.length) {
    items.push([S('svg', { width: 20, height: 20, viewBox: '0 0 20 20', 'aria-hidden': 'true' }, [badge('1', 10, 10, T)]), t('stepMark')]);
  }
  if (!items.length) { box.hidden = true; return; }
  box.hidden = false;
  items.forEach(function (it) { box.appendChild(H('span', { class: 'item' }, [it[0], it[1]])); });
}

function buildSection(st) {
  var d = st.d;
  var section = H('section', { class: 'diagram-section is-hidden', id: 'section-' + d.id, role: states.length > 1 ? 'tabpanel' : null });
  var showTitle = d.title && d.title !== spec.title;
  if (showTitle || d.tag) {
    section.appendChild(H('div', { class: 'd-head' }, [
      showTitle ? H('h2', { text: d.title }) : null,
      d.tag ? H('span', { class: 'd-tag', text: d.tag }) : null
    ]));
  }
  var crumbs = tabCrumbs(d);
  if (crumbs) section.appendChild(crumbs);
  if (d.summary) {
    var sum = H('div', { class: 'summary' }, [H('span', { class: 'badge', text: t('readFirst') })]);
    richText(sum, d.summary);
    section.appendChild(sum);
  }
  var isGraph = d.kind === 'graph';
  var ws = H('div', { class: 'workspace' + (isGraph && d.steps.length ? (st.L.width > 1000 ? ' stack' : '') : ' no-steps') });
  var board = H('div', { class: 'board' });
  var bZoomOut = H('button', { type: 'button', class: 'tb-btn', title: t('zoomOut'), 'aria-label': t('zoomOut'), text: '−' });
  var bFit = H('button', { type: 'button', class: 'tb-btn', title: t('fitTitle'), text: t('fit') });
  var bZoomIn = H('button', { type: 'button', class: 'tb-btn', title: t('zoomIn'), 'aria-label': t('zoomIn'), text: '+' });
  var bMenu = H('button', { type: 'button', class: 'tb-btn', 'aria-haspopup': 'true', 'aria-expanded': 'false', text: '↓ ' + t('download') });
  var menu = H('div', { class: 'menu', role: 'menu' });
  menu.hidden = true;
  var formats = [['copy', t('fmtCopy')], ['svg', t('fmtSvg')], ['png', t('fmtPng')], ['drawio', t('fmtDrawio')]];
  if (isGraph) formats.push(['mermaid', t('fmtMermaid')]);
  if (d.kind === 'register' || d.kind === 'memory' || d.kind === 'pinout') formats.push(['csv', t('fmtCsv')]);
  formats.forEach(function (f) {
    var item = H('button', { type: 'button', role: 'menuitem', 'data-format': f[0], text: f[1] });
    item.addEventListener('click', function () { menu.hidden = true; bMenu.setAttribute('aria-expanded', 'false'); if (f[0] === 'copy') copyPng(st, bMenu); else exportAs(st, f[0]); });
    menu.appendChild(item);
  });
  bMenu.addEventListener('click', function (ev) {
    ev.stopPropagation();
    menu.hidden = !menu.hidden;
    bMenu.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
  });
  document.addEventListener('click', function (ev) { if (!menu.hidden && !menu.contains(ev.target)) { menu.hidden = true; bMenu.setAttribute('aria-expanded', 'false'); } });
  var hint = { wave: t('hintWave'), register: t('hintReg'), memory: t('hintMem'), chip: t('hintChip'), pinout: t('hintPin') }[d.kind] || t('hint');
  var tools = [H('span', { class: 'hint', text: hint })];
  if (isGraph) {
    st.searchEl = H('input', { type: 'search', class: 'tb-search', placeholder: t('search') + '…', title: t('searchTitle'), 'aria-label': t('searchTitle') });
    st.countEl = H('span', { class: 'tb-count', 'aria-live': 'polite' });
    tools.push(st.searchEl, st.countEl);
  }
  if (isGraph) {
    var bGrid = H('button', { type: 'button', class: 'tb-btn tb-grid', title: t('gridTitle'), 'aria-label': t('gridTitle'), 'aria-pressed': 'false', text: '▦' });
    bGrid.addEventListener('click', function () { toggleGrid(); });
    tools.push(bGrid);
  }
  if (isGraph && d.notes.length) {
    var shown = notesShown();
    var bNotes = H('button', { type: 'button', class: 'tb-btn tb-notes', title: t(shown ? 'notesOn' : 'notesOff'), 'aria-pressed': shown ? 'true' : 'false', text: '🗒 ' + t('notesBtn') });
    bNotes.addEventListener('click', function () { toggleNotes(); });
    tools.push(bNotes);
  }
  st.zoomEl = H('span', { class: 'tb-zoom', 'aria-live': 'polite', title: t('zoomLevel') });
  tools.push(bZoomOut, st.zoomEl, bFit, bZoomIn, H('span', { class: 'tb-sep' }), H('div', { class: 'tb-menu' }, [bMenu, menu]));
  board.appendChild(H('div', { class: 'toolbar' }, tools));
  if (isGraph) st.searchEl.addEventListener('input', function () { runSearch(st, st.searchEl.value); });
  if (isGraph) st.searchEl.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      if (st.matches && st.matches.length) {
        st.matchIndex = (st.matchIndex + 1) % st.matches.length;
        selectNode(st, st.matches[st.matchIndex], true);
      }
    } else if (ev.key === 'Escape') {
      st.searchEl.value = '';
      runSearch(st, '');
      st.searchEl.blur();
    }
  });
  st.detailsEl = H('div', { class: 'details', role: 'region', 'aria-live': 'polite' });
  st.detailsEl.hidden = true;
  board.appendChild(st.detailsEl);
  st.canvas = H('div', { class: 'canvas' });
  board.appendChild(st.canvas);
  st.board = board;
  st.legendEl = H('div', { class: 'legend' });
  board.appendChild(st.legendEl);
  ws.appendChild(board);

  bZoomOut.addEventListener('click', function () { zoomBy(st, 0.8); });
  bZoomIn.addEventListener('click', function () { zoomBy(st, 1.25); });
  bFit.addEventListener('click', function () { st.scale = null; st.userFit = true; applyZoom(st); });

  st.stepItems = [];
  if (d.steps.length) {
    var prev = H('button', { type: 'button', class: 'tb-btn', title: t('prev'), 'aria-label': t('prev'), text: '‹' });
    st.playBtn = H('button', { type: 'button', class: 'tb-btn', title: t('play'), 'aria-label': t('play'), text: '▶' });
    var next = H('button', { type: 'button', class: 'tb-btn', title: t('next'), 'aria-label': t('next'), text: '›' });
    prev.addEventListener('click', function () { stopPlay(st); setStep(st, st.stepIndex < 0 ? 0 : st.stepIndex - 1); });
    next.addEventListener('click', function () { stopPlay(st); setStep(st, st.stepIndex + 1); });
    st.playBtn.addEventListener('click', function () { togglePlay(st); });
    var ol = H('ol');
    d.steps.forEach(function (step, k) {
      var li = H('li', { class: 'step', tabindex: 0, 'aria-current': 'false' }, [
        H('span', { class: 'num', text: String(k + 1) }),
        H('div', {}, [H('div', { class: 'st-title', text: step.title }), step.text ? richText(H('div', { class: 'st-text' }), step.text) : null])
      ]);
      li.addEventListener('click', function () { stopPlay(st); setStep(st, k); });
      li.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); stopPlay(st); setStep(st, k); } });
      ol.appendChild(li);
      st.stepItems.push(li);
    });
    ws.appendChild(H('aside', { class: 'steps' }, [
      H('div', { class: 'steps-head' }, [H('strong', { text: t('steps') }), H('div', { class: 'steps-nav' }, [prev, st.playBtn, next])]),
      ol
    ]));
  }
  section.appendChild(ws);
  if (d.kind === 'register' || d.kind === 'memory' || d.kind === 'pinout') section.appendChild(buildTables(st));
  document.getElementById('sections').appendChild(section);
  st.section = section;
}

function renderState(st) {
  var drawn = drawAny(st, false);
  st.svg = drawn.svg;

  st.nodeEls = drawn.refs.nodeEls;
  st.edgeEls = drawn.refs.edgeEls;
  st.labelEls = drawn.refs.labelEls;
  st.canvas.textContent = '';
  st.canvas.appendChild(st.svg);
  buildMinimap(st);
  applyZoom(st);
  buildLegend(st);
  if (st.d.kind !== 'graph') return;
  applyFocus(st);
  applySearch(st);
  var follow = function (ev) {
    var link = ev.target.closest ? ev.target.closest('.frame-detail, .node-detail') : null;
    if (link && goToTab(link.getAttribute('data-detail'))) { ev.stopPropagation(); ev.preventDefault(); }
  };
  st.svg.addEventListener('click', follow, true);
  st.svg.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') follow(ev); }, true);
  st.svg.addEventListener('click', function (ev) {
    var nodeEl = ev.target.closest ? ev.target.closest('.node') : null;
    stopPlay(st);
    resetSteps(st);
    if (!nodeEl) { st.focus = null; applyFocus(st); hideDetails(st); return; }
    var id = nodeEl.getAttribute('data-id');
    if (st.focus && st.focus.type === 'node' && st.focus.id === id) { st.focus = null; applyFocus(st); hideDetails(st); return; }
    st.focus = { type: 'node', id: id };
    applyFocus(st);
    showDetails(st, id);
  });
  st.svg.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var nodeEl = ev.target.closest ? ev.target.closest('.node') : null;
    if (!nodeEl) return;
    ev.preventDefault();
    nodeEl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function showSection(index, updateHash) {
  states.forEach(function (st, i) {
    st.section.classList.toggle('is-hidden', i !== index);
    if (st.tab) st.tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
    if (i !== index) stopPlay(st);
  });
  active = states[index];
  if (active && active.svg && active.scale === null) applyZoom(active);
  if (updateHash && states.length > 1 && history.replaceState) history.replaceState(null, '', '#' + active.d.id);
}

/* ---------- links between an overview, its detail board and the tabs that hold a block's inside ---------- */
function goToTab(id) {
  var idx = -1;
  states.forEach(function (st, i) { if (st.d.id === id) idx = i; });
  if (idx < 0) return false;
  showSection(idx, true);
  if (typeof edFollowTab === 'function') edFollowTab(id);
  window.scrollTo(0, 0);
  return true;
}
function blockName(tabId, id) {
  var tab = (spec && spec.diagrams ? spec.diagrams : []).filter(function (x) { return x.id === tabId; })[0];
  if (!tab || tab.kind !== 'graph') return id;
  var g = tab.groupById[id], n = tab.nodeById[id];
  return g ? (g.label || g.id) : n ? nodeName(n) : id;
}
function tabCrumbs(d) {
  if (d.kind !== 'graph') return null;
  var link = function (id, text) {
    var b = H('button', { type: 'button', class: 'crumb', text: text });
    b.addEventListener('click', function () { goToTab(id); });
    return b;
  };
  var parts = [];
  if (d.boardOf) parts.push(H('span', { text: t('boardOfIt') }), link(d.boardOf, '↰ ' + tabTitle(d.boardOf)));
  if (d.detailOf) parts.push(H('span', { text: t('crumbDetail') + ' «' + blockName(d.detailOf.tab, d.detailOf.block) + '» ·' }), link(d.detailOf.tab, '↰ ' + t('crumbUp') + ': ' + tabTitle(d.detailOf.tab)));
  var boards = (spec && spec.diagrams ? spec.diagrams : []).filter(function (x) { return x.boardOf === d.id; });
  if (boards.length) {
    parts.push(H('span', { text: t('hasBoard') }));
    boards.forEach(function (b) { parts.push(link(b.id, (b.title || b.id) + ' ↘')); });
  }
  return parts.length ? H('nav', { class: 'crumbs', 'aria-label': t('crumbBoard') }, parts) : null;
}
function toggleNotes() {
  storageSet('ad-notes', notesShown() ? 'off' : 'on');
  if (typeof ED !== 'undefined' && ED && typeof edRender === 'function') edRender();
  else renderSpec(currentRaw, true);
}

function buildTabs() {
  var nav = document.getElementById('tabs');
  if (states.length < 2) return;
  nav.hidden = false;
  states.forEach(function (st, i) {
    var b = H('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': 'false', 'aria-controls': 'section-' + st.d.id, text: st.d.title || st.d.id });
    b.addEventListener('click', function () { showSection(i, true); if (typeof edFollowTab === 'function') edFollowTab(st.d.id); });
    nav.appendChild(b);
    st.tab = b;
  });
}

/* ---------- theme ---------- */
function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
function setTheme(name, remember) {
  themeName = name === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', themeName);
  var btn = document.getElementById('theme-btn');
  btn.hidden = false;
  btn.textContent = themeName === 'dark' ? '☀' : '☾';
  btn.title = themeName === 'dark' ? t('toLight') : t('toDark');
  btn.setAttribute('aria-label', btn.title);
  if (remember) storageSet('architecture-diagrams-theme', themeName);
  states.forEach(renderState);
}
function initialTheme() {
  var q = new URLSearchParams(location.search).get('theme');
  if (q === 'light' || q === 'dark') return q;
  var saved = storageGet('architecture-diagrams-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  if (spec.theme !== 'auto') return spec.theme;
  return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
