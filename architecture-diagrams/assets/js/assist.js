/* Assist: quick fixes for the Checks list, ready-made patterns and suggestions for the selected block.
   All three produce the same list of editing operations ("ops"), applied by asApplyOps as one step that
   Undo takes back. An agent sends the same ops through the MCP server: scripts/assist.py opens this page
   in a headless browser and calls runCliAssist, so the editor and the agent share one implementation. */

var AST = {
  en: {
    fixAll: 'Fix {x} safe problems', fixAllTitle: 'Applies every fix that has only one sensible answer, as one step that Undo takes back',
    fReverse: 'Swap its ends', fDelete: 'Delete this connection', fDeleteFrom: 'Delete the wire from {x}',
    fWireFrom: 'Wire it from {x}', fAddClock: 'Add a clock source', fMove: 'Move {x} to free space',
    fUse: 'Use “{x}”', fCard: 'Draw it as a card', fNoIcon: 'Remove the icon', fGroupNew: 'Create group “{x}”', fGroupDrop: 'Take it out of the group',
    fEnd: 'Point it at “{x}”', fAddMissing: 'Add block “{x}”', fRename: 'Rename it “{x}”', fStepDrop: 'Delete this step', fParentDrop: 'Remove the parent group',
    lFix: 'Quick fix: {x}', lFixAll: 'Quick fix: {x} problems', lPattern: 'Insert pattern {x}',
    patterns: 'Patterns', patSearch: 'Search: cdc, reset, fifo, axi, tl-ul…', patNone: 'No pattern matches.', patInsert: 'Insert',
    patHint: 'A pattern goes next to the selected block and is wired to it, pin by pin where the pins fit. With nothing selected it goes into the middle of the view.',
    catChip: 'Digital circuits', catSoc: 'SoC, IP and verification', catSoftware: 'Software', catProcess: 'Flowcharts and state machines', patInserted: 'Inserted {x}.',
    stAllPats: 'See all {x} patterns',
    patClockOpen: 'Its clock pins are not wired yet; the Checks list has a button to wire them to a clock.',
    patClockFrom: 'Its clock comes from {x}, in the other clock domain.', patClockOwn: 'Its clock comes from {x}, the clock of the selected block.', opsApplied: 'Applied {x} operations.',
    sgTitle: 'Suggestions for {x}', sgWire: 'Wire {x} from {y}', sgWireTo: 'Wire {x} to {y}', sgAddClock: 'Add a clock source for {x}',
    sgPattern: 'Add a {x} after {y}', sgClockGate: 'Add a clock gate after {x}', sgFlopOn: 'Add a flip-flop clocked by {x}', sgFlopAfter: 'Register {x} with a flip-flop',
    sgAfter: 'Add a block after this one', sgYes: 'Add the “{x}” branch', sgLabel: 'Label the two branches “{x}” and “{y}”', sgNextState: 'Add the next state',
    sgConnect: 'Connect it to the existing {x}', sgService: 'Add a service behind it', nService: 'Service', sgBetween: 'Insert a block after {x}, before {y}', sgNetIn: 'Add a signal label on pin {x}', sgNetOut: 'Add an output label on pin {x}',
    sgInitial: 'Mark it as the initial state', sgDb: 'Add a database', sgCache: 'Add a cache', sgQueue: 'Add a queue', sgApi: 'Add an API gateway',
    sgConsumer: 'Add a consumer', sgReplica: 'Add a read replica', sgNextFlop: 'Add the next flip-flop stage after {x}', sgSyncTo: 'Synchronize {x} into the {y} domain',
    sgShape: 'Draw it with the {x} symbol, which fits its name', sgIcon: 'Give it the {x} icon, which fits its name',
    sgLinkFrom: 'Connect {x} to it', sgHeal: 'Reconnect to {x}, as before the delete', sgHealFrom: 'Reconnect from {x}, as before the delete',
    nsHeal: 'Reconnect {x} to {y}', healHint: 'Deleted. Press 1 to reconnect {x} to {y}.', nsTitle: 'Next steps', nsFor: '{x}: {y}',
    nsHint: 'Select a block to see all of its suggestions. Keys 1 to 8 apply the suggestion with that number.',
    sgNoneNext: 'Nothing more for {x}. Next steps in the diagram:', sgLoopBack: 'Send the “{x}” branch back to {y}', sgEnd: 'End the flow here',
    sgBackTo: 'Go back to {x}', sgFinal: 'Mark it as a final state', sgWeb: 'Add a web app', sgNextStep: 'Add the next step', sgCheck: 'Add a check (yes or no)',
    sgHwBus: 'Add an AXI bus for it', sgHwCpu: 'Add a CPU that drives this bus', sgHwMem: 'Add on-chip SRAM', sgHwBridge: 'Add a bridge to APB for slow peripherals',
    sgHwPeriph: 'Add a {x}', sgHwIrq: 'Add an interrupt controller', sgHwIrqTo: 'Send its interrupt to {x}', sgHwDram: 'Add the external DRAM',
    dBus: 'Connects the masters to memory and the peripheral bridge', dCpu: 'Runs the firmware', dSram: 'On-chip memory', dBridge: 'Takes accesses to the slow peripherals',
    dIrq: 'Gathers the interrupts of the peripherals for the CPU', dDram: 'Off-chip memory', dUart: 'Serial port', dGpio: 'General-purpose pins', dTimer: 'Timers and PWM',
    dSpi: 'SPI bus to flash and sensors', dI2c: 'I2C bus to sensors', dWdt: 'Restarts the chip when the firmware hangs', dCache: 'Keeps data that is read often',
    nsGroupClock: 'Frame the {x} blocks clocked by {y} as one clock domain', nsGroupPeriph: 'Frame the {x} peripherals behind {y}', nsGroupSvc: 'Frame the {x} services as one layer',
    gDomain: '{x} domain', gPeriph: 'Peripherals', gServices: 'Services',
    nsJoinFrame: 'Put the {x} blocks that belong with it into the frame “{y}”',
    sgKey: 'Key {x}', ghOn: 'Faint preview: on', ghOff: 'Faint preview: off', ghToggle: 'Show or hide the faint block that the Tab key adds',
    ghTab: 'Tab applies the suggestion; Esc or a click elsewhere drops it', ghMore: 'More suggestions',
    stPasteAi: 'Paste the AI answer (JSON) here and press Apply',
    stTitle: 'Where to start?', stHint: 'Pick one way below. Everything can be changed later, and Undo takes any step back.',
    stType: 'Pick the kind of diagram', stPattern: 'Start from a pattern', stAi: 'Let an AI draw it', stHave: 'You already have data',
    stAiPh: 'Describe the diagram, for example: RISC-V SoC with AXI, SRAM, UART and GPIO', stAiCopy: 'Copy the prompt with this request',
    stAiHint: 'Paste it into ChatGPT, Claude or Gemini, then paste the JSON it sends back into the box below and press Apply.',
    stOpen: 'Open a .drawio or .json file', stPaste: 'Paste a table from Excel', stKeep: 'Draw by hand from the two sample blocks', stClose: 'Hide',
    tGraph: 'Parts of a system, a flow, a state machine, a circuit wired pin by pin', tWave: 'Signals cycle by cycle', tRegister: 'Bit fields of registers',
    tMemory: 'Where memories and peripherals sit', tChip: 'Chip blocks, buses and power domains', tPinout: 'Pins of a package',
    yes: 'Yes', no: 'No', nBlock: 'New block', nState: 'New state', nDb: 'Database', nCache: 'Cache', nQueue: 'Queue', nApi: 'API gateway',
    nConsumer: 'Consumer', nReplica: 'Read replica', nClock: 'clk', nStep: 'New step', nEnd: 'End', nWeb: 'Web app', nBus: 'AXI interconnect',
    nBridge: 'AXI to APB bridge', nIrq: 'Interrupt controller', nCheck: 'Check?',
    eBad: 'not an operation object', eThrew: 'could not be applied ({x})', eField: 'unknown field {x} (known: {y})',
    sgStartFrom: 'Start from the pattern “{x}”', sgFrameOpen: 'Open its inside, tab {x}', sgFrameInside: 'Move its inside to its own tab (--inside {x} --diagram {y})',
    sgFrameTidy: 'Tidy the blocks inside it', sgFrameNote: 'Add a note', eUnknown: 'unknown operation “{x}”', eNode: 'needs a "node" object', eId: '“{x}” is not a valid id (letters, digits and _ . : - only)',
    eDup: 'the id “{x}” is already used', eShape: 'unknown shape “{x}”', eNoNode: 'there is no block “{x}”', ePin: 'block “{x}” has no pin “{y}”; its pins are {z}',
    eNoPins: 'block “{x}” has no named pins', eGroup: 'there is no group “{x}”', eEdge: 'no connection matches', eRename: 'change an id with renameNode',
    eNoTab: 'there is no tab “{x}”', eNotGraph: 'tab “{x}” is not a block diagram', eNoPattern: 'there is no pattern “{x}”', eStep: 'there is no step #{x}',
    eNoEnd: 'needs "{x}"'
  },
  vi: {
    fixAll: 'Sửa nhanh {x} lỗi', fixAllTitle: 'Sửa mọi lỗi chỉ có một cách sửa hợp lý, gộp thành một bước để Hoàn tác được',
    fReverse: 'Đảo hai đầu dây', fDelete: 'Xóa đường nối này', fDeleteFrom: 'Xóa dây từ {x}',
    fWireFrom: 'Nối từ {x}', fAddClock: 'Thêm nguồn clock', fMove: 'Dời {x} ra chỗ trống',
    fUse: 'Đổi thành “{x}”', fCard: 'Vẽ thành thẻ thường', fNoIcon: 'Bỏ biểu tượng', fGroupNew: 'Tạo nhóm “{x}”', fGroupDrop: 'Đưa ra khỏi nhóm',
    fEnd: 'Nối vào “{x}”', fAddMissing: 'Thêm khối “{x}”', fRename: 'Đổi mã thành “{x}”', fStepDrop: 'Xóa bước này', fParentDrop: 'Bỏ nhóm cha',
    lFix: 'Sửa nhanh: {x}', lFixAll: 'Sửa nhanh {x} lỗi', lPattern: 'Chèn mẫu {x}',
    patterns: 'Mạch mẫu', patSearch: 'Tìm mẫu: cdc, reset, fifo, axi, tl-ul…', patNone: 'Không có mẫu nào khớp.', patInsert: 'Chèn',
    patHint: 'Mẫu được đặt cạnh khối đang chọn và tự nối vào khối đó, nối theo từng chân nếu chân khớp. Khi chưa chọn khối nào, mẫu nằm giữa khung nhìn.',
    catChip: 'Mạch số', catSoc: 'SoC, IP và kiểm thử', catSoftware: 'Phần mềm', catProcess: 'Lưu đồ và máy trạng thái', patInserted: 'Đã chèn {x}.',
    stAllPats: 'Xem đủ {x} mẫu',
    patClockOpen: 'Chân clock của mẫu chưa có dây; mục Kiểm tra có nút nối nhanh vào nguồn clock.',
    patClockFrom: 'Clock của mẫu lấy từ {x}, thuộc miền clock còn lại.', patClockOwn: 'Clock của mẫu lấy từ {x}, là clock của khối đang chọn.', opsApplied: 'Đã áp dụng {x} thao tác.',
    sgTitle: 'Gợi ý cho {x}', sgWire: 'Nối {x} từ {y}', sgWireTo: 'Nối {x} tới {y}', sgAddClock: 'Thêm nguồn clock cho {x}',
    sgPattern: 'Thêm {x} sau {y}', sgClockGate: 'Thêm cổng clock sau {x}', sgFlopOn: 'Thêm flip-flop chạy theo {x}', sgFlopAfter: 'Chốt {x} bằng một flip-flop',
    sgAfter: 'Thêm một khối phía sau', sgYes: 'Thêm nhánh “{x}”', sgLabel: 'Ghi nhãn “{x}” và “{y}” cho hai nhánh', sgNextState: 'Thêm trạng thái tiếp theo',
    sgConnect: 'Nối tới {x} đã có', sgService: 'Thêm dịch vụ phía sau', nService: 'Dịch vụ', sgBetween: 'Chèn một khối sau {x}, trước {y}', sgNetIn: 'Thêm nhãn tín hiệu cho chân {x}', sgNetOut: 'Thêm nhãn tín hiệu ra cho chân {x}',
    sgInitial: 'Đánh dấu là trạng thái đầu', sgDb: 'Thêm cơ sở dữ liệu', sgCache: 'Thêm cache', sgQueue: 'Thêm hàng đợi', sgApi: 'Thêm API gateway',
    sgConsumer: 'Thêm dịch vụ nhận tin', sgReplica: 'Thêm bản sao chỉ đọc', sgNextFlop: 'Thêm tầng flip-flop tiếp theo sau {x}', sgSyncTo: 'Đồng bộ {x} sang miền {y}',
    sgShape: 'Vẽ khối này bằng ký hiệu {x} cho hợp với tên', sgIcon: 'Thêm biểu tượng {x} cho hợp với tên khối',
    sgLinkFrom: 'Nối {x} vào khối này', sgHeal: 'Nối lại tới {x} như trước khi xóa', sgHealFrom: 'Nối lại từ {x} như trước khi xóa',
    nsHeal: 'Nối lại {x} tới {y}', healHint: 'Đã xóa. Bấm phím 1 để nối lại {x} tới {y}.', nsTitle: 'Bước tiếp theo', nsFor: '{x}: {y}',
    nsHint: 'Chọn một khối để xem mọi gợi ý cho khối đó. Bấm phím số 1 đến 8 để làm theo gợi ý mang số đó.',
    sgNoneNext: 'Khối {x} không còn gợi ý nào. Bước tiếp theo trong sơ đồ:', sgLoopBack: 'Cho nhánh “{x}” quay lại {y}', sgEnd: 'Kết thúc luồng ở đây',
    sgBackTo: 'Quay về {x}', sgFinal: 'Đánh dấu là trạng thái cuối', sgWeb: 'Thêm ứng dụng web', sgNextStep: 'Thêm bước tiếp theo', sgCheck: 'Thêm bước kiểm tra (có hoặc không)',
    sgHwBus: 'Thêm bus AXI cho khối này', sgHwCpu: 'Thêm CPU điều khiển bus này', sgHwMem: 'Thêm bộ nhớ SRAM trên chip', sgHwBridge: 'Thêm cầu sang APB cho ngoại vi chậm',
    sgHwPeriph: 'Thêm ngoại vi {x}', sgHwIrq: 'Thêm bộ điều khiển ngắt', sgHwIrqTo: 'Nối ngắt của khối này tới {x}', sgHwDram: 'Thêm DRAM ngoài chip',
    dBus: 'Nối các master với bộ nhớ và cầu ngoại vi', dCpu: 'Chạy firmware', dSram: 'Bộ nhớ trên chip', dBridge: 'Chuyển truy cập tới các ngoại vi chậm',
    dIrq: 'Gom ngắt từ các ngoại vi về CPU', dDram: 'Bộ nhớ ngoài chip', dUart: 'Cổng nối tiếp', dGpio: 'Chân vào ra đa dụng', dTimer: 'Bộ định thời và PWM',
    dSpi: 'Bus SPI tới flash và cảm biến', dI2c: 'Bus I2C tới cảm biến', dWdt: 'Khởi động lại chip khi firmware bị treo', dCache: 'Giữ dữ liệu hay được đọc',
    nsGroupClock: 'Gom {x} khối chạy theo {y} vào một khung miền clock', nsGroupPeriph: 'Gom {x} ngoại vi phía sau {y} vào một khung', nsGroupSvc: 'Gom {x} dịch vụ vào một khung',
    gDomain: 'Miền {x}', gPeriph: 'Ngoại vi', gServices: 'Dịch vụ',
    nsJoinFrame: 'Đưa {x} khối cùng nhóm vào khung “{y}”',
    sgKey: 'Phím {x}', ghOn: 'Khối mờ: bật', ghOff: 'Khối mờ: tắt', ghToggle: 'Hiện hoặc ẩn khối mờ mà phím Tab sẽ thêm',
    ghTab: 'Bấm Tab để làm theo gợi ý; bấm Esc hoặc bấm chỗ khác để bỏ qua', ghMore: 'Xem thêm gợi ý',
    stPasteAi: 'Dán câu trả lời của AI (JSON) vào đây rồi bấm Áp dụng',
    stTitle: 'Bắt đầu từ đâu?', stHint: 'Chọn một cách dưới đây. Mọi thứ đều sửa lại được, và nút Hoàn tác quay lại được từng bước.',
    stType: 'Chọn loại sơ đồ', stPattern: 'Bắt đầu từ mạch mẫu', stAi: 'Nhờ AI vẽ', stHave: 'Đã có sẵn dữ liệu',
    stAiPh: 'Mô tả sơ đồ cần vẽ, ví dụ: SoC RISC-V có AXI, SRAM, UART và GPIO', stAiCopy: 'Chép prompt kèm yêu cầu này',
    stAiHint: 'Dán vào ChatGPT, Claude hoặc Gemini, rồi dán JSON mà AI trả về vào ô bên dưới và bấm Áp dụng.',
    stOpen: 'Mở file .drawio hoặc .json', stPaste: 'Dán bảng từ Excel', stKeep: 'Tự vẽ tiếp từ hai khối mẫu', stClose: 'Ẩn',
    tGraph: 'Các phần của hệ thống, luồng xử lý, máy trạng thái, mạch nối tới từng chân', tWave: 'Tín hiệu theo từng chu kỳ clock', tRegister: 'Các trường bit của thanh ghi',
    tMemory: 'Bộ nhớ và ngoại vi nằm ở địa chỉ nào', tChip: 'Khối, bus và miền nguồn của chip', tPinout: 'Chân của vỏ chip',
    yes: 'Có', no: 'Không', nBlock: 'Khối mới', nState: 'Trạng thái mới', nDb: 'Cơ sở dữ liệu', nCache: 'Cache', nQueue: 'Hàng đợi', nApi: 'API gateway',
    nConsumer: 'Dịch vụ nhận tin', nReplica: 'Bản sao chỉ đọc', nClock: 'clk', nStep: 'Bước mới', nEnd: 'Kết thúc', nWeb: 'Ứng dụng web', nBus: 'Bus AXI',
    nBridge: 'Cầu AXI sang APB', nIrq: 'Bộ điều khiển ngắt', nCheck: 'Kiểm tra?',
    eBad: 'không phải một thao tác', eThrew: 'không áp dụng được ({x})', eField: 'không có trường {x} (các trường có: {y})',
    sgStartFrom: 'Bắt đầu từ mạch mẫu “{x}”', sgFrameOpen: 'Mở phần bên trong, tab {x}', sgFrameInside: 'Tách phần bên trong ra tab riêng (--inside {x} --diagram {y})',
    sgFrameTidy: 'Sắp lại các khối bên trong', sgFrameNote: 'Thêm ghi chú', eUnknown: 'không có thao tác “{x}”', eNode: 'cần có đối tượng "node"', eId: '“{x}” không dùng làm mã được (chỉ chữ, số và _ . : -)',
    eDup: 'mã “{x}” đã có khối khác dùng', eShape: 'không có hình “{x}”', eNoNode: 'không có khối “{x}”', ePin: 'khối “{x}” không có chân “{y}”; các chân là {z}',
    eNoPins: 'khối “{x}” không có chân mang tên', eGroup: 'không có nhóm “{x}”', eEdge: 'không có đường nối nào khớp', eRename: 'đổi mã bằng thao tác renameNode',
    eNoTab: 'không có tab “{x}”', eNotGraph: 'tab “{x}” không phải sơ đồ khối', eNoPattern: 'không có mẫu “{x}”', eStep: 'không có bước số {x}',
    eNoEnd: 'cần có "{x}"'
  }
};
function at(k) { var tbl = AST[lang] || AST.en; return tbl[k] !== undefined ? tbl[k] : AST.en[k]; }
function asl(k, x, y, z) {
  var v = function (q) { return q === undefined || q === null ? '' : String(q); };
  return at(k).replace('{x}', v(x)).replace('{y}', v(y)).replace('{z}', v(z));
}

/* ---------- reading the raw diagram ---------- */
function asText(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v[lang] !== undefined ? v[lang] : (v.en !== undefined ? v.en : '');
  return v === undefined || v === null ? '' : v;
}
function asNodes(d) {
  var m = {};
  (Array.isArray(d.nodes) ? d.nodes : []).forEach(function (n) { if (n && str(n.id) && !m[str(n.id)]) m[str(n.id)] = n; });
  return m;
}
function asGroupIds(d) {
  var m = {};
  (Array.isArray(d.groups) ? d.groups : []).forEach(function (g) { if (g && str(g.id)) m[str(g.id)] = g; });
  return m;
}
function asPinsOf(n) { return n ? pinList(shapeDef(normShape(n.shape))) : []; }
function asPinByName(n, name) {
  var want = str(name).toLowerCase();
  return asPinsOf(n).filter(function (p) { return p.name.toLowerCase() === want; })[0] || null;
}
function asAnchor(p) { return { x: p.x, y: p.y, perimeter: false }; }
/* "fixed" is the older name of a hand-placed layout; the renderer and validate.py read both */
function asManual(d) { return !!d && (d.layout === 'manual' || d.layout === 'fixed'); }
function asRef(id, p) { return p ? id + '.' + p.name : id; }
/* "ff2.Q" is pin Q of block ff2; a plain id is the whole block. A block id may itself contain dots. */
function asEnd(d, ref) {
  var s = str(ref), nodes = asNodes(d), groups = asGroupIds(d);
  if (!s) return { error: asl('eNoEnd', 'from/to') };
  if (nodes[s]) return { id: s, node: nodes[s], pin: null };
  if (groups[s] && asManual(d)) return { id: s, node: null, pin: null };
  var k = s.lastIndexOf('.');
  if (k > 0 && nodes[s.slice(0, k)]) {
    var n = nodes[s.slice(0, k)], p = asPinByName(n, s.slice(k + 1));
    if (p) return { id: str(n.id), node: n, pin: p };
    var all = asPinsOf(n);
    return { error: all.length ? asl('ePin', str(n.id), s.slice(k + 1), all.map(function (q) { return q.name; }).join(', ')) : asl('eNoPins', str(n.id)) };
  }
  return { error: asl('eNoNode', s) };
}
/* The pin a raw connection end is fixed to (the same test as boundPin in the renderer). */
function asEndPin(d, e, which, nodes) {
  /* nodes: the asNodes(d) map when the caller already has it (loops over every connection pass it) */
  var n = (nodes || asNodes(d))[str(e[which])], a = normAnchor(e[which + 'Anchor']);
  if (!n || !a || Math.abs(a.dx || 0) > 3 || Math.abs(a.dy || 0) > 3) return null;
  return asPinsOf(n).filter(function (p) { return Math.abs(p.x - a.x) <= 0.02 && Math.abs(p.y - a.y) <= 0.02; })[0] || null;
}
/* How many wires sit on each pin: { id: { pin index: count } }. */
function asUsed(d) {
  var used = {}, nodes = asNodes(d);
  (Array.isArray(d.edges) ? d.edges : []).forEach(function (e) {
    if (!e) return;
    ['from', 'to'].forEach(function (w) {
      var p = asEndPin(d, e, w, nodes);
      if (!p) return;
      var m = used[str(e[w])] || (used[str(e[w])] = {});
      m[p.index] = (m[p.index] || 0) + 1;
    });
  });
  return used;
}
function asFreePins(d, id, used, dirs) {
  var u = (used || asUsed(d))[id] || {};
  return asPinsOf(asNodes(d)[id]).filter(function (p) { return !u[p.index] && dirs.indexOf(p.dir) >= 0; });
}
/* Preferred output pin: Q before QN, Y, OUT, the clock outputs, then any output. */
function asPickOut(pins) {
  var order = ['Q', 'Y', 'OUT', 'GCLK', 'CLK'];
  for (var i = 0; i < order.length; i++) { var hit = pins.filter(function (p) { return p.name.toUpperCase() === order[i]; })[0]; if (hit) return hit; }
  return pins[0] || null;
}
function asEdgeIndex(d, e) {
  var list = Array.isArray(d.edges) ? d.edges : [];
  var same = function (a, b) { var p = normAnchor(a), q = normAnchor(b); return (!p && !q) || (!!p && !!q && Math.abs(p.x - q.x) < 0.01 && Math.abs(p.y - q.y) < 0.01); };
  for (var i = 0; i < list.length; i++) {
    var x = list[i];
    if (x && str(x.from) === str(e.from) && str(x.to) === str(e.to) && same(x.fromAnchor, e.fromAnchor) && same(x.toAnchor, e.toAnchor)) return i;
  }
  return -1;
}

