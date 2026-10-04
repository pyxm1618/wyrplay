"use client";
/* eslint-disable @next/next/no-img-element -- Canvas previews and original local logo. */

import { useEffect, useState, startTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Question } from "../../types";
import { resolveQuestionPool } from "../../domain/play-session";
import {
  createPrintLayout,
  type PrintFormat,
  type PaperSize,
  type PrintLayout,
} from "../../domain/print-layout";
import { renderSinglePrintPage, createVectorPdf, pdfFromCanvases } from "./print-renderer";
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
  const pool = useMemo(
    () => resolveQuestionPool(questions, requestedSet),
    [questions, requestedSet],
  );

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
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const qrImageRef = useRef<HTMLImageElement | null>(null);

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

  // 加载 Logo 和二维码资产
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const logo = new Image();
        logo.src = "/finder/assets/logo.png";
        await logo.decode();
        if (!cancelled) {
          logoImageRef.current = logo;
        }

        const qrData = await QRCode.toDataURL("https://wyrplay.com/play", {
          margin: 1,
          width: 120,
        });
        const qrImg = new Image();
        qrImg.src = qrData;
        await qrImg.decode();
        if (!cancelled) {
          qrImageRef.current = qrImg;
        }
      } catch {
        // 静默容错
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 按需单页渲染当前预览 Canvas
  useEffect(() => {
    if (!layout || !totalPages) return;
    let cancelled = false;

    void (async () => {
      try {
        await document.fonts.load("11px PlayBody");
        await document.fonts.load("26px PlayHand");

        let logo = logoImageRef.current;
        if (!logo) {
          logo = new Image();
          logo.src = "/finder/assets/logo.png";
          await logo.decode();
          logoImageRef.current = logo;
        }

        const currentPageIndex = Math.min(Math.max(0, page), totalPages - 1);
        const canvas = renderSinglePrintPage(
          layout,
          currentPageIndex,
          format,
          marks,
          logo,
          {
            showNumbers,
            qrCode: qrCodeEnabled,
          },
          qrImageRef.current,
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
  }, [layout, page, totalPages, format, marks, showNumbers, qrCodeEnabled]);

  // 组件卸载时释放 URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 下载高清矢量 PDF
  async function downloadPdf() {
    if (!layout) return;
    setIsGeneratingPdf(true);
    try {
      const pdfBlob = await createVectorPdf(layout, format, marks, {
        showNumbers,
        qrCode: qrCodeEnabled,
        siteUrl: "https://wyrplay.com/play",
      });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wyrplay-${format}-${paper}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // 若出现未知异常，降级到 Canvas PDF
      if (currentCanvas) {
        const fallbackBlob = pdfFromCanvases([currentCanvas], layout.width, layout.height);
        const url = URL.createObjectURL(fallbackBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `wyrplay-${format}-${paper}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  // 导出当前页为高清 PNG
  function downloadPng() {
    if (!currentCanvas || !layout) return;
    currentCanvas.toBlob((blob: Blob | null) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wyrplay-${format}-${paper}-page-${page + 1}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  // 触发浏览器原生打印
  function handlePrint() {
    window.print();
  }

  return (
    <div className="print-page" data-format={format}>
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
                  <img src="/finder/assets/logo.png" alt="" />
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
                  <img src="/finder/assets/logo.png" alt="" />
                  <span>Question sheet</span>
                </div>
                <h3>Question Sheet</h3>
                <p>Compact checklist layout with both options side by side for quick voting.</p>
              </button>
            </div>
          </div>

          <div className="print-settings">
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
                  <strong>Items Per Page</strong>
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
                        <option value={15}>15 questions</option>
                        <option value={20}>20 questions</option>
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

          <div className="preview-paper-viewport">
            {previewUrl ? (
              <img
                className="preview-paper"
                src={previewUrl}
                alt={`Print preview page ${page + 1}`}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
              />
            ) : (
              <p role="status">{error || "No approved questions in this set."}</p>
            )}
          </div>

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
            <button type="button" onClick={handlePrint} disabled={!totalPages}>
              <FinderIcon name="print" size={20} /> Print
            </button>
            <button type="button" onClick={downloadPng} disabled={!totalPages}>
              PNG
            </button>
            <button
              type="button"
              className="download-pdf"
              onClick={() => void downloadPdf()}
              disabled={!totalPages || isGeneratingPdf}
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
                    <img src="/finder/assets/logo.png" alt="" style={{ height: "35pt" }} />
                    <h2 style={{ fontFamily: "PlayHand", fontSize: "22pt", margin: "8pt 0 0" }}>
                      Would You Rather?
                    </h2>
                  </div>
                  {qrCodeEnabled && (
                    <div style={{ textAlign: "right" }}>
                      <img src="/finder/assets/logo.png" alt="" style={{ height: "30pt" }} />
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
                      <div style={{ textAlign: "center", marginBottom: "12pt" }}>
                        <img src="/finder/assets/logo.png" alt="" style={{ height: "20pt" }} />
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

      {/* 保留原有测试兼容的 .print-output 容器 */}
      {previewUrl && (
        <div className="print-output" aria-hidden="true">
          <img src={previewUrl} alt="" />
          <img src={previewUrl} alt="" />
        </div>
      )}
    </div>
  );
}
