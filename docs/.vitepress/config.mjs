import { defineConfig } from "vitepress"

export default defineConfig({
  // 部署到组织的主页面，不需要 base 路径
  title: "Oh My Commit",
  description: "Your AI-Powered Git Commit Assistant - 让 Git 提交变得优雅而智能",
  lang: "zh-CN",

  markdown: {
    container: {
      tipLabel: "提示",
      warningLabel: "注意",
      dangerLabel: "警告",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },

  themeConfig: {
    logo: "/oh-my-commit_256.logo.png",
    nav: [
      { text: "指南", link: "/guide/introduction" },
      { text: "产品", link: "/product/prd" },
      { text: "开发", link: "/development/todo" },
      { text: "即将推出", link: "/guide/coming-soon" },
      {
        text: "GitHub",
        link: "https://github.com/oh-my-commit/oh-my-commit",
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "入门",
          items: [
            { text: "介绍", link: "/guide/introduction" },
            { text: "快速开始", link: "/guide/getting-started" },
            // { text: "用户配置", link: "/guide/configuration" },
            { text: "常见问题", link: "/guide/faq" },
          ],
        },
        {
          text: "核心概念",
          items: [
            { text: "AI 能力", link: "/guide/ai-capabilities" },
            { text: "提交模式", link: "/guide/commit-modes" },
            { text: "团队协作", link: "/guide/team-collaboration" },
            { text: "文件变更视图", link: "/guide/file-changes-view" },
          ],
        },
        {
          text: "高级指南",
          items: [
            { text: "Provider 开发", link: "/guide/provider-docs" },
            { text: "自定义 Prompt 模板", link: "/guide/custom-prompt-template" },
          ],
        },
        {
          text: "未来特性",
          items: [{ text: "即将推出", link: "/guide/coming-soon" }],
        },
      ],
      "/product/": [
        {
          text: "产品",
          items: [
            { text: "产品需求文档", link: "/product/prd" },
            // { text: "设计理念", link: "/product/design" },
            // { text: "路线图", link: "/product/roadmap" },
          ],
        },
      ],
      "/development/": [
        {
          text: "开发",
          items: [
            { text: "开发计划", link: "/development/todo" },
{
text: "开发指南",
items:[
  {text: "插件开发", link: "/development/extension-development" },
  // { text: "架构设计", link: "/development/architecture" },
  // { text: "最佳实践", link: "/development/best-practices" },
  
    {link: "/development/best-practice/commit-specification", text: "Commit 规范"},
    {link: "/development/best-practice/state-management", text: "状态管理"},
    {link: "/development/best-practice/css-management", text: "CSS 管理"},
    {link: "/development/best-practice/error-handler", text: "Error 处理"},
    {link: "/development/best-practice/error-handling-advanced", text: "高级 Error 处理"},

]
},
              {
                text: "API",
                link: "/development/api",
                items: [
                  { text: "规范", link: "/development/api/api.spec" },
                  { text: "配置项", link: "/development/api/configuration" },
                  { text: "命令列表", link: "/development/api/commands" },
                  { text: "事件钩子", link: "/development/api/hooks" },
                ],
              },
              {
                text: "调试",
                items: [
                  
                  {text: "VSCode 调试", link: "/development/debug/vscode-debugging" },
                  {link: "/development/debug/vscode-webview-hmr", text: "VSCode Webview HMR"},
            ]
          },
          {
            text: "Trouble Shooting",
            items: [
              {link: "/development/trouble-shooting/typescript-import-extensions", text: "TS 导入扩展名问题"},
              {link: '/development/trouble-shooting/patch/pnpm-patch', text: "pnpm patch 最佳实践"},
            ]
          }, {
            "text": "Publish",
            items: [
              {link: "/development/publish/publish-vscode", text: "Publish to VSCode"},
              {link: "/development/publish/publish-ovsx", text: "Publish to OVSX"},
            ]
          }
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/oh-my-commit/oh-my-commit",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright  2023-present Oh My Commit Team",
    },
  },
})
