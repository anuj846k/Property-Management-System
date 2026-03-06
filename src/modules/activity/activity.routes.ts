import { Router } from 'express';
import { getTicketActivityController } from './activity.controllers.ts';
import { isAuthenticated, authorizeRoles } from '../user/user.middlewares.ts';

const activityRouter: Router = Router();

activityRouter.get(
  '/:id',
  isAuthenticated,
  authorizeRoles('MANAGER', 'TENANT', 'TECHNICIAN'),
  getTicketActivityController,
);

export default activityRouter;
