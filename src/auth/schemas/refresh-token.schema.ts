import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Document} from 'mongoose';
import {Type} from "class-transformer";
import {User} from "../../users/schemas/user.schema";

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ timestamps: true })
export class RefreshToken {
    @Prop({ default() { return null } })
    refreshToken: string | null;

    @Prop({ default() { return null } })
    expirationDate: Date | null;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    @Type(() => {
        return User;
    })
    user: User;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);