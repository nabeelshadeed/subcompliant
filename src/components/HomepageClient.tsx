'use client'

import { useEffect } from 'react'

export function HomepageClient() {
  useEffect(() => {
    const nav = document.getElementById('hp-nav')
    const ham = document.getElementById('hp-ham')
    const mob = document.getElementById('hp-mob-menu')
    if (!nav || !ham || !mob) return

    const toggleMob = () => {
      const open = mob.classList.toggle('open')
      ham.classList.toggle('open', open)
      ham.setAttribute('aria-expanded', String(open))
      document.body.style.overflow = open ? 'hidden' : ''
    }
    const closeMob = () => {
      mob.classList.remove('open')
      ham.classList.remove('open')
      ham.setAttribute('aria-expanded', 'false')
      document.body.style.overflow = ''
    }

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    ham.addEventListener('click', toggleMob)

    document.querySelectorAll('.hp a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href')
        if (href === '#') return
        const el = document.querySelector(href!)
        if (el) {
          e.preventDefault()
          const top = el.getBoundingClientRect().top + window.scrollY - 80
          window.scrollTo({ top, behavior: 'smooth' })
          closeMob()
        }
      })
    })

    document.querySelectorAll('.hp .faq-q').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = (btn as HTMLElement).closest('.faq-item')
        const ans = item?.querySelector('.faq-a') as HTMLElement
        const isOpen = item?.classList.contains('open')
        document.querySelectorAll('.hp .faq-item').forEach((i) => {
          i.classList.remove('open')
          const a = i.querySelector('.faq-a') as HTMLElement
          if (a) a.style.display = 'none'
          const b = i.querySelector('.faq-q')
          if (b) b.setAttribute('aria-expanded', 'false')
        })
        if (!isOpen && item && ans) {
          item.classList.add('open')
          ans.style.display = 'block'
          btn.setAttribute('aria-expanded', 'true')
        }
      })
    })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return null
}
