import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from "bcrypt";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop()
    username: string;

    @Prop()
    password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
});