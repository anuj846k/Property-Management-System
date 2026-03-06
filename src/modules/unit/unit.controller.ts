import type { Request, Response } from 'express';
import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import { createUnitSchema } from '#validations/unit.validations.ts';
import { createUnitService } from './unit.services.ts';

export const createUnitController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { id: propertyId } = req.params;
    const parseResult = createUnitSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues
        .map((i) => i.message)
        .join(', ');
      throw new AppError(messages, 400);
    }

    const unit = await createUnitService(
      propertyId as string,
      user.userId,
      parseResult.data,
    );
    res.status(201).json({ unit });
  } catch (error: any) {
    logger.error(`createUnitController error: ${error.message || error}`);
    res
      .status(error.statusCode ?? 500)
      .json({ message: error.message ?? 'Internal Server Error' });
  }
};
