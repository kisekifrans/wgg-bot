-- WGG Ticket — seed default panels & commands
-- Run once in Supabase → SQL Editor
-- Guild: 939038877342113832

insert into guild_config (guild_id, ticket_counter)
values ('939038877342113832', 0)
on conflict (guild_id) do update set ticket_counter = excluded.ticket_counter;

insert into panels (
  id, guild_id, name, category_key, enabled, embed, button, welcome_embed, ping_staff, sort_order
) values
  ('panel_account', '939038877342113832', 'Buy Account', 'account', true, '{"title":"WGG - BUY ACC","description":"Press **Create ticket** to open a ticket if you are interested in buying an account from WGG.\n\nThe current stock that WGG has is listed — take a look.\n\nBefore creating a ticket, please check the text above, also visit #FAQ under the information tab.","color":"#57F287","footer":"WGG Ticket System"}'::jsonb, '{"label":"Create ticket","emoji":"📩","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} to respond to you very soon.\n\nWhile waiting, you can also check our available accounts on our official website.\n\n**WGG Apex Website (Account Marketplace):** https://wggapex.com\n\nIf you already have an account that you want to purchase, simply provide us with the **Account ID** or send the link here.\n\n⚠️ Please do not spam messages.","color":"#57F287","footer":"WGG Support Team"}'::jsonb, true, 0),
  ('panel_boosting', '939038877342113832', 'Boosting', 'boosting', true, '{"title":"WGG - BOOSTING","description":"Press **Create ticket** if you need help with boosting services.\n\nInclude your order details and proof of payment if applicable.","color":"#FEE75C","footer":"WGG Ticket System"}'::jsonb, '{"label":"Create ticket","emoji":"📩","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} to respond to you very soon.\n\nPlease share your boosting order details, proof of payment, and any questions you have.\n\n⚠️ Please do not spam messages.","color":"#FEE75C","footer":"WGG Support Team"}'::jsonb, true, 1),
  ('panel_unban', '939038877342113832', 'Buy Unban', 'unban', true, '{"title":"WGG BUY UNBAN","description":"Press **Create ticket** if you are interested in buying an unban service for your account.\n\nBefore creating a ticket, please check the information posted above.","color":"#57F287","footer":"WGG Ticket System"}'::jsonb, '{"label":"Create ticket","emoji":"📩","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} to respond to you very soon.\n\nPlease provide your EA account details, ban reason if known, and any relevant information for your unban request.\n\n⚠️ Please do not spam messages.","color":"#ED4245","footer":"WGG Support Team"}'::jsonb, true, 2),
  ('panel_relink', '939038877342113832', 'Relink', 'relink', true, '{"title":"WGG - RELINK","description":"Press **Create ticket** for account relink requests.\n\nInclude your old account, new account, and proof of ownership.","color":"#57F287","footer":"WGG Ticket System"}'::jsonb, '{"label":"Create ticket","emoji":"📩","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} to respond to you very soon.\n\nPlease explain your relink request with your old account, new account, and proof of ownership.\n\n⚠️ Please do not spam messages.","color":"#57F287","footer":"WGG Support Team"}'::jsonb, true, 3),
  ('panel_predator', '939038877342113832', 'Predator', 'predator', true, '{"title":"WGG - PREDATOR","description":"Press **Create ticket** for predator-related reports or questions.\n\nPlease provide as much detail as possible.","color":"#EB459E","footer":"WGG Ticket System"}'::jsonb, '{"label":"Create ticket","emoji":"📩","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} to respond to you very soon.\n\nPlease describe your predator-related report or question in as much detail as possible.\n\n⚠️ Please do not spam messages.","color":"#EB459E","footer":"WGG Support Team"}'::jsonb, true, 4)
on conflict (id) do update set
  name = excluded.name,
  category_key = excluded.category_key,
  enabled = excluded.enabled,
  embed = excluded.embed,
  button = excluded.button,
  welcome_embed = excluded.welcome_embed,
  ping_staff = excluded.ping_staff,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into custom_commands (
  id, guild_id, name, description, staff_only, embed
) values
  ('cmd_thankyou', '939038877342113832', 'thankyou', 'Send a thank you message to the user', true, '{"title":"Thank You!","description":"Thank you for choosing **WGG**! We appreciate your patience and hope we resolved your issue.\n\nIf you need anything else, feel free to open a new ticket anytime.","color":"#5865F2","footer":"WGG Support Team"}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  staff_only = excluded.staff_only,
  embed = excluded.embed,
  updated_at = now();
