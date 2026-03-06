import type { Request, Response, NextFunction } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 100, // number of requests
  duration: 900, // per 15 minutes
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip ?? "unknown";

    await rateLimiter.consume(ip);

    next();
  } catch {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }
};
