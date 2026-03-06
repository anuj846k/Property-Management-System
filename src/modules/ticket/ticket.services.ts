import { uploadToCloudinary } from "#utils/cloudinary.ts";
import { AppError } from "#utils/ErrorUtil.ts";
import logger from "#utils/logger.ts";
import type { TicketCreateInput } from "#validations/ticket.validations.ts";
import { findPropertyById } from "../property/property.repositories.ts";
import {
  createActivityLog,
  createTicket,
  createTicketImage,
  findActivityLogsByTicketId,
  findAllTicketsForManager,
  findTicketById,
  findTicketImagesByTicketId,
  findTicketsByTenantId,
  findUnitByPropertyAndNumber,
  findUnitById,
} from "./ticket.repositories.ts";
import type { ListTicketsFilters } from "./ticket.repositories.ts";

export const createTicketService = async (
  userId: string,
  tenantId: string,
  data: TicketCreateInput,
  files?: Express.Multer.File[]
) => {
  try {
    if (!data.unit) {
      throw new AppError("Unit is required", 400);
    }

    const unit = await findUnitByPropertyAndNumber(data.propertyId, data.unit);
    if (!unit) {
      throw new AppError("Unit not found for this property", 404);
    }

    let priority: "LOW" | "MEDIUM" | "HIGH";
    if (!data.priority) {
      priority = "MEDIUM";
    } else if (data.priority === "URGENT") {
      priority = "HIGH";
    } else {
      priority = data.priority;
    }

    const bodyImageUrls = data.imageUrls ?? [];
    let cloudinaryImageUrls: string[] = [];

    if (files && files.length > 0) {
        cloudinaryImageUrls = await Promise.all(
          files.map(async (file: Express.Multer.File) => {
            const fileSource = file.path || file.buffer;
            const url = await uploadToCloudinary(fileSource);
            return url;
          })
        );
      }

      const allImageUrls = [...bodyImageUrls, ...cloudinaryImageUrls];

    const ticket = await createTicket({
      title: data.title,
      description: data.description,
      priority,
      tenantId,
      unitId: unit.id,
    });

    if (data.imageUrls && data.imageUrls.length > 0) {
      await Promise.all(
        data.imageUrls.map((url) => createTicketImage(ticket?.id ?? "", url))
      );
    }

        await createActivityLog({
      ticketId: ticket?.id ?? "",
      performedBy: tenantId,
      actionType: "CREATED",
        oldValue: null,
        newValue: `Ticket created with status OPEN and priority ${priority}`,
      });

    logger.info(`Ticket created id=${ticket?.id} by tenantId=${tenantId}`);
    return ticket;
  } catch (error: any) {
    logger.error(`createTicketService error: ${error.message || error}`);
    throw error;
  }
};


export const getMyTicketsService = async (tenantId: string) => {
  try {
    const tickets = await findTicketsByTenantId(tenantId);
    logger.info(`Fetched ${tickets.length} tickets for tenantId=${tenantId}`);
    return tickets;
  } catch (error: any) {
    logger.error(`getMyTicketsService error: ${error.message || error}`);
    throw error;
  }
};

export const getAllTicketsService = async (
  managerId: string,
  filters?: ListTicketsFilters
) => {
  try {
    const results = await findAllTicketsForManager(managerId, filters);
    logger.info(
      `Fetched ${results.length} tickets for managerId=${managerId} with filters`,
      { filters }
    );
    return results;
  } catch (error: any) {
    logger.error(`getAllTicketsService error: ${error.message || error}`);
    throw error;
  }
};

type UserForAccess = { userId: string; role: string };

export const getTicketByIdService = async (
  ticketId: string,
  user: UserForAccess
) => {
  const ticket = await findTicketById(ticketId);
  if (!ticket) {
    throw new AppError("Ticket not found", 404);
  }

  if (user.role === "TENANT") {
    if (ticket.tenantId !== user.userId) {
      throw new AppError("You do not have access to this ticket", 403);
    }
  } else if (user.role === "TECHNICIAN") {
    if (ticket.technicianId !== user.userId) {
      throw new AppError("You do not have access to this ticket", 403);
    }
  } else if (user.role === "MANAGER") {
    const unit = await findUnitById(ticket.unitId);
    if (!unit) {
      throw new AppError("Ticket unit not found", 404);
    }
    const property = await findPropertyById(unit.propertyId);
    if (!property || property.managerId !== user.userId) {
      throw new AppError("You do not have access to this ticket", 403);
    }
  } else {
    throw new AppError("You do not have access to this ticket", 403);
  }

  const [images, activity] = await Promise.all([
    findTicketImagesByTicketId(ticketId),
    findActivityLogsByTicketId(ticketId),
  ]);

  return { ticket, images, activity };
};