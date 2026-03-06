import cookieParser from 'cookie-parser';
import express, { type Request, type Response, type NextFunction, type Express } from 'express';
import propertyRouter from './modules/property/property.routes.ts';
import ticketRouter from './modules/ticket/ticket.routes.ts';
import userRouter from './modules/user/user.routes.ts';
import logger from '#utils/logger.ts';
import morgan from 'morgan';
import dotenv from 'dotenv';
import activityRouter from '#modules/activity/activity.routes.ts';
import notificationRouter from '#modules/notification/notification.routes.ts';

dotenv.config()

// Initialize Express app
const app: Express = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));   

app.use(
    morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    })
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


app.use('/api/v1/users', userRouter) // User Routes
app.use('/api/v1/notifications', notificationRouter) // Notification Routes
app.use('/api/v1/activity', activityRouter) // Activity Routes
app.use('/api/v1/tickets', ticketRouter) // Ticket Routes
app.use('/api/v1/properties', propertyRouter) // Property Routes    

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

export default app