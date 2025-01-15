import { NotificationCategory, User, UserDocument } from '../models/User';

const sendNotification: (
  message: string,
  notificationType: NotificationCategory,
  userId: UserDocument | null,
  findUser?: boolean
) => Promise<void> = async (message, notificationType, userId, findUser) => {
  let user = userId;
  if (findUser) {
    user = await User.findById(userId);
  }
  user?.notifications.push({
    category: notificationType,
    message: message,
    isRead: false,
    createdAt: new Date()
  });
  await user?.save();
};

export { sendNotification };
