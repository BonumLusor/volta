// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 4 utiliza a estrutura dentro da pasta /app por padrão.
  // Ao ativar a versão 4, o Nuxt automaticamente gerencia a pasta app/
  // sem a necessidade de definir o srcDir manualmente.
  future: {
    compatibilityVersion: 4,
  },
  
  // Data de compatibilidade para habilitar as novas funcionalidades
  compatibilityDate: '2024-11-01',
  
  devtools: { enabled: true },

  // Configuração de Vite para permitir o acesso via domínio externo no Docker
  vite: {
    server: {
      allowedHosts: [
        'voltadev.automaportal.com.br'
      ]
    }
  }
})