/* ---------- sizes and free space ---------- */
function asSize(n) {
  var w = +n.w > 0 ? +n.w : null, h = +n.h > 0 ? +n.h : null, shape = normShape(n.shape);
  if (!CORE_SHAPES[shape]) {
    var def = shapeDef(shape) || SYMBOLS.box, dw = def.size[0], dh = def.size[1];
    if (w && !h) h = def.aspect === 'fixed' ? w * dh / dw : dh;
    if (h && !w) w = def.aspect === 'fixed' ? h * dw / dh : dw;
    return { w: w || dw, h: h || dh };
  }
  if (shape === 'decision') return { w: w || 140, h: h || 70 };
  if (shape === 'state') return { w: w || 120, h: h || 46 };
  var s = SIZES[n.size] || SIZES.md, cw = w || +n.width || s.w;
  var lines = Math.max(1, Math.ceil(textWidth(str(asText(n.title)) || str(n.id), s.title, 700) / Math.max(40, cw - s.padX * 2)));
  var body = n.desc ? s.bodyPad * 2 + Math.ceil(textWidth(str(asText(n.desc)), s.desc, 400) / Math.max(40, cw - s.padX * 2)) * s.desc * LH : 0;
  return { w: cw, h: h || Math.ceil(s.headPad * 2 + Math.min(3, lines) * s.title * LH + body) };
}
/* Boxes (top-left x, y) of the blocks already drawn: from the layout when the page drew this tab, else estimated. */
function asBoxes(d, st) {
  var out = [], seen = {};
  if (st && st.L && st.d && st.d.kind === 'graph' && asManual(d)) {
    Object.keys(st.L.nodes).forEach(function (id) {
      var p = st.L.nodes[id], f = st.d.nodeById && st.d.nodeById[id] ? frameOf(st.d, st.L, id) : null;
      /* f: the drawn frame of a rotated or flipped block, so its pins are found where they are drawn */
      out.push({ id: id, x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h, f: f && (f.rot || f.flipH || f.flipV || f.dir) ? f : null });
      seen[id] = true;
    });
  }
  (Array.isArray(d.nodes) ? d.nodes : []).forEach(function (n) {
    if (!n || seen[str(n.id)] || finiteNum(n.x) === null || finiteNum(n.y) === null) return;
    var s = asSize(n);
    out.push({ id: str(n.id), x: +n.x, y: +n.y, w: s.w, h: s.h });
  });
  return out;
}
function asBounds(boxes) {
  if (!boxes.length) return null;
  var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  boxes.forEach(function (b) { x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h); });
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}
/* The nearest place for a box that keeps `pad` pixels from every other block: first straight down, then right.
   good(x, y) can refuse a free place, for example when the wire to it would cut through a block. */
function asFreeSpot(boxes, want, pad, good, grid) {
  var hit = function (x, y) {
    return boxes.some(function (b) { return x < b.x + b.w + pad && x + want.w + pad > b.x && y < b.y + b.h + pad && y + want.h + pad > b.y; });
  };
  var first = null, step = 20;
  var test = function (x, y) {
    if (hit(x, y)) return false;
    if (!first) first = { x: x, y: y };
    return !good || good(x, y);
  };
  if (test(want.x, want.y)) return { x: want.x, y: want.y };
  /* every grid point of each ring round the wanted spot, nearest first (down, then right, on a tie);
     grid = the same spot snapped to round numbers, so a tested spot is exactly the one used */
  var base = grid || want;
  for (var r = 1; r <= 60; r++) {
    var ring = [];
    for (var i = -r; i <= r; i++) {
      ring.push([i, r], [i, -r]);
      if (i > -r && i < r) ring.push([r, i], [-r, i]);
    }
    ring.sort(function (a, b) { return (a[0] * a[0] + a[1] * a[1]) - (b[0] * b[0] + b[1] * b[1]) || b[1] - a[1] || b[0] - a[0]; });
    for (var k = 0; k < ring.length; k++) {
      var x = base.x + ring[k][0] * step, y = base.y + ring[k][1] * step;
      if (test(x, y)) return { x: x, y: y };
    }
  }
  if (first) return first;
  var all = asBounds(boxes);
  return { x: want.x, y: all ? all.y + all.h + pad + 20 : want.y };
}
/* The path a wire takes into a pin (see asNeat), as corner points. */
function asWirePath(src, dst, p) {
  if (Math.abs(src.y - dst.y) < 2 || Math.abs(src.x - dst.x) < 2) return [src, dst];
  var pts = asNeat(src, dst, p);
  if (pts && p.x === 0) return [src, { x: pts[0][0], y: src.y }, { x: pts[0][0], y: dst.y }, dst];
  if (pts) return [src, { x: dst.x, y: src.y }, dst];
  var mx = (src.x + dst.x) / 2;
  return [src, { x: mx, y: src.y }, { x: mx, y: dst.y }, dst];
}
/* Does a path of horizontal and vertical pieces cut through any of the boxes? */
function asCrosses(path, boxes) {
  for (var i = 0; i < path.length - 1; i++) {
    var a = path[i], b = path[i + 1], x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x), y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
    for (var k = 0; k < boxes.length; k++) {
      var q = boxes[k];
      if (x2 > q.x - 1 && x1 < q.x + q.w + 1 && y2 > q.y - 1 && y1 < q.y + q.h + 1) return true;
    }
  }
  return false;
}
function asPinPoint(box, p) {
  if (box.f) return anchorPt(box.f, { x: p.x, y: p.y, dx: 0, dy: 0, perimeter: false });
  return { x: box.x + p.x * box.w, y: box.y + p.y * box.h };
}
/* A tidy route for a wire into a pin on the left or bottom edge: one bend beside the pin, drawn orthogonally. */
/* asNeat, trying a turn close to the pin when the first one lands on a block (blocks drawn close together) */
function asNeatClear(src, dst, p, gap, boxes, skip) {
  var others = (boxes || []).filter(function (b) { return !skip || !skip[b.id]; });
  var tries = [gap || 20, 20, 12];
  for (var i = 0; i < tries.length; i++) {
    var pts = asNeat(src, dst, p, tries[i]);
    if (!pts) return null;
    var x = pts[0][0], path = p.x === 0 ? [src, { x: x, y: src.y }, { x: x, y: dst.y }, dst] : [src, { x: dst.x, y: src.y }, dst];
    if (!asCrosses(path.slice(0, -1), others)) return pts;
  }
  return asNeat(src, dst, p, 20);
}
function asNeat(src, dst, p, gap) {
  /* gap: how far before the pin the wire turns; clock wires turn earlier, so they never share a bend with data */
  var g = gap || 20;
  if (!src || !dst || !p) return null;
  if (p.x === 0 && Math.abs(src.y - dst.y) >= 2 && src.x < dst.x - g - 4) return [[Math.round(dst.x - g), Math.round(src.y)]];
  if (p.y === 1 && Math.abs(src.x - dst.x) >= 2 && src.y > dst.y + 24) return [[Math.round(dst.x), Math.round(src.y)]];
  return null;
}

