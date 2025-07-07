# Manufacturing Document Automation System - Project Template

## FEATURE:
FEATURE:
Manufacturing Document Automation System Requirements
Business Requirements (BREQ)
BREQ-001: Process Efficiency
Reduce manual document processing time by 80% to enable the 3-person order entry team to focus on customer service and production coordination activities.
BREQ-002: Quality Improvement
Achieve 95% accuracy in detecting discrepancies between RFQs and Purchase Orders before production begins to improve on-time delivery rate from 70% toward 90%.
BREQ-003: Operational Scalability
Handle current volume of 20 quotes per week (1,100 annually) with capacity to scale to 200 quotes per week without additional manual resources.
BREQ-004: Cost Optimization
Implement automation solution with monthly operating costs under $20 and one-time setup costs under $15,000.
Functional System Requirements (SREQ-F)
Email Processing
SREQ-F-001: The Google Apps Script shall monitor the orders@wclark.com Gmail inbox and trigger processing within 60 seconds when new emails arrive.
SREQ-F-002: The Google Apps Script shall extract PDF attachments from incoming emails and classify them as either RFQ or Purchase Order based on content analysis.
SREQ-F-003: The Google Apps Script shall support email attachments up to 25MB and PDF documents up to 100 pages.
Document Processing
SREQ-F-004: The Google Apps Script shall extract text from PDF documents using Google Drive OCR and parse the content using Gemini AI within 2 minutes.
SREQ-F-005: The Google Apps Script shall extract the following data fields from RFQ documents: customer name, RFQ number, RFQ date, delivery date, delivery address, line items with part numbers, quantities, materials, and specifications.
SREQ-F-006: The Google Apps Script shall extract the following data fields from Purchase Order documents: customer name, PO number, RFQ reference number, delivery date, delivery address, line items with part numbers, quantities, materials, specifications, and pricing.
SREQ-F-020: The Google Apps Script shall support manual upload of documents downloaded from customer portals when direct email integration is not available, and support the existing workflow where order entry team downloads portal documents and forwards to the system.
SREQ-F-021: The Google Apps Script shall handle incomplete RFQ data from "loose leaf email" formats and flag missing required information for manual completion.
SREQ-F-022: The Google Apps Script shall process formal DOD shipyard documents with higher confidence than informal customer emails.
Data Storage
SREQ-F-007: The Google Apps Script shall store all extracted document data in Cloud Firestore with structured collections for orders, customers, and line items.
SREQ-F-008: The Google Apps Script shall maintain complete audit trails with timestamps for document receipt, processing completion, and status changes.
SREQ-F-009: The Google Apps Script shall create organized Google Drive folders using the naming convention CustomerName_RFQNumber_Year for each order.
SREQ-F-030: The Google Apps Script shall preserve manual annotation capability by storing original and annotated document versions in Google Drive.
SREQ-F-035: The Google Apps Script shall maintain RFQ records for up to 12 months to enable matching with delayed Purchase Orders.
SREQ-F-036: The Google Apps Script shall handle the scenario where PO arrives 2-3 months after initial RFQ processing.
Document Comparison
SREQ-F-010: The Google Apps Script shall automatically locate matching RFQ records when Purchase Orders arrive using customer name and RFQ number.
SREQ-F-011: The Google Apps Script shall compare line items between RFQ and PO documents and identify discrepancies in quantity, specifications, delivery dates, and materials.
SREQ-F-012: The Google Apps Script shall categorize discrepancies as "Minor" (under $500 impact) or "Major" (over $500 impact or specification changes).
Part Management & Inventory
SREQ-F-023: The Google Apps Script shall detect existing part records in both Paperless Parts and Odoo systems using part numbers, descriptions, and specifications.
SREQ-F-024: The Google Apps Script shall prompt users to confirm whether to use existing parts or create new part records when matches are detected.
SREQ-F-025: The Google Apps Script shall map part records between Paperless Parts and Odoo using custom attribute fields for ERP integration.
Line Item Processing
SREQ-F-026: The Google Apps Script shall process and track individual line items as the primary unit of analysis rather than entire orders.
SREQ-F-027: The Google Apps Script shall handle orders with 1-30+ line items and maintain line-level traceability throughout the workflow.
Workflow Automation
SREQ-F-013: The Google Apps Script shall automatically create sales orders in Odoo ERP when no discrepancies are detected between RFQ and PO.
SREQ-F-014: The Google Apps Script shall generate quotes in Paperless Parts when RFQ documents are processed.
SREQ-F-015: The Google Apps Script shall send email notifications to Jeff Burek when Major discrepancies are detected.
SREQ-F-016: The Google Apps Script shall send email notifications to the order entry team when Minor discrepancies are detected.
SREQ-F-028: The Google Apps Script shall create activities in Odoo and assign them to Jeff Burek when major discrepancies require account manager review.
SREQ-F-029: The Google Apps Script shall send order acknowledgments to customers automatically when sales orders are created without discrepancies.
Documentation Package Management
SREQ-F-033: The Google Apps Script shall prepare documentation package templates based on certification requirements extracted from RFQ/PO documents.
SREQ-F-034: The Google Apps Script shall maintain document packages in Google Drive with proper version control and access permissions.
Integration Management
SREQ-F-017: The Google Apps Script shall authenticate with external APIs using stored service account credentials and handle API rate limiting.
SREQ-F-018: The Google Apps Script shall retry failed API calls up to 3 times with exponential backoff before escalating to manual review.
SREQ-F-019: The Google Apps Script shall log all API interactions and errors to Google Cloud Logging for troubleshooting.
Non-Functional System Requirements (SREQ-NF)
Performance
SREQ-NF-001: The Google Apps Script shall process documents containing up to 53 pages within the 6-minute execution limit.
SREQ-NF-002: The Google Apps Script shall handle concurrent processing of up to 5 documents simultaneously through multiple trigger instances.
SREQ-NF-003: The Google Apps Script shall return database query results within 5 seconds for standard order lookups.
Reliability
SREQ-NF-004: The Google Apps Script shall achieve 99.5% uptime availability during business hours (8 AM - 6 PM EST).
SREQ-NF-005: The Google Apps Script shall maintain data integrity with automatic backup and recovery capabilities.
SREQ-NF-006: The Google Apps Script shall continue operation when individual external APIs are temporarily unavailable by queuing operations.
Security
SREQ-NF-007: The Google Apps Script shall store all API credentials and sensitive configuration data using Apps Script Properties Service encryption.
SREQ-NF-008: The Google Apps Script shall implement appropriate Firestore security rules to restrict data access to authorized users only.
SREQ-NF-009: The Google Apps Script shall comply with SOX requirements for financial document handling and audit trails.
Scalability
SREQ-NF-010: The Google Apps Script shall support scaling from 20 to 200 quotes per week without architectural changes.
SREQ-NF-011: The Google Apps Script shall accommodate storage of 10,000+ historical order records with maintained query performance.
Maintainability
SREQ-NF-012: The Google Apps Script shall use modular code structure to enable independent updates to OCR, AI parsing, and integration components.
SREQ-NF-013: The Google Apps Script shall provide comprehensive error logging and monitoring dashboards for script health tracking.
SREQ-NF-014: The Google Apps Script shall include documentation and training materials for handoff to internal IT support.
Cost Control
SREQ-NF-015: The Google Apps Script shall operate within monthly costs of $20 including all Google Cloud services and API usage.
SREQ-NF-016: The Google Apps Script shall monitor and alert when approaching 80% of monthly API quotas to prevent service interruption.
Data Quality
SREQ-NF-017: The Google Apps Script shall achieve 95% accuracy in extracting data from formal DOD documents and 80% accuracy from informal email formats.
SREQ-NF-018: The Google Apps Script shall provide confidence scoring for extracted data to guide manual review priorities.
Integration Robustness
SREQ-NF-020: The Google Apps Script shall support Paperless Parts' existing email integration for quote generation while maintaining data normalization.
Design Tasks (Implementation Deliverables)
Core Development

