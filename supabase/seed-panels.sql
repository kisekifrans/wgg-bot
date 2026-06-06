-- WGG Ticket — seed default panels & commands
-- Run once in Supabase → SQL Editor
-- Guild: 939038877342113832

insert into guild_config (guild_id, ticket_counter)
values ('939038877342113832', 0)
on conflict (guild_id) do update set ticket_counter = excluded.ticket_counter;

insert into panels (
  id, guild_id, name, category_key, enabled, embed, button, welcome_embed, ping_staff, sort_order
) values
  ('panel_account', '939038877342113832', 'Buy Account', 'account', true, '{"title":"WGG - BUY ACC","description":"<:predator:1512649268450689094> Press **Create ticket** to open a ticket if you are interested in buying an account from WGG.\n\nBrowse verified listings on our marketplace:\n**https://www.wggapex.com/marketplace**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nBefore creating a ticket, check the stock listed above and visit #FAQ under the information tab.","color":"#57F287","footer":"WGG Apex · www.wggapex.com"}'::jsonb, '{"label":"Create ticket","emoji":"<:predator:1512649268450689094>","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} / {owner} to respond to you very soon.\n\nWhile waiting, browse available accounts for sale:\n**Account Marketplace:** https://www.wggapex.com/marketplace\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nIf you already have an account to purchase, send us the **Account ID**, product link, or screenshot below.\n\nPlease don''t spam us — we will answer you shortly. Thank you! <:predator:1512649268450689094>","color":"#57F287","footer":"WGG Support Team"}'::jsonb, true, 0),
  ('panel_boosting', '939038877342113832', 'Boosting', 'boosting', true, '{"title":"WGG - BOOSTING","description":"<:predator:1512649268450689094> Press **Create ticket** if you need help with ranked boosting services.\n\nView ranked boost pricing & checkout:\n**https://www.wggapex.com/checkout/ranked-boosting**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nInclude your order details and proof of payment if applicable.","color":"#FEE75C","footer":"WGG Apex · www.wggapex.com"}'::jsonb, '{"label":"Create ticket","emoji":"<:predator:1512649268450689094>","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} / {owner} to respond to you very soon.\n\nRanked boosting services & pricing:\n**https://www.wggapex.com/checkout/ranked-boosting**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nPlease share your boosting order details, proof of payment, and any questions you have.\n\nPlease don''t spam us — we will answer you shortly. Thank you! <:predator:1512649268450689094>","color":"#FEE75C","footer":"WGG Support Team"}'::jsonb, true, 1),
  ('panel_unban', '939038877342113832', 'Buy Unban', 'unban', true, '{"title":"WGG BUY UNBAN","description":"<:predator:1512649268450689094> Press **Create ticket** if you are interested in our Apex unban service.\n\nLearn about the unban workflow:\n**https://www.wggapex.com/services/apex-unban**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nBefore creating a ticket, please check the information on the website above.","color":"#57F287","footer":"WGG Apex · www.wggapex.com"}'::jsonb, '{"label":"Create ticket","emoji":"<:predator:1512649268450689094>","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} / {owner} to respond to you very soon.\n\nApex unban service details:\n**https://www.wggapex.com/services/apex-unban**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nPlease provide your EA account details, ban reason if known, and any relevant information for your unban request.\n\nPlease don''t spam us — we will answer you shortly. Thank you! <:predator:1512649268450689094>","color":"#ED4245","footer":"WGG Support Team"}'::jsonb, true, 2),
  ('panel_relink', '939038877342113832', 'Relink', 'relink', true, '{"title":"WGG - RELINK","description":"<:predator:1512649268450689094> Press **Create ticket** for account relink requests.\n\nAccount relinking service:\n**https://www.wggapex.com/services/relinking**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nInclude your old account, new account, and proof of ownership.","color":"#57F287","footer":"WGG Apex · www.wggapex.com"}'::jsonb, '{"label":"Create ticket","emoji":"<:predator:1512649268450689094>","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} / {owner} to respond to you very soon.\n\nAccount relinking service:\n**https://www.wggapex.com/services/relinking**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nPlease explain your relink request with your old account, new account, and proof of ownership.\n\nPlease don''t spam us — we will answer you shortly. Thank you! <:predator:1512649268450689094>","color":"#57F287","footer":"WGG Support Team"}'::jsonb, true, 3),
  ('panel_predator', '939038877342113832', 'Predator', 'predator', true, '{"title":"WGG - PREDATOR","description":"<:predator:1512649268450689094> Press **Create ticket** for Predator maintenance plans or questions.\n\nPredator maintenance plans & pricing:\n**https://www.wggapex.com/services/predator-maintenance**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nPlease provide as much detail as possible (platform, target RP, current rank).","color":"#EB459E","footer":"WGG Apex · www.wggapex.com"}'::jsonb, '{"label":"Create ticket","emoji":"<:predator:1512649268450689094>","style":"Secondary"}'::jsonb, '{"title":"🎫 Ticket Received","description":"Hi {user}! We received your ticket already. Please wait for {staff} / {owner} to respond to you very soon.\n\nPredator maintenance plans:\n**https://www.wggapex.com/services/predator-maintenance**\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nPlease describe your Predator plan request (platform, target RP, current rank) in as much detail as possible.\n\nPlease don''t spam us — we will answer you shortly. Thank you! <:predator:1512649268450689094>","color":"#EB459E","footer":"WGG Support Team"}'::jsonb, true, 4)
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
  ('cmd_thankyou', '939038877342113832', 'thankyou', 'Send a thank you message to the user', true, '{"title":"Thank You!","description":"Thank you for choosing **WGG**! We appreciate your patience and hope we resolved your issue.\n\n**WGG Apex Official Website:** https://www.wggapex.com/\n\nIf you need anything else, feel free to open a new ticket anytime. <:predator:1512649268450689094>","color":"#5865F2","footer":"WGG Support Team"}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  staff_only = excluded.staff_only,
  embed = excluded.embed,
  updated_at = now();
