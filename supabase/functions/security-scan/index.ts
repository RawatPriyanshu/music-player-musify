import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SecurityIssue {
  type: 'file' | 'input' | 'upload' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, data } = await req.json();
    const issues: SecurityIssue[] = [];

    switch (type) {
      case 'file_upload':
        issues.push(...scanFileUpload(data));
        break;
      case 'user_input':
        issues.push(...scanUserInput(data));
        break;
      case 'content_scan':
        issues.push(...scanContent(data));
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid scan type' }),
          { status: 400 }
        );
    }

    // Log security events
    if (issues.length > 0) {
      await supabase
        .from('security_logs')
        .insert({
          scan_type: type,
          issues_found: issues.length,
          severity_breakdown: {
            critical: issues.filter(i => i.severity === 'critical').length,
            high: issues.filter(i => i.severity === 'high').length,
            medium: issues.filter(i => i.severity === 'medium').length,
            low: issues.filter(i => i.severity === 'low').length,
          },
          user_id: data.user_id || null,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        });
    }

    return new Response(
      JSON.stringify({
        safe: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        issues,
        summary: {
          total: issues.length,
          critical: issues.filter(i => i.severity === 'critical').length,
          high: issues.filter(i => i.severity === 'high').length,
          medium: issues.filter(i => i.severity === 'medium').length,
          low: issues.filter(i => i.severity === 'low').length,
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Security scan error:', error);
    return new Response(
      JSON.stringify({ error: 'Security scan failed' }),
      { status: 500 }
    );
  }
});

function scanFileUpload(data: any): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  if (!data.filename || !data.mimetype || !data.size) {
    issues.push({
      type: 'upload',
      severity: 'high',
      description: 'Missing file metadata',
      recommendation: 'Ensure all file uploads include filename, mimetype, and size'
    });
  }

  // Check for suspicious file extensions
  const suspiciousExtensions = /\.(exe|bat|com|scr|pif|cmd|js|jar|app|deb|pkg|dmg|vbs|ps1)$/i;
  if (data.filename && suspiciousExtensions.test(data.filename)) {
    issues.push({
      type: 'file',
      severity: 'critical',
      description: `Suspicious file extension detected: ${data.filename}`,
      recommendation: 'Block executable file uploads and validate file types'
    });
  }

  // Check file size
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (data.size > maxSize) {
    issues.push({
      type: 'upload',
      severity: 'medium',
      description: `File size exceeds limit: ${data.size} bytes`,
      recommendation: 'Implement proper file size limits'
    });
  }

  // Validate MIME type
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png', 'image/webp'];
  if (data.mimetype && !allowedTypes.includes(data.mimetype)) {
    issues.push({
      type: 'file',
      severity: 'high',
      description: `Invalid MIME type: ${data.mimetype}`,
      recommendation: 'Restrict uploads to allowed MIME types only'
    });
  }

  return issues;
}

function scanUserInput(data: any): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  if (!data.content) return issues;

  const content = data.content.toString();

  // Check for XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  xssPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push({
        type: 'input',
        severity: 'high',
        description: `Potential XSS pattern detected: ${pattern.source}`,
        recommendation: 'Implement input sanitization and validation'
      });
    }
  });

  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\s|^)(select|insert|update|delete|drop|union|exec)\s/gi,
    /;\s*(drop|delete|truncate)/gi,
    /'\s*(or|and)\s*'?\d/gi,
  ];

  sqlPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      issues.push({
        type: 'input',
        severity: 'critical',
        description: `Potential SQL injection pattern detected: ${pattern.source}`,
        recommendation: 'Use parameterized queries and input validation'
      });
    }
  });

  // Check content length
  if (content.length > 10000) {
    issues.push({
      type: 'input',
      severity: 'low',
      description: `Input content is very long: ${content.length} characters`,
      recommendation: 'Implement input length limits'
    });
  }

  return issues;
}

function scanContent(data: any): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  
  // Scan for potentially inappropriate content
  const inappropriatePatterns = [
    /\b(password|secret|key|token)\s*[:=]\s*[^\s]+/gi,
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card patterns
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email patterns
  ];

  inappropriatePatterns.forEach(pattern => {
    if (pattern.test(data.content)) {
      issues.push({
        type: 'content',
        severity: 'medium',
        description: `Potentially sensitive information detected`,
        recommendation: 'Review content for sensitive data exposure'
      });
    }
  });

  return issues;
}