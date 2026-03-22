import { requireUser } from '@/lib/auth/require-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import {
  subcontractors, subProfiles,
  complianceDocuments, notifications, documentTypes, uploadSessions
} from '@/lib/db/schema'
import { eq, and, desc, inArray, sql, isNull } from 'drizzle-orm'
import { getContractorComplianceOverview } from '@/lib/compliance-engine'
import StatCard from '@/components/ui/StatCard'
import { formatRelative } from '@/lib/utils'
import {
  Users, ShieldCheck, AlertTriangle, FileText,
  CheckCircle2, Bell, UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import DashboardClient from './DashboardClient'
import OnboardingChecklist, { type OnboardingStep } from '@/components/dashboard/OnboardingChecklist'
import PendingReviewCard, { type PendingDoc } from '@/components/dashboard/PendingReviewCard'

export default async function DashboardPage() {
  const user = await requireUser()
  const contractor = user.contractor
  if (!contractor) redirect('/setup')
  const contractorId = user.contractorId

  // All data in a single parallel fetch
  const [
    overview,
    totalSubs,
    pendingDocs,
    recentDocs,
    recentNotifs,
    inviteCount,
    reviewedDocCount,
  ] = await Promise.all([
    getContractorComplianceOverview(contractorId),

    // Total active/invited subs
    db.select({ count: sql<number>`count(*)::int` })
      .from(subcontractors)
      .where(and(
        eq(subcontractors.contractorId, contractorId),
        inArray(subcontractors.status, ['active', 'invited']),
        isNull(subcontractors.deletedAt),
      ))
      .then(r => r[0]?.count ?? 0),

    // Pending documents for review queue (limit 8 for dashboard)
    db.select({
      id:          complianceDocuments.id,
      fileName:    complianceDocuments.fileName,
      docTypeName: documentTypes.name,
      subName:     sql<string>`${subProfiles.firstName} || ' ' || ${subProfiles.lastName}`,
      submittedAt: complianceDocuments.submittedAt,
    })
      .from(complianceDocuments)
      .innerJoin(documentTypes,  eq(complianceDocuments.documentTypeId, documentTypes.id))
      .innerJoin(subcontractors, eq(subcontractors.profileId,           complianceDocuments.profileId))
      .innerJoin(subProfiles,    eq(subProfiles.id,                     complianceDocuments.profileId))
      .where(and(
        eq(subcontractors.contractorId, contractorId),
        eq(complianceDocuments.status,  'pending'),
        eq(complianceDocuments.isCurrent, true),
        isNull(complianceDocuments.deletedAt),
      ))
      .orderBy(desc(complianceDocuments.submittedAt))
      .limit(8),

    // Recent docs (all statuses) for activity feed
    db.select({
      id:          complianceDocuments.id,
      status:      complianceDocuments.status,
      submittedAt: complianceDocuments.submittedAt,
      docTypeName: documentTypes.name,
    })
      .from(complianceDocuments)
      .innerJoin(subcontractors, eq(subcontractors.profileId,   complianceDocuments.profileId))
      .innerJoin(documentTypes,  eq(complianceDocuments.documentTypeId, documentTypes.id))
      .where(and(
        eq(subcontractors.contractorId,    contractorId),
        eq(complianceDocuments.isCurrent,  true),
      ))
      .orderBy(desc(complianceDocuments.submittedAt))
      .limit(5),

    // Recent notifications
    db.query.notifications.findMany({
      where: eq(notifications.contractorId, contractorId),
      orderBy: (n, { desc }) => [desc(n.createdAt)],
      limit: 5,
    }),

    // Onboarding: has at least one upload session been created (invite sent)?
    db.select({ count: sql<number>`count(*)::int` })
      .from(uploadSessions)
      .where(eq(uploadSessions.contractorId, contractorId))
      .then(r => r[0]?.count ?? 0),

    // Onboarding: has at least one doc been reviewed (approved or rejected)?
    db.select({ count: sql<number>`count(*)::int` })
      .from(complianceDocuments)
      .innerJoin(subcontractors, eq(subcontractors.profileId, complianceDocuments.profileId))
      .where(and(
        eq(subcontractors.contractorId, contractorId),
        inArray(complianceDocuments.status, ['approved', 'rejected']),
      ))
      .then(r => r[0]?.count ?? 0),
  ]).catch(() => { redirect('/setup') }) as any

  // Build onboarding checklist steps
  const totalDocs = recentDocs.length + pendingDocs.length
  const onboardingSteps: OnboardingStep[] = [
    {
      id:     'account',
      label:  'Account created',
      detail: 'Your SubCompliant account is active.',
      done:   true,
    },
    {
      id:     'company',
      label:  'Complete company details',
      detail: 'Add your address and company number so documents are linked to the right entity.',
      done:   !!(contractor.addressLine1),
      href:   '/settings',
      action: 'Add details',
    },
    {
      id:     'invite',
      label:  'Send your first invite',
      detail: 'Send a magic-link to a subcontractor — no account needed on their end.',
      done:   inviteCount > 0,
      href:   '/subcontractors',
      action: 'Invite sub',
    },
    {
      id:     'document',
      label:  'Receive a compliance document',
      detail: 'Once your subcontractor clicks the link and uploads, it appears here for review.',
      done:   totalDocs > 0,
      href:   '/documents',
      action: 'View documents',
    },
    {
      id:     'review',
      label:  'Review and approve a document',
      detail: 'Approve or reject the uploaded document to trigger the compliance score.',
      done:   reviewedDocCount > 0,
      href:   '/documents?status=pending',
      action: 'Review now',
    },
  ]

  const allOnboardingDone = onboardingSteps.every(s => s.done)
  const pendingDocsForCard: PendingDoc[] = pendingDocs.map((d: any) => ({
    id:          d.id,
    fileName:    d.fileName,
    docTypeName: d.docTypeName,
    subName:     d.subName,
    submittedAt: d.submittedAt?.toISOString?.() ?? '',
  }))

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            Good {getTimeOfDay()}, {user.firstName ?? 'there'}
          </h1>
          <p className="text-sm text-white/60 mt-0.5">
            {contractor.name} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <DashboardClient />
      </div>

      {/* Critical alerts banner */}
      {overview.criticalAlerts > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-300">
              {overview.criticalAlerts} critical compliance alert{overview.criticalAlerts > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-400/80 mt-0.5">
              {overview.nonCompliant} subcontractor{overview.nonCompliant > 1 ? 's are' : ' is'} non-compliant — action required to avoid HSE risk.
            </p>
          </div>
          <Link
            href="/compliance"
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors"
          >
            Review now
          </Link>
        </div>
      )}

      {/* Onboarding checklist — shown until all done */}
      {!allOnboardingDone && (
        <OnboardingChecklist
          steps={onboardingSteps}
          companyName={contractor.name}
        />
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Subcontractors"
          value={totalSubs}
          sub={`${Math.max(0, contractor.subLimit - totalSubs)} slots remaining`}
          icon={Users}
        />
        <StatCard
          label="Compliant"
          value={overview.compliant}
          sub={`${overview.percentCompliant}% of total`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Needs Attention"
          value={overview.partiallyCompliant + overview.nonCompliant}
          sub={`${overview.criticalAlerts} critical`}
          icon={AlertTriangle}
          variant={overview.nonCompliant > 0 ? 'danger' : overview.partiallyCompliant > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Pending Review"
          value={pendingDocs.length}
          sub="Documents awaiting approval"
          icon={FileText}
          variant={pendingDocs.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Compliance rate bar */}
      {totalSubs > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Compliance Rate</h2>
            <span className="text-sm font-bold font-display text-white">{overview.percentCompliant}%</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${overview.percentCompliant}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Compliant ({overview.compliant})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Partial ({overview.partiallyCompliant})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Non-compliant ({overview.nonCompliant})
            </span>
          </div>
        </div>
      )}

      {/* Pending review queue — centre stage if there are items */}
      {pendingDocsForCard.length > 0 && (
        <PendingReviewCard docs={pendingDocsForCard} />
      )}

      {/* Two-column: Recent activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent document activity */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Recent Documents</h2>
            <Link href="/documents" className="text-xs text-accent hover:text-accent/80 font-medium">
              View all
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="py-10 text-center">
              <FileText size={24} className="text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40 mb-3">No documents yet</p>
              <Link
                href="/subcontractors"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80"
              >
                <UserPlus size={12} /> Invite your first subcontractor
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {(recentDocs as { id: string; status: string | null; submittedAt: string | null; docTypeName: string }[]).map(doc => (
                <li key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.docTypeName ?? 'Document'}</p>
                    <p className="text-xs text-white/50">{formatRelative(doc.submittedAt)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    doc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    doc.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    doc.status === 'pending'  ? 'bg-amber-500/20 text-amber-400' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {doc.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent notifications */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Notifications</h2>
            <Link href="/notifications" className="text-xs text-accent hover:text-accent/80 font-medium">
              View all
            </Link>
          </div>
          {recentNotifs.length === 0 ? (
            <div className="py-10 text-center">
              <Bell size={24} className="text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No notifications yet</p>
              <p className="text-xs text-white/30 mt-1">Expiry alerts and compliance changes will appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {(recentNotifs as { id: string; severity: string | null; subject: string | null; eventType: string; createdAt: Date | string | null }[]).map(n => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/5">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    n.severity === 'critical' ? 'bg-red-400' :
                    n.severity === 'warning'  ? 'bg-amber-400' : 'bg-accent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-1">{n.subject ?? n.eventType}</p>
                    <p className="text-xs text-white/50 mt-0.5">{formatRelative(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            href:    '/subcontractors',
            icon:    Users,
            label:   'Manage Subcontractors',
            detail:  `${totalSubs} of ${contractor.subLimit} used`,
            colour:  'text-accent',
          },
          {
            href:    '/compliance',
            icon:    ShieldCheck,
            label:   'Compliance Overview',
            detail:  `${overview.percentCompliant}% compliant`,
            colour:  'text-emerald-400',
          },
          {
            href:    '/documents',
            icon:    FileText,
            label:   'Document Vault',
            detail:  pendingDocs.length > 0 ? `${pendingDocs.length} pending review` : 'All reviewed',
            colour:  pendingDocs.length > 0 ? 'text-amber-400' : 'text-blue-400',
          },
        ].map(tile => (
          <Link
            key={tile.href}
            href={tile.href}
            className="card p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-white/20 transition-colors">
              <tile.icon size={16} className={tile.colour} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{tile.label}</p>
              <p className="text-xs text-white/50 mt-0.5">{tile.detail}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
