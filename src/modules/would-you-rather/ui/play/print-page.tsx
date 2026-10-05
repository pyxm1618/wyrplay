"use client";
/* eslint-disable @next/next/no-img-element -- Canvas previews and original local logo. */

import { useEffect, useState, startTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Question } from "../../types";
import { resolveQuestionPool, questionPoolUrl } from "../../domain/play-session";
import {
  createPrintLayout,
  type PrintFormat,
  type PaperSize,
  type PrintLayout,
} from "../../domain/print-layout";
import { renderSinglePrintPage, createVectorPdf, pngWithDpi } from "./print-renderer";
import { PlayHeader, PlayArtwork } from "./art";
import { FinderIcon } from "../finder/icon";
import QRCode from "qrcode";
import "./play.css";
import "./print.css";

export function PrintPage({
  questions,
  authEnabled,
}: {
  readonly questions: readonly Question[];
  readonly authEnabled: boolean;
}) {
  const search = useSearchParams();
  const requestedSet = search.get("set");
  const availablePool = useMemo(
    () => resolveQuestionPool(questions, requestedSet),
    [questions, requestedSet],
  );

  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const pool = useMemo(
    () => availablePool.slice(0, questionCount ?? availablePool.length),
    [availablePool, questionCount],
  );
  const playPath = questionPoolUrl("/play", pool);
  const [assets, setAssets] = useState<{
    logo: HTMLImageElement;
    qr: HTMLImageElement;
    qrData: string;
    playUrl: string;
    path: string;
  } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const [format, setFormat] = useState<PrintFormat>(
    search.get("format") === "sheet" ? "sheet" : "cards",
  );
  const [paper, setPaper] = useState<PaperSize>("letter");
  const [marks, setMarks] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);
  const [qrCodeEnabled, setQrCodeEnabled] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState<number>(format === "cards" ? 6 : 0);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);

  // 资源与预览状态
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentCanvas, setCurrentCanvas] = useState<HTMLCanvasElement | null>(null);
  const [error, setError] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 格式切换时重置合适的每页题数
  const handleFormatChange = (newFormat: PrintFormat) => {
    setFormat(newFormat);
    setItemsPerPage(newFormat === "cards" ? 6 : 0);
    setPage(0);
  };

  // 布局计算：使用 useMemo 纯函数计算
  const layout = useMemo<PrintLayout | null>(() => {
    if (!pool.length) return null;
    return createPrintLayout(
      pool,
      format,
      paper,
      (text) => text.length * 6.2, // 估算/基准宽度
      {
        itemsPerPage: itemsPerPage > 0 ? itemsPerPage : undefined,
        showNumbers,
      },
    );
  }, [pool, format, paper, itemsPerPage, showNumbers]);

  const totalPages = layout?.pages.length ?? 0;

  // 确保当前页码在合法范围内
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  // QR represents exactly the ordered, count-limited set used by all outputs.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const logo = new Image();
        logo.src = "/play-art/logo.png";
        await logo.decode();
        const playUrl = new URL(playPath, window.location.origin).href;
        const qrData = await QRCode.toDataURL(playUrl, { margin: 4, width: 512 });
        const qr = new Image();
        qr.src = qrData;
        await qr.decode();
        if (!cancelled) setAssets({ logo, qr, qrData, playUrl, path: playPath });
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Could not load print assets");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [playPath]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(viewport);
      setPreviewSize({
        width:
          viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
        height:
          viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
      });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  // 按需单页渲染当前预览 Canvas
  useEffect(() => {
    if (!layout || !totalPages || !assets || assets.path !== playPath) return;
    let cancelled = false;

    void (async () => {
      try {
        await document.fonts.load("11px PlayBody");
        await document.fonts.load("26px PlayHand");

        const currentPageIndex = Math.min(Math.max(0, page), totalPages - 1);
        const canvas = renderSinglePrintPage(
          layout,
          currentPageIndex,
          format,
          marks,
          assets.logo,
          {
            showNumbers,
            qrCode: qrCodeEnabled,
          },
          assets.qr,
        );

        if (!cancelled) {
          canvas.toBlob((blob: Blob | null) => {
            if (blob && !cancelled) {
              const url = URL.createObjectURL(blob);
              startTransition(() => {
                setPreviewUrl((old) => {
                  if (old) URL.revokeObjectURL(old);
                  return url;
                });
                setCurrentCanvas(canvas);
                setError("");
              });
            }
          });
        }
      } catch (err) {
        if (!cancelled) {
          startTransition(() => {
            setError(err instanceof Error ? err.message : "Could not prepare print output");
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [layout, page, totalPages, format, marks, showNumbers, qrCodeEnabled, assets, playPath]);

  // 组件卸载时释放 URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 下载高清矢量 PDF
  async function downloadPdf() {
    if (!layout || !assets || assets.path !== playPath) return;
    setError("");
    setIsGeneratingPdf(true);
    try {
      const pdfBlob = await createVectorPdf(layout, format, marks, {
        showNumbers,
        qrCode: qrCodeEnabled,
        siteUrl: assets.playUrl,
      });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wyrplay-${format}-${paper}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(
        `PDF export failed. No file was downloaded. ${err instanceof Error ? err.message : "Please try again."}`,
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  // 导出当前页为高清 PNG
  function downloadPng() {
    if (!layout || !assets || assets.path !== playPath) return;
    const canvas = renderSinglePrintPage(
      layout,
      page,
      format,
      marks,
      assets.logo,
      {
        showNumbers,
        qrCode: qrCodeEnabled,
        dpi: 300,
        transparent: true,
      },
      assets.qr,
    );
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("PNG export failed. Please try again.");
        return;
      }
      void (async () => {
        try {
          const output = await pngWithDpi(blob, 300);
          const url = URL.createObjectURL(output);
          const link = document.createElement("a");
          link.href = url;
          link.download = `wyrplay-${format}-${paper}-page-${page + 1}.png`;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (err) {
          setError(
            `PNG export failed. ${err instanceof Error ? err.message : "Please try again."}`,
          );
        }
      })();
    }, "image/png");
  }

  // 触发浏览器原生打印
  async function handlePrint() {
    try {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.querySelectorAll<HTMLImageElement>(".print-document img")).map(
          (image) => image.decode(),
        ),
      );
      window.print();
    } catch (err) {
      setError(
        `Print preparation failed. ${err instanceof Error ? err.message : "Please try again."}`,
      );
    }
  }

  return (
    <div className="print-page" data-format={format}>
      <style>{`@page { size: ${paper === "a4" ? "A4" : "letter"}; margin: 0; }`}</style>
      <PlayArtwork />
      <PlayHeader authEnabled={authEnabled} />
      <div className="print-workspace">
        <section className="print-editor">
          <Link className="print-back" href="/find-questions?restore=1">
            ← Back to questions
          </Link>
          <h1>
            Print <span className="word-rather">Cards</span> & Sheets
          </h1>
          <p className="print-lead">
            Turn your favorite Would You Rather questions into printable games and handouts.
          </p>
          <div className="print-pool">
            <span>
              <strong>{pool.length}</strong> questions in this set
            </span>
            <Link href="/find-questions?restore=1">Change questions</Link>
          </div>

          <div className="format-settings">
            <h2>Select Format</h2>
            <div className="format-options">
              <button
                type="button"
                aria-pressed={format === "cards"}
                onClick={() => handleFormatChange("cards")}
              >
                <span className="format-radio">{format === "cards" ? "●" : "○"}</span>
                <div className="format-illustration cards">
                  <img src="/play-art/logo.png" alt="" />
                  <span>Cut-out cards</span>
                </div>
                <h3>Cut-out Cards</h3>
                <p>Individual game cards with Option A and Option B prompts, ready to cut.</p>
              </button>

              <button
                type="button"
                aria-pressed={format === "sheet"}
                onClick={() => handleFormatChange("sheet")}
              >
                <span className="format-radio">{format === "sheet" ? "●" : "○"}</span>
                <div className="format-illustration sheet">
                  <img src="/play-art/logo.png" alt="" />
                  <span>Question sheet</span>
                </div>
                <h3>Question Sheet</h3>
                <p>Compact checklist layout with both options side by side for quick voting.</p>
              </button>
            </div>
          </div>

          <div className="print-settings">
            <label className="question-count">
              Number of questions
              <input
                type="number"
                min={1}
                max={availablePool.length || 1}
                disabled={!availablePool.length}
                value={Math.min(questionCount ?? availablePool.length, availablePool.length)}
                onChange={(event) => {
                  const value = event.target.valueAsNumber;
                  if (Number.isInteger(value) && value >= 1 && value <= availablePool.length) {
                    setQuestionCount(value);
                    setPage(0);
                  }
                }}
              />
            </label>
            <h2>Page Settings</h2>
            <div className="settings-fields">
              <fieldset>
                <legend>Paper Size</legend>
                <label>
                  <input
                    type="radio"
                    name="paper"
                    value="letter"
                    checked={paper === "letter"}
                    onChange={() => setPaper("letter")}
                  />
                  US Letter (8.5 × 11 in)
                </label>
                <label>
                  <input
                    type="radio"
                    name="paper"
                    value="a4"
                    checked={paper === "a4"}
                    onChange={() => setPaper("a4")}
                  />
                  A4 (210 × 297 mm)
                </label>
              </fieldset>

              <div className="settings-row">
                <label>
                  <strong>Maximum Items Per Page</strong>
                  <select
                    className="settings-select"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    {format === "cards" ? (
                      <>
                        <option value={2}>2 cards per page</option>
                        <option value={4}>4 cards per page</option>
                        <option value={6}>6 cards per page (Default)</option>
                      </>
                    ) : (
                      <>
                        <option value={0}>Auto (Fill Page)</option>
                        <option value={10}>10 questions</option>
                        <option value={6}>6 questions</option>
                      </>
                    )}
                  </select>
                </label>

                <label className="toggle-setting">
                  <input
                    type="checkbox"
                    checked={showNumbers}
                    onChange={(e) => setShowNumbers(e.target.checked)}
                  />
                  Show Question Numbers
                </label>

                <label className="toggle-setting">
                  <input
                    type="checkbox"
                    checked={qrCodeEnabled}
                    onChange={(e) => setQrCodeEnabled(e.target.checked)}
                  />
                  Include QR Code
                </label>
              </div>

              <small>Long questions may require fewer items to keep all text on the page.</small>
              <div className="marks-setting">
                <label>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={marks}
                    onChange={(e) => setMarks(e.target.checked)}
                  />
                  <span>{format === "cards" ? "Cut Lines" : "A / B Circles"}</span>
                </label>
                <small>
                  {format === "cards"
                    ? "Dotted guide lines and scissor marks to make cutting easier."
                    : "Choice bubbles on each row for participants to mark their answers."}
                </small>
              </div>
            </div>
          </div>
        </section>

        <section className="print-preview">
          <header>
            <div>
              <h2>{format === "cards" ? "Cut-out Cards" : "Question Sheet"}</h2>
              <p>
                {pool.length} questions
                {totalPages ? ` • Page ${page + 1} of ${totalPages}` : ""}
              </p>
            </div>
            {totalPages > 1 && (
              <div className="preview-pages">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  ‹
                </button>
                <span>
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  ›
                </button>
              </div>
            )}
          </header>

          <div className="preview-paper-viewport" ref={viewportRef}>
            {previewUrl ? (
              <img
                className="preview-paper"
                src={previewUrl}
                alt={`Print preview page ${page + 1}`}
                style={
                  layout
                    ? {
                        width:
                          (Math.max(
                            0.001,
                            Math.min(
                              previewSize.width / layout.width,
                              previewSize.height / layout.height,
                            ),
                          ) *
                            layout.width *
                            zoom) /
                          100,
                      }
                    : undefined
                }
              />
            ) : (
              <p role="status">{error || "No approved questions in this set."}</p>
            )}
          </div>

          {error && <p role="alert">{error}</p>}
          <footer>
            <label>
              Zoom: {zoom}%
              <input
                type="range"
                min="50"
                max="150"
                step="10"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
            <button
              type="button"
              onClick={() => void handlePrint()}
              disabled={!totalPages || !currentCanvas || !assets || assets.path !== playPath}
            >
              <FinderIcon name="print" size={20} /> Print
            </button>
            <button
              type="button"
              onClick={downloadPng}
              disabled={!totalPages || !currentCanvas || !assets || assets.path !== playPath}
            >
              PNG
            </button>
            <button
              type="button"
              className="download-pdf"
              onClick={() => void downloadPdf()}
              disabled={
                !totalPages ||
                !currentCanvas ||
                !assets ||
                assets.path !== playPath ||
                isGeneratingPdf
              }
            >
              {isGeneratingPdf ? "Generating PDF…" : "Download PDF"}
            </button>
          </footer>
        </section>
      </div>

      {/* 浏览器真实打印 HTML/CSS 矢量 DOM */}
      {layout && (
        <div className="print-document" aria-hidden="true">
          {layout.pages.map((placements, pIdx) => (
            <div
              key={pIdx}
              className="print-page-sheet"
              style={{
                width: `${layout.width}pt`,
                height: `${layout.height}pt`,
                padding: "30pt",
              }}
            >
              {format === "sheet" && (
                <div
                  style={{ display: "flex", justifyContent: "space-between", marginBottom: "20pt" }}
                >
                  <div>
                    <img src="/play-art/logo.png" alt="" style={{ height: "35pt" }} />
                    <h2 style={{ fontFamily: "PlayHand", fontSize: "22pt", margin: "8pt 0 0" }}>
                      Would You Rather?
                    </h2>
                  </div>
                  {qrCodeEnabled && (
                    <div style={{ textAlign: "right" }}>
                      <img
                        src={assets?.qrData}
                        data-play-url={assets?.playUrl}
                        alt="Play this set QR code"
                        style={{ width: "42pt", height: "42pt" }}
                      />
                    </div>
                  )}
                </div>
              )}
              {placements.map((p) => (
                <div
                  key={p.number}
                  style={{
                    position: "absolute",
                    left: `${p.x}pt`,
                    top: `${p.y}pt`,
                    width: `${p.width}pt`,
                    height: `${p.height}pt`,
                  }}
                >
                  {format === "cards" ? (
                    <div
                      style={{
                        boxSizing: "border-box",
                        width: "100%",
                        height: "100%",
                        border: marks ? "1pt dashed #aaa" : "none",
                        padding: "16pt",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {qrCodeEnabled && assets && (
                        <img
                          src={assets.qrData}
                          data-play-url={assets.playUrl}
                          alt="Play this set QR code"
                          style={{
                            position: "absolute",
                            right: "8pt",
                            top: "8pt",
                            width: "38pt",
                            height: "38pt",
                          }}
                        />
                      )}
                      <div style={{ textAlign: "center", marginBottom: "12pt" }}>
                        <img src="/play-art/logo.png" alt="" style={{ height: "20pt" }} />
                        <h3 style={{ fontFamily: "PlayHand", fontSize: "16pt", margin: "4pt 0 0" }}>
                          Would you rather
                        </h3>
                        {showNumbers && (
                          <span style={{ fontSize: "9pt", color: "#888", display: "block" }}>
                            #{p.number}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "10pt", marginBottom: "10pt" }}>
                        <span
                          style={{
                            background: "#ff3457",
                            color: "white",
                            borderRadius: "50%",
                            width: "18pt",
                            height: "18pt",
                            display: "inline-grid",
                            placeItems: "center",
                            fontSize: "10pt",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          A
                        </span>
                        <p style={{ margin: 0, fontSize: "11pt", lineHeight: 1.3 }}>
                          {p.question.optionA}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10pt" }}>
                        <span
                          style={{
                            background: "#008cff",
                            color: "white",
                            borderRadius: "50%",
                            width: "18pt",
                            height: "18pt",
                            display: "inline-grid",
                            placeItems: "center",
                            fontSize: "10pt",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          B
                        </span>
                        <p style={{ margin: 0, fontSize: "11pt", lineHeight: 1.3 }}>
                          {p.question.optionB}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        borderBottom: "1pt solid #eee",
                        paddingBottom: "4pt",
                      }}
                    >
                      {showNumbers && (
                        <strong style={{ width: "32pt", fontSize: "11pt" }}>
                          {String(p.number).padStart(2, "0")}
                        </strong>
                      )}
                      <p style={{ flex: 1, margin: 0, fontSize: "11pt" }}>{p.question.question}</p>
                      {marks && (
                        <div style={{ display: "flex", gap: "16pt", paddingLeft: "10pt" }}>
                          <span
                            style={{
                              border: "1pt solid #a9b8cf",
                              borderRadius: "50%",
                              width: "12pt",
                              height: "12pt",
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              border: "1pt solid #a9b8cf",
                              borderRadius: "50%",
                              width: "12pt",
                              height: "12pt",
                              display: "inline-block",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
