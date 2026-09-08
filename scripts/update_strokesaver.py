"""Update strokesaver asset with Option 3 (Digital 3D GIS Landscape Render)."""

from pathlib import Path
from PIL import Image, ImageOps

SOURCE_IMAGE = Path(r"C:\Users\Pit\.gemini\antigravity\brain\f3e34cdc-f247-4556-9bd7-43ddf6d825e4\golfer_sg_clean_1788890112729.jpg")
TARGET_DIR = Path(__file__).resolve().parents[1] / "assets" / "editorial"

def main():
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    with Image.open(SOURCE_IMAGE) as img:
        img = ImageOps.exif_transpose(img)
        print(f"Loaded source image: {img.size}")

        # Save main JPG fallback
        jpg_out = TARGET_DIR / "strokesaver-22c.jpg"
        img.save(jpg_out, "JPEG", quality=92, optimize=True)
        print(f"Saved {jpg_out.name}: {jpg_out.stat().st_size:,} bytes")

        # Save desktop WebP (1376 width)
        desktop_w = 1376
        desktop_h = round(img.height * desktop_w / img.width)
        desktop_img = img.resize((desktop_w, desktop_h), Image.Resampling.LANCZOS)
        webp_out = TARGET_DIR / "strokesaver-22c.webp"
        desktop_img.save(webp_out, "WEBP", quality=90, method=6, optimize=True)
        print(f"Saved {webp_out.name}: {webp_out.stat().st_size:,} bytes")

        # Save mobile WebP (800 width)
        mobile_w = 800
        mobile_h = round(img.height * mobile_w / img.width)
        mobile_img = img.resize((mobile_w, mobile_h), Image.Resampling.LANCZOS)
        mobile_webp_out = TARGET_DIR / "strokesaver-22c-800.webp"
        mobile_img.save(mobile_webp_out, "WEBP", quality=88, method=6, optimize=True)
        print(f"Saved {mobile_webp_out.name}: {mobile_webp_out.stat().st_size:,} bytes")

if __name__ == "__main__":
    main()
