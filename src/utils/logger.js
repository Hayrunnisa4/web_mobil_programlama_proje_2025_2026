const levels = ['debug', 'info', 'warn', 'error'];

const format = (level, message, meta) => {
  const base = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  if (!meta) return base;
  try {
    return `${base} ${JSON.stringify(meta)}`;
  } catch {
    return base;
  }
};

const logger = levels.reduce((acc, level) => {
  acc[level] = (message, meta) => {
    if (level === 'error') {
      console.error(format(level, message, meta));
    } else if (level === 'warn') {
      console.warn(format(level, message, meta));
    } else {
      console.log(format(level, message, meta));
    }
  };
  return acc;
}, {});

export default logger;

