/**
 * Security utilities for production deployment
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "https://www.googletagmanager.com",
    "https://js.sentry-cdn.com",
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS libraries
    "https://fonts.googleapis.com",
  ],
  'img-src': [
    "'self'",
    "data:",
    "blob:",
    "https:",
    "*.supabase.co",
  ],
  'connect-src': [
    "'self'",
    "https://badgktdgiymuqgyvdwlw.supabase.co",
    "https://api.sentry.io",
    "wss://badgktdgiymuqgyvdwlw.supabase.co",
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
  ],
  'media-src': [
    "'self'",
    "blob:",
    "*.supabase.co",
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Generate CSP header string
export function generateCSPHeader(): string {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => 
      `${directive} ${sources.join(' ')}`
    )
    .join('; ');
}

// Security headers for production
export const SECURITY_HEADERS = {
  'Content-Security-Policy': generateCSPHeader(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
};

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// File upload security validation
export function validateFileUpload(file: File): { isValid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'audio/mpeg',
    'audio/wav', 
    'audio/mp3',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed. Only audio and image files are permitted.'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds maximum limit of 50MB.'
    };
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = /\.(exe|bat|com|scr|pif|cmd|js|jar|app|deb|pkg|dmg)$/i;
  if (suspiciousExtensions.test(file.name)) {
    return {
      isValid: false,
      error: 'File extension not allowed for security reasons.'
    };
  }

  return { isValid: true };
}

// Rate limiting utilities
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    let requests = this.requests.get(identifier) || [];
    requests = requests.filter(time => time > windowStart);
    
    if (requests.length >= limit) {
      return false;
    }
    
    requests.push(now);
    this.requests.set(identifier, requests);
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Create rate limiter instances
export const uploadRateLimiter = new RateLimiter();
export const searchRateLimiter = new RateLimiter();
export const authRateLimiter = new RateLimiter();

// Environment validation
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required environment variables
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_PUBLISHABLE_KEY',
  ];
  
  required.forEach(key => {
    if (!import.meta.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });
  
  // Validate URLs
  try {
    new URL(import.meta.env.VITE_SUPABASE_URL);
  } catch {
    errors.push('Invalid VITE_SUPABASE_URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Browser security features detection
export function checkBrowserSecurity(): {
  csp: boolean;
  https: boolean;
  serviceWorker: boolean;
  webCrypto: boolean;
} {
  return {
    csp: 'SecurityPolicyViolationEvent' in window,
    https: location.protocol === 'https:',
    serviceWorker: 'serviceWorker' in navigator,
    webCrypto: 'crypto' in window && 'subtle' in crypto,
  };
}

// Secure random string generator
export function generateSecureId(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}