import { Injectable, Logger } from "@nestjs/common";
import { InjectModel, Model } from "nestjs-dynamoose";
import { Notification } from "./types/notification.interface";
import { NotificationsGateway } from "./notifications.gateway";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel('Notification')
        private notificationModel: Model<Notification, any>,
        private readonly gateway: NotificationsGateway
    ) { }

    private readonly logger = new Logger(NotificationService.name);

}