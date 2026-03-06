import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { hashPassword, VerifyPassword } from '#utils/argon.ts';
import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import { userSchema } from '#validations/user.validations.ts';
import {
  findExistingUser,
  findUserById,
  listUsers,
  registerUser,
  updateUserById,
} from './user.repositories.ts';
import type {
  PublicUser,
  TokenPayload,
  UpdateUserPayload,
  UserRole,
} from './user.types.ts';

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY ||
  '15m') as StringValue;
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY ||
  '7d') as StringValue;

export const RegisterUser = async (data: unknown) => {
  logger.info(`Register attempt with data: ${JSON.stringify(data)}`);

  const validatedData = userSchema.safeParse(data);
  if (!validatedData.success) {
    const messages = validatedData.error.issues
      .map((issue) => issue.message)
      .join(', ');
    logger.warn(`Validation failed: ${messages}`);
    throw new AppError(messages, 400);
  }

  const { name, email, password, role, phone } = validatedData.data;

  const existingUser = await findExistingUser(email, phone);
  if (existingUser) {
    if (existingUser.email === email) {
      logger.warn(`Registration failed - Email already in use: ${email}`);
      throw new AppError('Email already in use', 400);
    }
    if (existingUser.phone === phone) {
      logger.warn(`Registration failed - Phone already in use: ${phone}`);
      throw new AppError('Phone number already in use', 400);
    }
  }

  const hashedPassword = await hashPassword(password);

  const user = await registerUser({ name, email, hashedPassword, phone, role });
  if (!user) {
    logger.error(`Failed to register user: ${email}`);
    throw new AppError('Failed to register user', 500);
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );

  logger.info(`User registered successfully: ${email}`);
  return { accessToken, refreshToken };
};

export const LoginUser = async (email: string, password: string) => {
  logger.info(`Login attempt for email: ${email}`);

  if (!email || !password) {
    logger.warn(`Login failed - Missing credentials`);
    throw new AppError('Email and password are required', 400);
  }

  const user = await findExistingUser(email);
  if (!user) {
    logger.warn(`Login failed - User not found: ${email}`);
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordValid = await VerifyPassword(user.passwordHash, password);
  if (!isPasswordValid) {
    logger.warn(`Login failed - Invalid password: ${email}`);
    throw new AppError('Invalid email or password', 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
  const refreshToken = jwt.sign(
    { userId: user.id, role: user.role },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );

  logger.info(`User logged in successfully: ${email}`);
  return { accessToken, refreshToken };
};

export const GetCurrentUser = async (userId: string) => {
  logger.info(`Fetching user with ID: ${userId}`);
  const user = await findUserById(userId);

  if (!user) {
    logger.warn(`User not found: ${userId}`);
    throw new AppError('User not found', 404);
  }

  logger.info(`Fetched user successfully: ${user.email}`);
  return toPublicUser(user);
};

export const ListUsers = async (role?: UserRole) => {
  logger.info(`Listing users${role ? ` with role: ${role}` : ''}`);
  return listUsers(role);
};

const toPublicUser = (u: PublicUser): PublicUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  createdAt: u.createdAt,
});

export const GetUserByIdForManager = async (
  id: string,
): Promise<PublicUser> => {
  const user = await findUserById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return toPublicUser(user);
};

export const UpdateUserByIdForManager = async (
  id: string,
  payload: UpdateUserPayload,
): Promise<PublicUser> => {
  if (!payload.name && !payload.phone && !payload.role) {
    throw new AppError('No fields to update', 400);
  }

  const updated = await updateUserById(id, payload);
  if (!updated) {
    throw new AppError('User not found', 404);
  }

  return toPublicUser(updated);
};

export const RefreshAccessToken = (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;

    const accessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    );

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`RefreshAccessToken error: ${message}`);
    throw new AppError('Invalid or expired refresh token', 401);
  }
};
