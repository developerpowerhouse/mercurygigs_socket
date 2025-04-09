import * as dynamoose from 'dynamoose';

export const NotificationSchema = new dynamoose.Schema(
    {
        notificationId: {
            type: String,
            hashKey: true,
        },
        userId: {
            type: String,
            rangeKey: true,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);
