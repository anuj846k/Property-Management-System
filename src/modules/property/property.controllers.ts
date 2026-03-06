import type { Request, Response } from 'express';
import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import {
  assignManagerSchema,
  propertyCreateSchema,
} from '#validations/property.validations.ts';
import {
  assignManagerToPropertyService,
  createPropertyService,
  getPropertiesForManagerService,
  getPropertyByIdService,
} from './property.services.ts';

export const createPropertyController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const parseResult = propertyCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues
        .map((i) => i.message)
        .join(', ');
      throw new AppError(messages, 400);
    }

    const data = parseResult.data;

    logger.info(
      `createPropertyController by userId=${user.userId} name=${data.name}`,
    );

    const property = await createPropertyService(user.userId, data);

    res.status(201).json({ property });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`createPropertyController error: ${message}`);
    res.status(statusCode).json({ message: message || 'Internal Server Error' });
  }
};

export const getPropertiesController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.userId) {
      throw new AppError('Unauthorized', 401);
    }
    logger.info(`getPropertiesController for userId=${user.userId}`);
    const properties = await getPropertiesForManagerService(user.userId);
    res.status(200).json({ properties });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`getPropertiesController error: ${message}`);
    res.status(statusCode).json({ message: message || 'Internal Server Error' });
  }
};

export const getPropertyByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = req.user;
    if (!user || !user.userId) {
      throw new AppError('Unauthorized', 401);
    }
    const { id } = req.params;
    const result = await getPropertyByIdService(id as string, user.userId);
    res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`getPropertyByIdController error: ${message}`);
    res.status(statusCode).json({ message: message || 'Internal Server Error' });
  }
};

// ...

export const assignManagerController = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || !user.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { id } = req.params;
    const parseResult = assignManagerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues
        .map((i) => i.message)
        .join(', ');
      throw new AppError(messages, 400);
    }

    const property = await assignManagerToPropertyService(
      id as string,
      parseResult.data.managerId,
    );
    res.status(200).json({ property });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`assignManagerController error: ${message}`);
    res.status(statusCode).json({ message: message || 'Internal Server Error' });
  }
};
