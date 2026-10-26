-- V15.8.0: optional read-only preflight. No schema/business-data changes required.
do $$
declare sig text;begin
 foreach sig in array array['public.myb_app_shell_v1560(text)','public.myb_settings_get_v1570(text)','public.myb_settings_write_v1570(text,text,uuid,jsonb)','public.myb_scoped_summary_v1570(text,jsonb)','public.myb_health_list_v1550(text,jsonb)','public.myb_care_list_v1540(text,jsonb)','public.myb_planning_list_v1560(text,jsonb)'] loop
 if to_regprocedure(sig) is null then raise exception 'Missing API: %. Install migrations 1530 through 1570 first.',sig;end if;
 end loop;
end $$;
select 'V15.8.0 preflight OK: existing APIs present; no database reset or schema change.' as result;
