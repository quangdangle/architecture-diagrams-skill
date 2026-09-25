/* AI in the page. The selected blocks or frames (or the whole tab) go to Claude Code on this computer through
   scripts/ai_bridge.py, with the request typed next to them or in the AI tab of the editor. The answer is a list of
   ops, the same ones quick fixes and patterns use. The page applies them to a copy, checks the result, and when the
   answer broke something it asks the AI to fix that (two rounds at most). The user sees the change first (green:
   added, amber: changed, red: removed) and applies it as one undo step; the AI's summary becomes a sticky note.
   Without the bridge the same request can be copied to any chat AI and its answer pasted back. */

var AIT = {
  en: {
    tab: 'AI', askTitle: 'Ask AI to change what is selected', box: 'Ask AI about {x}', boxTab: 'Ask AI about this tab', ph: 'What should change? For example: draw the inside of this block from its ports, with a reset synchronizer for each clock.',
    send: 'Ask', sending: 'Asking…', close: 'Close', model: 'Model', sonnet: 'Sonnet (fast)', opus: 'Opus (careful)',
    asking: 'Claude Code on this computer is working…', fixing: 'Checking the result and letting the AI fix it (round {x} of 2)…',
    preview: 'AI suggests: {x}', added: '{x} added', changed: '{x} changed', removed: '{x} removed', nothing: 'no change',
    accept: 'Apply', reject: 'Discard', again: 'Ask again', left: 'Still to fix: {x}', questions: 'AI asks: {x}',
    lAi: 'AI: {x}', noteHead: 'Request: {x}', notGraph: 'AI works on block diagrams, flows and schematics.',
    offline: 'The AI bridge is not running on this computer.', unpaired: 'The AI bridge runs, but this page is not paired with it yet.',
    connected: 'Connected to Claude Code {x} on this computer.', checking: 'Looking for the AI bridge…', recheck: 'Check again',
    start: 'Start the bridge in a terminal, then paste the pairing code it prints:', code: 'Pairing code', port: 'Port', save: 'Save',
    copyCmd: 'Copy command', copied: 'Copied', fallback: 'No bridge? Copy the request to any chat AI, then paste its JSON answer here:',
    copyReq: 'Copy the request', paste: 'Paste the answer', pasteBtn: 'Show the change', history: 'This session',
    eAuth: 'Claude Code on this computer is not signed in. Run claude once in a terminal to sign in (or claude setup-token and set CLAUDE_CODE_OAUTH_TOKEN), then start the bridge again.',
    eQuota: 'The Claude plan limit is reached for now; try again later or with Sonnet.', eBusy: 'The bridge is still answering the previous request.',
    eTimeout: 'The AI took too long; ask for a smaller change.', eOther: 'The AI could not answer: {x}', eOps: 'The answer could not be applied: {x}',
    eWait: 'Still waiting for the answer to the last request.', eStale: 'The diagram changed while the AI was working and its answer no longer fits; ask again.',
    chips: { frame: ['Draw the inside of this block from its ports', 'Wire every port to the inside', 'Add a reset synchronizer for each clock', 'Write a note describing this block'],
             node: ['Fix the problems in the Checks list', 'Rename the ports to the naming style', 'Add a 2-flop synchronizer in front of it', 'Write a note describing it'],
             tab: ['Fix every problem in the Checks list', 'Tidy the layout without changing the wiring', 'Write a note for each block with no description'] },
    stateAccepted: 'applied', stateRejected: 'discarded', stateFailed: 'failed'
  },
  vi: {
    tab: 'AI', askTitle: 'Nhờ AI sửa phần đang chọn', box: 'Nhờ AI sửa {x}', boxTab: 'Nhờ AI sửa tab này', ph: 'Muốn thay đổi thế nào? Ví dụ: vẽ phần bên trong khối này theo các cổng, mỗi miền clock có bộ đồng bộ reset.',
    send: 'Gửi', sending: 'Đang hỏi…', close: 'Đóng', model: 'Mô hình', sonnet: 'Sonnet (nhanh)', opus: 'Opus (kỹ hơn)',
    asking: 'Claude Code trên máy đang làm…', fixing: 'Đang kiểm tra kết quả và cho AI sửa lỗi (vòng {x}/2)…',
    preview: 'AI đề xuất: {x}', added: 'thêm {x}', changed: 'sửa {x}', removed: 'xoá {x}', nothing: 'không đổi gì',
    accept: 'Nhận', reject: 'Bỏ', again: 'Hỏi lại', left: 'Còn phải sửa: {x}', questions: 'AI hỏi lại: {x}',
    lAi: 'AI: {x}', noteHead: 'Yêu cầu: {x}', notGraph: 'AI chỉ làm với sơ đồ khối, lưu đồ và sơ đồ mạch.',
    offline: 'Cầu nối AI chưa chạy trên máy này.', unpaired: 'Cầu nối AI đang chạy nhưng trang này chưa được ghép với nó.',
    connected: 'Đã nối với Claude Code {x} trên máy này.', checking: 'Đang tìm cầu nối AI…', recheck: 'Kiểm tra lại',
    start: 'Chạy cầu nối trong Terminal, rồi dán mã ghép mà nó in ra:', code: 'Mã ghép', port: 'Cổng', save: 'Lưu',
    copyCmd: 'Chép lệnh', copied: 'Đã chép', fallback: 'Chưa có cầu nối? Chép yêu cầu sang AI chat bất kỳ, rồi dán câu trả lời JSON vào đây:',
    copyReq: 'Chép yêu cầu', paste: 'Dán câu trả lời', pasteBtn: 'Xem thay đổi', history: 'Trong phiên này',
    eAuth: 'Claude Code trên máy chưa đăng nhập. Mở Terminal chạy lệnh claude một lần để đăng nhập (hoặc claude setup-token rồi đặt biến CLAUDE_CODE_OAUTH_TOKEN), sau đó chạy lại cầu nối.',
    eQuota: 'Tài khoản Claude đã chạm hạn mức lúc này; thử lại sau hoặc chọn Sonnet.', eBusy: 'Cầu nối đang trả lời yêu cầu trước.',
    eTimeout: 'AI làm quá lâu; hãy nhờ một thay đổi nhỏ hơn.', eOther: 'AI chưa trả lời được: {x}', eOps: 'Không áp được câu trả lời: {x}',
    eWait: 'Đang chờ AI trả lời yêu cầu trước.', eStale: 'Sơ đồ đã đổi trong lúc AI làm nên câu trả lời không còn khớp; hãy hỏi lại.',
    chips: { frame: ['Vẽ phần bên trong khối này theo các cổng', 'Nối mọi cổng vào bên trong', 'Thêm bộ đồng bộ reset cho từng miền clock', 'Viết ghi chú mô tả khối này'],
             node: ['Sửa các lỗi trong danh sách kiểm tra', 'Đổi tên cổng theo quy ước', 'Thêm mạch đồng bộ 2 tầng phía trước', 'Viết ghi chú mô tả'],
             tab: ['Sửa hết lỗi trong danh sách kiểm tra', 'Sắp lại bố cục cho gọn, giữ nguyên dây nối', 'Viết ghi chú cho mỗi khối chưa có mô tả'] },
    stateAccepted: 'đã nhận', stateRejected: 'đã bỏ', stateFailed: 'lỗi'
  }
};
function aiT(k) { var tbl = AIT[lang] || AIT.en; return tbl[k] !== undefined ? tbl[k] : AIT.en[k]; }
function aiL(k, x) { return aiT(k).replace('{x}', x === undefined || x === null ? '' : String(x)); }

