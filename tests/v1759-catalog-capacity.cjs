const fs=require('fs');
const vm=require('vm');
const assert=require('node:assert/strict');
const read=(p)=>fs.readFileSync(p,'utf8');
const warnings=[];
const pumpCtx={Number, String, console};
const app=read('app.js');
const a=app.indexOf('function mybPumpCapacityMessage(');
const b=app.indexOf('function getCareEventFromForm(db){',a);
assert(a>=0&&b>a);
vm.runInNewContext(app.slice(a,b),pumpCtx);
const good={id:'b1',name:'Thủy tinh vàng',kind:'binh',capacity:150,capacityMl:150};
const message=pumpCtx.mybPumpCapacityMessage(good,250);
assert.match(message,/Thủy tinh vàng/);
assert.match(message,/150 ml/);
assert.match(message,/250 ml/);
assert.match(message,/100 ml/);
assert.equal(pumpCtx.mybPumpCapacityMessage(good,150),'');
assert.equal(pumpCtx.mybPumpCapacityMessage({kind:'tui',capacity:0},250),'');
assert.equal(pumpCtx.mybPumpCapacityMessage({kind:'binh',capacity:0,capacityMl:150},250),'');
console.log('PASS actionable pump capacity warning, equality and unlimited case');
let accepted=null, reads=[];let persisted={id:'b1',name:'Thủy tinh vàng',kind:'binh',capacity:150,capacityMl:150,note:'',active:true};
const client={
 mybCatalogBridge:{begin:async()=> 'sync',end:()=>{},acceptWrite:(kind,body)=>{accepted={kind,body}}},
 mybDataClient:{request:async(name,args)=>{
  reads.push(name);
  if(name==='myb_catalog_write_v1530')return {target:'sync',data:{items:[persisted],changes:[{entity:'milk_container',op:'upsert'}]}};
  return {target:'sync',data:{items:[persisted]}};
 }},
 cloudDeviceId:()=> 'test-device',window:null,console};
client.window=client;
vm.runInNewContext(read('src/data/catalog-repository.js'),client);
(async()=>{
 const want={name:'Thủy tinh vàng',kind:'binh',capacity:250,note:'',active:true};
 await assert.rejects(client.mybCatalogRepository.write('milk_container','update','b1',want,persisted),/Database chưa (?:cập nhật|xác nhận)/);
 assert.equal(accepted,null);
 console.log('PASS stale server data cannot report successful catalog save');
 persisted={...persisted,capacity:250,capacityMl:250};
 await client.mybCatalogRepository.write('milk_container','update','b1',want,{...persisted});
 assert.equal(accepted.body.items[0].capacity,250);
 assert.deepEqual(reads.slice(-2),['myb_catalog_write_v1530','myb_catalog_list_v1530']);
 console.log('PASS durable read-after-write and local ACK');
 persisted={...persisted,capacityMl:150};accepted=null;
 await assert.rejects(client.mybCatalogRepository.write('milk_container','update','b1',want,persisted),/Database chưa (?:cập nhật|xác nhận)/);
 console.log('PASS mismatched capacityMl detected');
 const ctx={window:null,console,load:()=>({milkContainers:[{id:'b1',name:'Thủy tinh vàng',kind:'binh',capacity:150}]}),mybPumpCapacityMessage:pumpCtx.mybPumpCapacityMessage};ctx.window=ctx;
 vm.runInNewContext(read('src/features/care/service.js'),ctx);
 assert.throws(()=>ctx.mybCareService.validate({id:'e1',type:'pump',date:'2026-11-23',amount:250,extra:{containerId:'b1'}}),/chỉ chứa tối đa/);
 assert.doesNotThrow(()=>ctx.mybCareService.validate({id:'e1',type:'pump',date:'2026-11-23',amount:120,extra:{containerId:'b1'}}));
 console.log('PASS care-service validation rejects overflow before RPC');
 const sql=read('supabase/migrations/20261123_1759_catalog_capacity_consistency.sql');
 assert.match(sql,/capacityMl/);assert.match(sql,/myb_catalog_write_v1530/);assert.match(sql,/Database|DATABASE_ERROR/);
 console.log('PASS SQL migration contains consistent fields and DB verification');
})().catch(e=>{console.error(e);process.exitCode=1});
