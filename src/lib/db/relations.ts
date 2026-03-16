import { relations } from 'drizzle-orm'
import {
  contractors, users, subProfiles, subcontractors,
  complianceDocuments, documentTypes, tradeTypes,
  uploadSessions, riskScores, notifications,
  documentAccess, complianceChecks, auditLogs, projects
} from './schema'

export const contractorsRelations = relations(contractors, ({ many }) => ({
  users:           many(users),
  subcontractors:  many(subcontractors),
  uploadSessions:  many(uploadSessions),
  riskScores:      many(riskScores),
  notifications:   many(notifications),
  projects:        many(projects),
  auditLogs:       many(auditLogs),
}))

export const usersRelations = relations(users, ({ one }) => ({
  contractor: one(contractors, {
    fields:     [users.contractorId],
    references: [contractors.id],
  }),
}))

export const subProfilesRelations = relations(subProfiles, ({ one, many }) => ({
  trade:     one(tradeTypes, {
    fields:     [subProfiles.tradeId],
    references: [tradeTypes.id],
  }),
  documents: many(complianceDocuments),
  riskScores: many(riskScores),
}))

export const subcontractorsRelations = relations(subcontractors, ({ one }) => ({
  contractor: one(contractors, {
    fields:     [subcontractors.contractorId],
    references: [contractors.id],
  }),
  profile: one(subProfiles, {
    fields:     [subcontractors.profileId],
    references: [subProfiles.id],
  }),
  invitedByUser: one(users, {
    fields:     [subcontractors.invitedBy],
    references: [users.id],
  }),
}))

export const complianceDocumentsRelations = relations(complianceDocuments, ({ one, many }) => ({
  documentType: one(documentTypes, {
    fields:     [complianceDocuments.documentTypeId],
    references: [documentTypes.id],
  }),
  profile: one(subProfiles, {
    fields:     [complianceDocuments.profileId],
    references: [subProfiles.id],
  }),
  reviewedByUser: one(users, {
    fields:     [complianceDocuments.reviewedBy],
    references: [users.id],
  }),
  access: many(documentAccess),
  checks: many(complianceChecks),
}))

export const uploadSessionsRelations = relations(uploadSessions, ({ one }) => ({
  contractor: one(contractors, {
    fields:     [uploadSessions.contractorId],
    references: [contractors.id],
  }),
  subcontractor: one(subcontractors, {
    fields:     [uploadSessions.subcontractorId],
    references: [subcontractors.id],
  }),
}))

export const riskScoresRelations = relations(riskScores, ({ one }) => ({
  profile: one(subProfiles, {
    fields:     [riskScores.profileId],
    references: [subProfiles.id],
  }),
  contractor: one(contractors, {
    fields:     [riskScores.contractorId],
    references: [contractors.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  contractor:    one(contractors, {
    fields:     [notifications.contractorId],
    references: [contractors.id],
  }),
  subcontractor: one(subcontractors, {
    fields:     [notifications.subcontractorId],
    references: [subcontractors.id],
  }),
}))

export const documentAccessRelations = relations(documentAccess, ({ one }) => ({
  document:   one(complianceDocuments, {
    fields:     [documentAccess.documentId],
    references: [complianceDocuments.id],
  }),
  contractor: one(contractors, {
    fields:     [documentAccess.contractorId],
    references: [contractors.id],
  }),
}))

export const projectsRelations = relations(projects, ({ one }) => ({
  contractor: one(contractors, {
    fields:     [projects.contractorId],
    references: [contractors.id],
  }),
  createdByUser: one(users, {
    fields:     [projects.createdBy],
    references: [users.id],
  }),
}))
