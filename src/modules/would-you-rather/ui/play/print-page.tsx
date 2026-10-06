"use client";
/* eslint-disable @next/next/no-img-element -- Canvas previews and original local logo. */

import { useEffect, useState, startTransition, useMemo, useRef } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { FeaturedCollectionKey, Occasion, Question } from "../../types";
import { resolveQuestionPool } from "../../domain/play-session";
import { type FinderAge } from "../../domain/finder";
import { filterPrintQuestions, type PrintQuestionCriteria } from "../../domain/print-question-pool";
import {
  createPrintLayout,
  type PrintFormat,
  type PaperSize,
  type PrintLayout,
} from "../../domain/print-layout";
import {
  renderSinglePrintPage,
  createVectorPdf,
  pngWithDpi,
  getCardPlayUrl,
  getSheetPagePlayUrl,
  getQrDataUrl,
  getQrImage,
  PRINT_QR_CONFIG,
} from "./print-renderer";
import { PlayArtwork } from "./art";
import { FinderIcon } from "../finder/icon";
import "./play.css";
import "./print.css";

const printThemes: readonly [FeaturedCollectionKey, string][] = [
  ["kids", "Kids"],
  ["funny", "Funny"],
  ["hard", "Hard"],
  ["friends", "Friends"],
  ["couples", "Couples"],
];

const printAudiences: readonly [FinderAge, string][] = [
  ["kids", "Kids"],
  ["7-9", "Ages 7–9"],
  ["10-12", "Ages 10–12"],
  ["teens", "Teens 13–17"],
  ["adults", "Adults 18+"],
];

const printScenarios: readonly [Occasion, string][] = [
  ["classroom", "Classroom"],
  ["party", "Party"],
  ["road-trip", "Road Trip"],
  ["date-night", "Date Night"],
  ["dinner", "Dinner"],
];

