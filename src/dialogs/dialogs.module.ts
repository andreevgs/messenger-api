import {Module} from '@nestjs/common';
import {DialogsService} from './dialogs.service';
import {DialogsGateway} from './dialogs.gateway';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "../users/schemas/user.schema";
import {Dialog, DialogSchema} from "./schemas/dialog.schema";
import {AuthService} from "../auth/auth.service";
import {RefreshToken, RefreshTokenSchema} from "../auth/schemas/refresh-token.schema";
import {UsersService} from "../users/users.service";
import {Message, MessageSchema} from "./schemas/message.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema},
            {name: Dialog.name, schema: DialogSchema},
            {name: Message.name, schema: MessageSchema},
            {name: RefreshToken.name, schema: RefreshTokenSchema},
        ]),
    ],
    providers: [DialogsGateway, DialogsService, AuthService, UsersService]
})
export class DialogsModule {
}