/* ---------- the bridge on this computer ---------- */
var AI_PORT = 8765;
function aiCfg() {
  var c = {};
  try { c = JSON.parse(storageGet('ad-ai') || '{}') || {}; } catch (e) { c = {}; }
  return { port: +c.port > 0 && +c.port < 65536 ? +c.port : AI_PORT, token: str(c.token), model: c.model === 'opus' ? 'opus' : 'sonnet' };
}
function aiSaveCfg(c) { storageSet('ad-ai', JSON.stringify({ port: c.port, token: c.token, model: c.model })); }
/* A page opened with #ai=<port>:<code> pairs itself once, then drops the code from the address. */
(function aiPairFromHash() {
  var parts = String(location.hash || '').replace(/^#/, '').split('&'), hit = null;
  parts = parts.filter(function (q) { var m = /^ai=(\d{2,5}):([A-Za-z0-9_-]{8,})$/.exec(q); if (m) hit = m; return !m && q; });
  if (!hit) return;
  var c = aiCfg();
  c.port = +hit[1];
  c.token = hit[2];
  aiSaveCfg(c);
  if (history.replaceState) history.replaceState(null, '', location.pathname + location.search + (parts.length ? '#' + parts.join('&') : ''));
})();
function aiFetch(path, body, ms) {
  var c = aiCfg(), ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var opts = { method: body ? 'POST' : 'GET', headers: {}, signal: ctl ? ctl.signal : undefined };
  if (c.token) opts.headers.Authorization = 'Bearer ' + c.token;
  if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
  var timer = ctl ? setTimeout(function () { ctl.abort(); }, ms || 260000) : null;
  return fetch('http://127.0.0.1:' + c.port + path, opts).then(function (r) {
    clearTimeout(timer);
    return r.json().then(function (j) { j.status = r.status; return j; }, function () { return { ok: false, status: r.status, error: 'bad-reply' }; });
  }, function (err) { clearTimeout(timer); return { ok: false, error: err && err.name === 'AbortError' ? 'timeout' : 'offline' }; });
}
function aiHealth() { return aiFetch('/health', null, 5000); }
function aiErrorText(res) {
  if (!res) return aiL('eOther', '?');
  if (res.error === 'offline') return aiT('offline');
  if (res.error === 'unpaired') return aiT('unpaired');
  if (res.error === 'busy') return aiT('eBusy');
  if (res.error === 'timeout') return aiT('eTimeout');
  if (res.code === 'auth') return aiT('eAuth');
  if (res.code === 'quota') return aiT('eQuota');
  return aiL('eOther', res.message || res.error || res.status);
}

/* ---------- what the AI is told ---------- */
var AI_OPS_DOC = [
  'Ops (JSON objects with "op"):',
  '- addNode {node: {id, title, shape, group, x, y, w, h, color, desc, ports, style}, near, side}: a new block. In a hand-placed tab give x, y (top-left, pixels).',
  '- updateNode {id, set: {...}, unset: [...]}: change fields of a block (not its id). removeNode {id}. renameNode {id, to}.',
  '- connect {from, to, kind, label, dir, route, points}: a wire. An end is a block id or "block.PIN" for a pin. disconnect / reverseEdge / updateEdge name a wire by {edge: index} or {from, to}.',
  '- addGroup {group: {id, label, color, parent, x, y, w, h}}, updateGroup {id, set}: frames.',
  '- addNote {note: {text, kind, attach}}: a sticky note; kind is note, constraint, reason, change, question, todo or legend; attach is a block or frame id or [from, to].',
  '- updateNote {id, set}, removeNote {id}. updateDiagram {set: {layout, route, direction, title}}.',
  '- tidyFrame {id}: lays out the blocks inside a frame in layers (signals left to right), lines its ports up with them and fits the frame. End with it after drawing the inside of a frame; then rough x, y are enough.'
].join('\n');
var AI_SCHEMA = { type: 'object', properties: {
  ops: { type: 'array', items: { type: 'object' } },
  note: { type: 'string' },
  questions: { type: 'array', items: { type: 'string' } }
}, required: ['ops', 'note'] };
function aiNamingRule() {
  var style = typeof hierNaming === 'function' ? hierNaming() : 'prefix';
  var dir = style === 'suffix' ? 'ports end in _i, _o or _io for their direction' : style === 'off' ? 'ports need no direction mark' : 'ports start with i_, o_ or io_ for their direction';
  return 'lower-case words joined by _ (snake_case); ' + dir + '; an active-low signal ends in _n (rst_n); instances u_<name>, registers r_<name>, wires w_<name>, ' +
         'parameters P_<NAME>, constants C_<NAME>, states S_<NAME>; keep the standard signal names of protocols (paddr, pwdata, awaddr, rdata ...); ' +
         'a bus interface keeps its role and protocol as its name, with no direction mark (s_axi_cpu, m_apb).';
}
function aiSystem() {
  return [
    'You change one tab of an Architecture Diagrams page. Answer only with JSON matching the schema: {"ops": [...], "note": "...", "questions": [...]}.',
    'The ops are applied in order, all or nothing.', AI_OPS_DOC, '',
    'Rules:',
    '- Change only what the request asks. Keep the ids of blocks that stay. New ids and names: ' + aiNamingRule(),
    '- In a hand-placed tab ("layout": "manual") every new block gets x and y, multiples of 10, at least 40 px from other blocks. A card (no shape) is about 216 px wide and 70 to 110 px tall: give it no w or h. Symbols keep their own size.',
    '- Inside a frame (context.frames gives its box, top-left x, y and w, h): set "group" to the frame id and keep the block 40 px inside the border, clear of the ports on the border.',
    '- A port node (it has "port") has pin EXT on the outside of its frame and pin INT on the inside: wire the inside of a frame to "<port id>.INT".',
    '- Wire pins by name ("u_sync.Q" to "u_ff.D"). Outputs drive inputs; never join two outputs; one source per input; wire every clock pin; clock wires get kind "clock", reset wires kind "reset".',
    '- Use the symbols listed below with their pins; a plain card (no shape) for a block without a standard symbol.',
    '- "note": one or two sentences in ' + (lang === 'vi' ? 'Vietnamese' : 'English') + ' saying what changed and which conditions now hold. It becomes a sticky note on the drawing.',
    '- When the request is unclear or cannot be done well, return no ops and ask in "questions" (same language).',
    '', 'Reference: the spec format, the symbols with their pins and the wiring rules.', typeof AI_PROMPT === 'string' ? AI_PROMPT : ''
  ].join('\n');
}
/* The tab as the AI sees it: the raw JSON without draw.io bookkeeping, plus frame boxes and the current problems. */
function aiTab(d) {
  var c = edClone(d);
  [].concat(c.nodes || [], c.edges || [], c.groups || []).forEach(function (o) { if (o && o.drawio) delete o.drawio; });
  return c;
}
function aiContextText(raw, di, targets, request, extra) {
  var d = raw.diagrams[di], st = active && active.d && active.L ? active : null, frames = {};
  if (st && st.d.kind === 'graph') Object.keys(st.L.groups || {}).forEach(function (g) { var b = st.L.groups[g]; frames[g] = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) }; });
  var ctx = { tab: aiTab(d), selected: targets && targets.ids ? targets.ids : [], selectedAre: targets && targets.kind === 'group' ? 'frames' : 'blocks',
              frames: frames, problems: aiProblems(raw, di).slice(0, 40), otherTabs: raw.diagrams.map(function (x, i) { return { id: hierTabId(x, i), title: str(asText(x.title)), type: edTypeOf(x) }; }) };
  return (extra ? extra + '\n\n' : '') + 'Context (JSON):\n' + JSON.stringify(ctx) + '\n\nRequest:\n' + request;
}
/* Every problem the checks find in a tab, as plain text (the same checks as the editor's Checks list). */
function aiProblems(raw, di) {
  var d = raw.diagrams[di], out = [];
  if (!d || edTypeOf(d) !== 'graph') return out;
  var keep = problems.length, keepList = problemList.length;
  try {
    var nd = normalizeDiagram(d, di);
    problemList.slice(keepList).forEach(function (p) { out.push(p.text); });
    if (nd.kind === 'graph' && nd.nodes.length) wiringChecks(nd, layoutDiagram(nd)).forEach(function (w) { out.push(w.text); });
  } catch (err) { out.push(String(err && err.message || err)); }
  problems.length = keep;
  problemList.length = keepList;
  edValidate(d).forEach(function (q) { out.push(q.where + ' · ' + q.field + ': ' + q.text); });
  if (typeof hierIssues === 'function') hierIssues(raw, di).filter(function (q) { return !q.soft; }).forEach(function (q) { out.push(q.text); });
  return out.filter(function (x, i) { return out.indexOf(x) === i; });
}

