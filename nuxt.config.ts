/*
  Configuration Nuxt 4 pour MediaTools.
  Thème cyberpunk/glassmorphism avec polices modernes.
*/
export default defineNuxtConfig({
  compatibilityDate: '2026-04-28',

  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  components: [
    { path: '../components/global', pathPrefix: false },
    { path: '../components/home', pathPrefix: false },
    { path: '../components/downloader', pathPrefix: false }
  ],

  css: [
    '~/assets/css/base.css',
    '~/assets/css/glassmorphism.css',
    '~/assets/css/neon.css',
    '~/assets/css/particles.css',
    '~/assets/css/buttons.css'
  ],

  app: {
    head: {
      title: 'MediaTools — Social Media Downloader',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Téléchargez vos vidéos et photos depuis Instagram, TikTok, YouTube et Twitter gratuitement.'
        }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap'
        }
      ]
    }
  }
});
