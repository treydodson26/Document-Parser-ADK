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
 * Gmail API Wrapper for Smart Email Automation
 * Handles sending emails with rate limiting and quota management
 */

/**
 * EmailSender class for handling Gmail API operations
 */
function EmailSender() {
  // PATTERN: Initialize rate limiter for quota management
  this.rateLimiter_ = new RateLimiter(
    RateLimiterConfig.DEFAULT_QUOTA_UNITS,
    RateLimiterConfig.DEFAULT_TIME_WINDOW
  );
  this.dailyQuotaUsed_ = 0;
  this.testMode_ = !TestConfig.ENABLE_EMAIL_SENDING;
  this.emailsSentToday_ = this.getDailyEmailCount_();
}

/**
 * Sends a single email with proper rate limiting and error handling
 * @param {string} recipient - Email address of the recipient
 * @param {string} subject - Email subject line
 * @param {string} body - Email body content
 * @param {Object} options - Additional email options (htmlBody, attachments, etc.)
 * @returns {Object} Result object with success status and details
 */
EmailSender.prototype.sendEmail = function(recipient, subject, body, options = {}) {
  try {
    // PATTERN: Validate input parameters
    if (!recipient || !this.isValidEmail_(recipient)) {
      throw new Error(ErrorMessages.INVALID_EMAIL_ADDRESS + ': ' + recipient);
    }
    
    if (!subject && !body) {
      throw new Error('Email must have either subject or body');
    }
    
    // PATTERN: Check quotas before sending
    if (this.emailsSentToday_ >= GmailQuotas.DAILY_EMAIL_LIMIT) {
      throw new Error(ErrorMessages.QUOTA_EXCEEDED);
    }
    
    // PATTERN: Acquire rate limit token
    if (!this.rateLimiter_.tryAcquire()) {
      throw new Error(ErrorMessages.RATE_LIMIT_EXCEEDED);
    }
    
    // Test mode handling
    if (this.testMode_) {
      console.log('TEST MODE: Would send email to %s with subject "%s"', recipient, subject);
      return {
        success: true,
        messageId: 'test-message-' + Date.now(),
        recipient: recipient,
        testMode: true
      };
    }
    
    // PATTERN: Use Gmail API with proper error handling
    const emailOptions = Object.assign({
      htmlBody: options.htmlBody || null,
      attachments: options.attachments || [],
      replyTo: options.replyTo || null,
      cc: options.cc || null,
      bcc: options.bcc || null
    }, options);
    
    // Send the email
    let messageId;
    if (emailOptions.htmlBody) {
      // Use GmailApp for HTML emails
      GmailApp.sendEmail(recipient, subject, body, emailOptions);
      messageId = 'gmail-' + Date.now();
    } else {
      // Use MailApp for plain text emails
      MailApp.sendEmail(recipient, subject, body);
      messageId = 'mail-' + Date.now();
    }
    
    // Update counters
    this.emailsSentToday_++;
    this.updateDailyEmailCount_(this.emailsSentToday_);
    
    console.log('Successfully sent email to %s', recipient);
    
    // PATTERN: Return success result
    return {
      success: true,
      messageId: messageId,
      recipient: recipient,
      timestamp: new Date()
    };
    
  } catch (error) {
    // PATTERN: Detailed error logging
    console.log('Failed to send email to %s: %s', recipient, error.message);
    return {
      success: false,
      error: error.message,
      recipient: recipient,
      timestamp: new Date()
    };
  }
};

/**
 * Sends multiple emails with batch processing and error recovery
 * @param {Array<Object>} emailList - Array of email objects with recipient, subject, body
 * @param {Object} globalOptions - Options applied to all emails
 * @returns {Object} Batch result with success count, failures, and details
 */