/* ---------- asking, checking, fixing ---------- */
function aiRun(request, targets, box) {
  var d = edDiagram();
  if (!hierIsGraph(d)) { aiSay(box, aiT('notGraph'), true); aiFinished(box); return; }
  if (ED.aiBusy) { aiSay(box, aiT('eWait'), true); aiFinished(box, true); return; }
  ED.aiBusy = true;
  var di = ED.diag, tab = hierTabId(d, di), before = edClone(ED.raw), base = aiProblems(before, di), cur = before, used = [], notes = [], questions = [], round = 0;
  var sys = aiSystem(), model = aiCfg().model, st = edStateFor(d);
  var ask = function (prompt) {
    aiSay(box, round ? aiL('fixing', round) : aiT('asking'));
    /* Sonnet answers in about half a minute at low effort; the default effort can think for minutes */
    return aiFetch('/ask', { system: sys, prompt: prompt, schema: AI_SCHEMA, model: model, effort: model === 'opus' ? 'medium' : 'low' }).then(function (res) {
      if (!res || !res.ok) throw res;
      var data = res.data && typeof res.data === 'object' ? res.data : {}, ops = Array.isArray(data.ops) ? data.ops : [];
      if (data.note) notes.push(String(data.note));
      (Array.isArray(data.questions) ? data.questions : []).forEach(function (q) { if (str(q)) questions.push(String(q)); });
      if (!ops.length) return done([]);
      /* cards take the tool's own size: a model's guess at pixels makes text overflow and blocks overlap */
      ops = ops.map(function (o) { if (o && o.op === 'addNode' && o.node && !o.node.shape) { o = edClone(o); delete o.node.w; delete o.node.h; } return o; });
      ops = ops.concat(aiTidyOps(cur.diagrams[di], ops));
      var r = asApplyOps(cur, di, ops, st);
      if (r.errors.length) {
        if (round >= 2) return done([aiL('eOps', r.errors.slice(0, 3).join(' · '))]);
        round++;
        return ask(aiContextText(cur, di, targets, request, 'Your ops could not be applied (nothing changed). Errors:\n- ' + r.errors.join('\n- ') + '\nOps you sent:\n' + JSON.stringify(ops) + '\nSend corrected ops for the same request.'));
      }
      cur = r.raw;
      used = used.concat(ops);
      var fresh = aiProblems(cur, di).filter(function (x) { return base.indexOf(x) < 0; });
      if (fresh.length && round < 2) {
        round++;
        return ask(aiContextText(cur, di, targets, request, 'Your ops were applied; the tab below is the result. These new problems appeared:\n- ' + fresh.join('\n- ') +
          '\nSend ops that fix them on top of this result (do not repeat the earlier ops). The request, for reference, follows.'));
      }
      return done(fresh);
    });
  };
  var done = function (left) {
    aiFinished(box);
    var info = { request: request, targets: targets, notes: notes, questions: questions, left: left || [], box: box };
    var p = aiRebase({ before: before, after: cur, di: di, tab: tab, ops: used, info: info });
    if (!p) {
      aiSay(box, aiT('eStale'), true);
      aiLog({ request: request, targets: targets, state: 'failed', error: aiT('eStale') });
      return;
    }
    aiLog({ request: request, targets: targets, ops: used.length, state: 'pending' });
    aiPreview(p);
  };
  ask(aiContextText(before, di, targets, request)).catch(function (err) {
    aiFinished(box);
    /* an op that throws is a bug or a malformed answer: say it could not be applied, not the raw error */
    var text = err instanceof Error ? aiL('eOps', err.message) : aiErrorText(err);
    aiSay(box, text, true);
    aiLog({ request: request, targets: targets, state: 'failed', error: text });
  });
}
/* A frame that had nothing drawn inside and gets two or more blocks is laid out afterwards (models are poor at pixel
   sums), unless the answer already ends with tidyFrame for it. */