/* ---------- clock sources ---------- */
var AS_CLOCK_SHAPES = { clock: 1, oscillator: 1, pll: 1, clockgate: 1 };
/* clockFrom: ids that send a clock-kind connection (asClockFrom), passed in by loops over every block */
function asClockFrom(d) {
  var m = {};
  (Array.isArray(d.edges) ? d.edges : []).forEach(function (e) { if (e && e.kind === 'clock') m[str(e.from)] = true; });
  return m;
}
function asIsClock(d, n, clockFrom) {
  if (!n) return false;
  if (AS_CLOCK_SHAPES[normShape(n.shape)]) return true;
  /* a clock port of a frame or of a block's inside tab brings a clock in through its inner pin */
  if (n.port && typeof n.port === 'object') return str(n.port.kind) === 'clock' && str(n.port.dir) !== 'out';
  return !!(clockFrom || asClockFrom(d))[str(n.id)];
}
function asHasClock(d) { var cf = asClockFrom(d); return (Array.isArray(d.nodes) ? d.nodes : []).some(function (n) { return asIsClock(d, n, cf); }); }
function asClockPin(n) {
  if (n && n.port && typeof n.port === 'object') return asPinByName(n, 'INT');
  var outs = asPinsOf(n).filter(function (p) { return p.dir === 'out'; });
  return outs.filter(function (p) { return /CLK|OUT/i.test(p.name); })[0] || outs[0] || null;
}
/* Clock sources for a block, best first: same group (clock domain), then the clock its neighbours use, then the nearest. */
function asClockSources(d, st, id) {
  var nodes = asNodes(d), me = nodes[id], boxes = {}, list = [], cf = asClockFrom(d);
  if (!me) return list;
  asBoxes(d, st).forEach(function (b) { boxes[b.id] = b; });
  var near = {};
  (d.edges || []).forEach(function (e) {
    if (!e || e.kind === 'clock') return;
    if (str(e.from) === id) near[str(e.to)] = true;
    if (str(e.to) === id) near[str(e.from)] = true;
  });
  var feeds = {};
  (d.edges || []).forEach(function (e) {
    if (!e || !near[str(e.to)]) return;
    var p = asEndPin(d, e, 'to', nodes);
    if ((p && p.dir === 'clk') || e.kind === 'clock') feeds[str(e.from)] = (feeds[str(e.from)] || 0) + 1;
  });
  (d.nodes || []).forEach(function (n) {
    var nid = str(n && n.id);
    if (!nid || nid === id || !asIsClock(d, n, cf)) return;
    var score = 0, a = boxes[nid], b = boxes[id];
    if (me.group && str(n.group) === str(me.group)) score += 100;
    score += 30 * (feeds[nid] || 0);
    if (a && b) score -= Math.hypot(a.x - b.x, a.y - b.y) / 25;
    list.push({ id: nid, node: n, pin: asClockPin(n), score: score, group: !!(me.group && str(n.group) === str(me.group)) });
  });
  return list.sort(function (a, b) { return b.score - a.score; });
}
/* The clock source wired into a block's clock pin (or by a clock-kind connection). */
function asFeedingEdge(d, id) {
  var nodes = asNodes(d);
  return (d.edges || []).filter(function (x) {
    if (!x || str(x.to) !== id) return false;
    var p = asEndPin(d, x, 'to', nodes);
    return (p && p.dir === 'clk') || x.kind === 'clock';
  })[0] || null;
}
function asFeedingClock(d, id) { var e = asFeedingEdge(d, id); return e ? str(e.from) : null; }
/* Clock sources of the other domains: not the block's own clock and not in the block's group. */
function asOtherClocks(d, st, id) {
  /* only when this block's own clock is known: an unwired clock pin says nothing about its domain */
  var me = asNodes(d)[id], own = asFeedingClock(d, id), all = asClockSources(d, st, id);
  if (!own || all.length < 2) return [];
  return all.filter(function (c) { return c.id !== own && !(me && me.group && str(c.node.group) === str(me.group)); });
}
function asName(n) { return n ? (str(asText(n.title)).split('\n')[0] || str(n.id)) : ''; }
function asLower(s) { s = String(s || ''); return s.length > 1 && s.charAt(1) === s.charAt(1).toLowerCase() ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
/* The connect op for a wire from a clock source into a pin, with a tidy route when both ends are known. */
function asWireOp(d, st, src, srcPin, dstId, dstPin, kind) {
  var op = { op: 'connect', from: asRef(src, srcPin), to: asRef(dstId, dstPin) };
  if (kind) op.kind = kind;
  if (asManual(d) && dstPin) {
    var boxes = {};
    asBoxes(d, st).forEach(function (b) { boxes[b.id] = b; });
    var a = boxes[src], b = boxes[dstId];
    var from = a ? (srcPin ? asPinPoint(a, srcPin) : { x: a.x + a.w, y: a.y + a.h / 2 }) : null, to = b ? asPinPoint(b, dstPin) : null;
    /* a rotated or flipped block: its pins are not on the side the symbol names, so the renderer routes the wire */
    var skip = {};
    skip[src] = true;
    skip[dstId] = true;
    var pts = b && b.f ? null : asNeatClear(from, to, dstPin, kind === 'clock' ? 34 : 20, asBoxes(d, st), skip);
    op.route = 'orthogonal';
    if (pts) op.points = pts;
  }
  return op;
}

/* ---------- applying ops ---------- */
var AS_ID_RE = /^[A-Za-z0-9_.:-]{1,128}$/;
function asRenameRefs(d, oldId, newId) {
  (d.edges || []).forEach(function (e) { if (!e) return; if (str(e.from) === oldId) e.from = newId; if (str(e.to) === oldId) e.to = newId; });
  (d.steps || []).forEach(function (s) {
    if (!s) return;
    if (str(s.node) === oldId) s.node = newId;
    if (Array.isArray(s.edge)) s.edge = s.edge.map(function (x) { return str(x) === oldId ? newId : x; });
  });
}
function asDropSteps(d, gone) {
  d.steps = (d.steps || []).filter(function (s) { return !(s && Array.isArray(s.edge) && str(s.edge[0]) === str(gone.from) && str(s.edge[1]) === str(gone.to)); });
}
/* An op names a connection by its index ("edge", counted from 0) or by its two ends ("from" and "to", pins allowed). */
function asEdgeRef(d, op) {
  var list = Array.isArray(d.edges) ? d.edges : [];
  if (op.edge !== undefined && op.edge !== null) {
    var k = +op.edge;
    return list[k] ? k : at('eEdge');
  }
  var a = asEnd(d, op.from), b = asEnd(d, op.to);
  if (a.error) return a.error;
  if (b.error) return b.error;
  var nodes = asNodes(d);
  for (var i = 0; i < list.length; i++) {
    var e = list[i];
    if (!e || str(e.from) !== a.id || str(e.to) !== b.id) continue;
    var pf = a.pin ? asEndPin(d, e, 'from', nodes) : null, pt = b.pin ? asEndPin(d, e, 'to', nodes) : null;
    if (a.pin && (!pf || pf.index !== a.pin.index)) continue;
    if (b.pin && (!pt || pt.index !== b.pin.index)) continue;
    return i;
  }
  return at('eEdge');
}
function asSetEnd(d, e, which, ref) {
  var r = asEnd(d, ref);
  if (r.error) return r.error;
  var old = normAnchor(e[which + 'Anchor']);
  e[which] = r.id;
  delete e[which + 'Point'];
  /* the new block has a pin where the old end was: the wire stays on that pin */
  var keep = r.pin || (old && r.node ? asPinsOf(r.node).filter(function (q) { return Math.abs(q.x - old.x) <= 0.02 && Math.abs(q.y - old.y) <= 0.02; })[0] : null);
  if (keep) e[which + 'Anchor'] = asAnchor(keep); else delete e[which + 'Anchor'];
  return null;
}
var AS_NODE_KEYS = ['title', 'desc', 'shape', 'icon', 'color', 'size', 'group', 'external', 'width', 'ports', 'initial', 'final', 'x', 'y', 'w', 'h', 'style', 'labelPos', 'src', 'port', 'detail'];
var AS_EDGE_KEYS = ['label', 'kind', 'dir', 'route', 'points', 'style', 'labelAt', 'labelOffset', 'labelDist', 'minlen', 'weight', 'elbow', 'fromAnchor', 'toAnchor', 'fromPoint', 'toPoint', 'source'];
var AS_GROUP_KEYS = ['label', 'color', 'parent', 'icon', 'hidden', 'x', 'y', 'w', 'h', 'source', 'detail', 'style'];
var AS_TAB_KEYS = ['layout', 'route', 'direction', 'title', 'summary', 'tag', 'legend', 'spacing', 'font', 'arranged'];
/* A field an operation does not know is an error, never silently dropped: a script or an AI then learns what to fix. */
function asUnknownKeys(set, known) {
  var bad = Object.keys(set).filter(function (k) { return known.indexOf(k) < 0; });
  return bad.length ? asl('eField', bad.join(', '), known.join(', ')) : null;
}
var AS_OPS = {
  addNode: function (d, op, touched) {
    var n = op.node;
    if (!n || typeof n !== 'object') return at('eNode');
    var id = str(n.id);
    if (!AS_ID_RE.test(id)) return asl('eId', id);
    if (asNodes(d)[id]) return asl('eDup', id);
    if (edHas(n.shape) && !edShapeKnown(n.shape)) return asl('eShape', str(n.shape));
    if (edHas(n.group) && !asGroupIds(d)[str(n.group)]) return asl('eGroup', str(n.group));
    var c = { id: id };
    AS_NODE_KEYS.forEach(function (k) { if (n[k] !== undefined && n[k] !== null && n[k] !== '') c[k] = k === 'title' || k === 'desc' ? asText(n[k]) : edClone(n[k]); });
    if (asManual(d)) {
      if (finiteNum(c.x) === null || finiteNum(c.y) === null) {
        var s = asSize(c), boxes = asBoxes(d, AS_ST), anchor = op.near ? boxes.filter(function (b) { return b.id === str(op.near); })[0] : null, want;
        if (anchor) want = op.side === 'below' ? { x: anchor.x, y: anchor.y + anchor.h + 60 } : op.side === 'left' ? { x: anchor.x - s.w - 80, y: anchor.y } : { x: anchor.x + anchor.w + 80, y: anchor.y };
        else { var all = asBounds(boxes); want = all ? { x: all.x + all.w + 80, y: all.y } : { x: 40, y: 40 }; }
        var spot = asFreeSpot(boxes, { x: want.x, y: want.y, w: s.w, h: s.h }, 30);
        c.x = Math.round(spot.x / 10) * 10;
        c.y = Math.round(spot.y / 10) * 10;
      }
    } else { delete c.x; delete c.y; }
    d.nodes = Array.isArray(d.nodes) ? d.nodes : [];
    d.nodes.push(c);
    touched.push(id);
    return null;
  },
  updateNode: function (d, op, touched) {
    var n = asNodes(d)[str(op.id)];
    if (!n) return asl('eNoNode', str(op.id));
    var set = op.set && typeof op.set === 'object' ? op.set : {};
    if (set.id !== undefined) return at('eRename');
    var badN = asUnknownKeys(set, AS_NODE_KEYS);
    if (badN) return badN;
    if (edHas(set.shape) && !edShapeKnown(set.shape)) return asl('eShape', str(set.shape));
    if (edHas(set.group) && !asGroupIds(d)[str(set.group)]) return asl('eGroup', str(set.group));
    var x0 = finiteNum(n.x), y0 = finiteNum(n.y);
    Object.keys(set).forEach(function (k) {
      if (AS_NODE_KEYS.indexOf(k) < 0) return;
      if (set[k] === null || set[k] === '') delete n[k]; else n[k] = k === 'title' || k === 'desc' ? asText(set[k]) : edClone(set[k]);
    });
    /* a block that moved takes the bends of its own loops along (a feedback wire from an output back to an input) */
    var x1 = finiteNum(n.x), y1 = finiteNum(n.y);
    if (x0 !== null && y0 !== null && x1 !== null && y1 !== null && (x1 !== x0 || y1 !== y0) && typeof hierMovePt === 'function') {
      (d.edges || []).forEach(function (e) {
        if (e && str(e.from) === str(n.id) && str(e.to) === str(n.id) && Array.isArray(e.points)) e.points = e.points.map(function (q) { return hierMovePt(q, x1 - x0, y1 - y0); });
      });
    }
    (Array.isArray(op.unset) ? op.unset : []).forEach(function (k) { if (k !== 'id') delete n[k]; });
    touched.push(str(n.id));
    return null;
  },
  removeNode: function (d, op) {
    var id = str(op.id);
    if (!asNodes(d)[id]) return asl('eNoNode', id);
    if (typeof hierDetachNotes === 'function') hierDetachNotes(d, id);
    d.nodes = d.nodes.filter(function (n) { return !n || str(n.id) !== id; });
    d.edges = (d.edges || []).filter(function (e) { return e && str(e.from) !== id && str(e.to) !== id; });
    d.steps = (d.steps || []).filter(function (s) { return s && str(s.node) !== id && !(Array.isArray(s.edge) && (str(s.edge[0]) === id || str(s.edge[1]) === id)); });
    return null;
  },
  renameNode: function (d, op, touched) {
    var to = str(op.to);
    if (!AS_ID_RE.test(to)) return asl('eId', to);
    if (str(op.id) === to && asNodes(d)[to] && (op.index === undefined || op.index === null)) return null;
    if (asNodes(d)[to]) return asl('eDup', to);
    if (op.index !== undefined && op.index !== null) {
      /* one row only (a duplicate or a missing id): connections keep pointing where they did */
      var row = (d.nodes || [])[+op.index];
      if (!row) return asl('eNoNode', '#' + (+op.index + 1));
      row.id = to;
      touched.push(to);
      return null;
    }
    var n = asNodes(d)[str(op.id)];
    if (!n) return asl('eNoNode', str(op.id));
    asRenameRefs(d, str(n.id), to);
    if (AS_DOC && typeof hierRenameRefs === 'function') hierRenameRefs(AS_DOC, d, str(n.id), to);
    n.id = to;
    touched.push(to);
    return null;
  },
  connect: function (d, op) {
    var a = asEnd(d, op.from), b = asEnd(d, op.to);
    if (a.error) return a.error;
    if (b.error) return b.error;
    var e = { from: a.id, to: b.id };
    if (a.pin) e.fromAnchor = asAnchor(a.pin);
    if (b.pin) e.toAnchor = asAnchor(b.pin);
    AS_EDGE_KEYS.forEach(function (k) { if (op[k] !== undefined && op[k] !== null && op[k] !== '') e[k] = k === 'label' ? asText(op[k]) : edClone(op[k]); });
    if (!asManual(d)) delete e.points;
    if (asEdgeIndex(d, e) >= 0) return null;
    d.edges = Array.isArray(d.edges) ? d.edges : [];
    d.edges.push(e);
    return null;
  },
  disconnect: function (d, op) {
    var k = asEdgeRef(d, op);
    if (typeof k === 'string') return k;
    var gone = d.edges.splice(k, 1)[0];
    /* a walkthrough step names the two ends, so it stays while another connection joins them */
    if (!d.edges.some(function (e) { return e && str(e.from) === str(gone.from) && str(e.to) === str(gone.to); })) asDropSteps(d, gone);
    return null;
  },
  reverseEdge: function (d, op) {
    var k = asEdgeRef(d, op);
    if (typeof k === 'string') return k;
    var e = d.edges[k], swap = function (o, p, q) { var t = o[p]; if (o[q] === undefined) delete o[p]; else o[p] = o[q]; if (t === undefined) delete o[q]; else o[q] = t; };
    swap(e, 'from', 'to');
    swap(e, 'fromAnchor', 'toAnchor');
    swap(e, 'fromPoint', 'toPoint');
    if (Array.isArray(e.points)) e.points = e.points.slice().reverse();
    (d.steps || []).forEach(function (s) { if (s && Array.isArray(s.edge) && str(s.edge[0]) === str(e.to) && str(s.edge[1]) === str(e.from)) s.edge = [e.from, e.to]; });
    return null;
  },
  updateEdge: function (d, op) {
    var k = asEdgeRef(d, op);
    if (typeof k === 'string') return k;
    var e = d.edges[k], set = op.set && typeof op.set === 'object' ? op.set : {}, err = asUnknownKeys(set, AS_EDGE_KEYS.concat(['from', 'to']));
    if (err) return err;
    Object.keys(set).forEach(function (q) {
      if (err) return;
      if (q === 'from' || q === 'to') { err = asSetEnd(d, e, q, set[q]); return; }
      if (set[q] === null || set[q] === '') delete e[q]; else e[q] = q === 'label' ? asText(set[q]) : edClone(set[q]);
    });
    (Array.isArray(op.unset) ? op.unset : []).forEach(function (q) { if (q !== 'from' && q !== 'to') delete e[q]; });
    return err;
  },
  addGroup: function (d, op) {
    var g = op.group;
    if (!g || typeof g !== 'object') return at('eNode');
    var id = str(g.id);
    if (!AS_ID_RE.test(id)) return asl('eId', id);
    if (asGroupIds(d)[id]) return asl('eDup', id);
    if (edHas(g.parent) && !asGroupIds(d)[str(g.parent)]) return asl('eGroup', str(g.parent));
    var c = { id: id };
    ['label', 'color', 'parent', 'icon', 'hidden', 'style', 'x', 'y', 'w', 'h', 'source', 'detail'].forEach(function (k) { if (g[k] !== undefined && g[k] !== null && g[k] !== '') c[k] = k === 'label' ? asText(g[k]) : edClone(g[k]); });
    d.groups = Array.isArray(d.groups) ? d.groups : [];
    d.groups.push(c);
    return null;
  },
  updateGroup: function (d, op) {
    var g = asGroupIds(d)[str(op.id)];
    if (!g) return asl('eGroup', str(op.id));
    var set = op.set && typeof op.set === 'object' ? op.set : {};
    if (edHas(set.parent)) {
      /* a parent must exist and must not be the group itself or one of its own children */
      var groups = asGroupIds(d), pid = str(set.parent), hops = 0;
      if (!groups[pid]) return asl('eGroup', pid);
      for (var up = pid; up && hops < 50; hops++) { if (up === str(op.id)) return asl('eGroup', pid); up = groups[up] && groups[up].parent ? str(groups[up].parent) : null; }
    }
    var badG = asUnknownKeys(set, AS_GROUP_KEYS);
    if (badG) return badG;
    AS_GROUP_KEYS.forEach(function (k) {
      if (!(k in set)) return;
      if (set[k] === null || set[k] === '') delete g[k]; else g[k] = k === 'label' ? asText(set[k]) : edClone(set[k]);
    });
    (Array.isArray(op.unset) ? op.unset : []).forEach(function (k) { if (k !== 'id') delete g[k]; });
    return null;
  },
  removeStep: function (d, op) {
    var k = +op.index;
    if (!(d.steps || [])[k]) return asl('eStep', k + 1);
    d.steps.splice(k, 1);
    return null;
  },
  updateDiagram: function (d, op) {
    var set = op.set && typeof op.set === 'object' ? op.set : {};
    var bad = asUnknownKeys(set, AS_TAB_KEYS);
    if (bad) return bad;
    AS_TAB_KEYS.forEach(function (k) {
      if (!(k in set)) return;
      if (set[k] === null || set[k] === '') delete d[k]; else d[k] = k === 'title' || k === 'summary' ? asText(set[k]) : edClone(set[k]);
    });
    (Array.isArray(op.unset) ? op.unset : []).forEach(function (k) { if (AS_TAB_KEYS.indexOf(k) >= 0) delete d[k]; });
    return null;
  }
};
/* Applies ops to a copy of the document. Nothing changes when one op fails; the errors say which and why. */
var AS_ST = null, AS_DOC = null, AS_LIST = null;
function asApplyOps(raw, di, ops, st) {
  var doc = edClone(raw), d = doc.diagrams[di], errors = [], touched = [];
  AS_ST = st || null;
  AS_DOC = doc;
  AS_LIST = Array.isArray(ops) ? ops : (ops && Array.isArray(ops.ops) ? ops.ops : null);
  if (!d) return { raw: raw, errors: [asl('eNoTab', di)], touched: [] };
  if (edTypeOf(d) !== 'graph') { AS_ST = null; return { raw: raw, errors: [asl('eNotGraph', str(d.title) || str(d.id) || di + 1)], touched: [] }; }
  if (ops && !Array.isArray(ops) && Array.isArray(ops.ops)) ops = ops.ops;
  (Array.isArray(ops) ? ops : []).forEach(function (op, k) {
    var name = op && typeof op === 'object' ? str(op.op) : '';
    var fail = function (msg) { errors.push('#' + (k + 1) + (name ? ' ' + name : '') + ': ' + msg); };
    if (!name) { fail(at('eBad')); return; }
    if (!AS_OPS.hasOwnProperty(name)) { fail(asl('eUnknown', name)); return; }
    var msg;
    /* an operation that throws (a bug, or an answer from an AI shaped in a way no check caught) fails like any other */
    try { msg = AS_OPS[name](d, op, touched); } catch (err) { msg = asl('eThrew', String(err && err.message || err)); }
    if (msg) fail(msg);
  });
  AS_ST = null;
  AS_DOC = null;
  AS_LIST = null;
  return { raw: errors.length ? raw : doc, errors: errors, touched: touched };
}
/* Hand-placed positions from the automatic layout, as the editor does before a drag (edFreeze). */
function asFreeze(d, st) {
  d.layout = 'manual';
  if (!d.route) d.route = 'spline';
  if (!st || !st.L || st.d.kind !== 'graph') return;
  st.d.nodes.forEach(function (n) {
    var raw = (d.nodes || []).filter(function (x) { return str(x.id) === n.id; })[0], p = st.L.nodes[n.id];
    if (!raw || !p) return;
    raw.x = Math.round(p.x - p.w / 2);
    raw.y = Math.round(p.y - p.h / 2);
  });
  st.d.edges.forEach(function (e, i) {
    var raw = d.edges[e.rawIndex], pts = st.L.edges[i] && st.L.edges[i].points;
    if (!raw || !pts || pts.length < 3 || raw.points) return;
    raw.points = pts.slice(1, -1).map(function (q) { return [Math.round(q.x), Math.round(q.y)]; });
  });
}

/* ---------- patterns ---------- */
var AS_PAT_CATS = [['chip', 'catChip'], ['soc', 'catSoc'], ['software', 'catSoftware'], ['process', 'catProcess']];
function asPatternList() { return (typeof PATTERNS !== 'undefined' && PATTERNS && Array.isArray(PATTERNS.patterns)) ? PATTERNS.patterns : []; }
function asPattern(id) { return asPatternList().filter(function (p) { return p.id === id; })[0] || null; }
function asUniq(base, used) {
  var b = String(base).replace(/[^A-Za-z0-9_.:-]/g, '_') || 'n', out = b, i = 2;
  while (used[out]) out = b + '_' + i++;
  used[out] = true;
  return out;
}
/* The ops that insert a pattern into tab di, next to block `near` when given (the tab must be hand-placed for a
   pattern wired pin by pin; the caller freezes an automatic layout first). center = where to put it otherwise. */
/* The wire from the selected block into a pattern's entry block, for a pattern moved by o: straight or with one
   bend from the left; from above it runs along from an output pin, then down. */
function asEntryPath(plan, o) {
  var e = { x: plan.eb.x + o.x, y: plan.eb.y + o.y, w: plan.eb.w, h: plan.eb.h }, f = plan.from;
  if (plan.side === 'left') { var pl = { x: 0, y: 0.5 }; return asWirePath(f, asPinPoint(e, pl), pl); }
  var pt = { x: 0.5, y: 0 }, t = asPinPoint(e, pt);
  return plan.srcPin && Math.abs(f.x - t.x) >= 2 ? [f, { x: t.x, y: f.y }, t] : asWirePath(f, t, pt);
}
function asPatternOps(raw, di, st, pid, near, center, clock) {
  var d = raw.diagrams[di], pat = asPattern(pid);
  if (!pat) return { error: asl('eNoPattern', pid) };
  var nodes = asNodes(d), taken = {}, gTaken = {}, map = {}, gmap = {}, ops = [], select = [], notes = [];
  if (near && !nodes[str(near)]) return { error: asl('eNoNode', near) };
  if (clock && !nodes[str(clock)]) return { error: asl('eNoNode', clock) };
  Object.keys(nodes).forEach(function (k) { taken[k] = true; });
  Object.keys(asGroupIds(d)).forEach(function (k) { gTaken[k] = true; });
  pat.nodes.forEach(function (n) { map[n.id] = asUniq(n.id, taken); });
  (pat.groups || []).forEach(function (g) { gmap[g.id] = asUniq(g.id, gTaken); });
  var mapEnd = function (ref) { var s = String(ref), k = s.indexOf('.'); return k < 0 ? map[s] : map[s.slice(0, k)] + s.slice(k); };
  var localNode = function (ref) { var s = String(ref), k = s.indexOf('.'); var id = k < 0 ? s : s.slice(0, k); return pat.nodes.filter(function (n) { return n.id === id; })[0]; };
  var localPin = function (ref) { var s = String(ref), k = s.indexOf('.'); return k < 0 ? null : asPinByName(localNode(ref), s.slice(k + 1)); };
  var manual = asManual(d), empty = !(d.nodes || []).length, placed = manual || empty;
  if (!manual && empty && pat.pins) ops.push({ op: 'updateDiagram', set: { layout: 'manual', route: d.route || 'orthogonal' } });
  if (!manual && !pat.pins) placed = false;
  if (!manual && empty && !pat.pins && pat.direction) ops.push({ op: 'updateDiagram', set: { direction: pat.direction } });

  /* how the pattern meets the selected block */
  var nn = near ? nodes[str(near)] : null, plan = null, used = asUsed(d);
  if (nn && nn.port && typeof nn.port === 'object') {
    /* a port of a frame or of a block's inside tab: only its inner pin (INT) takes part; the outer one belongs to the
       rest of the board. An input port feeds the pattern (its clock pins when it carries a clock); an output port
       takes the pattern's output. */
    var nidP = str(nn.id), intPin = asPinByName(nn, 'INT'), pdir = str(nn.port.dir);
    if (intPin && pdir !== 'out') {
      if (asIsClock(d, nn) && pat.clocks && pat.clocks.length) plan = { src: nidP, srcPin: intPin, pins: pat.clocks[0].pins, kind: 'clock', clock: true };
      else if (pat.inputs && pat.inputs.length) plan = { src: nidP, srcPin: intPin, pins: pat.inputs[0].pins, kind: pat.inputs[0].kind };
    } else if (intPin && pat.outputs && pat.outputs.length) plan = { reverse: true, dst: nidP, dstPin: intPin, from: pat.outputs[0], kind: pat.outKind };
  } else if (nn) {
    var nid = str(nn.id), clk = asIsClock(d, nn) && pat.clocks && pat.clocks.length;
    if (clk) plan = { src: nid, srcPin: asClockPin(nn), pins: pat.clocks[0].pins, kind: 'clock', clock: true };
    else {
      var out = asPickOut(asPinsOf(nn).filter(function (p) { return p.dir === 'out'; }));
      /* reverseTo: the pattern only ever drives these pins of the selected block (a reset synchronizer drives RST_N) */
      if (out && pat.inputs && pat.inputs.length && !pat.reverseTo) plan = { src: nid, srcPin: out, pins: pat.inputs[0].pins, kind: pat.inputs[0].kind };
      else if (pat.outputs && pat.outputs.length) {
        var ck = pat.clockOut ? asFreePins(d, nid, used, ['clk'])[0] : null, ins = asFreePins(d, nid, used, ['in']);
        var inp = pat.reverseTo ? ins.filter(function (p) { return pat.reverseTo.indexOf(p.name.toUpperCase()) >= 0; })[0] : ins[0];
        if (ck || inp) plan = { reverse: true, dst: nid, dstPin: ck || inp, from: pat.outputs[0], kind: ck ? 'clock' : pat.outKind };
      }
    }
  }

  /* a block-level pattern: the selected block feeds its entry block, from an output pin when it has one */
  /* ...unless the pattern already feeds its entry block itself (a clock tree's PLL runs from its own oscillator):
     a second source would be wrong, so the pattern then only sits next to the block */
  var entryFed = pat.entry && pat.entry.kind === 'clock' && (pat.edges || []).some(function (e) { return String(e.to).split('.')[0] === pat.entry.node; });
  if (!plan && nn && !pat.pins && pat.entry && map[pat.entry.node] && !asIsClock(d, nn) && !entryFed) {
    plan = { entry: true, srcPin: asPickOut(asPinsOf(nn).filter(function (p) { return p.dir === 'out'; })) || null };
  }
  /* a synchronizer (cdc) takes the clock of another domain: the one asked for, or the only other one */
  var chosen = null;
  if (clock && nodes[str(clock)]) chosen = { id: str(clock), node: nodes[str(clock)], pin: asClockPin(nodes[str(clock)]) };
  else if (pat.cdc && nn && !(plan && plan.clock)) { var oc = asOtherClocks(d, st, str(nn.id)); if (oc.length === 1) chosen = oc[0]; }
  /* any other pattern runs on the clock of the selected block, taken from the same pin that clocks it */
  if (!chosen && !pat.cdc && nn && !(plan && plan.clock) && (pat.clocks || []).length) {
    var fe = asFeedingEdge(d, str(nn.id)), fn = fe ? nodes[str(fe.from)] : null;
    if (fn) { chosen = { id: str(fn.id), node: fn, pin: asEndPin(d, fe, 'from', nodes) || asClockPin(fn) }; notes.push(asl('patClockOwn', asName(fn))); }
  }

  /* a pattern across two domains (a pulse synchronizer): its "src" clock net runs on the selected block's own clock */
  var own = null;
  if (nn && !(plan && plan.clock) && (pat.clocks || []).some(function (c) { return c.domain === 'src'; })) {
    var fe2 = asFeedingEdge(d, str(nn.id)), fn2 = fe2 ? nodes[str(fe2.from)] : null;
    if (fn2) own = { id: str(fn2.id), node: fn2, pin: asEndPin(d, fe2, 'from', nodes) || asClockPin(fn2) };
  }
  var srcOf = function (c, i) { return c.domain === 'src' ? own : i === 0 ? chosen : null; };
  /* the selected block's output drives the pattern's first input net */
  var feeds0 = !!(plan && !plan.reverse && !plan.entry && !plan.clock);

  /* local boxes: the pattern's blocks, the labels and the clock sources it may add */
  var hasClock = asHasClock(d), lbox = [];
  pat.nodes.forEach(function (n) { var s = asSize({ shape: n.shape, w: n.w, h: n.h, size: n.size, title: asText(n.title), desc: asText(n.desc) }); lbox.push({ id: n.id, x: n.x || 0, y: n.y || 0, w: s.w, h: s.h }); });
  (pat.inputs || []).forEach(function (net, i) { if (net.label && !(feeds0 && i === 0)) lbox.push({ x: net.label.x, y: net.label.y, w: net.label.w || 60, h: net.label.h || 24 }); });
  (pat.outLabels || []).forEach(function (o) { if (!(plan && plan.reverse && plan.from === o.pin)) lbox.push({ x: o.x, y: o.y, w: o.w || 60, h: o.h || 24 }); });
  (pat.clocks || []).forEach(function (c, i) { if (!hasClock && !(plan && plan.clock && i === 0) && !srcOf(c, i) && c.at) lbox.push({ x: c.at[0], y: c.at[1], w: 44, h: 62 }); });
  /* a pattern with its own frames (clock domains) takes their padding too: 20 px round the blocks, 30 px on top */
  var within = function (gid, g0) { for (var k = 0; gid && k < 20; k++) { if (gid === g0) return true; var pg = (pat.groups || []).filter(function (x) { return x.id === gid; })[0]; gid = pg && pg.parent; } return false; };
  (pat.groups || []).forEach(function (g) {
    var inG = lbox.filter(function (b) { var n = b.id ? localNode(b.id) : null; return n && within(n.group, g.id); }), gb0 = asBounds(inG);
    if (gb0) lbox.push({ x: gb0.x - 20, y: gb0.y - 30, w: gb0.w + 40, h: gb0.h + 50, frame: true });
  });
  var bb = asBounds(lbox) || { x: 0, y: 0, w: 100, h: 60 }, origin = { x: 0, y: 0 };
  var pinAt = function (ref, o) {
    var n0 = localNode(ref), p0 = localPin(ref), b0 = n0 ? lbox.filter(function (b) { return b.id === n0.id; })[0] : null;
    return b0 && p0 ? asPinPoint({ x: b0.x + o.x, y: b0.y + o.y, w: b0.w, h: b0.h }, p0) : null;
  };
  /* the bends of a wire from src into pin ref of the pattern: along the net's via points when the pattern gives them
     (a net that fans out over other blocks), else one tidy bend beside the pin */
  var bendsAt = function (src, ref, net, o, gap) {
    var v = net && net.via && net.via[ref], r1 = function (q) { return Math.round(q * 10) / 10; };
    if (v && src) {
      var pts = [[r1(v[0][0] + o.x), r1(src.y)]].concat(v.map(function (q) { return [r1(q[0] + o.x), r1(q[1] + o.y)]; }));
      return pts.filter(function (q, k) { return !k || q[0] !== pts[k - 1][0] || q[1] !== pts[k - 1][1]; });
    }
    var dst = pinAt(ref, o), lp = localPin(ref);
    return asNeat(src, dst, lp, gap) || (gap > 20 ? asNeat(src, dst, lp, 20) : null);
  };
  var net0 = plan && plan.clock ? (pat.clocks || [])[0] : (pat.inputs || [])[0];
  var boxes = asBoxes(d, st), byId = {};
  boxes.forEach(function (b) { byId[b.id] = b; });
  if (placed) {
    var nb = nn ? byId[str(nn.id)] : null, want;
    if (nb && plan && plan.reverse) {
      var lp = localPin(plan.from), ln = lbox.filter(function (b) { return b.id === localNode(plan.from).id; })[0];
      var dy = lp && ln ? asPinPoint(nb, plan.dstPin).y - (ln.y + lp.y * ln.h) + (plan.dstPin.y === 1 ? 40 : 0) : nb.y - bb.y;
      want = { x: nb.x - 90 - bb.w, y: bb.y + dy };
    } else if (nb && plan && plan.entry) {
      /* the selected block feeds the pattern's entry block: from the left when nothing of the pattern sits
         left of the entry block, else from above, so the new wire does not run through the pattern */
      var eb = lbox.filter(function (b) { return b.id === pat.entry.node; })[0];
      var blocked = function (side) {
        return lbox.some(function (b) {
          if (b === eb || !b.id) return false;
          return side === 'left' ? b.x + b.w <= eb.x + 1 && b.y < eb.y + eb.h && b.y + b.h > eb.y
            : b.y + b.h <= eb.y + 1 && b.x < eb.x + eb.w && b.x + b.w > eb.x;
        });
      };
      plan.side = !blocked('left') || blocked('top') ? 'left' : 'top';
      plan.eb = eb;
      plan.from = plan.srcPin ? asPinPoint(nb, plan.srcPin) : plan.side === 'left' ? { x: nb.x + nb.w, y: nb.y + nb.h / 2 } : { x: nb.x + nb.w / 2, y: nb.y + nb.h };
      want = plan.side === 'left' ? { x: plan.from.x + 90 - (eb.x - bb.x), y: plan.from.y - (eb.y + eb.h / 2 - bb.y) }
        : { x: plan.from.x + (plan.srcPin ? 60 : 0) - (eb.x + eb.w / 2 - bb.x), y: Math.max(plan.from.y, nb.y + nb.h) + 60 };
    } else if (nb) {
      var dy2 = nb.y - bb.y;
      if (plan && plan.pins && !plan.clock) {
        var ip = localPin(plan.pins[0]), inn = lbox.filter(function (b) { return b.id === localNode(plan.pins[0]).id; })[0];
        if (ip && inn && plan.srcPin) dy2 = asPinPoint(nb, plan.srcPin).y - (inn.y + ip.y * inn.h);
      }
      want = { x: nb.x + nb.w + 90, y: bb.y + dy2 };
    } else if (center) want = { x: center.x - bb.w / 2, y: center.y - bb.h / 2 };
    else { var all = asBounds(boxes); want = all ? { x: all.x + all.w + 100, y: all.y } : { x: 40, y: 40 }; }
    var good = null;
    if (nb && plan && (plan.pins || plan.reverse) && !plan.clock) {
      /* the selected block counts too, shrunk a little so a wire may leave its pin but not run back through it */
      var others = boxes.filter(function (b) { return b.id !== str(nn.id); }).concat([{ x: nb.x + 3, y: nb.y + 3, w: nb.w - 6, h: nb.h - 6 }]);
      /* every new wire between the block and the pattern stays clear of other blocks */
      good = function (x, y) {
        var o = { x: x - bb.x, y: y - bb.y }, theirs = asPinPoint(nb, plan.reverse ? plan.dstPin : plan.srcPin || { x: 1, y: 0.5 });
        return (plan.reverse ? [plan.from] : plan.pins).every(function (ref) {
          var mine = pinAt(ref, o);
          if (!mine) return true;
          if (plan.reverse) return !asCrosses(asWirePath(mine, theirs, plan.dstPin), others);
          var b = bendsAt(theirs, ref, net0, o, 20);
          return !asCrosses(b ? [theirs].concat(b.map(function (q) { return { x: q[0], y: q[1] }; })).concat([mine]) : asWirePath(theirs, mine, localPin(ref)), others);
        });
      };
    }
    if (nb && plan && plan.entry) {
      var rest = boxes.filter(function (b) { return b.id !== str(nn.id); }).concat([{ x: nb.x + 3, y: nb.y + 3, w: nb.w - 6, h: nb.h - 6 }]);
      good = function (x, y) {
        var o = { x: x - bb.x, y: y - bb.y };
        var mine = lbox.filter(function (b) { return b !== plan.eb && !b.frame; }).map(function (b) { return { x: b.x + o.x, y: b.y + o.y, w: b.w, h: b.h }; });
        return !asCrosses(asEntryPath(plan, o), rest.concat(mine));
      };
    }
    /* frames of other groups are in the way too: the new blocks stay out of a frame they do not join */
    var okFrame = {}, byGroup = {};
    (d.groups || []).forEach(function (g) { if (g) byGroup[str(g.id)] = g; });
    var allow = function (gid) { for (var k = 0; gid && byGroup[gid] && !okFrame[gid] && k < 50; k++) { okFrame[gid] = true; gid = byGroup[gid].parent ? str(byGroup[gid].parent) : null; } };
    if (!(pat.groups || []).length) {
      if (pat.cdc) {
        if (chosen && chosen.node.group) allow(str(chosen.node.group));
        if (nn && nn.group && pat.nodes.some(function (n) { return n.domain === 'src'; })) allow(str(nn.group));
      }
      else if (nn && nn.group) allow(str(nn.group));
    }
    var walls = boxes.slice();
    if (st && st.L && st.L.groups) Object.keys(st.L.groups).forEach(function (gid) { if (!okFrame[gid] && byGroup[gid] && !byGroup[gid].hidden) walls.push(st.L.groups[gid]); });
    var snap = { x: bb.x + Math.round((want.x - bb.x) / 10) * 10, y: bb.y + Math.round((want.y - bb.y) / 10) * 10 };
    var spot = asFreeSpot(walls, { x: want.x, y: want.y, w: bb.w, h: bb.h }, 30, good, snap);
    origin = { x: Math.round(spot.x - bb.x), y: Math.round(spot.y - bb.y) };
  }
  var abs = {};
  lbox.forEach(function (b) { if (b.id) abs[b.id] = { x: b.x + origin.x, y: b.y + origin.y, w: b.w, h: b.h }; });
  var point = function (ref) { var n = localNode(ref), p = localPin(ref), b = n ? abs[n.id] : null; return b && p ? asPinPoint(b, p) : null; };

  /* a pattern with frames of its own (clock domains) keeps them apart from the frames already drawn */
  (pat.groups || []).forEach(function (g) {
    var grp = { id: gmap[g.id], label: asText(g.label), color: g.color };
    if (g.parent && gmap[g.parent]) grp.parent = gmap[g.parent];
    ops.push({ op: 'addGroup', group: grp });
  });
  var hasInitial = (d.nodes || []).some(function (m) { return m && m.initial === true; });
  var joinGroup = nn && nn.group && !(pat.groups || []).length && asGroupIds(d)[str(nn.group)] ? str(nn.group) : null;
  if (pat.cdc && nn) {
    /* a synchronizer belongs to the destination domain, but only joins its frame when it sits next to it */
    joinGroup = null;
    var gb = placed && chosen && chosen.node.group && st && st.L && st.L.groups ? st.L.groups[str(chosen.node.group)] : null;
    if (gb) {
      var px1 = bb.x + origin.x, py1 = bb.y + origin.y, gap = Math.max(gb.x - (px1 + bb.w), px1 - (gb.x + gb.w), gb.y - (py1 + bb.h), py1 - (gb.y + gb.h));
      if (gap <= 120) joinGroup = str(chosen.node.group);
    }
    if (chosen && !clock) notes.push(asl('patClockFrom', asName(chosen.node)));
  }
  var groupOf = {};
  pat.nodes.forEach(function (n) {
    var c = { id: map[n.id] };
    Object.keys(n).forEach(function (k) {
      if (k === 'id' || k === 'x' || k === 'y' || k === 'domain') return;
      c[k] = k === 'title' || k === 'desc' ? asText(n[k]) : edClone(n[k]);
    });
    if (c.group) c.group = gmap[c.group] || c.group;
    else if (n.domain === 'src') { if (placed && nn && nn.group && asGroupIds(d)[str(nn.group)]) c.group = str(nn.group); }
    else if (joinGroup) c.group = joinGroup;
    groupOf[n.id] = c.group || null;
    if (c.initial && hasInitial) delete c.initial;
    /* a second copy of a circuit pattern: sync1_2 is also titled sync1_2, so the two copies can be told apart */
    var suffix = map[n.id].slice(n.id.length);
    if (suffix && typeof c.title === 'string' && /^[A-Za-z0-9_]+$/.test(c.title)) c.title += suffix;
    if (placed) { c.x = origin.x + (n.x || 0); c.y = origin.y + (n.y || 0); }
    ops.push({ op: 'addNode', node: c });
    select.push(c.id);
  });
  var wire = function (from, to, kind, extra) {
    var op = { op: 'connect', from: from, to: to };
    if (kind) op.kind = kind;
    if (pat.pins && placed) op.route = 'orthogonal';
    if (extra) Object.keys(extra).forEach(function (k) { if (extra[k] !== undefined && extra[k] !== null) op[k] = extra[k]; });
    ops.push(op);
  };
  /* points: bends the pattern draws itself, such as a loop from QN back to D */
  (pat.edges || []).forEach(function (e) {
    var pts = placed && e.points ? e.points.map(function (q) { return [Math.round((q[0] + origin.x) * 10) / 10, Math.round((q[1] + origin.y) * 10) / 10]; }) : null;
    wire(mapEnd(e.from), mapEnd(e.to), e.kind, { label: asText(e.label) || undefined, dir: e.dir, points: pts });
  });
  var groupAt = function (ref) { var n0 = localNode(ref); return n0 ? groupOf[n0.id] : null; };

  if (plan && plan.entry) {
    var eop = { op: 'connect', from: plan.srcPin ? asRef(str(nn.id), plan.srcPin) : str(nn.id), to: map[pat.entry.node] };
    var epath = placed && plan.eb ? asEntryPath(plan, origin) : null;
    if (epath && epath.length > 2) eop.points = epath.slice(1, -1).map(function (q) { return [Math.round(q.x), Math.round(q.y)]; });
    if (pat.entry.kind) eop.kind = pat.entry.kind;
    if (pat.entry.label) eop.label = asText(pat.entry.label);
    ops.push(eop);
  } else if (plan && !plan.reverse) {
    var sp = nn && byId[str(nn.id)] && plan.srcPin ? asPinPoint(byId[str(nn.id)], plan.srcPin) : null;
    plan.pins.forEach(function (p) { wire(asRef(str(nn.id), plan.srcPin), mapEnd(p), plan.kind, { points: placed ? bendsAt(sp, p, net0, origin, plan.kind === 'clock' ? 34 : 20) : null }); });
  } else if (plan && plan.reverse) {
    var dp = byId[plan.dst] ? asPinPoint(byId[plan.dst], plan.dstPin) : null;
    wire(mapEnd(plan.from), asRef(plan.dst, plan.dstPin), plan.kind, { points: placed && !(byId[plan.dst] && byId[plan.dst].f) ? asNeat(point(plan.from), dp, plan.dstPin, plan.kind === 'clock' ? 34 : 20) : null });
  }

  (pat.inputs || []).forEach(function (net, i) {
    if (!net.label || (feeds0 && i === 0)) return;
    var lid = asUniq(net.label.text, taken), lb = { x: origin.x + net.label.x, y: origin.y + net.label.y, w: net.label.w || 60, h: net.label.h || 24 };
    var node = { id: lid, shape: 'text', title: net.label.text, w: lb.w, h: lb.h, style: { bold: true } };
    if (placed) { node.x = lb.x; node.y = lb.y; }
    if (groupAt(net.pins[0])) node.group = groupAt(net.pins[0]);
    ops.push({ op: 'addNode', node: node });
    select.push(lid);
    net.pins.forEach(function (p) { wire(lid, mapEnd(p), net.kind, { points: placed ? bendsAt({ x: lb.x + lb.w, y: lb.y + lb.h / 2 }, p, net, origin, 20) : null }); });
  });
  /* named outputs (a signal label on the pin), unless the output already drives the selected block */
  (pat.outLabels || []).forEach(function (o) {
    if (plan && plan.reverse && plan.from === o.pin) return;
    var lid = asUniq(o.text, taken), lb = { x: origin.x + o.x, y: origin.y + o.y, w: o.w || 60, h: o.h || 24 };
    var node = { id: lid, shape: 'text', title: o.text, w: lb.w, h: lb.h, style: { bold: true } };
    if (placed) { node.x = lb.x; node.y = lb.y; }
    if (groupAt(o.pin)) node.group = groupAt(o.pin);
    ops.push({ op: 'addNode', node: node });
    select.push(lid);
    wire(mapEnd(o.pin), lid, o.kind, { points: placed ? asNeat(point(o.pin), { x: lb.x, y: lb.y + lb.h / 2 }, { x: 0, y: 0.5 }, 20) : null });
  });
  (pat.clocks || []).forEach(function (c, i) {
    if (plan && plan.clock && i === 0) return;
    /* a clock already in the tab: the other domain's for a synchronizer, else the selected block's own */
    var src = srcOf(c, i);
    if (src) {
      var cb0 = byId[src.id], from0 = cb0 ? (src.pin ? asPinPoint(cb0, src.pin) : { x: cb0.x + cb0.w, y: cb0.y + cb0.h / 2 }) : null;
      c.pins.forEach(function (p) { wire(asRef(src.id, src.pin), mapEnd(p), 'clock', { points: placed ? bendsAt(from0, p, c, origin, 34) : null }); });
      return;
    }
    if (hasClock) { if (notes.indexOf(at('patClockOpen')) < 0) notes.push(at('patClockOpen')); return; }
    var cid = asUniq(c.title || 'clk', taken), cb = c.at ? { x: origin.x + c.at[0], y: origin.y + c.at[1], w: 44, h: 44 } : null;
    var node = { id: cid, shape: 'clock', title: c.title || 'clk' };
    if (placed && cb) { node.x = cb.x; node.y = cb.y; }
    if (groupAt(c.pins[0])) node.group = groupAt(c.pins[0]);
    ops.push({ op: 'addNode', node: node });
    select.push(cid);
    var srcPin = asPinByName({ shape: 'clock' }, 'CLK'), from = cb ? asPinPoint(cb, srcPin) : null;
    c.pins.forEach(function (p) { wire(cid + '.CLK', mapEnd(p), 'clock', { points: placed ? bendsAt(from, p, c, origin, 34) : null }); });
  });
  return { ops: ops, select: select, notes: notes, pattern: pat };
}

/* ---------- quick fixes for the Checks list ---------- */
function asLev(a, b) {
  var m = a.length, n = b.length, row = [];
  for (var j = 0; j <= n; j++) row[j] = j;
  for (var i = 1; i <= m; i++) {
    var prev = row[0];
    row[0] = i;
    for (var k = 1; k <= n; k++) {
      var tmp = row[k];
      row[k] = Math.min(row[k] + 1, row[k - 1] + 1, prev + (a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1));
      prev = tmp;
    }
  }
  return row[n];
}
/* The known names closest to a typo, at most 3. sure = safe to fix without asking: an exact match but for
   case, or one letter off in a word of 5 or more letters, with no other name as close. canon maps an alias
   to the name it stands for, so an alias and its own symbol do not count as two answers. */
function asClosest(word, list, canon) {
  var w = str(word).toLowerCase(), best = null, seen = {};
  if (!w) return null;
  list.forEach(function (c) {
    var s = String(c), l = s.toLowerCase(), d0 = asLev(w, l), key = canon ? canon(l) : l;
    /* a word that starts with a known name ("dffr2" and "dffr") is one letter off, but not with a name of
       3 letters or fewer: "orchestrator" is not "or" */
    if (l.length > 3 && w.length > 3 && (w.indexOf(l) === 0 || l.indexOf(w) === 0)) d0 = Math.min(d0, 1);
    if (!best || d0 < best.d) { best = { d: d0, items: [s] }; seen = {}; seen[key] = true; }
    else if (d0 === best.d && !seen[key]) { best.items.push(s); seen[key] = true; }
  });
  if (!best || best.d > Math.max(1, Math.floor(w.length / 3))) return null;
  best.sure = best.items.length === 1 && (best.d === 0 || (best.d === 1 && w.length >= 5));
  best.items = best.items.slice(0, 3);
  return best;
}
/* Fixes for one wiring problem from wiringChecks: [{ label, ops, safe }]. safe = only one sensible answer. */
function asWireFixes(raw, di, st, w) {
  var d = raw.diagrams[di], nodes = asNodes(d), out = [];
  var e = w.edge !== undefined ? (d.edges || [])[w.edge] : null;
  if ((w.key === 'reversed' || w.key === 'fromInput' || w.key === 'intoOutput') && e) out.push({ label: at('fReverse'), ops: [{ op: 'reverseEdge', edge: w.edge }], safe: w.key === 'reversed' });
  if (w.key === 'outOut' && e) out.push({ label: at('fDelete'), ops: [{ op: 'disconnect', edge: w.edge }] });
  if (w.key === 'twoDrivers' && e) {
    var other = str(e.to) === w.node ? e.from : e.to;
    out.push({ label: asl('fDeleteFrom', asName(nodes[str(other)]) || str(other)), ops: [{ op: 'disconnect', edge: w.edge }] });
  }
  if (w.key === 'needPin') {
    var n = nodes[w.node], pin = asPinsOf(n)[w.pin];
    if (n && pin) {
      var list = asClockSources(d, st, w.node);
      list.slice(0, 2).forEach(function (c, i) { out.push({ label: asl('fWireFrom', asName(c.node)), ops: [asWireOp(d, st, c.id, c.pin, w.node, pin, 'clock')], safe: list.length === 1 || (i === 0 && c.group && !list[1].group) }); });
      if (!list.length) out.push({ label: at('fAddClock'), ops: asAddClockOps(d, st, w.node, pin) });
    }
  }
  if (w.key === 'stacked' && nodes[w.node]) {
    var move = asStackedMoves(raw, di, st, [w]);
    if (move.length) out.push({ label: asl('fMove', asName(nodes[w.node])), ops: move, safe: true });
  }
  return out;
}
function asAddClockOps(d, st, id, pin) {
  var taken = {};
  Object.keys(asNodes(d)).forEach(function (k) { taken[k] = true; });
  var cid = asUniq('clk', taken), node = { id: cid, shape: 'clock', title: at('nClock') }, n = asNodes(d)[id];
  if (n && n.group) node.group = n.group;
  var ops = [{ op: 'addNode', node: node, near: id, side: 'left' }];
  if (asManual(d)) {
    var b = asBoxes(d, st).filter(function (x) { return x.id === id; })[0];
    if (b) {
      var p = asPinPoint(b, pin), boxes = asBoxes(d, st);
      var spot = asFreeSpot(boxes, { x: b.x - 110, y: p.y - 22, w: 44, h: 62 }, 20);
      node.x = Math.round(spot.x);
      node.y = Math.round(spot.y);
      var src = { x: node.x + 44, y: node.y + 22 };
      var skip = {};
      skip[id] = true;
      var op = { op: 'connect', from: cid + '.CLK', to: asRef(id, pin), kind: 'clock', route: 'orthogonal' }, pts = b.f ? null : asNeatClear(src, p, pin, 34, boxes, skip);
      if (pts) op.points = pts;
      return ops.concat([op]);
    }
  }
  return ops.concat([{ op: 'connect', from: cid + '.CLK', to: asRef(id, pin), kind: 'clock' }]);
}
/* Fixes for one input problem from edValidate (issues carry a code). */
function asFieldFixes(raw, di, st, q) {
  var d = raw.diagrams[di], out = [], m = /^(\w+):(\d+):(.*)$/.exec(q.vk || ''), code = q.code;
  if (!m || !code) return out;
  var table = m[1], row = +m[2], nodes = asNodes(d);
  if (table === 'nodes') {
    var n = (d.nodes || [])[row];
    if (!n) return out;
    var taken = {};
    Object.keys(nodes).forEach(function (k) { taken[k] = true; });
    if (code === 'idReq' || code === 'idDup') { var nid = asUniq(code === 'idDup' ? str(n.id) : 'n' + (row + 1), taken); out.push({ label: asl('fRename', nid), ops: [{ op: 'renameNode', index: row, to: nid }], safe: true }); }
    if (code === 'idChars') { var clean = asUniq(str(n.id).replace(/[^A-Za-z0-9_.:-]+/g, '_').replace(/^_+|_+$/g, '') || 'n' + (row + 1), taken); out.push({ label: asl('fRename', clean), ops: [{ op: 'renameNode', id: str(n.id), to: clean }], safe: true }); }
    if (code === 'shape') {
      var near = asClosest(n.shape, Object.keys(SYMBOLS).concat(Object.keys(SYMBOL_ALIAS), ['card', 'state', 'decision']), function (l) { return SYMBOL_ALIAS[l] || l; });
      if (near) near.items.forEach(function (v) { out.push({ label: asl('fUse', v), ops: [{ op: 'updateNode', id: str(n.id), set: { shape: v } }], safe: near.sure }); });
      out.push({ label: at('fCard'), ops: [{ op: 'updateNode', id: str(n.id), unset: ['shape'] }] });
    }
    if (code === 'icon') {
      var ic = asClosest(n.icon, Object.keys(ICONS));
      if (ic) ic.items.forEach(function (v) { out.push({ label: asl('fUse', v), ops: [{ op: 'updateNode', id: str(n.id), set: { icon: v } }], safe: ic.sure }); });
      out.push({ label: at('fNoIcon'), ops: [{ op: 'updateNode', id: str(n.id), unset: ['icon'] }] });
    }
    if (code === 'group') {
      out.push({ label: asl('fGroupNew', str(n.group)), ops: [{ op: 'addGroup', group: { id: str(n.group), label: str(n.group) } }] });
      out.push({ label: at('fGroupDrop'), ops: [{ op: 'updateNode', id: str(n.id), unset: ['group'] }] });
    }
  }
  if (table === 'edges' && code === 'end') {
    var e = (d.edges || [])[row], key = m[3];
    if (!e) return out;
    /* safe only when exactly one block is that close: "ff4" could be ff1, ff2, ff3 or ffa */
    var hit = asClosest(e[key], Object.keys(nodes));
    if (hit) hit.items.forEach(function (v) { var set = {}; set[key] = v; out.push({ label: asl('fEnd', v), ops: [{ op: 'updateEdge', edge: row, set: set }], safe: hit.sure }); });
    /* or the block was meant to be new: add it next to the other end */
    var want = str(e[key]), other = str(e[key === 'from' ? 'to' : 'from']);
    if (AS_ID_RE.test(want) && !nodes[want]) out.push({ label: asl('fAddMissing', want), ops: [{ op: 'addNode', node: { id: want, title: want }, near: nodes[other] ? other : undefined, side: key === 'from' ? 'left' : undefined }] });
    out.push({ label: at('fDelete'), ops: [{ op: 'disconnect', edge: row }] });
  }
  if (table === 'steps' && code === 'step') out.push({ label: at('fStepDrop'), ops: [{ op: 'removeStep', index: row }] });
  if (table === 'groups' && code === 'parent') {
    var g = (d.groups || [])[row];
    if (g) out.push({ label: at('fParentDrop'), ops: [{ op: 'updateGroup', id: str(g.id), unset: ['parent'] }], safe: true });
  }
  return out;
}

/* ---------- suggestions for the selected block ---------- */
var AS_SEQ = { dff: 1, dffr: 1, latch: 1, register: 1, counter: 1, sync: 1 };
var AS_GATE = { and: 1, nand: 1, or: 1, nor: 1, xor: 1, xnor: 1, not: 1, buffer: 1, mux: 1, alu: 1, adder: 1, multiplier: 1, comparator: 1 };
var AS_SERVICE = { api: 1, gear: 1, server: 1 };
/* names that say "a service" without calling for an icon: Order service, Dịch vụ thanh toán, Worker */
var AS_SERVICE_WORDS = /(^|[^a-z0-9])(service|services|svc|microservice|worker|workers|dich vu|consumer|handler|lambda)([^a-z0-9]|$)/;
var AS_CLIENT = { user: 1, browser: 1, mobile: 1, desktop: 1 };
/* What a block's name says it is: a symbol for circuit parts and flow shapes, an icon for software parts (the card stays a card). */
var AS_NAMES = [
  ['clockgate', ['clock gate', 'clk gate', 'icg', 'cong clock']], ['pll', ['pll', 'dll']], ['oscillator', ['osc', 'oscillator', 'xtal', 'crystal', 'thach anh']],
  ['clock', ['clk', 'clock', 'xung nhip']], ['fifo', ['fifo']], ['ram', ['sram', 'ram', 'dram', 'ddr', 'ddr3', 'ddr4', 'lpddr4', 'memory', 'bo nho']],
  ['rom', ['rom', 'flash', 'otp', 'efuse', 'eeprom']], ['mux', ['mux', 'multiplexer', 'bo chon']], ['adc', ['adc']], ['dac', ['dac']], ['alu', ['alu']],
  ['counter', ['counter', 'bo dem']], ['sync', ['synchronizer', 'sync', 'dong bo']], ['register', ['register', 'thanh ghi', 'reg']],
  ['dff', ['flip-flop', 'flipflop', 'flip flop', 'dff']], ['terminator', ['start', 'begin', 'end', 'finish', 'bat dau', 'ket thuc']],
  ['icon:database', ['database', 'db', 'csdl', 'co so du lieu', 'postgres', 'postgresql', 'mysql', 'mongodb']],
  ['icon:inbox', ['queue', 'kafka', 'rabbitmq', 'sqs', 'hang doi', 'topic']], ['icon:user', ['user', 'users', 'nguoi dung', 'khach hang', 'customer']],
  ['icon:globe', ['browser', 'trinh duyet', 'frontend', 'web app']], ['icon:webhook', ['api', 'gateway']], ['icon:smartphone', ['mobile', 'app di dong', 'dien thoai']],
  ['icon:mail', ['email', 'mail', 'notify', 'notification', 'thong bao']], ['icon:shield', ['firewall', 'tuong lua']], ['icon:zap', ['cache', 'redis']],
  ['icon:server', ['server', 'may chu', 'backend']]
];
var AS_SHAPE_NAMES = {
  en: { decision: 'decision (diamond)', terminator: 'start or end', clockgate: 'clock gate', pll: 'PLL', oscillator: 'oscillator', clock: 'clock source', fifo: 'FIFO',
        ram: 'RAM', rom: 'ROM', mux: 'multiplexer', adc: 'ADC', dac: 'DAC', alu: 'ALU', counter: 'counter', sync: 'synchronizer', register: 'register', dff: 'flip-flop',
        database: 'database', inbox: 'queue', user: 'user', globe: 'browser', webhook: 'API', smartphone: 'phone', mail: 'mail', shield: 'firewall', zap: 'cache', server: 'server' },
  vi: { decision: 'quyết định (hình thoi)', terminator: 'bắt đầu hoặc kết thúc', clockgate: 'cổng clock', pll: 'PLL', oscillator: 'bộ dao động', clock: 'nguồn clock', fifo: 'FIFO',
        ram: 'RAM', rom: 'ROM', mux: 'bộ chọn (mux)', adc: 'ADC', dac: 'DAC', alu: 'ALU', counter: 'bộ đếm', sync: 'bộ đồng bộ', register: 'thanh ghi', dff: 'flip-flop',
        database: 'cơ sở dữ liệu', inbox: 'hàng đợi', user: 'người dùng', globe: 'trình duyệt', webhook: 'API', smartphone: 'điện thoại', mail: 'thư', shield: 'tường lửa', zap: 'cache', server: 'máy chủ' }
};
function asShapeLabel(k) { var t = AS_SHAPE_NAMES[lang] || AS_SHAPE_NAMES.en; return t[k] || k; }
/* The part a software block plays, from its shape, its icon or its name: client, api, service, queue, cache or db. */
function asSoftKind(m) {
  var sh = normShape(m.shape), ic = str(m.icon), guess = sh === 'card' || sh === 'icon' ? asShapeFromName(asText(m.title) || str(m.id)) : null, gi = guess && guess.icon;
  if (sh === 'database' || ic === 'database' || gi === 'database') return 'db';
  if (sh === 'queue' || ic === 'inbox' || gi === 'inbox') return 'queue';
  if (ic === 'zap' || gi === 'zap') return 'cache';
  if (sh === 'api' || ic === 'webhook' || gi === 'webhook') return 'api';
  if (AS_SERVICE[sh] || /^(server|cog|settings|workflow|cpu|container|boxes)$/.test(ic) || gi === 'server') return 'service';
  if ((sh === 'card' || sh === 'icon') && AS_SERVICE_WORDS.test(normText(asText(m.title) || str(m.id)))) return 'service';
  if (sh === 'user' || sh === 'actor' || /^(user|users|user-cog)$/.test(ic) || gi === 'user') return 'person';
  if (AS_CLIENT[sh] || /^(globe|smartphone|laptop|monitor|app-window|tablet)$/.test(ic) || gi === 'globe' || gi === 'smartphone') return 'app';
  if (sh === 'cloud' || /^(network|router|cloud)$/.test(ic)) return 'edge';
  return null;
}
var AS_FLOW_SHAPES = { card: 1, box: 1, subroutine: 1, terminator: 1, parallelogram: 1, document: 1, hexagon: 1, trapezoid: 1, ellipse: 1, circle: 1 };
/* Suggestions: [{ label, ops, select }]. Wires for pins still free come first, then likely next blocks. */
/* ---------- what a block is, from its shape, icon and name ---------- */
var AS_NAME_RES = null;
function asShapeFromName(title) {
  var t = normText(title).replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (/\?$/.test(t)) return { shape: 'decision' };
  /* compiled once: this runs for every block each time a block is selected */
  if (!AS_NAME_RES) AS_NAME_RES = AS_NAMES.map(function (row) {
    return [row[0], new RegExp('(^|[^a-z0-9])(' + row[1].map(function (w) { return w.replace(/[-]/g, '\\-'); }).join('|') + ')([^a-z0-9]|$)')];
  });
  for (var i = 0; i < AS_NAME_RES.length; i++) {
    if (AS_NAME_RES[i][1].test(t)) return AS_NAME_RES[i][0].indexOf('icon:') === 0 ? { icon: AS_NAME_RES[i][0].slice(5) } : { shape: AS_NAME_RES[i][0] };
  }
  return null;
}
/* Chip blocks drawn as cards, as in an SoC block diagram. Strong words name the part outright; weak words
   (core, bus, memory, timer…) count only in a tab that already has a strong one, so an "Event bus" in a
   software diagram stays a software block. */
var AS_HW = [
  ['cpu', 'cpu|cpus|processor|risc v|riscv|cortex|mcu|hart|vi xu ly|bo xu ly', 'core|cores|arm'],
  ['acc', 'npu|gpu|tpu|dsp|accelerator|bo tang toc', ''],
  ['dma', 'dma', ''],
  ['bridge', 'bridge|cau noi', ''],
  ['irq', 'interrupt|interrupts|plic|clint|gic|nvic|ngat', ''],
  /* security and crypto engines, and the chip's own managers (power, clock, reset, alerts, pins), are chip blocks too:
     without these rows an "Alert handler" or an "AES" was taken for a software service */
  ['crypto', 'aes|hmac|kmac|sha|sha2|sha256|sha3|otbn|keymgr|csrng|entropy|edn|trng|rng|pke|rsa|ecc|ecdsa|crypto|cryptographic|cipher|mat ma', 'key|keys'],
  ['mgmt', 'pwrmgr|rstmgr|clkmgr|pmu|lifecycle|lc ctrl|alert|alerts|sensor|pinmux|padctrl|pad ctrl|pad control|sysrst|power manager|clock manager|reset manager|clock controller|reset controller|power controller|quan ly nguon|quan ly xung nhip', 'manager|mgr'],
  ['debug', 'rv dm|debug module|jtag|dmi|swd|go loi', 'debug'],
  ['mem', 'sram|ram|rom|dram|ddr|ddr3|ddr4|ddr5|lpddr|lpddr4|lpddr5|hbm|otp|efuse|eeprom|tcm|bo nho', 'memory|flash'],
  ['bus', 'axi|axi3|axi4|ahb|apb|tl ul|tlul|tilelink|crossbar|xbar|interconnect|noc', 'bus|fabric|matrix'],
  ['periph', 'uart|usart|spi|qspi|i2c|i2s|gpio|pwm|wdt|watchdog|adc|dac|usb|ethernet|sdio|rtc|pattgen|ngoai vi', 'timer|can|mac|phy']
];
var AS_HW_RES = null;
function asWords(n) { return normText(asText(n.title) || str(n.id)).replace(/[^a-z0-9]+/g, ' ').trim(); }
function asHwKind(n, ctx) {
  if (!n) return null;
  var sh = normShape(n.shape);
  if (sh === 'text' || sh === 'decision' || sh === 'state' || AS_CLOCK_SHAPES[sh] || pinList(shapeDef(sh)).length) return null;
  if (!AS_HW_RES) AS_HW_RES = AS_HW.map(function (r) {
    return { kind: r[0], strong: new RegExp('(^| )(' + r[1] + ')( |$)'), weak: r[2] ? new RegExp('(^| )(' + r[2] + ')( |$)') : null };
  });
  var t = asWords(n), hit = null;
  for (var i = 0; i < AS_HW_RES.length && !hit; i++) {
    var r = AS_HW_RES[i];
    if (r.strong.test(t) || (ctx && ctx.hw && r.weak && r.weak.test(t))) hit = r.kind;
  }
  if (hit === 'mem' && /(^| )(controller|ctrl|ctl|dieu khien)( |$)/.test(t)) hit = 'memctl';
  return hit;
}
/* What the tab is: pins = it has pin symbols (a circuit); hw = how many chip blocks are drawn as cards
   (an SoC block diagram); flow = flowchart shapes; states = a state machine. */
function asContext(d) {
  var c = { pins: false, hw: 0, flow: false, states: 0 };
  (d.nodes || []).forEach(function (n) {
    if (!n) return;
    var sh = normShape(n.shape);
    if (!c.pins && pinList(shapeDef(sh)).length) c.pins = true;
    if (sh === 'decision' || sh === 'terminator' || sh === 'parallelogram') c.flow = true;
    if (sh === 'state') c.states++;
    if (asHwKind(n, null)) c.hw++;
  });
  return c;
}
/* Where each block is drawn (its centre), from the rendered layout: hand-placed or automatic. */
function asCentres(d, st) {
  var out = {};
  if (st && st.L && st.L.nodes && st.d && st.d.kind === 'graph') Object.keys(st.L.nodes).forEach(function (k) { var p = st.L.nodes[k]; out[k] = { x: p.x, y: p.y }; });
  else (d.nodes || []).forEach(function (n) { if (n && finiteNum(n.x) !== null && finiteNum(n.y) !== null) { var s = asSize(n); out[str(n.id)] = { x: +n.x + s.w / 2, y: +n.y + s.h / 2 }; } });
  return out;
}
/* The things every suggestion for a tab needs, worked out once (the Next steps list asks for many blocks). */
function asMemo(raw, di, st) {
  var d = raw.diagrams[di], m = { d: d, nodes: asNodes(d), used: asUsed(d), cf: asClockFrom(d), ctx: asContext(d), boxes: asBoxes(d, st), pos: asCentres(d, st), kinds: {} };
  m.byId = {};
  m.boxes.forEach(function (b) { m.byId[b.id] = b; });
  m.kindOf = function (id) {
    if (!(id in m.kinds)) { var n = m.nodes[id], hk = n ? asHwKind(n, m.ctx) : null; m.kinds[id] = hk ? 'hw:' + hk : n ? asSoftKind(n) : null; }
    return m.kinds[id];
  };
  return m;
}
/* After a block in the middle of a chain is deleted: the wires that would join its two neighbours again. */
function asHealPairs(d, ids) {
  var gone = {}, nodes = asNodes(d), pairs = [];
  ids.forEach(function (k) { gone[str(k)] = true; });
  var edges = (d.edges || []).filter(Boolean);
  ids.forEach(function (k) {
    var id = str(k), ins = edges.filter(function (e) { return str(e.to) === id && !gone[str(e.from)]; });
    if (ins.length !== 1) return;
    /* walk on through deleted blocks with one way out, to the first block that stays */
    var cur = id, outE = null;
    for (var hop = 0; hop < 20; hop++) {
      var outs = edges.filter(function (e) { return str(e.from) === cur && str(e.to) !== cur; });
      if (outs.length !== 1) { outE = null; break; }
      outE = outs[0];
      if (!gone[str(outE.to)]) break;
      cur = str(outE.to);
    }
    if (!outE || gone[str(outE.to)] || !nodes[str(outE.to)] || str(ins[0].from) === str(outE.to)) return;
    var a = ins[0], fp = asEndPin(d, a, 'from', nodes), tp = asEndPin(d, outE, 'to', nodes);
    var op = { op: 'connect', from: asRef(str(a.from), fp), to: asRef(str(outE.to), tp) };
    if (a.kind || outE.kind) op.kind = a.kind || outE.kind;
    /* the label says what the first block sends, so it comes from the wire that left it */
    var lab = a.label || outE.label;
    if (lab && !fp) op.label = asText(lab);
    if (asManual(d) && (fp || tp)) op.route = 'orthogonal';
    pairs.push({ from: str(a.from), to: str(outE.to), op: op });
  });
  return pairs;
}
/* The heal hints the editor keeps for a few steps after a delete; none on the command line. */
function asHeals(d) {
  var h = typeof ED !== 'undefined' && ED && ED.heal ? ED.heal : null, nodes = asNodes(d);
  if (!h || h.diag !== ED.diag) return [];
  return h.pairs.filter(function (p) {
    return nodes[p.from] && nodes[p.to] && !(d.edges || []).some(function (e) { return e && str(e.from) === p.from && str(e.to) === p.to; });
  });
}

/* ---------- suggestions for one block ---------- */
function asSuggest(raw, di, st, id, memo) {
  var M = memo || asMemo(raw, di, st), d = M.d, nodes = M.nodes, n = nodes[id], out = [];
  /* a port of a frame or of a block's inside tab: what it connects to inside is for the engineer (or the AI) to draw */
  if (!n || (n.port && typeof n.port === 'object')) return out;
  var shape = normShape(n.shape), used = M.used, name = asName(n), manual = asManual(d), cf = M.cf, ctx = M.ctx;
  var boxes = M.boxes, byId = M.byId, pos = M.pos;
  var dist = function (a) { var p = pos[a], q = pos[id]; return p && q ? Math.hypot(p.x - q.x, p.y - q.y) : 1e6; };
  var edges = (d.edges || []).filter(Boolean);
  var outsFrom = edges.filter(function (e) { return str(e.from) === id; });
  var intoMe = edges.some(function (e) { return str(e.to) === id && str(e.from) !== id; });
  var linked = {};
  edges.forEach(function (e) { if (str(e.from) === id) linked[str(e.to)] = true; if (str(e.to) === id) linked[str(e.from)] = true; });
  var kindOf = M.kindOf, mine = kindOf(id), hk = mine && mine.indexOf('hw:') === 0 ? mine.slice(3) : null, myKind = hk ? null : mine;
  var taken = function () { var t = {}; Object.keys(nodes).forEach(function (k) { t[k] = true; }); return t; };
  /* a title nobody uses yet: "New step", then "New step 2", so blocks added one after another can be told apart */
  var freeTitle = function (t) {
    var used = {};
    (d.nodes || []).forEach(function (m) { if (m) used[str(asText(m.title)).toLowerCase()] = true; });
    if (!used[String(t).toLowerCase()]) return t;
    for (var k = 2; used[(t + ' ' + k).toLowerCase()]; k++) { /* next number */ }
    return t + ' ' + k;
  };

  /* right after a delete: join the two blocks the deleted one sat between */
  asHeals(d).forEach(function (p) {
    if (p.from === id) out.push({ label: asl('sgHeal', asName(nodes[p.to])), ops: [p.op] });
    else if (p.to === id) out.push({ label: asl('sgHealFrom', asName(nodes[p.from])), ops: [p.op] });
  });

  /* 0. a plain card whose name says what it is; not in an SoC drawn as cards, where a symbol would break the style */
  if (shape === 'card') {
    var byName = asShapeFromName(asText(n.title) || n.id);
    if (byName && byName.shape && !(hk && ctx.hw >= 2)) out.push({ label: asl('sgShape', asShapeLabel(byName.shape)), ops: [{ op: 'updateNode', id: id, set: { shape: byName.shape } }] });
    else if (byName && byName.icon && !n.icon) out.push({ label: asl('sgIcon', asShapeLabel(byName.icon)), ops: [{ op: 'updateNode', id: id, set: { icon: byName.icon } }] });
  }
  /* 1. pins with nothing on them */
  asFreePins(d, id, used, ['clk']).forEach(function (p) {
    var list = asClockSources(d, st, id);
    list.slice(0, 2).forEach(function (c) { out.push({ label: asl('sgWire', name + '.' + p.name, asName(c.node)), ops: [asWireOp(d, st, c.id, c.pin, id, p, 'clock')] }); });
    if (!list.length) out.push({ label: asl('sgAddClock', name + '.' + p.name), ops: asAddClockOps(d, st, id, p) });
  });
  /* a free input takes the nearest output on its left in the same group; a free output feeds the nearest input on its right */
  var sameSide = function (m, left) {
    var a = byId[str(m.id)], b = byId[id];
    if (!manual || !a || !b || str(m.group) !== str(n.group) || dist(str(m.id)) > 480) return false;
    return left ? a.x + a.w <= b.x + 20 : a.x >= b.x + b.w - 20;
  };
  var netLabels = [];
  asFreePins(d, id, used, ['in']).slice(0, 2).forEach(function (p) {
    var best = null;
    (d.nodes || []).forEach(function (m) {
      var mid = str(m && m.id);
      if (!mid || mid === id || !sameSide(m, true)) return;
      var outp = asPickOut(asPinsOf(m).filter(function (q) { return q.dir === 'out'; }));
      if (!outp || asIsClock(d, m, cf)) return;
      var score = dist(mid);
      if (!best || score < best.score) best = { id: mid, pin: outp, score: score };
    });
    if (best) out.push({ label: asl('sgWire', name + '.' + p.name, asName(nodes[best.id]) + '.' + best.pin.name), ops: [asWireOp(d, st, best.id, best.pin, id, p)] });
    else if (manual) netLabels.push({ pin: p, out: false });
  });
  var freeOut = asFreePins(d, id, used, ['out']);
  if (freeOut.length && asPinsOf(n).filter(function (p) { return p.dir === 'out'; }).length === freeOut.length) {
    var o = asPickOut(freeOut), sink = null;
    (d.nodes || []).forEach(function (m) {
      var mid = str(m && m.id);
      if (!mid || mid === id || !sameSide(m, false)) return;
      var ip = asFreePins(d, mid, used, ['in'])[0];
      if (!ip) return;
      var score = dist(mid);
      if (!sink || score < sink.score) sink = { id: mid, pin: ip, score: score };
    });
    if (sink) out.push({ label: asl('sgWireTo', name + '.' + o.name, asName(nodes[sink.id]) + '.' + sink.pin.name), ops: [asWireOp(d, st, id, o, sink.id, sink.pin)] });
    else if (manual && !AS_SEQ[shape] && !AS_GATE[shape]) netLabels.push({ pin: o, out: true });
  }
  /* a free pin with nothing near to wire it to gets a signal label (a net name), as in a schematic; these come
     after the next blocks, so Tab keeps building forward */
  var later = [];
  netLabels.slice(0, 2).forEach(function (q) {
    var b = byId[id];
    if (!b) return;
    var pt = asPinPoint(b, q.pin), tk = taken();
    var text = q.pin.name.toLowerCase(), lid = asUniq(text.replace(/[^a-z0-9_]/g, '_') || 'net', tk), w = Math.max(36, text.length * 8 + 16), h = 22;
    var want = q.pin.x === 0 ? { x: pt.x - w - 40, y: pt.y - h / 2 } : q.pin.x === 1 ? { x: pt.x + 40, y: pt.y - h / 2 } : q.pin.y === 1 ? { x: pt.x - w / 2, y: pt.y + 40 } : { x: pt.x - w / 2, y: pt.y - h - 40 };
    var spot = asFreeSpot(boxes, { x: want.x, y: want.y, w: w, h: h }, 12);
    var node = { id: lid, shape: 'text', title: text, x: Math.round(spot.x), y: Math.round(spot.y), w: w, h: h, style: { bold: true } };
    if (n.group) node.group = n.group;
    var conn = q.out ? { op: 'connect', from: asRef(id, q.pin), to: lid, route: 'orthogonal' } : { op: 'connect', from: lid, to: asRef(id, q.pin), route: 'orthogonal' };
    later.push({ label: asl(q.out ? 'sgNetOut' : 'sgNetIn', name + '.' + q.pin.name), ops: [{ op: 'addNode', node: node }, conn], select: [lid] });
  });

  /* 2. likely next blocks */
  var addNear = function (label, node, kind, edgeLabel, side, before) {
    node.id = asUniq(node.id, taken());
    if (typeof node.title === 'string') node.title = freeTitle(node.title);
    if (n.group && !node.group) node.group = n.group;
    var op = before ? { op: 'connect', from: node.id, to: id } : { op: 'connect', from: id, to: node.id };
    if (kind) op.kind = kind;
    if (edgeLabel) op.label = edgeLabel;
    out.push({ label: label, ops: [{ op: 'addNode', node: node, near: id, side: side || (before ? 'left' : undefined) }, op], select: [node.id] });
  };
  var addAfter = function (label, node, kind, edgeLabel, side) { addNear(label, node, kind, edgeLabel, side, false); };
  var withPattern = function (label, pid) {
    var pat = asPattern(pid);
    if (pat) out.push({ label: label, pattern: pid, why: asText(pat.desc) });
  };
  /* the nearest block of one of these kinds, one in the same group first */
  var nearestOf = function (kinds, skip) {
    var best = null;
    (d.nodes || []).forEach(function (m) {
      var mid = str(m && m.id);
      if (!mid || mid === id || (skip && skip(mid)) || kinds.indexOf(kindOf(mid)) < 0) return;
      var score = dist(mid) - (n.group && str(m.group) === str(n.group) ? 1e5 : 0);
      if (!best || score < best.score) best = { id: mid, score: score };
    });
    return best ? nodes[best.id] : null;
  };
  var into = {}, onto = {};
  edges.forEach(function (e) {
    if (str(e.to) === id && str(e.from) !== id) { var k1 = kindOf(str(e.from)); if (k1) into[k1] = true; }
    if (str(e.from) === id && str(e.to) !== id) { var k2 = kindOf(str(e.to)); if (k2) onto[k2] = true; }
  });
  /* wire this block to the nearest block of those kinds (dir 'in': that block feeds this one); none: add one */
  var link = function (kinds, dir, addLabel, node, edgeKind, side, edgeLabel) {
    /* not a block already wired to this one: that would only double the wire or close a loop */
    var there = nearestOf(kinds, function (mid) { return linked[mid]; });
    if (there) {
      var c = dir === 'in' ? { op: 'connect', from: str(there.id), to: id } : { op: 'connect', from: id, to: str(there.id) };
      if (edgeKind) c.kind = edgeKind;
      if (edgeLabel) c.label = edgeLabel;
      out.push({ label: dir === 'in' ? asl('sgLinkFrom', asName(there)) : asl('sgConnect', asName(there)), ops: [c] });
    } else if (addLabel) addNear(addLabel, node, edgeKind, edgeLabel, side, dir === 'in');
  };
  /* software: already wired to a block of that kind, nothing to offer; one exists elsewhere, wire to it; none, add one */
  var replica = function (mid) { return edges.some(function (e) { return str(e.to) === mid && kindOf(str(e.from)) === 'db'; }); };
  var offer = function (kind, addLabel, node, edgeKind, side) {
    if (onto[kind]) return;
    /* a database that another one feeds is its read replica: a service writes to the primary */
    var there = nearestOf([kind], function (mid) { return linked[mid] || (kind === 'db' && replica(mid)); });
    if (there) {
      var c = { op: 'connect', from: id, to: str(there.id) };
      if (edgeKind) c.kind = edgeKind;
      out.push({ label: asl('sgConnect', asName(there)), ops: [c] });
    } else addAfter(addLabel, node, edgeKind, null, side);
  };
  var outs = asPinsOf(n).filter(function (p) { return p.dir === 'out'; });
  /* the wires from Q, when every one of them ends on a signal label */
  var qFrom = AS_SEQ[shape] ? edges.filter(function (e) { var pp = str(e.from) === id ? asEndPin(d, e, 'from', nodes) : null; return pp && pp.name.toUpperCase() === 'Q'; }) : [];
  var qLabels = qFrom.length && qFrom.every(function (e) { return nodes[str(e.to)] && normShape(nodes[str(e.to)].shape) === 'text'; }) ? qFrom : [];
  if (AS_CLOCK_SHAPES[shape] || asIsClock(d, n, cf)) {
    withPattern(asl('sgClockGate', name), 'icg');
    var ff = { id: asUniq('ff', taken()), shape: 'dff' };
    ff.title = ff.id;
    if (n.group) ff.group = n.group;
    var cp = asClockPin(n);
    out.push({ label: asl('sgFlopOn', name), ops: [{ op: 'addNode', node: ff, near: id }, { op: 'connect', from: asRef(id, cp), to: ff.id + '.CLK', kind: 'clock', route: manual ? 'orthogonal' : undefined }], select: [ff.id] });
  } else if (AS_SEQ[shape] && (freeOut.some(function (p) { return p.name.toUpperCase() === 'Q'; }) || qLabels.length)) {
    /* only Q: the inverted QN is not where the next stage usually starts. When Q only drives signal labels, the
       new stage goes in before them and the labels move on to name its output. */
    var q = asPinsOf(n).filter(function (p) { return p.name.toUpperCase() === 'Q'; })[0], own = asFeedingClock(d, id);
    var nextShape = shape === 'dffr' || shape === 'register' ? shape : 'dff';
    var nf = { id: asUniq('ff', taken()), shape: nextShape };
    nf.title = nf.id;
    if (n.group) nf.group = n.group;
    var moves = [];
    if (qLabels.length && manual && byId[id]) {
      var bq = byId[id], nsz = asSize({ shape: nextShape }), dPin = asPinByName({ shape: nextShape }, 'D') || { y: 0.3 };
      var at0 = { x: Math.round(bq.x + bq.w + 74), y: Math.round(asPinPoint(bq, q).y - dPin.y * nsz.h) };
      var shift = at0.x + nsz.w + 44 - Math.min.apply(null, qLabels.map(function (e) { var lb = byId[str(e.to)]; return lb ? lb.x : 1e9; }));
      var moved = qLabels.map(function (e) { var lb = byId[str(e.to)]; return lb ? { id: lb.id, x: Math.round(lb.x + Math.max(0, shift)), y: Math.round(lb.y), w: lb.w, h: lb.h } : null; }).filter(Boolean);
      var skipIds = {};
      skipIds[id] = true;
      moved.forEach(function (m) { skipIds[m.id] = true; });
      var clear = boxes.filter(function (b0) { return !skipIds[b0.id]; }), fits = function (b0) { return !clear.some(function (c0) { return b0.x < c0.x + c0.w + 12 && c0.x < b0.x + b0.w + 12 && b0.y < c0.y + c0.h + 12 && c0.y < b0.y + b0.h + 12; }); };
      if (fits({ x: at0.x, y: at0.y, w: nsz.w, h: nsz.h }) && moved.every(fits)) {
        nf.x = at0.x;
        nf.y = at0.y;
        moves = moved.map(function (m) { return { op: 'updateNode', id: m.id, set: { x: m.x, y: m.y } }; });
      }
    }
    var ops2 = [{ op: 'addNode', node: nf, near: id }, { op: 'connect', from: asRef(id, q), to: nf.id + '.D', route: manual ? 'orthogonal' : undefined }];
    qLabels.forEach(function (e) { ops2.push({ op: 'updateEdge', edge: d.edges.indexOf(e), set: { from: nf.id + '.' + q.name } }); });
    ops2 = ops2.concat(moves);
    if (own) ops2.push({ op: 'connect', from: asRef(own, asClockPin(nodes[own])), to: nf.id + '.CLK', kind: 'clock', route: manual ? 'orthogonal' : undefined });
    if (nextShape === 'dffr') {
      /* the next stage shares the reset of this one */
      var rstIn = edges.filter(function (e) { var pp = str(e.to) === id ? asEndPin(d, e, 'to', nodes) : null; return pp && pp.name === 'RST_N'; })[0];
      if (rstIn) ops2.push({ op: 'connect', from: asRef(str(rstIn.from), asEndPin(d, rstIn, 'from', nodes)), to: nf.id + '.RST_N', kind: rstIn.kind || 'reset', route: manual ? 'orthogonal' : undefined });
    }
    out.push({ label: asl('sgNextFlop', name + '.' + q.name), ops: ops2, select: [nf.id] });
    if (asPattern('sync2')) asOtherClocks(d, st, id).slice(0, 2).forEach(function (c) { out.push({ label: asl('sgSyncTo', name + '.' + q.name, asName(c.node)), pattern: 'sync2', clock: c.id, why: asText(asPattern('sync2').desc) }); });
  } else if (AS_GATE[shape] && outs.length) {
    var r = { id: asUniq('reg', taken()), shape: 'dff' };
    r.title = r.id;
    if (n.group) r.group = n.group;
    var yp = asPickOut(outs);
    out.push({ label: asl('sgFlopAfter', name + '.' + yp.name), ops: [{ op: 'addNode', node: r, near: id }, { op: 'connect', from: asRef(id, yp), to: r.id + '.D', route: manual ? 'orthogonal' : undefined }], select: [r.id] });
  }
  if (shape === 'decision') {
    var labels = outsFrom.map(function (e) { return str(asText(e.label)).toLowerCase(); });
    var before = edges.filter(function (e) { return str(e.to) === id && str(e.from) !== id && nodes[str(e.from)]; })[0];
    var stepShape = before && /^(box|subroutine|card)$/.test(normShape(nodes[str(before.from)].shape)) ? nodes[str(before.from)].shape : null;
    var branch = function (bid) { var b = { id: bid, title: at('nStep') }; if (stepShape) b.shape = stepShape; if (before && nodes[str(before.from)].color) b.color = nodes[str(before.from)].color; return b; };
    var yes = at('yes'), no = at('no');
    if (outsFrom.length < 2) {
      if (labels.indexOf(yes.toLowerCase()) < 0) addAfter(asl('sgYes', yes), branch('yes'), 'ok', yes);
      if (labels.indexOf(no.toLowerCase()) < 0) {
        addAfter(asl('sgYes', no), branch('no'), 'fail', no, 'below');
        /* a check that fails often goes back a step and tries again */
        var prevE = edges.filter(function (e) { return str(e.to) === id && str(e.from) !== id && normShape((nodes[str(e.from)] || {}).shape) !== 'decision'; })[0];
        if (prevE) out.push({ label: asl('sgLoopBack', no, asName(nodes[str(prevE.from)])), ops: [{ op: 'connect', from: id, to: str(prevE.from), kind: 'fail', label: no }] });
      }
    } else if (outsFrom.length === 2 && labels.some(function (l) { return !l; })) {
      var ia = d.edges.indexOf(outsFrom[0]), ib = d.edges.indexOf(outsFrom[1]);
      out.push({ label: asl('sgLabel', yes, no), ops: [{ op: 'updateEdge', edge: ia, set: { label: yes, kind: 'ok' } }, { op: 'updateEdge', edge: ib, set: { label: no, kind: 'fail' } }] });
    }
  } else if (shape === 'state') {
    var leaves = outsFrom.some(function (e) { return str(e.to) !== id; });
    var initial = (d.nodes || []).filter(function (m) { return m && m.initial === true; })[0];
    if (!leaves && !n.final) {
      /* a machine usually returns to where it started; with four states or more that comes first */
      var back = initial && str(initial.id) !== id ? { label: asl('sgBackTo', asName(initial)), ops: [{ op: 'connect', from: id, to: str(initial.id) }] } : null;
      if (back && ctx.states >= 4) out.push(back);
      addAfter(at('sgNextState'), { id: 'state', shape: 'state', title: at('nState') });
      if (back && ctx.states < 4) out.push(back);
      if (ctx.states > 2) out.push({ label: at('sgFinal'), ops: [{ op: 'updateNode', id: id, set: { final: true } }] });
    }
    if (!initial) out.push({ label: at('sgInitial'), ops: [{ op: 'updateNode', id: id, set: { initial: true } }] });
    /* a state nothing leads to: wire it from the nearest state that stops */
    if (!intoMe && !n.initial && ctx.states > 1) {
      var from0 = null;
      (d.nodes || []).forEach(function (m) {
        var mid = str(m && m.id);
        if (!mid || mid === id || normShape(m.shape) !== 'state' || m.final) return;
        var score = dist(mid) + (edges.some(function (e) { return str(e.from) === mid && str(e.to) !== mid; }) ? 1e4 : 0);
        if (!from0 || score < from0.score) from0 = { id: mid, score: score };
      });
      if (from0) out.push({ label: asl('sgLinkFrom', asName(nodes[from0.id])), ops: [{ op: 'connect', from: from0.id, to: id }] });
    }
  } else if (hk) {
    /* an SoC drawn as cards: masters on a bus, memories and a bridge on the bus, peripherals behind the bridge */
    var busNode = function () { return { id: 'axi', title: at('nBus'), icon: 'network', color: 'slate', desc: at('dBus') }; };
    var hasKind = function (k) { return (d.nodes || []).some(function (m) { return m && str(m.id) !== id && kindOf(str(m.id)) === k; }); };
    var periphs = function () {
      var fed = {};
      edges.forEach(function (e) { if (/^hw:(bus|bridge)$/.test(kindOf(str(e.from)) || '')) fed[str(e.to)] = true; });
      var loose = nearestOf(['hw:periph'], function (mid) { return fed[mid]; });
      if (loose) { out.push({ label: asl('sgConnect', asName(loose)), ops: [{ op: 'connect', from: id, to: str(loose.id) }] }); return; }
      var have = (d.nodes || []).map(function (m) { return m ? asWords(m) : ''; }).join(' | ');
      var next = [['UART', 'uart', 'dUart'], ['GPIO', 'gpio', 'dGpio'], ['Timer', 'timer', 'dTimer'], ['SPI', 'spi|qspi', 'dSpi'], ['I2C', 'i2c', 'dI2c'], ['Watchdog', 'watchdog|wdt', 'dWdt']].filter(function (x) {
        return !new RegExp('(^| )(' + x[1] + ')( |$)').test(have);
      })[0];
      if (!next) return;
      /* it joins the frame the other peripherals of this bridge are in */
      var sib = edges.filter(function (e) { return str(e.from) === id && kindOf(str(e.to)) === 'hw:periph' && nodes[str(e.to)] && nodes[str(e.to)].group; })[0];
      var pnode = { id: next[1].split('|')[0], title: next[0], color: 'teal', desc: at(next[2]) };
      if (sib) pnode.group = str(nodes[str(sib.to)].group);
      addAfter(asl('sgHwPeriph', next[0]), pnode, null, 'APB', 'below');
    };
    if (hk === 'cpu' || hk === 'acc' || hk === 'dma') {
      if (!onto['hw:bus'] && !onto['hw:bridge']) link(['hw:bus'], 'out', at('sgHwBus'), busNode(), 'bus');
      if (hk === 'cpu' && !into['hw:irq'] && hasKind('hw:periph')) link(['hw:irq'], 'in', at('sgHwIrq'), { id: 'irq', title: at('nIrq'), color: 'teal', desc: at('dIrq') }, 'async', 'below', 'irq');
    } else if (hk === 'bus') {
      var apbish = /(^| )(apb|peripheral|periph|ngoai vi)( |$)/.test(asWords(n));
      if (!apbish && !into['hw:cpu'] && !into['hw:acc'] && !into['hw:dma'] && !into['hw:bus'] && !into['hw:bridge']) link(['hw:cpu'], 'in', at('sgHwCpu'), { id: 'cpu', title: 'CPU', icon: 'cpu', color: 'blue', desc: at('dCpu') }, 'bus');
      if (apbish) periphs();
      else {
        if (!onto['hw:mem'] && !onto['hw:memctl']) link(['hw:mem', 'hw:memctl'], 'out', at('sgHwMem'), { id: 'sram', title: 'SRAM', icon: 'memory', color: 'amber', desc: at('dSram') }, 'bus');
        /* TileLink (TL-UL) chips hang slow devices on a second crossbar, not on an APB bridge */
        if (!onto['hw:bridge'] && !onto['hw:bus'] && !/(^| )(tl ul|tlul|tilelink)( |$)/.test(asWords(n))) link(['hw:bridge'], 'out', at('sgHwBridge'), { id: 'apb', title: at('nBridge'), icon: 'split', color: 'slate', desc: at('dBridge') }, 'bus', 'below');
      }
      /* chip blocks that sit on no bus yet: this bus is the nearest place for them */
      var busFed = {};
      edges.forEach(function (e) { if (/^hw:(bus|bridge)$/.test(kindOf(str(e.from)) || '')) busFed[str(e.to)] = true; if (/^hw:(bus|bridge)$/.test(kindOf(str(e.to)) || '')) busFed[str(e.from)] = true; });
      var looseDev = nearestOf(['hw:mem', 'hw:memctl', 'hw:periph', 'hw:crypto', 'hw:mgmt', 'hw:irq'], function (mid) { return busFed[mid]; });
      if (looseDev) out.push({ label: asl('sgConnect', asName(looseDev)), ops: [{ op: 'connect', from: id, to: str(looseDev.id), kind: 'bus' }] });
      var looseHost = nearestOf(['hw:cpu', 'hw:dma', 'hw:acc', 'hw:debug'], function (mid) { return busFed[mid]; });
      if (looseHost) out.push({ label: asl('sgConnect', asName(looseHost)), ops: [{ op: 'connect', from: str(looseHost.id), to: id, kind: 'bus' }] });
    } else if (hk === 'bridge') {
      if (!into['hw:bus'] && !into['hw:cpu']) link(['hw:bus'], 'in', at('sgHwBus'), busNode(), 'bus');
      periphs();
    } else if (hk === 'mem' || hk === 'memctl') {
      if (!intoMe) {
        var words = asWords(n), feed = /(^| )flash( |$)/.test(words) ? ['hw:periph'] : /(^| )(dram|ddr|ddr3|ddr4|ddr5|lpddr|lpddr4|lpddr5|hbm)( |$)/.test(words) && hk === 'mem' && hasKind('hw:memctl') ? ['hw:memctl'] : ['hw:bus'];
        link(feed, 'in', null, null, feed[0] === 'hw:bus' ? 'bus' : null);
      }
      if (hk === 'memctl' && !onto['hw:mem'] && /(^| )(dram|ddr|ddr3|ddr4|ddr5|lpddr|lpddr4|lpddr5|hbm|dimm)( |$)/.test(asWords(n))) addAfter(at('sgHwDram'), { id: 'dram', title: 'DRAM', icon: 'memory', color: 'amber', external: true, desc: at('dDram') });
    } else if (hk === 'periph' || hk === 'crypto' || hk === 'mgmt') {
      if (!into['hw:bridge'] && !into['hw:bus']) link(nearestOf(['hw:bridge']) ? ['hw:bridge'] : ['hw:bus'], 'in', null, null, 'bus');
      /* an interrupt for peripherals and crypto engines; pin muxes, pads and sensors have none to send */
      var irqB = nearestOf(['hw:irq']), quiet = /(^| )(pinmux|padctrl|pad|pads|sensor|ast)( |$)/.test(asWords(n));
      if (irqB && !onto['hw:irq'] && hk !== 'mgmt' && !quiet) out.push({ label: asl('sgHwIrqTo', asName(irqB)), ops: [{ op: 'connect', from: id, to: str(irqB.id), kind: 'async', label: 'irq' }] });
    } else if (hk === 'debug') {
      /* a debug module is a bus host (it reads and writes memory for the debugger) */
      if (!onto['hw:bus'] && !onto['hw:bridge']) link(['hw:bus'], 'out', at('sgHwBus'), busNode(), 'bus');
    } else if (hk === 'irq') {
      if (!onto['hw:cpu']) link(['hw:cpu'], 'out', null, null, 'async', null, 'irq');
    }
  } else if (myKind && !(ctx.hw >= 3 && myKind === 'service')) {
    if (myKind === 'service') {
      offer('db', at('sgDb'), { id: 'db', shape: 'database', title: at('nDb') }, 'storage');
      offer('cache', at('sgCache'), { id: 'cache', title: at('nCache'), icon: 'zap', color: 'amber', size: 'sm', desc: at('dCache') }, 'storage', 'below');
      offer('queue', at('sgQueue'), { id: 'queue', shape: 'queue', title: at('nQueue') }, 'async');
    } else if ((myKind === 'api' || myKind === 'edge') && !outsFrom.length) offer('service', at('sgService'), { id: 'service', shape: 'gear', title: at('nService') }, 'main');
    else if (myKind === 'app' && !Object.keys(linked).some(function (k) { return nodes[k] && /^(api|edge|service)$/.test(kindOf(k) || ''); })) offer('api', at('sgApi'), { id: 'api', shape: 'api', title: at('nApi') }, 'main');
    else if (myKind === 'person' && !outsFrom.length) offer('app', at('sgWeb'), { id: 'web', shape: 'browser', title: at('nWeb') }, 'main');
    else if (myKind === 'queue' && !outsFrom.length) offer('service', at('sgConsumer'), { id: 'consumer', shape: 'gear', title: at('nConsumer') }, 'async');
    else if (myKind === 'db' && !outsFrom.length && !replica(id)) {
      /* one read replica; a replica does not get its own */
      addAfter(at('sgReplica'), { id: 'replica', shape: 'database', title: at('nReplica') }, 'async');
    }
  }
  later.forEach(function (x) { out.push(x); });
  /* a block on its own: wire it from a block before it (the nearest on the left or above, or the one listed before it) */
  var plain = !myKind && !hk && shape !== 'text' && shape !== 'state' && !asPinsOf(n).length;
  if (plain && !Object.keys(linked).length && (d.nodes || []).length > 1) {
    var prev = null, me = pos[id];
    (d.nodes || []).forEach(function (m, k) {
      var mid = str(m && m.id);
      if (!mid || mid === id || normShape(m.shape) === 'text') return;
      var p = pos[mid], score = me && p ? Math.hypot(p.x - me.x, p.y - me.y) + (p.x > me.x + 20 && p.y > me.y + 20 ? 400 : 0) : 1e6 - k;
      if (!prev || score < prev.score) prev = { id: mid, score: score };
    });
    if (prev) out.push({ label: asl('sgLinkFrom', asName(nodes[prev.id])), ops: [{ op: 'connect', from: prev.id, to: id }] });
  }
  /* a step in the middle of a flow: put one more step between it and the next */
  if (!myKind && !hk && AS_FLOW_SHAPES[shape] && outsFrom.length === 1 && str(outsFrom[0].to) !== id && nodes[str(outsFrom[0].to)]) {
    var nxt = nodes[str(outsFrom[0].to)];
    var step = { id: asUniq('step', taken()), title: freeTitle(at('nStep')) };
    if (/^(box|subroutine|card)$/.test(shape) && n.shape) step.shape = n.shape;
    if (n.color) step.color = n.color;
    if (n.group) step.group = n.group;
    var k0 = d.edges.indexOf(outsFrom[0]), back = { op: 'connect', from: step.id, to: str(nxt.id) };
    if (outsFrom[0].kind) back.kind = outsFrom[0].kind;
    out.push({ label: asl('sgBetween', name, asName(nxt)), ops: [{ op: 'addNode', node: step, near: id }, { op: 'updateEdge', edge: k0, set: { to: step.id } }, back], select: [step.id] });
  }
  /* the last block of a flow: one more after it (not after an end terminator), or end the flow there */
  if (!myKind && !hk && AS_FLOW_SHAPES[shape] && !outsFrom.length && !n.final && !(shape === 'terminator' && intoMe)) {
    var copy = { id: ctx.flow ? 'step' : 'n', title: ctx.flow ? at('nStep') : at('nBlock') };
    if (n.shape && !pinList(shapeDef(normShape(n.shape))).length && shape !== 'terminator') copy.shape = n.shape;
    if (n.color) copy.color = n.color;
    addAfter(ctx.flow ? at('sgNextStep') : at('sgAfter'), copy);
    /* a flowchart: besides the next step, a yes/no check or the end */
    if (ctx.flow && shape !== 'terminator') addAfter(at('sgCheck'), { id: 'check', shape: 'decision', title: at('nCheck') });
    if (ctx.flow && shape !== 'terminator' && intoMe) addAfter(at('sgEnd'), { id: 'end', shape: 'terminator', title: at('nEnd') });
  }
  return out.slice(0, 8);
}

/* ---------- frames for a diagram that has grown: blocks of one clock domain, peripherals behind a bridge, services ---------- */
function asGroupSteps(M) {
  var d = M.d, nodes = M.nodes, out = [], edges = (d.edges || []).filter(Boolean), gids = asGroupIds(d), colors = ['blue', 'teal', 'violet', 'amber'], k = 0;
  var free = function (id) { return nodes[id] && !nodes[id].group && normShape(nodes[id].shape) !== 'text'; };
  /* a set of blocks that belong together: into the one frame some of them are in already, else a new frame of 3 or more */
  var gather = function (ids, label, gid, title) {
    var inFrames = {}, loose = ids.filter(free);
    ids.forEach(function (m) { if (nodes[m] && nodes[m].group) inFrames[str(nodes[m].group)] = true; });
    var fs = Object.keys(inFrames);
    if (fs.length === 1 && loose.length) {
      var g = asGroupIds(d)[fs[0]];
      out.push({ node: loose[0], label: asl('nsJoinFrame', loose.length, asText(g && g.label) || fs[0]), ops: loose.map(function (m) { return { op: 'updateNode', id: m, set: { group: fs[0] } }; }) });
      return;
    }
    if (fs.length || loose.length < 3) return;
    var id = asUniq(gid, gids);
    gids[id] = true;
    var ops = [{ op: 'addGroup', group: { id: id, label: title, color: colors[k++ % colors.length] } }];
    loose.forEach(function (m) { ops.push({ op: 'updateNode', id: m, set: { group: id } }); });
    out.push({ node: loose[0], label: label, ops: ops });
  };
  /* clock domains, when there are two clocks or more */
  var clocks = (d.nodes || []).filter(function (n) { return n && asIsClock(d, n, M.cf); });
  if (clocks.length > 1) clocks.forEach(function (c) {
    var cid = str(c.id), ids = [cid];
    edges.forEach(function (e) {
      if (str(e.from) !== cid || ids.indexOf(str(e.to)) >= 0 || !nodes[str(e.to)]) return;
      var p = asEndPin(d, e, 'to', nodes);
      if (e.kind === 'clock' || (p && p.dir === 'clk')) ids.push(str(e.to));
    });
    if (ids.length >= 4) gather(ids, asl('nsGroupClock', ids.length - 1, asName(c)), 'dom_' + cid, asl('gDomain', asName(c)));
  });
  /* peripherals behind a bridge or an APB bus */
  (d.nodes || []).forEach(function (b) {
    var bid = str(b && b.id);
    if (!bid || !/^hw:(bridge|bus)$/.test(M.kindOf(bid) || '')) return;
    var ids = edges.filter(function (e) { return str(e.from) === bid && M.kindOf(str(e.to)) === 'hw:periph'; }).map(function (e) { return str(e.to); });
    if (ids.length >= 3) gather(ids, asl('nsGroupPeriph', ids.filter(free).length, asName(b)), 'periph', at('gPeriph'));
  });
  /* software services */
  var svc = (d.nodes || []).filter(function (n) { return n && M.kindOf(str(n.id)) === 'service'; }).map(function (n) { return str(n.id); });
  if (svc.length >= 3) gather(svc, asl('nsGroupSvc', svc.filter(free).length), 'services', at('gServices'));
  return out;
}

/* ---------- next steps for the whole tab, when no block is selected ---------- */
/* Rejoin what a delete split, then blocks that stand alone, decisions without both branches, hubs that miss
   their usual partners, and the ends of chains, newest first: one suggestion each, at most 5. */
function asNextSteps(raw, di, st, memo) {
  var M = memo || asMemo(raw, di, st), d = M.d, nodes = M.nodes, out = [], seen = {}, sameLabel = {};
  var add = function (id, s) {
    if (!s || out.length >= 5) return;
    var key = s.pattern ? s.pattern + '@' + id + '@' + (s.clock || '') : JSON.stringify(s.ops);
    /* at most two of one kind (five "send its interrupt" lines say less than two and something else) */
    if (seen[key] || (sameLabel[s.label] || 0) >= 2) return;
    if (M.ctx.pins && s.label === at('sgAfter')) return;
    seen[key] = true;
    sameLabel[s.label] = (sameLabel[s.label] || 0) + 1;
    var nm = asName(nodes[id]), label = s.label.indexOf(nm) >= 0 || (s.ops || []).some(function (o) { return o.op === 'addGroup'; }) ? s.label : asl('nsFor', nm, s.label);
    out.push({ node: id, label: label, ops: s.ops, pattern: s.pattern, clock: s.clock, select: s.select, why: s.why });
  };
  asHeals(d).forEach(function (p) { add(p.from, { label: asl('nsHeal', asName(nodes[p.from]), asName(nodes[p.to])), ops: [p.op] }); });
  /* a chip drawn automatically around a bus with many blocks: the bus-as-bar arrangement reads far better */
  if (!asManual(d) && !str(d.boardOf) && !d.detailOf && (d.nodes || []).length >= 10 && typeof hierArrangeBus === 'function') {
    var busDeg = {};
    (d.edges || []).forEach(function (e) { if (e && e.kind === 'bus') [str(e.from), str(e.to)].forEach(function (k) { busDeg[k] = (busDeg[k] || 0) + 1; }); });
    var hub0 = Object.keys(busDeg).filter(function (k) { return nodes[k] && busDeg[k] >= 6; })[0];
    if (hub0) { out.push({ node: hub0, label: typeof ht === 'function' ? ht('nsArrange') : 'Arrange', ops: [{ op: 'arrange', style: 'bus' }] }); seen['arrange'] = true; }
  }
  var deg = {}, outDeg = {};
  (d.edges || []).forEach(function (e) {
    if (!e) return;
    deg[str(e.from)] = (deg[str(e.from)] || 0) + 1;
    deg[str(e.to)] = (deg[str(e.to)] || 0) + 1;
    if (str(e.from) !== str(e.to)) outDeg[str(e.from)] = (outDeg[str(e.from)] || 0) + 1;
  });
  var cands = [], states = 0, initial = false;
  (d.nodes || []).forEach(function (m, k) {
    var id = str(m && m.id), sh = m ? normShape(m.shape) : '';
    if (!id || sh === 'text') return;
    if (sh === 'state') { states++; if (m.initial) initial = true; }
    var kind = M.kindOf(id) || '';
    if (!deg[id]) cands.push([id, 1, k]);
    else if (sh === 'decision' && (outDeg[id] || 0) < 2) cands.push([id, 2, k]);
    else if (/^(service|hw:bus|hw:bridge|hw:cpu)$/.test(kind)) cands.push([id, 3, k]);
    else if (!outDeg[id]) cands.push([id, 4, k]);
  });
  var frames = (d.nodes || []).length >= 6 ? asGroupSteps(M) : [];
  if (states && !initial) {
    var first = (d.nodes || []).filter(function (m) { return m && normShape(m.shape) === 'state'; })[0];
    add(str(first.id), { label: at('sgInitial'), ops: [{ op: 'updateNode', id: str(first.id), set: { initial: true } }] });
  }
  cands.sort(function (a, b) { return a[1] - b[1] || b[2] - a[2]; });
  /* blocks that stand alone and decisions first, then frames for a grown diagram, then hubs and the ends of chains;
     each block asks the full suggestion list, so only the first dozen candidates are asked */
  var placedFrames = false;
  for (var i = 0; i < cands.length && i < 12 && out.length < 5; i++) {
    if (!placedFrames && cands[i][1] >= 3) { placedFrames = true; frames.forEach(function (f) { add(f.node, f); }); }
    var list = asSuggest(raw, di, st, cands[i][0], M);
    add(cands[i][0], list.filter(function (s) { return s.pattern || (s.ops || []).some(function (o) { return o.op === 'addNode' || o.op === 'connect'; }); })[0] || list[0]);
  }
  if (!placedFrames) frames.forEach(function (f) { add(f.node, f); });
  return out;
}

/* ---------- in the editor: fix buttons, the Patterns list and the suggestion box ---------- */
function edRunOps(ops, label, select) {
  if (!ED) return false;
  clearTimeout(edUndoTimer);
  edPushUndo();
  var d = edDiagram(), st = d ? edStateFor(d) : null, res = asApplyOps(ED.raw, ED.diag, ops, st);
  if (res.errors.length) { edStatus(res.errors[0]); return false; }
  ED.raw = res.raw;
  if (select && select.length) {
    ED.multi = select.length > 1 ? select.slice() : null;
    ED.selected = { id: select[select.length - 1] };
    ED.revealRow = true;
  }
  edChanged(true, label);
  return true;
}
/* A message that the "draft saved" note does not cover for a few seconds. */
function edHoldStatus(msg) {
  if (!ED) return;
  edStatus(msg);
  ED.statusHold = Date.now() + 8000;
}
/* The middle of what is on screen, in drawing coordinates (the same sum as edPlaceNew). */
function edViewCenter() {
  var st = active;
  if (!st || !st.canvas || !st.L) return null;
  var r = st.canvas.getBoundingClientRect(), scale = svgScale(st);
  return { x: (st.canvas.scrollLeft + r.width / 2) / scale - st.L.ox, y: (st.canvas.scrollTop + r.height / 2) / scale - st.L.oy };
}
function edInsertPattern(pid, clock, fresh) {
  var d = edDiagram(), pat = asPattern(pid);
  if (!ED || !d || !pat || edTypeOf(d) !== 'graph') return;
  clearTimeout(edUndoTimer);
  edPushUndo();
  if (fresh) {
    /* from the start panel: the two sample blocks make way for the pattern */
    d.nodes = []; d.edges = []; d.steps = [];
    delete d.layout; delete d.route;
    ED.selected = null; ED.multi = null;
  }
  d.nodes = Array.isArray(d.nodes) ? d.nodes : [];
  var st = fresh ? null : edStateFor(d), sel = ED.selected && ED.selected.id !== undefined && !(ED.multi && ED.multi.length > 1) ? ED.selected.id : null;
  /* a pattern wired pin by pin needs hand-placed positions, the same switch a drag makes */
  if (pat.pins && !asManual(d) && d.nodes.length) asFreeze(d, st);
  var r = asPatternOps(ED.raw, ED.diag, st, pid, sel, sel || fresh ? null : edViewCenter(), clock);
  if (r.error) { edStatus(r.error); return; }
  var res = asApplyOps(ED.raw, ED.diag, r.ops, st);
  if (res.errors.length) { edStatus(res.errors[0]); return; }
  ED.raw = res.raw;
  if (fresh) {
    /* a new drawing: select the block the signal leaves from, so the suggested next block shows at once */
    var outRef = (pat.outputs || [])[0], outId = outRef ? r.ops.filter(function (o) { return o.op === 'addNode'; }).map(function (o) { return o.node.id; })
      .filter(function (nid) { return nid === outRef.split('.')[0] || nid.indexOf(outRef.split('.')[0] + '_') === 0; })[0] : null;
    ED.multi = null;
    ED.selected = outId ? { id: outId } : null;
  } else {
    ED.multi = r.select.length > 1 ? r.select.slice() : null;
    ED.selected = r.select.length ? { id: r.select[r.select.length - 1] } : null;
  }
  edChanged(true, asl('lPattern', asText(pat.title)));
  edHoldStatus(asl('patInserted', asText(pat.title)) + (r.notes.length ? ' ' + r.notes[0] : ''));
}
function edFixesFor(it) {
  if (it.hfix) return it.hfix;
  var d = edDiagram();
  if (!d || edTypeOf(d) !== 'graph' || (!it.w && !it.q)) return [];
  var st = edStateFor(d);
  return it.w ? asWireFixes(ED.raw, ED.diag, st, it.w) : asFieldFixes(ED.raw, ED.diag, st, it.q);
}
function edFixBar(fixes) {
  var bar = H('span', { class: 'ed-fixes' });
  fixes.forEach(function (f) {
    var b = H('button', { type: 'button', class: 'ed-fix' + (f.safe ? ' safe' : ''), text: f.label });
    b.addEventListener('click', function (ev) { ev.stopPropagation(); edRunOps(f.ops, asl('lFix', f.label)); });
    bar.appendChild(b);
  });
  return bar;
}
/* Every fix with a single sensible answer, as one undo step. The safe fixes of a pass go in together (renames last),
   so a large drawing is redrawn a few times, not once per problem; a failing batch falls back to one fix at a time. */
function edFixAll() {
  if (!ED) return;
  clearTimeout(edUndoTimer);
  edPushUndo();
  var view = edCaptureView(), done = 0, seen = {};
  var redraw = function () { currentRaw = ED.raw; renderSpec(ED.raw, true); };
  var apply = function (fixes) {
    /* all at once when they fit together, else one by one; renames go last so the others still find their blocks */
    var first = [], last = [];
    fixes.forEach(function (ops) { ops.forEach(function (op) { (op.op === 'renameNode' ? last : first).push(op); }); });
    var d = edDiagram(), res = asApplyOps(ED.raw, ED.diag, first.concat(last), edStateFor(d));
    if (!res.errors.length) { ED.raw = res.raw; done += fixes.length; }
    else fixes.forEach(function (ops) { var one = asApplyOps(ED.raw, ED.diag, ops, edStateFor(edDiagram())); if (!one.errors.length) { ED.raw = one.raw; done++; } });
    redraw();
  };
  /* stacked blocks move first, so the wires added next are bent round where the blocks end up */
  var d0 = edDiagram(), st0 = d0 && edTypeOf(d0) === 'graph' ? edStateFor(d0) : null;
  if (st0 && st0.L) {
    var moves = asStackedMoves(ED.raw, ED.diag, st0, wiringChecks(st0.d, st0.L).filter(function (w) { return w.key === 'stacked'; }));
    if (moves.length) apply(moves.map(function (op) { return [op]; }));
  }
  for (var pass = 0; pass < 4; pass++) {
    var d = edDiagram(), st = d ? edStateFor(d) : null;
    if (!d || edTypeOf(d) !== 'graph') break;
    var fixes = [];
    var take = function (list) {
      var f = list.filter(function (x) { return x.safe && !seen[JSON.stringify(x.ops)]; })[0];
      if (f) { seen[JSON.stringify(f.ops)] = true; fixes.push(f.ops); }
    };
    edValidate(d).forEach(function (q) { take(asFieldFixes(ED.raw, ED.diag, st, q)); });
    (st && st.L ? wiringChecks(st.d, st.L) : []).forEach(function (w) { if (w.key !== 'stacked') take(asWireFixes(ED.raw, ED.diag, st, w)); });
    if (!fixes.length) break;
    apply(fixes);
  }
  if (done) edChanged(true, asl('lFixAll', done));
  edRender();
  edRestoreView(view);
}
/* Moves for blocks sitting on others, worked out one after the other so two of them never take the same free spot. */
function asStackedMoves(raw, di, st, wires) {
  var d = raw.diagrams[di], boxes = asBoxes(d, st), ops = [], moved = {};
  wires.forEach(function (w) {
    if (moved[w.node]) return;
    var me = boxes.filter(function (b) { return b.id === w.node; })[0];
    if (!me) return;
    var spot = asFreeSpot(boxes.filter(function (b) { return b !== me; }), me, 24);
    me.x = Math.round(spot.x / 10) * 10;
    me.y = Math.round(spot.y / 10) * 10;
    moved[w.node] = true;
    ops.push({ op: 'updateNode', id: w.node, set: { x: me.x, y: me.y } });
  });
  return ops;
}
function edSafeCount(items) {
  var n = 0;
  items.forEach(function (it) { if (it.fixes && it.fixes.some(function (f) { return f.safe; })) n++; });
  return n;
}
function edRefreshSuggest() {
  var box = ED && ED.suggestBox;
  if (!box || !ED.body || !ED.body.contains(box)) return;
  box.textContent = '';
  box.hidden = true;
  ED.sgList = [];
  var d = edDiagram();
  if (!d || edTypeOf(d) !== 'graph' || !(d.nodes || []).length) return;
  if ((ED.multi && ED.multi.length > 1) || (ED.gsel && ED.gsel.length)) { if (typeof hierNoteBox === 'function') hierNoteBox(box); return; }
  var st = edStateFor(d), memo = asMemo(ED.raw, ED.diag, st), nodes = asNodes(d);
  var sel = ED.selected && ED.selected.id !== undefined && nodes[str(ED.selected.id)] ? str(ED.selected.id) : null;
  var list = sel ? asSuggest(ED.raw, ED.diag, st, sel, memo).map(function (x) { x.node = sel; return x; }) : [];
  var head = sel ? asl('sgTitle', asName(nodes[sel])) : at('nsTitle');
  /* nothing for this block, or nothing selected: what to do next anywhere in the tab */
  if (!list.length) {
    list = asNextSteps(ED.raw, ED.diag, st, memo);
    if (sel) head = asl('sgNoneNext', asName(nodes[sel]));
  }
  if (!list.length) { if (typeof hierNoteBox === 'function') hierNoteBox(box); return; }
  box.hidden = false;
  var off = edGhostOff();
  var tg = H('button', { type: 'button', class: 'ed-mini ed-sg-ghost', title: at('ghToggle'), 'aria-pressed': off ? 'false' : 'true', text: off ? at('ghOff') : at('ghOn') });
  tg.addEventListener('click', function () { edSetGhostOff(!edGhostOff()); edMarkSelection(); });
  box.appendChild(H('div', { class: 'ed-sg-head' }, [H('span', { text: '✦ ' + head }), tg]));
  var wrap = H('div', { class: 'ed-sg-list' });
  list.forEach(function (x, i) {
    /* the number is the key that applies it; why = what the pattern does, for whoever is new to it */
    var b = H('button', { type: 'button', class: 'ed-sg', title: x.why || asl('sgKey', i + 1) }, [H('kbd', { text: String(i + 1) }), H('span', { text: x.label })]);
    b.addEventListener('click', function () { edApplySuggestion(x); });
    wrap.appendChild(b);
  });
  box.appendChild(wrap);
  if (!sel) box.appendChild(H('p', { class: 'ed-note', text: at('nsHint') }));
  ED.sgList = list;
  if (typeof hierNoteBox === 'function') hierNoteBox(box);
}
/* A suggestion from the list, the keys 1 to 8 or the next steps: on the block it is for. */
function edApplySuggestion(x) {
  if (!ED || !x) return;
  if (x.node && !(ED.selected && str(ED.selected.id) === x.node)) { ED.selected = { id: x.node }; ED.multi = null; }
  if (x.pattern) edInsertPattern(x.pattern, x.clock);
  else edRunOps(x.ops, x.label, x.select || (x.node ? [x.node] : null));
}
/* The faint preview can be turned off by whoever finds it in the way; the choice is kept in this browser. */
function edGhostOff() { return !!(ED && ED.ghostOffAll) || storageGet('ad-ghost') === 'off'; }
function edSetGhostOff(v) {
  if (ED) ED.ghostOffAll = !!v;
  storageSet('ad-ghost', v ? 'off' : 'on');
  if (v) edClearGhost();
}
function edPatternSection(parent) {
  var list = asPatternList();
  if (!list.length) return;
  var sec = edSection('patterns', at('patterns') + ' (' + list.length + ')', false);
  var search = H('input', { type: 'search', class: 'ed-in ed-palsearch', placeholder: at('patSearch'), 'aria-label': at('patSearch'), spellcheck: 'false', autocomplete: 'off' });
  var box = H('div', { class: 'ed-pats' });
  var hay = function (p) { return normText([p.id, p.keywords, asText(p.title), asText(p.desc), p.title && p.title.en, p.title && p.title.vi].join(' ')); };
  var fill = function () {
    box.textContent = '';
    var words = normText(search.value).split(/\s+/).filter(Boolean);
    AS_PAT_CATS.forEach(function (cat) {
      var rows = list.filter(function (p) { var h = hay(p); return p.cat === cat[0] && words.every(function (w) { return h.indexOf(w) >= 0; }); });
      if (!rows.length) return;
      box.appendChild(H('div', { class: 'ed-gtitle', text: at(cat[1]) }));
      rows.forEach(function (p) {
        var add = H('button', { type: 'button', class: 'tb-btn ed-pat-add', text: '+ ' + at('patInsert'), 'aria-label': at('patInsert') + ' ' + asText(p.title) });
        add.addEventListener('click', function () { edInsertPattern(p.id); });
        box.appendChild(H('div', { class: 'ed-pat', 'data-pattern': p.id }, [asPatternThumb(p, 96, 56), H('div', { class: 'ed-pat-text' }, [H('strong', { text: asText(p.title) }), H('span', { text: asText(p.desc) })]), add]));
      });
    });
    if (!box.firstChild) box.appendChild(H('p', { class: 'ed-hint', text: at('patNone') }));
  };
  search.addEventListener('input', fill);
  sec.appendChild(H('p', { class: 'ed-note ed-tblnote', text: at('patHint') }));
  sec.appendChild(H('div', { class: 'ed-palhead' }, [search]));
  sec.appendChild(box);
  fill();
  parent.appendChild(sec);
}

/* ---------- for agents: scripts/assist.py opens the page with ?assist=1 and a command ---------- */
function asTabIndex(raw, want) {
  var list = raw.diagrams || [];
  for (var i = 0; i < list.length; i++) {
    var id = str(list[i].id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (i + 1));
    if (want ? (id === str(want) || str(list[i].id) === str(want)) : edTypeOf(list[i]) === 'graph') return i;
  }
  return -1;
}
function asStateOf(raw, di) {
  var d = raw.diagrams[di], id = str(d && d.id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (di + 1));
  return states.filter(function (st) { return st.d.id === id; })[0] || null;
}
/* The problems left on a tab, each with its fixes as ops. */
function asChecks(raw, di) {
  var d = raw.diagrams[di], st = asStateOf(raw, di), out = [];
  edValidate(d).forEach(function (q) { out.push({ text: q.where + ' · ' + q.field + ': ' + q.text, fixes: asFieldFixes(raw, di, st, q) }); });
  if (st && st.L) wiringChecks(st.d, st.L).forEach(function (w) { out.push({ text: w.text, fixes: asWireFixes(raw, di, st, w) }); });
  /* detail boards and inside tabs out of step, open ports, port names (hier.js); "soft" ones are advice, not errors */
  if (typeof hierIssues === 'function') hierIssues(raw, di).forEach(function (q) { out.push({ text: q.text, soft: !!q.soft, fixes: q.fixes || [] }); });
  return out.map(function (c) {
    var o = { text: c.text, fixes: c.fixes.map(function (f) { return { label: f.label, safe: !!f.safe, ops: f.ops }; }) };
    if (c.soft) o.soft = true;
    return o;
  });
}
function runCliAssist() {
  var done = function (o) { document.documentElement.setAttribute('data-export', encodeURIComponent(JSON.stringify(o))); };
  try {
    var el = document.getElementById('assist-cmd'), cmd = el ? JSON.parse(el.textContent) : {};
    var raw = edCanonical(currentRaw), di = asTabIndex(raw, cmd.diagram);
    if (di < 0) { done({ error: cmd.diagram ? asl('eNoTab', cmd.diagram) : asl('eNotGraph', '') }); return; }
    if (edTypeOf(raw.diagrams[di]) !== 'graph') { done({ error: asl('eNotGraph', cmd.diagram) }); return; }
    var tab = str(raw.diagrams[di].id) || ('diagram-' + (di + 1)), st = asStateOf(raw, di), result = { tab: tab }, ops = null, notes = [];
    if (cmd.action === 'insertPattern') {
      var pat = asPattern(cmd.pattern);
      if (!pat) { done({ error: asl('eNoPattern', cmd.pattern) }); return; }
      var d = raw.diagrams[di];
      d.nodes = Array.isArray(d.nodes) ? d.nodes : [];
      if (pat.pins && !asManual(d) && d.nodes.length) asFreeze(d, st);
      var r = asPatternOps(raw, di, st, cmd.pattern, cmd.near ? str(cmd.near) : null, null, cmd.clock ? str(cmd.clock) : null);
      if (r.error) { done({ error: r.error }); return; }
      ops = r.ops;
      notes = r.notes;
      result.added = r.select;
    } else if (cmd.action === 'applyOps') ops = cmd.ops;
    else if (cmd.action === 'board' || cmd.action === 'inside') {
      /* a detail board of the tab, or the inside of one of its blocks or frames in a tab of its own (hier.js) */
      var made = cmd.action === 'board' ? hierBuildBoard(raw, di) : hierOpenInside(raw, di, str(cmd.block));
      if (made.error) { done({ error: made.error === 'block' ? asl('eNoNode', cmd.block) : asl('eNotGraph', cmd.diagram || tab) }); return; }
      raw = made.raw;
      hierSync(raw, made.index);
      currentRaw = raw;
      renderSpec(raw, true);
      result[cmd.action === 'board' ? 'board' : 'inside'] = hierTabId(raw.diagrams[made.index], made.index);
      result.existed = !!made.existed;
      result.tab = hierTabId(raw.diagrams[made.index], made.index);
      result.spec = raw;
      result.checks = asChecks(raw, made.index);
      /* wires of a new board that run through a frame, over another frame's port or along another wire */
      if (cmd.action === 'board' && !made.existed) { var tg = hierTangles(raw.diagrams[made.index]); if (tg) result.tangles = tg.total; }
      done(result);
      return;
    }
    else if (cmd.action !== 'suggest') { done({ error: asl('eUnknown', cmd.action) }); return; }
    if (ops) {
      var res = asApplyOps(raw, di, ops, st);
      if (res.errors.length) { done({ error: res.errors.join('\n'), errors: res.errors }); return; }
      raw = res.raw;
      if (typeof hierSync === 'function') hierSync(raw, di);
      result.ops = ops;
      currentRaw = raw;
      renderSpec(raw, true);
      result.spec = raw;
    }
    result.notes = notes;
    result.checks = asChecks(raw, di);
    if (cmd.action === 'suggest') {
      var dd = raw.diagrams[di], nodes = cmd.node ? [str(cmd.node)] : Object.keys(asNodes(dd));
      /* a frame of a detail board: what can be done with it, and the notes worth writing about it */
      if (cmd.node && !asNodes(dd)[str(cmd.node)] && asGroupIds(dd)[str(cmd.node)]) {
        var fid = str(cmd.node), fr = asGroupIds(dd)[fid];
        result.suggestions = [];
        if (str(fr.detail)) result.suggestions.push({ node: fid, label: asl('sgFrameOpen', str(fr.detail)) });
        else if (str(fr.source)) result.suggestions.push({ node: fid, label: asl('sgFrameInside', fid, tab) });
        if ((dd.nodes || []).some(function (n) { return n && str(n.group) === fid && !n.port; })) result.suggestions.push({ node: fid, label: at('sgFrameTidy'), ops: [{ op: 'tidyFrame', id: fid }] });
        if (typeof hierNoteIdeas === 'function') hierNoteIdeas(raw, di, null, [fid]).forEach(function (q) {
          result.suggestions.push({ node: fid, label: at('sgFrameNote') + ': ' + q.text, ops: [{ op: 'addNote', note: { text: q.text, kind: q.kind, attach: q.attach || fid } }] });
        });
        done(result);
        return;
      }
      if (cmd.node && !asNodes(dd)[str(cmd.node)]) { done({ error: asl('eNoNode', cmd.node) }); return; }
      result.suggestions = [];
      var st2 = asStateOf(raw, di), memo = asMemo(raw, di, st2);
      /* an empty tab: where to start, as the editor's start panel offers it */
      if (!(dd.nodes || []).length) {
        result.nextSteps = [];
        AS_PAT_CATS.forEach(function (cat) {
          asPatternList().filter(function (p) { return p.cat === cat[0] && p.top; }).forEach(function (p) {
            result.nextSteps.push({ node: null, label: asl('sgStartFrom', asText(p.title)), pattern: p.id });
          });
        });
        done(result);
        return;
      }
      if (!cmd.node) result.nextSteps = asNextSteps(raw, di, st2, memo).map(function (s) {
        var item = { node: s.node, label: s.label };
        if (s.pattern) { item.pattern = s.pattern; if (s.clock) item.clock = s.clock; } else item.ops = s.ops;
        return item;
      });
      nodes.forEach(function (id) {
        if (result.suggestions.length >= 150) { result.truncated = true; return; }
        asSuggest(raw, di, st2, id, memo).forEach(function (s) {
          var item = { node: id, label: s.label };
          if (s.pattern) { item.pattern = s.pattern; if (s.clock) item.clock = s.clock; } else item.ops = s.ops;
          result.suggestions.push(item);
        });
      });
    }
    done(result);
  } catch (err) {
    done({ error: String(err && err.message ? err.message : err) });
  }
}


/* ---------- where to start: a panel for an empty tab or the untouched two-block sample ---------- */
function edIsStarter(d) {
  if (!d || edTypeOf(d) !== 'graph') return false;
  var n = d.nodes || [], e = d.edges || [];
  if (!n.length) return true;
  return n.length === 2 && e.length === 1 && str(n[0].id) === 'a' && str(n[1].id) === 'b' && /^(Khối|Block) A$/.test(str(n[0].title)) &&
    /^(Khối|Block) B$/.test(str(n[1].title)) && str(e[0].from) === 'a' && str(e[0].to) === 'b';
}
function edStartPanel() {
  var d = edDiagram();
  if (!ED || !d || !edIsStarter(d) || (ED.startOff && ED.startOff[ED.diag])) return null;
  var box = H('section', { class: 'ed-start', 'aria-label': at('stTitle') });
  var hide = function () { (ED.startOff || (ED.startOff = {}))[ED.diag] = true; box.remove(); };
  var close = H('button', { type: 'button', class: 'ed-mini ed-start-x', title: at('stClose'), 'aria-label': at('stClose'), text: '✕' });
  close.addEventListener('click', hide);
  box.appendChild(H('div', { class: 'ed-start-head' }, [H('strong', { text: '✦ ' + at('stTitle') }), close]));
  box.appendChild(H('p', { class: 'ed-note', text: at('stHint') }));
  var types = H('div', { class: 'ed-start-types' });
  [['graph', 'tGraph'], ['wave', 'tWave'], ['register', 'tRegister'], ['memory', 'tMemory'], ['chip', 'tChip'], ['pinout', 'tPinout']].forEach(function (q) {
    var b = H('button', { type: 'button', class: 'ed-start-card', 'data-type': q[0] }, [H('strong', { text: et('types')[q[0]] }), H('span', { text: at(q[1]) })]);
    b.addEventListener('click', function () { edStartType(q[0]); });
    types.appendChild(b);
  });
  var keep = H('button', { type: 'button', class: 'ed-fix', text: at('stKeep') });
  keep.addEventListener('click', hide);
  box.appendChild(H('div', { class: 'ed-gtitle', text: '1. ' + at('stType') }));
  box.appendChild(types);
  box.appendChild(H('div', { class: 'ed-start-row' }, [keep]));
  var pats = H('div', { class: 'ed-start-pats' });
  AS_PAT_CATS.forEach(function (cat) {
    var top = asPatternList().filter(function (p) { return p.cat === cat[0] && p.top; });
    if (!top.length) return;
    pats.appendChild(H('span', { class: 'ed-start-cat', text: at(cat[1]) }));
    top.forEach(function (p) {
      var b = H('button', { type: 'button', class: 'ed-sg', 'data-pattern': p.id, title: asText(p.desc), text: asText(p.title) });
      b.addEventListener('click', function () { edInsertPattern(p.id, null, true); });
      pats.appendChild(b);
    });
  });
  var all = H('button', { type: 'button', class: 'ed-fix ed-start-all', text: asl('stAllPats', asPatternList().length) });
  all.addEventListener('click', function () {
    var sec = ED.body.querySelector('.ed-sec[data-sec="patterns"]');
    if (!sec) return;
    sec.open = true;
    sec.scrollIntoView({ block: 'start' });
    var q = sec.querySelector('.ed-palsearch');
    if (q) q.focus();
  });
  pats.appendChild(all);
  box.appendChild(H('div', { class: 'ed-gtitle', text: '2. ' + at('stPattern') }));
  box.appendChild(pats);
  var ask = H('textarea', { class: 'ed-in ed-start-ask', rows: 2, placeholder: at('stAiPh'), spellcheck: 'false', 'aria-label': at('stAi') });
  var copy = H('button', { type: 'button', class: 'tb-btn', text: '✦ ' + at('stAiCopy') });
  copy.addEventListener('click', function () {
    edCopyText(AI_PROMPT + '\n\nCurrent diagram (JSON):\n```json\n' + JSON.stringify(ED.raw, null, 2) + '\n```\n\nRequest: ' + ask.value.trim(), et('aiCopied'));
  });
  box.appendChild(H('div', { class: 'ed-gtitle', text: '3. ' + at('stAi') }));
  box.appendChild(ask);
  box.appendChild(H('div', { class: 'ed-start-row' }, [copy]));
  box.appendChild(H('p', { class: 'ed-note', text: at('stAiHint') }));
  var answer = H('textarea', { class: 'ed-in ed-start-ask ed-start-answer', rows: 2, placeholder: at('stPasteAi'), spellcheck: 'false', 'aria-label': at('stPasteAi') });
  var apply = H('button', { type: 'button', class: 'tb-btn', text: et('apply') }), aErr = H('div', { class: 'ed-err', 'aria-live': 'polite' });
  apply.addEventListener('click', function () { var msg = edApplyAnswer(answer.value); aErr.textContent = msg || ''; });
  box.appendChild(answer);
  box.appendChild(H('div', { class: 'ed-start-row' }, [apply, aErr]));
  var open = H('button', { type: 'button', class: 'tb-btn', text: at('stOpen') });
  open.addEventListener('click', function () { var f = ED.panel.querySelector('.ed-head input[type="file"]'); if (f) f.click(); });
  var paste = H('button', { type: 'button', class: 'tb-btn', text: at('stPaste') });
  paste.addEventListener('click', function () {
    edShowPane('nodes');
    var b = Array.prototype.filter.call(ED.body.querySelectorAll('.ed-pane[data-pane="nodes"] .ed-tblwrap .tb-btn'), function (x) { return x.textContent === et('paste'); })[0];
    if (b) { b.click(); b.scrollIntoView({ block: 'nearest' }); }
  });
  box.appendChild(H('div', { class: 'ed-gtitle', text: '4. ' + at('stHave') }));
  box.appendChild(H('div', { class: 'ed-start-row' }, [open, paste]));
  return box;
}
function edStartType(type) {
  if (type === 'graph') { (ED.startOff || (ED.startOff = {}))[ED.diag] = true; edBuildForm(); return; }
  clearTimeout(edUndoTimer);
  edPushUndo();
  var cur = ED.raw.diagrams[ED.diag], t = edTemplate(type);
  if (cur && cur.id) t.id = cur.id;
  ED.raw.diagrams[ED.diag] = t;
  ED.selected = null;
  ED.multi = null;
  edChanged(true, el('lTab', et('types')[type]));
}

/* ---------- autocomplete on the drawing: the likely next block, faint, until Tab adds it ---------- */
function edGhostPick(list) {
  return list.filter(function (s) { return s.pattern || (s.ops || []).some(function (o) { return o.op === 'addNode' || o.op === 'connect'; }); })[0] || null;
}
function edClearGhost() {
  if (!ED) return;
  if (ED.ghostBar) { ED.ghostBar.remove(); ED.ghostBar = null; }
  var old = active && active.svg ? active.svg.querySelector('.ed-ghost') : null;
  if (old) old.remove();
  ED.ghost = null;
}
function edDrawGhost(st, id) {
  edClearGhost();
  if (edGhostOff()) return;
  var d = edDiagram();
  if (!d || !st || !st.L || !st.svg || !st.canvas || !st.L.nodes[id] || (ED.ghostOff && ED.ghostOff === id)) return;
  var s = edGhostPick(asSuggest(ED.raw, ED.diag, st, id, asMemo(ED.raw, ED.diag, st)));
  if (!s) return;
  ED.ghost = { id: id, s: s };
  var ops = s.pattern ? (asManual(d) ? asPatternOps(ED.raw, ED.diag, st, s.pattern, id, null, s.clock).ops : null) : s.ops;
  var root = st.svg.querySelector('g.root'), ghostBox = null;
  if (ops && asManual(d) && root) {
    var res = asApplyOps(ED.raw, ED.diag, ops, st);
    if (!res.errors.length) {
      var nd = res.raw.diagrams[ED.diag], had = asNodes(d), ndNodes = asNodes(nd), k = 1 / svgScale(st), T = THEMES[themeName], boxes = {};
      var g = S('g', { class: 'ed-ghost', 'pointer-events': 'none' });
      asBoxes(d, st).forEach(function (b) { boxes[b.id] = b; });
      (nd.nodes || []).forEach(function (n) {
        if (had[str(n.id)] || finiteNum(n.x) === null) return;
        var sz = asSize(n), b = { x: +n.x, y: +n.y, w: sz.w, h: sz.h }, shape = normShape(n.shape), glyph = !CORE_SHAPES[shape] && !!SYMBOLS[shape];
        boxes[str(n.id)] = b;
        ghostBox = asBounds(ghostBox ? [ghostBox, b] : [b]);
        if (glyph) g.appendChild(S('g', { transform: 'translate(' + fmt(b.x) + ' ' + fmt(b.y) + ')', opacity: 0.45 }, symbolElements(shape, b.w, b.h, { fill: 'none', stroke: T.ink, text: T.ink, strokeWidth: 1.4, opts: {} })));
        g.appendChild(S('rect', { x: fmt(b.x - 4), y: fmt(b.y - 4), width: fmt(b.w + 8), height: fmt(b.h + 8), rx: 7, style: 'fill:var(--accent-soft);stroke:var(--accent)',
          'fill-opacity': glyph ? 0.3 : 0.85, 'stroke-dasharray': '5 4', 'stroke-width': fmt(1.3 * k) }));
        g.appendChild(S('text', { x: fmt(b.x + b.w / 2), y: fmt(glyph ? b.y + b.h + 16 : b.y + b.h / 2 + 4), 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 650,
          style: 'fill:var(--accent)', text: str(asText(n.title)) || str(n.id) }));
      });
      (nd.edges || []).slice((d.edges || []).length).forEach(function (e) {
        var a = boxes[str(e.from)], b = boxes[str(e.to)];
        if (!a || !b) return;
        var pa = asEndPin(nd, e, 'from', ndNodes), pb = asEndPin(nd, e, 'to', ndNodes);
        var p1 = pa ? asPinPoint(a, pa) : { x: a.x + a.w, y: a.y + a.h / 2 }, p2 = pb ? asPinPoint(b, pb) : { x: b.x, y: b.y + b.h / 2 };
        var path = asWirePath(p1, p2, pb || { x: 0, y: 0.5 });
        g.appendChild(S('path', { d: 'M' + path.map(function (q) { return fmt(q.x) + ',' + fmt(q.y); }).join('L'), fill: 'none', style: 'stroke:var(--accent)',
          'stroke-dasharray': '5 4', 'stroke-width': fmt(1.5 * k), opacity: 0.85 }));
      });
      root.appendChild(g);
    }
  }
  var p = st.L.nodes[id], bar = H('div', { class: 'ed-edgebar ed-ghostbar', role: 'toolbar' });
  var ok = H('button', { type: 'button', class: 'ed-bb ed-ghost-ok', title: at('ghTab') }, [H('kbd', { text: 'Tab' }), H('span', { text: s.label })]);
  ok.addEventListener('click', function (ev) { ev.stopPropagation(); edAcceptGhost(); });
  var more = H('button', { type: 'button', class: 'ed-bb', title: at('ghMore'), 'aria-label': at('ghMore'), text: '⋯' });
  more.addEventListener('click', function (ev) {
    ev.stopPropagation();
    if (!ED.suggestBox) return;
    ED.suggestBox.scrollIntoView({ block: 'nearest' });
    var first = ED.suggestBox.querySelector('.ed-sg');
    if (first) first.focus();
  });
  bar.appendChild(ok);
  bar.appendChild(more);
  /* under the faint block when there is one, so the bar never hides it; else under the selected block */
  var sc = svgScale(st), off = svgOffset(st), under = ghostBox || { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
  bar.style.left = Math.round(off.x + (under.x + st.L.ox) * sc) + 'px';
  bar.style.top = Math.round(off.y + (under.y + under.h + st.L.oy) * sc + 26) + 'px';
  st.canvas.appendChild(bar);
  ED.ghostBar = bar;
}
function edAcceptGhost() {
  var g = ED && ED.ghost;
  if (!g) return;
  ED.ghost = null;
  if (g.s.pattern) edInsertPattern(g.s.pattern, g.s.clock); else edRunOps(g.s.ops, g.s.label, g.s.select);
}
/* Typing in a block's row selects that block (not a selection of several), so its suggestions follow the typing. */
function edFocusNode(n) {
  if (!ED || !n || (ED.multi && ED.multi.length > 1) || (ED.selected && ED.selected.id === str(n.id))) return;
  ED.selected = { id: str(n.id) };
  ED.multi = null;
  edMarkSelection();
}


/* ---------- a small picture of each pattern, for the Patterns list ---------- */
function asPatternThumb(pat, w, h) {
  var T = THEMES[themeName], list = [], byId = {};
  pat.nodes.forEach(function (n) {
    var sz = asSize({ shape: n.shape, w: n.w, h: n.h, size: n.size, title: asText(n.title), desc: asText(n.desc) });
    var b = { x: n.x || 0, y: n.y || 0, w: sz.w, h: sz.h, n: n };
    list.push(b);
    byId[n.id] = b;
  });
  var bb = asBounds(list);
  if (!bb) return null;
  var pad = 6, k = Math.min((w - pad * 2) / bb.w, (h - pad * 2) / bb.h, 0.7);
  var ox = (w - bb.w * k) / 2 - bb.x * k, oy = (h - bb.h * k) / 2 - bb.y * k;
  var g = S('g', { transform: 'translate(' + fmt(ox) + ' ' + fmt(oy) + ') scale(' + fmt(k) + ')' });
  var end = function (ref) {
    var s0 = String(ref), i = s0.indexOf('.'), b = byId[i < 0 ? s0 : s0.slice(0, i)];
    if (!b) return null;
    var p = i < 0 ? null : asPinByName(b.n, s0.slice(i + 1));
    return p ? asPinPoint(b, p) : { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  };
  (pat.edges || []).forEach(function (e) {
    var a = end(e.from), b = end(e.to);
    if (!a || !b) return;
    var mx = (a.x + b.x) / 2, mid = e.points ? e.points.map(function (q) { return { x: q[0], y: q[1] }; }) : [{ x: mx, y: a.y }, { x: mx, y: b.y }];
    g.appendChild(S('path', { d: 'M' + [a].concat(mid, [b]).map(function (q) { return fmt(q.x) + ',' + fmt(q.y); }).join('L'),
      fill: 'none', stroke: (T.edges || {})[e.kind] || T.muted, 'stroke-width': fmt(1.3 / k) }));
  });
  list.forEach(function (b) {
    var shape = normShape(b.n.shape);
    if (!CORE_SHAPES[shape] && SYMBOLS[shape] && shape !== 'text') {
      g.appendChild(S('g', { transform: 'translate(' + fmt(b.x) + ' ' + fmt(b.y) + ')' }, symbolElements(shape, b.w, b.h, { fill: T.symFill, stroke: T.ink, text: T.ink, strokeWidth: 1.3 / k, opts: {} })));
    } else if (shape !== 'text') {
      g.appendChild(S('rect', { x: fmt(b.x), y: fmt(b.y), width: fmt(b.w), height: fmt(b.h), rx: fmt(6), fill: PALETTE[b.n.color] || PALETTE.slate }));
    }
  });
  return S('svg', { class: 'ed-pat-thumb', width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, 'aria-hidden': 'true' }, [g]);
}

/* ---------- an answer pasted from an AI chat: a whole spec, or {"ops": [...]} for the open tab ---------- */
function edApplyAnswer(text) {
  var t = String(text || '').trim(), fence = t.match(/```(?:json)?\s*([\s\S]*?)```/), parsed;
  if (fence) t = fence[1];
  try { parsed = JSON.parse(t); } catch (e) { return et('jsonBad') + ' ' + e.message; }
  if (!parsed || typeof parsed !== 'object') return et('jsonBad');
  if (Array.isArray(parsed.ops) && !parsed.diagrams && !parsed.nodes) {
    var d = edDiagram(), res = d ? asApplyOps(ED.raw, ED.diag, parsed.ops, edStateFor(d)) : { errors: [et('jsonBad')] };
    if (res.errors.length) return res.errors.join(' · ');
    edRunOps(parsed.ops, et('lJson'));
    edHoldStatus(asl('opsApplied', parsed.ops.length));
    return null;
  }
  clearTimeout(edUndoTimer);
  edPushUndo();
  ED.raw = edCanonical(parsed);
  ED.diag = Math.min(ED.diag, Math.max(0, ED.raw.diagrams.length - 1));
  ED.selected = null;
  ED.multi = null;
  edChanged(true, et('lJson'));
  return null;
}
