"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Image as ImageIcon, Wand2, Type } from "lucide-react";

type Pos = { x: number; y: number };

export default function MemeToolPage() {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);

  // Új: remote URL mező (query-ből vagy manuális)
  const [remoteUrl, setRemoteUrl] = useState<string>("");

  // Text settings
  const [topText, setTopText] = useState<string>("");
  const [bottomText, setBottomText] = useState<string>("");
  const [freeText, setFreeText] = useState<string>("");
  const [freePos, setFreePos] = useState<Pos>({ x: 0.5, y: 0.6 });

  const [fontSize, setFontSize] = useState<number>(48);
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [fill, setFill] = useState<string>("#ffffff");
  const [stroke, setStroke] = useState<string>("#000000");

  // Watermark
  const [wmEnabled, setWmEnabled] = useState<boolean>(true);
  const [wmText, setWmText] = useState<string>("$PAREIDOLIA");
  const [wmOpacity, setWmOpacity] = useState<number>(0.12);
  const [wmScale, setWmScale] = useState<number>(1);

  // Canvas
  const canvasPreviewRef = useRef<HTMLCanvasElement | null>(null);
  const renderSize = useRef<{ w: number; h: number }>({ w: 1200, h: 1200 });

  // Fájl feltöltés
  const onFile = (f?: File) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImgSrc(url);
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      resizeForRender(img);
      drawPreview();
    };
    img.crossOrigin = "anonymous";
    img.src = url;
  };

  const resizeForRender = (img: HTMLImageElement) => {
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
  };

  // Remote kép betöltése (fetch → blob → dataURL)
  const loadRemoteImage = async (url: string) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error("Remote image fetch failed", res.status);
        return;
      }
      const blob = await res.blob();
      const fr = new FileReader();
      fr.onload = () => {
        const dataUrl = fr.result as string;
        setImgSrc(dataUrl);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          setImgEl(img);
            resizeForRender(img);
          drawPreview();
        };
        img.src = dataUrl;
      };
      fr.readAsDataURL(blob);
    } catch (e) {
      console.error("Cannot load remote image", e);
    }
  };

  // Query param feldolgozás (csak ha nincs már kép)
  useEffect(() => {
    if (imgSrc) return;
    if (typeof window === "undefined") return;
    
    const processCoinParam = async () => {
      const sp = new URLSearchParams(window.location.search);
      const img = sp.get("img");
      const caption = sp.get("caption");
      const coin = sp.get("coin");

      // Handle coin parameter first
      if (coin) {
        try {
          const response = await fetch(`/api/coins?search=${encodeURIComponent(coin)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.coins && data.coins.length > 0) {
              const coinData = data.coins[0]; // Use first match
              if (coinData.imageUrls && coinData.imageUrls.length > 0) {
                // Load the first image
                const imageUrl = coinData.imageUrls[0];
                setRemoteUrl(imageUrl);
                loadRemoteImage(imageUrl);
                
                // Prefill captions
                if (!topText) {
                  setTopText(coinData.symbol.toUpperCase());
                }
                if (!bottomText && coinData.narrative) {
                  // Trim narrative to 140 chars
                  const trimmedNarrative = coinData.narrative.length > 140 
                    ? coinData.narrative.substring(0, 137) + "..."
                    : coinData.narrative;
                  setBottomText(trimmedNarrative);
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch coin data:", error);
          // Continue with manual flow on error
        }
      }
      
      // Handle other params if coin param didn't load an image
      if (!coin) {
        if (img) {
          setRemoteUrl(img);
          loadRemoteImage(img);
        }
        if (caption && !bottomText && !topText) {
          setBottomText(caption);
        }
      }
    };

    processCoinParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Szöveg rajzoló
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
    const base = Math.min(w, h);
    let fontPx = Math.max(16, Math.round((base / 24) * scale));
    ctx.font = `800 ${fontPx}px Inter, Anton, Impact, Arial, sans-serif`;

    const maxWidth = w * 0.45;
    let metrics = ctx.measureText(txt);
    if (metrics.width > maxWidth) {
      const shrink = maxWidth / metrics.width;
      fontPx = Math.max(14, Math.floor(fontPx * shrink));
      ctx.font = `800 ${fontPx}px Inter, Anton, Impact, Arial, sans-serif`;
      metrics = ctx.measureText(txt);
    }

    const pad = Math.round(base * 0.02);
    const x = w - pad;
    const y = h - pad;

    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.lineWidth = Math.max(1, Math.round(fontPx * 0.08));
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.round(fontPx * 0.15);
    ctx.shadowOffsetX = Math.round(fontPx * 0.06);
    ctx.shadowOffsetY = Math.round(fontPx * 0.06);
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(txt, x, y);
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

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    const ratio = Math.min(w / imgEl.width, h / imgEl.height);
    const iw = imgEl.width * ratio;
    const ih = imgEl.height * ratio;
    const ix = (w - iw) / 2;
    const iy = (h - ih) / 2;
    ctx.drawImage(imgEl, ix, iy, iw, ih);

    const wrap = Math.min(w, h) * 0.9;

    if (topText.trim()) {
      drawText(
        ctx,
        topText.toUpperCase(),
        w / 2,
        Math.round(h * 0.04),
        fontSize,
        fill,
        stroke,
        strokeWidth,
        "center",
        "top",
        wrap
      );
    }

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

    if (freeText.trim()) {
      const fx = Math.round(freePos.x * w);
      const fy = Math.round(freePos.y * h);
      drawText(
        ctx,
        freeText,
        fx,
        fy,
        fontSize,
        fill,
        stroke,
        strokeWidth,
        "center",
        "middle",
        wrap * 0.8
      );
    }

    if (wmEnabled) {
      drawWatermark(ctx, wmText, w, h, wmOpacity, wmScale);
    }
  };

  useEffect(() => {
    drawPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imgEl,
    topText,
    bottomText,
    freeText,
    freePos,
    fontSize,
    strokeWidth,
    fill,
    stroke,
    wmEnabled,
    wmText,
    wmOpacity,
    wmScale,
  ]);

  const download = () => {
    const c = canvasPreviewRef.current;
    if (!c) return;
    const link = document.createElement("a");
    link.download = "pareidolia-meme.png";
    link.href = c.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">PAREIDOLIA Meme Generator</h1>
          <p className="text-neutral-300 mt-1">
            Add captions and a $PAREIDOLIA watermark to your images — then download and share.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-2 bg-white/5 border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" /> Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Fájl feltöltés */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFile(e.target.files?.[0] || undefined)}
                />
                {!imgSrc && (
                  <p className="text-xs text-neutral-500">
                    Choose a photo (clouds, foam, rocks…)
                  </p>
                )}
              </div>

              {/* Remote URL betöltés */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Remote Image URL
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (remoteUrl) loadRemoteImage(remoteUrl);
                    }}
                  >
                    Betöltés
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">
                  Illeszd be a contest kép URL-jét, vagy használj fájlfeltöltést.
                </p>
              </div>

              {/* Szövegek */}
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 flex items-center gap-2">
                  <Type className="h-4 w-4" /> Captions
                </label>
                <Input
                  placeholder="Top text (optional)"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                />
                <Input
                  placeholder="Bottom text (optional)"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                />
                <Input
                  placeholder="Free text (optional)"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                />
                {freeText && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Free text X</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(freePos.x * 100)}
                        onChange={(e) =>
                          setFreePos((p) => ({ ...p, x: Number(e.target.value) / 100 }))
                        }
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
                        onChange={(e) =>
                          setFreePos((p) => ({ ...p, y: Number(e.target.value) / 100 }))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stílusok */}
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
                  <input
                    type="color"
                    value={fill}
                    onChange={(e) => setFill(e.target.value)}
                    className="w-full h-9 p-1 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Stroke color</label>
                  <input
                    type="color"
                    value={stroke}
                    onChange={(e) => setStroke(e.target.value)}
                    className="w-full h-9 p-1 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-500">
                  Opacity ({wmOpacity.toFixed(2)})
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={wmOpacity}
                  onChange={(e) => setWmOpacity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Scale ({wmScale.toFixed(2)})
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={wmScale}
                  onChange={(e) => setWmScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 flex-wrap">
                <Button
                  type="button"
                  onClick={() => {
                    setImgSrc("");
                    setImgEl(null);
                    setRemoteUrl("");
                  }}
                  variant="outline"
                  className="rounded-2xl"
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  onClick={drawPreview}
                  variant="outline"
                  className="rounded-2xl"
                >
                  Refresh
                </Button>
                <Button onClick={download} className="rounded-2xl">
                  <Download className="h-4 w-4 mr-2" /> Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 bg-white/5 border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full">
                <canvas
                  ref={canvasPreviewRef}
                  className="w-full h-auto rounded-xl border border-white/10 bg-black"
                />
              </div>
              {!imgSrc && (
                <div className="mt-4 text-sm text-neutral-400">
                  Tip: start by choosing or loading an image — clouds, coffee foam,
                  rocks, trees…
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
