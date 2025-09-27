# GitHub Issues to Create for SplitPay

## High Priority Issues

### 1. Custom Split Feature
**Title:** [FEATURE] Implement custom bill splitting (unequal shares)
**Labels:** enhancement, backend, frontend, priority: high
**Milestone:** Sprint 2

**Description:**
Currently SplitPay only supports equal splitting. We need to add custom splitting where organizers can assign different amounts to different participants.

**Acceptance Criteria:**
- [ ] Add custom split option in bill creation form
- [ ] Allow organizer to assign specific amounts to each participant
- [ ] Validate that custom amounts sum to total bill amount
- [ ] Update backend API to handle custom splits
- [ ] Update frontend to display custom amounts correctly
- [ ] Add validation for custom split amounts

**User Story:**
As an organizer, I want to assign different amounts to participants so that people who consumed more pay more.

**Effort Estimate:** Medium (3-5 days)

---

### 2. M-Pesa Daraja API Integration
**Title:** [FEATURE] Complete M-Pesa Daraja API integration
**Labels:** enhancement, backend, priority: high
**Milestone:** Sprint 3

**Description:**
The current implementation has placeholder M-Pesa integration. We need to complete the actual Daraja API integration for STK Push and callbacks.

**Acceptance Criteria:**
- [ ] Implement proper Daraja API authentication
- [ ] Complete STK Push implementation
- [ ] Handle M-Pesa callbacks properly
- [ ] Add proper error handling for failed payments
- [ ] Test with Daraja sandbox environment
- [ ] Add payment retry functionality

**User Story:**
As a participant, I want to pay my share via M-Pesa STK Push so that payments are processed securely.

**Effort Estimate:** Large (1-2 weeks)

---

### 3. SMS Integration for OTP
**Title:** [FEATURE] Implement SMS OTP via Africa's Talking
**Labels:** enhancement, backend, priority: high
**Milestone:** Sprint 2

**Description:**
Currently OTP is only shown in development mode. We need to integrate with Africa's Talking SMS API for production OTP delivery.

**Acceptance Criteria:**
- [ ] Integrate Africa's Talking SMS API
- [ ] Add Twilio as fallback SMS provider
- [ ] Implement OTP rate limiting
- [ ] Add SMS delivery status tracking
- [ ] Handle SMS failures gracefully
- [ ] Add SMS cost tracking

**User Story:**
As a user, I want to receive OTP via SMS so that I can verify my phone number.

**Effort Estimate:** Medium (3-5 days)

---

## Medium Priority Issues

### 4. Bill Sharing Improvements
**Title:** [FEATURE] Enhanced bill sharing with QR codes and deep links
**Labels:** enhancement, frontend, ui/ux, priority: medium
**Milestone:** Sprint 3

**Description:**
Improve bill sharing experience with QR codes, better WhatsApp integration, and mobile-optimized sharing.

**Acceptance Criteria:**
- [ ] Generate QR codes for bill links
- [ ] Improve WhatsApp sharing with better formatting
- [ ] Add SMS sharing option
- [ ] Optimize sharing for mobile devices
- [ ] Add share analytics tracking
- [ ] Implement share link expiration

**User Story:**
As an organizer, I want to easily share bills via QR codes and WhatsApp so that participants can join quickly.

**Effort Estimate:** Medium (3-5 days)

---

### 5. Payment Reminders
**Title:** [FEATURE] Automated payment reminders
**Labels:** enhancement, backend, priority: medium
**Milestone:** Sprint 4

**Description:**
Add functionality to send automated reminders to participants who haven't paid their share.

**Acceptance Criteria:**
- [ ] Add reminder scheduling system
- [ ] Send WhatsApp/SMS reminders
- [ ] Allow organizer to customize reminder messages
- [ ] Track reminder delivery status
- [ ] Add reminder frequency controls
- [ ] Implement reminder analytics

**User Story:**
As an organizer, I want to send reminders to participants who haven't paid so that I don't have to chase them manually.

**Effort Estimate:** Medium (3-5 days)

---

### 6. Group Management
**Title:** [FEATURE] Save and manage frequent groups
**Labels:** enhancement, backend, frontend, priority: medium
**Milestone:** Sprint 4

**Description:**
Allow users to save frequent groups (like chama members, work colleagues) for easier bill creation.

**Acceptance Criteria:**
- [ ] Add group creation and management
- [ ] Allow adding/removing group members
- [ ] Save group preferences (default split type)
- [ ] Quick group selection in bill creation
- [ ] Group member management interface
- [ ] Group sharing functionality

**User Story:**
As a regular user, I want to save my frequent groups so that I don't have to enter phone numbers repeatedly.

**Effort Estimate:** Large (1-2 weeks)

---

## Low Priority Issues

### 7. Receipt Enhancements
**Title:** [FEATURE] Enhanced receipt generation and sharing
**Labels:** enhancement, frontend, priority: low
**Milestone:** Sprint 4

**Description:**
Improve receipt generation with better formatting, PDF export, and email sharing.

**Acceptance Criteria:**
- [ ] Generate PDF receipts
- [ ] Add email sharing functionality
- [ ] Improve receipt formatting and design
- [ ] Add receipt templates
- [ ] Implement receipt archiving
- [ ] Add receipt search functionality

**User Story:**
As a participant, I want to receive a well-formatted receipt so that I can keep records of my payments.

**Effort Estimate:** Medium (3-5 days)

