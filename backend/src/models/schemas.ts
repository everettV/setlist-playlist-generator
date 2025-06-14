import { ObjectId } from 'mongodb';

// ================================
// USER CONSENT TRACKING
// ================================

export interface UserConsent {
  _id?: ObjectId;
  userId?: string; // Optional - for registered users
  sessionId: string; // Required - for anonymous users
  consentGiven: boolean;
  consentTypes: {
    essential: boolean; // Always true
    analytics: boolean;
    marketing: boolean; // Required for affiliate tracking
  };
  consentDate: Date;
  lastUpdated: Date;
  ipAddress: string;
  userAgent: string;
  gdprApplies: boolean; // Based on IP geolocation
  consentVersion: string; // Track privacy policy versions
  withdrawnDate?: Date; // If user withdraws consent
}

// Database indexes for UserConsent
export const userConsentIndexes = [
  { sessionId: 1 },
  { userId: 1 },
  { consentDate: 1 },
  { lastUpdated: 1 },
  { ipAddress: 1 },
  // TTL index for data retention (2 years)
  { lastUpdated: 1, expireAfterSeconds: 63072000 }
];

// ================================
// AFFILIATE TRACKING
// ================================

export interface AffiliateClick {
  _id?: ObjectId;
  clickId: string; // Unique identifier for this click
  userId?: string; // Optional - for registered users
  sessionId: string;
  
  // Affiliate information
  affiliatePartner: string; // 'vivid_seats', 'seatgeek', etc.
  affiliateUrl: string; // Original affiliate URL
  encryptedUrl: string; // Our encrypted tracking URL
  
  // Product information
  productType: 'ticket' | 'hotel' | 'flight' | 'merch' | 'dining';
  productId?: string; // Partner's product ID
  
  // Concert context
  artistName?: string;
  venueName?: string;
  venueLocation?: string;
  eventDate?: Date;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  
  // Tracking metadata
  clickTimestamp: Date;
  userAgent: string;
  ipAddress: string;
  refererUrl?: string;
  
  // Conversion tracking
  converted: boolean;
  conversionTimestamp?: Date;
  conversionValue?: number; // Actual purchase amount
  commissionAmount?: number; // Our commission
  commissionRate?: number; // Percentage
  
  // Attribution
  source: string; // 'setlist_view', 'search_results', 'home_page'
  campaign?: string; // Marketing campaign identifier
  
  // Privacy compliance
  consentGiven: boolean; // Marketing consent at time of click
  dataRetentionDate: Date; // When to delete this record
}

export const affiliateClickIndexes = [
  { clickId: 1 },
  { sessionId: 1 },
  { userId: 1 },
  { affiliatePartner: 1 },
  { clickTimestamp: 1 },
  { converted: 1 },
  { conversionTimestamp: 1 },
  { artistName: 1 },
  { productType: 1 },
  // TTL index for data retention
  { dataRetentionDate: 1, expireAfterSeconds: 0 }
];

// ================================
// USER SESSIONS
// ================================

export interface UserSession {
  _id?: ObjectId;
  sessionId: string;
  userId?: string; // If user registers/logs in
  
  // Session metadata
  startTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  
  // Geographic info (for GDPR/privacy compliance)
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  
  // User behavior tracking
  pageViews: SessionPageView[];
  searchQueries: string[];
  artistsViewed: string[];
  playlistsCreated: number;
  affiliateClicks: number;
  
  // Conversion tracking
  totalSpent: number; // Through affiliate links
  totalCommission: number; // Our earnings from this session
  
  // Privacy settings
  cookieConsent?: UserConsent['consentTypes'];
  privacyPolicyVersion: string;
  
  // Session management
  active: boolean;
  endTime?: Date;
  endReason?: 'timeout' | 'explicit_logout' | 'new_session';
}

export interface SessionPageView {
  path: string;
  title?: string;
  timestamp: Date;
  timeOnPage?: number; // seconds
  referrer?: string;
}

export const userSessionIndexes = [
  { sessionId: 1 },
  { userId: 1 },
  { startTime: 1 },
  { lastActivity: 1 },
  { active: 1 },
  { ipAddress: 1 },
  // TTL index - expire inactive sessions after 30 days
  { lastActivity: 1, expireAfterSeconds: 2592000 }
];

// ================================
// ANALYTICS EVENTS
// ================================

export interface AnalyticsEvent {
  _id?: ObjectId;
  eventId: string;
  sessionId: string;
  userId?: string;
  
  // Event details
  eventType: 'page_view' | 'search' | 'setlist_view' | 'playlist_create' | 'affiliate_click' | 'conversion';
  eventCategory: string; // 'user_engagement', 'conversion', 'affiliate', etc.
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  
  // Event context
  timestamp: Date;
  page: string;
  referrer?: string;
  
  // Custom properties
  properties: Record<string, any>;
  
