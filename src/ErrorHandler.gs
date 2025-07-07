/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Error Handling and Logging for Smart Email Automation
 * Provides centralized error handling and logging functionality
 */

/**
 * ErrorHandler class for centralized error handling and logging
 */
function ErrorHandler() {
  this.logEntries_ = [];
  this.maxLogEntries_ = LogConfig.MAX_LOG_ENTRIES;
  this.enableDebugLogging_ = LogConfig.ENABLE_DEBUG_LOGGING;
}

/**
 * Log levels for different types of messages
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Logs an error with context information
 * @param {string} operation - The operation where the error occurred
 * @param {Error|string} error - The error object or message
 * @param {Object} context - Additional context information
 */
ErrorHandler.prototype.logError = function(operation, error, context = {}) {
  const errorMessage = error instanceof Error ? error.message : error;
  const logEntry = this.createLogEntry_(LogLevel.ERROR, operation, errorMessage, context);
  
  // PATTERN: Use standard console.log format
  console.log('ERROR in %s: %s', operation, errorMessage);
  
  // Store log entry
  this.addLogEntry_(logEntry);
  
  // Write to log sheet if available
  this.writeToLogSheet_(logEntry);
};

/**
 * Logs a warning message
 * @param {string} operation - The operation context
 * @param {string} message - Warning message
 * @param {Object} context - Additional context information
 */
ErrorHandler.prototype.logWarning = function(operation, message, context = {}) {
  const logEntry = this.createLogEntry_(LogLevel.WARN, operation, message, context);
  
  console.log('WARNING in %s: %s', operation, message);
  this.addLogEntry_(logEntry);
  this.writeToLogSheet_(logEntry);
};

/**
 * Logs an informational message
 * @param {string} operation - The operation context
 * @param {string} message - Info message
 * @param {Object} context - Additional context information
 */
ErrorHandler.prototype.logInfo = function(operation, message, context = {}) {
  const logEntry = this.createLogEntry_(LogLevel.INFO, operation, message, context);
  
  console.log('INFO in %s: %s', operation, message);
  this.addLogEntry_(logEntry);
  
  if (this.enableDebugLogging_) {
    this.writeToLogSheet_(logEntry);
  }
};

/**
 * Logs a debug message (only if debug logging is enabled)
 * @param {string} operation - The operation context
 * @param {string} message - Debug message
 * @param {Object} context - Additional context information
 */
ErrorHandler.prototype.logDebug = function(operation, message, context = {}) {
  if (!this.enableDebugLogging_) {
    return;
  }
  
  const logEntry = this.createLogEntry_(LogLevel.DEBUG, operation, message, context);
  
  console.log('DEBUG in %s: %s', operation, message);
  this.addLogEntry_(logEntry);
};

/**
 * Handles an error with retry logic
 * @param {Function} operation - The operation to retry
 * @param {string} operationName - Name of the operation for logging
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} backoffMs - Initial backoff delay in milliseconds
 * @returns {*} Result of the operation or throws error after max retries
 */
ErrorHandler.prototype.handleWithRetry = function(operation, operationName, maxRetries = 3, backoffMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      this.logDebug(operationName, `Attempt ${attempt}/${maxRetries}`);
      return operation();
      
    } catch (error) {
      lastError = error;
      this.logWarning(operationName, `Attempt ${attempt} failed: ${error.message}`);
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delay = backoffMs * Math.pow(RateLimiterConfig.BACKOFF_MULTIPLIER, attempt - 1);
        this.logDebug(operationName, `Waiting ${delay}ms before retry`);
        Utilities.sleep(delay);
      }
    }
  }
  
  // All attempts failed
  this.logError(operationName, `All ${maxRetries} attempts failed: ${lastError.message}`);
  throw lastError;
};

/**
 * Wraps a function with error handling
 * @param {Function} func - Function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @param {*} defaultReturn - Default value to return on error
 * @returns {Function} Wrapped function with error handling
 */
ErrorHandler.prototype.wrapFunction = function(func, operationName, defaultReturn = null) {
  const self = this;
  
  return function() {
    try {
      return func.apply(this, arguments);
    } catch (error) {
      self.logError(operationName, error);
      return defaultReturn;
    }
  };
};

/**
 * Validates operation result and logs accordingly
 * @param {*} result - Result to validate
 * @param {string} operation - Operation name
 * @param {Function} validator - Optional validation function
 * @returns {boolean} True if result is valid
 */
