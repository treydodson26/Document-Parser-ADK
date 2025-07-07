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
 * Smart Email Automation - Main Logic
 * Orchestrates the complete email automation workflow
 */

/**
 * Creates the menu item "Email Automation" for user to run scripts on drop-down.
 * PATTERN: Following existing onOpen patterns from mail-merge example
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu(UIConfig.MENU_NAME)
        .addItem('Configure & Send Emails', 'showConfigurationSidebar')
        .addItem('Send Emails Now', 'runEmailAutomation')
        .addItem('Preview Template', 'showTemplatePreview')
        .addSeparator()
        .addItem('View Logs', 'showLogViewer')
        .addItem('Reset Daily Counter', 'resetEmailCounter')
        .addToUi();
        
    logInfo('Menu', 'Email Automation menu created successfully');
  } catch (error) {
    console.log('Failed to create menu: %s', error.message);
  }
}

/**
 * SmartEmailAutomation class for orchestrating the email automation workflow
 */
function SmartEmailAutomation() {
  this.spreadsheetId_ = SpreadsheetApp.getActiveSpreadsheet().getId();
  this.configuration_ = this.loadConfiguration_();
  this.errorHandler_ = getErrorHandler();
  this.dataManager_ = null;
  this.templateProcessor_ = null;
  this.emailSender_ = null;
  this.testMode_ = false;
}

/**
 * Configures the automation with user settings
 * @param {Object} config - Configuration object
 */
SmartEmailAutomation.prototype.configure = function(config) {
  try {
    // Validate configuration
    this.validateConfiguration_(config);
    
    // Update configuration
    this.configuration_ = Object.assign(this.configuration_, config);
    
    // Save configuration
    this.saveConfiguration_();
    
    this.errorHandler_.logInfo('Configuration', 'Automation configured successfully');
    return { success: true };
    
  } catch (error) {
    this.errorHandler_.logError('Configuration', error);
    return { success: false, error: error.message };
  }
};

/**
 * Runs the complete email automation workflow
 * @returns {Object} Result object with success status and details
 */
SmartEmailAutomation.prototype.runAutomation = function() {
  const result = {
    success: false,
    emailsProcessed: 0,
    emailsSent: 0,
    emailsFailed: 0,
    errors: [],
    startTime: new Date(),
    endTime: null
  };
  
  try {
    this.errorHandler_.logInfo('Automation', 'Starting email automation workflow');
    
    // Initialize components
    this.initializeComponents_();
    
    // Step 1: Read email data from spreadsheet
    this.errorHandler_.logInfo('Automation', 'Reading email data from spreadsheet');
    const emailData = this.dataManager_.getPendingEmails();
    
    if (emailData.length === 0) {
      this.errorHandler_.logInfo('Automation', 'No pending emails found');
      result.success = true;
      result.endTime = new Date();
      return result;
    }
    
    result.emailsProcessed = emailData.length;
    this.errorHandler_.logInfo('Automation', `Found ${emailData.length} pending emails`);
    
    // Step 2: Validate email template
    const templateValidation = this.templateProcessor_.validateTemplate(this.configuration_.emailTemplate);
    if (!templateValidation.isValid) {
      throw new Error('Invalid email template: ' + templateValidation.errors.join(', '));
    }
    
    // Step 3: Process emails in batches
    const batchSize = this.testMode_ ? TestConfig.TEST_BATCH_SIZE : GmailQuotas.BATCH_SIZE;
    
    for (let i = 0; i < emailData.length; i += batchSize) {
      const batch = emailData.slice(i, i + batchSize);
      const batchResult = this.processBatch_(batch, i + 1);
      
      result.emailsSent += batchResult.successCount;
      result.emailsFailed += batchResult.failureCount;
      result.errors = result.errors.concat(batchResult.errors);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < emailData.length) {
        Utilities.sleep(2000); // 2 second delay between batches
      }
    }
    
    result.success = true;
    result.endTime = new Date();
    
    this.errorHandler_.logInfo('Automation', 
      `Automation completed. Sent: ${result.emailsSent}, Failed: ${result.emailsFailed}`);
    
    return result;
    
  } catch (error) {
    this.errorHandler_.logError('Automation', error);
    result.errors.push(error.message);
    result.endTime = new Date();
    return result;
  }
};

/**
 * Processes a batch of emails
 * @private
 * @param {Array<Object>} batch - Batch of email data
 * @param {number} batchNumber - Batch number for logging
 * @returns {Object} Batch processing result
 */
