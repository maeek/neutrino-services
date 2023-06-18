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
    size: number;
    uri: string;
  }[];
  timeSent: number;
  serverUuid: string;
  uuid: string;
  fromId: string;
  toId: string;
}
