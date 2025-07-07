name: "Smart Email Automation with Google Sheets Integration PRP"
description: |

## Purpose
Complete PRP for implementing a smart email automation feature that integrates with Google Sheets, demonstrating Google Apps Script best practices and patterns for AI agents to achieve working code through iterative refinement.

## Core Principles
1. **Context is King**: Include ALL necessary Google Apps Script documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the existing codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Build a smart email automation system that reads data from Google Sheets, processes it with customizable templates, and sends personalized emails while tracking status and handling errors gracefully. The system should follow Google Apps Script V8 runtime best practices and include comprehensive error handling and logging.

## Why
- **Business value**: Automate repetitive email tasks while maintaining personalization
- **Integration**: Seamlessly connects Google Sheets data with Gmail functionality
- **Problems solved**: 
  - Manual email sending for bulk operations
  - Inconsistent email formatting and content
  - Lack of tracking and error handling in email automation
  - Need for template-based email generation with dynamic content

## What
A Google Apps Script solution that:
- Reads recipient data from Google Sheets
- Uses customizable email templates with variable substitution
- Sends personalized emails via Gmail API
- Tracks email status and handles failures gracefully
- Provides a user-friendly interface for configuration
- Includes comprehensive logging and error reporting

### Success Criteria
- [ ] Successfully reads data from Google Sheets with proper error handling
- [ ] Generates personalized emails using template system
- [ ] Sends emails via Gmail API with proper authentication
- [ ] Tracks email status and handles failures gracefully
- [ ] Provides clear logging and error reporting
- [ ] Follows Google Apps Script V8 runtime best practices
- [ ] Includes comprehensive test coverage
- [ ] Handles rate limiting and quotas appropriately

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://developers.google.com/apps-script/guides/support/best-practices
  why: Performance optimization and coding patterns
  
- url: https://developers.google.com/apps-script/guides/v8-runtime
  why: V8 runtime requirements and gotchas
  
- url: https://developers.google.com/apps-script/reference/gmail
  why: Gmail API methods and authentication patterns
  
- url: https://developers.google.com/apps-script/reference/spreadsheet
  why: Spreadsheet API for data reading and status tracking
  
- url: https://developers.google.com/apps-script/guides/html/best-practices
  why: HTML Service patterns for user interface
  
- file: examples/gmail/sendingEmails/sendingEmails.gs
  why: Basic email sending patterns and error handling
  
- file: examples/solutions/automations/mail-merge/Code.js
  why: Template-based email generation and sheet integration
  
- file: examples/sheets/api/spreadsheet_snippets.gs
  why: Comprehensive sheet operations and batch processing
  
- file: examples/ai/gmail-sentiment-analysis/Gmail.gs
  why: Advanced Gmail API usage and error handling patterns
  
- doc: https://developers.google.com/apps-script/guides/support/troubleshooting
  section: Common errors and debugging techniques
  critical: Quota management and rate limiting strategies
```

### Current Codebase tree
```bash
/context-engineering-intro/
├── examples/
│   ├── gmail/
│   │   ├── sendingEmails/
│   │   │   └── sendingEmails.gs        # Basic email patterns
│   │   └── quickstart/
│   │       └── quickstart.gs           # Gmail API authentication
│   ├── sheets/
│   │   ├── api/
│   │   │   ├── spreadsheet_snippets.gs # Comprehensive sheet operations
│   │   │   └── test_spreadsheet_snippets.gs # Testing patterns
│   │   └── quickstart/
│   │       └── quickstart.gs           # Basic sheet operations
│   ├── solutions/automations/
│   │   └── mail-merge/
│   │       ├── Code.js                 # Template-based email system
│   │       └── README.md
│   └── templates/
│       └── standalone/
│           └── helloWorld.gs           # Basic project structure
└── PRPs/
    └── templates/
        └── prp_base.md                 # PRP template structure
