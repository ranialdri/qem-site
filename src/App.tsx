/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Droplets,
  Users,
  Home,
  Building2,
  Sparkles,
  CalendarCheck,
  Hammer,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  ChevronDown,
  ArrowRight,
  Check,
  Star,
  Lock,
} from 'lucide-react';
import {
  COMPANY_INFO,
  ADVANTAGES,
  SERVICES,
  WHY_CHOOSE_QEM,
  PROCESS_STEPS,
  SERVED_ZONES,
  CLIENT_REVIEWS,
  FAQ_ITEMS,
  getWhatsAppUrl,
  type AdvantageItem,
  type ServiceItem,
} from './config/companyData';
import { Header } from './components/Header';
import { QemBrandMark, SafeImage } from './components/QemLogo';
import { QuoteFormSection } from './components/QuoteFormSection';
import { AdminDrawer } from './components/AdminDrawer';
import { LegalModal, type LegalTab } from './components/LegalModal';

function renderAdvantageIcon(iconName: AdvantageItem['iconName']) {
  const props = { className: 'w-5 h-5 text-[#C59B27]' };
  switch (iconName) {
    case 'shield':
      return <ShieldCheck {...props} />;
    case 'award':
      return <Award {...props} />;
    case 'droplets':
      return <Droplets {...props} />;
    case 'users':
      return <Users {...props} />;
  }
}

