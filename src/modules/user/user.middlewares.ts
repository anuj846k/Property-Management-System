import jwt from 'jsonwebtoken';
import logger from '#utils/logger.ts';

export const isAuthenticated = (req: any, res: any, next: any) => {
  const token = req.cookies.access_token;

  if (!token) {
    logger.warn(
      `Unauthorized access attempt from IP: ${req.ip} to ${req.originalUrl}`,
    );
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!);
    req.user = decoded;
    logger.info(`Token verified successfully for userId: ${decoded}`);
    next();
  } catch (error: any) {
    logger.error(
      `Invalid token attempt from IP: ${req.ip} to ${req.originalUrl} - ${error.message}`,
    );
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Forbidden access attempt by userId: ${req.user.userId} with role: ${req.user.role} to ${req.originalUrl}`,
      );
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