function aiTidyOps(d, ops) {
  var groups = asGroupIds(d), count = {}, asked = {};
  ops.forEach(function (o) {
    if (o && o.op === 'addNode' && o.node && str(o.node.group) && !o.node.port) count[str(o.node.group)] = (count[str(o.node.group)] || 0) + 1;
    if (o && o.op === 'tidyFrame') asked[str(o.id)] = true;
  });
  return Object.keys(count).filter(function (gid) {
    var g = groups[gid];
    return count[gid] >= 2 && !asked[gid] && g && finiteNum(g.x) !== null && +g.w > 0 &&
      !(d.nodes || []).some(function (n) { return n && str(n.group) === gid && !n.port; });
  }).map(function (gid) { return { op: 'tidyFrame', id: gid }; });
}
function aiFinished(box, stillBusy) {
  if (!stillBusy && ED) ED.aiBusy = false;
  if (box && typeof box.done === 'function') box.done();
}
/* The user may edit while the AI works or while its change is shown. The AI's operations are then applied again to the
   diagram as it is now, so nothing done in the meantime is lost; when they no longer apply, the answer is dropped. */
function aiRebase(p) {
  var di = -1;
  ED.raw.diagrams.forEach(function (x, i) { if (di < 0 && hierTabId(x, i) === p.tab) di = i; });
  if (di < 0) return null;
  if (di === p.di && JSON.stringify(ED.raw) === JSON.stringify(p.before)) return p;
  var d = ED.raw.diagrams[di];
  if (!hierIsGraph(d)) return null;
  var r = asApplyOps(ED.raw, di, p.ops, edStateFor(d));
  if (r.errors.length || r.raw === ED.raw) return null;
  return { before: edClone(ED.raw), after: r.raw, di: di, tab: p.tab, ops: p.ops, info: p.info };
}
function aiSay(box, text, bad) {
  if (box && box.status) {
    box.status.textContent = text;
    box.status.classList.toggle('bad', !!bad);
    /* a longer message makes the floating box taller: keep its bottom inside the window */
    if (box.classList && box.classList.contains('ai-box') && box.isConnected) {
      var r = box.getBoundingClientRect(), over = r.bottom - (window.innerHeight - 8);
      if (over > 0) box.style.top = Math.max(window.pageYOffset + 8, (parseFloat(box.style.top) || 0) - over) + 'px';
    }
  }
  if (ED && ED.aiPanelStatus) { ED.aiPanelStatus.textContent = text; ED.aiPanelStatus.classList.toggle('bad', !!bad); }
}
function aiLog(item) {
  if (!ED) return;
  ED.aiLog = ED.aiLog || [];
  item.time = edNow();
  ED.aiLog.unshift(item);
  if (ED.aiLog.length > 30) ED.aiLog.pop();
  if (ED.view === 'ai') aiBuildPanel();
}

