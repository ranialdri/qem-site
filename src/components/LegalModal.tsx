import React from 'react';
import { X } from 'lucide-react';
import { COMPANY_INFO } from '../config/companyData';

export type LegalTab = 'privacy' | 'terms' | null;

interface LegalModalProps {
  activeTab: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ activeTab, onClose }) => {
  if (!activeTab) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-white border border-neutral-200 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-[#0F0F10] text-white flex items-center justify-between">
          <h2 id="legal-modal-title" className="text-base font-bold">
            {activeTab === 'privacy'
              ? 'Politique de confidentialité (Loi 25 – Québec)'
              : 'Conditions d’utilisation'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-sm text-neutral-700 leading-relaxed">
          {activeTab === 'privacy' ? (
            <>
              <p className="font-semibold text-[#0F0F10]">
                {COMPANY_INFO.name} accorde une priorité absolue à la protection de vos
                renseignements personnels.
              </p>
              <h3 className="font-bold text-[#0F0F10] pt-2">1. Collecte des renseignements</h3>
              <p>
                Lorsque vous remplissez notre formulaire de demande de soumission, nous recueillons
                uniquement les renseignements nécessaires à l’évaluation de vos besoins en nettoyage
                (nom, téléphone, courriel, ville, adresse optionnelle et description des lieux).
              </p>
              <h3 className="font-bold text-[#0F0F10] pt-2">
                2. Utilisation et confidentialité stricte
              </h3>
              <p>
                Vos coordonnées sont utilisées exclusivement pour communiquer avec vous au sujet de
                votre soumission et de la planification de vos services d’entretien ménager. Aucune
                information personnelle n’est vendue, louée ou affichée publiquement.
              </p>
              <h3 className="font-bold text-[#0F0F10] pt-2">
                3. Droit d’accès et de retrait (Québec)
              </h3>
              <p>
                Vous pouvez à tout moment demander la consultation, la rectification ou la
                suppression de vos renseignements en communiquant avec nous à{' '}
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-[#9E7A19] underline font-medium"
                >
                  {COMPANY_INFO.email}
                </a>{' '}
                ou au {COMPANY_INFO.phoneDisplay}.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#0F0F10]">
                Conditions générales d’utilisation du site web de {COMPANY_INFO.name}.
              </p>
              <h3 className="font-bold text-[#0F0F10] pt-2">1. Soumissions gratuites</h3>
              <p>
                Toute demande de soumission envoyée par le biais de ce site web est gratuite et sans
                engagement. L’estimation finale est confirmée avec le client selon l’état réel des
                lieux et les services sélectionnés.
              </p>
              <h3 className="font-bold text-[#0F0F10] pt-2">2. Zones de service</h3>
              <p>
                Nos services de nettoyage résidentiel et commercial sont offerts principalement à
                Brossard, Longueuil, Saint-Hubert et sur la Rive-Sud.
              </p>
              <h3 className="font-bold text-[#0F0F10] pt-2">3. Propriété intellectuelle</h3>
              <p>
                Le nom {COMPANY_INFO.name}, le logo QEM ainsi que les textes de ce site sont
                réservés. Toute reproduction non autorisée est interdite.
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-[#FAF9F6] border-t border-neutral-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0F0F10] rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
