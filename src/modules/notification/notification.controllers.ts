import type { Request, Response } from 'express';
import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import {
  getMyNotificationsService,
  markAsReadService,
} from './notification.services.ts';
export const getMyNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }
    const notifications = await getMyNotificationsService(user.userId);
    res.status(200).json({ notifications });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(
      `getMyNotificationsController error: ${message}`,
    );
    res.status(statusCode).json({ message: message || 'Internal Server Error' });
  }
};

export const markNotificationAsReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }
    const notificationId = req.params.id;
    if (!notificationId) {
      throw new AppError('Notification id is required', 400);
    }
    const updated = await markAsReadService(
      notificationId as string,
      user.userId,
    );
    res.status(200).json({ notification: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(
      `markNotificationAsReadController error: ${message}`,
    );
    res.status(statusCode).json({ message: message || 'Internal Server Error' });
  }
};
