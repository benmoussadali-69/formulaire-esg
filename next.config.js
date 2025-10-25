/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Désactiver la requête X-Powered-By
  poweredByHeader: false,

  // ✅ Redirection HTTPS
  redirects: async () => [
    {
      source: '/:path*',
      destination: '/:path*',
      permanent: false,
      has: [
        {
          type: 'header',
          key: 'x-forwarded-proto',
          value: '(?!https)',
        },
      ],
    },
  ],

  // ✅ Headers de sécurité additionnels
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },

  // ✅ Compiler options
  swcMinify: true,
  reactStrictMode: true,

  // ✅ Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'ESG Formulaire',
  },
};

module.exports = nextConfig;