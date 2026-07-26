/* Test Smart Suggest V13.3.0 trên đúng code thật (index.html + app.js), không gõ lại logic */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIR = '/home/claude/work/MeYeuBe-V13.3.1-Uu-Tien-Han-Dung';
const KEY = 'meYeuBePWA_v4';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  →  ' + extra : '')); }
}
function eq(name, got, want) { ok(name, JSON.stringify(got) === JSON.stringify(want), 'got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }

/* ---------- dựng môi trường ---------- */
function boot(db) {
  const html = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: 'https://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;

  // stub các API app dùng nhưng jsdom không có
  w.matchMedia = w.matchMedia || function () { return { matches: false, addEventListener() {}, addListener() {} } };
  w.scrollTo = function () {};
  w.navigator.serviceWorker = { register: () => Promise.reject(new Error('no sw')), ready: Promise.reject(new Error('no sw')), addEventListener() {} };
  w.fetch = () => Promise.reject(new Error('no net'));
  w.indexedDB = undefined;
  w.alert = () => {}; w.confirm = () => true; w.prompt = () => null;
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.localStorage.setItem(KEY, JSON.stringify(db));

  const code = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
  try { w.eval(code); } catch (e) { console.log('  !! app.js lỗi khi nạp: ' + e.message); }
  return w;
}

/* ---------- dữ liệu mẫu ---------- */
const TODAY = new Date();
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function plusHours(h) { const d = new Date(Date.now() + h * 3600000); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + 'T' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }

function bag(id, remaining, hoursLeft, createdTime) {
  return { id, shortId: id, date: iso(TODAY), timeFrom: createdTime || '08:00', amount: remaining, remaining, storage: 'Ngăn mát', status: 'Đang bảo quản', expireDateTime: plusHours(hoursLeft), note: '' };
}
function feed(amount, source, note, time) {
  return { type: 'feed', startDate: iso(TODAY), date: iso(TODAY), timeFrom: time || '08:00', amount, source: source || 'stored', note: note || '' };
}
function baseDb(extra) {
  return Object.assign({
    settings: {}, careEvents: [], milkInventory: [], milestones: [], diaries: [],
    appointments: [], pregnancy: [], baby: [], health: [], healthBooks: []
  }, extra || {});
}

/* ============================================================
   1. LOGIC ĐỀ XUẤT TÚI SỮA (mục 1 của tài liệu)
   ============================================================ */
console.log('\n[1] Đề xuất kho sữa — đúng ví dụ trong tài liệu');
{
  // Kho 50ml (6 giờ) · 80ml (2 ngày) · 120ml (5 ngày), bé bú 70ml
  // Quy tắc V13.3.1: vét túi sắp hết hạn nhất trước -> 50ml + 20ml
  const db = baseDb({ milkInventory: [bag('B50', 50, 6), bag('B80', 80, 48), bag('B120', 120, 120)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('vét túi sắp hết hạn nhất trước rồi mới lấy túi kế tiếp', r.bags.map(b => b.bagId), ['B50', 'B80']);
  eq('lấy hết 50ml của túi sắp hỏng', r.bags[0].usedMl, 50);
  eq('túi kế tiếp chỉ lấy đúng 20ml còn thiếu', r.bags[1].usedMl, 20);
  eq('tổng đúng bằng lượng bú', r.total, 70);
  ok('không đụng tới túi 120ml vì đã đủ', r.bags.length === 2);
  ok('có nhắc túi sắp hết hạn', /B50/.test(r.warn), 'warn=' + r.warn);
}
{
  // ĐÚNG VÍ DỤ BOSS ĐƯA: cần 80ml, túi 1 còn 60ml, túi 2 còn 120ml
  const db = baseDb({ milkInventory: [bag('T1', 60, 10), bag('T2', 120, 100)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 80);
  eq('gợi ý đúng 2 túi', r.bags.map(b => b.bagId), ['T1', 'T2']);
  eq('túi 1 (sắp hết hạn) lấy hết 60ml', r.bags[0].usedMl, 60);
  eq('túi 2 chỉ lấy 20ml còn thiếu', r.bags[1].usedMl, 20);
  eq('tổng 80ml', r.total, 80);
  ok('lý do nói rõ ưu tiên hạn dùng', /sắp hết hạn/.test(r.reason), r.reason);
}
{
  // Ví dụ 2 (đã chuẩn hoá): không túi nào đủ 70ml → ghép 2 túi hết hạn sớm nhất, trừ 50 + 20
  const db = baseDb({ milkInventory: [bag('A50', 50, 8), bag('A40', 40, 24), bag('A30', 30, 200)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('ghép đúng 2 túi', r.bags.map(b => b.bagId), ['A50', 'A40']);
  eq('trừ túi 1: 50ml', r.bags[0].usedMl, 50);
  eq('trừ túi 2: 20ml (đúng phần còn thiếu, không lấy cả 40ml)', r.bags[1].usedMl, 20);
  eq('tổng lấy ra bằng đúng lượng bú', r.total, 70);
  eq('không thiếu', r.short, 0);
  ok('dừng lại khi đã đủ, không lôi thêm túi thứ 3', r.bags.length === 2);
}
{
  // Dù có túi đơn đủ lượng vẫn phải vét túi sắp hết hạn trước (quy tắc V13.3.1)
  const db = baseDb({ milkInventory: [bag('C50', 50, 8), bag('C40', 40, 24), bag('C100', 100, 200)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('không mở thẳng túi 100ml mà dùng 2 túi cũ trước', r.bags.map(b => b.bagId), ['C50', 'C40']);
  eq('túi cũ nhất dùng hết', r.bags[0].usedMl, 50);
  eq('túi kế tiếp chỉ lấy phần còn thiếu', r.bags[1].usedMl, 20);
  ok('nhắc túi sắp hết hạn đang được dùng', /C50/.test(r.warn), 'warn=' + r.warn);
  ok('nhắc rõ số giờ còn lại', /còn \d+ giờ|dưới 1 giờ/.test(r.warn), r.warn);
}
{
  // Túi sắp hết hạn nhất đã thừa sức -> chỉ dùng một túi đó
  const db = baseDb({ milkInventory: [bag('D200', 200, 6), bag('D80', 80, 100)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('chỉ dùng túi sắp hết hạn nhất', r.bags.map(b => b.bagId), ['D200']);
  eq('lấy đúng 70ml, không lấy dư', r.bags[0].usedMl, 70);
  ok('lý do nêu đúng', /hạn dùng gần nhất/.test(r.reason), r.reason);
}
{
  // Chỉ còn một túi → tự chọn sẵn
  const db = baseDb({ milkInventory: [bag('ONE', 95, 40)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 0);
  eq('chọn sẵn túi duy nhất', r.bags.length, 1);
  eq('lấy toàn bộ lượng còn lại', r.bags[0].usedMl, 95);
  ok('có nêu lý do', /một túi/.test(r.reason), r.reason);
}
{
  // Túi sắp hết hạn dưới 24 giờ → cảnh báo
  const db = baseDb({ milkInventory: [bag('URG', 90, 5), bag('FAR', 200, 300)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('ưu tiên túi sắp hết hạn', r.bags[0].bagId, 'URG');
  ok('có cảnh báo hết hạn dưới 24 giờ', /hết hạn/.test(r.warn), 'warn=' + r.warn);
  ok('cảnh báo nêu số giờ còn lại', /còn \d+ giờ|dưới 1 giờ/.test(r.warn), r.warn);
  ok('cảnh báo là loại "dùng ngay" vì túi này được chọn', /Nên dùng túi URG/.test(r.warn), r.warn);
}
{
  // Kho không đủ → báo thiếu, không im lặng
  const db = baseDb({ milkInventory: [bag('S30', 30, 10), bag('S20', 20, 20)] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 100);
  eq('gợi ý hết những gì có', r.total, 50);
  eq('báo thiếu đúng 50ml', r.short, 50);
  ok('không tự nhận là đủ', r.enough === false);
  ok('lý do nói rõ thiếu bao nhiêu', /thiếu 50ml/.test(r.reason), r.reason);
}
{
  // Túi đã dùng hết / đã bỏ không được đề xuất
  const db = baseDb({
    milkInventory: [
      Object.assign(bag('DONE', 80, 3), { status: 'Đã sử dụng hết' }),
      Object.assign(bag('TRASH', 80, 4), { status: 'Đã bỏ' }),
      Object.assign(bag('ZERO', 0, 2), { remaining: 0 }),
      bag('GOOD', 80, 100)
    ]
  });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('chỉ lấy túi đang bảo quản còn sữa', r.bags.map(b => b.bagId), ['GOOD']);
}
{
  // Cùng hạn dùng → ưu tiên túi tạo trước (quy tắc 4)
  const db = baseDb({ milkInventory: [bag('LATE', 80, 50, '15:00'), bag('EARLY', 80, 50, '06:00')] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('chọn túi được tạo trước', r.bags[0].bagId, 'EARLY');
}
{
  // Kho rỗng → không gợi ý gì, không lỗi
  const db = baseDb({ milkInventory: [] });
  const w = boot(db);
  const r = w.ssSuggestBags(db, 70);
  eq('kho rỗng thì không đề xuất', r.bags.length, 0);
}

{
  // Ngưỡng cảnh báo đúng 24 giờ
  const w1 = boot(baseDb({ milkInventory: [bag('N23', 100, 23)] }));
  ok('túi còn 23 giờ -> có cảnh báo', /hết hạn/.test(w1.ssSuggestBags(w1.load(), 70).warn));
  const w2 = boot(baseDb({ milkInventory: [bag('N30', 100, 30)] }));
  eq('túi còn 30 giờ -> không cảnh báo', w2.ssSuggestBags(w2.load(), 70).warn, '');
}

/* ============================================================
   2. GỢI Ý THEO LỊCH SỬ (mục 2,3,4,5,6)
   ============================================================ */
console.log('\n[2] Gợi ý theo lịch sử');
{
  const db = baseDb({
    careEvents: [
      feed(120, 'stored', 'Fatz 1️⃣', '06:00'),
      feed(120, 'stored', 'Fatz 1️⃣', '09:00'),
      feed(110, 'stored', 'Fatz 2️⃣', '12:00'),
      feed(120, 'stored', 'Fatz 1️⃣', '15:00'),
      { type: 'pump', startDate: iso(TODAY), timeFrom: '07:00', amount: 150, storage: 'Ngăn mát' },
      { type: 'pump', startDate: iso(TODAY), timeFrom: '10:00', amount: 145, storage: 'Ngăn mát' },
      { type: 'pump', startDate: iso(TODAY), timeFrom: '13:00', amount: 155, storage: 'Ngăn đông' },
      { type: 'medicine', startDate: iso(TODAY), timeFrom: '08:00', amount: 1, unit: 'giọt', extra: { name: 'Vitamin D3' } },
      { type: 'medicine', startDate: iso(new Date(Date.now() - 86400000)), timeFrom: '08:00', amount: 1, unit: 'giọt', extra: { name: 'Vitamin D3' } },
      { type: 'diaper', startDate: iso(TODAY), timeFrom: '11:00', amount: 1, extra: { diaperType: 'dirty' } }
    ]
  });
  const w = boot(db);
  eq('§2 lượng bú = cữ gần nhất (120ml)', w.ssSuggestFeedAmount(db), 120);
  eq('§2 hình thức bú hay dùng nhất', w.ssSuggestFeedSource(db), 'stored');
  eq('§3 lượng hút = trung bình 150/145/155, làm tròn 5', w.ssSuggestPumpAmount(db), 150);
  eq('§3 nơi bảo quản hay dùng nhất', w.ssSuggestPumpStorage(db), 'Ngăn mát');
  eq('§4 thuốc theo liệu trình', w.ssSuggestMedicine(db), { name: 'Vitamin D3', dose: 1, unit: 'giọt' });
  eq('§5 loại tã của lần trước', w.ssSuggestDiaperType(db), 'dirty');
  const notes = w.ssSuggestNotes(db, 'feed', 4);
  eq('§6 ghi chú hay dùng, xếp theo tần suất', notes, ['Fatz 1️⃣', 'Fatz 2️⃣']);
}
{
  // Chưa có dữ liệu → không gợi ý bừa
  const db = baseDb();
  const w = boot(db);
  eq('app mới: không gợi ý lượng bú', w.ssSuggestFeedAmount(db), 0);
  eq('app mới: không gợi ý lượng hút', w.ssSuggestPumpAmount(db), 0);
  eq('app mới: không gợi ý thuốc', w.ssSuggestMedicine(db), null);
  eq('app mới: không gợi ý loại tã', w.ssSuggestDiaperType(db), '');
  eq('app mới: không có chip ghi chú', w.ssSuggestNotes(db, 'feed', 4), []);
}

/* ============================================================
   3. TÍCH HỢP THẬT VÀO FORM (mở form → kiểm tra DOM)
   ============================================================ */
console.log('\n[3] Tích hợp thật vào form Ghi nhận');
{
  const db = baseDb({
    careEvents: [feed(120, 'stored', 'Fatz 1️⃣', '06:00'), feed(120, 'stored', 'Fatz 1️⃣', '09:00')],
    milkInventory: [bag('B50', 50, 6), bag('B80', 80, 48), bag('B120', 120, 120)]
  });
  const w = boot(db);
  const d = w.document;
  w.openCareFormModal('feed');

  const amount = d.getElementById('cAmount');
  const source = d.getElementById('cFeedSource');
  ok('mở form Bé bú: lượng bú được điền sẵn 120', amount && amount.value === '120', 'value=' + (amount && amount.value));
  ok('lượng bú mang class gợi ý (nền vàng)', amount && amount.classList.contains('ssField'));
  ok('hình thức bú được chọn sẵn "kho sữa"', source && source.value === 'stored', 'value=' + (source && source.value));
  ok('có nhãn GỢI Ý cạnh nhãn ô lượng bú', !!d.querySelector('.ssTag[data-for="cAmount"]'));

  const bar = d.getElementById('ssBar');
  ok('thanh Smart Suggest hiện ra', bar && !bar.classList.contains('hidden'));
  ok('thanh có nút Xoá gợi ý', bar && /Xoá gợi ý/.test(bar.innerHTML));

  const srcs = w.milkFeedSourcesState();
  eq('túi sữa được chọn sẵn theo thứ tự hạn dùng', srcs.map(s => s.bagId), ['B50', 'B80']);
  eq('tổng lấy ra đúng 120ml', srcs.reduce((t, s) => t + s.usedMl, 0), 120);
  eq('túi sắp hỏng nhất (50ml) dùng hết trước', srcs[0].usedMl, 50);
  eq('túi kế tiếp chỉ lấy 70ml còn thiếu', srcs[1].usedMl, 70);
  ok('dừng ở 2 túi, không đụng túi 120ml', srcs.length === 2);
  ok('thẻ túi sữa được tô nền gợi ý', !!d.querySelector('#milkSourceList .milkChosenCard.ssBag'));
  ok('có dòng giải thích lý do chọn túi', !!d.getElementById('ssBagReason'));

  const chips = d.querySelectorAll('#ssNoteChips .ssNoteChip');
  ok('có chip ghi chú hay dùng', chips.length >= 1, 'so chip=' + chips.length);
}
{
  // Người dùng sửa tay → ô đó hết là gợi ý
  const db = baseDb({ careEvents: [feed(120, 'direct', '', '06:00')] });
  const w = boot(db);
  const d = w.document;
  w.openCareFormModal('feed');
  const amount = d.getElementById('cAmount');
  ok('trước khi sửa: là gợi ý', amount.classList.contains('ssField'));
  amount.value = '95';
  amount.dispatchEvent(new w.Event('input', { bubbles: true }));
  ok('sau khi gõ tay: bỏ nền vàng', !amount.classList.contains('ssField'));
  ok('sau khi gõ tay: bỏ nhãn GỢI Ý', !d.querySelector('.ssTag[data-for="cAmount"]'));
  eq('giá trị người dùng nhập được giữ nguyên', amount.value, '95');
}
{
  // Nút "Xoá gợi ý" xoá sạch cả ô lẫn túi sữa
  const db = baseDb({
    careEvents: [feed(120, 'stored', 'Fatz 1️⃣', '06:00')],
    milkInventory: [bag('B120', 120, 120)]
  });
  const w = boot(db);
  const d = w.document;
  w.openCareFormModal('feed');
  ok('trước khi xoá: có túi được chọn sẵn', w.milkFeedSourcesState().length === 1);
  w.ssClearAll();
  eq('sau khi xoá: ô lượng bú trống', d.getElementById('cAmount').value, '');
  eq('sau khi xoá: không còn túi nào được chọn', w.milkFeedSourcesState().length, 0);
  eq('sau khi xoá: hình thức bú về mặc định', d.getElementById('cFeedSource').value, 'direct');
  ok('sau khi xoá: thanh gợi ý biến mất', d.getElementById('ssBar').classList.contains('hidden'));
  ok('sau khi xoá: không còn ô nào nền vàng', d.querySelectorAll('.ssField').length === 0);
  // và không tự gợi ý lại khi đổi loại
  w.selectCareType('diaper');
  ok('đã Xoá gợi ý thì đổi loại cũng không gợi ý lại', d.getElementById('ssBar').classList.contains('hidden'));
}
{
  // Đang SỬA ghi nhận cũ → tuyệt đối không được đè gợi ý lên dữ liệu thật
  const old = feed(75, 'direct', 'ghi chú cũ', '05:00');
  const db = baseDb({ careEvents: [old, feed(120, 'stored', 'Fatz 1️⃣', '09:00')], milkInventory: [bag('B120', 120, 120)] });
  const w = boot(db);
  const d = w.document;
  w.openCareFormModal('feed', 0); // sửa bản ghi index 0
  eq('giữ nguyên lượng bú cũ 75, không bị đè thành 120', d.getElementById('cAmount').value, '75');
  eq('giữ nguyên hình thức bú cũ', d.getElementById('cFeedSource').value, 'direct');
  ok('không hiện thanh gợi ý khi đang sửa', d.getElementById('ssBar').classList.contains('hidden'));
  ok('không ô nào bị tô nền gợi ý', d.querySelectorAll('.ssField').length === 0);
  eq('không tự thêm túi sữa vào bản ghi đang sửa', w.milkFeedSourcesState().length, 0);
}
{
  // Đổi loại chăm sóc: mỗi loại gợi ý đúng phần của mình
  const db = baseDb({
    careEvents: [
      { type: 'pump', startDate: iso(TODAY), timeFrom: '07:00', amount: 150, storage: 'Ngăn mát' },
      { type: 'pump', startDate: iso(TODAY), timeFrom: '10:00', amount: 150, storage: 'Ngăn mát' },
      { type: 'medicine', startDate: iso(TODAY), timeFrom: '08:00', amount: 1, unit: 'giọt', extra: { name: 'Vitamin D3' } },
      { type: 'diaper', startDate: iso(TODAY), timeFrom: '11:00', amount: 1, extra: { diaperType: 'dirty' } }
    ]
  });
  const w = boot(db);
  const d = w.document;
  w.openCareFormModal('pump');
  eq('Hút sữa: điền sẵn 150ml', d.getElementById('cAmount').value, '150');
  eq('Hút sữa: chọn sẵn nơi bảo quản', d.getElementById('cStorage').value, 'Ngăn mát');
  ok('Hút sữa: hạn dùng được tự tính theo nơi bảo quản', !!d.getElementById('cExpireDate').value);

  w.selectCareType('medicine');
  eq('Thuốc: điền sẵn tên', d.getElementById('cMedicineName').value, 'Vitamin D3');
  eq('Thuốc: điền sẵn liều', d.getElementById('cMedicineDose').value, '1');
  eq('Thuốc: điền sẵn đơn vị', d.getElementById('cMedicineUnit').value, 'giọt');

  w.selectCareType('diaper');
  eq('Thay tã: chọn sẵn loại tã của lần trước', d.getElementById('cDiaperType').value, 'dirty');
  ok('Thay tã: nút loại tã được tô nền gợi ý', !!d.querySelector('.diaperChoice.ssField[data-diaper="dirty"]'));

  w.selectCareType('sleep');
  ok('Ngủ: không gợi ý gì (không có gì để gợi ý)', d.getElementById('ssBar').classList.contains('hidden'));
}
{
  // Tắt Smart Suggest trong cấu hình → form về y như cũ
  const db = baseDb({ careEvents: [feed(120, 'stored', 'Fatz 1️⃣', '06:00')], milkInventory: [bag('B120', 120, 120)] });
  const w = boot(db);
  const d = w.document;
  w.ssSaveSettings({ enabled: false });
  w.openCareFormModal('feed');
  eq('tắt rồi: không điền sẵn lượng bú', d.getElementById('cAmount').value, '');
  eq('tắt rồi: không tự chọn túi sữa', w.milkFeedSourcesState().length, 0);
  ok('tắt rồi: không hiện thanh gợi ý', d.getElementById('ssBar').classList.contains('hidden'));
}
{
  // Người dùng tự chọn túi trước → gợi ý không được phá lựa chọn đó
  const db = baseDb({ careEvents: [feed(120, 'stored', '', '06:00')], milkInventory: [bag('B120', 120, 120), bag('B80', 80, 10)] });
  const w = boot(db);
  const d = w.document;
  w.openCareFormModal('feed');
  w.ssClearAll();                       // người dùng bỏ gợi ý
  w.milkFeedSourcesState().push({ bagId: 'B80', usedMl: 80, remainderAction: 'keep', discardMl: 0, discardReason: '' });
  w.renderMilkSourceList();
  w.ssApplyMilkBags();                  // gọi lại engine
  eq('không đụng vào túi người dùng tự chọn', w.milkFeedSourcesState().map(s => s.bagId), ['B80']);
}

/* ============================================================
   4. HỒI QUY — các tính năng cũ vẫn chạy
   ============================================================ */
console.log('\n[4] Hồi quy tính năng cũ');
{
  const db = baseDb({
    careEvents: [feed(120, 'stored', 'Fatz 1️⃣', '06:00'), { type: 'diaper', startDate: iso(TODAY), timeFrom: '11:00', amount: 1, extra: { diaperType: 'dirty' } }],
    milkInventory: [bag('B120', 120, 120)]
  });
  const w = boot(db);
  const d = w.document;
  ok('V13.2.x: engine Hoàn tác còn nguyên', typeof w.udShow === 'function' && typeof w.udUndo === 'function');
  ok('V12.2.x: Tìm kiếm toàn app còn nguyên', typeof w.gsBuildIndex === 'function');
  ok('V13.0.0: Backup còn nguyên', typeof w.bkCreateVersion === 'function' && typeof w.bkComputeDiff === 'function');
  ok('V13.1.0: syncCareFormChromeForType còn nguyên', typeof w.syncCareFormChromeForType === 'function');

  w.openCareFormModal('feed');
  ok('form vẫn mở được bình thường', d.getElementById('careFormOverlay').classList.contains('show'));
  ok('vẫn khoá cuộn nền khi mở form', d.body.classList.contains('careModalOpen'));

  // thanh tiến độ kho sữa vẫn tính đúng
  w.updateCareMilkSourceTotal();
  const txt = d.getElementById('milkProgressText');
  ok('thanh tiến độ kho sữa vẫn tính đúng', txt && txt.textContent === '120 / 120 ml', 'text=' + (txt && txt.textContent));

  // lưu thật một ghi nhận và kiểm tra kho sữa bị trừ
  const before = w.load().milkInventory[0].remaining;
  w.saveCareEvent();
  const after = w.load();
  eq('lưu được ghi nhận mới', after.careEvents.length, 3);
  eq('kho sữa bị trừ đúng 120ml', after.milkInventory[0].remaining, before - 120);
  ok('ghi nhận lưu ra không dính cờ nội bộ của Smart Suggest',
     Object.keys(after.careEvents[after.careEvents.length - 1]).every(k => k.indexOf('ss') !== 0));

  // Hoàn tác trả lại kho sữa
  w.udUndo();
  const back = w.load();
  eq('Hoàn tác: trả lại đúng lượng sữa vào kho', back.milkInventory[0].remaining, before);
  eq('Hoàn tác: xoá bản ghi vừa tạo', back.careEvents.length, 2);
}

console.log('\n=========================================');
console.log('PASS: ' + pass + '   FAIL: ' + fail);
console.log('=========================================');
process.exit(fail ? 1 : 0);
