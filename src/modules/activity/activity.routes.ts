import { Router } from "express";
import { isAuthenticated, authorizeRoles } from "../user/user.middlewares.ts";
import { getTicketActivityController } from "./activity.controllers.ts";

const activityRouter: Router = Router();

activityRouter.get(
  "/:id/activity",
  isAuthenticated,
  authorizeRoles("MANAGER", "TENANT", "TECHNICIAN"),
  getTicketActivityController
);

export default activityRouter;