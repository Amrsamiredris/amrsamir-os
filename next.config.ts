import type { NextConfig } from "next";

/** PostHog region: "eu" (default) or "us". Must match the region of the PostHog project. */
const PH = process.env.POSTHOG_REGION === "us" ? "us" : "eu";

/**
 * Content-Security-Policy for the public site.
 * 'unsafe-inline' scripts are allowed because the site is statically generated (nonces would force
 * every page to render on demand) and it renders no visitor-supplied content. The policy still blocks
 * scripts, frames and form posts from any origin not listed here, plus framing of the site itself.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.google-analytics.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.clarity.ms https://c.bing.com",
  "frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Keystatic's local editor runs on 127.0.0.1
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  // Required for the PostHog proxy below
  skipTrailingSlashRedirect: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `https://${PH}-assets.i.posthog.com/static/:path*` },
      { source: "/ingest/:path*", destination: `https://${PH}.i.posthog.com/:path*` },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: baseHeaders },
      // CSP everywhere except the Keystatic editor, which talks to GitHub directly
      ...(isProd
        ? [{ source: "/((?!keystatic|api/keystatic).*)", headers: [{ key: "Content-Security-Policy", value: csp }] }]
        : []),
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
