/* Editor: fill in tables or edit the JSON, drag shapes on the drawing, paste tables from Excel, undo and
   redo, and open or save .json, .html and .drawio files. Everything runs inside this page. */
var EDT = {
  en: {
    edit: 'Edit', editTitle: 'Edit this diagram (tables, drag and drop, draw.io files)', close: 'Close the editor',
    undo: 'Undo (Ctrl+Z)', redo: 'Redo (Ctrl+Shift+Z)', open: 'Open…', openTitle: 'Open a .json spec or a draw.io file (.drawio, .xml, .svg)',
    save: 'Save', saveJson: 'Diagram data (.json)', saveHtml: 'Interactive page (.html)', saveDrawio: 'draw.io file, editable (.drawio)',
    saveLib: 'Symbol library for draw.io (.xml)', form: 'Tables', json: 'JSON', apply: 'Apply', jsonBad: 'The JSON has an error:',
    doc: 'Document', docTitle: 'Title', docSub: 'Subtitle', docLang: 'Language',
    diagram: 'Diagram', addDiagram: '+ New tab', dupDiagram: 'Duplicate', delDiagram: 'Delete tab', delAsk: 'Delete this tab?',
    general: 'General', nodes: 'Blocks', edges: 'Connections', groups: 'Groups', steps: 'Steps (walkthrough)', legend: 'Legend',
    signals: 'Signals', arrows: 'Arrows between signals', registers: 'Registers', fields: 'Fields', regions: 'Address regions',
    domains: 'Power domains', columns: 'Columns', links: 'Links', pins: 'Pins', palette: 'Add a shape',
    addRow: '+ Add row', paste: 'Paste from Excel', copy: 'Copy as table', pasteHint: 'Paste rows copied from Excel or Google Sheets (tab-separated). A first row with column names is recognised.',
    pasteAdd: 'Add rows', cancel: 'Cancel', more: 'More settings', up: 'Move up', down: 'Move down', dup: 'Duplicate', del: 'Delete',
    addReg: '+ Add register', delReg: 'Delete register', addCol: '+ Add column', colBus: 'Bus', colBlocks: 'Blocks',
    autoLayout: 'Auto layout', autoLayoutTitle: 'Throw away positions set by hand and lay the diagram out again',
    draft: 'Unsaved changes from {t} were found for this page.', restore: 'Restore', discard: 'Discard',
    saved: 'Draft saved at {t}.', drop: 'Drop a .json or draw.io file to open it', opened: 'Opened {f}.',
    dragHint: 'Drag a block to move it; double-click it to edit its text on the drawing.\nShift + drag from one block to another draws a connection; the pins show their names.\nShift + click blocks, or Shift + drag on empty space, to select several; Ctrl+A selects all.\nCtrl+C and Ctrl+V copy and paste (also into another page); Ctrl+D duplicates; Delete removes.\nDrop a block inside a group frame to put it in that group; drag it out to take it out.\nWith one block selected, the suggested next block shows faintly: Tab adds it, a click elsewhere drops it. Keys 1 to 8 apply the suggestion with that number.\nDrag empty space to move around; Ctrl + wheel zooms.',
    selN: '{x} blocks selected. Drag one of them to move them all.', copiedN: 'Copied {x} blocks.', lPaste2: 'Paste {x} blocks', lAlign: 'Line up {x} blocks',
    lGroupIn: 'Put {x} into group {y}', lGroupOut: 'Take {x} out of group {y}',
    alignLeft: 'Align left edges', alignCenter: 'Align centers (vertical line)', alignRight: 'Align right edges', alignTop: 'Align top edges',
    alignMiddle: 'Align middles (horizontal line)', alignBottom: 'Align bottom edges', distH: 'Space evenly across', distV: 'Space evenly down', delSel: 'Delete the selected blocks',
    none: '(none)', auto: '(default)', manual: 'Positions set by hand', autoL: 'Automatic', unsaved: 'You have unsaved changes.',
    history: 'History', hNow: 'you are here', hUndone: 'undone', hStart: 'As opened', hEdit: 'Edit', hGoto: 'Go back to this step',
    hSteps: 'Steps', hMarks: 'Saved points', hMarkAdd: 'Save a point…', hMarkName: 'Name for this point', hMarkBack: 'Go back', hMarkDel: 'Delete',
    hMarkNone: 'No saved points yet. A saved point keeps the whole diagram under a name, even after the page is closed.',
    hDiff: 'Changes since the file was opened', hDiffNone: 'No changes yet.', hCopy: 'Copy the list', hRestored: 'Back to “{n}”',
    hAdded: 'added', hRemoved: 'removed', hChanged: 'changed', hMoved: 'moved', hResized: 'resized', hTab: 'Tab',
    lMove: 'Move {x}', lResize: 'Resize {x}', lConnect: 'Connect {x}', lBend: 'Bend {x}', lRoute: 'Line style of {x}', lArrows: 'Arrows of {x}',
    lDelEdge: 'Delete connection {x}', lDelNode: 'Delete block {x}', lAddShape: 'Add shape {x}', lAddRow: 'Add a row to {x}', lDelRow: 'Delete a row from {x}',
    lPaste: 'Paste {x} rows from Excel', lJson: 'Edit the JSON', lOpen: 'Open {x}', lFreeze: 'Switch to hand-placed positions', lAuto: 'Lay out automatically',
    lTab: 'Add tab {x}', lDelTab: 'Delete a tab', lDupTab: 'Duplicate a tab', lDraft: 'Restore the draft', lSet: 'Edit {y} of {x}', lSetDoc: 'Edit {y}',
    setup: 'Settings', thisTab: 'This tab', wholeDoc: 'Whole document (every tab)', layoutGrp: 'Layout', stepsShort: 'Steps', arrowsShort: 'Arrows',
    colsBlocks: 'Columns and blocks', pkgGrp: 'Chip and package',
    layoutAutoNote: 'The tool lays the diagram out. Drag any block on the drawing to place blocks by hand.',
    layoutManualNote: 'Blocks are placed by hand. Auto layout throws those positions away and lays the diagram out again.',
    checks: 'Checks', checksOk: 'No input or wiring problems found.', checksN: 'To look at: {x}', checksHide: 'Hide list', checksShow: 'Show list',
    reqNote: 'Fields marked * are required.', tblNote: 'Fields marked * are required. Press ⋯ at the end of a row for more settings.',
    gContent: 'Content', gPins: 'Pins of this symbol', gPorts: 'Ports written on the block', gShow: 'Display', gFlags: 'Marks', gPos: 'Position and size',
    gStyle: 'Colors and lines', gEnds: 'Ends', gPath: 'Path',
    pinNote: 'An input needs a wire coming in. Once a block is wired pin by pin, its clock or enable pin must be wired too.',
    pinFree: 'not connected', pinUsed: 'connected', pinShort: { in: 'in', out: 'out', clk: 'clock', io: 'both ways' },
    endPin: 'pin {y} of {x}', endBlock: 'block {x}', endFree: 'a free point', endsText: 'From {x} to {y}.',
    snapPin: 'Pin {x}: {y}.', snapBadIn: 'Pin {x} is an input; a wire should start from an output.', snapBadOut: 'Pin {x} is an output; a wire should end at an input.',
    savedWarn: 'Saved. {x} things still need a look; see Checks.',
    legendColors: 'What each color means', legendLines: 'Line kinds', legendAll: 'Show every color and line kind', legendUsed: 'Show only what this diagram uses',
    legendNote: 'Only the colors and line kinds this diagram uses are listed. Leave a row empty to keep the default name.',
    palSearch: 'Search shapes: and, dff, server, electrical…', palNone: 'No shape matches.',
    aiCopy: 'Copy prompt for AI', aiCopyTitle: 'Copies instructions for any AI chat plus this diagram as JSON',
    aiCopied: 'Copied. Paste it into ChatGPT, Gemini, Copilot or Claude and type your request at the end.',
    aiHint: 'Works with any AI chat (ChatGPT, Gemini, Copilot, Claude…): press Copy prompt for AI, paste it into the chat and type your request at the end. Paste the JSON the AI sends back into this box and press Apply. Undo brings the previous version back.',
    copyNo: 'The browser did not allow copying. Select the text and copy it by hand.',
    v: {
      required: 'Required.', idChars: 'Use letters, digits and _ . : - only.', idDup: 'Another row already uses this ID.',
      shape: 'There is no shape “{x}”. Pick one from the suggestions.', icon: 'There is no icon “{x}”. Pick one from the list, or type an emoji.', group: 'There is no group “{x}”.',
      domain: 'There is no power domain “{x}”.', end: 'There is no block “{x}”.', endGroupAuto: 'A connection can end on a group only when blocks are placed by hand.',
      positive: 'Must be a number above 0.', number: '“{x}” is not a number. Examples: 42, 0x2A, 0b101010.',
      port: '“{x}” is not a port name. Examples: clk, rst_n, din[7:0].', color: '“{x}” is not a color. Use a palette name or #rrggbb.',
      parentLoop: 'Groups cannot sit inside each other in a loop.', step: 'This step points to a connection that is not in the diagram.',
      waveChars: '“{x}” cannot be used in a wave. Use 0 1 x z . = 2-9 p n h l u d |', marker: 'Marker “{x}” is not placed under any signal (Markers column).',
      size: '“{x}” is not a size. Examples: 4096, 4KB, 1MB, 0x1000.', sizeOrEnd: 'Enter a size or an end address.', endBeforeBase: 'The end address is below the start.',
      overlap: 'Overlaps {x}.', bits: 'Write bits as 7:4 or 3.', bitsWide: 'Does not fit in the {x} bits of the register.', resetFit: 'The value does not fit in {x} bits.',
      width: 'Enter a whole number from 1 to 128.', pinNum: 'The pin number must be from 1 to {x}.', pinNumAny: 'The pin number must be a whole number above 0.',
      pinDup: 'Pin {x} is listed twice.', ball: 'Write a ball as a row letter and a column number, such as A1. Rows skip I, O, Q, S, X and Z.',
      pkg: 'Write the package as its family and pin count, such as LQFP48.'
    },
    h: {
      id: 'Unique; connections use it.', title: 'Text on the block. Enter starts a new line.', shape: 'Empty means a card. Type to search: dff, mux, pll, server…',
      ends: 'IDs of the blocks at the two ends.', ports: 'Separate with commas: clk, rst_n, din[7:0]', pos: 'Pixels from the top left corner; leave empty and the tool places the block.',
      size: 'Leave width and height empty to use the standard size of the shape.', bits: 'Like 7:4 or 3', num: 'Decimal or hex: 42, 0x2A', sizeB: '4096, 4KB, 1MB, 0x1000',
      wave: '0 1 x z . = 2-9 p n h l u d |', marker: 'Letters placed under the wave; arrows use them', arrow: 'a~>b label, a-|>b, a<->b', pkg: 'LQFP48, QFN32, SOIC8, BGA100…',
      pin: 'Pin number, or a ball such as A1', target: 'The block or connection this step talks about', regName: 'Name shown above the bit fields',
      icon: 'A name from the icon set (type to search) or an emoji.',
      tabId: 'Used in links to this tab (#id).', summary: 'Shown in the read-first box; **bold** works.'
    },
    types: { graph: 'Block diagram / flow', wave: 'Timing diagram', register: 'Registers', memory: 'Address map', chip: 'Chip, datasheet style', pinout: 'Pinout' },
    cols: {
      id: 'ID', title: 'Title', shape: 'Shape', color: 'Color', group: 'Group', desc: 'Description', icon: 'Icon', size: 'Size', labelPos: 'Label',
      external: 'External', initial: 'Initial', final: 'Final', portsIn: 'Inputs', portsOut: 'Outputs', portsInout: 'In/out', x: 'X', y: 'Y', w: 'Width', h: 'Height',
      fill: 'Fill', stroke: 'Line', text: 'Text color', fontSize: 'Font size', bold: 'Bold', dashed: 'Dashed', rotation: 'Rotation',
      from: 'From', to: 'To', label: 'Label', kind: 'Kind', dir: 'Arrow', route: 'Route', width: 'Line width', parent: 'Inside group', hidden: 'Hidden',
      target: 'Block or connection', text2: 'Text', direction: 'Direction', layout: 'Positions', tag: 'Tag', summary: 'Summary',
      name: 'Name', wave: 'Wave', data: 'Data', node: 'Markers', period: 'Period', phase: 'Phase', hscale: 'Horizontal scale', edge: 'Arrow',
      offset: 'Offset', regWidth: 'Bits', reset: 'Reset', bits: 'Bits', access: 'Access', base: 'Base', end: 'End', sizeB: 'Size',
      chip: 'Chip name', domainLabel: 'Domain caption', domain: 'Domain', sub: 'Subtitle', rows: 'Rows', pinsList: 'Pins', pinDir: 'Pin side',
      link: 'Bus link', multi: 'Copies', bus: 'Bus name', busStyle: 'Bus style', n: 'Pin', type: 'Type', alt: 'Alternate functions', pkg: 'Package', gaps: 'Show gaps'
    }
  },
  vi: {
    edit: 'Sửa', editTitle: 'Sửa sơ đồ này (bảng nhập liệu, kéo thả, file draw.io)', close: 'Đóng trình sửa',
    undo: 'Hoàn tác (Ctrl+Z)', redo: 'Làm lại (Ctrl+Shift+Z)', open: 'Mở…', openTitle: 'Mở file dữ liệu .json hoặc file draw.io (.drawio, .xml, .svg)',
    save: 'Lưu', saveJson: 'Dữ liệu sơ đồ (.json)', saveHtml: 'Trang tương tác (.html)', saveDrawio: 'File draw.io sửa được (.drawio)',
    saveLib: 'Thư viện hình cho draw.io (.xml)', form: 'Bảng', json: 'JSON', apply: 'Áp dụng', jsonBad: 'JSON có lỗi:',
    doc: 'Tài liệu', docTitle: 'Tiêu đề', docSub: 'Mô tả ngắn', docLang: 'Ngôn ngữ',
    diagram: 'Sơ đồ', addDiagram: '+ Thêm tab', dupDiagram: 'Nhân bản', delDiagram: 'Xóa tab', delAsk: 'Xóa tab này?',
    general: 'Thông tin chung', nodes: 'Khối', edges: 'Đường nối', groups: 'Nhóm', steps: 'Các bước (đọc lần lượt)', legend: 'Chú giải',
    signals: 'Tín hiệu', arrows: 'Mũi tên giữa các tín hiệu', registers: 'Thanh ghi', fields: 'Trường', regions: 'Vùng địa chỉ',
    domains: 'Miền nguồn', columns: 'Cột', links: 'Liên kết', pins: 'Chân', palette: 'Thêm hình',
    addRow: '+ Thêm dòng', paste: 'Dán từ Excel', copy: 'Chép dạng bảng', pasteHint: 'Dán các dòng chép từ Excel hoặc Google Sheets (cách nhau bằng phím Tab). Dòng đầu là tên cột thì tool tự nhận ra.',
    pasteAdd: 'Thêm các dòng', cancel: 'Hủy', more: 'Thêm thiết lập', up: 'Lên trên', down: 'Xuống dưới', dup: 'Nhân bản', del: 'Xóa',
    addReg: '+ Thêm thanh ghi', delReg: 'Xóa thanh ghi', addCol: '+ Thêm cột', colBus: 'Bus', colBlocks: 'Các khối',
    autoLayout: 'Tự dàn trang lại', autoLayoutTitle: 'Bỏ các vị trí đã kéo tay và để tool tự dàn trang lại',
    draft: 'Có bản nháp chưa lưu của trang này từ lúc {t}.', restore: 'Khôi phục', discard: 'Bỏ qua',
    saved: 'Đã lưu nháp lúc {t}.', drop: 'Thả file .json hoặc file draw.io vào đây để mở', opened: 'Đã mở {f}.',
    dragHint: 'Kéo một khối để dời chỗ; bấm đúp để sửa chữ ngay trên hình.\nGiữ Shift rồi kéo từ khối này sang khối khác để nối dây; các chân hiện tên khi kéo tới.\nGiữ Shift rồi bấm từng khối, hoặc giữ Shift rồi kéo trên chỗ trống, để chọn nhiều khối; Ctrl+A chọn tất cả.\nCtrl+C và Ctrl+V để chép và dán, dán được sang trang khác; Ctrl+D để nhân bản; phím Delete để xóa.\nThả khối vào trong khung nhóm thì khối vào nhóm đó; kéo ra ngoài khung thì khối ra khỏi nhóm.\nKhi chọn một khối, khối nên vẽ tiếp hiện mờ trên hình: bấm Tab để thêm, bấm chỗ khác để bỏ qua. Phím số 1 đến 8 làm theo gợi ý mang số đó.\nKéo chỗ trống để di chuyển khung nhìn; Ctrl + lăn chuột để phóng to hoặc thu nhỏ.',
    selN: 'Đang chọn {x} khối. Kéo một khối trong số đó để dời cả nhóm.', copiedN: 'Đã chép {x} khối.', lPaste2: 'Dán {x} khối', lAlign: 'Căn {x} khối',
    lGroupIn: 'Đưa {x} vào nhóm {y}', lGroupOut: 'Đưa {x} ra khỏi nhóm {y}',
    alignLeft: 'Căn mép trái', alignCenter: 'Căn giữa theo trục dọc', alignRight: 'Căn mép phải', alignTop: 'Căn mép trên',
    alignMiddle: 'Căn giữa theo trục ngang', alignBottom: 'Căn mép dưới', distH: 'Giãn đều theo chiều ngang', distV: 'Giãn đều theo chiều dọc', delSel: 'Xóa các khối đang chọn',
    none: '(không có)', auto: '(mặc định)', manual: 'Vị trí đặt tay', autoL: 'Tự động', unsaved: 'Bạn có thay đổi chưa lưu.',
    history: 'Lịch sử', hNow: 'đang ở đây', hUndone: 'đã hoàn tác', hStart: 'Lúc mở', hEdit: 'Sửa', hGoto: 'Quay về bước này',
    hSteps: 'Các bước đã làm', hMarks: 'Mốc đã lưu', hMarkAdd: 'Lưu mốc…', hMarkName: 'Tên mốc', hMarkBack: 'Quay lại', hMarkDel: 'Xóa',
    hMarkNone: 'Chưa có mốc nào. Mốc giữ nguyên toàn bộ sơ đồ dưới một cái tên, kể cả khi đã đóng trang.',
    hDiff: 'Thay đổi so với lúc mở file', hDiffNone: 'Chưa có thay đổi nào.', hCopy: 'Chép danh sách', hRestored: 'Đã quay về “{n}”',
    hAdded: 'thêm', hRemoved: 'xóa', hChanged: 'sửa', hMoved: 'dời chỗ', hResized: 'đổi cỡ', hTab: 'Tab',
    lMove: 'Dời {x}', lResize: 'Đổi cỡ {x}', lConnect: 'Nối {x}', lBend: 'Nắn đường {x}', lRoute: 'Đổi kiểu đường {x}', lArrows: 'Đổi mũi tên {x}',
    lDelEdge: 'Xóa đường {x}', lDelNode: 'Xóa khối {x}', lAddShape: 'Thêm hình {x}', lAddRow: 'Thêm dòng vào {x}', lDelRow: 'Xóa dòng trong {x}',
    lPaste: 'Dán {x} dòng từ Excel', lJson: 'Sửa JSON', lOpen: 'Mở {x}', lFreeze: 'Chuyển sang vị trí đặt tay', lAuto: 'Tự dàn trang lại',
    lTab: 'Thêm tab {x}', lDelTab: 'Xóa một tab', lDupTab: 'Nhân bản một tab', lDraft: 'Khôi phục bản nháp', lSet: 'Sửa {y} của {x}', lSetDoc: 'Sửa {y}',
    setup: 'Thiết lập', thisTab: 'Tab này', wholeDoc: 'Cả tài liệu (mọi tab)', layoutGrp: 'Bố cục', stepsShort: 'Các bước', arrowsShort: 'Mũi tên',
    colsBlocks: 'Cột và khối', pkgGrp: 'Chip và vỏ chip',
    layoutAutoNote: 'Tool đang tự dàn trang. Kéo một khối bất kỳ trên hình để chuyển sang đặt vị trí bằng tay.',
    layoutManualNote: 'Các khối đang được đặt bằng tay. Nút Tự dàn trang lại sẽ bỏ các vị trí này và xếp lại từ đầu.',
    checks: 'Kiểm tra', checksOk: 'Không thấy lỗi nhập liệu hay lỗi nối dây.', checksN: '{x} điểm cần xem', checksHide: 'Ẩn danh sách', checksShow: 'Xem danh sách',
    reqNote: 'Ô có dấu * là ô bắt buộc.', tblNote: 'Ô có dấu * là ô bắt buộc. Bấm ⋯ ở cuối dòng để mở thêm thiết lập.',
    gContent: 'Nội dung', gPins: 'Chân của ký hiệu', gPorts: 'Cổng ghi trên khối', gShow: 'Hiển thị', gFlags: 'Đánh dấu', gPos: 'Vị trí và kích thước',
    gStyle: 'Màu và nét vẽ', gEnds: 'Hai đầu nối', gPath: 'Đường đi',
    pinNote: 'Chân vào cần có dây đi vào. Khi khối đã được nối theo từng chân thì chân clock hoặc enable bắt buộc phải có dây.',
    pinFree: 'chưa nối', pinUsed: 'đã nối', pinShort: { in: 'vào', out: 'ra', clk: 'clock', io: 'hai chiều' },
    endPin: 'chân {y} của {x}', endBlock: 'khối {x}', endFree: 'một điểm tự do', endsText: 'Từ {x} tới {y}.',
    snapPin: 'Chân {x}: {y}.', snapBadIn: 'Chân {x} là chân vào; dây nên bắt đầu từ một chân ra.', snapBadOut: 'Chân {x} là chân ra; dây nên kết thúc ở một chân vào.',
    savedWarn: 'Đã lưu. Còn {x} điểm cần xem, hãy mở mục Kiểm tra.',
    legendColors: 'Ý nghĩa của từng màu', legendLines: 'Loại đường', legendAll: 'Hiện đủ mọi màu và loại đường', legendUsed: 'Chỉ hiện cái sơ đồ đang dùng',
    legendNote: 'Chỉ liệt kê màu và loại đường mà sơ đồ đang dùng. Để trống thì giữ tên mặc định.',
    palSearch: 'Tìm hình: and, dff, server, electrical…', palNone: 'Không có hình nào khớp.',
    aiCopy: 'Chép prompt cho AI', aiCopyTitle: 'Chép hướng dẫn cho AI bất kỳ kèm sơ đồ này dưới dạng JSON',
    aiCopied: 'Đã chép. Hãy dán vào ChatGPT, Gemini, Copilot hoặc Claude rồi gõ yêu cầu vào cuối.',
    aiHint: 'Dùng được với AI bất kỳ (ChatGPT, Gemini, Copilot, Claude…): bấm Chép prompt cho AI, dán vào khung chat rồi gõ yêu cầu vào cuối. Dán JSON mà AI trả về vào ô này rồi bấm Áp dụng. Bấm Hoàn tác nếu muốn quay lại bản trước.',
    copyNo: 'Trình duyệt không cho chép. Hãy chọn đoạn chữ rồi chép bằng tay.',
    v: {
      required: 'Bắt buộc nhập.', idChars: 'Chỉ dùng chữ, số và các dấu _ . : -', idDup: 'Mã này đã có ở dòng khác.',
      shape: 'Không có hình “{x}”. Hãy chọn trong danh sách gợi ý.', icon: 'Không có biểu tượng “{x}”. Hãy chọn trong danh sách, hoặc gõ một emoji.', group: 'Không có nhóm “{x}”.',
      domain: 'Không có miền nguồn “{x}”.', end: 'Không có khối “{x}”.', endGroupAuto: 'Chỉ nối vào nhóm được khi các khối đặt bằng tay.',
      positive: 'Phải là số lớn hơn 0.', number: '“{x}” không phải số. Ví dụ đúng: 42, 0x2A, 0b101010.',
      port: '“{x}” không phải tên cổng. Ví dụ đúng: clk, rst_n, din[7:0].', color: '“{x}” không phải màu. Dùng tên màu trong bảng hoặc mã #rrggbb.',
      parentLoop: 'Các nhóm không được lồng vòng vào nhau.', step: 'Bước này trỏ tới đường nối không có trong sơ đồ.',
      waveChars: 'Ký tự “{x}” không dùng được. Chỉ dùng 0 1 x z . = 2-9 p n h l u d |', marker: 'Chưa có điểm đánh dấu “{x}” dưới tín hiệu nào (cột Điểm đánh dấu).',
      size: '“{x}” không phải kích thước. Ví dụ đúng: 4096, 4KB, 1MB, 0x1000.', sizeOrEnd: 'Cần nhập kích thước hoặc địa chỉ kết thúc.', endBeforeBase: 'Địa chỉ kết thúc nhỏ hơn địa chỉ bắt đầu.',
      overlap: 'Chồng lên {x}.', bits: 'Nhập bit theo dạng 7:4 hoặc 3.', bitsWide: 'Vượt quá {x} bit của thanh ghi.', resetFit: 'Giá trị không vừa {x} bit.',
      width: 'Nhập số nguyên từ 1 đến 128.', pinNum: 'Số chân phải từ 1 đến {x}.', pinNumAny: 'Số chân phải là số nguyên lớn hơn 0.',
      pinDup: 'Chân {x} bị khai báo hai lần.', ball: 'Nhập vị trí bóng theo dạng chữ hàng và số cột, ví dụ A1. Hàng bỏ qua các chữ I, O, Q, S, X, Z.',
      pkg: 'Nhập vỏ chip theo dạng loại vỏ và số chân, ví dụ LQFP48.'
    },
    h: {
      id: 'Không trùng; đường nối dùng mã này.', title: 'Chữ hiện trên khối; Enter để xuống dòng.', shape: 'Để trống là thẻ thường. Gõ để tìm: dff, mux, pll, server…',
      ends: 'Mã của khối ở hai đầu.', ports: 'Cách nhau bằng dấu phẩy: clk, rst_n, din[7:0]', pos: 'Tính bằng điểm ảnh từ góc trên bên trái; để trống thì tool tự xếp.',
      size: 'Để trống rộng và cao thì dùng cỡ chuẩn của hình.', bits: 'Dạng 7:4 hoặc 3', num: 'Thập phân hoặc hex: 42, 0x2A', sizeB: '4096, 4KB, 1MB, 0x1000',
      wave: '0 1 x z . = 2-9 p n h l u d |', marker: 'Chữ đặt dưới dạng sóng để vẽ mũi tên', arrow: 'a~>b nhãn, a-|>b, a<->b', pkg: 'LQFP48, QFN32, SOIC8, BGA100…',
      pin: 'Số chân, hoặc vị trí bóng như A1', target: 'Khối hoặc đường nối mà bước này nói tới', regName: 'Tên hiện phía trên các trường bit',
      icon: 'Tên trong bộ biểu tượng (gõ để tìm) hoặc một emoji.',
      tabId: 'Dùng trong đường dẫn tới tab này (#id).', summary: 'Hiện ở khung đọc trước; viết **chữ đậm** được.'
    },
    types: { graph: 'Sơ đồ khối / lưu đồ', wave: 'Giản đồ thời gian', register: 'Thanh ghi', memory: 'Bản đồ địa chỉ', chip: 'Sơ đồ chip kiểu datasheet', pinout: 'Sơ đồ chân' },
    cols: {
      id: 'Mã', title: 'Tên', shape: 'Hình', color: 'Màu', group: 'Nhóm', desc: 'Mô tả', icon: 'Biểu tượng', size: 'Cỡ', labelPos: 'Vị trí chữ',
      external: 'Bên ngoài', initial: 'Trạng thái đầu', final: 'Trạng thái cuối', portsIn: 'Cổng vào', portsOut: 'Cổng ra', portsInout: 'Cổng hai chiều', x: 'X', y: 'Y', w: 'Rộng', h: 'Cao',
      fill: 'Màu nền', stroke: 'Màu viền', text: 'Màu chữ', fontSize: 'Cỡ chữ', bold: 'Chữ đậm', dashed: 'Nét đứt', rotation: 'Xoay (độ)',
      from: 'Từ', to: 'Đến', label: 'Nhãn', kind: 'Loại', dir: 'Mũi tên', route: 'Kiểu đi dây', width: 'Độ dày', parent: 'Nằm trong nhóm', hidden: 'Ẩn khung',
      target: 'Khối hoặc đường nối', text2: 'Nội dung', direction: 'Hướng', layout: 'Vị trí', tag: 'Nhãn phụ', summary: 'Tóm tắt',
      name: 'Tên', wave: 'Dạng sóng', data: 'Dữ liệu', node: 'Điểm đánh dấu', period: 'Chu kỳ', phase: 'Lệch pha', hscale: 'Giãn ngang', edge: 'Mũi tên',
      offset: 'Địa chỉ lệch', regWidth: 'Số bit', reset: 'Giá trị reset', bits: 'Bit', access: 'Truy cập', base: 'Bắt đầu', end: 'Kết thúc', sizeB: 'Kích thước',
      chip: 'Tên chip', domainLabel: 'Chú thích miền', domain: 'Miền', sub: 'Dòng phụ', rows: 'Số hàng', pinsList: 'Chân', pinDir: 'Phía chân',
      link: 'Nối bus', multi: 'Số bản', bus: 'Tên bus', busStyle: 'Kiểu bus', n: 'Chân', type: 'Loại', alt: 'Chức năng khác', pkg: 'Vỏ chip', gaps: 'Hiện vùng trống'
    }
  }
};
function et(k) { var tbl = EDT[lang] || EDT.en; return tbl[k] !== undefined ? tbl[k] : EDT.en[k]; }
function el(k, x, y) { return et(k).replace('{x}', x === undefined ? '' : x).replace('{y}', y === undefined ? '' : y); }
function ec(k) { return (et('cols') || {})[k] || k; }

