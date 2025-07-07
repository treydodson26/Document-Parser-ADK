# 🚀 Smart Email Automation - Deployment Guide

This guide will help you deploy the Smart Email Automation system to Google Apps Script.

## ✅ Pre-Deployment Checklist

The system has been tested and validated. All files are ready for deployment:

### 📁 Files to Deploy:

**Core Configuration:**
- `appsscript.json` - Project configuration with V8 runtime and OAuth scopes

**Source Code (src/ folder in Apps Script):**
- `Config.gs` - Configuration constants
- `SmartEmailAutomation.gs` - Main automation logic
- `SheetDataManager.gs` - Spreadsheet operations
- `EmailTemplateProcessor.gs` - Template processing
- `EmailSender.gs` - Gmail API wrapper with rate limiting
- `ErrorHandler.gs` - Error handling and logging

**User Interface (ui/ folder files - rename without ui/ prefix):**
- `Sidebar.html` - Configuration interface
- `Stylesheet.html` - CSS styling  
- `SidebarJavaScript.html` - JavaScript functionality

**Testing (optional):**
- `tests/test_SmartEmailAutomation.gs` - Unit tests
- `FINAL_TEST.gs` - System validation tests

## 🚀 Step-by-Step Deployment

### Step 1: Create Google Spreadsheet
1. Create a new Google Spreadsheet
2. Set up columns in Row 1:
   ```
   firstName | lastName | email | emailSent | errorMessage
   ```
3. Add sample data in rows 2-3:
   ```
   John | Doe | john.doe@example.com | | 
   Jane | Smith | jane.smith@test.com | |
   ```

### Step 2: Set Up Apps Script Project
1. In your spreadsheet, go to **Extensions → Apps Script**
2. Delete the default `Code.gs` file
3. Replace `appsscript.json` content with our `appsscript.json`

### Step 3: Add Source Files
Create these files in Apps Script (use exact names):

1. **Config.gs** - Copy content from `src/Config.gs`
2. **SmartEmailAutomation.gs** - Copy content from `src/SmartEmailAutomation.gs`  
3. **SheetDataManager.gs** - Copy content from `src/SheetDataManager.gs`
4. **EmailTemplateProcessor.gs** - Copy content from `src/EmailTemplateProcessor.gs`
5. **EmailSender.gs** - Copy content from `src/EmailSender.gs`
6. **ErrorHandler.gs** - Copy content from `src/ErrorHandler.gs`

### Step 4: Add UI Files
Create these HTML files (remove the `ui/` prefix):

1. **Sidebar.html** - Copy content from `ui/Sidebar.html`
2. **Stylesheet.html** - Copy content from `ui/Stylesheet.html`
3. **SidebarJavaScript.html** - Copy content from `ui/SidebarJavaScript.html`

### Step 5: Add Test Files (Optional)
1. **test_SmartEmailAutomation.gs** - Copy content from `tests/test_SmartEmailAutomation.gs`
2. **FINAL_TEST.gs** - Copy content from `FINAL_TEST.gs`

## 🧪 Testing & Validation

### Run Initial Tests
1. In Apps Script editor, run: `FINAL_SYSTEM_TEST()`
2. Check console for results - should show "ALL TESTS PASSED"
3. If tests fail, review error messages and fix issues

### Test Menu System
1. Save all files in Apps Script
2. Refresh your spreadsheet
3. Look for **Email Automation** menu in spreadsheet menu bar
4. Click **Email Automation → Configure & Send Emails**
5. Sidebar should appear on the right

### Test Configuration
1. In the sidebar, enter:
   - **Subject:** `Hello {{firstName}}`
   - **Body:** `Dear {{firstName}} {{lastName}}, this is a test email.`
2. Enable **Test Mode** checkbox
3. Click **Save Template**
4. Click **Preview Template** to see sample output

### Test Email Automation
1. Ensure **Test Mode** is enabled
2. Click **Send Emails Now**
3. Confirm the test mode dialog
4. Check Progress section for results
5. Verify spreadsheet status columns are updated

## 🔧 Configuration

### Required OAuth Scopes
The `appsscript.json` includes these scopes:
- `https://www.googleapis.com/auth/gmail.send` - Send emails
- `https://www.googleapis.com/auth/spreadsheets` - Read/write spreadsheet data
- `https://www.googleapis.com/auth/script.external_request` - External API requests

### Spreadsheet Column Requirements
- **firstName** - Recipient's first name
- **lastName** - Recipient's last name  
- **email** - Recipient's email address
- **emailSent** - Status tracking (auto-populated)
- **errorMessage** - Error details (auto-populated)

## 📧 Production Usage

### First Production Run
1. **Start with Test Mode** - Always test first!
2. **Small Batch** - Test with 2-3 email addresses
3. **Verify Template** - Use Preview Template feature
4. **Check Status** - Monitor pending emails and quota
5. **Disable Test Mode** - Only after successful testing

### Email Template Variables
Use `{{variableName}}` syntax:
- `{{firstName}}` - First name column
- `{{lastName}}` - Last name column
- `{{email}}` - Email address
- Any other column name from your spreadsheet

### Best Practices
- Always test with **Test Mode** enabled first
- Monitor daily quota (100 emails for consumer Gmail)
- Use descriptive subject lines
- Keep email content professional
- Monitor error messages in spreadsheet

## 🚨 Troubleshooting

### Common Issues

**"Email Automation menu not appearing"**
- Save all files in Apps Script editor
- Refresh the spreadsheet page
- Check browser console for JavaScript errors

**"Missing required columns" error**
- Verify column names: `firstName`, `lastName`, `email`
- Column names are case-sensitive
- Check for extra spaces in headers

**"Daily email quota exceeded"**
- Wait until next day for quota reset
- Use **Reset Daily Counter** menu option if counter is wrong
- Consider upgrading to Google Workspace for higher limits

**"Rate limit exceeded"**
- Reduce batch size in sidebar settings
- Wait a few minutes before retrying
- System automatically handles rate limiting

**Permission errors**
- Reauthorize in Apps Script editor
- Check OAuth scopes in `appsscript.json`
- Ensure Gmail and Sheets APIs are enabled

### Debug Functions

Run these functions in Apps Script editor for debugging:

```javascript
// Test system validation
FINAL_SYSTEM_TEST()

// Test individual components  
TEST_EMAIL_TEMPLATE_PROCESSOR()
TEST_SHEET_DATA_MANAGER()
TEST_EMAIL_SENDER()

// Test complete workflow
RUN_ALL_TESTS()
```

## 📈 Monitoring

### Check Email Status
- **emailSent** column shows: `pending`, `processing`, `sent`, `failed`
- **errorMessage** column shows detailed error information
- Use **View Logs** menu option for detailed logging

### Monitor Quotas
- Sidebar shows remaining daily quota
- Rate limiting automatically managed
- System respects Gmail API limits

## 🎯 Success Metrics

Your deployment is successful when:
- ✅ Menu appears in spreadsheet
- ✅ Sidebar opens without errors
- ✅ Template preview works correctly
- ✅ Test mode sends "emails" successfully
- ✅ Status columns update in spreadsheet
- ✅ No errors in Apps Script execution logs

## 🎉 Congratulations!

You've successfully deployed the Smart Email Automation system! 

**Next Steps:**
1. Create your production email template
2. Import your recipient list
3. Run a small test batch
4. Scale up to your full email campaign

**Support:**
- Check the main README.md for detailed usage instructions
- Review error logs in **Email Automation → View Logs**
- Use Test Mode for troubleshooting

---

**Smart Email Automation** - Streamline your email campaigns with the power of Google Sheets and Google Apps Script.