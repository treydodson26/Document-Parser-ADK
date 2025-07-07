/**
 * Final comprehensive test of Smart Email Automation system
 * This test validates the complete workflow without sending actual emails
 */

function FINAL_SYSTEM_TEST() {
  console.log('🚀 Starting Final System Test...\n');
  
  let testsPassed = 0;
  let testsTotal = 0;
  
  // Test 1: Basic Configuration
  testsTotal++;
  try {
    console.log('Test 1: Configuration Constants');
    
    // Validate required constants exist
    if (!EmailStatus || !GmailQuotas || !SheetConfig) {
      throw new Error('Missing required configuration constants');
    }
    
    console.log('- EmailStatus:', EmailStatus);
    console.log('- Daily limit:', GmailQuotas.DAILY_EMAIL_LIMIT);
    console.log('- Required columns:', SheetConfig.REQUIRED_COLUMNS);
    
    testsPassed++;
    console.log('✅ Configuration test passed\n');
  } catch (error) {
    console.log('❌ Configuration test failed:', error.message, '\n');
  }
  
  // Test 2: Template Processing
  testsTotal++;
  try {
    console.log('Test 2: Template Processing');
    
    const processor = new EmailTemplateProcessor();
    
    // Test basic template
    const result1 = processor.processTemplate('Hello {{name}}!', { name: 'World' });
    if (result1 !== 'Hello World!') {
      throw new Error('Basic template failed. Expected "Hello World!" got "' + result1 + '"');
    }
    
    // Test missing variable
    const result2 = processor.processTemplate('Hello {{firstName}} {{lastName}}', { firstName: 'John' });
    if (result2 !== 'Hello John {{lastName}}') {
      throw new Error('Missing variable handling failed');
    }
    
    // Test email template
    const emailTemplate = {
      subject: 'Test {{firstName}}',
      body: 'Hello {{firstName}} {{lastName}}'
    };
    const emailResult = processor.processEmailTemplate(emailTemplate, { firstName: 'John', lastName: 'Doe' });
    
    if (emailResult.subject !== 'Test John' || emailResult.body !== 'Hello John Doe') {
      throw new Error('Email template processing failed');
    }
    
    testsPassed++;
    console.log('✅ Template processing test passed\n');
  } catch (error) {
    console.log('❌ Template processing test failed:', error.message, '\n');
  }
  
  // Test 3: Error Handler
  testsTotal++;
  try {
    console.log('Test 3: Error Handling');
    
    const errorHandler = new ErrorHandler();
    
    // Test logging
    errorHandler.logError('TestModule', 'Test error message');
    errorHandler.logInfo('TestModule', 'Test info message');
    
    // Test getting logs
    const logs = errorHandler.getRecentLogs(5);
    if (!logs || logs.length === 0) {
      throw new Error('No logs found after logging');
    }
    
    // Test statistics
    const stats = errorHandler.getErrorStats();
    if (!stats || !stats.byLevel) {
      throw new Error('Error statistics not available');
    }
    
    testsPassed++;
    console.log('✅ Error handling test passed\n');
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message, '\n');
  }
  
  // Test 4: Email Sender (Test Mode)
  testsTotal++;
  try {
    console.log('Test 4: Email Sender (Test Mode)');
    
    const sender = new EmailSender();
    sender.setTestMode(true);
    
    // Test valid email
    const result1 = sender.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    if (!result1.success || !result1.testMode) {
      throw new Error('Test mode email failed: ' + (result1.error || 'Unknown error'));
    }
    
    // Test invalid email
    const result2 = sender.sendEmail('invalid-email', 'Test', 'Test');
    if (result2.success) {
      throw new Error('Invalid email should have failed');
    }
    
    // Test batch sending
    const emailList = [
      { recipient: 'test1@example.com', subject: 'Test 1', body: 'Body 1' },
      { recipient: 'test2@example.com', subject: 'Test 2', body: 'Body 2' }
    ];
    
    const batchResult = sender.sendBatchEmails(emailList);
    if (batchResult.totalEmails !== 2 || batchResult.successCount !== 2) {
      throw new Error('Batch email test failed');
    }
    
    testsPassed++;
    console.log('✅ Email sender test passed\n');
  } catch (error) {
    console.log('❌ Email sender test failed:', error.message, '\n');
  }
  
  // Test 5: Rate Limiter
  testsTotal++;
  try {
    console.log('Test 5: Rate Limiter');
    
    const rateLimiter = new RateLimiter(3, 1000); // 3 tokens per second
    
    // Should be able to acquire 3 tokens
    const token1 = rateLimiter.tryAcquire();
    const token2 = rateLimiter.tryAcquire();
    const token3 = rateLimiter.tryAcquire();
    
    if (!token1 || !token2 || !token3) {
      throw new Error('Should be able to acquire 3 tokens initially');
    }
    
    // 4th token should fail
    const token4 = rateLimiter.tryAcquire();
    if (token4) {
      throw new Error('4th token should have been denied');
    }
    
    testsPassed++;
    console.log('✅ Rate limiter test passed\n');
  } catch (error) {
    console.log('❌ Rate limiter test failed:', error.message, '\n');
  }
  
  // Test 6: Smart Email Automation Integration
  testsTotal++;
  try {
    console.log('Test 6: Smart Email Automation Integration');
    
    const automation = new SmartEmailAutomation();
    
    // Test configuration
    const config = {
      emailTemplate: {
        subject: 'Hello {{firstName}}',
        body: 'Dear {{firstName}} {{lastName}}, this is a test.'
      }
    };
    
    const configResult = automation.configure(config);
    if (!configResult.success) {
      throw new Error('Configuration failed: ' + configResult.error);
    }
    
    // Test getting status
    const status = automation.getStatus();
    if (!status || status.error) {
      throw new Error('Status check failed: ' + (status ? status.error : 'No status returned'));
    }
    
    // Test test mode
    automation.setTestMode(true);
    
    testsPassed++;
    console.log('✅ Smart Email Automation integration test passed\n');
  } catch (error) {
    console.log('❌ Smart Email Automation integration test failed:', error.message, '\n');
  }
  
  // Final Summary
  console.log('🏁 Final Test Results:');
  console.log(`Tests passed: ${testsPassed}/${testsTotal}`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 ALL TESTS PASSED! System is ready for deployment.');
    console.log('\n📋 Next steps:');
    console.log('1. Copy all files to Google Apps Script project');
    console.log('2. Set up spreadsheet with required columns:');
    console.log('   - firstName, lastName, email, emailSent, errorMessage');
    console.log('3. Test with a small dataset in test mode first');
    console.log('4. Configure email template through the sidebar');
    console.log('5. Run automation with test mode disabled');
    return true;
  } else {
    console.log('❌ Some tests failed. Please review the errors above.');
    return false;
  }
}

