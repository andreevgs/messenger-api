import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Type } from 'class-transformer';
import { Dialog } from './dialog.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop()
  text: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  @Type(() => {
    return User;
  })
  sender: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Dialog.name })
  @Type(() => {
    return Dialog;
  })
  dialog: Dialog;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
