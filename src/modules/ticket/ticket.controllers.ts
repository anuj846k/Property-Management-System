import type { Request, Response } from 'express';
import { AppError } from '#utils/error.ts';
import logger from '#utils/logger.ts';
import {
  ticketCreateSchema,
  ticketListQuerySchema,
  ticketProgressSchema,
  ticketAssignSchema,
  ticketUpdateSchema,
} from '#validations/ticket.validations.ts';
import type { ListTicketsFilters } from './ticket.repositories.ts';
import {
  createTicketService,
  getAllTicketsService,
  getAssignedTicketsService,
  getMyTicketsService,
  getTicketByIdService,
  updateTicketProgressService,
  assignTicketService,
  updateTicketService,
} from './ticket.services.ts';

// Extend Express Request to include user and files
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
  files?: Express.Multer.File[];
}

// Helper for safe error handling
function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
}

export const createTicketController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const files = req.files;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const parseResult = ticketCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(messages, 400);
    }

    const data = parseResult.data;
    logger.info(`CreateTicket request by userId=${user.userId} title=${data.title}`);

    const ticket = await createTicketService(user.userId, user.userId, data, files);
    res.status(201).json({ ticket });
  } catch (error: unknown) {
    logger.error(`createTicketController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};

export const getMyTicketsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
      const user = req.user;
      if (!user?.userId) {
        throw new AppError('Unauthorized', 401);
      }

    logger.info(`getMyTickets request by userId=${user.userId}`);
    const tickets = await getMyTicketsService(user.userId);

    res.status(200).json({ tickets });
  } catch (error: unknown) {
    logger.error(`getMyTicketsController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};

export const getAllTicketsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
      if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const parseResult = ticketListQuerySchema.safeParse(req.query);
    const filters = parseResult.success ? parseResult.data : undefined;

    logger.info(`getAllTickets request by managerId=${user.userId}`, { filters });

    const results = await getAllTicketsService(user.userId, filters as ListTicketsFilters);
    res.status(200).json({ tickets: results });
  } catch (error: unknown) {
    logger.error(`getAllTicketsController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};

export const getTicketByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const ticketId = req.params.id;
    if (!ticketId) {
      throw new AppError('Ticket ID is required', 400);
    }

    logger.info(`getTicketById request ticketId=${ticketId} by userId=${user.userId}`);

    const result = await getTicketByIdService(ticketId as string, { userId: user.userId, role: user.role });
    res.status(200).json(result);
  } catch (error: unknown) {
    logger.error(`getTicketByIdController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};

export const assignTicketController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const ticketId = req.params.id;
      if (!ticketId) {
      throw new AppError('Ticket ID is required', 400);
    }

    const parseResult = ticketAssignSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(messages, 400);
    }

    logger.info(
      `assignTicket request ticketId=${ticketId} technicianId=${parseResult.data.technicianId} by managerId=${user.userId}`
    );

    const ticket = await assignTicketService(ticketId as string, user.userId, parseResult.data);
    res.status(200).json({ ticket });
  } catch (error: unknown) {
    logger.error(`assignTicketController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};

export const updateTicketController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const ticketId = req.params.id;
    if (!ticketId) {
      throw new AppError('Ticket ID is required', 400);
    }

    const parseResult = ticketUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(messages, 400);
    }

    logger.info(`updateTicket request ticketId=${ticketId} by managerId=${user.userId}`, { data: parseResult.data });

    const ticket = await updateTicketService(ticketId as string, user.userId, parseResult.data);
    res.status(200).json({ ticket });
  } catch (error: unknown) {
    logger.error(`updateTicketController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};

export const getAssignedTicketsController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const tickets = await getAssignedTicketsService(user.userId);
    res.status(200).json({ tickets });
  } catch (error: unknown) {
    logger.error(`getAssignedTicketsController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};

export const updateTicketProgressController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const ticketId = req.params.id;
    if (!ticketId) {
      throw new AppError('Ticket ID is required', 400);
    }

    const parseResult = ticketProgressSchema.safeParse(req.body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(messages, 400);
    }

    const ticket = await updateTicketProgressService(ticketId as string, user.userId, parseResult.data);
    res.status(200).json({ ticket });
  } catch (error: unknown) {
    logger.error(`updateTicketProgressController error: ${error instanceof Error ? error.message : error}`);
    handleError(res, error);
  }
};