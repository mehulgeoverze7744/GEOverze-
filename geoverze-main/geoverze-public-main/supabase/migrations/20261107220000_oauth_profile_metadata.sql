-- Map Google OAuth metadata onto the profile created for a new auth user.
-- Membership stays Free (role = user). Credits stay at the table default (0).

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

  begin
    insert into public.profiles (id, username, display_name, country_code, avatar_url)
    values (new.id, requested_username, requested_display, requested_country, requested_avatar)
    on conflict (id) do nothing;
  exception
    when unique_violation then
      insert into public.profiles (id, display_name, country_code, avatar_url)
      values (new.id, requested_display, requested_country, requested_avatar)
      on conflict (id) do nothing;
  end;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  insert into public.user_progression (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$function$;