function renderServiceIcon(iconName: ServiceItem['iconName']) {
  const props = { className: 'w-5 h-5 text-[#C59B27]' };
  switch (iconName) {
    case 'home':
      return <Home {...props} />;
    case 'building':
      return <Building2 {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    case 'calendar':
      return <CalendarCheck {...props} />;
    case 'hammer':
      return <Hammer {...props} />;
  }
}

export default function App() {
  const [selectedServiceForQuote, setSelectedServiceForQuote] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [adminOpen, setAdminOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestQuoteForService = (serviceTitle?: string) => {
    if (serviceTitle) {
      setSelectedServiceForQuote(serviceTitle);
    }
    scrollToSection('soumission');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#0F0F10]">
      {/* 3. HEADER / MENU */}
      <Header onNavigateToQuote={() => handleRequestQuoteForService()} />

      <main className="flex-1">
        {/* =====================================================================
            4. PAGE D'ACCUEIL – HERO
           ===================================================================== */}
        <section
          id="accueil"
          className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-neutral-200/80 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Brand Proposition & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Unboxed Regional Kicker */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-widest text-[#9E7A19]">
                  <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                  <span>{COMPANY_INFO.name.toUpperCase()}</span>
                  <span aria-hidden="true" className="text-neutral-400">
                    ·
                  </span>
                  <span className="text-neutral-600 font-medium tracking-normal">
                    {COMPANY_INFO.zonesSummary}
                  </span>
                </div>

                {/* Main Title */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F0F10] tracking-tight leading-[1.08] text-balance">
                  NETTOYAGE{' '}
                  <span className="block text-[#0F0F10]">
                    RÉSIDENTIEL <span className="text-[#C59B27]">&amp;</span> COMMERCIAL
                  </span>
                </h1>

                {/* Official Slogan */}
                <p className="font-display italic text-xl sm:text-2xl text-[#9E7A19] font-semibold">
                  {COMPANY_INFO.slogan}
                </p>

                {/* Secondary Description */}
                <p className="text-base sm:text-lg text-neutral-700 leading-relaxed max-w-2xl">
                  {COMPANY_INFO.heroDescription}
                </p>

                {/* Primary & Secondary Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleRequestQuoteForService()}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-bold tracking-wide text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    <span>DEMANDER UNE SOUMISSION GRATUITE</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('contact')}
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold text-white bg-[#0F0F10] hover:bg-neutral-800 rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
                  >
                    <span>NOUS CONTACTER</span>
                  </button>
                </div>

                {/* Direct Contact Line (Phone & WhatsApp) */}
                <div className="pt-4 border-t border-neutral-200/90 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-700">
                  <a
                    href={COMPANY_INFO.phoneTel}
                    className="inline-flex items-center gap-2 font-semibold text-[#0F0F10] hover:text-[#9E7A19] transition-colors font-mono tabular-nums"
                  >
                    <Phone className="w-4 h-4 text-[#C59B27]" />
                    <span>APPELER MAINTENANT : {COMPANY_INFO.phoneDisplay}</span>
                  </a>
                  <span aria-hidden="true" className="hidden sm:inline text-neutral-300">
                    |
                  </span>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-neutral-700 hover:text-[#0F0F10] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C59B27]" />
                    <span>Réponse rapide sur WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Interior Image */}
              <div className="lg:col-span-5">
                <div className="relative rounded-xl overflow-hidden border border-[#C59B27]/40 bg-[#0F0F10] shadow-md">
                  <div className="aspect-16/10 sm:aspect-16/9 lg:aspect-4/3 w-full">
                    <SafeImage
                      src={COMPANY_INFO.images.hero}
                      alt={COMPANY_INFO.images.heroAlt}
                      fallbackTitle={COMPANY_INFO.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Measured Contrast Scrim Bottom Bar */}
                  <div className="bg-gradient-to-t from-black/90 via-black/70 to-black/40 px-5 py-4 border-t border-[#C59B27]/30 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-[#DFB84C]">
                        QUALITÉ RÉSIDENTIELLE &amp; COMMERCIALE
                      </p>
                      <p className="text-xs text-neutral-200 mt-0.5">
                        {COMPANY_INFO.zonesSummary}
                      </p>
                    </div>
                    <a
                      href={COMPANY_INFO.phoneTel}
                      className="px-3.5 py-2 rounded-md bg-[#C59B27] text-[#0F0F10] text-xs font-bold font-mono tabular-nums whitespace-nowrap hover:bg-[#DFB84C] transition-colors"
                    >
                      {COMPANY_INFO.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            5. SECTION AVANTAGES (4 AVANTAGES AVEC ICÔNES DORÉES)
           ===================================================================== */}
        <section aria-label="Nos engagements" className="py-12 sm:py-16 bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {ADVANTAGES.map((adv) => (
                <div
                  key={adv.id}
                  className="flex items-start gap-4 p-2"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#0F0F10] border border-[#C59B27]/50 flex items-center justify-center shrink-0">
                    {renderAdvantageIcon(adv.iconName)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#0F0F10] flex items-center gap-1.5">
                      <span className="text-[#C59B27]" aria-hidden="true">
                        ✓
                      </span>
                      <span>{adv.title}</span>
                    </h2>
                    <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                      {adv.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. SECTION SERVICES (5 CARTES DE SERVICES)
           ===================================================================== */}
        <section id="services" className="py-20 lg:py-28 bg-[#FAF9F6] scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#9E7A19] mb-3">
                  <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                  <span>SOLUTIONS SUR MESURE AU QUÉBEC</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F0F10] tracking-tight text-balance">
                  NOS SERVICES
                </h2>
              </div>
              <p className="text-sm sm:text-base text-neutral-600 max-w-md">
                Que ce soit pour un entretien ménager résidentiel à Brossard, un nettoyage
                commercial à Longueuil ou un grand ménage sur la Rive-Sud, nous adaptons chaque
                visite à vos exigences.
              </p>
            </div>

            {/* 5 Service Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              {SERVICES.map((service, index) => {
                // First 3 cards span 2 columns each (row of 3 on desktop), cards 4 & 5 span 3 columns each (row of 2 on desktop)
                const colSpanClass =
                  index < 3 ? 'lg:col-span-2' : 'lg:col-span-3';

                return (
                  <article
                    key={service.id}
                    className={`${colSpanClass} bg-white border border-neutral-200/90 rounded-xl overflow-hidden flex flex-col justify-between transition-colors duration-150 hover:border-[#C59B27]`}
                  >
                    <div>
                      {service.image && (
                        <div className="aspect-16/9 w-full overflow-hidden border-b border-neutral-100 bg-neutral-900">
                          <SafeImage
                            src={service.image}
                            alt={service.imageAlt || service.title}
                            fallbackTitle={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="w-11 h-11 rounded-lg bg-[#0F0F10] border border-[#C59B27]/50 flex items-center justify-center shrink-0">
                            {renderServiceIcon(service.iconName)}
                          </div>
                          <span className="font-mono text-xs font-semibold text-[#9E7A19] tabular-nums">
                            {service.number}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-[#0F0F10] tracking-tight">
                          {service.title}
                        </h3>

                        <p className="mt-3 text-sm sm:text-base text-neutral-700 leading-relaxed">
                          {service.description}
                        </p>

                        <ul className="mt-5 pt-5 border-t border-neutral-100 space-y-2">
                          {service.highlights.map((point) => (
                            <li
                              key={point}
                              className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600"
                            >
                              <Check className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2">
                      <button
                        type="button"
                        onClick={() => handleRequestQuoteForService(service.title)}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold tracking-wide text-[#0F0F10] bg-[#FAF9F6] border border-[#C59B27] hover:bg-[#C59B27] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer"
                      >
                        <span>Demander une soumission</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            7. SECTION POURQUOI NOUS CHOISIR (POURQUOI CHOISIR QEM ?)
           ===================================================================== */}
        <section
          id="a-propos"
          className="py-20 lg:py-28 bg-[#0F0F10] text-[#FAF9F6] border-y border-[#C59B27]/30 scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Intro Statement */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#DFB84C]">
                  <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                  <span>ENGAGEMENT &amp; RIGUEUR</span>
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
                  POURQUOI CHOISIR QEM ?
                </h2>

                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed tracking-wide">
                  {WHY_CHOOSE_QEM.intro}
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleRequestQuoteForService()}
                    className="px-6 py-3.5 text-xs font-bold tracking-wide text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    OBTENIR UNE SOUMISSION GRATUITE
                  </button>
                  <a
                    href={COMPANY_INFO.phoneTel}
                    className="px-5 py-3.5 text-xs font-semibold text-white border border-neutral-700 hover:border-[#C59B27] rounded-lg transition-colors whitespace-nowrap font-mono tabular-nums"
                  >
                    {COMPANY_INFO.phoneDisplay}
                  </a>
                </div>
              </div>

              {/* Right Column: 5 Pillars */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {WHY_CHOOSE_QEM.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-6 rounded-xl bg-[#18181B] border border-neutral-800 hover:border-[#C59B27]/60 transition-colors ${
                      idx === WHY_CHOOSE_QEM.items.length - 1 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="font-mono text-xs font-semibold text-[#C59B27] tabular-nums">
                        0{idx + 1}.
                      </span>
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed tracking-wide">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            8. SECTION PROCESSUS (COMMENT ÇA FONCTIONNE ?)
           ===================================================================== */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-14">
              <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#9E7A19] mb-3">
                <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                <span>PROCESSUS SIMPLE EN 5 ÉTAPES</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F0F10] tracking-tight text-balance">
                COMMENT ÇA FONCTIONNE ?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {PROCESS_STEPS.map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="relative p-6 rounded-xl bg-[#FAF9F6] border border-neutral-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
                      <span className="text-xs font-semibold text-neutral-500">
                        Étape {Number(stepItem.step)}
                      </span>
                      <span className="font-mono text-lg font-bold text-[#C59B27] tabular-nums">
                        {stepItem.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#0F0F10] leading-snug">
                      {stepItem.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed">
                      {stepItem.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            9. FORMULAIRE DE SOUMISSION (DEMANDEZ VOTRE SOUMISSION GRATUITE)
           ===================================================================== */}
        <QuoteFormSection selectedServiceFromCard={selectedServiceForQuote} />

        {/* =====================================================================
            14. ZONES DESSERVIES
           ===================================================================== */}
        <section className="py-20 bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#9E7A19] mb-3">
                  <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                  <span>SECTEURS D’INTERVENTION</span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F0F10] tracking-tight">
                  ZONES DESSERVIES
                </h2>
              </div>
              <p className="text-sm text-neutral-600 max-w-md">
                Notre équipe se déplace rapidement pour vos besoins de nettoyage résidentiel et
                commercial dans les secteurs suivants :
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SERVED_ZONES.map((zone) => (
                <div
                  key={zone.name}
                  className="p-6 rounded-xl bg-[#FAF9F6] border border-neutral-200 hover:border-[#C59B27] transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <MapPin className="w-5 h-5 text-[#C59B27] shrink-0" />
                    <h3 className="text-lg font-bold text-[#0F0F10]">{zone.name}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 leading-relaxed">{zone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            15. AVIS DE NOS CLIENTS (SANS FAUX AVIS)
           ===================================================================== */}
        <section className="py-20 bg-[#FAF9F6] border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#9E7A19] mb-3">
                <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                <span>CONFIANCE &amp; QUALITÉ</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F0F10] tracking-tight">
                AVIS DE NOS CLIENTS
              </h2>
            </div>

            {CLIENT_REVIEWS.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-1 text-[#C59B27]" aria-hidden="true">
                    <Star className="w-5 h-5 fill-[#C59B27]" />
                    <Star className="w-5 h-5 fill-[#C59B27]" />
                    <Star className="w-5 h-5 fill-[#C59B27]" />
                    <Star className="w-5 h-5 fill-[#C59B27]" />
                    <Star className="w-5 h-5 fill-[#C59B27]" />
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0F0F10]">
                    « Votre satisfaction est notre priorité. »
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                    Chez {COMPANY_INFO.name}, chaque intervention est réalisée avec soin,
                    respect et souci du détail. Vous avez récemment fait appel à nos services ?
                    Partagez votre expérience avec nous.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRequestQuoteForService()}
                    className="px-6 py-3.5 text-xs font-bold tracking-wide text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    DEMANDER UNE SOUMISSION
                  </button>
                  <a
                    href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(
                      'Témoignage client – QEM Qassi Entretien Ménager'
                    )}`}
                    className="px-5 py-3.5 text-xs font-semibold text-[#0F0F10] bg-[#FAF9F6] border border-neutral-300 hover:border-[#C59B27] rounded-lg transition-colors whitespace-nowrap"
                  >
                    NOUS TRANSMETTRE UN AVIS
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CLIENT_REVIEWS.map((review) => (
                  <article
                    key={review.id}
                    className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-[#C59B27]">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#C59B27]" />
                        ))}
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        « {review.comment} »
                      </p>
                    </div>
                    <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                      <strong className="text-[#0F0F10]">{review.author}</strong> · {review.city} ·{' '}
                      {review.service}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            16. SECTION FAQ
           ===================================================================== */}
        <section id="faq" className="py-20 lg:py-28 bg-white border-b border-neutral-200 scroll-mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#9E7A19] mb-3">
                <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                <span>QUESTIONS FRÉQUENTES</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F0F10] tracking-tight">
                FOIRE AUX QUESTIONS (FAQ)
              </h2>
            </div>

            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={item.question} className="py-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 text-left cursor-pointer group"
                    >
                      <span className="text-base sm:text-lg font-bold text-[#0F0F10] group-hover:text-[#9E7A19] transition-colors">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#C59B27] shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm sm:text-base text-neutral-700 leading-relaxed pr-8">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            13. SECTION CONTACT (CONTACTEZ-NOUS)
           ===================================================================== */}
        <section id="contact" className="py-20 lg:py-28 bg-[#FAF9F6] scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#0F0F10] text-white rounded-2xl border border-[#C59B27]/40 p-8 sm:p-12 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column: Direct Info */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#DFB84C]">
                    <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
                    <span>PARLONS DE VOTRE PROJET DE NETTOYAGE</span>
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    CONTACTEZ-NOUS
                  </h2>

                  <p className="text-lg font-semibold text-[#DFB84C]">
                    {COMPANY_INFO.name}
                  </p>

                  <div className="space-y-4 pt-2 text-sm sm:text-base text-neutral-200">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#18181B] border border-[#C59B27]/40 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-[#C59B27]" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Téléphone</p>
                        <a
                          href={COMPANY_INFO.phoneTel}
                          className="font-mono tabular-nums font-bold text-white hover:text-[#DFB84C] transition-colors"
                        >
                          {COMPANY_INFO.phoneDisplay}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#18181B] border border-[#C59B27]/40 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-[#C59B27]" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Courriel</p>
                        <a
                          href={`mailto:${COMPANY_INFO.email}`}
                          className="font-semibold text-white hover:text-[#DFB84C] transition-colors break-all"
                        >
                          {COMPANY_INFO.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-[#18181B] border border-[#C59B27]/40 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[#C59B27]" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-400">Zone desservie</p>
                        <p className="font-semibold text-white">{COMPANY_INFO.zonesSummary}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: 4 Official Contact Action Buttons */}
                <div className="lg:col-span-5 flex flex-col gap-3.5">
                  <a
                    href={COMPANY_INFO.phoneTel}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold tracking-wide text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4" />
                    <span>APPELER ({COMPANY_INFO.phoneDisplay})</span>
                  </a>

                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold tracking-wide text-white bg-[#18181B] border border-[#C59B27] hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C59B27]" />
                    <span>WHATSAPP</span>
                  </a>

                  <a
                    href={`mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(
                      'Demande d’information – QEM Qassi Entretien Ménager'
                    )}`}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold tracking-wide text-white bg-[#18181B] border border-neutral-700 hover:border-[#C59B27] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-4 h-4 text-[#C59B27]" />
                    <span>ENVOYER UN COURRIEL</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRequestQuoteForService()}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold tracking-wide text-[#0F0F10] bg-white hover:bg-neutral-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>DEMANDER UNE SOUMISSION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          17. FOOTER PROFESSIONNEL
         ===================================================================== */}
      <footer className="bg-[#0F0F10] text-neutral-300 border-t border-[#C59B27]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-neutral-800">
            {/* Brand & Slogan */}
            <div className="md:col-span-5 space-y-4">
              <QemBrandMark variant="light" size="md" />
              <p className="text-sm text-neutral-300 font-medium">
                {COMPANY_INFO.activity}
              </p>
              <p className="font-display italic text-base text-[#DFB84C]">
                {COMPANY_INFO.slogan}
              </p>
              <p className="text-xs text-neutral-400">
                {COMPANY_INFO.zonesSummary}
              </p>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-bold tracking-widest text-[#C59B27]">
                NAVIGATION
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#accueil" className="hover:text-white transition-colors">
                    Accueil
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-white transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#soumission" className="hover:text-white transition-colors">
                    Soumission
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Direct Coordonnées */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="text-xs font-bold tracking-widest text-[#C59B27]">
                COORDONNÉES OFFICIELLES
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href={COMPANY_INFO.phoneTel}
                    className="inline-flex items-center gap-2 hover:text-white transition-colors font-mono tabular-nums"
                  >
                    <Phone className="w-4 h-4 text-[#C59B27]" />
                    <span>{COMPANY_INFO.phoneDisplay}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="inline-flex items-center gap-2 hover:text-white transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-[#C59B27]" />
                    <span>{COMPANY_INFO.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C59B27]" />
                    <span>WhatsApp : +1 {COMPANY_INFO.phoneDisplay}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Legal & Admin Access */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <p>© 2026 QEM – Qassi Entretien Ménager. Tous droits réservés.</p>

            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => setLegalTab('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Politique de confidentialité
              </button>
              <button
                type="button"
                onClick={() => setLegalTab('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Conditions d’utilisation
              </button>
              <button
                type="button"
                onClick={() => setAdminOpen(true)}
                className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-[#DFB84C] transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Accès administration</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          11. BOUTON WHATSAPP FLOTTANT SUR MOBILE
         ===================================================================== */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#0F0F10] text-white border-2 border-[#C59B27] shadow-lg hover:bg-neutral-900 transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B27]"
        aria-label="Discuter sur WhatsApp avec QEM – Qassi Entretien Ménager"
      >
        <MessageCircle className="w-5 h-5 text-[#C59B27]" />
        <span className="text-xs font-bold tracking-wide whitespace-nowrap">WhatsApp</span>
      </a>

      {/* Modals */}
      <AdminDrawer isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
      <LegalModal activeTab={legalTab} onClose={() => setLegalTab(null)} />
    </div>
  );
}
