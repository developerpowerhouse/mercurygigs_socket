import { Body, Controller, Logger, Post } from "@nestjs/common";
import { NotificationService } from "./notification.service";

@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
    ) { }
    private readonly logger = new Logger(NotificationController.name);

}