  // Geographic and device info
  country?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  
  // Privacy compliance
  consentGiven: boolean;
  anonymized: boolean; // If PII has been removed
}

export const analyticsEventIndexes = [
  { eventId: 1 },
  { sessionId: 1 },
  { userId: 1 },
  { eventType: 1 },
  { eventCategory: 1 },
  { timestamp: 1 },
  { page: 1 },
  { consentGiven: 1 },
  // TTL index for analytics data retention (2 years)
  { timestamp: 1, expireAfterSeconds: 63072000 }
];

// ================================
// AFFILIATE PARTNERSHIPS
// ================================

export interface AffiliatePartner {
  _id?: ObjectId;
  partnerId: string; // 'vivid_seats', 'seatgeek'
  partnerName: string;
  
  // API configuration
  apiEndpoint?: string;
  apiKey?: string;
  apiSecret?: string;
  
  // Commission structure
  commissionRates: {
    [productType: string]: {
      percentage?: number;
      fixedAmount?: number;
      currency: string;
    };
  };
  
  // Tracking configuration
  trackingDomain: string;
  pixelUrl?: string;
  conversionPostbackUrl?: string;
  
  // Program details
  programTerms: string;
  minimumPayout: number;
  payoutSchedule: string; // 'monthly', 'weekly'
  cookieDuration: number; // days
  
  // Status
  active: boolean;
  contractStartDate: Date;
  contractEndDate?: Date;
  
  // Performance metrics
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommission: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export const affiliatePartnerIndexes = [
  { partnerId: 1 },
  { active: 1 },
  { contractStartDate: 1 },
  { contractEndDate: 1 }
];

// ================================
// PRIVACY COMPLIANCE
// ================================

export interface PrivacyRequest {
  _id?: ObjectId;
  requestId: string;
  
  // User identification
  userId?: string;
  sessionId?: string;
  emailAddress?: string;
  ipAddress: string;
  
  // Request details
  requestType: 'data_export' | 'data_deletion' | 'consent_withdrawal' | 'data_correction';
  requestDate: Date;
  requestReason?: string;
  
  // Processing status
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  processedDate?: Date;
  processedBy?: string;
  
  // Response details
  responseData?: any; // For data export requests
  deletionConfirmation?: {
    recordsDeleted: number;
    tablesAffected: string[];
    deletionDate: Date;
  };
  
  // Compliance tracking
  gdprApplies: boolean;
  ccpaApplies: boolean;
  verificationMethod: 'email' | 'session' | 'manual';
  verificationDate?: Date;
  
  notes?: string;
}

export const privacyRequestIndexes = [
  { requestId: 1 },
  { userId: 1 },
  { sessionId: 1 },
  { emailAddress: 1 },
  { requestType: 1 },
  { status: 1 },
  { requestDate: 1 },
  { processedDate: 1 }
];

// ================================
// UTILITY TYPES
// ================================

export interface DatabaseConnection {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export interface CollectionNames {
  userConsent: 'user_consent';
  affiliateClicks: 'affiliate_clicks';
  userSessions: 'user_sessions';
  analyticsEvents: 'analytics_events';
  affiliatePartners: 'affiliate_partners';
  privacyRequests: 'privacy_requests';
}

export const COLLECTIONS: CollectionNames = {
  userConsent: 'user_consent',
  affiliateClicks: 'affiliate_clicks',
  userSessions: 'user_sessions',
  analyticsEvents: 'analytics_events',
  affiliatePartners: 'affiliate_partners',
  privacyRequests: 'privacy_requests'
};

// ================================
// VALIDATION SCHEMAS
// ================================

export const validateUserConsent = (consent: Partial<UserConsent>): string[] => {
  const errors: string[] = [];
  
  if (!consent.sessionId) errors.push('sessionId is required');
  if (consent.consentGiven === undefined) errors.push('consentGiven is required');
  if (!consent.consentTypes) errors.push('consentTypes is required');
  if (!consent.ipAddress) errors.push('ipAddress is required');
  if (!consent.userAgent) errors.push('userAgent is required');
  
  return errors;
};

export const validateAffiliateClick = (click: Partial<AffiliateClick>): string[] => {
  const errors: string[] = [];
  
  if (!click.clickId) errors.push('clickId is required');
  if (!click.sessionId) errors.push('sessionId is required');
  if (!click.affiliatePartner) errors.push('affiliatePartner is required');
  if (!click.affiliateUrl) errors.push('affiliateUrl is required');
  if (!click.productType) errors.push('productType is required');
  if (click.consentGiven === undefined) errors.push('consentGiven is required');
  
  return errors;
};

export default {
  COLLECTIONS,
  userConsentIndexes,
  affiliateClickIndexes,
  userSessionIndexes,
  analyticsEventIndexes,
  affiliatePartnerIndexes,
  privacyRequestIndexes,
  validateUserConsent,
  validateAffiliateClick
};