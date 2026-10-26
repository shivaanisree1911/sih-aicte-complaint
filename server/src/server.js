import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startDeadlineJob } from './jobs/deadlineChecker.js';
import { logger } from './utils/logger.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();
    
    // Start recurring deadline check job (every 30 minutes)
    startDeadlineJob(30 * 60 * 1000);

    const server = app.listen(PORT, () => {
      logger.info(`=======================================================`);
      logger.info(` AICTE Complaint Monitoring API running on port ${PORT}`);
      logger.info(` Health Check: http://localhost:${PORT}/api/health`);
      logger.info(` Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`=======================================================`);
    });

    const shutdown = () => {
      logger.info('Shutting down AICTE API server gracefully...');
      server.close(() => {
        logger.info('Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Fatal startup error:', err);
    process.exit(1);
  }
}

bootstrap();
