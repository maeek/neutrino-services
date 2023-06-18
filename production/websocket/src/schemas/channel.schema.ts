import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export type ChannelDocument = HydratedDocument<Channel>;

function transformValue(_doc, ret: { [key: string]: any }) {
  delete ret._id;
}

@Schema({
  collection: 'channels',
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
export class Channel {
  @Prop({
    required: [true, '"name" cannot be empty'],
    unique: true,
    trim: true,
    maxlength: [64, '"name" cannot be longer than 64 characters'],
  })
  readonly name: string;

  @Prop({ type: Number, default: () => Date.now() })
  createdAt: number;

  @Prop({ type: Boolean })
  public: boolean;

  @Prop({ type: [MSchema.Types.ObjectId], ref: 'User', default: [] })
  users: string[];

  @Prop({ type: [MSchema.Types.ObjectId], ref: 'User', default: [] })
  blockedUsers: string[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
