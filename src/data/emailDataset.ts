import { EmailData } from '../types/ml';

export const RAW_EMAIL_DATASET: EmailData[] = [
  // --- PHISHING EMAILS ---
  {
    id: 'PHISH-001',
    sender: 'security-alert@micros0ft-verify.com',
    subject: 'URGENT: Microsoft 365 Password Expiry Warning - Action Required Within 24 Hours',
    body: `Dear User,

Your Microsoft Office 365 password expires in less than 24 hours. Failure to update your credentials immediately will result in permanent suspension of your mailbox and enterprise access.

Please click the secure portal below to keep your current password and avoid service termination:
http://login.micros0ft-verify.com/auth/update-session?id=98321

Do not ignore this critical security warning.

IT Infrastructure Team
Global Support Services`,
    label: 'phishing',
    category: 'Credential Harvesting',
    notes: 'Lookalike domain micros0ft-verify.com, artificial 24hr urgency, malicious link'
  },
  {
    id: 'PHISH-002',
    sender: 'payroll@secure-adp-update.net',
    subject: 'Action Required: Direct Deposit Form Verification Update Needed',
    body: `Hello Team Member,

Due to a scheduled system migration, your direct deposit banking information could not be processed for the upcoming bi-weekly payroll cycle.

To ensure your salary is disbursed on time without delay, please confirm your routing number and account details via our encrypted payroll gateway:
https://payroll-portal-auth.net/adp/reverify?user=payroll

Failure to verify before 5:00 PM today will result in withheld payments until the next pay period.

Sincerely,
Corporate Payroll Department`,
    label: 'phishing',
    category: 'Financial / Direct Deposit',
    notes: 'Payroll scam targeting direct deposit credentials with tight deadline'
  },
  {
    id: 'PHISH-003',
    sender: 'executive-office@ceo-directline.org',
    subject: 'Quick favor - Need urgent Apple gift cards for client meeting',
    body: `Are you at your desk right now?

I am currently in an executive meeting with major prospective clients and cannot take phone calls. I urgently need you to purchase 5 Apple gift cards ($100 each) for an client incentive presentation.

Please scratch the backs, take clear photos of the redemption codes, and email them directly to me right away. I will reimburse you by end of day through expense management.

Please treat this as confidential and urgent.

Sent from my iPhone
Chief Executive Officer`,
    label: 'phishing',
    category: 'Business Email Compromise (BEC)',
    notes: 'Classic CEO impersonation, untraceable gift card payment, pressure to bypass procedure'
  },
  {
    id: 'PHISH-004',
    sender: 'tracking-support@dhl-express-parcel.info',
    subject: 'DHL Express: Unsuccessful Delivery Notice #US-98214 - Customs Duty Pending',
    body: `Valued Customer,

Your parcel tracking number DHL-98214-US could not be delivered to your registered delivery address due to unpaid customs clearance fees of $3.50.

Your package is currently held at the local regional distribution hub. To release your package for redelivery tomorrow morning, please settle the outstanding fee here:
http://dhl-express-parcel.info/clearance/pay-fee?pkg=98214

If unpaid within 48 hours, the shipment will be returned to sender or destroyed.

DHL Logistics Customer Operations`,
    label: 'phishing',
    category: 'Package / Delivery Scam',
    notes: 'Small fee pretext, spoofed logistics brand, malicious payment URL'
  },
  {
    id: 'PHISH-005',
    sender: 'no-reply@paypaI-notification.com',
    subject: 'Account Suspended: Unauthorized transaction of $849.99 detected',
    body: `Dear customer,

We detected an unauthorized payment of $849.99 to 'TechElectronics Store' from an unrecognized IP address in Moscow, Russia.

We have temporarily restricted your PayPal account to safeguard your assets. If you did not authorize this purchase, please dispute the transaction immediately by logging in below:
http://paypaI-notification.com/dispute-case?id=PP-89214

Failure to verify your identity within 12 hours will finalize the charge.

Fraud Prevention Center`,
    label: 'phishing',
    category: 'Account Suspension / Fraud Lure',
    notes: 'Homoglyph domain (paypaI with uppercase I), fake high-value transaction panic'
  },
  {
    id: 'PHISH-006',
    sender: 'admin@chase-secure-verify.biz',
    subject: 'Chase Security: Immediate Verification Required for Online Banking Access',
    body: `Chase Online Banking Alert:

We have noticed multiple unsuccessful sign-in attempts on your Chase debit and checking account. For your protection, online access has been disabled.

To unlock your account, verify your identity and confirm your Social Security Number and PIN at:
https://chase-secure-verify.biz/enroll/reactivate

Please do not reply to this email. For assistance, visit our secure verification terminal above.

JPMorgan Chase Customer Protection`,
    label: 'phishing',
    category: 'Banking / Credential Theft',
    notes: 'Suspicious .biz TLD, request for sensitive SSN/PIN data, false security alert'
  },
  {
    id: 'PHISH-007',
    sender: 'service@internal-helpdesk-upgrade.co',
    subject: 'CRITICAL: Mailbox Quota Exceeded (99.8%) - Inbound Emails Being Blocked',
    body: `Attention Mailbox Owner,

Your storage quota of 15.0 GB has reached 99.8% capacity. 14 incoming emails are currently queued on the server and will be bounced back to senders within 6 hours.

To expand your quota to 50 GB free of charge and retrieve your pending messages, validate your mailbox storage here:
http://internal-helpdesk-upgrade.co/storage/expand?user=mailbox

Thank you for your prompt cooperation.

IT Systems Administrator`,
    label: 'phishing',
    category: 'IT Helpdesk / Quota',
    notes: 'Fake storage limit panic, queued email fear tactic'
  },
  {
    id: 'PHISH-008',
    sender: 'irs-refund@internal-revenue-refunds.com',
    subject: 'IRS Notice: Eligible Tax Refund of $1,420.50 Approved - Claim Online',
    body: `Official Tax Refund Notification:

The Internal Revenue Service (IRS) has reviewed your fiscal year tax calculations and determined that you are entitled to an unclaimed refund of $1,420.50.

To deposit this refund directly to your bank account, please complete Form 1040-R online:
http://internal-revenue-refunds.com/claim/refund-direct-deposit

Submissions must be finalized within 7 business days to avoid forfeiture.

Internal Revenue Service
Department of the Treasury`,
    label: 'phishing',
    category: 'Tax / Government Impersonation',
    notes: 'Government impersonation, unexpected monetary reward lure, credential harvester'
  },
  {
    id: 'PHISH-009',
    sender: 'orders@amazon-security-billing.net',
    subject: 'Your Amazon order for Apple iPhone 16 Pro Max ($1,299.00) has been placed',
    body: `Thank you for your order with Amazon.com!

Order Summary:
Item: Apple iPhone 16 Pro Max 256GB Space Black
Amount Billed: $1,299.00
Shipping To: 4821 Elm Street, Austin, TX

If you did not authorize this purchase, please contact our Fraud Support desk immediately or cancel the transaction directly through this link:
http://amazon-security-billing.net/orders/cancel-unauthorized?id=7821

Please act quickly as this order is preparing for same-day dispatch.

Amazon Customer Fulfillment`,
    label: 'phishing',
    category: 'E-Commerce / Order Confirmation Scam',
    notes: 'High-value accidental order panic, non-amazon domain, fake cancellation portal'
  },
  {
    id: 'PHISH-010',
    sender: 'sharing@dropbox-filesharing-docs.com',
    subject: 'Confidential: "Q4_Confidential_Salary_Review.pdf" has been shared with you',
    body: `Dropbox Shared Document:

A senior human resources partner has shared the following file with you via Dropbox:
"Q4_Executive_Compensation_and_Salary_Bands.pdf"

View Document Online:
http://dropbox-filesharing-docs.com/view/document-auth?key=9281

This link requires corporate authentication and will expire in 48 hours.

Dropbox Business Team`,
    label: 'phishing',
    category: 'Curiosity / Document Phishing',
    notes: 'Salacious document name lure (salary bands), third-party lookalike domain'
  },
  {
    id: 'PHISH-011',
    sender: 'alerts@netflix-billing-update.cc',
    subject: 'Membership On Hold: Please update your payment method to avoid cancellation',
    body: `We were unable to process your monthly membership payment for Netflix.

Your subscription will be terminated at midnight unless you update your credit card details. Click below to continue watching your favorite movies:
http://netflix-billing-update.cc/update/payment

We're here to help if you have any questions.

The Netflix Team`,
    label: 'phishing',
    category: 'Subscription / Streaming Scam',
    notes: 'Suspicious .cc domain, billing cancellation threat, urgent tone'
  },
  {
    id: 'PHISH-012',
    sender: 'wire-transfers@bankofamerica-securewire.org',
    subject: 'URGENT WIRE TRANSFER AUTHORIZATION: #WT-44910 Pending Clearance',
    body: `Bank of America Treasury Services:

An outgoing international wire transfer of $45,000.00 USD to 'Global Horizon Holdings' is currently held pending mandatory dual-authorization.

If this wire was NOT requested by authorized account signatories, immediately cancel the transfer through the wire verification portal:
http://bankofamerica-securewire.org/wire/dispute-auth

Unauthorized funds will be released to the recipient institution if no action is taken within 30 minutes.

Bank of America Commercial Fraud Unit`,
    label: 'phishing',
    category: 'Financial / Wire Fraud',
    notes: 'High-pressure 30-minute window, large financial exposure panic'
  },
  {
    id: 'PHISH-013',
    sender: 'support@zoom-videomeetings-join.com',
    subject: 'Missed Zoom Meeting: Recording and Transcript Available for Review',
    body: `You missed a scheduled meeting with 'Senior Leadership Board'.

The recording, AI summary, and meeting transcript have been archived. You have been tagged in several action items during the call.

Access meeting recording:
http://zoom-videomeetings-join.com/recordings/play?id=38192

Password authentication is required to access executive recordings.

Zoom Communications`,
    label: 'phishing',
    category: 'Workplace Lure',
    notes: 'Fear of missing out, fake missed meeting with executive leadership'
  },
  {
    id: 'PHISH-014',
    sender: 'hr@workplace-bonus-distribution.net',
    subject: 'Special End of Year Performance Bonus Allocation - Form W-2 Validation',
    body: `Dear Employee,

Executive management has approved a one-time performance bonus pool for all staff. Your allocated bonus tier is ready for disbursement.

To calculate your net payout and verify tax withholding, please access the confidential bonus portal:
http://workplace-bonus-distribution.net/bonus/claim?emp=all

Please confirm your details before Friday to receive payment in this pay run.

Human Resources Department`,
    label: 'phishing',
    category: 'HR / Bonus Scam',
    notes: 'Greed/reward lure, urgent deadline, non-company domain'
  },
  {
    id: 'PHISH-015',
    sender: 'security@linkedin-connections-profile.com',
    subject: 'You have 7 new profile views and an urgent private message from a Recruiter',
    body: `LinkedIn Notifications:

A Partner at a Tier-1 Venture Capital firm viewed your profile and sent you a private message regarding an executive opening ($280k-$320k).

Click below to read your confidential InMail message:
http://linkedin-connections-profile.com/inmail/view?id=49210

Stay connected with opportunities in your industry.

LinkedIn Talent Solutions`,
    label: 'phishing',
    category: 'Social Media / Recruitment',
    notes: 'Career incentive lure, lookalike LinkedIn domain'
  },

  // --- SAFE / LEGITIMATE EMAILS ---
  {
    id: 'SAFE-001',
    sender: 'marcus.vance@company.com',
    subject: 'Sprint 24 Planning: Agenda and Backlog Grooming Notes',
    body: `Hi team,

Here is the agenda for our upcoming Sprint 24 planning session scheduled for tomorrow at 10:00 AM PST.

Key items to cover:
1. Review velocity from Sprint 23 (completed 42 story points).
2. Prioritize search indexing improvements and database query optimization.
3. Review feedback from the customer testing group on the new analytics dashboard.
4. Finalize story point estimates for candidate backlog items.

Please take a few minutes before the meeting to review the Jira board and leave comments on any tickets that require technical clarifications.

Meeting link is on our Google Calendar.

Thanks,
Marcus Vance
Product Lead`,
    label: 'safe',
    category: 'Internal Work / Project Planning',
    notes: 'Standard corporate communication, realistic project details, no urgent external links'
  },
  {
    id: 'SAFE-002',
    sender: 'hr-benefits@company.com',
    subject: 'Annual Open Enrollment for Health & Dental Benefits: November 1 - November 21',
    body: `Dear colleagues,

Our annual Benefits Open Enrollment period begins next Monday, November 1st, and will run through Friday, November 21st.

This is your yearly opportunity to review and make changes to your medical, dental, vision, and flexible spending accounts for the upcoming calendar year. If you are satisfied with your current coverage, most selections will rollover automatically with the exception of FSA accounts.

Informational webinars will be held this Thursday at 2:00 PM EST. Details and plan comparison guides can be found on our internal intranet at company.internal/hr/benefits.

Please reach out to hr-benefits@company.com if you have any questions.

Best regards,
People Operations Team`,
    label: 'safe',
    category: 'Internal HR / Information',
    notes: 'Legitimate internal domain, reasonable timeline (3 weeks), internal portal reference'
  },
  {
    id: 'SAFE-003',
    sender: 'notifications@github.com',
    subject: '[acme-corp/api-gateway] Pull Request #142: Add Redis caching layer (merged)',
    body: `acme-corp / api-gateway

Pull request #142 has been successfully merged into main by sarah-chen.

Summary of changes:
- Integrated Redis client with exponential backoff retry logic.
- Added automated unit tests for cache invalidation.
- Reduced p99 latency on product query endpoint from 180ms to 24ms.

Branch 'feature/redis-cache' has been deleted.

View this on GitHub:
https://github.com/acme-corp/api-gateway/pull/142

You are receiving this notification because you are watching this repository.`,
    label: 'safe',
    category: 'Developer Notification',
    notes: 'Authentic GitHub notification, valid github.com domain, standard git summary'
  },
  {
    id: 'SAFE-004',
    sender: 'elena.rostova@company.com',
    subject: 'Q3 Financial Review Meeting: Updated Slide Deck Attached',
    body: `Hi David and team,

I have finalized the draft of our Q3 financial review presentation ahead of Thursday's executive committee meeting.

Highlights included:
- Recurring subscription revenue grew by 18% quarter-over-quarter.
- Operating expenses remained within the projected 5% variance buffer.
- Headcount expansion for engineering and customer success is on target.

Please review slides 8 through 14 which detail our unit economics and customer acquisition costs. Let me know if you would like any numbers adjusted before we print the board binder.

Warm regards,
Elena Rostova
Finance Director`,
    label: 'safe',
    category: 'Internal Finance / Reporting',
    notes: 'Professional business context, specific metrics, normal internal collaboration'
  },
  {
    id: 'SAFE-005',
    sender: 'calendar-notification@google.com',
    subject: 'Invitation: Weekly Architecture Review @ Every Tuesday 2pm (EDT)',
    body: `You have been invited to the following event:

Weekly Architecture Review
When: Every Tuesday, 2:00 PM - 3:00 PM Eastern Time
Where: Google Meet (meet.google.com/xyz-abcd-efg)
Organizer: alex.t@company.com

Guests:
- alex.t@company.com (organizer)
- dev-leads@company.com
- you@company.com

Agenda:
Reviewing proposed architectural changes for the microservices migration and discussing message broker evaluations (Kafka vs RabbitMQ).

Reply with Yes / Maybe / No on your Google Calendar app.`,
    label: 'safe',
    category: 'Calendar Invite',
    notes: 'Authentic Google Calendar notification with legitimate Google Meet link'
  },
  {
    id: 'SAFE-006',
    sender: 'orders@amazon.com',
    subject: 'Your Amazon.com order #112-9842104-554210 has shipped',
    body: `Hello Alex,

We thought you'd like to know that your items have shipped!

Order Details:
Order #112-9842104-554210
Delivery Estimate: Thursday, October 15 by 8:00 PM
Carrier: Amazon Logistics (TBA9842104)

Item:
Anker USB-C Fast Charger Cable (2-Pack, 6ft)
Sold by AnkerDirect

Track your package or manage order options in your Amazon account:
https://www.amazon.com/gp/css/order-history

Thank you for shopping with us!
Amazon.com`,
    label: 'safe',
    category: 'Legitimate E-Commerce',
    notes: 'Genuine amazon.com domain and format, reasonable routine purchase, no urgent threat'
  },
  {
    id: 'SAFE-007',
    sender: 'support@slack.com',
    subject: 'Slack Monthly Summary: New features available in your workspace',
    body: `Hi Alex,

Here is a quick look at what is new in your Acme Corp Slack workspace this month:

- Canvas in channels: Collaborate on notes, checklists, and project briefs directly inside your team channels.
- Improved Huddle screen sharing: Annotate screens together in real time.
- Updated notification schedule: Easily set Do Not Disturb hours according to your local timezone.

To explore these features, simply open Slack on your desktop or mobile app.

Cheers,
The team at Slack`,
    label: 'safe',
    category: 'Product Update / Newsletter',
    notes: 'Informational product update, no credential requests or panic inducements'
  },
  {
    id: 'SAFE-008',
    sender: 'it-operations@company.com',
    subject: 'Scheduled Maintenance Notice: Staging Server Upgrades this Saturday 11 PM',
    body: `Hello Engineering Team,

Please be advised that the internal DevOps team will be applying kernel patches and upgrading PostgreSQL staging databases this Saturday, October 18, between 11:00 PM and 2:00 AM UTC.

Impact:
- The staging cluster (staging.api.company.internal) will experience brief intermittent downtime.
- Production environments will NOT be affected.

No action is required from developers. If you have critical end-to-end integration tests running during this maintenance window, please reschedule them accordingly.

Regards,
DevOps and Site Reliability Engineering`,
    label: 'safe',
    category: 'Internal IT Operations',
    notes: 'Standard maintenance advisory, clear timeframe, specifies no action required'
  },
  {
    id: 'SAFE-009',
    sender: 'billing@digitalocean.com',
    subject: 'DigitalOcean Invoice for October 2026: #IN-88912 ($42.00 USD)',
    body: `Hello Acme Development,

Your monthly invoice for DigitalOcean cloud services has been generated.

Invoice Number: IN-88912
Date: October 1, 2026
Amount: $42.00 USD
Payment Method: Visa ending in 4281 (Charged automatically)

Summary:
- 2x Standard Droplet (NYC3): $24.00
- Managed PostgreSQL Database: $15.00
- Spaces Object Storage: $3.00

You can download a PDF copy of this receipt by logging into your cloud dashboard at:
https://cloud.digitalocean.com/billing

Thank you for using DigitalOcean!`,
    label: 'safe',
    category: 'Billing Receipt',
    notes: 'Valid digitalocean.com billing statement, charge already processed, routine bill'
  },
  {
    id: 'SAFE-010',
    sender: 'community@pycon.org',
    subject: 'PyCon US 2027: Call for Proposals (CFP) is Now Open',
    body: `Hello Python Community Member,

We are excited to announce that the Call for Proposals (CFP) for PyCon US 2027 is officially open!

We welcome talk proposals, tutorial submissions, and poster sessions across all areas of Python:
- Machine Learning and Data Science
- Web Frameworks & APIs (FastAPI, Django, Flask)
- Cybersecurity & Secure Software Development
- DevOps and Cloud Infrastructure

Submission Deadline: December 15, 2026.
First-time speakers are encouraged to submit and can request a mentor to review their outline.

For guidelines and submission forms, visit:
https://us.pycon.org/2027/speaking/cfp/

We look forward to seeing you there!
The PyCon US Organizing Committee`,
    label: 'safe',
    category: 'Community / Conference',
    notes: 'Legitimate nonprofit domain, open submission deadline, friendly community tone'
  },
  {
    id: 'SAFE-011',
    sender: 'support@docker.com',
    subject: 'Docker Desktop 4.35 Release Notes: Enhanced Compose Performance',
    body: `Docker Desktop 4.35 is now available.

What is new in this update:
- Up to 30% faster container startup times with improved virtual filesystem drivers.
- Native support for multi-platform build caches.
- Updated security vulnerability scans with automated CVE severity scoring.

You can update directly from Docker Desktop by clicking the gear icon > Software Updates, or download the installer from docker.com.

Best,
Docker Engineering Team`,
    label: 'safe',
    category: 'Developer Software Release',
    notes: 'Authentic software release notes with internal update instructions'
  },
  {
    id: 'SAFE-012',
    sender: 'organizing-team@company.com',
    subject: 'Team Lunch & Learn: Introduction to Machine Learning in Cybersecurity',
    body: `Hi everyone,

Join us this Friday at 12:30 PM in the 4th Floor Café (or via the hybrid Meet link) for our monthly Lunch & Learn session!

Speaker: Dr. Kenneth Cole (Lead Security Data Scientist)
Topic: How Modern SOCs Use Machine Learning to Detect Phishing & Malware at Scale

Lunch (sandwich platters, salads, and drinks) will be provided for those attending in person. Please RSVP on the calendar invitation so we can finalize the catering count.

Looking forward to a great discussion!

Social Committee`,
    label: 'safe',
    category: 'Internal Culture / Education',
    notes: 'Wholesome internal event, no suspicious links, clear organizational context'
  },
  {
    id: 'SAFE-013',
    sender: 'no-reply@zoom.us',
    subject: 'Your Zoom Cloud Recording is now available (Architecture Sync)',
    body: `Hi Alex,

Your cloud recording for 'Architecture Sync' held on October 9, 2026 is ready to view.

Meeting ID: 819 2314 9021
Host: Alex Miller
Topic: Architecture Sync
Duration: 48 minutes

You can view the recording, audio transcript, and chat logs by signing into your organization's Zoom portal at zoom.us or through your corporate single sign-on.

Thank you,
Zoom Video Communications`,
    label: 'safe',
    category: 'Workplace Recording',
    notes: 'Legitimate zoom.us domain, normal meeting metadata, corporate SSO instruction'
  },
  {
    id: 'SAFE-014',
    sender: 'customer-care@fidelity.com',
    subject: 'Your Fidelity Monthly Statement for September 2026 is Available',
    body: `Dear Investor,

Your monthly account statement for September 2026 is now available for viewing online.

To view your statement:
1. Log into your account at fidelity.com or open the Fidelity mobile app.
2. Select 'Statements' from the Accounts & Trade menu.
3. Review your portfolio balances and transaction history.

For security reasons, Fidelity will never ask you to verify your password or PIN via an email link. Always navigate directly to fidelity.com.

Thank you for investing with Fidelity Investments.`,
    label: 'safe',
    category: 'Legitimate Financial Statement',
    notes: 'Exemplary security practice: explicitly advises user to never click links and go to main domain'
  },
  {
    id: 'SAFE-015',
    sender: 'librarian@university.edu',
    subject: 'Library Book Due Reminder: "Pattern Recognition and Machine Learning"',
    body: `Dear Student / Faculty Member,

This is a courtesy reminder that the following borrowed library book is due in 3 days:

Title: Pattern Recognition and Machine Learning
Author: Christopher M. Bishop
Barcode: LIB-90214-CS
Due Date: October 14, 2026

You may renew this item up to two additional times through your campus library account or return it to the 1st floor return drop box.

Campus Library Circulation Desk`,
    label: 'safe',
    category: 'Academic / Reminder',
    notes: 'Normal university notice, benign academic subject'
  }
];