```

### Desired Codebase tree with files to be added
```bash
/context-engineering-intro/
├── src/
│   ├── SmartEmailAutomation.gs        # Main automation logic
│   ├── EmailTemplateProcessor.gs      # Template processing utilities
│   ├── SheetDataManager.gs           # Sheet data operations
│   ├── EmailSender.gs                # Gmail API wrapper
│   ├── ErrorHandler.gs               # Error handling and logging
│   └── Config.gs                     # Configuration constants
├── ui/
│   ├── Sidebar.html                  # Configuration interface
│   ├── Dialog.html                   # Status dialog
│   └── Stylesheet.html               # CSS styling
├── tests/
│   ├── test_EmailTemplateProcessor.gs
│   ├── test_SheetDataManager.gs
│   ├── test_EmailSender.gs
│   └── test_SmartEmailAutomation.gs
├── appsscript.json                   # Project configuration
└── README.md                         # Usage documentation
```

### Known Gotchas of our codebase & Library Quirks
```javascript
// CRITICAL: V8 Runtime Requirements
// - Avoid 'for each...in' statements (use for...of instead)
// - No XML literals or __iterator__ functions
// - instanceof operator issues in libraries

// CRITICAL: Gmail API Quotas and Rate Limits
// - Gmail API has daily quotas (100 emails/day for consumer accounts)
// - Rate limiting: max 250 quota units per user per 100 seconds
// - Batch operations preferred over individual calls

// CRITICAL: SpreadsheetApp Performance
// - Minimize alternating read/write operations
// - Use getRange().getValues() for batch reads
// - Use setValues() for batch writes
// - Avoid excessive calls in loops

// CRITICAL: Error Handling Pattern
// - Always use try-catch blocks
// - Log errors with console.log('Failed with error %s', err.message)
// - Include TODO comments for developer action items
// - Return undefined or default values on error

// CRITICAL: Authentication and Scopes
// - Use OAuth2 for external services
// - Minimize required scopes
// - Handle authorization failures gracefully

// CRITICAL: HTML Service Limitations
// - No direct DOM manipulation
// - Use google.script.run for server communication
// - Separate CSS and JavaScript into include files
```

## Implementation Blueprint

### Data models and structure
```javascript
// Email Template Structure
const EmailTemplate = {
  subject: "Hello {{firstName}}",
  body: "Dear {{firstName}} {{lastName}},\n\nYour status is {{status}}.\n\nBest regards,\nThe Team",
  variables: ["firstName", "lastName", "status"]
};

// Sheet Data Structure
const SheetData = {
  headers: ["firstName", "lastName", "email", "status", "emailSent", "errorMessage"],
  requiredColumns: ["firstName", "lastName", "email"],
  statusColumn: "emailSent",
  errorColumn: "errorMessage"
};

// Email Status Types
const EmailStatus = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
  PROCESSING: "processing"
};
```

### List of tasks to be completed to fulfill the PRP in order

```yaml
Task 1: Project Setup and Configuration
CREATE appsscript.json:
  - SET runtime version to V8
  - CONFIGURE required scopes (Gmail, Sheets, Drive)
  - SET exception logging to STACKDRIVER
  - ENABLE Advanced Google Services

Task 2: Core Configuration Module
CREATE src/Config.gs:
  - DEFINE email quotas and rate limits
  - SET default template variables
  - CONFIGURE error handling constants
  - MIRROR pattern from: examples/solutions/automations/mail-merge/Code.js

Task 3: Sheet Data Management
CREATE src/SheetDataManager.gs:
  - IMPLEMENT batch data reading from sheets
  - ADD validation for required columns
  - CREATE status tracking methods
  - FOLLOW pattern from: examples/sheets/api/spreadsheet_snippets.gs

Task 4: Email Template Processing
CREATE src/EmailTemplateProcessor.gs:
  - BUILD template variable replacement system
  - IMPLEMENT template validation
  - ADD HTML/plain text support
  - PRESERVE existing email formatting patterns

Task 5: Gmail API Wrapper
CREATE src/EmailSender.gs:
  - IMPLEMENT Gmail API integration
  - ADD rate limiting and quota management
  - CREATE batch email operations
  - MIRROR pattern from: examples/gmail/sendingEmails/sendingEmails.gs

