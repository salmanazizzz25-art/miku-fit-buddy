
alter function public.touch_updated_at() set search_path = public;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
