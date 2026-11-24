import webpush from "npm:web-push@3.6.7";
import './notification-rules.js';
const R=(globalThis as any).MybNotificationRules;
export const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'authorization, x-client-info, apikey, content-type, x-myb-cron-secret','access-control-allow-methods':'POST, OPTIONS'};
export function json(x:any,status=200){return new Response(JSON.stringify(x),{status,headers:{...CORS,'content-type':'application/json; charset=utf-8'}})}
function env(k:string){return Deno.env.get(k)||''}
export async function rpc(name:string,p:any){const key=env('SUPABASE_SERVICE_ROLE_KEY');const res=await fetch(env('SUPABASE_URL').replace(/\/+$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(p),signal:AbortSignal.timeout(8000)});if(!res.ok)throw Error('DATABASE_'+res.status);return res.json()}
export function setup(){const pub=env('VAPID_PUBLIC_KEY'),priv=env('VAPID_PRIVATE_KEY');if(!pub||!priv||!env('SUPABASE_SERVICE_ROLE_KEY'))throw Error('MISSING_SERVER_CONFIG');try{webpush.setVapidDetails(env('VAPID_SUBJECT')||'mailto:admin@example.com',pub,priv)}catch(_){throw Error('INVALID_VAPID_CONFIG')}}
export function authorized(req:Request){const a=env('MYB_CRON_SECRET'),b=req.headers.get('x-myb-cron-secret')||'';if(a.length<32||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
export async function subscriptions(sync:string,after=''){const key=env('SUPABASE_SERVICE_ROLE_KEY'),q=new URLSearchParams({select:'id,endpoint,p256dh,auth,alert_types',sync_id:'eq.'+sync,enabled:'eq.true',deleted_at:'is.null',order:'id.asc',limit:'200'});if(after)q.set('id','gt.'+after);const res=await fetch(env('SUPABASE_URL').replace(/\/+$/,'')+'/rest/v1/push_subscriptions?'+q,{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(8000)});if(!res.ok)throw Error('SUBSCRIPTIONS_'+res.status);return res.json()}
// V17.22.64: diagnostic codes are deliberately sanitized. Never return endpoint,
// push keys, VAPID secret, upstream response body, or family/device identifiers.
export function classifyPushResult(status:number){
 if(status>=200&&status<300)return {code:'PUSH_ACCEPTED',message:'Dịch vụ Push đã tiếp nhận thông báo (chưa xác nhận thiết bị hiển thị).',recovery:'none'};
 if(status===404||status===410)return {code:'SUBSCRIPTION_EXPIRED',message:'Đăng ký thông báo trên thiết bị không còn hiệu lực.',recovery:'resubscribe'};
 if(status===401||status===403)return {code:'PUSH_AUTH_REJECTED',message:'Dịch vụ Push từ chối xác thực. Kiểm tra cặp khóa VAPID trên Supabase.',recovery:'check_vapid'};
 if(status===429)return {code:'PUSH_RATE_LIMITED',message:'Dịch vụ Push đang giới hạn tần suất gửi.',recovery:'retry_later'};
 if(status===408||status===504)return {code:'PUSH_TIMEOUT',message:'Dịch vụ Push phản hồi quá chậm.',recovery:'retry_later'};
 if(status===400||status===413)return {code:'PUSH_PAYLOAD_REJECTED',message:'Dịch vụ Push từ chối yêu cầu hoặc nội dung thông báo.',recovery:'check_server'};
 if(status>=500&&status<600)return {code:'PUSH_SERVICE_UNAVAILABLE',message:'Dịch vụ Push tạm thời gặp lỗi.',recovery:'retry_later'};
 if(status===0)return {code:'PUSH_NETWORK_ERROR',message:'Không kết nối được tới dịch vụ Push hoặc yêu cầu đã hết thời gian chờ.',recovery:'check_server'};
 return {code:'PUSH_HTTP_'+String(status),message:'Dịch vụ Push trả về lỗi HTTP '+String(status)+'.',recovery:'check_server'};
}
export async function send(sub:any,a:any,detail?:any){
 if(!R.accepted(sub.alert_types,a.rule_id)){
  if(detail)Object.assign(detail,{code:'FILTERED',message:'Thiết bị đã tắt loại cảnh báo này.',status:0,recovery:'none'});
  return 'filtered';
 }
 const claim=await rpc('myb_notification_claim_v1660',{p_subscription_id:sub.id,p_event_key:a.event_key,p_expires_at:a.expires_at});
 if(!claim.ok){
  const reason=String(claim.reason||'pending');
  const duplicate=['sent','sending','pending','failed'].includes(reason);
  if(detail)Object.assign(detail,{code:duplicate?'ALREADY_PROCESSED':'CLAIM_'+reason.toUpperCase(),message:duplicate?'Thông báo đã gửi/đang xử lý trong cùng khung phút. Hãy đợi sang phút tiếp theo.':reason==='expired'?'Thông báo đã hết hạn.':'Không thể gửi do thiết bị hoặc lượt gửi không còn hợp lệ.',status:0,recovery:duplicate?'retry_next_minute':'none'});
  return 'skipped';
 }
 let code=201;
 try{
  await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth}},JSON.stringify({title:R.text(a.title,'Mẹ Yêu Bé'),body:R.text(a.body),icon:'./icon-192.png',badge:'./icon-192.png',tag:a.event_key,renotify:false,url:a.url||'./index.html?openAlertCenter=1',ruleId:a.rule_id,eventKey:a.event_key}),{TTL:Math.max(1,Math.min(900,Math.ceil((Date.parse(a.expires_at)-Date.now())/1000))),urgency:a.severity==='critical'?'high':'normal',timeout:5000});
 }catch(e:any){code=Number(e?.statusCode||e?.status)||0}
 const classification=classifyPushResult(code);
 // Persist the HTTP status in existing deliveries table. Do not log recipient details.
 const ack=await rpc('myb_notification_ack_v1660',{p_subscription_id:sub.id,p_event_key:a.event_key,p_token:claim.token,p_status:code});
 if(!ack.ok)throw Error('DELIVERY_ACK_LOST');
 if(detail)Object.assign(detail,{status:code,...classification});
 if(code<200||code>=300)console.warn('MYB_PUSH_DELIVERY',classification.code,'HTTP',code);
 return code>=200&&code<300?'sent':code===404||code===410?'expired':'failed';
}
export async function run(){const start=Date.now(),lease=await rpc('myb_notification_run_v1660',{p_action:'begin'});if(!lease.ok)return {ok:true,busy:true};const tally:any={sent:0,failed:0,expired:0,skipped:0,filtered:0,checked:0,partial:false};const args=(action:string,summary:any,sync?:string)=>({p_action:action,p_token:lease.token,p_summary:summary,p_sync_id:sync||null});try{
 const families=await rpc('myb_notification_families_v1660',{p_cursor:lease.cursor});
 outer:for(const f of families){let after='',count:any={sent:0,failed:0,expired:0,skipped:0,filtered:0};while(true){if(Date.now()-start>40000){tally.partial=true;break outer}const subs=await subscriptions(f.sync_id,after);if(!subs.length)break;
 for(const sub of subs){if(Date.now()-start>40000||tally.sent+tally.failed+tally.expired>=80){tally.partial=true;break outer}
 // Re-read native data per device: completed/cancelled/edited rules stop pending retries.
 const source=await rpc('myb_notification_source_v1660',{p_sync_id:f.sync_id});if(!source?.ok)throw Error('SOURCE_NOT_FOUND');
 const alerts=R.evaluate(source,Date.now(),{push:true});for(const a of alerts){if(Date.now()-start>40000||tally.sent+tally.failed+tally.expired>=80){tally.partial=true;break outer}const result=await send(sub,a);tally[result]++;count[result]++}}
 if(subs.length<200)break;after=subs[subs.length-1].id;
 }await rpc('myb_notification_run_v1660',args('checkpoint',count,f.sync_id));tally.checked++;
 }await rpc('myb_notification_run_v1660',args('finish',tally));return {ok:true,...tally};
 }catch(e){await rpc('myb_notification_run_v1660',args('error',tally)).catch(()=>{});throw e}}
