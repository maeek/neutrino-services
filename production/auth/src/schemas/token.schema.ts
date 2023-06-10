import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenDocument = HydratedDocument<Token>;

function transformValue(_doc, ret: { [key: string]: any }) {
  delete ret._id;
}

@Schema({
  collection: 'tokens',
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
export class Token {
  @Prop({
    required: [true, '"refreshToken" cannot be empty'],
    unique: true,
    trim: true,
  })
  readonly refreshToken: string;

  @Prop({ type: String, required: [true, '"username" cannot be empty'] })
  username: string;

  @Prop({ type: Number, default: Date.now() })
  createdAt: number;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
