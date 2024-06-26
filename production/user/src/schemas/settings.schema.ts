import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatSetting, ChatSettingsSchema } from './chat-settings.schema';

export type SettingsDocument = HydratedDocument<Settings>;

function transformValue(_doc, ret: { [key: string]: any }) {
  delete ret._id;
}

@Schema({
  collection: 'settings',
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
export class Settings {
  @Prop({
    type: [String],
  })
  mutedUsers: string[];

  @Prop({
    type: [ChatSettingsSchema],
    default: [],
  })
  chats: ChatSetting[];
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