Email monitoring trigger setup and configuration
OCR text extraction and Gemini API integration functions
Firestore database schema design and security rules
Document comparison algorithms and discrepancy detection logic
External API integration modules (Paperless Parts, Odoo)
Error handling and retry mechanisms
Automated testing suite and validation scripts

Configuration & Setup

Service account creation and permission configuration
API key management and secure storage implementation
Google Drive folder structure automation
Email notification templates and routing logic
Monitoring dashboard and logging setup

##Examples
In the examples/ folder, there is a README for you to read to understand what the example is all about and also how to structure your own README when you create documentation for the above feature.

Don't copy any of these examples directly, it is for a different project entirely. But use this as inspiration and for best practices.



## DOCUMENTATION:

### **Core Google APIs & Services:**
- **Gmail API Reference**: https://developers.google.com/gmail/api/reference/rest/v1/users.messages
- **Gmail Push Notifications**: https://developers.google.com/gmail/api/guides/push
- **Google Drive API v3**: https://developers.google.com/drive/api/reference/rest/v3
- **Drive OCR Conversion**: https://developers.google.com/drive/api/guides/manage-uploads#converting
- **Google Apps Script Reference**: https://developers.google.com/apps-script/reference
- **Apps Script Execution Limits**: https://developers.google.com/apps-script/guides/services/quotas
- **PropertiesService Documentation**: https://developers.google.com/apps-script/reference/properties
- **Trigger Management**: https://developers.google.com/apps-script/guides/triggers

