-- V16.6.0 scheduler infrastructure. Run in Supabase SQL Editor as postgres.
-- Core 1660 must be installed first. ASCII / no BOM; no business rows modified.
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;
create or replace function public.myb_notification_tick_v1660() returns bigint
language plpgsql security definer set search_path=public,pg_temp as $$
declare u text;s text;req bigint;begin
 select decrypted_secret into u from vault.decrypted_secrets where name='myb_notification_url_v1660';
 select decrypted_secret into s from vault.decrypted_secrets where name='myb_notification_secret_v1660';
 if u is null or s is null then raise exception 'NOTIFICATION_SCHEDULER_NOT_CONFIGURED';end if;
 select net.http_post(url:=u||'/functions/v1/smart-alert-cron',headers:=jsonb_build_object('Content-Type','application/json','x-myb-cron-secret',s),body:='{}'::jsonb,timeout_milliseconds:=55000) into req;
 update public.myb_notification_runtime_v1660 set last_request_at=clock_timestamp(),last_request_id=req where id;
 return req;
end$$;
create or replace function public.myb_notifications_configure_v1660(p_project_url text,p_cron_secret text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare i uuid;job bigint;begin
 if p_project_url is null or p_cron_secret is null or p_cron_secret !~ '^[A-Za-z0-9_-]{32,200}$' or p_project_url !~ '^https://[a-z0-9-]+\.supabase\.co$' or p_project_url like '%PROJECT%' or length(p_cron_secret)<32 or p_cron_secret like '%PASTE%' then raise exception 'REPLACE_PROJECT_URL_AND_SECRET_FIRST';end if;
 select id into i from vault.secrets where name='myb_notification_url_v1660';
 if i is null then perform vault.create_secret(p_project_url,'myb_notification_url_v1660');else perform vault.update_secret(i,p_project_url);end if;
 select id into i from vault.secrets where name='myb_notification_secret_v1660';
 if i is null then perform vault.create_secret(p_cron_secret,'myb_notification_secret_v1660');else perform vault.update_secret(i,p_cron_secret);end if;
 select cron.schedule('myb-notifications-v1660','* * * * *','select public.myb_notification_tick_v1660();') into job;
 return jsonb_build_object('ok',true,'jobId',job,'schedule','* * * * *');
end$$;
revoke all on function public.myb_notification_tick_v1660() from public,anon,authenticated,service_role;
revoke all on function public.myb_notifications_configure_v1660(text,text) from public,anon,authenticated,service_role;
-- REQUIRED AFTER setting the matching MYB_CRON_SECRET Edge secret and deploying functions.
-- Generate a random secret (example: openssl rand -hex 32), keep it private.
-- Uncomment the next line, replace BOTH placeholders, then run it in SQL Editor.
-- select public.myb_notifications_configure_v1660('https://PROJECT_REF.supabase.co','PASTE_THE_SAME_MYB_CRON_SECRET_HERE');
-- Inspect cron.job + cron.job_run_details and net._http_response (HTTP 200 expected).