/* ---------- showing the change before it is applied ---------- */
function aiDiff(a, b) {
  var mapN = function (d) { var m = {}; (d.nodes || []).forEach(function (n) { if (n && str(n.id)) m[str(n.id)] = JSON.stringify(n); }); return m; };
  var mapE = function (d) { var m = {}; (d.edges || []).forEach(function (e) { if (e) m[str(e.from) + '>' + str(e.to) + '|' + JSON.stringify(e.fromAnchor || '') + JSON.stringify(e.toAnchor || '')] = JSON.stringify(e); }); return m; };
  var mapG = function (d) { var m = {}; (d.groups || []).forEach(function (g) { if (g && str(g.id)) m[str(g.id)] = JSON.stringify(g); }); return m; };
  var mapQ = function (d) { var m = {}; (d.notes || []).forEach(function (q) { if (q && str(q.id)) m[str(q.id)] = JSON.stringify(q); }); return m; };
  var out = { add: { n: [], e: [], g: [], q: [] }, chg: { n: [], e: [], g: [], q: [] }, del: { n: [], e: [], g: [], q: [] } };
  [['n', mapN], ['e', mapE], ['g', mapG], ['q', mapQ]].forEach(function (k) {
    var x = k[1](a), y = k[1](b);
    Object.keys(y).forEach(function (id) { if (!(id in x)) out.add[k[0]].push(id); else if (x[id] !== y[id]) out.chg[k[0]].push(id); });
    Object.keys(x).forEach(function (id) { if (!(id in y)) out.del[k[0]].push(id); });
  });
  return out;
}
function aiCount(part) { return part.n.length + part.e.length + part.g.length + part.q.length; }
function aiPreview(p) {
  var di = p.di, after = p.after, info = p.info, diff = aiDiff(p.before.diagrams[di], after.diagrams[di]);
  if (ED.diag !== di) { ED.diag = di; ED.selected = null; ED.multi = null; ED.gsel = null; ED.nsel = null; edBuildForm(); edRender(); }
  var prev = active && active.L ? { L: active.L, d: active.d } : null;
  if (ED.aiBox) { ED.aiBox.remove(); ED.aiBox = null; }
  p.diff = diff;
  ED.aiPreview = p;
  var v = edCaptureView();
  v.id = str(after.diagrams[di].id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (di + 1));
  currentRaw = after;
  renderSpec(after, true);
  edRestoreView(v);
  aiMarkPreview(diff, prev);
  aiPreviewBar(info, diff);
}
function aiMarkPreview(diff, prev) {
  var st = active;
  if (!st || !st.svg || !st.L) return;
  var root = st.svg.querySelector('g.root'), ov = S('g', { class: 'ai-overlay', 'pointer-events': 'none' });
  var box = function (b, color, dash) { ov.appendChild(S('rect', { x: fmt(b.x - 5), y: fmt(b.y - 5), width: fmt(b.w + 10), height: fmt(b.h + 10), rx: 8, fill: 'none', stroke: color, 'stroke-width': 2.6, 'stroke-dasharray': dash || null })); };
  var nodeBox = function (L, id) { var p = L.nodes[id]; return p ? { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h } : null; };
  diff.add.n.forEach(function (id) { var b = nodeBox(st.L, id); if (b) box(b, '#16a34a'); });
  diff.chg.n.forEach(function (id) { var b = nodeBox(st.L, id); if (b) box(b, '#d97706'); });
  diff.add.g.concat(diff.chg.g).forEach(function (id) { var b = st.L.groups[id]; if (b) box(b, diff.add.g.indexOf(id) >= 0 ? '#16a34a' : '#d97706', '8 5'); });
  if (prev) diff.del.n.forEach(function (id) { var b = nodeBox(prev.L, id); if (b) box(b, '#dc2626', '6 4'); });
  st.d.edges.forEach(function (e, i) {
    var raw = edDiagram() && ED.aiPreview ? ED.aiPreview.after.diagrams[ED.aiPreview.di].edges[e.rawIndex] : null, key = raw ? str(raw.from) + '>' + str(raw.to) + '|' + JSON.stringify(raw.fromAnchor || '') + JSON.stringify(raw.toAnchor || '') : null;
    if (key && st.edgeEls[i]) st.edgeEls[i].classList.toggle('ai-add', diff.add.e.indexOf(key) >= 0);
  });
  if (root) root.appendChild(ov);
}
function aiPreviewBar(info, diff) {
  var st = active;
  if (!st || !st.canvas) return;
  var old = document.querySelector('.ai-bar');
  if (old) old.remove();
  var parts = [];
  if (aiCount(diff.add)) parts.push(aiL('added', aiCount(diff.add)));
  if (aiCount(diff.chg)) parts.push(aiL('changed', aiCount(diff.chg)));
  if (aiCount(diff.del)) parts.push(aiL('removed', aiCount(diff.del)));
  var bar = H('div', { class: 'ai-bar', role: 'dialog', 'aria-label': aiT('tab') });
  bar.appendChild(H('strong', { text: '✦ ' + aiL('preview', parts.join(', ') || aiT('nothing')) }));
  if (info.notes.length) bar.appendChild(H('p', { class: 'ai-note', text: info.notes.join(' ') }));
  if (info.left.length) bar.appendChild(H('p', { class: 'ai-left', text: aiL('left', info.left.slice(0, 4).join(' · ')) }));
  if (info.questions.length) bar.appendChild(H('p', { class: 'ai-q', text: aiL('questions', info.questions.join(' ')) }));
  var row = H('div', { class: 'ai-row' });
  var ok = H('button', { type: 'button', class: 'tb-btn ai-accept', text: '✓ ' + aiT('accept') }), no = H('button', { type: 'button', class: 'tb-btn', text: aiT('reject') }), re = H('button', { type: 'button', class: 'tb-btn', text: aiT('again') });
  ok.disabled = !parts.length;
  ok.addEventListener('click', function () { aiAccept(); });
  no.addEventListener('click', function () { aiReject(); });
  re.addEventListener('click', function () { var t0 = info.targets, q = info.request; aiReject(); aiOpenBox(t0, q); });
  [ok, no, re].forEach(function (b) { row.appendChild(b); });
  bar.appendChild(row);
  st.board.appendChild(bar);
  ok.focus();
}
function aiEndPreview() {
  var bar = document.querySelector('.ai-bar');
  if (bar) bar.remove();
}
function aiAccept() {
  var p = ED && ED.aiPreview;
  if (!p) return;
  aiEndPreview();
  /* edits made while the change was shown (in the tables, say) are kept: the operations go onto the diagram as it is now */
  var q = aiRebase(p);
  ED.aiPreview = null;
  if (!q) {
    aiSay(p.info && p.info.box, aiT('eStale'), true);
    if (ED.aiLog && ED.aiLog[0] && ED.aiLog[0].state === 'pending') { ED.aiLog[0].state = 'failed'; ED.aiLog[0].error = aiT('eStale'); }
    edRender();
    return;
  }
  p = q;
  clearTimeout(edUndoTimer);
  edPushUndo();
  var raw = edClone(p.after), d = raw.diagrams[p.di], info = p.info;
  var text = info.notes.join(' ').trim();
  if (text) {
    var att = info.targets && info.targets.ids && info.targets.ids.length ? info.targets.ids[0] : (p.diff.add.n[0] || null);
    if (att && !(asNodes(d)[att] || asGroupIds(d)[att])) att = null;
    var q = { id: hierNoteId(d), kind: 'change', text: text + '\n' + aiL('noteHead', info.request), date: hierToday(), by: 'AI' };
    if (att) q.attach = att;
    d.notes = Array.isArray(d.notes) ? d.notes : [];
    d.notes.push(q);
    if (!notesShown()) storageSet('ad-notes', 'on');
  }
  ED.aiPreview = null;
  ED.raw = raw;
  ED.diag = p.di;
  ED.selected = null; ED.multi = null; ED.gsel = null; ED.nsel = null;
  if (ED.aiLog && ED.aiLog[0] && ED.aiLog[0].state === 'pending') ED.aiLog[0].state = 'accepted';
  edChanged(true, aiL('lAi', String(info.request).slice(0, 60)));
  edRender();
}
function aiReject() {
  if (!ED || !ED.aiPreview) return;
  aiEndPreview();
  ED.aiPreview = null;
  if (ED.aiLog && ED.aiLog[0] && ED.aiLog[0].state === 'pending') ED.aiLog[0].state = 'rejected';
  edRender();
  if (ED.view === 'ai') aiBuildPanel();
}

