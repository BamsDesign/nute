#!/usr/bin/env python3
"""Download every remote image referenced in content/*.json into assets/img/uploads/
and rewrite the JSON to point at the local copy. Run from the project root:
    python3 tools/localize-images.py
"""
import json, pathlib, urllib.request, hashlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/img/uploads"
OUT.mkdir(parents=True, exist_ok=True)

def walk(node):
    if isinstance(node, dict):
        return {k: walk(v) for k, v in node.items()}
    if isinstance(node, list):
        return [walk(v) for v in node]
    if isinstance(node, str) and node.startswith("http") and node.split("?")[0].lower().endswith((".png", ".jpg", ".jpeg", ".webp")):
        name = hashlib.sha1(node.encode()).hexdigest()[:12] + pathlib.Path(node.split("?")[0]).suffix
        dest = OUT / name
        if not dest.exists():
            print("↓", node)
            urllib.request.urlretrieve(node, dest)
        return f"assets/img/uploads/{name}"
    return node

for f in sorted((ROOT / "content").glob("*.json")):
    data = json.loads(f.read_text(encoding="utf-8"))
    new = walk(data)
    if new != data:
        f.write_text(json.dumps(new, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("✓", f.name)
