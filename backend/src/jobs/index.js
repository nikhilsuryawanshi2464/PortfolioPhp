const Bull = require('bull');
const logger = require('../utils/logger');
const { sendContactNotification, sendContactAutoReply } = require('../utils/email');

// Create job queues
const emailQueue = new Bull('email', process.env.BULL_REDIS_URL || 'redis://localhost:6379');
const analyticsQueue = new Bull('analytics', process.env.BULL_REDIS_URL || 'redis://localhost:6379');

// Email queue processors
emailQueue.process('contact-notification', async (job) => {
  const { contactData } = job.data;
  logger.info(`Processing contact notification for ${contactData.email}`);
  
  try {
    await sendContactNotification(contactData);
    logger.info('Contact notification sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('Failed to send contact notification:', error);
    throw error;
  }
});

emailQueue.process('contact-auto-reply', async (job) => {
  const { contactData } = job.data;
  logger.info(`Processing auto-reply for ${contactData.email}`);
  
  try {
    await sendContactAutoReply(contactData);
    logger.info('Auto-reply sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('Failed to send auto-reply:', error);
    throw error;
  }
});

// Analytics queue processors
analyticsQueue.process('aggregate-daily', async (job) => {
  logger.info('Processing daily analytics aggregation');
  // Implement daily analytics aggregation logic
  return { success: true };
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed:`, result);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});

analyticsQueue.on('completed', (job, result) => {
  logger.info(`Analytics job ${job.id} completed:`, result);
});

analyticsQueue.on('failed', (job, err) => {
  logger.error(`Analytics job ${job.id} failed:`, err);
});

// Add jobs to queue
const addEmailJob = async (jobName, data, options = {}) => {
  try {
    const job = await emailQueue.add(jobName, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false,
      ...options
    });
    logger.info(`Email job ${jobName} added to queue: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add email job ${jobName}:`, error);
    throw error;
  }
};

const addAnalyticsJob = async (jobName, data, options = {}) => {
  try {
    const job = await analyticsQueue.add(jobName, data, options);
    logger.info(`Analytics job ${jobName} added to queue: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add analytics job ${jobName}:`, error);
    throw error;
  }
};

// Initialize jobs
const initializeJobs = async () => {
  logger.info('Initializing background jobs...');
  
  // Schedule daily analytics aggregation (run at midnight)
  await analyticsQueue.add(
    'aggregate-daily',
    {},
    {
      repeat: { cron: '0 0 * * *' },
      removeOnComplete: true
    }
  );
  
  logger.info('Background jobs initialized successfully');
};

// Graceful shutdown
const closeQueues = async () => {
  await emailQueue.close();
  await analyticsQueue.close();
  logger.info('Job queues closed');
};

module.exports = {
  emailQueue,
  analyticsQueue,
  addEmailJob,
  addAnalyticsJob,
  initializeJobs,
  closeQueues
};
