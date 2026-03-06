import type { Request, Response} from 'express';
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

/*
  Custom request type
*/

/*
  Error helper
*/
function handleError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof Error) {
    return res.status(500).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal Server Error' });
}

/*
  CREATE TICKET
*/
export const createTicketController = async (
  req: Request,
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

    logger.info(`CreateTicket request by userId=${user.userId}`);

    const fileArray = Array.isArray(files) ? files : [];
    
    const ticket = await createTicketService(
      user.userId,
      user.userId,
      data,
      fileArray,
    );

    res.status(201).json({ ticket });
  } catch (error) {
    logger.error(
      `createTicketController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};

/*
  MY TICKETS
*/
export const getMyTicketsController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    logger.info(`getMyTickets request by userId=${user.userId}`);

    const tickets = await getMyTicketsService(user.userId);

    res.status(200).json({ tickets });
  } catch (error) {
    logger.error(
      `getMyTicketsController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};

/*
  ALL TICKETS
*/
export const getAllTicketsController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const parseResult = ticketListQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      throw new AppError('Invalid filter values', 400);
    }

    const filters = parseResult.data;

    logger.info(`getAllTickets request by managerId=${user.userId}`);

    const results = await getAllTicketsService(
      user.userId,
      filters as ListTicketsFilters,
    );

    res.status(200).json({ tickets: results });
  } catch (error) {
    logger.error(
      `getAllTicketsController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};

/*
  GET TICKET BY ID
*/
export const getTicketByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;
    const ticketId = req.params.id;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!ticketId) {
      throw new AppError('Ticket ID is required', 400);
    }

    logger.info(`getTicketById request ticketId=${ticketId}`);

    const result = await getTicketByIdService(ticketId as string, {
      userId: user.userId,
      role: user.role,
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error(
      `getTicketByIdController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};

/*
  ASSIGN TICKET
*/
export const assignTicketController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;
    const ticketId = req.params.id;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!ticketId) {
      throw new AppError('Ticket ID required', 400);
    }

    const parseResult = ticketAssignSchema.safeParse(req.body);

    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(messages, 400);
    }

    const ticket = await assignTicketService(
      ticketId as string,
      user.userId,
      parseResult.data,
    );

    res.status(200).json({ ticket });
  } catch (error) {
    logger.error(
      `assignTicketController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};

/*
  UPDATE TICKET
*/
export const updateTicketController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;
    const ticketId = req.params.id;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!ticketId) {
      throw new AppError('Ticket ID required', 400);
    }

    const parseResult = ticketUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(messages, 400);
    }

    const ticket = await updateTicketService(
      ticketId as string,
      user.userId,
      parseResult.data,
    );

    res.status(200).json({ ticket });
  } catch (error) {
    logger.error(
      `updateTicketController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};

/*
  ASSIGNED TICKETS
*/
export const getAssignedTicketsController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    const tickets = await getAssignedTicketsService(user.userId);

    res.status(200).json({ tickets });
  } catch (error) {
    logger.error(
      `getAssignedTicketsController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};

/*
  UPDATE PROGRESS
*/
export const updateTicketProgressController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = req.user;
    const ticketId = req.params.id;

    if (!user?.userId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!ticketId) {
      throw new AppError('Ticket ID required', 400);
    }

    const parseResult = ticketProgressSchema.safeParse(req.body);

    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(messages, 400);
    }

    const ticket = await updateTicketProgressService(
      ticketId as string,
      user.userId,
      parseResult.data,
    );

    res.status(200).json({ ticket });
  } catch (error) {
    logger.error(
      `updateTicketProgressController error: ${
        error instanceof Error ? error.message : error
      }`,
    );

    handleError(res, error);
  }
};