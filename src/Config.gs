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
 * @OnlyCurrentDoc
 */

/**
 * Configuration constants for Smart Email Automation system
 */

// Email column names - change these to match your spreadsheet headers
const RECIPIENT_COL = "email";
const EMAIL_SENT_COL = "emailSent";
const ERROR_MESSAGE_COL = "errorMessage";
const FIRST_NAME_COL = "firstName";
const LAST_NAME_COL = "lastName";

// Email status constants
const EmailStatus = {
  PENDING: "pending",
  SENT: "sent", 
  FAILED: "failed",
  PROCESSING: "processing"
};

// Gmail API quotas and rate limits
const GmailQuotas = {
  DAILY_EMAIL_LIMIT: 100,           // Daily email limit for consumer accounts
  RATE_LIMIT_QUOTA_UNITS: 250,     // Max quota units per 100 seconds
  RATE_LIMIT_TIME_WINDOW: 100000,  // 100 seconds in milliseconds
  BATCH_SIZE: 10                   // Number of emails to process in each batch
};

// Sheet configuration
const SheetConfig = {
  REQUIRED_COLUMNS: [FIRST_NAME_COL, LAST_NAME_COL, RECIPIENT_COL],
  DATA_START_ROW: 2,                // First row of data (row 1 is headers)
  MAX_ROWS_PER_BATCH: 100          // Maximum rows to process at once
};

// Default email template structure
const DefaultEmailTemplate = {
  subject: "Hello {{firstName}}",
  body: "Dear {{firstName}} {{lastName}},\n\nThis is an automated email.\n\nBest regards,\nThe Team",
  variables: [FIRST_NAME_COL, LAST_NAME_COL]
};

// Error handling constants
const ErrorMessages = {
  INVALID_SPREADSHEET: "Invalid spreadsheet ID or permissions error",
  MISSING_REQUIRED_COLUMNS: "Required columns missing from spreadsheet",
  QUOTA_EXCEEDED: "Daily email quota exceeded",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded, please try again later",
  INVALID_EMAIL_ADDRESS: "Invalid email address format",
  TEMPLATE_PROCESSING_ERROR: "Error processing email template",
  GMAIL_API_ERROR: "Gmail API error occurred"
};

// Logging configuration
const LogConfig = {
  MAX_LOG_ENTRIES: 1000,
  LOG_SHEET_NAME: "Email_Automation_Log",
  ENABLE_DEBUG_LOGGING: true
};

// UI configuration  
const UIConfig = {
  MENU_NAME: "Email Automation",
  SIDEBAR_TITLE: "Smart Email Automation",
  DIALOG_TITLE: "Email Automation Status"
};

// Rate limiter configuration
const RateLimiterConfig = {
  DEFAULT_QUOTA_UNITS: GmailQuotas.RATE_LIMIT_QUOTA_UNITS,
  DEFAULT_TIME_WINDOW: GmailQuotas.RATE_LIMIT_TIME_WINDOW,
  BACKOFF_MULTIPLIER: 2,           // Exponential backoff multiplier
  MAX_RETRY_ATTEMPTS: 3            // Maximum retry attempts for failed operations
};

// Test mode configuration
const TestConfig = {
  TEST_EMAIL_PREFIX: "[TEST] ",
  TEST_BATCH_SIZE: 2,
  ENABLE_EMAIL_SENDING: false      // Set to false for dry run mode
};