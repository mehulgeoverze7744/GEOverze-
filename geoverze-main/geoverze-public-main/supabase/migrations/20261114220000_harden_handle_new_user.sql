-- Keep auth.users inserts from failing when profile metadata is invalid.
-- handle_new_user must never raise: a CHECK/unique failure here surfaces as
-- "Database error saving new user" and blocks email signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  requested_username text;
  requested_country  text;
  requested_display  text;
  requested_avatar   text;
begin
  requested_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  if requested_username is not null and requested_username !~ '^[a-zA-Z0-9_]+$' then
    requested_username := null;
  end if;
  if requested_username is not null then
    requested_username := left(requested_username, 24);
    if length(requested_username) < 3 then
      requested_username := null;
    end if;
  end if;

  if requested_username is null then
    requested_username := lower(
      regexp_replace(split_part(coalesce(new.email, ''), '@', 1), '[^a-z0-9_]', '_', 'g')
    );
    requested_username := trim(both '_' from requested_username);
    requested_username := left(requested_username, 24);
    if requested_username is null or length(requested_username) < 3 then
      requested_username := 'gvrze_' || substr(replace(new.id::text, '-', ''), 1, 8);
    end if;
  end if;

  requested_country := upper(nullif(trim(new.raw_user_meta_data ->> 'country_code'), ''));
  if requested_country is not null and requested_country !~ '^[A-Z]{2}$' then
    requested_country := null;
  end if;

  requested_display := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(concat_ws(
      ' ',
      nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'last_name'), '')
    )), ''),
    nullif(trim(concat_ws(
      ' ',
      nullif(trim(new.raw_user_meta_data ->> 'given_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'family_name'), '')
    )), '')
  );

  requested_avatar := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
  );
  if requested_avatar is not null then
    requested_avatar := left(requested_avatar, 2000);
  end if;

  begin
    insert into public.profiles (id, username, display_name, country_code, avatar_url)
    values (new.id, requested_username, requested_display, requested_country, requested_avatar)
    on conflict (id) do nothing;
  exception
    when unique_violation then
      begin
        insert into public.profiles (id, display_name, country_code, avatar_url)
        values (new.id, requested_display, requested_country, requested_avatar)
        on conflict (id) do nothing;
      exception
        when others then
          begin
            insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
          exception
            when others then
              raise warning 'handle_new_user profile insert failed for %: %', new.id, sqlerrm;
          end;
      end;
    when others then
      begin
        insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
      exception
        when others then
          raise warning 'handle_new_user profile fallback failed for %: %', new.id, sqlerrm;
      end;
  end;

  begin
    insert into public.user_roles (user_id, role)
    values (new.id, 'user')
    on conflict (user_id, role) do nothing;
  exception
    when others then
      raise warning 'handle_new_user role insert failed for %: %', new.id, sqlerrm;
  end;

  begin
    insert into public.user_progression (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  exception
    when others then
      raise warning 'handle_new_user progression insert failed for %: %', new.id, sqlerrm;
  end;

  return new;
end;
$function$;

comment on function public.handle_new_user() is
  'Runs after every auth.users insert. Creates profile, default user role, and user_progression. Never raises — cannot block signup.';

revoke execute on function public.handle_new_user() from public, anon, authenticated;
