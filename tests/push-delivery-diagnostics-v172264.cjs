/* V17.22.64 diagnostics contract tests: no Supabase credentials or network required. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const server=fs.readFileSync(path.join(root,'supabase/functions/_shared/notification-worker.ts'),'utf8');
const client=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const fnBetween=(src,beg,end)=>{const i=src.indexOf(beg);assert.ok(i!==-1,'missing '+beg);const j=end?src.indexOf(end,i):src.length;assert.ok(j!==-1,'missing '+end);return src.slice(i,j)};
const classifyCode=fnBetween(server,'export function classifyPushResult(', 'export async function send(').replace(/^export /,'').replace('status:number','status');
const classifyCtx=vm.createContext({});vm.runInContext(classifyCode+'\nglobalThis.classify=classifyPushResult;',classifyCtx);
for(const [status,code] of [[201,'PUSH_ACCEPTED'],[401,'PUSH_AUTH_REJECTED'],[403,'PUSH_AUTH_REJECTED'],[404,'SUBSCRIPTION_EXPIRED'],[410,'SUBSCRIPTION_EXPIRED'],[429,'PUSH_RATE_LIMITED'],[408,'PUSH_TIMEOUT'],[504,'PUSH_TIMEOUT'],[0,'PUSH_NETWORK_ERROR'],[503,'PUSH_SERVICE_UNAVAILABLE'],[413,'PUSH_PAYLOAD_REJECTED']]){
  assert.equal(classifyCtx.classify(status).code,code,'HTTP '+status);
}
const sends=fnBetween(server,'export async function send(', 'export async function run(').replace(/^export /,'').replace('sub:any,a:any,detail?:any','sub,a,detail').replace('catch(e:any)','catch(e)');
const makePushCtx=(status,claim={ok:true,token:'lease'},onAck=()=>{})=>{
  const ctx={
    R:{accepted:()=>true,text:(x,fb)=>x||fb},
    rpc:async (name,args)=>{if(name.includes('claim_'))return claim;onAck(name,args);return {ok:true}},
    webpush:{sendNotification:async(sub)=>{if(status!==201){const error=Error('sensitive upstream body');error.statusCode=status;throw error}return {}}},
    console:{warn:()=>{}},Date,Math,JSON,Number,String,Object,Error
  };
  vm.createContext(ctx);
  vm.runInContext(classifyCode+sends+'\nglobalThis.invokeSend=send;',ctx);
  return ctx;
};
const sub={id:'uuid',endpoint:'https://example.example/push/PRIVATE',p256dh:'SECRETKEY',auth:'SECRET',alert_types:{}};
const alert={rule_id:'test',event_key:'test:1',expires_at:new Date(Date.now()+60000).toISOString(),title:'test',body:'test',severity:'info'};
(async()=>{
  for(const status of [201,403,404,410,429,503,0]){
    let ackCode=null;
    const ctx=makePushCtx(status,undefined,(name,args)=>{ackCode=args.p_status});const d={};
    const result=await ctx.invokeSend(sub,alert,d);
    assert.equal(result,status===201?'sent':[404,410].includes(status)?'expired':'failed');
    assert.equal(ackCode,status);
    assert.equal(d.status,status);
    assert.ok(!JSON.stringify(d).includes('PRIVATE')&&!JSON.stringify(d).includes('SECRET'));
  }
  const skipped={};const c=makePushCtx(201,{ok:false,reason:'sent'});
  assert.equal(await c.invokeSend(sub,alert,skipped),'skipped');
  assert.equal(skipped.code,'ALREADY_PROCESSED');
  const sanitizer=fnBetween(client,'function pushSafeLogText(', 'function pushDiagnosticEntries(');
  const sctx=vm.createContext({});vm.runInContext(sanitizer+'globalThis.safe=pushSafeLogText;',sctx);
  const scrubbed=sctx.safe('endpoint=https://push.example/private-token apikey=abcdef https://example.com/?token=abc');
  assert.ok(!scrubbed.includes('private-token')&&!scrubbed.includes('abcdef')&&!scrubbed.includes('https://'));
  for(const id of ['checkPushDeviceDiagnostics','recoverDevicePush','fetchPushServerDiagnostics','copyPushDiagnostics','clearPushDiagnostics']){
    assert.match(client,new RegExp('function '+id+'\\('));assert.match(html,new RegExp(id+'\\('));
  }
  const logs={items:[],cfg:{enabled:true,endpoint:'url'},expired:false};
  const ctx=vm.createContext({
    pushLog:(x,type)=>logs.items.push([x,type]),loadPushConfig:()=>logs.cfg,
    savePushConfig:(c)=>{logs.cfg=c;logs.expired=!!c.expired},renderPushConfig:()=>{},pushDiagnosis:(d)=>d.code
  });
  const diag=fnBetween(client,'function pushDiagnoseTestResult(', 'async function checkPushDeviceDiagnostics(');
  vm.runInContext(diag+'globalThis.handle=pushDiagnoseTestResult;',ctx);
  ctx.handle({matched_subscriptions:1,sent:0,failed:0,expired:1,skipped:0,diagnostics:[{code:'SUBSCRIPTION_EXPIRED',status:410}]},true);
  assert.equal(logs.expired,true);
  assert.ok(logs.items.some(([text])=>text.includes('SUBSCRIPTION_EXPIRED')));
  assert.ok(!logs.items.some(([text])=>text.includes('đã tiếp nhận 1')));
  assert.match(server,/deliveryDiagnostics\(body:any\)/);
  const historyCode=fnBetween(server,'export async function deliveryDiagnostics(', 'export async function test(')
      .replace(/^export /,'').replace('body:any','body').replace('(x:any)','(x)');
  const networkCalls=[];
  const hCtx=vm.createContext({env:(k)=>k==='SUPABASE_URL'?'https://myproject.supabase.co':'PRIVATE-SERVICE-ROLE',
    fetch:async(url)=>{networkCalls.push(String(url));const rows=networkCalls.length===1?
      [{id:'subscription-uuid',endpoint:'https://private.endpoint'}]:
      [{updated_at:'2026-11-24T15:00:00Z',status_code:410,state:'failed',attempts:1,event_key:'private-event',endpoint:'https://private.endpoint'}];
      return {ok:true,json:async()=>rows}},URLSearchParams,AbortSignal,
    json:(value)=>value,String,Number,Date,Error});
  vm.runInContext(historyCode+'globalThis.readServerHistory=deliveryDiagnostics;',hCtx);
  const history=await hCtx.readServerHistory({sync_id:'family',target_endpoint:'https://private.endpoint'});
  assert.equal(history.found,true);assert.equal(history.deliveries.length,1);
  assert.equal(history.deliveries[0].status,410);
  assert.ok(!JSON.stringify(history).includes('private-event')&&!JSON.stringify(history).includes('PRIVATE-SERVICE-ROLE')&&!JSON.stringify(history).includes('private.endpoint'));
  assert.equal(networkCalls.length,2);
  assert.match(fs.readFileSync(path.join(root,'supabase/functions/send-push/index.ts'),'utf8'),/body\.mode==='diagnostics'/);
  assert.match(server,/select:'updated_at,status_code,state,attempts'/);
  console.log('PASS V17.22.64 Push Diagnostics: 11 HTTP categories, 7 send scenarios, claims, redaction, UI, expiry, server history');
})().catch(e=>{console.error(e);process.exitCode=1});
