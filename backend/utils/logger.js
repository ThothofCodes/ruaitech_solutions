// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
// Structured logger for production-grade logging

const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const currentLevel = process.env.LOG_LEVEL ? levels[process.env.LOG_LEVEL] : levels.INFO;

function format(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const msg = { timestamp, level, message };
  if (data) msg.data = data;
  return JSON.stringify(msg);
}

module.exports = {
  error: (message, data) => {
    if (levels.ERROR <= currentLevel) console.error(format('ERROR', message, data));
  },
  warn: (message, data) => {
    if (levels.WARN <= currentLevel) console.warn(format('WARN', message, data));
  },
  info: (message, data) => {
    if (levels.INFO <= currentLevel) console.log(format('INFO', message, data));
  },
  debug: (message, data) => {
    if (levels.DEBUG <= currentLevel) console.log(format('DEBUG', message, data));
  },
};
