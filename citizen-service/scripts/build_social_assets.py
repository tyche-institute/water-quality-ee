#!/usr/bin/env python3
"""Generate static social-media assets for h2oatlas.ee.

Produces (under frontend/public/social/ and a few legacy paths):

  frontend/public/apple-touch-icon.png         180×180   iOS / Android home-screen
  frontend/public/og-default.png               1200×630  Open Graph fallback
  frontend/public/social/fb-avatar.png          400×400  Facebook Page profile picture
  frontend/public/social/fb-cover.png          1640×624  Facebook Page cover photo
  frontend/public/social/launch-image-en.png   1200×630  Launch announcement (English)
  frontend/public/social/launch-image-et.png   1200×630  Launch announcement (Estonian)
  frontend/public/social/launch-image-ru.png   1200×630  Launch announcement (Russian)

The cover photo and launch images use the real outline of Estonia from
frontend/public/data/estonia_counties_simplified.geojson.

Run once when branding changes. Outputs are committed to git.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLIC = REPO_ROOT / "frontend" / "public"
SOCIAL = PUBLIC / "social"
GEOJSON = PUBLIC / "data" / "estonia_counties_simplified.geojson"

BRAND_TOP = (15, 110, 253)      # #0f6efd
BRAND_BOTTOM = (23, 176, 255)   # #17b0ff
DEEP_BLUE = (7, 58, 122)
DROP_TOP = (223, 244, 255)
DROP_BOTTOM = (169, 221, 255)


# ---------- helpers ----------

def _vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size
    base = Image.new("RGB", size, top)
    px = base.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = (
            int(top[0] * (1 - t) + bottom[0] * t),
            int(top[1] * (1 - t) + bottom[1] * t),
            int(top[2] * (1 - t) + bottom[2] * t),
        )
        for x in range(w):
            px[x, y] = c
    return base


def _diagonal_gradient(size: tuple[int, int], a: tuple[int, int, int], b: tuple[int, int, int]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", size)
    px = img.load()
    diag = (w - 1) + (h - 1)
    for y in range(h):
        for x in range(w):
            t = (x + y) / diag
            px[x, y] = (
                int(a[0] * (1 - t) + b[0] * t),
                int(a[1] * (1 - t) + b[1] * t),
                int(a[2] * (1 - t) + b[2] * t),
            )
    return img


def _round_corners(img: Image.Image, radius: int) -> Image.Image:
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, img.size[0] - 1, img.size[1] - 1), radius=radius, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def _droplet_path(cx: float, cy: float, height: float) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    half_w = height * 0.45
    pts.append((cx, cy - height * 0.55))
    steps = 28
    for i in range(1, steps + 1):
        t = i / steps
        y = cy - height * 0.55 + (height * 0.6) * t
        x = cx + half_w * (t ** 0.65)
        pts.append((x, y))
    for i in range(1, steps + 1):
        ang = math.pi * (i / steps)
        x = cx + half_w * math.cos(ang)
        y = cy + 0.05 * height + half_w * math.sin(ang)
        pts.append((x, y))
    for i in range(1, steps + 1):
        t = 1 - i / steps
        y = cy - height * 0.55 + (height * 0.6) * t
        x = cx - half_w * (t ** 0.65)
        pts.append((x, y))
    return pts


def _draw_logo(img: Image.Image, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bg = _diagonal_gradient((w, h), BRAND_TOP, BRAND_BOTTOM)
    bg = _round_corners(bg, int(min(w, h) * 0.21))
    layer.alpha_composite(bg)

    cx = w * 0.5
    cy = h * 0.48
    drop_h = h * 0.78
    drop_pts = _droplet_path(cx, cy, drop_h)
    grad = _vertical_gradient((w, h), DROP_TOP, DROP_BOTTOM).convert("RGBA")
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).polygon(drop_pts, fill=255)
    layer.paste(grad, (0, 0), mask)

    inner_pts = _droplet_path(cx, cy + h * 0.02, drop_h * 0.62)
    highlight = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(highlight).polygon(inner_pts, fill=(255, 255, 255, 92))
    layer.alpha_composite(highlight)

    spark = ImageDraw.Draw(layer)
    spark_w = w * 0.78
    spark_x = (w - spark_w) / 2
    spark_y = h * 0.74
    pts = [
        (spark_x, spark_y + 8),
        (spark_x + spark_w * 0.18, spark_y + 8),
        (spark_x + spark_w * 0.30, spark_y - 8),
        (spark_x + spark_w * 0.46, spark_y + 14),
        (spark_x + spark_w * 0.62, spark_y + 4),
        (spark_x + spark_w * 0.92, spark_y + 8),
    ]
    spark.line(pts, fill=DEEP_BLUE, width=max(3, int(h * 0.04)), joint="curve")
    r = max(3, int(h * 0.045))
    spark.ellipse((pts[-1][0] - r, pts[-1][1] - r, pts[-1][0] + r, pts[-1][1] + r), fill=DEEP_BLUE)

    img.alpha_composite(layer.convert("RGBA"), (x0, y0))


def _font(weight: str, size: int) -> ImageFont.ImageFont:
    candidates = {
        "bold": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf",
        ],
        "regular": [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans.ttf",
        ],
    }
    for c in candidates[weight]:
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


# ---------- Estonia outline ----------

def _load_estonia_polys() -> list[list[tuple[float, float]]]:
    with open(GEOJSON, encoding="utf-8") as f:
        gj = json.load(f)
    polys: list[list[tuple[float, float]]] = []
    for feat in gj["features"]:
        geom = feat["geometry"]
        if geom["type"] == "Polygon":
            for ring in geom["coordinates"]:
                polys.append([(pt[0], pt[1]) for pt in ring])
                break  # outer ring only
        elif geom["type"] == "MultiPolygon":
            for sub in geom["coordinates"]:
                polys.append([(pt[0], pt[1]) for pt in sub[0]])
    return polys


def _project(polys: list[list[tuple[float, float]]], x0: int, y0: int, w: int, h: int) -> list[list[tuple[float, float]]]:
    """Project lon/lat to image pixels for a target box, with mid-latitude
    aspect correction so Estonia doesn't look squashed."""
    all_pts = [p for poly in polys for p in poly]
    min_lon = min(p[0] for p in all_pts)
    max_lon = max(p[0] for p in all_pts)
    min_lat = min(p[1] for p in all_pts)
    max_lat = max(p[1] for p in all_pts)
    aspect_corr = 1.0 / math.cos(math.radians((min_lat + max_lat) / 2))
    lon_range = (max_lon - min_lon) * aspect_corr
    lat_range = max_lat - min_lat
    src_aspect = lon_range / lat_range
    target_aspect = w / h
    if src_aspect > target_aspect:
        scale = w / lon_range
        offset_y = (h - lat_range * scale) / 2
        offset_x = 0
    else:
        scale = h / lat_range
        offset_x = (w - lon_range * scale) / 2
        offset_y = 0

    out = []
    for poly in polys:
        screen = []
        for lon, lat in poly:
            sx = x0 + offset_x + (lon - min_lon) * aspect_corr * scale
            sy = y0 + offset_y + (max_lat - lat) * scale
            screen.append((sx, sy))
        out.append(screen)
    return out