var ED = null;
var edBooting = false;

function edClone(v) { return JSON.parse(JSON.stringify(v)); }
function edNow() { var d = new Date(); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes(); }
function edCanonical(raw) {
  var src = raw && typeof raw === 'object' ? edClone(raw) : {};
  delete src.playground; delete src.editor; delete src.example; delete src.drawio; delete src.name; delete src.drawioNote;
  if (Array.isArray(src.diagrams)) return src;
  var doc = { title: src.title || '', subtitle: src.subtitle || '', lang: src.lang || lang, diagrams: [] };
  if (src.theme) doc.theme = src.theme;
  var d = src;
  delete d.subtitle; delete d.lang; delete d.theme;
  if (Object.keys(d).length > 1 || d.nodes || d.type) doc.diagrams.push(d);
  return doc;
}
function edDiagram() { return ED.raw.diagrams[ED.diag] || null; }
function edTypeOf(d) {
  var t = str(d && d.type).toLowerCase();
  if (t === 'timing' || t === 'wave' || (!t && d && d.wave)) return 'wave';
  if (t === 'register' || t === 'registers' || (!t && d && d.registers)) return 'register';
  if (t === 'memory' || t === 'memory-map' || t === 'memmap' || (!t && d && d.regions)) return 'memory';
  if (t === 'chip' || (!t && d && d.columns)) return 'chip';
  if (t === 'pinout' || (!t && d && d.package)) return 'pinout';
  return 'graph';
}

/* ---------- starting points for each diagram type ---------- */
function edTemplate(type) {
  var vi = lang === 'vi';
  if (type === 'wave') return { type: 'timing', title: vi ? 'Giản đồ thời gian' : 'Timing', signal: [
    { name: 'clk', wave: 'p.......' }, { name: 'valid', wave: '0.1..0..' }, { name: 'data', wave: 'x.345x..', data: ['A', 'B', 'C'] }, { name: 'ready', wave: '0..1.0..' }] };
  if (type === 'register') return { type: 'register', title: vi ? 'Thanh ghi' : 'Registers', registers: [
    { name: 'CTRL', offset: '0x00', width: 32, desc: vi ? 'Thanh ghi điều khiển' : 'Control register', fields: [
      { bits: '0', name: 'EN', access: 'RW', reset: '0', desc: vi ? 'Bật khối' : 'Enable' }, { bits: '3:1', name: 'MODE', access: 'RW', reset: '0' }] }] };
  if (type === 'memory') return { type: 'memory', title: vi ? 'Bản đồ địa chỉ' : 'Address map', regions: [
    { name: 'ROM', base: '0x0000_0000', size: '64KB', color: 'amber' }, { name: 'SRAM', base: '0x2000_0000', size: '128KB', color: 'blue' },
    { name: vi ? 'Ngoại vi' : 'Peripherals', base: '0x4000_0000', size: '1MB', color: 'teal' }] };
  if (type === 'chip') return { type: 'chip', title: vi ? 'Sơ đồ khối chip' : 'Chip block diagram', chip: 'MY-CHIP', columns: [
    { blocks: [{ id: 'cpu', title: 'CPU', rows: 2, color: 'blue' }, { id: 'dma', title: 'DMA' }] }, { bus: 'AXI', style: 'matrix' },
    { blocks: [{ id: 'sram', title: 'SRAM' }, { id: 'bridge', title: 'AXI-APB bridge', link: 'both' }] }, { bus: 'APB' },
    { blocks: [{ id: 'uart', title: 'UART', pins: ['TX', 'RX'] }, { id: 'gpio', title: 'GPIO', pins: ['PA[7:0]'] }] }] };
  if (type === 'pinout') return { type: 'pinout', title: vi ? 'Sơ đồ chân' : 'Pinout', chip: 'MY-CHIP', package: 'QFN32',
    pins: [{ n: 1, name: 'VDD' }, { n: 2, name: 'PA0', alt: ['ADC_IN0'] }, { n: 3, name: 'PA1' }, { n: 4, name: 'GND' }] };
  return { title: vi ? 'Sơ đồ mới' : 'New diagram', direction: 'LR', nodes: [
    { id: 'a', title: vi ? 'Khối A' : 'Block A', color: 'blue' }, { id: 'b', title: vi ? 'Khối B' : 'Block B', color: 'teal' }],
    edges: [{ from: 'a', to: 'b', label: vi ? 'dữ liệu' : 'data' }] };
}

/* ---------- opening and closing ---------- */
function editorButton() {
  var head = document.querySelector('.page-head');
  if (!head || document.getElementById('edit-btn')) return;
  var b = H('button', { type: 'button', class: 'tb-btn', id: 'edit-btn', title: et('editTitle'), text: '✎ ' + et('edit') });
  b.addEventListener('click', function () { if (ED) closeEditor(); else openEditor(); });
  var themeBtn = document.getElementById('theme-btn');
  themeBtn.parentNode.insertBefore(b, themeBtn);
}
function openEditor(startRaw) {
  if (ED) return;
  var raw = edCanonical(startRaw || currentRaw || {});
  if (!raw.diagrams.length) raw.diagrams.push(edTemplate('graph'));
  ED = { raw: raw, diag: 0, view: 'form', undo: [], redo: [], snap: JSON.stringify(raw), snapLabel: et('hStart'), snapTime: Date.now(), dirty: false, open: {}, sub: {} };
  ED.original = ED.snap;
  ED.marks = edLoadMarks();
  if (active) states.forEach(function (st, i) { if (st === active) ED.diag = Math.min(i, raw.diagrams.length - 1); });
  window.__adEditor = { raw: function () { return ED ? ED.raw : null; }, selected: function () { return ED ? ED.selected : null; },
                        tab: function () { return ED ? ED.diag : null; }, ops: function (ops, label) { return edRunOps(ops, label || 'ops'); },
                        select: function (ids, frames) { if (!ED) return; ED.nsel = null; ED.gsel = frames && frames.length ? frames.slice() : null; if (ids && ids.length) edSetSelection(ids); else { ED.selected = null; ED.multi = null; edMarkSelection(); } } };
  document.body.classList.add('editing');
  var panel = H('aside', { class: 'ed-panel', 'aria-label': et('edit') });
  ED.panel = panel;
  document.body.appendChild(panel);
  var btn = document.getElementById('edit-btn');
  if (btn) btn.classList.add('on');
  loadStencilPack().then(function () { edBuild(); edRender(); edOfferDraft(); });
}
function closeEditor() {
  if (!ED) return;
  if (ED.panel) ED.panel.remove();
  if (ED.aiBox) ED.aiBox.remove();
  document.body.classList.remove('editing');
  var btn = document.getElementById('edit-btn');
  if (btn) btn.classList.remove('on');
  currentRaw = ED.raw;
  ED = null;
  renderSpec(currentRaw, true);
}

/* ---------- rendering the page from the edited data ---------- */
function edCaptureView() {
  var v = { id: active ? active.d.id : null, scale: {}, scroll: {}, fit: {} };
  states.forEach(function (st) {
    v.scale[st.d.id] = st.scale;
    v.fit[st.d.id] = st.userFit;
    if (st.canvas) v.scroll[st.d.id] = [st.canvas.scrollLeft, st.canvas.scrollTop];
  });
  return v;
}
function edRestoreView(v) {
  var idx = -1;
  states.forEach(function (st, i) {
    if (st.d.id === v.id) idx = i;
    if (v.scale[st.d.id] !== undefined) { st.scale = v.scale[st.d.id]; st.userFit = v.fit[st.d.id]; applyZoom(st); }
  });
  if (idx < 0) idx = Math.min(ED ? ED.diag : 0, states.length - 1);
  if (idx >= 0) showSection(idx, false);
  states.forEach(function (st) { var s = v.scroll[st.d.id]; if (s && st.canvas) { st.canvas.scrollLeft = s[0]; st.canvas.scrollTop = s[1]; } });
}
function edRender() {
  if (!ED || ED.aiPreview) return;
  /* the AI box floats over the page: it goes when its tab is no longer the one shown */
  if (ED.aiBox && ED.aiBoxTab !== ED.diag) { ED.aiBox.remove(); ED.aiBox = null; }
  /* a detail board follows its overview, and a block's own tab follows its ports (hier.js) */
  if (!ED.noSync && typeof hierSync === 'function') hierSync(ED.raw, ED.diag);
  var v = edCaptureView();
  var d = edDiagram();
  if (d) v.id = str(d.id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (ED.diag + 1));
  currentRaw = ED.raw;
  renderSpec(ED.raw, true);
  edRestoreView(v);
  edMarkSelection();
  edComputeWires();
  edApplyMarks();
  edRefreshChecks();
  edDrawIssueMarks();
}
var edRenderTimer = null, edUndoTimer = null, edDraftTimer = null;
/* Every edit goes through here: redraw soon, remember the step for undo, keep a draft. */
/* Name the step being made, for the history list (the first name in a burst of typing wins). */
function edLabel(text) { if (ED && !ED.pendingLabel) ED.pendingLabel = text; }
function edChanged(rebuildForm, label) {
  if (!ED) return;
  if (ED.heal && --ED.heal.left <= 0) ED.heal = null;
  if (label) ED.pendingLabel = label;
  ED.dirty = true;
  if (rebuildForm) edBuildForm();
  clearTimeout(edRenderTimer);
  edRenderTimer = setTimeout(edRender, rebuildForm ? 0 : 250);
  clearTimeout(edUndoTimer);
  edUndoTimer = setTimeout(edPushUndo, rebuildForm ? 0 : 600);
  clearTimeout(edDraftTimer);
  edDraftTimer = setTimeout(edSaveDraft, 1200);
  if (ED.jsonArea && ED.view === 'json' && document.activeElement !== ED.jsonArea) ED.jsonArea.value = JSON.stringify(ED.raw, null, 2);
}
function edPushUndo() {
  if (!ED) return;
  var now = JSON.stringify(ED.raw);
  if (now === ED.snap) { ED.pendingLabel = null; return; }
  ED.undo.push({ snap: ED.snap, label: ED.snapLabel, time: ED.snapTime });
  if (ED.undo.length > 150) ED.undo.shift();
  ED.redo = [];
  ED.snap = now;
  ED.snapLabel = ED.pendingLabel || et('hEdit');
  ED.snapTime = Date.now();
  ED.pendingLabel = null;
  edUpdateButtons();
  if (ED.view === 'history') edBuildHistory();
}
/* Moves `steps` states back (positive) or forward (negative) without redrawing in between. */
function edMove(steps) {
  var back = steps > 0;
  for (var i = 0; i < Math.abs(steps); i++) {
    var from = back ? ED.undo : ED.redo, to = back ? ED.redo : ED.undo;
    if (!from.length) break;
    to.push({ snap: ED.snap, label: ED.snapLabel, time: ED.snapTime });
    var st = from.pop();
    ED.snap = st.snap; ED.snapLabel = st.label; ED.snapTime = st.time;
  }
  ED.raw = JSON.parse(ED.snap);
  ED.diag = Math.min(ED.diag, ED.raw.diagrams.length - 1);
  ED.selected = null;
  if (ED.view === 'history') edBuildHistory(); else if (ED.view === 'json') edBuildJson(); else edBuildForm();
  ED.noSync = true;
  edRender();
  ED.noSync = false;
  edUpdateButtons();
  edSaveDraft();
}
function edUndoRedo(back) {
  if (!ED) return;
  clearTimeout(edUndoTimer);
  edPushUndo();
  edMove(back ? 1 : -1);
}
function edUpdateButtons() {
  if (!ED || !ED.btnUndo) return;
  ED.btnUndo.disabled = !ED.undo.length && JSON.stringify(ED.raw) === ED.snap;
  ED.btnRedo.disabled = !ED.redo.length;
  ED.btnUndo.title = et('undo') + (ED.undo.length || JSON.stringify(ED.raw) !== ED.snap ? ': ' + ED.snapLabel : '');
  ED.btnRedo.title = et('redo') + (ED.redo.length ? ': ' + ED.redo[ED.redo.length - 1].label : '');
}
function edDraftKey() { return 'architecture-diagrams-draft:' + location.pathname; }
function edSaveDraft() {
  if (!ED) return;
  try { window.localStorage.setItem(edDraftKey(), JSON.stringify({ t: Date.now(), raw: ED.raw })); } catch (e) { return; }
  if (ED.status && !(ED.statusHold && Date.now() < ED.statusHold)) ED.status.textContent = et('saved').replace('{t}', edNow());
}
function edOfferDraft() {
  var saved = null;
  try { saved = JSON.parse(window.localStorage.getItem(edDraftKey()) || 'null'); } catch (e) { saved = null; }
  if (!saved || !saved.raw || JSON.stringify(saved.raw) === JSON.stringify(ED.raw)) return;
  var d = new Date(saved.t), when = d.toLocaleDateString() + ' ' + (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  var bar = H('div', { class: 'ed-draft' }, [H('span', { text: et('draft').replace('{t}', when) })]);
  var yes = H('button', { type: 'button', class: 'tb-btn', text: et('restore') }), no = H('button', { type: 'button', class: 'tb-btn', text: et('discard') });
  yes.addEventListener('click', function () { bar.remove(); edLoad(saved.raw, null); });
  no.addEventListener('click', function () { bar.remove(); try { window.localStorage.removeItem(edDraftKey()); } catch (e) { /* ignore */ } });
  bar.appendChild(yes); bar.appendChild(no);
  ED.body.insertBefore(bar, ED.body.firstChild);
}
function edLoad(raw, fileName) {
  edPushUndo();
  ED.raw = edCanonical(raw);
  if (!ED.raw.diagrams.length) ED.raw.diagrams.push(edTemplate('graph'));
  ED.diag = 0;
  ED.selected = null;
  var go = function () {
    edBuildForm();
    edChanged(false, fileName ? el('lOpen', fileName) : et('lDraft'));
    edRender();
    if (fileName && ED.status) ED.status.textContent = et('opened').replace('{f}', fileName);
    if (raw && raw.drawioNote) drawioNotice(raw);
  };
  if (specUsesStencils(ED.raw)) loadStencilPack().then(go); else go();
}

/* ---------- panel skeleton ---------- */
function edBuild() {
  var p = ED.panel;
  p.textContent = '';
  var head = H('div', { class: 'ed-head' });
  head.appendChild(H('strong', { text: '✎ ' + et('edit') }));
  ED.btnUndo = H('button', { type: 'button', class: 'tb-btn', title: et('undo'), 'aria-label': et('undo'), text: '↶' });
  ED.btnRedo = H('button', { type: 'button', class: 'tb-btn', title: et('redo'), 'aria-label': et('redo'), text: '↷' });
  ED.btnUndo.addEventListener('click', function () { edUndoRedo(true); });
  ED.btnRedo.addEventListener('click', function () { edUndoRedo(false); });
  var file = H('input', { type: 'file', accept: '.json,.drawio,.xml,.svg,.dio,application/json', hidden: true });
  var bOpen = H('button', { type: 'button', class: 'tb-btn', title: et('openTitle'), text: et('open') });
  bOpen.addEventListener('click', function () { file.click(); });
  file.addEventListener('change', function () { var f = file.files && file.files[0]; if (f) edOpenFile(f); file.value = ''; });
  var saveMenu = edMenu('⤓ ' + et('save'), [
    [et('saveJson'), function () { edDownload(JSON.stringify(ED.raw, null, 2), 'application/json', 'json'); edAfterSave(); }],
    [et('saveHtml'), edSaveHtml],
    [et('saveDrawio'), function () { prepareDrawioExport().then(function () { edDownload(drawioDocument(), 'application/xml', 'drawio'); edAfterSave(); }); }],
    [et('saveLib'), function () { drawioLibrary().then(function (xml) { download(new Blob([xml], { type: 'application/xml' }), 'architecture-diagrams-symbols.xml'); }); }]
  ]);
  var bClose = H('button', { type: 'button', class: 'tb-btn ed-x', title: et('close'), 'aria-label': et('close'), text: '×' });
  bClose.addEventListener('click', closeEditor);
  [ED.btnUndo, ED.btnRedo, H('span', { class: 'tb-sep' }), bOpen, file, saveMenu, bClose].forEach(function (el) { head.appendChild(el); });
  p.appendChild(head);
  var tabs = H('div', { class: 'ed-tabs', role: 'tablist' });
  ['form', 'json', 'history'].concat(typeof aiBuildPanel === 'function' ? ['ai'] : []).forEach(function (v) {
    var b = H('button', { type: 'button', role: 'tab', class: 'ed-tab' + (v === 'ai' ? ' ed-tab-ai' : ''), 'aria-selected': ED.view === v ? 'true' : 'false', text: v === 'ai' ? '✦ ' + aiT('tab') : et(v) });
    b.addEventListener('click', function () { ED.view = v; edBuild(); });
    tabs.appendChild(b);
  });
  p.appendChild(tabs);
  ED.body = H('div', { class: 'ed-body' });
  p.appendChild(ED.body);
  ED.status = H('div', { class: 'ed-status', 'aria-live': 'polite' });
  p.appendChild(ED.status);
  var grip = H('div', { class: 'ed-grip', title: '↔' });
  grip.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    var move = function (e) { document.documentElement.style.setProperty('--ed-w', Math.max(320, Math.min(window.innerWidth - 320, e.clientX)) + 'px'); };
    var up = function () { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); states.forEach(applyZoom); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  });
  p.appendChild(grip);
  if (ED.view === 'json') edBuildJson(); else if (ED.view === 'history') edBuildHistory(); else if (ED.view === 'ai') aiBuildPanel(); else edBuildForm();
  edUpdateButtons();
}
function edMenu(label, items) {
  var wrap = H('div', { class: 'tb-menu' });
  var b = H('button', { type: 'button', class: 'tb-btn', 'aria-haspopup': 'true', text: label });
  var menu = H('div', { class: 'menu', role: 'menu' });
  menu.hidden = true;
  items.forEach(function (it) {
    var mi = H('button', { type: 'button', role: 'menuitem', text: it[0] });
    mi.addEventListener('click', function () { menu.hidden = true; it[1](); });
    menu.appendChild(mi);
  });
  b.addEventListener('click', function (ev) { ev.stopPropagation(); menu.hidden = !menu.hidden; });
  document.addEventListener('click', function (ev) { if (!menu.hidden && !wrap.contains(ev.target)) menu.hidden = true; });
  wrap.appendChild(b);
  wrap.appendChild(menu);
  return wrap;
}
function edDownload(text, type, ext) {
  ED.dirty = false;
  download(new Blob([text], { type: type + ';charset=utf-8' }), slug(ED.raw.title || (ED.raw.diagrams[0] && ED.raw.diagrams[0].title) || 'diagram') + '.' + ext);
}
function edSaveHtml() {
  var data = JSON.stringify(ED.raw, null, 2).replace(/</g, '\\u003c');
  var page = PRISTINE.replace(/(<script type="application\/json" id="diagram-spec">)[\s\S]*?(<\/script>)/, function (m, a, b) { return a + data + b; });
  page = page.replace(/<title>[\s\S]*?<\/title>/, '<title>' + htmlEsc(ED.raw.title || 'Diagram') + '</title>');
  edDownload(page, 'text/html', 'html');
  edAfterSave();
}
function edOpenFile(f) {
  f.text().then(function (text) {
    var trimmed = text.replace(/^﻿/, '').trim();
    if (trimmed.charAt(0) === '{') {
      var parsed;
      try { parsed = JSON.parse(trimmed); } catch (err) { edStatus(et('jsonBad') + ' ' + err.message); return; }
      if (typeof parsed.drawio === 'string') {
        loadStencilPack().then(function () { return parseDrawio(parsed.drawio, parsed.name || f.name); }).then(function (s) { edLoad(s, f.name); }, function (err) { edStatus(String(err.message || err)); });
      } else edLoad(parsed, f.name);
      return;
    }
    loadStencilPack().then(function () { return parseDrawio(trimmed, f.name); }).then(function (s) {
      s.lang = ED.raw.lang || lang;
      edLoad(s, f.name);
    }, function (err) { edStatus(String(err.message || err)); });
  });
}
function edStatus(msg) { if (ED && ED.status) ED.status.textContent = msg; }

/* ---------- history: labelled steps, saved points and the change list ---------- */
function edMarkKey() { return 'architecture-diagrams-marks:' + location.pathname; }
function edLoadMarks() { try { return JSON.parse(window.localStorage.getItem(edMarkKey()) || '[]'); } catch (e) { return []; } }
function edStoreMarks() { try { window.localStorage.setItem(edMarkKey(), JSON.stringify(ED.marks)); } catch (e) { /* storage unavailable */ } }
function edClock(t) { var d = new Date(t); return (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + ':' + (d.getSeconds() < 10 ? '0' : '') + d.getSeconds(); }
function edBuildHistory() {
  var body = ED.body;
  if (!body) return;
  body.textContent = '';
  clearTimeout(edUndoTimer);
  if (JSON.stringify(ED.raw) !== ED.snap) edPushUndo();
  var sec = edSection('h-steps', et('hSteps') + ' (' + (ED.undo.length + ED.redo.length + 1) + ')', true);
  var list = H('ol', { class: 'ed-hist' });
  var rows = [];
  ED.redo.slice().forEach(function (st, i) { rows.push({ st: st, move: -(ED.redo.length - i), cls: 'undone' }); });
  rows.push({ st: { label: ED.snapLabel, time: ED.snapTime }, move: 0, cls: 'now' });
  ED.undo.slice().reverse().forEach(function (st, i) { rows.push({ st: st, move: i + 1, cls: '' }); });
  rows.forEach(function (r) {
    var b = H('button', { type: 'button', class: 'ed-hstep ' + r.cls, title: r.move ? et('hGoto') : '' }, [
      H('span', { class: 'ed-htime', text: edClock(r.st.time) }), H('span', { class: 'ed-hlabel', text: r.st.label }),
      r.cls ? H('span', { class: 'ed-htag', text: r.cls === 'now' ? et('hNow') : et('hUndone') }) : null
    ]);
    if (r.move) b.addEventListener('click', function () { edMove(r.move); });
    list.appendChild(H('li', {}, [b]));
  });
  sec.appendChild(list);
  body.appendChild(sec);

  var msec = edSection('h-marks', et('hMarks') + ' (' + ED.marks.length + ')', true);
  var add = H('button', { type: 'button', class: 'tb-btn', text: et('hMarkAdd') });
  add.addEventListener('click', function () {
    var name = window.prompt(et('hMarkName'), (lang === 'vi' ? 'Mốc lúc ' : 'Point at ') + edNow());
    if (!name) return;
    ED.marks.unshift({ name: name, time: Date.now(), snap: JSON.stringify(ED.raw) });
    if (ED.marks.length > 30) ED.marks.pop();
    edStoreMarks();
    edBuildHistory();
  });
  msec.appendChild(H('div', { class: 'ed-row-actions' }, [add]));
  if (!ED.marks.length) msec.appendChild(H('p', { class: 'ed-hint', text: et('hMarkNone') }));
  ED.marks.forEach(function (m, i) {
    var back = H('button', { type: 'button', class: 'tb-btn', text: et('hMarkBack') }), del = H('button', { type: 'button', class: 'ed-mini', title: et('hMarkDel'), text: '✕' });
    back.addEventListener('click', function () {
      edPushUndo();
      ED.raw = JSON.parse(m.snap);
      ED.diag = Math.min(ED.diag, ED.raw.diagrams.length - 1);
      edChanged(false, et('hRestored').replace('{n}', m.name));
      edRender();
      edBuildHistory();
    });
    del.addEventListener('click', function () { ED.marks.splice(i, 1); edStoreMarks(); edBuildHistory(); });
    var d = new Date(m.time);
    msec.appendChild(H('div', { class: 'ed-mark' }, [H('strong', { text: m.name }), H('span', { class: 'ed-htime', text: d.toLocaleDateString() + ' ' + edClock(m.time) }), back, del]));
  });
  body.appendChild(msec);

  var dsec = edSection('h-diff', et('hDiff'), true);
  var lines = edDiff(JSON.parse(ED.original), ED.raw);
  if (!lines.length) dsec.appendChild(H('p', { class: 'ed-hint', text: et('hDiffNone') }));
  else {
    var ul = H('ul', { class: 'ed-diff' });
    lines.forEach(function (l) { ul.appendChild(H('li', { class: 'ed-d-' + l[0] }, [H('span', { class: 'ed-dmark', text: { add: '+', del: '−', mod: '~' }[l[0]] }), H('span', { text: l[1] })])); });
    dsec.appendChild(ul);
    var copy = H('button', { type: 'button', class: 'tb-btn', text: et('hCopy') });
    copy.addEventListener('click', function () {
      var text = lines.map(function (l) { return { add: '+ ', del: '- ', mod: '~ ' }[l[0]] + l[1]; }).join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { edStatus('✓'); }, function () { window.prompt('', text); });
      else window.prompt('', text);
    });
    dsec.appendChild(H('div', { class: 'ed-row-actions' }, [copy]));
  }
  body.appendChild(dsec);
}
/* What changed between two specs, in words: tabs, blocks, connections and groups. */
function edDiff(a, b) {
  var out = [], da = (a && a.diagrams) || [], db = (b && b.diagrams) || [];
  var key = function (d, i) { return str(d.id) || ('#' + (i + 1)); };
  var name = function (d, i) { return str(d.title) || key(d, i); };
  var mapA = {};
  da.forEach(function (d, i) { mapA[key(d, i)] = d; });
  var seen = {};
  db.forEach(function (d, i) {
    var k = key(d, i), old = mapA[k];
    seen[k] = true;
    var where = et('hTab') + ' ' + name(d, i) + ': ';
    if (!old) { out.push(['add', where + et('hAdded')]); return; }
    if (JSON.stringify(old) === JSON.stringify(d)) return;
    var before = out.length;
    var list = function (arr) { var m = {}; (arr || []).forEach(function (x) { if (x && x.id !== undefined) m[str(x.id)] = x; }); return m; };
    var label = function (x) { var t0 = stripMarks(str(x.title || x.label || x.name)).split('\n')[0]; return t0 ? t0 + ' (' + x.id + ')' : String(x.id); };
    [['nodes', lang === 'vi' ? 'khối' : 'block'], ['groups', lang === 'vi' ? 'nhóm' : 'group']].forEach(function (kind) {
      var A = list(old[kind[0]]), B = list(d[kind[0]]);
      Object.keys(B).forEach(function (id) {
        if (!A[id]) { out.push(['add', where + kind[1] + ' ' + label(B[id])]); return; }
        if (JSON.stringify(A[id]) === JSON.stringify(B[id])) return;
        var what = [];
        var keys = {};
        Object.keys(A[id]).concat(Object.keys(B[id])).forEach(function (q) { keys[q] = true; });
        Object.keys(keys).forEach(function (q) {
          if (JSON.stringify(A[id][q]) === JSON.stringify(B[id][q]) || q === 'drawio') return;
          what.push(q === 'x' || q === 'y' ? et('hMoved') : q === 'w' || q === 'h' ? et('hResized') : String(ec(q)).toLowerCase());
        });
        what = what.filter(function (q, i2) { return what.indexOf(q) === i2; });
        out.push(['mod', where + kind[1] + ' ' + label(B[id]) + ' (' + what.join(', ') + ')']);
      });
      Object.keys(A).forEach(function (id) { if (!B[id]) out.push(['del', where + kind[1] + ' ' + label(A[id])]); });
    });
    var ek = function (e) { return str(e.from || JSON.stringify(e.fromPoint)) + ' → ' + str(e.to || JSON.stringify(e.toPoint)); };
    var countA = {}, countB = {};
    (old.edges || []).forEach(function (e) { var k2 = ek(e); countA[k2] = (countA[k2] || []).concat([e]); });
    (d.edges || []).forEach(function (e) { var k2 = ek(e); countB[k2] = (countB[k2] || []).concat([e]); });
    var edgeWord = lang === 'vi' ? 'đường nối' : 'connection';
    Object.keys(countB).forEach(function (k2) {
      var A2 = countA[k2] || [], B2 = countB[k2];
      B2.forEach(function (e, j) {
        if (!A2[j]) out.push(['add', where + edgeWord + ' ' + k2 + (e.label ? ' "' + e.label + '"' : '')]);
        else if (JSON.stringify(A2[j]) !== JSON.stringify(e)) out.push(['mod', where + edgeWord + ' ' + k2]);
      });
      A2.slice(B2.length).forEach(function () { out.push(['del', where + edgeWord + ' ' + k2]); });
    });
    Object.keys(countA).forEach(function (k2) { if (!countB[k2]) countA[k2].forEach(function () { out.push(['del', where + edgeWord + ' ' + k2]); }); });
    if (out.length === before) out.push(['mod', where + et('hChanged')]);
  });
  da.forEach(function (d, i) { if (!seen[key(d, i)]) out.push(['del', et('hTab') + ' ' + name(d, i)]); });
  if (str(a.title) !== str(b.title)) out.push(['mod', (lang === 'vi' ? 'Tiêu đề: ' : 'Title: ') + str(b.title)]);
  return out;
}

