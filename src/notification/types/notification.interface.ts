export interface Notification {
    notificationId?: string;
    userId?: string;
       title?: string;
       description?: string;
       isRead: Boolean,
       deletedAt?: Boolean;
       createdAt?: Date;
       updatedAt?: Date;
    };