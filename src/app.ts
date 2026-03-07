import cookieParser from 'cookie-parser';
import express, {
  type Request,
  type Response,
  type NextFunction,
  type Express,
} from 'express';
import morgan from 'morgan';
import { config } from '#config/env.ts';
import activityRouter from '#modules/activity/activity.routes.ts';
import notificationRouter from '#modules/notification/notification.routes.ts';
import propertyRouter from '#modules/property/property.routes.ts';
import ticketRouter from '#modules/ticket/ticket.routes.ts';
import userRouter from '#modules/user/user.routes.ts';
import { AppError } from '#utils/error.ts';
import logger from '#utils/logger.ts';
import { rateLimiterMiddleware } from '#utils/rateLimiter.ts';

const app: Express = express();
app.use(rateLimiterMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }),
);

app.get('/', (req, res) => {
  logger.info('Hello from Property Maintenance API!');
  res.status(200).json('Hello from Property Maintenance API!');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is healthy',
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Property Maintenance API is running!!' });
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/activity', activityRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/properties', propertyRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ) => {
    logger.error(`Error: ${err.message}`, {
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        error: err.message,
      });
    }

    const message =
      config.nodeEnv === 'production' ? 'Something went wrong' : err.message;
    return res.status(500).json({
      error: message,
    });
  },
);

export default app;
