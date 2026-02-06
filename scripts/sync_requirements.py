#!/usr/bin/env python3
from pathlib import Path

def main() -> int:
    root = Path(__file__).resolve().parents[1]
    src = root / "requirements.txt"
    dest = root / "api" / "requirements.txt"

    if not src.exists():
        print("Missing requirements.txt at repo root.")
        return 1

    content = src.read_text(encoding="utf-8")
    if not content.endswith("\n"):
        content += "\n"

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content, encoding="utf-8")
    print(f"Synced {src} -> {dest}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
