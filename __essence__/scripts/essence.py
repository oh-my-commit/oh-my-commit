#!/usr/bin/env python3
"""
Essence - Main control script for managing the __essence__ directory
"""

import os
import sys
import shutil
import argparse
from pathlib import Path
from datetime import datetime
import tomli
import tomli_w

# Constants
ESSENCE_DIR = Path(__file__).parent.parent
META_FILE = ESSENCE_DIR / 'meta.toml'
CONVERSATIONS_DIR = ESSENCE_DIR / 'conversations'

class EssenceManager:
    def __init__(self):
        self.ensure_directories()
        self.load_meta()

    def ensure_directories(self):
        """Ensure all required directories exist."""
        ESSENCE_DIR.mkdir(exist_ok=True)
        CONVERSATIONS_DIR.mkdir(exist_ok=True)

    def load_meta(self):
        """Load meta.toml file."""
        if META_FILE.exists():
            with open(META_FILE, 'rb') as f:
                self.meta = tomli.load(f)
        else:
            self.meta = {
                'version': '2.0.0',
                'abstract': '',
                'docs': {
                    'readme': '__essence__/README.md',
                    'changelog': '__essence__/CHANGELOG.md'
                },
                'conversations': {}
            }
            self.save_meta()

    def save_meta(self):
        """Save meta.toml file."""
        with open(META_FILE, 'wb') as f:
            tomli_w.dump(self.meta, f)

    def update_meta(self):
        """Update meta.toml with latest conversation information."""
        # Import update_meta script dynamically
        sys.path.append(str(ESSENCE_DIR / 'scripts'))
        import update_meta
        update_meta.update_meta_toml()
        print("Meta information updated successfully")

    def has_conversation_file(self, conv_dir: Path) -> bool:
        """Check if directory has a valid conversation file."""
        return (conv_dir / 'conversation.toml').exists() or (conv_dir / 'conversation.json').exists()

    def cleanup_invalid_conversations(self):
        """Remove conversation directories without conversation files."""
        removed = []
        for conv_dir in CONVERSATIONS_DIR.iterdir():
            if conv_dir.is_dir() and not self.has_conversation_file(conv_dir):
                shutil.rmtree(conv_dir)
                removed.append(conv_dir.name)
        
        if removed:
            print(f"\nRemoved {len(removed)} invalid conversation directories:")
            for name in removed:
                print(f"- {name}")
            return True
        return False

    def reorder_conversations(self):
        """Reorder conversation directories to ensure sequential numbering."""
        # Get all valid conversation directories
        valid_dirs = []
        for conv_dir in sorted(CONVERSATIONS_DIR.iterdir()):
            if conv_dir.is_dir() and self.has_conversation_file(conv_dir):
                try:
                    num = int(conv_dir.name.split('_')[0])
                    slug = conv_dir.name.split('_', 1)[1]
                    valid_dirs.append((num, slug, conv_dir))
                except (ValueError, IndexError):
                    print(f"Warning: Invalid directory name format: {conv_dir.name}")
                    continue

        # Sort by original number
        valid_dirs.sort()

        # Rename directories to temporary names first to avoid conflicts
        temp_renames = []
        for i, (_, slug, dir_path) in enumerate(valid_dirs, 1):
            temp_name = f"temp_{i:03d}_{slug}"
            temp_path = dir_path.parent / temp_name
            dir_path.rename(temp_path)
            temp_renames.append((temp_path, f"{i:03d}_{slug}"))

        # Rename to final names
        renames = []
        for temp_path, final_name in temp_renames:
            final_path = temp_path.parent / final_name
            temp_path.rename(final_path)
            renames.append((temp_path.name.split('_', 1)[1], final_name))

        if renames:
            print("\nReordered conversation directories:")
            for old_name, new_name in renames:
                print(f"- {old_name} -> {new_name}")
            return True
        return False

    def cleanup_and_reorder(self):
        """Clean up invalid conversations and reorder the remaining ones."""
        cleaned = self.cleanup_invalid_conversations()
        reordered = self.reorder_conversations()
        
        if cleaned or reordered:
            self.update_meta()
        else:
            print("\nNo changes needed - all conversations are valid and properly ordered")

    def create_conversation(self, title):
        """Create a new conversation directory and files."""
        # Get next conversation number
        existing_numbers = [int(n) for n in self.meta.get('conversations', {}).keys()]
        next_num = max(existing_numbers, default=0) + 1
        
        # Create slug from title
        slug = title.lower().replace(' ', '_')
        dir_name = f"{next_num:03d}_{slug}"
        
        # Create conversation directory
        conv_dir = CONVERSATIONS_DIR / dir_name
        conv_dir.mkdir(exist_ok=True)
        
        # Create conversation.toml
        conv_file = conv_dir / 'conversation.toml'
        conv_data = {
            'version': '2.0.0',
            'title': title,
            'created_at': datetime.now().strftime('%Y-%m-%dT%H:%M:%S%z'),
            'status': 'active',
            'rounds': []
        }
        
        with open(conv_file, 'wb') as f:
            tomli_w.dump(conv_data, f)
        
        print(f"Created new conversation: {dir_name}")
        self.update_meta()

    def list_conversations(self):
        """List all conversations with their details."""
        print("\nConversations:")
        print("-" * 60)
        for num, data in sorted(self.meta.get('conversations', {}).items()):
            print(f"{num}: {data['slug']}")
            if data['abstract']:
                print(f"    {data['abstract']}")
        print("-" * 60)

    def verify_structure(self):
        """Verify the integrity of the __essence__ directory structure."""
        issues = []
        
        # Check required directories
        if not ESSENCE_DIR.exists():
            issues.append("__essence__ directory missing")
        if not CONVERSATIONS_DIR.exists():
            issues.append("conversations directory missing")
            
        # Check meta.toml
        if not META_FILE.exists():
            issues.append("meta.toml missing")
        
        # Check conversation directories
        for conv_dir in CONVERSATIONS_DIR.iterdir():
            if conv_dir.is_dir():
                # Check naming format
                if not conv_dir.name.split('_')[0].isdigit():
                    issues.append(f"Invalid conversation directory name: {conv_dir.name}")
                
                # Check conversation file
                if not self.has_conversation_file(conv_dir):
                    issues.append(f"Missing conversation file in: {conv_dir.name}")
        
        if issues:
            print("\nStructure Issues Found:")
            for issue in issues:
                print(f"- {issue}")
        else:
            print("\nStructure verification passed ")

def main():
    parser = argparse.ArgumentParser(description='Essence - Manage __essence__ directory')
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # update-meta command
    subparsers.add_parser('update-meta', help='Update meta.toml with latest conversation information')
    
    # create command
    create_parser = subparsers.add_parser('create', help='Create a new conversation')
    create_parser.add_argument('title', help='Title of the conversation')
    
    # list command
    subparsers.add_parser('list', help='List all conversations')
    
    # verify command
    subparsers.add_parser('verify', help='Verify __essence__ directory structure')
    
    # cleanup command
    subparsers.add_parser('cleanup', help='Clean up invalid conversations and reorder directories')
    
    args = parser.parse_args()
    
    manager = EssenceManager()
    
    if args.command == 'update-meta':
        manager.update_meta()
    elif args.command == 'create':
        manager.create_conversation(args.title)
    elif args.command == 'list':
        manager.list_conversations()
    elif args.command == 'verify':
        manager.verify_structure()
    elif args.command == 'cleanup':
        manager.cleanup_and_reorder()
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
