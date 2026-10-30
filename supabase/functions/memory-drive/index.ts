// One owner Drive, shared app records. Intentionally no family authentication.
// All secrets live in Edge environment. Client may only address registered memories.
const API=17181;
const MAX=5*1024*1024;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const env=(k:string)=>{const v=Deno.env.get(k);if(!v)throw Error('Chưa cấu hình '+k);return v};
let cached:{token:string,until:number}|undefined;
async function token(){if(cached&&cached.until>Date.now())return cached.token;const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({client_id:env('GOOGLE_CLIENT_ID'),client_secret:env('GOOGLE_CLIENT_SECRET'),refresh_token:env('GOOGLE_REFRESH_TOKEN'),grant_type:'refresh_token'})});const j=await r.json();if(!r.ok)throw Error('Drive cần quản trị viên cấp quyền lại.');cached={token:j.access_token,until:Date.now()+(j.expires_in-90)*1000};return cached.token}
async function drive(path:string,init:RequestInit={}){const h=new Headers(init.headers);h.set('Authorization','Bearer '+await token());const r=await fetch('https://www.googleapis.com/'+path,{...init,headers:h,signal:AbortSignal.timeout(45000)});if(r.status===404&&init.method==='DELETE')return r;if(!r.ok){await r.body?.cancel();throw Error('Google Drive từ chối thao tác ('+r.status+'). Kiểm tra dung lượng/quyền chia sẻ.')}return r}
async function db(path:string,body?:unknown){const r=await fetch(env('SUPABASE_URL')+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:env('SUPABASE_SERVICE_ROLE_KEY'),Authorization:'Bearer '+env('SUPABASE_SERVICE_ROLE_KEY'),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();if(!r.ok){const e=Error(j.message||'Chưa cập nhật database Kỷ niệm hoặc database đang lỗi.');(e as any).safeToEdit=r.status<500;throw e}return j}
async function bounded(req:Request){const reader=req.body?.getReader();if(!reader)throw Error('Thiếu nội dung');const parts:Uint8Array[]=[];let n=0;while(true){const x=await reader.read();if(x.done)break;n+=x.value.length;if(n>MAX+32768){await reader.cancel();throw Error('Ảnh tối đa 5 MiB')}parts.push(x.value)}const b=new Uint8Array(n);let o=0;for(const p of parts){b.set(p,o);o+=p.length}return b}
function valid(p:any){if(!uuid.test(p.id)||!uuid.test(p.op)||!Number.isInteger(p.expected)||p.expected<0)throw Error('Mã thao tác không hợp lệ');if(p.action==='delete')return;
 const d=p.data;if(!d||typeof d.title!=='string'||!d.title.trim()||d.title.length>120||typeof d.note!=='string'||d.note.length>2000||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||new Date(d.date+'T00:00:00Z').toISOString().slice(0,10)!==d.date)throw Error('Tên/ngày/lời nhắn không hợp lệ');
 if(String(d.babyName||'').length>100||String(d.birthDate||'').length>10||!['simple','pink','blue'].includes(d.theme))throw Error('Thông tin thẻ không hợp lệ');}
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin')||'',allowed=(Deno.env.get('MEMORY_ALLOWED_ORIGINS')||'').split(',').map(s=>s.trim());
 const cors={'Access-Control-Allow-Origin':allowed.includes(origin)?origin:'null','Vary':'Origin','Access-Control-Allow-Headers':'content-type,apikey,authorization','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store'};
 const reply=(j:unknown,status=200)=>new Response(JSON.stringify({...j as object,apiVersion:API}),{status,headers:{...cors,'Content-Type':'application/json'}});
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});
 // Origin restriction reduces accidental browser use; intentionally not user authentication.
 if(origin&&!allowed.includes(origin))return reply({ok:false,message:'Tên miền chưa được phép.'},403);
 let albumOnly=false,beginSent=false,claimed=false,op='',worker=crypto.randomUUID();
 try{
 const u=new URL(req.url),action=u.searchParams.get('action');
 if(req.method==='GET'&&action==='capabilities')return reply({ok:true,replaceInPlace:true,deleteDrive:true,albumVersion:17190});
 if(req.method==='GET'&&action==='list'){const rows=await db('myb_memories_v17180?deleted=eq.false&order=data->>date.desc,id.desc&limit=501');return reply({ok:true,items:rows})}
 if(req.method==='GET'&&action==='image'){
 const id=u.searchParams.get('id')||'';if(!uuid.test(id))throw Error('ID không hợp lệ');const rows=await db('myb_memories_v17180?id=eq.'+id+'&deleted=eq.false');const pending=await db('myb_memory_jobs_v17181?memory_id=eq.'+id+'&result=is.null');if(pending.length)throw Error('Ảnh đang được cập nhật. Thử lại sau.');const file=rows[0]?.data?.fileId;if(!file)throw Error('Không còn ảnh');
 const r=await drive('drive/v3/files/'+encodeURIComponent(file)+'?alt=media');const type=r.headers.get('content-type')||'';if(!['image/jpeg','image/png','image/webp'].includes(type)){await r.body?.cancel();throw Error('Ảnh không hỗ trợ')}
 return new Response(r.body,{headers:{...cors,'Content-Type':type,'X-Content-Type-Options':'nosniff'}});
 }
 if(req.method!=='POST')return reply({ok:false,message:'Yêu cầu không hỗ trợ'},405);
 const bytes=await bounded(req),ct=req.headers.get('content-type')||'';let p:any,file:File|undefined;
 if(ct.includes('multipart/form-data')){const f=await new Response(bytes,{headers:{'Content-Type':ct}}).formData();p=JSON.parse(String(f.get('meta')));const v=f.get('file');if(v instanceof File)file=v}else p=JSON.parse(new TextDecoder().decode(bytes));
 if(p.action==='album-read'){if(JSON.stringify(p.query||{}).length>4000)throw Error('Bộ lọc quá dài.');return reply({...await db('rpc/myb_album_read_v17190',{p_query:p.query||{}}),albumVersion:17190})}
 if(p.action==='album-write'){
  if(!uuid.test(p.op)||!p.command||JSON.stringify(p.command).length>32768||p.albumVersion!==17190)throw Error('Thao tác album không hợp lệ.');
  const old=await db('myb_album_ops_v17190?id=eq.'+p.op);
  if(!old.length){const allowed=await db('rpc/myb_memory_budget_v17180',{p_limit:Number(Deno.env.get('MEMORY_DAILY_WRITES')||200)});if(!allowed)throw Error('Đã đạt giới hạn thao tác hôm nay.')}
  albumOnly=true;beginSent=true;const result=await db('rpc/myb_album_write_v17190',{p_op:p.op,p_command:p.command});return reply({...result,albumVersion:17190},result.ok?200:409);
 }
 if(!['save','delete'].includes(p.action))throw Error('Thao tác không hợp lệ');valid(p);

 if(p.apiVersion!==API)throw Error('Cập nhật app V17.18.1 trước khi lưu/xóa ảnh.');
 if(file&&p.removeImage)throw Error('Chọn thay ảnh hoặc xóa ảnh, không chọn đồng thời.');
 let bytesFile:Uint8Array|undefined,sha='';
 if(file){if(file.size<1||file.size>MAX||file.type!=='image/jpeg')throw Error('Ảnh JPEG tối đa 5 MiB.');bytesFile=new Uint8Array(await file.arrayBuffer());if(bytesFile[0]!==255||bytesFile[1]!==216||bytesFile[2]!==255)throw Error('Ảnh không hợp lệ');sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytesFile))).map(x=>x.toString(16).padStart(2,'0')).join('')}
 if(p.albumIds!==undefined&&(!Array.isArray(p.albumIds)||p.albumIds.length>20||p.albumIds.some((x:unknown)=>typeof x!=='string'||!uuid.test(x))))throw Error('Tối đa 20 album hợp lệ mỗi lần lưu.');
 const canonical={id:p.id,expected:p.expected,action:p.action,data:p.action==='delete'?null:{title:p.data.title.trim(),date:p.data.date,note:p.data.note,babyName:String(p.data.babyName||''),birthDate:String(p.data.birthDate||''),theme:p.data.theme},removeImage:!!p.removeImage&&!file,sha,...(p.albumIds!==undefined?{albumIds:p.albumIds}:{})};
 const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(canonical))))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const replay=await db('myb_memory_ops_v17180?id=eq.'+p.op);if(replay.length){if(replay[0].result.id!==p.id)throw Error('Mã thao tác không khớp');return reply(replay[0].result)}
 const budget=await db('rpc/myb_memory_budget_v17180',{p_limit:Number(Deno.env.get('MEMORY_DAILY_WRITES')||200)});if(!budget)throw Error('Đã đạt giới hạn thao tác hôm nay.');
 op=p.op;beginSent=true;const begun=await db('rpc/myb_memory_job_v17181',{p_mode:'begin',p_op:op,p_payload:{...canonical,fingerprint},p_worker:worker});
 if(!begun.ok||!begun.job)return reply(begun,begun.ok?200:409);claimed=true;
 const old=begun.job.base?.data||{},data={...canonical.data,fileId:old.fileId||''};
 const folder=env('GOOGLE_DRIVE_FOLDER_ID');if(!/^[a-zA-Z0-9_-]+$/.test(folder))throw Error('Folder ID không hợp lệ');
 async function owned(id:string){const meta=await(await drive('drive/v3/files/'+encodeURIComponent(id)+'?fields=id,parents,trashed')).json();if(!meta.parents?.includes(folder)||meta.trashed)throw Error('Ảnh không còn trong thư mục Drive đã cấu hình.')}
 if((p.action==='delete'||canonical.removeImage)&&old.fileId){
 // A retry after lost DELETE acknowledgement must accept an already absent file.
 try{await owned(old.fileId)}catch(e){const check=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(old.fileId)+'?fields=id',{headers:{Authorization:'Bearer '+await token()},signal:AbortSignal.timeout(45000)});if(check.status!==404){await check.body?.cancel();throw e}}
 await drive('drive/v3/files/'+encodeURIComponent(old.fileId),{method:'DELETE'});data.fileId='';
 }
 if(file&&p.action!=='delete'){
 let id=old.fileId||'';
 if(id){await owned(id);await drive('upload/drive/v3/files/'+encodeURIComponent(id)+'?uploadType=media&fields=id',{method:'PATCH',headers:{'Content-Type':'image/jpeg'},body:file})}
 else{
 const q="trashed=false and '"+folder+"' in parents and appProperties has { key='memoryOp' and value='"+p.op+"' }";
 const found=await(await drive('drive/v3/files?q='+encodeURIComponent(q)+'&fields=files(id)')).json();id=found.files?.[0]?.id;
 if(!id){const boundary='myb_'+crypto.randomUUID(),meta=JSON.stringify({name:'memory-'+p.id+'.jpg',parents:[folder],appProperties:{memoryOp:p.op}}),body=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+meta+'\r\n--'+boundary+'\r\nContent-Type: image/jpeg\r\n\r\n',file,'\r\n--'+boundary+'--']);id=(await(await drive('upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body})).json()).id}
 }
 let perms=await(await drive('drive/v3/files/'+id+'/permissions?fields=permissions(id,type,role)')).json();
 if(!perms.permissions?.some((x:any)=>x.type==='anyone'&&x.role==='reader')){const existing=perms.permissions?.find((x:any)=>x.type==='anyone');await drive('drive/v3/files/'+id+'/permissions'+(existing?.id?'/'+existing.id:''),{method:existing?.id?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(existing?.id?{role:'reader',allowFileDiscovery:false}:{type:'anyone',role:'reader',allowFileDiscovery:false})});perms=await(await drive('drive/v3/files/'+id+'/permissions?fields=permissions(type,role)')).json()}
 if(!perms.permissions?.some((x:any)=>x.type==='anyone'&&x.role==='reader'))throw Error('Chưa xác nhận quyền công khai');
 data.fileId=id;
 }
 const result=await db('rpc/myb_memory_job_v17181',{p_mode:'finish',p_op:op,p_payload:{data},p_worker:worker});claimed=false;const confirmed=result.ok?(await db('myb_memory_ops_v17180?id=eq.'+op))[0]?.result||result:result;return reply(confirmed,confirmed.ok?200:409);
 }catch(e){if(claimed){try{await db('rpc/myb_memory_job_v17181',{p_mode:'release',p_op:op,p_worker:worker})}catch(ignore){}}return reply({ok:false,safeToEdit:!beginSent||(albumOnly&&(e as any)?.safeToEdit===true),message:e instanceof Error?e.message:'Không xử lý được kỷ niệm. Giữ form và thử lại.'},400)}
});
