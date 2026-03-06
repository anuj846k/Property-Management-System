import { AppError } from "#utils/ErrorUtil.ts";
import logger from "#utils/logger.ts";
import type { Request, Response } from "express";
import {
  ticketCreateSchema,
  ticketListQuerySchema,
} from "#validations/ticket.validations.ts";
import {
  createTicketService,
  getAllTicketsService,
  getMyTicketsService,
  getTicketByIdService,
} from "./ticket.services.ts";

export const createTicketController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const files = (req as any).files as Express.Multer.File[] | undefined;
    if (!user || !user.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const parseResult = ticketCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues
        .map((i) => i.message)
        .join(", ");
      throw new AppError(messages, 400);
    }

    const data = parseResult.data;

    logger.info(
      `CreateTicket request by userId=${user.userId} title=${data.title}`
    );

    const ticket = await createTicketService(user.userId, user.userId, data, files);

    res.status(201).json({ ticket });
  } catch (error: any) {
    logger.error(`createTicketController error: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

export const getMyTicketsController = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (!user || !user.userId) {
        throw new AppError("Unauthorized", 401);
      }
  
      logger.info(`getMyTickets request by userId=${user.userId}`);
  
      const tickets = await getMyTicketsService(user.userId);
  
      res.status(200).json({ tickets });
    } catch (error: any) {
      logger.error(`getMyTicketsController error: ${error.message || error}`);
      res
        .status(error.statusCode || 500)
        .json({ message: error.message || "Internal Server Error" });
    }
  };

export const getAllTicketsController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const parseResult = ticketListQuerySchema.safeParse(req.query);
    const filters = parseResult.success ? parseResult.data : undefined;

    logger.info(`getAllTickets request by managerId=${user.userId}`, {
      filters,
    });

    const results = await getAllTicketsService(user.userId, filters);
    res.status(200).json({ tickets: results });
  } catch (error: any) {
    logger.error(`getAllTicketsController error: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

export const getTicketByIdController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const ticketId = req.params.id;
    if (!ticketId) {
      throw new AppError("Ticket ID is required", 400);
    }

    logger.info(`getTicketById request ticketId=${ticketId} by userId=${user.userId}`);

    const result = await getTicketByIdService(ticketId, {
      userId: user.userId,
      role: user.role,
    });
    res.status(200).json(result);
  } catch (error: any) {
    logger.error(`getTicketByIdController error: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};