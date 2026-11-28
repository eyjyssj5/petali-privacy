\set ON_ERROR_STOP on
insert into auth.users(id,email,email_confirmed_at)
select ('00000000-0000-0000-0000-00000000000'||n)::uuid,'test'||n||'@example.test',case when n=6 then null else now() end from generate_series(1,6)n;
insert into auth.sessions(id,user_id) select ('10000000-0000-0000-0000-00000000000'||n)::uuid,('00000000-0000-0000-0000-00000000000'||n)::uuid from generate_series(1,6)n;
set role authenticated;
do $$
declare a jsonb;b jsonb;c jsonb;code_a text;code_b text;n integer;
begin
 perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-000000000001','session_id','10000000-0000-0000-0000-000000000001')::text,false);
 a:=public.petali_checkin();code_a:=a->>'code';
 assert (a->>'balance')::int=110;
 assert (public.petali_checkin()->>'balance')::int=110;
 for n in 2..5 loop
  perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-00000000000'||n,'session_id','10000000-0000-0000-0000-00000000000'||n)::text,false);
  b:=public.petali_checkin(code_a);
  assert (b->>'balance')::int=110;
  assert (public.petali_checkin(code_a)->>'balance')::int=110;
  if n=2 then code_b:=b->>'code';end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-000000000001','session_id','10000000-0000-0000-0000-000000000001')::text,false);
  a:=public.petali_checkin();
  assert (a->>'referral_credits')::int=case n when 2 then 50 when 3 then 100 else 200 end;
 end loop;
 assert (a->>'balance')::int=310;
 a:=public.petali_send_credits(code_b,30,'20000000-0000-0000-0000-000000000001');
 assert (a->>'balance')::int=280;
 a:=public.petali_send_credits(code_b,30,'20000000-0000-0000-0000-000000000001');
 assert (a->>'balance')::int=280;
 begin perform public.petali_send_credits(code_a,1,gen_random_uuid());raise exception 'Self transfer unexpectedly allowed';exception when raise_exception then if sqlerrm<>'INVALID_RECIPIENT' then raise;end if;end;
 begin perform public.petali_send_credits(code_b,1000,gen_random_uuid());raise exception 'Overspend unexpectedly allowed';exception when raise_exception then if sqlerrm<>'INSUFFICIENT_CREDITS' then raise;end if;end;
 begin perform count(*) from petali_private.wallets;raise exception 'Direct table access unexpectedly allowed';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-000000000002','session_id','10000000-0000-0000-0000-000000000002')::text,false);
 b:=public.petali_checkin();assert (b->>'balance')::int=140;
 perform public.petali_delete_account();
 perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-000000000001','session_id','10000000-0000-0000-0000-000000000001')::text,false);
 a:=public.petali_checkin();assert (a->>'referrals')::int=4;assert (a->>'referral_credits')::int=200;
 perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-000000000006','session_id','10000000-0000-0000-0000-000000000006')::text,false);
 begin perform public.petali_checkin();raise exception 'Unverified user unexpectedly allowed';exception when invalid_authorization_specification then null;end;
end $$;
reset role;
update petali_private.wallets set streak=9,last_day=(now() at time zone 'UTC')::date-1 where user_id='00000000-0000-0000-0000-000000000001';
set role authenticated;
do $$
declare a jsonb;
begin
 perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-000000000001','session_id','10000000-0000-0000-0000-000000000001')::text,false);
 a:=public.petali_checkin();assert (a->>'balance')::int=390;assert (a->>'streak')::int=10;
 assert (public.petali_checkin()->>'balance')::int=390;
 a:=public.petali_unlock_flower('2d','rosa-rossa');assert (a->>'balance')::int=380;
 a:=public.petali_unlock_flower('2d','rosa-rossa');assert (a->>'balance')::int=380;
 a:=public.petali_unlock_flower('3d','rosa-rossa');assert (a->>'balance')::int=370;
end $$;
reset role;
update petali_private.wallets set last_day=(now() at time zone 'UTC')::date-2 where user_id='00000000-0000-0000-0000-000000000001';
set role authenticated;
do $$ declare a jsonb;begin
 perform set_config('request.jwt.claims',jsonb_build_object('sub','00000000-0000-0000-0000-000000000001','session_id','10000000-0000-0000-0000-000000000001')::text,false);
 a:=public.petali_checkin();assert (a->>'balance')::int=380;assert (a->>'streak')::int=1;
end $$;
reset role;
