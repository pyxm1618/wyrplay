import { type NextRequest, NextResponse } from "next/server";
import { getQuestionVoteStatsBatch, isVotableQuestion } from "@/modules/would-you-rather/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const questionIds = new URL(request.url).searchParams.getAll("questionId");
  if (
    questionIds.length < 1 ||
    questionIds.length > 10 ||
    new Set(questionIds).size !== questionIds.length ||
    questionIds.some((id) => !isVotableQuestion(id))
  ) {
    return NextResponse.json(
      { error: "Provide 1–10 distinct approved question IDs" },
      { status: 400 },
    );
  }
  try {
    const response = NextResponse.json(await getQuestionVoteStatsBatch(questionIds));
    response.headers.set("Cache-Control", "private, no-store, no-cache, max-age=0");
    return response;
  } catch (error) {
    console.error("Batch vote statistics failed", error);
    return NextResponse.json({ error: "Failed to load vote stats" }, { status: 500 });
  }
}
