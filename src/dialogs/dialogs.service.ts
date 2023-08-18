import { Injectable } from '@nestjs/common';
import { CreateDialogDto } from './dto/create-dialog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Model } from 'mongoose';
import { Dialog, DialogDocument } from './schemas/dialog.schema';
import { NewMessageDto } from './dto/new-message.dto';
import { Message, MessageDocument } from './schemas/message.schema';
import { FindParticipantDto } from './dto/find-participant.dto';

@Injectable()
export class DialogsService {
  constructor(
    @InjectModel(Dialog.name) private dialogModel: Model<DialogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(currentUser: User, createDialogDto: CreateDialogDto) {
    const participantUser = await this.userModel
      .findOne({ username: createDialogDto.username })
      .exec();
    const newDialog = await new this.dialogModel({
      participants: [currentUser, participantUser],
    }).save();
    return {
      dialog: {
        ...newDialog.toObject(),
      },
      companion: {
        username: participantUser.username,
        socketId: participantUser.socketId,
      }
    };
  }

  async findAllDialogs(user: User) {
    const dialogs = await this.dialogModel.aggregate([
      { $match: { participants: user['_id'] } },
      {
        $lookup: {
          from: 'messages',
          let: { dialogId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$dialog', '$$dialogId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 20 },
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender',
              },
            },
            { $unwind: '$sender' },
            { $project: { _id: 1, text: 1, sender: '$sender' } },
          ],
          as: 'messages',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participants',
        },
      },
      {
        $project: {
          _id: 1,
          participants: '$participants',
          messages: { $reverseArray: '$messages' },
        },
      },
    ]);
    return dialogs.map((dialog) => {
      const companion = dialog.participants.find(
        (participant) =>
          participant['_id'].toString() !== user['_id'].toString(),
      );
      return { ...dialog, companionUsername: companion.username };
    });
  }

  async createMessage(
    newMessageDto: NewMessageDto,
    currentUser: User,
  ): Promise<Message> {
    const dialog = await this.dialogModel.findById(
      newMessageDto.dialogObjectId,
    );
    const newMessage = await new this.messageModel({
      sender: currentUser,
      dialog,
      text: newMessageDto.text,
    }).save();
    return newMessage.toObject();
  }

  async findParticipant(
    findParticipantDto: FindParticipantDto,
    currentUser: User,
  ) {
    const dialogIds = await this.dialogModel
      .find({ participants: currentUser['_id'] })
      .distinct('_id')
      .exec();
    const nameFilter = findParticipantDto.username
      ? { username: new RegExp(findParticipantDto.username, 'i') }
      : {};

    const users = await this.userModel
      .aggregate([
        {
          $match: {
            _id: { $ne: currentUser['_id'].toString() },
            ...nameFilter,
          },
        },
        {
          $lookup: {
            from: this.dialogModel.collection.name,
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$$userId', '$participants'] },
                      { $not: { $in: ['$id', dialogIds] } },
                    ],
                  },
                },
              },
            ],
            as: 'dialogs',
          },
        },
        {
          $match: {
            dialogs: { $size: 0 },
          },
        },
      ])
      .exec();
    return users;
  }
}