Task 6: Error Handling and Logging
CREATE src/ErrorHandler.gs:
  - IMPLEMENT comprehensive error handling
  - ADD logging with proper formatting
  - CREATE error recovery mechanisms
  - FOLLOW pattern from existing error handling

Task 7: Main Automation Logic
CREATE src/SmartEmailAutomation.gs:
  - INTEGRATE all components
  - IMPLEMENT main workflow
  - ADD progress tracking
  - CREATE user interface triggers

Task 8: User Interface Components
CREATE ui/Sidebar.html:
  - BUILD configuration interface
  - ADD template editor
  - IMPLEMENT status display
  - FOLLOW pattern from: examples/solutions/automations/mail-merge/

Task 9: Testing Suite
CREATE tests/test_*.gs files:
  - IMPLEMENT unit tests for each module
  - ADD integration tests
  - CREATE mock data for testing
  - FOLLOW pattern from: examples/sheets/api/test_spreadsheet_snippets.gs

Task 10: Documentation and Final Integration
CREATE README.md:
  - DOCUMENT setup and usage
  - ADD troubleshooting guide
  - INCLUDE best practices
  - FINALIZE project integration
```

### Per task pseudocode

```javascript
// Task 3: Sheet Data Management
class SheetDataManager {
  constructor(spreadsheetId) {
    // PATTERN: Validate input parameters
    if (!spreadsheetId) throw new Error('Spreadsheet ID required');
    this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  }
  
  async readEmailData() {
    try {
      // PATTERN: Batch read operation for performance
      const sheet = this.spreadsheet.getActiveSheet();
      const data = sheet.getDataRange().getValues();
      
      // GOTCHA: Always check for empty sheets
      if (data.length === 0) return [];
      
      // PATTERN: Process headers and validate required columns
      const headers = data[0];
      const requiredColumns = ['firstName', 'lastName', 'email'];
      this.validateColumns_(headers, requiredColumns);
      
      // PATTERN: Convert to object array for easier processing
      return this.convertToObjects_(data);
    } catch (error) {
      // PATTERN: Standardized error handling
      console.log('Failed to read email data: %s', error.message);
      throw error;
    }
  }
  
  async updateEmailStatus(rowIndex, status, errorMessage = '') {
    // PATTERN: Batch update for performance
    // GOTCHA: Handle Gmail API rate limits
    await this.rateLimiter_.acquire();
    
    try {
      const sheet = this.spreadsheet.getActiveSheet();
      const statusRange = sheet.getRange(rowIndex, this.getColumnIndex_('emailSent'));
      const errorRange = sheet.getRange(rowIndex, this.getColumnIndex_('errorMessage'));
      
      // PATTERN: Batch update operations
      sheet.getRange(rowIndex, this.getColumnIndex_('emailSent'), 1, 2)
           .setValues([[status, errorMessage]]);
           
    } catch (error) {
      console.log('Failed to update status: %s', error.message);
      throw error;
    }
  }
}

// Task 5: Gmail API Wrapper
class EmailSender {
  constructor() {
    // PATTERN: Initialize rate limiter for quota management
    this.rateLimiter_ = new RateLimiter(250, 100000); // 250 quota units per 100 seconds
    this.dailyQuotaUsed_ = 0;
  }
  
  async sendEmail(recipient, subject, body, options = {}) {
    try {
      // PATTERN: Check quotas before sending
      if (this.dailyQuotaUsed_ >= 100) {
        throw new Error('Daily email quota exceeded');
      }
      
      // PATTERN: Acquire rate limit token
      await this.rateLimiter_.acquire();
      
      // PATTERN: Use Gmail API with proper error handling
      const draft = GmailApp.createDraft(recipient, subject, body, options);
      draft.send();
      
      this.dailyQuotaUsed_++;
      
      // PATTERN: Return success result
      return { success: true, messageId: draft.getId() };
      
    } catch (error) {
      // PATTERN: Detailed error logging
      console.log('Failed to send email to %s: %s', recipient, error.message);
      return { success: false, error: error.message };
    }
  }
}
```

### Integration Points
```yaml
SHEETS_INTEGRATION:
  - scope: "https://www.googleapis.com/auth/spreadsheets"
  - operations: "Read data, update status, batch operations"
  - quotas: "100 requests per 100 seconds per user"
  
