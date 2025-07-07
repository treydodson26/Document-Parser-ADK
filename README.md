# Smart Email Automation with Google Sheets Integration

A powerful Google Apps Script solution that automates personalized email sending using data from Google Sheets with comprehensive error handling, rate limiting, and a user-friendly interface.

## Features

- 📊 **Sheet Integration**: Read recipient data directly from Google Sheets
- ✉️ **Template System**: Customizable email templates with variable substitution
- 🚀 **Gmail API**: Robust email sending with proper authentication
- 📈 **Status Tracking**: Real-time tracking of email status and delivery
- 🛡️ **Error Handling**: Comprehensive error logging and recovery
- ⚡ **Rate Limiting**: Intelligent quota management to respect Gmail limits
- 🧪 **Test Mode**: Safe testing without sending actual emails
- 📱 **User Interface**: Intuitive sidebar for configuration and monitoring

## Quick Start

### 1. Setup Your Spreadsheet

Create a Google Spreadsheet with the following columns:
- `firstName` - Recipient's first name
- `lastName` - Recipient's last name  
- `email` - Recipient's email address
- `emailSent` - Status tracking (will be auto-populated)
- `errorMessage` - Error details (will be auto-populated)

Example:
```
firstName | lastName | email                | emailSent | errorMessage
John      | Doe      | john.doe@example.com |           |
Jane      | Smith    | jane.smith@test.com  |           |
```

### 2. Install the Script

1. Open your Google Spreadsheet
2. Go to **Extensions** > **Apps Script**
3. Delete the default `Code.gs` file
4. Copy all files from this project to your Apps Script project:
   - Copy `appsscript.json` content to your `appsscript.json`
   - Create folders: `src/`, `ui/`, `tests/`
   - Copy all `.gs` and `.html` files to their respective folders

### 3. Authorize and Configure

1. Save all files in the Apps Script editor
2. Refresh your spreadsheet
3. You'll see a new **Email Automation** menu
4. Click **Email Automation** > **Configure & Send Emails**
5. Configure your email template in the sidebar
6. Click **Save Template**

### 4. Send Emails

1. Enable **Test Mode** for your first run (recommended)
2. Click **Send Emails Now**
3. Monitor the progress and results
4. Disable Test Mode for actual email sending

## Detailed Usage

### Email Templates

Templates support variable substitution using `{{variableName}}` syntax:

**Subject Template:**
```
Hello {{firstName}} - Your Account Update
```

**Body Template:**
```
Dear {{firstName}} {{lastName}},

We hope this email finds you well. Your account status is currently {{status}}.

If you have any questions, please don't hesitate to contact us.

Best regards,
The Team
```

### Available Variables

Any column from your spreadsheet can be used as a variable:
- `{{firstName}}` - First name column
- `{{lastName}}` - Last name column
- `{{email}}` - Email address
- `{{customField}}` - Any additional column you add

### Menu Options

**Email Automation Menu:**
- **Configure & Send Emails** - Opens the configuration sidebar
- **Send Emails Now** - Runs automation with current settings
- **Preview Template** - Shows how your template will look
- **View Logs** - Displays recent activity and errors
- **Reset Daily Counter** - Resets the daily email quota counter

### Status Tracking

The system automatically updates your spreadsheet with:
- **emailSent**: `pending`, `processing`, `sent`, or `failed`
- **errorMessage**: Details about any delivery failures

### Test Mode

Always test your automation first:
1. Enable **Test Mode** in the sidebar
2. Run the automation
3. Check the logs to see what would have been sent
4. Disable Test Mode for actual sending

## Configuration Options

### Batch Size
- **5 emails per batch**: Conservative, slower processing
- **10 emails per batch**: Balanced (recommended)
- **25 emails per batch**: Faster, but may hit rate limits

### Advanced Configuration

Edit `src/Config.gs` to customize:
- Daily email limits
- Rate limiting settings
- Error message templates
- UI text and branding

## Quotas and Limits

### Gmail API Limits
- **100 emails/day** for consumer Gmail accounts
- **250 quota units per 100 seconds** rate limit
- **Batch processing** to optimize quota usage

### Best Practices
- Start with Test Mode enabled
- Send emails in smaller batches during peak hours
- Monitor quota usage in the sidebar
- Use descriptive subject lines to avoid spam filters

## Troubleshooting

### Common Issues

