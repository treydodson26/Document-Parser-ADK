/**
 * Validation Test Script for Smart Email Automation
 * Tests core functionality to ensure everything works
 */

function VALIDATE_SYSTEM() {
  console.log('=== Starting System Validation ===');
  
  let failures = 0;
  
  try {
    // Test 1: Configuration Loading
    console.log('Testing configuration...');
    console.log('EmailStatus constants:', EmailStatus);
    console.log('GmailQuotas:', GmailQuotas);
    console.log('✓ Configuration loaded successfully');
  } catch (error) {
    console.log('✗ Configuration failed:', error.message);
    failures++;
  }
  
  try {
    // Test 2: EmailTemplateProcessor
    console.log('Testing EmailTemplateProcessor...');
    const processor = new EmailTemplateProcessor();
    
    const template = "Hello {{firstName}} {{lastName}}";
    const data = { firstName: "John", lastName: "Doe" };
    const result = processor.processTemplate(template, data);
    
    if (result === "Hello John Doe") {
      console.log('✓ EmailTemplateProcessor working correctly');
    } else {
      console.log('✗ EmailTemplateProcessor failed. Expected "Hello John Doe", got:', result);
      failures++;
    }
  } catch (error) {
    console.log('✗ EmailTemplateProcessor error:', error.message);
    failures++;
  }
  
  try {
    // Test 3: ErrorHandler
    console.log('Testing ErrorHandler...');
    const errorHandler = new ErrorHandler();
    errorHandler.logInfo('ValidationTest', 'Test message');
    
    const logs = errorHandler.getRecentLogs(5);
    if (logs && logs.length > 0) {
      console.log('✓ ErrorHandler working correctly');
    } else {
      console.log('✗ ErrorHandler failed to log messages');
      failures++;
    }
  } catch (error) {
    console.log('✗ ErrorHandler error:', error.message);
    failures++;
  }
  
  try {
    // Test 4: EmailSender (in test mode)
    console.log('Testing EmailSender...');
    const sender = new EmailSender();
    sender.setTestMode(true);
    
    const result = sender.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    if (result.success && result.testMode) {
      console.log('✓ EmailSender working correctly in test mode');
    } else {
      console.log('✗ EmailSender failed:', result.error || 'Unknown error');
      failures++;
    }
  } catch (error) {
    console.log('✗ EmailSender error:', error.message);
    failures++;
  }
  
  try {
    // Test 5: RateLimiter
    console.log('Testing RateLimiter...');
    const rateLimiter = new RateLimiter(5, 1000);
    
    const token1 = rateLimiter.tryAcquire();
    const token2 = rateLimiter.tryAcquire();
    
    if (token1 && token2) {
      console.log('✓ RateLimiter working correctly');
    } else {
      console.log('✗ RateLimiter failed to acquire tokens');
      failures++;
    }
  } catch (error) {
    console.log('✗ RateLimiter error:', error.message);
    failures++;
  }
  
  // Summary
  console.log('=== Validation Complete ===');
  if (failures === 0) {
    console.log('🎉 All tests passed! System is ready for deployment.');
    return true;
  } else {
    console.log('⚠️ %s tests failed. Review errors above.', failures);
    return false;
  }
}

/**
 * Test template processing with various scenarios
 */
function TEST_TEMPLATE_SCENARIOS() {
  console.log('=== Testing Template Scenarios ===');
  
  const processor = new EmailTemplateProcessor();
  
  // Test 1: Basic substitution
  let result = processor.processTemplate("Hello {{name}}", { name: "World" });
  console.log('Basic substitution:', result); // Should be "Hello World"
  
  // Test 2: Multiple variables
  result = processor.processTemplate("{{firstName}} {{lastName}} works at {{company}}", {
    firstName: "John",
    lastName: "Doe", 
    company: "Google"
  });
  console.log('Multiple variables:', result); // Should be "John Doe works at Google"
  
  // Test 3: Missing variable (should leave placeholder)
  result = processor.processTemplate("Hello {{firstName}} {{lastName}}", { firstName: "John" });
  console.log('Missing variable:', result); // Should be "Hello John {{lastName}}"
  
  // Test 4: Empty template
  result = processor.processTemplate("", { name: "Test" });
  console.log('Empty template:', result); // Should be ""
  
  // Test 5: Template validation
  const validation = processor.validateTemplate({
    subject: "Test Subject {{name}}",
    body: "Hello {{name}}, welcome!"
  });
  console.log('Template validation:', validation.isValid); // Should be true
  
  console.log('Template scenario testing complete');
}

/**
 * Test error handling scenarios
 */
function TEST_ERROR_HANDLING() {
  console.log('=== Testing Error Handling ===');
  
  const errorHandler = new ErrorHandler();
  
  // Test different log levels
  errorHandler.logError('TestModule', 'This is a test error');
  errorHandler.logWarning('TestModule', 'This is a test warning');
  errorHandler.logInfo('TestModule', 'This is a test info message');
  errorHandler.logDebug('TestModule', 'This is a test debug message');
  
  // Test getting logs by level
  const errorLogs = errorHandler.getRecentLogs(10, 'ERROR');
  const allLogs = errorHandler.getRecentLogs(10);
  
  console.log('Error logs count:', errorLogs.length);
  console.log('All logs count:', allLogs.length);
  
  // Test error statistics
  const stats = errorHandler.getErrorStats();
  console.log('Error statistics:', stats);
  
  console.log('Error handling testing complete');
}

/**
 * Quick integration test
 */
function TEST_INTEGRATION() {
  console.log('=== Testing Integration ===');
  
  try {
    // Test creating automation instance
    const automation = new SmartEmailAutomation();
    
    // Test configuration
    const config = {
      emailTemplate: {
        subject: "Test {{firstName}}",
        body: "Hello {{firstName}} {{lastName}}"
      }
    };
    
    const configResult = automation.configure(config);
    console.log('Configuration result:', configResult);
    
    // Test status
    const status = automation.getStatus();
    console.log('Status keys:', Object.keys(status));
    
    // Test test mode
    automation.setTestMode(true);
    console.log('Test mode enabled');
    
    console.log('✓ Integration test completed successfully');
    return true;
    
  } catch (error) {
    console.log('✗ Integration test failed:', error.message);
    return false;
  }
}