/**
 * Monitoring and analytics utilities for production
 */

export interface ErrorEvent {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userId?: string;
  url: string;
  userAgent: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  metadata?: Record<string, any>;
}

export interface UserEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  url: string;
}

// Error tracking
export class ErrorTracker {
  private static instance: ErrorTracker;
  private queue: ErrorEvent[] = [];
  private isOnline = navigator.onLine;

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  constructor() {
    // Listen for network status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });
  }

  logError(error: ErrorEvent): void {
    this.queue.push(error);
    
    if (this.isOnline) {
      this.flushQueue();
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errors),
      });
    } catch (err) {
      // If sending fails, put errors back in queue
      this.queue.unshift(...errors);
      console.warn('Failed to send error reports:', err);
    }
  }
}

// Performance monitoring
export class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  
  track(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      metadata,
    };
    
    this.metrics.push(metric);
    
    // Send immediately for critical metrics
    if (this.isCriticalMetric(name)) {
      this.sendMetric(metric);
    }
  }
  
  trackTiming(name: string, startTime: number): void {
    const duration = performance.now() - startTime;
    this.track(name, duration);
  }
  
  private isCriticalMetric(name: string): boolean {
    return ['LCP', 'FID', 'CLS', 'error'].includes(name);
  }
  
  private async sendMetric(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (err) {
      console.warn('Failed to send performance metric:', err);
    }
  }
}

// User analytics
export class AnalyticsTracker {
  private sessionId: string;
  private userId?: string;
  private events: UserEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startSession();
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  track(action: string, category: string, label?: string, value?: number): void {
    const event: UserEvent = {
      action,
      category,
      label,
      value,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
    };

    this.events.push(event);
    
    // Batch send events every 10 seconds or when queue reaches 10 events
    if (this.events.length >= 10) {
      this.flushEvents();
    }
  }

  trackPageView(path: string): void {
    this.track('page_view', 'navigation', path);
  }

  trackSongPlay(songId: string, title: string): void {
    this.track('song_play', 'music', title, 1);
  }

  trackUpload(success: boolean): void {
    this.track(success ? 'upload_success' : 'upload_failure', 'user_action');
  }

  trackSearch(query: string, resultsCount: number): void {
    this.track('search', 'user_action', query, resultsCount);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private startSession(): void {
    // Set up automatic event flushing
    setInterval(() => {
      if (this.events.length > 0) {
        this.flushEvents();
      }
    }, 10000); // Every 10 seconds

    // Flush events before page unload
    window.addEventListener('beforeunload', () => {
      this.flushEvents();
    });

    // Track session start
    this.track('session_start', 'session');
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    const events = [...this.events];
    this.events = [];

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
      });
    } catch (err) {
      console.warn('Failed to send analytics events:', err);
      // Don't put events back in queue to avoid memory issues
    }
  }
}

// Global instances
export const errorTracker = ErrorTracker.getInstance();
export const performanceTracker = new PerformanceTracker();
export const analyticsTracker = new AnalyticsTracker();

// Convenience functions
export function logError(message: string, error?: Error): void {
  errorTracker.logError({
    message,
    stack: error?.stack,
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  });
}

export function trackPerformance(name: string, value: number, metadata?: Record<string, any>): void {
  performanceTracker.track(name, value, metadata);
}

export function trackUserAction(action: string, category: string, label?: string, value?: number): void {
  analyticsTracker.track(action, category, label, value);
}