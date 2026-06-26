from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image

CELL_SIZE = 160
COLS = 6
ROWS = 2
EXPECTED_SIZE = (CELL_SIZE * COLS, CELL_SIZE * ROWS)
SAFE_MARGIN = 10


def validate_sheet(sheet_path: Path) -> list[str]:
    errors: list[str] = []
    image = Image.open(sheet_path).convert("RGBA")

    if image.size != EXPECTED_SIZE:
        errors.append(f"{sheet_path.name}: expected {EXPECTED_SIZE[0]}x{EXPECTED_SIZE[1]}, got {image.width}x{image.height}")
        return errors

    alpha = image.getchannel("A")
    for row in range(ROWS):
        for col in range(COLS):
            left = col * CELL_SIZE
            top = row * CELL_SIZE
            cell = alpha.crop((left, top, left + CELL_SIZE, top + CELL_SIZE))
            bbox = cell.getbbox()
            if bbox is None:
                errors.append(f"{sheet_path.name}: cell ({row},{col}) is empty")
                continue

            min_x, min_y, max_x, max_y = bbox
            if min_x < SAFE_MARGIN or min_y < SAFE_MARGIN:
                errors.append(f"{sheet_path.name}: cell ({row},{col}) crosses top/left safe margin")
            if max_x > CELL_SIZE - SAFE_MARGIN or max_y > CELL_SIZE - SAFE_MARGIN:
                errors.append(f"{sheet_path.name}: cell ({row},{col}) crosses bottom/right safe margin")

    return errors


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate calm animal spritesheets.")
    parser.add_argument("--source-dir", default="public/assets/animals", help="Folder containing base animal PNGs.")
    parser.add_argument("--animated-dir", default="public/assets/animals/animated", help="Folder containing generated spritesheets.")
    parser.add_argument("--json-out", default="", help="Optional JSON report path.")
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    animated_dir = Path(args.animated_dir)

    source_files = sorted(path.name for path in source_dir.glob("*.png") if path.is_file() and path.parent == source_dir)
    errors: list[str] = []

    for name in source_files:
        sheet_path = animated_dir / name
        if not sheet_path.exists():
            errors.append(f"{name}: missing animated sheet")
            continue
        errors.extend(validate_sheet(sheet_path))

    report = {
        "expected_count": len(source_files),
        "validated_count": len(source_files) - len([e for e in errors if "missing animated sheet" in e]),
        "errors": errors,
    }

    if args.json_out:
        out_path = Path(args.json_out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    if errors:
        raise SystemExit("\n".join(errors))

    print(f"validated={len(source_files)} animated_dir={animated_dir.resolve()}")


if __name__ == "__main__":
    main()
