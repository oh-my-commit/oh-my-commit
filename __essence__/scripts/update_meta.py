#!/usr/bin/env python3
import os
import tomli
import tomli_w
from pathlib import Path
from typing import Dict, Any

def read_toml(file_path: Path) -> Dict[Any, Any]:
    """Read and parse a TOML file."""
    try:
        with open(file_path, 'rb') as f:
            return tomli.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return {}

def read_json(file_path: Path) -> Dict[Any, Any]:
    """Read and parse a JSON file."""
    try:
        import json
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return {}

def write_toml(file_path: Path, data: Dict[Any, Any]) -> None:
    """Write data to a TOML file."""
    try:
        with open(file_path, 'wb') as f:
            tomli_w.dump(data, f)
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")

def format_value(v: Any) -> str:
    """Format a value for TOML output."""
    if isinstance(v, (int, float)):
        return str(v)
    elif isinstance(v, bool):
        return str(v).lower()
    else:
        return f'"{v}"'

def extract_conversation_meta() -> Dict[str, Dict[str, Any]]:
    """Extract metadata from all conversation directories."""
    essence_dir = Path(__file__).parent.parent
    conversations_dir = essence_dir / 'conversations'
    meta_info = {}

    if not conversations_dir.exists():
        print(f"Conversations directory not found: {conversations_dir}")
        return meta_info

    # Iterate through all conversation directories
    for conv_dir in sorted(conversations_dir.iterdir()):
        if not conv_dir.is_dir():
            continue

        # Parse directory name (format: "{number}_{slug}")
        try:
            number, slug = conv_dir.name.split('_', 1)
        except ValueError:
            print(f"Invalid directory format: {conv_dir.name}")
            continue

        # Try reading both TOML and JSON files
        conv_data = {}
        toml_file = conv_dir / 'conversation.toml'
        json_file = conv_dir / 'conversation.json'

        if toml_file.exists():
            conv_data = read_toml(toml_file)
        elif json_file.exists():
            conv_data = read_json(json_file)
        else:
            continue

        if not conv_data:
            continue

        # Extract all available metadata
        meta_entry = {'slug': slug}
        
        # Copy all relevant fields from conversation file
        for field in ['title', 'abstract', 'status']:
            if field in conv_data:
                meta_entry[field] = conv_data[field]

        # Use title as abstract if abstract is not present
        if 'abstract' not in meta_entry and 'title' in meta_entry:
            meta_entry['abstract'] = meta_entry['title']

        meta_info[number] = meta_entry

    return meta_info

def update_meta_toml():
    """Update meta.toml with conversation metadata while preserving other fields."""
    essence_dir = Path(__file__).parent.parent
    meta_path = essence_dir / 'meta.toml'

    # Read existing meta.toml
    meta_data = read_toml(meta_path)
    if not meta_data:
        print("Failed to read meta.toml")
        return

    # Extract conversation metadata
    conversations = extract_conversation_meta()

    # Update only the conversations section while preserving all other fields
    meta_data['conversations'] = conversations

    # Write updated meta.toml with custom formatting
    with open(meta_path, 'w', encoding='utf-8') as f:
        # Write non-conversation sections first
        for key, value in meta_data.items():
            if key != 'conversations':
                if isinstance(value, str):
                    f.write(f'{key} = "{value}"\n')
                else:
                    f.write(f'{key} = {value}\n')
        f.write('\n')
        
        # Write conversations with custom formatting
        for num, conv in sorted(conversations.items(), key=lambda x: int(x[0])):
            f.write(f'[conversations.{num}]\n')
            for field, value in conv.items():
                if field == 'status' and isinstance(value, dict):
                    # Write status as inline table
                    status_items = [f'{k} = {format_value(v)}' for k, v in value.items()]
                    status_str = ', '.join(status_items)
                    f.write(f'status = {{ {status_str} }}\n')
                else:
                    f.write(f'{field} = {format_value(value)}\n')
            f.write('\n')

    print(f"Successfully updated {meta_path} with {len(conversations)} conversations")

if __name__ == '__main__':
    update_meta_toml()
