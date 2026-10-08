import type { Question } from "../types";

export function resolveQuestionPool(
  questions: readonly Question[],
  set: string | null,
): readonly Question[] {
  const approved = questions.filter((q) => q.reviewStatus === "approved");
  if (set === null) return approved;
  const ids = [
    ...new Set(
      set
        .split(",")
        .filter(Boolean)
        .map((id) => (/^\d{1,6}$/.test(id) ? `wyr-${id.padStart(6, "0")}` : id)),
    ),
  ];
  return ids
    .map((id) => approved.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);
}

export function questionPoolUrl(
  path: "/play" | "/print",
  questions: readonly Question[],
  present = false,
): string {
  const search = new URLSearchParams({ set: questions.map((q) => q.id).join(",") });
  // Large sets use the numeric suffix of permanent wyr IDs to fit a QR code.
  // The resolver restores each exact ID; selected order and membership stay intact.
  if (search.toString().length > 2000) {
    search.set(
      "set",
      questions
        .map((question) => {
          const match = /^wyr-(\d{6})$/.exec(question.id);
          return match ? String(Number(match[1])) : question.id;
        })
        .join(","),
    );
  }
  if (present) search.set("present", "1");
  return `${path}?${search.toString().replaceAll("%2C", ",")}`;
}
