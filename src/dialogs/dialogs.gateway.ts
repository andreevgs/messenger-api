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
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    const user = await this.authService.verifyAccessToken(
      socket.handshake.headers.authorization,
    );
    if (user) {
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
    socket.emit('createDialog', dialog);
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
}
