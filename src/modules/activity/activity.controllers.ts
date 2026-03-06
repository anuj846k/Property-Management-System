import type { Request, Response } from 'express';
import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import { getTicketActivityService } from './activity.services.ts';

export const getTicketActivityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const ticketId = req.params.id;
    if (!ticketId) {
      throw new AppError('Ticket id is required', 400);
    }

    const activity = await getTicketActivityService(ticketId as string, user);
    res.status(200).json({ activity });
  } catch (error: any) {
    logger.error(
      `getTicketActivityController error: ${error.message || error}`,
    );
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};
