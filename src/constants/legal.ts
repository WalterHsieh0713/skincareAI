/**
 * Dewpoint Terms & Conditions, authored as structured content so the in-app
 * Terms page and the exported Markdown document stay in sync.
 *
 * NOTE: This is a starting-point template tailored to Dewpoint's feature set —
 * it is not legal advice. Have counsel review it before you rely on it in
 * production, especially the biometric (BIPA), subscription, and governing-law
 * sections, which are jurisdiction-sensitive.
 */

export const TERMS_EFFECTIVE_DATE = 'June 27, 2026';
export const TERMS_CONTACT_EMAIL = 'support@dewpoint.app';

export type LegalSection = { heading: string; body: string[] };

export const TERMS_INTRO =
  `These Terms & Conditions ("Terms") govern your access to and use of the ` +
  `Dewpoint mobile application and related services (collectively, the "App"). ` +
  `By creating an account or using the App, you agree to these Terms. If you do ` +
  `not agree, do not use the App.`;

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: '1. Acceptance of Terms',
    body: [
      'By downloading, accessing, or using the App, you confirm that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy, which is incorporated here by reference.',
      'We may update these Terms from time to time. When we do, we will revise the “Effective Date” above and, where required, notify you in the App. Your continued use after changes take effect constitutes acceptance of the updated Terms.',
    ],
  },
  {
    heading: '2. Eligibility',
    body: [
      'You must be at least 13 years old (or the minimum age of digital consent in your jurisdiction, whichever is higher) to use the App. If you are under the age of majority where you live, you may use the App only with the involvement and consent of a parent or legal guardian.',
      'By using the App you represent that you meet these requirements and that the information you provide is accurate.',
    ],
  },
  {
    heading: '3. What Dewpoint Is — and Is Not',
    body: [
      'Dewpoint helps you photograph your skin under more consistent conditions, generates image-derived indicators (such as relative redness, texture, blemish, and a hydration proxy), tracks routine adherence, audits product ingredients, and builds before/after time-lapses.',
      'Dewpoint is a wellness and self-tracking tool. It is NOT a medical device and does NOT provide medical, dermatological, or diagnostic services. Skin scores and ingredient information are estimates and educational signals only, generated from photographs and public ingredient data. They are not a substitute for professional advice, diagnosis, or treatment.',
      'Always seek the advice of a qualified physician or dermatologist with any questions about a medical or skin condition. Never disregard or delay seeking professional advice because of something you read or saw in the App. If you think you may have a medical emergency, contact your doctor or emergency services immediately.',
    ],
  },
  {
    heading: '4. Photos, Facial Images, and Biometric Data',
    body: [
      'The App’s core feature requires you to capture selfies. Image processing — including the computer-vision calibration and validation that normalizes each scan — is performed on your device. We collect and store only what is described in our Privacy Policy.',
      'Depending on your jurisdiction, facial geometry derived from photos may be considered “biometric information” under laws such as the Illinois Biometric Information Privacy Act (BIPA) and similar statutes. Where those laws apply, we will obtain any required consent, disclose our retention and destruction schedule, and will not sell or profit from your biometric identifiers.',
      'You retain ownership of the photos you capture. You can delete your scans, and deleting your account removes associated images and derived data as described in the Privacy Policy.',
    ],
  },
  {
    heading: '5. Accounts and Security',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials, including your username and password, and for all activity that occurs under your account.',
      'You agree to provide accurate information, to keep it current, and to notify us promptly of any unauthorized use of your account. We are not liable for any loss arising from your failure to safeguard your credentials.',
    ],
  },
  {
    heading: '6. Subscriptions, Billing, and Cancellation',
    body: [
      'Some features require a paid subscription ("Dewpoint Premium"). Prices and the features included are shown in the App before you purchase.',
      'Subscriptions are billed through your app store account (Apple App Store or Google Play) and renew automatically at the then-current price unless you cancel at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours prior to the end of the period.',
      'You can manage or cancel your subscription in your app store account settings. Except where required by law, payments are non-refundable and partial periods are not refunded. Refund requests for app store purchases are handled by the applicable app store under its policies.',
      'Any free trial automatically converts to a paid subscription unless you cancel before the trial ends. We may change subscription prices prospectively; we will give notice as required and changes will not affect the period you have already paid for.',
    ],
  },
  {
    heading: '7. Your Content and License',
    body: [
      'You retain all rights to the photos, routines, notes, and other content you create in the App ("User Content").',
      'You grant us a limited, non-exclusive, worldwide, royalty-free license to host, process, and display your User Content solely to operate and provide the App to you (for example, to compute your scores and render your time-lapse). We do not use your facial images to train models or for advertising, and we do not sell them.',
      'You are responsible for your User Content and represent that you have the rights necessary to share it with the App.',
    ],
  },
  {
    heading: '8. Acceptable Use',
    body: [
      'You agree not to: (a) use the App for any unlawful purpose or in violation of these Terms; (b) upload images of anyone other than yourself without their consent; (c) reverse engineer, decompile, or attempt to extract source code except as permitted by law; (d) interfere with or disrupt the App’s security or infrastructure; or (e) use the App to harass, defame, or harm others.',
      'We may suspend or terminate access for conduct that violates these Terms or that we reasonably believe is harmful to other users, us, or third parties.',
    ],
  },
  {
    heading: '9. Intellectual Property',
    body: [
      'The App, including its software, design, text, graphics, and the Dewpoint name and logo, is owned by us or our licensors and is protected by intellectual property laws. Except for the rights expressly granted to you in these Terms, we reserve all rights.',
      'You may not use our trademarks without our prior written permission.',
    ],
  },
  {
    heading: '10. Third-Party Services',
    body: [
      'The App may rely on or link to third-party services (such as app stores and analytics or infrastructure providers). Your use of those services is governed by their terms and privacy policies, and we are not responsible for them.',
    ],
  },
  {
    heading: '11. Disclaimers',
    body: [
      'THE APP IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      'We do not warrant that skin scores or ingredient information are accurate, complete, or reliable, that the App will be uninterrupted or error-free, or that results reflect any particular real-world skin outcome. Image-derived indicators are inherently approximate and may be affected by lighting, camera, and capture variation.',
    ],
  },
  {
    heading: '12. Limitation of Liability',
    body: [
      'TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE APP.',
      'OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE APP WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR USD $50. Some jurisdictions do not allow certain limitations, so some of the above may not apply to you.',
    ],
  },
  {
    heading: '13. Indemnification',
    body: [
      'You agree to indemnify and hold us harmless from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your misuse of the App, your User Content, or your violation of these Terms or applicable law.',
    ],
  },
  {
    heading: '14. Termination',
    body: [
      'You may stop using the App and delete your account at any time. We may suspend or terminate your access if you violate these Terms or if we discontinue the App.',
      'Sections that by their nature should survive termination (including ownership, disclaimers, limitation of liability, and indemnification) will continue to apply.',
    ],
  },
  {
    heading: '15. Governing Law and Disputes',
    body: [
      'These Terms are governed by the laws of the jurisdiction in which Dewpoint is established, without regard to conflict-of-law rules. The specific governing law, venue, and any arbitration or class-action-waiver provisions will be finalized with legal counsel and stated here before public release.',
      'Nothing in these Terms limits any non-waivable statutory rights you may have as a consumer in your jurisdiction.',
    ],
  },
  {
    heading: '16. Contact',
    body: [
      `Questions about these Terms can be sent to ${TERMS_CONTACT_EMAIL}.`,
    ],
  },
];
