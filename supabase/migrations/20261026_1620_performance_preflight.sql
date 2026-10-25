-- MeYeuBe V16.2.0 Performance. OPTIONAL read-only preflight.
-- No DDL/DML; a database already upgraded through1590 needs no new migration.
with required(signature) as (values
 ('public.myb_app_shell_v1560(text)'),
 ('public.myb_catalog_list_v1530(text,text)'),
 ('public.myb_care_list_v1540(text,jsonb)'),
 ('public.myb_health_list_v1550(text,jsonb)'),
 ('public.myb_planning_list_v1560(text,jsonb)'),
 ('public.myb_settings_get_v1570(text)'),
 ('public.myb_realtime_revision_v1590(text)'),
 ('public.myb_realtime_slice_v1590(text,text)')
)
select '16.2.0' as frontend_version,'15.9.0' as required_database_api,
 bool_and(to_regprocedure(signature) is not null) as required_rpcs_present,
 coalesce(jsonb_agg(signature) filter(where to_regprocedure(signature) is null),'[]'::jsonb) as missing_rpcs
from required;
