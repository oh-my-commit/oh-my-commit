import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Oh My Commit",
  description: "Oh My Commit - 一款专注用户体验的 VSCode Git 提交插件",
  
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'API', link: '/api/' },
      { text: '最佳实践', link: '/yet-another-best-practice/' },
      { text: 'GitHub', link: 'https://github.com/yourusername/Oh My Commit' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '用户配置', link: '/guide/configuration' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: 'AI 能力', link: '/guide/ai-capabilities' },
            { text: '提交模式', link: '/guide/commit-modes' },
            { text: '团队协作', link: '/guide/team-collaboration' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '配置项', link: '/api/configuration' },
            { text: '命令列表', link: '/api/commands' },
            { text: '事件钩子', link: '/api/hooks' }
          ]
        }
      ]
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Oh My Commit Team'
    }
  }
})
