"""Convierte un GIF animado en un spritesheet PNG (grilla de frames) para SpriteManager.

Uso: python tools/gif_to_spritesheet.py <entrada.gif> <salida.png> [tamaño_celda]
Requiere Pillow (herramienta local, no es dependencia del juego).
"""
import math
import sys

from PIL import Image


def remove_green(frame: Image.Image) -> Image.Image:
    """El GIF del meme tiene restos de chroma key verde (frames enteros y bordes).

    El verde puro se vuelve transparente; al resto se le hace "despill" (verde <= max(rojo, azul))
    para quitar el halo verdoso de los bordes. La rata no tiene nada verde, así que es seguro.
    """
    pixels = [
        (r, g, b, 0) if g > 50 and g > r * 1.25 and g > b * 1.25 else (r, min(g, max(r, b)), b, a)
        for r, g, b, a in frame.get_flattened_data()
    ]
    out = Image.new("RGBA", frame.size)
    out.putdata(pixels)
    return out


def main() -> None:
    src, dst = sys.argv[1], sys.argv[2]
    cell = int(sys.argv[3]) if len(sys.argv) > 3 else 128

    gif = Image.open(src)
    frames, durations = [], []
    for i in range(gif.n_frames):
        gif.seek(i)
        durations.append(gif.info.get("duration", 0))
        frame = remove_green(gif.convert("RGBA"))
        # Redimensionar en alfa premultiplicado ("RGBa") evita halos oscuros en los bordes.
        frames.append(frame.convert("RGBa").resize((cell, cell), Image.Resampling.LANCZOS).convert("RGBA"))

    cols = math.ceil(math.sqrt(len(frames)))
    rows = math.ceil(len(frames) / cols)
    sheet = Image.new("RGBA", (cols * cell, rows * cell), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        sheet.paste(frame, ((i % cols) * cell, (i // cols) * cell))
    sheet.save(dst, optimize=True)

    # Altura de los pies (mediana del borde inferior visible), para apoyarlos en el piso.
    bottoms = sorted(
        box[3] for f in frames if (box := f.getchannel("A").point(lambda a: 255 if a > 128 else 0).getbbox())
    )
    bottom = bottoms[len(bottoms) // 2]
    avg_ms = sum(durations) / len(durations)
    print(f"frames={len(frames)} grid={cols}x{rows} cell={cell}px sheet={sheet.size}")
    print(f"avg_frame_ms={avg_ms:.1f} feet_bottom_ratio={bottom / cell:.3f}")


if __name__ == "__main__":
    main()
