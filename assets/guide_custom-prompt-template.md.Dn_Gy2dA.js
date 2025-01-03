import{_ as i,c as a,a0 as n,o as l}from"./chunks/framework.P9qPzDnn.js";const g=JSON.parse('{"title":"Custom Prompt Template Guide","description":"","frontmatter":{},"headers":[],"relativePath":"guide/custom-prompt-template.md","filePath":"guide/custom-prompt-template.md"}'),t={name:"guide/custom-prompt-template.md"};function p(h,s,e,k,r,d){return l(),a("div",null,s[0]||(s[0]=[n(`<h1 id="custom-prompt-template-guide" tabindex="-1">Custom Prompt Template Guide <a class="header-anchor" href="#custom-prompt-template-guide" aria-label="Permalink to &quot;Custom Prompt Template Guide&quot;">​</a></h1><p>本指南将帮助你创建和使用自定义的 Prompt 模板。</p><h2 id="模板基础" tabindex="-1">模板基础 <a class="header-anchor" href="#模板基础" aria-label="Permalink to &quot;模板基础&quot;">​</a></h2><h3 id="_1-模板位置" tabindex="-1">1. 模板位置 <a class="header-anchor" href="#_1-模板位置" aria-label="Permalink to &quot;1. 模板位置&quot;">​</a></h3><p>模板文件应放置在 <code>templates</code> 目录下，使用 <code>.hbs</code> 扩展名：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">templates/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ├──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> provider-official/</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 官方提供商模板</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  │</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">   └──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> standard.hbs</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # 标准模板</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  └──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> your-provider/</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">           # 你的提供商模板</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      └──</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> custom.hbs</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">          # 自定义模板</span></span></code></pre></div><h3 id="_2-模板格式" tabindex="-1">2. 模板格式 <a class="header-anchor" href="#_2-模板格式" aria-label="Permalink to &quot;2. 模板格式&quot;">​</a></h3><p>模板使用 Handlebars 语法，支持以下变量：</p><div class="language-handlebars vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">handlebars</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">{{! 输入变量 }}</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{{</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">lang</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># 语言选项 (en/zh 等)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{{</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">diff</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"># Git diff 内容</span></span></code></pre></div><h3 id="_3-使用示例" tabindex="-1">3. 使用示例 <a class="header-anchor" href="#_3-使用示例" aria-label="Permalink to &quot;3. 使用示例&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { PromptTemplate } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;@shared/server/prompt-template&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> YourProvider</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> template</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PromptTemplate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;your-provider/custom&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  async</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> generateCommit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> GenerateCommitInput</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> prompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.template.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fill</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      lang: input.options?.lang </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;en&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      diff: input.diff,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 使用生成的 prompt 调用 AI API</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> response</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">callAI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(prompt)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      ok: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      data: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        title: response.title,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        body: response.body,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="最佳实践" tabindex="-1">最佳实践 <a class="header-anchor" href="#最佳实践" aria-label="Permalink to &quot;最佳实践&quot;">​</a></h2><ol><li><p><strong>模板组织</strong></p><ul><li>为你的提供商创建独立的模板目录</li><li>使用有意义的模板名称</li><li>将模板文件与代码一起版本控制</li></ul></li><li><p><strong>性能优化</strong></p><ul><li><code>PromptTemplate</code> 类内部已实现模板缓存</li><li>在提供商类中将 template 实例声明为私有成员变量</li><li>避免重复创建 template 实例</li></ul></li><li><p><strong>错误处理</strong></p><ul><li>确保模板文件存在</li><li>处理模板语法错误</li><li>提供有意义的错误信息</li></ul></li><li><p><strong>多语言支持</strong></p><ul><li>使用 <code>lang</code> 参数控制输出语言</li><li>在模板中使用条件语句处理不同语言</li></ul></li></ol><h2 id="示例模板" tabindex="-1">示例模板 <a class="header-anchor" href="#示例模板" aria-label="Permalink to &quot;示例模板&quot;">​</a></h2><div class="language-handlebars vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">handlebars</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">{{! your-provider/custom.hbs }}</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{{</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">#if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">eq</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> lang</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;zh&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  请根据以下 Git 差异生成一个符合约定式提交规范的提交信息： 差异内容：</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  {{</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">diff</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">}}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  要求： 1. 使用中文 2. 简洁明了 3. 符合约定式提交规范</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{{</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">}}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  Please generate a conventional commit message based on the following Git diff: Diff content:</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  {{</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">diff</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">}}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  Requirements: 1. Use English 2. Be concise 3. Follow conventional commit format</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">{{</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/if</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">}}</span></span></code></pre></div><h2 id="调试建议" tabindex="-1">调试建议 <a class="header-anchor" href="#调试建议" aria-label="Permalink to &quot;调试建议&quot;">​</a></h2><ol><li>使用日志记录生成的 prompt</li><li>在开发环境保存生成的 prompt 用于调试</li><li>使用版本控制跟踪模板变更</li></ol><h2 id="注意事项" tabindex="-1">注意事项 <a class="header-anchor" href="#注意事项" aria-label="Permalink to &quot;注意事项&quot;">​</a></h2><ol><li>模板路径区分大小写</li><li>确保模板文件使用 UTF-8 编码</li><li>避免在模板中包含敏感信息</li><li>定期检查和更新模板以改进生成质量</li></ol>`,19)]))}const E=i(t,[["render",p]]);export{g as __pageData,E as default};