/* ---------- the box next to the selection ---------- */
function aiTargetsName(targets) {
  var d = edDiagram(), names = (targets.ids || []).slice(0, 3).map(function (id) {
    var g = asGroupIds(d)[id], n = asNodes(d)[id];
    return g ? (str(asText(g.label)) || id) : n ? hierTitle(n) : id;
  });
  return names.join(', ') + ((targets.ids || []).length > 3 ? ' +' + (targets.ids.length - 3) : '');
}
function aiOpenBox(targets, request) {
  if (!ED || !active || !active.canvas) return;
  if (ED.aiBox) ED.aiBox.remove();
  targets = targets || { ids: [], kind: 'node' };
  var st = active, box = H('div', { class: 'ai-box', role: 'dialog', 'aria-label': aiT('askTitle') });
  var head = H('div', { class: 'ai-head' }, [H('strong', { text: '✦ ' + (targets.ids.length ? aiL('box', aiTargetsName(targets)) : aiT('boxTab')) })]);
  var x = H('button', { type: 'button', class: 'ed-mini', title: aiT('close'), 'aria-label': aiT('close'), text: '×' });
  x.addEventListener('click', function () { box.remove(); ED.aiBox = null; });
  head.appendChild(x);
  box.appendChild(head);
  var area = H('textarea', { class: 'ed-in ai-in', rows: 3, placeholder: aiT('ph'), 'aria-label': aiT('ph') });
  if (request) area.value = request;
  box.appendChild(area);
  var chips = H('div', { class: 'ai-chips' }), set = aiT('chips')[targets.ids.length ? (targets.kind === 'group' ? 'frame' : 'node') : 'tab'];
  set.forEach(function (c) {
    var b = H('button', { type: 'button', class: 'ai-chip', text: c });
    b.addEventListener('click', function () { area.value = c; area.focus(); });
    chips.appendChild(b);
  });
  box.appendChild(chips);
  var model = aiModelPick();
  var send = H('button', { type: 'button', class: 'tb-btn ai-send', text: '✦ ' + aiT('send') });
  box.status = H('div', { class: 'ai-status', 'aria-live': 'polite' });
  var go = function () {
    var q = area.value.trim();
    if (!q) { area.focus(); return; }
    if (send.disabled) return;
    send.disabled = true;
    send.textContent = aiT('sending');
    aiRun(q, targets, box);
  };
  box.done = function () { send.disabled = false; send.textContent = '✦ ' + aiT('send'); };
  send.addEventListener('click', go);
  area.addEventListener('keydown', function (ev) { ev.stopPropagation(); if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); go(); } if (ev.key === 'Escape') { box.remove(); ED.aiBox = null; } });
  box.appendChild(H('div', { class: 'ai-row' }, [model, send]));
  box.appendChild(box.status);
  aiHealth().then(function (h) {
    if (!box.isConnected) return;
    if (!h || !h.ok) aiSay(box, aiT('offline') + ' ' + aiT('start').replace(/:$/, '.'), true);
    else if (!h.paired) aiSay(box, aiT('unpaired'), true);
  });
  /* over the page (the drawing area can be shorter than the box), under the action bar next to what is selected */
  var bar = ED.actBar && ED.actBar.isConnected ? ED.actBar : null;
  document.body.appendChild(box);
  aiPlaceBox(box, bar ? bar.getBoundingClientRect() : null, st.canvas.getBoundingClientRect());
  ED.aiBox = box;
  ED.aiBoxTab = ED.diag;
  area.focus({ preventScroll: true });
}

