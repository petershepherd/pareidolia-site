"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Image as ImageIcon, Wand2, Type, Droplets } from "lucide-react";
import { Navbar } from "@/components/site-navbar";

<div className="min-h-screen bg-neutral-950 text-neutral-100">
  <Navbar links={{ dex: "https://letsbonk.fun/token/BXrwn2UWEeUAKghP8hatpW4i5AMchdscTzchMYE4bonk", xCommunity: "https://x.com/i/communities/1954506369618391171", telegram: "https://t.me/pareidoliaportal" }} />
  {/* ... a többi tartalom ... */}
</div>

type Pos = { x: number; y: number };

export default function MemeToolPage() {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

  // Text settings
  const [topText, setTopText] = useState<string>("");
  const [bottomText, setBottomText] = useState<string>("");
  const [freeText, setFreeText] = useState<string>("");
  const [freePos, setFreePos] = useState<Pos>({ x: 0.5, y: 0.6 }); // relatív (0..1)

  const [fontSize, setFontSize] = useState<number>(48);
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [fill, setFill] = useState<string>("#ffffff");
  const [stroke, setStroke] = useState<string>("#000000");

  // Watermark
  const [wmEnabled, setWmEnabled] = useState<boolean>(true);
  const [wmText, setWmText] = useState<string>("$PAREIDOLIA");
  const [wmOpacity, setWmOpacity] = useState<number>(0.12);
  const [wmScale, setWmScale] = useState<number>(1); // 1 = alap diagonál méret

  // Canvas refs
  const canvasPreviewRef = useRef<HTMLCanvasElement | null>(null);
  const renderSize = useRef<{ w: number; h: number }>({ w: 1200, h: 1200 });

  // Load selected image
  const onFile = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImgSrc(url);
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      // beállítjuk a render méretet az arány megtartásával (max 1600 egyik oldalon)
      const maxSide = 1600;
      let w = img.width;
      let h = img.height;
      if (w > h && w > maxSide) {
        h = Math.round(h * (maxSide / w));
        w = maxSide;
      } else if (h >= w && h > maxSide) {
        w = Math.round(w * (maxSide / h));
        h = maxSide;
      }
      renderSize.current = { w, h };
      drawPreview();
    };
    img.crossOrigin = "anonymous";
    img.src = url;
  };

  // Draw helper
  const drawText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    size: number,
    fillStyle: string,
    strokeStyle: string,
    strokeW: number,
    align: CanvasTextAlign = "center",
    baseline: CanvasTextBaseline = "top",
    wrapWidth?: number
  ) => {
    if (!text) return;
    ctx.save();
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeW;
    ctx.font = `bold ${size}px Inter, Anton, Impact, Arial, sans-serif`;

    const drawLine = (line: string, yy: number) => {
      if (strokeW > 0) {
        ctx.strokeStyle = strokeStyle;
        ctx.strokeText(line, x, yy);
      }
      ctx.fillStyle = fillStyle;
      ctx.fillText(line, x, yy);
    };

    const lines: string[] = [];
    if (wrapWidth) {
      const words = text.split(/\s+/);
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        const m = ctx.measureText(test);
        if (m.width > wrapWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    } else {
      lines.push(text);
    }

    const lh = size * 1.2;
    lines.forEach((line, i) => drawLine(line, y + i * lh));
    ctx.restore();
  };

  const drawWatermark = (
    ctx: CanvasRenderingContext2D,
    txt: string,
    w: number,
    h: number,
    opacity: number,
    scale: number
  ) => {
    if (!txt) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.translate(w / 2, h / 2);
    ctx.rotate((-30 * Math.PI) / 180);
    const base = Math.sqrt(w * w + h * h); // átló
    const fontPx = Math.max(24, Math.round((base / 12) * scale));
    ctx.font = `800 ${fontPx}px Inter, Anton, Impact, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const grad = ctx.createLinearGradient(-w, 0, w, 0);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0.6)");
    ctx.fillStyle = grad;
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  };

  const drawPreview = () => {
    const canvas = canvasPreviewRef.current;
    if (!canvas || !imgEl) return;
    const { w, h } = renderSize.current;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // background
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // image fit (contain)
    const ratio = Math.min(w / imgEl.width, h / imgEl.height);
    const iw = imgEl.width * ratio;
    const ih = imgEl.height * ratio;
    const ix = (w - iw) / 2;
    const iy = (h - ih) / 2;
    ctx.drawImage(imgEl, ix, iy, iw, ih);

    const wrap = Math.min(w, h) * 0.9;

    // top text
    if (topText.trim()) {
      drawText(ctx, topText.toUpperCase(), w / 2, Math.round(h * 0.04), fontSize, fill, stroke, strokeWidth, "center", "top", wrap);
    }

    // bottom text
    if (bottomText.trim()) {
      const linesHeight = fontSize * 1.2 * Math.ceil(bottomText.split(" ").length / 5);
      drawText(
        ctx,
        bottomText.toUpperCase(),
        w / 2,
        h - Math.round(h * 0.04) - linesHeight,
        fontSize,
        fill,
        stroke,
        strokeWidth,
        "center",
        "top",
        wrap
      );
    }

    // free text (draggable via sliders)
    if (freeText.trim()) {
      const fx = Math.round(freePos.x * w);
      const fy = Math.round(freePos.y * h);
      drawText(ctx, freeText, fx, fy, fontSize, fill, stroke, strokeWidth, "center", "middle", wrap * 0.8);
    }

    // watermark
    if (wmEnabled) {
      drawWatermark(ctx, wmText, w, h, wmOpacity, wmScale);
    }
  };

  useEffect(() => {
    drawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgEl, topText, bottomText, freeText, freePos, fontSize, strokeWidth, fill, stroke, wmEnabled, wmText, wmOpacity, wmScale]);

  const download = () => {
    const c = canvasPreviewRef.current;
    if (!c) return;
    const link = document.createElement("a");
    link.download = "pareidolia-meme.png";
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">PAREIDOLIA Meme Generator</h1>
        <p className="text-neutral-300 mt-1">Add captions and a $PAREIDOLIA watermark to your images — then download and share.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Controls */}
        <Card className="md:col-span-2 bg-white/5 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" /> Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Image
              </label>
              <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || undefined)} />
              {!imgSrc && <p className="text-xs text-neutral-500">Choose a photo (clouds, foam, rocks…)</p>}
            </div>

            {/* Texts */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 flex items-center gap-2">
                <Type className="h-4 w-4" /> Captions
              </label>
              <Input placeholder="Top text (optional)" value={topText} onChange={(e) => setTopText(e.target.value)} />
              <Input placeholder="Bottom text (optional)" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
              <Input placeholder="Free text (optional)" value={freeText} onChange={(e) => setFreeText(e.target.value)} />
              {freeText && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500">Free text X</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(freePos.x * 100)}
                      onChange={(e) => setFreePos((p) => ({ ...p, x: Number(e.target.value) / 100 }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">Free text Y</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(freePos.y * 100)}
                      onChange={(e) => setFreePos((p) => ({ ...p, y: Number(e.target.value) / 100 }))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Styles */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-500">Font size</label>
                <input
                  type="range"
                  min={18}
                  max={128}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Stroke width</label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Fill color</label>
                <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} className="w-full h-9 p-1 rounded" />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Stroke color</label>
                <input type="color" value={stroke} onChange={(e) => setStroke(e.target.value)} className="w-full h-9 p-1 rounded" />
              </div>
            </div>

            {/* Watermark */}
            <div>
  <label className="text-xs text-neutral-500">Opacity ({wmOpacity.toFixed(2)})</label>
  <input
    type="range"
    min={0.5} // 0 helyett 0.5
    max={1}
    step={0.01}
    value={wmOpacity}
    onChange={(e) => setWmOpacity(Number(e.target.value))}
    className="w-full"
  />
</div>
<div>
  <label className="text-xs text-neutral-500">Scale ({wmScale.toFixed(2)})</label>
  <input
    type="range"
    min={0.5} // 0.5 marad
    max={2}
    step={0.05}
    value={wmScale}
    onChange={(e) => setWmScale(Number(e.target.value))}
    className="w-full"
  />
</div>


            <div className="flex items-center justify-end gap-2 pt-2">
              <Button onClick={drawPreview} variant="outline" className="rounded-2xl">
                Refresh
              </Button>
              <Button onClick={download} className="rounded-2xl">
                <Download className="h-4 w-4 mr-2" /> Download PNG
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="md:col-span-3 bg-white/5 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full">
              <canvas ref={canvasPreviewRef} className="w-full h-auto rounded-xl border border-white/10 bg-black" />
            </div>
            {!imgSrc && (
              <div className="mt-4 text-sm text-neutral-400">
                Tip: start by choosing an image — clouds, coffee foam, rocks, trees… then add text and watermark.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
