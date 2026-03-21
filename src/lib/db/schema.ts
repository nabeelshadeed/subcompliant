import {
  pgTable, pgEnum, uuid, varchar, text, boolean, integer,
  numeric, timestamp, date, jsonb, bigserial, inet, uniqueIndex, index
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ── Enums ─────────────────────────────────────────────────────────────────────
export const planTierEnum    = pgEnum('plan_tier',    ['starter', 'pro', 'business', 'enterprise'])
export const userRoleEnum    = pgEnum('user_role',    ['owner', 'admin', 'viewer'])
export const subStatusEnum   = pgEnum('sub_status',   ['invited', 'active', 'inactive', 'suspended'])
export const docStatusEnum   = pgEnum('doc_status',   ['pending', 'processing', 'approved', 'rejected', 'expired', 'superseded'])
export const checkStatusEnum = pgEnum('check_status', ['pending', 'passed', 'failed', 'unavailable', 'error'])
export const notifChannelEnum= pgEnum('notif_channel',['email', 'sms', 'in_app', 'webhook'])
export const notifStatusEnum = pgEnum('notif_status', ['queued', 'sent', 'delivered', 'failed', 'bounced'])
export const alertSeverityEnum=pgEnum('alert_severity',['info', 'warning', 'critical'])

// ── Contractors ───────────────────────────────────────────────────────────────
export const contractors = pgTable('contractors', {
  id:               uuid('id').primaryKey().defaultRandom(),
  clerkOrgId:       varchar('clerk_org_id', { length: 255 }).unique(),
  name:             varchar('name', { length: 255 }).notNull(),
  slug:             varchar('slug', { length: 100 }).notNull().unique(),
  plan:             planTierEnum('plan').notNull().default('starter'),
  planExpiresAt:    timestamp('plan_expires_at', { withTimezone: true }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
  stripeSubId:      varchar('stripe_sub_id', { length: 255 }).unique(),
  logoUrl:          text('logo_url'),
  website:          text('website'),
  addressLine1:     varchar('address_line1', { length: 255 }),
  addressCity:      varchar('address_city', { length: 100 }),
  addressPostcode:  varchar('address_postcode', { length: 20 }),
  companiesHouseNo: varchar('companies_house_no', { length: 20 }),
  vatNumber:        varchar('vat_number', { length: 30 }),
  subLimit:         integer('sub_limit').notNull().default(10),
  isActive:         boolean('is_active').notNull().default(true),
  trialEndsAt:      timestamp('trial_ends_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  clerkUserId:  varchar('clerk_user_id', { length: 255 }).notNull().unique(),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  role:         userRoleEnum('role').notNull().default('viewer'),
  firstName:    varchar('first_name', { length: 100 }),
  lastName:     varchar('last_name', { length: 100 }),
  email:        varchar('email', { length: 255 }).notNull(),
  phone:        varchar('phone', { length: 30 }),
  avatarUrl:    text('avatar_url'),
  lastLoginAt:  timestamp('last_login_at', { withTimezone: true }),
  isActive:     boolean('is_active').notNull().default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Trade Types ───────────────────────────────────────────────────────────────
export const tradeTypes = pgTable('trade_types', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 100 }).notNull(),
  slug:        varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  isActive:    boolean('is_active').notNull().default(true),
})

// ── Sub Profiles ──────────────────────────────────────────────────────────────
export const subProfiles = pgTable('sub_profiles', {
  id:               uuid('id').primaryKey().defaultRandom(),
  shareToken:       varchar('share_token', { length: 64 }).notNull().unique(),
  ownerEmail:       varchar('owner_email', { length: 255 }).notNull(),
  firstName:        varchar('first_name', { length: 100 }).notNull(),
  lastName:         varchar('last_name', { length: 100 }).notNull(),
  companyName:      varchar('company_name', { length: 255 }),
  phone:            varchar('phone', { length: 30 }),
  tradeId:          uuid('trade_id').references(() => tradeTypes.id),
  utrNumber:        varchar('utr_number', { length: 20 }),
  companiesHouseNo: varchar('companies_house_no', { length: 20 }),
  isPublic:         boolean('is_public').notNull().default(true),
  profileScore:     integer('profile_score').notNull().default(0),
  lastScoreAt:      timestamp('last_score_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:        timestamp('deleted_at', { withTimezone: true }),
})

// ── Subcontractors ────────────────────────────────────────────────────────────
export const subcontractors = pgTable('subcontractors', {
  id:           uuid('id').primaryKey().defaultRandom(),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  profileId:    uuid('profile_id').notNull().references(() => subProfiles.id),
  displayName:  varchar('display_name', { length: 255 }),
  status:       subStatusEnum('status').notNull().default('invited'),
  invitedBy:    uuid('invited_by').references(() => users.id),
  invitedAt:    timestamp('invited_at', { withTimezone: true }),
  activatedAt:  timestamp('activated_at', { withTimezone: true }),
  notes:        text('notes'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:    timestamp('deleted_at', { withTimezone: true }),
})

// ── Document Types ────────────────────────────────────────────────────────────
export const documentTypes = pgTable('document_types', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  name:                 varchar('name', { length: 150 }).notNull(),
  slug:                 varchar('slug', { length: 100 }).notNull().unique(),
  category:             varchar('category', { length: 50 }).notNull(),
  description:          text('description'),
  defaultExpiryMonths:  integer('default_expiry_months'),
  requiredForTrades:    uuid('required_for_trades').array(),
  verificationSource:   varchar('verification_source', { length: 100 }),
  isSystemType:         boolean('is_system_type').notNull().default(false),
  requiresValue:        boolean('requires_value').notNull().default(false),
  isActive:             boolean('is_active').notNull().default(true),
  sortOrder:            integer('sort_order').notNull().default(0),
})

// ── Projects ──────────────────────────────────────────────────────────────────
export const projects = pgTable('projects', {
  id:               uuid('id').primaryKey().defaultRandom(),
  contractorId:     uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  name:             varchar('name', { length: 255 }).notNull(),
  reference:        varchar('reference', { length: 100 }),
  addressLine1:     varchar('address_line1', { length: 255 }),
  addressCity:      varchar('address_city', { length: 100 }),
  addressPostcode:  varchar('address_postcode', { length: 20 }),
  startDate:        date('start_date'),
  endDate:          date('end_date'),
  status:           varchar('status', { length: 20 }).notNull().default('active'),
  complianceScore:  integer('compliance_score'),
  createdBy:        uuid('created_by').references(() => users.id),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Compliance Documents ──────────────────────────────────────────────────────
export const complianceDocuments = pgTable('compliance_documents', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  profileId:             uuid('profile_id').notNull().references(() => subProfiles.id, { onDelete: 'cascade' }),
  documentTypeId:        uuid('document_type_id').notNull().references(() => documentTypes.id),
  version:               integer('version').notNull().default(1),
  status:                docStatusEnum('status').notNull().default('pending'),
  fileKey:               text('file_key'),
  fileName:              varchar('file_name', { length: 500 }),
  fileSizeBytes:         integer('file_size_bytes'),
  mimeType:              varchar('mime_type', { length: 100 }),
  fileHash:              varchar('file_hash', { length: 64 }),
  expiresAt:             date('expires_at'),
  issuedAt:              date('issued_at'),
  policyNumber:          varchar('policy_number', { length: 200 }),
  coverageAmount:        numeric('coverage_amount', { precision: 14, scale: 2 }),
  certificateHolder:     varchar('certificate_holder', { length: 500 }),
  issuerName:            varchar('issuer_name', { length: 500 }),
  referenceNumber:       varchar('reference_number', { length: 200 }),
  extractedData:         jsonb('extracted_data'),
  extractionConfidence:  numeric('extraction_confidence', { precision: 4, scale: 3 }),
  submittedAt:           timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  processedAt:           timestamp('processed_at', { withTimezone: true }),
  reviewedAt:            timestamp('reviewed_at', { withTimezone: true }),
  reviewedBy:            uuid('reviewed_by').references(() => users.id),
  reviewNotes:           text('review_notes'),
  rejectedReason:        varchar('rejected_reason', { length: 500 }),
  isVerified:            boolean('is_verified').notNull().default(false),
  verificationSource:    varchar('verification_source', { length: 100 }),
  verifiedAt:            timestamp('verified_at', { withTimezone: true }),
  isCurrent:             boolean('is_current').notNull().default(true),
  createdAt:             timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:             timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt:             timestamp('deleted_at', { withTimezone: true }),
})

// ── Upload Sessions (magic links) ─────────────────────────────────────────────
export const uploadSessions = pgTable('upload_sessions', {
  id:               uuid('id').primaryKey().defaultRandom(),
  token:            varchar('token', { length: 128 }).notNull().unique(),
  contractorId:     uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  subcontractorId:  uuid('subcontractor_id').references(() => subcontractors.id),
  createdBy:        uuid('created_by').references(() => users.id),
  requiredDocTypeIds: uuid('required_doc_type_ids').array(),
  customMessage:    text('custom_message'),
  expiresAt:        timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt:           timestamp('used_at', { withTimezone: true }),
  completedAt:      timestamp('completed_at', { withTimezone: true }),
  subEmail:         varchar('sub_email', { length: 255 }),
  subName:          varchar('sub_name', { length: 255 }),
  isSingleUse:      boolean('is_single_use').notNull().default(true),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Risk Scores ───────────────────────────────────────────────────────────────
export const riskScores = pgTable('risk_scores', {
  id:              uuid('id').primaryKey().defaultRandom(),
  profileId:       uuid('profile_id').notNull().references(() => subProfiles.id),
  contractorId:    uuid('contractor_id').notNull().references(() => contractors.id),
  score:           integer('score').notNull(),
  insuranceScore:  integer('insurance_score'),
  cscsScore:       integer('cscs_score'),
  tradeCertScore:  integer('trade_cert_score'),
  ramsScore:       integer('rams_score'),
  adminScore:      integer('admin_score'),
  missingDocs:     text('missing_docs').array(),
  expiringDocs:    text('expiring_docs').array(),
  expiredDocs:     text('expired_docs').array(),
  spendAtRisk:     numeric('spend_at_risk', { precision: 12, scale: 2 }),
  isCurrent:       boolean('is_current').notNull().default(true),
  calculatedAt:    timestamp('calculated_at', { withTimezone: true }).notNull().defaultNow(),
  validUntil:      timestamp('valid_until', { withTimezone: true }),
})

// ── Notifications ─────────────────────────────────────────────────────────────
export const notifications = pgTable('notifications', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  contractorId:        uuid('contractor_id').references(() => contractors.id),
  subcontractorId:     uuid('subcontractor_id').references(() => subcontractors.id),
  profileId:           uuid('profile_id').references(() => subProfiles.id),
  documentId:          uuid('document_id').references(() => complianceDocuments.id),
  eventType:           varchar('event_type', { length: 100 }).notNull(),
  severity:            alertSeverityEnum('severity').notNull().default('info'),
  channel:             notifChannelEnum('channel').notNull(),
  status:              notifStatusEnum('status').notNull().default('queued'),
  recipientEmail:      varchar('recipient_email', { length: 255 }),
  recipientPhone:      varchar('recipient_phone', { length: 30 }),
  subject:             text('subject'),
  body:                text('body'),
  templateId:          varchar('template_id', { length: 100 }),
  templateData:        jsonb('template_data'),
  scheduledFor:        timestamp('scheduled_for', { withTimezone: true }),
  sentAt:              timestamp('sent_at', { withTimezone: true }),
  deliveredAt:         timestamp('delivered_at', { withTimezone: true }),
  failedAt:            timestamp('failed_at', { withTimezone: true }),
  failureReason:       text('failure_reason'),
  externalMessageId:   varchar('external_message_id', { length: 255 }),
  createdAt:           timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const auditLogs = pgTable('audit_logs', {
  id:           bigserial('id', { mode: 'bigint' }).primaryKey(),
  contractorId: uuid('contractor_id').references(() => contractors.id),
  actorId:      uuid('actor_id'),
  actorType:    varchar('actor_type', { length: 20 }).notNull().default('user'),
  actorEmail:   varchar('actor_email', { length: 255 }),
  action:       varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId:   uuid('resource_id'),
  payload:      jsonb('payload'),
  ipAddress:    inet('ip_address'),
  userAgent:    text('user_agent'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Document Access ───────────────────────────────────────────────────────────
export const documentAccess = pgTable('document_access', {
  id:           uuid('id').primaryKey().defaultRandom(),
  documentId:   uuid('document_id').notNull().references(() => complianceDocuments.id, { onDelete: 'cascade' }),
  contractorId: uuid('contractor_id').notNull().references(() => contractors.id, { onDelete: 'cascade' }),
  grantedAt:    timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
  grantedBy:    uuid('granted_by').references(() => users.id),
})

// ── Compliance Checks ─────────────────────────────────────────────────────────
export const complianceChecks = pgTable('compliance_checks', {
  id:                uuid('id').primaryKey().defaultRandom(),
  documentId:        uuid('document_id').notNull().references(() => complianceDocuments.id),
  subcontractorId:   uuid('subcontractor_id').references(() => subcontractors.id),
  checkType:         varchar('check_type', { length: 100 }).notNull(),
  status:            checkStatusEnum('status').notNull().default('pending'),
  externalReference: varchar('external_reference', { length: 200 }),
  result:            jsonb('result'),
  errorMessage:      text('error_message'),
  checkedAt:         timestamp('checked_at', { withTimezone: true }),
  expiresResultAt:   timestamp('expires_result_at', { withTimezone: true }),
  createdAt:         timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Types ─────────────────────────────────────────────────────────────────────
export type Contractor     = typeof contractors.$inferSelect
export type User           = typeof users.$inferSelect
export type SubProfile     = typeof subProfiles.$inferSelect
export type Subcontractor  = typeof subcontractors.$inferSelect
export type DocumentType   = typeof documentTypes.$inferSelect
export type ComplianceDoc  = typeof complianceDocuments.$inferSelect
export type UploadSession  = typeof uploadSessions.$inferSelect
export type RiskScore      = typeof riskScores.$inferSelect
export type Notification   = typeof notifications.$inferSelect
export type AuditLog       = typeof auditLogs.$inferSelect
