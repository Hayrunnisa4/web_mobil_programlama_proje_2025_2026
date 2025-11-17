import dotenv from 'dotenv';
import app from './app.js';
import logger from './utils/logger.js';
import pool from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Server start failed', { error: err.message });
    process.exit(1);
  }
}

start();

