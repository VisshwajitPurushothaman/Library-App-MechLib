import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
  private logger = new Logger('App');
  private logsDir = 'logs';

  constructor() {
    this.ensureLogsDir();
  }

  private ensureLogsDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(message, context || 'Debug');
    }
  }

  log(message: string, context?: string) {
    this.logger.log(message, context || 'Info');
    this.writeToFile(message, 'info', context);
  }

  error(message: string, stack?: string, context?: string) {
    this.logger.error(message, stack, context || 'Error');
    this.writeToFile(`${message} - ${stack}`, 'error', context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context || 'Warning');
    this.writeToFile(message, 'warn', context);
  }

  private writeToFile(message: string, level: string, context?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${context || 'App'}: ${message}\n`;
    const logFile = path.join(this.logsDir, `${process.env.NODE_ENV || 'dev'}.log`);
    
    fs.appendFileSync(logFile, logMessage, { encoding: 'utf8' });
  }
}
