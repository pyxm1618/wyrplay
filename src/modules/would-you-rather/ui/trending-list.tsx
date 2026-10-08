"use client";

import Link from "next/link";
import { Arrow, HomeArt } from "./home-art";
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

export function TrendingListContent({ leaderboard }: { leaderboard: LeaderboardResult }) {
  const rankings =
    leaderboard.status === "ready"
      ? rankLeaderboard(leaderboard.snapshot.entries, "all").slice(0, 3)
      : [];

  const handleSelect = (id: string) => {
    window.dispatchEvent(new CustomEvent("wyr:play-question", { detail: { id } }));
  };

  if (leaderboard.status === "ready" && rankings.length > 0) {
    return (
      <div className="trending-content-ready" data-trending-ready="true">
        {rankings.map((entry) => (
          <button
            type="button"
            key={entry.question.id}
            className="trending-card"
            onClick={() => handleSelect(entry.question.id)}
          >
            <span className="ranking-number">#{entry.rank}</span>
            <span className="trending-body">
              <span className="trending-title">{entry.question.question}</span>
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
      <HomeArt
        src="decorations/ranking-crown"
        width={106}
        height={87}
        sizes="95px"
        className="ranking-crown"
      />
      <h3>Question Rankings</h3>
      <p>
        {leaderboard.status === "ready"
          ? "No votes yet. Make your choice to start the rankings."
          : "Rankings are temporarily unavailable. Try the leaderboard again."}
      </p>
      <Link className="section-link" href="/leaderboards">
        View leaderboard
        <Arrow />
      </Link>
    </div>
  );
}