**"Spreadsheet ID required" Error**
- Ensure the script is bound to a spreadsheet
- Check that you have edit permissions

**"Missing required columns" Error**
- Verify your spreadsheet has: `firstName`, `lastName`, `email` columns
- Check column names match exactly (case-sensitive)

**"Daily email quota exceeded"**
- Wait until the next day for quota reset
- Or use **Reset Daily Counter** if counter is inaccurate

**"Rate limit exceeded"**
- Reduce batch size in settings
- Wait a few minutes before retrying

**Permission Issues**
- Reauthorize the script in Apps Script editor
- Check Gmail and Sheets API permissions

### Debugging

1. **Check Logs**: Use **View Logs** menu option
2. **Test Mode**: Always test before production sending
3. **Preview**: Use **Preview Template** to verify formatting
4. **Status Column**: Monitor `emailSent` status in spreadsheet

### Error Codes

- `pending`: Email not yet processed
- `processing`: Currently being sent
- `sent`: Successfully delivered
- `failed`: Delivery failed (check errorMessage column)

## File Structure

```
├── appsscript.json              # Project configuration
├── src/
│   ├── Config.gs               # Configuration constants
│   ├── SmartEmailAutomation.gs # Main automation logic
│   ├── SheetDataManager.gs     # Spreadsheet operations
│   ├── EmailTemplateProcessor.gs # Template processing
│   ├── EmailSender.gs          # Gmail API wrapper
│   └── ErrorHandler.gs         # Error handling & logging
├── ui/
│   ├── Sidebar.html            # Configuration interface
│   ├── Stylesheet.html         # CSS styling
│   └── SidebarJavaScript.html  # UI functionality
├── tests/
│   └── test_SmartEmailAutomation.gs # Unit tests
└── README.md                   # This documentation
```

## Development

### Running Tests

Execute tests in the Apps Script editor:
```javascript
// Run all tests
RUN_ALL_TESTS();

// Run individual module tests
TEST_EMAIL_TEMPLATE_PROCESSOR();
TEST_SHEET_DATA_MANAGER();
TEST_EMAIL_SENDER();
TEST_ERROR_HANDLER();
TEST_SMART_EMAIL_AUTOMATION();
```

### Adding Features

1. Follow the existing module structure
2. Add configuration constants to `Config.gs`
3. Implement error handling with `ErrorHandler`
4. Add unit tests for new functionality
5. Update this README with new features

## Security Best Practices

- **Never hardcode sensitive data** in the script
- **Use Test Mode** before production deployment
- **Monitor logs** for suspicious activity
- **Limit script permissions** to necessary scopes only
- **Regular backups** of your spreadsheet data

## API Reference

### SmartEmailAutomation Class

```javascript
const automation = new SmartEmailAutomation();

// Configure email template
automation.configure({
  emailTemplate: {
    subject: "Hello {{firstName}}",
    body: "Dear {{firstName}} {{lastName}}, ..."
  }
});

// Enable test mode
automation.setTestMode(true);

// Run automation
const result = automation.runAutomation();
```

### EmailTemplateProcessor Class

```javascript
const processor = new EmailTemplateProcessor();

// Process template
const result = processor.processTemplate(
  "Hello {{name}}", 
  { name: "John" }
); // Returns: "Hello John"

// Validate template
const validation = processor.validateTemplate({
  subject: "Test",
  body: "Hello {{name}}"
});
```

### SheetDataManager Class

```javascript
const manager = new SheetDataManager(spreadsheetId);

// Read email data
const emailData = manager.readEmailData();

// Update status
manager.updateEmailStatus(2, EmailStatus.SENT);

// Get pending emails
const pending = manager.getPendingEmails();
```

## Support

### Getting Help

1. **Check this README** for common solutions
2. **Review the logs** using the View Logs menu
3. **Test in Test Mode** to isolate issues
4. **Check Google Apps Script quotas** in Google Cloud Console

### Contributing

This project follows Google Apps Script best practices:
- V8 runtime compatibility
- Comprehensive error handling
- Unit testing coverage
- Documentation standards

## License

Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Changelog

### Version 1.0.0
- Initial release
- Complete email automation workflow
- Template processing with variable substitution
- Comprehensive error handling and logging
- User-friendly sidebar interface
- Rate limiting and quota management
- Test mode for safe testing
- Full unit test coverage

---

**Smart Email Automation** - Streamline your email campaigns with the power of Google Sheets and Google Apps Script.