SmartEmailAutomation.prototype.processBatch_ = function(batch, batchNumber) {
  const batchResult = {
    successCount: 0,
    failureCount: 0,
    errors: []
  };
  
  this.errorHandler_.logInfo('Batch', `Processing batch ${batchNumber} with ${batch.length} emails`);
  
  for (const emailRow of batch) {
    try {
      // Update status to processing
      this.dataManager_.updateEmailStatus(emailRow._rowIndex, EmailStatus.PROCESSING);
      
      // Process email template
      const processedTemplate = this.templateProcessor_.processEmailTemplate(
        this.configuration_.emailTemplate,
        emailRow
      );
      
      // Send email
      const emailResult = this.emailSender_.sendEmail(
        emailRow[RECIPIENT_COL],
        processedTemplate.subject,
        processedTemplate.body,
        {
          htmlBody: processedTemplate.htmlBody
        }
      );
      
      if (emailResult.success) {
        // Update status to sent
        this.dataManager_.updateEmailStatus(emailRow._rowIndex, EmailStatus.SENT);
        batchResult.successCount++;
        
        this.errorHandler_.logDebug('Email', `Successfully sent to ${emailRow[RECIPIENT_COL]}`);
      } else {
        // Update status to failed with error message
        this.dataManager_.updateEmailStatus(
          emailRow._rowIndex, 
          EmailStatus.FAILED, 
          emailResult.error
        );
        batchResult.failureCount++;
        batchResult.errors.push({
          recipient: emailRow[RECIPIENT_COL],
          error: emailResult.error
        });
        
        this.errorHandler_.logError('Email', `Failed to send to ${emailRow[RECIPIENT_COL]}: ${emailResult.error}`);
      }
      
    } catch (error) {
      // Update status to failed
      this.dataManager_.updateEmailStatus(
        emailRow._rowIndex, 
        EmailStatus.FAILED, 
        error.message
      );
      batchResult.failureCount++;
      batchResult.errors.push({
        recipient: emailRow[RECIPIENT_COL] || 'unknown',
        error: error.message
      });
      
      this.errorHandler_.logError('Batch', error);
    }
  }
  
  return batchResult;
};

/**
 * Enables or disables test mode
 * @param {boolean} enabled - Whether to enable test mode
 */
SmartEmailAutomation.prototype.setTestMode = function(enabled) {
  this.testMode_ = enabled;
  if (this.emailSender_) {
    this.emailSender_.setTestMode(enabled);
  }
  this.errorHandler_.logInfo('TestMode', `Test mode ${enabled ? 'enabled' : 'disabled'}`);
};

/**
 * Gets automation status and statistics
 * @returns {Object} Status information
 */
SmartEmailAutomation.prototype.getStatus = function() {
  try {
    this.initializeComponents_();
    
    const pendingEmails = this.dataManager_.getPendingEmails();
    const remainingQuota = this.emailSender_.getRemainingQuota();
    const errorStats = this.errorHandler_.getErrorStats();
    
    return {
      pendingEmails: pendingEmails.length,
      remainingQuota: remainingQuota,
      testMode: this.testMode_,
      errorStats: errorStats,
      configuration: this.configuration_
    };
    
  } catch (error) {
    this.errorHandler_.logError('Status', error);
    return {
      error: error.message
    };
  }
};

/**
 * Initializes all component instances
 * @private
 */
SmartEmailAutomation.prototype.initializeComponents_ = function() {
  if (!this.dataManager_) {
    this.dataManager_ = new SheetDataManager(this.spreadsheetId_);
  }
  
  if (!this.templateProcessor_) {
    this.templateProcessor_ = new EmailTemplateProcessor();
  }
  
  if (!this.emailSender_) {
    this.emailSender_ = new EmailSender();
    if (this.testMode_) {
      this.emailSender_.setTestMode(true);
    }
  }
};

/**
 * Validates configuration object
 * @private
 * @param {Object} config - Configuration to validate
 */
SmartEmailAutomation.prototype.validateConfiguration_ = function(config) {
  if (!config) {
    throw new Error('Configuration is required');
  }
  
  if (!config.emailTemplate) {
    throw new Error('Email template is required in configuration');
  }
  
  const templateValidation = new EmailTemplateProcessor().validateTemplate(config.emailTemplate);
  if (!templateValidation.isValid) {
    throw new Error('Invalid email template: ' + templateValidation.errors.join(', '));
  }
};

/**
 * Loads configuration from PropertiesService
 * @private
 * @returns {Object} Configuration object
 */
SmartEmailAutomation.prototype.loadConfiguration_ = function() {
  try {
    const configJson = PropertiesService.getScriptProperties().getProperty('automation_config');
    if (configJson) {
      return JSON.parse(configJson);
    }
  } catch (error) {
    this.errorHandler_.logWarning('Configuration', 'Failed to load saved configuration: ' + error.message);
  }
  
  // Return default configuration
  return {
    emailTemplate: new EmailTemplateProcessor().createDefaultTemplate(),
    batchSize: GmailQuotas.BATCH_SIZE,
    enableLogging: true
  };
};

/**
 * Saves configuration to PropertiesService
 * @private
 */
SmartEmailAutomation.prototype.saveConfiguration_ = function() {
  try {
    const configJson = JSON.stringify(this.configuration_);
    PropertiesService.getScriptProperties().setProperty('automation_config', configJson);
  } catch (error) {
    this.errorHandler_.logError('Configuration', 'Failed to save configuration: ' + error.message);
  }
};

// Global convenience functions

/**
 * Runs the email automation workflow
 * Called from the menu
 */
