export type EmbedConfig = {
  title?: string;
  description?: string;
  color?: string;
  footer?: string;
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