// Presets for rapid testing in UI
export const PRESET_EMAILS = [
  {
    title: 'Microsoft 365 Password Expiry (High Risk)',
    description: 'Credential harvesting attack with fake 24-hour urgency and typo-squatted domain.',
    email: RAW_EMAIL_DATASET[0]
  },
  {
    title: 'Urgent Direct Deposit ADP Form (Financial)',
    description: 'Targeted payroll redirect scam with strict 5 PM deadline.',
    email: RAW_EMAIL_DATASET[1]
  },
  {
    title: 'CEO Urgent Gift Card Request (BEC)',
    description: 'Executive impersonation asking for untraceable gift card codes.',
    email: RAW_EMAIL_DATASET[2]
  },
  {
    title: 'DHL Failed Delivery Customs Fee (Logistics)',
    description: 'Phishing lure exploiting package delivery fees with lookalike tracking.',
    email: RAW_EMAIL_DATASET[3]
  },
  {
    title: 'Internal Sprint 24 Planning (Safe)',
    description: 'Legitimate engineering sprint planning note with Jira references.',
    email: RAW_EMAIL_DATASET[15]
  },
  {
    title: 'HR Open Enrollment Notice (Safe)',
    description: 'Standard company-wide health benefits information with generous deadline.',
    email: RAW_EMAIL_DATASET[16]
  },
  {
    title: 'GitHub Pull Request Merged (Safe)',
    description: 'Authentic automated notification from GitHub with technical diff summary.',
    email: RAW_EMAIL_DATASET[17]
  },
  {
    title: 'DigitalOcean Monthly Invoice (Safe)',
    description: 'Legitimate cloud hosting receipt with masked payment method and routine charge.',
    email: RAW_EMAIL_DATASET[23]
  }
];
