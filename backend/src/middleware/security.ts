import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

// Rate limiting middleware
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limiting
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again after 15 minutes.'
);

// Affiliate link rate limiting (more restrictive)
export const affiliateRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 affiliate clicks per minute
  'Too many affiliate clicks from this IP, please slow down.'
);

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for inline analytics scripts
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.setlist.fm",
        "https://api.spotify.com", 
        "https://api.music.apple.com",
        "https://partner.vivid-seats.com",
        "https://www.google-analytics.com"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allows third-party affiliate content
});

// Affiliate URL encryption service
export class AffiliateSecurityService {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.AFFILIATE_SECRET_KEY || 'default-secret-key-change-in-production';
    if (this.secretKey === 'default-secret-key-change-in-production') {
      console.warn('⚠️  Using default affiliate secret key. Set AFFILIATE_SECRET_KEY in production!');
    }
  }

  // Encrypt affiliate URL with user context
  encryptAffiliateUrl(originalUrl: string, userId?: string, sessionId?: string): string {
    const timestamp = Date.now();
    const data = {
      url: originalUrl,
      userId: userId,
      sessionId: sessionId,
      timestamp: timestamp,
      // Add expiration (24 hours)
      expires: timestamp + (24 * 60 * 60 * 1000)
    };

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data), 
      this.secretKey
    ).toString();

    // URL-safe base64 encoding
    return Buffer.from(encrypted).toString('base64url');
  }

  // Decrypt and validate affiliate URL
  decryptAffiliateUrl(encryptedUrl: string): { url: string; userId?: string; sessionId?: string } | null {
    try {
      // Decode from base64url
      const encrypted = Buffer.from(encryptedUrl, 'base64url').toString();
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.secretKey);
      const dataString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!dataString) {
        throw new Error('Decryption failed');
      }

      const data = JSON.parse(dataString);
      
      // Validate expiration
      if (Date.now() > data.expires) {
        throw new Error('Affiliate URL has expired');
      }

      return {
        url: data.url,
        userId: data.userId,
        sessionId: data.sessionId
      };
    } catch (error) {
      console.error('Affiliate URL decryption failed:', error);
      return null;
    }
  }

  // Generate secure tracking token
  generateTrackingToken(data: any): string {
    return jwt.sign(
      { ...data, timestamp: Date.now() },
      this.secretKey,
      { expiresIn: '24h' }
    );
  }

  // Verify tracking token
  verifyTrackingToken(token: string): any | null {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      console.error('Tracking token verification failed:', error);
      return null;
    }
  }
}

// Session validation middleware
export const validateSession = (req: Request, res: Response, next: NextFunction) => {
  // Basic session validation
  if (!req.session) {
    return res.status(401).json({ error: 'Session required' });
  }

  // Add session info to request
  (req as any).sessionId = req.session.id;
  next();
};

// CSRF protection for affiliate actions
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (req.method === 'GET') {
    // Generate CSRF token for GET requests
    if (!sessionToken) {
      req.session!.csrfToken = CryptoJS.lib.WordArray.random(32).toString();
    }
    return next();
  }

  // Validate CSRF token for state-changing requests
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// IP validation for affiliate clicks
export const validateAffiliateClick = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'];
  const referer = req.headers['referer'];
  const ip = req.ip;

  // Basic bot detection
  if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
    return res.status(403).json({ error: 'Automated requests not allowed' });
  }

  // Require referer from our domain (basic CSRF protection)
  const allowedReferers = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://concert-recap.com', // Production domain
  ];

  if (referer && !allowedReferers.some(allowed => referer.startsWith(allowed))) {
    console.warn(`Suspicious affiliate click from referer: ${referer}, IP: ${ip}`);
    // Log but don't block - could be legitimate direct traffic
  }

  // Add tracking context to request
  (req as any).trackingContext = {
    userAgent,
    referer,
    ip,
    timestamp: Date.now()
  };

  next();
};

// Error handling middleware
export const securityErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Security middleware error:', error);

  // Don't expose internal errors to clients
  if (error.type === 'rate-limit') {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: error.retryAfter
    });
  }

  if (error.message?.includes('CSRF')) {
    return res.status(403).json({
      error: 'Request validation failed'
    });
  }

  // Generic security error
  res.status(500).json({
    error: 'Security validation failed'
  });
};

// Request logging for affiliate actions
export const affiliateLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`Affiliate Action: ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers['referer'],
      sessionId: req.session?.id,
    });
  });

  next();
};

// Input sanitization for affiliate URLs
export const sanitizeAffiliateInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize URL parameters
  if (req.body.url) {
    // Basic URL validation
    try {
      const url = new URL(req.body.url);
      
      // Only allow HTTPS for affiliate URLs
      if (url.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only HTTPS URLs are allowed' });
      }

      // Validate allowed affiliate domains
      const allowedDomains = [
        'partner.vivid-seats.com',
        'www.stubhub.com',
        'seatgeek.com',
        'ticketmaster.com',
        'expedia.com',
        'booking.com'
      ];

      if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
        return res.status(400).json({ error: 'Affiliate domain not allowed' });
      }

      req.body.url = url.toString(); // Normalized URL
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
  }

  next();
};

export default {
  generalRateLimit,
  affiliateRateLimit,
  securityHeaders,
  AffiliateSecurityService,
  validateSession,
  csrfProtection,
  validateAffiliateClick,
  securityErrorHandler,
  affiliateLogger,
  sanitizeAffiliateInput
};