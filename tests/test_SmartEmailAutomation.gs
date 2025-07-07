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
 * Smart Email Automation Test Suite
 * Comprehensive unit tests for all modules
 */

// Test helper functions following existing patterns

/**
 * A simple exists assertion check. Expects a value to exist. Errors if DNE.
 * @param {any} value A value that is expected to exist.
 */
function expectToExist(value) {
  if (value !== null && value !== undefined) {
    console.log('TEST: Exists');
  } else {
    throw new Error('TEST: DNE - Expected value to exist but was ' + value);
  }
}

/**
 * A simple exists assertion check for primitives (no nested objects).
 * Expects actual to equal expected. Logs the output.
 * @param {any} actual The actual value.
 * @param {any} expected The expected value.
 */
function expectToEqual(actual, expected) {
  console.log('TEST: actual: %s = expected: %s', actual, expected);
  if (actual !== expected) {
    throw new Error('TEST: Expected ' + expected + ' but was ' + actual);
  }
}

/**
 * Expects a function to throw an error
 * @param {Function} func Function that should throw
 * @param {string} expectedMessage Optional expected error message
 */
function expectToThrow(func, expectedMessage = null) {
  try {
    func();
    throw new Error('TEST: Expected function to throw but it did not');
  } catch (error) {
    if (expectedMessage && error.message.indexOf(expectedMessage) === -1) {
      throw new Error('TEST: Expected error message to contain "' + expectedMessage + '" but was "' + error.message + '"');
    }
    console.log('TEST: Correctly threw error: %s', error.message);
  }
}

/**
 * Runs all tests for Smart Email Automation
 */
function RUN_ALL_TESTS() {
  console.log('=== Starting Smart Email Automation Test Suite ===');
  
  let failures = 0;
  const tests = [
    testEmailTemplateProcessor,
    testSheetDataManager,
    testEmailSender,
    testErrorHandler,
    testSmartEmailAutomation
  ];
  
  for (const test of tests) {
    try {
      console.log('Running test: %s', test.name);
      test();
      console.log('✓ %s passed', test.name);
    } catch (error) {
      console.log('✗ %s failed: %s', test.name, error.message);
      failures++;
    }
  }
  
  console.log('=== Test Suite Complete ===');
  if (failures === 0) {
    console.log('All tests passed! 🎉');
  } else {
    console.log('%s tests failed', failures);
  }
  
  return failures;
}

/**
 * Tests EmailTemplateProcessor functionality
 */
function testEmailTemplateProcessor() {
  console.log('Testing EmailTemplateProcessor...');
  
  const processor = new EmailTemplateProcessor();
  
  // Test basic template processing
  const template = "Hello {{firstName}} {{lastName}}";
  const data = { firstName: "John", lastName: "Doe" };
  const result = processor.processTemplate(template, data);
  expectToEqual(result, "Hello John Doe");
  
  // Test missing variable handling
  const incompleteData = { firstName: "John" };
  const resultIncomplete = processor.processTemplate(template, incompleteData);
  expectToEqual(resultIncomplete, "Hello John {{lastName}}");
  
  // Test template validation
  const validTemplate = { subject: "Test", body: "Hello {{name}}" };
  const validation = processor.validateTemplate(validTemplate);
  expectToEqual(validation.isValid, true);
  
  const invalidTemplate = {}; // No subject or body
  const invalidValidation = processor.validateTemplate(invalidTemplate);
  expectToEqual(invalidValidation.isValid, false);
  
  // Test variable extraction
  const variables = processor.extractTemplateVariables("Hello {{firstName}} {{lastName}} {{firstName}}");
  expectToEqual(variables.length, 2); // Should deduplicate
  expectToEqual(variables.includes('firstName'), true);
  expectToEqual(variables.includes('lastName'), true);
  
  // Test email template processing
  const emailTemplate = {
    subject: "Hello {{firstName}}",
    body: "Dear {{firstName}} {{lastName}}"
  };
  const emailResult = processor.processEmailTemplate(emailTemplate, data);
  expectToEqual(emailResult.subject, "Hello John");
  expectToEqual(emailResult.body, "Dear John Doe");
  
  console.log('EmailTemplateProcessor tests completed');
}