/* Sonnet or Opus, kept for the next request (the box and the AI tab share it). */
function aiModelPick() {
  var cfg = aiCfg(), model = H('select', { class: 'ed-in ai-model', 'aria-label': aiT('model') });
  [['sonnet', aiT('sonnet')], ['opus', aiT('opus')]].forEach(function (o) { var op = H('option', { value: o[0], text: o[1] }); if (o[0] === cfg.model) op.selected = true; model.appendChild(op); });
  model.addEventListener('change', function () { var c = aiCfg(); c.model = model.value; aiSaveCfg(c); });
  return model;
}
/* Whole box inside the window, clear of the editor panel, as close to the selection as that allows. */
function aiPlaceBox(box, anchor, area) {
  var w = box.offsetWidth, h = box.offsetHeight, vw = document.documentElement.clientWidth, vh = window.innerHeight;
  var panel = ED && ED.panel ? ED.panel.getBoundingClientRect() : null, minX = 8;
  if (panel && panel.width && panel.right < vw * 0.7 && panel.height > vh * 0.6) minX = panel.right + 8;
  var x = anchor ? anchor.right - w : area.left + 40, y = anchor ? anchor.bottom + 6 : area.top + 40;
  x = Math.max(minX, Math.min(x, vw - w - 8));
  y = Math.max(8, Math.min(y, vh - h - 8));
  box.style.transform = 'none';
  box.style.left = Math.round(x + window.pageXOffset) + 'px';
  box.style.top = Math.round(y + window.pageYOffset) + 'px';
}

