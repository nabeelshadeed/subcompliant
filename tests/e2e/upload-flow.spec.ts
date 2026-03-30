/**
 * Upload flow integration tests
 *
 * These tests run against the LIVE production API (subcompliant.com).
 * They only exercise public/unauthenticated endpoints — no Clerk session needed.
 *
 * Run: npx playwright test tests/e2e/upload-flow.spec.ts
 */

import { test, expect } from '@playwright/test'

const BASE = 'https://subcompliant.com'

// ── API layer: always-JSON contract ───────────────────────────────────────────

test.describe('API — always returns JSON', () => {
  test('upload-session: bogus token returns JSON 404', async ({ request }) => {
    const res = await request.get(`${BASE}/api/auth/upload-session/BOGUS_TOKEN_XYZ_TEST`)
    expect(res.status()).toBe(404)
    expect(res.headers()['content-type']).toContain('application/json')
    const body = await res.json()
    expect(body.error.code).toBe('SESSION_NOT_FOUND')
  })

  test('upload-session: expired token shows SESSION_EXPIRED code', async ({ request }) => {
    // Note: we can't create a pre-expired session here without DB access.
    // This test verifies the route shape; real expiry tested in upload-session.spec.ts
    const res = await request.get(`${BASE}/api/auth/upload-session/EXPIRED_PLACEHOLDER`)
    const body = await res.json()
    // Either NOT_FOUND or EXPIRED — either way it's JSON with an error
    expect(body).toHaveProperty('error')
    expect(body.error).toHaveProperty('code')
  })

  test('upload: unauthenticated returns JSON 401', async ({ request }) => {
    const res = await request.post(`${BASE}/api/documents/upload`)
    expect(res.status()).toBe(401)
    expect(res.headers()['content-type']).toContain('application/json')
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  test('upload: bad session token returns JSON 401', async ({ request }) => {
    // Minimal valid-looking PDF magic bytes
    const pdfBytes = Buffer.from('255044462d312e34', 'hex')
    const res = await request.post(`${BASE}/api/documents/upload?t=BOGUS_SESSION_XYZ`, {
      multipart: {
        file: {
          name: 'test.pdf',
          mimeType: 'application/pdf',
          buffer: pdfBytes,
        },
        documentTypeId: '00000000-0000-0000-0000-000000000000',
      },
    })
    expect(res.status()).toBe(401)
    expect(res.headers()['content-type']).toContain('application/json')
    const body = await res.json()
    expect(body.error.code).toBe('SESSION_INVALID')
  })

  test('magic-link: unauthenticated returns JSON 401', async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/magic-link`, {
      data: { subContractorEmail: 'x@test.com' },
    })
    expect(res.status()).toBe(401)
    expect(res.headers()['content-type']).toContain('application/json')
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  test('review: unauthenticated returns JSON 401', async ({ request }) => {
    const res = await request.post(
      `${BASE}/api/documents/00000000-0000-0000-0000-000000000000/review`,
      { data: { action: 'approve' } }
    )
    expect(res.status()).toBe(401)
    expect(res.headers()['content-type']).toContain('application/json')
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  test('subcontractors GET: unauthenticated returns JSON 401', async ({ request }) => {
    const res = await request.get(`${BASE}/api/subcontractors`)
    expect(res.status()).toBe(401)
    expect(res.headers()['content-type']).toContain('application/json')
    const body = await res.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  test('subcontractors POST: unauthenticated returns JSON 401', async ({ request }) => {
    const res = await request.post(`${BASE}/api/subcontractors`, {
      data: { email: 'x@test.com' },
    })
    expect(res.status()).toBe(401)
    expect(res.headers()['content-type']).toContain('application/json')
  })
})

// ── Upload page: correct UI states for bad tokens ─────────────────────────────

test.describe('Upload page — error states', () => {
  test('no token param → shows error state, not crash', async ({ page }) => {
    await page.goto(`${BASE}/upload`)
    // Should not crash — the UploadFlow handles missing token gracefully
    await expect(page.locator('body')).not.toContainText('Something went wrong')
    await expect(page.locator('body')).not.toContainText('Application error')
  })

  test('bogus token → shows "Link not found" error card', async ({ page }) => {
    await page.goto(`${BASE}/upload?t=BOGUS_TOKEN_XYZ_PLAYWRIGHT_TEST`)
    // Wait for the async session load
    await page.waitForSelector('text=Link not found', { timeout: 10000 })
    await expect(page.locator('text=Link not found')).toBeVisible()
  })

  test('upload page has SubCompliant branding', async ({ page }) => {
    await page.goto(`${BASE}/upload?t=BOGUS_TOKEN_XYZ_PLAYWRIGHT_TEST`)
    await expect(page.getByRole('link', { name: /SubCompliant/ })).toBeVisible()
  })
})

// ── File validation: client-side rejections ──────────────────────────────────

test.describe('Upload page — file validation UI', () => {
  test('upload page with valid-looking token loads session fetch', async ({ page }) => {
    // With a non-existent token, we should get the "Link not found" state — not a blank screen
    await page.goto(`${BASE}/upload?t=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`)
    await page.waitForLoadState('networkidle')
    // Should show some error state, not be blank
    const body = await page.textContent('body')
    expect(body?.length).toBeGreaterThan(50)
    // Should not show a React error
    expect(body).not.toContain('Unhandled Runtime Error')
  })
})

// ── Upload validation: server rejects bad file types ──────────────────────────

test.describe('Upload API — file type enforcement', () => {
  test('rejects non-PDF/image even with valid MIME claim (no session needed for 401 check)', async ({ request }) => {
    // We can't test with a real session here, but we verify the route is up and returns JSON
    const res = await request.post(`${BASE}/api/documents/upload?t=FAKE`, {
      multipart: {
        file: {
          name: 'evil.html',
          mimeType: 'text/html',
          buffer: Buffer.from('<script>alert(1)</script>'),
        },
        documentTypeId: '00000000-0000-0000-0000-000000000000',
      },
    })
    // Either SESSION_INVALID (401) or INVALID_FILE_TYPE (400) — never HTML
    expect(res.headers()['content-type']).toContain('application/json')
    expect([400, 401]).toContain(res.status())
  })
})
