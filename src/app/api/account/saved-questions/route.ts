import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS_DATABASE } from "@/modules/would-you-rather";
import { changeSavedQuestions, listSavedQuestions } from "@/modules/would-you-rather/server";
import { getAccountContext } from "@/platform/auth/account-context";
import { env } from "@/platform/config/env";
import { db } from "@/platform/database/application-database";
import { savedQuestionCommand } from "@/modules/would-you-rather";

const privateHeaders = { "Cache-Control": "private, no-store" };
export async function GET(request: NextRequest) {
  const account = await getAccountContext(request.headers);
  if (!account)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401, headers: privateHeaders },
    );
  return NextResponse.json(
    { ids: await listSavedQuestions(db, account.user.id) },
    { headers: privateHeaders },
  );
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== env.appOrigin)
    return NextResponse.json({ error: "invalid_origin" }, { status: 403, headers: privateHeaders });
  const account = await getAccountContext(request.headers);
  if (!account)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401, headers: privateHeaders },
    );
  if (Number(request.headers.get("content-length")) > 300000)
    return NextResponse.json(
      { error: "request_too_large" },
      { status: 413, headers: privateHeaders },
    );
  const text = await request.text();
  if (text.length > 300000)
    return NextResponse.json(
      { error: "request_too_large" },
      { status: 413, headers: privateHeaders },
    );
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: privateHeaders });
  }
  const command = savedQuestionCommand.safeParse(body);
  if (!command.success)
    return NextResponse.json(
      { error: "invalid_saved_question_command" },
      { status: 400, headers: privateHeaders },
    );
  const validated = command.data;
  if (
    validated.action === "save" &&
    !QUESTIONS_DATABASE.some((q) => q.id === validated.id && q.reviewStatus === "approved")
  )
    return NextResponse.json(
      { error: "question_unavailable" },
      { status: 400, headers: privateHeaders },
    );
  const ids = await changeSavedQuestions(
    db,
    { userId: account.user.id, subjectId: account.subject.id },
    command.data,
  );
  return NextResponse.json({ ids }, { headers: privateHeaders });
}
