-- ============================================================================
-- Mẹ Yêu Bé V15.0.78 · Weight Decimal / KG Unit Fix
-- Safe to run more than once.
-- UI may send Vietnamese decimal comma (5,2). Database keeps weight_g as numeric grams.
-- ============================================================================

begin;

create or replace function public.myb_weight_g(p_text text)
returns numeric
language plpgsql
immutable
as $$
declare
  n numeric;
  s text := lower(btrim(coalesce(p_text,'')));
begin
  n := public.myb_num(p_text);
  if n is null then return null; end if;

  -- Explicit unit always wins.
  if position('kg' in s) > 0 then return round(n * 1000, 2); end if;
  if position('g' in s) > 0 then return round(n, 2); end if;

  -- Health-book UI field is kilograms. Legacy rows above 100 are treated as grams.
  -- Examples: 5,2 / 5.2 -> 5200 g; 3450 -> 3450 g.
  if abs(n) <= 100 then return round(n * 1000, 2); end if;
  return round(n, 2);
end;
$$;

-- Repair only the latest obviously-invalid measurement for each member.
-- The member's weight_text is the latest UI value, so it is a safe reference for
-- the newest measurement. Historical rows are deliberately left untouched.
with latest as (
  select distinct on (hm.member_id)
    hm.id,
    hm.member_id,
    hm.weight_g,
    hm.measure_date,
    hm.created_at
  from public.health_measurements hm
  where hm.deleted_at is null and hm.weight_g is not null
  order by hm.member_id, hm.measure_date desc nulls last, hm.created_at desc
), fixable as (
  select l.id,
         public.myb_num(h.weight_text) as weight_kg
  from latest l
  join public.health_members h on h.id=l.member_id and h.deleted_at is null
  where l.weight_g > 0
    and l.weight_g < 1000
    and public.myb_num(h.weight_text) between 1 and 100
)
update public.health_measurements hm
set weight_g = round(f.weight_kg * 1000, 2),
    updated_at = now()
from fixable f
where hm.id=f.id;

commit;

-- Verification: latest rows should now show plausible kg values.
select
  hm.measure_date,
  h.display_name,
  h.relation,
  hm.weight_g,
  round(hm.weight_g/1000.0, 3) as weight_kg
from public.health_measurements hm
join public.health_members h on h.id=hm.member_id
where hm.deleted_at is null and h.deleted_at is null
order by hm.measure_date desc, hm.created_at desc
limit 20;
