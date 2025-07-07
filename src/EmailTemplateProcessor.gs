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
 * Email Template Processing for Smart Email Automation
 * Handles template variable replacement and validation
 */

/**
 * EmailTemplateProcessor class for handling email template operations
 */
function EmailTemplateProcessor() {
  this.templateVariablePattern = /{{[^{}]+}}/g;
}

/**
 * Processes an email template by replacing variables with actual data
 * @param {string} template - The template string with {{variable}} placeholders
 * @param {Object} data - Object containing variable values
 * @returns {string} Processed template with variables replaced
 */
EmailTemplateProcessor.prototype.processTemplate = function(template, data) {
  try {
    if (!template || typeof template !== 'string') {
      throw new Error('Template must be a non-empty string');
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be an object');
    }
    
    // PATTERN: Token replacement based on mail-merge example
    let processedTemplate = template.replace(this.templateVariablePattern, key => {
      const variableName = key.replace(/[{}]+/g, "");
      const value = data[variableName];
      
      // Return the value if it exists, otherwise leave the placeholder
      return value !== undefined && value !== null ? this.escapeData_(value.toString()) : key;
    });
    
    console.log('Successfully processed template with %s variables', Object.keys(data).length);
    return processedTemplate;
    
  } catch (error) {
    console.log('Failed to process template: %s', error.message);
    throw new Error(ErrorMessages.TEMPLATE_PROCESSING_ERROR + ': ' + error.message);
  }
};

/**
 * Processes both subject and body templates
 * @param {Object} emailTemplate - Object with subject and body templates
 * @param {Object} data - Object containing variable values
 * @returns {Object} Object with processed subject and body
 */
EmailTemplateProcessor.prototype.processEmailTemplate = function(emailTemplate, data) {
  try {
    if (!emailTemplate) {
      throw new Error('Email template is required');
    }
    
    const processedTemplate = {
      subject: emailTemplate.subject ? this.processTemplate(emailTemplate.subject, data) : '',
      body: emailTemplate.body ? this.processTemplate(emailTemplate.body, data) : '',
      htmlBody: emailTemplate.htmlBody ? this.processTemplate(emailTemplate.htmlBody, data) : null
    };
    
    // Validate that we have at least a subject or body
    if (!processedTemplate.subject && !processedTemplate.body) {
      throw new Error('Template must have at least a subject or body');
    }
    
    return processedTemplate;
    
  } catch (error) {
    console.log('Failed to process email template: %s', error.message);
    throw error;
  }
};

/**
 * Validates an email template structure
 * @param {Object} template - The template object to validate
 * @returns {Object} Validation result with isValid and errors properties
 */
EmailTemplateProcessor.prototype.validateTemplate = function(template) {
  const result = {
    isValid: true,
    errors: []
  };
  
  try {
    if (!template || typeof template !== 'object') {
      result.isValid = false;
      result.errors.push('Template must be an object');
      return result;
    }
    
    // Check for required fields
    if (!template.subject && !template.body) {
      result.isValid = false;
      result.errors.push('Template must have at least a subject or body');
    }
    
    // Validate subject
    if (template.subject && typeof template.subject !== 'string') {
      result.isValid = false;
      result.errors.push('Subject must be a string');
    }
    
    // Validate body
    if (template.body && typeof template.body !== 'string') {
      result.isValid = false;
      result.errors.push('Body must be a string');
    }
    
    // Validate HTML body if present
    if (template.htmlBody && typeof template.htmlBody !== 'string') {
      result.isValid = false;
      result.errors.push('HTML body must be a string');
    }
    
    return result;
    
  } catch (error) {
    console.log('Error validating template: %s', error.message);
    result.isValid = false;
    result.errors.push('Validation error: ' + error.message);
    return result;
  }
};

/**
 * Extracts all template variables from a template string
 * @param {string} template - The template string to analyze
 * @returns {Array<string>} Array of variable names found in the template
 */
EmailTemplateProcessor.prototype.extractTemplateVariables = function(template) {
  try {
    if (!template || typeof template !== 'string') {
      return [];
    }
    
    const matches = template.match(this.templateVariablePattern) || [];
    const variables = matches.map(match => match.replace(/[{}]+/g, ""));
    
    // Return unique variables only
    return [...new Set(variables)];
    
  } catch (error) {
    console.log('Error extracting template variables: %s', error.message);
    return [];
  }
};

/**
 * Validates that all required template variables have corresponding data
 * @param {string} template - The template string
 * @param {Object} data - The data object
 * @returns {Object} Validation result with isValid, missingVariables, and availableVariables
 */
EmailTemplateProcessor.prototype.validateTemplateData = function(template, data) {
  const result = {
    isValid: true,
    missingVariables: [],
    availableVariables: [],
    templateVariables: []
  };
  
  try {
    // Extract template variables
    result.templateVariables = this.extractTemplateVariables(template);
    result.availableVariables = Object.keys(data || {});
    
    // Find missing variables
    result.missingVariables = result.templateVariables.filter(variable => {
      return !data || data[variable] === undefined || data[variable] === null;
    });
    
    // Template is valid if no variables are missing
    result.isValid = result.missingVariables.length === 0;
    
    if (!result.isValid) {
      console.log('Template validation failed. Missing variables: %s', result.missingVariables.join(', '));
    }
    
    return result;
    
  } catch (error) {
    console.log('Error validating template data: %s', error.message);
    result.isValid = false;
    result.missingVariables = [];
    return result;
  }
};

/**
 * Creates a preview of the processed template with sample data
 * @param {Object} emailTemplate - The email template object
 * @param {Object} sampleData - Sample data for preview
 * @returns {Object} Preview object with processed subject and body
 */
EmailTemplateProcessor.prototype.createPreview = function(emailTemplate, sampleData) {
  try {
    // Use sample data or defaults for preview
    const defaultSampleData = {
      [FIRST_NAME_COL]: 'John',
      [LAST_NAME_COL]: 'Doe',
      [RECIPIENT_COL]: 'john.doe@example.com',
      'status': 'Active'
    };
    
    const previewData = Object.assign({}, defaultSampleData, sampleData || {});
    
    return this.processEmailTemplate(emailTemplate, previewData);
    
  } catch (error) {
    console.log('Error creating template preview: %s', error.message);
    throw error;
  }
};

/**
 * Escapes data to prevent injection and formatting issues
 * @private
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
EmailTemplateProcessor.prototype.escapeData_ = function(str) {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Basic escaping for safety
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Creates a default email template
 * @returns {Object} Default email template object
 */
EmailTemplateProcessor.prototype.createDefaultTemplate = function() {
  return {
    subject: DefaultEmailTemplate.subject,
    body: DefaultEmailTemplate.body,
    variables: DefaultEmailTemplate.variables
  };
};

/**
 * Converts a plain text template to HTML format
 * @param {string} plainText - Plain text template
 * @returns {string} HTML formatted template
 */
EmailTemplateProcessor.prototype.convertToHtml = function(plainText) {
  try {
    if (!plainText || typeof plainText !== 'string') {
      return '';
    }
    
    // Convert line breaks to HTML
    let htmlText = plainText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/\r/g, '');
    
    // Wrap in basic HTML structure
    htmlText = `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">${htmlText}</div>`;
    
    return htmlText;
    
  } catch (error) {
    console.log('Error converting to HTML: %s', error.message);
    return plainText; // Return original if conversion fails
  }
};