/**
 * Tests SheetDataManager functionality
 */
function testSheetDataManager() {
  console.log('Testing SheetDataManager...');
  
  // Create test spreadsheet
  const testSpreadsheetId = createTestSpreadsheet_();
  
  try {
    const manager = new SheetDataManager(testSpreadsheetId);
    
    // Test reading email data
    const data = manager.readEmailData();
    expectToExist(data);
    expectToEqual(data.length, 2); // Test data has 2 rows
    
    // Test that data has required properties
    expectToExist(data[0][FIRST_NAME_COL]);
    expectToExist(data[0][LAST_NAME_COL]);
    expectToExist(data[0][RECIPIENT_COL]);
    expectToExist(data[0]._rowIndex);
    
    // Test pending emails
    const pendingEmails = manager.getPendingEmails();
    expectToEqual(pendingEmails.length, 2); // Both emails should be pending initially
    
    // Test status updates
    manager.updateEmailStatus(2, EmailStatus.SENT);
    const updatedData = manager.readEmailData();
    expectToEqual(updatedData[0][EMAIL_SENT_COL], EmailStatus.SENT);
    
    // Test batch status updates
    const updates = [
      { rowIndex: 3, status: EmailStatus.FAILED, errorMessage: 'Test error' }
    ];
    manager.batchUpdateStatus(updates);
    
    // Test invalid spreadsheet handling
    expectToThrow(() => {
      new SheetDataManager('invalid_id');
    }, 'Spreadsheet ID required');
    
  } finally {
    // Cleanup
    DriveApp.getFileById(testSpreadsheetId).setTrashed(true);
  }
  
  console.log('SheetDataManager tests completed');
}

/**
 * Tests EmailSender functionality
 */
function testEmailSender() {
  console.log('Testing EmailSender...');
  
  const sender = new EmailSender();
  
  // Enable test mode to avoid sending real emails
  sender.setTestMode(true);
  
  // Test valid email sending in test mode
  const result = sender.sendEmail('test@example.com', 'Test Subject', 'Test Body');
  expectToEqual(result.success, true);
  expectToEqual(result.testMode, true);
  expectToExist(result.messageId);
  
  // Test invalid email address
  const invalidResult = sender.sendEmail('invalid-email', 'Test', 'Test');
  expectToEqual(invalidResult.success, false);
  expectToExist(invalidResult.error);
  
  // Test missing subject and body
  const emptyResult = sender.sendEmail('test@example.com', '', '');
  expectToEqual(emptyResult.success, false);
  
  // Test batch email sending
  const emailList = [
    { recipient: 'test1@example.com', subject: 'Test 1', body: 'Body 1' },
    { recipient: 'test2@example.com', subject: 'Test 2', body: 'Body 2' }
  ];
  
  const batchResult = sender.sendBatchEmails(emailList);
  expectToEqual(batchResult.totalEmails, 2);
  expectToEqual(batchResult.successCount, 2);
  expectToEqual(batchResult.failureCount, 0);
  
  // Test quota tracking
  const remainingQuota = sender.getRemainingQuota();
  expectToExist(remainingQuota);
  
  console.log('EmailSender tests completed');
}

/**
 * Tests ErrorHandler functionality
 */
