import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DialogsModule } from './dialogs/dialogs.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './auth/middlewares/auth.middelware';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/messenger'),
    AuthModule,
    UsersModule,
    DialogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
