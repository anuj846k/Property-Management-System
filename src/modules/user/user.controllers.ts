import type { Request, Response } from 'express';
import { AppError } from '#utils/ErrorUtil.ts';
import logger from '#utils/logger.ts';
import * as userService from './user.services.ts';
import { ALLOWED_USER_ROLES, type UserRole } from './user.types.ts';

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
};

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

export const RegisterUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    logger.info(`Register request for email: ${email}`);

    const { accessToken, refreshToken } = await userService.RegisterUser(
      req.body,
    );
    setCookies(res, accessToken, refreshToken);

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`Register failed: ${message}`);
    res
      .status(statusCode)
      .json({ message: message || 'Internal Server Error' });
  }
};

export const LoginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    const { accessToken, refreshToken } = await userService.LoginUser(
      email,
      password,
    );
    setCookies(res, accessToken, refreshToken);

    logger.info(`User logged in successfully: ${email}`);
    res.status(200).json({ message: 'Login successful' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`Login failed: ${message}`);
    res
      .status(statusCode)
      .json({ message: message || 'Internal Server Error' });
  }
};

export const GetCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('Unauthorized', 401);
    }
    const user = await userService.GetCurrentUser(req.user.userId);
    logger.info(`Fetched current user: ${user.email}`);
    res.status(200).json({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`GetCurrentUser failed: ${message}`);
    res
      .status(statusCode)
      .json({ message: message || 'Internal Server Error' });
  }
};

export const GetUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    let roleFilter: UserRole | undefined;

    if (role) {
      if (!ALLOWED_USER_ROLES.includes(role as UserRole)) {
        return res.status(400).json({ message: 'Invalid role filter' });
      }
      roleFilter = role as UserRole;
    }

    const users = await userService.ListUsers(roleFilter);
    res.status(200).json({ users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`GetUsers failed: ${message}`);
    res
      .status(statusCode)
      .json({ message: message || 'Internal Server Error' });
  }
};

export const GetUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(`Manager fetching user by id: ${id}`);

    const user = await userService.GetUserByIdForManager(id);
    res.status(200).json({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`GetUserById failed: ${message}`);
    res
      .status(statusCode)
      .json({ message: message || 'Internal Server Error' });
  }
};

export const UpdateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info(
      `Manager updating user ${id} with body: ${JSON.stringify(req.body)}`,
    );

    const updatedUser = await userService.UpdateUserByIdForManager(
      id,
      req.body,
    );
    res.status(200).json({ user: updatedUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    logger.error(`UpdateUserById failed: ${message}`);
    res
      .status(statusCode)
      .json({ message: message || 'Internal Server Error' });
  }
};

export const RefreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const { accessToken, refreshToken } = userService.RefreshAccessToken(token);
    setCookies(res, accessToken, refreshToken);

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    const statusCode = error instanceof AppError ? error.statusCode : 401;
    logger.error(`RefreshToken failed: ${message}`);
    res
      .status(statusCode)
      .json({ message: message || 'Invalid refresh token' });
  }
};

export const LogoutUser = (_req: Request, res: Response) => {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully' });
};