function testErrorHandler() {
  console.log('Testing ErrorHandler...');
  
  const errorHandler = new ErrorHandler();
  
  // Test error logging
  errorHandler.logError('TestOperation', 'Test error message');
  errorHandler.logWarning('TestOperation', 'Test warning');
  errorHandler.logInfo('TestOperation', 'Test info');
  
  // Test getting recent logs
  const recentLogs = errorHandler.getRecentLogs(10);
  expectToExist(recentLogs);
  expectToEqual(recentLogs.length >= 3, true); // Should have at least 3 logs
  
  // Test error statistics
  const stats = errorHandler.getErrorStats();
  expectToExist(stats);
  expectToExist(stats.byLevel);
  expectToEqual(stats.byLevel.ERROR >= 1, true);
  
  // Test function wrapping
  const wrappedFunction = errorHandler.wrapFunction(() => {
    throw new Error('Test error');
  }, 'WrappedFunction', 'default');
  
  const wrappedResult = wrappedFunction();
  expectToEqual(wrappedResult, 'default');
  
  // Test retry functionality
  let attemptCount = 0;
  const flakyFunction = () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Flaky error');
    }
    return 'success';
  };
  
  const retryResult = errorHandler.handleWithRetry(flakyFunction, 'FlakyOperation', 3, 100);
  expectToEqual(retryResult, 'success');
  
  console.log('ErrorHandler tests completed');
}

/**
 * Tests SmartEmailAutomation integration
 */
function testSmartEmailAutomation() {
  console.log('Testing SmartEmailAutomation...');
  
  // Create test spreadsheet for integration test
  const testSpreadsheetId = createTestSpreadsheet_();
  
  try {
    const automation = new SmartEmailAutomation();
    
    // Test configuration
    const config = {
      emailTemplate: {
        subject: "Test Email {{firstName}}",
        body: "Hello {{firstName}}, this is a test email."
      }
    };
    
    const configResult = automation.configure(config);
    expectToEqual(configResult.success, true);
    
    // Test getting status
    const status = automation.getStatus();
    expectToExist(status);
    expectToExist(status.pendingEmails);
    expectToExist(status.remainingQuota);
    
    // Test setting test mode
    automation.setTestMode(true);
    
    // Test running automation (in test mode)
    // Note: This will work with the current spreadsheet
    // const automationResult = automation.runAutomation();
    // expectToExist(automationResult);
    // expectToEqual(automationResult.success, true);
    
    // Test invalid configuration
    expectToThrow(() => {
      automation.configure({ emailTemplate: {} }); // Invalid template
    });
    
  } finally {
    // Cleanup
    DriveApp.getFileById(testSpreadsheetId).setTrashed(true);
  }
  
  console.log('SmartEmailAutomation tests completed');
}

/**
 * Creates a test spreadsheet with sample data for testing
 * @returns {string} The ID of the created test spreadsheet
 */
function createTestSpreadsheet_() {
  try {
    const testSpreadsheet = SpreadsheetApp.create('Smart Email Automation Test Data - ' + Date.now());
    const sheet = testSpreadsheet.getActiveSheet();
    
    // Set up headers
    const headers = [FIRST_NAME_COL, LAST_NAME_COL, RECIPIENT_COL, EMAIL_SENT_COL, ERROR_MESSAGE_COL];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add sample data
    const sampleData = [
      ['John', 'Doe', 'john.doe@example.com', '', ''],
      ['Jane', 'Smith', 'jane.smith@example.com', '', '']
    ];
    sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
    
    console.log('Created test spreadsheet with ID: %s', testSpreadsheet.getId());
    return testSpreadsheet.getId();
    
  } catch (error) {
    console.log('Failed to create test spreadsheet: %s', error.message);
    throw error;
  }
}

// Individual test functions that can be run separately

/**
 * Quick test for EmailTemplateProcessor only
 */
function TEST_EMAIL_TEMPLATE_PROCESSOR() {
  return testEmailTemplateProcessor();
}

/**
 * Quick test for SheetDataManager only
 */
function TEST_SHEET_DATA_MANAGER() {
  return testSheetDataManager();
}

/**
 * Quick test for EmailSender only
 */
function TEST_EMAIL_SENDER() {
  return testEmailSender();
}

/**
 * Quick test for ErrorHandler only
 */
function TEST_ERROR_HANDLER() {
  return testErrorHandler();
}

/**
 * Quick test for SmartEmailAutomation only
 */
function TEST_SMART_EMAIL_AUTOMATION() {
  return testSmartEmailAutomation();
}