/* ---------- the AI tab of the editor panel ---------- */
function aiCommand() { return 'python3 ~/.claude/skills/architecture-diagrams/scripts/ai_bridge.py'; }
function aiBuildPanel() {
  if (!ED || !ED.body || ED.view !== 'ai') return;
  var body = ED.body;
  body.textContent = '';
  ED.jsonArea = null;
  var cfg = aiCfg();
  var status = H('p', { class: 'ai-status', 'aria-live': 'polite', text: aiT('checking') });
  ED.aiPanelStatus = status;
  body.appendChild(status);
  /* connection: start command, pairing code, port */
  var conn = H('div', { class: 'ed-grp ai-conn' }), code = H('input', { class: 'ed-in', type: 'text', value: cfg.token, placeholder: aiT('code'), 'aria-label': aiT('code'), spellcheck: 'false' });
  var port = H('input', { class: 'ed-in ai-port', type: 'number', value: cfg.port, 'aria-label': aiT('port') });
  var save = H('button', { type: 'button', class: 'tb-btn', text: aiT('save') });
  save.addEventListener('click', function () { var c = aiCfg(); c.token = code.value.trim(); c.port = +port.value || AI_PORT; aiSaveCfg(c); aiBuildPanel(); });
  var cmd = H('code', { class: 'ai-cmd', text: aiCommand() }), copy = H('button', { type: 'button', class: 'tb-btn', text: aiT('copyCmd') });
  copy.addEventListener('click', function () { edCopyText(aiCommand(), aiT('copied')); });
  var again = H('button', { type: 'button', class: 'tb-btn', text: aiT('recheck') });
  again.addEventListener('click', function () { aiBuildPanel(); });
  conn.appendChild(H('p', { class: 'ed-note', text: aiT('start') }));
  conn.appendChild(H('div', { class: 'ai-row' }, [cmd, copy]));
  conn.appendChild(H('div', { class: 'ai-row' }, [H('label', { text: aiT('code') }), code, H('label', { text: aiT('port') }), port, save, again]));
  body.appendChild(conn);
  aiHealth().then(function (h) {
    if (!ED || ED.view !== 'ai') return;
    if (h && h.ok && h.paired) { status.textContent = '✓ ' + aiL('connected', h.claude || ''); status.classList.remove('bad'); conn.open = false; }
    else { status.textContent = h && h.ok ? aiT('unpaired') : aiT('offline'); status.classList.add('bad'); }
  });
  /* a request for the whole tab, or for what is selected */
  var t0 = typeof hierSelTargets === 'function' ? hierSelTargets() : { ids: [], kind: 'node' };
  var ask = H('div', { class: 'ed-grp' }, [H('div', { class: 'ed-gtitle', text: t0.ids.length ? aiL('box', aiTargetsName(t0)) : aiT('boxTab') })]);
  var area = H('textarea', { class: 'ed-in ai-in', rows: 4, placeholder: aiT('ph'), 'aria-label': aiT('ph') });
  var send = H('button', { type: 'button', class: 'tb-btn ai-send', text: '✦ ' + aiT('send') });
  var pbox = { status: H('div', { class: 'ai-status', 'aria-live': 'polite' }) };
  pbox.done = function () { send.disabled = false; send.textContent = '✦ ' + aiT('send'); };
  send.addEventListener('click', function () {
    var q = area.value.trim();
    if (!q || send.disabled) return;
    send.disabled = true;
    send.textContent = aiT('sending');
    aiRun(q, typeof hierSelTargets === 'function' ? hierSelTargets() : t0, pbox);
  });
  area.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); send.click(); } });
  var chips = H('div', { class: 'ai-chips' });
  aiT('chips')[t0.ids.length ? (t0.kind === 'group' ? 'frame' : 'node') : 'tab'].forEach(function (c) { var b = H('button', { type: 'button', class: 'ai-chip', text: c }); b.addEventListener('click', function () { area.value = c; area.focus(); }); chips.appendChild(b); });
  [area, chips, H('div', { class: 'ai-row' }, [aiModelPick(), send]), pbox.status].forEach(function (x) { ask.appendChild(x); });
  body.appendChild(ask);
  /* no bridge: the same request for any chat AI, and its answer pasted back */
  var fb = H('div', { class: 'ed-grp' }, [H('p', { class: 'ed-note', text: aiT('fallback') })]);
  var copyReq = H('button', { type: 'button', class: 'tb-btn', text: aiT('copyReq') });
  copyReq.addEventListener('click', function () {
    var q = area.value.trim() || '…';
    edCopyText(aiSystem() + '\n\n' + aiContextText(ED.raw, ED.diag, t0, q), aiT('copied'));
  });
  var paste = H('textarea', { class: 'ed-in', rows: 3, placeholder: '{"ops": [...], "note": "..."}', 'aria-label': aiT('paste') });
  var show = H('button', { type: 'button', class: 'tb-btn', text: aiT('pasteBtn') });
  var perr = H('div', { class: 'ed-err', 'aria-live': 'polite' });
  show.addEventListener('click', function () {
    var txt = paste.value.trim(), fence = txt.match(/```(?:json)?\s*([\s\S]*?)```/), data;
    try { data = JSON.parse(fence ? fence[1] : txt); } catch (e) { perr.textContent = et('jsonBad') + ' ' + e.message; return; }
    var ops = data && Array.isArray(data.ops) ? data.ops : Array.isArray(data) ? data : null;
    if (!ops) { perr.textContent = et('jsonBad'); return; }
    var r = asApplyOps(ED.raw, ED.diag, ops, edStateFor(edDiagram()));
    if (r.errors.length) { perr.textContent = aiL('eOps', r.errors.slice(0, 3).join(' · ')); return; }
    perr.textContent = '';
    var was = aiProblems(ED.raw, ED.diag);
    aiLog({ request: area.value.trim() || aiT('paste'), targets: t0, ops: ops.length, state: 'pending' });
    aiPreview({ before: edClone(ED.raw), after: r.raw, di: ED.diag, tab: hierTabId(edDiagram(), ED.diag), ops: ops,
                info: { request: area.value.trim() || aiT('paste'), targets: t0, notes: data && data.note ? [String(data.note)] : [], questions: [],
                        left: aiProblems(r.raw, ED.diag).filter(function (x) { return was.indexOf(x) < 0; }), box: pbox } });
  });
  [H('div', { class: 'ai-row' }, [copyReq]), paste, H('div', { class: 'ai-row' }, [show, perr])].forEach(function (x) { fb.appendChild(x); });
  body.appendChild(fb);
  /* what was asked in this session */
  if (ED.aiLog && ED.aiLog.length) {
    var ul = H('ul', { class: 'ai-log' });
    ED.aiLog.forEach(function (it) {
      var state = it.state === 'accepted' ? aiT('stateAccepted') : it.state === 'rejected' ? aiT('stateRejected') : it.state === 'failed' ? aiT('stateFailed') : '…';
      ul.appendChild(H('li', {}, [H('span', { class: 'ai-when', text: it.time + ' · ' + state }), H('span', { text: it.request }), it.error ? H('span', { class: 'ai-err', text: it.error }) : null]));
    });
    body.appendChild(H('div', { class: 'ed-grp' }, [H('div', { class: 'ed-gtitle', text: aiT('history') }), ul]));
  }
}
