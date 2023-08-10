import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {Document} from 'mongoose';
import {Type} from "class-transformer";
import {User} from "../../users/schemas/user.schema";

export type DialogDocument = Dialog & Document;

@Schema({ timestamps: true })
export class Dialog {
    @Prop({ type: [{type: mongoose.Schema.Types.ObjectId, ref: User.name }]})
    @Type(() => {
        return Array<User>;
    })
    participants: User[];
}

export const DialogSchema = SchemaFactory.createForClass(Dialog);