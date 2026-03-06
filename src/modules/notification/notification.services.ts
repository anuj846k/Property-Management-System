import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import {
  findNotificationsByUserId,
  findNotificationById,
  markNotificationAsRead,
} from './notification.repositories.ts';

// "Get my notifications" – just load them for this user
export const getMyNotificationsService = async (userId: string) => {
  const list = await findNotificationsByUserId(userId);
  logger.info(`Fetched ${list.length} notifications for userId=${userId}`);
  return list;
};

// "Mark one as read" – only if it exists and it's yours
export const markAsReadService = async (
  notificationId: string,
  userId: string,
) => {
  const notification = await findNotificationById(notificationId);
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  if (notification.userId !== userId) {
    throw new AppError('You can only mark your own notifications as read', 403);
  }
  const updated = await markNotificationAsRead(notificationId, userId);
  logger.info(
    `Marked notification ${notificationId} as read for userId=${userId}`,
  );
  return updated;
};
