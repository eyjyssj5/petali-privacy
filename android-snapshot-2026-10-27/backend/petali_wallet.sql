-- PETALI isolated wallet. Run only on a dedicated Petali database.
-- No service-role key in the app. PostgREST exposes only the narrow public RPC wrappers.
begin;
create schema if not exists petali_private;
revoke all on schema petali_private from public, anon, authenticated;
grant usage on schema petali_private to authenticated;

create table petali_private.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  personal_code text not null unique check(personal_code ~ '^PET-[0-9A-F]{16}$'),
  balance bigint not null check(balance >= 0),
  last_day date not null,
  streak integer not null check(streak between 1 and 10),
  referral_count integer not null default 0 check(referral_count>=0),
  referral_credits integer not null default 0 check(referral_credits between 0 and 200),
  created_at timestamptz not null default now()
);
create table petali_private.referrals (
  invited uuid primary key references petali_private.wallets(user_id) on delete cascade,
  inviter uuid not null references petali_private.wallets(user_id) on delete cascade,
  award integer not null check(award in (0,50,100)),
  created_at timestamptz not null default now(),
  check(inviter<>invited)
);
create index referrals_inviter_idx on petali_private.referrals(inviter);
create table petali_private.transfers (
  sender uuid not null references petali_private.wallets(user_id) on delete cascade,
  recipient uuid not null references petali_private.wallets(user_id) on delete cascade,
  request_id uuid not null,
  amount integer not null check(amount between 1 and 100000),
  created_at timestamptz not null default now(),
  primary key(sender,request_id),
  check(sender<>recipient)
);
create index transfers_recipient_idx on petali_private.transfers(recipient,created_at desc);
create table petali_private.unlocks (
  user_id uuid not null references petali_private.wallets(user_id) on delete cascade,
  mode text not null check(mode in ('2d','3d')),
  flower_id text not null check(flower_id in ('rosa-rossa','rosa-gialla','girasole','tulipano-rosso','tulipano','orchidea','lavanda','papavero','iris','garofano-rosso','garofano','viola','ortensia','peonia','dalia','ciliegio','ibisco')),
  expires_at timestamptz not null,
  primary key(user_id,mode,flower_id)
);
alter table petali_private.wallets enable row level security;
alter table petali_private.referrals enable row level security;
alter table petali_private.transfers enable row level security;
alter table petali_private.unlocks enable row level security;
revoke all on all tables in schema petali_private from public,anon,authenticated;

create function petali_private.actor() returns uuid
language plpgsql security definer set search_path='' as $$
declare u uuid := auth.uid(); sid uuid;
begin
  if u is null or coalesce(auth.jwt()->>'is_anonymous','false')='true' then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  begin sid:=(auth.jwt()->>'session_id')::uuid; exception when invalid_text_representation then raise exception 'AUTH_REQUIRED' using errcode='28000'; end;
  if sid is null or not exists(select 1 from auth.sessions s where s.id=sid and s.user_id=u and (s.not_after is null or s.not_after>now())) or
     not exists(select 1 from auth.users x where x.id=u and x.email_confirmed_at is not null and x.email is not null and not coalesce(x.is_anonymous,false))
    then raise exception 'AUTH_REQUIRED' using errcode='28000'; end if;
  return u;
end $$;

create function petali_private.summary(p_uid uuid) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('code',w.personal_code,'balance',w.balance,'streak',w.streak,'last_day',w.last_day,
    'referrals',w.referral_count,
    'referral_credits',w.referral_credits,
    'unlocks',coalesce((select jsonb_agg(jsonb_build_object('mode',a.mode,'flower_id',a.flower_id,'expires_at',a.expires_at)) from petali_private.unlocks a where a.user_id=w.user_id and a.expires_at>now()),'[]'::jsonb))
  from petali_private.wallets w where w.user_id=p_uid
$$;