### **AI & Document Processing:**
- **Gemini API Reference**: https://ai.google.dev/api/rest/v1/models/generateContent
- **Gemini Pricing**: https://ai.google.dev/pricing
- **Document AI OCR**: https://cloud.google.com/document-ai/docs/process-documents-ocr
- **Document AI PDF Processing**: https://cloud.google.com/document-ai/docs/file-types
- **Vision API Text Detection**: https://cloud.google.com/vision/docs/ocr

### **External System Integration:**
- **Paperless Parts API**: https://paperlessparts.com/docs/api
- **Paperless Parts Email Integration**: https://help.paperlessparts.com/en/articles/4049831-email-to-quote
- **Odoo External API**: https://www.odoo.com/documentation/16.0/developer/reference/external_api.html
- **Odoo Sales Module**: https://www.odoo.com/documentation/16.0/applications/sales/sales/send_quotations/get_signature_to_validate.html
- **Odoo Custom Fields**: https://www.odoo.com/documentation/16.0/developer/tutorials/getting_started/05_securityintro.html

### **Manufacturing & Compliance Standards:**
- **ISO 9001 Quality Management**: https://www.iso.org/iso-9001-quality-management.html
- **Manufacturing Documentation Standards**: https://www.iso.org/standard/35434.html
- **ITAR Compliance Guidelines**: https://www.pmddtc.state.gov/ddtc_public/ddtc_public?id=ddtc_public_portal_itar_landing
- **SOX Audit Trail Requirements**: https://www.sox-online.com/sox_audit_trail.html
- **DoD DFARS Requirements**: https://www.acquisition.gov/dfars

### **Security & Data Protection:**
- **Google Workspace Security**: https://workspace.google.com/security/
- **Apps Script Security Best Practices**: https://developers.google.com/apps-script/guides/services/authorization
- **ITAR Data Classification**: https://www.pmddtc.state.gov/ddtc_public/ddtc_public?id=ddtc_kb_article_page&sys_id=24d528fddbfc930044f9ff621f961987
- **Export Control Document Handling**: https://www.bis.doc.gov/index.php/policy-guidance/technology-controls-and-reports

### **Development Tools & Best Practices:**
- **Google Apps Script Samples**: https://github.com/googleworkspace/apps-script-samples
- **Clasp CLI Tool**: https://github.com/google/clasp
- **Apps Script OAuth2 Library**: https://github.com/googleworkspace/apps-script-oauth2
- **Tanaikech's Advanced Examples**: https://github.com/tanaikech/taking-advantage-of-google-apps-script
- **React + Apps Script**: https://github.com/enuchi/React-Google-Apps-Script

## OTHER CONSIDERATIONS:

### **Manufacturing-Specific Critical Requirements:**
- **Precision Mandates**: Manufacturing specs require >99% extraction accuracy for material grades, tolerances, and certifications - a single misread specification (A36 vs A572 steel) can result in $10,000+ scrapped castings
- **Part Number Complexity**: Customer part numbers, internal part numbers, and supplier part numbers are all different for the same physical part - fuzzy matching algorithms must account for alphanumeric variations, prefixes/suffixes, and revision indicators
- **Drawing Revision Control**: Rev A vs Rev B differences are critical and often appear in small text or drawing title blocks that standard OCR misses - implement specific pattern recognition for "REV", "REVISION", and drawing number formats
- **Certification Requirements**: QC codes (like "MT required", "PMI verification", "3.1 cert needed") are business-critical but often buried in small tables or footnotes - missing these causes shipping delays and customer complaints
- **Material Traceability**: Heat numbers, mill test certificates, and material certifications must be extracted with 100% accuracy for aerospace/defense customers - no room for AI hallucination

### **Google Apps Script Absolute Limitations:**
- **6-Minute Execution Wall**: No exceptions, no extensions possible - every function must complete or queue next step within 5.5 minutes to allow cleanup time
- **Memory Limits with Large PDFs**: 53-page documents (10MB+) will crash GAS without proper blob chunking and garbage collection - implement progressive processing and memory monitoring
- **Trigger Accumulation Death Spiral**: Failed cleanup of time-based triggers will eventually exceed GAS limits and break the entire system - implement aggressive trigger cleanup in every function
- **Properties Service 9KB Limit**: Job state objects quickly exceed this limit with large documents - use combination of Properties for metadata and Sheets for bulk data
- **No True Concurrency**: All "parallel" processing must use time-based triggers with careful state management - race conditions are common with multiple documents processing simultaneously
- **UrlFetch 20MB Response Limit**: Large API responses from Odoo or Paperless Parts must be paginated - cannot fetch complete datasets in single calls

