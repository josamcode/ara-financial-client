import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TrendingUp, Globe, ChevronDown, Check, ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { ROUTES } from '@/shared/constants/routes'
import { LANGUAGES, APP_NAME } from '@/shared/constants/app'

// ─── Language Toggle (self-contained, no auth dep) ───────────────────────────

function LandingLanguageToggle() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Globe size={14} />
        <span>{current.label}</span>
        <ChevronDown size={12} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute end-0 mt-1 w-32 bg-white rounded-lg border border-gray-200 shadow-dropdown z-50 py-1 animate-slide-up">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false) }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
                lang.code === i18n.language
                  ? 'text-primary font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {lang.label}
              {lang.code === i18n.language && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

function LandingHeader() {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="container max-w-layout mx-auto h-16 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <img src='/logo.jpg' className='rounded-sm' />
          </div>
          <span className="text-base font-bold text-gray-900">{APP_NAME}</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LandingLanguageToggle />
          <Link
            to={ROUTES.LOGIN}
            className="px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            {t('landing.signIn')}
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="px-3.5 py-1.5 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            {t('landing.getStarted')}
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const heroFeatures = ['heroFeature1', 'heroFeature2', 'heroFeature3', 'heroFeature4']

function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="pt-20 pb-24 lg:pt-28 lg:pb-32 px-4">
      <div className="container max-w-layout mx-auto text-center">
        {/* Tag pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary text-xs font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          {t('landing.heroTag')}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900 leading-tight mb-5 tracking-tight">
          {t('landing.heroHeadline')}{' '}
          <span className="text-primary">{t('landing.heroHeadlineAccent')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('landing.heroSubtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={ROUTES.REGISTER}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-soft"
          >
            {t('landing.getStarted')}
            <ArrowLeft size={15} className="rtl:rotate-180" />
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {t('landing.signIn')}
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {heroFeatures.map((key) => (
            <span key={key} className="flex items-center gap-1.5 text-sm text-gray-400">
              <Check size={13} className="text-primary" />
              {t(`landing.${key}`)}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── About (report/analytics style) ──────────────────────────────────────────

const cycleSteps = [
  { step: '01', labelKey: 'cycle1', moduleKey: 'cycle1Module' },
  { step: '02', labelKey: 'cycle2', moduleKey: 'cycle2Module' },
  { step: '03', labelKey: 'cycle3', moduleKey: 'cycle3Module' },
  { step: '04', labelKey: 'cycle4', moduleKey: 'cycle4Module' },
]

const aboutPoints = [
  { titleKey: 'aboutPoint1Title', descKey: 'aboutPoint1Desc' },
  { titleKey: 'aboutPoint2Title', descKey: 'aboutPoint2Desc' },
  { titleKey: 'aboutPoint3Title', descKey: 'aboutPoint3Desc' },
]

const stats = [
  { valueKey: 'stat1Value', labelKey: 'stat1Label' },
  { valueKey: 'stat2Value', labelKey: 'stat2Label' },
  { valueKey: 'stat3Value', labelKey: 'stat3Label' },
  { valueKey: 'stat4Value', labelKey: 'stat4Label' },
]

function AboutSection() {
  const { t } = useTranslation()

  return (
    <section className="py-20 lg:py-28 bg-surface-subtle border-y border-gray-100">
      <div className="container max-w-layout mx-auto px-4">

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: statement + key points */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
              {t('landing.aboutLabel')}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-5">
              {t('landing.aboutHeadline')}
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              {t('landing.aboutDescription')}
            </p>

            <div className="space-y-5">
              {aboutPoints.map(({ titleKey, descKey }) => (
                <div key={titleKey} className="flex gap-4">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">
                      {t(`landing.${titleKey}`)}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {t(`landing.${descKey}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: accounting cycle card (report/assessment style) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
            {/* Card header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {t('landing.cycleTitle')}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-gray-400 font-medium">ACTIVE</span>
              </div>
            </div>

            {/* Cycle steps — report-row style */}
            <div className="divide-y divide-gray-50">
              {cycleSteps.map(({ step, labelKey, moduleKey }, idx) => (
                <div key={step} className="flex items-center gap-4 px-5 py-3.5 group">
                  {/* Step number */}
                  <span className="text-xs font-mono text-gray-300 w-6 shrink-0 select-none">
                    {step}
                  </span>

                  {/* Connector line + dot */}
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-primary-50" />
                    {idx < cycleSteps.length - 1 && (
                      <div className="absolute top-full w-px h-full bg-primary/20 mt-0.5" />
                    )}
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{t(`landing.${labelKey}`)}</p>
                    <p className="text-xs text-gray-400 truncate">{t(`landing.${moduleKey}`)}</p>
                  </div>

                  {/* Status dot */}
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                </div>
              ))}
            </div>

            {/* Card footer: mini stats strip */}
            <div className="grid grid-cols-4 divide-x divide-x-reverse divide-gray-100 border-t border-gray-100">
              {stats.map(({ valueKey, labelKey }) => (
                <div key={valueKey} className="px-3 py-3 text-center">
                  <p className="text-base font-bold text-primary">{t(`landing.${valueKey}`)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t(`landing.${labelKey}`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="py-20 lg:py-24 bg-gradient-primary">
      <div className="container max-w-layout mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {t('landing.ctaHeadline')}
        </h2>
        <p className="text-white/70 text-base mb-8 max-w-lg mx-auto">
          {t('landing.ctaSubtitle')}
        </p>
        <Link
          to={ROUTES.REGISTER}
          className="inline-flex items-center gap-2 px-7 py-3 bg-white text-primary text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-soft"
        >
          {t('landing.ctaButton')}
          <ArrowLeft size={15} className="rtl:rotate-180" />
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function LandingFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="py-8 border-t border-gray-100 bg-white">
      <div className="container max-w-layout mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <img src='/logo.jpg' className='rounded-sm' />
          </div>
          <div>
            <span className="text-sm font-bold text-gray-800">{APP_NAME}</span>
            <span className="text-xs text-gray-400 block leading-none">{t('landing.footerTagline')}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          {t('landing.footerCopyright', { year })}
        </p>
      </div>
    </footer>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <HeroSection />
      <AboutSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