/**
 * Test the menu system works
 */
function TEST_MENU_SYSTEM() {
  console.log('Testing menu system...');
  
  try {
    // This simulates what happens when the spreadsheet opens
    onOpen();
    console.log('✅ onOpen function executed successfully');
    
    // Test menu functions exist
    if (typeof runEmailAutomation !== 'function') {
      throw new Error('runEmailAutomation function not found');
    }
    
    if (typeof showConfigurationSidebar !== 'function') {
      throw new Error('showConfigurationSidebar function not found');
    }
    
    if (typeof showTemplatePreview !== 'function') {
      throw new Error('showTemplatePreview function not found');
    }
    
    console.log('✅ All menu functions found');
    return true;
    
  } catch (error) {
    console.log('❌ Menu system test failed:', error.message);
    return false;
  }
}

/**
 * Test the complete unit test suite
 */
function TEST_UNIT_SUITE() {
  console.log('Running complete unit test suite...');
  
  try {
    const failures = RUN_ALL_TESTS();
    
    if (failures === 0) {
      console.log('✅ All unit tests passed');
      return true;
    } else {
      console.log('❌ ' + failures + ' unit tests failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Unit test suite failed to run:', error.message);
    return false;
  }
}

/**
 * Run all validation tests
 */
function RUN_COMPLETE_VALIDATION() {
  console.log('🔍 Starting Complete System Validation\n');
  
  const results = {
    finalTest: FINAL_SYSTEM_TEST(),
    menuTest: TEST_MENU_SYSTEM(),
    unitTests: TEST_UNIT_SUITE()
  };
  
  console.log('\n📊 Validation Summary:');
  console.log('Final System Test:', results.finalTest ? '✅ PASS' : '❌ FAIL');
  console.log('Menu System Test:', results.menuTest ? '✅ PASS' : '❌ FAIL');
  console.log('Unit Test Suite:', results.unitTests ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = results.finalTest && results.menuTest && results.unitTests;
  
  if (allPassed) {
    console.log('\n🎊 SYSTEM VALIDATION COMPLETE - ALL TESTS PASSED!');
    console.log('The Smart Email Automation system is ready for production use.');
  } else {
    console.log('\n⚠️ SYSTEM VALIDATION INCOMPLETE - Some tests failed.');
    console.log('Please review the test results and fix any issues before deployment.');
  }
  
  return allPassed;
}