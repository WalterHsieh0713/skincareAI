import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

const TITLE = 'Dewpoint — Is your skin actually getting better?';
const DESCRIPTION =
  'Dewpoint turns a normalized selfie into an objective, multi-axis skin score tracked against your own past self — so you finally know if your skincare routine is working.';
const KEYWORDS =
  'skincare tracker, skin score, skin analysis app, skincare routine tracker, acne progress, skin condition score, ingredient checker, INCI scanner, before after skin';

/**
 * Custom root HTML for the static web export. Search-engine and social meta
 * live here so every statically-rendered route ships with them.
 * `og:url` / canonical are added once the production URL is known.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content={KEYWORDS} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#208AEF" />

        {/* Open Graph (Facebook, iMessage, LinkedIn, etc.) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Dewpoint" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/favicon.png" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="/favicon.png" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
