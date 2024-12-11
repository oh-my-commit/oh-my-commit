import os

def get_folder_creation_time(folder_path):
    return os.path.getctime(folder_path)

def convert_chinese_name(name):
    # 中文名称到英文的映射
    chinese_to_english = {
        'VSCode插件开发调试问题解决': 'vscode_plugin_debug_solution'
    }
    
    # 检查是否包含中文字符
    if any('\u4e00' <= char <= '\u9fff' for char in name):
        # 在映射表中查找对应的英文名称
        for cn, en in chinese_to_english.items():
            if cn in name:
                return name.replace(cn, en)
    return name

def main():
    base_dir = '/Users/mark/coding/apps/YAAC-YourArtisticAide4Commits/__essence__/conversations'
    folders = []
    
    # 收集所有文件夹信息
    for item in os.listdir(base_dir):
        full_path = os.path.join(base_dir, item)
        if os.path.isdir(full_path) and not item.startswith('.'):
            creation_time = get_folder_creation_time(full_path)
            name_without_prefix = item.split('_', 1)[1] if '_' in item else item
            # 转换中文名称
            name_without_prefix = convert_chinese_name(name_without_prefix)
            folders.append((creation_time, name_without_prefix, item))

    # 按创建时间排序
    folders.sort(key=lambda x: x[0])

    # 重命名文件夹
    for index, (_, suffix, old_name) in enumerate(folders, 1):
        new_name = f"{index:03d}_{suffix}"
        new_name = convert_chinese_name(new_name)  # 确保新名称也经过转换
        old_path = os.path.join(base_dir, old_name)
        new_path = os.path.join(base_dir, new_name)
        
        if old_name != new_name:
            print(f"Renaming: {old_name} -> {new_name}")
            os.rename(old_path, new_path)

if __name__ == "__main__":
    main()
