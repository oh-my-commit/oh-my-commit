#!/usr/bin/env python3
"""
Watch Conversations - A file system watcher to automatically update meta.toml
when changes occur in the conversations directory
"""

import sys
import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import tomli
import tomli_w

# Constants
ESSENCE_DIR = Path(__file__).parent.parent
META_FILE = ESSENCE_DIR / 'meta.toml'
CONVERSATIONS_DIR = ESSENCE_DIR / 'conversations'

class ConversationHandler(FileSystemEventHandler):
    def __init__(self):
        self.last_updated = 0
        self.cooldown = 1  # Cooldown period in seconds to prevent multiple rapid updates

    def on_any_event(self, event):
        # Skip directory events and temporary files
        if event.is_directory or event.src_path.endswith('.tmp'):
            return

        # Skip if not enough time has passed since last update
        current_time = time.time()
        if current_time - self.last_updated < self.cooldown:
            return

        # Only process conversation.toml files
        if Path(event.src_path).name == 'conversation.toml':
            self.last_updated = current_time
            self.update_meta()

    def update_meta(self):
        """Update meta.toml with current conversation information"""
        try:
            # Load existing meta.toml
            with open(META_FILE, 'rb') as f:
                meta = tomli.load(f)

            # Scan conversations directory
            conversations = {}
            for conv_dir in sorted(CONVERSATIONS_DIR.iterdir()):
                if not conv_dir.is_dir():
                    continue

                conv_file = conv_dir / 'conversation.toml'
                if not conv_file.exists():
                    continue

                try:
                    with open(conv_file, 'rb') as f:
                        conv_data = tomli.load(f)
                    
                    # Extract conversation number from directory name
                    conv_num = conv_dir.name.split('_')[0]
                    
                    # Update conversations data
                    conversations[conv_num] = {
                        'slug': conv_dir.name.split('_', 1)[1],
                        'title': conv_data.get('title', ''),
                        'abstract': conv_data.get('abstract', '')
                    }
                except Exception as e:
                    print(f"Error processing {conv_file}: {e}", file=sys.stderr)

            # Update meta.toml with new conversations data
            meta['conversations'] = conversations

            # Save updated meta.toml
            with open(META_FILE, 'wb') as f:
                tomli_w.dump(meta, f)

            print(f"Updated {META_FILE} at {time.strftime('%Y-%m-%d %H:%M:%S')}")

        except Exception as e:
            print(f"Error updating meta.toml: {e}", file=sys.stderr)

def main():
    event_handler = ConversationHandler()
    observer = Observer()
    observer.schedule(event_handler, str(CONVERSATIONS_DIR), recursive=True)
    observer.start()

    print(f"Started watching {CONVERSATIONS_DIR}")
    print("Press Ctrl+C to stop...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\nStopping watcher...")

    observer.join()

if __name__ == '__main__':
    main()