def _draw_estonia(layer: Image.Image, x0: int, y0: int, w: int, h: int,
                  fill: tuple[int, int, int, int], outline: tuple[int, int, int, int],
                  outline_width: int) -> None:
    polys = _load_estonia_polys()
    projected = _project(polys, x0, y0, w, h)
    fill_layer = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    fd = ImageDraw.Draw(fill_layer)
    for poly in projected:
        fd.polygon(poly, fill=fill)
    layer.alpha_composite(fill_layer)
    od = ImageDraw.Draw(layer)
    for poly in projected:
        od.line(poly + [poly[0]], fill=outline, width=outline_width)


# ---------- specific assets ----------

def build_apple_touch_icon(out: Path) -> None:
    size = 180
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    _draw_logo(img, (0, 0, size, size))
    img = img.filter(ImageFilter.SMOOTH)
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} B)")


def build_fb_avatar(out: Path) -> None:
    """Square Facebook profile picture — 400×400, just the brand glyph,
    no text (text doesn't read at the small avatar render size)."""
    size = 400
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    _draw_logo(img, (0, 0, size, size))
    img.save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} B)")


def build_fb_cover(out: Path) -> None:
    """Facebook Page cover photo — 1640×624 (FB-recommended retina).
    Hero composition: large gradient bg, Estonia silhouette mid-right,
    brand wordmark + multilingual subtitle on the left."""
    w, h = 1640, 624
    bg = _diagonal_gradient((w, h), BRAND_TOP, BRAND_BOTTOM).convert("RGBA")

    # Estonia silhouette behind text — semi-transparent fill, white outline
    _draw_estonia(
        bg,
        x0=int(w * 0.40), y0=int(h * 0.05),
        w=int(w * 0.55), h=int(h * 0.90),
        fill=(255, 255, 255, 38),
        outline=(255, 255, 255, 180),
        outline_width=3,
    )

    # Logo glyph (left)
    logo_size = 200
    pad_x, pad_y = 80, 70
    _draw_logo(bg, (pad_x, pad_y, pad_x + logo_size, pad_y + logo_size))

    # Wordmark + multilingual tagline
    d = ImageDraw.Draw(bg)
    title = "H2O Atlas"
    d.text((pad_x + logo_size + 50 + 3, pad_y + 30 + 3), title, font=_font("bold", 130), fill=(0, 0, 0, 80))
    d.text((pad_x + logo_size + 50, pad_y + 30), title, font=_font("bold", 130), fill=(255, 255, 255))

    sub_y = pad_y + 200
    d.text((pad_x, sub_y + 0), "Eesti veekvaliteedi kaart", font=_font("bold", 38), fill=(232, 246, 255))
    d.text((pad_x, sub_y + 60), "Карта качества воды Эстонии", font=_font("bold", 38), fill=(232, 246, 255))
    d.text((pad_x, sub_y + 120), "Water Quality Map of Estonia", font=_font("bold", 38), fill=(232, 246, 255))

    d.text((pad_x, sub_y + 200), "Terviseamet open data · Machine-learning risk assessment", font=_font("regular", 26), fill=(199, 230, 255))

    # URL bottom-right
    url = "h2oatlas.ee"
    url_font = _font("bold", 38)
    bbox = d.textbbox((0, 0), url, font=url_font)
    d.text((w - (bbox[2] - bbox[0]) - 70, h - 80), url, font=url_font, fill=(255, 255, 255, 230))

    bg.convert("RGB").save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} B)")


