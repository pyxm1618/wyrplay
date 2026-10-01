import type { PrintLayout, PrintFormat } from "../../domain/print-layout";
import { wrapPrintText } from "../../domain/print-layout";
export function renderPrintPages(
  layout: PrintLayout,
  format: PrintFormat,
  marks: boolean,
  logo: HTMLImageElement,
): HTMLCanvasElement[] {
  return layout.pages.map((placements) => {
    const canvas = document.createElement("canvas");
    const scale = 2;
    canvas.width = Math.ceil(layout.width * scale);
    canvas.height = Math.ceil(layout.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser does not support printable canvas output");
    ctx.scale(scale, scale);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, layout.width, layout.height);
    ctx.fillStyle = "#090e20";
    ctx.font = "11px PlayBody, Arial";
    const text = (value: string, x: number, y: number, width: number, size = 11) => {
      ctx.font = `${size}px PlayBody, Arial`;
      const lines = wrapPrintText(value, width, (t) => ctx.measureText(t).width);
      lines.forEach((line, i) => ctx.fillText(line, x, y + i * 14));
    };
    if (format === "sheet") {
      ctx.drawImage(logo, 30, 22, 120, 40);
      ctx.font = "26px PlayHand";
      ctx.fillText("Would You Rather?", 30, 86);
    }
    placements.forEach((p) => {
      if (format === "cards") {
        if (marks) {
          ctx.strokeStyle = "#a7a1a0";
          ctx.setLineDash([4, 3]);
          ctx.strokeRect(p.x, p.y, p.width, p.height);
          ctx.setLineDash([]);
          ctx.font = "11px Arial";
          ctx.fillStyle = "#68544b";
          ctx.fillText("✂", p.x - 4, p.y);
        }
        ctx.drawImage(logo, p.x + p.width / 2 - 40, p.y + 10, 80, 26);
        ctx.fillStyle = "#090e20";
        ctx.font = "19px PlayHand";
        ctx.textAlign = "center";
        ctx.fillText("Would you rather", p.x + p.width / 2, p.y + 57);
        ctx.textAlign = "left";
        const a = wrapPrintText(p.question.optionA, p.width - 55, (t) => {
          ctx.font = "11px PlayBody";
          return ctx.measureText(t).width;
        });
        const ay = p.y + 80;
        const by = ay + a.length * 14 + 24;
        [
          ["A", ay, "#ff3457", p.question.optionA],
          ["B", by, "#008cff", p.question.optionB],
        ].forEach(([label, y, color, option]) => {
          const yy = Number(y);
          ctx.fillStyle = String(color);
          ctx.beginPath();
          ctx.arc(p.x + 20, yy - 4, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.font = "bold 11px Arial";
          ctx.fillText(String(label), p.x + 16, yy);
          ctx.fillStyle = "#090e20";
          text(String(option), p.x + 40, yy, p.width - 55);
        });
      } else {
        ctx.fillStyle = "#090e20";
        ctx.font = "bold 11px PlayBody";
        ctx.fillText(String(p.number).padStart(2, "0"), p.x, p.y + 15);
        text(p.question.question, p.x + 40, p.y + 15, p.width - 110);
        if (marks) {
          ["A", "B"].forEach((option, i) => {
            ctx.strokeStyle = "#a9b8cf";
            ctx.beginPath();
            ctx.arc(layout.width - 95 + i * 45, p.y + 12, 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#090e20";
            ctx.font = "11px PlayBody";
            ctx.fillText(option, layout.width - 83 + i * 45, p.y + 16);
          });
        }
        ctx.strokeStyle = "#e7e9ed";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + p.height);
        ctx.lineTo(p.x + p.width, p.y + p.height);
        ctx.stroke();
      }
    });
    return canvas;
  });
}
export function pdfFromCanvases(
  canvases: readonly HTMLCanvasElement[],
  width: number,
  height: number,
): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let position = 0;
  const offsets: number[] = [0];
  const append = (value: string | Uint8Array) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    position += bytes.length;
  };
  append("%PDF-1.4\n");
  const object = (id: number, body: string) => {
    offsets[id] = position;
    append(`${id} 0 obj\n${body}\nendobj\n`);
  };
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(
    2,
    `<< /Type /Pages /Count ${canvases.length} /Kids [${canvases.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] >>`,
  );
  canvases.forEach((canvas, i) => {
    const id = 3 + i * 3;
    const jpeg = Uint8Array.from(atob(canvas.toDataURL("image/jpeg", 0.98).split(",")[1]!), (c) =>
      c.charCodeAt(0),
    );
    object(
      id,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im ${id + 1} 0 R >> >> /Contents ${id + 2} 0 R >>`,
    );
    offsets[id + 1] = position;
    append(
      `${id + 1} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    );
    append(jpeg);
    append("\nendstream\nendobj\n");
    const content = `q ${width} 0 0 ${height} 0 0 cm /Im Do Q`;
    object(
      id + 2,
      `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
    );
  });
  const start = position;
  append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  offsets.slice(1).forEach((offset) => append(`${String(offset).padStart(10, "0")} 00000 n \n`));
  append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
