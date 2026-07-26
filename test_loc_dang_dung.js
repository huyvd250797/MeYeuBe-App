/* Test: chỉ hiện bình/túi đang ở trạng thái "Đang dùng" ở các chức năng chọn dữ liệu */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DIR = process.argv[2] || __dirname;
let pass = 0, fail = 0;
function ok(n, c, x) { if (c) { pass++; console.log('  ✓ ' + n) } else { fail++; console.log('  ✗ ' + n + (x ? '  →  ' + x : '')) } }
function eq(n, g, w) { ok(n, JSON.stringify(g) === JSON.stringify(w), 'got=' + JSON.stringify(g) + ' want=' + JSON.stringify(w)) }

function boot(db) {
  const dom = new JSDOM(fs.readFileSync(path.join(DIR, 'index.html'), 'utf8'), { url: 'https://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, addListener() {} }));
  w.scrollTo = () => {};
  w.navigator.serviceWorker = { register: () => new Promise(() => {}), ready: new Promise(() => {}), addEventListener() {} };
  w.fetch = () => new Promise(() => {});
  w.alert = () => {}; w.confirm = () => true; w.prompt = () => null;
  w.HTMLElement.prototype.scrollIntoView = function () {};
  w.localStorage.setItem('meYeuBePWA_v4', JSON.stringify(db));
  try { w.eval(fs.readFileSync(path.join(DIR, 'app.js'), 'utf8')) } catch (e) { console.log('  !! app.js: ' + e.message) }
  return w;
}
const T = new Date();
const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const TODAY = iso(T);
const EXP = iso(new Date(Date.now() + 96 * 3600000)) + 'T08:00';

const C = [
  { id: 'binh_on', name: 'Fatz 1', kind: 'binh', capacity: 150, active: true },
  { id: 'binh_off', name: 'Bình cũ bỏ rồi', kind: 'binh', capacity: 150, active: false },
  { id: 'tui_on', name: 'Túi Unimom', kind: 'tui', capacity: 0, active: true },
  { id: 'tui_off', name: 'Túi hãng cũ', kind: 'tui', capacity: 0, active: false }
];
function mkdb(containers, bagContainerId) {
  return {
    settings: { mcMigratedV1: true }, careEvents: [], milkContainers: containers,
    milkInventory: [{
      id: 'B1', shortId: 'B1', date: TODAY, startDate: TODAY, timeFrom: '08:00',
      amount: 160, remaining: 160, storage: 'Ngăn mát', status: 'Đang bảo quản', expireDateTime: EXP,
      containerId: bagContainerId || 'binh_on', containerKind: 'binh', containerName: 'Fatz 1', note: ''
    }],
    milestones: [], diary: [], appointments: [], pregnancy: [], baby: [], mom: [], healthBook: []
  };
}
const chips = (d, sel) => [...d.querySelectorAll(sel)].map(x => x.getAttribute('data-mc') || x.getAttribute('data-tf'));

console.log('\n[1] Form Hút sữa');
{
  const w = boot(mkdb(C)); const d = w.document;
  w.openCareFormModal('pump');
  eq('chỉ hiện bình/túi Đang dùng', chips(d, '#cContainerChips .mcChip'), ['binh_on', 'tui_on']);
  ok('không có mục Tạm ẩn nào lọt vào', !/Bình cũ bỏ rồi|Túi hãng cũ/.test(d.getElementById('cContainerChips').innerHTML));
}
{
  // đổi trạng thái sang Tạm ẩn ngay trong danh mục rồi mở lại form
  const w = boot(mkdb(C)); const d = w.document;
  w.showPage('milkContainer');
  const idx = w.mcAll(w.load()).findIndex(c => c.id === 'tui_on');
  w.editMilkContainer(idx);
  d.getElementById('mcActive').value = '0';
  w.saveMilkContainer();
  eq('lưu được trạng thái Tạm ẩn', w.load().milkContainers.find(c => c.id === 'tui_on').active, false);
  w.openCareFormModal('pump');
  eq('mục vừa ẩn biến mất khỏi form Hút sữa', chips(d, '#cContainerChips .mcChip'), ['binh_on']);
}
{
  // tất cả đều bị ẩn -> báo đúng lý do, không nói "chưa có"
  const allOff = C.map(c => Object.assign({}, c, { active: false }));
  const w = boot(mkdb(allOff)); const d = w.document;
  w.openCareFormModal('pump');
  const html = d.getElementById('cContainerChips').innerHTML;
  eq('không còn chip nào chọn được', chips(d, '#cContainerChips .mcChip'), []);
  ok('báo rõ là do đang Tạm ẩn', /Tạm ẩn/.test(html), html);
  ok('không báo nhầm là "chưa có"', !/Chưa có/.test(html), html);
}

console.log('\n[2] Popup Chuyển sữa');
{
  const w = boot(mkdb(C)); const d = w.document;
  w.tfOpen(0);
  w.tfPickKind('binh');
  eq('đích loại Bình: chỉ hiện bình Đang dùng', chips(d, '#tfTargetChips .mcChip'), ['binh_on']);
  w.tfPickKind('tui');
  eq('đích loại Túi: chỉ hiện túi Đang dùng', chips(d, '#tfTargetChips .mcChip'), ['tui_on']);
}
{
  const noTui = C.map(c => c.kind === 'tui' ? Object.assign({}, c, { active: false }) : c);
  const w = boot(mkdb(noTui)); const d = w.document;
  w.tfOpen(0); w.tfPickKind('tui');
  const html = d.getElementById('tfTargetChips').innerHTML;
  eq('mọi túi bị ẩn thì không chọn được túi nào', chips(d, '#tfTargetChips .mcChip'), []);
  ok('báo đúng lý do Tạm ẩn', /Tạm ẩn/.test(html), html);
  ok('vẫn chọn được bình bình thường', (w.tfPickKind('binh'), chips(d, '#tfTargetChips .mcChip').length === 1));
}
{
  // gọi thẳng vào mục đang ẩn cũng phải bị chặn
  const w = boot(mkdb(C));
  w.tfOpen(0); w.tfPickKind('binh');
  w.tfPickTarget('binh_off');
  eq('không cho chọn đích đang Tạm ẩn', w.tfState().targetId, '');
}

console.log('\n[3] Bản ghi cũ đã chọn mục nay bị ẩn — không được mất dữ liệu');
{
  const pumpEv = {
    id: 'CE_1', type: 'pump', date: TODAY, startDate: TODAY, timeFrom: '08:00', amount: 160,
    unit: 'ml', source: 'pump', storage: 'Ngăn mát', status: 'Đang bảo quản', linkedBagId: 'B1',
    extra: { containerId: 'binh_off', expireDate: EXP }
  };
  const db = mkdb(C, 'binh_off'); db.careEvents = [pumpEv];
  const w = boot(db); const d = w.document;
  w.openCareFormModal('pump', 0);
  eq('mở Sửa vẫn giữ đúng bình đã chọn từ trước', d.getElementById('cContainerId').value, 'binh_off');
  ok('bình đang ẩn vẫn hiện trong danh sách khi sửa', chips(d, '#cContainerChips .mcChip').indexOf('binh_off') > -1);
  const btn = d.querySelector('#cContainerChips .mcChip[data-mc="binh_off"]');
  ok('nhưng được đánh dấu rõ là Tạm ẩn', /Tạm ẩn/.test(btn.innerHTML), btn.innerHTML);
  ok('và hiển thị mờ đi', btn.className.indexOf('off') > -1, btn.className);

  w.mcPickPumpContainer('binh_on');
  eq('vẫn đổi sang bình Đang dùng được', d.getElementById('cContainerId').value, 'binh_on');
  w.mcPickPumpContainer('binh_off');
  eq('nhưng không cho chọn lại mục đang Tạm ẩn', d.getElementById('cContainerId').value, 'binh_on');
}
{
  // bản ghi MỚI thì mục ẩn không được xuất hiện dù từng được dùng
  const w = boot(mkdb(C, 'binh_off')); const d = w.document;
  w.openCareFormModal('pump');
  ok('ghi nhận mới không thấy mục đang ẩn', chips(d, '#cContainerChips .mcChip').indexOf('binh_off') < 0);
}

console.log('\n[4] Không ảnh hưởng chỗ khác');
{
  const w = boot(mkdb(C));
  w.showPage('milkContainer');
  const html = w.document.getElementById('mcList').innerHTML;
  ok('trang Danh mục vẫn liệt kê ĐẦY ĐỦ để còn bật lại được', /Bình cũ bỏ rồi/.test(html) && /Túi hãng cũ/.test(html));
  ok('mục bị ẩn có ghi chú Tạm ẩn', /Tạm ẩn/.test(html));
}
{
  const w = boot(mkdb(C));
  eq('helper lọc đúng theo loại', w.mcSelectableList(w.load(), 'tui', '').map(c => c.id), ['tui_on']);
  eq('helper giữ lại mục đang sửa', w.mcSelectableList(w.load(), 'binh', 'binh_off').map(c => c.id), ['binh_on', 'binh_off']);
  eq('đếm đúng số mục bị ẩn', w.mcHiddenCount(w.load(), ''), 2);
}

console.log('\n=========================================');
console.log('PASS: ' + pass + '   FAIL: ' + fail);
console.log('=========================================');
process.exit(fail ? 1 : 0);
