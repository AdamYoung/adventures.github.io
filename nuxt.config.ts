// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  plugins: [
    '~/plugins/gsap.client.ts'
  ],  
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Editorial+New:wght@400;500;700&display=swap'
        }
      ]
    }
  },
  router: {
    base: '/adventures/'  // Replace <YOUR_REPOSITORY_NAME> with your repo name
  }
})