function runEmailAutomation() {
  try {
    const automation = new SmartEmailAutomation();
    const result = automation.runAutomation();
    
    if (result.success) {
      SpreadsheetApp.getUi().alert(
        'Email Automation Complete',
        `Successfully processed ${result.emailsProcessed} emails.\n` +
        `Sent: ${result.emailsSent}\n` +
        `Failed: ${result.emailsFailed}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else {
      SpreadsheetApp.getUi().alert(
        'Email Automation Failed',
        `Automation failed: ${result.errors.join(', ')}`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }
  } catch (error) {
    logError('Menu', error);
    SpreadsheetApp.getUi().alert('Error', 'Failed to run automation: ' + error.message);
  }
}

/**
 * Shows configuration sidebar
 * Called from the menu
 */
function showConfigurationSidebar() {
  try {
    const html = HtmlService.createTemplateFromFile('Sidebar')
                             .evaluate()
                             .setTitle(UIConfig.SIDEBAR_TITLE)
                             .setWidth(400);
    
    SpreadsheetApp.getUi().showSidebar(html);
  } catch (error) {
    logError('Menu', error);
    SpreadsheetApp.getUi().alert('Error', 'Failed to show configuration sidebar: ' + error.message);
  }
}

/**
 * Shows template preview dialog
 * Called from the menu
 */
function showTemplatePreview() {
  try {
    const automation = new SmartEmailAutomation();
    const processor = new EmailTemplateProcessor();
    const preview = processor.createPreview(automation.configuration_.emailTemplate);
    
    const message = `Subject: ${preview.subject}\n\nBody:\n${preview.body}`;
    
    SpreadsheetApp.getUi().alert(
      'Email Template Preview',
      message,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    logError('Menu', error);
    SpreadsheetApp.getUi().alert('Error', 'Failed to show template preview: ' + error.message);
  }
}

/**
 * Shows log viewer dialog
 * Called from the menu
 */
function showLogViewer() {
  try {
    const errorHandler = getErrorHandler();
    const recentLogs = errorHandler.getRecentLogs(20);
    
    let logMessage = 'Recent Log Entries:\n\n';
    for (const log of recentLogs) {
      logMessage += `[${log.level}] ${log.timestamp.toLocaleString()}: ${log.operation} - ${log.message}\n`;
    }
    
    if (recentLogs.length === 0) {
      logMessage = 'No recent log entries found.';
    }
    
    SpreadsheetApp.getUi().alert(
      'Recent Logs',
      logMessage,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    logError('Menu', error);
    SpreadsheetApp.getUi().alert('Error', 'Failed to show logs: ' + error.message);
  }
}

/**
 * Resets daily email counter
 * Called from the menu
 */
function resetEmailCounter() {
  try {
    const emailSender = new EmailSender();
    emailSender.resetDailyCounter();
    
    SpreadsheetApp.getUi().alert(
      'Counter Reset',
      'Daily email counter has been reset.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    logError('Menu', error);
    SpreadsheetApp.getUi().alert('Error', 'Failed to reset counter: ' + error.message);
  }
}

// Server-side functions for UI communication

/**
 * Gets automation status for the UI
 * @returns {Object} Status object
 */
function getAutomationStatus() {
  try {
    const automation = new SmartEmailAutomation();
    return automation.getStatus();
  } catch (error) {
    logError('UI', error);
    return { error: error.message };
  }
}

/**
 * Gets saved template configuration
 * @returns {Object} Saved template or null
 */
function getSavedTemplate() {
  try {
    const automation = new SmartEmailAutomation();
    return automation.configuration_.emailTemplate || null;
  } catch (error) {
    logError('UI', error);
    return null;
  }
}

/**
 * Previews email template with sample data
 * @param {Object} template - Template to preview
 * @returns {Object} Preview result
 */
function previewEmailTemplate(template) {
  try {
    const processor = new EmailTemplateProcessor();
    const validation = processor.validateTemplate(template);
    
    if (!validation.isValid) {
      throw new Error('Invalid template: ' + validation.errors.join(', '));
    }
    
    return processor.createPreview(template);
  } catch (error) {
    logError('UI', error);
    throw error;
  }
}

/**
 * Saves email template configuration
 * @param {Object} template - Template to save
 * @returns {Object} Save result
 */
function saveEmailTemplate(template) {
  try {
    const automation = new SmartEmailAutomation();
    return automation.configure({ emailTemplate: template });
  } catch (error) {
    logError('UI', error);
    throw error;
  }
}

/**
 * Runs email automation with specific configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Automation result
 */
function runEmailAutomationWithConfig(config) {
  try {
    const automation = new SmartEmailAutomation();
    
    // Configure the automation
    automation.configure(config);
    
    // Set test mode if specified
    if (config.testMode !== undefined) {
      automation.setTestMode(config.testMode);
    }
    
    // Run the automation
    return automation.runAutomation();
  } catch (error) {
    logError('UI', error);
    return {
      success: false,
      emailsProcessed: 0,
      emailsSent: 0,
      emailsFailed: 0,
      errors: [error.message],
      startTime: new Date(),
      endTime: new Date()
    };
  }
}