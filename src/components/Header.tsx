import React, { useState } from 'react';
import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { COMPANY_INFO, getWhatsAppUrl } from '../config/companyData';
import { QemBrandMark } from './QemLogo';

interface HeaderProps {
  onNavigateToQuote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToQuote }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Services', href: '#services' },
    { label: 'À propos', href: '#a-propos' },
    { label: 'Demander une soumission', href: '#soumission' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleMobileNav = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Element */}
        <a
          href="#accueil"
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C59B27] rounded-md"
          aria-label="QEM – Qassi Entretien Ménager — Retour à l'accueil"
        >
          <QemBrandMark variant="dark" size="sm" />
        </a>

        {/* Zone 2: 5 Clean Single-Line Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-700"
          aria-label="Navigation principale"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap shrink-0 py-1 hover:text-[#0F0F10] relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1.5px] after:bg-[#C59B27] hover:after:w-full after:transition-all after:duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C59B27]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Actions (Desktop & Mobile Controls) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F0F10] bg-white border border-neutral-300 rounded-lg hover:border-[#C59B27] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B27]"
            aria-label="Nous écrire sur WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#C59B27]" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={onNavigateToQuote}
            className="px-4 py-2.5 text-xs font-semibold tracking-wide text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F0F10]"
          >
            SOUMISSION GRATUITE
          </button>

          {/* Mobile Call Button */}
          <a
            href={COMPANY_INFO.phoneTel}
            className="inline-flex lg:hidden items-center justify-center w-10 h-10 rounded-lg border border-neutral-300 bg-white text-[#0F0F10] hover:border-[#C59B27] transition-colors duration-150"
            aria-label={`Appeler maintenant au ${COMPANY_INFO.phoneDisplay}`}
          >
            <Phone className="w-4 h-4 text-[#C59B27]" />
          </a>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex lg:hidden items-center justify-center w-10 h-10 rounded-lg border border-neutral-300 bg-white text-[#0F0F10] hover:border-[#C59B27] transition-colors duration-150 cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F6] border-b border-neutral-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-1" aria-label="Menu mobile">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleMobileNav}
                  className="px-3 py-2.5 text-base font-medium text-[#0F0F10] hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={COMPANY_INFO.phoneTel}
                onClick={handleMobileNav}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#0F0F10] rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#C59B27]" />
                <span>Appeler : {COMPANY_INFO.phoneDisplay}</span>
              </a>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMobileNav}
                className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#0F0F10] bg-white border border-[#C59B27] rounded-lg hover:bg-neutral-50 transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#C59B27]" />
                <span>Écrire sur WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
