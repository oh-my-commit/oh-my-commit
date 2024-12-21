#!/bin/bash

# 查找并删除指定目录
find . -type d \( -name "node_modules" -o -name "dist" -o -name ".turbo" \) -print -prune

echo "以上是将要删除的目录，确认要删除吗？按 Ctrl+C 取消，或按回车继续"
read

# 执行删除
find . -type d \( -name "node_modules" -o -name "dist" -o -name ".turbo" \) -exec rm -rf {} + ; -prune

echo "清理完成！"
