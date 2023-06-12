import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatSettingsDocument = HydratedDocument<ChatSetting>;

function transformValue(_doc, ret: { [key: string]: any }) {
  delete ret._id;
}

@Schema({
  collection: 'chat-settings',
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: transformValue,
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: transformValue,
  },
})
export class ChatSetting {
  @Prop({
    type: String,
  })
  channel: string;

  @Prop({
    type: Boolean,
  })
  muted: boolean;

  @Prop({
    type: String,
  })
  color: string;
}

export const ChatSettingsSchema = SchemaFactory.createForClass(ChatSetting);
