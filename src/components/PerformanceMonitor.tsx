import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface PerformanceData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV === 'development') return;

    const handleMetric = (metric: Metric) => {
      const performanceData: PerformanceData = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
      };

      // Send to analytics service
      sendToAnalytics(performanceData);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${metric.name}:`, metric);
      }
    };

    // Collect Core Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    // Monitor resource loading times
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          
          // Track page load metrics
          const metrics = {
            dns: nav.domainLookupEnd - nav.domainLookupStart,
            connection: nav.connectEnd - nav.connectStart,
            ttfb: nav.responseStart - nav.requestStart,
            download: nav.responseEnd - nav.responseStart,
            domLoad: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
            pageLoad: nav.loadEventEnd - nav.loadEventStart,
          };

          sendToAnalytics({
            name: 'page-load',
            value: nav.loadEventEnd - nav.fetchStart,
            rating: 'good',
            timestamp: Date.now(),
            url: window.location.href,
            details: metrics,
          });
        }

        // Track resource loading
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // Only track large resources or slow loading ones
          if (resource.transferSize > 100000 || resource.duration > 1000) {
            sendToAnalytics({
              name: 'resource-load',
              value: resource.duration,
              rating: resource.duration > 1000 ? 'poor' : 'good',
              timestamp: Date.now(),
              url: resource.name,
              details: {
                size: resource.transferSize,
                type: getResourceType(resource.name),
              },
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Monitor memory usage
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;
    
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };

        // Alert if memory usage is high
        const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercentage > 80) {
          sendToAnalytics({
            name: 'memory-warning',
            value: usagePercentage,
            rating: 'poor',
            timestamp: Date.now(),
            url: window.location.href,
            details: memoryUsage,
          });
        }
      }
    };

    const interval = setInterval(monitorMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return null;
}

function sendToAnalytics(data: any) {
  try {
    // Send to your analytics service
    // Replace with your actual analytics endpoint
    
    // Example: Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', data.name, {
        custom_parameter_1: data.value,
        custom_parameter_2: data.rating,
      });
    }

    // Example: Send to custom endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(err => {
      console.warn('Failed to send performance data:', err);
    });

    // Store locally as fallback
    const stored = localStorage.getItem('performance-metrics');
    const metrics = stored ? JSON.parse(stored) : [];
    metrics.push(data);
    
    // Keep only last 100 entries
    if (metrics.length > 100) {
      metrics.splice(0, metrics.length - 100);
    }
    
    localStorage.setItem('performance-metrics', JSON.stringify(metrics));
  } catch (error) {
    console.warn('Failed to log performance metric:', error);
  }
}

function getResourceType(url: string): string {
  if (url.includes('.js')) return 'javascript';
  if (url.includes('.css')) return 'stylesheet';
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
  if (url.match(/\.(mp3|wav|ogg|m4a)$/)) return 'audio';
  if (url.match(/\.(mp4|webm|mov)$/)) return 'video';
  if (url.includes('api/')) return 'api';
  return 'other';
}
