/**
 * Build optimization utilities for production deployment
 */

// Bundle analysis configuration
export const BUNDLE_ANALYSIS = {
  // Critical chunks that should be prioritized
  criticalChunks: [
    'main',
    'vendor', 
    'auth',
    'player'
  ],
  
  // Maximum recommended sizes (in KB)
  maxSizes: {
    initial: 250, // Initial bundle size
    async: 100,   // Async chunks
    css: 50,      // CSS files
    images: 500,  // Image assets
  },
  
  // Preload configurations
  preloadPatterns: [
    /critical\.(css|js)$/,
    /main\.(css|js)$/,
    /vendor\.(css|js)$/,
  ],
  
  // Prefetch configurations  
  prefetchPatterns: [
    /dashboard\.(css|js)$/,
    /library\.(css|js)$/,
    /upload\.(css|js)$/,
  ]
};

// Image optimization settings
export const IMAGE_CONFIG = {
  formats: {
    webp: { quality: 85 },
    avif: { quality: 80 },
    jpeg: { quality: 85 },
    png: { compressionLevel: 9 },
  },
  
  sizes: {
    thumbnail: [150, 150],
    cover: [300, 300], 
    hero: [1200, 600],
    avatar: [80, 80],
  },
  
  responsive: {
    breakpoints: [320, 640, 768, 1024, 1280, 1536],
    formats: ['webp', 'jpeg']
  }
};

// Compression settings
export const COMPRESSION_CONFIG = {
  gzip: {
    level: 9,
    threshold: 1024, // Only compress files larger than 1KB
  },
  
  brotli: {
    quality: 11,
    threshold: 1024,
  },
  
  // File types to compress
  compressibleTypes: [
    'text/html',
    'text/css', 
    'text/javascript',
    'application/javascript',
    'application/json',
    'text/xml',
    'application/xml',
    'image/svg+xml'
  ]
};

// Tree shaking configuration
export const TREE_SHAKING = {
  // Libraries that should be tree-shaken
  sideEffectFree: [
    'lodash-es',
    'date-fns',
    'lucide-react'
  ],
  
  // Unused exports to eliminate
  unusedExports: [
    'development',
    'test',
    '__DEV__'
  ]
};

// Code splitting strategies
export const CODE_SPLITTING = {
  vendor: {
    chunks: 'all',
    test: /[\\/]node_modules[\\/]/,
    name: 'vendors',
    minChunks: 1,
  },
  
  common: {
    chunks: 'all',
    minChunks: 2,
    name: 'common',
    priority: 5,
  },
  
  async: {
    chunks: 'async',
    name: 'async-vendors',
    test: /[\\/]node_modules[\\/]/,
  }
};

// Performance budgets
export const PERFORMANCE_BUDGETS = {
  // Size budgets (in KB)
  maxBundleSize: 512,
  maxInitialChunk: 200,
  maxAssetSize: 300,
  
  // Performance metrics thresholds  
  metrics: {
    FCP: 1800,  // First Contentful Paint
    LCP: 2500,  // Largest Contentful Paint
    FID: 100,   // First Input Delay  
    CLS: 0.1,   // Cumulative Layout Shift
    TTFB: 600,  // Time to First Byte
  }
};

// Cache strategies
export const CACHE_STRATEGIES = {
  immutable: {
    pattern: /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
  },
  
  shortTerm: {
    pattern: /\.(html|json)$/,
    headers: {
      'Cache-Control': 'public, max-age=3600', // 1 hour
    }
  },
  
  api: {
    pattern: /^\/api\//,
    headers: {
      'Cache-Control': 'private, max-age=300', // 5 minutes
    }
  }
};

// Asset optimization helpers
export function shouldPreload(filename: string): boolean {
  return BUNDLE_ANALYSIS.preloadPatterns.some(pattern => 
    pattern.test(filename)
  );
}

export function shouldPrefetch(filename: string): boolean {
  return BUNDLE_ANALYSIS.prefetchPatterns.some(pattern => 
    pattern.test(filename)
  );
}

export function getCacheHeaders(path: string): Record<string, string> {
  if (CACHE_STRATEGIES.immutable.pattern.test(path)) {
    return CACHE_STRATEGIES.immutable.headers;
  }
  
  if (CACHE_STRATEGIES.api.pattern.test(path)) {
    return CACHE_STRATEGIES.api.headers;
  }
  
  if (CACHE_STRATEGIES.shortTerm.pattern.test(path)) {
    return CACHE_STRATEGIES.shortTerm.headers;
  }
  
  return {};
}

// Generate resource hints for HTML
export function generateResourceHints(assets: string[]): string {
  const preloads = assets
    .filter(shouldPreload)
    .map(asset => `<link rel="preload" href="${asset}" as="script">`)
    .join('\n');
    
  const prefetches = assets
    .filter(shouldPrefetch) 
    .map(asset => `<link rel="prefetch" href="${asset}">`)
    .join('\n');
    
  return [preloads, prefetches].filter(Boolean).join('\n');
}

// Performance monitoring helper
export function createPerformanceObserver(): PerformanceObserver | null {
  if (!('PerformanceObserver' in window)) {
    return null;
  }
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // Log slow operations
      if (entry.duration > 16) { // 60fps threshold
        console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
      }
    });
  });
  
  try {
    observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    return observer;
  } catch (err) {
    console.warn('Failed to start performance observer:', err);
    return null;
  }
}