"use client";

import Image from "next/image";
import Link from "next/link";
import { Arrow } from "./home-art";
import { rankLeaderboard, type LeaderboardResult } from "../domain/leaderboard";

export function TrendingListSkeleton() {
  return (
    <div className="trending-skeleton-wrapper" data-trending-skeleton="true" aria-busy="true">
      {[1, 2, 3].map((num) => (
        <div key={num} className="trending-card trending-card-skeleton" aria-hidden="true">
          <span className="ranking-number">#{num}</span>
          <span className="trending-body">
            <span
              className="trending-title skeleton-line"
              style={{
                display: "block",
                width: "75%",
                height: "18px",
                background: "currentColor",
                opacity: 0.12,
                borderRadius: "4px",
              }}
            />
            <span
              className="trending-meta skeleton-line"
              style={{
                display: "block",
                width: "40%",
                height: "14px",
                background: "currentColor",
                opacity: 0.08,
                borderRadius: "4px",
                marginTop: "6px",
              }}
            />
          </span>
          <span className="round-arrow" style={{ opacity: 0.2 }}>
            <Arrow />
          </span>
        </div>
      ))}
    </div>
  );
}

export type HomepageTrendingItem = {
  readonly rank: number;
  readonly id: string;
  readonly question: string;
  readonly votes: number;
};

export type TrendingListContentProps =
  | {
      status: "ready" | "unavailable";
      items: readonly HomepageTrendingItem[];
      leaderboard?: never;
    }
  | {
      leaderboard: LeaderboardResult;
      status?: never;
      items?: never;
    };

export function TrendingListContent(props: TrendingListContentProps) {
  let status: "ready" | "unavailable" = "unavailable";
  let items: readonly HomepageTrendingItem[] = [];

  if ("items" in props && props.items) {
    status = props.status;
    items = props.items;
  } else if ("leaderboard" in props && props.leaderboard) {
    status = props.leaderboard.status;
    if (props.leaderboard.status === "ready") {
      items = rankLeaderboard(props.leaderboard.snapshot.entries, "all")
        .slice(0, 3)
        .map((entry) => ({
          rank: entry.rank,
          id: entry.question.id,
          question: entry.question.question,
          votes: entry.votes,
        }));
    }
  }

  const handleSelect = (id: string) => {
    window.dispatchEvent(new CustomEvent("wyr:play-question", { detail: { id } }));
  };

  if (status === "ready" && items.length > 0) {
    return (
      <div className="trending-content-ready" data-trending-ready="true">
        {items.map((entry) => (
          <button
            type="button"
            key={entry.id}
            className="trending-card"
            onClick={() => handleSelect(entry.id)}
          >
            <span className="ranking-number">#{entry.rank}</span>
            <span className="trending-body">
              <span className="trending-title">{entry.question}</span>
              <span className="trending-meta">{entry.votes.toLocaleString()} votes</span>
            </span>
            <span className="round-arrow">
              <Arrow />
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="ranking-awaiting" data-trending-unavailable="true">
      <Image
        src="/home-art/decorations/ranking-crown.webp"
        alt=""
        width={106}
        height={87}
        sizes="95px"
        className="ranking-crown art-crop"
      />
      <h3>Question Rankings</h3>
      <p>
        {status === "ready"
          ? "No votes yet. Make your choice to start the rankings."
          : "Rankings are temporarily unavailable. Try the leaderboard again."}
      </p>
      <Link className="section-link" href="/leaderboards" prefetch={false}>
        View leaderboard
        <Arrow />
      </Link>
    </div>
  );
}
