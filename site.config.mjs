// ─────────────────────────────────────────────────────────────
// EDIT THESE BEFORE LAUNCH — placeholders are marked TODO.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: 'V-GO',
  legalName: 'V-GO Premium Transport', // TODO: registered company name
  url: process.env.SITE_URL || 'https://vgo.lsedev.com',
  whatsapp: '601176314314', // international format, no "+"
  phoneDisplay: '+60 11-7631 4314',
  email: '', // TODO: add a real email; left empty it is hidden everywhere
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
