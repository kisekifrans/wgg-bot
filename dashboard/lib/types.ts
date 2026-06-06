export type EmbedConfig = {
  title?: string;
  description?: string;
  color?: string;
  footer?: string;
  /** Large image at the bottom of the embed (https URL) */
  image?: string;
  /** Small image in the top-right corner (https URL) */
  thumbnail?: string;
};

export type Panel = {
  id: string;
  name: string;
  categoryKey: string;
  enabled: boolean;
  embed: EmbedConfig;
  button: { label: string; emoji?: string; style: string };
  welcomeEmbed: EmbedConfig;
  pingStaff: boolean;
};

export type CustomCommand = {
  id: string;
  name: string;
  description: string;
  staffOnly: boolean;
  embed: EmbedConfig;
};

export type StoreData = {
  ticketCounter: number;
  panels: Panel[];
  customCommands: CustomCommand[];
};

export type Category = {
  key: string;
  label: string;
  emoji: string;
};
