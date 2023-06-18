export enum MessageTypes {
  DIRECT = 0,
  CHANNEL = 1,
}

export interface Message {
  type: MessageTypes;
  body?: string;
  attachments: {
    name: string;
    uuid: string;
    mimeType: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file';
    parts: string[]; // uuid parts
  }[];
  timeSent: number;
  serverUuid: string;
  uuid: string;
  fromId: string;
  toId: string;
}
