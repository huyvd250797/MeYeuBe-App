import {json,test,setup,CORS} from '../_shared/notification-worker.ts';
// Existing Sync ID capability model; automatic reminders are never accepted from clients.
Deno.serve(async(req:Request)=>{if(req.method==='OPTIONS')return new Response('ok',{headers:CORS});if(req.method!=='POST')return json({ok:false,error:'POST_ONLY'},405);try{setup();return await test(await req.json())}catch(e){console.error('Push test failed',e instanceof Error?e.message:'TEST_FAILED');return json({ok:false,error:'PUSH_TEST_FAILED_CHECK_SERVER_CONFIG'},500)}});
