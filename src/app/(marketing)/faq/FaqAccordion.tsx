'use client'

import { useState } from 'react'

interface FaqItem {
  q: string
  a: string
}

interface FaqCategory {
  category: string
  questions: FaqItem[]
}

interface FaqAccordionProps {
  categories: FaqCategory[]
}

export default function FaqAccordion({ categories }: FaqAccordionProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  function toggle(key: string) {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {categories.map(cat => {
        const catId = cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        return (
          <section key={cat.category} id={catId}>
            {/* Category heading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <h2
                style={{
                  fontFamily: "'Syne', system-ui, sans-serif",
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.3px',
                  margin: 0,
                }}
              >
                {cat.category}
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  padding: '3px 10px',
                  background: 'rgba(204,255,0,.08)',
                  border: '1px solid rgba(204,255,0,.15)',
                  borderRadius: '100px',
                  fontSize: '11px',
                  color: 'var(--acc)',
                  fontWeight: 600,
                }}
              >
                {cat.questions.length}
              </span>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cat.questions.map((item, idx) => {
                const key = `${catId}-${idx}`
                const isOpen = !!openItems[key]
                return (
                  <div
                    key={key}
                    className={`faq-item${isOpen ? ' open' : ''}`}
                  >
                    <button
                      className="faq-q"
                      onClick={() => toggle(key)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <span className="faq-icon">+</span>
                    </button>
                    {isOpen && (
                      <div className="faq-a" style={{ display: 'block' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