GMAIL_INTEGRATION:
  - scope: "https://www.googleapis.com/auth/gmail.send"
  - operations: "Send emails, create drafts, manage labels"
  - quotas: "100 emails per day (consumer), 250 quota units per 100 seconds"
  
UI_INTEGRATION:
  - add to: src/SmartEmailAutomation.gs
  - pattern: "function onOpen() { SpreadsheetApp.getUi().createMenu('Email Automation').addItem('Configure', 'showSidebar').addToUi(); }"
  
TRIGGERS:
  - add to: appsscript.json
  - pattern: "Configure installable triggers for scheduled execution"
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Use clasp for local development and validation
clasp pull    # Pull latest version
clasp push    # Push changes (validates syntax)

# Expected: No syntax errors. If errors, fix before proceeding.
# Note: Google Apps Script editor provides real-time syntax checking
```

### Level 2: Unit Tests
```javascript
// CREATE test_SmartEmailAutomation.gs
function RUN_ALL_TESTS() {
  // PATTERN: Test runner following existing codebase style
  let failures = 0;
  
  failures += testEmailTemplateProcessor();
  failures += testSheetDataManager();
  failures += testEmailSender();
  failures += testIntegration();
  
  if (failures === 0) {
    console.log('All tests passed!');
  } else {
    console.log('%s tests failed', failures);
  }
}

function testEmailTemplateProcessor() {
  try {
    // Test template variable replacement
    const processor = new EmailTemplateProcessor();
    const template = "Hello {{firstName}} {{lastName}}";
    const data = { firstName: "John", lastName: "Doe" };
    const result = processor.processTemplate(template, data);
    
    expectToEqual(result, "Hello John Doe");
    
    // Test missing variable handling
    const incompleteData = { firstName: "John" };
    const resultIncomplete = processor.processTemplate(template, incompleteData);
    expectToEqual(resultIncomplete, "Hello John {{lastName}}");
    
    return 0; // No failures
  } catch (error) {
    console.log('testEmailTemplateProcessor failed: %s', error.message);
    return 1;
  }
}

function testSheetDataManager() {
  try {
    // Test with mock spreadsheet
    const testSpreadsheetId = createTestSpreadsheet_();
    const manager = new SheetDataManager(testSpreadsheetId);
    
    const data = manager.readEmailData();
    expectToExist(data);
    expectToEqual(data.length, 2); // Test data rows
    
    // Test status updates
    manager.updateEmailStatus(2, EmailStatus.SENT);
    const updatedData = manager.readEmailData();
    expectToEqual(updatedData[0].emailSent, EmailStatus.SENT);
    
    // Cleanup
    DriveApp.getFileById(testSpreadsheetId).setTrashed(true);
    
    return 0;
  } catch (error) {
    console.log('testSheetDataManager failed: %s', error.message);
    return 1;
  }
}

// Helper functions following existing patterns
function expectToExist(value) {
  if (value === undefined || value === null) {
    throw new Error('Expected value to exist but was ' + value);
  }
}

function expectToEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error('Expected ' + expected + ' but was ' + actual);
  }
}
```

### Level 3: Integration Test
```javascript
// Manual integration test function
function testFullWorkflow() {
  try {
    // Setup test spreadsheet
    const testSpreadsheetId = createTestSpreadsheet_();
    
    // Configure automation
    const automation = new SmartEmailAutomation();
    automation.configure({
      spreadsheetId: testSpreadsheetId,
      emailTemplate: {
        subject: "Test Email {{firstName}}",
        body: "Hello {{firstName}}, this is a test email."
      }
    });
    
    // Run automation (with test mode to avoid sending real emails)
    automation.setTestMode(true);
    const result = automation.runAutomation();
    
    // Verify results
    console.log('Integration test result:', result);
    expectToEqual(result.success, true);
    expectToEqual(result.emailsProcessed, 2);
    
    // Cleanup
    DriveApp.getFileById(testSpreadsheetId).setTrashed(true);
    
    console.log('Integration test passed!');
    
  } catch (error) {
    console.log('Integration test failed: %s', error.message);
    throw error;
  }
}
```

## Final Validation Checklist
- [ ] All unit tests pass: Run `RUN_ALL_TESTS()` in Apps Script editor
- [ ] No syntax errors: All files save successfully in Apps Script editor
- [ ] No scope/permission errors: Test with proper OAuth flow
- [ ] Integration test successful: Run `testFullWorkflow()` in test mode
- [ ] Error cases handled gracefully: Test with invalid data and quota limits
- [ ] Logs are informative: Check Stackdriver logs for proper error reporting
- [ ] User interface works: Test sidebar and dialog functionality
- [ ] Rate limiting works: Test with quota management
- [ ] Documentation complete: README includes setup and usage instructions

---

## Anti-Patterns to Avoid
- ❌ Don't use `for each...in` loops (V8 runtime incompatible)
- ❌ Don't ignore Gmail API quotas and rate limits
- ❌ Don't alternate read/write operations on sheets
- ❌ Don't catch all exceptions without specific handling
- ❌ Don't embed sensitive data in scripts
- ❌ Don't use synchronous operations for time-intensive tasks
- ❌ Don't ignore error logging and user feedback
- ❌ Don't hardcode configuration values
- ❌ Don't skip input validation
- ❌ Don't use deprecated Rhino runtime features

## Additional Context for AI Implementation

### Common Pitfalls to Avoid
1. **V8 Runtime Migration Issues**: Ensure compatibility with V8 runtime
2. **Quota Management**: Implement proper rate limiting for Gmail API
3. **Error Recovery**: Handle partial failures gracefully
4. **Data Validation**: Validate all input data before processing
5. **Performance**: Use batch operations for sheet and email operations

### Success Patterns to Follow
1. **Modular Design**: Separate concerns into different modules
2. **Error Handling**: Comprehensive try-catch with logging
3. **Testing**: Unit tests for all components
4. **Documentation**: Clear README with examples
5. **User Experience**: Intuitive interface with progress feedback

### Critical Implementation Notes
- Always test with small datasets first
- Implement dry-run mode for testing
- Provide clear error messages to users
- Log all operations for debugging
- Handle edge cases like empty sheets and invalid emails
- Implement graceful degradation for API failures

---

## PRP Quality Assessment

### Completeness Score: 9/10
**Strengths:**
- Comprehensive context with specific documentation URLs and file references
- Detailed analysis of existing Google Apps Script patterns from codebase
- All major gotchas and V8 runtime pitfalls addressed
- Complete implementation blueprint with ordered tasks
- Executable validation gates with specific test patterns

**Areas for improvement:**
- Could include more specific API method signatures
- Could provide more detailed HTML/CSS patterns for UI components

### Implementation Clarity Score: 8/10
**Strengths:**
- Clear step-by-step implementation tasks in proper order
- Detailed pseudocode for complex components
- Specific file structure and naming conventions
- Integration points clearly defined
- Error handling patterns well documented

**Areas for improvement:**
- Could be more specific about exact Gmail API methods and parameters
- Could include more detailed configuration examples

### Validation Robustness Score: 9/10
**Strengths:**
- Comprehensive unit testing patterns following existing codebase style
- Integration testing with cleanup procedures
- Manual testing procedures with expected outputs
- Error case testing scenarios
- Performance validation considerations

**Confidence Level for One-Pass Implementation Success: 8.5/10**

**Rationale:**
- **High Context Density**: All necessary documentation, patterns, and gotchas included
- **Clear Implementation Path**: Ordered tasks with specific actions and file references
- **Comprehensive Validation**: Multiple levels of testing with executable examples
- **Pattern Adherence**: Follows established Google Apps Script and codebase conventions
- **Error Handling**: Addresses common pitfalls and quota management issues
- **Progressive Success**: Builds complexity incrementally with validation at each step

This PRP provides sufficient context and guidance for an AI agent to implement the feature successfully in one pass, with comprehensive validation loops to ensure working code through iterative refinement.