/* ---------- JSON view ---------- */
function edBuildJson() {
  var body = ED.body;
  body.textContent = '';
  var area = H('textarea', { class: 'ed-json', spellcheck: 'false', 'aria-label': 'JSON' });
  area.value = JSON.stringify(ED.raw, null, 2);
  ED.jsonArea = area;
  var err = H('div', { class: 'ed-err', 'aria-live': 'polite' });
  var apply = H('button', { type: 'button', class: 'tb-btn', text: et('apply') + ' (Ctrl+Enter)' });
  var run = function () {
    /* a whole spec replaces the document; {"ops": [...]} changes the open tab (see edApplyAnswer in assist.js) */
    var msg = edApplyAnswer(area.value);
    err.textContent = msg || '';
    if (!msg) area.value = JSON.stringify(ED.raw, null, 2);
  };
  apply.addEventListener('click', run);
  area.addEventListener('keydown', function (ev) { if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); run(); } });
  var ai = H('button', { type: 'button', class: 'tb-btn', title: et('aiCopyTitle'), text: '✦ ' + et('aiCopy') });
  ai.addEventListener('click', function () {
    edCopyText(AI_PROMPT + '\n\nCurrent diagram (JSON):\n```json\n' + JSON.stringify(ED.raw, null, 2) + '\n```\n\nRequest: ', et('aiCopied'));
  });
  body.appendChild(H('p', { class: 'ed-hint ed-aihint', text: et('aiHint') }));
  body.appendChild(area);
  body.appendChild(H('div', { class: 'ed-row-actions' }, [apply, ai, err]));
}
/* Copies text; falls back to a hidden text box when the clipboard API is not allowed (for example on file:// pages). */
function edCopyText(text, done) {
  var fallback = function () {
    var ta = H('textarea', { style: 'position:fixed;left:-9999px;top:0', 'aria-hidden': 'true' });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    edStatus(ok ? done : et('copyNo'));
  };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { edStatus(done); }, fallback);
  else fallback();
}

/* ---------- small form helpers ---------- */
function edInput(value, onInput, opts) {
  opts = opts || {};
  var el;
  if (opts.type === 'area') {
    el = H('textarea', { class: 'ed-in', rows: 1, spellcheck: 'false' });
    el.value = value === undefined || value === null ? '' : value;
    var grow = function () { el.style.height = 'auto'; el.style.height = Math.min(200, el.scrollHeight + 2) + 'px'; };
    el.addEventListener('input', grow);
    setTimeout(grow, 0);
  } else if (opts.type === 'select') {
    el = H('select', { class: 'ed-in' });
    edFillSelect(el, opts.options, value);
  } else if (opts.type === 'check') {
    el = H('input', { type: 'checkbox', class: 'ed-check' });
    el.checked = !!value;
  } else {
    el = H('input', { class: 'ed-in', type: opts.type === 'num' ? 'number' : 'text', step: opts.type === 'num' ? 'any' : null, spellcheck: 'false', list: opts.list || null });
    el.value = value === undefined || value === null ? '' : value;
    if (opts.type === 'combo') el.setAttribute('autocomplete', 'off');
  }
  if (opts.placeholder) el.setAttribute('placeholder', opts.placeholder);
  if (opts.title) el.title = opts.title;
  var evName = opts.type === 'select' || opts.type === 'check' || opts.type === 'combo' || opts.lazy ? 'change' : 'input';
  el.addEventListener(evName, function () {
    var v = opts.type === 'check' ? el.checked : el.value;
    if (opts.type === 'num') v = el.value === '' ? undefined : +el.value;
    onInput(v, el);
  });
  return el;
}
function edFillSelect(el, options, value) {
  el.textContent = '';
  var found = false;
  (options || []).forEach(function (o) {
    if (o && o.group) {
      var og = H('optgroup', { label: o.group });
      o.items.forEach(function (it) { var op = H('option', { value: it[0], text: it[1] }); if (String(it[0]) === String(value)) { op.selected = true; found = true; } og.appendChild(op); });
      el.appendChild(og);
      return;
    }
    var op = H('option', { value: o[0], text: o[1] });
    if (String(o[0]) === String(value === undefined || value === null ? '' : value)) { op.selected = true; found = true; }
    el.appendChild(op);
  });
  if (!found && value !== undefined && value !== null && value !== '') {
    var extra = H('option', { value: value, text: String(value) });
    extra.selected = true;
    el.insertBefore(extra, el.firstChild);
  }
}
function edSection(key, title, open) {
  var det = H('details', { class: 'ed-sec', 'data-sec': key });
  var k = ED.diag + ':' + key;
  det.open = ED.open[k] !== undefined ? ED.open[k] : !!open;
  det.addEventListener('toggle', function () { ED.open[k] = det.open; });
  det.appendChild(H('summary', { text: title }));
  return det;
}
/* rows: [label, input] or [label, input, { vk, req, hint }]. vk ties the input to the input checks (edValidate). */
function edGrid(parent, rows, cls) {
  var g = H('div', { class: 'ed-grid' + (cls ? ' ' + cls : '') });
  rows.forEach(function (r) {
    if (!r) return;
    var meta = r[2] || {};
    g.appendChild(H('label', { class: meta.req ? 'ed-req' : null, text: r[0] }));
    if (meta.vk) r[1].setAttribute('data-vk', meta.vk);
    if (meta.req) r[1].setAttribute('aria-required', 'true');
    g.appendChild(H('div', { class: 'ed-field' }, [r[1], meta.hint ? H('div', { class: 'ed-note', text: meta.hint }) : null, H('div', { class: 'ed-msg', hidden: true })]));
    ['input', 'change'].forEach(function (evn) { r[1].addEventListener(evn, function () { edLabel(el('lSetDoc', '', String(r[0]).toLowerCase())); }); });
  });
  parent.appendChild(g);
  return g;
}
/* A titled group of fields inside a pane or inside a row's settings. */
function edGroup(parent, title, rows, note, cls) {
  var box = H('div', { class: 'ed-grp' }, [H('div', { class: 'ed-gtitle', text: title }), note ? H('div', { class: 'ed-note ed-gnote', text: note }) : null]);
  if (rows) edGrid(box, rows, cls);
  parent.appendChild(box);
  return box;
}
function setOrDelete(obj, key, v) {
  if (v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length)) delete obj[key];
  else obj[key] = v;
}
function listToArray(v) { return String(v || '').split(',').map(function (q) { return q.trim(); }).filter(Boolean); }
function arrayToList(v) { return Array.isArray(v) ? v.join(', ') : (v || ''); }
function paletteOptions(withDefault) {
  var o = withDefault ? [['', et('auto')]] : [];
  return o.concat(COLOR_ORDER.map(function (c) { return [c, c]; }));
}

/* A table bound to an array of raw objects. Supports Excel paste, copy, reordering and a details row. */
/* A table bound to an array of raw objects. Supports Excel paste, copy, reordering and a settings row.
   o.vkey names the table for the input checks: each cell carries data-vk "<vkey>:<row>:<column key>". */