def build_og_default(out: Path) -> None:
    w, h = 1200, 630
    bg = _diagonal_gradient((w, h), BRAND_TOP, BRAND_BOTTOM).convert("RGBA")

    # Subtle Estonia silhouette behind text
    _draw_estonia(
        bg,
        x0=int(w * 0.45), y0=int(h * 0.10),
        w=int(w * 0.50), h=int(h * 0.80),
        fill=(255, 255, 255, 30),
        outline=(255, 255, 255, 160),
        outline_width=3,
    )

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((0, h - 220, w, h), fill=(7, 58, 122, 70))
    bg.alpha_composite(overlay)

    logo_size = 320
    margin = 70
    _draw_logo(bg, (margin, (h - logo_size) // 2, margin + logo_size, (h - logo_size) // 2 + logo_size))

    d = ImageDraw.Draw(bg)
    text_x = margin + logo_size + 60
    title_y = (h - 96 - 38 - 28 - 24) // 2 - 30
    d.text((text_x + 3, title_y + 3), "H2O Atlas", font=_font("bold", 96), fill=(0, 0, 0, 70))
    d.text((text_x, title_y), "H2O Atlas", font=_font("bold", 96), fill=(255, 255, 255))
    d.text((text_x, title_y + 110), "Water Quality Map of Estonia", font=_font("regular", 38), fill=(232, 246, 255))
    d.text((text_x, title_y + 170), "Terviseamet open data · ML risk assessment", font=_font("regular", 28), fill=(199, 230, 255))

    d.text((margin, h - 70), "h2oatlas.ee", font=_font("bold", 34), fill=(255, 255, 255, 230))

    bg.convert("RGB").save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} B)")


