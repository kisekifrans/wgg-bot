/** Known shortcodes → emoji id (WGG server) */
const KNOWN_EMOJI_IDS = {
  bounce: '1218220921597202442',
};

/**
 * @param {string} tag
 * @returns {{ name: string, id: string, animated: boolean, tag: string } | null}
 */
function parseCustomEmojiTag(tag) {
  const match = String(tag).trim().match(/^<(a?):(\w+):(\d+)>$/);
  if (!match) {
    return null;
  }

  return {
    animated: Boolean(match[1]),
    name: match[2],
    id: match[3],
    tag: match[0],
  };
}

/**
 * @param {{ id: string, animated: boolean }} emoji
 * @returns {string}
 */
function customEmojiCdnUrl(emoji) {
  return `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
}

/**
 * Expand :bounce: → <:bounce:id> when not already in Discord tag form.
 * @param {string} text
 * @returns {string}
 */
function normalizeKnownEmojiShortcodes(text) {
  if (!text) {
    return text;
  }

  let result = text;
  for (const [name, id] of Object.entries(KNOWN_EMOJI_IDS)) {
    result = result.replace(new RegExp(`(?<!<):${name}:`, 'g'), `<:${name}:${id}>`);
  }
  return result;
}

/**
 * @param {string} text
 * @returns {{ leading: ReturnType<typeof parseCustomEmojiTag>, trailing: ReturnType<typeof parseCustomEmojiTag>, body: string }}
 */
function splitEdgeCustomEmojis(text) {
  let body = normalizeKnownEmojiShortcodes(text || '');

  let leading = null;
  const leadMatch = body.match(/^<a?:(\w+):(\d+)>\s*/);
  if (leadMatch) {
    leading = parseCustomEmojiTag(leadMatch[0].trim());
    body = body.slice(leadMatch[0].length);
  }

  let trailing = null;
  const trailMatch = body.match(/\s*<a?:(\w+):(\d+)>\s*$/);
  if (trailMatch) {
    trailing = parseCustomEmojiTag(trailMatch[0].trim());
    body = body.slice(0, body.length - trailMatch[0].length).trimEnd();
  }

  return { leading, trailing, body };
}

/**
 * Discord renders custom emojis in message content more reliably than embed descriptions.
 * @param {ReturnType<typeof parseCustomEmojiTag> | null} emoji
 * @returns {string | undefined}
 */
function customEmojiToMessageContent(emoji) {
  return emoji?.tag;
}

module.exports = {
  KNOWN_EMOJI_IDS,
  parseCustomEmojiTag,
  customEmojiCdnUrl,
  normalizeKnownEmojiShortcodes,
  splitEdgeCustomEmojis,
  customEmojiToMessageContent,
};
