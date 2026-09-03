"""Generate the responsive WebP assets used by the public landing page.

Run from the repository root after installing Pillow:
    python -m pip install Pillow
    python scripts/optimize_images.py
"""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]


def write_variants(source: str, widths: tuple[int, ...], quality: int = 85) -> None:
    source_path = ROOT / source

    with Image.open(source_path) as opened:
        image = ImageOps.exif_transpose(opened)
        stem = source_path.with_suffix("")

        for width in widths:
            if width > image.width:
                continue

            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            output = stem.with_name(f"{stem.name}-{width}").with_suffix(".webp")
            output.parent.mkdir(parents=True, exist_ok=True)
            resized.save(
                output,
                "WEBP",
                quality=quality,
                method=6,
                optimize=True,
                exact="A" in resized.getbands(),
            )
            print(f"{output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")


def main() -> None:
    write_variants("assets/logo.png", (32, 64), quality=90)
    write_variants("assets/hero-hole-sg.jpg", (480, 800, 1200), quality=84)

    screenshots = (
        "screen-dispersion.png",
        "screen-gap.png",
        "screen-putt.png",
        "screen-ai-chat-1.png",
        "screen-ai-chat-2.png",
    )
    for language in ("es", "en"):
        for filename in screenshots:
            write_variants(f"assets/screens/{language}/{filename}", (360, 800), quality=86)

    for name in ("carlos", "sarah"):
        write_variants(f"assets/testimonial-{name}.jpg", (52, 104), quality=84)


if __name__ == "__main__":
    main()
