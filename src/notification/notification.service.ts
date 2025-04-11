import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { Notification } from "./types/notification.interface";
import { NotificationsGateway } from "./notifications.gateway";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel('Notification')
        private notificationModel: Model<Notification, any>,
    ) { }

    private readonly logger = new Logger(NotificationService.name);

    async notificationCount(userId: string) {
        try {
            return await this.notificationModel
                .scan('userId')
                .eq(userId)
                .and()
                .where('isRead')
                .eq(false)
                .and()
                .where('isDeleted')
                .eq(false)
                .count()
                .exec();
        } catch (err) {
            this.logger.error(`Error:${JSON.stringify(err)}`);
            if (err?.response?.statusCode) throw err;
            throw new InternalServerErrorException();
        }
    }

}