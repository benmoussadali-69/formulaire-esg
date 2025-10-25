import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Rate limiting en mémoire (très permissif pour dev/test)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return ip.split(',')[0].trim();
}

export function checkRateLimit(key: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    console.warn('⚠️ Rate limit atteint pour:', key);
    return false;
  }

  record.count++;
  return true;
}

// Validation des données
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 255;
}

export function sanitizeString(str: string): string {
  return str
    .replace(/[<>\"'`]/g, '')
    .trim()
    .substring(0, 500);
}

export function validateESGResponse(responses: Record<string, string>): boolean {
  if (!responses || typeof responses !== 'object') return false;
  
  // Juste vérifier qu'il y a au moins des réponses
  const keys = Object.keys(responses);
  if (keys.length === 0) {
    console.warn('⚠️ Aucune reponse');
    return false;
  }

  // Vérifier que chaque réponse est une chaîne non vide
  return keys.every(key => 
    typeof responses[key] === 'string' && 
    responses[key].trim().length > 0 &&
    responses[key].length <= 5000
  );
}

// CSRF Token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCSRFToken(token: string, expected: string): boolean {
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

// Réponse d'erreur sécurisée
export function secureErrorResponse(error: any) {
  console.error('❌ Erreur serveur:', error);
  
  return NextResponse.json(
    {
      success: false,
      message: 'Une erreur est survenue. Veuillez reessayer.'
    },
    { status: 500 }
  );
}