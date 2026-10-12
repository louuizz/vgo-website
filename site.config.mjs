// ─────────────────────────────────────────────────────────────
// EDIT THESE BEFORE LAUNCH — placeholders are marked TODO.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: 'V-GO',
  legalName: 'V-GO Premium Transport', // TODO: registered company name
  url: process.env.SITE_URL || 'https://www.vgo-transport.com', // TODO: real domain
  whatsapp: '60000000000', // TODO: international format, no "+" (e.g. 60123456789)
  phoneDisplay: '+60 00-000 0000', // TODO
  email: 'hello@vgo-transport.com', // TODO
  // TODO: add your real licence numbers — shown in the trust section + schema
  licences: {
    malaysia: '', // e.g. APAD / MOTAC licence no.
    singapore: '', // e.g. LTA cross-border licence no.
  },
  social: {
    facebook: '', // TODO full URLs, leave '' to omit from schema
    instagram: '',
    xiaohongshu: '',
  },
  geo: { lat: 1.4927, lng: 103.7414 }, // Johor Bahru centre (service area)
};
