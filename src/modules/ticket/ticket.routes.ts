import { Router } from 'express';
import { uploadTicketImages } from '#utils/upload.ts';
import {
  createTicketController,
  getAllTicketsController,
  getMyTicketsController,
  getTicketByIdController,
  assignTicketController,
  updateTicketController,
  updateTicketProgressController,
  getAssignedTicketsController,
} from './ticket.controllers.ts';
import { isAuthenticated, authorizeRoles } from '../user/user.middlewares.ts';

const ticketRouter: Router = Router();

ticketRouter.post(
  '/',
  isAuthenticated,
  authorizeRoles('TENANT'),
  uploadTicketImages,
  createTicketController,
);

ticketRouter.get(
  '/my',
  isAuthenticated,
  authorizeRoles('TENANT'),
  getMyTicketsController,
);

ticketRouter.get(
  '/assigned',
  isAuthenticated,
  authorizeRoles('TECHNICIAN'),
  getAssignedTicketsController,
);

ticketRouter.get(
  '/',
  isAuthenticated,
  authorizeRoles('MANAGER'),
  getAllTicketsController,
);

ticketRouter.patch(
  '/:id/assign',
  isAuthenticated,
  authorizeRoles('ADMIN', 'MANAGER'),
  assignTicketController,
);
ticketRouter.patch(
  '/:id/progress',
  isAuthenticated,
  authorizeRoles('TECHNICIAN'),
  updateTicketProgressController,
);
ticketRouter.patch(
  '/:id',
  isAuthenticated,
  authorizeRoles('MANAGER'),
  updateTicketController,
);

ticketRouter.get(
  '/:id',
  isAuthenticated,
  authorizeRoles('MANAGER', 'TENANT', 'TECHNICIAN'),
  getTicketByIdController,
);

export default ticketRouter;