// Read the last delivery statuses for one device from the existing server-side
// delivery table. No new SQL migration, no event keys, endpoints or credentials
// are returned to the client.
export async function deliveryDiagnostics(body:any){
 const sync=String(body.sync_id||'').trim(),target=String(body.target_endpoint||'').trim();
 if(!sync||sync.length>200||!target||target.length>4096)return json({ok:false,error:'INVALID_DEVICE_QUERY'},400);
 const key=env('SUPABASE_SERVICE_ROLE_KEY'),base=env('SUPABASE_URL').replace(/\/+$/,'');
 const headers={apikey:key,Authorization:'Bearer '+key};
 const q=new URLSearchParams({select:'id',sync_id:'eq.'+sync,endpoint:'eq.'+target,deleted_at:'is.null',limit:'1'});
 const check=await fetch(base+'/rest/v1/push_subscriptions?'+q,{headers,signal:AbortSignal.timeout(8000)});
 if(!check.ok)throw Error('SUBSCRIPTIONS_'+check.status);
 const subs=await check.json();
 if(!subs.length)return json({ok:true,found:false,deliveries:[],message:'DEVICE_SUBSCRIPTION_NOT_FOUND'});
 const d=new URLSearchParams({select:'updated_at,status_code,state,attempts',subscription_id:'eq.'+subs[0].id,order:'updated_at.desc',limit:'20'});
 const res=await fetch(base+'/rest/v1/myb_notification_deliveries_v1660?'+d,{headers,signal:AbortSignal.timeout(8000)});
 if(!res.ok)throw Error('DATABASE_'+res.status);
 const rows=await res.json();
 return json({ok:true,found:true,deliveries:(rows||[]).map((x:any)=>({time:x.updated_at,status:Number(x.status_code)||0,state:String(x.state||'unknown'),attempts:Number(x.attempts)||0})),
  notice:'PUSH_SERVICE_ACCEPTANCE_ONLY'});
}
export async function test(body:any){
 if(body.mode!=='test')return json({ok:false,error:'AUTOMATIC_ALERTS_RUN_ON_SERVER'},409);
 const sync=String(body.sync_id||'').trim();
 if(!sync||sync.length>200)return json({ok:false,error:'INVALID_SYNC_ID'},400);
 const source=await rpc('myb_notification_source_v1660',{p_sync_id:sync});
 if(!source?.ok)return json({ok:false,error:'FAMILY_NOT_FOUND'},404);
 let matched=0,sent=0,failed=0,skipped=0,expired=0,filtered=0;
 const diagnoses:any[]=[],now=Date.now();
 const a={rule_id:'test',event_key:'test:'+Math.floor(now/60000),expires_at:new Date(now+60000).toISOString(),title:'Mẹ Yêu Bé',body:'Thông báo thử từ Mẹ Yêu Bé. Nếu đọc được tin này, thiết bị đã hiển thị Push.',severity:'info'};
 let after='';
 do{
  const list=await subscriptions(sync,after);
  for(const s of list){
   if(body.target_endpoint&&s.endpoint!==body.target_endpoint)continue;
   matched++;if(matched>80)break;
   const detail:any={};
   const result=await send(s,a,detail);
   if(result==='sent')sent++;
   else if(result==='failed')failed++;
   else if(result==='expired')expired++;
   else if(result==='filtered')filtered++;
   else skipped++;
   if(result!=='sent'&&diagnoses.length<8)diagnoses.push({code:detail.code||'UNKNOWN',status:detail.status||0,message:detail.message||'Chưa xác định được nguyên nhân.',recovery:detail.recovery||'check_server'});
  }
  if(list.length<200||matched>80)break;
  after=list[list.length-1].id;
 }while(true);
 return json({ok:true,matched_subscriptions:Math.min(matched,80),sent,failed,expired,skipped,filtered,diagnostics:diagnoses,
  accepted_by_push_service:sent,delivered_to_device:'not_verifiable',
  retry_after_seconds:60-Math.floor((now%60000)/1000)});
}
