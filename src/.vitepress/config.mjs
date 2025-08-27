import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Apex AI Proxy',
  description: 'Your Free Personal AI Gateway - Official Documentation',
  
  base: '/apex-ai-proxy/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  
  // 主题配置
  themeConfig: {
    // 网站logo
    logo: './logo.svg',
    
    // 导航栏
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/quick-start' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Providers', link: '/providers/' },
      { 
        text: 'Community',
        items: [
          { text: 'GitHub', link: 'https://github.com/loadchange/apex-ai-proxy' },
          { text: 'Issues', link: 'https://github.com/loadchange/apex-ai-proxy/issues' },
          { text: 'Discussions', link: 'https://github.com/loadchange/apex-ai-proxy/discussions' }
        ]
      }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Advanced Usage',
          items: [
            { text: 'Multiple API Keys', link: '/guide/multiple-keys' },
            { text: 'Load Balancing', link: '/guide/load-balancing' },
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'Monitoring', link: '/guide/monitoring' }
          ]
        },
        {
          text: 'Integrations',
          items: [
            { text: 'OpenAI SDK', link: '/guide/integrations/openai' },
            { text: 'Anthropic SDK', link: '/guide/integrations/anthropic' },
            { text: 'Claude Code', link: '/guide/integrations/claude-code' },
            { text: 'Langchain', link: '/guide/integrations/langchain' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Chat Completions', link: '/api/chat-completions' },
            { text: 'Embeddings', link: '/api/embeddings' },
            { text: 'Models', link: '/api/models' },
            { text: 'Responses API', link: '/api/responses' }
          ]
        },
        {
          text: 'Anthropic Compatibility',
          items: [
            { text: 'Messages API', link: '/api/anthropic/messages' },
            { text: 'Tool Usage', link: '/api/anthropic/tools' },
            { text: 'Streaming', link: '/api/anthropic/streaming' }
          ]
        }
      ],
      '/providers/': [
        {
          text: 'Supported Providers',
          items: [
            { text: 'Overview', link: '/providers/' },
            { text: 'Azure OpenAI', link: '/providers/azure' },
            { text: 'DeepSeek', link: '/providers/deepseek' },
            { text: 'Aliyun DashScope', link: '/providers/aliyun' },
            { text: 'DeepInfra', link: '/providers/deepinfra' },
            { text: 'Custom Providers', link: '/providers/custom' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/loadchange/apex-ai-proxy' }
    ],

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/loadchange/apex-ai-proxy/edit/docs-website/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Apex AI Proxy Team'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 最后更新时间格式
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  // 头部配置
  head: [
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'Apex AI Proxy' }],
    ['meta', { name: 'og:image', content: './og-image.png' }],
    ['link', { rel: 'icon', href: './favicon.ico' }]
  ],

  // Markdown 配置
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
