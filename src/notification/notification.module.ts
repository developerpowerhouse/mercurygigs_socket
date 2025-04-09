import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { DynamooseModule } from "nestjs-dynamoose";
import { NotificationSchema } from "src/model/notification.model";
import { NotificationsGateway } from "./notifications.gateway";

@Module({
    imports: [
        DynamooseModule.forFeature([
            {
                name: 'Notification',
                schema: NotificationSchema,
                options: {
                    tableName: `notifications-${process.env.NODE_ENV === 'prod' ? 'prod' : 'staging'}`,
                },
            },
        ])
    ],
    controllers: [NotificationController],
    providers: [NotificationsGateway, NotificationService]
})

export class NotificationModule { }