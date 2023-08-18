import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DialogsService } from './dialogs.service';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { NewMessageDto } from './dto/new-message.dto';
import { AuthService } from '../auth/auth.service';
import { FindParticipantDto } from './dto/find-participant.dto';
import {UsersService} from "../users/users.service";
import {TargetDialogDto} from "./dto/target-dialog.dto";

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class DialogsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly dialogsService: DialogsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    const user = await this.authService.verifyAccessToken(
      socket.handshake.headers.authorization,
    );
    if (user) {
      await this.usersService.updateSocketId(user, socket.id);
      console.log(`${socket.id} connected`);
      const dialogs = await this.dialogsService.findAllDialogs(user);
      console.log(dialogs);
      dialogs.forEach((dialog) => {
        socket.join(dialog['_id'].toString());
      });

      console.log(socket.id + ' now in rooms ', socket.rooms);
      this.server.to(socket.id).emit('fetchDialogs', dialogs);
    } else {
      socket.disconnect();
    }
  }
  async handleDisconnect(socket: Socket) {
    const user = await this.authService.verifyAccessToken(
        socket.handshake.headers.authorization,
    );
    await this.usersService.updateSocketId(user, null);
    console.log(`${socket.id} disconnected`);
  }

  @SubscribeMessage('fetchDialogs')
  async findAllDialogs(@ConnectedSocket() socket: Socket) {
    this.server.to(socket.id).emit('fetchDialogs', 'here is your dialogs');
  }

  @SubscribeMessage('findParticipant')
  async findParticipant(
    @ConnectedSocket() socket: Socket,
    @MessageBody() findParticipantDto: FindParticipantDto,
  ) {
    const currentUser = await this.authService.verifyAccessToken(
      socket.handshake.headers.authorization,
    );
    const participant = await this.dialogsService.findParticipant(
      findParticipantDto,
      currentUser,
    );
    this.server.to(socket.id).emit('findParticipant', participant);
  }

  @SubscribeMessage('createDialog')
  async createDialog(
    @ConnectedSocket() socket: Socket,
    @MessageBody() createDialogDto: CreateDialogDto,
  ) {
    const currentUser = await this.authService.verifyAccessToken(
      socket.handshake.headers.authorization,
    );
    const dialog = await this.dialogsService.create(
        currentUser,
        createDialogDto,
    );
    const companionUserSocket = await this.server.sockets.sockets.get(dialog.companion.socketId);
    if(companionUserSocket){
      companionUserSocket.join(dialog.dialog['_id'].toString());
    }
    await socket.join(dialog.dialog['_id'].toString());
    console.log(dialog.dialog['_id'].toString(), socket.id, dialog.companion.socketId);
    this.server.to(socket.id).emit('createDialog', {...dialog.dialog, companionUsername: dialog.companion.username});
    this.server.to(dialog.companion.socketId).emit('createDialog', {...dialog.dialog, companionUsername: currentUser.username});
  }

  @SubscribeMessage('newMessage')
  async sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() newMessageDto: NewMessageDto,
  ) {
    const currentUser = await this.authService.verifyAccessToken(
      socket.handshake.headers.authorization,
    );
    const newMessage = await this.dialogsService.createMessage(
      newMessageDto,
      currentUser,
    );
    const sentByCurrentUser =
      newMessage.sender['_id'].toString() === currentUser['_id'].toString(); // Определение, является ли текущий пользователь отправителем сообщения
    this.server
      .to(newMessageDto.dialogObjectId.toString())
      .emit('newMessage', { ...newMessage, sentByCurrentUser });
  }

  // @SubscribeMessage('startTypingProcess')
  // async StartTypingProcess(
  //     @ConnectedSocket() socket: Socket,
  //     @MessageBody() targetDialogDto: TargetDialogDto,
  // ) {
  //   socket.broadcast.to(targetDialogDto.dialogObjectId).emit('startTypingProcess', '');
  // }
}