EmailSender.prototype.sendBatchEmails = function(emailList, globalOptions = {}) {
  const batchResult = {
    totalEmails: emailList.length,
    successCount: 0,
    failureCount: 0,
    results: [],
    errors: []
  };
  
  try {
    if (!emailList || !Array.isArray(emailList) || emailList.length === 0) {
      throw new Error('Email list must be a non-empty array');
    }
    
    console.log('Starting batch email send for %s emails', emailList.length);
    
    // Process emails in smaller batches to manage rate limits
    const batchSize = Math.min(GmailQuotas.BATCH_SIZE, emailList.length);
    
    for (let i = 0; i < emailList.length; i += batchSize) {
      const batch = emailList.slice(i, i + batchSize);
      
      // Process each email in the batch
      for (const emailData of batch) {
        try {
          // Validate email data
          if (!emailData.recipient || !emailData.subject) {
            throw new Error('Each email must have recipient and subject');
          }
          
          // Merge global options with email-specific options
          const emailOptions = Object.assign({}, globalOptions, emailData.options || {});
          
          // Send the email
          const result = this.sendEmail(
            emailData.recipient,
            emailData.subject,
            emailData.body || '',
            emailOptions
          );
          
          batchResult.results.push(result);
          
          if (result.success) {
            batchResult.successCount++;
          } else {
            batchResult.failureCount++;
            batchResult.errors.push({
              recipient: emailData.recipient,
              error: result.error
            });
          }
          
        } catch (error) {
          batchResult.failureCount++;
          batchResult.errors.push({
            recipient: emailData.recipient || 'unknown',
            error: error.message
          });
          
          console.log('Error processing email in batch: %s', error.message);
        }
      }
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < emailList.length) {
        Utilities.sleep(1000); // 1 second delay between batches
      }
    }
    
    console.log('Batch email send completed. Success: %s, Failures: %s', 
                batchResult.successCount, batchResult.failureCount);
    
    return batchResult;
    
  } catch (error) {
    console.log('Failed to send batch emails: %s', error.message);
    batchResult.errors.push({
      recipient: 'batch',
      error: error.message
    });
    return batchResult;
  }
};

/**
 * Enables or disables test mode
 * @param {boolean} enabled - Whether to enable test mode
 */
EmailSender.prototype.setTestMode = function(enabled) {
  this.testMode_ = enabled;
  console.log('Test mode %s', enabled ? 'enabled' : 'disabled');
};

/**
 * Gets the current daily email count
 * @returns {number} Number of emails sent today
 */
EmailSender.prototype.getDailyEmailsSent = function() {
  return this.emailsSentToday_;
};

/**
 * Gets remaining daily email quota
 * @returns {number} Number of emails remaining for today
 */
EmailSender.prototype.getRemainingQuota = function() {
  return Math.max(0, GmailQuotas.DAILY_EMAIL_LIMIT - this.emailsSentToday_);
};

/**
 * Resets the daily email counter (for testing purposes)
 */
EmailSender.prototype.resetDailyCounter = function() {
  this.emailsSentToday_ = 0;
  this.updateDailyEmailCount_(0);
  console.log('Daily email counter reset');
};

/**
 * Validates email address format
 * @private
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
EmailSender.prototype.isValidEmail_ = function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Gets the daily email count from PropertiesService
 * @private
 * @returns {number} Current daily email count
 */
EmailSender.prototype.getDailyEmailCount_ = function() {
  try {
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const key = 'daily_email_count_' + today;
    const count = PropertiesService.getScriptProperties().getProperty(key);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.log('Error getting daily email count: %s', error.message);
    return 0;
  }
};

/**
 * Updates the daily email count in PropertiesService
 * @private
 * @param {number} count - New email count
 */
EmailSender.prototype.updateDailyEmailCount_ = function(count) {
  try {
    const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const key = 'daily_email_count_' + today;
    PropertiesService.getScriptProperties().setProperty(key, count.toString());
  } catch (error) {
    console.log('Error updating daily email count: %s', error.message);
  }
};

/**
 * Simple rate limiter implementation
 * @param {number} maxTokens - Maximum number of tokens
 * @param {number} timeWindow - Time window in milliseconds
 */
function RateLimiter(maxTokens, timeWindow) {
  this.maxTokens = maxTokens;
  this.timeWindow = timeWindow;
  this.tokens = maxTokens;
  this.lastRefill = Date.now();
}

/**
 * Attempts to acquire a token from the rate limiter
 * @returns {boolean} True if token was acquired
 */
RateLimiter.prototype.tryAcquire = function() {
  this.refillTokens_();
  
  if (this.tokens > 0) {
    this.tokens--;
    return true;
  }
  
  return false;
};

/**
 * Gets the current number of available tokens
 * @returns {number} Available tokens
 */
RateLimiter.prototype.getAvailableTokens = function() {
  this.refillTokens_();
  return this.tokens;
};

/**
 * Refills tokens based on elapsed time
 * @private
 */
RateLimiter.prototype.refillTokens_ = function() {
  const now = Date.now();
  const timePassed = now - this.lastRefill;
  
  if (timePassed >= this.timeWindow) {
    this.tokens = this.maxTokens;
    this.lastRefill = now;
  }
};