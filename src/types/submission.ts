export type SubmissionStatus = 'nouvelle' | 'en_traitement' | 'contacte' | 'completee' | 'archivee';

export type EmailDeliveryState =
  | 'sent_smtp'
  | 'sent_formsubmit'
  | 'pending_config'
  | 'failed';

export interface EmailDeliveryInfo {
  state: EmailDeliveryState;
  recipient: string;
  attemptedAt: string;
  clientConfirmationSent: boolean;
  message: string;
}

export interface AttachedPhoto {
  name: string;
  dataUrl: string;
  size: number;
}

export interface QuoteSubmissionPayload {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address?: string;
  serviceType: string;
  propertyType: string;
  frequency: string;
  bedrooms?: string;
  bathrooms?: string;
  areaSqFt?: string;
  preferredDate?: string;
  preferredTime: string;
  extraServices: string[];
  message?: string;
  photos?: AttachedPhoto[];
  // Anti-spam honeypot field (must remain empty)
  websiteUrl?: string;
}

export interface QuoteSubmissionRecord extends Omit<QuoteSubmissionPayload, 'websiteUrl'> {
  id: string;
  createdAt: string;
  status: SubmissionStatus;
  adminNotes?: string;
  emailDelivery?: EmailDeliveryInfo;
}