LAUNCH_COPY = {
    "et": {
        "kicker": "AVATUD",
        "title": "H2O Atlas",
        "subtitle": "Eesti veekvaliteedi kaart",
        "stats": "2199 punkti · 69 000+ proovi · 4 ML-mudelit",
        "tagline": "Avatud andmed Terviseametist",
    },
    "ru": {
        "kicker": "ЗАПУЩЕНО",
        "title": "H2O Atlas",
        "subtitle": "Карта качества воды Эстонии",
        "stats": "2199 точек · 69 000+ проб · 4 ML-модели",
        "tagline": "Открытые данные Terviseamet",
    },
    "en": {
        "kicker": "LAUNCHING",
        "title": "H2O Atlas",
        "subtitle": "Water Quality Map of Estonia",
        "stats": "2,199 locations · 69,000+ samples · 4 ML models",
        "tagline": "Powered by Terviseamet open data",
    },
}


def build_launch_image(lang: str, out: Path) -> None:
    w, h = 1200, 630
    bg = _diagonal_gradient((w, h), BRAND_TOP, BRAND_BOTTOM).convert("RGBA")

    # Estonia silhouette tucked into the right-bottom; small enough not to
    # collide with the subtitle line which extends well past the centerline.
    _draw_estonia(
        bg,
        x0=int(w * 0.62), y0=int(h * 0.55),
        w=int(w * 0.34), h=int(h * 0.32),
        fill=(255, 255, 255, 45),
        outline=(255, 255, 255, 210),
        outline_width=3,
    )

    copy = LAUNCH_COPY[lang]
    d = ImageDraw.Draw(bg)
    pad = 70

    # Kicker pill (top-left)
    kicker = copy["kicker"]
    kicker_font = _font("bold", 26)
    bbox = d.textbbox((0, 0), kicker, font=kicker_font)
    kw = (bbox[2] - bbox[0]) + 32
    kh = (bbox[3] - bbox[1]) + 18
    d.rounded_rectangle((pad, pad, pad + kw, pad + kh), radius=999, fill=(255, 255, 255, 235))
    d.text((pad + 16, pad + 6), kicker, font=kicker_font, fill=DEEP_BLUE)

    # Title
    title_y = pad + kh + 30
    d.text((pad + 3, title_y + 3), copy["title"], font=_font("bold", 130), fill=(0, 0, 0, 80))
    d.text((pad, title_y), copy["title"], font=_font("bold", 130), fill=(255, 255, 255))

    # Subtitle
    d.text((pad, title_y + 150), copy["subtitle"], font=_font("bold", 50), fill=(232, 246, 255))

    # Stats
    d.text((pad, title_y + 230), copy["stats"], font=_font("regular", 32), fill=(199, 230, 255))

    # Tagline
    d.text((pad, title_y + 280), copy["tagline"], font=_font("regular", 28), fill=(199, 230, 255))

    # URL footer
    d.text((pad, h - 70), "h2oatlas.ee", font=_font("bold", 38), fill=(255, 255, 255, 245))

    bg.convert("RGB").save(out, "PNG", optimize=True)
    print(f"wrote {out} ({out.stat().st_size} B)")


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    SOCIAL.mkdir(parents=True, exist_ok=True)
    build_apple_touch_icon(PUBLIC / "apple-touch-icon.png")
    build_og_default(PUBLIC / "og-default.png")
    build_fb_avatar(SOCIAL / "fb-avatar.png")
    build_fb_cover(SOCIAL / "fb-cover.png")
    for lang in ("en", "et", "ru"):
        build_launch_image(lang, SOCIAL / f"launch-image-{lang}.png")


if __name__ == "__main__":
    main()
