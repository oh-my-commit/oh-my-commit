# 团队协作

::: warning 即将推出
团队协作功能目前正在开发中，预计将在 2024 年 Q2 推出。您可以在[即将推出](/guide/coming-soon)页面了解更多信息。
:::

Oh My Commit 计划提供强大的团队协作功能，帮助团队统一提交风格，提高协作效率。以下是即将推出的功能预览。

## 团队配置

### 配置共享

团队可以通过配置文件共享统一的设置：

```json
{
  "omc.team": {
    "configPath": ".oh-my-commit/team.json",
    "syncEnabled": true,
    "syncInterval": 3600
  }
}
```

### 提交规范

统一团队的提交消息格式：

```json
{
  "omc.team.commit": {
    "convention": "conventional",
    "scopes": [
      "feat",
      "fix",
      "docs",
      "style",
      "refactor",
      "perf",
      "test",
      "build",
      "ci",
      "chore"
    ],
    "template": "<type>(<scope>): <subject>",
    "subjectLimit": 72,
    "bodyLimit": 500
  }
}
```

### 审查规则

配置代码审查的规则：

```json
{
  "omc.team.review": {
    "required": true,
    "minReviewers": 2,
    "assignRules": [
      {
        "path": "src/frontend/**",
        "reviewers": ["@frontend-team"]
      },
      {
        "path": "src/backend/**",
        "reviewers": ["@backend-team"]
      }
    ]
  }
}
```

## 工作流集成

### Git 工作流

支持常见的 Git 工作流：

1. **GitHub Flow**

   ```json
   {
     "omc.team.workflow": {
       "type": "github-flow",
       "branchPrefix": "feature/",
       "autoMergePatch": true
     }
   }
   ```

2. **GitLab Flow**

   ```json
   {
     "omc.team.workflow": {
       "type": "gitlab-flow",
       "environments": ["dev", "staging", "prod"],
       "autoDeployToDev": true
     }
   }
   ```

3. **Trunk Based**
   ```json
   {
     "omc.team.workflow": {
       "type": "trunk-based",
       "trunk": "main",
       "shortLivedBranches": true
     }
   }
   ```

### CI/CD 集成

与常见的 CI/CD 工具集成：

```json
{
  "omc.team.ci": {
    "provider": "github-actions",
    "validateCommits": true,
    "autoFix": true,
    "notifications": {
      "slack": "#commits",
      "discord": "commits-channel"
    }
  }
}
```

## 团队活动

### 活动面板

实时显示团队成员的提交活动：

```json
{
  "omc.team.activity": {
    "enabled": true,
    "showInPanel": true,
    "filters": {
      "authors": ["@team"],
      "branches": ["main", "develop"],
      "since": "1d"
    }
  }
}
```

### 统计报告

生成团队提交统计报告：

```json
{
  "omc.team.stats": {
    "enabled": true,
    "schedule": "weekly",
    "metrics": ["commits", "lines", "files", "authors"],
    "export": {
      "format": "html",
      "destination": "reports/"
    }
  }
}
```

## 最佳实践

### 1. 团队规范

```json
{
  "omc.team": {
    "enforceConvention": true,
    "requireTests": true,
    "requireReview": true,
    "autoAssignReviewers": true
  }
}
```

### 2. 代码审查

```json
{
  "omc.team.review": {
    "checkCoverage": true,
    "checkPerformance": true,
    "checkSecurity": true,
    "aiAssist": true
  }
}
```

### 3. 自动化

```json
{
  "omc.team.automation": {
    "formatCode": true,
    "updateChangelog": true,
    "createRelease": true,
    "notifyTeam": true
  }
}
```

::: tip 提示
团队协作功能将大大提升团队的工作效率，敬请期待！
:::

::: warning 注意
在功能正式发布前，您可以通过自定义配置和 Git Hooks 实现类似的团队协作功能。
:::
