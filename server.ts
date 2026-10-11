import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import type {
  EmailDeliveryInfo,
  QuoteSubmissionPayload,
  QuoteSubmissionRecord,
  SubmissionStatus,
} from './src/types/submission.ts';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const BACKUP_LOG_FILE = path.join(DATA_DIR, 'submissions_backup.jsonl');

const OFFICIAL_RECIPIENT_EMAIL = 'qassi.menagepro@gmail.com';
const COMPANY_NAME = 'QEM – Qassi Entretien Ménager';
const COMPANY_PHONE = '438-994-1630';

// ============================================================================
// ATOMIC & ZERO-DATA-LOSS STORAGE LAYER
// ============================================================================
function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readSubmissions(): QuoteSubmissionRecord[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading submissions.json, attempting recovery from backup log:', err);
    if (fs.existsSync(BACKUP_LOG_FILE)) {
      try {
        const lines = fs
          .readFileSync(BACKUP_LOG_FILE, 'utf-8')
          .split('\n')
          .filter(Boolean);
        const map = new Map<string, QuoteSubmissionRecord>();
        for (const line of lines) {
          const item = JSON.parse(line) as QuoteSubmissionRecord;
          if (item && item.id) {
            map.set(item.id, item);
          }
        }
        return Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } catch {
        return [];
      }
    }
    return [];
  }
}

/**
 * Atomic file write (write to .tmp then rename) + append-only JSONL backup
 * Guarantees zero data loss even if interrupted.
 */