ErrorHandler.prototype.validateResult = function(result, operation, validator = null) {
  try {
    // Use custom validator if provided
    if (validator && typeof validator === 'function') {
      const isValid = validator(result);
      if (!isValid) {
        this.logWarning(operation, 'Result failed custom validation');
        return false;
      }
    }
    
    // Basic validation
    if (result === null || result === undefined) {
      this.logWarning(operation, 'Result is null or undefined');
      return false;
    }
    
    this.logDebug(operation, 'Result validation passed');
    return true;
    
  } catch (error) {
    this.logError(operation, `Error validating result: ${error.message}`);
    return false;
  }
};

/**
 * Gets recent log entries
 * @param {number} maxEntries - Maximum number of entries to return
 * @param {string} level - Optional filter by log level
 * @returns {Array<Object>} Array of log entries
 */
ErrorHandler.prototype.getRecentLogs = function(maxEntries = 50, level = null) {
  let logs = this.logEntries_.slice(-maxEntries);
  
  if (level) {
    logs = logs.filter(entry => entry.level === level);
  }
  
  return logs;
};

/**
 * Clears all stored log entries
 */
ErrorHandler.prototype.clearLogs = function() {
  this.logEntries_ = [];
  this.logInfo('ErrorHandler', 'Log entries cleared');
};

/**
 * Gets error statistics
 * @returns {Object} Statistics about logged errors
 */
ErrorHandler.prototype.getErrorStats = function() {
  const stats = {
    total: this.logEntries_.length,
    byLevel: {}
  };
  
  // Count by level
  for (const level of Object.values(LogLevel)) {
    stats.byLevel[level] = this.logEntries_.filter(entry => entry.level === level).length;
  }
  
  return stats;
};

/**
 * Creates a structured log entry
 * @private
 * @param {string} level - Log level
 * @param {string} operation - Operation context
 * @param {string} message - Log message
 * @param {Object} context - Additional context
 * @returns {Object} Structured log entry
 */
ErrorHandler.prototype.createLogEntry_ = function(level, operation, message, context) {
  return {
    timestamp: new Date(),
    level: level,
    operation: operation,
    message: message,
    context: context,
    sessionId: Session.getTemporaryActiveUserKey()
  };
};

/**
 * Adds a log entry to internal storage
 * @private
 * @param {Object} logEntry - Log entry to add
 */
ErrorHandler.prototype.addLogEntry_ = function(logEntry) {
  this.logEntries_.push(logEntry);
  
  // Keep only the most recent entries
  if (this.logEntries_.length > this.maxLogEntries_) {
    this.logEntries_ = this.logEntries_.slice(-this.maxLogEntries_);
  }
};

/**
 * Writes log entry to log sheet if available
 * @private
 * @param {Object} logEntry - Log entry to write
 */
ErrorHandler.prototype.writeToLogSheet_ = function(logEntry) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) return;
    
    let logSheet;
    try {
      logSheet = spreadsheet.getSheetByName(LogConfig.LOG_SHEET_NAME);
    } catch (error) {
      // Sheet doesn't exist, create it
      logSheet = spreadsheet.insertSheet(LogConfig.LOG_SHEET_NAME);
      this.initializeLogSheet_(logSheet);
    }
    
    if (logSheet) {
      const row = [
        logEntry.timestamp,
        logEntry.level,
        logEntry.operation,
        logEntry.message,
        JSON.stringify(logEntry.context)
      ];
      
      logSheet.appendRow(row);
    }
    
  } catch (error) {
    // Don't log this error to avoid recursion
    console.log('Failed to write to log sheet: %s', error.message);
  }
};

/**
 * Initializes the log sheet with headers
 * @private
 * @param {Sheet} sheet - Sheet to initialize
 */
ErrorHandler.prototype.initializeLogSheet_ = function(sheet) {
  try {
    const headers = ['Timestamp', 'Level', 'Operation', 'Message', 'Context'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    
  } catch (error) {
    console.log('Failed to initialize log sheet: %s', error.message);
  }
};

/**
 * Global error handler instance
 */
let globalErrorHandler = null;

/**
 * Gets the global error handler instance
 * @returns {ErrorHandler} Global error handler
 */
function getErrorHandler() {
  if (!globalErrorHandler) {
    globalErrorHandler = new ErrorHandler();
  }
  return globalErrorHandler;
}

/**
 * Helper function for quick error logging
 * @param {string} operation - Operation context
 * @param {Error|string} error - Error to log
 * @param {Object} context - Additional context
 */
function logError(operation, error, context = {}) {
  getErrorHandler().logError(operation, error, context);
}

/**
 * Helper function for quick info logging
 * @param {string} operation - Operation context
 * @param {string} message - Message to log
 * @param {Object} context - Additional context
 */
function logInfo(operation, message, context = {}) {
  getErrorHandler().logInfo(operation, message, context);
}