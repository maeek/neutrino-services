import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CredentialDocument = HydratedDocument<Credential>;

function transformValue(_doc, ret: { [key: string]: any }) {
  delete ret._id;
}

@Schema({
  collection: 'credentials',
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
export class Credential {
  @Prop({ required: true })
  credentialId: string;

  @Prop({ required: true })
  publicKey: string;

  @Prop()
  signCount: number;

  @Prop({ type: Number, default: () => Date.now() })
  createdAt: number;

  @Prop()
  locked: boolean;
}

export const CredentialSchema = SchemaFactory.createForClass(Credential);
