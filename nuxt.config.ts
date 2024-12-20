// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false,
  plugins: [
    '~/plugins/gsap.client.ts'
  ],  
  app: {
    baseURL: '/adventures.github.io/',
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Editorial+New:wght@400;500;700&display=swap'
        }
      ]
    }
  }
})
