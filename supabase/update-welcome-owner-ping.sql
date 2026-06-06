-- Update all panels: welcome text mentions staff role + owner ({owner} placeholder)
-- Run in Supabase → SQL Editor (guild: 939038877342113832)

update panels
set
  welcome_embed = jsonb_set(
    welcome_embed,
    '{description}',
    to_jsonb(
      replace(
        welcome_embed->>'description',
        'Please wait for {staff} to respond to you very soon.',
        'Please wait for {staff} / {owner} to respond to you very soon.'
      )
    )
  ),
  updated_at = now()
where guild_id = '939038877342113832'
  and welcome_embed->>'description' like '%Please wait for {staff} to respond to you very soon.%';
