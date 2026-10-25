alter table care_categories add column if not exists color text;
alter table care_categories add column if not exists description text;
alter table care_categories add column if not exists extra jsonb not null default '{}';
alter table care_categories add column if not exists created_at timestamptz not null default now();
alter table care_categories add column if not exists sort_order int default 0;
create table app_members(id uuid primary key,family_id uuid not null references families(id),legacy_id text,name text,icon text,role text,pin text,status text,added_at timestamptz,added_by text,extra jsonb default '{}',created_at timestamptz default now(),updated_at timestamptz default now(),deleted_at timestamptz);
create table sensor_logs(id uuid primary key,family_id uuid not null references families(id),legacy_id text,sensor_type text,log_date date,start_time text,end_time text,start_ts bigint,end_ts bigint,duration_sec int,min_value numeric,max_value numeric,avg_value numeric,mode text,samples jsonb,extra jsonb default '{}',created_at timestamptz default now(),updated_at timestamptz default now(),deleted_at timestamptz);
create table activity_logs(id uuid primary key,family_id uuid not null references families(id),legacy_id text,occurred_at timestamptz,activity_type text,action text,summary text,member_legacy_id text,member_name text,member_icon text,extra jsonb default '{}',created_at timestamptz default now(),deleted_at timestamptz);
-- Match production ON DELETE CASCADE from the supplied schema report.
alter table milk_items drop constraint milk_items_family_id_fkey;
alter table milk_items add constraint milk_items_family_id_fkey foreign key(family_id) references families(id) on delete cascade;
alter table myb_realtime_events drop constraint myb_realtime_events_family_id_fkey;
alter table myb_realtime_events add constraint myb_realtime_events_family_id_fkey foreign key(family_id) references families(id) on delete cascade;
