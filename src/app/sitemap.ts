import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://subcompliant.co.uk'
  const now = new Date().toISOString()

  return [
    // ── Core ──
    { url: `${baseUrl}/`,                                       lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${baseUrl}/pricing`,                                lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`,                                  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`,                                lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // ── SEO tools / landing pages ──
    { url: `${baseUrl}/subcontractor-compliance-checklist-uk`,  lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/cscs-card-checker`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/rams-template`,                          lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/subcontractor-insurance-requirements`,   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/construction-compliance-checklist`,      lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/subcontractor-document-tracker`,         lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // ── Guides ──
    { url: `${baseUrl}/guides/cscs-card-requirements`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/guides/hse-compliance-uk`,               lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/guides/subcontractor-insurance`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // ── Trade pages ──
    { url: `${baseUrl}/trades/electricians`,                    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/trades/gas-engineers`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/trades/groundworkers`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/trades/roofers`,                         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/trades/scaffolders`,                     lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // ── Alternatives ──
    { url: `${baseUrl}/alternatives/chas`,                      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/alternatives/constructionline`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },

    // ── Legal ──
    { url: `${baseUrl}/legal/privacy`,                          lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/legal/terms`,                            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${baseUrl}/legal/cookies`,                          lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${baseUrl}/legal/gdpr`,                             lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ]
}
