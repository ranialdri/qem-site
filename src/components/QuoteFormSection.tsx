import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Loader2,
  Phone,
  MessageCircle,
  ShieldCheck,
  Mail,
  RefreshCw,
} from 'lucide-react';
import {
  COMPANY_INFO,
  QUOTE_FORM_OPTIONS,
  SERVED_ZONES,
  getWhatsAppUrl,
} from '../config/companyData';
import type {
  AttachedPhoto,
  EmailDeliveryInfo,
  QuoteSubmissionPayload,
} from '../types/submission';

interface QuoteFormSectionProps {
  selectedServiceFromCard: string | null;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  city?: string;
  serviceType?: string;
  general?: string;
}

interface SubmittedSummary extends Omit<QuoteSubmissionPayload, 'websiteUrl'> {
  referenceId: string;
  createdAt: string;
  emailDelivery?: EmailDeliveryInfo;
}

const DRAFT_STORAGE_KEY = 'qem_quote_form_draft_v1';

/**
 * Compress and resize client photos on an HTML5 canvas so smartphone photos
 * (often 8-12 MB each) never cause payload failures or data loss.
 */
function compressImageFile(file: File): Promise<AttachedPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Format d’image non pris en charge.'));
      img.onload = () => {
        const MAX_DIM = 1280;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ name: file.name, dataUrl, size: file.size });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({
          name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
          dataUrl: compressedDataUrl,
          size: compressedDataUrl.length,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const QuoteFormSection: React.FC<QuoteFormSectionProps> = ({ selectedServiceFromCard }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Brossard');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState(QUOTE_FORM_OPTIONS.serviceTypes[0]);
  const [propertyType, setPropertyType] = useState(QUOTE_FORM_OPTIONS.propertyTypes[0]);
  const [frequency, setFrequency] = useState(QUOTE_FORM_OPTIONS.frequencies[0]);
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState(QUOTE_FORM_OPTIONS.preferredTimes[0]);
  const [message, setMessage] = useState('');
  const [photos, setPhotos] = useState<AttachedPhoto[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState(''); // Honeypot anti-spam

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState<SubmittedSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const formTopRef = useRef<HTMLDivElement | null>(null);

  // Restore saved draft from sessionStorage on mount so client never loses typed data
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.city) setCity(parsed.city);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.serviceType) setServiceType(parsed.serviceType);
        if (parsed.propertyType) setPropertyType(parsed.propertyType);
        if (parsed.frequency) setFrequency(parsed.frequency);
        if (parsed.bedrooms) setBedrooms(parsed.bedrooms);
        if (parsed.bathrooms) setBathrooms(parsed.bathrooms);
        if (parsed.areaSqFt) setAreaSqFt(parsed.areaSqFt);
        if (parsed.preferredDate) setPreferredDate(parsed.preferredDate);
        if (parsed.preferredTime) setPreferredTime(parsed.preferredTime);
        if (parsed.message) setMessage(parsed.message);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Save draft to sessionStorage whenever fields change
  useEffect(() => {
    try {
      const draft = {
        fullName,
        phone,
        email,
        city,
        address,
        serviceType,
        propertyType,
        frequency,
        bedrooms,
        bathrooms,
        areaSqFt,
        preferredDate,
        preferredTime,
        message,
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage quota errors
    }
  }, [
    fullName,
    phone,
    email,
    city,
    address,
    serviceType,
    propertyType,
    frequency,
    bedrooms,
    bathrooms,
    areaSqFt,
    preferredDate,
    preferredTime,
    message,
  ]);

  // Sync when a user clicks "Demander une soumission" on one of the 5 service cards
  useEffect(() => {
    if (
      selectedServiceFromCard &&
      QUOTE_FORM_OPTIONS.serviceTypes.includes(selectedServiceFromCard)
    ) {
      setServiceType(selectedServiceFromCard);
    }
  }, [selectedServiceFromCard]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - photos.length;
    const selectedFiles: File[] = Array.from(files).slice(0, remainingSlots);

    for (const file of selectedFiles) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          general: 'Veuillez sélectionner uniquement des fichiers image (JPG, PNG, WEBP).',
        }));
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          general: `La photo « ${file.name} » dépasse la taille maximale autorisée (15 Mo).`,
        }));
        continue;
      }

      try {
        const compressed = await compressImageFile(file);
        setPhotos((prev) => [...prev.slice(0, 3), compressed]);
        setErrors((prev) => ({ ...prev, general: undefined }));
      } catch {
        setErrors((prev) => ({
          ...prev,
          general: `Impossible de traiter l’image « ${file.name} ». Veuillez essayer une autre photo.`,
        }));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = 'Veuillez entrer votre prénom et votre nom.';
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (!phone.trim() || digitsOnly.length < 10) {
      newErrors.phone = 'Veuillez entrer un numéro de téléphone valide à 10 chiffres (ex. : 438-994-1630).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = 'Veuillez entrer une adresse courriel valide.';
    }

    if (!city.trim() || city.trim().length < 2) {
      newErrors.city = 'Veuillez indiquer votre ville ou secteur (ex. : Brossard, Longueuil, Rive-Sud).';
    }

    if (!serviceType) {
      newErrors.serviceType = 'Veuillez sélectionner un type de service.';
    }

    if (Object.keys(newErrors).length > 0) {
      newErrors.general =
        'Veuillez compléter ou corriger les champs obligatoires indiqués en rouge ci-dessous.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setCity('Brossard');
    setAddress('');
    setServiceType(QUOTE_FORM_OPTIONS.serviceTypes[0]);
    setPropertyType(QUOTE_FORM_OPTIONS.propertyTypes[0]);
    setFrequency(QUOTE_FORM_OPTIONS.frequencies[0]);
    setBedrooms('');
    setBathrooms('');
    setAreaSqFt('');
    setPreferredDate('');
    setPreferredTime(QUOTE_FORM_OPTIONS.preferredTimes[0]);
    setMessage('');
    setPhotos([]);
    setWebsiteUrl('');
    setErrors({});
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedSummary(null);

    if (!validateForm()) {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payload: QuoteSubmissionPayload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      address: address.trim(),
      serviceType,
      propertyType,
      frequency,
      bedrooms: bedrooms.trim(),
      bathrooms: bathrooms.trim(),
      areaSqFt: areaSqFt.trim(),
      preferredDate,
      preferredTime,
      extraServices: [],
      message: message.trim(),
      photos,
      websiteUrl,
    };

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors({
          general:
            data.error ||
            'Une erreur est survenue lors de l’envoi de votre demande. Vos données ont été conservées — veuillez vérifier les champs ou réessayer.',
        });
        setIsSubmitting(false);
        formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const summary: SubmittedSummary = {
        referenceId: data.referenceId || 'QEM-OK',
        createdAt: data.createdAt || new Date().toISOString(),
        emailDelivery: data.emailDelivery,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        city: payload.city,
        address: payload.address,
        serviceType: payload.serviceType,
        propertyType: payload.propertyType,
        frequency: payload.frequency,
        bedrooms: payload.bedrooms,
        bathrooms: payload.bathrooms,
        areaSqFt: payload.areaSqFt,
        preferredDate: payload.preferredDate,
        preferredTime: payload.preferredTime,
        extraServices: [],
        message: payload.message,
        photos: payload.photos,
      };

      setSubmittedSummary(summary);
      resetForm();
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      setErrors({
        general:
          'Impossible de joindre le serveur actuellement. Aucune donnée n’a été perdue : vous pouvez cliquer sur « Réessayer l’envoi » ou nous appeler au 438-994-1630.',
      });
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildDirectMailtoHref = (s: SubmittedSummary): string => {
    const subject = `Demande de soumission [${s.referenceId}] – ${s.fullName} (${s.serviceType})`;
    const bodyLines = [
      `Bonjour ${COMPANY_INFO.name},`,
      ``,
      `Voici les détails de ma demande de soumission (${s.referenceId}) :`,
      `- Nom complet : ${s.fullName}`,
      `- Téléphone : ${s.phone}`,
      `- Courriel : ${s.email}`,
      `- Ville / Secteur : ${s.city}`,
      `- Adresse : ${s.address || 'Non précisée'}`,
      `- Type de service : ${s.serviceType}`,
      `- Type de propriété : ${s.propertyType}`,
      `- Fréquence : ${s.frequency}`,
      `- Chambres / pièces : ${s.bedrooms || 'Non précisé'}`,
      `- Salles de bain : ${s.bathrooms || 'Non précisé'}`,
      `- Superficie approx. : ${s.areaSqFt || 'Non précisée'}`,
      `- Date souhaitée : ${s.preferredDate || 'Non précisée'} (${s.preferredTime})`,
      `- Détails : ${s.message || 'Aucun message additionnel'}`,
    ].join('\n');
    return `mailto:${COMPANY_INFO.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines)}`;
  };

  return (
    <section
      id="soumission"
      className="py-20 lg:py-28 bg-[#F3F2EE] border-y border-neutral-200 scroll-mt-16"
    >
      <div ref={formTopRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="flex items-center gap-3 text-xs font-semibold tracking-widest text-[#9E7A19] mb-3">
            <span className="w-8 h-[1.5px] bg-[#C59B27]" aria-hidden="true" />
            <span>ESTIMATION RAPIDE ET SANS ENGAGEMENT</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F0F10] tracking-tight text-balance">
            DEMANDEZ VOTRE SOUMISSION GRATUITE
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-700 leading-relaxed">
            Remplissez le formulaire ci-dessous et nous communiquerons avec vous pour discuter de
            vos besoins.
          </p>
        </div>

        {/* Confirmation Screen after Submission */}
        {submittedSummary ? (
          <div
            role="status"
            aria-live="polite"
            className="bg-white border-2 border-[#C59B27] rounded-xl p-6 sm:p-10 shadow-xs space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#0F0F10] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-[#C59B27]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F0F10]">
                  Merci ! Votre demande de soumission a bien été envoyée. QEM – Qassi Entretien
                  Ménager communiquera avec vous prochainement.
                </h3>
                <p className="text-sm text-neutral-600 font-mono tabular-nums">
                  Numéro de référence :{' '}
                  <strong className="text-[#0F0F10]">{submittedSummary.referenceId}</strong> ·
                  Destinataire officiel :{' '}
                  <strong className="text-[#0F0F10]">{COMPANY_INFO.email}</strong>
                </p>
              </div>
            </div>

            {/* Complete Summary of Recorded Information (Zero Data Loss Verification) */}
            <div className="bg-[#FAF9F6] border border-neutral-200 rounded-xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-neutral-200 pb-3 flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold tracking-wider text-[#0F0F10] uppercase">
                  Récapitulatif complet de votre demande enregistrée
                </h4>
                <span className="text-xs text-[#9E7A19] font-semibold">
                  ✓ Aucune perte de données
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-neutral-500">Prénom et nom</p>
                  <p className="font-semibold text-[#0F0F10]">{submittedSummary.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Téléphone</p>
                  <p className="font-mono tabular-nums font-semibold text-[#0F0F10]">
                    {submittedSummary.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Courriel</p>
                  <p className="font-semibold text-[#0F0F10] break-all">
                    {submittedSummary.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Ville / Secteur &amp; Adresse</p>
                  <p className="font-semibold text-[#0F0F10]">
                    {submittedSummary.city}
                    {submittedSummary.address ? ` — ${submittedSummary.address}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Type de service</p>
                  <p className="font-semibold text-[#0F0F10]">{submittedSummary.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Propriété &amp; Fréquence</p>
                  <p className="font-semibold text-[#0F0F10]">
                    {submittedSummary.propertyType} · {submittedSummary.frequency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Taille du lieu</p>
                  <p className="font-mono tabular-nums text-[#0F0F10]">
                    Chambres : {submittedSummary.bedrooms || '—'} · Salles de bain :{' '}
                    {submittedSummary.bathrooms || '—'} · Superficie :{' '}
                    {submittedSummary.areaSqFt || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Date souhaitée &amp; Heure</p>
                  <p className="font-mono tabular-nums text-[#0F0F10]">
                    {submittedSummary.preferredDate || 'Non précisée'} (
                    {submittedSummary.preferredTime})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Photos jointes</p>
                  <p className="font-mono tabular-nums text-[#0F0F10]">
                    {submittedSummary.photos && submittedSummary.photos.length > 0
                      ? `${submittedSummary.photos.length} photo(s) enregistrée(s)`
                      : 'Aucune photo'}
                  </p>
                </div>
              </div>

              {submittedSummary.message && (
                <div className="pt-3 border-t border-neutral-200 text-sm">
                  <p className="text-xs text-neutral-500 mb-1">Détails / Message</p>
                  <p className="text-[#0F0F10] whitespace-pre-line">{submittedSummary.message}</p>
                </div>
              )}

              {submittedSummary.photos && submittedSummary.photos.length > 0 && (
                <div className="pt-3 border-t border-neutral-200">
                  <p className="text-xs text-neutral-500 mb-2">Aperçu des photos transmises</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {submittedSummary.photos.map((photo, index) => (
                      <div
                        key={index}
                        className="border border-neutral-200 rounded-lg overflow-hidden aspect-4/3 bg-neutral-100"
                      >
                        <img
                          src={photo.dataUrl}
                          alt={photo.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={COMPANY_INFO.phoneTel}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0F0F10] rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#C59B27]" />
                <span>Appeler le {COMPANY_INFO.phoneDisplay}</span>
              </a>

              <a
                href={getWhatsAppUrl(
                  `Bonjour QEM – Qassi Entretien Ménager, je viens d'envoyer une demande de soumission (${submittedSummary.referenceId}) pour un ${submittedSummary.serviceType.toLowerCase()} à ${submittedSummary.city}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmer sur WhatsApp</span>
              </a>

              <a
                href={buildDirectMailtoHref(submittedSummary)}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0F0F10] bg-[#FAF9F6] border border-neutral-300 hover:border-[#C59B27] rounded-lg transition-colors whitespace-nowrap"
              >
                <Mail className="w-4 h-4 text-[#C59B27]" />
                <span>Envoyer aussi via votre messagerie</span>
              </a>

              <button
                type="button"
                onClick={() => setSubmittedSummary(null)}
                className="px-4 py-3 text-sm font-medium text-neutral-700 hover:text-[#0F0F10] underline underline-offset-4 cursor-pointer"
              >
                Nouvelle demande
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-neutral-200/90 rounded-xl p-6 sm:p-10 shadow-xs space-y-10"
          >
            {/* Anti-spam Honeypot field (hidden from real users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="qem-website-url">Ne pas remplir ce champ</label>
              <input
                id="qem-website-url"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>

            {errors.general && (
              <div
                role="alert"
                className="p-4 sm:p-5 rounded-lg bg-red-50 border border-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-red-900"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900">Envoi interrompu ou incomplet</p>
                    <p className="mt-0.5 text-red-800">{errors.general}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réessayer l’envoi</span>
                </button>
              </div>
            )}

            {/* 1. INFORMATIONS DU CLIENT */}
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                <h3 className="text-base font-bold tracking-wide text-[#0F0F10]">
                  01. INFORMATIONS DU CLIENT
                </h3>
                <span className="text-xs text-neutral-500">* Champs obligatoires</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Prénom et nom * */}
                <div>
                  <label
                    htmlFor="quote-fullname"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Prénom et nom <span className="text-[#C59B27]">*</span>
                  </label>
                  <input
                    id="quote-fullname"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Ex. : Marie Tremblay"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName || errors.general)
                        setErrors({ ...errors, fullName: undefined, general: undefined });
                    }}
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? 'error-fullname' : undefined}
                    className={`w-full px-4 py-3 text-sm bg-[#FAF9F6] border rounded-lg text-[#0F0F10] placeholder:text-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                      errors.fullName
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-neutral-300 focus:border-[#C59B27]'
                    }`}
                  />
                  {errors.fullName && (
                    <p id="error-fullname" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Téléphone * */}
                <div>
                  <label
                    htmlFor="quote-phone"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Téléphone <span className="text-[#C59B27]">*</span>
                  </label>
                  <input
                    id="quote-phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="Ex. : 438-994-1630"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone || errors.general)
                        setErrors({ ...errors, phone: undefined, general: undefined });
                    }}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'error-phone' : undefined}
                    className={`w-full px-4 py-3 text-sm bg-[#FAF9F6] border rounded-lg text-[#0F0F10] placeholder:text-neutral-400 font-mono tabular-nums focus:outline-none focus:bg-white transition-colors ${
                      errors.phone
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-neutral-300 focus:border-[#C59B27]'
                    }`}
                  />
                  {errors.phone && (
                    <p id="error-phone" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Courriel * */}
                <div>
                  <label
                    htmlFor="quote-email"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Courriel <span className="text-[#C59B27]">*</span>
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Ex. : client@courriel.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email || errors.general)
                        setErrors({ ...errors, email: undefined, general: undefined });
                    }}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'error-email' : undefined}
                    className={`w-full px-4 py-3 text-sm bg-[#FAF9F6] border rounded-lg text-[#0F0F10] placeholder:text-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                      errors.email
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-neutral-300 focus:border-[#C59B27]'
                    }`}
                  />
                  {errors.email && (
                    <p id="error-email" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Ville * */}
                <div>
                  <label
                    htmlFor="quote-city"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Ville / Secteur <span className="text-[#C59B27]">*</span>
                  </label>
                  <input
                    id="quote-city"
                    type="text"
                    required
                    list="qem-cities-list"
                    placeholder="Brossard, Longueuil, Saint-Hubert, Rive-Sud..."
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city || errors.general)
                        setErrors({ ...errors, city: undefined, general: undefined });
                    }}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'error-city' : undefined}
                    className={`w-full px-4 py-3 text-sm bg-[#FAF9F6] border rounded-lg text-[#0F0F10] placeholder:text-neutral-400 focus:outline-none focus:bg-white transition-colors ${
                      errors.city
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-neutral-300 focus:border-[#C59B27]'
                    }`}
                  />
                  <datalist id="qem-cities-list">
                    {SERVED_ZONES.map((z) => (
                      <option key={z.name} value={z.name} />
                    ))}
                  </datalist>
                  {errors.city && (
                    <p id="error-city" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.city}
                    </p>
                  )}
                </div>

                {/* Adresse du service */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="quote-address"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Adresse du service{' '}
                    <span className="text-xs font-normal text-neutral-500">(optionnel)</span>
                  </label>
                  <input
                    id="quote-address"
                    type="text"
                    autoComplete="street-address"
                    placeholder="Numéro civique, rue, appartement ou bureau"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] placeholder:text-neutral-400 focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 2. DÉTAILS DU SERVICE & PROPRIÉTÉ */}
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-base font-bold tracking-wide text-[#0F0F10]">
                  02. TYPE DE SERVICE, PROPRIÉTÉ ET FRÉQUENCE
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Type de service */}
                <div>
                  <label
                    htmlFor="quote-service-type"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Type de service <span className="text-[#C59B27]">*</span>
                  </label>
                  <select
                    id="quote-service-type"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  >
                    {QUOTE_FORM_OPTIONS.serviceTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type de propriété */}
                <div>
                  <label
                    htmlFor="quote-property-type"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Type de propriété
                  </label>
                  <select
                    id="quote-property-type"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  >
                    {QUOTE_FORM_OPTIONS.propertyTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fréquence */}
                <div>
                  <label
                    htmlFor="quote-frequency"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Fréquence souhaitée
                  </label>
                  <select
                    id="quote-frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  >
                    {QUOTE_FORM_OPTIONS.frequencies.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. TAILLE DU LIEU & PLANIFICATION */}
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-base font-bold tracking-wide text-[#0F0F10]">
                  03. TAILLE DU LIEU ET DISPONIBILITÉS
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Nombre de chambres */}
                <div>
                  <label
                    htmlFor="quote-bedrooms"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Nombre de chambres / pièces
                  </label>
                  <input
                    id="quote-bedrooms"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Ex. : 3"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] font-mono tabular-nums placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  />
                </div>

                {/* Nombre de salles de bain */}
                <div>
                  <label
                    htmlFor="quote-bathrooms"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Nombre de salles de bain
                  </label>
                  <input
                    id="quote-bathrooms"
                    type="number"
                    min="0"
                    max="20"
                    placeholder="Ex. : 2"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] font-mono tabular-nums placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  />
                </div>

                {/* Superficie approximative */}
                <div>
                  <label
                    htmlFor="quote-area"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Superficie approx. (si connue)
                  </label>
                  <input
                    id="quote-area"
                    type="text"
                    placeholder="Ex. : 1 500 pi²"
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] font-mono tabular-nums placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Date souhaitée */}
                <div>
                  <label
                    htmlFor="quote-date"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Date souhaitée
                  </label>
                  <input
                    id="quote-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] font-mono tabular-nums focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  />
                </div>

                {/* Heure préférée */}
                <div>
                  <label
                    htmlFor="quote-time"
                    className="block text-sm font-semibold text-[#0F0F10] mb-2"
                  >
                    Heure préférée
                  </label>
                  <select
                    id="quote-time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                  >
                    {QUOTE_FORM_OPTIONS.preferredTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. MESSAGE ET PHOTOS OPTIONNELLES */}
            <div className="space-y-6">
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-base font-bold tracking-wide text-[#0F0F10]">
                  04. DESCRIPTION DE VOS BESOINS ET PHOTOS
                </h3>
              </div>

              <div>
                <label
                  htmlFor="quote-message"
                  className="block text-sm font-semibold text-[#0F0F10] mb-2"
                >
                  Décrivez-nous vos besoins ou ajoutez toute information importante.
                </label>
                <textarea
                  id="quote-message"
                  rows={4}
                  placeholder="Précisez vos attentes, les particularités des lieux, la présence d'animaux ou toute question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#FAF9F6] border border-neutral-300 rounded-lg text-[#0F0F10] placeholder:text-neutral-400 focus:outline-none focus:border-[#C59B27] focus:bg-white transition-colors"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="quote-photos"
                    className="block text-sm font-semibold text-[#0F0F10]"
                  >
                    Joindre des photos des espaces{' '}
                    <span className="text-xs font-normal text-neutral-500">
                      (optionnel, jusqu’à 4 photos optimisées automatiquement)
                    </span>
                  </label>
                  <span className="text-xs font-mono tabular-nums text-neutral-500">
                    {photos.length}/4
                  </span>
                </div>

                {photos.length < 4 && (
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      id="quote-photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0F0F10] bg-[#FAF9F6] border border-dashed border-neutral-400 rounded-lg hover:border-[#C59B27] hover:bg-white transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#C59B27]" />
                      <span>Ajouter une photo</span>
                    </button>
                  </div>
                )}

                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={`${photo.name}-${index}`}
                        className="relative group border border-neutral-200 rounded-lg overflow-hidden bg-neutral-100 aspect-4/3"
                      >
                        <img
                          src={photo.dataUrl}
                          alt={`Aperçu ${photo.name}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-md bg-[#0F0F10]/85 text-white flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                          aria-label={`Supprimer la photo ${photo.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Block */}
            <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span>
                  Envoi direct à <strong>{COMPANY_INFO.email}</strong> · Sauvegarde garantie sans
                  perte de données.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold tracking-wide text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] disabled:opacity-60 rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Envoi en cours…</span>
                  </>
                ) : (
                  <span>ENVOYER MA DEMANDE DE SOUMISSION</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
