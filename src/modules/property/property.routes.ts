import { Router } from 'express';
import {
  createPropertyController,
  getPropertiesController,
  getPropertyByIdController,
  assignManagerController,
} from './property.controllers.ts';
import { createUnitController } from '../unit/unit.controllers.ts';
import { isAuthenticated, authorizeRoles } from '../user/user.middlewares.ts';

const propertyRouter: Router = Router();

// POST /api/v1/properties
propertyRouter.post(
  '/',
  isAuthenticated,
  authorizeRoles('ADMIN'),
  createPropertyController,
);

// GET /api/v1/properties
propertyRouter.get(
  '/',
  isAuthenticated,
  authorizeRoles('ADMIN', 'MANAGER'),
  getPropertiesController,
);

// GET /api/v1/properties/:id
propertyRouter.get(
  '/:id',
  isAuthenticated,
  authorizeRoles('ADMIN', 'MANAGER'),
  getPropertyByIdController,
);

// POST /api/v1/properties/:id/assign-manager
propertyRouter.post(
  '/:id/assign-manager',
  isAuthenticated,
  authorizeRoles('ADMIN'),
  assignManagerController,
);

// POST /api/v1/properties/:id/units
propertyRouter.post(
  '/:id/units',
  isAuthenticated,
  authorizeRoles('ADMIN', 'MANAGER'),
  createUnitController,
);

export default propertyRouter;