function edTable(o) {
  var wrap = H('div', { class: 'ed-tblwrap' });
  var hasReq = o.cols.some(function (c) { return c.req; });
  if (o.note !== false && (hasReq || o.extra)) wrap.appendChild(H('p', { class: 'ed-note ed-tblnote', text: o.note || (o.extra ? et('tblNote') : et('reqNote')) }));
  var table = H('table', { class: 'ed-tbl' });
  var thead = H('tr');
  o.cols.forEach(function (c) { thead.appendChild(H('th', { class: c.req ? 'ed-req' : null, title: c.hint || null, style: c.w ? 'width:' + c.w : null, text: c.label })); });
  thead.appendChild(H('th', { class: 'ed-act-h' }));
  table.appendChild(H('thead', {}, [thead]));
  var tbody = H('tbody');
  table.appendChild(tbody);
  var rows = o.rows();
  rows.forEach(function (row, i) {
    var tr = H('tr', { class: 'ed-row', 'data-i': i });
    if (o.rowKey) tr.setAttribute('data-key', o.rowKey(row));
    o.cols.forEach(function (c, ci) {
      var get = c.get ? c.get(row) : row[c.k];
      var inp = edInput(get, function (v, elx) {
        if (c.set) c.set(row, v, elx); else setOrDelete(row, c.k, v);
        edLabel(el('lSet', str(row.id || row.name || row.title || (o.name || '') + ' #' + (i + 1)).split('\n')[0], c.label || c.k));
        edChanged(!!c.structural);
      }, { type: c.type, options: typeof c.options === 'function' ? c.options(row) : c.options, lazy: c.lazy, list: c.list, placeholder: c.ph,
           title: c.hint ? c.label + ': ' + c.hint : (c.label || c.k) });
      inp.setAttribute('data-col', ci);
      if (o.vkey) inp.setAttribute('data-vk', o.vkey + ':' + i + ':' + c.k);
      if (c.req) inp.setAttribute('aria-required', 'true');
      inp.addEventListener('paste', function (ev) { edPasteCells(ev, o, i, ci); });
      if (c.onFocus) inp.addEventListener('focus', function () { c.onFocus(row); });
      tr.appendChild(H('td', {}, [inp]));
    });
    var acts = H('td', { class: 'ed-acts' });
    var mk = function (txt, title, fn) { var b = H('button', { type: 'button', class: 'ed-mini', title: title, 'aria-label': title, text: txt }); b.addEventListener('click', fn); return b; };
    /* reordering and duplicating live in the row's "more" area, so the table keeps room for the data */
    var extra = H('tr', { class: 'ed-extra' }), cell = H('td', { colspan: o.cols.length + 1 });
    extra.appendChild(cell);
    extra.hidden = true;
    var fillExtra = function () {
      var tools = H('div', { class: 'ed-row-actions ed-rowtools' }, [
        mk('↑', et('up'), function () { var a = o.rows(); if (i > 0) { var t0 = a[i - 1]; a[i - 1] = a[i]; a[i] = t0; edChanged(true); } }),
        mk('↓', et('down'), function () { var a = o.rows(); if (i < a.length - 1) { var t1 = a[i + 1]; a[i + 1] = a[i]; a[i] = t1; edChanged(true); } }),
        mk('⧉', et('dup'), function () { var a = o.rows(), copy = edClone(a[i]); if (o.onDuplicate) o.onDuplicate(copy); a.splice(i + 1, 0, copy); edChanged(true); })
      ]);
      cell.appendChild(tools);
      if (o.extra) cell.appendChild(o.extra(row));
      edApplyMarks();
    };
    var moreBtn = mk('⋯', et('more'), function () {
      extra.hidden = !extra.hidden;
      if (!extra.hidden && !cell.firstChild) fillExtra();
      moreBtn.classList.toggle('on', !extra.hidden);
    });
    tr.moreToggle = function (show) {
      extra.hidden = !show;
      if (show && !cell.firstChild) fillExtra();
      moreBtn.classList.toggle('on', show);
    };
    acts.appendChild(moreBtn);
    acts.appendChild(mk('✕', et('del'), function () { var a = o.rows(), gone = a.splice(i, 1)[0]; if (o.onDelete) o.onDelete(gone); edChanged(true, el('lDelRow', o.name || '')); }));
    tr.appendChild(acts);
    tbody.appendChild(tr);
    if (o.vkey) tbody.appendChild(H('tr', { class: 'ed-rowmsg', 'data-vp': o.vkey + ':' + i + ':', hidden: true }, [H('td', { colspan: o.cols.length + 1 })]));
    tbody.appendChild(extra);
  });
  wrap.appendChild(table);
  var bar = H('div', { class: 'ed-row-actions' });
  var add = H('button', { type: 'button', class: 'tb-btn', text: o.addLabel || et('addRow') });
  add.addEventListener('click', function () { o.rows().push(o.add()); edChanged(true, el('lAddRow', o.name || '')); });
  bar.appendChild(add);
  if (o.paste !== false) {
    var pb = H('button', { type: 'button', class: 'tb-btn', text: et('paste') });
    pb.addEventListener('click', function () { edPasteDialog(o, wrap); });
    var cb = H('button', { type: 'button', class: 'tb-btn', text: et('copy') });
    cb.addEventListener('click', function () { edCopyTable(o); });
    bar.appendChild(pb);
    bar.appendChild(cb);
  }
  wrap.appendChild(bar);
  return wrap;
}
function edParseTsv(text) {
  var rows = [], row = [], cell = '', q = false;
  var s = String(text).replace(/\r\n?/g, '\n');
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (q) {
      if (ch === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') q = true;
    else if (ch === '\t') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(function (r) { return r.some(function (c) { return c.trim() !== ''; }); });
}
function edApplyCell(o, row, ci, value) {
  var c = o.cols[ci];
  if (!c) return;
  var v = value.trim();
  if (c.type === 'num') v = v === '' ? undefined : (isFinite(+v) ? +v : v);
  if (c.type === 'check') v = /^(1|x|yes|true|có|✓)$/i.test(v);
  if (c.set) c.set(row, v); else setOrDelete(row, c.k, v);
}
var ED_ALIASES = {
  id: ['id', 'key', 'ma', 'mã'], title: ['title', 'name', 'ten', 'label', 'block'], name: ['name', 'field', 'signal', 'ten', 'pin name'],
  desc: ['desc', 'description', 'mo ta', 'ghi chu', 'note', 'notes', 'comment'], bits: ['bit', 'bits', 'range', 'bit range', 'msb:lsb'],
  access: ['access', 'type', 'r/w', 'rw', 'truy cap', 'attr'], reset: ['reset', 'default', 'reset value', 'gia tri reset', 'mac dinh'],
  n: ['pin', 'no', 'no.', 'pin no', 'number', 'so', 'ball'], type: ['type', 'loai', 'kind'], alt: ['alternate functions', 'alternate', 'af', 'functions', 'chuc nang khac'],
  base: ['base', 'start', 'address', 'dia chi', 'bat dau'], size: ['size', 'kich thuoc', 'length'], end: ['end', 'ket thuc', 'last'],
  from: ['from', 'source', 'tu', 'nguon'], to: ['to', 'target', 'den', 'dich'], label: ['label', 'nhan', 'text'], color: ['color', 'mau'],
  wave: ['wave', 'waveform', 'dang song'], data: ['data', 'du lieu'], group: ['group', 'nhom'], shape: ['shape', 'hinh', 'symbol']
};
function edHeaderMap(o, first) {
  var map = [], hits = 0;
  first.forEach(function (h) {
    var q = normText(h).trim(), idx = -1;
    o.cols.forEach(function (c, ci) {
      var aliases = (c.aliases || []).concat(ED_ALIASES[c.k] || []);
      if (idx < 0 && (normText(c.label) === q || normText(c.k || '') === q || aliases.some(function (a) { return normText(a) === q; }))) idx = ci;
    });
    if (idx >= 0) hits++;
    map.push(idx);
  });
  return hits >= Math.max(1, Math.ceil(first.length / 2)) ? map : null;
}
function edPasteRows(o, rowsText, startRow, startCol) {
  var arr = o.rows(), map = null;
  if (rowsText.length > 1 || startRow === undefined) map = edHeaderMap(o, rowsText[0]);
  if (map) rowsText = rowsText.slice(1);
  rowsText.forEach(function (cells, k) {
    var target = startRow !== undefined ? arr[startRow + k] : null;
    if (!target) { target = o.add(true); arr.push(target); }
    cells.forEach(function (val, j) { edApplyCell(o, target, map ? map[j] : (startCol || 0) + j, val); });
  });
  edChanged(true, el('lPaste', rowsText.length));
}
function edPasteCells(ev, o, rowIndex, colIndex) {
  var text = ev.clipboardData && ev.clipboardData.getData('text/plain');
  if (!text || (text.indexOf('\t') < 0 && text.indexOf('\n') < 0)) return;
  var rows = edParseTsv(text);
  if (!rows.length || (rows.length === 1 && rows[0].length === 1)) return;
  ev.preventDefault();
  edPasteRows(o, rows, rowIndex, colIndex);
}
function edPasteDialog(o, anchor) {
  var box = H('div', { class: 'ed-paste' });
  var area = H('textarea', { class: 'ed-in', rows: 6, placeholder: o.cols.map(function (c) { return c.label; }).join('\t') });
  var ok = H('button', { type: 'button', class: 'tb-btn', text: et('pasteAdd') });
  var no = H('button', { type: 'button', class: 'tb-btn', text: et('cancel') });
  box.appendChild(H('p', { text: et('pasteHint') }));
  box.appendChild(area);
  box.appendChild(H('div', { class: 'ed-row-actions' }, [ok, no]));
  ok.addEventListener('click', function () { var rows = edParseTsv(area.value); box.remove(); if (rows.length) edPasteRows(o, rows); });
  no.addEventListener('click', function () { box.remove(); });
  anchor.appendChild(box);
  area.focus();
}
function edCopyTable(o) {
  var lines = [o.cols.map(function (c) { return c.label; }).join('\t')];
  o.rows().forEach(function (row) {
    lines.push(o.cols.map(function (c) { var v = c.get ? c.get(row) : row[c.k]; return String(v === undefined || v === null ? '' : v).replace(/[\t\n]/g, ' '); }).join('\t'));
  });
  var text = lines.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { edStatus('✓'); }, function () { window.prompt('', text); });
  else window.prompt('', text);
}

/* ---------- the form ---------- */
function edBuildForm() {
  if (!ED || ED.view !== 'form' || !ED.body) return;
  var keepScroll = ED.body.scrollTop;
  ED.body.textContent = '';
  ED.jsonArea = null;
  var raw = ED.raw;
  var pick = H('div', { class: 'ed-pick' });
  var sel = H('select', { class: 'ed-in', 'aria-label': et('diagram') });
  raw.diagrams.forEach(function (d, i) { var op = H('option', { value: i, text: (i + 1) + '. ' + (d.title || d.id || et('types')[edTypeOf(d)]) }); if (i === ED.diag) op.selected = true; sel.appendChild(op); });
  sel.addEventListener('change', function () { ED.diag = +sel.value; ED.selected = null; edBuildForm(); edRender(); });
  var addMenu = edMenu(et('addDiagram'), ['graph', 'wave', 'register', 'memory', 'chip', 'pinout'].map(function (ty) {
    return [et('types')[ty], function () { raw.diagrams.push(edTemplate(ty)); ED.diag = raw.diagrams.length - 1; edChanged(true, el('lTab', et('types')[ty])); edRender(); }];
  }));
  var dup = H('button', { type: 'button', class: 'tb-btn', title: et('dupDiagram'), 'aria-label': et('dupDiagram'), text: '⧉' });
  dup.addEventListener('click', function () {
    var c = edClone(edDiagram());
    c.id = (c.id || 'diagram') + '-copy';
    c.title = (c.title || '') + ' (2)';
    raw.diagrams.splice(ED.diag + 1, 0, c);
    ED.diag++;
    edChanged(true, et('lDupTab'));
  });
  var del = H('button', { type: 'button', class: 'tb-btn', title: et('delDiagram'), 'aria-label': et('delDiagram'), text: '🗑' });
  del.addEventListener('click', function () {
    if (raw.diagrams.length < 2 || !window.confirm(et('delAsk'))) return;
    raw.diagrams.splice(ED.diag, 1);
    ED.diag = Math.max(0, ED.diag - 1);
    edChanged(true, et('lDelTab'));
  });
  pick.appendChild(H('label', { text: et('diagram') }));
  [sel, addMenu, dup, del].forEach(function (x) { pick.appendChild(x); });
  if (typeof hierPickButtons === 'function') hierPickButtons(pick);
  ED.body.appendChild(pick);
  var start = edStartPanel();
  if (start) ED.body.appendChild(start);
  ED.checksBox = H('div', { class: 'ed-checks', 'aria-live': 'polite' });
  ED.body.appendChild(ED.checksBox);
  ED.suggestBox = H('div', { class: 'ed-suggest', hidden: true });
  ED.body.appendChild(ED.suggestBox);

  var d = edDiagram(), type = edTypeOf(d);
  if (type === 'graph') edFormGraph(d);
  else if (type === 'wave') edFormWave(d);
  else if (type === 'register') edFormRegisters(d);
  else if (type === 'memory') edFormMemory(d);
  else if (type === 'chip') edFormChip(d);
  else edFormPinout(d);
  ED.body.scrollTop = keepScroll;
  edMarkSelection();
  edApplyMarks();
  edRefreshChecks();
  if (ED.focusRow) {
    var fr = ED.body.querySelector('.ed-row[data-key="' + edCss(ED.focusRow) + '"]'), ft = fr && fr.querySelector('textarea');
    ED.focusRow = null;
    if (ft) { ft.focus(); ft.select(); fr.scrollIntoView({ block: 'nearest' }); }
  }
}
/* Sub-tabs of the form: each part of a diagram (blocks, connections, settings…) has its own pane. */
function edPanes(defs) {
  var cur = ED.sub[ED.diag];
  if (!defs.some(function (q) { return q[0] === cur; })) cur = defs[0][0];
  ED.sub[ED.diag] = cur;
  var bar = H('div', { class: 'ed-stabs', role: 'tablist' }), panes = {};
  defs.forEach(function (q) {
    var b = H('button', { type: 'button', role: 'tab', class: 'ed-stab', 'data-pane': q[0], 'aria-selected': q[0] === cur ? 'true' : 'false' },
      [H('span', { text: q[1] }), q[2] ? H('span', { class: 'ed-cnt', text: String(q[2]) }) : null, H('span', { class: 'ed-bdg', hidden: true })]);
    b.addEventListener('click', function () { edShowPane(q[0]); });
    bar.appendChild(b);
    panes[q[0]] = H('div', { class: 'ed-pane', role: 'tabpanel', 'data-pane': q[0], hidden: q[0] !== cur });
  });
  ED.body.appendChild(bar);
  defs.forEach(function (q) { ED.body.appendChild(panes[q[0]]); });
  return panes;
}
function edShowPane(key) {
  if (!ED || !ED.body || !ED.body.querySelector('.ed-pane[data-pane="' + key + '"]')) return;
  ED.sub[ED.diag] = key;
  Array.prototype.forEach.call(ED.body.querySelectorAll('.ed-stab'), function (b) { b.setAttribute('aria-selected', b.getAttribute('data-pane') === key ? 'true' : 'false'); });
  Array.prototype.forEach.call(ED.body.querySelectorAll('.ed-pane'), function (p) { p.hidden = p.getAttribute('data-pane') !== key; });
}
function edPaneBadges(counts) {
  if (!ED || !ED.body) return;
  Array.prototype.forEach.call(ED.body.querySelectorAll('.ed-stab'), function (b) {
    var n = counts[b.getAttribute('data-pane')] || 0, bd = b.querySelector('.ed-bdg');
    bd.hidden = !n;
    bd.textContent = n ? '⚠ ' + n : '';
    bd.title = n ? et('checksN').replace('{x}', n) : '';
  });
}

/* ---------- checks: what is wrong shows on the field, in the Checks list above the form and on the drawing ---------- */
var ED_COVERED = { badEdge: 1, badShape: 1, dupNode: 1, nodeNoId: 1, groupNoId: 1, dupGroup: 1, badParent: 1, parentLoop: 1, badGroup: 1,
                   stepNode: 1, stepEdge: 1, stepNeither: 1, waveEdge: 1, regBits: 1, regRange: 1, regOverlap: 1, memBad: 1, memOverlap: 1 };
function edCss(v) { return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/["\\]/g, '\\$&'); }
function edWireOnNode(w) { return w.key === 'needPin' || w.key === 'stacked' || w.key === 'twoDrivers' || w.edge === undefined; }
function edComputeWires() {
  if (!ED) return;
  var d = edDiagram(), st = d ? edStateFor(d) : null;
  ED.wires = st && st.d.kind === 'graph' && st.L ? wiringChecks(st.d, st.L) : [];
}
function edApplyMarks() {
  if (!ED || !ED.body) return;
  var d = edDiagram();
  ED.issues = d ? edValidate(d) : [];
  if (ED.view !== 'form') return;
  var byKey = {}, byRow = {};
  ED.issues.forEach(function (q) {
    (byKey[q.vk] || (byKey[q.vk] = [])).push(q.text);
    var p = q.vk.slice(0, q.vk.lastIndexOf(':') + 1);
    (byRow[p] || (byRow[p] = [])).push(q.field + ': ' + q.text);
  });
  Array.prototype.forEach.call(ED.body.querySelectorAll('[data-vk]'), function (inp) {
    var msgs = byKey[inp.getAttribute('data-vk')];
    inp.classList.toggle('ed-bad', !!msgs);
    if (msgs) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid');
    var field = inp.closest('.ed-field'), m = field && field.querySelector('.ed-msg');
    if (m) { m.textContent = msgs ? msgs.join(' ') : ''; m.hidden = !msgs; }
  });
  Array.prototype.forEach.call(ED.body.querySelectorAll('tr.ed-rowmsg'), function (tr) {
    var msgs = byRow[tr.getAttribute('data-vp')];
    tr.hidden = !msgs;
    tr.firstChild.textContent = msgs ? '⚠ ' + msgs.join(' · ') : '';
  });
}
function edRefreshChecks() {
  var box = ED && ED.checksBox;
  if (!box || !ED.body || !ED.body.contains(box)) return;
  var d = edDiagram(), st = d ? edStateFor(d) : null, items = [];
  (ED.issues || []).forEach(function (q) { items.push({ q: q, pane: q.pane, text: q.where + ' · ' + q.field + ': ' + q.text }); });
  (ED.wires || []).forEach(function (w) { items.push({ w: w, pane: edWireOnNode(w) ? 'nodes' : 'edges', text: w.text }); });
  var mine = st ? '[' + (st.d.title || st.d.id) + '] ' : null;
  problemList.forEach(function (p) { if (!(ED_COVERED[p.key] && p.where === mine)) items.push({ text: p.text }); });
  if (typeof hierIssues === 'function') hierIssues(ED.raw, ED.diag).forEach(function (q) { items.push({ text: q.text, pane: q.edge !== undefined ? 'edges' : 'nodes', hfix: q.fixes || [] }); });
  items.forEach(function (it) { it.fixes = edFixesFor(it); });
  box.textContent = '';
  box.classList.toggle('ok', !items.length);
  var counts = {};
  items.forEach(function (it) { if (it.pane) counts[it.pane] = (counts[it.pane] || 0) + 1; });
  edPaneBadges(counts);
  if (!items.length) { box.appendChild(H('div', { class: 'ed-chk-head' }, [H('span', { text: '✓ ' + et('checksOk') })])); return; }
  var open = ED.checksOpen !== false;
  var toggle = H('button', { type: 'button', class: 'ed-chk-toggle', 'aria-expanded': open ? 'true' : 'false', text: open ? et('checksHide') : et('checksShow') });
  toggle.addEventListener('click', function () { ED.checksOpen = !open; edRefreshChecks(); });
  var safe = edSafeCount(items), all = null;
  if (safe) {
    all = H('button', { type: 'button', class: 'ed-fix safe ed-fixall', title: at('fixAllTitle'), text: '⚡ ' + asl('fixAll', safe) });
    all.addEventListener('click', edFixAll);
  }
  box.appendChild(H('div', { class: 'ed-chk-head' }, [H('strong', { text: '⚠ ' + et('checksN').replace('{x}', items.length) }), all, toggle]));
  if (!open) return;
  var ul = H('ul', { class: 'ed-chk-list' });
  items.slice(0, 80).forEach(function (it) {
    var go = it.q || it.w;
    var b = H(go ? 'button' : 'span', { type: go ? 'button' : null, class: 'ed-chk-item', text: it.text });
    if (go) b.addEventListener('click', function () { edGoToIssue(it); });
    ul.appendChild(H('li', {}, [b, it.fixes.length ? edFixBar(it.fixes) : null]));
  });
  if (items.length > 80) ul.appendChild(H('li', { class: 'ed-hint', text: '… +' + (items.length - 80) }));
  box.appendChild(ul);
}
/* Jump from an item in the Checks list to the field, or select the block or connection on the drawing. */
function edGoToIssue(it) {
  if (it.w) {
    var w = it.w, onNode = edWireOnNode(w);
    ED.selected = onNode ? { id: w.node } : { edge: w.edge };
    ED.revealRow = true;
    edShowPane(onNode ? 'nodes' : 'edges');
    edMarkSelection();
    edRevealOnCanvas(ED.selected);
    return;
  }
  var q = it.q;
  edShowPane(q.pane);
  if (q.sec) {
    ED.open[ED.diag + ':' + q.sec] = true;
    var det = ED.body.querySelector('details[data-sec="' + edCss(q.sec) + '"]');
    if (det) det.open = true;
  }
  var find = function () { return ED.body.querySelector('[data-vk="' + edCss(q.vk) + '"]'); };
  var inp = find();
  if (!inp) {
    var msg = ED.body.querySelector('tr.ed-rowmsg[data-vp="' + edCss(q.vk.slice(0, q.vk.lastIndexOf(':') + 1)) + '"]');
    var tr = msg ? msg.previousSibling : null;
    if (tr && tr.moreToggle) { tr.moreToggle(true); inp = find(); }
    if (!inp) inp = tr;
  }
  if (inp) { inp.scrollIntoView({ block: 'center' }); if (inp.focus) inp.focus({ preventScroll: true }); }
}
function edRevealOnCanvas(sel) {
  var st = active;
  if (!st || !st.canvas || !st.L || !st.svg || !sel) return;
  var p = null;
  if (sel.id !== undefined && st.L.nodes[sel.id]) p = st.L.nodes[sel.id];
  else if (sel.edge !== undefined) { var i = edEdgeIndex(st, sel.edge), g = i >= 0 ? st.L.edges[i] : null; if (g && g.points.length) p = labelPoint(g.points, 0, 0); }
  if (!p) return;
  var s = svgScale(st), off = svgOffset(st);
  st.canvas.scrollLeft = Math.max(0, off.x + (p.x + st.L.ox) * s - st.canvas.clientWidth / 2);
  st.canvas.scrollTop = Math.max(0, off.y + (p.y + st.L.oy) * s - st.canvas.clientHeight / 2);
}
/* Red rings on the pins a wiring check complains about, and a red frame around stacked blocks. */
function edDrawIssueMarks() {
  if (!ED || !active || !active.svg || active.d.kind !== 'graph' || !active.L) return;
  var old = active.svg.querySelector('.ed-issues');
  if (old) old.remove();
  var wires = ED.wires || [], root = active.svg.querySelector('g.root');
  if (!wires.length || !root) return;
  var st = active, k = 1 / svgScale(st), g = S('g', { class: 'ed-issues', 'pointer-events': 'none' });
  wires.forEach(function (w) {
    (w.pins || []).forEach(function (q) {
      var pin = edPins(st, q[0])[q[1]];
      if (pin) g.appendChild(S('circle', { cx: fmt(pin.x), cy: fmt(pin.y), r: fmt(7 * k), style: 'fill:rgba(220,38,38,.14);stroke:var(--bad)', 'stroke-width': fmt(1.6 * k) }));
    });
    if (w.key === 'stacked' && st.L.nodes[w.node]) {
      var p = st.L.nodes[w.node];
      g.appendChild(S('rect', { x: fmt(p.x - p.w / 2 - 4 * k), y: fmt(p.y - p.h / 2 - 4 * k), width: fmt(p.w + 8 * k), height: fmt(p.h + 8 * k), rx: fmt(4 * k),
        style: 'fill:none;stroke:var(--bad);stroke-dasharray:5 3', 'stroke-width': fmt(1.4 * k) }));
    }
  });
  root.appendChild(g);
}
function edAfterSave() {
  var n = (ED && ED.issues ? ED.issues.length : 0) + (ED && ED.wires ? ED.wires.length : 0);
  if (n) edStatus(el('savedWarn', n));
}

/* ---------- input checks: required fields, formats and rules across rows ----------
   Every issue is keyed "table:row:field" (for example "nodes:3:shape"), the key its input carries in data-vk. */
var ED_PORT_RE = /^[A-Za-z_\\][\w$.\\]*\s*(\[[^\[\]]+\]\s*)*$/;
var ED_BALL_ROWS = 'ABCDEFGHJKLMNPRTUVWY';
function vt(k, x) { return (et('v')[k] || k).replace('{x}', x === undefined ? '' : x); }
function edHas(v) { return v !== undefined && v !== null && str(v) !== ''; }
/* An icon is a name from the icon set or any short text such as an emoji; only unknown names are wrong. */
function edIconBad(v) { var s = str(v); return !!s && /^[a-z0-9-]+$/.test(s) && !iconKnown(s); }
function edShapeKnown(v) {
  var s = str(v).toLowerCase();
  if (!s || CORE_SHAPES[s]) return true;
  if (s.indexOf('icon:') === 0) return iconKnown(s.slice(5));
  if (symbolName(s)) return true;
  return /^mxgraph\./.test(s) && !Object.keys(STENCIL_XML).length;
}
/* Values as written in specs and RTL: 42, 0x2A, 0b101, 8'h2A. Unknown values (x, z, ?, -) are fine and give null. */
function edParseVal(v) {
  var s = str(v).replace(/[_\s]/g, '');
  if (/^[xXzZ?-]+$/.test(s)) return null;
  var m = s.match(/^(\d+)?'([bBoOdDhH])([0-9a-fA-FxXzZ?]+)$/);
  if (m) {
    if (/[xXzZ?]/.test(m[3])) return null;
    return parseInt(m[3], { b: 2, o: 8, d: 10, h: 16 }[m[2].toLowerCase()]);
  }
  return parseNum(s);
}
function edValidate(d) {
  var out = [];
  var add = function (pane, vk, where, field, text, sec, code) { out.push({ pane: pane, vk: vk, where: where, field: field, text: text, sec: sec || null, code: code || null }); };
  var type = edTypeOf(d);
  if (type === 'graph') edCheckGraph(d, add);
  else if (type === 'wave') edCheckWave(d, add);
  else if (type === 'register') edCheckRegisters(d, add);
  else if (type === 'memory') edCheckMemory(d, add);
  else if (type === 'chip') edCheckChip(d, add);
  else edCheckPinout(d, add);
  return out;
}
function edCheckStyle(style, pane, vk, where, add) {
  if (!style || typeof style !== 'object') return;
  ['fill', 'stroke', 'text', 'color'].forEach(function (k) {
    if (edHas(style[k]) && !normColor(style[k])) add(pane, vk + 'style.' + k, where, ec(k === 'color' ? 'stroke' : k), vt('color', str(style[k])));
  });
}
function edCheckGraph(d, add) {
  var manual = d.layout === 'manual', nodeIds = {}, groupIds = {};
  (Array.isArray(d.groups) ? d.groups : []).forEach(function (g) { if (g && edHas(g.id)) groupIds[str(g.id)] = g; });
  (Array.isArray(d.nodes) ? d.nodes : []).forEach(function (n, i) {
    if (!n || typeof n !== 'object') return;
    var id = str(n.id), vk = 'nodes:' + i + ':', where = et('nodes') + ' ' + (id || '#' + (i + 1));
    if (!id) add('nodes', vk + 'id', where, ec('id'), vt('required'), null, 'idReq');
    else if (!/^[A-Za-z0-9_.:-]{1,128}$/.test(id)) add('nodes', vk + 'id', where, ec('id'), vt('idChars'), null, 'idChars');
    else if (nodeIds[id]) add('nodes', vk + 'id', where, ec('id'), vt('idDup'), null, 'idDup');
    if (id) nodeIds[id] = true;
    if (edHas(n.shape) && !edShapeKnown(n.shape)) add('nodes', vk + 'shape', where, ec('shape'), vt('shape', str(n.shape)), null, 'shape');
    if (edHas(n.group) && !groupIds[str(n.group)]) add('nodes', vk + 'group', where, ec('group'), vt('group', str(n.group)), null, 'group');
    if (edIconBad(n.icon)) add('nodes', vk + 'icon', where, ec('icon'), vt('icon', str(n.icon)), null, 'icon');
    ['w', 'h'].forEach(function (k) { if (edHas(n[k]) && !(+n[k] > 0)) add('nodes', vk + k, where, ec(k), vt('positive')); });
    ['x', 'y'].forEach(function (k) { if (edHas(n[k]) && !isFinite(+n[k])) add('nodes', vk + k, where, ec(k), vt('number', str(n[k]))); });
    var ports = n.ports && typeof n.ports === 'object' ? n.ports : {};
    [['in', 'portsIn'], ['out', 'portsOut'], ['inout', 'portsInout']].forEach(function (q) {
      var list = Array.isArray(ports[q[0]]) ? ports[q[0]] : listToArray(ports[q[0]]);
      var bad = list.map(str).filter(function (p) { return p && !ED_PORT_RE.test(p); })[0];
      if (bad) add('nodes', vk + 'ports.' + q[0], where, ec(q[1]), vt('port', bad));
    });
    edCheckStyle(n.style, 'nodes', vk, where, add);
  });
  (Array.isArray(d.edges) ? d.edges : []).forEach(function (e, i) {
    if (!e || typeof e !== 'object') return;
    var vk = 'edges:' + i + ':', where = et('edges') + ' ' + (i + 1);
    ['from', 'to'].forEach(function (k) {
      var v = str(e[k]);
      if (!v) { if (!(manual && normPt(e[k + 'Point']))) add('edges', vk + k, where, ec(k), vt('required')); return; }
      if (nodeIds[v]) return;
      if (groupIds[v]) { if (!manual) add('edges', vk + k, where, ec(k), vt('endGroupAuto')); return; }
      add('edges', vk + k, where, ec(k), vt('end', v), null, 'end');
    });
    edCheckStyle(e.style, 'edges', vk, where, add);
  });
  var seen = {};
  (Array.isArray(d.groups) ? d.groups : []).forEach(function (g, i) {
    if (!g || typeof g !== 'object') return;
    var id = str(g.id), vk = 'groups:' + i + ':', where = et('groups') + ' ' + (id || '#' + (i + 1));
    if (!id) add('groups', vk + 'id', where, ec('id'), vt('required'));
    else if (!/^[A-Za-z0-9_.:-]{1,128}$/.test(id)) add('groups', vk + 'id', where, ec('id'), vt('idChars'));
    else if (seen[id]) add('groups', vk + 'id', where, ec('id'), vt('idDup'));
    if (id) seen[id] = true;
    var parent = str(g.parent);
    if (parent) {
      if (!groupIds[parent] || parent === id) add('groups', vk + 'parent', where, ec('parent'), vt('group', parent), null, 'parent');
      else {
        var walk = parent, hops = 0;
        while (walk && groupIds[walk] && walk !== id && hops++ < 200) walk = str(groupIds[walk].parent);
        if (walk === id) add('groups', vk + 'parent', where, ec('parent'), vt('parentLoop'), null, 'parent');
      }
    }
    if (edIconBad(g.icon)) add('groups', vk + 'icon', where, ec('icon'), vt('icon', str(g.icon)));
  });
  (Array.isArray(d.steps) ? d.steps : []).forEach(function (s, i) {
    if (!s || typeof s !== 'object') return;
    var vk = 'steps:' + i + ':', where = et('stepsShort') + ' ' + (i + 1);
    if (edHas(s.node)) { if (!nodeIds[str(s.node)]) add('steps', vk + 'target', where, ec('target'), vt('end', str(s.node)), null, 'step'); }
    else if (Array.isArray(s.edge) && s.edge.length === 2) {
      var ok = (d.edges || []).some(function (e) { return e && str(e.from) === str(s.edge[0]) && str(e.to) === str(s.edge[1]); });
      if (!ok) add('steps', vk + 'target', where, ec('target'), vt('step'), null, 'step');
    } else add('steps', vk + 'target', where, ec('target'), vt('required'));
  });
}
function edWaveRows(d) {
  var src = d.wave && typeof d.wave === 'object' && !Array.isArray(d.wave) ? d.wave : d, rows = [];
  (function walk(items) {
    (Array.isArray(items) ? items : []).forEach(function (it) {
      if (Array.isArray(it)) walk(it.slice(typeof it[0] === 'string' ? 1 : 0));
      else rows.push(it && typeof it === 'object' ? it : {});
    });
  })(src.signal);
  return { src: src, rows: rows };
}
function edCheckWave(d, add) {
  var w = edWaveRows(d), markers = {};
  w.rows.forEach(function (r, i) {
    var vk = 'signals:' + i + ':', where = et('signals') + ' ' + (str(r.name) || '#' + (i + 1));
    var bad = String(r.wave === undefined || r.wave === null ? '' : r.wave).replace(/[.|pPnNlLhH01zudx=2-9 ]/g, '');
    if (bad) add('signals', vk + 'wave', where, ec('wave'), vt('waveChars', bad.charAt(0)));
    if (edHas(r.period) && !(+r.period > 0)) add('signals', vk + 'period', where, ec('period'), vt('positive'));
    String(r.node || '').split('').forEach(function (ch) { if (ch !== '.' && ch !== ' ') markers[ch] = true; });
  });
  (Array.isArray(w.src.edge) ? w.src.edge : []).forEach(function (e, i) {
    var m = str(e).match(/^(\S)\s*[-~|<>+]+\s*(\S)/);
    if (!m) return;
    [m[1], m[2]].forEach(function (ch) {
      if (!markers[ch]) add('arrows', 'arrows:' + i + ':v', et('arrowsShort') + ' ' + (i + 1), ec('edge'), vt('marker', ch));
    });
  });
}
function edCheckRegisters(d, add) {
  (Array.isArray(d.registers) ? d.registers : []).forEach(function (r, ri) {
    if (!r || typeof r !== 'object') return;
    var sec = 'reg' + ri, vk = 'reg:' + ri + ':', where = str(r.name) || 'REG #' + (ri + 1);
    if (!str(r.name)) add('regs', vk + 'name', where, ec('name'), vt('required'), sec);
    var width = edHas(r.width) ? +r.width : 32;
    if (!(width >= 1 && width <= 128 && Math.round(width) === width)) { add('regs', vk + 'width', where, ec('regWidth'), vt('width'), sec); width = 32; }
    if (edHas(r.offset) && !isFinite(parseNum(r.offset))) add('regs', vk + 'offset', where, ec('offset'), vt('number', str(r.offset)), sec);
    if (edHas(r.reset)) {
      var rv = edParseVal(r.reset);
      if (rv !== null && !isFinite(rv)) add('regs', vk + 'reset', where, ec('reset'), vt('number', str(r.reset)), sec);
      else if (rv !== null && rv >= Math.pow(2, width)) add('regs', vk + 'reset', where, ec('reset'), vt('resetFit', width), sec);
    }
    var taken = [];
    (Array.isArray(r.fields) ? r.fields : []).forEach(function (f, fi) {
      if (!f || typeof f !== 'object') return;
      var fk = 'regf:' + ri + ':' + fi + ':', fw = where + ' · ' + (str(f.name) || '#' + (fi + 1));
      if (!str(f.name)) add('regs', fk + 'name', fw, ec('name'), vt('required'), sec);
      var has = edHas(f.bits) || f.msb !== undefined, range = has ? parseBits(f) : null;
      if (!has) { add('regs', fk + 'bits', fw, ec('bits'), vt('required'), sec); return; }
      if (!range) { add('regs', fk + 'bits', fw, ec('bits'), vt('bits'), sec); return; }
      if (range.msb >= width) { add('regs', fk + 'bits', fw, ec('bits'), vt('bitsWide', width), sec); return; }
      var hit = taken.filter(function (o) { return !(range.lsb > o.msb || range.msb < o.lsb); })[0];
      if (hit) add('regs', fk + 'bits', fw, ec('bits'), vt('overlap', hit.name || '#' + (hit.i + 1)), sec);
      taken.push({ msb: range.msb, lsb: range.lsb, name: str(f.name), i: fi });
      if (edHas(f.reset)) {
        var fv = edParseVal(f.reset), nb = range.msb - range.lsb + 1;
        if (fv !== null && !isFinite(fv)) add('regs', fk + 'reset', fw, ec('reset'), vt('number', str(f.reset)), sec);
        else if (fv !== null && fv >= Math.pow(2, nb)) add('regs', fk + 'reset', fw, ec('reset'), vt('resetFit', nb), sec);
      }
    });
  });
}
function edCheckMemory(d, add) {
  var list = [];
  (Array.isArray(d.regions) ? d.regions : []).forEach(function (m, i) {
    if (!m || typeof m !== 'object') return;
    var vk = 'regions:' + i + ':', name = str(m.name), where = et('regions') + ' ' + (name || '#' + (i + 1));
    if (!name) add('regions', vk + 'name', where, ec('name'), vt('required'));
    var base = parseNum(m.base), hasSize = edHas(m.size), hasEnd = edHas(m.end);
    if (!edHas(m.base)) add('regions', vk + 'base', where, ec('base'), vt('required'));
    else if (!isFinite(base)) add('regions', vk + 'base', where, ec('base'), vt('number', str(m.base)));
    var size = hasSize ? parseSize(m.size) : NaN, end = hasEnd ? parseNum(m.end) : NaN;
    if (hasSize && !(size > 0)) add('regions', vk + 'size', where, ec('sizeB'), vt('size', str(m.size)));
    if (hasEnd && !isFinite(end)) add('regions', vk + 'end', where, ec('end'), vt('number', str(m.end)));
    if (!hasSize && !hasEnd) add('regions', vk + 'size', where, ec('sizeB'), vt('sizeOrEnd'));
    if (!hasSize && isFinite(end) && isFinite(base)) {
      if (end < base) add('regions', vk + 'end', where, ec('end'), vt('endBeforeBase'));
      else size = end - base + 1;
    }
    if (isFinite(base) && size > 0) list.push({ i: i, name: name || '#' + (i + 1), base: base, end: base + size - 1, where: where });
  });
  list.sort(function (a, b) { return a.base - b.base || a.i - b.i; });
  var far = null;
  list.forEach(function (r) {
    if (far && r.base <= far.end) add('regions', 'regions:' + r.i + ':base', r.where, ec('base'), vt('overlap', far.name));
    if (!far || r.end > far.end) far = r;
  });
}
function edCheckChip(d, add) {
  var ids = {}, domains = {};
  (Array.isArray(d.domains) ? d.domains : []).forEach(function (g, i) {
    if (!g || typeof g !== 'object') return;
    var id = str(g.id), vk = 'domains:' + i + ':', where = et('domains') + ' ' + (id || '#' + (i + 1));
    if (!id) add('domains', vk + 'id', where, ec('id'), vt('required'));
    else if (domains[id]) add('domains', vk + 'id', where, ec('id'), vt('idDup'));
    if (id) domains[id] = true;
  });
  (Array.isArray(d.columns) ? d.columns : []).forEach(function (c, ci) {
    if (!c || typeof c !== 'object') return;
    var sec = 'col' + ci;
    if (c.bus !== undefined) { if (!str(c.bus)) add('columns', 'col:' + ci + ':bus', et('colBus') + ' ' + (ci + 1), ec('bus'), vt('required'), sec); return; }
    (Array.isArray(c.blocks) ? c.blocks : []).forEach(function (b, bi) {
      if (!b || typeof b !== 'object') return;
      var id = str(b.id) || str(b.title), vk = 'blocks:' + ci + ':' + bi + ':', where = et('colBlocks') + ' ' + (id || '#' + (bi + 1));
      /* a block without a title is not drawn */
      if (!str(b.title)) add('columns', vk + 'title', where, ec('title'), vt('required'), sec);
      if (id && ids[id]) add('columns', vk + (str(b.id) ? 'id' : 'title'), where, ec(str(b.id) ? 'id' : 'title'), vt('idDup'), sec);
      if (id) ids[id] = true;
      if (edHas(b.domain) && !domains[str(b.domain)]) add('columns', vk + 'domain', where, ec('domain'), vt('domain', str(b.domain)), sec);
      if (edHas(b.rows) && !(+b.rows > 0)) add('columns', vk + 'rows', where, ec('rows'), vt('positive'), sec);
    });
  });
  (Array.isArray(d.links) ? d.links : []).forEach(function (l, i) {
    if (!l || typeof l !== 'object') return;
    var vk = 'links:' + i + ':', where = et('links') + ' ' + (i + 1);
    ['from', 'to'].forEach(function (k) {
      var v = str(l[k]);
      if (!v) add('links', vk + k, where, ec(k), vt('required'));
      else if (!ids[v]) add('links', vk + k, where, ec(k), vt('end', v));
    });
  });
}
function edCheckPinout(d, add) {
  var pkg = d.package, name = typeof pkg === 'string' ? pkg : (pkg && typeof pkg === 'object' ? str(pkg.name) : '');
  var where = et('pkgGrp'), m = String(name || '').replace(/[\s-]/g, '').match(/^([A-Za-z]+?)(\d+)$/);
  var objPkg = pkg && typeof pkg === 'object';
  if (!objPkg && !str(name)) add('pins', 'pkg::pkg', where, ec('pkg'), vt('required'));
  else if (!objPkg && !m) add('pins', 'pkg::pkg', where, ec('pkg'), vt('pkg'));
  var fam = m ? m[1].toUpperCase() : (objPkg ? str(pkg.style).toUpperCase() : '');
  var total = m ? parseInt(m[2], 10) : (objPkg ? posInt(pkg.pins) || 0 : 0), bga = /BGA|CSP/.test(fam);
  var seen = {};
  (Array.isArray(d.pins) ? d.pins : []).forEach(function (p, i) {
    if (typeof p === 'string') p = { n: i + 1, name: p };
    if (!p || typeof p !== 'object') return;
    var key = p.ball !== undefined ? str(p.ball).toUpperCase() : str(p.n), vk = 'pins:' + i + ':', w = et('pins') + ' ' + (key || '#' + (i + 1));
    if (!key) add('pins', vk + 'n', w, ec('n'), vt('required'));
    else if (p.ball !== undefined || bga) {
      var mm = key.match(/^([A-Z])(\d+)$/);
      if (!mm || ED_BALL_ROWS.indexOf(mm[1]) < 0) add('pins', vk + 'n', w, ec('n'), vt('ball'));
    } else {
      var n = +key;
      if (!(n >= 1 && Math.round(n) === n)) add('pins', vk + 'n', w, ec('n'), vt('pinNumAny'));
      else if (total && n > total) add('pins', vk + 'n', w, ec('n'), vt('pinNum', total));
    }
    if (key && seen[key]) add('pins', vk + 'n', w, ec('n'), vt('pinDup', key));
    if (key) seen[key] = true;
    if (!str(p.name)) add('pins', vk + 'name', w, ec('name'), vt('required'));
  });
}
/* The Settings pane: this tab's own fields first, then the fields that belong to the whole document. */
function edSetup(pane, d, extraRows, layout) {
  var raw = ED.raw, h = et('h');
  if (layout) pane.appendChild(layout);
  edGroup(pane, et('thisTab'), [
    [ec('title'), edInput(d.title, function (v) { setOrDelete(d, 'title', v); edChanged(false); })],
    [ec('id'), edInput(d.id, function (v) {
      var at0 = raw.diagrams.indexOf(d), old = typeof hierTabId === 'function' ? hierTabId(d, at0) : null;
      setOrDelete(d, 'id', String(v).replace(/[^A-Za-z0-9_.-]/g, '-'));
      if (old && typeof hierRenameTab === 'function') hierRenameTab(raw, old, hierTabId(d, at0));
      edChanged(false);
    }, { lazy: true }), { hint: h.tabId }],
    [ec('tag'), edInput(d.tag, function (v) { setOrDelete(d, 'tag', v); edChanged(false); })],
    [ec('summary'), edInput(d.summary, function (v) { setOrDelete(d, 'summary', v); edChanged(false); }, { type: 'area' }), { hint: h.summary }]
  ].concat(extraRows || []));
  edGroup(pane, et('wholeDoc'), [
    [et('docTitle'), edInput(raw.title, function (v) { setOrDelete(raw, 'title', v); edChanged(false); })],
    [et('docSub'), edInput(raw.subtitle, function (v) { setOrDelete(raw, 'subtitle', v); edChanged(false); }, { type: 'area' })],
    [et('docLang'), edInput(raw.lang || lang, function (v) { raw.lang = v; lang = v; edChanged(false); edBuild(); }, { type: 'select', options: [['vi', 'Tiếng Việt'], ['en', 'English']] })]
  ]);  if (layout && typeof hierSetupRows === 'function') hierSetupRows(pane);
}

/* Block diagrams and flows. */
function edShapeOptions() {
  var names = et('types');
  var opts = [{ group: lang === 'vi' ? 'Thẻ' : 'Cards', items: [['', 'card'], ['state', 'state'], ['decision', 'decision']] }];
  SYMBOL_CATS.concat(['icons']).forEach(function (cat) {
    var items = Object.keys(SYMBOLS).filter(function (k) { return SYMBOLS[k].cat === cat; }).map(function (k) { return [k, k]; });
    if (items.length) opts.push({ group: (SYMBOL_CAT_NAMES[lang] || SYMBOL_CAT_NAMES.en)[cat] || (lang === 'vi' ? 'Biểu tượng' : 'Icons'), items: items });
  });
  var libs = {};
  stencilNames().forEach(function (n) { var lib = n.split('.').slice(0, -1).join('.'); (libs[lib] = libs[lib] || []).push([n, n.split('.').pop().replace(/_/g, ' ')]); });
  Object.keys(libs).sort().forEach(function (lib) { opts.push({ group: 'draw.io: ' + lib.replace(/^mxgraph\./, ''), items: libs[lib] }); });
  opts.push({ group: 'draw.io', items: [['dio-or', 'dio-or'], ['dio-xor', 'dio-xor']] });
  void names;
  return opts;
}
function edIconOptions() {
  var o = [['', et('none')]];
  Object.keys(ICON_GROUPS).forEach(function (g) { o.push({ group: g, items: ICON_GROUPS[g].map(function (n) { return [n, n]; }) }); });
  return o;
}
function edIdsOf(d, withGroups) {
  var o = (d.nodes || []).map(function (n) { return [n.id, n.id + (n.title && n.title !== n.id ? ' · ' + String(n.title).split('\n')[0].slice(0, 30) : '')]; });
  if (withGroups) (d.groups || []).forEach(function (g) { o.push([g.id, '▢ ' + g.id + (g.label ? ' · ' + g.label : '')]); });
  return [['', et('none')]].concat(o);
}
function edUniqueId(list, base) {
  var used = {};
  (list || []).forEach(function (x) { used[x.id] = true; });
  base = String(base || 'n').replace(/[^A-Za-z0-9_.-]/g, '-') || 'n';
  if (!used[base]) return base;
  for (var i = 2; ; i++) if (!used[base + i]) return base + i;
}
function edRenameNode(d, oldId, newId) {
  if (typeof hierRenameRefs === 'function') hierRenameRefs(ED.raw, d, oldId, newId);
  (d.edges || []).forEach(function (e) { if (e.from === oldId) e.from = newId; if (e.to === oldId) e.to = newId; });
  (d.steps || []).forEach(function (s) {
    if (s.node === oldId) s.node = newId;
    if (Array.isArray(s.edge)) s.edge = s.edge.map(function (x) { return x === oldId ? newId : x; });
  });
}
function edRemoveNode(d, id) {
  if (typeof hierDetachNotes === 'function') hierDetachNotes(d, id);
  d.nodes = (d.nodes || []).filter(function (n) { return n.id !== id; });
  d.edges = (d.edges || []).filter(function (e) { return e.from !== id && e.to !== id; });
  d.steps = (d.steps || []).filter(function (s) { return s.node !== id && !(Array.isArray(s.edge) && s.edge.indexOf(id) >= 0); });
}
function edStyleGrid(obj, keys, vk) {
  var holder = H('div');
  var style = function () { return obj.style || (obj.style = {}); };
  var tidy = function () { if (obj.style && !Object.keys(obj.style).length) delete obj.style; };
  var rows = [];
  keys.forEach(function (k) {
    var cur = obj.style ? obj.style[k] : undefined;
    if (k === 'fill' || k === 'stroke' || k === 'text' || k === 'color') {
      var box = H('div', { class: 'ed-color' });
      var txt = edInput(cur, function (v) { setOrDelete(style(), k, v); tidy(); pickr.value = /^#[0-9a-f]{6}$/i.test(v) ? v : '#000000'; edChanged(false); }, { placeholder: '#rrggbb' });
      if (vk) txt.setAttribute('data-vk', vk + 'style.' + k);
      var pickr = H('input', { type: 'color', class: 'ed-swatch', value: /^#[0-9a-f]{6}$/i.test(cur || '') ? cur : '#000000', 'aria-label': ec(k === 'color' ? 'stroke' : k) });
      pickr.addEventListener('input', function () { txt.value = pickr.value; setOrDelete(style(), k, pickr.value); edChanged(false); });
      box.appendChild(pickr); box.appendChild(txt);
      rows.push([ec(k === 'color' ? 'stroke' : k), box]);
    } else if (k === 'bold' || k === 'dashed') {
      rows.push([ec(k), edInput(!!cur, function (v) { setOrDelete(style(), k, v); tidy(); edChanged(false); }, { type: 'check' })]);
    } else {
      rows.push([ec(k), edInput(cur, function (v) { setOrDelete(style(), k, v); tidy(); edChanged(false); }, { type: 'num' })]);
    }
  });
  edGrid(holder, rows);
  return holder;
}
function edDatalist(id, options) {
  var dl = H('datalist', { id: id });
  options.forEach(function (o) {
    if (o && o.group) o.items.forEach(function (it) { dl.appendChild(H('option', { value: it[0], text: it[1] !== it[0] ? o.group + ': ' + it[1] : o.group })); });
    else if (o && o[0] !== '') dl.appendChild(H('option', { value: o[0], text: o[1] }));
  });
  ED.body.appendChild(dl);
}
function edFormGraph(d) {
  d.nodes = d.nodes || [];
  d.edges = d.edges || [];
  var manual = d.layout === 'manual', h = et('h');
  edDatalist('ed-shapes', edShapeOptions());
  edDatalist('ed-ids', edIdsOf(d, manual));
  edDatalist('ed-icons', edIconOptions());
  var P = edPanes([['nodes', et('nodes'), d.nodes.length], ['edges', et('edges'), d.edges.length], ['groups', et('groups'), (d.groups || []).length],
                   ['steps', et('stepsShort'), (d.steps || []).length], ['notes', ht('notes'), (d.notes || []).length], ['legend', et('legend')], ['setup', et('setup')]]);
  hierNotesPane(d, P.notes);

  edPatternSection(P.nodes);
  edPalette(d, P.nodes);
  var groupsOpts = function () { return [['', et('none')]].concat((d.groups || []).map(function (g) { return [g.id, g.id + (g.label ? ' · ' + g.label : '')]; })); };
  P.nodes.appendChild(edTable({
    rows: function () { return d.nodes; }, rowKey: function (n) { return 'n:' + n.id; }, name: et('nodes'), vkey: 'nodes',
    cols: [
      { k: 'id', label: ec('id'), w: '17%', lazy: true, structural: true, req: true, hint: h.id, set: function (n, v) {
        var nv = String(v).trim().replace(/[^A-Za-z0-9_.:-]/g, '-');
        if (!nv || nv === n.id) return;
        nv = edUniqueId(d.nodes.filter(function (x) { return x !== n; }), nv);
        edRenameNode(d, n.id, nv);
        n.id = nv;
      } },
      { k: 'title', label: ec('title'), type: 'area', hint: h.title, aliases: ['name', 'tên'], onFocus: edFocusNode },
      { k: 'shape', label: ec('shape'), w: '21%', type: 'combo', list: 'ed-shapes', ph: 'card', hint: h.shape, onFocus: edFocusNode, set: function (n, v) { setOrDelete(n, 'shape', String(v || '').trim()); } },
      { k: 'color', label: ec('color'), w: '14%', type: 'select', options: paletteOptions(true) },
      { k: 'group', label: ec('group'), w: '14%', type: 'select', options: groupsOpts }
    ],
    add: function (fromPaste) {
      var n = { id: edUniqueId(d.nodes, 'n' + (d.nodes.length + 1)), title: lang === 'vi' ? 'Khối mới' : 'New block' };
      if (manual) edPlaceNew(d, n);
      if (!fromPaste) { ED.selected = { id: n.id }; ED.multi = null; ED.focusRow = 'n:' + n.id; }
      return n;
    },
    onDelete: function (gone) { if (gone) { edKeepHeal(asHealPairs(d, [gone.id])); d.edges = d.edges.filter(function (e) { return e.from !== gone.id && e.to !== gone.id; }); } },
    onDuplicate: function (copy) { copy.id = edUniqueId(d.nodes, copy.id); if (copy.x !== undefined) { copy.x += 30; copy.y += 30; } },
    extra: function (n) { return edNodeDetails(d, n); }
  }));
  P.nodes.appendChild(H('ul', { class: 'ed-hint ed-keys' }, et('dragHint').split('\n').map(function (line) { return H('li', { text: line }); })));

  P.edges.appendChild(edTable({
    rows: function () { return d.edges; }, rowKey: function (e) { return 'e:' + d.edges.indexOf(e); }, name: et('edges'), vkey: 'edges',
    cols: [
      { k: 'from', label: ec('from'), w: '20%', type: 'combo', list: 'ed-ids', req: true, hint: h.ends },
      { k: 'to', label: ec('to'), w: '20%', type: 'combo', list: 'ed-ids', req: true, hint: h.ends },
      { k: 'label', label: ec('label'), type: 'area' },
      { k: 'kind', label: ec('kind'), w: '15%', type: 'select', options: [['', 'normal']].concat(KIND_ORDER.filter(function (k) { return k !== 'normal'; }).map(function (k) { return [k, k]; })) },
      { k: 'dir', label: ec('dir'), w: '11%', type: 'select', options: [['', '→'], ['back', '←'], ['both', '↔'], ['none', '—']] }
    ],
    add: function () { var a = d.nodes[0], b = d.nodes[1] || d.nodes[0]; return { from: a ? a.id : '', to: b ? b.id : '' }; },
    extra: function (e) { return edEdgeDetails(d, e); }
  }));

  d.groups = d.groups || [];
  P.groups.appendChild(edTable({
    rows: function () { return d.groups; }, name: et('groups'), vkey: 'groups',
    cols: [
      { k: 'id', label: ec('id'), w: '18%', lazy: true, structural: true, req: true, hint: h.id, set: function (g, v) {
        var nv = String(v).trim().replace(/[^A-Za-z0-9_.:-]/g, '-');
        if (!nv || nv === g.id) return;
        d.nodes.forEach(function (n) { if (n.group === g.id) n.group = nv; });
        d.groups.forEach(function (x) { if (x.parent === g.id) x.parent = nv; });
        g.id = nv;
      } },
      { k: 'label', label: ec('label') },
      { k: 'color', label: ec('color'), w: '16%', type: 'select', options: paletteOptions(true) },
      { k: 'parent', label: ec('parent'), w: '18%', type: 'select', options: function (g) { return [['', et('none')]].concat(d.groups.filter(function (x) { return x !== g; }).map(function (x) { return [x.id, x.id]; })); } },
      { k: 'icon', label: ec('icon'), w: '14%', type: 'combo', list: 'ed-icons', hint: et('h').icon }
    ],
    add: function () { return { id: edUniqueId(d.groups, 'g' + (d.groups.length + 1)), label: lang === 'vi' ? 'Nhóm mới' : 'New group' }; },
    onDelete: function (gone) { d.nodes.forEach(function (n) { if (n.group === gone.id) delete n.group; }); }
  }));

  d.steps = d.steps || [];
  var targets = function () {
    var o = [['', et('none')]];
    d.nodes.forEach(function (n) { o.push(['node:' + n.id, '▭ ' + n.id]); });
    d.edges.forEach(function (e) { if (e.from && e.to) o.push(['edge:' + e.from + '>' + e.to, '→ ' + e.from + ' → ' + e.to]); });
    return o;
  };
  P.steps.appendChild(edTable({
    rows: function () { return d.steps; }, name: et('steps'), vkey: 'steps',
    cols: [
      { k: 'target', label: ec('target'), w: '32%', type: 'select', options: targets, req: true, hint: h.target,
        get: function (s) { return s.node ? 'node:' + s.node : (Array.isArray(s.edge) ? 'edge:' + s.edge[0] + '>' + s.edge[1] : ''); },
        set: function (s, v) { delete s.node; delete s.edge; if (/^node:/.test(v)) s.node = v.slice(5); else if (/^edge:/.test(v)) s.edge = v.slice(5).split('>'); } },
      { k: 'title', label: ec('title') },
      { k: 'text', label: ec('text2'), type: 'area' }
    ],
    add: function () { return { node: d.nodes[0] ? d.nodes[0].id : '', text: '' }; }
  }));

  edLegend(d, P.legend);

  var layout = H('div');
  var lrows = [[ec('direction'), edInput(d.direction || 'TB', function (v) { d.direction = v; edChanged(false); }, { type: 'select', options: [['TB', '↓ TB'], ['LR', '→ LR'], ['BT', '↑ BT'], ['RL', '← RL']] })]];
  if (manual) lrows.push([ec('route'), edInput(d.route || '', function (v) { setOrDelete(d, 'route', v); edChanged(false); }, { type: 'select', options: [['', et('auto')], ['orthogonal', 'orthogonal ┐'], ['straight', 'straight ╱'], ['curved', 'curved ∿'], ['spline', 'spline'], ['elbow', 'elbow'], ['segment', 'segment']] })]);
  var lg = edGroup(layout, et('layoutGrp'), lrows, manual ? et('layoutManualNote') : et('layoutAutoNote'));
  if (manual) {
    var relayout = H('button', { type: 'button', class: 'tb-btn', title: et('autoLayoutTitle'), text: et('autoLayout') });
    relayout.addEventListener('click', function () { edAutoLayout(d); });
    lg.appendChild(H('div', { class: 'ed-row-actions ed-gnote' }, [relayout]));
  }
  edSetup(P.setup, d, null, layout);
}
/* The settings of one block, in titled groups. */
function edNodeDetails(d, n) {
  var i = d.nodes.indexOf(n), vk = 'nodes:' + i + ':', h = et('h');
  var box = H('div', { class: 'ed-more' });
  var set = function (k) { return function (v) { setOrDelete(n, k, v); edChanged(false); }; };
  edGroup(box, et('gContent'), [
    [ec('desc'), edInput(n.desc, set('desc'), { type: 'area' }), { vk: vk + 'desc' }],
    [ec('icon'), edInput(n.icon, set('icon'), { type: 'combo', list: 'ed-icons', placeholder: 'server, database, 🚀' }), { vk: vk + 'icon', hint: et('h').icon }]
  ]);
  var chips = edPinChips(n);
  if (chips) edGroup(box, et('gPins'), null, et('pinNote')).appendChild(chips);
  var ports = n.ports || {};
  var setPort = function (k) { return function (v) { var p = n.ports || (n.ports = {}); setOrDelete(p, k, listToArray(v)); if (!Object.keys(p).length) delete n.ports; edChanged(false); }; };
  edGroup(box, et('gPorts'), [
    [ec('portsIn'), edInput(arrayToList(ports.in), setPort('in'), { placeholder: 'clk, rst_n, din[7:0]' }), { vk: vk + 'ports.in' }],
    [ec('portsOut'), edInput(arrayToList(ports.out), setPort('out'), { placeholder: 'dout[7:0], irq' }), { vk: vk + 'ports.out' }],
    [ec('portsInout'), edInput(arrayToList(ports.inout), setPort('inout'), { placeholder: 'sda' }), { vk: vk + 'ports.inout' }]
  ], h.ports);
  var flags = H('div', { class: 'ed-flags' }, ['external', 'initial', 'final'].map(function (k) {
    return H('label', { class: 'ed-flag' }, [edInput(n[k], set(k), { type: 'check' }), H('span', { text: ec(k) })]);
  }));
  edGroup(box, et('gShow'), [
    [ec('size'), edInput(n.size || '', set('size'), { type: 'select', options: [['', et('auto')], ['sm', 'sm'], ['md', 'md'], ['lg', 'lg']] })],
    [ec('labelPos'), edInput(n.labelPos || '', set('labelPos'), { type: 'select', options: [['', et('auto')], ['center', 'center'], ['top', 'top'], ['bottom', 'bottom'], ['left', 'left'], ['right', 'right'], ['none', 'none']] })],
    [et('gFlags'), flags]
  ]);
  edGroup(box, et('gPos'), [
    [ec('x'), edInput(n.x, set('x'), { type: 'num' }), { vk: vk + 'x' }],
    [ec('y'), edInput(n.y, set('y'), { type: 'num' }), { vk: vk + 'y' }],
    [ec('w'), edInput(n.w, set('w'), { type: 'num' }), { vk: vk + 'w' }],
    [ec('h'), edInput(n.h, set('h'), { type: 'num' }), { vk: vk + 'h' }]
  ], h.pos + ' ' + h.size, 'ed-grid4');
  edGroup(box, et('gStyle')).appendChild(edStyleGrid(n, ['fill', 'stroke', 'text', 'strokeWidth', 'fontSize', 'bold', 'dashed', 'rotation'], vk));
  return box;
}
/* Named pins of a symbol, marked when a wire is fixed to them. */
function edPinChips(n) {
  var pins = pinList(shapeDef(normShape(n.shape)));
  if (!pins.length) return null;
  var id = str(n.id), st = active && active.d && active.d.kind === 'graph' && active.d.nodeById[id] ? active : null, used = {};
  if (st) st.d.edges.forEach(function (e) {
    var a = e.from === id ? boundPin(st.d, e.from, e.fromAnchor) : null, b = e.to === id ? boundPin(st.d, e.to, e.toAnchor) : null;
    if (a) used[a.index] = true;
    if (b) used[b.index] = true;
  });
  return H('div', { class: 'ed-pinlist' }, pins.map(function (p) {
    var on = !!used[p.index];
    return H('span', { class: 'ed-pin ed-pin-' + p.dir + (on ? ' on' : ''), title: t('pinDir')[p.dir] + ' · ' + (on ? et('pinUsed') : et('pinFree')) },
      [H('b', { text: p.name }), H('span', { text: et('pinShort')[p.dir] + (on ? ' ✓' : '') })]);
  }));
}
/* The settings of one connection. */
function edEdgeDetails(d, e) {
  var i = d.edges.indexOf(e), vk = 'edges:' + i + ':';
  var box = H('div', { class: 'ed-more' });
  var ends = edEndsText(i);
  if (ends) edGroup(box, et('gEnds')).appendChild(H('p', { class: 'ed-hint ed-ends', text: ends }));
  edGroup(box, et('gPath'), [
    [ec('route'), edInput(e.route || '', function (v) { setOrDelete(e, 'route', v); edChanged(false); }, { type: 'select', options: [['', et('auto')], ['orthogonal', 'orthogonal'], ['straight', 'straight'], ['curved', 'curved'], ['spline', 'spline'], ['elbow', 'elbow'], ['segment', 'segment']] })]
  ]);
  edGroup(box, et('gStyle')).appendChild(edStyleGrid(e, ['color', 'width', 'dashed', 'fontSize'], vk));
  return box;
}
function edEndsText(rawIndex) {
  var st = active, e = st && st.d.kind === 'graph' ? st.d.edges.filter(function (x) { return x.rawIndex === rawIndex; })[0] : null;
  if (!e) return '';
  var end = function (id, a) {
    if (!id) return et('endFree');
    var p = boundPin(st.d, id, a), nm = wireName(st.d, id);
    return p ? el('endPin', nm, p.name + ' (' + et('pinShort')[p.dir] + ')') : el('endBlock', nm);
  };
  return el('endsText', end(e.from, e.fromAnchor), end(e.to, e.toAnchor));
}
/* Legend rows only for the colors and line kinds this diagram uses (all of them on request). */
function edLegend(d, pane) {
  d.legend = d.legend && typeof d.legend === 'object' ? d.legend : {};
  var usedC = {}, usedK = {}, all = !!ED.legendAll;
  (d.nodes || []).forEach(function (n) { if (n && n.color) usedC[n.color] = true; });
  (d.groups || []).forEach(function (g) { if (g && g.color) usedC[g.color] = true; });
  (d.edges || []).forEach(function (e) { if (e) usedK[EDGE_STYLE[e.kind] ? e.kind : 'normal'] = true; });
  Object.keys(d.legend.colors || {}).forEach(function (c) { usedC[c] = true; });
  Object.keys(d.legend.edges || {}).forEach(function (k) { usedK[k] = true; });
  var colors = COLOR_ORDER.filter(function (c) { return all || usedC[c]; }), kinds = KIND_ORDER.filter(function (k) { return all || usedK[k]; });
  pane.appendChild(H('p', { class: 'ed-note ed-tblnote', text: et('legendNote') }));
  if (colors.length) edGroup(pane, et('legendColors'), colors.map(function (c) {
    var sw = H('span', { class: 'ed-dot', style: 'background:' + PALETTE[c] });
    return [c, H('div', { class: 'ed-inline' }, [sw, edInput((d.legend.colors || {})[c], function (v) { var o = d.legend.colors || (d.legend.colors = {}); setOrDelete(o, c, v); if (!Object.keys(o).length) delete d.legend.colors; edChanged(false); })])];
  }));
  if (kinds.length) edGroup(pane, et('legendLines'), kinds.map(function (k) {
    return ['— ' + k, edInput((d.legend.edges || {})[k], function (v) { var o = d.legend.edges || (d.legend.edges = {}); setOrDelete(o, k, v); if (!Object.keys(o).length) delete d.legend.edges; edChanged(false); }, { placeholder: t('kinds')[k] })];
  }));
  var more = H('button', { type: 'button', class: 'tb-btn', text: all ? et('legendUsed') : et('legendAll') });
  more.addEventListener('click', function () { ED.legendAll = !all; edBuildForm(); });
  pane.appendChild(H('div', { class: 'ed-row-actions' }, [more]));
}

/* Symbol palette: click a symbol to add a block with that shape. */
/* Symbol palette: search every shape (the tool's symbols, icons and draw.io libraries) or browse by category. */
function edPalette(d, parent) {
  var sec = edSection('palette', et('palette'), false);
  var cats = SYMBOL_CATS.concat(['icons']);
  var bar = H('div', { class: 'ed-cats' }), grid = H('div', { class: 'ed-pal' });
  var search = H('input', { type: 'search', class: 'ed-in ed-palsearch', placeholder: et('palSearch'), 'aria-label': et('palSearch'), spellcheck: 'false', autocomplete: 'off' });
  var current = cats.indexOf(ED.palCat) >= 0 ? ED.palCat : 'logic';
  var aliases = {};
  Object.keys(SYMBOL_ALIAS).forEach(function (a) { var n = SYMBOL_ALIAS[a]; (aliases[n] || (aliases[n] = [])).push(a); });
  var hay = function (name) {
    var def = SYMBOLS[name];
    return (name + ' ' + (def && def.title ? def.title : '') + ' ' + (aliases[name] || []).join(' ')).toLowerCase().replace(/[._:-]/g, ' ');
  };
  var fill = function () {
    grid.textContent = '';
    var q = str(search.value).toLowerCase(), names;
    if (q) {
      var words = q.split(/\s+/).filter(Boolean);
      names = Object.keys(SYMBOLS).concat(Object.keys(ICONS).map(function (k) { return 'icon:' + k; }), stencilNames())
        .filter(function (n) { var h = hay(n); return words.every(function (w) { return h.indexOf(w) >= 0; }); }).slice(0, 150);
    } else if (current === 'icons') names = Object.keys(ICONS).map(function (k) { return 'icon:' + k; });
    else names = Object.keys(SYMBOLS).filter(function (k) { return SYMBOLS[k].cat === current; });
    bar.classList.toggle('dim', !!q);
    if (!names.length) { grid.appendChild(H('p', { class: 'ed-hint', text: et('palNone') })); return; }
    names.forEach(function (name) {
      var isIcon = name.indexOf('icon:') === 0, shape = isIcon ? 'icon' : name, def = shapeDef(shape) || SYMBOLS.box;
      var w = def.size[0], h = def.size[1], s = Math.min(40 / w, 32 / h, 1.2);
      var T = THEMES[themeName];
      var col = { fill: T.symFill, stroke: T.ink, text: T.ink, strokeWidth: 1.4 / Math.max(s, 0.4), opts: isIcon ? { icon: name.slice(5) } : {} };
      if (shape === 'box') col.opts.radius = 6;
      var svg = S('svg', { width: 48, height: 40, viewBox: '0 0 48 40', 'aria-hidden': 'true' }, [
        S('g', { transform: 'translate(' + fmt((48 - w * s) / 2) + ' ' + fmt((40 - h * s) / 2) + ') scale(' + fmt(s) + ')' }, symbolElements(shape, w, h, col))
      ]);
      var label = isIcon ? name.slice(5) : (def.title || name.split('.').pop()).replace(/_/g, ' ');
      var b = H('button', { type: 'button', class: 'ed-sym', title: label + (/^mxgraph\./.test(name) ? ' (draw.io)' : '') }, [svg, H('span', { text: label })]);
      b.addEventListener('click', function () { edAddShape(d, name); });
      grid.appendChild(b);
    });
  };
  cats.forEach(function (c) {
    var names = (SYMBOL_CAT_NAMES[lang] || SYMBOL_CAT_NAMES.en);
    var label = c === 'icons' ? (lang === 'vi' ? 'Biểu tượng phần mềm' : 'Software icons') : names[c];
    var b = H('button', { type: 'button', class: 'ed-cat' + (c === current ? ' on' : ''), text: label });
    b.addEventListener('click', function () {
      current = ED.palCat = c;
      search.value = '';
      Array.prototype.forEach.call(bar.children, function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      fill();
    });
    bar.appendChild(b);
  });
  var timer = null;
  search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(fill, 120); });
  sec.appendChild(H('div', { class: 'ed-palhead' }, [search]));
  sec.appendChild(bar);
  sec.appendChild(grid);
  sec.addEventListener('toggle', function () { if (sec.open && !grid.firstChild) fill(); });
  if (sec.open) fill();
  parent.appendChild(sec);
}
function edAddShape(d, name) {
  d.nodes = d.nodes || [];
  var isIcon = name.indexOf('icon:') === 0, base = isIcon ? name.slice(5) : name.split('.').pop();
  var n = { id: edUniqueId(d.nodes, base.replace(/[^A-Za-z0-9_-]/g, '') || 'n'), title: '' };
  if (isIcon) { n.shape = 'icon'; n.icon = name.slice(5); n.title = name.slice(5); }
  else n.shape = name;
  if (d.layout === 'manual') edPlaceNew(d, n);
  d.nodes.push(n);
  ED.selected = { id: n.id };
  edChanged(true, el('lAddShape', isIcon ? name.slice(5) : name.split('.').pop()));
}
/* New blocks in a hand-placed drawing go to the middle of what is on screen. */
function edPlaceNew(d, n) {
  var st = active;
  if (!st || !st.canvas || !st.L) { n.x = 40; n.y = 40; return; }
  var r = st.canvas.getBoundingClientRect(), scale = svgScale(st);
  var cx = (st.canvas.scrollLeft + r.width / 2) / scale - st.L.ox, cy = (st.canvas.scrollTop + r.height / 2) / scale - st.L.oy;
  n.x = Math.round((cx - 40) / 10) * 10;
  n.y = Math.round((cy - 20) / 10) * 10;
}

/* Freezing turns the automatic layout into hand-placed positions, keeping the current look. */
function edFreeze(d) {
  var st = edStateFor(d);
  if (!st || st.d.kind !== 'graph' || !st.L) { d.layout = 'manual'; edChanged(true); return; }
  asFreeze(d, st);
  edChanged(true, et('lFreeze'));
}
function edAutoLayout(d) {
  delete d.layout;
  if (d.route === 'spline') delete d.route;
  (d.nodes || []).forEach(function (n) { delete n.x; delete n.y; });
  (d.edges || []).forEach(function (e) { delete e.points; });
  edChanged(true, et('lAuto'));
}
function edStateFor(d) {
  var idx = ED.raw.diagrams.indexOf(d);
  var id = str(d.id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (idx + 1));
  return states.filter(function (st) { return st.d.id === id; })[0] || null;
}

/* Timing diagrams: the WaveJSON signal list is shown flat, with a group column. */
function edFormWave(d) {
  var src = d.wave && typeof d.wave === 'object' && !Array.isArray(d.wave) ? d.wave : d, h = et('h');
  var cfg = src.config && typeof src.config === 'object' ? src.config : {};
  var rows = [];
  (function walk(items, path) {
    (Array.isArray(items) ? items : []).forEach(function (it) {
      if (Array.isArray(it)) { var label = typeof it[0] === 'string' ? it[0] : ''; walk(it.slice(typeof it[0] === 'string' ? 1 : 0), path.concat([label])); }
      else rows.push({ group: path.join(' / '), item: it && typeof it === 'object' ? it : {} });
    });
  })(src.signal, []);
  var rebuild = function () {
    var out = [], stack = [{ path: [], list: out }];
    rows.forEach(function (r) {
      var path = r.group ? r.group.split('/').map(function (q) { return q.trim(); }).filter(Boolean) : [];
      while (stack.length > 1 && (stack.length - 1 > path.length || stack[stack.length - 1].path.join('/') !== path.slice(0, stack.length - 1).join('/'))) stack.pop();
      while (stack.length - 1 < path.length) {
        var g = [path[stack.length - 1]];
        stack[stack.length - 1].list.push(g);
        stack.push({ path: path.slice(0, stack.length), list: g });
      }
      stack[stack.length - 1].list.push(r.item);
    });
    src.signal = out;
  };
  src.edge = src.edge || [];
  var P = edPanes([['signals', et('signals'), rows.length], ['arrows', et('arrowsShort'), src.edge.length], ['setup', et('setup')]]);
  var wrapSet = function (k, conv) { return function (r, v) { setOrDelete(r.item, k, conv ? conv(v) : v); rebuild(); }; };
  P.signals.appendChild(edTable({
    rows: function () { return rows; }, name: et('signals'), vkey: 'signals',
    cols: [
      { k: 'group', label: ec('group'), w: '16%', get: function (r) { return r.group; }, set: function (r, v) { r.group = str(v); rebuild(); } },
      { k: 'name', label: ec('name'), w: '18%', get: function (r) { return r.item.name; }, set: wrapSet('name') },
      { k: 'wave', label: ec('wave'), w: '24%', hint: h.wave, get: function (r) { return r.item.wave; }, set: wrapSet('wave') },
      { k: 'data', label: ec('data'), get: function (r) { return Array.isArray(r.item.data) ? r.item.data.join(' ') : (r.item.data || ''); },
        set: wrapSet('data', function (v) { var a = String(v || '').trim().split(/\s+/).filter(Boolean); return a.length ? a : undefined; }) },
      { k: 'node', label: ec('node'), w: '12%', hint: h.marker, get: function (r) { return r.item.node; }, set: wrapSet('node') },
      { k: 'period', label: ec('period'), w: '9%', type: 'num', get: function (r) { return r.item.period; }, set: wrapSet('period') }
    ],
    add: function () { var r = { group: rows.length ? rows[rows.length - 1].group : '', item: { name: 'sig' + (rows.length + 1), wave: '0.1.0.' } }; setTimeout(rebuild, 0); return r; },
    onDelete: function () { setTimeout(function () { rebuild(); edChanged(false); }, 0); },
    onDuplicate: function () { setTimeout(function () { rebuild(); edChanged(false); }, 0); }
  }));
  var arrows = src.edge.map(function (e) { return { v: e }; });
  var syncArrows = function () { src.edge = arrows.map(function (a) { return a.v; }).filter(Boolean); if (!src.edge.length) delete src.edge; };
  P.arrows.appendChild(edTable({
    rows: function () { return arrows; }, name: et('arrows'), vkey: 'arrows',
    cols: [{ k: 'v', label: ec('edge'), hint: h.arrow, set: function (a, v) { a.v = v; syncArrows(); }, ph: 'a~>b label' }],
    add: function () { setTimeout(syncArrows, 0); return { v: 'a~>b' }; },
    onDelete: function () { setTimeout(function () { syncArrows(); edChanged(false); }, 0); }
  }));
  if (!src.edge.length) delete src.edge;
  edSetup(P.setup, d, [[ec('hscale'), edInput(cfg.hscale, function (v) {
    setOrDelete(cfg, 'hscale', v);
    if (Object.keys(cfg).length) src.config = cfg; else delete src.config;
    edChanged(false);
  }, { type: 'num', placeholder: '1' })]]);
}

/* Registers: each register has its own field table; WaveDrom "reg" lists become field rows. */
/* Registers: each register has its own field table; WaveDrom "reg" lists become field rows. */
function edFormRegisters(d) {
  d.registers = d.registers || [];
  var h = et('h');
  var P = edPanes([['regs', et('registers'), d.registers.length], ['setup', et('setup')]]);
  d.registers.forEach(function (r, ri) {
    if (Array.isArray(r.reg) && !r.fields) {
      var pos = 0;
      r.fields = [];
      r.reg.forEach(function (f) { var n = posInt(f && f.bits) || 1; if (f && f.name) r.fields.push({ bits: n > 1 ? (pos + n - 1) + ':' + pos : String(pos), name: f.name, access: typeof f.attr === 'string' ? f.attr : undefined }); pos += n; });
      if (!r.width) r.width = pos;
      delete r.reg;
    }
    var vk = 'reg:' + ri + ':';
    var sec = edSection('reg' + ri, (r.name || 'REG') + (r.offset ? ' @ ' + r.offset : ''), ri === 0);
    var del = H('button', { type: 'button', class: 'tb-btn', text: et('delReg') });
    del.addEventListener('click', function () { d.registers.splice(ri, 1); edChanged(true); });
    edGrid(sec, [
      [ec('name'), edInput(r.name, function (v) { setOrDelete(r, 'name', v); edChanged(false); }), { vk: vk + 'name', req: true, hint: h.regName }],
      [ec('offset'), edInput(r.offset, function (v) { setOrDelete(r, 'offset', v); edChanged(false); }, { placeholder: '0x00' }), { vk: vk + 'offset', hint: h.num }],
      [ec('regWidth'), edInput(r.width, function (v) { setOrDelete(r, 'width', v); edChanged(false); }, { type: 'num', placeholder: '32' }), { vk: vk + 'width' }],
      [ec('reset'), edInput(r.reset, function (v) { setOrDelete(r, 'reset', v); edChanged(false); }, { placeholder: '0x0000_0000' }), { vk: vk + 'reset', hint: h.num }],
      [ec('desc'), edInput(r.desc, function (v) { setOrDelete(r, 'desc', v); edChanged(false); }, { type: 'area' })]
    ]);
    r.fields = r.fields || [];
    sec.appendChild(edTable({
      rows: function () { return r.fields; }, name: (r.name || et('fields')), vkey: 'regf:' + ri,
      cols: [
        { k: 'bits', label: ec('bits'), w: '14%', req: true, hint: h.bits, get: function (f) { return f.bits !== undefined ? f.bits : (f.msb !== undefined ? (f.lsb !== undefined && f.lsb !== f.msb ? f.msb + ':' + f.lsb : String(f.msb)) : ''); },
          set: function (f, v) { delete f.msb; delete f.lsb; setOrDelete(f, 'bits', String(v === undefined ? '' : v)); }, ph: '7:4' },
        { k: 'name', label: ec('name'), w: '20%', req: true },
        { k: 'access', label: ec('access'), w: '14%', type: 'select', options: [['', '—'], ['RW', 'RW'], ['RO', 'RO'], ['WO', 'WO'], ['W1C', 'W1C'], ['W1S', 'W1S'], ['RC', 'RC'], ['RS', 'RS']] },
        { k: 'reset', label: ec('reset'), w: '12%', hint: h.num },
        { k: 'desc', label: ec('desc'), type: 'area' }
      ],
      add: function () { return { bits: '0', name: 'FIELD' }; }
    }));
    sec.appendChild(H('div', { class: 'ed-row-actions' }, [del]));
    P.regs.appendChild(sec);
  });
  var add = H('button', { type: 'button', class: 'tb-btn', text: et('addReg') });
  add.addEventListener('click', function () {
    var last = d.registers[d.registers.length - 1], off = last ? parseNum(last.offset) : NaN;
    d.registers.push({ name: 'REG' + (d.registers.length + 1), offset: isFinite(off) ? '0x' + (off + 4).toString(16).toUpperCase().padStart(2, '0') : '0x00', width: 32, fields: [{ bits: '0', name: 'EN', access: 'RW', reset: '0' }] });
    ED.open[ED.diag + ':reg' + (d.registers.length - 1)] = true;
    edChanged(true);
  });
  P.regs.appendChild(H('div', { class: 'ed-row-actions' }, [add]));
  edSetup(P.setup, d);
}

function edFormMemory(d) {
  d.regions = d.regions || [];
  var h = et('h');
  var P = edPanes([['regions', et('regions'), d.regions.length], ['setup', et('setup')]]);
  P.regions.appendChild(edTable({
    rows: function () { return d.regions; }, name: et('regions'), vkey: 'regions',
    cols: [
      { k: 'name', label: ec('name'), w: '22%', req: true },
      { k: 'base', label: ec('base'), w: '19%', ph: '0x2000_0000', req: true, hint: h.num },
      { k: 'size', label: ec('sizeB'), w: '13%', ph: '64KB', hint: h.sizeB },
      { k: 'end', label: ec('end'), w: '17%', hint: h.num },
      { k: 'color', label: ec('color'), w: '12%', type: 'select', options: paletteOptions(true) },
      { k: 'desc', label: ec('desc'), type: 'area' }
    ],
    add: function () { return { name: 'Region', base: '0x0', size: '4KB' }; }
  }));
  edSetup(P.setup, d, [[ec('gaps'), edInput(d.gaps !== false, function (v) { if (v) delete d.gaps; else d.gaps = false; edChanged(false); }, { type: 'check' })]]);
}

function edFormChip(d) {
  d.columns = d.columns || [];
  d.domains = d.domains || [];
  d.links = d.links || [];
  var h = et('h');
  var P = edPanes([['columns', et('colsBlocks'), d.columns.length], ['domains', et('domains'), d.domains.length], ['links', et('links'), d.links.length], ['setup', et('setup')]]);
  P.domains.appendChild(edTable({
    rows: function () { return d.domains; }, name: et('domains'), vkey: 'domains',
    cols: [{ k: 'id', label: ec('id'), w: '25%', req: true, hint: h.id }, { k: 'label', label: ec('label') }, { k: 'color', label: ec('color'), w: '25%', type: 'select', options: paletteOptions(true) }],
    add: function () { return { id: 'vdd' + (d.domains.length + 1), label: 'VDD', color: 'slate' }; }
  }));
  var blockIds = function () {
    var o = [['', et('none')]];
    d.columns.forEach(function (c) { (c.blocks || []).forEach(function (b) { var id = b.id || b.title; if (id) o.push([id, id]); }); });
    return o;
  };
  d.columns.forEach(function (c, ci) {
    var isBus = c.bus !== undefined;
    var sec = edSection('col' + ci, (ci + 1) + '. ' + (isBus ? et('colBus') + ': ' + (c.bus || '') : et('colBlocks') + ' (' + (c.blocks || []).length + ')'), !isBus && ci === 0);
    var kind = edInput(isBus ? 'bus' : 'blocks', function (v) {
      if (v === 'bus') { delete c.blocks; c.bus = c.bus || 'BUS'; } else { delete c.bus; delete c.style; c.blocks = c.blocks || []; }
      edChanged(true);
    }, { type: 'select', options: [['blocks', et('colBlocks')], ['bus', et('colBus')]] });
    var move = function (delta) { var j = ci + delta; if (j < 0 || j >= d.columns.length) return; var tmp = d.columns[j]; d.columns[j] = c; d.columns[ci] = tmp; edChanged(true); };
    var up = H('button', { type: 'button', class: 'ed-mini', text: '←', title: et('up'), 'aria-label': et('up') }), dn = H('button', { type: 'button', class: 'ed-mini', text: '→', title: et('down'), 'aria-label': et('down') }), rm = H('button', { type: 'button', class: 'ed-mini', text: '✕', title: et('del'), 'aria-label': et('del') });
    up.addEventListener('click', function () { move(-1); }); dn.addEventListener('click', function () { move(1); });
    rm.addEventListener('click', function () { d.columns.splice(ci, 1); edChanged(true); });
    edGrid(sec, [[ec('type'), H('div', { class: 'ed-inline' }, [kind, up, dn, rm])]]);
    if (isBus) {
      edGrid(sec, [
        [ec('bus'), edInput(c.bus, function (v) { c.bus = v; edChanged(false); }), { vk: 'col:' + ci + ':bus', req: true }],
        [ec('busStyle'), edInput(c.style || 'bar', function (v) { setOrDelete(c, 'style', v === 'bar' ? '' : v); edChanged(false); }, { type: 'select', options: [['bar', 'bar'], ['matrix', 'matrix']] })]
      ]);
    } else {
      c.blocks = c.blocks || [];
      sec.appendChild(edTable({
        rows: function () { return c.blocks; }, name: et('columns') + ' ' + (ci + 1), vkey: 'blocks:' + ci,
        cols: [
          { k: 'id', label: ec('id'), w: '13%', hint: h.id },
          { k: 'title', label: ec('title'), w: '20%', req: true },
          { k: 'sub', label: ec('sub') },
          { k: 'rows', label: ec('rows'), w: '9%', type: 'num' },
          { k: 'pins', label: ec('pinsList'), w: '18%', get: function (b) { return arrayToList(b.pins); }, set: function (b, v) { setOrDelete(b, 'pins', listToArray(v)); } },
          { k: 'color', label: ec('color'), w: '11%', type: 'select', options: paletteOptions(true) }
        ],
        add: function () { return { id: 'blk' + Date.now().toString(36).slice(-4), title: 'Block' }; },
        extra: function (b) {
          var box = H('div', { class: 'ed-more' }), vk = 'blocks:' + ci + ':' + c.blocks.indexOf(b) + ':';
          edGroup(box, et('gShow'), [
            [ec('domain'), edInput(b.domain, function (v) { setOrDelete(b, 'domain', v); edChanged(false); }, { type: 'select', options: [['', et('none')]].concat(d.domains.map(function (g) { return [g.id, g.label || g.id]; })) }), { vk: vk + 'domain' }],
            [ec('pinDir'), edInput(b.pinDir, function (v) { setOrDelete(b, 'pinDir', v); edChanged(false); }, { type: 'select', options: [['', 'both'], ['in', 'in'], ['out', 'out']] })],
            [ec('link'), edInput(b.link, function (v) { setOrDelete(b, 'link', v); edChanged(false); }, { type: 'select', options: [['', et('auto')], ['left', 'left'], ['right', 'right'], ['both', 'both'], ['none', 'none']] })],
            [ec('multi'), edInput(b.multi, function (v) { setOrDelete(b, 'multi', v); edChanged(false); }, { type: 'num' })]
          ]);
          return box;
        }
      }));
    }
    P.columns.appendChild(sec);
  });
  var addCol = H('button', { type: 'button', class: 'tb-btn', text: et('addCol') });
  addCol.addEventListener('click', function () { d.columns.push({ blocks: [{ id: 'blk' + (d.columns.length + 1), title: 'Block' }] }); edChanged(true); });
  P.columns.appendChild(H('div', { class: 'ed-row-actions' }, [addCol]));
  P.links.appendChild(edTable({
    rows: function () { return d.links; }, name: et('links'), vkey: 'links',
    cols: [
      { k: 'from', label: ec('from'), w: '28%', type: 'select', options: blockIds, req: true },
      { k: 'to', label: ec('to'), w: '28%', type: 'select', options: blockIds, req: true },
      { k: 'label', label: ec('label') }
    ],
    add: function () { var ids = blockIds(); return { from: ids[1] ? ids[1][0] : '', to: ids[2] ? ids[2][0] : '' }; }
  }));
  edSetup(P.setup, d, [
    [ec('chip'), edInput(d.chip, function (v) { setOrDelete(d, 'chip', v); edChanged(false); })],
    [ec('domainLabel'), edInput(d.domainLabel || d.domain_label, function (v) { delete d.domain_label; setOrDelete(d, 'domainLabel', v); edChanged(false); })]
  ]);
}

function edFormPinout(d) {
  d.pins = d.pins || [];
  d.pins = d.pins.map(function (p, i) { return typeof p === 'string' ? { n: i + 1, name: p } : p; });
  var h = et('h');
  var dl = H('datalist', { id: 'ed-pkgs' });
  ['LQFP32', 'LQFP48', 'LQFP64', 'LQFP100', 'LQFP144', 'QFN24', 'QFN32', 'QFN48', 'QFN64', 'SOIC8', 'SOIC16', 'TSSOP20', 'TSSOP28', 'DIP8', 'DIP16', 'DIP28', 'DIP40', 'BGA64', 'BGA100', 'BGA256']
    .forEach(function (p) { dl.appendChild(H('option', { value: p })); });
  ED.body.appendChild(dl);
  var P = edPanes([['pins', et('pins'), d.pins.length], ['setup', et('setup')]]);
  edGroup(P.pins, et('pkgGrp'), [
    [ec('chip'), edInput(d.chip, function (v) { setOrDelete(d, 'chip', v); edChanged(false); })],
    [ec('pkg'), edInput(typeof d.package === 'string' ? d.package : (d.package && d.package.name) || '', function (v) { d.package = v; edChanged(false); }, { list: 'ed-pkgs', placeholder: 'LQFP48' }), { vk: 'pkg::pkg', req: true, hint: h.pkg }]
  ]);
  P.pins.appendChild(edTable({
    rows: function () { return d.pins; }, name: et('pins'), vkey: 'pins',
    cols: [
      { k: 'n', label: ec('n'), w: '11%', req: true, hint: h.pin, get: function (p) { return p.ball !== undefined ? p.ball : p.n; }, set: function (p, v) { if (/^[A-Za-z]/.test(String(v))) { delete p.n; p.ball = String(v).toUpperCase(); } else { delete p.ball; setOrDelete(p, 'n', v === '' || v === undefined ? undefined : +v); } }, aliases: ['pin', 'no', 'số'] },
      { k: 'name', label: ec('name'), w: '22%', req: true, aliases: ['signal', 'tín hiệu'] },
      { k: 'type', label: ec('type'), w: '16%', type: 'select', options: [['', et('auto')]].concat(Object.keys(PIN_TYPES).map(function (k) { return [k, k]; })) },
      { k: 'alt', label: ec('alt'), get: function (p) { return arrayToList(p.alt); }, set: function (p, v) { setOrDelete(p, 'alt', listToArray(v)); }, aliases: ['alternate functions', 'af'] },
      { k: 'desc', label: ec('desc'), type: 'area', aliases: ['description'] }
    ],
    add: function () { var mx = 0; d.pins.forEach(function (p) { mx = Math.max(mx, +p.n || 0); }); return { n: mx + 1, name: 'P' + (mx + 1) }; }
  }));
  edSetup(P.setup, d);
}

/* ---------- selection between the drawing and the tables ---------- */
function edMarkSelection() {
  if (!ED || !ED.body) return;
  Array.prototype.forEach.call(ED.body.querySelectorAll('.ed-row.sel'), function (tr) { tr.classList.remove('sel'); });
  edDrawOverlay();
  edRefreshSuggest();
  if (typeof hierAfterSelect === 'function') hierAfterSelect();
  if (!ED.selected) return;
  if (ED.multi) ED.multi.forEach(function (id) { var r = ED.body.querySelector('.ed-row[data-key="' + edCss('n:' + id) + '"]'); if (r) r.classList.add('sel'); });
  var key = ED.selected.id !== undefined ? 'n:' + ED.selected.id : 'e:' + ED.selected.edge;
  var tr = ED.body.querySelector('.ed-row[data-key="' + (window.CSS && CSS.escape ? CSS.escape(key) : key) + '"]');
  if (!tr) return;
  tr.classList.add('sel');
  var pane = tr.closest('.ed-pane');
  if (pane && pane.hidden && ED.revealRow) edShowPane(pane.getAttribute('data-pane'));
  var sec = tr.closest('details');
  if (sec && !sec.open) sec.open = true;
  if (ED.revealRow) { tr.scrollIntoView({ block: 'nearest' }); ED.revealRow = false; }
}
function svgScale(st) { return (st.svg && st.svg.getBoundingClientRect().width / st.L.width) || 1; }
function edRawNode(id) { return (edDiagram().nodes || []).filter(function (n) { return str(n.id) === id; })[0] || null; }
function edEdgeIndex(st, rawIndex) {
  for (var i = 0; i < st.d.edges.length; i++) if (st.d.edges[i].rawIndex === rawIndex) return i;
  return -1;
}
function edPoint(st, ev) {
  var r = st.svg.getBoundingClientRect(), s = r.width / st.L.width || 1;
  return { x: (ev.clientX - r.left) / s - st.L.ox, y: (ev.clientY - r.top) / s - st.L.oy };
}
function edSnap(v, ev) { return ev && ev.altKey ? Math.round(v * 10) / 10 : Math.round(v / 10) * 10; }
var ED_ACCENT = 'stroke:var(--accent);';

/* ---------- selection overlay: resize handles for blocks, bend handles for connections ---------- */
function edDrawOverlay() {
  if (!ED || !active || !active.svg) return;
  var old = active.svg.querySelector('.ed-overlay');
  if (old) old.remove();
  edHideEdgeBar();
  var sel = ED.selected, st = active;
  if (!sel || st.d.kind !== 'graph' || !st.L) return;
  var root = st.svg.querySelector('g.root');
  if (!root) return;
  var k = 1 / svgScale(st), ov = S('g', { class: 'ed-overlay' });
  var many = edSelIds().filter(function (id) { return st.L.nodes[id]; });
  if (many.length > 1) {
    many.forEach(function (id) {
      var q = st.L.nodes[id];
      ov.appendChild(S('rect', { class: 'ed-box', x: fmt(q.x - q.w / 2 - 3 * k), y: fmt(q.y - q.h / 2 - 3 * k), width: fmt(q.w + 6 * k), height: fmt(q.h + 6 * k), rx: fmt(3 * k),
        fill: 'none', style: ED_ACCENT + 'stroke-dasharray:4 3', 'stroke-width': fmt(1.4 * k), 'pointer-events': 'none' }));
    });
    root.appendChild(ov);
    edShowSelBar(st, many);
    return;
  }
  if (sel.id !== undefined && st.L.nodes[sel.id]) {
    var p = st.L.nodes[sel.id], n = st.d.nodeById[sel.id], x0 = p.x - p.w / 2, y0 = p.y - p.h / 2;
    if (pinList(shapeDef(n.shape)).length) { var pl = S('g', { class: 'ed-pins', 'pointer-events': 'none' }); edPinMarks(pl, st, sel.id, null, true); ov.appendChild(pl); }
    ov.appendChild(S('rect', { class: 'ed-box', x: fmt(x0), y: fmt(y0), width: fmt(p.w), height: fmt(p.h), fill: 'none', style: ED_ACCENT + 'stroke-dasharray:4 3', 'stroke-width': fmt(1.2 * k), 'pointer-events': 'none' }));
    edDrawGhost(st, sel.id);
    if (!(n.style.rotation)) {
      var pos = { nw: [0, 0], n: [0.5, 0], ne: [1, 0], e: [1, 0.5], se: [1, 1], s: [0.5, 1], sw: [0, 1], w: [0, 0.5] };
      var cursor = { nw: 'nwse', se: 'nwse', ne: 'nesw', sw: 'nesw', n: 'ns', s: 'ns', e: 'ew', w: 'ew' };
      Object.keys(pos).forEach(function (h) {
        var hx = x0 + pos[h][0] * p.w, hy = y0 + pos[h][1] * p.h;
        ov.appendChild(S('rect', { class: 'ed-h', 'data-h': 'resize-' + h, x: fmt(hx - 4.5 * k), y: fmt(hy - 4.5 * k), width: fmt(9 * k), height: fmt(9 * k),
          style: 'fill:var(--surface);' + ED_ACCENT + 'cursor:' + cursor[h] + '-resize', 'stroke-width': fmt(1.4 * k) }));
      });
    }
  } else if (sel.edge !== undefined) {
    var i = edEdgeIndex(st, sel.edge);
    if (i < 0) return;
    var e = st.d.edges[i], pts = st.L.edges[i].points;
    if (!pts || pts.length < 2) return;
    ov.appendChild(S('path', { d: 'M' + pts.map(function (q) { return fmt(q.x) + ',' + fmt(q.y); }).join('L'), fill: 'none', style: ED_ACCENT + 'stroke-opacity:.28', 'stroke-width': fmt(7 * k), 'pointer-events': 'none', 'stroke-linejoin': 'round' }));
    for (var j = 0; j < pts.length - 1; j++) {
      var mx = (pts[j].x + pts[j + 1].x) / 2, my = (pts[j].y + pts[j + 1].y) / 2;
      if (Math.hypot(pts[j + 1].x - pts[j].x, pts[j + 1].y - pts[j].y) < 16 * k) continue;
      ov.appendChild(S('circle', { class: 'ed-h ed-mid', 'data-h': 'mid-' + j, cx: fmt(mx), cy: fmt(my), r: fmt(4.5 * k), style: 'fill:var(--surface);' + ED_ACCENT + 'stroke-opacity:.8;cursor:move', 'stroke-width': fmt(1.2 * k) }));
    }
    (st.d.layout === 'manual' ? e.points : []).forEach(function (q, wi) {
      ov.appendChild(S('rect', { class: 'ed-h', 'data-h': 'wp-' + wi, x: fmt(q.x - 5 * k), y: fmt(q.y - 5 * k), width: fmt(10 * k), height: fmt(10 * k),
        transform: 'rotate(45 ' + fmt(q.x) + ' ' + fmt(q.y) + ')', style: 'fill:var(--accent);stroke:var(--surface);cursor:move', 'stroke-width': fmt(1.4 * k) }));
    });
    [['from', pts[0]], ['to', pts[pts.length - 1]]].forEach(function (end) {
      ov.appendChild(S('circle', { class: 'ed-h', 'data-h': 'end-' + end[0], cx: fmt(end[1].x), cy: fmt(end[1].y), r: fmt(6 * k), style: 'fill:var(--accent);stroke:var(--surface);cursor:crosshair', 'stroke-width': fmt(2 * k) }));
    });
    edShowEdgeBar(st, i);
  } else return;
  root.appendChild(ov);
}
function edHideEdgeBar() { if (ED && ED.edgeBar) ED.edgeBar.remove(); if (ED && ED.selBar) ED.selBar.remove(); edClearGhost(); }
function edShowEdgeBar(st, i) {
  var e = st.d.edges[i], d = edDiagram(), raw = d.edges[e.rawIndex];
  if (!raw) return;
  var bar = ED.edgeBar || (ED.edgeBar = H('div', { class: 'ed-edgebar', role: 'toolbar' }));
  bar.textContent = '';
  var route = e.route || st.d.route || (st.d.layout === 'manual' ? 'straight' : 'spline');
  var vi = lang === 'vi';
  var btn = function (txt, title, on, fn) {
    var b = H('button', { type: 'button', class: 'ed-bb' + (on ? ' on' : ''), title: title, 'aria-label': title, text: txt });
    b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
    bar.appendChild(b);
  };
  btn('╱', vi ? 'Đường thẳng' : 'Straight', route === 'straight', function () { edSetRoute(d, raw, 'straight'); });
  btn('┐', vi ? 'Vuông góc' : 'Orthogonal', route === 'orthogonal' || route === 'segment' || route === 'elbow', function () { edSetRoute(d, raw, 'orthogonal'); });
  btn('∿', vi ? 'Đường cong' : 'Curved', route === 'curved' || route === 'spline', function () { edSetRoute(d, raw, 'curved'); });
  bar.appendChild(H('span', { class: 'ed-bsep' }));
  var arrows = edArrows(raw);
  btn('◂', vi ? 'Mũi tên ở đầu' : 'Arrow at the start', arrows.start, function () { edSetArrows(raw, !arrows.start, arrows.end); });
  btn('▸', vi ? 'Mũi tên ở cuối' : 'Arrow at the end', arrows.end, function () { edSetArrows(raw, arrows.start, !arrows.end); });
  bar.appendChild(H('span', { class: 'ed-bsep' }));
  btn('🗑', vi ? 'Xóa đường nối' : 'Delete connection', false, function () { edDeleteEdge(d, e.rawIndex); });
  var pts = st.L.edges[i].points, mid = st.L.edges[i];
  var px = isFinite(mid.lx) ? mid.lx : (pts[0].x + pts[pts.length - 1].x) / 2, py = isFinite(mid.ly) ? mid.ly : (pts[0].y + pts[pts.length - 1].y) / 2;
  var s = svgScale(st);
  var off = svgOffset(st);
  bar.style.left = Math.round(off.x + (px + st.L.ox) * s + 14) + 'px';
  bar.style.top = Math.round(off.y + (py + st.L.oy) * s - 44) + 'px';
  st.canvas.appendChild(bar);
}
function edArrows(raw) {
  var st = raw.style || {};
  if (st.endArrow || st.startArrow) return { start: !!st.startArrow && st.startArrow !== 'none', end: st.endArrow === undefined || st.endArrow !== 'none' };
  var dir = raw.dir || 'forward';
  return { start: dir === 'back' || dir === 'both', end: dir === 'forward' || dir === 'both' };
}
function edSetArrows(raw, start, end) {
  if (raw.style && (raw.style.endArrow || raw.style.startArrow) || raw.drawio) {
    raw.style = raw.style || {};
    raw.style.endArrow = end ? (raw.style.endArrow && raw.style.endArrow !== 'none' ? raw.style.endArrow : 'classic') : 'none';
    raw.style.startArrow = start ? (raw.style.startArrow && raw.style.startArrow !== 'none' ? raw.style.startArrow : 'classic') : 'none';
  }
  var dir = start && end ? 'both' : end ? '' : start ? 'back' : 'none';
  setOrDelete(raw, 'dir', dir);
  edChanged(false, el('lArrows', (raw.from || '·') + ' → ' + (raw.to || '·')));
}
function edSetRoute(d, raw, route) {
  if (d.layout !== 'manual') edFreezeNow(d);
  raw = d.edges[raw === undefined ? -1 : d.edges.indexOf(raw)] || raw;
  raw.route = route;
  if (route === 'curved' && (!raw.points || !raw.points.length) && active) {
    var i = edEdgeIndex(active, d.edges.indexOf(raw)), pts = i >= 0 ? active.L.edges[i].points : null;
    if (pts && pts.length >= 2) {
      var a = pts[0], b = pts[pts.length - 1], len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      raw.points = [[Math.round((a.x + b.x) / 2 - (b.y - a.y) / len * len * 0.18), Math.round((a.y + b.y) / 2 + (b.x - a.x) / len * len * 0.18)]];
    }
  }
  edChanged(false, el('lRoute', (raw.from || '·') + ' → ' + (raw.to || '·')));
}
function edDeleteEdge(d, rawIndex) {
  var gone = d.edges[rawIndex];
  if (!gone) return;
  d.edges.splice(rawIndex, 1);
  d.steps = (d.steps || []).filter(function (s) { return !(Array.isArray(s.edge) && s.edge[0] === gone.from && s.edge[1] === gone.to); });
  ED.selected = null;
  edChanged(true, el('lDelEdge', (gone.from || '·') + ' → ' + (gone.to || '·')));
}

/* ---------- editing on the drawing: move, resize, bend, reconnect ---------- */
function edLiveEdge(st, i) {
  var e = st.d.edges[i], d = st.d, geo = routeEdge(d, st.L, e, st.L.labelM[i]);
  st.L.edges[i] = geo;
  var g = st.edgeEls[i];
  if (!g) return;
  var es = e.style, styled = Object.keys(es).length > 0 || !!e.drawio, pts = geo.points;
  var width = es.width !== undefined ? es.width : (styled ? 1 : EDGE_STYLE[e.kind].width);
  if (styled) {
    var endType = es.endArrow || (e.dir === 'forward' || e.dir === 'both' ? 'classic' : 'none'), startType = es.startArrow || (e.dir === 'back' || e.dir === 'both' ? 'classic' : 'none');
    if (endType !== 'none') pts = shortenEnd(pts, arrowInset(endType, es.endSize !== undefined ? es.endSize : 6, width));
    if (startType !== 'none') pts = shortenStart(pts, arrowInset(startType, es.startSize !== undefined ? es.startSize : 6, width));
  } else {
    if (e.dir === 'forward' || e.dir === 'both') pts = shortenEnd(pts, 5);
    if (e.dir === 'back' || e.dir === 'both') pts = shortenStart(pts, 5);
  }
  var route = e.route || d.route || 'straight';
  var dd = edgePath(pts, route, es.rounded || (!styled && route === 'orthogonal'));
  Array.prototype.forEach.call(g.querySelectorAll('path'), function (p) { p.setAttribute('d', dd); });
  var lab = st.labelEls[i];
  if (lab && isFinite(geo.lx)) lab.setAttribute('transform', 'translate(' + fmt(geo.lx) + ' ' + fmt(geo.ly) + ')');
}
/* Connection points a wire can snap to: the pins of symbols and draw.io stencils. */
/* Connection points a wire can snap to: the pins of symbols and draw.io stencils, with name and direction. */
function edPins(st, id) {
  var n = st.d.nodeById[id];
  if (!n) return [];
  var f = frameOf(st.d, st.L, id);
  return pinList(shapeDef(n.shape)).map(function (p) {
    var q = anchorPt(f, { x: p.x, y: p.y, dx: 0, dy: 0, perimeter: false });
    return { x: q.x, y: q.y, anchor: [p.x, p.y], name: p.name, dir: p.dir, index: p.index, cx: f.cx, cy: f.cy };
  });
}
/* Pin circles with their names. want = 'in' or 'out' paints red the pins a wire end should not use. */
function edPinMarks(layer, st, id, want, faint) {
  var k = 1 / svgScale(st);
  edPins(st, id).forEach(function (p) {
    var bad = want === 'in' ? p.dir === 'out' : want === 'out' ? pinIsInput(p) : false;
    var col = bad ? 'var(--bad)' : 'var(--accent)';
    layer.appendChild(S('circle', { cx: fmt(p.x), cy: fmt(p.y), r: fmt(4 * k), style: 'fill:' + (faint ? 'var(--surface)' : 'none') + ';stroke:' + col, 'stroke-width': fmt(1.5 * k) }));
    var dx = p.x - p.cx, dy = p.y - p.cy, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    var anchor = ux > 0.35 ? 'start' : ux < -0.35 ? 'end' : 'middle';
    var tx = p.x + ux * 8 * k, ty = anchor === 'middle' ? p.y + (uy >= 0 ? 14 : -7) * k : p.y + uy * 8 * k - 4 * k;
    layer.appendChild(S('text', { x: fmt(tx), y: fmt(ty), 'font-size': fmt(9.5 * k), 'font-weight': 700, 'text-anchor': anchor,
      style: 'fill:' + col + ';stroke:var(--surface);stroke-width:' + fmt(3 * k) + 'px;paint-order:stroke;stroke-linejoin:round', text: p.name }));
  });
}
function edNearestPin(st, id, pt, radius) {
  var best = null;
  edPins(st, id).forEach(function (p) { var dd = Math.hypot(p.x - pt.x, p.y - pt.y); if (dd <= radius && (!best || dd < best.d)) best = { d: dd, pin: p }; });
  return best ? best.pin : null;
}
function edShowPins(dr, id, want) {
  if (!dr.pinLayer) { dr.pinLayer = S('g', { class: 'ed-pins', 'pointer-events': 'none' }); dr.st.svg.querySelector('g.root').appendChild(dr.pinLayer); }
  dr.pinLayer.textContent = '';
  if (id) edPinMarks(dr.pinLayer, dr.st, id, want);
}
function edPinStatus(pin, want) {
  if (!pin) return;
  var bad = want === 'in' ? pin.dir === 'out' : want === 'out' ? pinIsInput(pin) : false;
  edStatus(bad ? el(want === 'in' ? 'snapBadOut' : 'snapBadIn', pin.name) : el('snapPin', pin.name, t('pinDir')[pin.dir]));
}
function edNodeAt(ev) {
  var all = document.elementsFromPoint ? document.elementsFromPoint(ev.clientX, ev.clientY) : [document.elementFromPoint(ev.clientX, ev.clientY)];
  for (var i = 0; i < all.length; i++) {
    var el = all[i] && all[i].closest ? all[i].closest('.node') : null;
    if (el && active && active.svg.contains(el)) return el.getAttribute('data-id');
  }
  /* pins sit on the edge of a block, so a drop just outside it still counts */
  if (!active || !active.L) return null;
  var pt = edPoint(active, ev), pad = 12 / svgScale(active), best = null;
  Object.keys(active.L.nodes).forEach(function (id) {
    var p = active.L.nodes[id], dx = Math.max(0, Math.abs(pt.x - p.x) - p.w / 2), dy = Math.max(0, Math.abs(pt.y - p.y) - p.h / 2), d = Math.hypot(dx, dy);
    if (d <= pad && (!best || d < best.d)) best = { d: d, id: id };
  });
  return best ? best.id : null;
}
function edPointerDown(ev) {
  if (ED && ED.aiPreview) return;
  if (!ED || !active || active.d.kind !== 'graph' || ev.button !== 0 || !active.svg || !active.canvas || !active.canvas.contains(ev.target)) return;
  if (ev.target.closest && ev.target.closest('.ed-edgebar, .ed-inline-edit, .minimap, .tb-btn, .ai-box')) return;
  if (typeof hierPointerDown === 'function' && hierPointerDown(ev)) return;
  var inSvg = active.svg.contains(ev.target);
  var handle = inSvg && ev.target.closest ? ev.target.closest('.ed-h') : null;
  if (handle) {
    ED.drag = { handle: handle.getAttribute('data-h'), sx: ev.clientX, sy: ev.clientY, started: false, sel: ED.selected };
    ev.preventDefault();
    ev.stopPropagation();
    return;
  }
  var nodeEl = inSvg && ev.target.closest ? ev.target.closest('.node') : null;
  if (!nodeEl) {
    /* Shift + drag on empty space draws a selection box */
    if (ev.shiftKey && !(ev.target.closest && ev.target.closest('.edge'))) { ED.band = { sx: ev.clientX, sy: ev.clientY, st: active, started: false }; ev.preventDefault(); }
    return;
  }
  ED.drag = { id: nodeEl.getAttribute('data-id'), sx: ev.clientX, sy: ev.clientY, started: false, connect: ev.shiftKey, snap: true };
  ev.preventDefault();
}
function edPointerMove(ev) {
  if (ED && ED.band) { edBandMove(ev); return; }
  if (ED && ED.drag && ED.drag.hier) { hierPointerMove(ev); return; }
  var dr = ED && ED.drag;
  if (!dr) return;
  if (!dr.started) {
    if (Math.abs(ev.clientX - dr.sx) + Math.abs(ev.clientY - dr.sy) < 4) return;
    dr.started = true;
    ED.suppressClick = true;
    if (dr.handle) { edHandleStart(dr, ev); if (!ED.drag) return; }
    else {
      var d = edDiagram();
      if (!dr.connect && d && d.layout !== 'manual') { edFreezeNow(d); }
      var st = active;
      dr.st = st;
      dr.el = st.nodeEls[dr.id];
      if (!dr.el) { ED.drag = null; return; }
      /* dragging one block of a multiple selection moves all of them */
      dr.ids = !dr.connect && ED.multi && ED.multi.indexOf(dr.id) >= 0 ? ED.multi.filter(function (id) { return st.nodeEls[id] && st.L.nodes[id]; }) : [dr.id];
      dr.skip = {};
      dr.start = {};
      dr.ids.forEach(function (id) {
        var q = st.L.nodes[id];
        dr.skip[id] = true;
        dr.start[id] = { x: q.x, y: q.y, tr: st.nodeEls[id].getAttribute('transform') || '' };
        /* waypoints copied from the automatic layout are dropped while the block moves */
        (st.adj[id] || []).forEach(function (i) { var e = st.d.edges[i]; if ((e.route || st.d.route) === 'spline') e.points = []; });
      });
      dr.orig = { x: dr.start[dr.id].x, y: dr.start[dr.id].y };
      var ovl = st.svg.querySelector('.ed-overlay');
      if (ovl) ovl.remove();
      edHideEdgeBar();
      if (dr.connect) {
        var start = edNearestPin(st, dr.id, edPoint(st, { clientX: dr.sx, clientY: dr.sy }), 12 / svgScale(st));
        dr.fromPin = start;
        dr.line = S('path', { class: 'ed-link', d: '', fill: 'none', style: ED_ACCENT + 'pointer-events:none', 'stroke-width': 2, 'stroke-dasharray': '6 4' });
        st.svg.querySelector('g.root').appendChild(dr.line);
      }
    }
  }
  if (dr.handle) { edHandleMove(dr, ev); return; }
  var s = svgScale(dr.st), dx = (ev.clientX - dr.sx) / s, dy = (ev.clientY - dr.sy) / s;
  var L = dr.st.L, P = L.nodes[dr.id];
  if (dr.connect) {
    var a = dr.fromPin || dr.orig, tgt = edNodeAt(ev), b = edPoint(dr.st, ev);
    edShowPins(dr, tgt && tgt !== dr.id ? tgt : null, 'in');
    var pin = tgt && tgt !== dr.id ? edNearestPin(dr.st, tgt, b, 12 / s) : null;
    if (pin) b = pin;
    if (pin) edPinStatus(pin, 'in'); else if (dr.fromPin) edPinStatus(dr.fromPin, 'out');
    dr.line.setAttribute('d', 'M' + fmt(a.x) + ',' + fmt(a.y) + 'L' + fmt(b.x) + ',' + fmt(b.y));
    return;
  }
  var nx = dr.orig.x + dx, ny = dr.orig.y + dy;
  var guide = ev.altKey ? null : edAlign(dr.st, dr.id, nx, ny, P, dr.skip);
  if (dr.snap && !ev.altKey) {
    nx = guide && guide.x !== null ? guide.x : Math.round((nx - P.w / 2) / 10) * 10 + P.w / 2;
    ny = guide && guide.y !== null ? guide.y : Math.round((ny - P.h / 2) / 10) * 10 + P.h / 2;
  }
  var mx = nx - dr.orig.x, my = ny - dr.orig.y, moved = {};
  edDrawGuides(dr, guide);
  dr.ids.forEach(function (id) {
    var q = L.nodes[id], o = dr.start[id];
    q.x = o.x + mx; q.y = o.y + my;
    dr.st.nodeEls[id].setAttribute('transform', 'translate(' + fmt(mx) + ' ' + fmt(my) + ') ' + o.tr);
    (dr.st.adj[id] || []).forEach(function (i) { moved[i] = true; });
  });
  Object.keys(moved).forEach(function (i) { edLiveEdge(dr.st, +i); });
}
/* Handles: "resize-<side>", "wp-<n>" (a bend), "mid-<segment>" (adds a bend), "end-from" / "end-to". */
function edHandleStart(dr, ev) {
  var d = edDiagram(), kind = dr.handle.split('-')[0];
  var needsManual = kind === 'wp' || kind === 'mid' || kind === 'end';
  if (needsManual && d.layout !== 'manual') {
    var keep = ED.selected;
    edFreezeNow(d);
    ED.selected = keep;
    edDrawOverlay();
  }
  dr.st = active;
  var st = active;
  if (kind === 'resize') {
    var p = st.L.nodes[dr.sel.id];
    if (!p) { ED.drag = null; return; }
    dr.box0 = { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
    dr.preview = st.svg.querySelector('.ed-overlay .ed-box');
    return;
  }
  var i = edEdgeIndex(st, dr.sel.edge);
  if (i < 0) { ED.drag = null; return; }
  dr.ei = i;
  var e = st.d.edges[i];
  if (kind === 'mid') {
    var seg = +dr.handle.split('-')[1], pts = st.L.edges[i].points;
    var q = { x: (pts[seg].x + pts[seg + 1].x) / 2, y: (pts[seg].y + pts[seg + 1].y) / 2 };
    /* the new bend goes between the existing bends that come before and after it along the wire */
    var along = function (pt) {
      var acc = 0, best = { d: Infinity, t: 0 };
      for (var j = 0; j < pts.length - 1; j++) {
        var a = pts[j], b = pts[j + 1], vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
        var u = Math.max(0, Math.min(1, ((pt.x - a.x) * vx + (pt.y - a.y) * vy) / l2)), cx = a.x + vx * u, cy = a.y + vy * u;
        var dd = Math.hypot(pt.x - cx, pt.y - cy), l = Math.sqrt(l2);
        if (dd < best.d) best = { d: dd, t: acc + u * l };
        acc += l;
      }
      return best.t;
    };
    var tq = along(q), idx = 0;
    e.points.forEach(function (w, wi) { if (along(w) < tq) idx = wi + 1; });
    e.points.splice(idx, 0, q);
    dr.handle = 'wp-' + idx;
    if ((e.route || st.d.route) === 'spline' || (e.route || st.d.route) === 'curved') { /* curves keep their bends as control points */ }
  }
  if (dr.handle.indexOf('end-') === 0) {
    var ptsE = st.L.edges[i].points;
    dr.fixed = dr.handle === 'end-from' ? ptsE[ptsE.length - 1] : ptsE[0];
    dr.line = S('path', { class: 'ed-link', d: '', fill: 'none', style: ED_ACCENT + 'pointer-events:none', 'stroke-width': 2, 'stroke-dasharray': '6 4' });
    st.svg.querySelector('g.root').appendChild(dr.line);
    var eg = st.edgeEls[i];
    if (eg) eg.style.opacity = 0.25;
    var ovl = st.svg.querySelector('.ed-overlay');
    if (ovl) ovl.style.pointerEvents = 'none';
  }
}
function edHandleMove(dr, ev) {
  var st = dr.st, pt = edPoint(st, ev), kind = dr.handle.split('-')[0];
  if (kind === 'resize') {
    var side = dr.handle.split('-')[1], b = dr.box0, x1 = b.x, y1 = b.y, x2 = b.x + b.w, y2 = b.y + b.h;
    if (side.indexOf('w') >= 0) x1 = Math.min(edSnap(pt.x, ev), x2 - 10);
    if (side.indexOf('e') >= 0) x2 = Math.max(edSnap(pt.x, ev), x1 + 10);
    if (side.indexOf('n') >= 0) y1 = Math.min(edSnap(pt.y, ev), y2 - 10);
    if (side.indexOf('s') >= 0) y2 = Math.max(edSnap(pt.y, ev), y1 + 10);
    var node = st.d.nodeById[dr.sel.id], def = node ? shapeDef(node.shape) : null;
    var fixed = def && def.aspect === 'fixed' && !node.drawio;
    if (fixed ? !ev.shiftKey : ev.shiftKey) {
      /* keep the proportions: glyphs by default, other shapes while Shift is held */
      var ratio = b.w / b.h, w = x2 - x1, h = y2 - y1;
      if (side.length === 1) {
        if (side === 'e' || side === 'w') { h = w / ratio; var cy0 = b.y + b.h / 2; y1 = cy0 - h / 2; y2 = cy0 + h / 2; }
        else { w = h * ratio; var cx0 = b.x + b.w / 2; x1 = cx0 - w / 2; x2 = cx0 + w / 2; }
      } else if (w / h > ratio) { h = w / ratio; if (side.indexOf('n') >= 0) y1 = y2 - h; else y2 = y1 + h; }
      else { w = h * ratio; if (side.indexOf('w') >= 0) x1 = x2 - w; else x2 = x1 + w; }
    }
    dr.box = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    if (dr.preview) { dr.preview.setAttribute('x', fmt(x1)); dr.preview.setAttribute('y', fmt(y1)); dr.preview.setAttribute('width', fmt(x2 - x1)); dr.preview.setAttribute('height', fmt(y2 - y1)); }
    return;
  }
  var e = st.d.edges[dr.ei];
  if (kind === 'wp') {
    var wi = +dr.handle.split('-')[1];
    e.points[wi] = { x: edSnap(pt.x, ev), y: edSnap(pt.y, ev) };
    edLiveEdge(st, dr.ei);
    var h = st.svg.querySelector('.ed-overlay [data-h="' + dr.handle + '"]');
    if (h) { var k = 1 / svgScale(st); h.setAttribute('x', fmt(e.points[wi].x - 5 * k)); h.setAttribute('y', fmt(e.points[wi].y - 5 * k)); h.setAttribute('transform', 'rotate(45 ' + fmt(e.points[wi].x) + ' ' + fmt(e.points[wi].y) + ')'); }
    return;
  }
  if (kind === 'end') {
    var tgt = edNodeAt(ev), end = pt, want = dr.handle === 'end-from' ? 'out' : 'in';
    edShowPins(dr, tgt, want);
    var pin = tgt ? edNearestPin(st, tgt, pt, 12 / svgScale(st)) : null;
    if (pin) { end = pin; edPinStatus(pin, want); }
    dr.line.setAttribute('d', 'M' + fmt(dr.fixed.x) + ',' + fmt(dr.fixed.y) + 'L' + fmt(end.x) + ',' + fmt(end.y));
  }
}
function edHandleUp(dr, ev) {
  var st = dr.st, d = edDiagram(), kind = dr.handle.split('-')[0];
  if (dr.line) dr.line.remove();
  if (dr.pinLayer) dr.pinLayer.remove();
  if (kind === 'resize') {
    var raw = edRawNode(dr.sel.id), b = dr.box;
    if (!raw || !b) { edDrawOverlay(); return; }
    raw.w = Math.round(b.w * 10) / 10;
    raw.h = Math.round(b.h * 10) / 10;
    if (d.layout === 'manual') { raw.x = Math.round(b.x * 10) / 10; raw.y = Math.round(b.y * 10) / 10; }
    edChanged(false, el('lResize', dr.sel.id));
    return;
  }
  var e = st.d.edges[dr.ei], re = d.edges[e.rawIndex];
  if (!re) return;
  if (kind === 'wp') {
    re.points = e.points.map(function (q) { return [Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10]; });
    if (!re.route && (d.route === 'spline' || !d.route) && st.d.layout === 'manual' && !re.drawio) re.route = d.route === 'spline' ? 'spline' : (d.route || 'straight');
    edChanged(false, el('lBend', (re.from || '·') + ' → ' + (re.to || '·')));
    return;
  }
  if (kind === 'end') {
    var which = dr.handle === 'end-from' ? 'from' : 'to', tgt = edNodeAt(ev), pt = edPoint(st, ev);
    if (tgt) {
      re[which] = tgt;
      delete re[which + 'Point'];
      var pin = edNearestPin(st, tgt, pt, 12 / svgScale(st));
      if (pin) re[which + 'Anchor'] = { x: pin.anchor[0], y: pin.anchor[1], perimeter: false };
      else delete re[which + 'Anchor'];
    } else if (d.layout === 'manual') {
      delete re[which];
      delete re[which + 'Anchor'];
      re[which + 'Point'] = [edSnap(pt.x, ev), edSnap(pt.y, ev)];
    }
    edChanged(true, el('lConnect', (re.from || '·') + ' → ' + (re.to || '·')));
  }
}
/* Alignment guides: snap the dragged block's centre or edges to a nearby block's centre or edges. */
function edAlign(st, id, cx, cy, P, skip) {
  var best = { x: null, y: null, dx: 7, dy: 7, gx: null, gy: null };
  var mine = { x: [cx - P.w / 2, cx, cx + P.w / 2], y: [cy - P.h / 2, cy, cy + P.h / 2] };
  Object.keys(st.L.nodes).forEach(function (oid) {
    if (oid === id || (skip && skip[oid])) return;
    var q = st.L.nodes[oid], xs = [q.x - q.w / 2, q.x, q.x + q.w / 2], ys = [q.y - q.h / 2, q.y, q.y + q.h / 2];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) {
      var ddx = xs[j] - mine.x[i];
      if (Math.abs(ddx) < best.dx) { best.dx = Math.abs(ddx); best.x = cx + ddx; best.gx = { x: xs[j], y1: Math.min(q.y - q.h / 2, cy - P.h / 2), y2: Math.max(q.y + q.h / 2, cy + P.h / 2) }; }
      var ddy = ys[j] - mine.y[i];
      if (Math.abs(ddy) < best.dy) { best.dy = Math.abs(ddy); best.y = cy + ddy; best.gy = { y: ys[j], x1: Math.min(q.x - q.w / 2, cx - P.w / 2), x2: Math.max(q.x + q.w / 2, cx + P.w / 2) }; }
    }
  });
  return best.x === null && best.y === null ? null : best;
}
function edDrawGuides(dr, guide) {
  if (!dr.guides) { dr.guides = S('g', { class: 'ed-guides', 'pointer-events': 'none' }); dr.st.svg.querySelector('g.root').appendChild(dr.guides); }
  dr.guides.textContent = '';
  if (!guide) return;
  var k = 1 / svgScale(dr.st), attrs = { stroke: '#e11d48', 'stroke-width': fmt(k), 'stroke-dasharray': fmt(4 * k) + ' ' + fmt(3 * k) };
  if (guide.gx) dr.guides.appendChild(S('line', Object.assign({ x1: fmt(guide.gx.x), x2: fmt(guide.gx.x), y1: fmt(guide.gx.y1 - 8), y2: fmt(guide.gx.y2 + 8) }, attrs)));
  if (guide.gy) dr.guides.appendChild(S('line', Object.assign({ y1: fmt(guide.gy.y), y2: fmt(guide.gy.y), x1: fmt(guide.gy.x1 - 8), x2: fmt(guide.gy.x2 + 8) }, attrs)));
}
function edPointerUp(ev) {
  if (ED && ED.band) { edBandUp(ev); return; }
  var dr = ED && ED.drag;
  if (!dr) return;
  ED.drag = null;
  if (dr.hier) { hierPointerUp(ev, dr); return; }
  if (dr.guides) dr.guides.remove();
  if (!dr.started) return;
  /* the browser may send one click right after the drag ends; only that click is ignored */
  setTimeout(function () { if (ED) ED.suppressClick = false; }, 0);
  if (dr.handle) { edHandleUp(dr, ev); return; }
  var d = edDiagram();
  if (dr.connect) {
    if (dr.line) dr.line.remove();
    if (dr.pinLayer) dr.pinLayer.remove();
    var tid = edNodeAt(ev);
    if (tid && tid !== dr.id) {
      d.edges = d.edges || [];
      var edge = { from: dr.id, to: tid };
      if (dr.fromPin) edge.fromAnchor = { x: dr.fromPin.anchor[0], y: dr.fromPin.anchor[1], perimeter: false };
      var pin = edNearestPin(dr.st, tid, edPoint(dr.st, ev), 12 / svgScale(dr.st));
      if (pin) edge.toAnchor = { x: pin.anchor[0], y: pin.anchor[1], perimeter: false };
      d.edges.push(edge);
      ED.multi = null;
      ED.selected = { edge: d.edges.length - 1 };
      edChanged(true, el('lConnect', dr.id + ' → ' + tid));
    }
    return;
  }
  var label = el('lMove', dr.ids.join(', '));
  dr.ids.forEach(function (id) {
    var raw = edRawNode(id), P = dr.st.L.nodes[id];
    if (!raw || !P) return;
    raw.x = Math.round((P.x - P.w / 2) * 10) / 10;
    raw.y = Math.round((P.y - P.h / 2) * 10) / 10;
    /* waypoints copied from the automatic layout no longer fit, so those edges re-route */
    (dr.st.adj[id] || []).forEach(function (i) {
      var e = dr.st.d.edges[i], re = d.edges[e.rawIndex];
      if (re && re.points && (e.route || dr.st.d.route) === 'spline') delete re.points;
    });
  });
  if (dr.ids.length === 1) {
    var moveTo = edRegroup(dr.st, dr.id);
    if (moveTo) label = moveTo;
    ED.multi = null;
    ED.selected = { id: dr.id };
  }
  edChanged(!!(dr.ids.length === 1 && label !== el('lMove', dr.id)), label);
}
/* A block dropped inside a group frame joins that group (the innermost one); dropped outside its frame, it leaves. */
function edRegroup(st, id) {
  var raw = edRawNode(id), P = st.L.nodes[id], d = edDiagram();
  if (!raw || !P || raw.drawio || !st.L.groups || !(d.groups || []).length) return null;
  var cur = str(raw.group), best = null;
  Object.keys(st.L.groups).forEach(function (gid) {
    var b = st.L.groups[gid], g = (d.groups || []).filter(function (x) { return str(x.id) === gid; })[0];
    if (!b || !g || g.hidden) return;
    if (P.x >= b.x && P.x <= b.x + b.w && P.y >= b.y && P.y <= b.y + b.h && (!best || b.w * b.h < best.a)) best = { id: gid, a: b.w * b.h };
  });
  if (best && best.id !== cur) { raw.group = best.id; edStatus(el('lGroupIn', id, best.id)); return el('lGroupIn', id, best.id); }
  if (!best && cur) { delete raw.group; edStatus(el('lGroupOut', id, cur)); return el('lGroupOut', id, cur); }
  return null;
}
function edBandMove(ev) {
  var b = ED.band, st = b.st;
  if (!b.started) {
    if (Math.abs(ev.clientX - b.sx) + Math.abs(ev.clientY - b.sy) < 4) return;
    b.started = true;
    ED.suppressClick = true;
  }
  var p0 = edPoint(st, { clientX: b.sx, clientY: b.sy }), p1 = edPoint(st, ev);
  b.box = { x: Math.min(p0.x, p1.x), y: Math.min(p0.y, p1.y), w: Math.abs(p1.x - p0.x), h: Math.abs(p1.y - p0.y) };
  if (!b.el) {
    b.el = S('rect', { class: 'ed-band', style: 'fill:var(--accent-soft);stroke:var(--accent);stroke-dasharray:4 3;pointer-events:none', 'stroke-width': fmt(1 / svgScale(st)) });
    st.svg.querySelector('g.root').appendChild(b.el);
  }
  b.el.setAttribute('x', fmt(b.box.x)); b.el.setAttribute('y', fmt(b.box.y));
  b.el.setAttribute('width', fmt(b.box.w)); b.el.setAttribute('height', fmt(b.box.h));
}
function edBandUp() {
  var b = ED.band;
  ED.band = null;
  if (b.el) b.el.remove();
  if (!b.started || !b.box) return;
  setTimeout(function () { if (ED) ED.suppressClick = false; }, 0);
  var got = [], L = b.st.L;
  Object.keys(L.nodes).forEach(function (id) {
    var p = L.nodes[id];
    if (p.x - p.w / 2 >= b.box.x && p.x + p.w / 2 <= b.box.x + b.box.w && p.y - p.h / 2 >= b.box.y && p.y + p.h / 2 <= b.box.y + b.box.h) got.push(id);
  });
  edSetSelection(got);
}
/* ---------- selection of several blocks ---------- */
function edSelIds() {
  if (!ED) return [];
  if (ED.multi && ED.multi.length) return ED.multi.slice();
  return ED.selected && ED.selected.id !== undefined ? [ED.selected.id] : [];
}
function edSetSelection(ids) {
  ids = ids.filter(function (id, i) { return ids.indexOf(id) === i; });
  ED.multi = ids.length > 1 ? ids : null;
  ED.selected = ids.length ? { id: ids[ids.length - 1] } : null;
  ED.revealRow = true;
  edMarkSelection();
  if (ids.length > 1) edStatus(el('selN', ids.length));
}
function edShowSelBar(st, ids) {
  var bar = ED.selBar || (ED.selBar = H('div', { class: 'ed-edgebar ed-selbar', role: 'toolbar' }));
  bar.textContent = '';
  var icon = function (d) { return S('svg', { width: 18, height: 18, viewBox: '0 0 18 18', 'aria-hidden': 'true' }, [S('path', { d: d, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round' })]); };
  var btn = function (d, key, fn) {
    var b = H('button', { type: 'button', class: 'ed-bb', title: et(key), 'aria-label': et(key) }, [icon(d)]);
    b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
    bar.appendChild(b);
  };
  btn('M2 2V16M5 5H15M5 12H10', 'alignLeft', function () { edAlignSel(ids, 'left'); });
  btn('M9 2V16M4 5H14M6 12H12', 'alignCenter', function () { edAlignSel(ids, 'center'); });
  btn('M16 2V16M3 5H13M8 12H13', 'alignRight', function () { edAlignSel(ids, 'right'); });
  bar.appendChild(H('span', { class: 'ed-bsep' }));
  btn('M2 2H16M5 5V15M12 5V10', 'alignTop', function () { edAlignSel(ids, 'top'); });
  btn('M2 9H16M5 4V14M12 6V12', 'alignMiddle', function () { edAlignSel(ids, 'middle'); });
  btn('M2 16H16M5 3V13M12 8V13', 'alignBottom', function () { edAlignSel(ids, 'bottom'); });
  bar.appendChild(H('span', { class: 'ed-bsep' }));
  btn('M3 4V14M9 4V14M15 4V14', 'distH', function () { edAlignSel(ids, 'hdist'); });
  btn('M4 3H14M4 9H14M4 15H14', 'distV', function () { edAlignSel(ids, 'vdist'); });
  bar.appendChild(H('span', { class: 'ed-bsep' }));
  var del = H('button', { type: 'button', class: 'ed-bb', title: et('delSel'), 'aria-label': et('delSel'), text: '🗑' });
  del.addEventListener('click', function (ev) { ev.stopPropagation(); edDeleteSelection(); });
  bar.appendChild(del);
  var x1 = Infinity, y1 = Infinity;
  ids.forEach(function (id) { var p = st.L.nodes[id]; if (p) { x1 = Math.min(x1, p.x - p.w / 2); y1 = Math.min(y1, p.y - p.h / 2); } });
  var s = svgScale(st), off = svgOffset(st);
  bar.style.left = Math.round(off.x + (x1 + st.L.ox) * s) + 'px';
  bar.style.top = Math.max(0, Math.round(off.y + (y1 + st.L.oy) * s - 48)) + 'px';
  st.canvas.appendChild(bar);
}
function edAlignSel(ids, mode) {
  var d = edDiagram(), st = active;
  if (!st || !st.L) return;
  if (d.layout !== 'manual') edFreeze(d);
  var boxes = ids.map(function (id) { var p = st.L.nodes[id]; return p ? { id: id, x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h } : null; }).filter(Boolean);
  if (boxes.length < 2) return;
  var x1 = Math.min.apply(null, boxes.map(function (b) { return b.x; })), x2 = Math.max.apply(null, boxes.map(function (b) { return b.x + b.w; }));
  var y1 = Math.min.apply(null, boxes.map(function (b) { return b.y; })), y2 = Math.max.apply(null, boxes.map(function (b) { return b.y + b.h; }));
  var spread = function (axis) {
    var pos = axis === 'x' ? 'x' : 'y', size = axis === 'x' ? 'w' : 'h', lo = axis === 'x' ? x1 : y1, hi = axis === 'x' ? x2 : y2;
    boxes.sort(function (a, b) { return (a[pos] + a[size] / 2) - (b[pos] + b[size] / 2); });
    var used = boxes.reduce(function (t, b) { return t + b[size]; }, 0), gap = (hi - lo - used) / (boxes.length - 1), at = lo;
    boxes.forEach(function (b) { b[pos] = at; at += b[size] + gap; });
  };
  boxes.forEach(function (b) {
    if (mode === 'left') b.x = x1;
    else if (mode === 'center') b.x = (x1 + x2) / 2 - b.w / 2;
    else if (mode === 'right') b.x = x2 - b.w;
    else if (mode === 'top') b.y = y1;
    else if (mode === 'middle') b.y = (y1 + y2) / 2 - b.h / 2;
    else if (mode === 'bottom') b.y = y2 - b.h;
  });
  if (mode === 'hdist') spread('x');
  if (mode === 'vdist') spread('y');
  boxes.forEach(function (b) { var raw = edRawNode(b.id); if (raw) { raw.x = Math.round(b.x); raw.y = Math.round(b.y); } });
  edChanged(false, el('lAlign', boxes.length));
}
function edDeleteSelection() {
  var d = edDiagram(), ids = edSelIds();
  if (!ids.length) return;
  var heal = edTypeOf(d) === 'graph' ? asHealPairs(d, ids) : [];
  ids.forEach(function (id) { edRemoveNode(d, id); });
  ED.selected = null;
  ED.multi = null;
  edKeepHeal(heal);
  edChanged(true, el('lDelNode', ids.join(', ')));
  if (heal.length) edHoldStatus(asl('healHint', asName(asNodes(d)[heal[0].from]), asName(asNodes(d)[heal[0].to])));
}
/* What joined a deleted block's two neighbours, offered for the next few steps (first in the suggestions). */
function edKeepHeal(pairs) { ED.heal = pairs && pairs.length ? { diag: ED.diag, pairs: pairs, left: 4 } : null; }
/* The page's own tab buttons still switch the drawing while editing: the editor follows, so edits go to the tab on screen. */
function edFollowTab(id) {
  if (!ED || !ED.raw) return;
  var k = -1;
  ED.raw.diagrams.forEach(function (d, i) { if ((str(d.id).replace(/[^A-Za-z0-9_.-]/g, '-') || ('diagram-' + (i + 1))) === id) k = i; });
  if (k < 0 || k === ED.diag) return;
  ED.diag = k;
  ED.selected = null;
  ED.multi = null;
  edBuildForm();
  edRender();
}
/* Copy and paste: the blocks and the connections between them, also between pages through the clipboard. */
function edCopyClip(ids) {
  var d = edDiagram(), set = {};
  ids.forEach(function (id) { set[id] = true; });
  var nodes = (d.nodes || []).filter(function (n) { return set[str(n.id)]; }).map(edClone);
  var edges = (d.edges || []).filter(function (e) { return set[str(e.from)] && set[str(e.to)]; }).map(edClone);
  if (d.layout !== 'manual' && active && active.L) nodes.forEach(function (n) { var p = active.L.nodes[str(n.id)]; if (p) { n.x = Math.round(p.x - p.w / 2); n.y = Math.round(p.y - p.h / 2); } });
  return { nodes: nodes, edges: edges };
}
function edPasteClip(clip) {
  if (!clip || !Array.isArray(clip.nodes) || !clip.nodes.length) return;
  var d = edDiagram(), manual = d.layout === 'manual', map = {}, ids = [];
  d.nodes = d.nodes || [];
  d.edges = d.edges || [];
  clip.nodes.forEach(function (n) {
    if (!n || typeof n !== 'object') return;
    var c = edClone(n), nid = edUniqueId(d.nodes, str(c.id).replace(/[^A-Za-z0-9_.:-]/g, '-') || 'n');
    map[str(n.id)] = nid;
    c.id = nid;
    if (manual && isFinite(+c.x) && isFinite(+c.y)) { c.x = +c.x + 20; c.y = +c.y + 20; } else { delete c.x; delete c.y; }
    if (c.group && !(d.groups || []).some(function (g) { return str(g.id) === str(c.group); })) delete c.group;
    d.nodes.push(c);
    ids.push(nid);
  });
  (Array.isArray(clip.edges) ? clip.edges : []).forEach(function (e) {
    if (!e || !map[str(e.from)] || !map[str(e.to)]) return;
    var c = edClone(e);
    c.from = map[str(e.from)];
    c.to = map[str(e.to)];
    delete c.id;
    delete c.drawio;
    if (manual && Array.isArray(c.points)) c.points = c.points.map(function (p) { var q = normPt(p); return q ? [q.x + 20, q.y + 20] : p; });
    else delete c.points;
    d.edges.push(c);
  });
  ED.multi = ids.length > 1 ? ids : null;
  ED.selected = ids.length ? { id: ids[ids.length - 1] } : null;
  edChanged(true, el('lPaste2', ids.length));
}
function edTyping(ev) {
  var t = ev.target, tag = (t && t.tagName) || '';
  return /^(INPUT|TEXTAREA|SELECT)$/.test(tag) || !!(t && t.isContentEditable);
}
function edFreezeNow(d) {
  edFreeze(d);
  clearTimeout(edRenderTimer);
  edRender();
}
function edNudge(dx, dy) {
  var d = edDiagram(), ids = edSelIds();
  if (!ids.length) return;
  if (d.layout !== 'manual') edFreezeNow(d);
  ids.forEach(function (id) {
    var raw = edRawNode(id);
    if (!raw) return;
    raw.x = (raw.x || 0) + dx;
    raw.y = (raw.y || 0) + dy;
  });
  edChanged(false, el('lMove', ids.join(', ')));
}
function edKey(ev) {
  if (!ED) return;
  if (ED.aiPreview) { if (ev.key === 'Escape' && typeof aiReject === 'function') aiReject(); return; }
  /* was the last thing a click (Tab then autocompletes) or a key that moves the focus (Tab keeps moving it)? */
  var byPointer = ED.lastInput === 'pointer';
  if (ev.key === 'Tab' || ev.key === 'Enter' || ev.key === ' ') ED.lastInput = 'key';
  var typing = edTyping(ev), mod = ev.ctrlKey || ev.metaKey, key = (ev.key || '').toLowerCase();
  if (mod && !typing && key === 'z') { ev.preventDefault(); edUndoRedo(!ev.shiftKey); return; }
  if (mod && !typing && key === 'y') { ev.preventDefault(); edUndoRedo(false); return; }
  if (mod && key === 's') { ev.preventDefault(); edSaveHtml(); return; }
  if (typing || !active || active.d.kind !== 'graph') return;
  /* Tab takes the faint suggested block, like autocomplete: with the focus on the page, or on the block just
     clicked. A block or a button reached with the keyboard keeps Tab for moving on; the keys 1 to 8 work there. */
  var ae = document.activeElement, inBar = ae && ae.closest && ae.closest('.ed-edgebar, .ed-ghostbar');
  var onPage = !ae || ae === document.body || (byPointer && !inBar && active.canvas && active.canvas.contains(ae));
  if (ev.key === 'Tab' && !mod && !ev.shiftKey && onPage && ED.ghost && ED.selected && ED.selected.id === ED.ghost.id) { ev.preventDefault(); ED.lastInput = 'pointer'; edAcceptGhost(); return; }
  if (!mod && !ev.altKey && /^[1-8]$/.test(ev.key) && ED.sgList && ED.sgList[+ev.key - 1] && ED.suggestBox && !ED.suggestBox.hidden) {
    ev.preventDefault();
    edApplySuggestion(ED.sgList[+ev.key - 1]);
    return;
  }
  if (mod && key === 'a') { ev.preventDefault(); edSetSelection(Object.keys(active.L.nodes)); return; }
  if (mod && key === 'd') { var dup = edSelIds(); if (dup.length) { ev.preventDefault(); edPasteClip(edCopyClip(dup)); } return; }
  if (typeof hierKey === 'function' && hierKey(ev)) return;
  if (!ED.selected && !(ED.multi && ED.multi.length)) return;
  if (ev.key === 'Delete' || ev.key === 'Backspace') {
    ev.preventDefault();
    if (ED.selected && ED.selected.edge !== undefined && !ED.multi) { edDeleteEdge(edDiagram(), ED.selected.edge); return; }
    edDeleteSelection();
    return;
  }
  var step = ev.shiftKey ? 10 : 1;
  var arrows = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  if (arrows[ev.key] && edSelIds().length) { ev.preventDefault(); ev.stopPropagation(); edNudge(arrows[ev.key][0], arrows[ev.key][1]); }
  if (ev.key === 'Escape') { ED.selected = null; ED.multi = null; edMarkSelection(); }
}
function edCanvasClick(ev) {
  if (!ED || ED.aiPreview) return;
  if (ED.suppressClick && active && active.canvas && active.canvas.contains(ev.target)) { ED.suppressClick = false; ev.stopPropagation(); ev.preventDefault(); return; }
  if (!active || !active.svg || !active.svg.contains(ev.target)) return;
  if (ev.target.closest && ev.target.closest('.ed-h')) return;
  if (typeof hierCanvasClick === 'function' && hierCanvasClick(ev)) return;
  var nodeEl = ev.target.closest ? ev.target.closest('.node') : null;
  var edgeEl = !nodeEl && ev.target.closest ? ev.target.closest('.edge') : null;
  /* while editing, a click selects; the reading view's focus and dimming stay off */
  if ((nodeEl || edgeEl) && active.d.kind === 'graph') ev.stopPropagation();
  if (nodeEl && (ev.shiftKey || ev.metaKey || ev.ctrlKey) && active.d.kind === 'graph') {
    var id = nodeEl.getAttribute('data-id'), ids = edSelIds(), k = ids.indexOf(id);
    if (k >= 0) ids.splice(k, 1); else ids.push(id);
    edSetSelection(ids);
    return;
  }
  ED.multi = null;
  if (nodeEl) ED.selected = { id: nodeEl.getAttribute('data-id') };
  else if (edgeEl && active.d.kind === 'graph') { var e = active.d.edges[+edgeEl.getAttribute('data-i')]; ED.selected = e ? { edge: e.rawIndex } : null; }
  else ED.selected = null;
  ED.revealRow = true;
  edMarkSelection();
}
function edDblClick(ev) {
  if (ED && ED.aiPreview) return;
  if (!ED || !active || !active.svg || !active.svg.contains(ev.target)) return;
  var h = ev.target.closest ? ev.target.closest('.ed-h') : null;
  if (h && /^wp-/.test(h.getAttribute('data-h')) && ED.selected && ED.selected.edge !== undefined) {
    var re = edDiagram().edges[ED.selected.edge], wi = +h.getAttribute('data-h').slice(3);
    if (re && re.points) { re.points.splice(wi, 1); if (!re.points.length) delete re.points; edChanged(false); }
    return;
  }
  if (active.d.kind !== 'graph') return;
  if (typeof hierDblClick === 'function' && hierDblClick(ev)) return;
  var nodeEl = ev.target.closest ? ev.target.closest('.node') : null;
  var edgeEl = !nodeEl && ev.target.closest ? ev.target.closest('.edge') : null;
  if (nodeEl) {
    ED.multi = null;
    ED.selected = { id: nodeEl.getAttribute('data-id') };
    ED.revealRow = true;
    edMarkSelection();
    edInlineEdit(active, { id: nodeEl.getAttribute('data-id') });
  } else if (edgeEl) {
    var e = active.d.edges[+edgeEl.getAttribute('data-i')];
    if (!e) return;
    ED.multi = null;
    ED.selected = { edge: e.rawIndex };
    edMarkSelection();
    edInlineEdit(active, { edge: e.rawIndex });
  }
}
/* Edit a block's title or a connection's label right on the drawing: Enter saves, Shift+Enter adds a line, Esc cancels. */
function edInlineEdit(st, target) {
  var d = edDiagram(), raw, text, box;
  if (!st || !st.L || !st.canvas) return;
  if (target.id !== undefined) {
    raw = edRawNode(target.id);
    var p = st.L.nodes[target.id];
    if (!raw || !p) return;
    text = raw.title === undefined || raw.title === null ? '' : String(raw.title);
    var w = Math.max(p.w, 140), hh = Math.max(p.h, 40);
    box = { x: p.x - w / 2, y: p.y - hh / 2, w: w, h: hh };
  } else {
    raw = d.edges[target.edge];
    var i = edEdgeIndex(st, target.edge), g = i >= 0 ? st.L.edges[i] : null;
    if (!raw || !g || !g.points.length) return;
    text = raw.label === undefined || raw.label === null ? '' : String(raw.label);
    var c = isFinite(g.lx) ? { x: g.lx, y: g.ly } : labelPoint(g.points, 0, 0);
    box = { x: c.x - 80, y: c.y - 18, w: 160, h: 36 };
  }
  var old = st.canvas.querySelector('.ed-inline-edit');
  if (old) old.remove();
  var s = svgScale(st), off = svgOffset(st);
  var ta = H('textarea', { class: 'ed-inline-edit', spellcheck: 'false', 'aria-label': target.id !== undefined ? ec('title') : ec('label') });
  ta.value = text;
  ta.style.left = Math.round(off.x + (box.x + st.L.ox) * s) + 'px';
  ta.style.top = Math.round(off.y + (box.y + st.L.oy) * s) + 'px';
  ta.style.width = Math.round(box.w * s) + 'px';
  ta.style.height = Math.round(box.h * s) + 'px';
  st.canvas.appendChild(ta);
  ta.focus();
  ta.select();
  var done = false;
  var finish = function (save) {
    if (done) return;
    done = true;
    var v = ta.value;
    ta.remove();
    if (!save || v === text) return;
    if (target.id !== undefined) setOrDelete(raw, 'title', v);
    else setOrDelete(raw, 'label', v);
    edChanged(true, el('lSet', target.id !== undefined ? target.id : ((raw.from || '·') + ' → ' + (raw.to || '·')), target.id !== undefined ? ec('title') : ec('label')));
  };
  ta.addEventListener('keydown', function (ev) {
    ev.stopPropagation();
    if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
    else if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); finish(true); }
  });
  ta.addEventListener('blur', function () { finish(true); });
}

/* Panning by dragging empty canvas space and zooming with Ctrl + wheel work in every page. */
function installCanvasGestures() {
  var pan = null;
  document.addEventListener('pointerdown', function (ev) {
    if (!active || !active.canvas || ev.button !== 0 || !active.canvas.contains(ev.target)) return;
    if (ev.shiftKey && ED && active.d.kind === 'graph') return;
    if (ev.target.closest && (ev.target.closest('.ed-inline-edit') || ev.target.closest('.node') || ev.target.closest('.edge') || ev.target.closest('.ed-h') || ev.target.closest('.ed-edgebar'))) return;
    pan = { x: ev.clientX, y: ev.clientY, l: active.canvas.scrollLeft, t: active.canvas.scrollTop, moved: false, canvas: active.canvas };
  });
  window.addEventListener('pointermove', function (ev) {
    if (!pan) return;
    var dx = ev.clientX - pan.x, dy = ev.clientY - pan.y;
    if (!pan.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    pan.moved = true;
    pan.canvas.classList.add('panning');
    pan.canvas.scrollLeft = pan.l - dx;
    pan.canvas.scrollTop = pan.t - dy;
  });
  window.addEventListener('pointerup', function () {
    if (pan && pan.moved) {
      pan.canvas.classList.remove('panning');
      var swallow = function (e) { e.stopPropagation(); e.preventDefault(); window.removeEventListener('click', swallow, true); };
      window.addEventListener('click', swallow, true);
      setTimeout(function () { window.removeEventListener('click', swallow, true); }, 0);
    }
    pan = null;
  });
  document.addEventListener('wheel', function (ev) {
    if (!(ev.ctrlKey || ev.metaKey) || !active || !active.canvas || !active.canvas.contains(ev.target)) return;
    ev.preventDefault();
    var c = active.canvas, r = c.getBoundingClientRect(), before = svgScale(active);
    var px = ev.clientX - r.left + c.scrollLeft, py = ev.clientY - r.top + c.scrollTop;
    zoomBy(active, ev.deltaY < 0 ? 1.12 : 1 / 1.12);
    var k = svgScale(active) / before;
    c.scrollLeft = px * k - (ev.clientX - r.left);
    c.scrollTop = py * k - (ev.clientY - r.top);
  }, { passive: false });
}

function installEditor() {
  document.addEventListener('pointerdown', function () { if (ED) ED.lastInput = 'pointer'; }, true);
  document.addEventListener('pointerdown', edPointerDown);
  window.addEventListener('pointermove', edPointerMove);
  window.addEventListener('pointerup', edPointerUp);
  document.addEventListener('click', edCanvasClick, true);
  document.addEventListener('dblclick', edDblClick);
  document.addEventListener('keydown', edKey);
  document.addEventListener('copy', function (ev) {
    if (!ED || edTyping(ev) || !active || active.d.kind !== 'graph') return;
    var ids = edSelIds();
    if (!ids.length) return;
    ED.clip = edCopyClip(ids);
    if (ev.clipboardData) { ev.clipboardData.setData('text/plain', JSON.stringify({ 'architecture-diagrams': ED.clip })); ev.preventDefault(); }
    edStatus(el('copiedN', ids.length));
  });
  document.addEventListener('paste', function (ev) {
    if (!ED || edTyping(ev) || !active || active.d.kind !== 'graph') return;
    var text = ev.clipboardData ? ev.clipboardData.getData('text/plain') : '', clip = null;
    try { var o = JSON.parse(text); clip = o && o['architecture-diagrams']; } catch (e) { clip = null; }
    clip = clip || ED.clip;
    if (!clip) return;
    ev.preventDefault();
    edPasteClip(clip);
  });
  installCanvasGestures();
  window.addEventListener('beforeunload', function (ev) { if (ED && ED.dirty) { ev.preventDefault(); ev.returnValue = et('unsaved'); } });
  document.addEventListener('dragover', function (ev) { if (ev.dataTransfer && Array.prototype.indexOf.call(ev.dataTransfer.types || [], 'Files') >= 0) { ev.preventDefault(); document.body.classList.add('dropping'); } });
  document.addEventListener('dragleave', function (ev) { if (!ev.relatedTarget) document.body.classList.remove('dropping'); });
  document.addEventListener('drop', function (ev) {
    document.body.classList.remove('dropping');
    var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (!f) return;
    ev.preventDefault();
    if (!ED) openEditor();
    var wait = function () { if (ED && ED.body) edOpenFile(f); else setTimeout(wait, 50); };
    wait();
  });
}