function writeSubmissions(records: QuoteSubmissionRecord[], latestRecord?: QuoteSubmissionRecord): void {
  ensureStorage();
  const tmpFile = `${SUBMISSIONS_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(records, null, 2), 'utf-8');
  fs.renameSync(tmpFile, SUBMISSIONS_FILE);

  if (latestRecord) {
    try {
      fs.appendFileSync(BACKUP_LOG_FILE, `${JSON.stringify(latestRecord)}\n`, 'utf-8');
    } catch (err) {
      console.error('Warning: could not append to backup log:', err);
    }
  }
}

// ============================================================================
// EMAIL DELIVERY ENGINE (SMTP + FORMSUBMIT RELAY)
// ============================================================================
function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || OFFICIAL_RECIPIENT_EMAIL;
  const pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '').trim();
  return {
    host,
    port,
    user,
    pass,
    isConfigured: pass.length > 0 && pass !== 'MY_GMAIL_APP_PASSWORD',
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildAdminEmailHtml(record: QuoteSubmissionRecord): string {
  const receivedDate = new Date(record.createdAt).toLocaleString('fr-CA', {
    timeZone: 'America/Toronto',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const locationDetails = [
    record.bedrooms ? `Chambres / pièces : ${escapeHtml(record.bedrooms)}` : null,
    record.bathrooms ? `Salles de bain : ${escapeHtml(record.bathrooms)}` : null,
    record.areaSqFt ? `Superficie approx. : ${escapeHtml(record.areaSqFt)}` : null,
  ]
    .filter(Boolean)
    .join(' &bull; ') || 'Non précisée';

  const photoCount = record.photos?.length || 0;

  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body style="margin:0;padding:24px;background-color:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F0F10;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;margin:0 auto;background:#FFFFFF;border:1px solid #E4E4E7;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:#0F0F10;padding:24px 32px;border-bottom:3px solid #C59B27;">
          <p style="margin:0;font-size:12px;letter-spacing:2px;color:#DFB84C;font-weight:700;text-transform:uppercase;">
            NOUVELLE DEMANDE DE SOUMISSION
          </p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#FFFFFF;font-weight:700;">
            ${escapeHtml(COMPANY_NAME)}
          </h1>
          <p style="margin:6px 0 0;font-size:13px;color:#D4D4D8;">
            Référence : <strong>${escapeHtml(record.id)}</strong> &bull; Reçue le ${escapeHtml(receivedDate)}
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:28px 32px;">
          <h2 style="margin:0 0 16px;font-size:15px;color:#0F0F10;border-bottom:1px solid #E4E4E7;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
            1. Coordonnées du client
          </h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;margin-bottom:24px;">
            <tr>
              <td width="35%" style="color:#71717A;font-weight:600;">Nom complet :</td>
              <td style="color:#0F0F10;font-weight:700;">${escapeHtml(record.fullName)}</td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Téléphone :</td>
              <td>
                <a href="tel:${escapeHtml(record.phone.replace(/\D/g, ''))}" style="color:#0F0F10;font-weight:700;text-decoration:underline;">
                  ${escapeHtml(record.phone)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Courriel :</td>
              <td>
                <a href="mailto:${escapeHtml(record.email)}" style="color:#9E7A19;font-weight:600;text-decoration:underline;">
                  ${escapeHtml(record.email)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Ville / Secteur :</td>
              <td style="color:#0F0F10;font-weight:700;">${escapeHtml(record.city)}</td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Adresse du service :</td>
              <td style="color:#0F0F10;">${record.address ? escapeHtml(record.address) : '<em>Non précisée</em>'}</td>
            </tr>
          </table>

          <h2 style="margin:0 0 16px;font-size:15px;color:#0F0F10;border-bottom:1px solid #E4E4E7;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
            2. Détails du nettoyage demandé
          </h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;margin-bottom:24px;">
            <tr>
              <td width="35%" style="color:#71717A;font-weight:600;">Type de service :</td>
              <td style="color:#0F0F10;font-weight:700;">${escapeHtml(record.serviceType)}</td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Type de propriété :</td>
              <td style="color:#0F0F10;">${escapeHtml(record.propertyType)}</td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Fréquence :</td>
              <td style="color:#0F0F10;">${escapeHtml(record.frequency)}</td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Taille du lieu :</td>
              <td style="color:#0F0F10;">${locationDetails}</td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Date souhaitée :</td>
              <td style="color:#0F0F10;font-weight:600;">${record.preferredDate ? escapeHtml(record.preferredDate) : 'Non précisée'}</td>
            </tr>
            <tr>
              <td style="color:#71717A;font-weight:600;">Heure préférée :</td>
              <td style="color:#0F0F10;">${escapeHtml(record.preferredTime)}</td>
            </tr>
          </table>

          <h2 style="margin:0 0 12px;font-size:15px;color:#0F0F10;border-bottom:1px solid #E4E4E7;padding-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
            3. Message et informations complémentaires
          </h2>
          <div style="background:#FAF9F6;border:1px solid #E4E4E7;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;color:#0F0F10;white-space:pre-line;margin-bottom:20px;">
            ${record.message ? escapeHtml(record.message) : '<em>Aucun message particulier indiqué par le client.</em>'}
          </div>

          <p style="margin:0;font-size:13px;color:#52525B;">
            <strong>Photos jointes :</strong> ${photoCount > 0 ? `${photoCount} photo(s) jointe(s) à cette demande.` : 'Aucune photo jointe.'}
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#F3F2EE;padding:18px 32px;text-align:center;font-size:12px;color:#52525B;border-top:1px solid #E4E4E7;">
          Vous pouvez répondre directement à ce courriel pour écrire à <strong>${escapeHtml(record.fullName)}</strong> (${escapeHtml(record.email)}) ou l'appeler au <strong>${escapeHtml(record.phone)}</strong>.
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

function buildAdminEmailText(record: QuoteSubmissionRecord): string {
  const receivedDate = new Date(record.createdAt).toLocaleString('fr-CA', {
    timeZone: 'America/Toronto',
  });
  return [
    `NOUVELLE DEMANDE DE SOUMISSION – ${COMPANY_NAME}`,
    `Référence : ${record.id}`,
    `Date de réception : ${receivedDate}`,
    `--------------------------------------------------`,
    `1. COORDONNÉES DU CLIENT`,
    `Nom complet : ${record.fullName}`,
    `Téléphone : ${record.phone}`,
    `Courriel : ${record.email}`,
    `Ville / Secteur : ${record.city}`,
    `Adresse : ${record.address || 'Non précisée'}`,
    `--------------------------------------------------`,
    `2. DÉTAILS DU SERVICE`,
    `Type de service : ${record.serviceType}`,
    `Type de propriété : ${record.propertyType}`,
    `Fréquence : ${record.frequency}`,
    `Chambres / pièces : ${record.bedrooms || 'Non précisé'}`,
    `Salles de bain : ${record.bathrooms || 'Non précisé'}`,
    `Superficie approx. : ${record.areaSqFt || 'Non précisée'}`,
    `Date souhaitée : ${record.preferredDate || 'Non précisée'}`,
    `Heure préférée : ${record.preferredTime}`,
    `--------------------------------------------------`,
    `3. MESSAGE DU CLIENT`,
    record.message || 'Aucun message additionnel.',
    `--------------------------------------------------`,
    `Photos jointes : ${record.photos?.length || 0}`,
  ].join('\n');
}

function buildClientConfirmationHtml(record: QuoteSubmissionRecord): string {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head><meta charset="UTF-8" /></head>
  <body style="margin:0;padding:24px;background-color:#FAF9F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F0F10;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#FFFFFF;border:1px solid #E4E4E7;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:#0F0F10;padding:24px 32px;border-bottom:3px solid #C59B27;">
          <p style="margin:0;font-size:12px;letter-spacing:2px;color:#DFB84C;font-weight:700;">
            CONFIRMATION DE RÉCEPTION
          </p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#FFFFFF;font-weight:700;">
            ${escapeHtml(COMPANY_NAME)}
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;font-size:15px;line-height:1.6;color:#27272A;">
          <p style="margin-top:0;">Bonjour <strong>${escapeHtml(record.fullName)}</strong>,</p>
          <p>
            Merci ! Votre demande de soumission (référence <strong>${escapeHtml(record.id)}</strong>) a bien été reçue par <strong>${escapeHtml(COMPANY_NAME)}</strong>.
          </p>
          <p>
            Nous analysons vos besoins pour votre service de <strong>${escapeHtml(record.serviceType.toLowerCase())}</strong> à <strong>${escapeHtml(record.city)}</strong> et nous communiquerons avec vous très prochainement.
          </p>
          <div style="background:#FAF9F6;border:1px solid #E4E4E7;border-radius:8px;padding:16px;margin:20px 0;font-size:14px;">
            <p style="margin:0 0 6px;"><strong>Résumé de votre demande :</strong></p>
            <p style="margin:4px 0;">&bull; Service : ${escapeHtml(record.serviceType)} (${escapeHtml(record.propertyType)})</p>
            <p style="margin:4px 0;">&bull; Fréquence : ${escapeHtml(record.frequency)}</p>
            <p style="margin:4px 0;">&bull; Date souhaitée : ${record.preferredDate ? escapeHtml(record.preferredDate) : 'Flexible'} (${escapeHtml(record.preferredTime)})</p>
            <p style="margin:4px 0;">&bull; Téléphone indiqué : ${escapeHtml(record.phone)}</p>
          </div>
          <p style="margin-bottom:0;">
            Si vous souhaitez ajouter une précision ou pour toute demande urgente, n'hésitez pas à nous appeler directement au <strong>${COMPANY_PHONE}</strong> ou à répondre à ce courriel.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#0F0F10;color:#D4D4D8;padding:18px 32px;font-size:12px;text-align:center;">
          <strong style="color:#DFB84C;">${escapeHtml(COMPANY_NAME)}</strong> &bull; « Des espaces propres, sains et agréables. »<br/>
          Tél. : ${COMPANY_PHONE} &bull; Courriel : ${OFFICIAL_RECIPIENT_EMAIL}
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

async function sendSubmissionNotificationEmail(
  record: QuoteSubmissionRecord
): Promise<EmailDeliveryInfo> {
  const smtp = getSmtpConfig();
  const attemptedAt = new Date().toISOString();

  // 1. Primary Method: Direct SMTP via Nodemailer (supports full MIME photo attachments + client confirmation)
  if (smtp.isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.port === 465,
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
      });

      const attachments = (record.photos || [])
        .map((photo, idx) => {
          const matches = photo.dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
          if (!matches) return null;
          const contentType = matches[1];
          const base64Data = matches[2];
          const ext = contentType.split('/')[1] || 'jpg';
          return {
            filename: photo.name || `photo-${idx + 1}.${ext}`,
            content: Buffer.from(base64Data, 'base64'),
            contentType,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Send full quote notification to qassi.menagepro@gmail.com
      await transporter.sendMail({
        from: `"${COMPANY_NAME}" <${smtp.user}>`,
        to: OFFICIAL_RECIPIENT_EMAIL,
        replyTo: `"${record.fullName}" <${record.email}>`,
        subject: `Nouvelle soumission [${record.id}] – ${record.fullName} (${record.serviceType} - ${record.city})`,
        text: buildAdminEmailText(record),
        html: buildAdminEmailHtml(record),
        attachments,
      });

      // Also send automatic confirmation email to the client
      let clientConfirmationSent = false;
      try {
        await transporter.sendMail({
          from: `"${COMPANY_NAME}" <${smtp.user}>`,
          to: record.email,
          replyTo: OFFICIAL_RECIPIENT_EMAIL,
          subject: `Confirmation de votre demande de soumission – ${COMPANY_NAME}`,
          html: buildClientConfirmationHtml(record),
          text: `Bonjour ${record.fullName},\n\nMerci ! Votre demande de soumission (${record.id}) a bien été reçue par ${COMPANY_NAME}. Nous communiquerons avec vous prochainement.\n\nTéléphone : ${COMPANY_PHONE}\nCourriel : ${OFFICIAL_RECIPIENT_EMAIL}`,
        });
        clientConfirmationSent = true;
      } catch (clientErr) {
        console.warn('Could not send confirmation email to client address:', clientErr);
      }

      return {
        state: 'sent_smtp',
        recipient: OFFICIAL_RECIPIENT_EMAIL,
        attemptedAt,
        clientConfirmationSent,
        message: `Courriel envoyé directement à ${OFFICIAL_RECIPIENT_EMAIL} via SMTP avec toutes les informations${
          attachments.length > 0 ? ` et ${attachments.length} photo(s) en pièce jointe` : ''
        }.`,
      };
    } catch (smtpError) {
      console.error('SMTP send failed, attempting FormSubmit fallback:', smtpError);
    }
  }

  // 2. Fallback / Zero-Config Relay: FormSubmit.co AJAX endpoint for qassi.menagepro@gmail.com
  try {
    const appOrigin = process.env.APP_URL || 'https://qem-entretien-menager.ca';
    const locationSummary = [
      record.bedrooms ? `${record.bedrooms} chambre(s)` : null,
      record.bathrooms ? `${record.bathrooms} salle(s) de bain` : null,
      record.areaSqFt ? `${record.areaSqFt}` : null,
    ]
      .filter(Boolean)
      .join(' | ') || 'Non précisée';

    const formSubmitPayload: Record<string, string> = {
      _subject: `Nouvelle demande de soumission [${record.id}] – ${record.fullName} (${record.city})`,
      _template: 'table',
      _captcha: 'false',
      _replyto: record.email,
      Référence: record.id,
      'Date de réception': new Date(record.createdAt).toLocaleString('fr-CA', {
        timeZone: 'America/Toronto',
      }),
      'Prénom et nom': record.fullName,
      Téléphone: record.phone,
      Courriel: record.email,
      'Ville / Secteur': record.city,
      'Adresse du service': record.address || 'Non précisée',
      'Type de service': record.serviceType,
      'Type de propriété': record.propertyType,
      Fréquence: record.frequency,
      'Taille du lieu': locationSummary,
      'Date souhaitée': record.preferredDate || 'Non précisée',
      'Heure préférée': record.preferredTime,
      'Détails / Message': record.message || 'Aucun message additionnel.',
      'Photos jointes':
        record.photos && record.photos.length > 0
          ? `${record.photos.length} photo(s) enregistrée(s) et consultables dans l'espace administration du site`
          : 'Aucune photo',
    };

    const response = await fetch(`https://formsubmit.co/ajax/${OFFICIAL_RECIPIENT_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: appOrigin,
        Referer: `${appOrigin}/`,
      },
      body: JSON.stringify(formSubmitPayload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      success?: string | boolean;
      message?: string;
    };

    if (response.ok && (data.success === 'true' || data.success === true)) {
      return {
        state: 'sent_formsubmit',
        recipient: OFFICIAL_RECIPIENT_EMAIL,
        attemptedAt,
        clientConfirmationSent: false,
        message: `Demande transmise à ${OFFICIAL_RECIPIENT_EMAIL} via le relais courriel FormSubmit.`,
      };
    }

    const relayMsg = data.message || 'En attente de configuration SMTP ou d’activation FormSubmit.';
    return {
      state: 'pending_config',
      recipient: OFFICIAL_RECIPIENT_EMAIL,
      attemptedAt,
      clientConfirmationSent: false,
      message: `Demande sauvegardée sans perte. Statut relais courriel (${OFFICIAL_RECIPIENT_EMAIL}) : ${relayMsg}`,
    };
  } catch (relayErr) {
    console.error('FormSubmit relay error:', relayErr);
    return {
      state: smtp.isConfigured ? 'failed' : 'pending_config',
      recipient: OFFICIAL_RECIPIENT_EMAIL,
      attemptedAt,
      clientConfirmationSent: false,
      message:
        'Demande enregistrée de manière sécurisée sur le serveur. Pour activer l’envoi SMTP direct avec pièces jointes, configurez GMAIL_APP_PASSWORD dans les variables d’environnement.',
    };
  }
}

// Simple in-memory rate limiter for anti-spam protection on public POST /api/submissions
const submissionRateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_SUBMISSIONS_PER_WINDOW = 12;

// Active admin session tokens
const activeAdminTokens = new Set<string>();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'QEM2026!';

function sanitizeText(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function requireAdminAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Accès non autorisé. Veuillez vous connecter.' });
    return;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!activeAdminTokens.has(token)) {
    res.status(401).json({ error: 'Session expirée ou invalide. Veuillez vous reconnecter.' });
    return;
  }
  next();
}

async function startServer() {
  ensureStorage();
  const app = express();

  // ============================================================================
  // SEO ROUTES: SITEMAP & ROBOTS.TXT (Placed first so nothing intercepts them)
  // ============================================================================
  const SITEMAP_PRODUCTION_URL = 'https://qem-qassi-entretien-m-nager-nettoyage-r-sidentiel.ai.studio/';

  const generateSitemapXml = () => {
    const today = new Date().toISOString().split('T')[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITEMAP_PRODUCTION_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`.trim();
  };

  const handleSitemapRequest = (_req: express.Request, res: express.Response) => {
    res.status(200);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateSitemapXml());
  };

  const handleRobotsRequest = (_req: express.Request, res: express.Response) => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://qem-qassi-entretien-m-nager-nettoyage-r-sidentiel.ai.studio/sitemap.xml`.trim();
    res.status(200);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(robotsTxt);
  };

  // Match /sitemap.xml, /sitemap, /sitemap_index.xml, with or without trailing slash
  app.all(/^\/(sitemap|sitemap\.xml|sitemap_index\.xml|sitemap-index\.xml)\/?$/i, (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      handleSitemapRequest(req, res);
    } else {
      next();
    }
  });

  // Match /robots.txt with or without trailing slash
  app.all(/^\/robots\.txt\/?$/i, (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
      handleRobotsRequest(req, res);
    } else {
      next();
    }
  });

  // Support up to 15MB JSON payload to allow optional client photos attached to quote requests
  app.use(express.json({ limit: '15mb' }));

  // ============================================================================
  // PUBLIC API: Submit a Quote Request
  // Saves atomically first (zero data loss) AND sends email to qassi.menagepro@gmail.com
  // ============================================================================
  app.post('/api/submissions', async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const recentTimestamps = (submissionRateLimit.get(clientIp) || []).filter(
        (ts) => now - ts < RATE_LIMIT_WINDOW_MS
      );

      if (recentTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
        res.status(429).json({
          error:
            'Trop de demandes envoyées récemment. Veuillez patienter quelques minutes ou nous appeler directement au 438-994-1630.',
        });
        return;
      }

      const body = (req.body || {}) as QuoteSubmissionPayload;

      // Anti-spam Honeypot check: if hidden websiteUrl field is filled, silently reject
      if (body.websiteUrl && String(body.websiteUrl).trim().length > 0) {
        res.status(200).json({ ok: true });
        return;
      }

      const fullName = sanitizeText(body.fullName, 120);
      const phone = sanitizeText(body.phone, 40);
      const email = sanitizeText(body.email, 120);
      const city = sanitizeText(body.city, 100);
      const address = sanitizeText(body.address, 250);
      const serviceType = sanitizeText(body.serviceType, 120);
      const propertyType = sanitizeText(body.propertyType, 100) || 'Maison';
      const frequency = sanitizeText(body.frequency, 100) || 'Une seule fois';
      const bedrooms = sanitizeText(body.bedrooms, 40);
      const bathrooms = sanitizeText(body.bathrooms, 40);
      const areaSqFt = sanitizeText(body.areaSqFt, 60);
      const preferredDate = sanitizeText(body.preferredDate, 40);
      const preferredTime = sanitizeText(body.preferredTime, 60) || 'Flexible';
      const message = sanitizeText(body.message, 2500);

      // Required field validation
      const missingFields: string[] = [];
      if (!fullName || fullName.length < 2) missingFields.push('Prénom et nom');
      if (!phone || phone.replace(/\D/g, '').length < 7) missingFields.push('Téléphone valide');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) missingFields.push('Courriel valide');
      if (!city || city.length < 2) missingFields.push('Ville / Secteur');
      if (!serviceType) missingFields.push('Type de service');

      if (missingFields.length > 0) {
        res.status(400).json({
          error: `Veuillez vérifier les champs obligatoires : ${missingFields.join(', ')}.`,
        });
        return;
      }

      const extraServices = Array.isArray(body.extraServices)
        ? body.extraServices
            .filter((item): item is string => typeof item === 'string')
            .map((s) => sanitizeText(s, 80))
            .filter(Boolean)
            .slice(0, 12)
        : [];

      const photos = Array.isArray(body.photos)
        ? body.photos
            .filter(
              (p) =>
                p &&
                typeof p.name === 'string' &&
                typeof p.dataUrl === 'string' &&
                p.dataUrl.startsWith('data:image/')
            )
            .slice(0, 4)
            .map((p) => ({
              name: sanitizeText(p.name, 100),
              dataUrl: p.dataUrl,
              size: typeof p.size === 'number' ? p.size : p.dataUrl.length,
            }))
        : [];

      const newRecord: QuoteSubmissionRecord = {
        id: `QEM-${Date.now().toString(36).toUpperCase()}-${crypto
          .randomBytes(2)
          .toString('hex')
          .toUpperCase()}`,
        createdAt: new Date().toISOString(),
        status: 'nouvelle',
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
        extraServices,
        message,
        photos,
      };

      // Step 1: Immediate atomic write to disk + backup JSONL so zero data is ever lost
      const allSubmissions = readSubmissions();
      allSubmissions.unshift(newRecord);
      writeSubmissions(allSubmissions, newRecord);

      recentTimestamps.push(now);
      submissionRateLimit.set(clientIp, recentTimestamps);

      // Step 2: Send email notification to qassi.menagepro@gmail.com
      const emailDelivery = await sendSubmissionNotificationEmail(newRecord);
      newRecord.emailDelivery = emailDelivery;

      // Update stored record with email delivery status
      const updatedSubmissions = readSubmissions();
      const idx = updatedSubmissions.findIndex((s) => s.id === newRecord.id);
      if (idx !== -1) {
        updatedSubmissions[idx].emailDelivery = emailDelivery;
        writeSubmissions(updatedSubmissions);
      }

      res.status(201).json({
        ok: true,
        referenceId: newRecord.id,
        createdAt: newRecord.createdAt,
        recipientEmail: OFFICIAL_RECIPIENT_EMAIL,
        emailDelivery,
      });
    } catch (error) {
      console.error('Error saving quote submission:', error);
      res.status(500).json({
        error:
          'Une erreur est survenue lors de l’envoi de votre demande. Vos informations saisies ont été conservées dans le formulaire — veuillez réessayer ou nous appeler au 438-994-1630.',
      });
    }
  });

  // ============================================================================
  // PROTECTED ADMIN API: Manage Quote Submissions & Email Diagnostics
  // ============================================================================
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {};
    if (typeof password === 'string' && password === ADMIN_PASSWORD) {
      const token = crypto.randomBytes(32).toString('hex');
      activeAdminTokens.add(token);
      res.json({ ok: true, token });
      return;
    }
    res.status(401).json({ error: 'Mot de passe administrateur incorrect.' });
  });

  app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.slice('Bearer '.length).trim();
    activeAdminTokens.delete(token);
    res.json({ ok: true });
  });

  app.get('/api/admin/email-status', requireAdminAuth, (_req, res) => {
    const smtp = getSmtpConfig();
    res.json({
      recipientEmail: OFFICIAL_RECIPIENT_EMAIL,
      smtpConfigured: smtp.isConfigured,
      smtpHost: smtp.host,
      smtpPort: smtp.port,
      smtpUser: smtp.user,
    });
  });

  app.post('/api/admin/submissions/:id/resend-email', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const submissions = readSubmissions();
    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Demande introuvable.' });
      return;
    }

    const emailDelivery = await sendSubmissionNotificationEmail(submissions[index]);
    submissions[index].emailDelivery = emailDelivery;
    writeSubmissions(submissions);

    res.json({
      ok: true,
      emailDelivery,
      submission: submissions[index],
    });
  });

  app.get('/api/admin/submissions', requireAdminAuth, (_req, res) => {
    const submissions = readSubmissions();
    res.json({ submissions });
  });

  app.patch('/api/admin/submissions/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body || {};
    const validStatuses: SubmissionStatus[] = [
      'nouvelle',
      'en_traitement',
      'contacte',
      'completee',
      'archivee',
    ];

    const submissions = readSubmissions();
    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Demande introuvable.' });
      return;
    }

    if (status && validStatuses.includes(status)) {
      submissions[index].status = status;
    }
    if (typeof adminNotes === 'string') {
      submissions[index].adminNotes = sanitizeText(adminNotes, 1000);
    }

    writeSubmissions(submissions);
    res.json({ ok: true, submission: submissions[index] });
  });

  app.delete('/api/admin/submissions/:id', requireAdminAuth, (req, res) => {
    const { id } = req.params;
    const submissions = readSubmissions();
    const filtered = submissions.filter((s) => s.id !== id);
    writeSubmissions(filtered);
    res.json({ ok: true });
  });

  // ============================================================================
  // VITE MIDDLEWARE (DEVELOPMENT) OR STATIC DIST (PRODUCTION)
  // ============================================================================
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QEM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
