# VSCode 调试最佳实践

## 调试工具栏优化

在使用 VSCode 进行调试时，默认的调试工具栏可能会影响开发体验。以下是推荐的工具栏设置方案：

### 方案一：调整工具栏位置（推荐）

1. 打开 VSCode 设置（`Cmd+,` 或点击左下角齿轮图标）
2. 搜索 "debug toolbar"
3. 找到 "Debug > Toolbars: Location" 设置
4. 将其修改为 "docked"（推荐）或 "floating"

这样可以让调试工具栏更加紧凑，减少对编辑区域的干扰。

### 方案二：隐藏工具栏

如果确实不需要调试工具栏，可以：

1. 打开 VSCode 设置
2. 搜索 "debug toolbar visibility"
3. 将 "Debug > Toolbars: Visibility" 设置为 "hidden"

注意：不建议完全隐藏工具栏，因为调试控制按钮（如继续、暂停、步进等）在调试过程中非常有用。

## 相关资源

- [VSCode Debugging Documentation](https://code.visualstudio.com/docs/editor/debugging)
- [VSCode Debug Actions](https://code.visualstudio.com/docs/editor/debugging#_debug-actions)
