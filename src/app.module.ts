import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { NotificationsGateway } from './notification/notifications.gateway';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    DynamooseModule.forRoot({
      aws: {
        region: 'us-east-2',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    }),
    NotificationModule
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway],
})
export class AppModule { }
