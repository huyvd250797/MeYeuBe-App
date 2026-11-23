const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const read=(f)=>fs.readFileSync(f,'utf8');
let calls=[],ack=null,remote={id:'b1',name:'Thủy tinh vàng',kind:'binh',capacity:150,capacityMl:150,note:'',active:true,updatedAt:'2026-11-23T00:00:00Z'};
let operation=null;
const mock={console,window:null,JSON,Number,String,Boolean,
  mybCatalogBridge:{begin:async()=> 's1',end:()=>{},acceptWrite:(k,r)=>{ack=r}},
  cloudDeviceId:()=> 'd1',
  mybDataClient:{invalidateReads:()=>{calls.push('invalidate')},request:async(n,args)=>{
    calls.push(n);
    if(n==='myb_catalog_list_v1530')return {target:'s1',data:{items:[remote]}};
    if(n==='myb_catalog_write_v1530'){
      operation=args;
      // The refreshed expectation preserves the remote metadata; ACK is
      // issued only when test persistence is switched on.
      if(args.p_data.capacity===270&&mock.persist){
        remote={...remote,capacity:270,capacityMl:270};
      }
      return {target:'s1',data:{items:[remote],changes:[{entity:'milk_container',op:'upsert',source_id:'b1',data:remote}]}};
    }
    throw new Error('Unexpected RPC '+n);
  }}
};mock.window=mock;
vm.runInNewContext(read('src/data/catalog-repository.js'),mock);
const before={id:'b1',name:'Thủy tinh vàng',kind:'binh',capacity:150,capacityMl:150,note:'',active:true,updatedAt:'old metadata'};
const edited={name:'Thủy tinh vàng',kind:'binh',capacity:270,note:'',active:true};
(async()=>{
  let n=0;
  mock.persist=false;
  await assert.rejects(()=>mock.mybCatalogRepository.write('milk_container','update','b1',edited,before),/Database chưa xác nhận/);n++;
  assert.equal(operation.p_expected.updatedAt,'2026-11-23T00:00:00Z');n++;
  assert.equal(ack,null);n++;
  mock.persist=true;await mock.mybCatalogRepository.write('milk_container','update','b1',edited,before);
  assert.equal(remote.capacity,270);n++;
  assert.equal(ack.items[0].capacity,270);n++;
  let prevCount=calls.filter(x=>x==='myb_catalog_write_v1530').length;
  await assert.rejects(()=>mock.mybCatalogRepository.write('milk_container','update','b1',{...edited,capacity:300},before),/thiết bị khác/);
  assert.equal(calls.filter(x=>x==='myb_catalog_write_v1530').length,prevCount);n++;
  const ui=read('src/features/catalog/ui.js');
  const html=read('index.html');const css=read('src/styles/legacy.css');
  assert.match(ui,/openMilkSheet\(\)/);n++;
  assert.match(ui,/slot.appendChild\(card\)/);n++;
  assert.match(ui,/closeMilkSheet/);n++;
  assert.match(html,/id="mcEditSheet"/);n++;
  assert.match(html,/id="mcEditorCard"/);n++;
  assert.match(css,/overflow:auto/);n++;
  const sql=read('supabase/migrations/20261123_1760_catalog_update_conflict_fix.sql');
  assert.match(sql,/user-editable catalog fields/);n++;
  assert.match(sql,/capacityMl/);n++;
  assert.doesNotMatch(sql,/p_expected is distinct from old/);n++;
  assert.match(sql,/raise exception 'CONFLICT: Bình\/túi/);n++;
  console.log('PASS '+n+' assertions: fresh catalog preflight, read-back confirmation, concurrent edit protection, modal portal, SQL guards');
})().catch(e=>{console.error(e);process.exitCode=1});
