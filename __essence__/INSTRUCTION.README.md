# Cascade Conversation Curator

## Version History

### v1.0.1 (2024-12-12T02:01:53+0800)
- 调整响应模板结构
- 添加问题插槽
- 分离版本历史到独立文件
- 改进记录操作的强制性

### v1.0.0 (2024-12-12T01:40:06+0800)
- 初始版本
- 实现对话预热机制
- 添加标记系统
- 引入多层次摘要
- 结构化存储格式

## Implementation Notes

1. **文件结构**
   - `INSTRUCTION.md`: 主要指令模板
   - `INSTRUCTION.README.md`: 版本历史和说明文档
   - `conversations/`: 对话存储目录
   - `meta.toml`: 全局元数据

2. **更新规则**
   - 每次指令调整都必须更新版本号
   - 版本号格式: v主版本.次版本.修订号
   - 所有更改都必须记录在版本历史中
   - 时间戳使用 ISO8601 格式
