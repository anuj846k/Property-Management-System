import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import type { PropertyCreateInput } from '#validations/property.validations.ts';
import {
  createProperty,
  findPropertiesByManagerId,
  findPropertyById,
  findUnitsByPropertyId,
  updatePropertyManager,
} from './property.repositories.ts';

export const createPropertyService = async (
  managerId: string,
  data: PropertyCreateInput,
) => {
  try {
    logger.info(
      `createPropertyService called by managerId=${managerId} name=${data.name}`,
    );

    const property = await createProperty({
      name: data.name,
      address: data.address,
      managerId,
    });

    logger.info(
      `Property created id=${property?.id} by managerId=${managerId}`,
    );
    return property;
  } catch (error: any) {
    logger.error(`createPropertyService error: ${error.message || error}`);
    throw error;
  }
};

export const getPropertiesForManagerService = async (managerId: string) => {
  try {
    logger.info(`getPropertiesForManagerService for managerId=${managerId}`);
    const props = await findPropertiesByManagerId(managerId);
    logger.info(
      `Fetched ${props.length} properties for managerId=${managerId}`,
    );
    return props;
  } catch (error: any) {
    logger.error(
      `getPropertiesForManagerService error: ${error.message || error}`,
    );
    throw error;
  }
};

export const getPropertyByIdService = async (
  propertyId: string,
  managerId: string,
) => {
  const property = await findPropertyById(propertyId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }
  if (property.managerId !== managerId) {
    throw new AppError('You can only view properties you manage', 403);
  }
  const unitsList = await findUnitsByPropertyId(propertyId);
  return { property, units: unitsList };
};

import { findUserById } from '../user/user.repositories.ts';

// ...

export const assignManagerToPropertyService = async (
  propertyId: string,
  newManagerId: string,
) => {
  const property = await findPropertyById(propertyId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

  const user = await findUserById(newManagerId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  if (user.role !== 'MANAGER') {
    throw new AppError('Target user must have role MANAGER', 400);
  }

  const updated = await updatePropertyManager(propertyId, newManagerId);
  logger.info(`Property ${propertyId} assigned to manager ${newManagerId}`);
  return updated;
};
