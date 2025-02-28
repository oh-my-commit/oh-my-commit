# 文件变更视图

Oh My Commit 提供了简洁而直观的文件变更视图功能，帮助你更好地了解代码变更。

## 核心功能

### 自动暂存

- 自动检测并暂存（git add）所有变更文件
- 实时显示暂存状态
- 支持查看具体变更内容

### 视图模式

#### 树状视图 (Tree View)

树状视图按照文件的目录结构组织显示：

- 清晰展示文件夹结构
- 可折叠/展开文件夹
- 显示每个文件夹下的文件数量

#### 平铺视图 (Flat View)

平铺视图将所有变更文件平铺展示：

- 简洁的列表形式
- 显示完整文件路径

### 文件预览

点击文件可以快速预览变更内容：

- 展示文件的具体修改
- 支持代码语法高亮
- 清晰显示增删行

## 未来规划

我们计划在后续版本中添加更多高级功能：

### 1.0 后续版本

- [ ] 文件搜索功能

  - 支持文件名和路径搜索
  - 实时搜索结果高亮
  - 显示匹配数量

- [ ] 文件选择功能
  - 支持选择特定文件进行提交
  - 与 Git 暂存区状态同步
  - 基于选择文件重新生成提交信息

### 2.0 规划

- [ ] 文件分组功能

  - 按文件类型分组
  - 按变更类型分组（新增/修改/删除）
  - 自定义分组规则

- [ ] 变更统计

  - 文件变更统计视图
  - 代码行数变更统计
  - 变更趋势分析

- [ ] 高级自定义
  - 自定义视图布局
  - 自定义文件排序规则
  - 视图主题定制