### **Business Logic Complexities Often Missed:**
- **Discrepancy Impact Assessment**: Not all discrepancies are equal - quantity changes <10% might be acceptable, but material specification changes always require approval regardless of cost impact
- **Customer Portal Authentication**: Each major customer (Boeing, Lockheed, General Dynamics) has different portal authentication schemes - some require two-factor, others use SAML, many have session timeouts
- **Existing vs New Part Detection**: Critical business decision with financial impact - reusing existing tooling saves $5,000+ per part, but incorrectly matching similar parts causes quality issues
- **Order Entry Team Workflow Preservation**: Current printed annotation process with highlighters and handwritten notes serves as legal backup for disputes - digital system must maintain this audit trail
- **Jeff's Escalation Criteria**: "Major" discrepancies requiring Jeff's attention are contextual - $500 change might be minor for Boeing but major for smaller customers, material changes always escalate regardless of cost

### **Integration Landmines:**
- **Paperless Parts Email Format Sensitivity**: Auto-generation expects exact formatting - extra spaces, different date formats, or missing fields cause silent failures with no error notification
- **Odoo Custom Field Mapping**: WClark has customized ERP fields not in standard documentation - "QC_Code_1" through "QC_Code_8" are custom fields critical for certification tracking
- **Google Drive ITAR Separation**: Export control documents must remain physically separated from general business documents - automated folder creation must respect this security boundary
- **Email Threading Complexity**: RFQs and POs often arrive in long email threads with multiple attachments - must identify correct documents and ignore previous versions or unrelated attachments

### **Scaling Failure Points:**
- **200 Quotes/Week = API Rate Limit Death**: Gemini API quotas and Gmail API limits become bottlenecks - implement intelligent batching and caching strategies
- **Cost Explosion at Scale**: $20/month budget works for 20 quotes but fails at 200 - need cost monitoring with automatic throttling before budget exhaustion
- **Error Recovery Complexity**: At high volume, failed jobs accumulate faster than manual recovery - implement automated retry with exponential backoff and dead letter queues
- **Queue Management Under Load**: Peak periods (month-end) can create 3-day processing backlogs - need prioritization logic based on customer importance and delivery dates

### **Data Quality Gotchas:**
- **Faxed Document Degradation**: Many manufacturing documents are faxed multiple times creating artifacts that confuse OCR - implement quality scoring and automatic re-processing triggers
- **Handwritten Customer Modifications**: Customers frequently hand-annotate changes on printed documents before scanning - OCR cannot read these critical modifications
- **Table Extraction Brittleness**: Manufacturing line item tables have inconsistent formatting across customers - some use merged cells, others split across pages, many have embedded notes
- **Multi-Format Document Mixing**: Same customer might send Excel spreadsheets, PDF drawings, and Word documents all for the same RFQ - system must handle format detection and appropriate processing

### **Testing & Validation Requirements Often Overlooked:**
- **Real Customer Document Testing**: Generic PDFs behave differently than actual customer documents with specific formatting, fonts, and scan quality - must test with real WClark document archive
- **Volume Testing at Scale**: 20 quotes/week vs 200 quotes/week have completely different failure modes - resource contention, API throttling, and error accumulation patterns change dramatically
- **Integration Testing with Live Systems**: Paperless Parts and Odoo sandbox environments don't fully replicate production behavior - need staging environment testing with real API keys
- **Rollback Strategy for Data Corruption**: Manufacturing cannot afford ERP data corruption - need comprehensive backup and rollback procedures tested under various failure scenarios
- **Peak Load Testing**: Month-end processing surges can be 5x normal volume - system must gracefully degrade rather than catastrophically fail

### **Compliance & Legal Considerations:**
- **SOX Audit Trail Completeness**: Every data modification must be logged with user, timestamp, old value, new value, and business justification - incomplete audit trails fail compliance audits
- **ITAR Document Handling**: Export control documents require special handling with access logging and geographic restrictions - mixing ITAR and non-ITAR data violates federal regulations
- **Customer Contract Terms**: Some customers require specific data handling procedures or prohibit cloud processing - must implement customer-specific processing rules
- **Data Retention Requirements**: Manufacturing documents must be retained for 7+ years with full searchability - Google Drive organization must support long-term archival and retrieval