create function petali_private.checkin(p_invite text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=petali_private.actor(); today date:=(now() at time zone 'UTC')::date;
  w petali_private.wallets%rowtype; inviter_id uuid; n bigint; bonus integer; inserted uuid;
  code text:=nullif(upper(btrim(p_invite)),'');
begin
  -- Same day requests are serialized on the account row. The server clock is authoritative.
  select * into w from petali_private.wallets where user_id=u for update;
  if not found then
    if code is not null then
      if code !~ '^PET-[0-9A-F]{16}$' then raise exception 'INVALID_CODE'; end if;
      -- Referral only during the initial verified registration, not a later login.
      if not exists(select 1 from auth.users where id=u and created_at>=now()-interval '24 hours') then raise exception 'INVITE_TOO_LATE'; end if;
      select user_id into inviter_id from petali_private.wallets where personal_code=code for update;
      if not found or inviter_id=u then raise exception 'INVALID_CODE'; end if;
    end if;
    insert into petali_private.wallets(user_id,personal_code,balance,last_day,streak)
      values(u,'PET-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,16)),110,today,1)
      on conflict(user_id) do nothing returning user_id into inserted;
    if inserted is not null and inviter_id is not null then
      select referral_count into n from petali_private.wallets where user_id=inviter_id;
      bonus:=case when n in (0,1) then 50 when n=2 then 100 else 0 end;
      insert into petali_private.referrals(invited,inviter,award) values(u,inviter_id,bonus);
      update petali_private.wallets set balance=balance+bonus,referral_count=referral_count+1,referral_credits=referral_credits+bonus where user_id=inviter_id;
    end if;
    select * into w from petali_private.wallets where user_id=u for update;
  elsif code is not null then
    -- A valid referral may be retried after a network failure, but never replaced.
    if not exists(select 1 from petali_private.referrals r join petali_private.wallets i on i.user_id=r.inviter where r.invited=u and i.personal_code=code) then raise exception 'INVITE_TOO_LATE'; end if;
  end if;
  if w.last_day<today then
    n:=case when w.last_day=today-1 then (w.streak%10)+1 else 1 end;
    update petali_private.wallets set balance=balance+10+case when n=10 then 100 else 0 end,streak=n,last_day=today where user_id=u;
  end if;
  return petali_private.summary(u);
end $$;

create function petali_private.send_credits(p_code text,p_amount integer,p_request_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=petali_private.actor(); target uuid; prior petali_private.transfers%rowtype; count_locked integer;
begin
  if p_request_id is null or p_amount is null or p_amount not between 1 and 100000 or coalesce(upper(btrim(p_code)),'') !~ '^PET-[0-9A-F]{16}$' then raise exception 'INVALID_TRANSFER'; end if;
  select user_id into target from petali_private.wallets where personal_code=upper(btrim(p_code));
  if target is null or target=u then raise exception 'INVALID_RECIPIENT'; end if;
  -- Stable ordering prevents deadlocks for opposite-direction transfers.
  perform 1 from petali_private.wallets where user_id in (u,target) order by user_id for update;
  get diagnostics count_locked=row_count;
  if count_locked<>2 then raise exception 'INVALID_RECIPIENT'; end if;
  select * into prior from petali_private.transfers where sender=u and request_id=p_request_id;
  if found then
    if prior.recipient<>target or prior.amount<>p_amount then raise exception 'REQUEST_CONFLICT'; end if;
    return petali_private.summary(u);
  end if;
  if (select balance from petali_private.wallets where user_id=u)<p_amount then raise exception 'INSUFFICIENT_CREDITS'; end if;
  update petali_private.wallets set balance=balance-p_amount where user_id=u;
  update petali_private.wallets set balance=balance+p_amount where user_id=target;
  insert into petali_private.transfers(sender,recipient,request_id,amount) values(u,target,p_request_id,p_amount);
  return petali_private.summary(u);
end $$;

create function petali_private.unlock_flower(p_mode text,p_flower_id text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=petali_private.actor(); bal bigint; existing timestamptz; f text:=case p_flower_id when 'tulipano' then 'tulipano-rosso' when 'garofano' then 'garofano-rosso' else p_flower_id end;
begin
  if p_mode is null or p_mode not in ('2d','3d') or f is null or f not in ('rosa-rossa','rosa-gialla','girasole','tulipano-rosso','orchidea','lavanda','papavero','iris','garofano-rosso','viola','ortensia','peonia','dalia','ciliegio','ibisco') then raise exception 'INVALID_FLOWER'; end if;
  select balance into bal from petali_private.wallets where user_id=u for update;
  if not found then raise exception 'AUTH_REQUIRED'; end if;
  select expires_at into existing from petali_private.unlocks where user_id=u and mode=p_mode and flower_id=f;
  if existing>now() then return petali_private.summary(u); end if;
  if bal<10 then raise exception 'INSUFFICIENT_CREDITS'; end if;
  update petali_private.wallets set balance=balance-10 where user_id=u;
  insert into petali_private.unlocks(user_id,mode,flower_id,expires_at) values(u,p_mode,f,now()+interval '24 hours')
    on conflict(user_id,mode,flower_id) do update set expires_at=excluded.expires_at;
  return petali_private.summary(u);
end $$;
create function petali_private.delete_account() returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=petali_private.actor();
begin
  delete from auth.users where id=u;
  return jsonb_build_object('ok',true);
end $$;
revoke all on all functions in schema petali_private from public,anon,authenticated;
grant execute on function petali_private.checkin(text),petali_private.send_credits(text,integer,uuid),petali_private.unlock_flower(text,text) to authenticated;
-- Public wrappers are SECURITY INVOKER. Privileged implementations are not exposed as RPC endpoints.
create function public.petali_checkin(p_invite text default null) returns jsonb language sql security invoker set search_path='' as $$select petali_private.checkin(p_invite)$$;
create function public.petali_send_credits(p_code text,p_amount integer,p_request_id uuid) returns jsonb language sql security invoker set search_path='' as $$select petali_private.send_credits(p_code,p_amount,p_request_id)$$;
create function public.petali_unlock_flower(p_mode text,p_flower_id text) returns jsonb language sql security invoker set search_path='' as $$select petali_private.unlock_flower(p_mode,p_flower_id)$$;
revoke all on function public.petali_checkin(text),public.petali_send_credits(text,integer,uuid),public.petali_unlock_flower(text,text) from public,anon,authenticated;
grant execute on function public.petali_checkin(text),public.petali_send_credits(text,integer,uuid),public.petali_unlock_flower(text,text) to authenticated;
grant execute on function petali_private.delete_account() to authenticated;
create function public.petali_delete_account() returns jsonb language sql security invoker set search_path='' as $$select petali_private.delete_account()$$;
revoke all on function public.petali_delete_account() from public,anon,authenticated;
grant execute on function public.petali_delete_account() to authenticated;
commit;
