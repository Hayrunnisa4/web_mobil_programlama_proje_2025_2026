import cron from 'node-cron';
import pool from '../config/database.js';
import logger from '../utils/logger.js';

function runUpdate() {
  return pool
    .query('SELECT update_overdue_status()')
    .then(() => logger.info('Overdue status job executed'))
    .catch((err) => logger.error('Overdue status job failed', { error: err.message }));
}

export function startOverdueJob() {
  const schedule = process.env.OVERDUE_CRON_SCHEDULE || '0 * * * *'; // hourly
  logger.info(`Overdue cron scheduled with pattern "${schedule}"`);
  cron.schedule(schedule, runUpdate, { timezone: process.env.CRON_TIMEZONE || 'UTC' });
  if (process.env.RUN_OVERDUE_ON_BOOT !== 'false') {
    runUpdate();
  }
}

