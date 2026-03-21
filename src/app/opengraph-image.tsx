import { ImageResponse } from 'next/og'

export const alt = 'SubCompliant — UK Subcontractor Compliance Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{
            width: 56,
            height: 56,
            background: 'rgba(204,255,0,0.12)',
            border: '1.5px solid rgba(204,255,0,0.3)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ color: '#CCFF00', fontSize: 20, fontWeight: 800, display: 'flex' }}>SC</div>
          </div>
          <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: -0.5, display: 'flex' }}>
            SubCompliant
          </div>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.05,
          letterSpacing: -2,
          marginBottom: 24,
          maxWidth: 800,
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          Subcontractor compliance, automated.
        </div>

        {/* Sub */}
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, display: 'flex' }}>
          Real-time risk scoring · Document vault · HSE audit reports
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {['GDPR Compliant', 'Built for UK SMEs', '14-Day Free Trial'].map(t => (
            <div key={t} style={{
              padding: '8px 18px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 100,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14,
              fontWeight: 500,
              display: 'flex',
            }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
