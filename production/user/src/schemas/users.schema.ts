import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MSchema } from 'mongoose';

export enum UserRole {
  ROOT = 'ROOT',
  USER = 'USER',
}

export enum AccountLoginType {
  STANDARD = 0,
  WEBAUTHN = 1,
}

const restrictedUsernames = ['root', 'admin', 'administrator', 'server'];

export type UserDocument = HydratedDocument<User>;

function transformValue(_doc, ret: { [key: string]: any }) {
  delete ret._id;
}

@Schema({
  collection: 'users',
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
export class User {
  @Prop({
    required: [true, '"username" cannot be empty'],
    unique: true,
    index: true,
    maxlength: 50,
    minlength: 3,
    lowercase: true,
    trim: true,
    validate: {
      validator: (val: string) =>
        !restrictedUsernames.includes(val.toLowerCase()),
      message: 'This username is restricted',
    },
  })
  readonly username: string;

  @Prop({
    type: String,
    required: [true, 'User role is required'],
    default: UserRole.USER,
  })
  role: string;

  @Prop({
    type: [
      {
        type: String,
      },
    ],
    required: [true, 'Account supported type is required'],
    default: [AccountLoginType.STANDARD],
  })
  supportedLoginTypes: AccountLoginType[];

  @Prop({ type: Number, default: Date.now() })
  createdAt: number;

  @Prop({ trim: true })
  avatar: string;

  @Prop({
    trim: true,
    maxlength: 255,
  })
  bio: string;

  @Prop()
  locked: boolean;

  @Prop()
  hash?: string;

  @Prop({
    type: MSchema.Types.ObjectId,
    ref: 'Credential',
  })
  credentials: MSchema.Types.ObjectId;

  @Prop({
    type: MSchema.Types.ObjectId,
    ref: 'Settings',
  })
  settings: MSchema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
