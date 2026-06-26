from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

from PIL import Image

CELL_SIZE = 160
COLS = 6
ROWS = 2
CANVAS_SIZE = (CELL_SIZE * COLS, CELL_SIZE * ROWS)
SAFE_MARGIN = 12
BASELINE_Y = CELL_SIZE - SAFE_MARGIN - 8
CONTENT_MAX_W = CELL_SIZE - SAFE_MARGIN * 3
CONTENT_MAX_H = CELL_SIZE - SAFE_MARGIN * 3

WALK_FRAMES = [
    {"dx": -3, "dy": 0, "rot": -2.0, "sx": 1.00, "sy": 1.00},
    {"dx": -1, "dy": -2, "rot": -1.0, "sx": 1.01, "sy": 0.99},
    {"dx": 1, "dy": -1, "rot": 0.4, "sx": 1.00, "sy": 1.00},
    {"dx": 3, "dy": 0, "rot": 2.0, "sx": 1.00, "sy": 1.00},
    {"dx": 1, "dy": -2, "rot": 1.0, "sx": 1.01, "sy": 0.99},
    {"dx": -1, "dy": -1, "rot": -0.4, "sx": 1.00, "sy": 1.00},
]

LIFT_FRAMES = [
    {"dx": 0, "dy": 0, "rot": 0.0, "sx": 1.00, "sy": 1.00},
    {"dx": 0, "dy": 4, "rot": 0.0, "sx": 1.03, "sy": 0.97},
    {"dx": 0, "dy": -8, "rot": -0.8, "sx": 1.01, "sy": 0.99},
    {"dx": 0, "dy": -18, "rot": -1.3, "sx": 1.00, "sy": 1.00},
    {"dx": -1, "dy": -20, "rot": -0.8, "sx": 1.00, "sy": 1.00},
    {"dx": 1, "dy": -18, "rot": -0.2, "sx": 1.00, "sy": 1.00},
]


def stable_seed(name: str) -> int:
    digest = hashlib.sha1(name.encode("utf-8")).digest()
    return int.from_bytes(digest[:4], "big")


def alpha_crop(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return image.copy()
    return image.crop(bbox)


def fit_size(width: int, height: int) -> tuple[int, int]:
    scale = min(CONTENT_MAX_W / max(1, width), CONTENT_MAX_H / max(1, height))
    return max(1, int(round(width * scale))), max(1, int(round(height * scale)))


def transform_sprite(sprite: Image.Image, frame: dict[str, float], seed: int) -> Image.Image:
    seed_sway = ((seed % 7) - 3) * 0.18
    width = max(1, int(round(sprite.width * frame["sx"])))
    height = max(1, int(round(sprite.height * frame["sy"])))
    transformed = sprite.resize((width, height), Image.Resampling.LANCZOS)
    return transformed.rotate(frame["rot"] + seed_sway, resample=Image.Resampling.BICUBIC, expand=True)


def place_in_cell(sprite: Image.Image, frame: dict[str, float], seed: int) -> Image.Image:
    cell = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
    transformed = transform_sprite(sprite, frame, seed)

    x = int(round((CELL_SIZE - transformed.width) / 2 + frame["dx"]))
    y = int(round(BASELINE_Y - transformed.height + frame["dy"]))

    x = min(CELL_SIZE - SAFE_MARGIN - transformed.width, max(SAFE_MARGIN, x))
    y = min(CELL_SIZE - SAFE_MARGIN - transformed.height, max(SAFE_MARGIN, y))

    cell.alpha_composite(transformed, (x, y))
    return cell


def build_sheet(source_path: Path, output_path: Path) -> None:
    seed = stable_seed(source_path.stem)
    source = Image.open(source_path).convert("RGBA")
    cropped = alpha_crop(source)
    target_size = fit_size(cropped.width, cropped.height)
    base_sprite = cropped.resize(target_size, Image.Resampling.LANCZOS)

    atlas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))

    for col, frame in enumerate(WALK_FRAMES):
        atlas.alpha_composite(place_in_cell(base_sprite, frame, seed), (col * CELL_SIZE, 0))

    for col, frame in enumerate(LIFT_FRAMES):
        atlas.alpha_composite(place_in_cell(base_sprite, frame, seed + 17), (col * CELL_SIZE, CELL_SIZE))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(output_path, "PNG")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate calm 6x2 spritesheets for every animal PNG.")
    parser.add_argument("--source-dir", default="public/assets/animals", help="Folder containing base animal PNGs.")
    parser.add_argument("--output-dir", default="public/assets/animals/animated", help="Folder to write animated PNG atlases into.")
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    output_dir = Path(args.output_dir)

    source_files = sorted(
        path for path in source_dir.glob("*.png") if path.is_file() and path.parent == source_dir
    )

    for source_path in source_files:
        build_sheet(source_path, output_dir / source_path.name)

    print(f"generated={len(source_files)} output_dir={output_dir.resolve()}")


if __name__ == "__main__":
    main()
