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

const setCookies = (res: any, accessToken: string, refreshToken: string) => {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

export const RegisterUser = async (req: any, res: any) => {
  try {
    const { email } = req.body;
    logger.info(`Register request for email: ${email}`);

    const { accessToken, refreshToken } = await userService.RegisterUser(
      req.body,
    );
    setCookies(res, accessToken, refreshToken);

    logger.info(`User registered successfully: ${email}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    logger.error(`Register failed: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const LoginUser = async (req: any, res: any) => {
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
  } catch (error: any) {
    logger.error(`Login failed: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const GetCurrentUser = async (req: any, res: any) => {
  try {
    const user = await userService.GetCurrentUser(req.user.userId);
    logger.info(`Fetched current user: ${user.email}`);
    res.status(200).json({ user });
  } catch (error: any) {
    logger.error(`GetCurrentUser failed: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const GetUsers = async (req: any, res: any) => {
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
  } catch (error: any) {
    logger.error(`GetUsers failed: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const GetUserById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    logger.info(`Manager fetching user by id: ${id}`);

    const user = await userService.GetUserByIdForManager(id);
    res.status(200).json({ user });
  } catch (error: any) {
    logger.error(`GetUserById failed: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const UpdateUserById = async (req: any, res: any) => {
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
  } catch (error: any) {
    logger.error(`UpdateUserById failed: ${error.message || error}`);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Internal Server Error' });
  }
};

export const RefreshToken = async (req: any, res: any) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const { accessToken, refreshToken } = userService.RefreshAccessToken(token);
    setCookies(res, accessToken, refreshToken);

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error: any) {
    logger.error(`RefreshToken failed: ${error.message || error}`);
    res
      .status(error.statusCode || 401)
      .json({ message: error.message || 'Invalid refresh token' });
  }
};

export const LogoutUser = (_req: any, res: any) => {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully' });
};
