import type { Request, Response } from 'express';
import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import { getTicketActivityService } from './activity.services.ts';

export const getTicketActivityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = req.user;
    if (!user || !user.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const ticketId = req.params.id;
    if (!ticketId) {
      throw new AppError('Ticket id is required', 400);
    }

    const activity = await getTicketActivityService(ticketId as string, user);
    res.status(200).json({ activity });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(
      `getTicketActivityController error: ${message}`,
    );
    res.status(statusCode).json({ message: message || 'Internal Server Error' });
  }
};
