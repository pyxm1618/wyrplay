"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { filterQuestions } from "../domain/filter-questions";
import { QUESTIONS_DATABASE } from "../data/questions";
import type {
  AgeGroup,
  Difficulty,
  FeaturedCollectionKey,
  Occasion,
  Question,
  Relationship,
  Tone,
} from "../types";
import { DuelArena } from "./duel-arena";
import { PresenterModal } from "./presenter-modal";
import { QuestionDirectory } from "./question-directory";
import { QuestionFilterBar } from "./question-filter-bar";
import type { LeaderboardResult } from "../domain/leaderboard";
import { useHydrated } from "./use-hydrated";
import { IllustratedHome } from "./illustrated-home";
import { CategoryExplorer } from "./category-explorer";

export interface WyrExperienceProps {
  readonly leaderboard?: LeaderboardResult;
  readonly appearance?: "default" | "illustrated-home";
  readonly questions?: readonly Question[];
  readonly categoryBadge?: string;
  readonly defaultCollection?: FeaturedCollectionKey;
  readonly showCategoryExplorer?: boolean;
  readonly allowUnreviewed?: boolean;
}

export function WyrExperience({
  appearance = "default",
  leaderboard = { status: "unavailable" },
  questions = QUESTIONS_DATABASE,
  categoryBadge = "Live Dilemma Arena",
  defaultCollection,
  showCategoryExplorer = false,
  allowUnreviewed = false,
}: WyrExperienceProps) {
  const hydrated = useHydrated();
  // 1. 搜索与筛选状态
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | undefined>(undefined);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | undefined>(
    undefined,
  );
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | undefined>(undefined);
  const [selectedTone, setSelectedTone] = useState<Tone | undefined>(undefined);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>(undefined);

  // 2. Presenter Modal 状态
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);
  const presenterTriggerRef = useRef<HTMLButtonElement>(null);

  // 3. 计算当前有效题集
  // 3.1 可玩题集 (严格限定 reviewStatus === 'approved'，用于 Arena、Random、Presenter)
  const playableQuestions = useMemo(() => {
    return filterQuestions(questions, {
      ...(searchKeyword.trim() !== "" ? { searchKeyword } : {}),
      ...(selectedAgeGroup ? { ageGroup: selectedAgeGroup } : {}),
      ...(selectedRelationship ? { relationship: selectedRelationship } : {}),
      ...(selectedOccasion ? { occasion: selectedOccasion } : {}),
      ...(selectedTone ? { tone: selectedTone } : {}),
      ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
      ...(defaultCollection ? { collection: defaultCollection } : {}),
      onlyApproved: true,
    });
  }, [
    questions,
    searchKeyword,
    selectedAgeGroup,
    selectedRelationship,
    selectedOccasion,
    selectedTone,
    selectedDifficulty,
    defaultCollection,
  ]);

  // 3.2 目录浏览题集 (仅当 allowUnreviewed 显式为 true 时展示未审核题，生产默认严格仅包含 approved 题目)
  const directoryQuestions = useMemo(() => {
    return filterQuestions(questions, {
      ...(searchKeyword.trim() !== "" ? { searchKeyword } : {}),
      ...(selectedAgeGroup ? { ageGroup: selectedAgeGroup } : {}),
      ...(selectedRelationship ? { relationship: selectedRelationship } : {}),
      ...(selectedOccasion ? { occasion: selectedOccasion } : {}),
      ...(selectedTone ? { tone: selectedTone } : {}),
      ...(selectedDifficulty ? { difficulty: selectedDifficulty } : {}),
      ...(defaultCollection ? { collection: defaultCollection } : {}),
      onlyApproved: !allowUnreviewed,
    });
  }, [
    questions,
    searchKeyword,
    selectedAgeGroup,
    selectedRelationship,
    selectedOccasion,
    selectedTone,
    selectedDifficulty,
    defaultCollection,
    allowUnreviewed,
  ]);

  // 4. 当前游玩的题目 ID (仅从 playableQuestions 中选择)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const resolvedActiveQuestion = useMemo(() => {
    if (playableQuestions.length === 0) return undefined;
    const found = playableQuestions.find((q) => q.id === activeQuestionId);
    return found ?? playableQuestions[0];
  }, [playableQuestions, activeQuestionId]);

  const currentIndex = useMemo(() => {
    if (!resolvedActiveQuestion) return -1;
    return playableQuestions.findIndex((q) => q.id === resolvedActiveQuestion.id);
  }, [playableQuestions, resolvedActiveQuestion]);

  // 5. 游玩交互动作
  const handleSelectQuestion = useCallback(
    (id: string) => {
      const isPlayable = playableQuestions.some((q) => q.id === id);
      if (isPlayable) {
        setActiveQuestionId(id);
      }
    },
    [playableQuestions],
  );

  const handleNext = useCallback(() => {
    if (playableQuestions.length === 0) return;
    const nextIdx = (currentIndex + 1) % playableQuestions.length;
    const nextQ = playableQuestions[nextIdx];
    if (nextQ) {
      setActiveQuestionId(nextQ.id);
    }
  }, [currentIndex, playableQuestions]);

  const handlePrev = useCallback(() => {
    if (playableQuestions.length === 0) return;
    const prevIdx = (currentIndex - 1 + playableQuestions.length) % playableQuestions.length;
    const prevQ = playableQuestions[prevIdx];
    if (prevQ) {
      setActiveQuestionId(prevQ.id);
    }
  }, [currentIndex, playableQuestions]);

  const handleRandom = useCallback(() => {
    if (playableQuestions.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * playableQuestions.length);
    while (nextIdx === currentIndex) {
      nextIdx = Math.floor(Math.random() * playableQuestions.length);
    }
    const randQ = playableQuestions[nextIdx];
    if (randQ) {
      setActiveQuestionId(randQ.id);
    }
  }, [currentIndex, playableQuestions]);

  const handleClearFilters = useCallback(() => {
    setSearchKeyword("");
    setSelectedAgeGroup(undefined);
    setSelectedRelationship(undefined);
    setSelectedOccasion(undefined);
    setSelectedTone(undefined);
    setSelectedDifficulty(undefined);
  }, []);

  const hasActiveFilters = Boolean(
    searchKeyword.trim() !== "" ||
    selectedAgeGroup ||
    selectedRelationship ||
    selectedOccasion ||
    selectedTone ||
    selectedDifficulty,
  );

  const directory = (
    <QuestionDirectory
      questions={directoryQuestions}
      title={
        directoryQuestions.length > 0
          ? defaultCollection
            ? `Browse ${directoryQuestions.length} Questions in this Collection`
            : `Browse ${directoryQuestions.length} Curated Dilemmas`
          : "Browse Dilemmas Directory"
      }
      description={
        directoryQuestions.length > 0
          ? "Browse verified dilemmas below. Select any question to play it directly in the arena."
          : "All dilemmas are currently undergoing editorial review. Check back soon for the verified collection."
      }
      hasActiveFilters={Boolean(
        searchKeyword.trim() !== "" ||
        selectedAgeGroup ||
        selectedRelationship ||
        selectedOccasion ||
        selectedTone ||
        selectedDifficulty,
      )}
      onPlayQuestion={handleSelectQuestion}
    />
  );

  const arena = (
    <fieldset disabled={!hydrated} className="home-arena-controls">
      <DuelArena
        appearance={appearance === "illustrated-home" ? "illustrated-home" : "default"}
        presenterButtonRef={presenterTriggerRef}
        question={resolvedActiveQuestion}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalQuestions={playableQuestions.length}
        categoryBadge={categoryBadge}
        hasActiveFilters={hasActiveFilters}
        onNext={handleNext}
        onRandom={handleRandom}
        {...(playableQuestions.length > 0
          ? { onOpenPresenter: () => setIsPresenterOpen(true) }
          : {})}
      />
    </fieldset>
  );

  const experience = (
    <fieldset
      className="w-full min-w-0 space-y-12"
      disabled={!hydrated}
      data-home-ready={appearance === "default" ? hydrated : undefined}
    >
      {/* 1. 核心 Live 对决 Arena */}
      {appearance !== "illustrated-home" && arena}

      {/* 2. 搜索与筛选控制栏 (放置于长目录前面) */}
      <div id="question-search">
        <QuestionFilterBar
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          selectedAgeGroup={selectedAgeGroup}
          onAgeGroupChange={setSelectedAgeGroup}
          selectedRelationship={selectedRelationship}
          onRelationshipChange={setSelectedRelationship}
          selectedOccasion={selectedOccasion}
          onOccasionChange={setSelectedOccasion}
          selectedTone={selectedTone}
          onToneChange={setSelectedTone}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          matchedCount={directoryQuestions.length}
          totalCount={
            allowUnreviewed
              ? questions.length
              : questions.filter((q) => q.reviewStatus === "approved").length
          }
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* 3. 分类概览 (可选) */}
      {showCategoryExplorer && appearance !== "illustrated-home" && <CategoryExplorer />}

      {/* 4. 目录展示 (仅展示 approved 题目；未审核题严格杜绝暴露在生产界面) */}
      {appearance === "illustrated-home" ? (
        <details className="home-directory" open={hasActiveFilters ? true : undefined}>
          <summary>Browse all {directoryQuestions.length} Would You Rather Questions</summary>
          {directory}
        </details>
      ) : (
        directory
      )}

      {/* 5. 共享有效题集的全屏 Presenter 模式 (仅限 approved 题) */}
      <PresenterModal
        returnFocusRef={presenterTriggerRef}
        isOpen={isPresenterOpen && playableQuestions.length > 0}
        question={resolvedActiveQuestion}
        onNext={handleNext}
        onPrev={handlePrev}
        onClose={() => setIsPresenterOpen(false)}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalCount={playableQuestions.length}
      />
    </fieldset>
  );
  return appearance === "illustrated-home" ? (
    <div data-home-ready={hydrated}>
      <IllustratedHome
        arena={arena}
        leaderboard={leaderboard}
        onPlayQuestion={(id) => {
          if (
            questions.some((question) => question.id === id && question.reviewStatus === "approved")
          ) {
            handleClearFilters();
            setActiveQuestionId(id);
          }
        }}
      >
        {experience}
      </IllustratedHome>
    </div>
  ) : (
    experience
  );
}