export function PrintPage({
  questions,
}: {
  readonly questions: readonly Question[];
  readonly authEnabled: boolean;
}) {
  const search = useSearchParams();
  const requestedSet = search.get("set");
  const requestedPool = useMemo(
    () => resolveQuestionPool(questions, requestedSet),
    [questions, requestedSet],
  );
  const [useRequestedSet, setUseRequestedSet] = useState(requestedSet !== null);
  const [questionCriteriaDraft, setQuestionCriteriaDraft] = useState<PrintQuestionCriteria>({});
  const [questionCriteria, setQuestionCriteria] = useState<PrintQuestionCriteria>({});
  const generatedPool = useMemo(
    () => filterPrintQuestions(questions, questionCriteria),
    [questions, questionCriteria],
  );
  const availablePool = useRequestedSet ? requestedPool : generatedPool;

  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const pool = useMemo(
    () => availablePool.slice(0, questionCount ?? availablePool.length),
    [availablePool, questionCount],
  );
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [printQrData, setPrintQrData] = useState<Map<string, string>>(new Map());
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

  useEffect(() => {
    setUseRequestedSet(requestedSet !== null);
    setQuestionCount(null);
    setPage(0);
  }, [requestedSet]);

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

  // 加载公共 Logo
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const img = new Image();
        img.src = "/play-art/logo.png";
        await img.decode();
        if (!cancelled) setLogo(img);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load print assets");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    if (!layout || !totalPages) {
      setPreviewUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return "";
      });
      setCurrentCanvas(null);
      setPrintQrData(new Map());
      setError("");
      return;
    }
    if (!logo) return;
    let cancelled = false;

    void (async () => {
      try {
        await document.fonts.load("11px PlayBody");
        await document.fonts.load("26px PlayHand");

        const currentPageIndex = Math.min(Math.max(0, page), totalPages - 1);
        const currentPlacements = layout.pages[currentPageIndex] ?? [];
        const qrImageMap = new Map<string, HTMLImageElement>();

        if (qrCodeEnabled && currentPlacements.length > 0) {
          const origin = window.location.origin;
          if (format === "sheet") {
            const pageUrl = getSheetPagePlayUrl(currentPlacements, origin);
            const img = await getQrImage(pageUrl);
            qrImageMap.set(pageUrl, img);
          } else {
            await Promise.all(
              currentPlacements.map(async (p) => {
                const cardUrl = getCardPlayUrl(p.question, origin);
                const img = await getQrImage(cardUrl);
                qrImageMap.set(cardUrl, img);
              }),
            );
          }
        }

        if (cancelled) return;

        const canvas = renderSinglePrintPage(
          layout,
          currentPageIndex,
          format,
          marks,
          logo,
          {
            showNumbers,
            qrCode: qrCodeEnabled,
            siteUrl: window.location.origin,
          },
          qrImageMap,
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
  }, [layout, page, totalPages, format, marks, showNumbers, qrCodeEnabled, logo]);

  // 当关闭二维码时清空可能缓存的打印二维码
  useEffect(() => {
    if (!qrCodeEnabled) {
      setPrintQrData(new Map());
    }
  }, [qrCodeEnabled]);

  // 组件卸载时释放 URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 下载高清矢量 PDF
  async function downloadPdf() {
    if (!layout || !totalPages || !currentCanvas || !logo) return;
    setError("");
    setIsGeneratingPdf(true);
    try {
      const pdfBlob = await createVectorPdf(layout, format, marks, {
        showNumbers,
        qrCode: qrCodeEnabled,
        siteUrl: window.location.origin,
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
  async function downloadPng() {
    if (!layout || !totalPages || !currentCanvas || !logo) return;
    try {
      const currentPageIndex = Math.min(Math.max(0, page), totalPages - 1);
      const currentPlacements = layout.pages[currentPageIndex] ?? [];
      const qrImageMap = new Map<string, HTMLImageElement>();
      if (qrCodeEnabled && currentPlacements.length > 0) {
        const origin = window.location.origin;
        if (format === "sheet") {
          const pageUrl = getSheetPagePlayUrl(currentPlacements, origin);
          const img = await getQrImage(pageUrl);
          qrImageMap.set(pageUrl, img);
        } else {
          await Promise.all(
            currentPlacements.map(async (p) => {
              const cardUrl = getCardPlayUrl(p.question, origin);
              const img = await getQrImage(cardUrl);
              qrImageMap.set(cardUrl, img);
            }),
          );
        }
      }
      const canvas = renderSinglePrintPage(
        layout,
        currentPageIndex,
        format,
        marks,
        logo,
        {
          showNumbers,
          qrCode: qrCodeEnabled,
          dpi: 300,
          transparent: true,
          siteUrl: window.location.origin,
        },
        qrImageMap,
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
    } catch (err) {
      setError(`PNG export failed. ${err instanceof Error ? err.message : "Please try again."}`);
    }
  }

  // 触发浏览器原生打印
  async function handlePrint() {
    if (!layout || !totalPages || !currentCanvas || !logo) return;
    try {
      if (qrCodeEnabled && layout) {
        const origin = window.location.origin;
        const missingUrls: string[] = [];
        if (format === "sheet") {
          for (const pagePlacements of layout.pages) {
            const u = getSheetPagePlayUrl(pagePlacements, origin);
            if (!printQrData.has(u)) missingUrls.push(u);
          }
        } else {
          for (const pagePlacements of layout.pages) {
            for (const p of pagePlacements) {
              const u = getCardPlayUrl(p.question, origin);
              if (!printQrData.has(u)) missingUrls.push(u);
            }
          }
        }
        if (missingUrls.length > 0) {
          const updated = new Map(printQrData);
          await Promise.all(
            missingUrls.map(async (url) => {
              const dataUrl = await getQrDataUrl(url);
              updated.set(url, dataUrl);
            }),
          );
          flushSync(() => {
            setPrintQrData(updated);
          });
        }
      }
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
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
              <strong>{pool.length}</strong>{" "}
              {useRequestedSet
                ? "questions from your selected set"
                : "questions in this generated set"}
            </span>
            {useRequestedSet ? (
              <button
                type="button"
                onClick={() => {
                  setUseRequestedSet(false);
                  setQuestionCount(null);
                  setPage(0);
                }}
              >
                Choose a different set
              </button>
            ) : (
              <Link href="/find-questions?restore=1">Advanced finder</Link>
            )}
          </div>

          <div className="question-source-settings">
            <h2>Choose Questions</h2>
            <p className="question-source-lead">
              Build a printable set here, or use Find Questions when you want keyword search and
              hand-picked questions.
            </p>
            {useRequestedSet ? (
              <div className="requested-set-note">
                <strong>Using your exact Finder selection.</strong>
                <span>
                  Your selected question IDs stay unchanged until you choose a different set.
                </span>
              </div>
            ) : (
              <>
                <div className="print-filter-grid">
                  <label>
                    Theme
                    <select
                      value={questionCriteriaDraft.collection ?? ""}
                      onChange={(event) => {
                        const value = event.target.value as FeaturedCollectionKey | "";
                        setQuestionCriteriaDraft((current) =>
                          value
                            ? { ...current, collection: value }
                            : {
                                ...(current.age ? { age: current.age } : {}),
                                ...(current.occasion ? { occasion: current.occasion } : {}),
                              },
                        );
                      }}
                    >
                      <option value="">All themes</option>
                      {printThemes.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Audience / Age
                    <select
                      value={questionCriteriaDraft.age ?? ""}
                      onChange={(event) => {
                        const value = event.target.value as FinderAge | "";
                        setQuestionCriteriaDraft((current) =>
                          value
                            ? { ...current, age: value }
                            : {
                                ...(current.collection ? { collection: current.collection } : {}),
                                ...(current.occasion ? { occasion: current.occasion } : {}),
                              },
                        );
                      }}
                    >
                      <option value="">All audiences</option>
                      {printAudiences.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Scenario
                    <select
                      value={questionCriteriaDraft.occasion ?? ""}
                      onChange={(event) => {
                        const value = event.target.value as Occasion | "";
                        setQuestionCriteriaDraft((current) =>
                          value
                            ? { ...current, occasion: value }
                            : {
                                ...(current.collection ? { collection: current.collection } : {}),
                                ...(current.age ? { age: current.age } : {}),
                              },
                        );
                      }}
                    >
                      <option value="">All scenarios</option>
                      {printScenarios.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="print-filter-actions">
                  <button
                    type="button"
                    className="generate-set"
                    onClick={() => {
                      setQuestionCriteria(questionCriteriaDraft);
                      setQuestionCount(null);
                      setPage(0);
                    }}
                  >
                    Generate question set
                  </button>
                  <button
                    type="button"
                    className="reset-set"
                    onClick={() => {
                      setQuestionCriteriaDraft({});
                      setQuestionCriteria({});
                      setQuestionCount(null);
                      setPage(0);
                    }}
                  >
                    Reset
                  </button>
                </div>
                <p className="print-match-count" role="status">
                  {generatedPool.length} approved questions match the current generated set.
                </p>
              </>
            )}
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
              disabled={!totalPages || !currentCanvas || !logo}
            >
              <FinderIcon name="print" size={20} /> Print
            </button>
            <button
              type="button"
              onClick={() => void downloadPng()}
              disabled={!totalPages || !currentCanvas || !logo}
            >
              PNG
            </button>
            <button
              type="button"
              className="download-pdf"
              onClick={() => void downloadPdf()}
              disabled={!totalPages || !currentCanvas || !logo || isGeneratingPdf}
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
                  {qrCodeEnabled &&
                    (() => {
                      const pagePlayUrl =
                        typeof window !== "undefined"
                          ? getSheetPagePlayUrl(placements, window.location.origin)
                          : getSheetPagePlayUrl(placements);
                      const qrSrc = printQrData.get(pagePlayUrl);
                      return (
                        <div style={{ textAlign: "right" }}>
                          {qrSrc ? (
                            <img
                              src={qrSrc}
                              data-play-url={pagePlayUrl}
                              alt="Play this set QR code"
                              style={{
                                width: `${PRINT_QR_CONFIG.sheet.sizePt}pt`,
                                height: `${PRINT_QR_CONFIG.sheet.sizePt}pt`,
                                display: "block",
                                marginLeft: "auto",
                              }}
                            />
                          ) : null}
                          <span
                            style={{
                              fontSize: "8pt",
                              color: "#666",
                              display: "block",
                              textAlign: "center",
                              width: `${PRINT_QR_CONFIG.sheet.sizePt}pt`,
                              marginLeft: "auto",
                              marginTop: "2pt",
                            }}
                          >
                            Play Online
                          </span>
                        </div>
                      );
                    })()}
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
                      {qrCodeEnabled &&
                        (() => {
                          const cardPlayUrl =
                            typeof window !== "undefined"
                              ? getCardPlayUrl(p.question, window.location.origin)
                              : getCardPlayUrl(p.question);
                          const qrSrc = printQrData.get(cardPlayUrl);
                          return qrSrc ? (
                            <img
                              src={qrSrc}
                              data-play-url={cardPlayUrl}
                              alt="Play this set QR code"
                              style={{
                                position: "absolute",
                                right: "10pt",
                                top: "8pt",
                                width: `${PRINT_QR_CONFIG.cards.sizePt}pt`,
                                height: `${PRINT_QR_CONFIG.cards.sizePt}pt`,
                              }}
                            />
                          ) : null;
                        })()}
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
