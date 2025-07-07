### 🔄 Standard Workflow
1. **First think through the problem** - Read the codebase for relevant files and write a detailed plan to `todo.md`.
2. **Create a checklist** - The plan should have a list of todo items that can be checked off as completed.
3. **Get approval** - Before beginning work, check in for plan verification and approval.
4. **Work incrementally** - Begin working on todo items one by one, marking them as complete as you go.
5. **Provide high-level updates** - At every step, give a brief explanation of what changes were made.
6. **Keep changes simple** - Make every task and code change as simple as possible. Avoid massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. **Document the work** - Finally, add a review section to the `todo.md` file with a summary of changes made and any other relevant information.

### 🧱 Code Structure & Modularity
- **Never create a single .gs file longer than 300 lines of code.** Google Apps Script performs better with modular files.
- **Organize code into clearly separated modules** by feature or responsibility:
  - `Main.gs` - Entry points and trigger functions
  - `EmailProcessor.gs` - Email monitoring and attachment extraction
  - `DocumentParser.gs` - OCR and Gemini AI integration
  - `FirestoreManager.gs` - Database operations and queries
  - `ComparisonEngine.gs` - RFQ/PO comparison logic
  - `IntegrationManager.gs` - External API calls (Paperless Parts, Odoo)
  - `NotificationService.gs` - Email notifications and alerts
  - `Config.gs` - Configuration constants and environment variables
  - `Utils.gs` - Shared utility functions
- **Use clear function naming** with descriptive prefixes (e.g., `processEmailAttachment`, `parseRFQDocument`, `detectDiscrepancies`).
- **Store sensitive data in Apps Script Properties Service**, never in code.

### 🧪 Testing & Reliability
- **Create test functions for each major feature** using Google Apps Script's Logger for output validation.
- **Test files should use naming convention** `Test_[ModuleName].gs` (e.g., `Test_DocumentParser.gs`).
- **Include comprehensive error handling** with try-catch blocks and proper logging to Google Cloud Logging.
- **Test scenarios should include**:
  - Valid document processing (RFQ and PO)
  - Invalid/corrupted PDF handling
  - API failure scenarios
  - Large document processing (up to 53 pages)
  - Concurrent processing scenarios
- **Always test within execution time limits** (6 minutes for triggers, 30 seconds for custom functions).

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- **Update requirement status** in the requirements document when implementing SREQ items.
- Add new sub-tasks or integration requirements discovered during development to `TASK.md` under a "Discovered During Work" section.

### 📎 Style & Conventions
- **Use JavaScript ES6+** syntax where supported by Apps Script runtime.
- **Follow consistent naming conventions**:
  - camelCase for functions and variables
  - UPPER_CASE for constants
  - PascalCase for class-like objects
- **Use JSDoc comments** for all functions:
  ```javascript
  /**
   * Extracts data fields from RFQ PDF documents using Gemini AI
   * @param {string} pdfText - OCR extracted text from PDF
   * @param {string} documentType - Either 'RFQ' or 'PO'
   * @returns {Object} Structured data object with extracted fields
   */
  function parseDocumentData(pdfText, documentType) {
    // Implementation
  }
  ```
- **Use consistent error handling patterns** with structured error objects.
- **Implement proper logging** using console.log() for development and Cloud Logging for production.

### 🔧 Google Apps Script Specific Guidelines
- **Respect quotas and limits**:
  - 6-minute execution limit for triggers
  - Gmail API daily quotas
  - Drive API rate limits
  - Firestore read/write operations
- **Use batch operations** when possible to reduce API calls.
- **Implement exponential backoff** for API retry logic as specified in SREQ-F-018.
- **Use appropriate triggers**:
  - Time-driven triggers for periodic monitoring
  - Event-driven triggers for Gmail
  - Manual triggers for testing
- **Handle concurrent execution** properly using Lock Service when needed.

### 🗄️ Data Management
- **Design Firestore collections** following the schema in requirements:
  - `/orders/{orderId}` - Main order documents
  - `/customers/{customerId}` - Customer information
  - `/lineItems/{itemId}` - Individual line item details
  - `/auditLogs/{logId}` - Complete audit trail
- **Use consistent document ID patterns** (e.g., `{customerName}_{rfqNumber}_{timestamp}`).
- **Implement proper data validation** before storing in Firestore.
- **Maintain referential integrity** between related documents.

### 🔗 Integration Management
- **Handle external API failures gracefully** with proper fallback mechanisms.
- **Implement API authentication** using service accounts and stored credentials.
- **Log all API interactions** for troubleshooting and audit purposes.
- **Test integration endpoints** before deploying to production.
- **Monitor API usage** to stay within cost constraints (BREQ-004: under $20/month).

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, API integrations change, or deployment steps are modified.
- **Document all configuration requirements** including:
  - Required API keys and service accounts
  - Gmail setup and forwarding rules
  - Firestore security rules
  - Google Drive folder permissions
- **Comment complex business logic** especially document comparison algorithms and discrepancy detection.
- **Maintain API documentation** for integration endpoints.

### 🧠 AI Behavior Rules
- **Never assume missing context about the manufacturing workflow.** Ask questions if uncertain about business requirements.
- **Never hallucinate Google Apps Script APIs or methods** – only use documented and verified Google Services.
- **Always confirm API endpoints and authentication methods** exist before implementing integrations.
- **Never delete or overwrite existing code** unless explicitly instructed or if part of a task from `TASK.md`.
- **Consider execution time limits** when designing complex processing workflows.
- **Validate against requirements** (SREQ-F and SREQ-NF) before marking features complete.

### 🚀 Deployment & Monitoring
- **Test thoroughly in development** before deploying triggers to production email.
- **Implement gradual rollout** starting with manual document uploads before enabling automatic email processing.
- **Set up monitoring dashboards** to track system health and performance metrics.
- **Configure alerts** for quota usage, error rates, and processing delays.
- **Maintain backup procedures** for critical configuration and data recovery.