---

### 8. Analytics Dashboard
**Title:** [FEATURE] Organizer analytics and insights
**Labels:** enhancement, frontend, backend, priority: low
**Milestone:** Sprint 4

**Description:**
Add analytics dashboard for organizers to track payment patterns, group activity, and usage statistics.

**Acceptance Criteria:**
- [ ] Create analytics data models
- [ ] Build analytics API endpoints
- [ ] Design analytics dashboard UI
- [ ] Add payment trend charts
- [ ] Implement group activity tracking
- [ ] Add export functionality for analytics

**User Story:**
As an organizer, I want to see analytics about my bills and groups so that I can understand usage patterns.

**Effort Estimate:** Large (1-2 weeks)

---

### 9. Mobile App (PWA)
**Title:** [FEATURE] Progressive Web App (PWA) implementation
**Labels:** enhancement, frontend, priority: low
**Milestone:** Sprint 4

**Description:**
Convert the web app to a Progressive Web App for better mobile experience and offline functionality.

**Acceptance Criteria:**
- [ ] Add PWA manifest
- [ ] Implement service worker for offline functionality
- [ ] Add app installation prompts
- [ ] Optimize for mobile performance
- [ ] Add push notifications
- [ ] Implement offline bill viewing

**User Story:**
As a mobile user, I want to install SplitPay as an app so that I can access it quickly from my home screen.

**Effort Estimate:** Large (1-2 weeks)

---

### 10. Multi-language Support
**Title:** [FEATURE] Swahili and English language support
**Labels:** enhancement, frontend, priority: low
**Milestone:** Sprint 4

**Description:**
Add support for Swahili language to make the app more accessible to Kenyan users.

**Acceptance Criteria:**
- [ ] Implement i18n framework
- [ ] Translate all UI text to Swahili
- [ ] Add language switcher
- [ ] Localize currency formatting
- [ ] Add Swahili SMS templates
- [ ] Test with Swahili content

**User Story:**
As a Swahili speaker, I want to use SplitPay in Swahili so that I can understand the interface better.

**Effort Estimate:** Medium (3-5 days)

---

## Bug Fixes

### 11. Fix Django Server Startup Issue
**Title:** [BUG] Django server fails to start due to missing dependencies
**Labels:** bug, backend, priority: high
**Milestone:** Sprint 1

**Description:**
The Django server was failing to start due to missing python-dotenv and other dependencies. This has been partially fixed but needs proper documentation.

**Acceptance Criteria:**
- [ ] Document all required dependencies
- [ ] Create proper setup instructions
- [ ] Add dependency validation script
- [ ] Test setup on clean environment
- [ ] Update README with troubleshooting

**User Story:**
As a developer, I want the Django server to start without errors so that I can develop the application.

**Effort Estimate:** Small (1-2 days)

---

### 12. Environment Configuration
**Title:** [TASK] Set up proper environment configuration
**Labels:** task, backend, priority: medium
**Milestone:** Sprint 1

**Description:**
Create proper environment configuration files and documentation for different deployment environments.

**Acceptance Criteria:**
- [ ] Create .env.example file
- [ ] Document all environment variables
- [ ] Add environment validation
- [ ] Create development/staging/production configs
- [ ] Add environment setup script
- [ ] Document deployment process

**User Story:**
As a developer, I want clear environment setup instructions so that I can configure the application properly.

**Effort Estimate:** Small (1-2 days)

---

## Technical Debt

### 13. API Documentation
**Title:** [TASK] Complete API documentation with Swagger
**Labels:** task, backend, documentation, priority: medium
**Milestone:** Sprint 2

**Description:**
Complete the API documentation using drf-spectacular (already installed) and add comprehensive endpoint documentation.

**Acceptance Criteria:**
- [ ] Document all API endpoints
- [ ] Add request/response examples
- [ ] Include authentication documentation
- [ ] Add error response documentation
- [ ] Create API testing guide
- [ ] Deploy API docs to accessible URL

**User Story:**
As a developer, I want comprehensive API documentation so that I can integrate with the backend easily.

**Effort Estimate:** Medium (3-5 days)

---

### 14. Database Migrations
**Title:** [TASK] Review and optimize database migrations
**Labels:** task, backend, database, priority: low
**Milestone:** Sprint 2

**Description:**
Review existing database migrations and optimize them for production deployment.

**Acceptance Criteria:**
- [ ] Review all existing migrations
- [ ] Add proper indexes for performance
- [ ] Optimize migration dependencies
- [ ] Add migration rollback procedures
- [ ] Test migrations on production-like data
- [ ] Document migration procedures

**User Story:**
As a developer, I want optimized database migrations so that deployments are smooth and fast.

**Effort Estimate:** Small (1-2 days)

---

### 15. Error Handling
**Title:** [TASK] Improve error handling and user feedback
**Labels:** task, backend, frontend, priority: medium
**Milestone:** Sprint 2

**Description:**
Improve error handling throughout the application with better user feedback and logging.

**Acceptance Criteria:**
- [ ] Add comprehensive error logging
- [ ] Improve user-facing error messages
- [ ] Add error tracking (Sentry integration)
- [ ] Implement graceful error recovery
- [ ] Add error monitoring dashboard
- [ ] Create error handling guidelines

**User Story:**
As a user, I want clear error messages so that I understand what went wrong and how to fix it.

**Effort Estimate:** Medium (3-5 days)
