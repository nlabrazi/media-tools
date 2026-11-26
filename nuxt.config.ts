/*
  Configuration Nuxt 4 pour MediaTools.
  Thème cyberpunk/glassmorphism avec polices modernes.
*/
export default defineNuxtConfig({
  extends: ['@nlabrazi/nuxt-layer'],
  compatibilityDate: '2026-04-28',

  devtools: { enabled: true },

  nitro: {
    devServer: {
      watch: ['server'],
    },
    watchOptions: {
      ignoreInitial: true,
      interval: 500,
      usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    },
  },

  runtimeConfig: {
    health: {
      service: 'media-tools',
    },
    download: {
      analyzeRateLimit: {
        limit: 10,
        windowMs: 60_000,
      },
      ytDlpCookiesPath: '',
      ytDlpJsRuntime: `node:${process.execPath}`,
      ytDlpPath: 'yt-dlp',
      ytDlpTimeoutMs: 30_000,
    },
    public: {
      umami: {
        websiteId: 'e553acee-96cd-42fe-bc38-f9dd9d0b0a2b',
        domains: 'media-tools.nabster.dev',
      },
      site: {
        name: 'MediaTools',
        url: 'https://media-tools.nabster.dev',
        description:
          'Téléchargez vos vidéos et photos depuis Instagram, TikTok, YouTube et Twitter gratuitement.',
      },
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  components: [
    { path: '../components/global', pathPrefix: false },
    { path: '../components/home', pathPrefix: false },
    { path: '../components/downloader', pathPrefix: false },
  ],

  css: [
    '~/assets/css/base.css',
    '~/assets/css/glassmorphism.css',
    '~/assets/css/neon.css',
    '~/assets/css/particles.css',
    '~/assets/css/buttons.css',
  ],

  app: {
    head: {
      title: 'MediaTools — Social Media Downloader',
      meta: [
        {
          name: 'description',
          content:
            'Téléchargez vos vidéos et photos depuis Instagram, TikTok, YouTube et Twitter gratuitement.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
