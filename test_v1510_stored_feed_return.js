const fs = require('fs');
const vm = require('vm');

let pass = 0, fail = 0;
function ok(name, cond, detail='') {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.error('  ✗ ' + name + (detail ? ' → ' + detail : '')); }
}
function eq(name, got, want) { ok(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

const app = fs.readFileSync('app.js', 'utf8');
const marker = app.indexOf('V15.0.74 · SupabaseCloudDBMode — khóa an toàn kho sữa + scroll + hồ sơ');
if (marker < 0) throw new Error('Không tìm thấy module milk ledger');
const start = app.indexOf('  function V(v)', marker);
const end = app.indexOf('  window.repairPumpMilkLinks=', start);
if (start < 0 || end < 0) throw new Error('Không cắt được milk ledger runtime');
const snippet = app.slice(start, end);

const ctx = {
  window: {}, console,
  byId: () => null,
  load: () => ({careEvents:[],milkInventory:[]}),
  milkExpireAt: () => Date.now() + 86400000,
  bagSourcesFromEvent: ev => (ev && ev.milkSources) || (ev && ev.extra && ev.extra.milkSources) || [],
  milkBagHasOutgoingTransfer: (db, id) => (db.careEvents || []).some(x => x && x.type === 'transfer' && x.extra && String(x.extra.fromBagId) === String(id)),
};
vm.createContext(ctx);
vm.runInContext(snippet, ctx);
const recalc = ctx.window.recalculateMilkInventoryLedger;
if (typeof recalc !== 'function') throw new Error('recalculateMilkInventoryLedger không được expose');

function milk(id, amount, extra={}) {
  return Object.assign({id, amount, remaining: amount, status:'Đang bảo quản', storage:'Ngăn mát'}, extra);
}
function storedFeed(id, bagId, ml) {
  return {id, type:'feed', source:'stored', amount:ml, milkSources:[{bagId, usedMl:ml, discardMl:0, remainderAction:'keep'}], extra:{milkSources:[{bagId, usedMl:ml, discardMl:0, remainderAction:'keep'}]}};
}

console.log('\n[V15.1.0] Stored feed → direct milk return regression');
{
  const db={careEvents:[storedFeed('f1','b1',100)],milkInventory:[milk('b1',100,{remaining:0,status:'Đã sử dụng hết'})]};
  recalc(db,{});
  eq('cữ stored 100ml vẫn giữ túi ở 0ml', [db.milkInventory[0].remaining, db.milkInventory[0].status], [0,'Đã sử dụng hết']);

  db.careEvents[0]={id:'f1',type:'feed',source:'direct',amount:0,milkSources:[],extra:{}};
  recalc(db,{});
  eq('sửa stored → direct trả lại đủ 100ml', [db.milkInventory[0].remaining, db.milkInventory[0].status], [100,'Đang bảo quản']);
}
{
  const db={careEvents:[],milkInventory:[milk('b2',150,{remaining:50,status:'Đang bảo quản'})]};
  recalc(db,{});
  eq('dữ liệu kẹt dùng một phần được trả về đúng dung tích gốc', [db.milkInventory[0].remaining,db.milkInventory[0].status], [150,'Đang bảo quản']);
}
{
  const db={careEvents:[],milkInventory:[milk('b3',100,{remaining:0,status:'Đã bỏ',cancelReason:'Hỏng túi',canceledAt:'2026-09-12T00:00:00Z'})]};
  recalc(db,{});
  eq('túi hủy thủ công không bị hồi sinh', [db.milkInventory[0].remaining,db.milkInventory[0].status], [0,'Đã bỏ']);
}
{
  const db={careEvents:[],milkInventory:[milk('b4',100,{remaining:0,status:'Đã bỏ',discardReason:'Đổ bỏ phần còn lại',discardedAt:'2026-09-12T00:00:00Z',discardedByFeed:true,discarded:100})]};
  recalc(db,{});
  eq('túi bị hủy do cữ bú cũ được trả lại khi cữ không còn dùng', [db.milkInventory[0].remaining,db.milkInventory[0].status], [100,'Đang bảo quản']);
  ok('metadata discard do feed được xóa', !db.milkInventory[0].discardedByFeed && !db.milkInventory[0].discardReason && !db.milkInventory[0].discardedAt);
}
{
  const db={careEvents:[{id:'t1',type:'transfer',amount:100,extra:{fromBagId:'b5'}}],milkInventory:[milk('b5',100,{remaining:0,status:'Đã chuyển hết'})]};
  recalc(db,{});
  eq('túi chuyển hết vẫn giữ trạng thái dẫn xuất từ giao dịch chuyển', [db.milkInventory[0].remaining,db.milkInventory[0].status], [0,'Đã chuyển hết']);
}

console.log('\n[V15.1.0] Cloud Sync cleanup regression');
const html=fs.readFileSync('index.html','utf8');
const removed=[
  'Migration JSON → Relational DB','Relational Migration Doctor','Relational Delta Sync','Relational Read Mode',
  'Relational Write Queue','Đẩy dữ liệu chính thức','Relational + Realtime','Milk Identity Doctor'
];
for (const label of removed) ok('Cloud Sync không còn UI: '+label, !html.includes(label));
ok('version UI đã lên V15.1.0', html.includes('V15.1.0'));

console.log(`\nKết quả: ${pass} PASS / ${fail} FAIL`);
if (fail) process.exit(1);
