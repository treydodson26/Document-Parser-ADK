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
 * Sheet Data Management for Smart Email Automation
 * Handles reading data from Google Sheets and updating email status
 */

/**
 * SheetDataManager class for handling spreadsheet operations
 * @param {string} spreadsheetId - The ID of the spreadsheet to work with
 */
function SheetDataManager(spreadsheetId) {
  // PATTERN: Validate input parameters
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID required');
  }
  
  try {
    this.spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    this.sheet = this.spreadsheet.getActiveSheet();
    this.headers = null;
    this.columnIndices = {};
  } catch (error) {
    // TODO (developer) - Handle exception
    console.log('Failed to open spreadsheet with error %s', error.message);
    throw new Error(ErrorMessages.INVALID_SPREADSHEET);
  }
}

/**
 * Reads email data from the spreadsheet
 * @returns {Array<Object>} Array of email data objects
 */
SheetDataManager.prototype.readEmailData = function() {
  try {
    // PATTERN: Batch read operation for performance
    const dataRange = this.sheet.getDataRange();
    const data = dataRange.getValues();
    
    // GOTCHA: Always check for empty sheets
    if (data.length === 0) {
      console.log('Sheet is empty');
      return [];
    }
    
    // PATTERN: Process headers and validate required columns
    this.headers = data[0];
    this.validateColumns_(this.headers, SheetConfig.REQUIRED_COLUMNS);
    
    // Build column index mapping for efficient access
    this.buildColumnIndices_();
    
    // PATTERN: Convert to object array for easier processing
    const emailData = this.convertToObjects_(data);
    
    console.log('Successfully read %s rows of email data', emailData.length);
    return emailData;
    
  } catch (error) {
    // PATTERN: Standardized error handling
    console.log('Failed to read email data: %s', error.message);
    throw error;
  }
};

/**
 * Updates email status for a specific row
 * @param {number} rowIndex - The row index to update (1-based)
 * @param {string} status - The email status to set
 * @param {string} errorMessage - Optional error message
 */
SheetDataManager.prototype.updateEmailStatus = function(rowIndex, status, errorMessage = '') {
  try {
    // PATTERN: Batch update for performance
    const statusColIndex = this.getColumnIndex_(EMAIL_SENT_COL);
    const errorColIndex = this.getColumnIndex_(ERROR_MESSAGE_COL);
    
    if (statusColIndex === -1) {
      throw new Error(`Column '${EMAIL_SENT_COL}' not found in spreadsheet`);
    }
    
    // Update status column
    this.sheet.getRange(rowIndex, statusColIndex + 1).setValue(status);
    
    // Update error message column if it exists
    if (errorColIndex !== -1) {
      this.sheet.getRange(rowIndex, errorColIndex + 1).setValue(errorMessage);
    }
    
    // Make sure the cell is updated right away
    SpreadsheetApp.flush();
    
  } catch (error) {
    console.log('Failed to update status for row %s: %s', rowIndex, error.message);
    throw error;
  }
};

/**
 * Batch updates email status for multiple rows
 * @param {Array<Object>} updates - Array of {rowIndex, status, errorMessage} objects
 */
SheetDataManager.prototype.batchUpdateStatus = function(updates) {
  try {
    if (!updates || updates.length === 0) {
      return;
    }
    
    const statusColIndex = this.getColumnIndex_(EMAIL_SENT_COL);
    const errorColIndex = this.getColumnIndex_(ERROR_MESSAGE_COL);
    
    if (statusColIndex === -1) {
      throw new Error(`Column '${EMAIL_SENT_COL}' not found in spreadsheet`);
    }
    
    // Prepare batch update data
    const statusUpdates = [];
    const errorUpdates = [];
    
    for (const update of updates) {
      statusUpdates.push([update.status || '']);
      if (errorColIndex !== -1) {
        errorUpdates.push([update.errorMessage || '']);
      }
    }
    
    // PATTERN: Batch update operations for better performance
    if (statusUpdates.length > 0) {
      const firstRow = updates[0].rowIndex;
      const numRows = updates.length;
      
      // Update status column
      this.sheet.getRange(firstRow, statusColIndex + 1, numRows, 1)
                .setValues(statusUpdates);
      
      // Update error message column if it exists
      if (errorColIndex !== -1 && errorUpdates.length > 0) {
        this.sheet.getRange(firstRow, errorColIndex + 1, numRows, 1)
                  .setValues(errorUpdates);
      }
    }
    
    SpreadsheetApp.flush();
    console.log('Successfully updated %s rows with batch operation', updates.length);
    
  } catch (error) {
    console.log('Failed to batch update status: %s', error.message);
    throw error;
  }
};

/**
 * Gets pending email records (rows where email hasn't been sent)
 * @returns {Array<Object>} Array of pending email data objects
 */
SheetDataManager.prototype.getPendingEmails = function() {
  try {
    const allData = this.readEmailData();
    
    // Filter for pending emails (empty status or explicitly pending)
    const pendingEmails = allData.filter(row => {
      const status = row[EMAIL_SENT_COL];
      return !status || status === '' || status === EmailStatus.PENDING;
    });
    
    console.log('Found %s pending emails out of %s total rows', pendingEmails.length, allData.length);
    return pendingEmails;
    
  } catch (error) {
    console.log('Failed to get pending emails: %s', error.message);
    throw error;
  }
};

/**
 * Validates that required columns exist in the spreadsheet
 * @private
 * @param {Array<string>} headers - The header row from the spreadsheet
 * @param {Array<string>} requiredColumns - Array of required column names
 */
SheetDataManager.prototype.validateColumns_ = function(headers, requiredColumns) {
  const missingColumns = [];
  
  for (const column of requiredColumns) {
    if (headers.indexOf(column) === -1) {
      missingColumns.push(column);
    }
  }
  
  if (missingColumns.length > 0) {
    const error = `Missing required columns: ${missingColumns.join(', ')}`;
    console.log(error);
    throw new Error(ErrorMessages.MISSING_REQUIRED_COLUMNS + ': ' + missingColumns.join(', '));
  }
};

/**
 * Builds column index mapping for efficient access
 * @private
 */
SheetDataManager.prototype.buildColumnIndices_ = function() {
  this.columnIndices = {};
  for (let i = 0; i < this.headers.length; i++) {
    this.columnIndices[this.headers[i]] = i;
  }
};

/**
 * Gets the column index for a given column name
 * @private
 * @param {string} columnName - The name of the column
 * @returns {number} The column index (0-based) or -1 if not found
 */
SheetDataManager.prototype.getColumnIndex_ = function(columnName) {
  return this.columnIndices[columnName] !== undefined ? this.columnIndices[columnName] : -1;
};

/**
 * Converts 2D array data to array of objects using headers
 * @private
 * @param {Array<Array>} data - 2D array from spreadsheet
 * @returns {Array<Object>} Array of data objects
 */
SheetDataManager.prototype.convertToObjects_ = function(data) {
  // Skip header row and convert to objects
  const dataRows = data.slice(1);
  
  return dataRows.map((row, index) => {
    const obj = {};
    
    // Add all column data
    for (let i = 0; i < this.headers.length; i++) {
      obj[this.headers[i]] = row[i] || '';
    }
    
    // Add row index for tracking (1-based, accounting for header)
    obj._rowIndex = index + 2;
    
    return obj;
  });
};

/**
 * Creates a test spreadsheet with sample data for testing
 * @returns {string} The ID of the created test spreadsheet
 */
function createTestSpreadsheet_() {
  try {
    const testSpreadsheet = SpreadsheetApp.create('Smart Email Automation Test Data');
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