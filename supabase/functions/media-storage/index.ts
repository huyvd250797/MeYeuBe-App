// Server only. Same Sync ID capability model as existing MeYeuBe RPCs, not account authentication.
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const MAX=10485760;
const types=new Set(['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
const hash=async(b:ArrayBuffer)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(x=>x.toString(16).padStart(2,'0')).join('');
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 if(req.method!=='POST')return reply({ok:false,message:'POST required'},405);
 try{
  // Bound the actual streamed body before parsing, including clients without Content-Length.
  const reader=req.body?.getReader();if(!reader)throw new Error('Thiếu dữ liệu');
  const chunks:Uint8Array[]=[];let length=0;while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>MAX+65536){await reader.cancel();throw new Error('File tối đa 10 MiB')}chunks.push(value)}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  const multipart=(req.headers.get('content-type')||'').includes('multipart/form-data');
  let p:any,file:File|undefined;
  if(multipart){const form=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')!}}).formData();p=JSON.parse(String(form.get('meta')));file=form.get('file') as File}else p=JSON.parse(new TextDecoder().decode(bytes));
  if(typeof p.syncId!=='string'||!p.syncId.trim()||p.syncId.length>200||!['upload','open','delete','backup_open','restore_upload'].includes(p.action))throw new Error('Yêu cầu không hợp lệ');
  const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if(!uuid.test(p.memberId)||!uuid.test(p.id))throw new Error('ID không hợp lệ');
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const store=admin.storage.from('myb-media');
  async function access(op:string,meta:unknown={}){const {data,error}=await admin.rpc('myb_media_access_v1640',{p_sync_id:p.syncId,p_member_id:p.memberId,p_id:p.id,p_op:op,p_meta:meta});if(error||!data?.ok)throw new Error(error?.message||'Không truy cập được tệp');return data.item}
  if(p.action==='backup_open'||p.action==='restore_upload'){
   async function backupAccess(op:string){const {data,error}=await admin.rpc('myb_backup_media_v1650',{p_sync_id:p.syncId,p_id:p.id,p_op:op});if(error||!data?.ok)throw new Error(error?.message||'Backup media unavailable');return data.item}
   const row=await backupAccess('read');
   if(row.member_id!==p.memberId)throw new Error('Media owner mismatch');
   if(p.action==='backup_open'){const {data,error}=await store.createSignedUrl(row.path,120,{download:row.file_name});if(error)throw error;return reply({ok:true,url:data.signedUrl,expiresIn:120})}
   if(!file||file.size!==Number(row.size_bytes)||file.size>MAX||file.type!==row.mime)throw new Error('Backup file size/type mismatch');
   const original=await file.arrayBuffer();if(await hash(original)!==row.sha256)throw new Error('Backup file checksum mismatch');
   const up=await store.upload(row.path,original,{contentType:row.mime,upsert:false,cacheControl:'0'});
   const check=await store.download(row.path);if(check.error||!check.data)throw new Error(up.error?.message||'Restore readback failed');
   const bytes=await check.data.arrayBuffer();if(bytes.byteLength!==file.size||await hash(bytes)!==row.sha256)throw new Error('Stored file conflict');
   await backupAccess('ready');return reply({ok:true,id:p.id,sha256:row.sha256});
  }
  if(p.action==='upload'){
   if(!file||typeof file.arrayBuffer!=='function'||file.size<1||file.size>MAX||!types.has(file.type)||file.name.length>200)throw new Error('Loại file không hỗ trợ hoặc vượt 10 MiB');
   const buffer=await file.arrayBuffer(),sha=await hash(buffer);
   const row=await access('begin',{sha256:sha,size:file.size,type:file.type,fileName:file.name});
   // Never overwrite: retries verify bytes already stored, including lost upload acknowledgements.
   const uploaded=await store.upload(row.path,buffer,{contentType:file.type,upsert:false,cacheControl:'0'});
   const check=await store.download(row.path);if(check.error||!check.data)throw new Error(uploaded.error?.message||'Không đọc lại được file');
   const actual=await check.data.arrayBuffer();if(actual.byteLength!==file.size||await hash(actual)!==sha)throw new Error('File trên Cloud không khớp bản gốc');
   await access('ready');return reply({ok:true,item:{mediaId:p.id,storage:'supabase',sha256:sha,size:file.size,type:file.type,fileName:file.name}});
  }
  const row=await access(p.action==='open'?'read':'unlink_check');
  if(p.action==='open'){const {data,error}=await store.createSignedUrl(row.path,120,{download:p.download?row.file_name:undefined});if(error)throw error;return reply({ok:true,url:data.signedUrl,expiresIn:120})}
  // Retain private bytes for Undo/recovery; physical purge belongs to a later retention job.
  return reply({ok:true,retained:true,message:'Đã gỡ liên kết; giữ file riêng tư để phục hồi.'});
 }catch(e){return reply({ok:false,message:e instanceof Error?e.message:'Media Storage chưa sẵn sàng'},400)}
});
