"use client";
/* eslint-disable @next/next/no-img-element -- Canvas previews and original local logo. */
import { useEffect, useState, startTransition, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Question } from "../../types";
import { resolveQuestionPool } from "../../domain/play-session";
import { createPrintLayout, type PrintFormat, type PaperSize } from "../../domain/print-layout";
import { renderPrintPages, pdfFromCanvases } from "./print-renderer";
import { PlayHeader, PlayArtwork } from "./art";
import { FinderIcon } from "../finder/icon";
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
  const poolKey = pool.map((q) => q.id).join(",");
  const [format, setFormat] = useState<PrintFormat>(
    search.get("format") === "sheet" ? "sheet" : "cards",
  );
  const [paper, setPaper] = useState<PaperSize>("letter");
  const [marks, setMarks] = useState(true);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [output, setOutput] = useState<{
    canvases: HTMLCanvasElement[];
    width: number;
    height: number;
    key: string;
  } | null>(null);
  const [error, setError] = useState("");
  const key = `${poolKey}:${format}:${paper}:${marks}`;
  const ready = output?.key === key ? output : null;
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await document.fonts.load("11px PlayBody");
        await document.fonts.load("26px PlayHand");
        const logo = new Image();
        logo.src = "/finder/assets/logo.png";
        await logo.decode();
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable in this browser");
        context.font = "11px PlayBody";
        const layout = createPrintLayout(
          pool,
          format,
          paper,
          (text) => context.measureText(text).width,
        );
        const canvases = renderPrintPages(layout, format, marks, logo);
        if (!cancelled)
          startTransition(() => {
            setOutput({ canvases, width: layout.width, height: layout.height, key });
            setPage(0);
            setError("");
          });
      } catch (e) {
        if (!cancelled)
          startTransition(() =>
            setError(e instanceof Error ? e.message : "Could not prepare print output"),
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pool, format, paper, marks, key]);
  function download() {
    if (!ready) return;
    const url = URL.createObjectURL(pdfFromCanvases(ready.canvases, ready.width, ready.height));
    const link = document.createElement("a");
    link.href = url;
    link.download = `wyrplay-${format}-${paper}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
            <img
              className="print-heading-crown"
              src={format === "cards" ? "/play-art/print-crown.png" : "/play-art/sheet-crown.png"}
              alt=""
            />
            Print <span>Your</span> Questions
          </h1>
          {format === "sheet" && (
            <img className="print-heading-printer" src="/play-art/printer.png" alt="" />
          )}
          <p className="print-lead">
            Turn your selected Would You Rather questions into print-ready cards or question sheets.
          </p>
          <div className="print-pool">
            <span>{pool.length} questions · Reviewed question bank</span>
            <Link href="/find-questions?restore=1">⇄ Change Questions</Link>
          </div>
          <section className="format-settings">
            <h2>1. Choose a print format</h2>
            <div className="format-options">
              {(
                [
                  [
                    "cards",
                    "Cut-out Cards",
                    "One question per card. Print, cut, shuffle, and play.",
                  ],
                  [
                    "sheet",
                    "Question Sheet",
                    "Multiple questions per page. Great for teachers, hosts, families, and group activities.",
                  ],
                ] as const
              ).map(([value, label, description]) => (
                <button
                  key={value}
                  aria-pressed={format === value}
                  onClick={() => setFormat(value)}
                >
                  <span className="format-radio">{format === value ? "●" : "○"}</span>
                  <div className={`format-illustration ${value}`}>
                    <img src="/finder/assets/logo.png" alt="" />
                    <strong>Would you rather</strong>
                    {value === "cards" ? (
                      <>
                        <span>Ⓐ ━━━━━━━━━</span>
                        <span>Ⓑ ━━━━━━━━━</span>
                      </>
                    ) : (
                      <>
                        <span>01 ━━━━━━━━</span>
                        <span>02 ━━━━━━━━</span>
                        <span>03 ━━━━━━━━</span>
                      </>
                    )}
                  </div>
                  <h3>{label}</h3>
                  <p>{description}</p>
                </button>
              ))}
            </div>
          </section>
          <section className="print-settings">
            <h2>2. Print settings ({format === "cards" ? "Cut-out Cards" : "Question Sheet"})</h2>
            <div className="settings-fields">
              <fieldset>
                <legend>Paper size</legend>
                <label>
                  <input
                    type="radio"
                    name="paper"
                    checked={paper === "letter"}
                    onChange={() => setPaper("letter")}
                  />{" "}
                  US Letter (8.5″ × 11″)
                </label>
                <label>
                  <input
                    type="radio"
                    name="paper"
                    checked={paper === "a4"}
                    onChange={() => setPaper("a4")}
                  />{" "}
                  A4 (210 × 297 mm)
                </label>
              </fieldset>
              <label className="marks-setting">
                <span>
                  <b>{format === "cards" ? "Show cut lines" : "Add A / B answer circles"}</b>
                  <small>
                    {format === "cards"
                      ? "Dashed lines make the cards easier to cut."
                      : "Let players mark their answer for each question."}
                  </small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={marks}
                  onChange={(e) => setMarks(e.target.checked)}
                />
              </label>
            </div>
          </section>
        </section>
        <section className="print-preview">
          <header>
            <div>
              <h2>Print Preview — {format === "cards" ? "Cut-out Cards" : "Question Sheet"}</h2>
              <p>
                {pool.length} questions · {ready?.canvases.length ?? "…"} pages
              </p>
            </div>
            <div className="preview-pages">
              <button
                aria-label="Previous preview page"
                disabled={!ready || page === 0}
                onClick={() => setPage((n) => n - 1)}
              >
                ‹
              </button>
              <span>
                Page {ready?.canvases.length ? page + 1 : 0} of {ready?.canvases.length ?? 0}
              </span>
              <button
                aria-label="Next preview page"
                disabled={!ready || page >= ready.canvases.length - 1}
                onClick={() => setPage((n) => n + 1)}
              >
                ›
              </button>
            </div>
          </header>
          {error ? (
            <p role="alert">{error}</p>
          ) : !pool.length ? (
            <p role="status">
              No approved questions in this set. Return to questions to choose a set.
            </p>
          ) : (
            <div className="preview-paper-viewport">
              {ready?.canvases[page] ? (
                <img
                  className="preview-paper"
                  src={ready.canvases[page]!.toDataURL()}
                  alt={`Printable ${format} page ${page + 1}`}
                  style={{ height: `calc(var(--paper-height) * ${zoom / 100})` }}
                />
              ) : (
                <p>Preparing print preview…</p>
              )}
            </div>
          )}
          <footer>
            <label>
              Zoom{" "}
              <input
                aria-label="Preview zoom"
                type="range"
                min="50"
                max="150"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
              {zoom}%
            </label>
            <button disabled={!ready?.canvases.length} onClick={() => window.print()}>
              <FinderIcon name="print" size={22} /> Print
            </button>
            <button className="download-pdf" disabled={!ready?.canvases.length} onClick={download}>
              <FinderIcon name="download" size={22} /> Download PDF
            </button>
          </footer>
        </section>
      </div>
      <div className="print-output" aria-hidden="true">
        {ready?.canvases.map((canvas, i) => (
          <img
            key={i}
            src={canvas.toDataURL()}
            alt=""
            style={{ width: `${ready.width / 72}in`, height: `${ready.height / 72}in` }}
          />
        ))}
      </div>
      <style>{`@page { size: ${paper === "a4" ? "A4" : "letter"}; margin:0; }`}</style>
    </div>
  );
}
