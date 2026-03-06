import { Router } from "express";
import {
  isAuthenticated,
  authorizeRoles,
} from "../user/user.middlewares.ts";
import { createTicketController, getAllTicketsController, getMyTicketsController, getTicketByIdController } from "./ticket.controllers.ts";
import { uploadTicketImages } from "#utils/upload.ts";

const ticketRouter: Router = Router();

ticketRouter.post(
  "/",
  isAuthenticated,
  authorizeRoles("TENANT"),
  uploadTicketImages,
  createTicketController
);

ticketRouter.get(
  "/my",
  isAuthenticated,
  authorizeRoles("TENANT"),
  getMyTicketsController
);

ticketRouter.get(
  "/",
  isAuthenticated,
  authorizeRoles("MANAGER"),
  getAllTicketsController,
);

ticketRouter.get(
  "/:id",
  isAuthenticated,
  authorizeRoles("MANAGER", "TENANT", "TECHNICIAN"),
  getTicketByIdController
);

export default ticketRouter;