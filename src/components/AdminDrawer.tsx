import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Lock,
  RefreshCw,
  Phone,
  Mail,
  MessageCircle,
  Download,
  Trash2,
  Calendar,
  MapPin,
  CheckCircle2,
  Send,
} from 'lucide-react';
import type { QuoteSubmissionRecord, SubmissionStatus } from '../types/submission';
import { COMPANY_INFO, getWhatsAppUrl } from '../config/companyData';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmailStatusResponse {
  recipientEmail: string;
  smtpConfigured: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
}

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  nouvelle: 'Nouvelle demande',
  en_traitement: 'En analyse',
  contacte: 'Client contacté',
  completee: 'Service planifié / complété',
  archivee: 'Archivée',
};

export const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem('qem_admin_token')
  );
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<QuoteSubmissionRecord[]>([]);
  const [emailConfig, setEmailConfig] = useState<EmailStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchAdminData = useCallback(async (activeToken: string) => {
    setLoading(true);
    try {
      const [subRes, emailRes] = await Promise.all([
        fetch('/api/admin/submissions', {
          headers: { Authorization: `Bearer ${activeToken}` },
        }),
        fetch('/api/admin/email-status', {
          headers: { Authorization: `Bearer ${activeToken}` },
        }),
      ]);

      if (subRes.status === 401) {
        sessionStorage.removeItem('qem_admin_token');
        setToken(null);
        return;
      }

      const subData = await subRes.json();
      if (Array.isArray(subData.submissions)) {
        setSubmissions(subData.submissions);
        if (subData.submissions.length > 0) {
          setSelectedId((prev) => prev || subData.submissions[0].id);
        }
      }

      if (emailRes.ok) {
        const emailData = await emailRes.json();
        setEmailConfig(emailData);
      }
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && token) {
      fetchAdminData(token);
    }
  }, [isOpen, token, fetchAdminData]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Mot de passe invalide.');
        return;
      }
      sessionStorage.setItem('qem_admin_token', data.token);
      setToken(data.token);
      setPassword('');
      fetchAdminData(data.token);
    } catch {
      setAuthError('Erreur de connexion au serveur.');
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    sessionStorage.removeItem('qem_admin_token');
    setToken(null);
    setSubmissions([]);
  };

  const handleStatusUpdate = async (id: string, status: SubmissionStatus) => {
    if (!token) return;
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setSubmissions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    }
  };

  const handleResendEmail = async (id: string) => {
    if (!token) return;
    setResendingId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/resend-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.submission) {
          setSubmissions((prev) =>
            prev.map((item) => (item.id === id ? data.submission : item))
          );
        }
      }
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const remaining = submissions.filter((item) => item.id !== id);
      setSubmissions(remaining);
      if (selectedId === id) {
        setSelectedId(remaining[0]?.id || null);
      }
    }
  };

  const handleExportCsv = () => {
    if (submissions.length === 0) return;
    const headers = [
      'Référence',
      'Date de réception',
      'Statut',
      'Nom complet',
      'Téléphone',
      'Courriel',
      'Ville',
      'Adresse',
      'Service',
      'Propriété',
      'Fréquence',
      'Chambres',
      'Salles de bain',
      'Superficie',
      'Date souhaitée',
      'Heure préférée',
      'Message',
      'Photos jointes',
      'Statut courriel',
    ];
    const rows = submissions.map((s) => [
      s.id,
      new Date(s.createdAt).toLocaleString('fr-CA'),
      STATUS_LABELS[s.status],
      s.fullName,
      s.phone,
      s.email,
      s.city,
      s.address || '',
      s.serviceType,
      s.propertyType,
      s.frequency,
      s.bedrooms || '',
      s.bathrooms || '',
      s.areaSqFt || '',
      s.preferredDate || '',
      s.preferredTime,
      (s.message || '').replace(/\n/g, ' '),
      String(s.photos?.length || 0),
      s.emailDelivery?.message || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `soumissions-qem-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubmissions =
    statusFilter === 'all'
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);

  const activeSubmission =
    filteredSubmissions.find((s) => s.id === selectedId) || filteredSubmissions[0] || null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div className="bg-[#FAF9F6] border border-neutral-300 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#0F0F10] text-white flex items-center justify-between border-b border-[#C59B27]/40">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#C59B27]" />
            <h2 id="admin-modal-title" className="text-base font-bold tracking-wide">
              QEM – Gestion des demandes ({COMPANY_INFO.email})
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {token && (
              <>
                <button
                  type="button"
                  onClick={() => fetchAdminData(token)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualiser</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={submissions.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white cursor-pointer"
                >
                  Déconnexion
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Fermer la fenêtre d'administration"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!token ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full my-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="font-display text-2xl font-bold text-[#0F0F10]">
                Accès réservé à l’administration QEM
              </h3>
              <p className="text-sm text-neutral-600">
                Les coordonnées personnelles des clients sont protégées et accessibles uniquement
                avec le mot de passe administrateur.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-[#0F0F10] mb-1.5"
                >
                  Mot de passe administrateur
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  placeholder="Entrez le mot de passe..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-[#C59B27]"
                />
                <p className="mt-2 text-xs text-neutral-500">
                  Mot de passe configuré via la variable d’environnement{' '}
                  <code className="font-mono text-[#0F0F10]">ADMIN_PASSWORD</code> (valeur initiale
                  par défaut : <code className="font-mono text-[#0F0F10]">QEM2026!</code>).
                </p>
              </div>

              {authError && (
                <p className="text-xs font-medium text-red-600" role="alert">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 text-sm font-bold text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors cursor-pointer"
              >
                Accéder aux demandes
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Sidebar: Submissions List */}
            <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col bg-white">
              {/* Filter Bar */}
              <div className="p-3 border-b border-neutral-200 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-600 font-mono tabular-nums">
                  {filteredSubmissions.length} demande(s)
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-[#FAF9F6] border border-neutral-300 rounded-md text-[#0F0F10]"
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="nouvelle">Nouvelles</option>
                  <option value="en_traitement">En analyse</option>
                  <option value="contacte">Client contacté</option>
                  <option value="completee">Complétées</option>
                  <option value="archivee">Archivées</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-neutral-200 max-h-64 lg:max-h-none">
                {filteredSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-neutral-500">
                    Aucune demande de soumission dans cette catégorie pour le moment.
                  </div>
                ) : (
                  filteredSubmissions.map((item) => {
                    const isSelected = activeSubmission?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full text-left p-4 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#F3F2EE] border-l-4 border-[#C59B27]'
                            : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-[#0F0F10] truncate">
                            {item.fullName}
                          </p>
                          <span className="text-xs font-mono tabular-nums text-neutral-500 shrink-0">
                            {new Date(item.createdAt).toLocaleDateString('fr-CA')}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 mt-1 truncate">{item.serviceType}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                          <span>{item.city}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-[#9E7A19]">
                            {STATUS_LABELS[item.status]}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Pane: Active Submission Details */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#FAF9F6]">
              {/* SMTP / Email Configuration Banner */}
              {emailConfig && (
                <div className="mb-6 p-4 rounded-xl bg-white border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-[#0F0F10]">
                      Destinataire courriel automatique :{' '}
                      <span className="text-[#9E7A19]">{emailConfig.recipientEmail}</span>
                    </p>
                    <p className="text-neutral-600 mt-0.5">
                      {emailConfig.smtpConfigured
                        ? `Connexion directe Gmail SMTP active (${emailConfig.smtpHost}:${emailConfig.smtpPort}) — envoi avec photos en pièces jointes.`
                        : `Mode relais FormSubmit actif vers ${emailConfig.recipientEmail}. Pour activer l'envoi SMTP direct Gmail avec pièces jointes et confirmation client automatique, définissez GMAIL_APP_PASSWORD dans les variables d'environnement.`}
                    </p>
                  </div>
                </div>
              )}

              {!activeSubmission ? (
                <div className="h-64 flex items-center justify-center text-sm text-neutral-500">
                  Sélectionnez une demande dans la liste pour consulter tous les détails.
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-neutral-500">
                        <span>Réf. {activeSubmission.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Reçue le{' '}
                          {new Date(activeSubmission.createdAt).toLocaleString('fr-CA', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#0F0F10] mt-1">
                        {activeSubmission.fullName}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-0.5">
                        {activeSubmission.serviceType} · {activeSubmission.propertyType} ·{' '}
                        {activeSubmission.frequency}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={activeSubmission.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            activeSubmission.id,
                            e.target.value as SubmissionStatus
                          )
                        }
                        className="px-3 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded-lg text-[#0F0F10]"
                        aria-label="Changer le statut de la demande"
                      >
                        {(Object.keys(STATUS_LABELS) as SubmissionStatus[]).map((st) => (
                          <option key={st} value={st}>
                            {STATUS_LABELS[st]}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDelete(activeSubmission.id)}
                        className="p-2 text-neutral-500 hover:text-red-600 bg-white border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                        aria-label="Supprimer cette demande"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions to contact client or resend email */}
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={`tel:${activeSubmission.phone.replace(/\D/g, '')}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F0F10] rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Appeler ({activeSubmission.phone})</span>
                    </a>

                    <a
                      href={getWhatsAppUrl(
                        `Bonjour ${activeSubmission.fullName}, ici QEM – Qassi Entretien Ménager concernant votre demande de soumission (${activeSubmission.serviceType}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0F0F10] bg-[#C59B27] hover:bg-[#DFB84C] rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Répondre sur WhatsApp</span>
                    </a>

                    <a
                      href={`mailto:${activeSubmission.email}?subject=${encodeURIComponent(
                        `Votre demande de soumission – QEM (Qassi Entretien Ménager)`
                      )}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0F0F10] bg-white border border-neutral-300 rounded-lg hover:border-[#C59B27] transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Écrire au client</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleResendEmail(activeSubmission.id)}
                      disabled={resendingId === activeSubmission.id}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0F0F10] bg-white border border-neutral-300 rounded-lg hover:border-[#C59B27] disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>
                        {resendingId === activeSubmission.id
                          ? 'Envoi en cours…'
                          : `Renvoyer à ${COMPANY_INFO.email}`}
                      </span>
                    </button>
                  </div>

                  {/* Email Delivery Log for this Submission */}
                  {activeSubmission.emailDelivery && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-4 text-xs text-neutral-700 flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#0F0F10]">
                          Journal d’acheminement courriel ({activeSubmission.emailDelivery.recipient})
                        </p>
                        <p className="mt-0.5">{activeSubmission.emailDelivery.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-neutral-500">Téléphone</p>
                      <p className="font-mono tabular-nums font-semibold text-[#0F0F10]">
                        {activeSubmission.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Courriel</p>
                      <p className="font-medium text-[#0F0F10] break-all">
                        {activeSubmission.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Ville / Secteur et adresse</p>
                      <p className="font-medium text-[#0F0F10] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                        <span>
                          {activeSubmission.city}
                          {activeSubmission.address ? ` — ${activeSubmission.address}` : ''}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Date et heure souhaitées</p>
                      <p className="font-medium text-[#0F0F10] flex items-center gap-1.5 font-mono tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                        <span>
                          {activeSubmission.preferredDate || 'Non précisée'} (
                          {activeSubmission.preferredTime})
                        </span>
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-neutral-500">Taille du lieu</p>
                      <p className="font-medium text-[#0F0F10] font-mono tabular-nums">
                        Chambres / pièces : {activeSubmission.bedrooms || '—'} · Salles de bain :{' '}
                        {activeSubmission.bathrooms || '—'} · Superficie :{' '}
                        {activeSubmission.areaSqFt || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-5">
                    <p className="text-xs font-semibold text-neutral-500 mb-2">
                      DÉTAILS / MESSAGE DU CLIENT
                    </p>
                    <p className="text-sm text-[#0F0F10] whitespace-pre-line leading-relaxed">
                      {activeSubmission.message || 'Aucun message additionnel.'}
                    </p>
                  </div>

                  {/* Attached Photos */}
                  {activeSubmission.photos && activeSubmission.photos.length > 0 && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-5">
                      <p className="text-xs font-semibold text-neutral-500 mb-3">
                        PHOTOS JOINTES ({activeSubmission.photos.length}) — Cliquez pour télécharger
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {activeSubmission.photos.map((photo, i) => (
                          <a
                            key={i}
                            href={photo.dataUrl}
                            download={photo.name}
                            className="block border border-neutral-200 rounded-lg overflow-hidden aspect-4/3 bg-neutral-100"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={photo.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />
                    <span>
                      Sauvegarde atomique redondante active (<code className="font-mono">data/submissions.json</code>{' '}
                      + <code className="font-mono">data/submissions_backup.jsonl</code>).
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
